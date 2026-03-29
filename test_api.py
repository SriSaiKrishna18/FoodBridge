from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from backend.main import app

client = TestClient(app)

print("Testing Main Health...")
response = client.get("/")
print("Health status:", response.status_code)

print("\nTesting NLP Categorize...")
response = client.post("/api/categorize", json={"text": "Leftover 20 kg chicken biryani"})
print("Categorize Result:", response.json())

print("\nTesting Spoilage Fallback/Model...")
response = client.post("/api/spoilage", json={
    "food_category": "cooked",
    "storage_type": "room_temp",
    "hours_since_preparation": 4,
    "ambient_temperature": 32.0
})
print("Spoilage Result:", response.json())
