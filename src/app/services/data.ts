import { db } from './database';
import { supabase } from '../../../utils/supabase/client'; // shared singleton
import {
  Product,
  Customer,
  Transaction,
  WalletBalance,
  CartItem,
  PaymentMethod,
  User
} from '../types';

class DataService {
  // ============ USER OPERATIONS ============
  async getUser(userId: string): Promise<User | null> {
    return await db.get(`user:${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const updated = { ...user, ...updates };
    await db.set(`user:${userId}`, updated);
    return updated;
  }

  // ============ PRODUCT OPERATIONS ============
  async getProducts(): Promise<Product[]> {
    return await db.getByPrefix('product:');
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await db.get(productId);
  }

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = `product:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const product: Product = { ...productData, id };
    await db.set(id, product);
    return product;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');

    const updated = { ...product, ...updates };
    await db.set(productId, updated);
    return updated;
  }

  async deleteProduct(productId: string): Promise<void> {
    await db.delete(productId);
  }

  async updateProductStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new Error('Insufficient stock');

    return await this.updateProduct(productId, { stock: newStock });
  }

  // ============ CUSTOMER OPERATIONS ============
  async getCustomers(): Promise<Customer[]> {
    return await db.getByPrefix('customer:');
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return await db.get(customerId);
  }

