// services/paystackService.ts
import { verifyPayment, fundWallet, initializePayment as apiInitializePayment } from '../utils/api';

interface PaymentData {
  email: string;
  amount: number; // Amount in GHS (will be converted to pesewas internally)
  currency?: string;
  ref?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
  onSuccess: (reference: string) => void;
  onError: (error: unknown) => void;
  onClose?: () => void;
}

class PaystackService {
  private publicKey: string;
  private isScriptLoaded = false;

  constructor() {
    this.publicKey = 'pk_live_08843856cb66241124be52e0b9e8978bc4edbd19';
    this.loadPaystackScript();
  }

  // ─── Load Paystack inline script ───────────────────────────────────────────

  private loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isScriptLoaded) { resolve(); return; }
      if (document.getElementById('paystack-script')) {
        this.isScriptLoaded = true; resolve(); return;
      }

      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => { this.isScriptLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.body.appendChild(script);
    });
  }

  // ─── Open Paystack popup ────────────────────────────────────────────────────

  async initializePayment(data: PaymentData): Promise<void> {
    try {
      await this.loadPaystackScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (window as any).PaystackPop.setup({
        key: this.publicKey,
        email: data.email,
        amount: Math.round(data.amount * 100), // GHS → pesewas
        currency: data.currency || 'GHS',
        ref: data.ref || this.generateReference(),
        metadata: data.metadata || {},
        channels: data.channels || ['card', 'mobile_money', 'bank', 'ussd'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (response: any) => {
          data.onSuccess(response.reference);
        },
        onClose: () => {
          data.onClose?.();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack initialization error:', error);
      data.onError(error);
    }
  }

  // ─── Verify payment via your backend (real verification) ───────────────────

  async verifyPayment(reference: string): Promise<{
    verified: boolean;
    status: string;
    amount: number;
    reference: string;
    channel: string;
    paidAt: string;
  }> {
    const result = await verifyPayment(reference);

    if (!result.verified || result.status !== 'success') {
      throw new Error(`Payment verification failed: ${result.status}`);
    }

    return result;
  }

  // ─── Fund wallet: popup → verify → credit wallet ───────────────────────────

  async fundWallet(
    amount: number,
    email: string,
    userId: string,
  ): Promise<{ success: boolean; newBalance: number; reference: string }> {
    return new Promise((resolve, reject) => {
      this.initializePayment({
        email,
        amount,
        metadata: { userId, type: 'wallet_funding' },
        onSuccess: async (reference) => {
          try {
            const verified = await this.verifyPayment(reference);
            const { wallet } = await fundWallet(verified.amount, reference, 'paystack');
            resolve({ success: true, newBalance: wallet.balance, reference });
          } catch (error) {
            reject(error);
          }
        },
        onError: reject,
        onClose: () => reject(new Error('Payment cancelled')),
      });
    });
  }

  // ─── Process a POS card payment ────────────────────────────────────────────

  async processCardPayment(
    amount: number,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<{ reference: string; verified: boolean; amount: number }> {
    return new Promise((resolve, reject) => {
      this.initializePayment({
        email,
        amount,
        metadata,
        channels: ['card'],
        onSuccess: async (reference) => {
          try {
            const verified = await this.verifyPayment(reference);
            resolve({ reference, verified: verified.verified, amount: verified.amount });
          } catch (error) {
            reject(error);
          }
        },
        onError: reject,
        onClose: () => reject(new Error('Payment cancelled')),
      });
    });
  }

  // ─── Process a mobile money payment ────────────────────────────────────────

  async processMobileMoneyPayment(
    amount: number,
    email: string,
    phoneNumber: string,
    network: string,
    metadata: Record<string, unknown>,
  ): Promise<{ reference: string; verified: boolean; amount: number }> {
    return new Promise((resolve, reject) => {
      this.initializePayment({
        email,
        amount,
        metadata: {
          ...metadata,
          payment_method: 'mobile_money',
          phone_number: phoneNumber,
          network: network.toLowerCase(),
        },
        channels: ['mobile_money'],
        onSuccess: async (reference) => {
          try {
            const verified = await this.verifyPayment(reference);
            resolve({ reference, verified: verified.verified, amount: verified.amount });
          } catch (error) {
            reject(error);
          }
        },
        onError: reject,
        onClose: () => reject(new Error('Payment cancelled')),
      });
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private generateReference(): string {
    return `POS-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  formatAmount(amount: number, currency = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(amount);
  }

  getSupportedNetworks(): string[] {
    return ['MTN', 'Vodafone', 'AirtelTigo'];
  }

  validatePhoneNumber(phone: string): boolean {
    return /^(0|233)[0-9]{9}$/.test(phone.replace(/\s+/g, ''));
  }

  isTestMode(): boolean {
    return this.publicKey.startsWith('pk_test_');
  }

  setPublicKey(key: string) {
    this.publicKey = key;
  }
}

// ─── Re-export api initializer if needed elsewhere ─────────────────────────
export { apiInitializePayment };
export const paystackService = new PaystackService();