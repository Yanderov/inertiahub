"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Zap, Cpu, ExternalLink, Terminal } from "lucide-react";

export default function ScriptExecutors() {
  const executors = [
    {
      name: "Potassium",
      type: "Internal Executor",
      status: "Fully Supported",
      arch: "x64 Native",
      icon: ShieldCheck,
      description: "Direct memory hooking with instantaneous Luau bytecode execution.",
      url: "https://infinitycheats.gg/product?id=potassium",
    },
    {
      name: "Volt",
      type: "Internal Executor",
      status: "Fully Supported",
      arch: "Internal Injector",
      icon: Zap,
      description: "Optimized environment hooks with high-speed render thread dispatch.",
      url: "https://infinitycheats.gg/product?id=volt",
    },
    {
      name: "Velocity",
      type: "Internal Executor",
      status: "Fully Supported",
      arch: "Internal DLL",
      icon: Cpu,
      description: "Zero-latency function hijacking with full UNC standard compatibility.",
      url: "https://infinitycheats.gg/",
    },
    {
      name: "Delta",
      type: "Android & Windows Executor",
      status: "Fully Supported",
      arch: "Mobile & PC (UNC+)",
      icon: Terminal,
      description: "Leading multi-platform executor with seamless script execution and maximum UNC standard support.",
      url: "https://deltaexploits.gg",
    },
  ];

  return (
    <section id="executors" className="py-16 bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Architecture
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Supported Internal Executors
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered exclusively for trusted internal execution environments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {executors.map((exec, idx) => {
            const Icon = exec.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl bg-[#0c0c0c]/85 border border-zinc-800 hover:border-zinc-600 transition-all backdrop-blur-sm shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {exec.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-lg tracking-tight mb-0.5 group-hover:text-zinc-100">
                    {exec.name}
                  </h3>
                  <div className="text-xs font-mono text-zinc-500 mb-3">
                    {exec.type} • {exec.arch}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {exec.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Compatibility</span>
                    <span className="font-mono text-white flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" /> 100% Verified
                    </span>
                  </div>

                  {/* Get Executor Button */}
                  <motion.a
                    href={exec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-white text-zinc-200 hover:text-black border border-zinc-700 hover:border-white font-semibold text-xs transition-all shadow-md group/btn"
                  >
                    <span>Get {exec.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-black transition-colors" />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
