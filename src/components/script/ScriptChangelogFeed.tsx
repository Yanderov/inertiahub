"use client";

import { motion } from "framer-motion";
import { ArrowRight, GitCommit } from "lucide-react";

export default function ScriptChangelogFeed() {
  const updates = [
    {
      version: "v2.4.0 — Ultra Desync & Quantum Gun Grab",
      date: "Latest Release",
      items: [
        "Rebuilt Desync Engine from scratch with 6 modes: Ultra Jitter, Hyper Orbit, Teleport Blink, Sky/Void, and Chaos",
        "Implemented Quantum Blink Gun Grab: 0ms dropped gun pickup with multi-limb touch interest spam and single-tick CFrame restoration",
        "Added Velocity Desync with Break Predict & Sky Launch to evade aimbots and prediction trackers",
        "Fixed Sheriff Silent Aim Shoot remote call signature and vector calculation",
        "Integrated un-obfuscated dedicated MM2 script directly into website raw downloads and CDN routes",
      ],
    },
    {
      version: "v2.3.0 — Multi-Game Expansion",
      date: "Previous",
      items: [
        "Added dedicated Pressure (Hadal Blacksite) suite with monster alerts & fast swim",
        "Added Demonology ghost investigation module with automated evidence logging",
        "Unified all game modules under a single universal auto-detect loader",
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
              Recent updates and performance improvements.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {updates.map((update, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -1 }}
              className="p-4 rounded-xl bg-[#0e0e12] border border-[#1e1e24] shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs sm:text-sm font-bold font-mono text-white">
                    {update.version}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#14141a] text-zinc-400 border border-[#22222c]">
                  {update.date}
                </span>
              </div>

              <ul className="space-y-1.5 text-xs text-zinc-400 font-sans">
                {update.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
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
