import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ToastNotification } from "./components/ToastNotification";
import { HeroSection } from "./components/HeroSection";
import { ImpactCounter } from "./components/ImpactCounter";
import { HowItWorks } from "./components/HowItWorks";
import { DonorDashboard } from "./components/DonorDashboard";
import { ReceiverDashboard } from "./components/ReceiverDashboard";
import { AdminPanel } from "./components/AdminPanel";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  // Track which section is in view
  useEffect(() => {
    const sectionIds = ["hero", "impact", "donor", "receiver", "admin"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #050e0a 0%, #070f1c 40%, #0a1a0e 70%, #060d1a 100%)",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Fixed Navbar */}
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main>
        {/* Section 1: Hero / Auth */}
        <HeroSection />

        {/* Section divider */}
        <SectionDivider color="#10B981" />

        {/* Section 2: Impact Counters */}
        <ImpactCounter />

        {/* Section divider */}
        <SectionDivider color="rgba(255,255,255,0.06)" />

        {/* Section 3: How It Works */}
        <HowItWorks />

        {/* Section divider with label */}
        <SectionDivider color="#10B981" label="Donor Portal" />

        {/* Section 4: Donor Dashboard */}
        <DonorDashboard />

        {/* Section divider with label */}
        <SectionDivider color="#60A5FA" label="Receiver Command Center" />

        {/* Section 5: Receiver / Logistics */}
        <ReceiverDashboard />

        {/* Section divider with label */}
        <SectionDivider color="#F59E0B" label="System Administration" />

        {/* Section 6: Admin Panel */}
        <AdminPanel />
      </main>

      {/* Global Floating Toast */}
      <ToastNotification />
    </div>
  );
}

function SectionDivider({
  color = "rgba(255,255,255,0.06)",
  label,
}: {
  color?: string;
  label?: string;
}) {
  return (
    <div className="relative flex items-center justify-center py-2 px-6">
      <div
        className="absolute left-6 right-6 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, ${color}60, ${color}40, transparent)`,
        }}
      />
      {label && (
        <div
          className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold"
          style={{
            background: "rgba(7,14,10,0.9)",
            border: `1px solid ${color}30`,
            color: color,
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
          {label}
        </div>
      )}
    </div>
  );
}
