// utils/storage.ts
// Cards and MoMo are now stored in the backend — do NOT use localStorage for those.
// This file only handles Products (with image support) and local UI state.

import { Product, Transaction, WalletBalance } from '../types';

const KEYS = {
  PRODUCTS: 'fintech_products',
  TRANSACTIONS: 'fintech_transactions',
  WALLET: 'fintech_wallet_balance',
};

// ─── Products (local cache + image support) ───────────────────────────────────

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Coca Cola 500ml',  price: 3.50,  category: 'Beverages', stock: 50, barcode: '12345' },
  { id: '2', name: 'Bread (Large)',     price: 8.00,  category: 'Bakery',    stock: 30, barcode: '12346' },
  { id: '3', name: 'Milo 400g',         price: 25.00, category: 'Beverages', stock: 20, barcode: '12347' },
  { id: '4', name: 'Rice 5kg',          price: 45.00, category: 'Groceries', stock: 15, barcode: '12348' },
  { id: '5', name: 'Cooking Oil 1L',    price: 18.00, category: 'Groceries', stock: 25, barcode: '12349' },
  { id: '6', name: 'Tissue Roll',       price: 5.00,  category: 'Household', stock: 40, barcode: '12350' },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(KEYS.PRODUCTS);
  if (!stored) {
    setProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const setProducts = (products: Product[]): void => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  setProducts(products);
};

export const updateProduct = (productId: string, updates: Partial<Product>): void => {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    setProducts(products);
  }
};

export const deleteProduct = (productId: string): void => {
  setProducts(getProducts().filter((p) => p.id !== productId));
};

export const updateProductStock = (productId: string, newStock: number): void => {
  updateProduct(productId, { stock: newStock });
};

/**
 * Save a product image as a base64 data URL.
 * Call this after the user picks a file via <input type="file" />.
 *
 * Usage:
 *   const dataUrl = await saveProductImage(file);
 *   updateProduct(productId, { image: dataUrl });
 */
export const saveProductImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

// ─── Transactions (local cache) ───────────────────────────────────────────────

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(KEYS.TRANSACTIONS);
  if (!stored) return [];
  return JSON.parse(stored).map((t: Transaction & { timestamp: string }) => ({
    ...t,
    timestamp: new Date(t.timestamp),
  }));
};

export const setTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  setTransactions(transactions);
};

// ─── Wallet (local cache — source of truth is the backend) ───────────────────

export const getWalletBalance = (): WalletBalance => {
  const stored = localStorage.getItem(KEYS.WALLET);
  return stored ? JSON.parse(stored) : { available: 0, pending: 0 };
};

export const setWalletBalance = (balance: WalletBalance): void => {
  localStorage.setItem(KEYS.WALLET, JSON.stringify(balance));
};

// ─── Reference generator ──────────────────────────────────────────────────────

export const generateReference = (): string =>
  'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

