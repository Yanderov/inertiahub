"use client";

import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";

export default function ScriptChangelogFeed() {
  const updates = [
    {
      version: "v2.4.0 — Ultra Desync & Quantum Gun Grab",
      badge: "Production Release",
      isLatest: true,
      items: [
        "Rebuilt Desync Engine from scratch with 6 modes: Ultra Jitter, Hyper Orbit, Teleport Blink, Sky/Void, and Chaos",
        "Implemented Quantum Blink Gun Grab: 0ms dropped gun pickup with multi-limb touch interest spam and single-tick CFrame restoration",
        "Added Velocity Desync with Break Predict & Sky Launch to evade aimbots and prediction trackers",
        "Fixed Sheriff Silent Aim Shoot remote call signature and vector calculation",
        "Integrated un-obfuscated dedicated MM2 script directly into website raw downloads and CDN routes",
      ],
    },
    {
      version: "v2.3.0 — Silent Aim & ESP Overhaul",
      badge: "Previous Patch",
      isLatest: false,
      items: [
        "Rebuilt Sheriff and Knife silent aim with predictive trajectory compensation",
        "Added full role ESP with color-coded highlights and gun drop tracers",
        "Pixel Surf Engine for smooth slope movement and auto bunny-hop",
      ],
    },
  ];

  return (
    <section id="changelog" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Patch Notes
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Engine Changelog
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Recent updates, optimizations, and performance improvements.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {updates.map((update, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`p-5 rounded-2xl bg-[#111113] border ${
                update.isLatest ? "border-zinc-700 shadow-xl shadow-black/60" : "border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    update.isLatest 
                      ? "bg-[#18181b] border-zinc-700 text-white" 
                      : "bg-[#141417] border-zinc-800 text-zinc-400"
                  }`}>
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {update.version}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                  update.isLatest 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-[#141417] text-zinc-400 border-zinc-800"
                }`}>
                  {update.badge}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                {update.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
