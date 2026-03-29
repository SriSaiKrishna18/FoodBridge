import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers (teardrop shape)
const createColorIcon = (color, size = 28) => new L.DivIcon({
  className: 'custom-marker pulse-marker',
  html: `<div style="
    width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0;
    background: ${color}; transform: rotate(-45deg);
    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  "><div style="width: 8px; height: 8px; border-radius: 50%; background: white; transform: rotate(45deg);"></div></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
});

// Receiver pin — teal circle style
const receiverIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px; height: 32px; border-radius: 50%;
    background: #06b6d4; border: 3px solid white;
    box-shadow: 0 0 12px rgba(6,182,212,0.5), 0 2px 8px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    animation: pulse-glow 2s infinite;
  "><div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

// Auto-fit bounds
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [positions, map]);
  return null;
}

// Generate road-like interpolated path between waypoints
function interpolateRoute(positions) {
  if (positions.length < 2) return positions;
  const result = [];
  for (let i = 0; i < positions.length - 1; i++) {
    const [lat1, lng1] = positions[i];
    const [lat2, lng2] = positions[i + 1];
    const SEGMENTS = 8;
    result.push([lat1, lng1]);
    for (let s = 1; s < SEGMENTS; s++) {
      const t = s / SEGMENTS;
      // Alternate lateral offsets to simulate road turns
      const perpDir = s % 2 === 0 ? 1 : -1;
      const offset = perpDir * Math.sin(t * Math.PI) * 0.003 * (0.5 + Math.random() * 0.5);
      const dx = lng2 - lng1;
      const dy = lat2 - lat1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      // Perpendicular direction
      const perpLat = -dx / len * offset;
      const perpLng = dy / len * offset;
      result.push([
        lat1 + (lat2 - lat1) * t + perpLat,
        lng1 + (lng2 - lng1) * t + perpLng,
      ]);
    }
  }
  result.push(positions[positions.length - 1]);
  return result;
}

// Animated polyline (CSS animated dashes with road-like path)
function AnimatedPolyline({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 2) return;
    const roadPath = interpolateRoute(positions);
    const polyline = L.polyline(roadPath, {
      color: '#10b981',
      weight: 4,
      opacity: 0.9,
      dashArray: '12, 8',
      className: 'animated-route',
    }).addTo(map);
    return () => { map.removeLayer(polyline); };
  }, [positions, map]);
  return null;
}

export default function MapView({ donations = [], receivers = [], routePoints = [], receiverLocation = null }) {
  const center = [13.02, 80.22]; // Chennai center

  // Collect positions for fitting (include route points)
  const positions = [
    ...donations.filter(d => d.latitude && d.longitude).map(d => [d.latitude, d.longitude]),
    ...routePoints,
    ...(receiverLocation ? [[receiverLocation.lat, receiverLocation.lng]] : []),
  ];

  return (
    <div className="map-container" style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {positions.length > 0 && <FitBounds positions={positions} />}

        {/* Donation markers color-coded by spoilage risk */}
        {donations.filter(d => d.latitude && d.longitude).map((d) => (
          <Marker
            key={`don-${d.id}`}
            position={[d.latitude, d.longitude]}
            icon={createColorIcon(RISK_COLORS[d.spoilage_risk] || '#10b981')}
          >
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '200px' }}>
                <strong style={{ fontSize: '0.95rem' }}>{d.title}</strong>
                <div style={{ margin: '0.3rem 0', fontSize: '0.82rem', color: '#666' }}>
                  📦 {d.quantity_kg} kg · 🍽️ Serves {d.serves}
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600,
                    background: d.spoilage_risk === 'low' ? '#dcfce7' : d.spoilage_risk === 'medium' ? '#fef3c7' : '#fee2e2',
                    color: d.spoilage_risk === 'low' ? '#16a34a' : d.spoilage_risk === 'medium' ? '#d97706' : '#dc2626',
                  }}>
                    {d.spoilage_risk === 'low' ? '✅ Safe' : d.spoilage_risk === 'medium' ? '⚠️ Moderate' : '🚫 High Risk'}
                  </span>
                  {d.redistribution_window_hours && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
                      ⏱️ {d.redistribution_window_hours}h window
                    </span>
                  )}
                </div>
                {d.donor?.name && (
                  <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: '#999' }}>📍 {d.donor.name}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Receiver location pin (teal) */}
        {receiverLocation && (
          <Marker position={[receiverLocation.lat, receiverLocation.lng]} icon={receiverIcon}>
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <strong>📍 Your Location</strong>
                <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '0.2rem' }}>Receiver pickup point</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Animated route polyline */}
        {routePoints.length > 1 && <AnimatedPolyline positions={routePoints} />}
      </MapContainer>
    </div>
  );
}
