import { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaSms, FaWhatsapp, FaCheckCircle, FaExclamationTriangle, FaBolt } from 'react-icons/fa';

// Simulated notification data — in production would come from WebSocket
const SIMULATED_NOTIFICATIONS = [
  { id: 1, type: 'match', icon: '🤖', title: 'AI Match Found', message: 'New match: 10kg rice available in Adyar. 91% confidence.', time: '2 min ago', read: false },
  { id: 2, type: 'sms', icon: '📱', title: 'SMS Alert Sent', message: 'SMS sent to Akash NGO: "New match available. Accept within 2h."', time: '5 min ago', read: false },
  { id: 3, type: 'pickup', icon: '✅', title: 'Pickup Confirmed', message: 'Robin Hood Army picked up 8kg paneer curry from T.Nagar.', time: '12 min ago', read: false },
  { id: 4, type: 'expiry', icon: '⚠️', title: 'Expiry Warning', message: '5kg sambar in Mylapore expires in 30 min. Urgent redistribution needed.', time: '18 min ago', read: true },
  { id: 5, type: 'whatsapp', icon: '💬', title: 'WhatsApp Notification', message: 'WhatsApp sent to donor: "Your paneer curry was accepted by Akash NGO."', time: '25 min ago', read: true },
  { id: 6, type: 'surplus', icon: '🔮', title: 'Surplus Prediction', message: 'Tonight 7-10 PM: High surplus expected from T.Nagar restaurants.', time: '32 min ago', read: true },
  { id: 7, type: 'rating', icon: '⭐', title: 'New Review', message: 'Hope Foundation gave you 5★: "Fresh food, excellent packaging."', time: '45 min ago', read: true },
  { id: 8, type: 'match', icon: '🤝', title: 'Match Accepted', message: 'Chennai Food Bank accepted 15kg biryani from Adyar hotel.', time: '1 hr ago', read: true },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SIMULATED_NOTIFICATIONS);
  const ref = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const typeColor = {
    match: '#4ade80',
    sms: '#60a5fa',
    pickup: '#4ade80',
    expiry: '#f87171',
    whatsapp: '#22c55e',
    surplus: '#fbbf24',
    rating: '#fbbf24',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '0.4rem',
          color: 'var(--text-secondary)', fontSize: '1.1rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        title="Notifications"
      >
        <FaBell />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '0px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#ef4444', color: 'white',
            fontSize: '0.55rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-primary)',
            animation: 'pulse-glow 2s infinite',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          width: '380px', maxHeight: '480px', overflowY: 'auto',
          background: 'var(--bg-card)', border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          zIndex: 9999,
          animation: 'fadeIn 0.15s',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
              Notifications {unread > 0 && <span style={{ color: '#ef4444' }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', color: '#4ade80', fontWeight: 600,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications list */}
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                background: n.read ? 'transparent' : 'rgba(22,163,74,0.04)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(22,163,74,0.04)'}
              onClick={() => {
                setNotifications(notifications.map(notif =>
                  notif.id === n.id ? { ...notif, read: true } : notif
                ));
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{n.title}</span>
                    {!n.read && (
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#4ade80', flexShrink: 0,
                      }} />
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-dim)', flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                    margin: 0, lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{
            padding: '0.6rem 1rem', textAlign: 'center',
            fontSize: '0.72rem', color: 'var(--text-muted)',
          }}>
            📱 In production: Twilio SMS + WhatsApp Business API
          </div>
        </div>
      )}
    </div>
  );
}
