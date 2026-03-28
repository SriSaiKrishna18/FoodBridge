import React from "react";
import { GlassCard } from "./GlassCard";
import { CountdownTimer } from "./CountdownTimer";
import { MapPin, Weight, Zap, Star, ChevronRight, Package } from "lucide-react";
import { motion } from "motion/react";

export interface MatchData {
  id: string;
  aiScore: number;
  foodName: string;
  category: string;
  quantity: string;
  donor: string;
  distance: string;
  urgency: "low" | "medium" | "high" | "critical";
  remainingMin: number;
  remainingSec: number;
  tags: string[];
  imageUrl?: string;
}

interface MatchCardProps {
  match: MatchData;
  index: number;
  compact?: boolean;
}

const urgencyConfig = {
  low: { color: "#10B981", label: "Normal" },
  medium: { color: "#60A5FA", label: "Soon" },
  high: { color: "#F59E0B", label: "Urgent" },
  critical: { color: "#ef4444", label: "Critical" },
};

export function MatchCard({ match, index, compact = false }: MatchCardProps) {
  const urgency = urgencyConfig[match.urgency];
  const scorePct = match.aiScore;
  const scoreColor = scorePct >= 90 ? "#10B981" : scorePct >= 70 ? "#F59E0B" : "#ef4444";
  const circumference = 2 * Math.PI * 18;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <GlassCard
        className="p-4 group hover:scale-[1.015] transition-all duration-300"
        neon={match.urgency === "critical" || match.urgency === "high" ? "orange" : "green"}
        style={
          match.urgency === "critical"
            ? { border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 30px rgba(239,68,68,0.08)" }
            : undefined
        }
      >
        {/* Top line */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${urgency.color}60, transparent)`,
          }}
        />

        <div className="flex items-start gap-3">
          {/* AI Score Ring */}
          <div className="relative shrink-0">
            <svg width="44" height="44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={scoreColor}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - scorePct / 100)}
                strokeLinecap="round"
                transform="rotate(-90 22 22)"
                style={{ filter: `drop-shadow(0 0 5px ${scoreColor}80)` }}
              />
              <text
                x="22"
                y="25.5"
                textAnchor="middle"
                fill={scoreColor}
                fontSize="9"
                fontWeight="800"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {scorePct}%
              </text>
            </svg>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.4)" }}
            >
              <Zap size={8} style={{ color: "#60A5FA" }} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm font-bold truncate" style={{ color: "white" }}>
                  {match.foodName}
                </h4>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {match.donor}
                </p>
              </div>
              <div
                className="shrink-0 text-[9px] px-2 py-0.5 rounded-lg font-semibold uppercase tracking-wider"
                style={{
                  background: `${urgency.color}15`,
                  border: `1px solid ${urgency.color}30`,
                  color: urgency.color,
                  boxShadow: match.urgency === "critical" ? `0 0 10px ${urgency.color}40` : undefined,
                }}
              >
                {urgency.label}
              </div>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Weight size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {match.quantity}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={9} style={{ color: "#F59E0B" }} />
                <span className="text-[10px]" style={{ color: "#F59E0B" }}>
                  {match.distance}
                </span>
              </div>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Package size={9} style={{ color: "rgba(255,255,255,0.35)" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {match.category}
                </span>
              </div>
            </div>

            {/* Tags */}
            {match.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {match.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded-md"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      color: "rgba(16,185,129,0.8)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Timer + Claim */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Expires in
            </p>
            <CountdownTimer
              initialMinutes={match.remainingMin}
              initialSeconds={match.remainingSec}
              size="sm"
              urgent={match.urgency === "high" || match.urgency === "critical"}
            />
          </div>

          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background:
                match.urgency === "critical"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : match.urgency === "high"
                  ? "linear-gradient(135deg, #F59E0B, #d97706)"
                  : "linear-gradient(135deg, #10B981, #059669)",
              color: "white",
              boxShadow:
                match.urgency === "critical"
                  ? "0 0 20px rgba(239,68,68,0.5)"
                  : match.urgency === "high"
                  ? "0 0 20px rgba(245,158,11,0.5)"
                  : "0 0 20px rgba(16,185,129,0.4)",
            }}
          >
            <Star size={11} />
            Claim
            <ChevronRight size={10} />
          </button>
        </div>

        {/* Rank badge */}
        {index === 0 && (
          <div
            className="absolute top-3 right-3 text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#10B981" }}
          >
            #1 Match
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
