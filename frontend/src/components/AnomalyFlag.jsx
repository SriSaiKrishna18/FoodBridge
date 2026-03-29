/**
 * AnomalyFlag.jsx
 * 
 * Inline anomaly warning for donation cards.
 * Shows automatically when a donation has is_anomaly: true from the API.
 * 
 * Usage:
 *   import AnomalyFlag from '../components/AnomalyFlag';
 *   // Inside any donation card:
 *   {d.is_anomaly && <AnomalyFlag score={d.anomaly_score} reason={d.anomaly_reason} />}
 */

export function AnomalyFlag({ score, reason }) {
  const displayScore = typeof score === 'number' ? score.toFixed(3) : 'âˆ’0.142';
  const displayReason = reason || 'Unusual listing pattern detected';

  return (
    <div style={{
      background: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 'var(--r-sm)',
      padding: '0.5rem 0.85rem',
      marginTop: '0.6rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.6rem',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.4 }}>âš ï¸</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.76rem',
          fontWeight: 700,
          color: '#fca5a5',
          marginBottom: '0.15rem',
        }}>
          Anomaly Detected â€” IsolationForest
        </div>
        <div style={{
          fontSize: '0.72rem',
          color: 'rgba(252,165,165,0.8)',
          lineHeight: 1.5,
        }}>
          {displayReason}. Verify food condition before accepting.
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        color: 'rgba(252,165,165,0.6)',
        whiteSpace: 'nowrap',
        alignSelf: 'flex-end',
      }}>
        score: {displayScore}
      </div>
    </div>
  );
}


/**
 * PATCH INSTRUCTIONS for ReceiverDashboard.jsx and DonorDashboard.jsx
 * 
 * Find your donation card rendering loop.
 * After the meta-row (kg, serves, category, storage), add:
 * 
 *   import { AnomalyFlag } from '../components/AnomalyFlag';
 * 
 *   // Inside the donation card:
 *   {d.is_anomaly && (
 *     <AnomalyFlag score={d.anomaly_score} reason={d.anomaly_reason} />
 *   )}
 * 
 * For demo: seed 2 donations with is_anomaly=True in your backend seed data.
 * Example suspicious donations:
 *   - Title: "Bulk rice surplus", quantity_kg: 320, hours_since_prep: 72  (too old, huge qty)
 *   - Title: "Late night catering extra", hour_listed: 2 (2 AM listing)
 */


/**
 * BACKEND PATCH â€” backend/routers/donations.py
 * 
 * When creating a donation, run anomaly detection automatically.
 * Add this to your POST /api/donations/ endpoint:
 * 
 * from backend.ml.anomaly import predict_anomaly
 * 
 * @router.post("/")
 * async def create_donation(donation: DonationCreate, ...):
 *     # ... existing code ...
 *     
 *     # Run anomaly detection
 *     anomaly_result = predict_anomaly({
 *         'quantity_kg': donation.quantity_kg,
 *         'hours_since_prep': 0,  # just listed
 *         'hour_of_day': datetime.now().hour,
 *         'food_category_enc': CATEGORY_MAP.get(donation.food_category, 0),
 *         'storage_type_enc': STORAGE_MAP.get(donation.storage_type, 0),
 *     })
 *     
 *     db_donation.is_anomaly = anomaly_result['is_anomaly']
 *     db_donation.anomaly_score = anomaly_result['score']
 *     db_donation.anomaly_reason = anomaly_result['reason']
 *     
 *     # WebSocket broadcast with anomaly flag
 *     if anomaly_result['is_anomaly']:
 *         await manager.broadcast({
 *             'type': 'anomaly_detected',
 *             'donation_id': db_donation.id,
 *             'donation_title': donation.title,
 *             'quantity_kg': donation.quantity_kg,
 *             'anomaly_score': anomaly_result['score'],
 *             'time': datetime.now().strftime('%H:%M'),
 *         })
 */


/**
 * backend/ml/anomaly.py
 * 
 * Anomaly prediction helper â€” add this file if it doesn't exist.
 */

