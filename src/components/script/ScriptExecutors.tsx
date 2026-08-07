"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck, Zap, Cpu, Terminal, ExternalLink } from "lucide-react";

export default function ScriptExecutors() {
  const executors = [
    {
      name: "Potassium",
      type: "Internal Executor",
      status: "Verified",
      arch: "x64 Native",
      icon: ShieldCheck,
      description: "Direct internal memory hooking with instantaneous bytecode dispatch.",
      url: "https://infinitycheats.gg/product?id=potassium",
    },
    {
      name: "Volt",
      type: "Internal Executor",
      status: "Verified",
      arch: "Fast Dispatch",
      icon: Zap,
      description: "Optimized environment hooks with high-speed render thread dispatch.",
      url: "https://infinitycheats.gg/product?id=volt",
    },
    {
      name: "Velocity",
      type: "Internal Executor",
      status: "Verified",
      arch: "Internal DLL",
      icon: Cpu,
      description: "Zero-latency function hijacking with full UNC standard compatibility.",
      url: "https://infinitycheats.gg/",
    },
    {
      name: "Delta",
      type: "Windows & Android",
      status: "Verified",
      arch: "Mobile & PC",
      icon: Terminal,
      description: "Multi-platform executor with native Drawing support and high reliability.",
      url: "https://deltaexploits.gg",
    },
  ];

  return (
    <section id="executors" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Compatibility Matrix
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Supported Executors
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Validated for stable, crash-free execution on all major Windows and Mobile runtimes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {executors.map((exec, idx) => {
            const Icon = exec.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-[#0e0e12] border border-[#1e1e24] hover:border-[#2f2f3c] transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#16161d] border border-[#272733] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-zinc-200" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#14141a] border border-[#22222c] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {exec.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm tracking-tight mb-0.5">
                    {exec.name}
                  </h3>
                  <div className="text-[11px] font-mono text-zinc-500 mb-2">
                    {exec.arch}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {exec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#181820]">
                  <a
                    href={exec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#15151c] hover:bg-[#1f1f28] text-zinc-300 hover:text-white border border-[#242430] font-mono text-xs transition-all"
                  >
                    <span>Get {exec.name}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
