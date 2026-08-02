"use client";

import Link from "next/link";
import TelegramIcon from "@/components/icons/TelegramIcon";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-transparent py-8 text-xs text-zinc-500 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo with Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0">
              <img
                src="/inertia_avatar.png"
                alt="InertiaHub"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-zinc-200 text-sm">
              InertiaHub
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 font-mono">
              MM2 • Pressure • Demonology
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            <a
              href="#script"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Script
            </a>
            <a
              href="#games"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Games
            </a>
            <a
              href="#features"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Modules
            </a>
            <a
              href="#executors"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Executors
            </a>
            <Link
              href="/changelog"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Changelog
            </Link>
            <a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-zinc-200 transition-colors flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800"
            >
              <TelegramIcon className="w-3.5 h-3.5" />
              Telegram
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-900 text-center text-zinc-600 text-[11px] font-mono">
          © {new Date().getFullYear()} InertiaHub. Multi-Game Engine.
        </div>
      </div>
    </footer>
  );
}
