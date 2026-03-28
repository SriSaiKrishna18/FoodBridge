import { useState, useEffect, useCallback } from 'react';
import { FaBolt, FaTimes } from 'react-icons/fa';

export default function ToastNotification({ message, onClose }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setExiting(false);
      const t = setTimeout(() => {
        setExiting(true);
        setTimeout(() => { setVisible(false); onClose?.(); }, 400);
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  if (!visible || !message) return null;

  const { type, data } = message;
  const isDonation = type === 'new_donation';

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
      maxWidth: '420px', width: '100%',
      animation: exiting ? 'slideOut 0.4s ease-in forwards' : 'slideIn 0.4s ease-out forwards',
    }}>
      <div style={{
        background: '#0f2618', border: '1px solid #166534',
        borderRadius: '12px', padding: '1rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 30px rgba(22,163,74,0.1)',
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: isDonation ? 'rgba(22,163,74,0.15)' : 'rgba(59,130,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '1rem',
        }}>
          {isDonation ? '🍱' : '🔔'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <FaBolt style={{ color: '#4ade80', fontSize: '0.7rem' }} />
            <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isDonation ? 'Live — New Donation' : 'Status Update'}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#f0fdf4', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
            {isDonation
              ? `${data.donor_name} listed ${data.quantity_kg} kg ${data.food_category}`
              : `Donation "${data.title}" → ${data.status}`
            }
          </p>
          {isDonation && (
            <p style={{ fontSize: '0.78rem', color: '#86efac', margin: '0.25rem 0 0' }}>
              "{data.title}" · Serves {data.serves} · Risk: {data.spoilage_risk}
            </p>
          )}
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(() => { setVisible(false); onClose?.(); }, 400); }}
          style={{
            background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer',
            padding: '0.25rem', fontSize: '0.75rem', opacity: 0.6,
          }}
        >
          <FaTimes />
        </button>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
      `}</style>
    </div>
  );
}
