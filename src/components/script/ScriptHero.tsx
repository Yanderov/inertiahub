"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Terminal, Shield, Zap, Sparkles } from "lucide-react";
import TelegramIcon from "@/components/icons/TelegramIcon";

export default function ScriptHero() {
  const [copied, setCopied] = useState(false);
  const [selectedScript, setSelectedScript] = useState<"loader" | "mm2" | "pressure" | "demonology">("loader");

  const scriptSnippets: Record<string, { title: string; code: string; downloadPath?: string }> = {
    loader: {
      title: "Universal Auto-Detection Loader",
      code: `loadstring(game:HttpGet("https://inertiahub.xyz/api/v1/script/loader"))()`,
    },
    mm2: {
      title: "Murder Mystery 2 (Dedicated v2)",
      code: `loadstring(game:HttpGet("https://inertiahub.xyz/scripts/murdermistery2.lua"))()`,
      downloadPath: "/scripts/murdermistery2.lua",
    },
    pressure: {
      title: "Pressure (Hadal Blacksite)",
      code: `loadstring(game:HttpGet("https://inertiahub.xyz/api/v1/script/pressure"))()`,
    },
    demonology: {
      title: "Demonology (Ghost Hunting)",
      code: `loadstring(game:HttpGet("https://inertiahub.xyz/api/v1/script/demonology"))()`,
    },
  };

  const currentSnippet = scriptSnippets[selectedScript];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-12 pb-12 md:pt-20 md:pb-16 bg-transparent z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Minimal Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121216] border border-[#222228] text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>MM2 v2.4 Updated</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Ultra Desync & Quantum Gun Grab</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-center mb-3">
          Inertia Script Engine
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 text-center mb-8 leading-relaxed">
          High-performance Luau script suite for Murder Mystery 2, Pressure, and Demonology.
          Zero execution lag, native drawing library hooks, and aggressive desync physics.
        </p>

        {/* Script Selection Tabs */}
        <div id="script" className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
          {[
            { id: "loader", label: "Universal Loader", badge: "Auto-Detect" },
            { id: "mm2", label: "Murder Mystery 2", badge: "8.0k lines" },
            { id: "pressure", label: "Pressure", badge: "Blacksite" },
            { id: "demonology", label: "Demonology", badge: "Ghost Hunt" },
          ].map((tab) => {
            const isSelected = selectedScript === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedScript(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#1f1f26] text-white border border-[#30303a] shadow-sm font-semibold"
                    : "bg-[#111114] text-zinc-400 border border-[#1e1e24] hover:text-zinc-200 hover:border-[#2a2a34]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] text-zinc-500 bg-[#0d0d10] px-1.5 py-0.2 rounded border border-[#1b1b22]">
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loadstring Code Box */}
        <div className="rounded-xl border border-[#24242c] bg-[#0d0d10] overflow-hidden shadow-2xl mb-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1c24] bg-[#111116]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a34]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a34]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a34]"></span>
              </div>
              <span className="text-xs font-mono text-zinc-400 pl-2">
                {currentSnippet.title}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Luau / UNC Standard
            </span>
          </div>

          {/* Code Content */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <code className="text-xs sm:text-sm font-mono text-zinc-200 break-all select-all flex-1 bg-[#08080a] p-3 rounded-lg border border-[#1a1a22]">
              {currentSnippet.code}
            </code>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs transition-all hover:bg-zinc-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>

              {currentSnippet.downloadPath && (
                <a
                  href={currentSnippet.downloadPath}
                  download="murdermistery2.lua"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#181820] hover:bg-[#20202a] text-zinc-200 border border-[#2a2a36] font-mono text-xs transition-all"
                  title="Download raw .lua source"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>.lua</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Script Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#1e1e24]">
            <div className="text-[11px] font-mono text-zinc-500 mb-0.5">MM2 Script Size</div>
            <div className="text-sm font-bold text-white font-mono">8,055 Lines</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#1e1e24]">
            <div className="text-[11px] font-mono text-zinc-500 mb-0.5">Gun Pickup</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">Quantum Blink 0ms</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#1e1e24]">
            <div className="text-[11px] font-mono text-zinc-500 mb-0.5">Desync System</div>
            <div className="text-sm font-bold text-white font-mono">6 Modes + Spin</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#1e1e24]">
            <div className="text-[11px] font-mono text-zinc-500 mb-0.5">Executor UNC</div>
            <div className="text-sm font-bold text-white font-mono">100% Native Drawing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
