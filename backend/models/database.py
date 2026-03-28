"""
SQLAlchemy Database Models for FoodBridge
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./foodbridge.db")

# Render provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Enums ──────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    DONOR = "donor"
    RECEIVER = "receiver"
    ADMIN = "admin"

class DonationStatus(str, enum.Enum):
    AVAILABLE = "available"
    MATCHED = "matched"
    PICKED_UP = "picked_up"
    DELIVERED = "delivered"
    EXPIRED = "expired"

class FoodCategory(str, enum.Enum):
    COOKED = "cooked"
    RAW = "raw"
    PACKAGED = "packaged"
    DAIRY = "dairy"
    BAKERY = "bakery"
    FRUITS_VEGETABLES = "fruits_vegetables"
    BEVERAGES = "beverages"
    OTHER = "other"

class StorageType(str, enum.Enum):
    ROOM_TEMP = "room_temp"
    REFRIGERATED = "refrigerated"
    FROZEN = "frozen"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TransportMode(str, enum.Enum):
    DONOR_DELIVERS = "donor_delivers"
    RECEIVER_PICKS_UP = "receiver_picks_up"
    BOTH = "both"


# ── Models ─────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.DONOR)
    phone = Column(String(20))
    organization = Column(String(200))
    address = Column(Text)
    latitude = Column(Float, default=13.01)   # Default: Chennai area
    longitude = Column(Float, default=80.23)
    reliability_score = Column(Float, default=0.8)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("Donation", back_populates="donor")
    received_matches = relationship("Match", back_populates="receiver")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    food_category = Column(String(30), default=FoodCategory.COOKED)
    quantity_kg = Column(Float, nullable=False)
    serves = Column(Integer, default=1)
    storage_type = Column(String(20), default=StorageType.ROOM_TEMP)
    prepared_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    status = Column(String(20), default=DonationStatus.AVAILABLE)
    spoilage_risk = Column(String(10), default=RiskLevel.LOW)
    spoilage_score = Column(Float, default=0.0)
    redistribution_window_hours = Column(Float, default=6.0)
    image_url = Column(String(500))
    transport_mode = Column(String(30), default=TransportMode.RECEIVER_PICKS_UP)
    created_at = Column(DateTime, default=datetime.utcnow)

    donor = relationship("User", back_populates="donations")
    matches = relationship("Match", back_populates="donation")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=False)
    distance_km = Column(Float)
    is_accepted = Column(Boolean, default=False)
    accepted_at = Column(DateTime)
    picked_up_at = Column(DateTime)
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    donation = relationship("Donation", back_populates="matches")
    receiver = relationship("User", back_populates="received_matches")


class ImpactLog(Base):
    __tablename__ = "impact_logs"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id"))
    food_kg_saved = Column(Float, default=0.0)
    co2_kg_prevented = Column(Float, default=0.0)  # 1 kg food = 2.5 kg CO2
    families_fed = Column(Integer, default=0)
    distance_saved_km = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# ── Database Helpers ───────────────────────────────────────
def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
