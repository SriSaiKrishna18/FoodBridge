import { FaStar, FaCheckCircle, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';

export default function MatchCard({ match, onAccept, showAccept = false }) {
  const scorePercent = Math.round((match.match_score || 0) * 100);
  const scoreClass = scorePercent >= 75 ? 'high' : 'medium';
  
  return (
    <div className="match-card">
      <div className={`match-score ${scoreClass}`}>
        {scorePercent}%
      </div>
      <div className="match-info">
        <div className="match-name">
          {match.receiver?.name || match.donor?.name || `Match #${match.id}`}
        </div>
        <div className="match-details">
          {match.distance_km && (
            <span><FaMapMarkerAlt /> {match.distance_km.toFixed(1)} km away &nbsp;</span>
          )}
          {match.receiver?.reliability_score && (
            <span><FaStar style={{ color: '#fbbf24' }} /> Trust: {Math.round(match.receiver.reliability_score * 100)}/100 &nbsp;</span>
          )}
          {match.receiver?.organization && (
            <span><FaTruck /> {match.receiver.organization}</span>
          )}
        </div>
      </div>
      {showAccept && !match.is_accepted && (
        <button className="btn btn-primary btn-sm" onClick={() => onAccept?.(match.id)}>
          <FaCheckCircle /> Accept
        </button>
      )}
      {match.is_accepted && (
        <span className="badge badge-success">✅ Matched</span>
      )}
    </div>
  );
}
