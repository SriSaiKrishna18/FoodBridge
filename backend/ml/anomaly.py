import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'anomaly_model.pkl')

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception:
            _model = None
    return _model

def predict_anomaly(features: dict) -> dict:
    '''
    features: {
        quantity_kg, hours_since_prep, hour_of_day,
        food_category_enc, storage_type_enc
    }
    Returns: {is_anomaly: bool, score: float, reason: str}
    '''
    model = _get_model()
    
    if model is None:
        # Rule-based fallback if model not loaded
        is_anomaly = (
            features.get('quantity_kg', 0) > 150 or
            features.get('hours_since_prep', 0) > 48 or
            features.get('hour_of_day', 12) < 5
        )
        return {
            'is_anomaly': is_anomaly,
            'score': -0.15 if is_anomaly else 0.12,
            'reason': _get_reason(features) if is_anomaly else None,
        }
    
    X = np.array([[
        features.get('quantity_kg', 10),
        features.get('hours_since_prep', 2),
        features.get('hour_of_day', 12),
        features.get('food_category_enc', 0),
        features.get('storage_type_enc', 0),
    ]])
    
    prediction = model.predict(X)[0]       # 1 = normal, -1 = anomaly
    score = float(model.decision_function(X)[0])  # negative = more anomalous
    is_anomaly = prediction == -1
    
    return {
        'is_anomaly': is_anomaly,
        'score': round(score, 3),
        'reason': _get_reason(features) if is_anomaly else None,
    }

def _get_reason(features: dict) -> str:
    reasons = []
    if features.get('quantity_kg', 0) > 150:
        reasons.append(f"unusually large quantity ({features['quantity_kg']} kg)")
    if features.get('hours_since_prep', 0) > 48:
        reasons.append(f"food prepared {int(features['hours_since_prep'])} hours ago")
    if features.get('hour_of_day', 12) < 5:
        reasons.append(f"listed at {features['hour_of_day']}:00 AM (off-hours)")
    return '; '.join(reasons) if reasons else 'pattern differs from normal donations'
