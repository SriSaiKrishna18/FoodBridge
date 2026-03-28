import React from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { FoodForm } from "./FoodForm";
import { SpoilageTracker } from "./SpoilageTracker";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from "recharts";
import { Leaf, TrendingUp, Award, Package, CheckCircle, Clock, ChevronRight } from "lucide-react";

const weeklyData = [
  { day: "Mon", lbs: 42, meals: 28 },
  { day: "Tue", lbs: 78, meals: 52 },
  { day: "Wed", lbs: 35, meals: 23 },
  { day: "Thu", lbs: 95, meals: 63 },
  { day: "Fri", lbs: 120, meals: 80 },
  { day: "Sat", lbs: 88, meals: 58 },
  { day: "Sun", lbs: 55, meals: 37 },
];

const co2Data = [
  { month: "Oct", co2: 0.8 },
  { month: "Nov", co2: 1.2 },
  { month: "Dec", co2: 0.9 },
  { month: "Jan", co2: 1.5 },
  { month: "Feb", co2: 1.8 },
  { month: "Mar", co2: 2.4 },
];

const myDonations = [
  { id: "#1482", item: "Sourdough Bread", qty: "25 lbs", status: "delivered", time: "2h ago", receiver: "City Shelter" },
  { id: "#1481", item: "Mixed Salad", qty: "12 lbs", status: "in-transit", time: "4h ago", receiver: "Hope House" },
  { id: "#1480", item: "Pasta (cooked)", qty: "40 lbs", status: "matched", time: "5h ago", receiver: "St. Mary's" },
  { id: "#1479", item: "Greek Yogurt", qty: "8 lbs", status: "pending", time: "6h ago", receiver: "—" },
  { id: "#1478", item: "Orange Juice", qty: "15 lbs", status: "delivered", time: "1d ago", receiver: "West Shelter" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  delivered: { color: "#10B981", label: "Delivered" },
  "in-transit": { color: "#60A5FA", label: "In Transit" },
  matched: { color: "#F59E0B", label: "Matched" },
  pending: { color: "rgba(255,255,255,0.4)", label: "Pending" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(10,20,16,0.95)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "8px 12px",
        boxShadow: "0 0 20px rgba(16,185,129,0.2)",
      }}
    >
      <p style={{ color: "#10B981", fontSize: 11, fontWeight: 700 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
          {p.dataKey}: {p.value} {p.dataKey === "lbs" ? "lbs" : "meals"}
        </p>
      ))}
    </div>
  );
};

export function DonorDashboard() {
  return (
    <section id="donor" className="py-20 px-6">
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
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <Leaf size={18} style={{ color: "#10B981" }} />
            </div>
            <div>
              <div
                className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
                style={{ color: "#10B981" }}
              >
                Donor Portal
              </div>
              <h2 className="text-3xl font-bold" style={{ color: "white" }}>
                Donor Dashboard
              </h2>
            </div>
          </div>
          <p className="text-sm ml-13" style={{ color: "rgba(255,255,255,0.45)", marginLeft: "52px" }}>
            Manage surplus food listings, track impact metrics, and monitor spoilage in real time.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* FoodForm — Large left block */}
          <motion.div
            className="lg:col-span-5 lg:row-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FoodForm />
          </motion.div>

          {/* Spoilage Tracker — top right */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <SpoilageTracker />
          </motion.div>

          {/* Quick Stats — top right corner */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <GlassCard className="p-5 h-full" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)" }}
              />
              <h3 className="text-sm font-semibold mb-4" style={{ color: "white" }}>My Impact</h3>
              <div className="space-y-3">
                {[
                  { icon: Package, label: "Total Donated", value: "1,240 lbs", color: "#10B981" },
                  { icon: CheckCircle, label: "Deliveries", value: "82 complete", color: "#10B981" },
                  { icon: Award, label: "Impact Score", value: "9,850 pts", color: "#F59E0B" },
                  { icon: TrendingUp, label: "This Week", value: "+513 lbs", color: "#34D399" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}
                      >
                        <Icon size={13} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* My Donations List — bottom middle */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <GlassCard className="p-5 h-full" neon="none">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: "white" }}>My Donations</h3>
                <button className="text-[10px] flex items-center gap-1" style={{ color: "#10B981" }}>
                  View all <ChevronRight size={10} />
                </button>
              </div>
              <div className="space-y-2">
                {myDonations.map((d) => {
                  const st = statusConfig[d.status];
                  return (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: st.color, boxShadow: `0 0 6px ${st.color}80` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {d.item}
                          </span>
                          <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{d.qty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{d.id}</span>
                          {d.receiver !== "—" && (
                            <>
                              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{d.receiver}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="text-[10px] px-2 py-0.5 rounded-lg"
                          style={{ background: `${st.color}15`, border: `1px solid ${st.color}25`, color: st.color }}
                        >
                          {st.label}
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{d.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Weekly Bar Chart — bottom right */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <GlassCard className="p-5 h-full" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)" }}
              />
              <h3 className="text-sm font-semibold mb-1" style={{ color: "white" }}>Weekly Donations</h3>
              <p className="text-[10px] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>lbs donated per day</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="lbs" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === 4 ? "#10B981" : "rgba(16,185,129,0.35)"}
                        style={{ filter: index === 4 ? "drop-shadow(0 0 6px rgba(16,185,129,0.6))" : undefined }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* CO2 Area chart */}
          <motion.div
            className="lg:col-span-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <GlassCard className="p-5" neon="green">
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "white" }}>Environmental Impact</h3>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>CO₂ emissions prevented (metric tons)</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                  style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}
                >
                  <TrendingUp size={10} />
                  +33% vs last quarter
                </div>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={co2Data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} fill="url(#co2Grad)"
                    style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.4))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
