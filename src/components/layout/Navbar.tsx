"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Menu, X } from "lucide-react";
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
    { id: "script", label: "Script", targetId: "script" },
    { id: "games", label: "Games (3)", targetId: "games" },
    { id: "stats", label: "Stats", targetId: "stats" },
    { id: "features", label: "Modules", targetId: "features" },
    { id: "gallery", label: "Gallery", targetId: "gallery" },
    { id: "executors", label: "Executors", targetId: "executors" },
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
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-zinc-800/90 shadow-lg"
          : "bg-black/60 backdrop-blur-sm border-b border-zinc-900/80"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Avatar */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-900 flex items-center justify-center shadow-md group-hover:border-zinc-500 transition-colors"
            >
              <img
                src="/inertia_avatar.png"
                alt="InertiaHub"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                InertiaHub
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                Universal
              </span>
            </div>
          </Link>

          {/* Navigation Links with Smooth Animations and Smooth Scrolling */}
          <nav className="hidden md:flex items-center gap-1 text-sm bg-zinc-950/60 p-1 rounded-xl border border-zinc-900">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <motion.a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => handleNavClick(e, item.targetId)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative px-3.5 py-1.5 rounded-lg font-medium text-xs transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 bg-zinc-800/80 border border-zinc-700/60 rounded-lg -z-10 shadow-sm"
                    />
                  )}
                  {item.label}
                </motion.a>
              );
            })}
          </nav>

          {/* Actions: Copy & Telegram */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Script</span>
                </>
              )}
            </motion.button>

            <motion.a
              href="https://t.me/+QXgW7cwKsPc3MjA1"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-sm"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-black" />
              <span>Telegram</span>
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
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
            className="md:hidden border-b border-zinc-800 bg-black/95 px-4 py-4 space-y-3"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.targetId}`}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.targetId);
                }}
                className="block text-sm font-medium text-zinc-400 hover:text-white py-1"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <button
                onClick={handleCopyScript}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-900 text-xs font-semibold text-white border border-zinc-800"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy Script"}
              </button>
              <a
                href="https://t.me/+QXgW7cwKsPc3MjA1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-xs font-bold text-black"
              >
                <TelegramIcon className="w-4 h-4" />
                Join Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
