"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import TelegramIcon from "@/components/icons/TelegramIcon";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#09090b] py-10 text-xs text-zinc-500 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Game badges */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#141417] border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-inner">
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
            <Link href="/admin" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-zinc-500" />
              Admin
            </Link>
            <a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-zinc-200 transition-all flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-[#141417] hover:bg-[#1f1f23] border border-zinc-800"
            >
              <TelegramIcon className="w-3 h-3 text-white" />
              Telegram
            </a>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between text-zinc-600 text-[11px] font-mono gap-2">
          <span>© {new Date().getFullYear()} Inertia Hub. Zero execution lag & native UNC support.</span>
          <span className="text-emerald-500/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
