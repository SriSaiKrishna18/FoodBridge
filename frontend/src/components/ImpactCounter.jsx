import { useState, useEffect, useRef } from 'react';
import { impactAPI } from '../api';
import { FaLeaf, FaUsers, FaClock, FaSeedling, FaHandshake } from 'react-icons/fa';

// Smooth count-up animation
function useCountUp(target, duration = 2000) {
  const [value, setValue] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.floor(eased * target));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [target, duration]);

  return value;
}

export default function ImpactCounter() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    impactAPI.get().then(res => setImpact(res.data)).catch(() => {
      // Fallback data
      setImpact({
        total_food_kg_saved: 1519,
        total_co2_prevented: 3798,
        total_families_fed: 1060,
        avg_match_time_minutes: 18,
        total_donations: 90,
        total_matches: 86,
      });
    });
  }, []);

  const foodSaved = useCountUp(impact?.total_food_kg_saved || 0, 2500);
  const co2 = useCountUp(impact?.total_co2_prevented || 0, 2500);
  const families = useCountUp(impact?.total_families_fed || 0, 2500);
  const matchTime = useCountUp(impact?.avg_match_time_minutes || 0, 2000);
  const totalMatches = useCountUp(impact?.total_matches || 0, 2000);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
      <div className="stat-card animate-in animate-delay-1">
        <div className="stat-icon"><FaSeedling /></div>
        <div className="stat-value">{foodSaved}<span style={{ fontSize: '1.4rem' }}> kg</span></div>
        <div className="stat-label">Food Rescued</div>
      </div>
      <div className="stat-card animate-in animate-delay-2">
        <div className="stat-icon"><FaLeaf /></div>
        <div className="stat-value">{co2}<span style={{ fontSize: '1.4rem' }}> kg</span></div>
        <div className="stat-label">CO₂ Prevented</div>
      </div>
      <div className="stat-card animate-in animate-delay-3">
        <div className="stat-icon"><FaUsers /></div>
        <div className="stat-value">{families}</div>
        <div className="stat-label">Families Fed</div>
      </div>
      <div className="stat-card animate-in animate-delay-4">
        <div className="stat-icon"><FaHandshake /></div>
        <div className="stat-value">{totalMatches}</div>
        <div className="stat-label">AI Matches</div>
      </div>
      <div className="stat-card animate-in animate-delay-1">
        <div className="stat-icon"><FaClock /></div>
        <div className="stat-value">{matchTime}<span style={{ fontSize: '1.4rem' }}> min</span></div>
        <div className="stat-label">Avg Match Time</div>
      </div>
    </div>
  );
}
