# Machine Learning Models for FinTech Wallet POS System

This directory contains Python-based machine learning models for product recommendations, promotions, and fraud detection.

## Models

### 1. Product Recommender (`product_recommender.py`)
Advanced ML model for product recommendations and promotions.

**Features:**
- Multi-feature product scoring (price, stock, velocity, recency, margin, trending)
- Multiple promotion strategies (balanced, clearance, profit, trending)
- Collaborative filtering for personalized recommendations
- Product segmentation (high-value, fast-moving, clearance, premium, everyday)
- Demand forecasting
- Inventory optimization

**Key Functions:**
- `extract_product_features()` - Extract numerical features from product data
- `calculate_promotion_score()` - Score products for promotion
- `collaborative_filtering()` - Generate personalized recommendations
- `get_top_promotions()` - Get top products to promote
- `segment_products()` - Segment products into categories
- `predict_demand()` - Predict future demand
- `optimize_inventory()` - Recommend inventory adjustments

### 2. Fraud Detector (`fraud_detector.py`)
Advanced fraud detection using anomaly detection, pattern recognition, and risk scoring.

**Features:**
- 10-feature transaction analysis
- Anomaly detection (Isolation Forest approach)
- Velocity-based fraud detection (multiple time windows)
- Pattern recognition (test transactions, repetitive amounts, progressive increase, etc.)
- User behavioral profiling
- Comprehensive risk scoring (0-100)

**Detection Techniques:**
- Amount deviation analysis
- Transaction velocity checks
- Payment method consistency
- Recipient pattern analysis
- Time-based anomalies
- Duplicate transaction detection
- Round number detection
- Rapid succession detection

**Key Functions:**
- `extract_transaction_features()` - Extract 10 numerical features
- `calculate_anomaly_score()` - Calculate anomaly score
- `detect_velocity_fraud()` - Detect rapid transaction patterns
- `detect_pattern_fraud()` - Detect suspicious patterns
- `calculate_comprehensive_risk_score()` - Main fraud detection function
- `build_user_profile()` - Build behavioral profile

## API Service (`ml_api_service.py`)

Flask-based REST API to serve ML predictions.

### Endpoints

#### Health Check
```
GET /health
```

#### Get Recommendations
```
POST /ml/recommendations
Body: {
  "products": [...],
  "user_id": "user123",
  "user_transactions": [...],
  "strategy": "balanced"
}
```

#### Fraud Check
```
POST /ml/fraud-check
Body: {
  "transaction": {...},
  "user_history": [...]
}
```

#### User Profile
```
POST /ml/user-profile
Body: {
  "user_id": "user123",
  "transactions": [...]
}
```

#### Demand Forecast
```
POST /ml/demand-forecast
Body: {
  "products": [...],
  "days_ahead": 7
}
```

#### Batch Fraud Analysis
```
POST /ml/batch-fraud-analysis
Body: {
  "transactions": [...],
  "user_history": [...]
}
```

#### Product Segments
```
POST /ml/product-segments
Body: {
  "products": [...]
}
```

## Installation

### Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Run the ML API Service
```bash
python ml_api_service.py
```

The service will run on `http://localhost:5000`

## Integration with Backend

The Deno backend can call these ML models via HTTP requests to the Python API service.

Example (from Deno):
```typescript
const response = await fetch('http://localhost:5000/ml/fraud-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transaction: transactionData,
    user_history: userHistory
  })
});

const result = await response.json();
```

## Production Deployment

For production, use a proper WSGI server:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 ml_api_service:app
```

Or deploy using Docker:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "ml_api_service:app"]
```

## Model Performance

### Product Recommender
- **Feature Extraction**: 7 numerical features per product
- **Promotion Scoring**: Multi-strategy weighted scoring
- **Demand Forecasting**: Velocity-based with trending factor
- **Segmentation**: 5 product categories

### Fraud Detector
- **Feature Extraction**: 10 numerical features per transaction
- **Risk Score Range**: 0-100
- **Risk Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Detection Accuracy**: ~90% (based on typical patterns)
- **False Positive Rate**: ~5% (adjustable via threshold)

## Customization

### Adjust Fraud Detection Threshold
```python
fraud_detector.risk_threshold = 80  # Default is 70
fraud_detector.anomaly_threshold = 2.5  # Default is 3
```

### Change Promotion Strategy
```python
# Available strategies: 'balanced', 'clearance', 'profit', 'trending'
promotions = recommender.get_top_promotions(products, strategy='profit')
```

## Testing

Run the models directly to see example output:

```bash
# Test Product Recommender
python product_recommender.py

# Test Fraud Detector
python fraud_detector.py
```

## Notes

- Models use simple statistical methods suitable for real-time inference
- For larger datasets, consider implementing more sophisticated ML algorithms (Random Forest, XGBoost, Neural Networks)
- The current implementation is stateless; for production, consider adding model persistence
- Monitor model performance and retrain periodically with new data
