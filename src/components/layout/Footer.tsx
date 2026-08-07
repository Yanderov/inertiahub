"use client";

import Link from "next/link";
import TelegramIcon from "@/components/icons/TelegramIcon";

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a20] bg-[#08080a] py-8 text-xs text-zinc-500 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#141418] border border-[#27272f] flex items-center justify-center text-[10px] font-mono font-bold text-white">
              IN
            </div>
            <span className="font-semibold text-zinc-200 text-xs">
              Inertia Hub
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 font-mono text-[11px]">
              MM2 • Pressure • Demonology
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs">
            <a href="#script" className="text-zinc-400 hover:text-white transition-colors">
              Loader
            </a>
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
              Modules
            </a>
            <a href="#code" className="text-zinc-400 hover:text-white transition-colors">
              Source Code
            </a>
            <a href="#executors" className="text-zinc-400 hover:text-white transition-colors">
              Executors
            </a>
            <a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium px-2 py-1 rounded bg-[#15151c] border border-[#262632]"
            >
              <TelegramIcon className="w-3 h-3" />
              Telegram
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#141418] text-center text-zinc-600 text-[10px] font-mono">
          © {new Date().getFullYear()} Inertia Hub. High-Performance Luau Script Suite.
        </div>
      </div>
    </footer>
  );
}
