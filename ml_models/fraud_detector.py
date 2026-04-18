"""
Advanced Fraud Detection ML Model
Uses anomaly detection, pattern recognition, and risk scoring
to identify fraudulent transactions in real-time
"""

import numpy as np
import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict, Counter


class FraudDetector:
    """
    Machine Learning model for fraud detection
    Uses multiple algorithms:
    - Anomaly detection (Isolation Forest approach)
    - Pattern recognition
    - Velocity checks
    - Behavioral analysis
    """
    
    def __init__(self):
        self.user_profiles = {}
        self.risk_threshold = 70
        self.anomaly_threshold = 3  # Standard deviations
        
    def extract_transaction_features(self, transaction: Dict, 
                                    user_history: List[Dict]) -> np.ndarray:
        """
        Extract numerical features from transaction for ML analysis
        
        Features:
        1. Amount (normalized by user average)
        2. Time of day (0-23 hours)
        3. Day of week (0-6)
        4. Transaction frequency (last hour)
        5. Transaction velocity (transactions per day)
        6. Amount deviation from mean
        7. Method consistency score
        8. Recipient pattern score
        9. Location anomaly (if available)
        10. Device fingerprint score
        """
        features = []
        
        # Get user statistics
        amounts = [t.get('amount', 0) for t in user_history]
        avg_amount = np.mean(amounts) if amounts else 100
        std_amount = np.std(amounts) if len(amounts) > 1 else avg_amount * 0.3
        
        # 1. Normalized amount
        current_amount = transaction.get('amount', 0)
        normalized_amount = current_amount / max(avg_amount, 1)
        features.append(min(normalized_amount, 5.0))
        
        # 2-3. Time features
        tx_time = datetime.fromisoformat(transaction.get('timestamp', datetime.now().isoformat()))
        features.append(tx_time.hour / 24)
        features.append(tx_time.weekday() / 7)
        
        # 4. Recent transaction frequency
        current_timestamp = tx_time.timestamp()
        recent_count = sum(1 for t in user_history 
                          if (current_timestamp - datetime.fromisoformat(
                              t.get('timestamp', datetime.now().isoformat())
                          ).timestamp()) < 3600)
        features.append(min(recent_count / 10, 1.0))
        
        # 5. Transaction velocity (per day)
        if user_history:
            days_active = max((tx_time - datetime.fromisoformat(
                user_history[-1].get('timestamp', datetime.now().isoformat())
            )).days, 1)
            velocity = len(user_history) / days_active
        else:
            velocity = 0
        features.append(min(velocity / 10, 1.0))
        
        # 6. Amount deviation (z-score)
        if std_amount > 0:
            z_score = abs((current_amount - avg_amount) / std_amount)
        else:
            z_score = 0
        features.append(min(z_score / 5, 1.0))
        
        # 7. Payment method consistency
        methods = [t.get('method', 'unknown') for t in user_history]
        method_counts = Counter(methods)
        current_method = transaction.get('method', 'unknown')
        method_frequency = method_counts.get(current_method, 0) / max(len(methods), 1)
        features.append(method_frequency)
        
        # 8. Recipient pattern
        recipients = [t.get('recipient', '') for t in user_history if t.get('recipient')]
        current_recipient = transaction.get('recipient', '')
        is_known_recipient = 1.0 if current_recipient in recipients else 0.0
        features.append(is_known_recipient)
        
        # 9. Round number detection (fraudsters often use round numbers)
        is_round = 1.0 if current_amount % 100 == 0 or current_amount % 50 == 0 else 0.0
        features.append(is_round)
        
        # 10. Rapid succession detection
        rapid_succession = 0.0
        if user_history:
            last_tx_time = datetime.fromisoformat(
                user_history[0].get('timestamp', datetime.now().isoformat())
            )
            time_diff = (tx_time - last_tx_time).total_seconds()
            if time_diff < 60:  # Less than 1 minute
                rapid_succession = 1.0
            elif time_diff < 300:  # Less than 5 minutes
                rapid_succession = 0.5
        features.append(rapid_succession)
        
        return np.array(features)
    
    def calculate_anomaly_score(self, features: np.ndarray, 
                               historical_features: List[np.ndarray]) -> float:
        """
        Calculate anomaly score using isolation forest approach
        """
        if not historical_features:
            return 0.5  # Unknown, medium risk
        
        # Calculate distances from historical transactions
        historical_matrix = np.array(historical_features)
        mean_features = np.mean(historical_matrix, axis=0)
        std_features = np.std(historical_matrix, axis=0)
        
        # Avoid division by zero
        std_features = np.where(std_features == 0, 1, std_features)
        
        # Calculate normalized distance (Mahalanobis-like)
        normalized_diff = (features - mean_features) / std_features
        distance = np.sqrt(np.sum(normalized_diff ** 2))
        
        # Convert to 0-1 score
        anomaly_score = min(distance / 10, 1.0)
        return float(anomaly_score)
    
    def detect_velocity_fraud(self, transaction: Dict, 
                            user_history: List[Dict]) -> Dict:
        """
        Detect velocity-based fraud (rapid transactions)
        """
        current_time = datetime.fromisoformat(
            transaction.get('timestamp', datetime.now().isoformat())
        )
        
        # Check transactions in different time windows
        windows = {
            '1min': 60,
            '5min': 300,
            '1hour': 3600,
            '24hours': 86400,
        }
        
        velocity_flags = {}
        
        for window_name, window_seconds in windows.items():
            count = sum(1 for t in user_history 
                       if (current_time - datetime.fromisoformat(
                           t.get('timestamp', datetime.now().isoformat())
                       )).total_seconds() < window_seconds)
            
            total_amount = sum(t.get('amount', 0) for t in user_history 
                             if (current_time - datetime.fromisoformat(
                                 t.get('timestamp', datetime.now().isoformat())
                             )).total_seconds() < window_seconds)
            
            # Thresholds
            count_threshold = {
                '1min': 3,
                '5min': 5,
                '1hour': 15,
                '24hours': 50,
            }
            
            amount_threshold = {
                '1min': 1000,
                '5min': 3000,
                '1hour': 10000,
                '24hours': 50000,
            }
            
            velocity_flags[window_name] = {
                'count': count,
                'totalAmount': total_amount,
                'countExceeded': count > count_threshold[window_name],
                'amountExceeded': total_amount > amount_threshold[window_name],
            }
        
        is_suspicious = any(v['countExceeded'] or v['amountExceeded'] 
                          for v in velocity_flags.values())
        
        return {
            'suspicious': is_suspicious,
            'details': velocity_flags,
        }
    
    def detect_pattern_fraud(self, transaction: Dict, 
                           user_history: List[Dict]) -> Dict:
        """
        Detect pattern-based fraud
        """
        flags = []
        
        current_amount = transaction.get('amount', 0)
        
        # 1. Test transaction pattern (small followed by large)
        if len(user_history) >= 1:
            last_amount = user_history[0].get('amount', 0)
            if last_amount < 10 and current_amount > 500:
                flags.append('test_transaction_pattern')
        
        # 2. Repetitive amounts (same amount multiple times)
        recent_amounts = [t.get('amount', 0) for t in user_history[:5]]
        if recent_amounts.count(current_amount) >= 2:
            flags.append('repetitive_amounts')
        
        # 3. Progressive increase pattern
        if len(user_history) >= 3:
            last_3_amounts = [t.get('amount', 0) for t in user_history[:3]]
            if all(last_3_amounts[i] < last_3_amounts[i+1] 
                  for i in range(len(last_3_amounts)-1)):
                if current_amount > last_3_amounts[-1]:
                    flags.append('progressive_increase')
        
        # 4. Midnight transaction (higher fraud risk)
        tx_time = datetime.fromisoformat(
            transaction.get('timestamp', datetime.now().isoformat())
        )
        if 0 <= tx_time.hour <= 4:
            flags.append('midnight_transaction')
        
        # 5. First-time large transaction
        if len(user_history) < 5 and current_amount > 500:
            flags.append('first_time_large')
        
        # 6. Duplicate detection
        for past_tx in user_history[:10]:
            if (abs(past_tx.get('amount', 0) - current_amount) < 0.01 and
                past_tx.get('recipient') == transaction.get('recipient')):
                time_diff = (tx_time - datetime.fromisoformat(
                    past_tx.get('timestamp', datetime.now().isoformat())
                )).total_seconds()
                if time_diff < 300:  # Within 5 minutes
                    flags.append('potential_duplicate')
                    break
        
        return {
            'suspicious': len(flags) >= 2,
            'patterns': flags,
        }
    
    def calculate_comprehensive_risk_score(self, transaction: Dict,
                                         user_history: List[Dict]) -> Dict:
        """
        Calculate comprehensive fraud risk score
        Returns score from 0-100 and detailed analysis
        """
        # Extract features
        features = self.extract_transaction_features(transaction, user_history)
        
        # Get historical features
        historical_features = [
            self.extract_transaction_features(t, user_history[:i])
            for i, t in enumerate(user_history[:50])
        ]
        
        # Calculate anomaly score
        anomaly_score = self.calculate_anomaly_score(features, historical_features)
        
        # Velocity check
        velocity_check = self.detect_velocity_fraud(transaction, user_history)
        
        # Pattern check
        pattern_check = self.detect_pattern_fraud(transaction, user_history)
        
        # Combine scores
        risk_score = 0
        risk_factors = []
        
        # Anomaly contribution (30%)
        anomaly_contribution = anomaly_score * 30
        risk_score += anomaly_contribution
        if anomaly_score > 0.7:
            risk_factors.append(f'Transaction pattern anomaly (score: {anomaly_score:.2f})')
        
        # Velocity contribution (30%)
        if velocity_check['suspicious']:
            risk_score += 30
            risk_factors.append('High transaction velocity detected')
        
        # Pattern contribution (25%)
        if pattern_check['suspicious']:
            risk_score += 25
            risk_factors.extend(pattern_check['patterns'])
        
        # Amount-based risk (15%)
        amount = transaction.get('amount', 0)
        if amount > 5000:
            amount_risk = min((amount / 10000) * 15, 15)
            risk_score += amount_risk
            if amount > 10000:
                risk_factors.append(f'Very high transaction amount: {amount}')
        
        risk_score = min(risk_score, 100)
        
        # Determine risk level
        if risk_score >= 80:
            risk_level = 'CRITICAL'
            action = 'block'
        elif risk_score >= 60:
            risk_level = 'HIGH'
            action = 'manual_review'
        elif risk_score >= 40:
            risk_level = 'MEDIUM'
            action = 'additional_verification'
        else:
            risk_level = 'LOW'
            action = 'allow'
        
        return {
            'riskScore': float(risk_score),
            'riskLevel': risk_level,
            'recommendedAction': action,
            'suspicious': risk_score >= self.risk_threshold,
            'riskFactors': risk_factors,
            'details': {
                'anomalyScore': float(anomaly_score),
                'velocityCheck': velocity_check,
                'patternCheck': pattern_check,
            }
        }
    
    def build_user_profile(self, user_id: str, transactions: List[Dict]) -> Dict:
        """
        Build a user behavioral profile for better fraud detection
        """
        if not transactions:
            return {
                'userId': user_id,
                'totalTransactions': 0,
                'riskProfile': 'new_user',
            }
        
        amounts = [t.get('amount', 0) for t in transactions]
        methods = [t.get('method', 'unknown') for t in transactions]
        times = [datetime.fromisoformat(t.get('timestamp', datetime.now().isoformat())) 
                for t in transactions]
        
        # Calculate statistics
        profile = {
            'userId': user_id,
            'totalTransactions': len(transactions),
            'averageAmount': float(np.mean(amounts)),
            'medianAmount': float(np.median(amounts)),
            'stdAmount': float(np.std(amounts)),
            'maxAmount': float(np.max(amounts)),
            'minAmount': float(np.min(amounts)),
            'preferredMethods': Counter(methods).most_common(3),
            'averageTransactionInterval': float(
                np.mean([(times[i] - times[i+1]).total_seconds() 
                        for i in range(len(times)-1)])
            ) if len(times) > 1 else 86400,
            'mostActiveHours': Counter([t.hour for t in times]).most_common(3),
            'riskProfile': self._classify_risk_profile(len(transactions), amounts),
        }
        
        self.user_profiles[user_id] = profile
        return profile
    
    def _classify_risk_profile(self, transaction_count: int, 
                              amounts: List[float]) -> str:
        """
        Classify user risk profile
        """
        if transaction_count < 5:
            return 'new_user'
        
        avg_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        
        # Calculate coefficient of variation
        cv = std_amount / avg_amount if avg_amount > 0 else 0
        
        if cv > 1.0:
            return 'high_variance'
        elif avg_amount > 1000 and transaction_count > 50:
            return 'high_value'
        elif transaction_count > 100:
            return 'established'
        else:
            return 'regular'


