"""
Pydantic Schemas for FoodBridge API
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth Schemas ───────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "donor"
    phone: Optional[str] = None
    organization: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = 13.01
    longitude: Optional[float] = 80.23

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    organization: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reliability_score: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Donation Schemas ───────────────────────────────────────
class DonationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    food_category: str = "cooked"
    quantity_kg: float
    serves: Optional[int] = 1
    storage_type: str = "room_temp"
    transport_mode: str = "receiver_picks_up"  # donor_delivers | receiver_picks_up | both
    prepared_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

class DonationResponse(BaseModel):
    id: int
    donor_id: int
    title: str
    description: Optional[str] = None
    food_category: str
    quantity_kg: float
    serves: Optional[int] = None
    storage_type: str
    prepared_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    status: str
    spoilage_risk: Optional[str] = None
    spoilage_score: Optional[float] = None
    redistribution_window_hours: Optional[float] = None
    transport_mode: Optional[str] = None
    created_at: Optional[datetime] = None
    donor: Optional[UserResponse] = None
    is_anomaly: Optional[bool] = None
    anomaly_score: Optional[float] = None
    anomaly_reason: Optional[str] = None

    class Config:
        from_attributes = True


# ── Match Schemas ──────────────────────────────────────────
class MatchResponse(BaseModel):
    id: int
    donation_id: int
    receiver_id: int
    match_score: float
    distance_km: Optional[float] = None
    is_accepted: bool
    receiver: Optional[UserResponse] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MatchAccept(BaseModel):
    match_id: int


# ── Spoilage Schemas ───────────────────────────────────────
class SpoilageRequest(BaseModel):
    food_category: str = "cooked"
    storage_type: str = "room_temp"
    hours_since_preparation: float = 2.0
    ambient_temperature: float = 30.0

class SpoilageResponse(BaseModel):
    risk_level: str
    risk_score: float
    recommendation: str
    redistribute_within_hours: float
    confidence: Optional[float] = None
    model_used: Optional[str] = None


# ── NLP Schemas ────────────────────────────────────────────
class CategorizeRequest(BaseModel):
    text: str

class CategorizeResponse(BaseModel):
    food_category: str
    detected_items: List[str]
    estimated_quantity: str
    estimated_quantity_kg: float = 5.0
    confidence: float


# ── Route Schemas ──────────────────────────────────────────
class RouteRequest(BaseModel):
    locations: List[dict]  # [{lat, lng, label}]

class RouteResponse(BaseModel):
    optimized_order: List[dict]
    total_distance_km: float
    distance_saved_km: float
    co2_saved_kg: float


# ── Impact Schemas ─────────────────────────────────────────
class ImpactResponse(BaseModel):
    total_food_kg_saved: float
    total_co2_prevented: float
    total_families_fed: int
    total_donations: int
    total_matches: int
    avg_match_time_minutes: float
    total_distance_saved_km: float


# ── Review Schemas ─────────────────────────────────────
class ReviewCreate(BaseModel):
    reviewee_id: int
    donation_id: int
    rating: int  # 1–5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewee_id: int
    donation_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
