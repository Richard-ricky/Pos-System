import { db } from './database';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-45351b4f`;

export interface SMSMessage {
  id: string;
  to: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  timestamp: number;
  provider?: string;
  error?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
// db.getByPrefix may return raw stored values OR { key, value } pairs.
function extractSMSMessages(raw: unknown[]): SMSMessage[] {
  return raw
    .map((item) => {
      if (item && typeof item === 'object') {
        if ('value' in item && item.value && typeof item.value === 'object') {
          return item.value as SMSMessage;
        }
        if ('id' in item && 'to' in item) {
          return item as SMSMessage;
        }
      }
      return null;
    })
    .filter((m): m is SMSMessage => m !== null);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No active session');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': session.access_token,
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

class SMSService {

  async sendSMS(to: string, message: string, userId?: string): Promise<SMSMessage> {
    const smsMessage: SMSMessage = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to,
      message,
      status: 'pending',
      timestamp: Date.now(),
    };

    // Persist pending record before the network call so we never lose the ID
    await db.set(`sms:${smsMessage.id}`, smsMessage);

    try {
      const response = await fetch(`${API_BASE_URL}/sms`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ to, message, messageId: smsMessage.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send SMS');

      const sent: SMSMessage = { ...smsMessage, status: 'sent', provider: data.provider };
      await db.set(`sms:${sent.id}`, sent);
      if (userId) await db.set(`user_sms:${userId}:${sent.id}`, sent);

      return sent;
    } catch (error) {
      const failed: SMSMessage = {
        ...smsMessage,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      // Persist failure state — don't mutate the original object
      await db.set(`sms:${failed.id}`, failed);
      // Re-throw so the caller (sendNotification) knows it failed
      throw error;
    }
  }

  async sendTransactionSMS(
    phoneNumber: string,
    amount: number,
    type: 'credit' | 'debit',
    balance: number,
    reference: string,
  ): Promise<void> {
    const action = type === 'credit' ? 'credited with' : 'debited';
    const message = `Your wallet has been ${action} GHS ${amount.toFixed(2)}. New balance: GHS ${balance.toFixed(2)}. Ref: ${reference}`;
    await this.sendSMS(phoneNumber, message);
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`;
    await this.sendSMS(phoneNumber, message);
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    amount: number,
    recipient: string,
    reference: string,
  ): Promise<void> {
    const message = `Payment of GHS ${amount.toFixed(2)} to ${recipient} was successful. Ref: ${reference}. Thank you for using our service.`;
    await this.sendSMS(phoneNumber, message);
  }

  async sendWelcomeSMS(phoneNumber: string, name: string): Promise<void> {
    const message = `Welcome to our fintech platform, ${name}! Your wallet is ready. Start transacting securely today.`;
    await this.sendSMS(phoneNumber, message);
  }

  async getSMSHistory(userId: string): Promise<SMSMessage[]> {
    try {
      const raw = await db.getByPrefix(`user_sms:${userId}:`);
      return extractSMSMessages(raw).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching SMS history:', error);
      return [];
    }
  }

  async getSMS(smsId: string): Promise<SMSMessage | null> {
    try {
      const raw = await db.get(`sms:${smsId}`);
      if (!raw || typeof raw !== 'object') return null;
      // Normalise { key, value } or direct shape
      if ('value' in raw && raw.value && typeof raw.value === 'object') {
        return raw.value as SMSMessage;
      }
      if ('id' in raw) return raw as SMSMessage;
      return null;
    } catch (error) {
      console.error('Error fetching SMS:', error);
      return null;
    }
  }

  async updateSMSStatus(
    smsId: string,
    status: SMSMessage['status'],
    error?: string,
  ): Promise<void> {
    try {
      const sms = await this.getSMS(smsId);
      if (!sms) return;
      await db.set(`sms:${smsId}`, {
        ...sms,
        status,
        ...(error ? { error } : {}),
      });
    } catch (err) {
      console.error('Error updating SMS status:', err);
    }
  }

  // Format to E.164 for Ghana (+233)
  formatPhoneNumber(phoneNumber: string, countryCode = '+233'): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('233')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `${countryCode}${cleaned.slice(1)}`;
    // Already stripped (e.g. "244123456")
    return `${countryCode}${cleaned}`;
  }

  // Validate Ghana number (02x / 03x / 05x — major networks)
  isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^(0|233)?[2-5][0-9]{8}$/.test(cleaned);
  }
}

export const smsService = new SMSService();