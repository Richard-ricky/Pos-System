# Quick Start Guide - Notifications, SMS & Glassmorphism

## 🚀 Getting Started in 5 Minutes

### 1. Test Notification System

Open browser console and run:

```javascript
// Test basic notification
testNotifications.testBasicNotification()

// Test all notification types
testNotifications.testAllNotifications()

// Test transaction notification
testNotifications.testTransactionNotification()

// Test wallet funded notification
testNotifications.testWalletFundedNotification()

// Test payment notification
testNotifications.testPaymentNotification()
```

### 2. Send Notification from Code

```typescript
import { sendTransactionNotification } from './utils/notifications';

// In your component or function
await sendTransactionNotification(
  user.id,
  500.00,           // amount
  'credit',         // 'credit' or 'debit'
  2500.00,          // new balance
  'TXN123456',      // reference
  '+233244123456'   // phone number (optional, for SMS)
);
```

### 3. Apply Glassmorphism

```tsx
// Standard glass effect
<div className="glass rounded-lg p-6">
  <h3 className="glass-text">Title</h3>
  <p>Content</p>
</div>

// Glass card
<div className="glass-card rounded-xl p-8">
  <h2 className="glass-text">Card Title</h2>
</div>
```

## 📱 SMS Integration

### Quick SMS Send

```typescript
import { smsService } from './services/sms';

// Send SMS
await smsService.sendSMS('+233244123456', 'Your message');

// Send OTP
await smsService.sendOTP('+233244123456', '123456');
```

### SMS Status
- ✅ Works in **mock mode** by default (no setup needed)
- 🔧 Configure Twilio for production:
  - Add `TWILIO_ACCOUNT_SID` secret
  - Add `TWILIO_AUTH_TOKEN` secret
  - Add `TWILIO_FROM_NUMBER` secret

## 🎯 Common Use Cases

### 1. After Payment Success

```typescript
await sendWalletFundedNotification(
  user.id,
  amount,
  'Paystack',
  newBalance,
  reference,
  user.phoneNumber // Send SMS too
);
```

### 2. After Money Transfer

```typescript
await sendTransactionNotification(
  user.id,
  amount,
  'debit',
  newBalance,
  reference,
  user.phoneNumber
);
```

### 3. Security Alert

```typescript
await sendSecurityAlert(
  user.id,
  'Login from new device',
  'Someone logged into your account from a new device',
  user.phoneNumber
);
```

### 4. Low Balance Warning

```typescript
await sendLowBalanceAlert(
  user.id,
  balance,
  100, // threshold
  user.phoneNumber
);
```

## 🎨 Glassmorphism Cheat Sheet

| Class | Use Case | Opacity |
|-------|----------|---------|
| `.glass` | Standard components | Medium |
| `.glass-card` | Feature cards | Medium+ |
| `.glass-strong` | Modals, dialogs | High |
| `.glass-subtle` | Backgrounds | Low |
| `.glass-text` | Text inside glass | Enhanced |

### Quick Examples

```tsx
// Header with glass
<header className="glass sticky top-0">
  <h1 className="glass-text">Title</h1>
</header>

// Card with colored glass
<div className="glass-card rounded-xl p-6 bg-purple-500/10">
  <h3 className="glass-text text-purple-300">Purple Card</h3>
</div>

// Modal with strong glass
<div className="glass-strong rounded-2xl p-8">
  <h2 className="glass-text">Modal Title</h2>
</div>

// Hover effect
<div className="glass-subtle hover:glass rounded-lg p-4 transition-all">
  <span className="glass-text">Hover Me</span>
</div>
```

## 🔔 Notification Types Reference

```typescript
// Transaction received/sent
'transaction' // 💳

// Payment confirmation
'payment' // 💰

// Transfer notification
'transfer' // 📤

// System update
'system' // ⚙️

// Alert/warning
'alert' // 🚨
```

## 📊 Quick Debugging

### Check if Notifications Work
1. Open browser console
2. Run: `testNotifications.testBasicNotification()`
3. Check notification bell icon in header
4. Should see unread count badge

