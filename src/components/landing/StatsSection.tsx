"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, Gamepad2, Shield } from "lucide-react";

interface TelemetryStats {
  uniqueUsers: number;
  totalInjections: number;
  byGame: Record<string, number>;
  activeNow: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<TelemetryStats>({
    uniqueUsers: 0,
    totalInjections: 0,
    byGame: {},
    activeNow: 0,
  });

  useEffect(() => {
    fetch("/api/v1/telemetry/ping")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          uniqueUsers: data.uniqueUsers || 0,
          totalInjections: data.totalInjections || 0,
          byGame: data.byGame || {},
          activeNow: data.activeNow || 0,
        });
      })
      .catch(() => {});
  }, []);

  const gamesSupported = Object.keys(stats.byGame).filter((g) => g !== "Universal" && g !== "Loader").length || 3;

  const items = [
    {
      label: "Unique Hub Users",
      value: stats.uniqueUsers.toLocaleString(),
      icon: Users,
      desc: "Roblox accounts verified",
    },
    {
      label: "Total Injections",
      value: stats.totalInjections.toLocaleString(),
      icon: Zap,
      desc: "Script executions logged",
    },
    {
      label: "Games Supported",
      value: gamesSupported.toString(),
      icon: Gamepad2,
      desc: "MM2 • Pressure • Demonology",
    },
    {
      label: "Active Now",
      value: stats.activeNow.toLocaleString(),
      icon: Shield,
      desc: "Heartbeat in last 45 seconds",
    },
  ];

  return (
    <section className="py-12 border-y border-zinc-800/50 bg-black/40 backdrop-blur-md relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="relative p-5 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors font-mono">
                    {stat.label}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1 font-mono">
                  {stat.value}
                </div>

                <p className="text-xs text-zinc-500 line-clamp-1">
                  {stat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
