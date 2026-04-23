import { Hono } from "npm:hono@4";
import { cors } from "npm:hono@4/cors";
import { logger } from "npm:hono@4/logger";
import type { Context, MiddlewareHandler } from "npm:hono@4";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import { ProductRecommendationEngine, FraudDetectionEngine } from "./ml_engine.tsx";

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, string>;
}

type Variables = { user: AuthUser };
type AppEnv = { Variables: Variables };

const app = new Hono<AppEnv>();

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Client-Info", "X-Auth-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const getAdminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

const extractToken = (c: Context<AppEnv>): string | null => {
  // X-Auth-Token is a custom header the Supabase proxy cannot strip —
  // check it FIRST so JWT always gets through even when Authorization is stripped
  const xAuthToken = c.req.header("X-Auth-Token") ?? c.req.header("x-auth-token");
  if (xAuthToken) return xAuthToken.trim();

  const auth =
    c.req.header("Authorization") ??
    c.req.header("authorization");

  if (auth) return auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();

  return new URL(c.req.url).searchParams.get("token");
};

const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = extractToken(c);
  if (!token) return c.json({ error: "Authorization header required" }, 401);
  try {
    const { data, error } = await getAdminClient().auth.getUser(token);
    if (error || !data.user) return c.json({ error: "Invalid or expired token" }, 401);
    c.set("user", data.user as AuthUser);
    await next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: "Authentication failed: " + msg }, 401);
  }
};

// ─── Helper: deduct from wallet ───────────────────────────────────────────────
// Returns the updated wallet or throws if balance is insufficient.

async function deductWalletBalance(
  userId: string,
  amount: number,
): Promise<Record<string, unknown>> {
  const walletKey = `wallet:${userId}`;
  const existing = await kv.get(walletKey);
  const wallet = existing ?? { userId, balance: 0, pending: 0, currency: "GHS" };
  const currentBalance = Number(wallet.balance) || 0;

  if (currentBalance < amount) {
    throw new Error(`Insufficient wallet balance. Available: GHS ${currentBalance.toFixed(2)}`);
  }

  const updatedWallet = { ...wallet, balance: currentBalance - amount };
  await kv.set(walletKey, updatedWallet);
  return updatedWallet;
}

// ============ HEALTH ============

app.get("/make-server-45351b4f/health", (c) => c.json({ status: "ok" }));

// ============ AUTH ROUTES ============

