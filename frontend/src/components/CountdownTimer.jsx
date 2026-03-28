import { useState, useEffect } from 'react';

/**
 * Live countdown timer for donation expiry.
 * Shows remaining time based on created_at + redistribution_window_hours.
 * Colors: green > 1h, amber < 1h, red pulsing < 30min
 */
export default function CountdownTimer({ createdAt, windowHours }) {
  const [remaining, setRemaining] = useState('');
  const [urgency, setUrgency] = useState('safe'); // safe | warning | critical

  useEffect(() => {
    if (!createdAt || !windowHours) return;

    const expiresAt = new Date(createdAt).getTime() + windowHours * 3600000;

    const tick = () => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setRemaining('EXPIRED');
        setUrgency('expired');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      if (hours > 0) {
        setRemaining(`${hours}h ${minutes}m`);
      } else {
        setRemaining(`${minutes}m`);
      }

      if (diff < 1800000) { // < 30 min
        setUrgency('critical');
      } else if (diff < 3600000) { // < 1 hour
        setUrgency('warning');
      } else {
        setUrgency('safe');
      }
    };

    tick();
    const interval = setInterval(tick, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [createdAt, windowHours]);

  if (!remaining) return null;

  const styles = {
    safe: { color: '#4ade80', bg: 'rgba(22,163,74,0.08)' },
    warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.08)' },
    expired: { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
  };

  const s = styles[urgency] || styles.safe;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.15rem 0.6rem', borderRadius: '100px',
      fontSize: '0.72rem', fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      background: s.bg, color: s.color,
      animation: urgency === 'critical' ? 'pulse-glow 1.5s infinite' : 'none',
    }}>
      ⏱ {remaining}
    </span>
  );
}
