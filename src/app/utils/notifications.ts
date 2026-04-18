import { notificationService } from '../services/notification';
import { smsService } from '../services/sms';

/**
 * Utility functions for sending notifications and SMS messages
 */

export interface NotificationOptions {
  userId: string;
  title: string;
  message: string;
  type?: 'transaction' | 'payment' | 'transfer' | 'system' | 'alert';
  data?: any;
  sendSMS?: boolean;
  phoneNumber?: string;
}

/**
 * Send a notification (and optionally an SMS)
 */
export async function sendNotification(options: NotificationOptions) {
  const {
    userId,
    title,
    message,
    type = 'system',
    data,
    sendSMS = false,
    phoneNumber,
  } = options;

  try {
    // Create in-app notification
    await notificationService.createNotification({
      userId,
      type,
      title,
      message,
      read: false,
      data,
    });

    // Optionally send SMS
    if (sendSMS && phoneNumber) {
      await smsService.sendSMS(phoneNumber, `${title}: ${message}`, userId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}

/**
 * Send transaction notification
 */
export async function sendTransactionNotification(
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
  balance: number,
  reference: string,
  phoneNumber?: string
) {
  const action = type === 'credit' ? 'credited to' : 'debited from';
  const emoji = type === 'credit' ? '💰' : '💸';
  
  return sendNotification({
    userId,
    title: `${emoji} Transaction ${type === 'credit' ? 'Received' : 'Sent'}`,
    message: `GHS ${amount.toFixed(2)} has been ${action} your wallet. New balance: GHS ${balance.toFixed(2)}`,
    type: 'transaction',
    data: { amount, type, balance, reference },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(
  userId: string,
  amount: number,
  recipient: string,
  reference: string,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '✅ Payment Successful',
    message: `Your payment of GHS ${amount.toFixed(2)} to ${recipient} was successful. Ref: ${reference}`,
    type: 'payment',
    data: { amount, recipient, reference },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(
  userId: string,
  amount: number,
  recipient: string,
  reason: string,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '❌ Payment Failed',
    message: `Your payment of GHS ${amount.toFixed(2)} to ${recipient} failed. Reason: ${reason}`,
    type: 'alert',
    data: { amount, recipient, reason },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send wallet funded notification
 */
export async function sendWalletFundedNotification(
  userId: string,
  amount: number,
  method: string,
  balance: number,
  reference: string,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '💳 Wallet Funded',
    message: `Your wallet has been funded with GHS ${amount.toFixed(2)} via ${method}. New balance: GHS ${balance.toFixed(2)}`,
    type: 'transaction',
    data: { amount, method, balance, reference },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send security alert
 */
export async function sendSecurityAlert(
  userId: string,
  alertType: string,
  description: string,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '🔒 Security Alert',
    message: `${alertType}: ${description}`,
    type: 'alert',
    data: { alertType, description },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send low balance alert
 */
export async function sendLowBalanceAlert(
  userId: string,
  balance: number,
  threshold: number,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '⚠️ Low Balance Alert',
    message: `Your wallet balance (GHS ${balance.toFixed(2)}) is below the threshold of GHS ${threshold.toFixed(2)}. Please add money to continue transacting.`,
    type: 'alert',
    data: { balance, threshold },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}

/**
 * Send account linked notification
 */
export async function sendAccountLinkedNotification(
  userId: string,
  accountType: string,
  accountName: string,
  phoneNumber?: string
) {
  return sendNotification({
    userId,
    title: '🔗 Account Linked',
    message: `Your ${accountType} (${accountName}) has been successfully linked to your wallet.`,
    type: 'system',
    data: { accountType, accountName },
    sendSMS: !!phoneNumber,
    phoneNumber,
  });
}