# Example usage
if __name__ == "__main__":
    detector = FraudDetector()
    
    # Sample user history
    user_history = [
        {
            'amount': 50,
            'method': 'card',
            'timestamp': (datetime.now() - timedelta(hours=24)).isoformat(),
            'recipient': 'Store A',
        },
        {
            'amount': 75,
            'method': 'card',
            'timestamp': (datetime.now() - timedelta(hours=12)).isoformat(),
            'recipient': 'Store B',
        },
        {
            'amount': 100,
            'method': 'wallet',
            'timestamp': (datetime.now() - timedelta(hours=6)).isoformat(),
            'recipient': 'Store C',
        },
    ]
    
    # Suspicious transaction
    suspicious_tx = {
        'amount': 5000,
        'method': 'momo',
        'timestamp': datetime.now().isoformat(),
        'recipient': 'Unknown',
    }
    
    # Normal transaction
    normal_tx = {
        'amount': 80,
        'method': 'card',
        'timestamp': datetime.now().isoformat(),
        'recipient': 'Store A',
    }
    
    print("=== Suspicious Transaction Analysis ===")
    result = detector.calculate_comprehensive_risk_score(suspicious_tx, user_history)
    print(json.dumps(result, indent=2))
    
    print("\n=== Normal Transaction Analysis ===")
    result = detector.calculate_comprehensive_risk_score(normal_tx, user_history)
    print(json.dumps(result, indent=2))
    
    print("\n=== User Profile ===")
    profile = detector.build_user_profile('user123', user_history)
    print(json.dumps(profile, indent=2, default=str))
