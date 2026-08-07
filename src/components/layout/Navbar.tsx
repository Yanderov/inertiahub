"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Menu, X, Download, ShieldCheck, Terminal, ArrowUpRight } from "lucide-react";
import TelegramIcon from "@/components/icons/TelegramIcon";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("script");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyScript = () => {
    navigator.clipboard.writeText('loadstring(game:HttpGet("https://inertiahub.xyz/api/v1/script/loader"))()');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "script", label: "Loader", targetId: "script" },
    { id: "features", label: "Modules", targetId: "features" },
    { id: "code", label: "Source", targetId: "code" },
    { id: "gallery", label: "Live Captures", targetId: "gallery" },
    { id: "executors", label: "Executors", targetId: "executors" },
    { id: "changelog", label: "Changelog", targetId: "changelog" },
  ];

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setActiveTab(targetId);
    if (pathname !== "/") {
      window.location.href = `/#${targetId}`;
      return;
    }
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/60"
          : "bg-[#09090b]/60 backdrop-blur-md border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Script Title */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-b from-[#1c1c24] to-[#121216] border border-white/[0.12] text-xs font-mono font-bold text-white shadow-inner group-hover:border-white/30 transition-all duration-200">
              <span className="tracking-tighter">IN</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#09090b]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                Inertia Hub
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v2.4
              </span>
            </div>
          </Link>

          {/* Navigation Links with animated sliding indicator */}
          <nav className="hidden md:flex items-center gap-0.5 bg-[#111116]/80 p-1 rounded-xl border border-white/[0.06] backdrop-blur-md shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => handleNavClick(e, item.targetId)}
                  className={`relative px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#22222c] border border-white/[0.12] rounded-lg shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Actions: Copy & Raw Download & Telegram & Admin */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14141a] hover:bg-[#1c1c24] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-mono transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Loader</span>
                </>
              )}
            </button>

            <a
              href="/scripts/murdermistery2.lua"
              download="murdermistery2.lua"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14141a] hover:bg-[#1c1c24] border border-white/[0.08] hover:border-white/20 text-zinc-300 text-xs font-mono transition-all active:scale-95 shadow-sm"
              title="Download raw MM2 Lua script"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>.lua</span>
            </a>

            <a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all active:scale-95 shadow-md shadow-white/10"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-black" />
              <span>Telegram</span>
            </a>

            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-[#14141a] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-b border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur-xl px-4 py-3 space-y-2 overflow-hidden shadow-2xl"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.targetId}`}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.targetId);
                }}
                className="block text-xs font-medium text-zinc-400 hover:text-white py-1.5 transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
              <button
                onClick={handleCopyScript}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#14141a] text-xs font-mono text-white border border-white/[0.08] active:scale-98"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Loader"}
              </button>
              <a
                href="/scripts/murdermistery2.lua"
                download="murdermistery2.lua"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#14141a] text-xs font-mono text-zinc-300 border border-white/[0.08]"
              >
                <Download className="w-3.5 h-3.5" />
                Download MM2 .lua
              </a>
              <a
                href="https://t.me/+QXgW7cwKsPc3MjA1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-xs font-bold text-black"
              >
                <TelegramIcon className="w-3.5 h-3.5" />
                Join Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
