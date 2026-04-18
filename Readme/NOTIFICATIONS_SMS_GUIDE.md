# Notifications and SMS Integration Guide

## Overview

The FinTech Wallet system now includes a comprehensive notification system with SMS integration. This enables real-time notifications for transactions, payments, and system alerts through both in-app notifications and SMS messages.

## Features

### 1. In-App Notifications
- Real-time notification center in the header
- Unread count badge
- Notification types: transaction, payment, transfer, system, alert
- Mark as read/unread functionality
- Delete individual or all notifications
- Browser push notifications (requires permission)
- Realtime updates via Supabase subscriptions

### 2. SMS Notifications
- Transactional SMS for payments and transfers
- OTP verification support
- Payment confirmations
- Welcome messages
- Transaction alerts
- Configurable SMS provider (Twilio)

### 3. Glassmorphism Design
- Modern liquid glass effect with backdrop blur
- Multiple glass variants: `.glass`, `.glass-card`, `.glass-strong`, `.glass-subtle`
- Clear, readable text with proper contrast
- Dark mode optimized

## Setup

### 1. Database Configuration

The system uses the new Supabase instance with direct database access:

```typescript
// Already configured in /utils/supabase/info.tsx
export const projectId = "jdotmashjqtadgdtudaj"
export const publicAnonKey = "eyJhbGciOiJI..."
```

### 2. SMS Configuration (Optional)

To enable SMS functionality via Twilio, add the following secrets in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Settings > Edge Functions > Secrets
3. Add these secrets:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_FROM_NUMBER`: Your Twilio phone number (e.g., +1234567890)

**Note:** SMS will work in mock mode without these credentials for development/testing.

## Usage

### Sending Notifications from Components

```typescript
import { sendNotification, sendTransactionNotification } from '../utils/notifications';

// Basic notification
await sendNotification({
  userId: user.id,
  title: 'Welcome!',
  message: 'Your account is ready',
  type: 'system'
});

// Transaction notification with SMS
await sendTransactionNotification(
  user.id,
  500.00,
  'credit',
  2500.00,
  'TXN123456',
  '+233244123456' // Optional phone number for SMS
);
```

### Available Notification Functions

```typescript
// Transaction notification
sendTransactionNotification(userId, amount, type, balance, reference, phoneNumber?)

// Payment success
sendPaymentSuccessNotification(userId, amount, recipient, reference, phoneNumber?)

// Payment failed
sendPaymentFailedNotification(userId, amount, recipient, reason, phoneNumber?)

// Wallet funded
sendWalletFundedNotification(userId, amount, method, balance, reference, phoneNumber?)

// Security alert
sendSecurityAlert(userId, alertType, description, phoneNumber?)

// Low balance alert
sendLowBalanceAlert(userId, balance, threshold, phoneNumber?)

// Account linked
sendAccountLinkedNotification(userId, accountType, accountName, phoneNumber?)
```

### Direct SMS Service Usage

```typescript
import { smsService } from '../services/sms';

// Send custom SMS
await smsService.sendSMS('+233244123456', 'Your custom message');

// Send OTP
await smsService.sendOTP('+233244123456', '123456');

// Send transaction SMS
await smsService.sendTransactionSMS(
  '+233244123456',
  500.00,
  'credit',
  2500.00,
  'TXN123456'
);

// Format phone number
const formatted = smsService.formatPhoneNumber('0244123456'); // Returns +233244123456

// Validate phone number
const isValid = smsService.isValidPhoneNumber('0244123456'); // Returns true
```

### Notification Service API

```typescript
import { notificationService } from '../services/notification';

// Create notification
await notificationService.createNotification({
  userId: 'user-id',
  type: 'transaction',
  title: 'Payment Received',
  message: 'You received GHS 500.00',
  read: false,
  data: { amount: 500, reference: 'TXN123' }
});

// Get user notifications
const notifications = await notificationService.getUserNotifications(userId);

// Get unread count
const unreadCount = await notificationService.getUnreadCount(userId);

// Mark as read
await notificationService.markAsRead(userId, notificationId);

// Mark all as read
await notificationService.markAllAsRead(userId);

// Delete notification
await notificationService.deleteNotification(userId, notificationId);

// Request browser notification permission
await notificationService.requestPermission();

// Subscribe to realtime notifications
const unsubscribe = notificationService.subscribeToRealtimeNotifications(
  userId,
  (notification) => {
    console.log('New notification:', notification);
  }
);
```

## Glassmorphism Styling

Apply glassmorphism effects using these CSS classes:

```tsx
// Standard glass effect
<div className="glass rounded-lg p-6">
  <h3 className="glass-text">Title</h3>
  <p>Content</p>
</div>

// Card with glass effect
<div className="glass-card rounded-xl p-8">
  <h2 className="glass-text">Card Title</h2>
</div>

