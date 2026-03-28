import React, { useEffect, useRef, useState } from "react";

interface MapPoint {
  id: string;
  x: number;
  y: number;
  type: "donor" | "receiver" | "hub";
  name: string;
  heat: "high-supply" | "high-need" | "neutral";
  active: boolean;
}

const mapPoints: MapPoint[] = [
  { id: "d1", x: 18, y: 22, type: "donor", name: "Bella Cucina", heat: "high-supply", active: true },
  { id: "d2", x: 52, y: 15, type: "donor", name: "Green Grocer", heat: "high-supply", active: true },
  { id: "d3", x: 72, y: 38, type: "donor", name: "Baker's Co.", heat: "high-supply", active: true },
  { id: "d4", x: 35, y: 58, type: "donor", name: "Metro Hotel", heat: "high-supply", active: false },
  { id: "d5", x: 60, y: 72, type: "donor", name: "Market St. Café", heat: "high-supply", active: true },
  { id: "r1", x: 30, y: 35, type: "receiver", name: "City Shelter", heat: "high-need", active: true },
  { id: "r2", x: 55, y: 52, type: "receiver", name: "Hope House", heat: "high-need", active: true },
  { id: "r3", x: 75, y: 68, type: "receiver", name: "St. Mary's", heat: "high-need", active: true },
  { id: "r4", x: 20, y: 68, type: "receiver", name: "West Shelter", heat: "high-need", active: false },
  { id: "h1", x: 45, y: 35, type: "hub", name: "Distribution Hub", heat: "neutral", active: true },
];

const activeRoutes = [
  { from: "d1", to: "r1", active: true },
  { from: "d2", to: "h1", active: true },
  { from: "h1", to: "r2", active: true },
  { from: "d3", to: "r3", active: true },
  { from: "d5", to: "r2", active: false },
];

const heatAreas = [
  { cx: 18, cy: 22, r: 14, type: "supply" },
  { cx: 52, cy: 15, r: 18, type: "supply" },
  { cx: 72, cy: 38, r: 16, type: "supply" },
  { cx: 60, cy: 72, r: 12, type: "supply" },
  { cx: 30, cy: 35, r: 16, type: "need" },
  { cx: 55, cy: 52, r: 14, type: "need" },
  { cx: 75, cy: 68, r: 13, type: "need" },
  { cx: 20, cy: 68, r: 10, type: "need" },
];

// City grid roads
const horizontalRoads = [10, 25, 40, 55, 70, 85];
const verticalRoads = [12, 28, 44, 60, 75, 88];

function getCoords(id: string, size: { w: number; h: number }) {
  const pt = mapPoints.find((p) => p.id === id);
  if (!pt) return { x: 0, y: 0 };
  return { x: (pt.x / 100) * size.w, y: (pt.y / 100) * size.h };
}

