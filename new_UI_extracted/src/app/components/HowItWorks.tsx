import React from "react";
import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Camera, Brain, Truck, ChevronRight, Mic, ShieldCheck, Zap } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Donors List Surplus",
    desc: "Restaurants, grocers & farms log surplus food via voice, NLP input, or quick photo snap. AI auto-categorizes type, quantity & shelf life.",
    features: ["Voice / NLP Entry", "Auto-Tagging", "Shelf-Life Prediction"],
    color: "#10B981",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Engine Matches",
    desc: "Our proprietary ML model analyzes proximity, dietary needs, capacity, urgency scores, and historical patterns to find the optimal receiver in <200ms.",
    features: ["98% Match Accuracy", "Real-time Scoring", "Priority Queuing"],
    color: "#60A5FA",
    accent: true,
  },
  {
    step: "03",
    icon: Truck,
    title: "Deliver & Track",
    desc: "Verified NGOs and shelters receive instant push notifications with neon route guidance. Completion is logged on-chain for full audit transparency.",
    features: ["GPS Route Optimization", "Live Tracking", "Audit Trail"],
    color: "#F59E0B",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold mb-4"
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.25)",
              color: "#60A5FA",
            }}
          >
            <Zap size={10} />
            AI-Powered Process
          </div>
          <h2 className="text-4xl font-bold" style={{ color: "white" }}>
            How FoodBridge Works
          </h2>
          <p className="mt-2 text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            From surplus food to community table in under 60 minutes — powered by machine learning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines */}
          <div
            className="absolute top-[72px] left-1/4 right-1/4 h-px hidden md:block"
            style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.3), rgba(96,165,250,0.5), rgba(245,158,11,0.3))" }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <GlassCard
                  className="p-6 h-full group hover:scale-[1.02] transition-all duration-300"
                  neon={step.accent ? "none" : "green"}
                  style={
                    step.accent
                      ? {
                          border: "1px solid rgba(96,165,250,0.3)",
                          boxShadow: "0 0 60px rgba(96,165,250,0.1), 0 20px 60px rgba(0,0,0,0.5)",
                        }
                      : undefined
                  }
                >
                  {/* Top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)`,
                    }}
                  />

                  {/* Step number */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${step.color}15`,
                        border: `1px solid ${step.color}30`,
                        boxShadow: `0 0 30px ${step.color}15`,
                      }}
                    >
                      <Icon size={24} style={{ color: step.color }} />
                    </div>
                    <span
                      className="text-5xl font-black"
                      style={{ color: `${step.color}15`, letterSpacing: "-0.05em" }}
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2" style={{ color: "white" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {step.desc}
                  </p>

                  {/* Feature list */}
                  <div className="space-y-2">
                    {step.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}
                        >
                          <ShieldCheck size={8} style={{ color: step.color }} />
                        </div>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Connector arrow */}
                  {i < 2 && (
                    <div
                      className="absolute -right-3 top-[72px] w-6 h-6 rounded-full hidden md:flex items-center justify-center z-10"
                      style={{
                        background: "rgba(16,185,129,0.2)",
                        border: "1px solid rgba(16,185,129,0.4)",
                        boxShadow: "0 0 10px rgba(16,185,129,0.3)",
                      }}
                    >
                      <ChevronRight size={12} style={{ color: "#10B981" }} />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          {[
            { label: "NLP Text Analysis", color: "#10B981", icon: Mic },
            { label: "Computer Vision", color: "#60A5FA", icon: Camera },
            { label: "JWT Auth", color: "#F59E0B", icon: ShieldCheck },
            { label: "WebSocket Real-time", color: "#10B981", icon: Zap },
          ].map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: `${badge.color}10`,
                  border: `1px solid ${badge.color}25`,
                  color: badge.color,
                }}
              >
                <BadgeIcon size={12} />
                <span className="text-xs font-medium">{badge.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
