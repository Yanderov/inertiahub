"use client";

import { motion } from "framer-motion";
import { Crosshair, Zap, ShieldCheck, Compass, Ghost, Cpu, Radio, Sparkles } from "lucide-react";

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
      desc: "Instantaneous fallen gun pickup. Replicates character CFrame for a single frame, triggers multi-limb touch events, and returns before the server can reject.",
    },
    {
      icon: ShieldCheck,
      title: "Sheriff & Knife Silent Aim",
      desc: "Predictive trajectory vector calculation with ping compensation, wall check bypass, and customizable hit parts (HumanoidRootPart / Head).",
    },
    {
      icon: Compass,
      title: "Pressure Blacksite Suite",
      desc: "Deep-sea monster alerts (Angler, Froger, Pandemonium, Blitz), keycard pathfinder, high-speed swimming physics, and infinite oxygen.",
    },
    {
      icon: Ghost,
      title: "Demonology Ghost Hunter",
      desc: "Real-time ghost distance tracking, favorite room locator, automated evidence identification (EMF 5, Freezing, Spirit Box), and cursed items ESP.",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-[#0e0e12] border border-[#1e1e26] hover:border-[#2f2f3c] transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#16161d] border border-[#272733] flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-zinc-200" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
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
