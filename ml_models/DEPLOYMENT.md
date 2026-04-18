# ML Models Deployment Guide

## Overview

This directory contains Python-based Machine Learning models for:
1. **Product Recommendations & Promotions**
2. **Fraud Detection & Risk Scoring**

These models can run standalone or via the Flask API service.

## Local Development

### 1. Install Dependencies

```bash
cd ml_models
pip install -r requirements.txt
```

### 2. Test Models Directly

```bash
# Test Product Recommender
python product_recommender.py

# Test Fraud Detector
python fraud_detector.py
```

### 3. Run API Service

```bash
python ml_api_service.py
```

The service will start on `http://localhost:5000`

### 4. Test API

```bash
# Health check
curl http://localhost:5000/health

# Test fraud detection
curl -X POST http://localhost:5000/ml/fraud-check \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "amount": 5000,
      "method": "card",
      "timestamp": "2024-03-22T10:00:00Z",
      "recipient": "Unknown"
    },
    "user_history": []
  }'
```

## Production Deployment Options

### Option 1: Heroku

1. Create `Procfile`:
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT ml_api_service:app
```

2. Create `runtime.txt`:
```
python-3.11.0
```

3. Deploy:
```bash
heroku create your-ml-service
git push heroku main
```

### Option 2: Google Cloud Run

1. Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 ml_api_service:app
```

2. Build and deploy:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/ml-service
gcloud run deploy ml-service --image gcr.io/PROJECT_ID/ml-service --platform managed
```

### Option 3: AWS Lambda (Serverless)

Use AWS Lambda + API Gateway with Zappa or Serverless Framework.

1. Install Zappa:
```bash
pip install zappa
```

2. Initialize:
```bash
zappa init
```

3. Deploy:
```bash
zappa deploy production
```

### Option 4: Railway.app

1. Create account at railway.app
2. Connect GitHub repo
3. Railway auto-detects Python and deploys
4. Set environment variables if needed

### Option 5: DigitalOcean App Platform

1. Create App Platform app
2. Connect GitHub repo
3. DigitalOcean auto-builds and deploys
4. Configure `gunicorn` as run command

## Integration with Backend

### Update Backend to Call ML Service

In `/supabase/functions/server/index.tsx`, add ML API calls:

```typescript
// In transaction endpoint, after fraud check
const mlResponse = await fetch('https://your-ml-service.com/ml/fraud-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transaction: transactionData,
    user_history: userTransactions
  })
});

const mlResult = await mlResponse.json();
// Use mlResult.riskScore, mlResult.suspicious, etc.
```

### For Recommendations

```typescript
const mlResponse = await fetch('https://your-ml-service.com/ml/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    products: productMetrics,
    user_id: userId,
    user_transactions: userTransactions,
    strategy: 'balanced'
  })
});

const recommendations = await mlResponse.json();
```

## Performance Optimization

### 1. Caching

Implement caching for frequently accessed data:

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_profile(user_id):
    # Expensive computation
    return profile
```

### 2. Batch Processing

Process multiple transactions in one API call:

```python
@app.route('/ml/batch-fraud-analysis', methods=['POST'])
def batch_fraud_analysis():
    data = request.get_json()
    transactions = data.get('transactions', [])
    
    # Process all at once
    results = [fraud_detector.calculate_comprehensive_risk_score(t, history) 
               for t in transactions]
    
    return jsonify({'results': results})
```

### 3. Async Processing

For long-running tasks, use Celery or similar:

```python
from celery import Celery

celery = Celery('ml_tasks', broker='redis://localhost:6379')

@celery.task
def analyze_fraud_async(transaction_id, transaction_data, history):
    result = fraud_detector.calculate_comprehensive_risk_score(
        transaction_data, history
    )
    # Store result in database
    return result
```

## Monitoring & Logging

### 1. Add Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.route('/ml/fraud-check', methods=['POST'])
def fraud_check():
    logger.info('Fraud check requested')
    try:
        # ... processing
        logger.info(f'Fraud check completed: risk_score={result["riskScore"]}')
        return jsonify(result)
    except Exception as e:
        logger.error(f'Fraud check failed: {str(e)}')
        return jsonify({'error': str(e)}), 500
```

### 2. Metrics

Use Prometheus or similar:

```python
from prometheus_client import Counter, Histogram

fraud_checks = Counter('fraud_checks_total', 'Total fraud checks')
fraud_check_duration = Histogram('fraud_check_duration_seconds', 'Fraud check duration')

@app.route('/ml/fraud-check', methods=['POST'])
@fraud_check_duration.time()
def fraud_check():
    fraud_checks.inc()
    # ... processing
```

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```bash
# Using Gunicorn with multiple workers
gunicorn -w 4 -b 0.0.0.0:5000 ml_api_service:app

# Each worker can handle multiple requests
```

### Vertical Scaling

Increase resources (CPU, RAM) for better performance with complex models.

### Model Optimization

For better performance:

1. **Use NumPy vectorization** instead of loops
2. **Pre-compute** frequently used values
3. **Cache** user profiles and product metrics
4. **Batch** similar requests together

## Advanced ML Features

### 1. Model Persistence

Save trained models to disk:

```python
import pickle

# Save model
with open('fraud_model.pkl', 'wb') as f:
    pickle.dump(fraud_detector, f)

