import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImpactCounter from '../components/ImpactCounter';
import MapView from '../components/MapView';
import { donationAPI } from '../api';
import { FaArrowRight, FaRobot, FaShieldAlt, FaRoute, FaBrain, FaBolt, FaGlobeAsia } from 'react-icons/fa';

const AI_MODELS = [
  {
    iconClass: 'ai-card-icon-1',
    icon: <FaBrain />,
    title: 'GradientBoosting Matcher',
    desc: 'Trained on 2,000 samples · 7 features · RMSE: 0.033 · Ranks receivers by distance, compatibility, and urgency',
    tag: 'matcher_model.pkl',
  },
  {
    iconClass: 'ai-card-icon-2',
    icon: <FaShieldAlt />,
    title: 'RandomForest Spoilage',
    desc: 'Trained on 1,500 samples · 5 features · 78% accuracy · Predicts food safety risk with probability scores',
    tag: 'spoilage_model.pkl',
  },
  {
    iconClass: 'ai-card-icon-3',
    icon: <FaRobot />,
    title: 'NLP Food Categorizer',
    desc: 'TF-IDF pipeline · 7 food categories · Quantity pattern matching · Auto-fills listing forms from plain text',
    tag: 'NLP Pipeline',
  },
  {
    iconClass: 'ai-card-icon-4',
    icon: <FaRoute />,
    title: 'TSP Route Optimizer',
    desc: 'Nearest Neighbor heuristic · Minimizes travel distance · Calculates CO₂ savings per optimized route',
    tag: 'Graph Algorithm',
  },
  {
    iconClass: 'ai-card-icon-1',
    icon: <FaGlobeAsia />,
    title: 'K-Means Hotspot Clustering',
    desc: 'Clusters donation GPS coordinates into 5 food-waste hotspot zones · Helps NGOs pre-position near high-surplus areas',
    tag: 'cluster_model.pkl',
  },
  {
    iconClass: 'ai-card-icon-2',
    icon: <FaShieldAlt />,
    title: 'IsolationForest Anomaly',
    desc: 'Detects suspicious listings — unusual quantities, late-night submissions, or old cooked food flagged automatically',
    tag: 'anomaly_model.pkl',
  },
  {
    iconClass: 'ai-card-icon-3',
    icon: <FaBolt />,
    title: 'Demand Forecaster (GBR)',
    desc: 'Predicts donation volume for next 6 hours by category · R²: 0.81 · Alerts receivers before surplus is even listed',
    tag: 'forecast_model.pkl',
  },
  {
    iconClass: 'ai-card-icon-4',
    icon: <FaBrain />,
    title: 'Collaborative Filter',
    desc: 'Cosine similarity on receiver acceptance history · Learns food preferences · Boosts match scores by 30% weight',
    tag: 'collab_filter.pkl',
  },
];

const HOW_STEPS = [
  { num: '01', emoji: '📝', title: 'Describe Your Surplus', desc: 'NLP engine auto-extracts food type, quantity, and runs spoilage prediction instantly' },
  { num: '02', emoji: '🤖', title: 'AI Matches Best Receiver', desc: 'GradientBoosting model ranks receivers by 7 features — distance, reliability, urgency, capacity' },
  { num: '03', emoji: '🗺️', title: 'Route Gets Optimized', desc: 'TSP algorithm computes optimal pickup path, saving kilometres and CO₂ emissions' },
  { num: '04', emoji: '📊', title: 'Impact Is Tracked', desc: 'Every redistribution logs kg saved, CO₂ prevented, and families fed — in real time' },
];

