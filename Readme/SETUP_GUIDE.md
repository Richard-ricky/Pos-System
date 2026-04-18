# Setup Guide - First Time Setup

## Welcome to FinTech Wallet POS System! 🎉

This guide will help you set up your first admin account and get started.

## Quick Start

### Step 1: Start the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 2: Create Your First Account

When you open the app, you'll see the login screen.

1. Click **"Create New Account"** button at the bottom
2. Enter your details:
   - **Full Name**: Your name (e.g., "Admin User")
   - **Email**: Your email address
   - **Password**: At least 6 characters
3. Click **"Create Account"**
4. You'll see a success message: "Account created! Please sign in."
5. Now sign in with your email and password

**Note**: The first account you create will have "cashier" role by default. To make yourself an admin, follow the steps below.

### Step 3: Upgrade to Admin Role (via Supabase Dashboard)

Since the first account is created as a cashier, you need to upgrade it to admin:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mzvnlzsbmkqwnvlziucd)
2. Navigate to **Database** → **Table Editor**
3. Find the `kv_store_45351b4f` table
4. Search for your user record (key starts with `user:`)
5. Edit the record and change:
   ```json
   {
     ...
     "role": "admin"
   }
   ```
6. Save changes
7. Sign out and sign in again

#### Option B: Via API Call

Use this curl command (replace `YOUR_USER_ID` with your actual user ID):

```bash
curl -X PUT https://mzvnlzsbmkqwnvlziucd.supabase.co/functions/v1/make-server-45351b4f/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

### Step 4: Create Additional Users (Optional)

Once you have admin access, you can create more users with different roles:

1. Use the signup endpoint:

```bash
# Create a Manager
curl -X POST https://mzvnlzsbmkqwnvlziucd.supabase.co/functions/v1/make-server-45351b4f/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dm5senNibWtxd252bHppdWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDU2MDIsImV4cCI6MjA4OTc4MTYwMn0.IWdsai9oKP3jbRyJr4goeKvWTxNUURuPy9M1wqLyZag" \
  -d '{
    "email": "manager@yourcompany.com",
    "password": "manager123",
    "name": "Manager Name",
    "role": "manager"
  }'

# Create a Cashier
curl -X POST https://mzvnlzsbmkqwnvlziucd.supabase.co/functions/v1/make-server-45351b4f/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dm5senNibWtxd252bHppdWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDU2MDIsImV4cCI6MjA4OTc4MTYwMn0.IWdsai9oKP3jbRyJr4goeKvWTxNUURuPy9M1wqLyZag" \
  -d '{
    "email": "cashier@yourcompany.com",
    "password": "cashier123",
    "name": "Cashier Name",
    "role": "cashier"
  }'
```

## User Roles Explained

### 👑 Admin
- **Full access** to everything
- Can view analytics dashboard
- Can create, update, and **delete** products
- Can manage customers
- Can use POS system
- Can manage wallet and linked accounts

### 📊 Manager
- Can view analytics dashboard
- Can create and update products (cannot delete)
- Can manage customers
- Can use POS system
- Can manage wallet and linked accounts

### 💰 Cashier
- Can use POS system
- Can manage own wallet
- Can link payment methods
- Can send/receive money
- **Cannot** view analytics
- **Cannot** manage products

## Initial Setup Checklist

After creating your admin account:

- [ ] Sign in and verify you can access the app
- [ ] Go to `/wallet` - Check your wallet dashboard
- [ ] Go to `/pos` - View the POS system (products are pre-loaded)
- [ ] Go to `/accounts` - Try linking a card or mobile money
- [ ] Go to `/analytics` - Verify you can see analytics (admin only)
- [ ] Try creating a test transaction in POS

## Pre-loaded Demo Data

The system comes with sample products to help you test:

**Beverages:**
- Coca Cola - GHS 5.00
- Fanta - GHS 5.00
- Sprite - GHS 5.00
- Water (500ml) - GHS 2.00

**Snacks:**
- Pringles - GHS 15.00
- Doritos - GHS 12.00
- KitKat - GHS 8.00
- Oreo Cookies - GHS 10.00

**Groceries:**
- Rice (5kg) - GHS 45.00
- Cooking Oil (1L) - GHS 35.00
- Sugar (1kg) - GHS 12.00
- Salt (500g) - GHS 5.00

**Electronics:**
- USB Cable - GHS 25.00
- Phone Charger - GHS 40.00
- Earphones - GHS 50.00
- Power Bank - GHS 80.00

## Testing the System

### Test POS Transaction

1. Go to **POS** (`/pos`)
2. Search for "Coca Cola"
3. Click to add to cart
4. Adjust quantity if needed
5. Click **"Checkout"**
6. Select payment method (Wallet/Card/Mobile Money)
7. Confirm payment
8. Transaction will be processed with fraud detection

### Test Money Transfer

1. Go to **Send Money** (`/send-money`)
2. Choose recipient type (Mobile Money/Bank/Card)
3. Enter details and amount
4. Select funding source
5. Review and confirm
6. Check transaction history

### Test Analytics (Admin/Manager)

1. Go to **Analytics** (`/analytics`)
2. View revenue metrics
3. Check sales charts
4. See AI recommendations
5. Review top customers

## Common Issues & Solutions

### Issue: "Invalid login credentials"

**Solution**: 
- Make sure you created an account first
- Double-check your email and password
- Password must be at least 6 characters
- Try creating a new account if needed

### Issue: Can't see Analytics

**Solution**: 
- Only Admin and Manager roles can view analytics
- Check your role in the user dropdown (top right)
- If you're a cashier, upgrade your role to admin (see Step 3)

### Issue: No products showing in POS

**Solution**: 
- Products are stored in localStorage
- They should load automatically
- Try refreshing the page
- Check browser console for errors

### Issue: Fraud detection blocking transactions

**Solution**: 
- This is normal for unusual patterns
- The system learns from your behavior
- First transaction might be flagged
- Continue using, the system will adapt

## Next Steps

Once you're logged in:

1. **Explore the Wallet**: View your balance, link cards/mobile money
2. **Try the POS**: Process a few test sales
3. **Add Customers**: Create customer profiles for loyalty tracking
4. **View Transactions**: Check your transaction history
5. **Check Analytics**: See insights and recommendations (if admin/manager)

## Need Help?

- Check `/README.md` for full documentation
- See `/IMPLEMENTATION_GUIDE.md` for detailed features
- View `/ml_models/README.md` for ML model docs

## Security Note

⚠️ **Important**: 
- Use strong passwords in production
- Don't share your admin credentials
- The system includes fraud detection for security
- All transactions are logged and monitored

## Production Deployment

When ready for production:

1. Create strong admin credentials
2. Set up proper email notifications
3. Configure real payment gateways (Paystack/Flutterwave)
4. Deploy to production hosting
5. Set up SSL/HTTPS
6. Configure backup systems

---

**You're all set!** 🚀

Start using your FinTech Wallet POS System!
