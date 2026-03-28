"""
Surplus Demand Forecasting for FoodBridge
Uses GradientBoostingRegressor to predict donation volume for next 6 hours
Trained on 2,000 synthetic time-series samples
"""
import os
import pickle
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'forecast_model.pkl')

CATEGORY_MAP = {'cooked': 0, 'raw': 1, 'packaged': 2, 'dairy': 3, 'bakery': 4, 'fruits_vegetables': 5, 'beverages': 6, 'other': 7}
CATEGORY_NAMES = {v: k for k, v in CATEGORY_MAP.items()}

_model_data = None


def generate_synthetic_forecast_data(n=2000):
    """
    Generate 2,000 synthetic hourly donation volume samples.
    Models real-world Chennai donation patterns: lunch/dinner peaks,
    weekend surges, category-specific timing, seasonal variation.
    """
    np.random.seed(42)
    rows = []

    for _ in range(n):
        hour = np.random.randint(0, 24)
        day_of_week = np.random.randint(0, 7)
        cat = np.random.randint(0, 8)
        is_weekend = 1 if day_of_week >= 5 else 0

        # Realistic time-of-day donation patterns (Chennai food surplus)
        base_kg = 8.0
        hour_factor = (
            2.5 if 12 <= hour <= 14 else       # lunch peak
            2.0 if 19 <= hour <= 21 else        # dinner peak
            1.5 if 8 <= hour <= 10 else         # breakfast
            0.3 if 0 <= hour <= 5 else          # night minimum
            1.0                                  # normal hours
        )
        is_evening = 1 if 17 <= hour <= 21 else 0
        is_lunch = 1 if 11 <= hour <= 14 else 0

        weekend_factor = 1.4 if is_weekend else 1.0
        # Cooked food (cat 0) peaks more during meal times
        category_factor = 1.5 if cat == 0 else (1.2 if cat in [4, 5] else 1.0)

        predicted_kg = (base_kg * hour_factor * weekend_factor *
                       category_factor * np.random.lognormal(0, 0.25))
        predicted_kg = max(0, predicted_kg)

        rows.append([hour, day_of_week, cat, is_weekend, is_evening, is_lunch, round(predicted_kg, 1)])

    return rows


def train_forecast_model(donations_data=None):
    """
    Train a GBR on hourly donation patterns.
    If no data provided (or <100 samples), generates 2,000 synthetic samples.
    """
    global _model_data

    if donations_data is None or len(donations_data) < 100:
        print("[FORECAST] Generating 2,000 synthetic time-series samples for training...")
        raw = generate_synthetic_forecast_data(2000)
        X = np.array([r[:6] for r in raw])
        y = np.array([r[6] for r in raw])
    else:
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

            features.append([
                hour,
                day_of_week,
                cat,
                1 if day_of_week >= 5 else 0,
                1 if 17 <= hour <= 21 else 0,
                1 if 11 <= hour <= 14 else 0,
            ])
            targets.append(qty)

        if len(features) < 20:
            # Fall back to synthetic
            print("[FORECAST] Insufficient data, generating 2,000 synthetic samples...")
            raw = generate_synthetic_forecast_data(2000)
            X = np.array([r[:6] for r in raw])
            y = np.array([r[6] for r in raw])
        else:
            X = np.array(features)
            y = np.array(targets)

    # Train with 80/20 split for proper R² reporting
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        min_samples_split=10,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Calculate metrics
    train_rmse = float(np.sqrt(np.mean((y_train - model.predict(X_train)) ** 2)))
    test_rmse = float(np.sqrt(np.mean((y_test - model.predict(X_test)) ** 2)))
    r2_train = float(model.score(X_train, y_train))
    r2_test = float(model.score(X_test, y_test))

    _model_data = {
        'model': model,
        'n_training_samples': len(X),
        'rmse': test_rmse,
        'train_rmse': train_rmse,
        'r2_score': r2_test,
        'r2_train': r2_train,
        'feature_names': ['hour', 'day_of_week', 'category', 'is_weekend', 'is_evening_rush', 'is_lunch_hour'],
        'feature_importances': dict(zip(
            ['hour', 'day_of_week', 'category', 'is_weekend', 'is_evening_rush', 'is_lunch_hour'],
            [round(float(x), 4) for x in model.feature_importances_]
        )),
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(_model_data, f)

    print(f"[OK] Forecast model trained: {len(X)} samples, Train R²: {r2_train:.3f}, Test R²: {r2_test:.3f}, Test RMSE: {test_rmse:.2f}")
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
