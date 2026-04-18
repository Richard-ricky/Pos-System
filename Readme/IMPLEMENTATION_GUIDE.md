# FinTech Wallet & POS Implementation Guide

## System Overview

This is a complete fintech wallet and POS system with:
- User authentication with role-based access control
- Wallet management with mobile money and card integration
- Full-featured Point of Sale system
- Customer management with loyalty points
- Transaction tracking with fraud detection
- Analytics dashboard with AI-powered insights
- Python-based ML models for recommendations and fraud detection

## Technical Stack

### Frontend
- **React 18.3.1** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Radix UI** for components
- **Recharts** for analytics charts
- **Supabase JS** for authentication

### Backend
- **Deno** runtime (Supabase Edge Functions)
- **Hono** web framework
- **Supabase** for database and auth
- **KV Store** for data persistence

### Machine Learning
- **Python 3.11+**
- **NumPy, scikit-learn** for ML algorithms
- **Flask** for ML API service

## Quick Start

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Install Python ML dependencies
cd ml_models
pip install -r requirements.txt
cd ..
```

### 2. Create Demo Users

You can create users via the backend API or Supabase Dashboard:

```bash
# Using the signup endpoint
curl -X POST https://mzvnlzsbmkqwnvlziucd.supabase.co/functions/v1/make-server-45351b4f/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

**Demo Credentials:**
- Admin: `admin@pos.com` / `admin123`
- Manager: `manager@pos.com` / `manager123`
- Cashier: `cashier@pos.com` / `cashier123`

### 3. Run the Application

```bash
# Start the frontend
npm run dev
```

**Optional: Start ML API Service**
```bash
cd ml_models
python ml_api_service.py
```

### 4. Access the Application

Open your browser to `http://localhost:5173` (or the port shown in terminal)

## User Roles & Permissions

### Admin
- Full system access
- View analytics dashboard
- Manage products (create, update, delete)
- Manage customers
- View all transactions
- Access ML insights

### Manager
- View analytics dashboard
- Manage products (create, update)
- Manage customers
- View all transactions
- Access ML insights
- Cannot delete products

### Cashier
- Use POS system
- Create transactions
- View own wallet
- Link payment methods
- Send/receive money
- Cannot access analytics
- Cannot manage products

## Key Features Walkthrough

### 1. Wallet Management

**Location**: `/wallet` (Dashboard)

**Features**:
- View available balance and pending funds
- See linked cards and mobile money accounts
- Recent transactions
- Quick actions (Add Money, Send Money)

**Backend API**: 
- Wallet balance stored in KV as `walletBalance:{userId}`
- Fetched via local storage (can be migrated to backend)

### 2. Point of Sale (POS)

**Location**: `/pos`

**Features**:
- Product catalog with search
- Barcode support
- Shopping cart
- Quantity adjustment
- Multiple payment methods
- Real-time inventory updates
- Fraud detection on transactions

**Workflow**:
1. Search and add products to cart
2. Adjust quantities
3. Click "Checkout"
4. Select payment method (Wallet, Card, or Mobile Money)
5. Confirm payment
6. Transaction processed with fraud check
7. Inventory updated
8. Receipt generated

**Backend APIs**:
- `GET /products` - Fetch product catalog
- `POST /transactions` - Process POS sale
- Transaction includes fraud check automatically

### 3. Link Payment Methods

**Card Linking** (`/link-card`):
- Enter 16-digit card number
- Cardholder name
- Expiry date (MM/YY)
- CVV
- Select card type (Visa/Mastercard)
- Set as default (optional)

**Mobile Money Linking** (`/link-momo`):
- Select network (MTN, Vodafone, AirtelTigo)
- Enter phone number (10 digits)
- Account name
- Set as default (optional)

**Storage**: Stored in KV as `linkedCards:{userId}` and `linkedMoMo:{userId}`

### 4. Send Money

**Location**: `/send-money`

**Transfer Types**:
- To Mobile Money
- To Bank Account
- To Card

**Flow**:
1. Select recipient type (tabs)
2. Enter recipient details
3. Enter amount
4. Select funding source
5. Review transaction
6. Confirm
7. Processing with fraud check
8. Success/failure notification

