"""
Anomaly Detection for Food Safety — FoodBridge
Uses IsolationForest to flag unusual donation patterns
"""
import os
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'anomaly_model.pkl')

CATEGORY_MAP = {'cooked': 0, 'raw': 1, 'packaged': 2, 'dairy': 3, 'bakery': 4, 'fruits_vegetables': 5, 'beverages': 6, 'other': 7}

_model_data = None


def train_anomaly_detector(donations_data):
    """
    Train IsolationForest on normal donation patterns.
    donations_data: list of dicts with food_category, hours_since_preparation, quantity_kg, etc.
    """
    global _model_data
    
    features = []
    for d in donations_data:
        cat = CATEGORY_MAP.get(d.get('food_category', 'other'), 7)
        hours = d.get('hours_since_preparation', 2)
        qty = d.get('quantity_kg', 5)
        hour_of_day = d.get('hour_of_day', 12)
        features.append([cat, hours, qty, hour_of_day])
    
    if len(features) < 10:
        return None
    
    X = np.array(features)
    
    iso = IsolationForest(
        contamination=0.05,
        random_state=42,
        n_estimators=100,
    )
    iso.fit(X)
    
    _model_data = {
        'model': iso,
        'n_training_samples': len(X),
        'feature_names': ['food_category', 'hours_since_preparation', 'quantity_kg', 'hour_of_day'],
        'contamination': 0.05,
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(_model_data, f)
    
    return _model_data


def detect_anomaly(food_category: str, hours_since_preparation: float, quantity_kg: float, hour_of_day: int = 12):
    """
    Check if a donation is anomalous.
    Returns dict with is_anomaly, anomaly_score, and reason.
    """
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    if not _model_data or not _model_data.get('model'):
        # Fallback: simple rule-based
        is_anomaly = (
            (food_category == 'cooked' and hours_since_preparation > 8 and quantity_kg > 30) or
            (hour_of_day >= 23 or hour_of_day <= 4) and quantity_kg > 20
        )
        return {
            'is_anomaly': is_anomaly,
            'anomaly_score': 0.8 if is_anomaly else 0.2,
            'reason': 'Unusual late-night large quantity listing' if is_anomaly else 'Normal pattern',
            'model_used': 'rule_based',
        }
    
    cat_encoded = CATEGORY_MAP.get(food_category, 7)
    features = np.array([[cat_encoded, hours_since_preparation, quantity_kg, hour_of_day]])
    
    score = float(_model_data['model'].decision_function(features)[0])
    prediction = int(_model_data['model'].predict(features)[0])
    is_anomaly = prediction == -1
    
    # Generate human-readable reason
    reasons = []
    if hours_since_preparation > 6 and food_category in ('cooked', 'dairy'):
        reasons.append(f'{food_category} food listed {hours_since_preparation:.0f}h after preparation')
    if quantity_kg > 30:
        reasons.append(f'unusually large quantity ({quantity_kg:.0f} kg)')
    if hour_of_day >= 22 or hour_of_day <= 5:
        reasons.append(f'listed at unusual hour ({hour_of_day}:00)')
    if not reasons:
        reasons.append('combination of factors triggered anomaly detection' if is_anomaly else 'all parameters within normal range')
    
    # Normalize score to 0-1 range (decision_function returns negative for anomalies)
    normalized_score = max(0, min(1, 0.5 - score))
    
    return {
        'is_anomaly': is_anomaly,
        'anomaly_score': round(normalized_score, 3),
        'reason': '; '.join(reasons),
        'model_used': 'IsolationForest',
        'raw_score': round(score, 4),
    }


def get_model_info():
    """Return model metadata."""
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    if _model_data:
        return {
            'status': 'trained',
            'model_type': 'IsolationForest',
            'n_training_samples': _model_data['n_training_samples'],
            'contamination': _model_data['contamination'],
            'feature_names': _model_data['feature_names'],
        }
    return {'status': 'not_trained', 'model_type': 'IsolationForest'}
