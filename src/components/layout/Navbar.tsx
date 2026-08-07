"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Menu, X, Download, Code } from "lucide-react";
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
    { id: "script", label: "Script Loader", targetId: "script" },
    { id: "features", label: "Modules & Desync", targetId: "features" },
    { id: "code", label: "Source Code", targetId: "code" },
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
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#09090b]/95 backdrop-blur-md border-b border-[#222227] shadow-xl"
          : "bg-[#09090b]/80 backdrop-blur-sm border-b border-[#18181d]"
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
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#141418] border border-[#27272f] flex items-center justify-center text-xs font-mono font-bold text-white group-hover:border-zinc-500 transition-colors">
              IN
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                Inertia Hub
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#141418] text-zinc-400 border border-[#27272f]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                v2.4
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#101014] p-1 rounded-lg border border-[#202026]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => handleNavClick(e, item.targetId)}
                  className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#1f1f26] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions: Copy & Raw Download & Telegram */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1a1a22] border border-[#27272f] text-zinc-200 text-xs font-mono transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1a1a22] border border-[#27272f] text-zinc-300 text-xs font-mono transition-all"
              title="Download raw MM2 Lua script"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>.lua</span>
            </a>

            <a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-black" />
              <span>Telegram</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-[#141418] border border-[#27272f] text-zinc-400 hover:text-white"
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
            className="md:hidden border-b border-[#222227] bg-[#0c0c0e] px-4 py-3 space-y-2"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.targetId}`}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.targetId);
                }}
                className="block text-xs font-medium text-zinc-400 hover:text-white py-1.5"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 border-t border-[#202026] flex flex-col gap-2">
              <button
                onClick={handleCopyScript}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#141418] text-xs font-mono text-white border border-[#27272f]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Loader"}
              </button>
              <a
                href="/scripts/murdermistery2.lua"
                download="murdermistery2.lua"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#141418] text-xs font-mono text-zinc-300 border border-[#27272f]"
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
