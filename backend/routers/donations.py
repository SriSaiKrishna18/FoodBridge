"""
Donation CRUD Router for FoodBridge
With WebSocket broadcast for real-time updates
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio

from backend.models.database import get_db, Donation, User, ImpactLog
from backend.models.schemas import DonationCreate, DonationResponse
from backend.routers.auth import get_current_user
from backend.ml.spoilage import predict_spoilage
from backend.ml.anomaly_detector import detect_anomaly

router = APIRouter(prefix="/api/donations", tags=["Donations"])


@router.post("/", response_model=DonationResponse)
async def create_donation(request: Request, data: DonationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Auto-predict spoilage risk
    hours_since = 0
    if data.prepared_at:
        hours_since = (datetime.utcnow() - data.prepared_at).total_seconds() / 3600
    
    spoilage_result = predict_spoilage(
        food_category=data.food_category,
        storage_type=data.storage_type,
        hours_since_preparation=hours_since,
        ambient_temperature=30.0
    )

    # Run anomaly detection (IsolationForest)
    anomaly_result = detect_anomaly(
        food_category=data.food_category,
        hours_since_preparation=hours_since,
        quantity_kg=data.quantity_kg,
        hour_of_day=datetime.now().hour,
    )

    donation = Donation(
        donor_id=current_user.id,
        title=data.title,
        description=data.description,
        food_category=data.food_category,
        quantity_kg=data.quantity_kg,
        serves=data.serves or 1,
        storage_type=data.storage_type,
        transport_mode=data.transport_mode or 'receiver_picks_up',
        prepared_at=data.prepared_at or datetime.utcnow(),
        expires_at=data.expires_at or (datetime.utcnow() + timedelta(hours=spoilage_result["redistribute_within_hours"])),
        latitude=data.latitude or current_user.latitude,
        longitude=data.longitude or current_user.longitude,
        address=data.address or current_user.address,
        spoilage_risk=spoilage_result["risk_level"],
        spoilage_score=spoilage_result["risk_score"],
        redistribution_window_hours=spoilage_result["redistribute_within_hours"],
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    # ── WebSocket broadcast: new donation ──
    try:
        ws_manager = request.app.state.ws_manager
        await ws_manager.broadcast({
            "type": "new_donation",
            "data": {
                "id": donation.id,
                "title": donation.title,
                "food_category": donation.food_category,
                "quantity_kg": donation.quantity_kg,
                "serves": donation.serves,
                "spoilage_risk": donation.spoilage_risk,
                "latitude": donation.latitude,
                "longitude": donation.longitude,
                "donor_name": current_user.name,
                "timestamp": datetime.utcnow().isoformat(),
                "anomaly_flagged": anomaly_result.get("is_anomaly", False),
                "anomaly_reason": anomaly_result.get("reason", ""),
            }
        })
    except Exception:
        pass  # Don't fail donation creation if WS broadcast fails

    return donation


@router.get("/", response_model=List[DonationResponse])
def list_donations(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Donation).options(joinedload(Donation.donor))
    if status:
        query = query.filter(Donation.status == status)
    if category:
        query = query.filter(Donation.food_category == category)
    return query.order_by(Donation.created_at.desc()).limit(limit).all()


@router.get("/available", response_model=List[DonationResponse])
def list_available(db: Session = Depends(get_db)):
    return db.query(Donation).options(joinedload(Donation.donor)).filter(
        Donation.status == "available"
    ).order_by(Donation.created_at.desc()).all()


@router.get("/my/donations", response_model=List[DonationResponse])
def my_donations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    donations = db.query(Donation).filter(Donation.donor_id == current_user.id).order_by(Donation.created_at.desc()).all()
    
    # Enrich with anomaly detection
    from backend.ml.anomaly_detector import detect_anomaly
    from datetime import datetime
    for d in donations:
        hours_since = max(0, (datetime.utcnow() - d.prepared_at).total_seconds() / 3600) if d.prepared_at else 2
        anomaly_result = detect_anomaly(
            food_category=d.food_category or 'cooked',
            hours_since_preparation=hours_since,
            quantity_kg=d.quantity_kg,
            hour_of_day=d.created_at.hour if d.created_at else 12,
        )
        d.is_anomaly = anomaly_result['is_anomaly']
        d.anomaly_score = anomaly_result['anomaly_score']
        d.anomaly_reason = anomaly_result['reason']
        
    return donations


@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(donation_id: int, db: Session = Depends(get_db)):
    donation = db.query(Donation).options(joinedload(Donation.donor)).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation


@router.put("/{donation_id}/status")
async def update_donation_status(request: Request, donation_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    donation.status = status

    # Log impact when delivered
    if status == "delivered":
        impact = ImpactLog(
            donation_id=donation_id,
            food_kg_saved=donation.quantity_kg,
            co2_kg_prevented=donation.quantity_kg * 2.5,
            families_fed=max(1, donation.serves // 4),
        )
        db.add(impact)

    db.commit()

    # Broadcast status change
    try:
        ws_manager = request.app.state.ws_manager
        await ws_manager.broadcast({
            "type": "donation_status",
            "data": {
                "id": donation_id,
                "status": status,
                "title": donation.title,
            }
        })
    except Exception:
        pass

    return {"message": f"Status updated to {status}"}
