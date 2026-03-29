import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ToastNotification from './components/ToastNotification';
import NotificationBell from './components/NotificationBell';
import { useWebSocket } from './hooks/useWebSocket';
import './index.css';

function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState('page-transition-active');

  useEffect(() => {
    setStage('page-transition-enter');
    const t = setTimeout(() => {
      setDisplayChildren(children);
      setStage('page-transition-active');
    }, 60);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (stage === 'page-transition-active') setDisplayChildren(children);
  }, [children]);

  return <div className={stage}>{displayChildren}</div>;
}

function Navbar({ user, onLogout, wsConnected, theme, toggleTheme }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="icon">🌱</span>
        FoodBridge
      </Link>

      {/* Pill nav */}
      <ul className="navbar-nav">
        <li><Link to="/" className={isActive('/')}>Home</Link></li>
        <li><Link to="/donor" className={isActive('/donor')}>Donor</Link></li>
        <li><Link to="/receiver" className={isActive('/receiver')}>Receiver</Link></li>
        <li><Link to="/admin" className={isActive('/admin')}>Dashboard</Link></li>
      </ul>

      {/* Right actions */}
      <div className="navbar-actions">
        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '0.4rem', fontSize: '1.2rem', borderRadius: '50%' }} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {wsConnected && (
          <div className="live-dot">
            <span />
            LIVE
          </div>
        )}

        <NotificationBell />

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {user.name}
              <span className={`badge ${user.role === 'admin' ? 'badge-amber' : user.role === 'receiver' ? 'badge-info' : 'badge-success'}`}>
                {user.role}
              </span>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">Login</Link>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const { lastMessage, connected } = useWebSocket();
  const [toast, setToast] = useState(null);
  const [serverWarm, setServerWarm] = useState(false);
  const [showWarmingMessage, setShowWarmingMessage] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('foodbridge_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('foodbridge_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Ping backend — show warming message if slow
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    let resolved = false;
    const timer = setTimeout(() => { if (!resolved) setShowWarmingMessage(true); }, 5000);
    fetch(`${apiBase}/api/impact/`)
      .then(() => { resolved = true; setServerWarm(true); setShowWarmingMessage(false); })
      .catch(() => { resolved = true; setShowWarmingMessage(false); });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('foodbridge_user');
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (lastMessage) setToast(lastMessage);
  }, [lastMessage]);

  const handleLogin  = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setUser(null);
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} wsConnected={connected} theme={theme} toggleTheme={() => setTheme(prev => prev==='dark'?'light':'dark')} />
      {showWarmingMessage && (
        <div style={{
          background: 'rgba(217,119,6,0.1)',
          border: '1px solid rgba(217,119,6,0.3)',
          padding: '0.5rem 1.5rem',
          fontSize: '0.8rem',
          color: '#fbbf24',
          textAlign: 'center',
        }}>
          🌡️ Server is warming up — free tier cold start takes ~30 seconds. Features will load shortly.
        </div>
      )}
      <ToastNotification message={toast} onClose={() => setToast(null)} />
      <PageTransition>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/donor"   element={<DonorDashboard />} />
          <Route path="/receiver"element={<ReceiverDashboard />} />
          <Route path="/admin"   element={<AdminPanel />} />
          <Route path="/auth"    element={<Auth onLogin={handleLogin} />} />
          <Route path="*"        element={<NotFound />} />
        </Routes>
      </PageTransition>
    </>
  );
}

export default function App() {
  return <Router><AppContent /></Router>;
}
