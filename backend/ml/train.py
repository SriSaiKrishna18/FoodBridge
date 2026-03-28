"""
FoodBridge — Real ML Model Training Pipeline
Generates synthetic data, trains XGBoost + RandomForest, saves .pkl files
"""
import pandas as pd
import numpy as np
import pickle
import os
import math
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
from math import sqrt as msqrt
import warnings
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'ml', 'models')


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


# ═══════════════════════════════════════════════════════════
# 1. MATCHING MODEL — GradientBoosting Regressor
# ═══════════════════════════════════════════════════════════
def generate_matching_data(n=2000):
    """Generate synthetic donor-receiver matching data."""
    np.random.seed(42)
    data = []
    for _ in range(n):
        distance = np.random.exponential(3) + 0.5             # km, skewed toward short distances
        food_compat = np.random.beta(5, 2)                     # 0-1, skewed toward compatible
        qty_ratio = np.random.uniform(0.1, 2.5)                # donation_qty / receiver_need
        reliability = np.random.beta(6, 2)                     # 0-1, most receivers reliable
        urgency_hours = np.random.exponential(4) + 0.5         # hours until spoilage
        receiver_capacity = np.random.uniform(0.3, 1.0)        # how much receiver can handle
        past_pickups = np.random.poisson(15)                    # historical successful pickups
        
        # Ground truth score with noise (simulating real-world outcomes)
        score = (
            (1 / (distance + 0.5)) * 0.25 +
            food_compat * 0.20 +
            min(qty_ratio, 1.0) * 0.15 +
            reliability * 0.15 +
            (1 / (urgency_hours + 0.5)) * 0.10 +
            receiver_capacity * 0.10 +
            min(past_pickups / 30, 1.0) * 0.05
        )
        # Add realistic noise
        score += np.random.normal(0, 0.03)
        score = np.clip(score, 0, 1)
        
        data.append([distance, food_compat, qty_ratio, reliability, 
                      urgency_hours, receiver_capacity, past_pickups, round(score, 4)])
    
    return pd.DataFrame(data, columns=[
        'distance_km', 'food_compatibility', 'qty_ratio', 'reliability_score',
        'urgency_hours', 'receiver_capacity', 'past_pickups', 'match_score'
    ])


