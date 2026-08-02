"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const tiers = [
    {
      name: "Developer Starter",
      price: "$0",
      period: "forever",
      description: "Ideal for individual engineers and rapid prototypes.",
      features: [
        "Up to 100,000 monthly API calls",
        "Community Discord support",
        "Dynamic headless CMS (5GB storage)",
        "Standard TOTP 2FA security",
        "10 Team members",
      ],
      cta: "Get Started Free",
      href: "/auth/register",
      popular: false,
    },
    {
      name: "Platform Pro",
      price: "$49",
      period: "/month",
      description: "For fast-growing applications requiring enterprise uptime.",
      features: [
        "5,000,000 monthly API calls",
        "Global Edge CDN acceleration",
        "Unlimited CMS pages & blog posts",
        "Sharp automatic media optimizer",
        "Full audit logging & analytics",
        "Priority 24/7 technical support",
      ],
      cta: "Deploy Pro Cluster",
      href: "/auth/register?plan=pro",
      popular: true,
    },
    {
      name: "Enterprise Dedicated",
      price: "Custom",
      period: "annual",
      description: "Dedicated infrastructure, custom SLAs, and custom compliance.",
      features: [
        "Unlimited API requests",
        "Dedicated PostgreSQL read replicas",
        "Custom RBAC & SSO / SAML integration",
        "99.99% Guaranteed SLA uptime",
        "Dedicated infrastructure engineer",
        "Custom on-premise deployment option",
      ],
      cta: "Contact Enterprise",
      href: "/contact",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
            Predictable Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Transparent plans for scale
          </h2>
          <p className="text-foreground-muted text-base sm:text-lg">
            Start free, scale seamlessly to millions of requests without surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? "bg-surface-elevated border-2 border-brand-500/80 shadow-2xl shadow-brand-500/10 scale-105 z-10"
                  : "bg-surface-elevated/40 border border-border/80 hover:border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="text-xs text-foreground-muted mt-1 min-h-[32px]">
                  {tier.description}
                </p>

                <div className="mt-6 mb-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-foreground-muted font-medium">
                    {tier.period}
                  </span>
                </div>

                <div className="border-t border-border/50 pt-6 space-y-3">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        <Check className="w-3 h-3 text-brand-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground-subtle">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={tier.href}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:opacity-90 shadow-lg shadow-brand-500/20"
                      : "bg-surface-base hover:bg-surface-elevated text-foreground border border-border"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
