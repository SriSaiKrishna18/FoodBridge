import React, { useState, useEffect } from "react";
import { GlassCard } from "./GlassCard";
import { AlertTriangle, Clock, CheckCircle, Flame } from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  totalHours: number;
  remainingHours: number;
  category: string;
}

const mockItems: FoodItem[] = [
  { id: "1", name: "Greek Yogurt", quantity: "8 lbs", totalHours: 24, remainingHours: 4, category: "Dairy" },
  { id: "2", name: "Cooked Pasta", quantity: "20 lbs", totalHours: 48, remainingHours: 22, category: "Grain" },
  { id: "3", name: "Mixed Greens", quantity: "12 lbs", totalHours: 36, remainingHours: 9, category: "Produce" },
  { id: "4", name: "Sourdough Bread", quantity: "15 lbs", totalHours: 72, remainingHours: 55, category: "Bakery" },
];

function SpoilageRing({ percent, color }: { percent: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ * (1 - percent / 100);

  return (
    <svg width="56" height="56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={strokeDash}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{
          filter: `drop-shadow(0 0 6px ${color}80)`,
          transition: "stroke-dashoffset 1s ease",
        }}
      />
      <text
        x="28"
        y="32"
        textAnchor="middle"
        fill={color}
        fontSize="10"
        fontWeight="700"
        fontFamily="'Plus Jakarta Sans', sans-serif"
      >
        {percent}%
      </text>
    </svg>
  );
}

export function SpoilageTracker() {
  const [items, setItems] = useState(mockItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          remainingHours: Math.max(0, item.remainingHours - 0.01),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-5 h-full" neon="orange">
      {/* Orange accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)" }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <Clock size={14} style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "white" }}>
              Spoilage Tracker
            </h3>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              Shelf-life monitoring
            </p>
          </div>
        </div>
        <div
          className="text-[10px] px-2 py-1 rounded-lg"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
        >
          {items.filter((i) => i.remainingHours < 12).length} URGENT
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const pct = Math.round((item.remainingHours / item.totalHours) * 100);
          const isUrgent = item.remainingHours < 12;
          const isCritical = item.remainingHours < 6;
          const color = isCritical ? "#ef4444" : isUrgent ? "#F59E0B" : "#10B981";

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
              style={{
                background: isCritical
                  ? "rgba(239,68,68,0.06)"
                  : isUrgent
                  ? "rgba(245,158,11,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${isCritical ? "rgba(239,68,68,0.2)" : isUrgent ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <SpoilageRing percent={pct} color={color} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {isCritical && <Flame size={10} style={{ color: "#ef4444" }} />}
                  {isUrgent && !isCritical && <AlertTriangle size={10} style={{ color: "#F59E0B" }} />}
                  {!isUrgent && <CheckCircle size={10} style={{ color: "#10B981" }} />}
                  <span className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {item.quantity}
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className="text-xs font-bold"
                  style={{ color, textShadow: `0 0 10px ${color}60` }}
                >
                  {item.remainingHours.toFixed(1)}h
                </span>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  left
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predictive note */}
      <div
        className="mt-4 px-3 py-2 rounded-xl flex items-center gap-2"
        style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        <p className="text-[10px]" style={{ color: "rgba(96,165,250,0.9)" }}>
          AI predicts Greek Yogurt needs redistribution within 2 hours.
        </p>
      </div>
    </GlassCard>
  );
}
