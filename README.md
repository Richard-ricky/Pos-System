# FinTech Wallet & POS System

A comprehensive fintech wallet and point-of-sale (POS) system with integrated mobile money, card payments, fraud detection, and AI-powered recommendations.

## 🚀 Features

### Core Features

#### 1. **Wallet System**
- Digital wallet with balance management
- Transaction history
- Multiple funding sources (Mobile Money, Cards)
- Real-time balance updates

#### 2. **Point of Sale (POS)**
- Product catalog with search and barcode support
- Shopping cart management
- Multiple payment methods:
  - Wallet balance
  - Linked cards
  - Mobile money
- Inventory tracking
- Receipt generation
- Discount application
- Tax calculation

#### 3. **Mobile Money Integration**
- Support for major Ghanaian networks:
  - MTN Mobile Money
  - Vodafone Cash
  - AirtelTigo Money
- Account linking and verification
- Seamless transactions

#### 4. **Card Integration**
- Link debit/credit cards (Visa, Mastercard)
- Secure card storage (last 4 digits only)
- Default payment method selection
- Card verification

#### 5. **Money Transfers**
- Send to Mobile Money
- Send to Bank Account
- Send to Card
- Multi-step confirmation flow
- Real-time processing status

#### 6. **Customer Management**
- Customer profiles
- Purchase history
- Loyalty points system
- Customer segmentation
- Lifetime value tracking

#### 7. **User Authentication & Roles**
- Supabase authentication
- Role-based access control:
  - **Admin**: Full system access, analytics, product management
  - **Manager**: Analytics, product management, customer management
  - **Cashier**: POS operations, basic transactions
- Secure login/logout

#### 8. **Transaction Management**
- Complete transaction history
- Advanced filtering:
  - By type (POS, Send, Receive, Fund)
  - By payment method
  - By status
- Search functionality
- Transaction details with references

#### 9. **Analytics Dashboard** (Admin/Manager only)
- Revenue metrics
- Sales trends over time
- Top products by revenue
- Top customers
- Transaction statistics
- AI-powered insights

#### 10. **Fraud Detection (ML)**
- Real-time fraud analysis
- Risk scoring (0-100)
- Pattern detection:
  - Unusual amounts
  - High velocity transactions
  - Time-based anomalies
  - Duplicate detection
- Automated transaction flagging

#### 11. **Product Recommendations (ML)**
- AI-powered product promotions
- Multiple strategies:
  - Balanced
  - Clearance (overstock)
  - Profit-focused
  - Trending items
- Personalized recommendations
- Demand forecasting
- Inventory optimization

## 🏗️ Architecture

### Frontend
- **Framework**: React 18.3.1
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State Management**: React Context + Hooks
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Deno (Supabase Edge Functions)
- **Framework**: Hono
- **Database**: Supabase (PostgreSQL + KV Store)
- **Authentication**: Supabase Auth
- **API**: RESTful

### Machine Learning
- **Language**: Python 3.11+
- **Framework**: Flask (API Service)
- **Libraries**: NumPy, scikit-learn, pandas
- **Models**:
  - Product Recommender (Collaborative Filtering)
  - Fraud Detector (Anomaly Detection)

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── wallet/         # Wallet dashboard
│   │   │   ├── pos/            # Point of Sale
│   │   │   ├── transactions/   # Transaction history
│   │   │   ├── accounts/       # Linked accounts management
│   │   │   ├── transfers/      # Money transfer flows
│   │   │   ├── funding/        # Wallet funding
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   ├── layouts/        # Layout components
│   │   │   └── ui/             # Reusable UI components
│   │   ├── contexts/           # React contexts (Auth)
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   │   ├── storage.ts      # LocalStorage utilities
│   │   │   └── api.ts          # API client
│   │   ├── App.tsx
│   │   └── routes.ts
│   └── styles/                 # Global styles
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx       # Main API server
│           ├── kv_store.tsx    # Key-value database utilities
│           └── ml_engine.tsx   # ML engine (TypeScript)
│
├── ml_models/                  # Python ML models
│   ├── product_recommender.py  # Product recommendation ML
│   ├── fraud_detector.py       # Fraud detection ML
│   ├── ml_api_service.py       # Flask API service
│   ├── requirements.txt
│   └── README.md
│
├── utils/
│   └── supabase/
│       └── info.tsx            # Supabase credentials
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Python ML Dependencies
```bash
cd ml_models
pip install -r requirements.txt
```

### 3. Configure Supabase

The Supabase project is already configured with:
- Project ID: `mzvnlzsbmkqwnvlziucd`
- Public Anon Key: (see `/utils/supabase/info.tsx`)

### 4. Create Demo Users (via Supabase)

Use the signup endpoint or Supabase Dashboard to create users:

```bash
# Admin
POST /make-server-45351b4f/auth/signup
{
  "email": "admin@pos.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "admin"
}

# Manager
{
  "email": "manager@pos.com",
  "password": "manager123",
  "name": "Manager User",
  "role": "manager"
}

# Cashier
{
  "email": "cashier@pos.com",
  "password": "cashier123",
  "name": "Cashier User",
  "role": "cashier"
}
```

### 5. Run the Application

#### Start Frontend
```bash
npm run dev
```

#### Start ML API Service (Optional)
```bash
cd ml_models
python ml_api_service.py
```

