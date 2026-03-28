import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminPanel from './pages/AdminPanel';
import Auth from './pages/Auth';
import ToastNotification from './components/ToastNotification';
import NotificationBell from './components/NotificationBell';
import { useWebSocket } from './hooks/useWebSocket';
import './index.css';

// Page transition wrapper
function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('page-transition-active');

  useEffect(() => {
    setTransitionStage('page-transition-enter');
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('page-transition-active');
    }, 50);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Update children when they change (for re-renders on same page)
  useEffect(() => {
    if (transitionStage === 'page-transition-active') {
      setDisplayChildren(children);
    }
  }, [children]);

  return <div className={transitionStage}>{displayChildren}</div>;
}

function Navbar({ user, onLogout, wsConnected, theme, onToggleTheme }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="icon">🌱</span>
        FoodBridge
      </Link>
      <ul className="navbar-nav">
        <li><Link to="/" className={isActive('/')}>Home</Link></li>
        <li><Link to="/donor" className={isActive('/donor')}>Donor</Link></li>
        <li><Link to="/receiver" className={isActive('/receiver')}>Receiver</Link></li>
        <li><Link to="/admin" className={isActive('/admin')}>Dashboard</Link></li>
      </ul>
      <div className="navbar-actions">
        {wsConnected && (
          <span style={{ fontSize: '0.65rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse-glow 2s infinite' }}></span>
            LIVE
          </span>
        )}
        <NotificationBell />
        <button className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user.name} <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>{user.role}</span>
            </span>
            <button className="btn btn-secondary btn-sm" onClick={onLogout}>Logout</button>
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
  const [theme, setTheme] = useState(() => localStorage.getItem('foodbridge_theme') || 'dark');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('foodbridge_theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('foodbridge_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Show toast when new WS message arrives
  useEffect(() => {
    if (lastMessage) {
      setToast(lastMessage);
    }
  }, [lastMessage]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
    setUser(null);
  };


  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} wsConnected={connected} theme={theme} onToggleTheme={toggleTheme} />
      <ToastNotification message={toast} onClose={() => setToast(null)} />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/receiver" element={<ReceiverDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