**Fraud Detection**:
- Automatically analyzes transaction
- Checks user history
- Calculates risk score
- Flags suspicious transactions

### 5. Add Money to Wallet

**Location**: `/add-money`

**Sources**:
- Mobile Money (linked accounts)
- Card (linked cards)

**Flow**:
1. Enter amount or use quick amounts (+50, +100, etc.)
2. Select source (Mobile Money or Card)
3. Choose specific account/card
4. Authorize payment
5. Simulated processing
6. Balance updated

### 6. Transaction History

**Location**: `/transactions`

**Features**:
- Complete transaction history
- Advanced filters:
  - Search by description/reference
  - Type filter (POS, Send, Receive, Fund)
  - Payment method filter
  - Status filter
- Grouped by date
- Transaction details with status badges

### 7. Analytics Dashboard

**Location**: `/analytics` (Admin/Manager only)

**Metrics**:
- Total Revenue
- Total Transactions
- Average Transaction Value
- Total Customers

**Charts**:
- Sales Over Time (Line Chart)
- Top Products by Revenue (Bar Chart)
- Top Customers (List with spend details)

**AI Insights**:
- Promoted products (ML recommendations)
- Low stock alerts
- Customer segments

### 8. Customer Management

**Backend**: Customers stored as `customer:{customerId}`

**Fields**:
- Name
- Phone
- Email (optional)
- Address (optional)
- Loyalty Points (auto-calculated)
- Total Spent (auto-updated)
- Transaction Count (auto-updated)

**Loyalty Points**: Earned automatically (1 point per GHS 10 spent)

## Backend API Reference

### Authentication

**Sign Up**
```
POST /make-server-45351b4f/auth/signup
Body: {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'cashier';
}
```

**Get Profile**
```
GET /make-server-45351b4f/auth/profile
Headers: { Authorization: 'Bearer <token>' }
```

### Products

**List Products**
```
GET /make-server-45351b4f/products
Headers: { Authorization: 'Bearer <token>' }
```

**Create Product** (Admin/Manager)
```
POST /make-server-45351b4f/products
Body: {
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode?: string;
  cost?: number;
  supplier?: string;
}
```

**Update Product** (Admin/Manager)
```
PUT /make-server-45351b4f/products/:id
Body: { ...updates }
```

**Delete Product** (Admin only)
```
DELETE /make-server-45351b4f/products/:id
```

### Customers

**List Customers**
```
GET /make-server-45351b4f/customers
```

**Create Customer**
```
POST /make-server-45351b4f/customers
Body: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}
```

**Update Customer**
```
PUT /make-server-45351b4f/customers/:id
Body: { ...updates }
```

### Transactions

**Create Transaction**
```
POST /make-server-45351b4f/transactions
Body: {
  type: 'pos' | 'send' | 'receive' | 'fund';
  amount: number;
  method: 'wallet' | 'card' | 'momo';
  description: string;
  customerId?: string;
  items?: CartItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
}

Response includes fraud check:
{
  transaction: {...},
  fraudAlert: {
    message: string;
    riskScore: number;
    reasons: string[];
  } | null
}
```

**Get Transactions**
```
GET /make-server-45351b4f/transactions
```

### Analytics

**Dashboard** (Admin/Manager)
```
GET /make-server-45351b4f/analytics/dashboard
Response: {
  overview: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    totalCustomers: number;
    totalProducts: number;
  },
  salesByDate: { [date: string]: number },
  topProducts: { [productId: string]: { count: number, revenue: number } },
  topCustomers: Customer[]
}
```

**ML Recommendations**
```
GET /make-server-45351b4f/ml/recommendations
Response: {
  personalized: string[];
  promoted: string[];
  lowStock: string[];
}
```

**Generate Receipt**
```
POST /make-server-45351b4f/receipts/generate
Body: { transactionId: string }
```

## Machine Learning Integration

### Product Recommender

**Features Used**:
- Price tier (0-1 normalized)
- Stock level
- Sales velocity (units/day)
- Recency score
- Category
- Profit margin
- Trending factor