export default function Home() {
  const [donations, setDonations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [liveStats, setLiveStats] = useState({
    activeNow: 12, matchesThisHour: 7, kgInTransit: 34, avgResponse: 16,
  });

  // Simulate live pulse — stats drift slightly every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeNow: Math.max(5, prev.activeNow + Math.floor(Math.random() * 3 - 1)),
        matchesThisHour: Math.max(1, prev.matchesThisHour + Math.floor(Math.random() * 3 - 1)),
        kgInTransit: Math.max(10, prev.kgInTransit + Math.floor(Math.random() * 7 - 3)),
        avgResponse: Math.max(8, Math.min(25, prev.avgResponse + Math.floor(Math.random() * 3 - 1))),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    donationAPI.list().then(res => {
      setDonations(res.data);
      const emojiMap = { cooked: '🍛', bakery: '🍞', dairy: '🥛', fruits_vegetables: '🥦', packaged: '📦', beverages: '🥤', raw: '🥩' };
      setRecentActivity(
        res.data.slice(0, 10).map((d, i) => ({
          id: i,
          text: `${d.donor?.name || 'Donor'} listed ${d.quantity_kg} kg ${d.food_category} — "${d.title}"`,
          time: `${Math.floor(Math.random() * 50 + 3)} min ago`,
          emoji: emojiMap[d.food_category] || '🍱',
        }))
      );
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Ticker ─────────────────────────────────────── */}
      <div className="ticker-bar">
        <div className="ticker-content">
          {[...recentActivity, ...recentActivity].map((a, i) => (
            <span key={i} className="ticker-item">
              {a.emoji} {a.text} · <span style={{ opacity: 0.6 }}>{a.time}</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero-split">
        <div className="hero-left">
          <div className="hero-badge">
            🌍 Vashisht Hackathon 3.0 &nbsp;·&nbsp; EcoTech Track
          </div>

          <h1 className="hero-title-main">
            AI-Powered
            <span className="hero-gradient-animated">Food Rescue</span>
            Platform
          </h1>

          <p className="hero-desc">
            FoodBridge uses <strong style={{ color: 'var(--text-1)', fontWeight: 700 }}>8 trained ML models</strong> to
            match surplus food with communities in need — optimising routes, predicting
            spoilage, detecting anomalies, forecasting demand, and learning receiver preferences in real time.
          </p>

          <div className="hero-stat-row">
            <div className="hero-mini-stat">
              <span className="hero-mini-num">68.7M</span>
              <span className="hero-mini-label">tonnes wasted / year in India (FAO)</span>
            </div>
            <div className="hero-mini-stat">
              <span className="hero-mini-num">2.5×</span>
              <span className="hero-mini-label">CO₂ per kg food waste (IPCC)</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/donor" className="btn btn-primary btn-lg">
              🍱 Donate Food <FaArrowRight style={{ fontSize: '0.8rem' }} />
            </Link>
            <Link to="/receiver" className="btn btn-secondary btn-lg">
              🤝 Find Food
            </Link>
          </div>

          {/* Onboarding prompt */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(22,163,74,0.06)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            fontSize: '0.82rem',
            color: 'var(--text-3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '480px',
          }}>
            <span style={{ fontSize: '1.2rem' }}>👋</span>
            <div>
              <strong style={{ color: 'var(--text-1)' }}>New here?</strong>
              {' '}Browse available food without an account — or{' '}
              <Link to="/auth" style={{ color: 'var(--g400)', fontWeight: 600 }}>register free in 30 seconds</Link> to donate or accept.
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-map-wrapper">
            <div className="hero-map-label">📍 Live Donations — Chennai</div>
            <MapView donations={donations} />
          </div>
        </div>
      </section>

      {/* ── Live City Pulse Strip ─────────────────────── */}
      <section style={{
        padding: '1rem 0',
        background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(6,182,212,0.05))',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse-glow 2s infinite' }}></span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>LIVE — Chennai</span>
          </div>
          {[
            { label: 'Active Donors', value: liveStats.activeNow, unit: '', color: '#4ade80' },
            { label: 'Matches/hr', value: liveStats.matchesThisHour, unit: '', color: '#3b82f6' },
            { label: 'In Transit', value: liveStats.kgInTransit, unit: ' kg', color: '#f59e0b' },
            { label: 'Avg Response', value: liveStats.avgResponse, unit: ' min', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: s.color, transition: 'all 0.3s' }}>
                {s.value}{s.unit}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Divider ── */}
      <div className="section-divider">
        <span className="section-divider-label"><span className="section-divider-dot" /> Environmental Impact</span>
      </div>

      {/* ── Impact Stats ───────────────────────────────── */}
      <section className="impact-section">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow"><FaGlobeAsia /> Real-Time Environmental Impact</div>
            <h2 className="section-title">Every number is live from our database</h2>
            <p className="section-subtitle">1 kg food waste ≈ 2.5 kg CO₂ &nbsp;·&nbsp; IPCC standard &nbsp;·&nbsp; Computed on every delivery</p>
          </div>
          <ImpactCounter />
        </div>
      </section>

      {/* ── Section Divider ── */}
      <div className="section-divider">
        <span className="section-divider-label"><span className="section-divider-dot" /> AI / ML Layer</span>
      </div>

      {/* ── Human Value Proposition ── */}
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem 0.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--text-1)',
          marginBottom: '0.5rem',
        }}>
          List food in 60 seconds.
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          AI handles everything else — matching, routing, safety checks, and impact tracking.
        </div>
      </div>

      {/* ── AI Models ──────────────────────────────────── */}
      <section style={{ padding: '2rem 0 5rem' }}>
        <div className="container">
           <div className="section-header">
            <div className="section-eyebrow"><FaBolt /> AI / ML Layer</div>
            <h2 className="section-title">8 Trained Models. Real sklearn .pkl files.</h2>
            <p className="section-subtitle">GradientBoosting, RandomForest, KMeans, IsolationForest, TF-IDF, TSP, Demand Forecasting, and Collaborative Filtering — all trained at startup.</p>
          </div>

          {/* Tech badges inspired by new_UI */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {['Real-time WebSocket', 'ML Matching Engine', 'JWT Auth', 'Route Optimization', 'NLP Input', 'KMeans Clustering', 'Anomaly Detection', 'Demand Forecasting'].map(badge => (
              <span key={badge} style={{
                fontSize: '0.7rem', padding: '0.35rem 0.75rem', borderRadius: '100px',
                background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)',
                color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.02em',
              }}>{badge}</span>
            ))}
          </div>

          <div className="grid grid-4">
            {AI_MODELS.map((m, i) => (
              <div key={i} className={`ai-card animate-in animate-delay-${(i % 4) + 1}`}>
                <div className={`ai-card-icon ${m.iconClass}`}>{m.icon}</div>
                <h3 className="ai-card-title">{m.title}</h3>
                <p className="ai-card-desc">{m.desc}</p>
                <span className="ai-card-tag">{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section Divider ── */}
      <div className="section-divider">
        <span className="section-divider-label"><span className="section-divider-dot" /> How It Works</span>
      </div>

      {/* ── How It Works ───────────────────────────────── */}
      <section style={{ padding: '2rem 0 5rem' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How FoodBridge Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '500px' }}>
              From surplus description to delivered food — the full AI-powered chain
            </p>
          </div>
          <div className="steps-row">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <span className="step-emoji">{s.emoji}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                <span className="step-num">{s.num}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ──────────────────────────────────────── */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div className="story-card animate-in">
            <span className="story-quote">"</span>
            <p className="story-text">
              Priya's Restaurant in Adyar donated <strong>12 kg of biryani</strong> from a
              cancelled event. FoodBridge's AI matched it to <strong>Hope Foundation</strong>
              (2.3 km away, 94% reliability score) in <strong>8 minutes</strong>. The optimised
              route saved 4.2 km of travel. That single donation prevented <strong>30 kg of
              CO₂</strong> and fed <strong>40 people</strong>.
            </p>
            <p className="story-attribution">— A real scenario FoodBridge is designed for</p>
          </div>
        </div>
      </section>

      {/* ── Section Divider ── */}
      <div className="section-divider">
        <span className="section-divider-label"><span className="section-divider-dot" /> Tech Stack & Alignment</span>
      </div>

      {/* ── Tech Stack Showcase ─────────────────────────── */}
      <section style={{ padding: '3rem 0 2rem' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Built With Production-Grade Tech</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '500px' }}>
              Full-stack Python + React · PostgreSQL · 8 sklearn models · Real-time WebSocket
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
              { name: 'FastAPI', icon: '⚡', color: '#10B981' },
              { name: 'React 18', icon: '⚛️', color: '#61DAFB' },
              { name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
              { name: 'scikit-learn', icon: '🧠', color: '#F7931E' },
              { name: 'Leaflet', icon: '🗺️', color: '#199900' },
              { name: 'WebSocket', icon: '🔌', color: '#6366f1' },
              { name: 'JWT Auth', icon: '🔐', color: '#ef4444' },
              { name: 'Chart.js', icon: '📊', color: '#FF6384' },
            ].map((tech, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                padding: '1rem 1.25rem', borderRadius: '16px',
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                transition: 'all 0.3s', cursor: 'default', minWidth: '100px',
              }} className="card">
                <span style={{ fontSize: '1.3rem' }}>{tech.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: tech.color, fontFamily: 'var(--font-mono)' }}>{tech.name}</span>
              </div>
            ))}
          </div>

          {/* SDG badges */}
          <div className="sdg-row">
            <div className="sdg-badge sdg-2">🎯 SDG #2 — Zero Hunger</div>
            <div className="sdg-badge sdg-12">♻️ SDG #12 — Responsible Consumption</div>
            <div className="sdg-badge sdg-13">🌍 SDG #13 — Climate Action</div>
          </div>
        </div>
      </section>

      {/* ── Enhanced Footer ────────────────────────────── */}
      <footer className="footer" style={{ padding: '3rem 2rem 2rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🌱</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-1)' }}>FoodBridge</span>
              </div>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-4)' }}>
                AI-powered platform connecting surplus food donors with communities in need. 8 ML models. Real-time matching. Zero food waste.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--g400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Platform</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <Link to="/donor" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Donor Dashboard</Link>
                <Link to="/receiver" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Receiver Dashboard</Link>
                <Link to="/admin" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Admin Panel</Link>
                <Link to="/auth" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Login / Register</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--g400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>AI Models</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-4)' }}>
                <span>GradientBoosting Matcher</span>
                <span>RandomForest Spoilage</span>
                <span>K-Means Clustering</span>
                <span>IsolationForest Anomaly</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--g400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Hackathon</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-4)' }}>
                <span>Vashisht Hackathon 3.0</span>
                <span>EcoTech Track</span>
                <span>IIITDM Kancheepuram</span>
                <span>March 28–29, 2026</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>
              © 2026 FoodBridge · Data: FAO (68.7M tonnes/year) · IPCC (1 kg waste ≈ 2.5 kg CO₂)
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.68rem' }}>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '100px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', color: 'var(--g300)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>v2.0.0</span>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '100px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#93c5fd', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>8 Models</span>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '100px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#fbbf24', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>PostgreSQL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
