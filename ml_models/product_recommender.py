"""
Product Recommendation and Promotion ML Model
Uses collaborative filtering, feature engineering, and clustering
to recommend and promote products based on various features
"""

import numpy as np
import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict


class ProductRecommender:
    """
    Advanced ML model for product recommendations and promotions
    """
    
    def __init__(self):
        self.product_features = {}
        self.user_preferences = {}
        self.interaction_matrix = defaultdict(lambda: defaultdict(float))
        
    def extract_product_features(self, product: Dict) -> np.ndarray:
        """
        Extract numerical features from product data
        
        Features:
        - Price tier (normalized)
        - Stock level (normalized)
        - Sales velocity
        - Recency score
        - Category encoding
        - Margin score
        - Seasonality score
        """
        features = []
        
        # Price tier (0-1 normalized)
        price = product.get('price', 0)
        features.append(min(price / 1000, 1.0))
        
        # Stock level (0-1 normalized)
        stock = product.get('stock', 0)
        features.append(min(stock / 100, 1.0))
        
        # Sales velocity (units per day)
        total_sales = product.get('totalSales', 0)
        days_active = max((datetime.now() - datetime.fromisoformat(
            product.get('createdAt', datetime.now().isoformat())
        )).days, 1)
        velocity = total_sales / days_active
        features.append(min(velocity / 10, 1.0))
        
        # Recency score (how recently sold)
        last_sold = product.get('lastSold', datetime.now().isoformat())
        days_since_sale = (datetime.now() - datetime.fromisoformat(last_sold)).days
        recency = max(0, 1 - (days_since_sale / 30))
        features.append(recency)
        
        # Category one-hot encoding (simplified to category hash)
        category = product.get('category', 'general')
        category_score = hash(category) % 100 / 100
        features.append(category_score)
        
        # Profit margin (if available)
        cost = product.get('cost', price * 0.6)
        margin = (price - cost) / price if price > 0 else 0.3
        features.append(margin)
        
        # Seasonality/trending score
        recent_sales = product.get('recentSales', 0)
        trending = min(recent_sales / max(total_sales, 1), 1.0)
        features.append(trending)
        
        return np.array(features)
    
    def calculate_promotion_score(self, product: Dict, 
                                 strategy: str = 'balanced') -> float:
        """
        Calculate promotion score based on multiple strategies
        
        Strategies:
        - clearance: Focus on overstocked, slow-moving items
        - profit: Focus on high-margin items
        - trending: Focus on fast-selling items
        - balanced: Weighted combination
        """
        features = self.extract_product_features(product)
        
        if strategy == 'clearance':
            # High stock, low velocity, good margin
            score = (
                features[1] * 0.4 +  # Stock level
                (1 - features[2]) * 0.3 +  # Low velocity
                features[5] * 0.2 +  # Margin
                features[3] * 0.1   # Recent activity
            )
        
        elif strategy == 'profit':
            # High margin, good velocity, adequate stock
            score = (
                features[5] * 0.5 +  # Margin
                features[2] * 0.3 +  # Velocity
                features[1] * 0.2   # Stock
            )
        
        elif strategy == 'trending':
            # High velocity, recent sales, good recency
            score = (
                features[2] * 0.4 +  # Velocity
                features[6] * 0.3 +  # Trending
                features[3] * 0.3   # Recency
            )
        
        else:  # balanced
            # Weighted combination of all factors
            weights = np.array([0.15, 0.15, 0.20, 0.15, 0.05, 0.20, 0.10])
            score = np.dot(features, weights)
        
        return float(score)
    
    def collaborative_filtering(self, user_id: str, products: List[Dict],
                               user_transactions: List[Dict]) -> List[Tuple[str, float]]:
        """
        Simple collaborative filtering based on user purchase patterns
        """
        # Build user-product interaction matrix
        for transaction in user_transactions:
            for item in transaction.get('items', []):
                product_id = item.get('productId')
                quantity = item.get('quantity', 1)
                self.interaction_matrix[user_id][product_id] += quantity
        
        # Calculate similarity scores
        user_products = set(self.interaction_matrix[user_id].keys())
        recommendations = []
        
        for product in products:
            product_id = product.get('id')
            
            # Skip if user already purchased
            if product_id in user_products:
                continue
            
            # Calculate similarity based on category and price range
            similarity_score = 0
            for purchased_id in user_products:
                # Find the purchased product
                purchased = next((p for p in products if p.get('id') == purchased_id), None)
                if purchased:
                    # Category match
                    if product.get('category') == purchased.get('category'):
                        similarity_score += 0.5
                    
                    # Price range similarity
                    price_diff = abs(product.get('price', 0) - purchased.get('price', 0))
                    price_similarity = max(0, 1 - (price_diff / 100))
                    similarity_score += price_similarity * 0.3
            
            if similarity_score > 0:
                recommendations.append((product_id, similarity_score))
        
        # Sort by score
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations
    
    def get_top_promotions(self, products: List[Dict], 
                          strategy: str = 'balanced',
                          limit: int = 10) -> List[Dict]:
        """
        Get top products to promote based on strategy
        """
        scored_products = []
        
        for product in products:
            score = self.calculate_promotion_score(product, strategy)
            scored_products.append({
                'product': product,
                'promotionScore': score,
                'strategy': strategy
            })
        
        # Sort by promotion score
        scored_products.sort(key=lambda x: x['promotionScore'], reverse=True)
        return scored_products[:limit]
    
    def segment_products(self, products: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Segment products into categories for targeted promotions
        """
        segments = {
            'high_value': [],      # High price, high margin
            'fast_moving': [],     # High velocity
            'clearance': [],       # Overstocked, slow moving
            'premium': [],         # High margin, low volume
            'everyday': [],        # Regular items
        }
        
        for product in products:
            features = self.extract_product_features(product)
            price_tier = features[0]
            velocity = features[2]
            stock = features[1]
            margin = features[5]
            
            if price_tier > 0.7 and margin > 0.4:
                segments['high_value'].append(product)
            
            if velocity > 0.6:
                segments['fast_moving'].append(product)
            
            if stock > 0.7 and velocity < 0.3:
                segments['clearance'].append(product)
            
            if margin > 0.5 and velocity < 0.4:
                segments['premium'].append(product)
            
            if 0.3 <= velocity <= 0.6 and 0.3 <= stock <= 0.7:
                segments['everyday'].append(product)
        
        return segments
    
    def predict_demand(self, product: Dict, days_ahead: int = 7) -> float:
        """
        Simple demand prediction based on historical data
        """
        # Get sales velocity
        total_sales = product.get('totalSales', 0)
        days_active = max((datetime.now() - datetime.fromisoformat(
            product.get('createdAt', datetime.now().isoformat())
        )).days, 1)
        
        daily_velocity = total_sales / days_active
        
        # Apply trending factor
        recent_sales = product.get('recentSales', 0)
        trend_factor = recent_sales / max(total_sales, 1)
        
        # Adjust for trending
        adjusted_velocity = daily_velocity * (1 + trend_factor)
        
        # Predict demand
        predicted_demand = adjusted_velocity * days_ahead
        
        return max(0, predicted_demand)
    
    def optimize_inventory(self, products: List[Dict], 
                          target_days: int = 14) -> List[Dict]:
        """
        Recommend inventory adjustments based on demand prediction
        """
        recommendations = []
        
        for product in products:
            current_stock = product.get('stock', 0)
            predicted_demand = self.predict_demand(product, target_days)
            
            stock_gap = predicted_demand - current_stock
            
            if abs(stock_gap) > 5:  # Significant gap
                recommendations.append({
                    'productId': product.get('id'),
                    'productName': product.get('name'),
                    'currentStock': current_stock,
                    'predictedDemand': predicted_demand,
                    'recommendedAction': 'restock' if stock_gap > 0 else 'reduce',
                    'quantity': abs(stock_gap),
                    'urgency': 'high' if abs(stock_gap) > 20 else 'medium'
                })
        
        return recommendations


# Example usage
if __name__ == "__main__":
    # Sample data
    products = [
        {
            'id': 'p1',
            'name': 'Coca Cola',
            'price': 5.0,
            'cost': 3.0,
            'stock': 80,
            'totalSales': 150,
            'recentSales': 30,
            'category': 'beverages',
            'createdAt': (datetime.now() - timedelta(days=30)).isoformat(),
            'lastSold': (datetime.now() - timedelta(days=1)).isoformat(),
        },
        {
            'id': 'p2',
            'name': 'Rice 5kg',
            'price': 45.0,
            'cost': 30.0,
            'stock': 20,
            'totalSales': 50,
            'recentSales': 15,
            'category': 'groceries',
            'createdAt': (datetime.now() - timedelta(days=60)).isoformat(),
            'lastSold': (datetime.now() - timedelta(days=2)).isoformat(),
        }
    ]
    
    recommender = ProductRecommender()
    
    # Get top promotions
    promotions = recommender.get_top_promotions(products, strategy='balanced', limit=5)
    print("Top Promotions:", json.dumps(promotions, indent=2, default=str))
    
    # Segment products
    segments = recommender.segment_products(products)
    print("\nProduct Segments:", json.dumps({k: len(v) for k, v in segments.items()}, indent=2))
    
    # Inventory optimization
    inventory_recs = recommender.optimize_inventory(products, target_days=14)
    print("\nInventory Recommendations:", json.dumps(inventory_recs, indent=2, default=str))
