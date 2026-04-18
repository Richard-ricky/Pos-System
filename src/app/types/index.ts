export type PaymentMethod = 'wallet' | 'card' | 'momo';
export type TransactionType = 'pos' | 'send' | 'receive' | 'fund';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'pending_review';
export type MoMoNetwork = 'MTN' | 'Vodafone' | 'AirtelTigo';
export type UserRole = 'admin' | 'manager' | 'cashier';

export interface LinkedCard {
  id: string;
  cardNumber: string; // Last 4 digits
  cardholderName: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard';
  isDefault: boolean;
}

export interface LinkedMobileMoney {
  id: string;
  phoneNumber: string;
  network: MoMoNetwork;
  accountName: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  method: PaymentMethod;
  description: string;
  recipient?: string;
  timestamp: Date;
  reference: string;
  customerId?: string;
  items?: CartItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  fraudCheck?: {
    riskScore: number;
    suspicious: boolean;
    reasons: string[];
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode?: string;
  image?: string;
  cost?: number;
  supplier?: string;
  totalSales?: number;
  totalRevenue?: number;
  recentSales?: number;
  lastSold?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WalletBalance {
  available: number;
  pending: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  transactionCount: number;
  createdAt: string;
  lastTransaction?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Receipt {
  receiptId: string;
  transactionId: string;
  storeName: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  reference: string;
  customerName?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalCustomers: number;
  totalProducts: number;
}