// Strong glass effect (more opaque)
<div className="glass-strong rounded-lg p-4">
  <span className="glass-text">Strong Glass</span>
</div>

// Subtle glass effect (more transparent)
<div className="glass-subtle rounded-lg p-4">
  <span className="glass-text">Subtle Glass</span>
</div>
```

### CSS Variables

Customize glass effects using CSS variables:

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(0, 0, 0, 0.1);
}

.dark {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: rgba(0, 0, 0, 0.3);
}
```

## Integration Examples

### In Transaction Flow

```typescript
// In your transaction component
const handleTransaction = async (data) => {
  try {
    // Process transaction
    const result = await processTransaction(data);
    
    // Send notification
    await sendTransactionNotification(
      user.id,
      data.amount,
      'debit',
      result.newBalance,
      result.reference,
      user.phoneNumber
    );
    
    toast.success('Transaction completed!');
  } catch (error) {
    await sendNotification({
      userId: user.id,
      title: '❌ Transaction Failed',
      message: error.message,
      type: 'alert'
    });
  }
};
```

### In Payment Verification

```typescript
// In your payment verification flow
const verifyPayment = async (reference: string) => {
  const result = await paystackService.verifyPayment(reference);
  
  if (result.verified) {
    await sendWalletFundedNotification(
      user.id,
      result.amount,
      result.channel,
      wallet.balance,
      reference,
      user.phoneNumber
    );
  }
};
```

### In Account Linking

```typescript
// When user links a card or mobile money account
const linkAccount = async (accountData) => {
  const result = await linkAccountAPI(accountData);
  
  await sendAccountLinkedNotification(
    user.id,
    accountData.type,
    accountData.accountName,
    user.phoneNumber
  );
};
```

## Backend API Endpoints

### SMS Endpoints

```bash
# Send SMS
POST /make-server-45351b4f/sms
Body: { to: "+233244123456", message: "Your message", messageId: "sms_123" }

# Get SMS status
GET /make-server-45351b4f/sms/:messageId

# Twilio webhook (for delivery status)
POST /make-server-45351b4f/sms/webhook/twilio
```

## Notification Types

| Type | Icon | Use Case |
|------|------|----------|
| `transaction` | 💳 | Money received, sent, or transferred |
| `payment` | 💰 | Payment confirmations |
| `transfer` | 📤 | Transfer notifications |
| `system` | ⚙️ | System updates, account changes |
| `alert` | 🚨 | Security alerts, low balance warnings |

## Best Practices

### 1. Notification Content
- Keep titles short and descriptive
- Include amounts with proper formatting (GHS X.XX)
- Always include reference numbers
- Use emojis sparingly for visual distinction

### 2. SMS Considerations
- SMS should be concise (< 160 characters)
- Include essential information only
- Always include reference numbers
- Avoid sending duplicate messages
- Respect user preferences

### 3. Performance
- Notifications are stored with user prefix for efficient querying
- Limit to 50 most recent notifications per user
- Use realtime subscriptions for instant updates
- Browser notifications require user permission

### 4. Security
- Never send sensitive data (passwords, full card numbers) via SMS
- Validate phone numbers before sending SMS
- Log all SMS attempts for audit
- Implement rate limiting for SMS sends

## Troubleshooting

### Notifications not appearing
1. Check if user is authenticated
2. Verify notification service is initialized
3. Check browser console for errors
4. Ensure realtime subscription is active

### SMS not sending
1. Verify Twilio credentials are set
2. Check phone number format (+233XXXXXXXXX)
3. Review server logs for errors
4. Confirm SMS endpoint is accessible

### Browser notifications not working
1. Check if permission is granted
2. Verify HTTPS connection (required for notifications)
3. Test in different browsers
4. Check browser notification settings

## Environment Variables

Required in Supabase Edge Functions:

```bash
# Supabase (already configured)
SUPABASE_URL=https://jdotmashjqtadgdtudaj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Twilio (optional, for SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Paystack (already configured)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

## Testing

### Mock SMS Mode
When Twilio credentials are not configured, SMS will work in mock mode:
- Messages are logged to console
- Success responses are returned
- No actual SMS is sent
- Perfect for development and testing

### Browser Notifications
Test browser notifications:
```typescript
// Request permission
const permission = await notificationService.requestPermission();
console.log('Permission:', permission);

// Send test notification
await notificationService.createNotification({
  userId: user.id,
  type: 'system',
  title: 'Test Notification',
  message: 'This is a test',
  read: false
});
```

## Support

For issues or questions:
1. Check server logs in Supabase Dashboard > Edge Functions
2. Review browser console for frontend errors
3. Verify all environment variables are set
4. Test with mock SMS mode first

## Next Steps

- Configure Twilio for production SMS
- Set up notification preferences per user
- Implement notification scheduling
- Add email notifications
- Create notification templates
- Add notification analytics
