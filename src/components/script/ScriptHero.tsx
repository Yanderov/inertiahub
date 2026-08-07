"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, Terminal, CheckCircle2 } from "lucide-react";

export default function ScriptHero() {
  const [copied, setCopied] = useState(false);

  const mm2Script = {
    title: "Murder Mystery 2 (Dedicated v2.4)",
    game: "Murder Mystery 2",
    code: `loadstring(game:HttpGet("https://inertiahub.xyz/scripts/murdermistery2.lua"))()`,
    downloadPath: "/scripts/murdermistery2.lua",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mm2Script.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-12 pb-14 md:pt-20 md:pb-20 bg-transparent z-10 overflow-hidden">
      {/* Ambient neutral background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Minimal Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111113] border border-zinc-800 text-xs font-mono text-zinc-300 shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-white">MM2 v2.4 Dedicated</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Quantum Blink 0ms & Heartbeat Desync</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white text-center mb-4 leading-tight"
        >
          Inertia Script Engine
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-zinc-400 text-center mb-8 leading-relaxed font-normal"
        >
          High-performance Luau script engine engineered specifically for Murder Mystery 2.
          Zero execution lag, instantaneous gun recovery, and aggressive desync physics.
        </motion.p>

        {/* Loadstring Code Box */}
        <motion.div 
          id="script"
          layout
          className="rounded-2xl border border-zinc-800 bg-[#0d0d0f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/80 mb-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-[#121214]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
              </div>
              <span className="text-xs font-mono text-zinc-300 pl-1">
                {mm2Script.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                <Terminal className="w-3 h-3 text-zinc-400" />
                UNC Standard
              </span>
            </div>
          </div>

          {/* Code Content */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:flex-1 bg-[#070709] p-3 rounded-xl border border-zinc-800 shadow-inner overflow-hidden">
              <code className="text-xs sm:text-sm font-mono text-zinc-200 break-all select-all block leading-relaxed">
                <span className="text-zinc-300 font-semibold">loadstring</span>
                <span className="text-zinc-500">(</span>
                <span className="text-zinc-200">game</span>
                <span className="text-zinc-500">:</span>
                <span className="text-zinc-200">HttpGet</span>
                <span className="text-zinc-500">(</span>
                <span className="text-emerald-400">"https://inertiahub.xyz/scripts/murdermistery2.lua"</span>
                <span className="text-zinc-500">))()</span>
              </code>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all active:scale-95 shadow-md shadow-white/5"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Copied Script</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>

              <a
                href={mm2Script.downloadPath}
                download="murdermistery2.lua"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#18181b] hover:bg-[#222226] text-zinc-200 border border-zinc-800 font-mono text-xs transition-all active:scale-95 shadow-sm"
                title="Download raw .lua source code"
              >
                <Download className="w-4 h-4 text-zinc-400" />
                <span>.lua</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Script Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0f0f12] border border-zinc-800 shadow-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">MM2 Script Size</div>
            <div className="text-sm font-bold text-white font-mono">8,055 Lines</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0f0f12] border border-zinc-800 shadow-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">Gun Pickup</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">Quantum Blink 0ms</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0f0f12] border border-zinc-800 shadow-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">Desync System</div>
            <div className="text-sm font-bold text-white font-mono">6 Modes + Spin</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0f0f12] border border-zinc-800 shadow-md">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">Drawing Hook</div>
            <div className="text-sm font-bold text-white font-mono">100% Native UNC</div>
          </div>
        </div>
      </div>
    </section>
  );
}
