import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  urgent?: boolean;
}

export function CountdownTimer({
  initialMinutes = 45,
  initialSeconds = 0,
  label = "Remaining",
  size = "md",
  urgent = false,
}: CountdownTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60 + initialSeconds);

  useEffect(() => {
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setTotalSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = urgent || totalSeconds < 600;

  const color = isUrgent ? "#F59E0B" : "#10B981";

  const sizeClasses = {
    sm: { digit: "text-lg", label: "text-[10px]", gap: "gap-0.5" },
    md: { digit: "text-2xl", label: "text-xs", gap: "gap-1" },
    lg: { digit: "text-4xl", label: "text-sm", gap: "gap-1.5" },
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div className="flex flex-col items-center">
        <span
          className={`${s.digit} font-bold tabular-nums`}
          style={{ color, textShadow: `0 0 20px ${color}80`, fontFamily: "monospace" }}
        >
          {String(minutes).padStart(2, "0")}
        </span>
        <span className={`${s.label} uppercase tracking-widest`} style={{ color: "rgba(255,255,255,0.4)" }}>
          min
        </span>
      </div>
      <span className={`${s.digit} font-bold pb-4`} style={{ color, opacity: 0.7 }}>
        :
      </span>
      <div className="flex flex-col items-center">
        <span
          className={`${s.digit} font-bold tabular-nums`}
          style={{ color, textShadow: `0 0 20px ${color}80`, fontFamily: "monospace" }}
        >
          {String(seconds).padStart(2, "0")}
        </span>
        <span className={`${s.label} uppercase tracking-widest`} style={{ color: "rgba(255,255,255,0.4)" }}>
          sec
        </span>
      </div>
    </div>
  );
}
