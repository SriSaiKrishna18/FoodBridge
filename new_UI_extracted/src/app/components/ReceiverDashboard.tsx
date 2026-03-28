import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { MapView } from "./MapView";
import { MatchCard, MatchData } from "./MatchCard";
import { Navigation, Filter, Search, SortAsc, Layers, RefreshCw, Users } from "lucide-react";

const mockMatches: MatchData[] = [
  {
    id: "m1",
    aiScore: 98,
    foodName: "Sourdough Bread",
    category: "Bakery",
    quantity: "25 lbs",
    donor: "Baker's Co. — Midtown",
    distance: "0.4 mi",
    urgency: "high",
    remainingMin: 32,
    remainingSec: 15,
    tags: ["Vegan", "No Nuts"],
  },
  {
    id: "m2",
    aiScore: 94,
    foodName: "Mixed Salad Greens",
    category: "Produce",
    quantity: "12 lbs",
    donor: "Green Grocer — East St.",
    distance: "0.8 mi",
    urgency: "medium",
    remainingMin: 55,
    remainingSec: 0,
    tags: ["Organic", "Vegan"],
  },
  {
    id: "m3",
    aiScore: 91,
    foodName: "Cooked Pasta",
    category: "Prepared",
    quantity: "20 lbs",
    donor: "Bella Cucina — Downtown",
    distance: "1.2 mi",
    urgency: "critical",
    remainingMin: 12,
    remainingSec: 40,
    tags: ["Halal", "Gluten"],
  },
  {
    id: "m4",
    aiScore: 87,
    foodName: "Greek Yogurt",
    category: "Dairy",
    quantity: "8 lbs",
    donor: "Market St. Café",
    distance: "1.5 mi",
    urgency: "high",
    remainingMin: 48,
    remainingSec: 20,
    tags: ["Vegetarian"],
  },
  {
    id: "m5",
    aiScore: 82,
    foodName: "Assorted Pastries",
    category: "Bakery",
    quantity: "18 lbs",
    donor: "City Bakery — West End",
    distance: "2.1 mi",
    urgency: "medium",
    remainingMin: 90,
    remainingSec: 0,
    tags: ["Contains Nuts"],
  },
  {
    id: "m6",
    aiScore: 78,
    foodName: "Brown Rice (cooked)",
    category: "Grains",
    quantity: "35 lbs",
    donor: "Metro Hotel Kitchen",
    distance: "2.6 mi",
    urgency: "low",
    remainingMin: 180,
    remainingSec: 0,
    tags: ["Vegan", "Gluten-Free"],
  },
];

const filters = ["All", "Critical", "Nearby", "Vegan", "Halal", "Gluten-Free"];

export function ReceiverDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockMatches.filter((m) => {
    if (activeFilter === "Critical") return m.urgency === "critical" || m.urgency === "high";
    if (activeFilter === "Nearby") return parseFloat(m.distance) < 1.5;
    if (activeFilter === "Vegan") return m.tags.includes("Vegan");
    if (activeFilter === "Halal") return m.tags.includes("Halal");
    if (activeFilter === "Gluten-Free") return m.tags.includes("Gluten-Free");
    return true;
  }).filter((m) =>
    searchQuery === "" || m.foodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="receiver" className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)" }}
            >
              <Navigation size={18} style={{ color: "#60A5FA" }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "#60A5FA" }}>
                Receiver Command Center
              </div>
              <h2 className="text-3xl font-bold" style={{ color: "white" }}>
                Logistics Hub
              </h2>
            </div>
          </div>
          <p className="text-sm ml-13" style={{ color: "rgba(255,255,255,0.45)", marginLeft: "52px" }}>
            Monitor live surplus availability, claim food matches, and track redistribution routes in real time.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Available Listings", value: "24", color: "#10B981", icon: "📦" },
            { label: "Active Routes", value: "8", color: "#60A5FA", icon: "🚚" },
            { label: "Critical Alerts", value: "3", color: "#ef4444", icon: "🔴" },
            { label: "My Claims Today", value: "6", color: "#F59E0B", icon: "✅" },
          ].map((s) => (
            <GlassCard
              key={s.label}
              className="px-4 py-3 flex items-center gap-3"
              neon={s.label.includes("Critical") ? "orange" : "green"}
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-xl font-bold" style={{ color: s.color, textShadow: `0 0 20px ${s.color}50` }}>
                  {s.value}
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {s.label}
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Main content: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Map — takes 7 cols */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <GlassCard className="h-full overflow-hidden" neon="none" style={{ minHeight: 520, padding: 0 }}>
              {/* Map header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
                  >
                    <Layers size={12} style={{ color: "#10B981" }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "white" }}>
                    Live Map · HeatMap View
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Surplus", color: "#10B981" },
                    { label: "High Need", color: "#ef4444" },
                    { label: "Route", color: "#10B981", dash: true },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1 hidden sm:flex">
                      {l.dash ? (
                        <div className="w-5 h-px" style={{ borderTop: `2px dashed ${l.color}`, opacity: 0.8 }} />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, opacity: 0.6 }} />
                      )}
                      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{l.label}</span>
                    </div>
                  ))}
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <RefreshCw size={10} style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="w-full" style={{ height: "calc(100% - 52px)", minHeight: 468 }}>
                <MapView />
              </div>
            </GlassCard>
          </motion.div>

          {/* Match Cards Sidebar — 5 cols */}
          <motion.div
            className="lg:col-span-5 flex flex-col gap-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Search & Filter */}
            <GlassCard className="p-3" neon="none">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input
                    type="text"
                    placeholder="Search listings…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.8)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <SortAsc size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200"
                    style={{
                      background: activeFilter === f ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
                      border: activeFilter === f ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      color: activeFilter === f ? "#10B981" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    <Filter size={7} className="inline mr-1" />
                    {f}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-3" style={{ maxHeight: 440 }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Users size={24} className="mb-2" />
                  <p className="text-sm">No matches found</p>
                </div>
              ) : (
                filtered.map((match, i) => (
                  <MatchCard key={match.id} match={match} index={i} />
                ))
              )}
            </div>

            {/* AI Insight */}
            <GlassCard className="p-3" neon="green">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)" }}
                >
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "#60A5FA" }}>
                    AI Recommendation
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Claim Pasta (#m3) now — 12 min window. Route optimized via Distribution Hub · saves 2.4 lbs CO₂.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
