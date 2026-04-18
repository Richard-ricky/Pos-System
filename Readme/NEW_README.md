# FinTech Wallet POS System 🚀

A professional, production-ready Point of Sale (POS) and wallet management system built with React, TypeScript, Supabase, and Paystack payment integration.

## 🌟 Features

### 💳 Payment Integration
- **Paystack Integration**: Secure card and mobile money payments
- **Multiple Payment Methods**: Wallet, Card (Visa/Mastercard), Mobile Money (MTN, Vodafone, AirtelTigo)
- **Real-time Payment Processing**: Instant transaction confirmations
- **Payment Verification**: Secure backend verification

### 🏪 Point of Sale (POS)
- **Modern POS Interface**: Professional, intuitive design
- **Product Management**: Full CRUD operations for products
- **Inventory Tracking**: Real-time stock updates
- **Barcode Support**: Quick product scanning
- **Cart Management**: Add, remove, and adjust quantities
- **Customer Management**: Track customer purchases and loyalty points
- **Discount System**: Apply discounts and loyalty rewards
- **Receipt Generation**: Digital receipts for all transactions

### 💰 Wallet Management
- **Multi-currency Wallet**: GHS (Ghana Cedis) support
- **Balance Visibility Toggle**: Show/hide balance for privacy
- **Fund Wallet**: Add money via card or mobile money
- **Send Money**: Transfer to other users
- **Transaction History**: Complete transaction tracking
- **Pending Transactions**: Track pending payments

### 📊 Analytics & Reporting
- **Real-time Dashboard**: Beautiful, data-rich dashboard
- **Sales Analytics**: Track revenue, transactions, and trends
- **Product Performance**: Top-selling products and categories
- **Customer Insights**: Customer spending and loyalty metrics
- **Date-based Reporting**: Filter by date ranges

### 🔐 Security & Authentication
- **Supabase Auth**: Secure authentication system
- **Role-based Access**: Admin, Manager, Cashier roles
- **Session Management**: Persistent login sessions
- **Protected Routes**: Secure API endpoints

### 🎨 Design & UX
- **Professional UI**: Inspired by top fintech platforms
- **Dark Theme**: Modern, eye-friendly design
- **Responsive Layout**: Works on all devices
- **Smooth Animations**: Motion animations for better UX
- **Real-time Updates**: Live data synchronization

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Paystack
- **State Management**: React Context API
- **Routing**: React Router v7
- **UI Components**: Radix UI + Custom Components
- **Animations**: Motion (Framer Motion)

### New Architecture Highlights
- **Direct Database Access**: No edge functions for core operations
- **Simplified Data Layer**: Direct Supabase client integration
- **Payment Gateway Integration**: Paystack for secure payments
- **Optimized Performance**: Reduced API calls and faster responses
- **Better Error Handling**: Comprehensive error management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Paystack account (test keys available)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd fintech-wallet-pos
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

> **Note**: For production, replace with your live Paystack key: `pk_live_xxxxxxxxxxxxx`

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### First Time Setup

1. **Create an Account**
   - Click "Create New Account" on the login screen
   - Enter your name, email, and password
   - Submit to create your account

2. **Login**
   - Use your email and password to sign in
   - Your account will be created with "Cashier" role by default

3. **Sample Data**
   - On first POS visit, sample products will be automatically loaded
   - You can add more products or modify existing ones

### Making a Sale

1. **Navigate to POS**
   - Click "POS" in the sidebar or "New Sale" on dashboard

2. **Add Products to Cart**
   - Search for products by name, category, or barcode
   - Click on a product to add it to cart
   - Adjust quantities using +/- buttons

3. **Select Customer (Optional)**
   - Click "Select Customer" to link a customer
   - Apply loyalty discounts for eligible customers

4. **Process Payment**
   - Click "Proceed to Payment"
   - Choose payment method:
     - **Wallet**: Pay from your wallet balance
     - **Card**: Pay with Visa/Mastercard via Paystack
     - **Mobile Money**: Pay with MTN, Vodafone, or AirtelTigo
   - Complete payment

5. **Transaction Complete**
   - Receipt is generated automatically
   - Stock is updated in real-time
   - Transaction appears in history

### Managing Your Wallet

#### Add Money
1. Go to "Add Money" from dashboard or sidebar
2. Enter amount
3. Select payment method (Card or Mobile Money)
4. Complete payment via Paystack
5. Balance updates instantly

#### Send Money
1. Go to "Send Money"
2. Enter recipient details and amount
3. Confirm transaction
4. Money is transferred from your wallet

### Viewing Analytics

1. Navigate to "Analytics" from sidebar
2. View:
   - Total revenue and transactions
   - Sales trends by date
   - Top-selling products
   - Customer spending patterns
3. Filter by date range
4. Export reports (coming soon)

## 🔧 Configuration

### Paystack Setup

1. **Get API Keys**
   - Sign up at [Paystack](https://paystack.com)
   - Navigate to Settings > API Keys
   - Copy your Public Key

2. **Test Mode**
   - Use test keys (pk_test_xxx) for development
   - Test cards available in Paystack documentation

3. **Live Mode**
   - Complete business verification on Paystack
   - Use live keys (pk_live_xxx) for production
   - Update `.env` file with live key

### Supported Networks (Mobile Money)
- MTN Mobile Money
- Vodafone Cash
- AirtelTigo Money

## 🎯 User Roles

### Cashier (Default)
- Make sales via POS
- View own transactions
- Manage cart and checkout
- View product inventory

### Manager
- All cashier permissions
- Create/edit products
- View all transactions
- Access analytics
- Manage customers

### Admin
- All manager permissions
- Delete products
- Manage users and roles
- System configuration
- Full analytics access

## 📊 Database Schema

The system uses Supabase's KV store (`kv_store_45351b4f` table) with the following key patterns:

- `user:{userId}` - User profiles
- `product:{productId}` - Product data
- `customer:{customerId}` - Customer data
- `transaction:{userId}:{transactionId}` - Transactions
- `wallet:{userId}` - Wallet balances

## 🔐 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control
- **Payment Security**: PCI-compliant via Paystack
- **Data Encryption**: All data encrypted at rest
- **Session Management**: Secure session handling
- **Input Validation**: Client and server-side validation

## 🐛 Troubleshooting

### Payment Issues

**Paystack not loading**
- Check internet connection
- Verify public key in `.env`
- Check browser console for errors
- Ensure Paystack script is loaded

**Payment fails**
- For test mode, use Paystack test cards
- Check card details are correct
- Verify sufficient balance
- Check Paystack dashboard for logs

### Login Issues

**Can't log in**
- Verify email and password
- Check Supabase connection
- Clear browser cache
- Try incognito mode

**Account not found**
- Create a new account
- Check email spelling
- Contact support

### Database Issues

**Data not loading**
- Check Supabase connection
- Verify API keys
- Check browser console
- Refresh the page

**Transactions not saving**
- Check internet connection
- Verify database permissions
- Check console for errors
- Try again

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Build the project: `npm run build`
2. Deploy `dist` folder to Netlify
3. Add environment variables
4. Configure redirects for SPA

## 📝 API Integration

### Paystack Webhook (Optional)

For production, set up Paystack webhooks:

1. Go to Paystack Dashboard > Settings > Webhooks
2. Add your webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Copy webhook secret
4. Implement webhook handler on your backend

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

## 🎉 Acknowledgments

- Paystack for payment processing
- Supabase for backend infrastructure
- Radix UI for component primitives
- Tailwind CSS for styling
- Motion for animations

---

**Built with ❤️ for the African fintech ecosystem**
