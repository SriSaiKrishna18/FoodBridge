import React, { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import {
  Settings, TrendingUp, Cpu, Activity, AlertTriangle, CheckCircle,
  Zap, Database, Globe, Users, ArrowUpRight, RefreshCw, Clock
} from "lucide-react";

const matchesData = [
  { time: "00:00", matches: 12, latency: 180 },
  { time: "04:00", matches: 8, latency: 210 },
  { time: "08:00", matches: 45, latency: 145 },
  { time: "10:00", matches: 89, latency: 120 },
  { time: "12:00", matches: 134, latency: 95 },
  { time: "14:00", matches: 112, latency: 105 },
  { time: "16:00", matches: 98, latency: 115 },
  { time: "18:00", matches: 76, latency: 130 },
  { time: "20:00", matches: 54, latency: 155 },
  { time: "22:00", matches: 32, latency: 170 },
  { time: "Now", matches: 28, latency: 162 },
];

const aiModelData = [
  { name: "Match Acc.", value: 98, fill: "#10B981" },
  { name: "NLP Score", value: 94, fill: "#60A5FA" },
  { name: "Route Opt.", value: 89, fill: "#F59E0B" },
  { name: "Spoilage", value: 96, fill: "#34D399" },
];

const communityData = [
  { city: "Downtown", donations: 420, meals: 280 },
  { city: "Midtown", donations: 310, meals: 207 },
  { city: "East Side", donations: 280, meals: 187 },
  { city: "West End", donations: 195, meals: 130 },
  { city: "South", donations: 165, meals: 110 },
];

const activityLog = [
  { level: "INFO", time: "14:32:01", msg: "WebSocket connection from NGO #0024 established", color: "#10B981" },
  { level: "MATCH", time: "14:31:54", msg: "AI Engine: Matched donation #1482 → Shelter #07 (score: 98%)", color: "#60A5FA" },
  { level: "WARN", time: "14:31:40", msg: "Spoilage alert: Item #0918 Greek Yogurt — 3.8h remaining", color: "#F59E0B" },
  { level: "INFO", time: "14:31:22", msg: "Route recalculated: Driver #04 — ETA updated to 18 min", color: "#10B981" },
  { level: "ERROR", time: "14:30:55", msg: "API rate limit warning: Mapping service at 82% capacity", color: "#ef4444" },
  { level: "INFO", time: "14:30:41", msg: "New donor registered: Fresh Fields Market (verified)", color: "#10B981" },
  { level: "MATCH", time: "14:30:18", msg: "AI Engine: 40 lbs bread auto-dispatched (priority queue)", color: "#60A5FA" },
  { level: "INFO", time: "14:29:55", msg: "Delivery confirmed: Donation #1480 → Hope House (60 lbs)", color: "#34D399" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,20,16,0.95)",
      border: "1px solid rgba(16,185,129,0.3)",
      borderRadius: 10,
      padding: "8px 12px",
      boxShadow: "0 0 20px rgba(16,185,129,0.2)",
    }}>
      <p style={{ color: "#10B981", fontSize: 10, fontWeight: 700 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>
          {p.name || p.dataKey}: <strong style={{ color: p.color || "white" }}>{p.value}</strong>
          {p.dataKey === "latency" ? "ms" : ""}
        </p>
      ))}
    </div>
  );
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"system" | "ai" | "community">("system");

  return (
    <section id="admin" className="py-20 px-6 pb-32">
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
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <Settings size={18} style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: "#F59E0B" }}>
                System Admin
              </div>
              <h2 className="text-3xl font-bold" style={{ color: "white" }}>
                Analytics Command Center
              </h2>
            </div>
          </div>
          <p className="text-sm ml-13" style={{ color: "rgba(255,255,255,0.45)", marginLeft: "52px" }}>
            Platform-wide analytics, AI model performance, API health, and community impact reporting.
          </p>
        </motion.div>

        {/* Top KPI Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: "Total Donors", value: "1,248", icon: Users, color: "#10B981", delta: "+12" },
            { label: "Active NGOs", value: "347", icon: Globe, color: "#60A5FA", delta: "+5" },
            { label: "API Uptime", value: "99.97%", icon: Activity, color: "#10B981", delta: "30d avg" },
            { label: "Avg Latency", value: "142ms", icon: Zap, color: "#F59E0B", delta: "-18ms" },
            { label: "DB Queries/s", value: "8,420", icon: Database, color: "#34D399", delta: "peak" },
            { label: "AI Inferences", value: "24K+", icon: Cpu, color: "#a78bfa", delta: "today" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <GlassCard key={kpi.label} className="px-3 py-3" neon="none">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={12} style={{ color: kpi.color }} />
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{kpi.delta}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: kpi.color, textShadow: `0 0 15px ${kpi.color}40` }}>
                  {kpi.value}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {kpi.label}
                </div>
              </GlassCard>
            );
          })}
        </motion.div>

        {/* Main bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* System Matches Line Chart — large */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-5 h-full" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "white" }}>System Matches & API Latency</h3>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Real-time — last 24 hours</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ background: "#10B981" }} />
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>Matches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ background: "#F59E0B" }} />
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>Latency</span>
                  </div>
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <RefreshCw size={9} style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={matchesData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                  <defs>
                    <filter id="lineGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="matches"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    name="Matches"
                    style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.6))" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="latency"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    name="Latency (ms)"
                    strokeDasharray="5 3"
                    style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.5))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* AI Model Performance — radial bars */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-5 h-full" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.5), transparent)" }}
              />
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={14} style={{ color: "#60A5FA" }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "white" }}>AI Model Performance</h3>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Model accuracy metrics</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="15%"
                  outerRadius="90%"
                  data={aiModelData}
                  startAngle={180}
                  endAngle={-180}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    dataKey="value"
                    background={{ fill: "rgba(255,255,255,0.04)" }}
                    cornerRadius={4}
                    label={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{
                          background: "rgba(10,20,16,0.95)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 11,
                          color: "white",
                        }}>
                          {payload[0]?.payload?.name}: <strong style={{ color: payload[0]?.payload?.fill }}>{payload[0]?.value}%</strong>
                        </div>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {aiModelData.map((m) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: m.fill }} />
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{m.name}</span>
                    <span className="text-[10px] font-bold ml-auto" style={{ color: m.fill }}>{m.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Activity Log */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-5 h-full" neon="none">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "white" }}>Activity Log</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: "#10B981" }}>Live</span>
                </div>
              </div>
              <div
                className="space-y-1.5 overflow-y-auto font-mono"
                style={{ maxHeight: 300, fontFamily: "'Courier New', monospace" }}
              >
                {activityLog.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg text-[10px]"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span style={{ color: log.color, minWidth: 42 }}>[{log.level}]</span>
                    <span style={{ color: "rgba(255,255,255,0.25)", minWidth: 50 }}>{log.time}</span>
                    <span style={{ color: "rgba(255,255,255,0.6)", flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10 }}>
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Community Impact Bar Chart */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard className="p-5 h-full" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)" }}
              />
              <h3 className="text-sm font-semibold mb-1" style={{ color: "white" }}>Community Impact by District</h3>
              <p className="text-[10px] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Donations & meals — this week</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={communityData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="city" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="donations" name="Donations (lbs)" radius={[3, 3, 0, 0]} fill="rgba(16,185,129,0.5)" />
                  <Bar dataKey="meals" name="Meals Served" radius={[3, 3, 0, 0]} fill="rgba(52,211,153,0.3)" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* System Health */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-5 h-full" neon="none">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              />
              <h3 className="text-sm font-semibold mb-4" style={{ color: "white" }}>System Health</h3>
              <div className="space-y-3">
                {[
                  { name: "API Gateway", status: "operational", latency: "89ms", color: "#10B981" },
                  { name: "WebSocket Server", status: "operational", latency: "12ms", color: "#10B981" },
                  { name: "ML Inference", status: "operational", latency: "142ms", color: "#10B981" },
                  { name: "PostgreSQL DB", status: "operational", latency: "4ms", color: "#10B981" },
                  { name: "Redis Cache", status: "operational", latency: "1ms", color: "#10B981" },
                  { name: "Mapping API", status: "degraded", latency: "380ms", color: "#F59E0B" },
                  { name: "Push Notify.", status: "operational", latency: "22ms", color: "#10B981" },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: svc.color,
                        boxShadow: `0 0 6px ${svc.color}`,
                      }}
                    />
                    <span className="text-xs flex-1 truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {svc.name}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {svc.latency}
                    </span>
                    <div
                      className="text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-wide font-semibold"
                      style={{
                        background: `${svc.color}15`,
                        border: `1px solid ${svc.color}25`,
                        color: svc.color,
                      }}
                    >
                      {svc.status === "operational" ? "OK" : "⚠"}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Platform Alerts */}
          <motion.div
            className="lg:col-span-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
          >
            <GlassCard className="p-5" neon="orange">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} style={{ color: "#F59E0B" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "white" }}>Platform Alerts & Notifications</h3>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
                  3 Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: AlertTriangle, title: "Mapping API Degraded", desc: "Latency spike detected — fallback routing active. ETA 12 min.", color: "#F59E0B", type: "WARN" },
                  { icon: CheckCircle, title: "AI Model Updated", desc: "Match accuracy improved to 98.1% — new training data deployed.", color: "#10B981", type: "INFO" },
                  { icon: Zap, title: "Peak Load Detected", desc: "600+ concurrent users — auto-scaling triggered, 2 new nodes active.", color: "#60A5FA", type: "INFO" },
                ].map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.title}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: `${alert.color}08`, border: `1px solid ${alert.color}20` }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${alert.color}15`, border: `1px solid ${alert.color}30` }}
                      >
                        <Icon size={14} style={{ color: alert.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{ background: `${alert.color}20`, color: alert.color }}
                          >
                            {alert.type}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {alert.desc}
                        </p>
                      </div>
                      <button>
                        <ArrowUpRight size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
