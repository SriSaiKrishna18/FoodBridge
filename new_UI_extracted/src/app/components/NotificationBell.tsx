import React, { useState } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";

const notifications = [
  { id: 1, type: "match", icon: Zap, message: "AI matched: 20 lbs Pasta → St. Mary's Shelter", time: "2m ago", color: "#10B981", read: false },
  { id: 2, type: "urgent", icon: AlertTriangle, message: "URGENT: 15 lbs Dairy expiring in 2hrs", time: "8m ago", color: "#F59E0B", read: false },
  { id: 3, type: "success", icon: CheckCircle, message: "Donation #1482 successfully delivered", time: "15m ago", color: "#10B981", read: false },
  { id: 4, type: "match", icon: Zap, message: "New: 40 lbs Bread listed in your area", time: "22m ago", color: "#10B981", read: true },
  { id: 5, type: "urgent", icon: AlertTriangle, message: "High demand alert: Downtown District", time: "1hr ago", color: "#F59E0B", read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <Bell size={18} style={{ color: "rgba(255,255,255,0.8)" }} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
            style={{
              background: "#ef4444",
              color: "white",
              boxShadow: "0 0 10px rgba(239,68,68,0.6)",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80">
          <GlassCard className="p-0 overflow-hidden" neon="green">
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
              <span className="text-sm font-semibold" style={{ color: "white" }}>
                Notifications
              </span>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-[10px] uppercase tracking-wider" style={{ color: "#10B981" }}>
                  Mark all read
                </button>
                <button onClick={() => setOpen(false)}>
                  <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-white/5"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      opacity: n.read ? 0.55 : 1,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${n.color}18`, border: `1px solid ${n.color}30` }}
                    >
                      <Icon size={12} style={{ color: n.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {n.time}
                      </p>
                    </div>
                    {!n.read && (
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: n.color, boxShadow: `0 0 6px ${n.color}` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
