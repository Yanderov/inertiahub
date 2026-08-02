"use client";

import { Star, ShieldCheck, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Rivera",
      role: "VP of Engineering at CloudMatrix",
      content:
        "Migrating our content dissemination and service telemetry to InertiaHub reduced our edge latency by 65%. The 2FA TOTP security layer and dynamic CMS gave our team immediate agility without compromising security.",
      avatar: "AR",
      stars: 5,
    },
    {
      name: "Sophia Chen",
      role: "Lead Platform Architect at ApexFlow",
      content:
        "The REST API v1 design is exceptionally clean. We were able to scaffold custom integrations and webhook dispatchers in less than an afternoon. The PostgreSQL schema is rock-solid.",
      avatar: "SC",
      stars: 5,
    },
    {
      name: "Marcus Vance",
      role: "Head of Infrastructure at Hyperion Data",
      content:
        "Having an immutable audit trail paired with granular RBAC made our SOC2 compliance audit a breeze. InertiaHub is the gold standard for high-performance platform infrastructure.",
      avatar: "MV",
      stars: 5,
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative bg-surface-subtle/30 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-widest">
            Trusted Globally
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Chosen by teams building high-demand systems
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-surface-elevated/60 border border-border/80 hover:border-brand-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground-subtle leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                  <p className="text-xs text-foreground-muted">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
