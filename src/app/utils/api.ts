// utils/api.ts
import { publicAnonKey, projectId } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client'; // ← shared singleton

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-45351b4f`;

// ─── Token resolution ─────────────────────────────────────────────────────────
// Always resolved fresh from the shared Supabase client.
// No module-level token variable needed — the shared client holds the session.

const resolveToken = async (explicit?: string): Promise<string> => {
  if (explicit) return explicit;

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  throw new Error('No active session');
};

// ─── Header builders ──────────────────────────────────────────────────────────

const authHeaders = async (token?: string): Promise<Record<string, string>> => {
  const resolved = await resolveToken(token);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${resolved}`,
    'apikey': resolved,          // ← fallback: Supabase never strips this
  };
};

const publicHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
  'apikey': publicAnonKey,          // ← fallback: Supabase never strips this
});

// ─── These are kept for backward-compat but are now no-ops ───────────────────
// The shared client manages token state; nothing needs to set it manually.
export const setAuthToken = (_token: string) => { /* no-op: shared client manages this */ };
export const getAuthToken = () => null;
export const clearAuthToken = () => { /* no-op */ };

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role = 'cashier',
) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: publicHeaders(),
    body: JSON.stringify({ email, password, name, role }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
  return res.json();
};

export const getUserProfile = async (token?: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: await authHeaders(token),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch profile');
  return res.json();
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  const res = await fetch(`${API_BASE_URL}/products`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch products');
  return res.json();
};

export const createProduct = async (productData: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create product');
  return res.json();
};

export const updateProduct = async (productId: string, updates: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update product');
  return res.json();
};

export const deleteProduct = async (productId: string) => {
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete product');
  return res.json();
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const getCustomers = async () => {
  const res = await fetch(`${API_BASE_URL}/customers`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch customers');
  return res.json();
};

export const createCustomer = async (customerData: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(customerData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create customer');
  return res.json();
};

export const updateCustomer = async (customerId: string, updates: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update customer');
  return res.json();
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const createTransaction = async (transactionData: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create transaction');
  return res.json();
};

export const getTransactions = async () => {
  const res = await fetch(`${API_BASE_URL}/transactions`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch transactions');
  return res.json();
};

// ─── ML / Analytics ───────────────────────────────────────────────────────────

export const getRecommendations = async () => {
  const res = await fetch(`${API_BASE_URL}/ml/recommendations`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch recommendations');
  return res.json();
};

export const getAnalytics = async () => {
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch analytics');
  return res.json();
};

export const generateReceipt = async (transactionId: string) => {
  const res = await fetch(`${API_BASE_URL}/receipts/generate`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ transactionId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate receipt');
  return res.json();
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const verifyPayment = async (reference: string) => {
  const res = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Payment verification failed');
  return res.json();
};

export const initializePayment = async (
  amount: number,
  email: string,
  metadata: Record<string, unknown>,
) => {
  const res = await fetch(`${API_BASE_URL}/payments/initialize`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ amount, email, metadata }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Payment initialization failed');
  return res.json();
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const fundWallet = async (amount: number, reference: string, method: string) => {
  const res = await fetch(`${API_BASE_URL}/wallet/fund`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ amount, reference, method }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Wallet funding failed');
  return res.json();
};

export const getWalletBalance = async () => {
  const res = await fetch(`${API_BASE_URL}/wallet/balance`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch wallet balance');
  return res.json();
};

// ─── Account linking ──────────────────────────────────────────────────────────

export const linkCard = async (cardData: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/accounts/link-card`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(cardData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to link card');
  return res.json();
};

export const getLinkedCards = async () => {
  const res = await fetch(`${API_BASE_URL}/accounts/cards`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch linked cards');
  return res.json();
};

export const linkMobileMoney = async (momoData: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE_URL}/accounts/link-momo`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(momoData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to link mobile money');
  return res.json();
};

export const getLinkedMobileMoney = async () => {
  const res = await fetch(`${API_BASE_URL}/accounts/momo`, { headers: await authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch linked mobile money accounts');
  return res.json();
};