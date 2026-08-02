"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  CheckCircle,
  Copy,
  Layers,
} from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx create-inertia-app@latest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background Gradients & Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-tr from-brand-600/15 via-brand-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-brand-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-elevated/80 border border-brand-500/30 backdrop-blur-xl shadow-lg shadow-brand-500/5 hover:border-brand-500/50 transition-all cursor-pointer group">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            <span className="text-xs font-semibold text-foreground-subtle group-hover:text-foreground transition-colors">
              InertiaHub 3.0 Engine is Live
            </span>
            <span className="text-foreground-muted">|</span>
            <span className="text-xs font-semibold text-brand-400 flex items-center gap-1">
              Read Release <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            The Ultra-Performance{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-400 to-brand-300">
              Infrastructure
            </span>{" "}
            for Modern Platforms
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl leading-relaxed">
            InertiaHub unifies dynamic edge CMS, real-time platform telemetry, and enterprise zero-trust access into a seamless developer ecosystem.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
            >
              Start Free Deployment
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-foreground-subtle hover:text-foreground bg-surface-elevated/60 hover:bg-surface-elevated border border-border/80 transition-all"
            >
              Explore Architecture
            </Link>
          </div>

          {/* Quick CLI copy snippet */}
          <div className="pt-2">
            <button
              onClick={copyCommand}
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-subtle/80 border border-border/80 text-xs font-mono text-foreground-subtle hover:text-foreground hover:border-brand-500/40 transition-all shadow-inner"
            >
              <Terminal className="w-3.5 h-3.5 text-brand-400" />
              <span>npx create-inertia-app@latest</span>
              {copied ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-2" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-foreground-muted ml-2 hover:text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Mockup / Live Platform Telemetry Visual */}
        <div className="mt-16 sm:mt-24 relative max-w-5xl mx-auto">
          {/* Glowing Aura underneath the frame */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/20 via-brand-500/10 to-transparent rounded-3xl blur-2xl transform -translate-y-4 pointer-events-none" />

          {/* Window Glass Container */}
          <div className="relative rounded-3xl bg-surface-elevated/80 border border-border/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-surface-base/60 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-foreground-muted hidden sm:inline">
                  inertia-core-cluster-us-east-1 :: live-telemetry
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Engine Healthy (0.4ms)
                </span>
              </div>
            </div>

            {/* Window Content Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-5 rounded-2xl bg-surface-base/50 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Throughput Engine
                  </span>
                  <Zap className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  48,290 <span className="text-xs font-normal text-emerald-400">+18.4%</span>
                </div>
                <p className="text-xs text-foreground-muted">Requests processed per second across global edge edge nodes</p>
                <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-4/5 rounded-full" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-5 rounded-2xl bg-surface-base/50 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Edge Cache Hit
                  </span>
                  <Activity className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  99.98% <span className="text-xs font-normal text-brand-400">P99 &lt; 2ms</span>
                </div>
                <p className="text-xs text-foreground-muted">Dynamic content and compressed media served directly from memory cache</p>
                <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-[98%] rounded-full" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-5 rounded-2xl bg-surface-base/50 border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Security Layer
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  Zero Trust <span className="text-xs font-normal text-emerald-400">Active</span>
                </div>
                <p className="text-xs text-foreground-muted">Hardware-backed TOTP 2FA, session encryption & rate limiting active</p>
                <div className="w-full bg-surface-elevated h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
