"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Fingerprint,
  Cpu,
  CheckCircle2,
  Terminal,
  RefreshCw,
} from "lucide-react";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import { playSuccessSound, playErrorSound } from "@/lib/audio";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const redirectAfterLogin = (role?: string) => {
    if (role === "ADMIN" || role === "EDITOR") {
      router.push("/admin");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const payload: any = { email: email.trim().toLowerCase(), password };
      if (requiresTotp) {
        payload.twoFactorCode = totpToken.trim();
      }

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        playErrorSound();
        throw new Error(data.error || "Authentication failed");
      }

      if (data.requireEmailOtp) {
        setRequiresOtp(true);
        setRequiresTotp(false);
        setOtpCode("");
        setInfo(data.message || "Login code sent to your email");
        setLoading(false);
        return;
      }

      if (data.requireTwoFactor) {
        setRequiresTotp(true);
        setLoading(false);
        return;
      }

      playSuccessSound();
      redirectAfterLogin(data.user?.role);
    } catch (err: any) {
      playErrorSound();
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        playErrorSound();
        throw new Error(data.error || "Invalid code");
      }

      playSuccessSound();
      redirectAfterLogin(data.user?.role);
    } catch (err: any) {
      playErrorSound();
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        playErrorSound();
        throw new Error(data.error || "Could not resend code");
      }
      setInfo(data.message || "New login code sent to your email");
    } catch (err: any) {
      playErrorSound();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080a] text-zinc-100 px-4 py-12 relative overflow-hidden selection:bg-zinc-800 selection:text-white">
      {/* Background Grid */}
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
              INERTIA<span className="text-zinc-500 font-mono text-xs ml-1">v3.4.0</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {requiresOtp
                ? "Email Verification"
                : requiresTotp
                  ? "Security Verification"
                  : "Secure Console Login"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              {requiresOtp
                ? "Enter the 6-digit code sent to your inbox"
                : requiresTotp
                  ? "Enter 6-digit TOTP key from authenticator"
                  : "Zero-Trust Encrypted Session & Admin Portal"}
            </p>
          </div>
        </div>

        {/* Security Shield Info Bar */}
        <div className="grid grid-cols-3 gap-2 px-1">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            TLS 1.3 Active
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
            Anti-Brute 10/m
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            Audit Logging
          </div>
        </div>

        {/* Login Card */}
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

          {/* Info Alert */}
          <AnimatePresence>
            {info && !error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2.5 font-mono"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{info}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {requiresOtp ? (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    6-Digit Email Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-mono flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend Code
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-lg tracking-[0.3em] font-mono text-center placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 cursor-pointer mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code & Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {!requiresTotp ? (
                <>
                  {/* Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                        Account Email
                      </label>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                        Master Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
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
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* TOTP 2FA Verification View */
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono mb-1.5">
                    6-Digit Authenticator Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-lg tracking-[0.3em] font-mono text-center placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                    />
                  </div>
                </div>
              )}

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
                    <span>{requiresTotp ? "Verify Key & Enter" : "Authorize Session"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Card Footer Links */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-xs text-zinc-600 font-mono text-center">
            Registration is currently closed.
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-600 font-mono flex items-center justify-center gap-1.5">
            <Terminal className="w-3 h-3 text-zinc-600" />
            Protected by Cloudflare Edge & Sliding Rate Limiter
          </p>
        </div>
      </motion.div>
    </div>
  );
}
