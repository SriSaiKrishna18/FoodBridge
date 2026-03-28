"""
Geographic Hotspot Clustering for FoodBridge
Uses KMeans to identify food waste hotspot zones in Chennai
Trained on 2,000 synthetic geo-samples
"""
import os
import pickle
import numpy as np
from sklearn.cluster import KMeans

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'cluster_model.pkl')

_model_data = None


def generate_synthetic_geo_data(n=2000):
    """
    Generate 2,000 synthetic donation geo-coordinates in Chennai.
    Models real-world donation density: restaurants, caterers, hotels, canteens.
    """
    np.random.seed(42)

    # Real Chennai hotspot centers (weighted by expected food surplus density)
    hotspots = [
        {'lat': 13.0418, 'lng': 80.2341, 'weight': 0.18, 'spread': 0.015},  # T. Nagar
        {'lat': 13.0067, 'lng': 80.2572, 'weight': 0.12, 'spread': 0.012},  # Adyar
        {'lat': 13.0850, 'lng': 80.2101, 'weight': 0.10, 'spread': 0.018},  # Anna Nagar
        {'lat': 12.9815, 'lng': 80.2180, 'weight': 0.08, 'spread': 0.014},  # Velachery
        {'lat': 13.0368, 'lng': 80.2676, 'weight': 0.09, 'spread': 0.010},  # Mylapore
        {'lat': 12.9830, 'lng': 80.2594, 'weight': 0.07, 'spread': 0.012},  # Thiruvanmiyur
        {'lat': 13.0067, 'lng': 80.2206, 'weight': 0.08, 'spread': 0.016},  # Guindy
        {'lat': 12.9249, 'lng': 80.1000, 'weight': 0.06, 'spread': 0.020},  # Tambaram
        {'lat': 13.0382, 'lng': 80.1564, 'weight': 0.06, 'spread': 0.015},  # Porur
        {'lat': 12.9516, 'lng': 80.1462, 'weight': 0.05, 'spread': 0.012},  # Chromepet
        {'lat': 12.9010, 'lng': 80.2279, 'weight': 0.06, 'spread': 0.018},  # Sholinganallur
        {'lat': 12.9200, 'lng': 80.2300, 'weight': 0.05, 'spread': 0.015},  # OMR
    ]

    # Normalize weights
    total_weight = sum(h['weight'] for h in hotspots)
    for h in hotspots:
        h['weight'] /= total_weight

    data = []
    for h in hotspots:
        count = int(n * h['weight'])
        lats = np.random.normal(h['lat'], h['spread'], count)
        lngs = np.random.normal(h['lng'], h['spread'], count)
        qtys = np.random.exponential(12, count) + 2  # quantity_kg
        for lat, lng, qty in zip(lats, lngs, qtys):
            data.append({
                'latitude': float(lat),
                'longitude': float(lng),
                'quantity_kg': round(float(qty), 1),
            })

    # Fill remainder
    while len(data) < n:
        h = hotspots[np.random.randint(len(hotspots))]
        data.append({
            'latitude': float(np.random.normal(h['lat'], h['spread'])),
            'longitude': float(np.random.normal(h['lng'], h['spread'])),
            'quantity_kg': round(float(np.random.exponential(10) + 2), 1),
        })

    np.random.shuffle(data)
    return data[:n]


def train_clusters(donations_data=None):
    """
    Train KMeans on donation lat/lng to identify hotspot zones.
    If no data provided, generates 2,000 synthetic samples.
    """
    global _model_data

    if donations_data is None or len(donations_data) < 100:
        print("[CLUSTER] Generating 2,000 synthetic geo-samples for training...")
        donations_data = generate_synthetic_geo_data(2000)

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

    print(f"[OK] Cluster model trained: {len(coords)} samples, {n_clusters} clusters, inertia={kmeans.inertia_:.4f}")
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
