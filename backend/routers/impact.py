"""
Impact Metrics Router for FoodBridge
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models.database import get_db, ImpactLog, Donation, Match
from backend.models.schemas import ImpactResponse

router = APIRouter(prefix="/api/impact", tags=["Impact Metrics"])


@router.get("/", response_model=ImpactResponse)
def get_impact(db: Session = Depends(get_db)):
    """Get aggregated environmental impact metrics."""
    total_food = db.query(func.sum(ImpactLog.food_kg_saved)).scalar() or 0
    total_co2 = db.query(func.sum(ImpactLog.co2_kg_prevented)).scalar() or 0
    total_families = db.query(func.sum(ImpactLog.families_fed)).scalar() or 0
    total_distance = db.query(func.sum(ImpactLog.distance_saved_km)).scalar() or 0
    total_donations = db.query(func.count(Donation.id)).scalar() or 0
    total_matches = db.query(func.count(Match.id)).filter(Match.is_accepted == True).scalar() or 0

    # Average match time (in minutes) — from donation creation to match acceptance
    avg_match_time = 15.0  # Default demo value
    accepted = db.query(Match).filter(Match.is_accepted == True, Match.accepted_at != None).all()
    if accepted:
        times = []
        for m in accepted:
            donation = db.query(Donation).filter(Donation.id == m.donation_id).first()
            if donation and m.accepted_at and donation.created_at:
                diff = (m.accepted_at - donation.created_at).total_seconds() / 60
                times.append(diff)
        if times:
            avg_match_time = sum(times) / len(times)

    return ImpactResponse(
        total_food_kg_saved=round(total_food, 1),
        total_co2_prevented=round(total_co2, 1),
        total_families_fed=int(total_families),
        total_donations=total_donations,
        total_matches=total_matches,
        avg_match_time_minutes=round(avg_match_time, 1),
        total_distance_saved_km=round(total_distance, 1),
    )