  async createCustomer(
    customerData: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'transactionCount' | 'createdAt'>
  ): Promise<Customer> {
    const id = `customer:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customer: Customer = {
      ...customerData,
      id,
      loyaltyPoints: 0,
      totalSpent: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString(),
    };
    await db.set(id, customer);
    return customer;
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    const customer = await this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    const updated = { ...customer, ...updates };
    await db.set(customerId, updated);
    return updated;
  }

  async addCustomerPurchase(customerId: string, amount: number): Promise<Customer> {
    const customer = await this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    const loyaltyPointsEarned = Math.floor(amount / 10);

    return await this.updateCustomer(customerId, {
      totalSpent: customer.totalSpent + amount,
      transactionCount: customer.transactionCount + 1,
      loyaltyPoints: customer.loyaltyPoints + loyaltyPointsEarned,
      lastTransaction: new Date().toISOString(),
    });
  }

  // ============ TRANSACTION OPERATIONS ============
  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (userId) return await db.getByPrefix(`transaction:${userId}:`);
    return await db.getByPrefix('transaction:');
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return await db.get(transactionId);
  }

  async createTransaction(
    userId: string,
    transactionData: Omit<Transaction, 'id' | 'timestamp' | 'reference'>
  ): Promise<Transaction> {
    const id = `transaction:${userId}:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction: Transaction = {
      ...transactionData,
      id,
      reference,
      timestamp: new Date(),
    };

    await db.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ): Promise<Transaction> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const updated = { ...transaction, status };
    await db.set(transactionId, updated);
    return updated;
  }

  // ============ WALLET OPERATIONS ============
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    const balance = await db.get(`wallet:${userId}`);
    return balance || { available: 0, pending: 0 };
  }

  async updateWalletBalance(
    userId: string,
    amount: number,
    type: 'add' | 'subtract' = 'add'
  ): Promise<WalletBalance> {
    const balance = await this.getWalletBalance(userId);

    if (type === 'subtract' && balance.available < amount) {
      throw new Error('Insufficient balance');
    }

    const updated = {
      available: type === 'add' ? balance.available + amount : balance.available - amount,
      pending: balance.pending,
    };

    await db.set(`wallet:${userId}`, updated);
    return updated;
  }

  async addPendingBalance(userId: string, amount: number): Promise<WalletBalance> {
    const balance = await this.getWalletBalance(userId);
    const updated = { available: balance.available, pending: balance.pending + amount };
    await db.set(`wallet:${userId}`, updated);
    return updated;
  }

  async clearPendingBalance(userId: string, moveToAvailable = true): Promise<WalletBalance> {
    const balance = await this.getWalletBalance(userId);
    const updated = {
      available: moveToAvailable ? balance.available + balance.pending : balance.available,
      pending: 0,
    };
    await db.set(`wallet:${userId}`, updated);
    return updated;
  }

  // ============ POS OPERATIONS ============
  async processPOSTransaction(
    userId: string,
    cart: CartItem[],
    paymentMethod: PaymentMethod,
    customerId?: string,
    discount = 0,
    _paymentReference?: string
  ): Promise<{ transaction: Transaction; balance?: WalletBalance }> {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = 0;
    const total = subtotal - discount + tax;

    // Update product stocks and sales stats
    for (const item of cart) {
      await this.updateProductStock(item.product.id, -item.quantity);

      const product = await this.getProduct(item.product.id);
      if (product) {
        await this.updateProduct(item.product.id, {
          totalSales: (product.totalSales || 0) + item.quantity,
          totalRevenue: (product.totalRevenue || 0) + item.product.price * item.quantity,
          lastSold: new Date().toISOString(),
        });
      }
    }

    const transaction = await this.createTransaction(userId, {
      type: 'pos',
      amount: total,
      status: 'success',
      method: paymentMethod,
      description: `POS Sale - ${cart.length} item(s)`,
      customerId,
      items: cart,
      subtotal,
      discount,
      tax,
    });

    if (customerId) {
      await this.addCustomerPurchase(customerId, total);
    }

    let balance;
    if (paymentMethod === 'wallet') {
      balance = await this.updateWalletBalance(userId, total, 'subtract');
    }

    return { transaction, balance };
  }

  // ============ ANALYTICS OPERATIONS ============
  async getAnalytics(userId?: string) {
    const transactions = await this.getTransactions(userId);
    const products = await this.getProducts();
    const customers = await this.getCustomers();

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const salesByDate: Record<string, number> = {};
    transactions.forEach(t => {
      const date = new Date(t.timestamp).toLocaleDateString();
      salesByDate[date] = (salesByDate[date] || 0) + t.amount;
    });

    const productStats: Record<string, { name: string; count: number; revenue: number }> = {};
    transactions.forEach(t => {
      if (t.items) {
        t.items.forEach(item => {
          if (!productStats[item.product.id]) {
            productStats[item.product.id] = { name: item.product.name, count: 0, revenue: 0 };
          }
          productStats[item.product.id].count += item.quantity;
          productStats[item.product.id].revenue += item.product.price * item.quantity;
        });
      }
    });

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      overview: {
        totalRevenue,
        totalTransactions,
        averageTransactionValue: avgTransactionValue,
        totalCustomers: customers.length,
        totalProducts: products.length,
      },
      salesByDate: Object.entries(salesByDate).map(([date, amount]) => ({ date, amount })),
      topProducts,
      topCustomers,
    };
  }

  // ============ SEED DATA ============
  async seedSampleData(_userId: string) {
    const sampleProducts: Omit<Product, 'id'>[] = [
      { name: 'Coca-Cola 500ml', price: 5.00, category: 'Beverages', stock: 100, barcode: '001' },
      { name: 'Bread (Large)', price: 8.50, category: 'Bakery', stock: 50, barcode: '002' },
      { name: 'Rice 5kg', price: 45.00, category: 'Groceries', stock: 30, barcode: '003' },
      { name: 'Cooking Oil 1L', price: 25.00, category: 'Groceries', stock: 40, barcode: '004' },
      { name: 'Milo 400g', price: 18.00, category: 'Beverages', stock: 60, barcode: '005' },
      { name: 'Eggs (12 pack)', price: 22.00, category: 'Dairy', stock: 35, barcode: '006' },
      { name: 'Tomato Paste', price: 4.50, category: 'Groceries', stock: 80, barcode: '007' },
      { name: 'Milk 500ml', price: 12.00, category: 'Dairy', stock: 45, barcode: '008' },
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }

    console.log('Sample data seeded successfully');
  }
}

export const dataService = new DataService();

// Re-export supabase for any file that was importing it from here
export { supabase };