app.post("/make-server-45351b4f/auth/signup", async (c) => {
  try {
    const { email, password, name, role = "cashier" } = await c.req.json();
    const { data, error } = await getAdminClient().auth.admin.createUser({
      email, password,
      user_metadata: { name, role },
      email_confirm: true,
    });
    if (error) return c.json({ error: error.message }, 400);
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id, email, name, role,
      createdAt: new Date().toISOString(),
    });
    return c.json({ user: data.user, message: "User created successfully" });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/auth/profile", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      const newProfile = {
        id: user.id, email: user.email,
        name: user.user_metadata?.name || "User",
        role: user.user_metadata?.role || "cashier",
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user:${user.id}`, newProfile);
      return c.json({ profile: newProfile });
    }
    return c.json({ profile });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ PRODUCT ROUTES ============

app.get("/make-server-45351b4f/products", authMiddleware, async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/products", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const profile = await kv.get(`user:${user.id}`);
    if (!["admin", "manager"].includes(profile?.role as string)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }
    const productData = await c.req.json();
    const productId = `product:${Date.now()}`;
    const product = { id: productId, ...productData, createdAt: new Date().toISOString(), createdBy: user.id };
    await kv.set(productId, product);
    return c.json({ product });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.put("/make-server-45351b4f/products/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const profile = await kv.get(`user:${user.id}`);
    if (!["admin", "manager"].includes(profile?.role as string)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }
    const productId = c.req.param("id") ?? "";
    const updates = await c.req.json();
    const product = await kv.get(productId);
    if (!product) return c.json({ error: "Product not found" }, 404);
    const updatedProduct = { ...product, ...updates, updatedAt: new Date().toISOString(), updatedBy: user.id };
    await kv.set(productId, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.delete("/make-server-45351b4f/products/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== "admin") return c.json({ error: "Only admins can delete products" }, 403);
    const productId = c.req.param("id") ?? "";
    await kv.del(productId);
    return c.json({ message: "Product deleted successfully" });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ CUSTOMER ROUTES ============

app.get("/make-server-45351b4f/customers", authMiddleware, async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ customers });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/customers", authMiddleware, async (c) => {
  try {
    const customerData = await c.req.json();
    const customerId = `customer:${Date.now()}`;
    const customer = {
      id: customerId, ...customerData,
      loyaltyPoints: 0, totalSpent: 0, transactionCount: 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(customerId, customer);
    return c.json({ customer });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.put("/make-server-45351b4f/customers/:id", authMiddleware, async (c) => {
  try {
    const customerId = c.req.param("id") ?? "";
    const updates = await c.req.json();
    const customer = await kv.get(customerId);
    if (!customer) return c.json({ error: "Customer not found" }, 404);
    const updatedCustomer = { ...customer, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(customerId, updatedCustomer);
    return c.json({ customer: updatedCustomer });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ TRANSACTION ROUTES ============

app.post("/make-server-45351b4f/transactions", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const transactionData = await c.req.json();
    const userTransactions = await kv.getByPrefix(`transaction:${user.id}:`);

    const fraudCheck = FraudDetectionEngine.isSuspicious(
      {
        userId: user.id,
        amount: transactionData.amount as number,
        method: transactionData.method as string,
        timestamp: Date.now(),
        recipient: transactionData.recipient as string,
      },
      userTransactions.map((t) => ({
        userId: String(t.userId ?? ""),
        amount: Number(t.amount ?? 0),
        method: String(t.method ?? ""),
        timestamp: new Date(String(t.timestamp ?? 0)).getTime(),
        recipient: String(t.recipient ?? ""),
      })),
    );

    // ── Wallet deduction for wallet-funded outgoing transactions ──────────────
    // Deduct BEFORE recording so a failed deduction prevents a phantom transaction.
    const isWalletDebit =
      transactionData.method === "wallet" &&
      (transactionData.type === "send" ||
        transactionData.type === "pos" ||
        transactionData.type === "transfer");

    let walletAfterDeduction: Record<string, unknown> | null = null;

    if (isWalletDebit) {
      try {
        walletAfterDeduction = await deductWalletBalance(
          user.id,
          transactionData.amount as number,
        );
      } catch (deductErr: unknown) {
        const msg = deductErr instanceof Error ? deductErr.message : "Insufficient balance";
        return c.json({ error: msg }, 400);
      }
    }

    const transactionId = `transaction:${user.id}:${Date.now()}`;
    const transaction = {
      id: transactionId,
      ...transactionData,
      userId: user.id,
      timestamp: new Date().toISOString(),
      fraudCheck: {
        riskScore: fraudCheck.riskScore,
        suspicious: fraudCheck.suspicious,
        reasons: fraudCheck.reasons,
      },
      status: fraudCheck.suspicious ? "pending_review" : transactionData.status,
    };

    await kv.set(transactionId, transaction);

    // Update customer loyalty if applicable
    if (transactionData.customerId) {
      const customer = await kv.get(transactionData.customerId as string);
      if (customer) {
        await kv.set(transactionData.customerId as string, {
          ...customer,
          totalSpent: (Number(customer.totalSpent) || 0) + (transactionData.amount as number),
          transactionCount: (Number(customer.transactionCount) || 0) + 1,
          loyaltyPoints: (Number(customer.loyaltyPoints) || 0) + Math.floor((transactionData.amount as number) / 10),
          lastTransaction: new Date().toISOString(),
        });
      }
    }

    return c.json({
      transaction,
      wallet: walletAfterDeduction,   // ← updated balance returned so client can sync
      fraudAlert: fraudCheck.suspicious
        ? { message: "Transaction flagged for review", riskScore: fraudCheck.riskScore, reasons: fraudCheck.reasons }
        : null,
    });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/transactions", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const transactions = await kv.getByPrefix(`transaction:${user.id}:`);
    return c.json({ transactions });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ WALLET ROUTES ============

app.get("/make-server-45351b4f/wallet/balance", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const walletKey = `wallet:${user.id}`;
    const existing = await kv.get(walletKey);
    const wallet = existing ?? { userId: user.id, balance: 0, pending: 0, currency: "GHS" };
    if (!existing) await kv.set(walletKey, wallet);
    return c.json({ wallet });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/wallet/fund", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const { reference, method } = await c.req.json();
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) return c.json({ error: "Payment gateway not configured" }, 500);

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const verifyResult = await verifyResponse.json();
    if (!verifyResult.status || verifyResult.data.status !== "success") {
      return c.json({ error: "Payment verification failed" }, 400);
    }

    const amount = verifyResult.data.amount / 100;
    const walletKey = `wallet:${user.id}`;
    const existing = await kv.get(walletKey);
    const wallet = existing ?? { userId: user.id, balance: 0, pending: 0, currency: "GHS" };
    const updatedWallet = { ...wallet, balance: (Number(wallet.balance) || 0) + amount };
    await kv.set(walletKey, updatedWallet);

    const transactionId = `transaction:${user.id}:${Date.now()}`;
    await kv.set(transactionId, {
      id: transactionId, userId: user.id, type: "fund",
      amount, method, reference, status: "completed",
      timestamp: new Date().toISOString(),
      metadata: verifyResult.data.metadata,
    });

    return c.json({ success: true, wallet: updatedWallet });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

/**
 * POST /wallet/deduct
 * Explicitly deduct an amount from the wallet.
 * Used for wallet-funded sends that bypass the transactions endpoint.
 * Body: { amount: number, description?: string }
 */
app.post("/make-server-45351b4f/wallet/deduct", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const { amount, description = "Wallet deduction" } = await c.req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    const updatedWallet = await deductWalletBalance(user.id, amount);
    return c.json({ success: true, wallet: updatedWallet, description });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    // Return 400 for insufficient balance, 500 for everything else
    const status = msg.includes("Insufficient") ? 400 : 500;
    return c.json({ error: msg }, status);
  }
});

// ============ PAYSTACK PAYMENT ROUTES ============

app.post("/make-server-45351b4f/payments/verify", authMiddleware, async (c) => {
  try {
    const { reference } = await c.req.json();
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) return c.json({ error: "Payment gateway not configured" }, 500);

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );
    const result = await response.json();
    if (!result.status) return c.json({ error: result.message || "Verification failed" }, 400);

    return c.json({
      verified: true,
      status: result.data.status,
      amount: result.data.amount / 100,
      reference: result.data.reference,
      paidAt: result.data.paid_at,
      channel: result.data.channel,
      metadata: result.data.metadata,
    });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/payments/initialize", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const { amount, email, metadata } = await c.req.json();
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) return c.json({ error: "Payment gateway not configured" }, 500);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round((amount as number) * 100),
        email,
        metadata: { ...(metadata as Record<string, unknown>), userId: user.id },
      }),
    });
    const result = await response.json();
    if (!result.status) return c.json({ error: result.message || "Initialization failed" }, 400);

    return c.json({
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ LINKED ACCOUNTS ROUTES ============

app.post("/make-server-45351b4f/accounts/link-card", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const cardData = await c.req.json();
    const cardId = `card:${user.id}:${Date.now()}`;
    await kv.set(cardId, { id: cardId, userId: user.id, ...cardData, createdAt: new Date().toISOString() });
    return c.json({ card: await kv.get(cardId) });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/accounts/cards", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const cards = await kv.getByPrefix(`card:${user.id}:`);
    return c.json({ cards });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/accounts/link-momo", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const momoData = await c.req.json();
    const momoId = `momo:${user.id}:${Date.now()}`;
    await kv.set(momoId, { id: momoId, userId: user.id, ...momoData, createdAt: new Date().toISOString() });
    return c.json({ momo: await kv.get(momoId) });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/accounts/momo", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const momos = await kv.getByPrefix(`momo:${user.id}:`);
    return c.json({ momos });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ ML/ANALYTICS ROUTES ============

app.get("/make-server-45351b4f/ml/recommendations", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const products = await kv.getByPrefix("product:");
    const userTransactions = await kv.getByPrefix(`transaction:${user.id}:`);

    const productMetrics = products.map((p) => ({
      productId: String(p.id ?? ""),
      totalSales: Number(p.totalSales ?? 0),
      totalRevenue: Number(p.totalRevenue ?? 0),
      averagePrice: Number(p.price ?? 0),
      purchaseFrequency: Number(p.purchaseFrequency ?? 0),
      lastSold: Number(p.lastSold ?? Date.now()),
      stockLevel: Number(p.stock ?? 0),
      category: String(p.category ?? "general"),
    }));

    const userBehavior = {
      userId: user.id,
      totalTransactions: userTransactions.length,
      averageAmount: userTransactions.reduce((s, t) => s + Number(t.amount ?? 0), 0) / (userTransactions.length || 1),
      preferredMethods: [...new Set(userTransactions.map((t) => String(t.method ?? "")))],
      transactionTimes: userTransactions.map((t) => new Date(String(t.timestamp ?? 0)).getTime()),
      categories: [...new Set(userTransactions.map((t) => String(t.category ?? "general")))],
    };

    return c.json({
      personalized: ProductRecommendationEngine.getPersonalizedRecommendations(productMetrics, userBehavior, 10),
      promoted: ProductRecommendationEngine.getPromotedProducts(productMetrics, 10),
      lowStock: ProductRecommendationEngine.getLowStockPromotions(productMetrics, 10),
    });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/analytics/dashboard", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const profile = await kv.get(`user:${user.id}`);
    if (!["admin", "manager"].includes(profile?.role as string)) {
      return c.json({ error: "Insufficient permissions" }, 403);
    }

    const transactions = await kv.getByPrefix("transaction:");
    const products = await kv.getByPrefix("product:");
    const customers = await kv.getByPrefix("customer:");

    const totalRevenue = transactions.reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const totalTransactions = transactions.length;

    const salesByDate: Record<string, number> = {};
    for (const t of transactions) {
      const date = new Date(String(t.timestamp ?? 0)).toLocaleDateString();
      salesByDate[date] = (salesByDate[date] || 0) + Number(t.amount ?? 0);
    }

    const productSales: Record<string, { count: number; revenue: number }> = {};
    for (const t of transactions) {
      if (Array.isArray(t.items)) {
        for (const item of t.items as Record<string, unknown>[]) {
          const pid = String(item.productId ?? "");
          if (!productSales[pid]) productSales[pid] = { count: 0, revenue: 0 };
          productSales[pid].count += Number(item.quantity ?? 0);
          productSales[pid].revenue += Number(item.price ?? 0) * Number(item.quantity ?? 0);
        }
      }
    }

    return c.json({
      overview: {
        totalRevenue, totalTransactions,
        averageTransactionValue: totalRevenue / (totalTransactions || 1),
        totalCustomers: customers.length,
        totalProducts: products.length,
      },
      salesByDate,
      topProducts: productSales,
      topCustomers: [...customers].sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0)).slice(0, 10),
    });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/receipts/generate", authMiddleware, async (c) => {
  try {
    const { transactionId } = await c.req.json();
    const transaction = await kv.get(transactionId as string);
    if (!transaction) return c.json({ error: "Transaction not found" }, 404);
    const receipt = {
      receiptId: `receipt:${Date.now()}`, transactionId,
      storeName: "FinTech Wallet POS",
      date: transaction.timestamp,
      items: transaction.items || [],
      subtotal: transaction.subtotal || transaction.amount,
      discount: transaction.discount || 0,
      tax: transaction.tax || 0,
      total: transaction.amount,
      paymentMethod: transaction.method,
      reference: transaction.reference,
    };
    await kv.set(receipt.receiptId, receipt);
    return c.json({ receipt });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

// ============ SMS ROUTES ============

app.post("/make-server-45351b4f/sms", async (c) => {
  try {
    const { to, message, messageId } = await c.req.json();
    if (!to || !message) return c.json({ error: "Phone number and message are required" }, 400);

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFromNumber = Deno.env.get("TWILIO_FROM_NUMBER") || "+15005550006";

    if (twilioAccountSid && twilioAuthToken) {
      try {
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ To: to as string, From: twilioFromNumber, Body: message as string }),
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to send SMS");
        return c.json({ success: true, provider: "twilio", sid: data.sid, messageId, status: "sent" });
      } catch (err: unknown) {
        console.log("Twilio SMS error:", err instanceof Error ? err.message : err);
      }
    }

    return c.json({ success: true, provider: "mock", messageId, status: "sent" });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-45351b4f/sms/:messageId", async (c) => {
  try {
    const smsData = await kv.get(`sms:${c.req.param("messageId")}`);
    if (!smsData) return c.json({ error: "SMS not found" }, 404);
    return c.json({ sms: smsData });
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.post("/make-server-45351b4f/sms/webhook/twilio", async (c) => {
  try {
    const formData = await c.req.formData();
    console.log(`Twilio webhook: ${formData.get("MessageSid")} - ${formData.get("MessageStatus")}`);
    return c.text("OK", 200);
  } catch (error: unknown) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

Deno.serve(app.fetch);