"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
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
            Create Developer Account
          </h1>
          <p className="text-xs text-foreground-muted">
            Instant deployment access with full REST API capabilities
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-surface-elevated/70 border border-border/80 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-foreground-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
