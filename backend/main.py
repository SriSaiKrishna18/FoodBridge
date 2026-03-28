"""
FoodBridge — FastAPI Application Entry Point
AI-Powered Surplus Food Redistribution Platform
"""
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import json
import asyncio
import os
import uuid
import shutil
from pathlib import Path
from typing import List

from backend.models.database import create_tables, get_db, User, Donation, Match, ImpactLog
from backend.models.schemas import SpoilageRequest, SpoilageResponse, CategorizeRequest, CategorizeResponse, RouteRequest, RouteResponse
from backend.routers import auth, donations, matching, impact
from backend.routers.auth import hash_password
from backend.ml.spoilage import predict_spoilage, get_model_info as spoilage_model_info
from backend.ml.matcher import get_model_info as matcher_model_info
from backend.ml.nlp_categorizer import categorize_food
from backend.ml.route_optimizer import nearest_neighbor_tsp
from backend.ml.clustering import train_clusters, get_clusters, get_model_info as cluster_model_info
from backend.ml.anomaly_detector import train_anomaly_detector, detect_anomaly, get_model_info as anomaly_model_info
from backend.ml.forecaster import train_forecast_model, forecast_next_hours, get_model_info as forecast_model_info
from backend.ml.collaborative_filter import build_preference_matrix, preference_boost, get_preference_explanation, get_model_info as collab_model_info
from backend.data.synthetic_train import CHENNAI_LOCATIONS, RECEIVER_LOCATIONS, FOOD_ITEMS


