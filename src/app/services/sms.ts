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

// Resolves the current session token from the shared Supabase client
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No active session');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': session.access_token,
  };
};

class SMSService {
  // Send SMS via backend API
  async sendSMS(to: string, message: string, userId?: string): Promise<SMSMessage> {
    const smsMessage: SMSMessage = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to,
      message,
      status: 'pending',
      timestamp: Date.now(),
    };

    try {
      await db.set(`sms:${smsMessage.id}`, smsMessage);

      const response = await fetch(`${API_BASE_URL}/sms`, {
        method: 'POST',
        headers: await getAuthHeaders(), // ← fixed: auth header added
        body: JSON.stringify({
          to,
          message,
          messageId: smsMessage.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      smsMessage.status = 'sent';
      smsMessage.provider = data.provider;
      await db.set(`sms:${smsMessage.id}`, smsMessage);

      if (userId) {
        await db.set(`user_sms:${userId}:${smsMessage.id}`, smsMessage);
      }

      return smsMessage;
    } catch (error) {
      console.error('Error sending SMS:', error);
      smsMessage.status = 'failed';
      smsMessage.error = error instanceof Error ? error.message : 'Unknown error';
      await db.set(`sms:${smsMessage.id}`, smsMessage);
      throw error;
    }
  }

  // Send transaction notification
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

  // Send OTP
  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`;
    await this.sendSMS(phoneNumber, message);
  }

  // Send payment confirmation
  async sendPaymentConfirmation(
    phoneNumber: string,
    amount: number,
    recipient: string,
    reference: string,
  ): Promise<void> {
    const message = `Payment of GHS ${amount.toFixed(2)} to ${recipient} was successful. Ref: ${reference}. Thank you for using our service.`;
    await this.sendSMS(phoneNumber, message);
  }

  // Send welcome SMS
  async sendWelcomeSMS(phoneNumber: string, name: string): Promise<void> {
    const message = `Welcome to our fintech platform, ${name}! Your wallet is ready. Start transacting securely today.`;
    await this.sendSMS(phoneNumber, message);
  }

  // Get SMS history for a user
  async getSMSHistory(userId: string): Promise<SMSMessage[]> {
    try {
      const messages = await db.getByPrefix(`user_sms:${userId}:`);
      return (messages as SMSMessage[]).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching SMS history:', error);
      return [];
    }
  }

  // Get SMS by ID
  async getSMS(smsId: string): Promise<SMSMessage | null> {
    try {
      return await db.get(`sms:${smsId}`) as SMSMessage | null;
    } catch (error) {
      console.error('Error fetching SMS:', error);
      return null;
    }
  }

  // Update SMS status (for delivery callbacks)
  async updateSMSStatus(smsId: string, status: SMSMessage['status'], error?: string): Promise<void> {
    try {
      const sms = await this.getSMS(smsId);
      if (sms) {
        sms.status = status;
        if (error) sms.error = error;
        await db.set(`sms:${smsId}`, sms);
      }
    } catch (error) {
      console.error('Error updating SMS status:', error);
    }
  }

  // Format phone number to E.164 (Ghana)
  formatPhoneNumber(phoneNumber: string, countryCode = '+233'): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('233')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return `${countryCode}${cleaned}`;
  }

  // Validate Ghana phone number
  isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^(0|233)?[2-5][0-9]{8}$/.test(cleaned);
  }
}

export const smsService = new SMSService();