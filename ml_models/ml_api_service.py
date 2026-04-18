"""
ML API Service
Flask-based API to serve ML model predictions
Can be called from the Deno backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from product_recommender import ProductRecommender
from fraud_detector import FraudDetector
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize ML models
product_recommender = ProductRecommender()
fraud_detector = FraudDetector()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models': ['product_recommender', 'fraud_detector'],
        'timestamp': datetime.now().isoformat()
    })


@app.route('/ml/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get product recommendations
    
    Request body:
    {
        "products": [...],
        "user_id": "user123",
        "user_transactions": [...],
        "strategy": "balanced" | "clearance" | "profit" | "trending"
    }
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        user_id = data.get('user_id')
        user_transactions = data.get('user_transactions', [])
        strategy = data.get('strategy', 'balanced')
        
        # Get top promotions
        promotions = product_recommender.get_top_promotions(
            products, 
            strategy=strategy, 
            limit=10
        )
        
        # Get collaborative filtering recommendations
        collab_recs = []
        if user_id and user_transactions:
            collab_recs = product_recommender.collaborative_filtering(
                user_id, 
                products, 
                user_transactions
            )
        
        # Segment products
        segments = product_recommender.segment_products(products)
        
        # Inventory recommendations
        inventory_recs = product_recommender.optimize_inventory(products)
        
        return jsonify({
            'success': True,
            'promotions': promotions,
            'collaborative_recommendations': [
                {'product_id': rec[0], 'score': rec[1]} 
                for rec in collab_recs[:10]
            ],
            'segments': {k: len(v) for k, v in segments.items()},
            'inventory_recommendations': inventory_recs,
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/ml/fraud-check', methods=['POST'])
def fraud_check():
    """
    Check transaction for fraud
    
    Request body:
    {
        "transaction": {...},
        "user_history": [...]
    }
    """
    try:
        data = request.get_json()
        transaction = data.get('transaction', {})
        user_history = data.get('user_history', [])
        
        # Calculate comprehensive risk score
        result = fraud_detector.calculate_comprehensive_risk_score(
            transaction, 
            user_history
        )
        
        return jsonify({
            'success': True,
            **result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/ml/user-profile', methods=['POST'])
def build_user_profile():
    """
    Build user behavioral profile
    
    Request body:
    {
        "user_id": "user123",
        "transactions": [...]
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        transactions = data.get('transactions', [])
        
        profile = fraud_detector.build_user_profile(user_id, transactions)
        
        return jsonify({
            'success': True,
            'profile': profile
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/ml/demand-forecast', methods=['POST'])
def demand_forecast():
    """
    Forecast product demand
    
    Request body:
    {
        "products": [...],
        "days_ahead": 7
    }
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        days_ahead = data.get('days_ahead', 7)
        
        forecasts = []
        for product in products:
            predicted_demand = product_recommender.predict_demand(
                product, 
                days_ahead
            )
            forecasts.append({
                'product_id': product.get('id'),
                'product_name': product.get('name'),
                'current_stock': product.get('stock', 0),
                'predicted_demand': predicted_demand,
                'days_ahead': days_ahead,
                'stock_sufficient': product.get('stock', 0) >= predicted_demand,
            })
        
        return jsonify({
            'success': True,
            'forecasts': forecasts
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/ml/batch-fraud-analysis', methods=['POST'])
def batch_fraud_analysis():
    """
    Analyze multiple transactions for fraud patterns
    
    Request body:
    {
        "transactions": [...],
        "user_history": [...]
    }
    """
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        user_history = data.get('user_history', [])
        
        results = []
        for transaction in transactions:
            result = fraud_detector.calculate_comprehensive_risk_score(
                transaction, 
                user_history
            )
            results.append({
                'transaction_id': transaction.get('id'),
                **result
            })
        
        # Summary statistics
        high_risk_count = sum(1 for r in results if r['riskLevel'] in ['HIGH', 'CRITICAL'])
        suspicious_count = sum(1 for r in results if r['suspicious'])
        avg_risk_score = sum(r['riskScore'] for r in results) / len(results) if results else 0
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total_analyzed': len(results),
                'high_risk_count': high_risk_count,
                'suspicious_count': suspicious_count,
                'average_risk_score': avg_risk_score,
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/ml/product-segments', methods=['POST'])
def get_product_segments():
    """
    Get product segmentation analysis
    
    Request body:
    {
        "products": [...]
    }
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        segments = product_recommender.segment_products(products)
        
        # Return with product details
        result = {}
        for segment_name, segment_products in segments.items():
            result[segment_name] = [
                {
                    'id': p.get('id'),
                    'name': p.get('name'),
                    'price': p.get('price'),
                    'stock': p.get('stock'),
                }
                for p in segment_products
            ]
        
        return jsonify({
            'success': True,
            'segments': result,
            'summary': {k: len(v) for k, v in result.items()}
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Run the Flask app
    # In production, use a proper WSGI server like Gunicorn
    app.run(host='0.0.0.0', port=5000, debug=True)