def train_matching_model():
    print("═══ Training Matching Model (GradientBoosting) ═══")
    df = generate_matching_data(2000)
    
    X = df.drop('match_score', axis=1)
    y = df['match_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    train_pred = model.predict(X_train)
    test_pred = model.predict(X_test)
    train_rmse = msqrt(mean_squared_error(y_train, train_pred))
    test_rmse = msqrt(mean_squared_error(y_test, test_pred))
    
    print(f"  Train RMSE: {train_rmse:.4f}")
    print(f"  Test  RMSE: {test_rmse:.4f}")
    
    # Feature importances
    importances = dict(zip(X.columns, model.feature_importances_))
    print("  Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
        print(f"    {feat}: {imp:.4f}")
    
    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    pkl_path = os.path.join(MODEL_DIR, 'matcher_model.pkl')
    with open(pkl_path, 'wb') as f:
        pickle.dump({
            'model': model,
            'feature_names': list(X.columns),
            'feature_importances': importances,
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'n_training_samples': len(X_train),
        }, f)
    print(f"  [OK] Saved to {pkl_path}\n")
    return model


# ═══════════════════════════════════════════════════════════
# 2. SPOILAGE MODEL — RandomForest Classifier
# ═══════════════════════════════════════════════════════════
CATEGORY_MAP = {'cooked': 0, 'raw': 1, 'packaged': 2, 'dairy': 3, 'bakery': 4, 'fruits_vegetables': 5, 'beverages': 6, 'other': 7}
STORAGE_MAP = {'room_temp': 0, 'refrigerated': 1, 'frozen': 2}

# Max safe hours reference (USDA-based)
MAX_SAFE = {
    (0, 0): 4, (0, 1): 48, (0, 2): 720,    # cooked
    (1, 0): 6, (1, 1): 72, (1, 2): 2160,   # raw
    (2, 0): 720, (2, 1): 2160, (2, 2): 4320, # packaged
    (3, 0): 2, (3, 1): 120, (3, 2): 720,    # dairy
    (4, 0): 24, (4, 1): 168, (4, 2): 2160,  # bakery
    (5, 0): 24, (5, 1): 168, (5, 2): 2160,  # fruits_veg
    (6, 0): 48, (6, 1): 336, (6, 2): 4320,  # beverages
    (7, 0): 6, (7, 1): 72, (7, 2): 720,     # other
}


def generate_spoilage_data(n=1500):
    """Generate synthetic spoilage training data based on USDA food safety guidelines."""
    np.random.seed(42)
    data = []
    
    for _ in range(n):
        cat = np.random.randint(0, 8)
        storage = np.random.randint(0, 3)
        max_safe = MAX_SAFE.get((cat, storage), 6)
        
        # Generate hours since preparation (varies widely)
        hours = np.random.exponential(max_safe * 0.4) + 0.1
        temp = np.random.normal(30, 8)  # Indian ambient temps
        temp = np.clip(temp, 5, 48)
        humidity = np.random.uniform(30, 95)
        
        # Temperature penalty for room temp storage
        temp_factor = 1.0
        if storage == 0 and temp > 35:
            temp_factor = 1.0 + (temp - 35) * 0.05
        
        effective_hours = hours * temp_factor
        ratio = effective_hours / max_safe
        
        # Label: 0=safe, 1=medium, 2=high risk
        if ratio < 0.35:
            label = 0  # safe
        elif ratio < 0.70:
            label = 1  # medium
        else:
            label = 2  # high risk
        
        # Add some noise to labels (real world isn't perfect)
        if np.random.random() < 0.05:
            label = min(2, label + 1)
        
        data.append([cat, storage, hours, temp, humidity, label])
    
    return pd.DataFrame(data, columns=[
        'food_category', 'storage_type', 'hours_since_prep', 
        'ambient_temp', 'humidity', 'risk_label'
    ])


def train_spoilage_model():
    print("═══ Training Spoilage Model (RandomForest) ═══")
    df = generate_spoilage_data(1500)
    
    X = df.drop('risk_label', axis=1)
    y = df['risk_label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    train_acc = accuracy_score(y_train, model.predict(X_train))
    test_acc = accuracy_score(y_test, model.predict(X_test))
    
    print(f"  Train Accuracy: {train_acc:.4f}")
    print(f"  Test  Accuracy: {test_acc:.4f}")
    print(f"\n  Classification Report (Test):")
    print(classification_report(y_test, model.predict(X_test), 
          target_names=['Safe', 'Medium Risk', 'High Risk']))
    
    # Feature importances
    importances = dict(zip(X.columns, model.feature_importances_))
    print("  Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
        print(f"    {feat}: {imp:.4f}")
    
    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    pkl_path = os.path.join(MODEL_DIR, 'spoilage_model.pkl')
    with open(pkl_path, 'wb') as f:
        pickle.dump({
            'model': model,
            'feature_names': list(X.columns),
            'feature_importances': importances,
            'category_map': CATEGORY_MAP,
            'storage_map': STORAGE_MAP,
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'n_training_samples': len(X_train),
            'risk_labels': {0: 'low', 1: 'medium', 2: 'high'},
        }, f)
    print(f"  [OK] Saved to {pkl_path}\n")
    return model


# ═══════════════════════════════════════════════════════════
# MAIN — Train all models
# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("=== FoodBridge ML Training Pipeline ===")
    print("=" * 50)
    train_matching_model()
    train_spoilage_model()
    print("[OK] All models trained and saved!")
    print(f"[OK] Model directory: {os.path.abspath(MODEL_DIR)}")
