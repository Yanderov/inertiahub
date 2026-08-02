"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What makes InertiaHub different from traditional monolithic CMS systems?",
      a: "InertiaHub is built strictly on a high-throughput headless architecture. It decouples your presentation layer from the database through edge-cached REST v1 APIs and Prisma ORM, ensuring sub-2ms response times while providing native TOTP 2FA security and audit logging out of the box.",
    },
    {
      q: "How does the two-factor authentication (2FA) work?",
      a: "InertiaHub implements the RFC 6238 TOTP standard. You can connect standard authenticator apps (Google Authenticator, 1Password, Authy) by scanning the dynamically generated QR code or entering the seed secret. Verification is enforced cryptographically before issuing elevated session tokens.",
    },
    {
      q: "Can I self-host InertiaHub on our own cloud infrastructure?",
      a: "Yes! InertiaHub is fully Docker-ready and can be deployed with standard Node.js environments connected to any PostgreSQL cluster (AWS RDS, Supabase, Neon, or self-hosted PostgreSQL).",
    },
    {
      q: "How does the media pipeline handle image compression?",
      a: "When images are uploaded to the CMS or media library, they are automatically processed through the C++ backed Sharp engine. The pipeline creates optimized WebP representations and resized thumbnail variants, drastically reducing payload sizes.",
    },
    {
      q: "What role-based access control (RBAC) tiers are supported?",
      a: "InertiaHub features three primary tiers: ADMIN (full cluster authority, user management, API keys, settings), EDITOR (CMS authoring, news, blog, and media publishing), and USER (authenticated member access).",
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative bg-surface-subtle/20 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface-elevated/50 border border-border/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-foreground hover:text-brand-300 transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-foreground-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-brand-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-foreground-muted leading-relaxed border-t border-border/40 pt-4 animate-in fade-in-50 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
