import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Heatmap overlay for Leaflet.
 * Shows supply (green) vs demand (red) density.
 * @param {Array} points - Array of [lat, lng, intensity]
 * @param {Object} options - Leaflet.heat options override
 */
export default function HeatmapLayer({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const defaultOpts = {
      radius: 25,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      ...options,
    };

    const heat = L.heatLayer(points, defaultOpts).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map, JSON.stringify(options)]);

  return null;
}
