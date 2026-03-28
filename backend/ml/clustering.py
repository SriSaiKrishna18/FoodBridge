"""
Geographic Hotspot Clustering for FoodBridge
Uses KMeans to identify food waste hotspot zones in Chennai
"""
import os
import pickle
import numpy as np
from sklearn.cluster import KMeans

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'cluster_model.pkl')

_model_data = None

def train_clusters(donations_data):
    """
    Train KMeans on donation lat/lng to identify hotspot zones.
    donations_data: list of dicts with 'latitude', 'longitude', 'quantity_kg'
    """
    global _model_data
    
    coords = np.array([
        [d['latitude'], d['longitude']]
        for d in donations_data
        if d.get('latitude') and d.get('longitude')
    ])
    
    if len(coords) < 5:
        return None
    
    n_clusters = min(5, len(coords) // 3)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords)
    
    # Calculate cluster stats
    clusters = []
    for i in range(n_clusters):
        mask = labels == i
        cluster_coords = coords[mask]
        cluster_donations = [d for j, d in enumerate(donations_data) if mask[j] if d.get('latitude')]
        
        # Calculate radius as max distance from centroid
        centroid = kmeans.cluster_centers_[i]
        distances = np.sqrt(np.sum((cluster_coords - centroid) ** 2, axis=1))
        radius_deg = float(np.max(distances)) if len(distances) > 0 else 0.01
        radius_km = radius_deg * 111  # rough conversion
        
        total_kg = sum(d.get('quantity_kg', 0) for d in cluster_donations)
        
        clusters.append({
            'id': i,
            'centroid': {'lat': float(centroid[0]), 'lng': float(centroid[1])},
            'radius_km': round(max(radius_km, 0.5), 2),
            'donation_count': int(np.sum(mask)),
            'total_kg': round(total_kg, 1),
            'intensity': round(float(np.sum(mask)) / len(coords), 3),
        })
    
    # Sort by donation count descending
    clusters.sort(key=lambda x: -x['donation_count'])
    
    # Label clusters
    zone_names = ['High-Surplus Zone', 'Active Zone', 'Growing Zone', 'Emerging Zone', 'Low-Activity Zone']
    for i, c in enumerate(clusters):
        c['label'] = zone_names[i] if i < len(zone_names) else f'Zone {i+1}'
    
    _model_data = {
        'model': kmeans,
        'clusters': clusters,
        'n_samples': len(coords),
        'n_clusters': n_clusters,
        'inertia': round(float(kmeans.inertia_), 4),
    }
    
    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(_model_data, f)
    
    return _model_data


def get_clusters():
    """Return cluster data for the API."""
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    if _model_data:
        return {
            'clusters': _model_data['clusters'],
            'n_samples': _model_data['n_samples'],
            'n_clusters': _model_data['n_clusters'],
            'inertia': _model_data['inertia'],
            'model_type': 'KMeans',
        }
    return {'clusters': [], 'n_samples': 0, 'n_clusters': 0}


def get_model_info():
    """Return model metadata."""
    data = get_clusters()
    return {
        'status': 'trained' if data['n_samples'] > 0 else 'not_trained',
        'model_type': 'KMeans',
        'n_clusters': data['n_clusters'],
        'n_samples': data['n_samples'],
        'inertia': data.get('inertia', 0),
    }
