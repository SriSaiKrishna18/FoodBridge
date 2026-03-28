import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, X, MapPin, Package } from "lucide-react";

const toastMessages = [
  { id: 1, text: "20 lbs of Pasta just listed nearby!", location: "0.4 mi — Downtown", icon: Package },
  { id: 2, text: "35 lbs of Bread available — Baker's Co.", location: "1.2 mi — Midtown", icon: Package },
  { id: 3, text: "AI matched shelter with fresh produce!", location: "0.8 mi — East Side", icon: Wifi },
  { id: 4, text: "12 lbs of Dairy — expires in 3 hours", location: "0.6 mi — West End", icon: Package },
  { id: 5, text: "Community kitchen claimed 60 lbs of rice!", location: "1.5 mi — South District", icon: Wifi },
];

export function ToastNotification() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const rotate = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % toastMessages.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(rotate);
  }, []);

  const current = toastMessages[currentIndex];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ maxWidth: "480px", width: "calc(100vw - 48px)" }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(10,20,16,0.92)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(16,185,129,0.35)",
                boxShadow: "0 0 30px rgba(16,185,129,0.2), 0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Live badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }}
                />
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#10B981" }}>
                  Live
                </span>
              </div>

              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <Icon size={14} style={{ color: "#10B981" }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                    WebSocket
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>just now</span>
                </div>
                <p className="text-sm font-semibold truncate mt-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {current.text}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 shrink-0">
                <MapPin size={10} style={{ color: "#F59E0B" }} />
                <span className="text-[10px] font-medium" style={{ color: "#F59E0B" }}>
                  {current.location}
                </span>
              </div>

              <button
                onClick={() => setVisible(false)}
                className="ml-1 shrink-0 opacity-40 hover:opacity-80 transition-opacity"
              >
                <X size={12} style={{ color: "white" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
