"use client";

import { useEffect, useState } from "react";
import { Zap, Users, Globe2, ShieldCheck, TrendingUp } from "lucide-react";

interface StatItem {
  id: string;
  key: string;
  label: string;
  value: string;
  description?: string | null;
  change?: string | null;
}

const defaultStats: StatItem[] = [
  {
    id: "1",
    key: "active_developers",
    label: "Active Platform Developers",
    value: "140,000+",
    description: "Building production workloads daily",
    change: "+28% YoY",
  },
  {
    id: "2",
    key: "api_requests_daily",
    label: "Edge Requests Daily",
    value: "850M+",
    description: "Handled across 42 global edge points",
    change: "+44% MoM",
  },
  {
    id: "3",
    key: "uptime_sla",
    label: "Historical Platform SLA",
    value: "99.99%",
    description: "High availability enterprise guarantee",
    change: "Operational",
  },
  {
    id: "4",
    key: "avg_latency",
    label: "Global Average Latency",
    value: "< 1.2ms",
    description: "Sub-millisecond dynamic routing",
    change: "-15% Faster",
  },
];

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>(defaultStats);

  useEffect(() => {
    fetch("/api/v1/statistics")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && data.data.length > 0) {
          setStats(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 border-y border-border/50 bg-surface-subtle/40 backdrop-blur-md relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={stat.id || idx}
              className="relative p-5 sm:p-6 rounded-2xl bg-surface-elevated/40 border border-border/50 hover:border-brand-500/40 hover:bg-surface-elevated/70 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted group-hover:text-brand-400 transition-colors">
                  {stat.label}
                </span>
                {stat.change && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-1">
                {stat.value}
              </div>

              {stat.description && (
                <p className="text-xs text-foreground-muted line-clamp-1">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
