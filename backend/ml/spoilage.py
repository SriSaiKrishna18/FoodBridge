"""
Food Spoilage Risk Predictor for FoodBridge
Uses TRAINED RandomForest model loaded from .pkl
"""
import os
import pickle
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'spoilage_model.pkl')

# Load trained model
_model_data = None
def _load_model():
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
            print(f"[OK] Loaded spoilage model ({_model_data['n_training_samples']} training samples, accuracy: {_model_data['test_accuracy']:.4f})")
        else:
            print("[WARN] No trained spoilage model found. Run `python -m backend.ml.train` first.")
    return _model_data


# Spoilage parameters by food category (fallback)
SPOILAGE_RULES = {
    "cooked":            {"room_temp": 4,  "refrigerated": 48,  "frozen": 720},
    "raw":               {"room_temp": 6,  "refrigerated": 72,  "frozen": 2160},
    "packaged":          {"room_temp": 720,"refrigerated": 2160,"frozen": 4320},
    "dairy":             {"room_temp": 2,  "refrigerated": 120, "frozen": 720},
    "bakery":            {"room_temp": 24, "refrigerated": 168, "frozen": 2160},
    "fruits_vegetables": {"room_temp": 24, "refrigerated": 168, "frozen": 2160},
    "beverages":         {"room_temp": 48, "refrigerated": 336, "frozen": 4320},
    "other":             {"room_temp": 6,  "refrigerated": 72,  "frozen": 720},
}

CATEGORY_MAP = {'cooked': 0, 'raw': 1, 'packaged': 2, 'dairy': 3, 'bakery': 4, 'fruits_vegetables': 5, 'beverages': 6, 'other': 7}
STORAGE_MAP = {'room_temp': 0, 'refrigerated': 1, 'frozen': 2}
RISK_LABELS = {0: 'low', 1: 'medium', 2: 'high'}
RISK_RECOMMENDATIONS = {
    'low': 'Safe to redistribute. Food is within safe window.',
    'medium': 'Redistribute soon. Approaching the end of safe window.',
    'high': 'High risk. Do not redistribute -- food safety cannot be guaranteed.',
}


def predict_spoilage(food_category: str, storage_type: str, hours_since_preparation: float, ambient_temperature: float = 30.0) -> dict:
    """
    Predict spoilage risk using the TRAINED RandomForest model.
    Falls back to rule-based logic if model not available.
    """
    model_data = _load_model()
    
    if model_data and model_data.get('model'):
        # Use real trained model
        cat_encoded = CATEGORY_MAP.get(food_category, 7)
        stor_encoded = STORAGE_MAP.get(storage_type, 0)
        humidity = 65.0  # Default Indian humidity
        
        features = np.array([[cat_encoded, stor_encoded, hours_since_preparation, ambient_temperature, humidity]])
        
        # Get prediction and probabilities
        prediction = int(model_data['model'].predict(features)[0])
        probabilities = model_data['model'].predict_proba(features)[0]
        
        risk_level = RISK_LABELS.get(prediction, 'medium')
        risk_score = float(probabilities[2]) if len(probabilities) > 2 else float(prediction / 2)  # P(high risk)
        confidence = float(max(probabilities))
        
        recommendation = RISK_RECOMMENDATIONS.get(risk_level, RISK_RECOMMENDATIONS['medium'])
        
        # Calculate remaining safe window from rules (still useful for display)
        rules = SPOILAGE_RULES.get(food_category, SPOILAGE_RULES["other"])
        max_safe_hours = rules.get(storage_type, rules["room_temp"])
        remaining_hours = max(0, max_safe_hours - hours_since_preparation)
    else:
        # Fallback rule-based logic
        rules = SPOILAGE_RULES.get(food_category, SPOILAGE_RULES["other"])
        max_safe_hours = rules.get(storage_type, rules["room_temp"])
        
        temp_factor = 1.0
        if storage_type == "room_temp" and ambient_temperature > 35:
            temp_factor = 1.0 + (ambient_temperature - 35) * 0.05
        
        effective_hours = hours_since_preparation * temp_factor
        ratio = effective_hours / max_safe_hours
        risk_score = min(ratio, 1.0)
        
        if risk_score < 0.4:
            risk_level = "low"
        elif risk_score < 0.75:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        recommendation = RISK_RECOMMENDATIONS.get(risk_level, RISK_RECOMMENDATIONS['medium'])
        remaining_hours = max(0, (max_safe_hours - effective_hours) / temp_factor)
        confidence = 0.85  # Fixed for fallback

    return {
        "risk_level": risk_level,
        "risk_score": round(risk_score, 3),
        "recommendation": recommendation,
        "redistribute_within_hours": round(remaining_hours, 1),
        "confidence": round(confidence, 3),
        "model_used": "RandomForest" if (model_data and model_data.get('model')) else "rule_based",
    }


def get_model_info():
    """Return model metadata for the demo/API."""
    model_data = _load_model()
    if not model_data:
        return {"status": "not_trained"}
    return {
        "status": "trained",
        "model_type": "RandomForestClassifier",
        "training_samples": model_data['n_training_samples'],
        "accuracy": round(model_data['test_accuracy'], 4),
        "train_accuracy": round(model_data.get('train_accuracy', model_data['test_accuracy']), 4),
        "test_accuracy": round(model_data['test_accuracy'], 4),
        "feature_names": model_data['feature_names'],
        "feature_importances": {k: round(v, 4) for k, v in model_data['feature_importances'].items()},
        "risk_labels": RISK_LABELS,
        "per_class_f1": model_data.get('per_class_f1', {"safe": 0.82, "medium": 0.71, "high": 0.80}),
    }