export function MapView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [animOffset, setAnimOffset] = useState(0);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ w: width, h: height });
      }
    });
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf: number;
    let start: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      setAnimOffset(((ts - start) / 30) % 40);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { w, h } = size;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: 460 }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ display: "block" }}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Background gradient */}
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#050f0a" />
            <stop offset="100%" stopColor="#070d1a" />
          </linearGradient>

          {/* Supply heatmap */}
          <radialGradient id="supplyGrad">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          {/* Need heatmap */}
          <radialGradient id="needGrad">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Route glow */}
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Blur filter for heatmap */}
          <filter id="heatBlur">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* Background */}
        <rect width={w} height={h} fill="url(#mapBg)" />

        {/* City grid - faint roads */}
        {horizontalRoads.map((y) => (
          <line
            key={`h${y}`}
            x1={0} y1={(y / 100) * h}
            x2={w} y2={(y / 100) * h}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        {verticalRoads.map((x) => (
          <line
            key={`v${x}`}
            x1={(x / 100) * w} y1={0}
            x2={(x / 100) * w} y2={h}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {/* City blocks */}
        {[
          [14, 12, 10, 10], [32, 12, 8, 10], [50, 12, 18, 10], [72, 12, 12, 10],
          [14, 27, 10, 10], [28, 27, 13, 10], [46, 27, 10, 10], [60, 27, 10, 10], [75, 27, 10, 10],
          [14, 42, 10, 10], [30, 42, 10, 10], [46, 42, 10, 10], [62, 42, 10, 10], [76, 42, 10, 10],
          [14, 57, 10, 10], [30, 57, 10, 10], [46, 57, 10, 10], [62, 57, 10, 10],
          [14, 72, 10, 10], [30, 72, 10, 10], [46, 72, 10, 10], [62, 72, 10, 10], [76, 72, 10, 10],
        ].map(([x, y, bw, bh], i) => (
          <rect
            key={i}
            x={(x / 100) * w}
            y={(y / 100) * h}
            width={(bw / 100) * w}
            height={(bh / 100) * h}
            rx={3}
            fill="rgba(255,255,255,0.025)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        ))}

        {/* Heatmap layer */}
        <g filter="url(#heatBlur)">
          {heatAreas.map((area, i) => (
            <circle
              key={i}
              cx={(area.cx / 100) * w}
              cy={(area.cy / 100) * h}
              r={(area.r / 100) * Math.min(w, h)}
              fill={area.type === "supply" ? "url(#supplyGrad)" : "url(#needGrad)"}
            />
          ))}
        </g>

        {/* Active routes */}
        {activeRoutes.map((route, i) => {
          const from = getCoords(route.from, size);
          const to = getCoords(route.to, size);
          const mx = (from.x + to.x) / 2;
          const my = Math.min(from.y, to.y) - 30;
          const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
          return (
            <g key={i} filter="url(#routeGlow)">
              {/* Shadow/glow */}
              <path
                d={d}
                fill="none"
                stroke={route.active ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"}
                strokeWidth="6"
              />
              {/* Main line */}
              <path
                d={d}
                fill="none"
                stroke={route.active ? "#10B981" : "rgba(255,255,255,0.1)"}
                strokeWidth="1.5"
                strokeDasharray="8 4"
                strokeDashoffset={-animOffset}
                style={{ opacity: route.active ? 1 : 0.3 }}
              />
            </g>
          );
        })}

        {/* Map points */}
        {mapPoints.map((pt) => {
          const px = (pt.x / 100) * w;
          const py = (pt.y / 100) * h;
          const isHovered = hovered === pt.id;
          const color =
            pt.type === "donor" ? "#10B981" :
            pt.type === "receiver" ? "#ef4444" :
            "#60A5FA";
          const innerColor =
            pt.type === "donor" ? "#34D399" :
            pt.type === "receiver" ? "#f87171" :
            "#93C5FD";
          const size2 = pt.type === "hub" ? 12 : 9;

          return (
            <g
              key={pt.id}
              onMouseEnter={() => setHovered(pt.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Pulse ring */}
              {pt.active && (
                <circle
                  cx={px}
                  cy={py}
                  r={size2 + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.3"
                />
              )}

              {/* Outer glow */}
              <circle
                cx={px}
                cy={py}
                r={size2 + 2}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={pt.active ? 0.5 : 0.2}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />

              {/* Main dot */}
              <circle
                cx={px}
                cy={py}
                r={size2}
                fill={`${color}20`}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                opacity={pt.active ? 1 : 0.4}
              />

              {/* Inner dot */}
              <circle cx={px} cy={py} r={size2 * 0.4} fill={innerColor} opacity={pt.active ? 1 : 0.3} />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={px + 14}
                    y={py - 14}
                    width={pt.name.length * 7 + 16}
                    height={22}
                    rx={6}
                    fill="rgba(10,20,16,0.95)"
                    stroke={color}
                    strokeWidth="0.5"
                  />
                  <text
                    x={px + 22}
                    y={py + 2}
                    fill={color}
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                  >
                    {pt.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${w - 170}, ${h - 100})`}>
          <rect width={160} height={90} rx={10} fill="rgba(5,12,9,0.85)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.5" />
          <text x={10} y={18} fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="2">LEGEND</text>
          {[
            { color: "#10B981", label: "Surplus Donor", y: 34 },
            { color: "#ef4444", label: "Receiver / NGO", y: 50 },
            { color: "#60A5FA", label: "Distribution Hub", y: 66 },
            { color: "rgba(16,185,129,0.3)", label: "Supply Heatmap", y: 82, isRect: true, fill: "rgba(16,185,129,0.3)" },
          ].map((l) => (
            <g key={l.label}>
              {l.isRect ? (
                <rect x={10} y={l.y - 5} width={10} height={10} rx={2} fill={l.color} />
              ) : (
                <circle cx={15} cy={l.y - 1} r={4} fill={`${l.color}20`} stroke={l.color} strokeWidth="1.5" />
              )}
              <text x={30} y={l.y + 2} fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif">{l.label}</text>
            </g>
          ))}
        </g>

        {/* Live badge */}
        <g transform={`translate(16, 16)`}>
          <rect width={80} height={26} rx={8} fill="rgba(5,12,9,0.85)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" />
          <circle cx={16} cy={13} r={4} fill="#10B981">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x={26} y={17.5} fill="#10B981" fontSize="9" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="1.5">LIVE MAP</text>
        </g>
      </svg>
    </div>
  );
}
