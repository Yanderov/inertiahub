"use client";

import {
  Layers,
  ShieldCheck,
  Zap,
  KeyRound,
  BarChart3,
  Cpu,
  Sparkles,
  Lock,
  Workflow,
  Radio,
  FileCode2,
  Database,
} from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Database,
      badge: "Dynamic Engine",
      title: "Headless CMS & Edge Sync",
      description:
        "Manage news, announcements, long-form engineering blogs, and dynamic pages instantly with real-time replication across your cloud infrastructure.",
      color: "from-brand-500/20 to-brand-600/5",
      iconColor: "text-brand-400",
    },
    {
      icon: ShieldCheck,
      badge: "Zero-Trust",
      title: "Hardened Auth & 2FA TOTP",
      description:
        "Enterprise-grade authentication with stateful session tracking, Bcrypt hashing, granular RBAC (Admin, Editor, User), and RFC 6238 TOTP two-factor verification.",
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      icon: Zap,
      badge: "Ultra-Low Latency",
      title: "Sharp Media Pipeline",
      description:
        "Automatic WebP/AVIF compression and high-res thumbnail generation on ingest with CDN caching to ensure sub-second media delivery.",
      color: "from-accent-500/20 to-accent-600/5",
      iconColor: "text-accent-400",
    },
    {
      icon: KeyRound,
      badge: "Developer First",
      title: "Versioned REST API v1",
      description:
        "Comprehensive, rate-limited REST endpoints with SHA-256 hashed API key provisioning for seamless external microservice integration.",
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400",
    },
    {
      icon: BarChart3,
      badge: "Live Telemetry",
      title: "Privacy-Preserving Analytics",
      description:
        "Detailed traffic telemetry, device & browser breakdowns, unique visitor tracking via salted hashes, and instant health diagnostics.",
      color: "from-sky-500/20 to-sky-600/5",
      iconColor: "text-sky-400",
    },
    {
      icon: Workflow,
      badge: "Audit & Governance",
      title: "Immutable Audit Trail",
      description:
        "Every single administrative mutation, role change, media upload, and content edit is recorded in tamper-evident database audit logs.",
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <section id="platform" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Architected for Reliability
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Built from the ground up for modern enterprise agility
          </h2>
          <p className="text-foreground-muted text-base sm:text-lg">
            Say goodbye to fragile monolithic legacy tools. InertiaHub delivers modular, production-ready infrastructure with uncompromising performance.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl bg-surface-elevated/50 border border-border/80 p-8 hover:border-brand-500/50 hover:bg-surface-elevated/80 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${feature.color} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-surface-base border border-border/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-base border border-border text-foreground-muted">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-brand-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40 relative z-10 flex items-center text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                  Learn specifications →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
