"""
Smart Demand-Supply Matcher for FoodBridge
Uses TRAINED GradientBoosting model loaded from .pkl
"""
import math
import os
import pickle
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'matcher_model.pkl')

# Load trained model
_model_data = None
def _load_model():
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
            print(f"[OK] Loaded matching model ({_model_data['n_training_samples']} training samples, RMSE: {_model_data['test_rmse']:.4f})")
        else:
            print("[WARN] No trained model found. Run `python -m backend.ml.train` first.")
    return _model_data


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS coordinates in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


# Food compatibility matrix
FOOD_COMPAT = {
    "cooked": ["cooked", "other"],
    "raw": ["raw", "fruits_vegetables", "other"],
    "packaged": ["packaged", "other"],
    "dairy": ["dairy", "other"],
    "bakery": ["bakery", "cooked", "other"],
    "fruits_vegetables": ["fruits_vegetables", "raw", "other"],
    "beverages": ["beverages", "other"],
    "other": ["other"],
}


def food_type_compatibility(donation_type, receiver_prefs=None):
    if receiver_prefs is None:
        return 0.8
    compatible = FOOD_COMPAT.get(donation_type, ["other"])
    return 1.0 if receiver_prefs in compatible else 0.5


def rank_receivers(donation, receivers):
    """
    Rank receivers using the TRAINED GradientBoosting model.
    Returns list of (receiver, score, distance) tuples sorted by score descending.
    """
    model_data = _load_model()
    results = []
    hours_until_expiry = donation.redistribution_window_hours or 6.0

    for receiver in receivers:
        distance = haversine_distance(
            donation.latitude or 13.01, donation.longitude or 80.23,
            receiver.latitude or 13.01, receiver.longitude or 80.23,
        )

        food_compat = food_type_compatibility(donation.food_category)
        qty_ratio = donation.quantity_kg / max(1, 5)
        reliability = receiver.reliability_score or 0.7
        receiver_capacity = min(reliability + 0.1, 1.0)
        past_pickups = int(reliability * 40)  # Estimate from reliability

        if model_data and model_data.get('model'):
            # Use real trained model
            features = np.array([[
                distance,
                food_compat,
                qty_ratio,
                reliability,
                hours_until_expiry,
                receiver_capacity,
                past_pickups,
            ]])
            score = float(model_data['model'].predict(features)[0])
            score = max(0.0, min(1.0, score))
        else:
            # Fallback formula
            score = (
                (1 / (distance + 1)) * 0.30 +
                food_compat * 0.25 +
                min(qty_ratio, 1.0) * 0.20 +
                reliability * 0.15 +
                (1 / (hours_until_expiry + 1)) * 0.10
            )

        results.append((receiver, score, distance))

    results.sort(key=lambda x: -x[1])
    return results


def get_model_info():
    """Return model metadata for the demo/API."""
    model_data = _load_model()
    if not model_data:
        return {"status": "not_trained", "message": "Run python -m backend.ml.train"}
    return {
        "status": "trained",
        "model_type": "GradientBoostingRegressor",
        "training_samples": model_data['n_training_samples'],
        "rmse": round(model_data['test_rmse'], 4),
        "train_rmse": round(model_data.get('train_rmse', model_data['test_rmse']), 4),
        "test_rmse": round(model_data['test_rmse'], 4),
        "feature_names": model_data['feature_names'],
        "feature_importances": {k: round(v, 4) for k, v in model_data['feature_importances'].items()},
    }
