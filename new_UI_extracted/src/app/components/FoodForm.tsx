import React, { useState } from "react";
import { GlassCard } from "./GlassCard";
import { Mic, Upload, Tag, Weight, Clock, MapPin, ChevronDown, Send, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const categories = ["Bakery", "Dairy", "Produce", "Grains", "Protein", "Prepared Food", "Canned Goods", "Beverages"];

export function FoodForm() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [category, setCategory] = useState("Bakery");
  const [quantity, setQuantity] = useState("");
  const [expiry, setExpiry] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiTag, setAiTag] = useState<string | null>(null);

  const handleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInputText("20 pounds of freshly baked sourdough bread, no allergens, available for pickup");
        setIsListening(false);
        setAiTag("Bakery · 20 lbs · Detected via NLP");
      }, 2200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <GlassCard className="p-6 h-full" neon="green">
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, transparent, #10B981, #34D399, transparent)" }}
      />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold" style={{ color: "white" }}>
            List Surplus Food
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            AI-powered smart entry — voice or text
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981" }}
        >
          <Sparkles size={9} />
          NLP Active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Smart Text / Voice Input */}
        <div className="relative">
          <div
            className="relative rounded-xl transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: isListening
                ? "1px solid rgba(16,185,129,0.6)"
                : "1px solid rgba(255,255,255,0.08)",
              boxShadow: isListening ? "0 0 20px rgba(16,185,129,0.2)" : "none",
            }}
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your surplus food… e.g. '15 lbs of mixed salad greens, good until tomorrow'"
              rows={3}
              className="w-full bg-transparent px-4 pt-3 pb-10 text-sm resize-none outline-none placeholder-white/20"
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />

            {/* Voice Mic Button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {aiTag && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}
                >
                  <Sparkles size={8} />
                  {aiTag}
                </motion.div>
              )}
              <button
                type="button"
                onClick={handleVoice}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: isListening ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.1)",
                  border: `1px solid rgba(16,185,129,${isListening ? "0.6" : "0.3"})`,
                  boxShadow: isListening ? "0 0 20px rgba(16,185,129,0.5)" : undefined,
                }}
              >
                <Mic size={14} style={{ color: "#10B981" }} />
                {isListening && (
                  <span
                    className="absolute inset-0 rounded-xl animate-ping"
                    style={{ background: "rgba(16,185,129,0.2)" }}
                  />
                )}
              </button>
            </div>

            {/* Listening overlay */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-xl flex items-center justify-start px-4 gap-3 pointer-events-none"
                  style={{ background: "rgba(16,185,129,0.05)" }}
                >
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((b) => (
                      <div
                        key={b}
                        className="w-1 rounded-full bg-[#10B981]"
                        style={{
                          height: `${8 + Math.random() * 16}px`,
                          animation: `pulse ${0.3 + b * 0.1}s ease-in-out infinite alternate`,
                          boxShadow: "0 0 6px #10B981",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: "#10B981" }}>
                    Listening… speak now
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 1: Category + Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c} style={{ background: "#0f1f18" }}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.4)" }} />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Quantity (lbs)
            </label>
            <div className="relative">
              <Weight size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Expiry + Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Expiry / Best By
            </label>
            <div className="relative">
              <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="datetime-local"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Pickup Location
            </label>
            <div className="relative">
              <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="text"
                placeholder="123 Main St…"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2">
          {["Halal", "Vegan", "Gluten-Free", "Nut-Free", "Organic"].map((tag) => (
            <button
              key={tag}
              type="button"
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 hover:border-[#10B981]/40 hover:bg-[#10B981]/10"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Tag size={8} className="inline mr-1" />
              {tag}
            </button>
          ))}
        </div>

        {/* Upload */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200"
          style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <Upload size={14} style={{ color: "#10B981" }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Attach photo for AI recognition
            </p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              PNG, JPG up to 10MB · Auto-categorizes
            </p>
          </div>
        </div>

        {/* Submit */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}
            >
              <AlertCircle size={16} style={{ color: "#10B981" }} />
              <span className="text-sm font-semibold" style={{ color: "#10B981" }}>
                Donation Listed — AI Matching Started!
              </span>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              type="submit"
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 0 30px rgba(16,185,129,0.4), 0 8px 24px rgba(0,0,0,0.3)",
                color: "white",
              }}
            >
              <Send size={14} />
              List Donation & Activate AI Match
            </motion.button>
          )}
        </AnimatePresence>
      </form>
    </GlassCard>
  );
}
