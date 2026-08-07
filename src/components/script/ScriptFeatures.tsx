"use client";

import { motion } from "framer-motion";
import { Crosshair, Zap, ShieldCheck, Eye, Move, Cpu } from "lucide-react";

export default function ScriptFeatures() {
  const features = [
    {
      icon: Zap,
      title: "Ultra Desync & Ghost Engine",
      desc: "High-frequency position and angle desync running on physics Heartbeat with priority -1 RenderStepped camera lock. 6 modes including Ultra Jitter and Hyper Orbit.",
    },
    {
      icon: Crosshair,
      title: "Quantum Blink Gun Recovery",
      desc: "Instantaneous fallen gun pickup (0ms). Dispatches multi-limb touch replication directly into the dropped revolver without character teleportation lag.",
    },
    {
      icon: ShieldCheck,
      title: "Sheriff & Knife Silent Aim",
      desc: "Predictive trajectory vector calculation with ping compensation, wall check bypass, and customizable hit parts (HumanoidRootPart / Head).",
    },
    {
      icon: Eye,
      title: "Role ESP & Gun Drop Tracers",
      desc: "Full-color role highlights (Murderer, Sheriff, Hero, Innocents), weapon hold alerts, and real-time tracers connecting straight to dropped revolvers.",
    },
    {
      icon: Move,
      title: "Pixel Surf & Movement",
      desc: "CFrame-assisted smooth slope sliding, automatic bunny-hop acceleration, anti-fling physics shielding, and instant void rescue teleportation.",
    },
    {
      icon: Cpu,
      title: "Native Drawing & Memory Hooks",
      desc: "Built with zero-lag Drawing library shim and direct environment hooks optimized for Potassium, Volt, Velocity, Wave, Delta, and Solara.",
    },
  ];

  return (
    <section className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Core Capabilities
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Engine Architecture
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered purely in Luau with zero execution overhead and maximum priority logic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl bg-[#111113] border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-center mb-3.5 shadow-inner">
                    <Icon className="w-4 h-4 text-zinc-200" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
