"use client";

import { motion } from "framer-motion";
import { Eye, Crosshair, Compass, Ghost, Cpu, ShieldCheck } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function ScriptFeatures() {
  const features = [
    {
      icon: Crosshair,
      title: "Murder Mystery 2 Suite",
      desc: "Role ESP (Murderer, Sheriff, Hero), knife silent aim with ping prediction, pixel surf mechanics, coin aura, and local cosmetics.",
    },
    {
      icon: Compass,
      title: "Pressure (Hadal Blacksite)",
      desc: "Deep-sea entity alerts (Angler, Pandemonium, Blitz), monster chams, keycard/door pathfinder, fast swim, and infinite oxygen.",
    },
    {
      icon: Ghost,
      title: "Demonology Ghost Hunting",
      desc: "Paranormal entity tracker, favorite room locator, automated evidence logger (EMF, Spirit Box, UV), and cursed items ESP.",
    },
    {
      icon: Cpu,
      title: "Universal Game Detection",
      desc: "One single loadstring automatically detects the running game environment and injects the corresponding optimized module.",
    },
    {
      icon: ShieldCheck,
      title: "Internal Hook Stability",
      desc: "Zero-latency function hijacking designed specifically for Potassium, Volt, and Velocity internal execution engines.",
    },
    {
      icon: Eye,
      title: "Atmospheric Visual Engine",
      desc: "Custom Bloom, Sun Rays, Atmospheric Haze, and Depth of Field post-processing shaders built natively into all modules.",
    },
  ];

  return (
    <section className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Overview
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Engine Highlights
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered with high performance Luau across 3 distinct titles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => soundFX.playClick()}
                className="p-5 rounded-2xl bg-[#0c0c0c]/85 border border-zinc-800 hover:border-zinc-600 transition-all shadow-lg backdrop-blur-sm cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center mb-3.5 group-hover:border-zinc-500 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