### Check if SMS Works
1. Send test SMS: `smsService.sendSMS('+233244123456', 'Test')`
2. Check server logs in Supabase Dashboard
3. Should see "SMS sent successfully (mock mode)" if no Twilio config

### Check Glassmorphism
1. Add `glass-card` to any div
2. Should see blur effect
3. If not visible, check browser support
4. Must have content/color behind element

## 🛠️ Available Helper Functions

```typescript
// Notifications
sendNotification(options)
sendTransactionNotification(userId, amount, type, balance, ref, phone?)
sendPaymentSuccessNotification(userId, amount, recipient, ref, phone?)
sendPaymentFailedNotification(userId, amount, recipient, reason, phone?)
sendWalletFundedNotification(userId, amount, method, balance, ref, phone?)
sendSecurityAlert(userId, type, description, phone?)
sendLowBalanceAlert(userId, balance, threshold, phone?)
sendAccountLinkedNotification(userId, type, name, phone?)

// SMS
smsService.sendSMS(to, message, userId?)
smsService.sendOTP(phoneNumber, otp)
smsService.sendTransactionSMS(phone, amount, type, balance, ref)
smsService.sendPaymentConfirmation(phone, amount, recipient, ref)
smsService.formatPhoneNumber(phone, countryCode?)
smsService.isValidPhoneNumber(phone)
```

## 🎯 Integration Checklist

### For Transaction Features
- [ ] Import notification helper
- [ ] Call `sendTransactionNotification` after success
- [ ] Pass user phone number for SMS
- [ ] Handle errors gracefully

### For Payment Features
- [ ] Import notification helper
- [ ] Call `sendWalletFundedNotification` after verification
- [ ] Include payment reference
- [ ] Send SMS confirmation

### For UI Components
- [ ] Add glass classes where appropriate
- [ ] Use `glass-text` for text in glass elements
- [ ] Test in dark mode
- [ ] Check on mobile devices

## 📱 Phone Number Format

All phone numbers should be in E.164 format:

```typescript
// Ghana (country code: 233)
'+233244123456'  // ✅ Correct
'0244123456'     // ❌ Wrong (use formatPhoneNumber)

// Format helper
const formatted = smsService.formatPhoneNumber('0244123456');
// Returns: '+233244123456'
```

## 🌐 Browser Support

### Notifications
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari 16+
- ✅ Mobile browsers

### Glassmorphism
- ✅ Chrome/Edge 76+
- ✅ Firefox 103+
- ✅ Safari 15.4+
- ⚠️ Fallback for older browsers

## 🔥 Pro Tips

### Notifications
- Keep titles under 50 characters
- Include amounts with currency
- Always include reference numbers
- Use emojis for quick recognition

### SMS
- Keep messages under 160 characters
- Include reference numbers
- Don't send duplicate messages
- Test in mock mode first

### Glassmorphism
- Less is more - don't overuse
- Ensure content behind glass
- Test text readability
- Use appropriate variant for context

## 🐛 Common Issues

### "Notification not appearing"
→ Check user is authenticated
→ Verify NotificationCenter in MainLayout
→ Check browser console for errors

### "SMS not sending"
→ Normal! Uses mock mode by default
→ Check server logs for confirmation
→ Configure Twilio for production

### "Glass effect not visible"
→ Ensure content/color behind element
→ Check browser supports backdrop-filter
→ Test in dark mode

## 📚 Full Documentation

- **Complete Guide:** `/NOTIFICATIONS_SMS_GUIDE.md`
- **Glass Guide:** `/GLASSMORPHISM_GUIDE.md`
- **System Upgrade:** `/SYSTEM_UPGRADE_LATEST.md`

## 🎉 You're Ready!

Everything is set up and working. Just:
1. Use notification helpers in your components
2. Apply glass classes to your UI
3. SMS works in mock mode (configure Twilio for production)
4. Test using console commands

Happy coding! 🚀
