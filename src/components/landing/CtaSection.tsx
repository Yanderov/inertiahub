"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-surface-elevated via-surface-elevated/90 to-surface-base border border-border/80 p-8 sm:p-16 text-center overflow-hidden shadow-2xl">
          {/* Subtle background radiant light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-brand-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Instant Provisioning
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Ready to elevate your platform infrastructure?
            </h2>

            <p className="text-base sm:text-lg text-foreground-muted max-w-xl mx-auto">
              Join thousands of engineering teams building high-throughput modern platforms on InertiaHub today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-500/25 hover:scale-[1.02] transition-all"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-foreground-subtle hover:text-foreground bg-surface-base border border-border transition-all"
              >
                Schedule Architecture Demo
              </Link>
            </div>

            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-foreground-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                No Credit Card Required
              </span>
              <span>•</span>
              <span>Instant Cloud Setup</span>
              <span>•</span>
              <span>Full REST API Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