**Strategies**:
```python
# Clearance - clear overstocked items
score = stock * 0.4 + (1 - velocity) * 0.3 + margin * 0.2 + recency * 0.1

# Profit - maximize margin
score = margin * 0.5 + velocity * 0.3 + stock * 0.2

# Trending - promote fast-sellers
score = velocity * 0.4 + trending * 0.3 + recency * 0.3

# Balanced - weighted combination
score = price*0.15 + stock*0.15 + velocity*0.20 + recency*0.15 + category*0.05 + margin*0.20 + trending*0.10
```

**Functions**:
- `calculate_promotion_score()` - Score individual products
- `get_top_promotions()` - Get top N products to promote
- `collaborative_filtering()` - Personalized recommendations
- `segment_products()` - Categorize products
- `predict_demand()` - Forecast future demand
- `optimize_inventory()` - Recommend restock/reduce

### Fraud Detector

**Features Extracted** (10 features):
1. Amount (normalized by user average)
2. Time of day (0-23 hours, normalized)
3. Day of week (0-6, normalized)
4. Recent transaction count
5. Transaction velocity (per day)
6. Amount deviation (z-score)
7. Payment method consistency
8. Recipient pattern (known vs unknown)
9. Round number indicator
10. Rapid succession indicator

**Detection Methods**:
```python
# Anomaly Detection
- Calculate distance from historical patterns
- Mahalanobis-like distance metric

# Velocity Checks
- 1 minute: max 3 transactions
- 5 minutes: max 5 transactions
- 1 hour: max 15 transactions
- 24 hours: max 50 transactions

# Pattern Detection
- Test transaction pattern (small then large)
- Repetitive amounts
- Progressive increase
- Midnight transactions
- First-time large amounts
- Duplicates
```

**Risk Scoring** (0-100):
- Anomaly: 30 points
- Velocity: 30 points
- Patterns: 25 points
- Amount: 15 points

**Risk Levels**:
- **0-39**: LOW - Allow
- **40-59**: MEDIUM - Additional verification
- **60-79**: HIGH - Manual review
- **80-100**: CRITICAL - Block

### ML API Endpoints

If running Python ML service:

**Health Check**
```
GET http://localhost:5000/health
```

**Get Recommendations**
```
POST http://localhost:5000/ml/recommendations
Body: {
  products: Product[];
  user_id: string;
  user_transactions: Transaction[];
  strategy: 'balanced' | 'clearance' | 'profit' | 'trending';
}
```

**Fraud Check**
```
POST http://localhost:5000/ml/fraud-check
Body: {
  transaction: Transaction;
  user_history: Transaction[];
}
```

**User Profile**
```
POST http://localhost:5000/ml/user-profile
Body: {
  user_id: string;
  transactions: Transaction[];
}
```

**Demand Forecast**
```
POST http://localhost:5000/ml/demand-forecast
Body: {
  products: Product[];
  days_ahead: number;
}
```

## Data Flow

### Transaction Flow

```
1. User initiates transaction (POS, Send Money, etc.)
   ↓
2. Frontend validates inputs
   ↓
3. Call API: POST /transactions
   ↓
4. Backend authenticates user (JWT)
   ↓
5. Fetch user transaction history
   ↓
6. Run Fraud Detection ML
   - Extract 10 features
   - Calculate anomaly score
   - Check velocity
   - Detect patterns
   - Calculate risk score (0-100)
   ↓
7. If suspicious (score >= 70):
   - Set status to 'pending_review'
   - Return fraud alert
   ↓
8. Store transaction in KV
   ↓
9. Update customer (if applicable):
   - Increment totalSpent
   - Increment transactionCount
   - Add loyalty points (amount / 10)
   ↓
10. Return transaction + fraud alert to frontend
    ↓
11. Frontend shows result
    - Success: Green notification
    - Fraud alert: Yellow warning
    - Failure: Red error
```

### Product Recommendation Flow

```
1. User views Analytics Dashboard
   ↓
2. Frontend calls: GET /ml/recommendations
   ↓
3. Backend fetches all products
   ↓
4. Backend fetches user transactions
   ↓
5. Calculate product metrics:
   - Total sales
   - Total revenue
   - Average price
   - Purchase frequency
   - Last sold date
   - Stock level
   ↓
6. Calculate user behavior:
   - Total transactions
   - Average amount
   - Preferred methods
   - Categories
   ↓
7. Run ML algorithms:
   - Product scoring (7 features)
   - Collaborative filtering
   - Product segmentation
   - Low stock detection
   ↓
8. Return recommendations:
   - Personalized (top 10)
   - Promoted (top 10)
   - Low stock items
   ↓
9. Frontend displays in Analytics
```

