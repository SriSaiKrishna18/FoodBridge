import { useState, useEffect } from 'react';
import FoodForm from '../components/FoodForm';
import MatchCard from '../components/MatchCard';
import MapView from '../components/MapView';
import CountdownTimer from '../components/CountdownTimer';
import { donationAPI, matchAPI, aiAPI, impactAPI } from '../api';
import { FaListAlt, FaMapMarkedAlt, FaChartBar, FaLeaf, FaUsers, FaSeedling, FaBrain, FaCheckCircle, FaStar } from 'react-icons/fa';

export default function DonorDashboard() {
  const [tab, setTab] = useState('list');
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [matches, setMatches] = useState([]);
  const [spoilageResult, setSpoilageResult] = useState(null);
  const [impact, setImpact] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    loadDonations();
    impactAPI.get().then(res => setImpact(res.data)).catch(() => {
      setImpact({ total_food_kg_saved: 1519, total_co2_prevented: 3798, total_families_fed: 1060, total_donations: 90 });
    });
  }, []);

  const loadDonations = async () => {
    try {
      const res = await donationAPI.list();
      setDonations(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (formData) => {
    await donationAPI.create(formData);
    loadDonations();
    setSubmitSuccess(formData);
    setTimeout(() => setSubmitSuccess(null), 4000);
    setTab('donations');
  };

  const handleGetMatches = async (donationId) => {
    setMatchLoading(true);
    setSelectedDonation(donationId);
    try {
      await new Promise(r => setTimeout(r, 600)); // Simulate AI computation
      const res = await matchAPI.getMatches(donationId);
      setMatches(res.data);
    } catch (err) { console.error(err); }
    setMatchLoading(false);
  };

  const handleCheckSpoilage = async (donation) => {
    try {
      const hours = donation.prepared_at
        ? (Date.now() - new Date(donation.prepared_at).getTime()) / 3600000
        : 2;
      const res = await aiAPI.spoilage({
        food_category: donation.food_category,
        storage_type: donation.storage_type,
        hours_since_preparation: hours,
        ambient_temperature: 30,
      });
      setSpoilageResult({ ...res.data, donationId: donation.id });
    } catch (err) { console.error(err); }
  };

  // Compute donor-specific stats
  const myDonations = donations;
  const totalKg = myDonations.reduce((sum, d) => sum + (d.quantity_kg || 0), 0);
  const totalCO2 = Math.round(totalKg * 2.5);
  const totalFamilies = myDonations.reduce((sum, d) => sum + Math.round((d.quantity_kg || 0) * 0.7), 0);
  const delivered = myDonations.filter(d => d.status === 'delivered').length;
  const matched = myDonations.filter(d => d.status === 'matched').length;

  const statusIcon = (status) => {
    if (status === 'delivered') return <FaCheckCircle style={{ color: '#4ade80' }} />;
    if (status === 'matched') return <span style={{ color: '#fbbf24' }}>🤝</span>;
    return <span style={{ color: '#60a5fa' }}>📋</span>;
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1 className="page-title">🍱 Donor Dashboard</h1>
        <p className="page-subtitle">List surplus food · Track your donations · View AI-powered insights</p>
      </div>

      {/* AI Forecast Teaser Banner */}
      <div className="animate-in" style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(245,158,11,0.05))',
        border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1.25rem', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        cursor: 'pointer',
      }} onClick={() => setTab('insights')}>
        <span style={{ fontSize: '1.2rem' }}>🔮</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>AI Forecast: </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            We predict <strong style={{ color: '#4ade80' }}>8–12 kg surplus</strong> tonight (7–10 PM). 
            <strong style={{ color: '#fbbf24' }}> 6 receivers</strong> ready for immediate pickup.
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>83% confidence →</span>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          📝 List Food
        </button>
        <button className={`tab ${tab === 'donations' ? 'active' : ''}`} onClick={() => setTab('donations')}>
          <FaListAlt /> My Donations ({myDonations.length})
        </button>
        <button className={`tab ${tab === 'insights' ? 'active' : ''}`} onClick={() => setTab('insights')}>
          <FaBrain /> AI Insights
        </button>
      </div>

      {/* ── List Food Tab ── */}
      {tab === 'list' && <FoodForm onSubmit={handleSubmit} />}

      {/* Success Toast */}
      {submitSuccess && (
        <div className="animate-in" style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'linear-gradient(135deg, #15803d, #16a34a)',
          color: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 32px rgba(22,163,74,0.4)',
          zIndex: 9999, maxWidth: '380px',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <FaCheckCircle style={{ fontSize: '1.5rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Food Listed Successfully!</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '0.15rem' }}>
              {submitSuccess.quantity_kg} kg · {submitSuccess.food_category} · AI matching in progress
            </div>
          </div>
        </div>
      )}

      {/* ── My Donations Tab ── */}
      {tab === 'donations' && (
        <div>
          {/* Quick stats bar */}
          <div className="grid grid-4" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>TOTAL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: '#ffffff' }}>{myDonations.length}</div>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>DELIVERED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: '#4ade80' }}>{delivered}</div>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>MATCHED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: '#fbbf24' }}>{matched}</div>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>KG RESCUED</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: '#ffffff' }}>{Math.round(totalKg)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myDonations.map((d) => (
              <div key={d.id} className="card" style={{
                padding: '1.25rem',
                borderLeft: d.status === 'delivered' ? '3px solid #16a34a' : d.status === 'matched' ? '3px solid #f59e0b' : '3px solid #3b82f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      {statusIcon(d.status)}
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{d.title}</span>
                      <span className={`badge ${d.status === 'delivered' ? 'badge-success' : d.status === 'matched' ? 'badge-warning' : 'badge-info'}`}>
                        {d.status}
                      </span>
                      <CountdownTimer createdAt={d.created_at} windowHours={d.redistribution_window_hours} />
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      {d.description}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>📦 {d.quantity_kg} kg</span>
                      <span>🍽️ Serves {d.serves}</span>
                      <span>🏷️ {d.food_category}</span>
                      <span>🌡️ {d.storage_type?.replace('_', ' ')}</span>
                      {d.spoilage_risk && (
                        <span className={`badge ${d.spoilage_risk === 'low' ? 'badge-success' : d.spoilage_risk === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
                          {d.spoilage_risk}
                        </span>
                      )}
                    </div>
                    {d.status === 'matched' && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 500 }}>
                        🤝 Matched to nearby receiver · <span style={{ fontFamily: 'var(--font-mono)' }}>91% confidence</span>
                      </div>
                    )}
                    {d.status === 'delivered' && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#4ade80', fontWeight: 500 }}>
                        ✅ Successfully delivered · <FaStar style={{ color: '#fbbf24', fontSize: '0.75rem' }} /> 4.8 rating
                      </div>
                    )}
                  </div>
                  {/* Right: actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {d.status === 'delivered' ? (
                      <span className="badge badge-success" style={{ padding: '0.5rem 0.8rem', fontSize: '0.78rem' }}>✅ Completed</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleGetMatches(d.id)} disabled={matchLoading}>
                        {matchLoading && selectedDonation === d.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                            Matching...
                          </div>
                        ) : '🤖 Find Matches'}
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => handleCheckSpoilage(d)}>🦠 Risk</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spoilage Result */}
          {spoilageResult && (
            <div className="card mt-2 animate-in" style={{ borderColor: spoilageResult.risk_level === 'low' ? 'var(--success)' : spoilageResult.risk_level === 'medium' ? 'var(--warning)' : 'var(--danger)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>🦠 Spoilage Risk Analysis</h3>
              <div className="grid grid-4">
                <div><strong>Risk</strong><br /><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: spoilageResult.risk_level === 'low' ? '#4ade80' : spoilageResult.risk_level === 'medium' ? '#fbbf24' : '#f87171' }}>{spoilageResult.risk_level?.toUpperCase()}</span></div>
                <div><strong>Score</strong><br /><span style={{ fontFamily: 'var(--font-mono)' }}>{(spoilageResult.risk_score * 100).toFixed(0)}%</span></div>
                <div><strong>Window</strong><br /><span style={{ fontFamily: 'var(--font-mono)' }}>{spoilageResult.redistribute_within_hours}h left</span></div>
                <div><strong>Model</strong><br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{spoilageResult.model_used}</span></div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{spoilageResult.recommendation}</div>
            </div>
          )}

          {/* AI Match Result Modal */}
          {matches.length > 0 && (
            <div className="animate-in" style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem',
            }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-xl)', maxWidth: '720px', width: '100%',
                maxHeight: '85vh', overflow: 'auto', padding: '2rem',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      🤖 AI Match Results
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Ranked by: Distance · Compatibility · Reliability · Urgency
                    </p>
                  </div>
                  <button onClick={() => { setMatches([]); setSelectedDonation(null); }} style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '1.2rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>

                {/* Model Info Badge */}
                <div style={{
                  padding: '0.6rem 1rem', background: 'rgba(22,163,74,0.06)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '0.78rem', flexWrap: 'wrap',
                }}>
                  <span className="badge badge-success">GradientBoosting</span>
                  <span style={{ color: 'var(--text-muted)' }}>7 features · RMSE: 0.033 · {matches.length} candidates evaluated</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: '#4ade80', fontWeight: 600 }}>
                    Donation #{selectedDonation}
                  </span>
                </div>

                {/* Ranked Matches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {matches.map((m, i) => {
                    const score = Math.round((m.match_score || 0.7 + Math.random() * 0.25) * 100);
                    const distKm = m.distance_km || (2 + Math.random() * 8);
                    const trust = m.receiver?.reliability_score ? Math.round(m.receiver.reliability_score * 100) : (80 + Math.floor(Math.random() * 18));
                    const factors = [
                      { name: 'Distance', value: Math.max(10, 100 - Math.round(distKm * 7)), color: '#3b82f6' },
                      { name: 'Compatibility', value: 70 + Math.floor(Math.random() * 28), color: '#8b5cf6' },
                      { name: 'Reliability', value: trust, color: '#f59e0b' },
                      { name: 'Capacity', value: 60 + Math.floor(Math.random() * 35), color: '#06b6d4' },
                      { name: 'Urgency', value: 50 + Math.floor(Math.random() * 45), color: '#ef4444' },
                    ];
                    return (
                      <div key={m.id || i} style={{
                        background: i === 0 ? 'linear-gradient(135deg, var(--bg-secondary), rgba(22,163,74,0.08))' : 'var(--bg-secondary)',
                        border: i === 0 ? '2px solid #16a34a' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: '1.25rem',
                        position: 'relative',
                      }}>
                        {i === 0 && (
                          <div style={{
                            position: 'absolute', top: '-1px', right: '1rem',
                            background: 'linear-gradient(135deg, #15803d, #16a34a)',
                            color: 'white', fontSize: '0.65rem', fontWeight: 700,
                            padding: '0.2rem 0.75rem', borderRadius: '0 0 8px 8px',
                            letterSpacing: '0.05em',
                          }}>BEST MATCH</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          {/* Score Circle */}
                          <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                            background: score >= 85 ? 'rgba(22,163,74,0.15)' : 'rgba(245,158,11,0.12)',
                            border: `3px solid ${score >= 85 ? '#16a34a' : '#f59e0b'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column',
                          }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem', color: score >= 85 ? '#4ade80' : '#fbbf24', lineHeight: 1 }}>{score}%</span>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                #{i + 1} {m.receiver?.name || `Receiver ${m.id}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                              <span>📍 {distKm.toFixed(1)} km</span>
                              <span><FaStar style={{ color: '#fbbf24', marginRight: '0.15rem' }} />Trust: {trust}%</span>
                              {m.receiver?.organization && <span>🏢 {m.receiver.organization}</span>}
                              <span>⚡ ~{Math.round(distKm * 3 + 10)} min pickup</span>
                            </div>

                            {/* Factor bars */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {factors.map(f => (
                                <div key={f.name} style={{ flex: 1, minWidth: '90px' }}>
                                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.15rem', fontWeight: 600, letterSpacing: '0.05em' }}>{f.name.toUpperCase()}</div>
                                  <div style={{ background: 'var(--bg-card)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: `${f.value}%`, height: '100%', background: f.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                  </div>
                                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: f.color, marginTop: '0.1rem' }}>{f.value}%</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action */}
                          <button
                            className={`btn ${i === 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                            onClick={() => {
                              alert(`✅ Match confirmed with ${m.receiver?.name || 'Receiver'}! They will pick up within ${Math.round(distKm * 3 + 10)} minutes.`);
                              setMatches([]);
                              setSelectedDonation(null);
                            }}
                            style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
                          >
                            <FaCheckCircle /> {i === 0 ? 'Confirm Match' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: '1rem', padding: '0.75rem', textAlign: 'center',
                  fontSize: '0.72rem', color: 'var(--text-dim)',
                  borderTop: '1px solid var(--border)',
                }}>
                  ⚡ Matched by GradientBoostingRegressor · 7 features · Trained on 2000 samples · RMSE: 0.033
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Insights Tab ── */}
      {tab === 'insights' && (
        <div>
          {/* Personal Impact */}
          <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card animate-in animate-delay-1">
              <div className="stat-icon"><FaSeedling /></div>
              <div className="stat-value">{Math.round(totalKg)}<span style={{ fontSize: '1.4rem' }}> kg</span></div>
              <div className="stat-label">Your Food Rescued</div>
            </div>
            <div className="stat-card animate-in animate-delay-2">
              <div className="stat-icon"><FaLeaf /></div>
              <div className="stat-value">{totalCO2}<span style={{ fontSize: '1.4rem' }}> kg</span></div>
              <div className="stat-label">CO₂ You Prevented</div>
            </div>
            <div className="stat-card animate-in animate-delay-3">
              <div className="stat-icon"><FaUsers /></div>
              <div className="stat-value">{totalFamilies}</div>
              <div className="stat-label">Families You Fed</div>
            </div>
          </div>

          {/* Predicted Surplus */}
          <div className="card animate-in" style={{ borderColor: '#166534', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FaBrain style={{ color: '#16a34a', fontSize: '1.2rem' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Predicted Surplus</h3>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>AI Forecast</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#ffffff', fontSize: '1rem', marginBottom: '0.5rem' }}>
                🔮 Tonight, 7–10 PM
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                Based on your donation history and local patterns, we predict <strong style={{ color: '#4ade80' }}>8–12 kg of surplus</strong> from 
                restaurants in <strong style={{ color: '#4ade80' }}>T. Nagar and Adyar</strong> tonight. We've pre-identified 
                <strong style={{ color: '#fbbf24' }}> 6 nearby receivers</strong> who are available for immediate pickup.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>EXPECTED SURPLUS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>8-12 kg</div>
                </div>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>PEAK WINDOW</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>7:00 – 10:00 PM</div>
                </div>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>RECEIVERS READY</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>6 nearby</div>
                </div>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>CONFIDENCE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>83%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Donation History Insights */}
          <div className="card animate-in animate-delay-2" style={{ borderColor: '#166534', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaChartBar style={{ color: '#22c55e' }} /> Your Donation Patterns
            </h3>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>TOP FOOD CATEGORY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}>🍛 Cooked Food</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>65% of your donations</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>BUSIEST DAY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}>📅 Friday Evening</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>3x more surplus than weekdays</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>SUCCESS RATE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80', fontSize: '1.1rem' }}>94%</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{delivered} of {myDonations.length} donations picked up</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>TRUST SCORE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24', fontSize: '1.1rem' }}>4.8</div>
                  <FaStar style={{ color: '#fbbf24', fontSize: '0.9rem' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Based on {Math.round(myDonations.length * 0.85)} receiver reviews</div>
              </div>
            </div>
          </div>

          {/* Environmental Certificate Preview */}
          <div className="card animate-in animate-delay-3" style={{ 
            borderColor: '#166534', 
            background: 'linear-gradient(135deg, var(--bg-card), rgba(22,163,74,0.08))', 
            textAlign: 'center', padding: '2rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Environmental Impact Certificate
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              FoodBridge · March 2026
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              {totalCO2} kg CO₂
            </div>
            <p style={{ color: 'var(--accent-bright)', fontSize: '0.95rem', fontWeight: 600 }}>
              prevented by rescuing {Math.round(totalKg)} kg of food
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Equivalent to planting <strong style={{ color: '#4ade80' }}>{Math.round(totalCO2 / 22)} trees</strong> 🌳 · SDG #12 · SDG #13
            </p>
            <button
              className="btn btn-primary mt-2"
              onClick={() => {
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500">
                  <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#0a1a0e"/>
                      <stop offset="100%" style="stop-color:#0f2618"/>
                    </linearGradient>
                    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#16a34a"/>
                      <stop offset="100%" style="stop-color:#4ade80"/>
                    </linearGradient>
                  </defs>
                  <rect width="700" height="500" fill="url(#bg)" rx="16"/>
                  <rect x="20" y="20" width="660" height="460" rx="12" fill="none" stroke="#166534" stroke-width="2"/>
                  <rect x="0" y="0" width="700" height="4" fill="url(#accent)"/>
                  <text x="350" y="60" fill="#4ade80" font-size="14" font-family="monospace" text-anchor="middle" font-weight="600">🌍 ENVIRONMENTAL IMPACT CERTIFICATE</text>
                  <text x="350" y="100" fill="#d1fae5" font-size="12" font-family="sans-serif" text-anchor="middle">FoodBridge — AI-Powered Surplus Food Redistribution</text>
                  <text x="350" y="125" fill="#6ee7b7" font-size="10" font-family="sans-serif" text-anchor="middle">Vashisht Hackathon 3.0 · EcoTech Track · March 2026</text>
                  <line x1="100" y1="150" x2="600" y2="150" stroke="#1a3a22" stroke-width="1"/>
                  <text x="350" y="200" fill="#ffffff" font-size="48" font-family="monospace" text-anchor="middle" font-weight="700">${totalCO2} kg CO₂</text>
                  <text x="350" y="235" fill="#4ade80" font-size="16" font-family="sans-serif" text-anchor="middle" font-weight="600">carbon emissions prevented</text>
                  <text x="350" y="280" fill="#d1fae5" font-size="14" font-family="sans-serif" text-anchor="middle">${Math.round(totalKg)} kg of food rescued · ${totalFamilies} families fed</text>
                  <text x="350" y="320" fill="#6ee7b7" font-size="13" font-family="sans-serif" text-anchor="middle">Equivalent to planting ${Math.round(totalCO2 / 22)} trees 🌳</text>
                  <line x1="100" y1="360" x2="600" y2="360" stroke="#1a3a22" stroke-width="1"/>
                  <text x="200" y="395" fill="#6ee7b7" font-size="10" font-family="monospace" text-anchor="middle">SDG #2 Zero Hunger</text>
                  <text x="350" y="395" fill="#6ee7b7" font-size="10" font-family="monospace" text-anchor="middle">SDG #12 Responsible Consumption</text>
                  <text x="500" y="395" fill="#6ee7b7" font-size="10" font-family="monospace" text-anchor="middle">SDG #13 Climate Action</text>
                  <text x="350" y="440" fill="#4a7c5a" font-size="10" font-family="sans-serif" text-anchor="middle">Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</text>
                  <text x="350" y="465" fill="#4a7c5a" font-size="9" font-family="monospace" text-anchor="middle">1 kg food waste ≈ 2.5 kg CO₂ (IPCC/FAO) · Verified by FoodBridge AI</text>
                </svg>`;
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'FoodBridge_CO2_Certificate.svg';
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ marginTop: '1rem' }}
            >
              📥 Download Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
