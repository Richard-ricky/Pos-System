# Paystack Integration Setup Guide 🚀

This guide will help you set up Paystack payment integration for the FinTech Wallet POS system.

## Table of Contents
- [Getting Started](#getting-started)
- [Test Mode Setup](#test-mode-setup)
- [Live Mode Setup](#live-mode-setup)
- [Testing Payments](#testing-payments)
- [Supported Payment Methods](#supported-payment-methods)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Step 1: Create a Paystack Account

1. Go to [paystack.com](https://paystack.com)
2. Click "Create a free account"
3. Fill in your business details
4. Verify your email address

### Step 2: Access Your Dashboard

1. Log in to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. You'll see two sets of keys:
   - **Test Keys** (for development)
   - **Live Keys** (for production - requires business verification)

### Step 3: Get Your Public Key

For **Test Mode**:
```
pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

For **Live Mode** (after verification):
```
pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Test Mode Setup

### 1. Add Test Public Key to Environment

Create or update `.env` file in your project root:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Replace `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual test public key from Paystack dashboard.

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Verify Integration

1. Open the application
2. Navigate to POS
3. Add items to cart
4. Click "Proceed to Payment"
5. Select "Card Payment"
6. You should see the Paystack payment modal

## Test Mode - Test Cards

Use these test cards to simulate different scenarios:

### Successful Transactions

**Mastercard**
```
Card Number: 5531886652142950
CVV: 564
Expiry: Any future date
PIN: 3310
OTP: 123456
```

**Visa**
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

**Verve**
```
Card Number: 5060666666666666666
CVV: 123
Expiry: Any future date
PIN: 1234
OTP: 123456
```

### Failed Transactions

**Insufficient Funds**
```
Card Number: 5060666666666666666
CVV: 123
Expiry: Any future date
PIN: 1111
```

**Invalid Card**
```
Card Number: 4084084084084082
CVV: 408
Expiry: Any future date
```

## Testing Payments

### Card Payment Flow

1. **Add products to cart** in POS
2. **Click "Proceed to Payment"**
3. **Select "Card Payment"**
4. **Click "Complete Payment"**
5. **Paystack modal appears**
6. **Enter test card details**:
   - Card number
   - Expiry date (MM/YY)
   - CVV
7. **Enter PIN** when prompted
8. **Enter OTP** (use 123456 for test mode)
9. **Payment confirmed** ✓

### Mobile Money Flow (Test Mode)

1. Select "Mobile Money" as payment method
2. Choose network (MTN, Vodafone, AirtelTigo)
3. Enter phone number
4. Complete payment via USSD prompt

> **Note**: Mobile Money in test mode requires additional setup with Paystack.

## Live Mode Setup

### Prerequisites for Going Live

1. **Complete Business Verification**
   - Business registration documents
   - Director/Owner ID verification
   - Bank account verification
   - Business address verification

2. **Activate Your Account**
   - Submit verification documents to Paystack
   - Wait for approval (usually 1-3 business days)
   - Receive confirmation email

### Steps to Go Live

1. **Access Live Keys**
   - Go to Paystack Dashboard
   - Navigate to Settings → API Keys
   - Copy your **Live Public Key**

2. **Update Environment Variables**

For production deployment:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Deploy Application**

Deploy your application with the live key. Ensure it's set in your hosting platform:

**Vercel**:
- Project Settings → Environment Variables
- Add `VITE_PAYSTACK_PUBLIC_KEY` with live key value

**Netlify**:
- Site Settings → Build & Deploy → Environment
- Add `VITE_PAYSTACK_PUBLIC_KEY` with live key value

4. **Test Live Payments**
   - Make a small test transaction (GHS 1.00)
   - Verify it appears in Paystack dashboard
   - Check funds settlement

### Transaction Fees (Ghana)

Paystack charges per transaction:
- **Local Cards**: 1.95% capped at GHS 10
- **International Cards**: 3.9% + GHS 1
- **Mobile Money**: 1% + GHS 0.50

Fees are automatically deducted before settlement.

## Supported Payment Methods

### 1. Card Payments ✓
- **Visa** (Debit & Credit)
- **Mastercard** (Debit & Credit)
- **Verve** (Nigeria)
- All payments secured with 3D Secure

### 2. Mobile Money ✓
- **MTN Mobile Money**
- **Vodafone Cash**
- **AirtelTigo Money**

### 3. Bank Transfer (Coming Soon)
- Direct bank transfer
- Virtual account numbers

### 4. USSD (Coming Soon)
- Pay via USSD codes
- All major Ghana banks

## Webhook Setup (Optional but Recommended)

Webhooks notify your application of payment events.

### 1. Create Webhook Endpoint

Add to your backend (if you have one):

```typescript
// POST /api/webhooks/paystack
export async function POST(req: Request) {
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.json();

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest('hex');

  if (hash === signature) {
    // Process event
    if (body.event === 'charge.success') {
      // Payment successful
      const { reference, amount } = body.data;
      // Update transaction status in database
    }
  }

  return new Response('OK', { status: 200 });
}
```

### 2. Register Webhook URL

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Save changes

### 3. Handle Webhook Events

- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `transfer.success` - Payout successful
- `transfer.failed` - Payout failed

## Security Best Practices

### ✓ Do's

- ✓ Always verify payments on the backend
- ✓ Use environment variables for API keys
- ✓ Never commit API keys to version control
- ✓ Verify webhook signatures
- ✓ Use HTTPS in production
- ✓ Implement rate limiting
- ✓ Log all transactions

### ✗ Don'ts

- ✗ Don't expose secret keys in frontend code
- ✗ Don't trust client-side payment confirmations
- ✗ Don't store card details
- ✗ Don't skip webhook signature verification
- ✗ Don't use test keys in production

## Troubleshooting

### Paystack Modal Not Showing

**Problem**: Payment modal doesn't appear when clicking "Complete Payment"

**Solutions**:
1. Check browser console for errors
2. Verify public key in `.env` file
3. Ensure Paystack script is loading:
   - Open DevTools → Network
   - Look for `https://js.paystack.co/v1/inline.js`
4. Try disabling browser extensions
5. Test in incognito mode

### Payment Fails with "Invalid Key"

**Problem**: Payment fails immediately with key error

**Solutions**:
1. Verify you're using the correct public key (pk_test_ or pk_live_)
2. Check for extra spaces in `.env` file
3. Restart development server after updating `.env`
4. Ensure key matches test/live mode

### Payment Succeeds but Balance Not Updated

**Problem**: Payment completes but wallet balance doesn't change

**Solutions**:
1. Check browser console for errors
2. Verify transaction was created in database
3. Check network tab for failed API calls
4. Refresh the page
5. Check Paystack dashboard for payment status

### Mobile Money Not Working

**Problem**: Mobile Money payment option fails

**Solutions**:
1. Ensure mobile money is enabled on your Paystack account
2. Contact Paystack support to activate mobile money
3. Test with correct phone number format (e.g., 0241234567)
4. Verify network is supported (MTN, Vodafone, AirtelTigo)

### Webhook Not Triggering

**Problem**: Webhook events not received

**Solutions**:
1. Verify webhook URL is publicly accessible
2. Check webhook logs in Paystack dashboard
3. Ensure endpoint returns 200 status
4. Verify signature verification code
5. Check server logs for errors

## Testing Checklist

Before going live, test these scenarios:

### Test Mode
- [ ] Successful card payment
- [ ] Failed card payment (insufficient funds)
- [ ] Invalid card number
- [ ] Expired card
- [ ] Wrong PIN
- [ ] Wrong OTP
- [ ] Payment cancellation
- [ ] Mobile money payment
- [ ] Multiple items in cart
- [ ] Different payment amounts

### Live Mode (Small Amounts)
- [ ] Real card payment (GHS 1-5)
- [ ] Funds settled to account
- [ ] Transaction appears in dashboard
- [ ] Receipt generated correctly
- [ ] Webhook received (if configured)

## Support

### Paystack Support
- **Email**: support@paystack.com
- **Phone**: +234 01 633 0778
- **Docs**: https://paystack.com/docs
- **Status**: https://status.paystack.com

### Common Questions

**Q: How long does verification take?**
A: Usually 1-3 business days after submitting all documents.

**Q: When are funds settled?**
A: T+1 (next business day) by default. Can be changed in settings.

**Q: What's the transaction limit?**
A: Default GHS 100,000 per transaction. Higher limits available on request.

**Q: Can I refund payments?**
A: Yes, via Paystack dashboard or API. Refunds process in 5-10 business days.

**Q: Is there a monthly fee?**
A: No monthly fees. Pay only per transaction.

## Next Steps

1. ✓ Complete test mode integration
2. ✓ Test with test cards
3. → Submit verification documents
4. → Get live keys
5. → Deploy with live keys
6. → Make first live transaction
7. → Set up webhooks (optional)
8. → Go live! 🎉

---

**Need Help?** Contact Paystack support or refer to their [comprehensive documentation](https://paystack.com/docs).
