"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import TelegramIcon from "@/components/icons/TelegramIcon";
import { soundFX } from "@/lib/audio";

export default function ScriptHero() {
  const [copied, setCopied] = useState(false);
  const scriptCode = `loadstring(game:HttpGet("https://raw.githubusercontent.com/Yanderov/lib/refs/heads/main/loader.lua"))()`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    soundFX.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const games = [
    { name: "Murder Mystery 2", tag: "MM2" },
    { name: "Pressure", tag: "Blacksite" },
    { name: "Demonology", tag: "Ghost Hunt" },
  ];

  return (
    <section className="relative pt-16 pb-14 md:pt-24 md:pb-18 bg-transparent z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Brand Avatar + Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-sm mb-6 shadow-md"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-700/80 shrink-0">
            <img
              src="/inertia_avatar.png"
              alt="InertiaHub"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-300">
            InertiaHub Suite
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400">
            3 Supported Games
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4"
        >
          InertiaHub
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 mb-8"
        >
          Universal high-performance Luau script engine for Murder Mystery 2, Pressure, and Demonology with automatic game detection.
        </motion.p>

        {/* Supported Games Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          id="games"
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          {games.map((g, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e0e]/80 border border-zinc-800 backdrop-blur-sm text-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="font-semibold text-white">{g.name}</span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {g.tag}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Loadstring Code Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          id="script"
          className="max-w-2xl mx-auto mb-8 text-left"
        >
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0c]/90 backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full overflow-hidden border border-zinc-700/80 shrink-0">
                  <img
                    src="/inertia_avatar.png"
                    alt="Inertia"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  loader.lua
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Universal Auto-Detection
              </span>
            </div>

            {/* Code Content */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <code className="text-xs sm:text-sm font-mono text-zinc-200 break-all select-all flex-1">
                {scriptCode}
              </code>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCopy}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs transition-all shadow-md hover:bg-zinc-200"
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
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Telegram CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            href="https://t.me/+QXgW7cwKsPc3MjA1"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => soundFX.playClick()}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-medium text-xs hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-lg"
          >
            <TelegramIcon className="w-4 h-4" />
            <span>Join Telegram Community</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
