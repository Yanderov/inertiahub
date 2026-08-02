"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ScriptChangelogFeed() {
  const updates = [
    {
      version: "Universal Multi-Game Release",
      date: "Latest",
      items: [
        "Added Pressure (Hadal Blacksite) module with monster alerts, keycard pathfinder, fast swim & oxygen bypass",
        "Added Demonology module with ghost tracker, automated EMF/evidence logging & cursed items ESP",
        "Added Murder Mystery 2 module with role ESP, knife silent aim & pixel surf engine",
        "Optimized execution hooks for Potassium, Volt, and Velocity internal execution engines",
      ],
    },
  ];

  return (
    <section className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Releases
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
              Changelog
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Universal script suite version history.
            </p>
          </div>

          <Link
            href="/changelog"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            All versions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {updates.map((update, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl bg-[#0c0c0c]/85 border border-zinc-800 backdrop-blur-sm shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">
                    {update.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {update.date}
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-400">
                {update.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
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
