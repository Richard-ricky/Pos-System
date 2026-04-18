# Paystack Integration Guide

## Overview

This fintech wallet system integrates **Paystack** for secure payment processing in Ghana (GHS currency). The system supports both card payments and mobile money (MTN, Vodafone, AirtelTigo) transactions.

## API Keys Configuration

Your Paystack API keys have been configured:

### Test Keys (Currently Active)
- **Public Key**: `pk_test_24ccda8876e93dddf6087bd5a51efa4db2efe280`
- **Secret Key**: `sk_test_445ea4c94faa505137de78692e8fe6626860efca`

### Environment Variables
The secret key is stored securely as a Supabase environment variable:
- `PAYSTACK_SECRET_KEY` - Used by the backend for payment verification

## System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│   Frontend  │ ──────> │   Paystack   │ ──────> │   Backend  │
│  (React)    │ <────── │   (Payment)  │ <────── │  (Supabase)│
└─────────────┘         └──────────────┘         └────────────┘
      │                                                  │
      │                                                  │
      └──────────────────────────────────────────────────┘
                    API Communication
```

## Payment Flow

### 1. **Initialize Payment (Frontend)**
```typescript
import { paystackService } from './services/paystack';

paystackService.initializePayment({
  email: 'user@example.com',
  amount: 100, // Amount in GHS
  currency: 'GHS',
  metadata: {
    userId: 'user123',
    fundingSource: 'momo' // or 'card'
  },
  channels: ['mobile_money'], // or ['card']
  onSuccess: (reference) => {
    // Handle success
    console.log('Payment reference:', reference);
  },
  onError: (error) => {
    // Handle error
    console.error('Payment error:', error);
  }
});
```

### 2. **Verify Payment (Backend)**
The backend automatically verifies payments with Paystack:

```typescript
// POST /make-server-45351b4f/payments/verify
{
  "reference": "POS-1234567890-123456"
}
```

Response:
```json
{
  "verified": true,
  "status": "success",
  "amount": 100,
  "reference": "POS-1234567890-123456",
  "paidAt": "2026-04-03T10:30:00Z",
  "channel": "mobile_money"
}
```

### 3. **Fund Wallet**
After verification, the wallet is updated:

```typescript
// POST /make-server-45351b4f/wallet/fund
{
  "amount": 100,
  "reference": "POS-1234567890-123456",
  "method": "momo"
}
```

## Backend Endpoints

### Payment Endpoints

#### Verify Payment
```
POST /make-server-45351b4f/payments/verify
Authorization: Bearer <access_token>

Request:
{
  "reference": "payment_reference"
}

Response:
{
  "verified": true,
  "status": "success",
  "amount": 100,
  "reference": "...",
  "paidAt": "...",
  "channel": "mobile_money"
}
```

#### Initialize Payment
```
POST /make-server-45351b4f/payments/initialize
Authorization: Bearer <access_token>

Request:
{
  "amount": 100,
  "email": "user@example.com",
  "metadata": {}
}

Response:
{
  "authorizationUrl": "https://...",
  "accessCode": "...",
  "reference": "..."
}
```

#### Fund Wallet
```
POST /make-server-45351b4f/wallet/fund
Authorization: Bearer <access_token>

Request:
{
  "amount": 100,
  "reference": "payment_reference",
  "method": "momo"
}

Response:
{
  "success": true,
  "wallet": {
    "balance": 100,
    "pending": 0,
    "currency": "GHS"
  },
  "transaction": {...}
}
```

#### Get Wallet Balance
```
GET /make-server-45351b4f/wallet/balance
Authorization: Bearer <access_token>

Response:
{
  "wallet": {
    "userId": "...",
    "balance": 100,
    "pending": 0,
    "currency": "GHS"
  }
}
```

### Account Linking Endpoints

#### Link Card
```
POST /make-server-45351b4f/accounts/link-card
Authorization: Bearer <access_token>

Request:
{
  "last4Digits": "1234",
  "cardholderName": "JOHN DOE",
  "expiryDate": "12/25",
  "cardType": "visa",
  "isDefault": false
}
```

#### Link Mobile Money
```
POST /make-server-45351b4f/accounts/link-momo
Authorization: Bearer <access_token>

Request:
{
  "phoneNumber": "0241234567",
  "network": "MTN",
  "accountName": "John Doe",
  "isDefault": false
}
```

#### Get Linked Cards
```
GET /make-server-45351b4f/accounts/cards
Authorization: Bearer <access_token>

Response:
{
  "cards": [...]
}
```

#### Get Linked Mobile Money Accounts
```
GET /make-server-45351b4f/accounts/momo
Authorization: Bearer <access_token>

Response:
{
  "momos": [...]
}
```

## Testing

### Test Card Details
For testing card payments in test mode, use these Paystack test cards:

**Successful Payment:**
- Card Number: `5061 1406 5869 5780`
- CVV: `123`
- PIN: `1234`
- Expiry: Any future date

**Failed Payment:**
- Card Number: `5060 9909 9000 0001 04`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Mobile Money
In test mode, mobile money payments will simulate the approval process without actual network charges.

## Security Best Practices

1. **API Keys**: Never expose secret keys in frontend code
2. **HTTPS**: All payment communications use HTTPS
3. **Token Authentication**: All API endpoints require valid JWT tokens
4. **Payment Verification**: Always verify payments on the backend
5. **Amount Validation**: Minimum amount is GHS 1.00

## Supported Networks

- **MTN Mobile Money**
- **Vodafone Cash**
- **AirtelTigo Money**
- **Visa Cards**
- **Mastercard**

## Error Handling

Common error codes and their meanings:

| Error | Description | Solution |
|-------|-------------|----------|
| `Payment gateway not configured` | Secret key missing | Check environment variables |
| `Payment verification failed` | Invalid reference | Verify the payment reference |
| `Insufficient permissions` | Authorization failed | Check user authentication |
| `Failed to link card` | Card validation failed | Verify card details |

## Going Live

To switch from test mode to live mode:

1. Replace test keys with live keys from Paystack Dashboard
2. Update `PAYSTACK_SECRET_KEY` environment variable
3. Update public key in `/src/app/services/paystack.ts`
4. Test thoroughly with real transactions
5. Monitor transactions in Paystack Dashboard

## Monitoring

Monitor payments in the Paystack Dashboard:
- **Test Dashboard**: https://dashboard.paystack.com/test
- **Live Dashboard**: https://dashboard.paystack.com/live

## Support

For Paystack-related issues:
- Documentation: https://paystack.com/docs
- Support: support@paystack.com

For application issues:
- Check backend logs in Supabase Functions
- Review frontend console for errors
- Verify authentication tokens are valid

## Features Implemented

✅ Card payment processing  
✅ Mobile money integration  
✅ Payment verification  
✅ Wallet funding  
✅ Transaction history  
✅ Linked accounts management  
✅ Real-time balance updates  
✅ Fraud detection (ML-powered)  
✅ Receipt generation  

## Next Steps

1. Test all payment flows thoroughly
2. Link test cards and mobile money accounts
3. Fund wallet using test credentials
4. Monitor transaction history
5. Review analytics dashboard
6. Test POS transactions

---

**Note**: This system is currently in **TEST MODE**. All transactions are simulated and no real money is charged.
