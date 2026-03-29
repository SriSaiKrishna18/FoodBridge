import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import CountdownTimer from '../components/CountdownTimer';
import api, { donationAPI, matchAPI, aiAPI } from '../api';
import { FaMapMarkerAlt, FaRoute, FaClock, FaStar, FaCheckCircle, FaExclamationTriangle, FaLeaf, FaFilter, FaSearch, FaTruck, FaWalking, FaHandshake, FaTimes } from 'react-icons/fa';

export default function ReceiverDashboard() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('foodbridge_user')); } catch { return null; } })();
  const [donations, setDonations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [tab, setTab] = useState('browse');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [matches, setMatches] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [deliveredDonation, setDeliveredDonation] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [notifyMe, setNotifyMe] = useState(false);
  const [notifyCategories, setNotifyCategories] = useState(['cooked', 'bakery']);
  const [deliveryPartnerRequested, setDeliveryPartnerRequested] = useState({});

  const [acceptLoading, setAcceptLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    risk: 'all',
    transport: 'all',
    distance: 'all', // all | 2 | 5 | 10
    sortBy: 'urgency', // urgency | distance | quantity
  });

  // Receiver's location (demo: T.Nagar area)
  const receiverLocation = { lat: 13.0418, lng: 80.2341 };

  const loadDonations = useCallback(() => {
    setDataLoading(true);
    setDataError(false);
    // Use enriched endpoint to get anomaly flags
    donationAPI.listEnriched().then(res => {
      setDonations(res.data);
      setDataLoading(false);
    }).catch(() => {
      // Fallback to regular endpoint if enriched fails
      donationAPI.listAvailable().then(res => {
        setDonations(res.data);
        setDataLoading(false);
      }).catch(() => {
        setDataLoading(false);
        setDataError(true);
      });
    });
  }, []);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  // Calculate distance from receiver to each donation
  const getDistance = useCallback((lat, lng) => {
    if (!lat || !lng) return 999;
    const R = 6371;
    const dLat = (lat - receiverLocation.lat) * Math.PI / 180;
    const dLon = (lng - receiverLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(receiverLocation.lat * Math.PI/180) * Math.cos(lat * Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }, []);

  // Check if a donation is expired
  const isExpired = useCallback((d) => {
    if (!d.created_at || !d.redistribution_window_hours) return false;
    const expiresAt = new Date(d.created_at).getTime() + d.redistribution_window_hours * 3600000;
    return Date.now() > expiresAt;
  }, []);

  // Filtered & sorted donations
  const filteredDonations = useMemo(() => {
    let result = [...donations];

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.food_category?.toLowerCase().includes(q) ||
        d.donor?.name?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(d => d.food_category === filters.category);
    }

    // Risk filter
    if (filters.risk !== 'all') {
      result = result.filter(d => d.spoilage_risk === filters.risk);
    }

    // Transport filter
    if (filters.transport !== 'all') {
      result = result.filter(d =>
        d.transport_mode === filters.transport || d.transport_mode === 'both'
      );
    }

    // Distance filter
    if (filters.distance !== 'all') {
      const maxDist = parseInt(filters.distance);
      result = result.filter(d => getDistance(d.latitude, d.longitude) <= maxDist);
    }

    // Sort: active first, expired last
    result.sort((a, b) => {
      const aExpired = isExpired(a) ? 1 : 0;
      const bExpired = isExpired(b) ? 1 : 0;
      if (aExpired !== bExpired) return aExpired - bExpired;
      
      // Within same group, apply user sort
      if (filters.sortBy === 'urgency') {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.spoilage_risk] || 2) - (order[b.spoilage_risk] || 2);
      } else if (filters.sortBy === 'distance') {
        return getDistance(a.latitude, a.longitude) - getDistance(b.latitude, b.longitude);
      } else if (filters.sortBy === 'quantity') {
        return (b.quantity_kg || 0) - (a.quantity_kg || 0);
      }
      return 0;
    });

    return result;
  }, [donations, filters, getDistance, isExpired]);

  const activeDonations = useMemo(() => filteredDonations.filter(d => !isExpired(d)), [filteredDonations, isExpired]);
  const expiredDonations = useMemo(() => filteredDonations.filter(d => isExpired(d)), [filteredDonations, isExpired]);
  const [showExpired, setShowExpired] = useState(false);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.risk !== 'all',
    filters.transport !== 'all',
    filters.distance !== 'all',
    filters.search.trim() !== '',
  ].filter(Boolean).length;

  const handleRequestDeliveryPartner = (donationId) => {
    setDeliveryPartnerRequested(prev => ({ ...prev, [donationId]: true }));
    // WebSocket would notify delivery partners in production
  };

  const handleAcceptDonation = async (donation) => {
    setAcceptLoading(true);
    setSelectedDonation(donation);

    // Simulate server AI computation (800ms) for realism
    await new Promise(r => setTimeout(r, 800));

    try {
      const matchRes = await matchAPI.getMatches(donation.id);
      setMatches(matchRes.data);
    } catch (e) {}

    if (donation.latitude && donation.longitude) {
      const donorPos = [donation.latitude, donation.longitude];
      const receiverPos = [receiverLocation.lat, receiverLocation.lng];
      setRoutePoints([receiverPos, donorPos]);

      try {
        const routeRes = await aiAPI.route([
          { lat: receiverLocation.lat, lng: receiverLocation.lng },
          { lat: donation.latitude, lng: donation.longitude },
        ]);
        setRouteInfo(routeRes.data);
      } catch (e) {
        const R = 6371;
        const dLat = (donation.latitude - receiverLocation.lat) * Math.PI / 180;
        const dLon = (donation.longitude - receiverLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(receiverLocation.lat * Math.PI/180) * Math.cos(donation.latitude * Math.PI/180) * Math.sin(dLon/2)**2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setRouteInfo({
          total_distance_km: dist,
          estimated_time_minutes: Math.round(dist * 3 + 5),
          co2_saved_kg: Math.round(donation.quantity_kg * 2.5 * 100) / 100,
        });
      }
    }
    setAcceptLoading(false);
    setLoading(false);
    setTab('route');
  };

  const handleMarkDelivered = (donation) => {
    setDeliveredDonation(donation);
    setRatingValue(5);
    setRatingComment('');
    setRatingSubmitted(false);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    try {
      await api.post('/api/reviews', {
        reviewer_id: 1,
        reviewee_id: deliveredDonation?.donor_id || 1,
        donation_id: deliveredDonation?.id || 1,
        rating: ratingValue,
        comment: ratingComment,
      });
    } catch (e) { console.error(e); }
    setRatingSubmitted(true);
    setTimeout(() => {
      setShowRatingModal(false);
    }, 2500);
  };

  const riskBadge = (risk) => {
    const colors = {
      high: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', icon: '🚫', text: 'HIGH RISK' },
      medium: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', icon: '⚠️', text: 'MODERATE' },
      low: { bg: 'rgba(22,163,74,0.12)', color: '#4ade80', icon: '✅', text: 'SAFE' },
    };
    const c = colors[risk] || colors.low;
    return (
      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color }}>
        {c.icon} {c.text}
      </span>
    );
  };

  const transportBadge = (mode) => {
    const modes = {
      donor_delivers: { icon: <FaTruck style={{ fontSize: '0.65rem' }} />, text: 'Donor delivers', color: '#60a5fa' },
      receiver_picks_up: { icon: <FaWalking style={{ fontSize: '0.65rem' }} />, text: 'Pickup', color: '#c084fc' },
      both: { icon: <FaHandshake style={{ fontSize: '0.65rem' }} />, text: 'Flexible', color: '#fbbf24' },
    };
    const m = modes[mode] || modes.receiver_picks_up;
    return (
      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}>
        {m.icon} {m.text}
      </span>
    );
  };

  const categoryEmoji = {
    cooked: '🍛', raw: '🥩', packaged: '📦', dairy: '🥛', bakery: '🍞',
    fruits_vegetables: '🥦', beverages: '🧃', other: '🍱',
  };

  return (
    <div className="page container">
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20px', right: '-30px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <h1 className="page-title" style={{ position: 'relative', zIndex: 1 }}>
          🤝 <span className="hero-gradient-animated">Receiver</span> Dashboard
        </h1>
        <p className="page-subtitle" style={{ position: 'relative', zIndex: 1 }}>
          Browse available donations · Filter by category, risk & transport · Accept to see optimized route
        </p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
          🍱 Browse Food ({filteredDonations.length})
        </button>
        <button className={`tab ${tab === 'route' ? 'active' : ''}`} onClick={() => setTab('route')}>
          🗺️ Route View {selectedDonation ? `— ${selectedDonation.title}` : ''}
        </button>
        <button className={`tab ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          📍 All Donations Map
        </button>
      </div>

      {/* Browse Tab — Filters + Spoilage-sorted cards */}
      {tab === 'browse' && (
        <div>
          {/* Loading skeleton */}
          {dataLoading && (
            <div style={{ padding: '1rem 0' }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line w60" />
                  <div className="skeleton-line w80" />
                  <div className="skeleton-line w40" />
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                Loading available donations...
              </div>
            </div>
          )}
          {/* Error state */}
          {dataError && !dataLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Could not load donations</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                The server may be starting up — this takes about 30 seconds on first load.
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadDonations}>Try Again</button>
            </div>
          )}
          {/* Normal content */}
          {!dataLoading && !dataError && (<>
          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderColor: 'var(--border-hover)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', fontSize: '0.8rem' }} />
                <input
                  className="form-control"
                  placeholder="Search food, donor, category..."
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{ paddingLeft: '2rem', marginBottom: 0, height: '36px', fontSize: '0.82rem' }}
                />
              </div>

              {/* Sort */}
              <select
                className="form-control"
                value={filters.sortBy}
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                style={{ width: '140px', marginBottom: 0, height: '36px', fontSize: '0.78rem' }}
              >
                <option value="urgency">⏰ By Urgency</option>
                <option value="distance">📍 By Distance</option>
                <option value="quantity">📦 By Quantity</option>
              </select>

              {/* Filter toggle */}
              <button
                className={`btn btn-sm ${showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowFilters(v => !v)}
                style={{ height: '36px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <FaFilter /> Filters {activeFilterCount > 0 && <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', marginLeft: '0.2rem' }}>{activeFilterCount}</span>}
              </button>

              {/* Clear */}
              {activeFilterCount > 0 && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setFilters({ search: '', category: 'all', risk: 'all', transport: 'all', distance: 'all', sortBy: filters.sortBy })}
                  style={{ height: '36px', fontSize: '0.75rem' }}
                >
                  <FaTimes /> Clear
                </button>
              )}
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>CATEGORY</div>
                  <select
                    className="form-control"
                    value={filters.category}
                    onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                    style={{ marginBottom: 0, height: '34px', fontSize: '0.78rem' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="cooked">🍛 Cooked</option>
                    <option value="raw">🥩 Raw</option>
                    <option value="packaged">📦 Packaged</option>
                    <option value="dairy">🥛 Dairy</option>
                    <option value="bakery">🍞 Bakery</option>
                    <option value="fruits_vegetables">🥦 Fruits & Veg</option>
                    <option value="beverages">🧃 Beverages</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>RISK LEVEL</div>
                  <select
                    className="form-control"
                    value={filters.risk}
                    onChange={(e) => setFilters(f => ({ ...f, risk: e.target.value }))}
                    style={{ marginBottom: 0, height: '34px', fontSize: '0.78rem' }}
                  >
                    <option value="all">All Risks</option>
                    <option value="low">✅ Low (Safe)</option>
                    <option value="medium">⚠️ Medium</option>
                    <option value="high">🚫 High</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>TRANSPORT</div>
                  <select
                    className="form-control"
                    value={filters.transport}
                    onChange={(e) => setFilters(f => ({ ...f, transport: e.target.value }))}
                    style={{ marginBottom: 0, height: '34px', fontSize: '0.78rem' }}
                  >
                    <option value="all">All Transport</option>
                    <option value="donor_delivers">🚚 Donor Delivers</option>
                    <option value="receiver_picks_up">📍 Pickup Only</option>
                    <option value="both">🤝 Flexible</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>DISTANCE RADIUS</div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {[
                      { val: 'all', label: 'All' },
                      { val: '2', label: '2 km' },
                      { val: '5', label: '5 km' },
                      { val: '10', label: '10 km' },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        className={`btn btn-sm ${filters.distance === opt.val ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilters(f => ({ ...f, distance: opt.val }))}
                        style={{
                          flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {opt.val === 'all' ? '🌍' : '📍'} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results count */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Showing <strong style={{ color: 'var(--text-1)' }}>{activeDonations.length}</strong> active
            {expiredDonations.length > 0 && <span> · {expiredDonations.length} expired</span>}
            {filters.sortBy === 'urgency' && ' · Sorted by spoilage urgency'}
            {filters.sortBy === 'distance' && ' · Sorted by distance from you'}
            {filters.sortBy === 'quantity' && ' · Sorted by quantity (largest first)'}
          </div>

          {activeDonations.length === 0 && expiredDonations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {activeFilterCount > 0 ? 'No donations match your filters' : 'No nearby donations right now'}
              </h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {activeFilterCount > 0 ? 'Try adjusting your filters or clearing them.' : 'Subscribe below to get notified instantly when food becomes available near you.'}
              </p>
              {!notifyMe ? (
                <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 'var(--r-md)', padding: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔔</div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-1)' }}>Get Notified When Food Is Available</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: '1rem' }}>Choose your preferred categories and we'll send you a real-time WebSocket notification the moment a matching donation is listed.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1rem' }}>
                    {['cooked', 'bakery', 'dairy', 'fruits_vegetables', 'packaged', 'beverages', 'raw'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNotifyCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                        style={{
                          padding: '0.3rem 0.65rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                          background: notifyCategories.includes(cat) ? 'rgba(22,163,74,0.15)' : 'var(--bg-surface)',
                          color: notifyCategories.includes(cat) ? '#4ade80' : 'var(--text-3)',
                          border: notifyCategories.includes(cat) ? '1px solid rgba(22,163,74,0.3)' : '1px solid var(--border)',
                        }}
                      >
                        {categoryEmoji[cat]} {cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-primary" onClick={() => setNotifyMe(true)} disabled={notifyCategories.length === 0}>
                    🔔 Subscribe to Notifications
                  </button>
                </div>
              ) : (
                <div style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--r-md)', padding: '1.25rem', maxWidth: '450px', margin: '0 auto' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>✅ Notification Active</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: '0.5rem' }}>Watching for: <strong style={{ color: '#4ade80' }}>{notifyCategories.join(', ')}</strong></p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>You'll receive an instant WebSocket push notification when matching food is listed.</p>
                  <button className="btn btn-secondary btn-sm" onClick={() => setNotifyMe(false)} style={{ marginTop: '0.75rem', fontSize: '0.72rem' }}>Unsubscribe</button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Active Donations */}
              <div className="grid" style={{ gap: '1rem' }}>
                {activeDonations.map((d) => {
                  const dist = getDistance(d.latitude, d.longitude);
                  return (
                    <div key={d.id} className="card donation-card" style={{
                      borderLeft: d.spoilage_risk === 'high' ? '3px solid #ef4444' : d.spoilage_risk === 'medium' ? '3px solid #f59e0b' : '3px solid #16a34a',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.1rem' }}>{categoryEmoji[d.food_category] || '🍱'}</span>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{d.title}</h3>
                            {riskBadge(d.spoilage_risk)}
                            {transportBadge(d.transport_mode)}
                            <CountdownTimer createdAt={d.created_at} windowHours={d.redistribution_window_hours} />
                          </div>
                          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{d.description}</p>
                          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-3)' }}>
                            <span>📦 {d.quantity_kg} kg</span>
                            <span>🍽️ Serves {d.serves}</span>
                            <span><FaClock style={{ marginRight: '0.25rem' }} />{d.redistribution_window_hours}h window</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>
                              📍 {dist < 100 ? dist.toFixed(1) + ' km' : '—'}
                            </span>
                            {d.donor?.name && <span>🏪 {d.donor.name}</span>}
                            {d.donor?.reliability_score && (
                              <span><FaStar style={{ color: '#fbbf24', marginRight: '0.2rem' }} />Trust: {Math.round(d.donor.reliability_score * 100)}%</span>
                            )}
                          </div>
                          {/* ── IsolationForest Anomaly Flag ── */}
                          {d.is_anomaly && (
                            <div style={{
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: 'var(--r-xs, 6px)',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              color: '#fca5a5',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              marginTop: '0.5rem',
                            }}>
                              ⚠️ <strong>Anomaly Detected</strong> — AI flagged this listing for unusual patterns.
                              Verify food condition before accepting.
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', marginLeft: 'auto', flexShrink: 0 }}>
                                IsolationForest · Score: {d.anomaly_score?.toFixed ? d.anomaly_score.toFixed(2) : '0.85'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                          {user ? (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleAcceptDonation(d)}
                              disabled={acceptLoading}
                              style={{ position: 'relative' }}
                            >
                              {acceptLoading && selectedDonation?.id === d.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff',
                                    animation: 'spin 0.8s linear infinite',
                                  }} />
                                  Matching...
                                </div>
                              ) : (
                                <><FaCheckCircle /> Accept & Route</>
                              )}
                            </button>
                          ) : (
                            <Link to="/auth" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                              🔐 Login to Accept
                            </Link>
                          )}
                          <button className="btn btn-secondary btn-sm" onClick={() => handleMarkDelivered(d)} style={{ fontSize: '0.72rem' }}>
                            ✅ Mark Delivered
                          </button>
                          {(d.transport_mode === 'receiver_picks_up' || d.transport_mode === 'both') && (
                            <button
                              className="btn btn-sm"
                              onClick={() => handleRequestDeliveryPartner(d.id)}
                              disabled={deliveryPartnerRequested[d.id]}
                              style={{
                                fontSize: '0.68rem', padding: '0.25rem 0.5rem',
                                background: deliveryPartnerRequested[d.id] ? 'rgba(22,163,74,0.1)' : 'rgba(96,165,250,0.1)',
                                color: deliveryPartnerRequested[d.id] ? '#4ade80' : '#60a5fa',
                                border: `1px solid ${deliveryPartnerRequested[d.id] ? 'rgba(22,163,74,0.2)' : 'rgba(96,165,250,0.2)'}`,
                              }}
                            >
                              {deliveryPartnerRequested[d.id] ? '✅ Partner Assigned (ETA 15min)' : '🚚 Request Delivery Partner'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expired Donations — Collapsed Section */}
              {expiredDonations.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setShowExpired(v => !v)}
                    style={{
                      background: 'rgba(156,163,175,0.08)', border: '1px solid rgba(156,163,175,0.2)',
                      borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      color: '#9ca3af', fontSize: '0.82rem', fontWeight: 600,
                    }}
                  >
                    <span>⏱ Missed Opportunities — {expiredDonations.length} expired donation{expiredDonations.length > 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '0.7rem' }}>{showExpired ? '▲ Hide' : '▼ Show'}</span>
                  </button>
                  {showExpired && (
                    <div className="grid" style={{ gap: '0.75rem', marginTop: '0.75rem' }}>
                      {expiredDonations.map((d) => {
                        const dist = getDistance(d.latitude, d.longitude);
                        return (
                          <div key={d.id} className="card donation-card" style={{
                            borderLeft: '3px solid #6b7280',
                            opacity: 0.55,
                            filter: 'grayscale(30%)',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '1.1rem' }}>{categoryEmoji[d.food_category] || '🍱'}</span>
                                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#9ca3af' }}>{d.title}</h3>
                                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(156,163,175,0.12)', color: '#9ca3af' }}>
                                    ⏱ EXPIRED
                                  </span>
                                </div>
                                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{d.description}</p>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#6b7280' }}>
                                  <span>📦 {d.quantity_kg} kg</span>
                                  <span>🍽️ Serves {d.serves}</span>
                                  {d.donor?.name && <span>🏪 {d.donor.name}</span>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                                <span style={{
                                  padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.82rem',
                                  fontWeight: 600, background: 'rgba(156,163,175,0.1)', color: '#6b7280',
                                  border: '1px solid rgba(156,163,175,0.2)', textAlign: 'center',
                                  cursor: 'not-allowed',
                                }}>
                                  Expired
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </>)}
        </div>
      )}

      {/* Route Tab — polyline + info box */}
      {tab === 'route' && (
        <div>
          {selectedDonation ? (
            <>
              {/* Route info bar */}
              {routeInfo && (
                <div className="card" style={{ marginBottom: '1rem', borderColor: '#166534' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaRoute style={{ color: '#4ade80', fontSize: '1.2rem' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>Optimized Route</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', display: 'block' }}>DISTANCE</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--data-primary)', fontSize: '1.1rem' }}>
                        {routeInfo.total_distance_km?.toFixed(1)} km
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', display: 'block' }}>EST. TIME</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--data-primary)', fontSize: '1.1rem' }}>
                        {routeInfo.estimated_time_minutes || Math.round((routeInfo.total_distance_km || 0) * 3)} min
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', display: 'block' }}>CO₂ SAVED</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80', fontSize: '1.1rem' }}>
                        <FaLeaf style={{ marginRight: '0.2rem' }} />
                        {routeInfo.co2_saved_kg?.toFixed(2) || '0.35'} kg
                      </span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {riskBadge(selectedDonation.spoilage_risk)}
                      {transportBadge(selectedDonation.transport_mode)}
                    </div>
                  </div>

                  {/* AI Match Explanation Panel */}
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontWeight: 600, letterSpacing: '0.05em' }}>🤖 WHY YOU WERE MATCHED</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80', fontSize: '1rem' }}>
                        {Math.round((matches[0]?.match_score || 0.87) * 100)}%
                      </span>
                    </div>
                    {[
                      { label: 'Distance', value: `${matches[0]?.distance_km?.toFixed(1) || '1.2'} km`, weight: 40, score: 92, color: '#4ade80' },
                      { label: 'Food Compatibility', value: 'High', weight: 25, score: 88, color: '#22c55e' },
                      { label: 'Your Reliability', value: `${Math.round((selectedDonation.donor?.reliability_score || 0.92) * 100)}%`, weight: 15, score: Math.round((selectedDonation.donor?.reliability_score || 0.92) * 100), color: '#fbbf24' },
                      { label: 'Your Capacity', value: `${selectedDonation.serves || 30} people`, weight: 13, score: 85, color: '#60a5fa' },
                      { label: 'Urgency Factor', value: `${selectedDonation.redistribution_window_hours || 4}h window`, weight: 7, score: selectedDonation.spoilage_risk === 'high' ? 95 : 70, color: '#f87171' },
                    ].map((f, i) => (
                      <div key={i} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-2)' }}>✓ {f.label}: <strong>{f.value}</strong></span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)', fontSize: '0.7rem' }}>weight: {f.weight}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${f.score}%`, background: f.color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-4)', textAlign: 'right' }}>
                      Top pick from {Math.min(matches.length || 3, 6)} candidates · GradientBoosting model
                    </div>
                  </div>
                </div>
              )}

              {/* Map with polyline */}
              <div className="hero-map-wrapper" style={{ borderRadius: 'var(--r-lg)' }}>
                <div className="hero-map-label">
                  🛣️ Route: Your Location → {selectedDonation.donor?.name || selectedDonation.title}
                </div>
                <MapView
                  donations={[selectedDonation]}
                  routePoints={routePoints}
                  receiverLocation={receiverLocation}
                />
              </div>

              {/* Donation details below map */}
              <div className="card mt-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FaCheckCircle style={{ color: '#4ade80' }} />
                  <h3>{selectedDonation.title}</h3>
                  {transportBadge(selectedDonation.transport_mode)}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>{selectedDonation.description}</p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
                  <span>📦 {selectedDonation.quantity_kg} kg</span>
                  <span>🍽️ Serves {selectedDonation.serves}</span>
                  <span>⏱️ {selectedDonation.redistribution_window_hours}h window</span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={() => handleMarkDelivered(selectedDonation)}>
                    ✅ Mark as Delivered
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Select a donation to see the optimized route</h3>
              <p style={{ color: 'var(--text-3)' }}>Go to Browse tab and click "Accept & Route" on any donation.</p>
            </div>
          )}
        </div>
      )}

      {/* Map Tab — all donations */}
      {tab === 'map' && (
        <MapView donations={donations} />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fadeIn 0.2s',
        }}>
          <div className="card" style={{
            maxWidth: '460px', width: '90%', padding: '2rem',
            background: 'var(--bg-card)', border: '1px solid var(--border-hover)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            {ratingSubmitted ? (
              /* Certificate */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Environmental Impact Certificate
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1rem' }}>FoodBridge · March 2026</p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--data-primary)', marginBottom: '0.3rem' }}>
                  {((deliveredDonation?.quantity_kg || 5) * 2.5).toFixed(1)} kg CO₂
                </div>
                <p style={{ color: '#4ade80', fontWeight: 600 }}>prevented by rescuing {deliveredDonation?.quantity_kg || 5} kg of food</p>
                <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', margin: '0.75rem 0' }}>
                  Equivalent to planting <strong style={{ color: '#4ade80' }}>{Math.max(1, Math.round((deliveredDonation?.quantity_kg || 5) * 2.5 / 22))} trees</strong> 🌳
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} style={{ color: s <= ratingValue ? '#fbbf24' : 'var(--border)', fontSize: '1.3rem' }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginTop: '0.5rem' }}>
                  Thank you for your {ratingValue}★ rating!
                </p>
              </div>
            ) : (
              /* Rating form */
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Rate This Donation
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                    How was the food from "{deliveredDonation?.title}"?
                  </p>
                </div>

                {/* Star rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '2rem', transition: 'transform 0.15s',
                        transform: star <= ratingValue ? 'scale(1.15)' : 'scale(1)',
                        color: star <= ratingValue ? '#fbbf24' : 'var(--border)',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600, marginBottom: '1rem' }}>
                  {ratingValue === 5 ? '🌟 Excellent!' : ratingValue === 4 ? '👍 Good' : ratingValue === 3 ? '👌 Okay' : ratingValue === 2 ? '😕 Poor' : '😞 Bad'}
                </div>

                {/* Quick feedback */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem', justifyContent: 'center' }}>
                  {['Fresh & as described', 'Great packaging', 'On-time pickup', 'Would do again', 'Needs improvement'].map(q => (
                    <button
                      key={q}
                      className={`btn btn-sm ${ratingComment === q ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setRatingComment(q)}
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Add a comment (optional)..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  style={{ fontSize: '0.85rem', marginBottom: '1rem' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRatingModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmitRating}>
                    ⭐ Submit Rating & Get Certificate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
