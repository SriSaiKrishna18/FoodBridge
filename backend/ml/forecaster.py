"""
Surplus Demand Forecasting for FoodBridge
Uses GradientBoostingRegressor to predict donation volume for next 6 hours
"""
import os
import pickle
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingRegressor

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'forecast_model.pkl')

CATEGORY_MAP = {'cooked': 0, 'raw': 1, 'packaged': 2, 'dairy': 3, 'bakery': 4, 'fruits_vegetables': 5, 'beverages': 6, 'other': 7}
CATEGORY_NAMES = {v: k for k, v in CATEGORY_MAP.items()}

_model_data = None


def train_forecast_model(donations_data):
    """
    Train a GBR on hourly donation patterns.
    donations_data: list of dicts with 'created_at' (datetime), 'food_category', 'quantity_kg'
    """
    global _model_data
    
    # Build hourly aggregation features
    features = []
    targets = []
    
    for d in donations_data:
        created = d.get('created_at')
        if not created:
            continue
        if isinstance(created, str):
            try:
                created = datetime.fromisoformat(created)
            except:
                continue
        
        hour = created.hour
        day_of_week = created.weekday()
        cat = CATEGORY_MAP.get(d.get('food_category', 'other'), 7)
        qty = d.get('quantity_kg', 5)
        
        # Feature: hour, day_of_week, category, is_weekend, is_evening
        features.append([
            hour,
            day_of_week,
            cat,
            1 if day_of_week >= 5 else 0,     # is_weekend
            1 if 17 <= hour <= 21 else 0,       # is_evening_rush
            1 if 11 <= hour <= 14 else 0,       # is_lunch_hour
        ])
        targets.append(qty)
    
    if len(features) < 20:
        return None
    
    X = np.array(features)
    y = np.array(targets)
    
    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X, y)
    
    # Calculate training metrics
    train_predictions = model.predict(X)
    rmse = float(np.sqrt(np.mean((y - train_predictions) ** 2)))
    r2 = float(model.score(X, y))
    
    _model_data = {
        'model': model,
        'n_training_samples': len(X),
        'rmse': rmse,
        'r2_score': r2,
        'feature_names': ['hour', 'day_of_week', 'category', 'is_weekend', 'is_evening_rush', 'is_lunch_hour'],
        'feature_importances': dict(zip(
            ['hour', 'day_of_week', 'category', 'is_weekend', 'is_evening_rush', 'is_lunch_hour'],
            [round(float(x), 4) for x in model.feature_importances_]
        )),
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(_model_data, f)
    
    print(f"[OK] Forecast model trained: {len(X)} samples, RMSE: {rmse:.2f}, R²: {r2:.3f}")
    return _model_data


def forecast_next_hours(n_hours=6):
    """
    Predict expected donation volume for the next n_hours, by hour and category.
    """
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    now = datetime.now()
    predictions = []
    
    categories = ['cooked', 'bakery', 'dairy', 'fruits_vegetables', 'packaged']
    
    for h_offset in range(1, n_hours + 1):
        future = now + timedelta(hours=h_offset)
        hour = future.hour
        dow = future.weekday()
        is_weekend = 1 if dow >= 5 else 0
        is_evening = 1 if 17 <= hour <= 21 else 0
        is_lunch = 1 if 11 <= hour <= 14 else 0
        
        hour_total = 0
        hour_breakdown = []
        
        for cat_name in categories:
            cat_code = CATEGORY_MAP[cat_name]
            features = np.array([[hour, dow, cat_code, is_weekend, is_evening, is_lunch]])
            
            if _model_data and _model_data.get('model'):
                predicted_kg = float(_model_data['model'].predict(features)[0])
                predicted_kg = max(0, predicted_kg)
            else:
                # Fallback: simple pattern
                base = 8 if is_evening else (12 if is_lunch else 5)
                predicted_kg = base * (1.3 if is_weekend else 1.0)
            
            hour_breakdown.append({
                'category': cat_name,
                'predicted_kg': round(predicted_kg, 1),
            })
            hour_total += predicted_kg
        
        confidence = 0.78 if is_evening or is_lunch else 0.65
        
        predictions.append({
            'hour': hour,
            'time_label': future.strftime('%I %p'),
            'total_predicted_kg': round(hour_total, 1),
            'breakdown': hour_breakdown,
            'confidence': round(confidence, 2),
        })
    
    return {
        'predictions': predictions,
        'generated_at': now.isoformat(),
        'model_used': 'GradientBoostingRegressor' if (_model_data and _model_data.get('model')) else 'pattern_based',
        'forecast_hours': n_hours,
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
            'model_type': 'GradientBoostingRegressor',
            'purpose': 'Surplus Demand Forecasting',
            'n_training_samples': _model_data['n_training_samples'],
            'rmse': round(_model_data['rmse'], 4),
            'r2_score': round(_model_data['r2_score'], 4),
            'feature_names': _model_data['feature_names'],
            'feature_importances': _model_data.get('feature_importances', {}),
        }
    return {'status': 'not_trained', 'model_type': 'GradientBoostingRegressor'}