## Common Tasks

### Add a New Product (Admin/Manager)

Currently products are initialized in `storage.ts`. To add products via UI:

1. Create product management screen
2. Call `POST /products` API
3. Include all required fields

**Example**:
```typescript
await createProduct({
  name: 'New Product',
  price: 25.00,
  cost: 15.00,
  category: 'Electronics',
  stock: 50,
  barcode: '123456789',
  supplier: 'Supplier Name'
});
```

### Process a POS Sale

1. Go to `/pos`
2. Search for products (by name or barcode)
3. Click products to add to cart
4. Adjust quantities with +/- buttons
5. Click "Checkout"
6. Select payment method
7. Confirm payment
8. Transaction processed

**Fraud Detection**: Automatic on every transaction

### View Analytics (Admin/Manager only)

1. Go to `/analytics`
2. View overview metrics
3. Check sales chart
4. See top products
5. Review AI recommendations
6. Check low stock alerts

### Create a Customer

Currently customers are created automatically during transactions. To manually create:

```typescript
await createCustomer({
  name: 'John Doe',
  phone: '0241234567',
  email: 'john@example.com',
  address: 'Accra, Ghana'
});
```

## Troubleshooting

### Authentication Issues

**Problem**: Can't log in
**Solution**: 
1. Check Supabase connection
2. Verify user exists in Supabase Auth
3. Check browser console for errors
4. Ensure correct credentials

### Fraud Alert on Normal Transaction

**Problem**: Legitimate transaction flagged
**Solution**: 
1. This is expected for unusual patterns
2. Risk score shown in transaction details
3. Admin can review flagged transactions
4. Adjust threshold in ML model if needed

### Analytics Not Loading

**Problem**: Analytics screen blank
**Solution**:
1. Check user role (must be Admin or Manager)
2. Check browser console for API errors
3. Verify transactions exist in database
4. Check Supabase connection

### ML API Not Working

**Problem**: ML features not working
**Solution**:
1. ML API is optional
2. TypeScript ML engine in `ml_engine.tsx` runs automatically
3. Python ML service is for advanced features
4. Check if Python service is running on port 5000

## Production Deployment

### Frontend

1. Build the app:
```bash
npm run build
```

2. Deploy to Vercel, Netlify, or any static host

### Backend (Supabase)

Already deployed! The Edge Functions are running on:
```
https://mzvnlzsbmkqwnvlziucd.supabase.co/functions/v1/make-server-45351b4f
```

### ML Service (Python)

For production Python ML API:

1. Use Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 ml_api_service:app
```

2. Or deploy to:
- Heroku
- AWS Lambda
- Google Cloud Run
- Railway.app

3. Update backend to call production ML API URL

## Security Considerations

1. **Authentication**: Supabase Auth with JWT
2. **Authorization**: Role-based access control in API
3. **Card Data**: Only last 4 digits stored
4. **Fraud Detection**: Real-time ML analysis
5. **API Keys**: Never expose service role key to frontend
6. **HTTPS**: Always use HTTPS in production

## Next Steps

1. **Add Product Management UI**: Screen for admins to manage products
2. **Customer Management UI**: Interface to view/edit customers
3. **Receipt Printing**: Browser print or PDF export
4. **Email Notifications**: Transaction receipts via email
5. **Real Payment Integration**: Paystack, Flutterwave
6. **SMS Notifications**: Mobile money approval via SMS
7. **Advanced Analytics**: More charts and insights
8. **Multi-store Support**: Multiple POS locations
9. **Inventory Alerts**: Email on low stock
10. **Data Export**: CSV/PDF reports

## Support & Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/mzvnlzsbmkqwnvlziucd
- **ML Models**: See `/ml_models/README.md`
- **API Docs**: This guide
- **Frontend Code**: `/src/app`
- **Backend Code**: `/supabase/functions/server`

---

**Built with React, Supabase, and Machine Learning** ✨
