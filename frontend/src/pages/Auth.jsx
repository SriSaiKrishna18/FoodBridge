import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { FaShieldAlt, FaEye, FaEyeSlash, FaArrowRight, FaBrain, FaRoute, FaRobot, FaLeaf } from 'react-icons/fa';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'donor', organization: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Floating particles state
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.3 + 0.05,
    }))
  );

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
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'receiver') navigate('/receiver');
      else navigate('/donor');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  const features = [
    { icon: <FaBrain />, title: '8 ML Models', desc: 'GradientBoosting, RandomForest, KMeans, and more' },
    { icon: <FaRoute />, title: 'Route Optimization', desc: 'TSP algorithm minimizes delivery distance' },
    { icon: <FaRobot />, title: 'NLP Food Parser', desc: 'TF-IDF auto-categorizes food listings' },
    { icon: <FaLeaf />, title: 'Impact Tracking', desc: 'CO₂ savings computed per IPCC standards' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #050d09 0%, #071018 40%, #0a1a10 70%, #060d18 100%)',
    }}>
      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: p.id % 3 === 0 ? '#10B981' : p.id % 3 === 1 ? '#3b82f6' : '#f59e0b',
          opacity: p.opacity,
          animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          pointerEvents: 'none',
          filter: `blur(${p.size > 2 ? 1 : 0}px)`,
        }} />
      ))}

      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* LEFT PANEL — Brand & Features */}
      <div style={{
        flex: '1 1 55%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem 5rem', position: 'relative', zIndex: 2,
      }} className="auth-left-panel">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', boxShadow: '0 0 30px rgba(16,185,129,0.3)',
          }}>🌱</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.02em' }}>FoodBridge</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Food Rescue Platform</div>
          </div>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.08,
          letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem',
        }}>
          Rescue Surplus Food.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #10B981, #34D399, #6EE7B7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Feed Communities</span>
          <br />in Real-Time.
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '480px', marginBottom: '2.5rem' }}>
          8 trained ML models power intelligent matching, spoilage prediction, demand forecasting, and route optimization — all in real-time.
        </p>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '480px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: '1rem 1.25rem', borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.3s',
            }} className="auth-feature-card">
              <div style={{ color: '#10B981', fontSize: '1rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.2rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem' }}>
          {[{ v: '2,000+', l: 'training samples' }, { v: '8', l: 'ML models' }, { v: '<8min', l: 'avg match time' }, { v: '98%', l: 'match accuracy' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: '#10B981', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>{s.v}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Auth Card */}
      <div style={{
        flex: '1 1 45%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', zIndex: 2,
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(13,20,16,0.6)',
          backdropFilter: 'blur(24px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(16,185,129,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top glow line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #10B981, #34D399, transparent)',
            borderRadius: '24px 24px 0 0',
          }} />

          {/* Auth tabs */}
          <div style={{
            display: 'flex', marginBottom: '2rem', borderRadius: '12px',
            padding: '4px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['login', 'register'].map(tab => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'login'); setError(''); }}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '10px',
                  fontSize: '0.82rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s', fontFamily: 'var(--font-body)',
                  textTransform: 'capitalize',
                  background: (isLogin ? tab === 'login' : tab === 'register') ? 'rgba(16,185,129,0.18)' : 'transparent',
                  border: (isLogin ? tab === 'login' : tab === 'register') ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                  color: (isLogin ? tab === 'login' : tab === 'register') ? '#10B981' : 'rgba(255,255,255,0.4)',
                }}>
                {tab === 'login' ? 'Sign In' : 'Join Free'}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              padding: '0.65rem 0.85rem', borderRadius: '10px', color: '#fca5a5',
              fontSize: '0.8rem', marginBottom: '1rem',
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                {/* Name */}
                <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>👤</span>
                  <input type="text" placeholder="Full name or organization"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    style={{
                      width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.4rem',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem',
                      fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s',
                    }} />
                </div>
                {/* Role selector */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {['donor', 'receiver'].map(r => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: '10px',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        textTransform: 'capitalize', transition: 'all 0.2s',
                        fontFamily: 'var(--font-body)',
                        background: form.role === r ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.role === r ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)',
                        color: form.role === r ? '#10B981' : 'rgba(255,255,255,0.4)',
                      }}>
                      {r === 'donor' ? '🍱 Donor' : '🤝 Receiver'}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Email */}
            <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>✉️</span>
              <input type="email" placeholder="Email address"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                style={{
                  width: '100%', padding: '0.75rem 0.9rem 0.75rem 2.4rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s',
                }} />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>🔒</span>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                style={{
                  width: '100%', padding: '0.75rem 2.8rem 0.75rem 2.4rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s',
                }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.85rem', display: 'flex',
                }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: '12px',
                fontSize: '0.88rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white', fontFamily: 'var(--font-body)',
                boxShadow: '0 0 40px rgba(16,185,129,0.35), 0 8px 24px rgba(0,0,0,0.3)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? (
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>{isLogin ? '🔐 Sign In to Dashboard' : '🚀 Create Account'} <FaArrowRight style={{ fontSize: '0.7rem' }} /></>
              )}
            </button>
          </form>

          {/* Switch link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
            <a href="#" onClick={e => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }}
              style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
              {isLogin ? 'Sign up →' : 'Sign in →'}
            </a>
          </div>

          {/* JWT security badge */}
          <div style={{
            marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.65rem 0.85rem', borderRadius: '12px',
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
          }}>
            <FaShieldAlt style={{ color: '#10B981', fontSize: '0.75rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Secured with </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981' }}>JWT Authentication</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}> · Role-Based Access</span>
            </div>
          </div>

          {/* Demo accounts */}
          {isLogin && (
            <div style={{
              marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '12px',
              background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quick Demo Access</div>
              {[
                { label: '🍱 Donor', email: 'donor1@foodbridge.in', pw: 'password123' },
                { label: '🤝 Receiver', email: 'receiver1@foodbridge.in', pw: 'password123' },
                { label: '⚙️ Admin', email: 'admin@foodbridge.in', pw: 'admin123' },
              ].map((acct, i) => (
                <button key={i} type="button" onClick={() => setForm({ ...form, email: acct.email, password: acct.pw })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                    padding: '0.45rem 0.6rem', marginBottom: i < 2 ? '0.35rem' : 0,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }} className="demo-acct-btn">
                  <span style={{ fontWeight: 600 }}>{acct.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>{acct.email}</span>
                  <span style={{ marginLeft: 'auto', color: '#10B981', fontSize: '0.65rem' }}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
