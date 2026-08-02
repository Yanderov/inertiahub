"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [tempUserId, setTempUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = { email, password };
      if (requiresTotp) {
        payload.totpToken = totpToken;
      }

      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.require2FA) {
        setRequiresTotp(true);
        setTempUserId(data.userId);
        setLoading(false);
        return;
      }

      // Successful login
      if (data.user?.role === "ADMIN" || data.user?.role === "EDITOR") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4 py-12 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Inertia<span className="text-brand-400">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight pt-2">
            {requiresTotp ? "Two-Factor Verification" : "Sign in to your platform"}
          </h1>
          <p className="text-xs text-foreground-muted">
            {requiresTotp
              ? "Enter the 6-digit code from your authenticator app"
              : "Enter your enterprise credentials to access the console"}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-surface-elevated/70 border border-border/80 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {!requiresTotp ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@inertiahub.io"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground-muted uppercase">
                      Password
                    </label>
                    <Link href="/auth/forgot" className="text-xs text-brand-400 hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                  6-Digit Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-center font-mono text-lg tracking-widest focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Authenticating..." : requiresTotp ? "Verify Code" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credential Pill */}
          <div className="mt-6 p-3 rounded-xl bg-surface-base/60 border border-border/50 text-[11px] text-foreground-muted">
            <span className="font-semibold text-foreground">Demo Admin:</span> admin@inertiahub.io / Admin123!
          </div>

          <div className="mt-6 text-center text-xs text-foreground-muted">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
