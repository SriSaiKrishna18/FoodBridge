"""
Collaborative Filtering for Receiver Preference Learning — FoodBridge
Uses cosine similarity on acceptance history to boost match scores
"""
import os
import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'collab_filter.pkl')

CATEGORIES = ['cooked', 'raw', 'packaged', 'dairy', 'bakery', 'fruits_vegetables', 'beverages']
CAT_INDEX = {c: i for i, c in enumerate(CATEGORIES)}

_model_data = None


def build_preference_matrix(match_history):
    """
    Build receiver × food_category acceptance matrix.
    match_history: list of dicts with 'receiver_id', 'food_category', 'is_accepted'
    """
    global _model_data
    
    # Collect unique receivers
    receiver_ids = sorted(set(m['receiver_id'] for m in match_history))
    receiver_index = {rid: i for i, rid in enumerate(receiver_ids)}
    
    n_receivers = len(receiver_ids)
    n_categories = len(CATEGORIES)
    
    # Build acceptance matrix (count-based)
    acceptance_matrix = np.zeros((n_receivers, n_categories))
    total_matrix = np.zeros((n_receivers, n_categories))
    
    for m in match_history:
        rid = m['receiver_id']
        cat = m.get('food_category', 'other')
        if rid in receiver_index and cat in CAT_INDEX:
            i = receiver_index[rid]
            j = CAT_INDEX[cat]
            total_matrix[i, j] += 1
            if m.get('is_accepted', True):
                acceptance_matrix[i, j] += 1
    
    # Convert to acceptance rate (with Laplace smoothing)
    rate_matrix = (acceptance_matrix + 1) / (total_matrix + 2)
    
    # Compute similarity matrix
    similarity = cosine_similarity(rate_matrix)
    
    _model_data = {
        'rate_matrix': rate_matrix,
        'similarity': similarity,
        'receiver_ids': receiver_ids,
        'receiver_index': receiver_index,
        'n_receivers': n_receivers,
        'n_matches_used': len(match_history),
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(_model_data, f)
    
    print(f"[OK] Collaborative filter trained: {n_receivers} receivers, {len(match_history)} matches")
    return _model_data


def preference_boost(receiver_id, food_category):
    """
    Returns a preference score (0.0–1.0) for how likely this receiver
    will accept this food category, based on their history and similar receivers.
    """
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    if not _model_data or receiver_id not in _model_data.get('receiver_index', {}):
        return 0.7  # Default neutral score
    
    idx = _model_data['receiver_index'][receiver_id]
    cat_idx = CAT_INDEX.get(food_category)
    
    if cat_idx is None:
        return 0.7
    
    # Direct preference
    direct_pref = float(_model_data['rate_matrix'][idx, cat_idx])
    
    # Similar-receiver weighted preference
    sim_scores = _model_data['similarity'][idx]
    # Top 3 most similar receivers (excluding self)
    similar_indices = np.argsort(sim_scores)[-4:-1]  # Exclude self (highest)
    
    if len(similar_indices) > 0:
        similar_prefs = _model_data['rate_matrix'][similar_indices, cat_idx]
        weighted = np.average(similar_prefs, weights=sim_scores[similar_indices] + 0.01)
        # Blend: 70% direct, 30% collaborative
        final_score = 0.7 * direct_pref + 0.3 * float(weighted)
    else:
        final_score = direct_pref
    
    return round(max(0.0, min(1.0, final_score)), 3)


def get_preference_explanation(receiver_id, food_category):
    """
    Generate human-readable explanation for the preference score.
    """
    global _model_data
    if _model_data is None:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                _model_data = pickle.load(f)
    
    if not _model_data or receiver_id not in _model_data.get('receiver_index', {}):
        return "No historical data available for preference analysis"
    
    idx = _model_data['receiver_index'][receiver_id]
    cat_idx = CAT_INDEX.get(food_category)
    
    if cat_idx is None:
        return "Unknown food category"
    
    rate = _model_data['rate_matrix'][idx, cat_idx]
    n_matches = _model_data['n_matches_used']
    
    # Find similar receivers count
    sim_scores = _model_data['similarity'][idx]
    n_similar = int(np.sum(sim_scores > 0.7)) - 1  # Exclude self
    
    pct = int(rate * 100)
    return f"Based on {n_matches} past interactions, this receiver has a {pct}% acceptance rate for {food_category} food. {n_similar} similar receivers also show strong preference."


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
            'model_type': 'Collaborative Filter (Cosine Similarity)',
            'purpose': 'Receiver Preference Learning',
            'n_receivers': _model_data['n_receivers'],
            'n_matches_used': _model_data['n_matches_used'],
            'categories': CATEGORIES,
        }
    return {'status': 'not_trained', 'model_type': 'Collaborative Filter'}
