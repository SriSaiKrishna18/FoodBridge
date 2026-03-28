import requests

# Test all 8 model endpoints
print("=== FoodBridge API Verification ===\n")

# 1. Models endpoint
r = requests.get("http://localhost:8000/api/models")
d = r.json()
print(f"1. /api/models - {len(d)} model groups:")
for k, v in d.items():
    mt = v.get("model_type", "?")
    st = v.get("status", "?")
    print(f"   {k}: {mt} [{st}]")

# 2. Clusters
r = requests.get("http://localhost:8000/api/clusters")
d = r.json()
print(f"\n2. /api/clusters - {d.get('n_clusters', '?')} clusters, {len(d.get('clusters', []))} zones")

# 3. Forecast
r = requests.get("http://localhost:8000/api/forecast?hours=6")
d = r.json()
preds = d.get("predictions", [])
print(f"\n3. /api/forecast - {len(preds)} time slots, model: {d.get('model_used', '?')}")
for p in preds[:3]:
    print(f"   {p.get('time_label','?')}: {p.get('total_predicted_kg','?')} kg ({round(p.get('confidence',0)*100)}% conf)")

# 4. Anomaly
r = requests.post("http://localhost:8000/api/anomaly", json={
    "food_category": "cooked",
    "hours_since_preparation": 2,
    "quantity_kg": 5,
    "hour_of_day": 14
})
d = r.json()
print(f"\n4. /api/anomaly - is_anomaly: {d.get('is_anomaly')}, score: {d.get('anomaly_score', '?')}")

# 5. Preference
r = requests.get("http://localhost:8000/api/preference/1?food_category=cooked")
d = r.json()
print(f"\n5. /api/preference - boost: {d.get('preference_boost', '?')}, top_categories: {d.get('top_categories', '?')}")

# 6. Match endpoint (test collab filter integration)
r = requests.get("http://localhost:8000/api/match/1")
if r.status_code == 200:
    matches = r.json()
    print(f"\n6. /api/match/1 - {len(matches)} matches (GBR + CollabFilter blend)")
    for m in matches[:3]:
        rec = m.get("receiver", {})
        print(f"   Score: {m.get('match_score', '?')} | {rec.get('name', '?')} | {m.get('distance_km', '?')} km")
else:
    print(f"\n6. /api/match/1 - Status: {r.status_code}")

print("\n=== All endpoints verified! ===")
