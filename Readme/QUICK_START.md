# Quick Start Guide 🚀

## Get Up and Running in 5 Minutes

### 1. Start the App (30 seconds)

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 2. Create Your Account (1 minute)

1. Click **"Create New Account"**
2. Fill in:
   - Name
   - Email  
   - Password (min 6 characters)
3. Click **"Create Account"**
4. You'll see: "Account created! Please sign in."
5. Sign in with your credentials

✅ **You're now logged in!**

### 3. Explore Features (3 minutes)

#### Try the Wallet
- **Location**: `/wallet` (home page)
- **What to do**: View your balance, see linked accounts
- **Action**: Click "Add Money" to fund your wallet

#### Try the POS
- **Location**: `/pos` tab
- **What to do**: 
  1. Search "Coca Cola"
  2. Click to add to cart
  3. Click "Checkout"
  4. Select payment method
  5. Confirm payment
- **Result**: Transaction processed, inventory updated

#### View Transactions
- **Location**: `/transactions` tab
- **What to do**: See your POS transaction, filter/search

#### Link Accounts
- **Location**: `/accounts` tab
- **What to do**: Link a test card or mobile money account

### 4. Become an Admin (Optional - 1 minute)

To access Analytics and product management:

1. Go to [Supabase](https://supabase.com/dashboard/project/mzvnlzsbmkqwnvlziucd/database/tables)
2. Open `kv_store_45351b4f` table
3. Find your user record (key starts with `user:`)
4. Edit: Change `"role": "cashier"` to `"role": "admin"`
5. Sign out and back in
6. Now you see **Analytics** tab! 📊

## That's It! 🎉

You're ready to use your FinTech Wallet POS System!

---

## Quick Tips

### 💡 Testing POS
Pre-loaded products:
- Coca Cola - GHS 5
- Rice 5kg - GHS 45
- USB Cable - GHS 25
- ...and 12 more!

### 💡 Fraud Detection
Don't worry if transactions are flagged - it's learning your patterns!

### 💡 Customer Loyalty
Customers earn 1 point per GHS 10 spent automatically.

### 💡 Analytics
- **Admins & Managers**: Full analytics dashboard
- **Cashiers**: POS and wallet only

### 💡 ML Features
AI recommendations work automatically - no setup needed!

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Console | F12 |
| Refresh | F5 |
| Hard Refresh | Ctrl+Shift+R |

---

## Quick Troubleshooting

❌ **Can't sign in?**
→ Create account first!

❌ **No Analytics tab?**
→ Upgrade to admin role

❌ **Page not black?**
→ Refresh (F5)

❌ **Error messages?**
→ Check browser console (F12)

---

## Next Steps

- 📖 Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- 🛠️ Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for issues
- 📚 See [README.md](./README.md) for full documentation

**Happy selling!** 💰
