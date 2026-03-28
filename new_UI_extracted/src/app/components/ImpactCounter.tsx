import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Leaf, Users, Truck, Zap, TrendingUp } from "lucide-react";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

const stats = [
  {
    icon: Leaf,
    value: 2847391,
    suffix: " lbs",
    label: "Food Rescued",
    sublabel: "since launch",
    color: "#10B981",
    trend: "+12.4% this month",
    span: "col-span-1",
  },
  {
    icon: Users,
    value: 483250,
    suffix: "",
    label: "Meals Delivered",
    sublabel: "to communities",
    color: "#10B981",
    trend: "+8.7% this week",
    span: "col-span-1",
  },
  {
    icon: Truck,
    value: 14820,
    suffix: "",
    label: "Active Donations",
    sublabel: "redistributed",
    color: "#F59E0B",
    trend: "+24 today",
    span: "col-span-1",
  },
  {
    icon: Zap,
    value: 98,
    suffix: "%",
    label: "AI Match Rate",
    sublabel: "accuracy score",
    color: "#10B981",
    trend: "↑ 2pts vs last week",
    span: "col-span-1",
  },
  {
    icon: TrendingUp,
    value: 312,
    suffix: " tons",
    label: "CO₂ Prevented",
    sublabel: "environmental impact",
    color: "#34D399",
    trend: "equiv. 1.4M miles not driven",
    span: "col-span-1 md:col-span-2",
  },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { count, ref } = useCountUp(stat.value, 2200);
  const Icon = stat.icon;

  const formattedCount =
    stat.value >= 1000000
      ? (count / 1000000).toFixed(2) + "M"
      : stat.value >= 1000
      ? (count / 1000).toFixed(1) + "K"
      : count.toString();

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={stat.span}
    >
      <GlassCard className="p-5 h-full group hover:scale-[1.02] transition-transform duration-300">
        {/* Top accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${stat.color}50, transparent)` }}
        />

        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${stat.color}15`,
              border: `1px solid ${stat.color}30`,
              boxShadow: `0 0 20px ${stat.color}15`,
            }}
          >
            <Icon size={18} style={{ color: stat.color }} />
          </div>
          <div
            className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.15)",
              color: "#10B981",
            }}
          >
            <TrendingUp size={8} />
            {stat.trend}
          </div>
        </div>

        <div className="mt-2">
          <div
            className="text-3xl font-bold tracking-tight"
            style={{ color: stat.color, textShadow: `0 0 30px ${stat.color}40`, fontFamily: "'Plus Jakarta Sans', monospace" }}
          >
            {formattedCount}
            {stat.suffix}
          </div>
          <div className="mt-1">
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
              {stat.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {stat.sublabel}
            </p>
          </div>
        </div>

        {/* Glow effect */}
        <div
          className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ background: stat.color }}
        />
      </GlassCard>
    </motion.div>
  );
}

export function ImpactCounter() {
  return (
    <section id="impact" className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold mb-4"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#10B981",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Live Platform Metrics
          </div>
          <h2 className="text-4xl font-bold" style={{ color: "white" }}>
            Real Impact, Real Time
          </h2>
          <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Every number below represents communities fed and food saved from landfills.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.slice(0, 4).map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard stat={stats[4]} index={4} />

          {/* Live Activity Feed */}
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <GlassCard className="p-5 h-full">
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ color: "white" }}>
                  Live Activity Feed
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#10B981", boxShadow: "0 0 6px #10B981" }}
                  />
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: "#10B981" }}>
                    Streaming
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { time: "Now", event: "AI matched 40lbs bread → City Shelter", city: "Downtown", type: "match" },
                  { time: "2m", event: "Green Garden donated 25lbs salad greens", city: "Midtown", type: "donation" },
                  { time: "5m", event: "Hope House claimed 60lbs rice & beans", city: "East Side", type: "claim" },
                  { time: "9m", event: "URGENT: 8lbs dairy expiring — auto-alert sent", city: "West End", type: "urgent" },
                  { time: "12m", event: "Route optimized: 3 stops → 1 delivery driver", city: "South", type: "system" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span
                      className="text-[10px] font-mono shrink-0 w-6"
                      style={{
                        color: item.type === "urgent" ? "#F59E0B" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {item.time}
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background:
                          item.type === "match" ? "#10B981" :
                          item.type === "urgent" ? "#F59E0B" :
                          item.type === "donation" ? "#34D399" :
                          item.type === "claim" ? "#60A5FA" :
                          "rgba(255,255,255,0.3)",
                        boxShadow: item.type === "urgent" ? "0 0 6px #F59E0B" : undefined,
                      }}
                    />
                    <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {item.event}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
                    >
                      {item.city}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
