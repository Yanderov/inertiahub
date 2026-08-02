"use client";

import { Cloud, GitBranch, Box, Shield, Terminal, Zap, Globe, Cpu, Layers } from "lucide-react";

export default function EcosystemSection() {
  const integrations = [
    { name: "PostgreSQL", desc: "Native relational storage with connection pooling", icon: Box },
    { name: "Docker & K8s", desc: "Containerized deployment configurations", icon: Cloud },
    { name: "GitHub Actions", desc: "Automated CI/CD pipelines & linting", icon: GitBranch },
    { name: "Sharp Engine", desc: "Sub-millisecond dynamic image optimizer", icon: Zap },
    { name: "TOTP RFC 6238", desc: "Hardware authenticator token validation", icon: Shield },
    { name: "Edge CDN", desc: "Global asset caching & DDoS absorption", icon: Globe },
  ];

  return (
    <section id="ecosystem" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Seamless Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Engineered to connect with your existing infrastructure
          </h2>
          <p className="text-foreground-muted">
            Drop InertiaHub directly into your modern stack without restructuring your existing workflows.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/50 hover:bg-surface-elevated/80 transition-all text-center flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-base border border-border/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                <p className="text-xs text-foreground-muted mt-1.5 line-clamp-2">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
