"""
AI Matching Router for FoodBridge
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.models.database import get_db, Donation, User, Match
from backend.models.schemas import MatchResponse, MatchAccept
from backend.routers.auth import get_current_user
from backend.ml.matcher import rank_receivers

router = APIRouter(prefix="/api/match", tags=["AI Matching"])


@router.get("/{donation_id}", response_model=List[MatchResponse])
def get_matches(donation_id: int, db: Session = Depends(get_db)):
    """Get AI-ranked receiver matches for a donation."""
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Check for existing matches
    existing = db.query(Match).filter(Match.donation_id == donation_id).all()
    if existing:
        for m in existing:
            m.receiver = db.query(User).filter(User.id == m.receiver_id).first()
        return existing

    # Get all receivers
    receivers = db.query(User).filter(User.role == "receiver", User.is_active == True).all()
    if not receivers:
        return []

    # Run AI matching
    ranked = rank_receivers(donation, receivers)

    # Save matches
    matches = []
    for receiver, score, distance in ranked[:10]:  # Top 10
        match = Match(
            donation_id=donation_id,
            receiver_id=receiver.id,
            match_score=round(score, 4),
            distance_km=round(distance, 2),
        )
        db.add(match)
        db.commit()
        db.refresh(match)
        match.receiver = receiver
        matches.append(match)

    return matches


@router.post("/accept")
def accept_match(data: MatchAccept, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Receiver accepts a match."""
    match = db.query(Match).filter(Match.id == data.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your match")

    from datetime import datetime
    match.is_accepted = True
    match.accepted_at = datetime.utcnow()

    # Update donation status
    donation = db.query(Donation).filter(Donation.id == match.donation_id).first()
    if donation:
        donation.status = "matched"

    db.commit()
    return {"message": "Match accepted!", "match_id": match.id}
