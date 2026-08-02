"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
  Terminal,
  Fingerprint,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import { playSuccessSound, playErrorSound } from "@/lib/audio";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        playErrorSound();
        throw new Error(data.error || "Registration failed");
      }

      playSuccessSound();
      router.push("/auth/login");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "None", percent: 0, color: "bg-zinc-700" };
    if (password.length < 6) return { label: "Weak", percent: 25, color: "bg-red-500" };
    if (password.length < 10) return { label: "Moderate", percent: 55, color: "bg-amber-500" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { label: "Military-Grade", percent: 100, color: "bg-emerald-500" };
    }
    return { label: "Strong", percent: 80, color: "bg-blue-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080a] text-zinc-100 px-4 py-12 relative overflow-hidden selection:bg-zinc-800 selection:text-white">
      {/* Dynamic Grid Background */}
      <DynamicGridBackground />

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/15 rounded-full blur-[160px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-md w-full relative z-10 space-y-6"
      >
        {/* Top Brand Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors shadow-inner"
          >
            <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-200" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-zinc-200">
              INERTIA<span className="text-zinc-500 font-mono text-xs ml-1">REGISTRATION</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create Developer Account
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Direct access to hub statistics, API tokens & developer console
            </p>
          </div>
        </div>

        {/* Security Shield Info Bar */}
        <div className="grid grid-cols-3 gap-2 px-1">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Bcrypt Salting
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
            2FA TOTP Ready
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            Rate-Protected
          </div>
        </div>

        {/* Register Card */}
        <div className="p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Top Border Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-600/50 to-transparent" />

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs flex items-center gap-2.5 font-mono"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                Username / Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Yanderov Developer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@inertiahub.xyz"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>Entropy Level</span>
                    <span className="text-zinc-400">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 cursor-pointer mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Links */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Already registered?</span>
            <Link
              href="/auth/login"
              className="text-zinc-300 hover:text-white font-semibold transition-colors flex items-center gap-1"
            >
              Sign In <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-600 font-mono flex items-center justify-center gap-1.5">
            <Terminal className="w-3 h-3 text-zinc-600" />
            Zero-Knowledge Architecture • Enterprise-Grade Storage
          </p>
        </div>
      </motion.div>
    </div>
  );
}