# ── App Setup ──────────────────────────────────────────────
app = FastAPI(
    title="FoodBridge API",
    description="🌱 AI-Powered Surplus Food Redistribution Platform — Vashisht Hackathon 3.0 EcoTech",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────
app.include_router(auth.router)
app.include_router(donations.router)
app.include_router(matching.router)
app.include_router(impact.router)

# ── Static file serving for uploads ────────────────────────
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.post("/api/upload")
async def upload_photo(file: UploadFile = File(...)):
    """Upload a food photo. Returns the URL path."""
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {"url": f"/uploads/{filename}", "filename": filename}


@app.get("/api/surplus-prediction")
def surplus_prediction():
    """Predictive surplus based on day-of-week patterns."""
    from datetime import datetime
    now = datetime.now()
    day = now.strftime('%A')
    hour = now.hour
    
    predictions = {
        'Friday': {'window': '7:00 - 10:00 PM', 'expected_kg': '8-12', 'sources': 'T. Nagar restaurants, Adyar hotels', 'receivers_ready': 6, 'confidence': 0.83},
        'Saturday': {'window': '12:00 - 3:00 PM', 'expected_kg': '10-15', 'sources': 'Wedding halls, catering services', 'receivers_ready': 8, 'confidence': 0.78},
        'Sunday': {'window': '8:00 - 11:00 AM', 'expected_kg': '5-8', 'sources': 'Temple prasad, community kitchens', 'receivers_ready': 4, 'confidence': 0.85},
    }
    
    default = {'window': '6:00 - 9:00 PM', 'expected_kg': '5-8', 'sources': 'Corporate cafeterias, school canteens', 'receivers_ready': 5, 'confidence': 0.72}
    pred = predictions.get(day, default)
    pred['day'] = day
    pred['generated_at'] = now.isoformat()
    return pred


@app.post("/api/reviews")
def create_review(data: dict, db: Session = Depends(get_db)):
    """Create a review/rating for a completed delivery."""
    from backend.models.database import Review
    review = Review(
        reviewer_id=data.get("reviewer_id", 1),
        reviewee_id=data.get("reviewee_id", 1),
        donation_id=data.get("donation_id", 1),
        rating=max(1, min(5, data.get("rating", 5))),
        comment=data.get("comment", ""),
    )
    db.add(review)
    db.commit()
    return {"message": "Review submitted", "rating": review.rating}


@app.get("/api/reviews/{user_id}")
def get_reviews(user_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a user."""
    from backend.models.database import Review
    reviews = db.query(Review).filter(Review.reviewee_id == user_id).all()
    avg = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    return {
        "user_id": user_id,
        "avg_rating": round(avg, 1),
        "total_reviews": len(reviews),
        "reviews": [{"rating": r.rating, "comment": r.comment, "created_at": str(r.created_at)} for r in reviews],
    }


@app.post("/api/cleanup-expired")
def cleanup_expired(db: Session = Depends(get_db)):
    """Auto-expire donations past their AI-predicted shelf life."""
    now = datetime.utcnow()
    expired = db.query(Donation).filter(
        Donation.status == "available",
        Donation.expires_at != None,
        Donation.expires_at < now,
    ).all()
    count = 0
    for d in expired:
        d.status = "expired"
        count += 1
    db.commit()
    return {"expired_count": count, "message": f"Marked {count} donations as expired"}


# ── WebSocket Manager ─────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Store manager globally so routers can access it
app.state.ws_manager = manager


# ── Direct ML Endpoints ───────────────────────────────────
@app.post("/api/spoilage", response_model=SpoilageResponse, tags=["AI - Spoilage"])
def spoilage_endpoint(data: SpoilageRequest):
    """Predict spoilage risk using trained RandomForest model."""
    result = predict_spoilage(
        food_category=data.food_category,
        storage_type=data.storage_type,
        hours_since_preparation=data.hours_since_preparation,
        ambient_temperature=data.ambient_temperature,
    )
    return SpoilageResponse(**result)


@app.post("/api/categorize", response_model=CategorizeResponse, tags=["AI - NLP"])
def categorize_endpoint(data: CategorizeRequest):
    """NLP auto-categorize food from text description."""
    result = categorize_food(data.text)
    return CategorizeResponse(**result)


@app.post("/api/route", response_model=RouteResponse, tags=["AI - Route"])
def route_endpoint(data: RouteRequest):
    """Optimize pickup route using TSP algorithm."""
    result = nearest_neighbor_tsp(data.locations)
    return RouteResponse(**result)


# ── New ML Endpoints ──────────────────────────────────────
@app.get("/api/clusters", tags=["AI - Clustering"])
def clusters_endpoint(db: Session = Depends(get_db)):
    """Get geographic hotspot clusters identified by KMeans."""
    data = get_clusters()
    if not data['clusters']:
        # Train on the fly if not yet trained
        donations = db.query(Donation).filter(Donation.latitude != None).all()
        train_data = [{'latitude': d.latitude, 'longitude': d.longitude, 'quantity_kg': d.quantity_kg} for d in donations]
        train_clusters(train_data)
        data = get_clusters()
    return data


@app.get("/api/forecast", tags=["AI - Forecasting"])
def forecast_endpoint(hours: int = 6):
    """Predict expected donation volume for the next N hours using trained GBR."""
    return forecast_next_hours(min(hours, 12))


@app.post("/api/anomaly", tags=["AI - Anomaly Detection"])
def anomaly_endpoint(data: dict):
    """Check if a donation listing is anomalous using IsolationForest."""
    from datetime import datetime
    result = detect_anomaly(
        food_category=data.get('food_category', 'other'),
        hours_since_preparation=data.get('hours_since_preparation', 2),
        quantity_kg=data.get('quantity_kg', 5),
        hour_of_day=data.get('hour_of_day', datetime.now().hour),
    )
    return result


@app.get("/api/preference/{receiver_id}", tags=["AI - Collaborative Filter"])
def preference_endpoint(receiver_id: int, food_category: str = "cooked"):
    """Get receiver preference score for a food category using collaborative filtering."""
    score = preference_boost(receiver_id, food_category)
    explanation = get_preference_explanation(receiver_id, food_category)
    return {
        'receiver_id': receiver_id,
        'food_category': food_category,
        'preference_score': score,
        'explanation': explanation,
    }


# ── ML Model Info (for demo) ──────────────────────────────
@app.get("/api/models", tags=["AI - Models"])
def model_info():
    """Return trained model metadata — feature importances, accuracy, etc. All 6 models."""
    return {
        "matching_model": matcher_model_info(),
        "spoilage_model": spoilage_model_info(),
        "clustering_model": cluster_model_info(),
        "anomaly_model": anomaly_model_info(),
        "forecast_model": forecast_model_info(),
        "collaborative_filter": collab_model_info(),
    }


# ── Health Check ───────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "name": "FoodBridge API",
        "version": "2.0.0",
        "status": "running",
        "ai_models": "6 trained ML models loaded (Matcher, Spoilage, Clustering, Anomaly, Forecast, CollabFilter)",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ── Database Seed (MASSIVE — for impressive demo) ─────────
EXTRA_DONATIONS = [
    {"title": "Corporate lunch surplus — 50 packets",        "desc": "Rice, dal, sabzi combo — sealed packs", "cat": "cooked",  "qty": 25.0, "serves": 50},
    {"title": "Wedding buffet — biryani, kurma, desserts",   "desc": "Veg/non-veg biryani, paneer kurma, gulab jamun", "cat": "cooked",  "qty": 40.0, "serves": 120},
    {"title": "School canteen — unused sandwiches",           "desc": "Veg sandwiches and juice boxes",        "cat": "bakery",  "qty": 8.0,  "serves": 30},
    {"title": "Supermarket — near-expiry dairy",              "desc": "Milk, curd, paneer — 2 days to expiry", "cat": "dairy",   "qty": 15.0, "serves": 25},
    {"title": "Birthday party leftovers",                     "desc": "Cake, pasta, garlic bread, cold drinks","cat": "bakery",  "qty": 12.0, "serves": 40},
    {"title": "Restaurant closing stock — today's menu",      "desc": "Thali meals, fried rice, noodles",      "cat": "cooked",  "qty": 18.0, "serves": 50},
    {"title": "Fresh fruit basket — wholesale excess",        "desc": "Bananas, oranges, apples, pomegranate", "cat": "fruits_vegetables", "qty": 30.0, "serves": 60},
    {"title": "College hostel mess — dinner surplus",         "desc": "Chapati, rajma, rice, curd",            "cat": "cooked",  "qty": 22.0, "serves": 70},
    {"title": "Temple prasadam — festival special",           "desc": "Sweet pongal, curd rice, vadai",        "cat": "cooked",  "qty": 35.0, "serves": 100},
    {"title": "Bakery — unsold bread and cakes",              "desc": "Whole wheat bread, muffins, mini cakes","cat": "bakery",  "qty": 10.0, "serves": 35},
    {"title": "Juice shop — fresh juice surplus",             "desc": "Mango, orange, pomegranate juice",      "cat": "beverages","qty": 12.0, "serves": 40},
    {"title": "IT park cafeteria — lunch overflow",           "desc": "Meals, salads, soup, fruit bowls",      "cat": "cooked",  "qty": 20.0, "serves": 60},
    {"title": "Catering return — engagement ceremony",        "desc": "Full meals with dessert and starters",  "cat": "cooked",  "qty": 45.0, "serves": 150},
    {"title": "Vegetable market — closing stock",             "desc": "Mixed vegetables, leafy greens",        "cat": "fruits_vegetables", "qty": 25.0, "serves": 50},
    {"title": "Packaged snacks from cancelled event",         "desc": "Chips, namkeen, biscuits, juice boxes", "cat": "packaged","qty": 15.0, "serves": 80},
    {"title": "Milk booth — unsold evening stock",            "desc": "Fresh toned milk packets",              "cat": "dairy",   "qty": 20.0, "serves": 40},
    {"title": "Chettinad restaurant — weekend surplus",       "desc": "Chicken biryani, mutton curry, appam",  "cat": "cooked",  "qty": 30.0, "serves": 90},
    {"title": "Organic farm — harvest surplus tomatoes",      "desc": "Fresh organic tomatoes, 3 days shelf life","cat": "fruits_vegetables", "qty": 18.0, "serves": 40},
]


def seed_database():
    """Seed the database with MASSIVE demo data for impressive impact numbers."""
    from backend.models.database import SessionLocal
    db = SessionLocal()

    if db.query(User).count() > 0:
        db.close()
        return

    print("[SEED] Seeding database with realistic demo data...")

    # Create donor users
    donors = []
    for i, loc in enumerate(CHENNAI_LOCATIONS):
        user = User(
            name=f"{loc['name']} {loc['type'].title()}",
            email=f"donor{i+1}@foodbridge.in",
            hashed_password=hash_password("password123"),
            role="donor",
            organization=f"{loc['name']} {loc['type'].title()}",
            address=f"{loc['name']}, Chennai",
            latitude=loc["lat"],
            longitude=loc["lng"],
            reliability_score=round(random.uniform(0.7, 1.0), 2),
        )
        db.add(user)
        donors.append(user)

    # Create receiver users
    receivers = []
    for i, loc in enumerate(RECEIVER_LOCATIONS):
        user = User(
            name=loc["name"],
            email=f"receiver{i+1}@foodbridge.in",
            hashed_password=hash_password("password123"),
            role="receiver",
            organization=loc["name"],
            address=f"{loc['name']}, Chennai",
            latitude=loc["lat"],
            longitude=loc["lng"],
            reliability_score=round(random.uniform(0.75, 1.0), 2),
        )
        db.add(user)
        receivers.append(user)

    admin = User(
        name="Admin",
        email="admin@foodbridge.in",
        hashed_password=hash_password("admin123"),
        role="admin",
        organization="FoodBridge",
        latitude=13.01,
        longitude=80.23,
    )
    db.add(admin)
    db.commit()
    for u in donors + receivers:
        db.refresh(u)

    # Create ALL donations — 3 month history with repeating donations
    ALL_FOOD = FOOD_ITEMS + EXTRA_DONATIONS
    all_donations = []
    
    # Generate 3 months of data (repeat food items across 90 days)
    for batch in range(3):  # 3 months of history
        for i, food in enumerate(ALL_FOOD):
            donor = donors[i % len(donors)]
            days_ago = batch * 30 + random.randint(0, 28)
            hours_ago = random.uniform(0.5, 8)
            prepared_at = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)

            spoilage_result = predict_spoilage(
                food_category=food["cat"],
                storage_type=random.choice(["room_temp", "refrigerated"]),
                hours_since_preparation=hours_ago,
                ambient_temperature=random.uniform(28, 38),
            )

            # 75% delivered, 15% matched, 10% available (recent ones)
            # Ensure first 10 items in batch 0 are always available for demo
            if batch == 0 and i < 10:
                days_ago = 0
                status = "available"
            elif days_ago > 7:
                status = "delivered"
            elif days_ago > 2:
                status = random.choice(["delivered", "matched", "matched"])
            else:
                status = "available"

            qty_mult = random.uniform(0.8, 1.3)  # Vary quantities slightly

            donation = Donation(
                donor_id=donor.id,
                title=food["title"],
                description=food["desc"],
                food_category=food["cat"],
                quantity_kg=round(food["qty"] * qty_mult, 1),
                serves=int(food["serves"] * qty_mult),
                storage_type=random.choice(["room_temp", "refrigerated"]),
                transport_mode=random.choice(["donor_delivers", "receiver_picks_up", "both"]),
                prepared_at=prepared_at,
                expires_at=prepared_at + timedelta(hours=spoilage_result["redistribute_within_hours"]),
                latitude=donor.latitude + random.uniform(-0.008, 0.008),
                longitude=donor.longitude + random.uniform(-0.008, 0.008),
                address=donor.address,
                status=status,
                spoilage_risk=spoilage_result["risk_level"],
                spoilage_score=spoilage_result["risk_score"],
                redistribution_window_hours=spoilage_result["redistribute_within_hours"],
            )
            donation.created_at = prepared_at
            db.add(donation)
            all_donations.append(donation)

    db.commit()
    for d in all_donations:
        db.refresh(d)

    # Create impact logs for delivered + matched donations (MASSIVE numbers)
    delivered = [d for d in all_donations if d.status in ("delivered", "matched")]
    total_kg = 0
    total_co2 = 0
    total_families = 0
    total_distance = 0
    
    for don in delivered:
        # Create match entries
        receiver = random.choice(receivers)
        dist = round(random.uniform(1, 8), 2)
        match = Match(
            donation_id=don.id,
            receiver_id=receiver.id,
            match_score=round(random.uniform(0.65, 0.95), 4),
            distance_km=dist,
            is_accepted=True,
            accepted_at=don.created_at + timedelta(minutes=random.randint(5, 30)),
        )
        db.add(match)

        if don.status == "delivered":
            families = max(1, don.serves // 4)
            dist_saved = round(random.uniform(1, 10), 1)
            impact_log = ImpactLog(
                donation_id=don.id,
                food_kg_saved=don.quantity_kg,
                co2_kg_prevented=don.quantity_kg * 2.5,
                families_fed=families,
                distance_saved_km=dist_saved,
            )
            db.add(impact_log)
            total_kg += don.quantity_kg
            total_co2 += don.quantity_kg * 2.5
            total_families += families
            total_distance += dist_saved

    db.commit()
    db.close()
    print(f"[OK] Database seeded: {len(all_donations)} donations, {len(donors)} donors, {len(receivers)} receivers")
    print(f"   Impact: {total_kg:.0f} kg saved, {total_co2:.0f} kg CO2 prevented, {total_families} families fed, {total_distance:.0f} km saved")


def train_new_ml_models():
    """Train the 4 new ML models on existing database data."""
    from backend.models.database import SessionLocal
    db = SessionLocal()
    try:
        # 1. K-Means Clustering
        donations = db.query(Donation).filter(Donation.latitude != None).all()
        if donations:
            cluster_data = [{'latitude': d.latitude, 'longitude': d.longitude, 'quantity_kg': d.quantity_kg} for d in donations]
            train_clusters(cluster_data)
            print(f"[OK] Cluster model trained on {len(cluster_data)} donations")

        # 2. Anomaly Detection
        if donations:
            anomaly_data = [{
                'food_category': d.food_category,
                'hours_since_preparation': max(0, (datetime.utcnow() - d.prepared_at).total_seconds() / 3600) if d.prepared_at else 2,
                'quantity_kg': d.quantity_kg,
                'hour_of_day': d.created_at.hour if d.created_at else 12,
            } for d in donations]
            train_anomaly_detector(anomaly_data)
            print(f"[OK] Anomaly model trained on {len(anomaly_data)} donations")

        # 3. Demand Forecasting
        if donations:
            forecast_data = [{
                'created_at': d.created_at,
                'food_category': d.food_category,
                'quantity_kg': d.quantity_kg,
            } for d in donations if d.created_at]
            train_forecast_model(forecast_data)

        # 4. Collaborative Filtering
        matches = db.query(Match).all()
        if matches:
            match_history = []
            for m in matches:
                donation = db.query(Donation).filter(Donation.id == m.donation_id).first()
                if donation:
                    match_history.append({
                        'receiver_id': m.receiver_id,
                        'food_category': donation.food_category,
                        'is_accepted': m.is_accepted,
                    })
            if match_history:
                build_preference_matrix(match_history)
    except Exception as e:
        print(f"[WARN] Error training new models: {e}")
    finally:
        db.close()


# ── Startup Event ──────────────────────────────────────────
@app.on_event("startup")
def startup():
    create_tables()
    seed_database()
    train_new_ml_models()
