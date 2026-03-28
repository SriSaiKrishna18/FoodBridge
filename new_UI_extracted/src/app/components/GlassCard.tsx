import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  neon?: "green" | "orange" | "none";
  onClick?: () => void;
}

export function GlassCard({ children, className = "", style, neon = "green", onClick }: GlassCardProps) {
  const borderColor =
    neon === "green" ? "rgba(16,185,129,0.25)" :
    neon === "orange" ? "rgba(245,158,11,0.25)" :
    "rgba(255,255,255,0.08)";

  const glowColor =
    neon === "green" ? "rgba(16,185,129,0.08)" :
    neon === "orange" ? "rgba(245,158,11,0.08)" :
    "transparent";

  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.035)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 40px ${glowColor}, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