# Load model
with open('fraud_model.pkl', 'rb') as f:
    fraud_detector = pickle.load(f)
```

### 2. Retraining

Periodically retrain models with new data:

```python
def retrain_fraud_model():
    # Fetch recent transactions
    transactions = fetch_all_transactions()
    
    # Extract features
    features = [extract_features(t) for t in transactions]
    labels = [t.is_fraud for t in transactions]
    
    # Train model (example with scikit-learn)
    from sklearn.ensemble import RandomForestClassifier
    model = RandomForestClassifier()
    model.fit(features, labels)
    
    # Save model
    save_model(model)
```

### 3. A/B Testing

Test different ML strategies:

```python
import random

@app.route('/ml/recommendations', methods=['POST'])
def get_recommendations():
    # Randomly assign strategy for A/B testing
    strategy = random.choice(['balanced', 'profit', 'clearance'])
    
    # Log which strategy was used
    logger.info(f'Strategy: {strategy}')
    
    # Get recommendations
    recommendations = recommender.get_top_promotions(products, strategy)
    
    return jsonify({'recommendations': recommendations, 'strategy': strategy})
```

## Security

### 1. API Authentication

Add API key authentication:

```python
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != os.environ.get('ML_API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/ml/fraud-check', methods=['POST'])
@require_api_key
def fraud_check():
    # ... protected endpoint
```

### 2. Rate Limiting

Prevent abuse:

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.headers.get('X-API-Key'),
    default_limits=["100 per hour"]
)

@app.route('/ml/fraud-check', methods=['POST'])
@limiter.limit("20 per minute")
def fraud_check():
    # ... rate limited
```

### 3. Input Validation

Always validate inputs:

```python
from marshmallow import Schema, fields, ValidationError

class FraudCheckSchema(Schema):
    transaction = fields.Dict(required=True)
    user_history = fields.List(fields.Dict(), required=True)

@app.route('/ml/fraud-check', methods=['POST'])
def fraud_check():
    schema = FraudCheckSchema()
    try:
        data = schema.load(request.get_json())
    except ValidationError as e:
        return jsonify({'error': e.messages}), 400
    
    # ... process validated data
```

## Cost Optimization

### 1. Lazy Loading

Only load models when needed:

```python
_fraud_detector = None

def get_fraud_detector():
    global _fraud_detector
    if _fraud_detector is None:
        _fraud_detector = FraudDetector()
    return _fraud_detector
```

### 2. Request Batching

Batch multiple requests:

```python
# Instead of 10 separate API calls, batch them
requests = [req1, req2, ..., req10]
response = ml_api.batch_process(requests)
```

### 3. Caching Results

Cache expensive computations:

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379)

def cached_fraud_check(transaction_id, transaction, history):
    # Check cache
    cached = redis_client.get(f'fraud:{transaction_id}')
    if cached:
        return json.loads(cached)
    
    # Compute
    result = fraud_detector.calculate_comprehensive_risk_score(transaction, history)
    
    # Cache for 1 hour
    redis_client.setex(f'fraud:{transaction_id}', 3600, json.dumps(result))
    
    return result
```

## Troubleshooting

### Issue: Import Errors

**Solution**: Ensure all dependencies installed
```bash
pip install -r requirements.txt
```

### Issue: Port Already in Use

**Solution**: Change port or kill existing process
```bash
# Change port
python ml_api_service.py --port 5001

# Or kill process using port 5000
lsof -ti:5000 | xargs kill
```

### Issue: Slow Response Times

**Solutions**:
1. Add caching
2. Use batch processing
3. Optimize ML algorithms
4. Scale horizontally (more workers)

### Issue: High Memory Usage

**Solutions**:
1. Use generators instead of lists
2. Clear cached data periodically
3. Reduce batch sizes
4. Use more workers with less memory each

## Testing

### Unit Tests

```python
import unittest

class TestFraudDetector(unittest.TestCase):
    def setUp(self):
        self.detector = FraudDetector()
    
    def test_normal_transaction(self):
        transaction = {...}
        history = [...]
        result = self.detector.calculate_comprehensive_risk_score(
            transaction, history
        )
        self.assertLess(result['riskScore'], 50)
    
    def test_suspicious_transaction(self):
        transaction = {'amount': 10000, ...}
        history = [{'amount': 50, ...}]
        result = self.detector.calculate_comprehensive_risk_score(
            transaction, history
        )
        self.assertGreater(result['riskScore'], 70)

if __name__ == '__main__':
    unittest.main()
```

### API Tests

```python
import requests

def test_fraud_check_api():
    response = requests.post('http://localhost:5000/ml/fraud-check', json={
        'transaction': {...},
        'user_history': [...]
    })
    
    assert response.status_code == 200
    data = response.json()
    assert 'riskScore' in data
    assert 0 <= data['riskScore'] <= 100
```

## Conclusion

The ML models are production-ready and can be deployed using any of the options above. Choose based on:

- **Budget**: Railway/Heroku (easiest), AWS Lambda (pay-per-use)
- **Scale**: Google Cloud Run, AWS ECS (high scale)
- **Simplicity**: Railway, Heroku (minimal config)
- **Control**: DigitalOcean, AWS EC2 (full control)

For most use cases, **Railway.app** or **Google Cloud Run** provide the best balance of simplicity, cost, and performance.
