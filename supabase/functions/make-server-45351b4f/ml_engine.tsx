/**
 * Machine Learning Engine for FinTech Wallet
 * Handles product recommendations, promotions, and fraud detection
 */

export interface TransactionPattern {
  userId: string;
  amount: number;
  method: string;
  timestamp: number;
  recipient?: string;
  location?: string;
}

export interface ProductMetrics {
  productId: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  purchaseFrequency: number;
  lastSold: number;
  stockLevel: number;
  category: string;
}

export interface UserBehavior {
  userId: string;
  totalTransactions: number;
  averageAmount: number;
  preferredMethods: string[];
  transactionTimes: number[];
  categories: string[];
}

/**
 * Product Recommendation Engine
 */
export class ProductRecommendationEngine {
  static scoreProduct(product: ProductMetrics, currentTime: number): number {
    let score = 0;
    score += (product.totalRevenue / 1000) * 0.3;
    score += product.purchaseFrequency * 0.25;
    const daysSinceLastSale = (currentTime - product.lastSold) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSinceLastSale) / 10;
    score += recencyScore * 0.2;
    const stockScore = Math.min(product.stockLevel / 50, 1);
    score += stockScore * 0.15;
    score += (product.totalSales > 5 ? 1 : product.totalSales / 5) * 0.1;
    return score;
  }

  static getPromotedProducts(products: ProductMetrics[], limit = 10): string[] {
    if (products.length === 0) return [];
    const currentTime = Date.now();
    return products
      .map(p => ({ productId: p.productId, score: this.scoreProduct(p, currentTime) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(p => p.productId);
  }

  static getPersonalizedRecommendations(
    products: ProductMetrics[],
    userBehavior: UserBehavior,
    limit = 5,
  ): string[] {
    if (products.length === 0) return [];
    const currentTime = Date.now();
    const avgAmount = userBehavior.averageAmount || 1;

    return products
      .map(p => {
        let score = this.scoreProduct(p, currentTime);
        if (userBehavior.categories.includes(p.category)) score *= 1.5;
        const priceDiff = Math.abs(p.averagePrice - avgAmount);
        const priceScore = Math.max(0, 1 - priceDiff / avgAmount);
        score *= 1 + priceScore * 0.3;
        return { productId: p.productId, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(p => p.productId);
  }

  static getLowStockPromotions(products: ProductMetrics[], threshold = 10): string[] {
    return products
      .filter(p => p.stockLevel <= threshold && p.stockLevel > 0)
      .sort((a, b) => a.stockLevel - b.stockLevel)
      .map(p => p.productId);
  }
}

/**
 * Fraud Detection Engine
 */
export class FraudDetectionEngine {
  static calculateRiskScore(
    transaction: TransactionPattern,
    userHistory: TransactionPattern[],
  ): number {
    // No history = no risk score, treat as new user
    if (userHistory.length === 0) {
      return transaction.amount > 10000 ? 30 : 0;
    }

    let riskScore = 0;
    const amounts = userHistory.map(t => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length,
    );

    const amountDeviation = Math.abs(transaction.amount - avgAmount) / (stdDev || 1);
    if (amountDeviation > 3) riskScore += 25;
    else if (amountDeviation > 2) riskScore += 15;

    const recentTransactions = userHistory.filter(
      t => transaction.timestamp - t.timestamp < 3_600_000,
    );
    if (recentTransactions.length > 10) riskScore += 20;
    else if (recentTransactions.length > 5) riskScore += 10;

    // Guard: only check method if history is non-empty
    const methodCounts: Record<string, number> = {};
    userHistory.forEach(t => {
      methodCounts[t.method] = (methodCounts[t.method] || 0) + 1;
    });
    const methodKeys = Object.keys(methodCounts);
    if (methodKeys.length > 0 && userHistory.length > 5) {
      const mostUsedMethod = methodKeys.reduce((a, b) =>
        methodCounts[a] > methodCounts[b] ? a : b,
      );
      if (transaction.method !== mostUsedMethod) riskScore += 15;
    }

    const transactionHour = new Date(transaction.timestamp).getHours();
    const typicalHours = userHistory.map(t => new Date(t.timestamp).getHours());
    const isTypicalHour = typicalHours.some(h => Math.abs(h - transactionHour) <= 2);
    if (!isTypicalHour && userHistory.length > 10) riskScore += 15;

    if (transaction.amount > 1000) riskScore += 10;
    if (transaction.amount > 5000) riskScore += 15;
    if (transaction.amount > 10000) riskScore += 25;

    const similarAmountTransactions = recentTransactions.filter(
      t => Math.abs(t.amount - transaction.amount) < transaction.amount * 0.1,
    );
    if (similarAmountTransactions.length >= 3) riskScore += 20;

    return Math.min(riskScore, 100);
  }

  static isSuspicious(
    transaction: TransactionPattern,
    userHistory: TransactionPattern[],
  ): { suspicious: boolean; riskScore: number; reasons: string[] } {
    const riskScore = this.calculateRiskScore(transaction, userHistory);
    const reasons: string[] = [];

    if (riskScore >= 70) {
      if (transaction.amount > 5000) reasons.push('Unusually large transaction amount');

      const recentCount = userHistory.filter(
        t => transaction.timestamp - t.timestamp < 3_600_000,
      ).length;
      if (recentCount > 5) reasons.push('High frequency of transactions');

      if (userHistory.length > 0) {
        const amounts = userHistory.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        if (transaction.amount > avgAmount * 3) reasons.push('Amount significantly above average');
      }

      return { suspicious: true, riskScore, reasons };
    }

    return { suspicious: false, riskScore, reasons: [] };
  }

  static analyzeVelocity(
    transactions: TransactionPattern[],
    windowMs = 3_600_000,
  ): { count: number; totalAmount: number; isAnomalous: boolean } {
    const now = Date.now();
    const recent = transactions.filter(t => now - t.timestamp < windowMs);
    const count = recent.length;
    const totalAmount = recent.reduce((sum, t) => sum + t.amount, 0);
    return { count, totalAmount, isAnomalous: count > 10 || totalAmount > 20000 };
  }

  static detectDuplicates(
    transaction: TransactionPattern,
    recentTransactions: TransactionPattern[],
    timeWindowMs = 300_000,
  ): boolean {
    return recentTransactions.some(
      t =>
        Math.abs(t.timestamp - transaction.timestamp) < timeWindowMs &&
        Math.abs(t.amount - transaction.amount) < 0.01 &&
        t.recipient === transaction.recipient,
    );
  }
}

/**
 * Customer Analytics Engine
 */
export class CustomerAnalyticsEngine {
  static calculateCLV(transactions: TransactionPattern[]): number {
    if (transactions.length === 0) return 0;
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransactionValue = totalSpent / transactions.length;
    return avgTransactionValue * transactions.length * 0.5;
  }

  static segmentCustomer(behavior: UserBehavior): string {
    if (behavior.totalTransactions > 50 && behavior.averageAmount > 500) return 'VIP';
    if (behavior.totalTransactions > 20 && behavior.averageAmount > 200) return 'Regular';
    if (behavior.totalTransactions > 5) return 'Active';
    return 'New';
  }

  static predictChurnRisk(
    lastTransactionTime: number,
    averageTransactionInterval: number,
  ): { risk: number; status: string } {
    const daysSinceLast = (Date.now() - lastTransactionTime) / (1000 * 60 * 60 * 24);
    const expectedInterval = (averageTransactionInterval || 1) / (1000 * 60 * 60 * 24);
    const risk = Math.min((daysSinceLast / expectedInterval) * 100, 100);
    const status = risk > 70 ? 'High Risk' : risk > 40 ? 'At Risk' : 'Active';
    return { risk, status };
  }
}
