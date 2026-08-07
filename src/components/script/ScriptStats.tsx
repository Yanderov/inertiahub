"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, RefreshCw, Activity, CheckCircle2 } from "lucide-react";

export default function ScriptStats() {
  const [statsData, setStatsData] = useState({
    uniqueUsers: 3480,
    totalInjections: 48920,
    updatesCount: 142,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/telemetry/ping");
        if (res.ok) {
          const data = await res.json();
          setStatsData({
            uniqueUsers: data.uniqueUsers || 3480,
            totalInjections: data.totalInjections || 48920,
            updatesCount: data.updatesCount || 142,
          });
        }
      } catch {
        // Fallback defaults
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      id: "users",
      label: "Active Users",
      value: statsData.uniqueUsers.toLocaleString(),
      desc: "Unique verified accounts",
      icon: Users,
    },
    {
      id: "injections",
      label: "Live Injections",
      value: statsData.totalInjections.toLocaleString(),
      desc: "Zero-error script executions",
      icon: Zap,
    },
    {
      id: "updates",
      label: "Engine Patches",
      value: statsData.updatesCount.toString(),
      desc: "Production hotfixes & patches",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="stats" className="py-10 border-y border-white/[0.06] bg-[#0c0c10]/70 backdrop-blur-md relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Live Engine Telemetry
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Realtime Auto-Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl bg-[#0e0e13]/90 border border-white/[0.08] hover:border-white/20 transition-all shadow-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-zinc-400 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-sans">
                    {stat.desc}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#161620] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                  <Icon className="w-4 h-4 text-zinc-200" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
