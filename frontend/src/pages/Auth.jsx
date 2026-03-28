import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    organization: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authAPI.login({ email: form.email, password: form.password });
      } else {
        res = await authAPI.register(form);
      }
      
      const { access_token, user } = res.data;
      localStorage.setItem('foodbridge_token', access_token);
      localStorage.setItem('foodbridge_user', JSON.stringify(user));
      
      if (onLogin) onLogin(user);

      // Navigate based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'receiver') navigate('/receiver');
      else navigate('/donor');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>🌱</div>
        <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Join FoodBridge'}</h1>
        <p className="auth-subtitle">{isLogin ? 'Login to your account' : 'Create your account to start saving food'}</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>I am a...</label>
                <select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="donor">🍱 Food Donor (Restaurant, Caterer, Individual)</option>
                  <option value="receiver">🤝 Food Receiver (NGO, Food Bank, Community)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Organization (optional)</label>
                <input className="form-control" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Your organization" />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Please wait...' : isLogin ? '🔐 Login' : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Login'}
          </a>
        </p>

        {isLogin && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong className="text-green">Demo Accounts:</strong><br />
            Donor: donor1@foodbridge.in / password123<br />
            Receiver: receiver1@foodbridge.in / password123<br />
            Admin: admin@foodbridge.in / admin123
          </div>
        )}
      </div>
    </div>
  );
}
