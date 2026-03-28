"""
Route Optimizer for FoodBridge
Greedy TSP (Nearest Neighbor) for optimizing pickup routes
"""
import math
from typing import List, Dict


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS coordinates in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def compute_distance_matrix(locations: List[Dict]) -> List[List[float]]:
    """Compute pairwise distance matrix for all locations."""
    n = len(locations)
    matrix = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i+1, n):
            d = haversine_distance(
                locations[i]["lat"], locations[i]["lng"],
                locations[j]["lat"], locations[j]["lng"]
            )
            matrix[i][j] = d
            matrix[j][i] = d
    return matrix


def nearest_neighbor_tsp(locations: List[Dict]) -> Dict:
    """
    Solve TSP using Nearest Neighbor greedy algorithm.
    
    Args:
        locations: List of dicts with {lat, lng, label}
    
    Returns:
        dict with optimized_order, total_distance_km, distance_saved_km, co2_saved_kg
    """
    if len(locations) <= 1:
        return {
            "optimized_order": locations,
            "total_distance_km": 0.0,
            "distance_saved_km": 0.0,
            "co2_saved_kg": 0.0,
        }

    n = len(locations)
    dist_matrix = compute_distance_matrix(locations)

    # Calculate naive (original order) distance
    naive_distance = sum(dist_matrix[i][i+1] for i in range(n-1))

    # Nearest Neighbor from node 0
    visited = [False] * n
    order = [0]
    visited[0] = True
    total_distance = 0.0

    for _ in range(n - 1):
        current = order[-1]
        nearest = -1
        nearest_dist = float('inf')
        for j in range(n):
            if not visited[j] and dist_matrix[current][j] < nearest_dist:
                nearest = j
                nearest_dist = dist_matrix[current][j]
        order.append(nearest)
        visited[nearest] = True
        total_distance += nearest_dist

    optimized_locations = [locations[i] for i in order]
    distance_saved = max(0, naive_distance - total_distance)

    # CO2 calculation: avg vehicle emits 0.12 kg CO2 per km
    co2_saved = distance_saved * 0.12

    return {
        "optimized_order": optimized_locations,
        "total_distance_km": round(total_distance, 2),
        "distance_saved_km": round(distance_saved, 2),
        "co2_saved_kg": round(co2_saved, 3),
    }
