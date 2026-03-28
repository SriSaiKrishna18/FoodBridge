import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Leaf, Eye, EyeOff, ShieldCheck, Zap, ArrowRight, Mail, Lock, User } from "lucide-react";

export function HeroSection() {
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"donor" | "receiver" | "admin">("donor");

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #050d09 0%, #0a1628 50%, #071210 100%)",
      }}
    >
      {/* Ambient background blobs */}
      <div
        className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Hero copy */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.15)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" style={{ boxShadow: "0 0 8px #10B981" }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#10B981" }}>
                  Platform Live — 24 Cities Active
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "white",
              }}
            >
              Rescue Surplus Food.{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #10B981, #34D399, #6EE7B7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Feed Communities
              </span>
              <br />
              in Real-Time.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-5 text-lg leading-relaxed max-w-xl"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              EcoTech FoodBridge uses AI matching, real-time WebSocket data, and intelligent routing to
              connect surplus food donors with NGOs and shelters—eliminating urban food waste at scale.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "white",
                  boxShadow: "0 0 40px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                Start Donating
                <ArrowRight size={16} />
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Explore Dashboards
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="flex flex-wrap gap-6 mt-10"
            >
              {[
                { value: "2.8M+", label: "lbs rescued" },
                { value: "98%", label: "AI accuracy" },
                { value: "<200ms", label: "match time" },
                { value: "1,200+", label: "donors active" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold" style={{ color: "#10B981", textShadow: "0 0 20px rgba(16,185,129,0.4)" }}>
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Tech badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex flex-wrap gap-2 mt-8"
            >
              {["Real-time WebSocket", "ML Matching Engine", "JWT Auth", "Route Optimization", "NLP Input"].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Auth Card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard className="p-6" neon="green">
              {/* Green glow top */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                style={{ background: "linear-gradient(90deg, transparent, #10B981, #34D399, transparent)" }}
              />

              {/* Auth tab */}
              <div
                className="flex mb-6 rounded-xl p-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAuthTab(tab)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
                    style={{
                      background: authTab === tab ? "rgba(16,185,129,0.2)" : "transparent",
                      border: authTab === tab ? "1px solid rgba(16,185,129,0.35)" : "1px solid transparent",
                      color: authTab === tab ? "#10B981" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {tab === "login" ? "Sign In" : "Join Free"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {authTab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Welcome back
                    </p>
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 rounded-xl text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <div className="relative">
                        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                          ) : (
                            <Eye size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                          )}
                        </button>
                      </div>

                      <button
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, #10B981, #059669)",
                          color: "white",
                          boxShadow: "0 0 30px rgba(16,185,129,0.4)",
                        }}
                      >
                        Sign In to Dashboard
                      </button>

                      <div className="flex items-center justify-between">
                        <button className="text-xs" style={{ color: "#10B981" }}>
                          Forgot password?
                        </button>
                        <button onClick={() => setAuthTab("register")} className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          No account? Register →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Create your account
                    </p>

                    {/* Role select */}
                    <div className="flex gap-2 mb-3">
                      {(["donor", "receiver", "admin"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200"
                          style={{
                            background: role === r ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                            border: role === r ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.06)",
                            color: role === r ? "#10B981" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                        <input
                          type="text"
                          placeholder="Full name / Organization"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                        <input
                          type="email"
                          placeholder="Email address"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <div className="relative">
                        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                        <input
                          type="password"
                          placeholder="Create password"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        />
                      </div>
                      <button
                        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                        style={{
                          background: "linear-gradient(135deg, #10B981, #059669)",
                          color: "white",
                          boxShadow: "0 0 30px rgba(16,185,129,0.4)",
                        }}
                      >
                        Create Account — Free
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* JWT Badge */}
              <div
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.15)",
                }}
              >
                <ShieldCheck size={12} style={{ color: "#10B981" }} />
                <div className="flex-1">
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Secured with{" "}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: "#10B981" }}>
                    JWT Authentication
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {" "}· RS256 · TLS 1.3 · Role-Based Access
                  </span>
                </div>
                <Zap size={10} style={{ color: "#10B981" }} />
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          Scroll to explore
        </span>
        <div
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <motion.div
            className="w-1 h-1.5 rounded-full"
            style={{ background: "#10B981" }}
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
