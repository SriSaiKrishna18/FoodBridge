"""Retrain all 4 new ML models with 2,000 synthetic samples."""
import sys
sys.path.insert(0, '.')

print('=== Retraining 4 ML Models with 2,000 Synthetic Samples ===')
print()

from backend.ml.clustering import train_clusters
result = train_clusters(None)
print()

from backend.ml.anomaly_detector import train_anomaly_detector
result = train_anomaly_detector(None)
print()

from backend.ml.forecaster import train_forecast_model
result = train_forecast_model(None)
print()

from backend.ml.collaborative_filter import build_preference_matrix
result = build_preference_matrix(None)
print()

# Verify all models report correctly
from backend.ml.clustering import get_model_info as c_info
from backend.ml.anomaly_detector import get_model_info as a_info
from backend.ml.forecaster import get_model_info as f_info
from backend.ml.collaborative_filter import get_model_info as cf_info

print('=== Model Verification ===')
for name, info_fn in [('Clustering', c_info), ('Anomaly', a_info), ('Forecast', f_info), ('CollabFilter', cf_info)]:
    info = info_fn()
    samples = info.get('n_samples') or info.get('n_training_samples') or info.get('n_matches_used', 'N/A')
    print(f'  {name}: status={info["status"]}, samples={samples}')

print()
print('=== All models retrained successfully! ===')
