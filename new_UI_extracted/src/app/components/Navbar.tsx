import React, { useState, useEffect } from "react";
import { Leaf, BarChart2, LayoutDashboard, Users, Settings, ChevronDown } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navLinks = [
  { id: "hero", label: "Home", icon: Leaf },
  { id: "impact", label: "Impact", icon: BarChart2 },
  { id: "donor", label: "Donor", icon: LayoutDashboard },
  { id: "receiver", label: "Receiver", icon: Users },
  { id: "admin", label: "Admin", icon: Settings },
];

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(7,16,12,0.92)" : "rgba(7,16,12,0.6)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(16,185,129,0.12)",
        boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.5)" : "none",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => onNavigate("hero")} className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 0 20px rgba(16,185,129,0.25)",
            }}
          >
            <Leaf size={16} style={{ color: "#10B981" }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight" style={{ color: "white" }}>
              EcoTech
            </span>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: "#10B981" }}>
              FoodBridge
            </span>
          </div>
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: isActive ? "rgba(16,185,129,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                  color: isActive ? "#10B981" : "rgba(255,255,255,0.55)",
                }}
              >
                <Icon size={13} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }}
            />
            <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#10B981" }}>
              System Live
            </span>
          </div>

          <NotificationBell />

          {/* User Avatar */}
          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
              }}
            >
              AJ
            </div>
            <span className="text-xs hidden sm:block" style={{ color: "rgba(255,255,255,0.7)" }}>
              Admin
            </span>
            <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>
      </div>
    </nav>
  );
}