The ML service will run on `http://localhost:5000`

## 📊 Database Schema

### KV Store Tables

The system uses Supabase's KV store (`kv_store_45351b4f`) with prefixed keys:

- `user:{userId}` - User profiles
- `product:{productId}` - Product catalog
- `customer:{customerId}` - Customer records
- `transaction:{userId}:{timestamp}` - Transactions
- `receipt:{receiptId}` - Generated receipts

### Example Data Structures

#### User Profile
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  createdAt: string;
}
```

#### Product
```typescript
{
  id: string;
  name: string;
  price: number;
  cost?: number;
  category: string;
  stock: number;
  barcode?: string;
  supplier?: string;
  totalSales?: number;
  totalRevenue?: number;
}
```

#### Customer
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  transactionCount: number;
  createdAt: string;
}
```

#### Transaction
```typescript
{
  id: string;
  type: 'pos' | 'send' | 'receive' | 'fund';
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'pending_review';
  method: 'wallet' | 'card' | 'momo';
  description: string;
  customerId?: string;
  items?: CartItem[];
  fraudCheck?: FraudCheckResult;
  timestamp: string;
}
```

## 🔒 Security Features

1. **Authentication**: Supabase Auth with JWT tokens
2. **Role-Based Access Control**: Granular permissions
3. **Fraud Detection**: Real-time ML-powered analysis
4. **Secure Card Storage**: Only last 4 digits stored
5. **Transaction Verification**: Multi-step confirmation
6. **API Authorization**: Bearer token validation

## 🤖 Machine Learning Models

### 1. Product Recommender

**Features Extracted** (per product):
- Price tier (normalized)
- Stock level
- Sales velocity
- Recency score
- Category encoding
- Profit margin
- Trending factor

**Strategies**:
- **Balanced**: Weighted combination
- **Clearance**: High stock, low velocity
- **Profit**: High margin focus
- **Trending**: Fast-selling items

**Functions**:
- Collaborative filtering
- Product segmentation
- Demand forecasting
- Inventory optimization

### 2. Fraud Detector

**Features Extracted** (per transaction):
- Amount (normalized)
- Time of day
- Day of week
- Transaction frequency
- Velocity metrics
- Amount deviation
- Method consistency
- Recipient patterns
- Round number detection
- Rapid succession

**Detection Methods**:
- Anomaly scoring
- Velocity checks (multiple time windows)
- Pattern recognition
- User profiling

**Risk Levels**:
- **LOW** (0-39): Allow
- **MEDIUM** (40-59): Additional verification
- **HIGH** (60-79): Manual review
- **CRITICAL** (80-100): Block

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `GET /auth/profile` - Get user profile

### Products
- `GET /products` - List all products
- `POST /products` - Create product (Admin/Manager)
- `PUT /products/:id` - Update product (Admin/Manager)
- `DELETE /products/:id` - Delete product (Admin only)

### Customers
- `GET /customers` - List all customers
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer

### Transactions
- `POST /transactions` - Create transaction (with fraud check)
- `GET /transactions` - Get user transactions

### Analytics
- `GET /analytics/dashboard` - Get analytics (Admin/Manager)
- `GET /ml/recommendations` - Get AI recommendations

### Receipts
- `POST /receipts/generate` - Generate receipt

## 🎨 UI/UX Features

- **Dark Theme**: Professional dark mode
- **Responsive Design**: Mobile and desktop support
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Toasts**: Real-time notifications (Sonner)
- **Animations**: Smooth transitions
- **Icons**: Lucide React icons
- **Charts**: Interactive data visualization

## 🚦 Getting Started

1. **Login** with demo credentials
2. **Explore Wallet**: View balance, linked accounts
3. **Try POS**: Add products to cart, checkout
4. **Link Accounts**: Add cards or mobile money
5. **Send Money**: Transfer funds
6. **View Analytics** (Admin/Manager): Check insights
7. **Check Transactions**: Filter and search

## 🔄 Data Flow

```
User Action
    ↓
Frontend (React)
    ↓
Supabase Auth (JWT)
    ↓
API Server (Hono/Deno)
    ↓
ML Engine (Fraud/Recommendations)
    ↓
KV Store (Supabase)
    ↓
Response to Frontend
    ↓
UI Update
```

## 🧪 Testing

### Test Fraud Detection
```bash
cd ml_models
python fraud_detector.py
```

### Test Product Recommender
```bash
cd ml_models
python product_recommender.py
```

### Test API
```bash
curl http://localhost:5000/health
```

## 📈 Future Enhancements

- [ ] Real payment gateway integration (Paystack, Flutterwave)
- [ ] SMS notifications for transactions
- [ ] QR code payments
- [ ] Multi-currency support
- [ ] Advanced analytics with more charts
- [ ] Export reports (PDF, CSV)
- [ ] Customer mobile app
- [ ] Inventory alerts via email
- [ ] Batch operations
- [ ] Receipt printing
- [ ] Barcode scanner integration
- [ ] Multi-store support
- [ ] Advanced ML models (Neural Networks)

## 📝 License

MIT License

## 👥 Contributors

Built for fintech and POS student projects.

## 📞 Support

For issues or questions, please check the documentation in:
- `/ml_models/README.md` - ML models documentation
- Supabase Dashboard - Database management

---

**Built with ❤️ using React, Supabase, and Machine Learning**
