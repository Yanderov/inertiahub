"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, RefreshCw } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function ScriptStats() {
  const [statsData, setStatsData] = useState({
    uniqueUsers: 148,
    totalInjections: 1842,
    updatesCount: 14,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/v1/telemetry/ping");
        if (res.ok) {
          const data = await res.json();
          setStatsData({
            uniqueUsers: Math.max(148, data.uniqueUsers || 0),
            totalInjections: Math.max(1842, data.totalInjections || 0),
            updatesCount: data.updatesCount || 14,
          });
        }
      } catch {
        // Keep baseline if offline
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      id: "users",
      label: "Users",
      value: statsData.uniqueUsers.toLocaleString(),
      desc: "Unique Roblox accounts verified",
      icon: Users,
    },
    {
      id: "injections",
      label: "Injections",
      value: statsData.totalInjections.toLocaleString(),
      desc: "Total executions logged",
      icon: Zap,
    },
    {
      id: "updates",
      label: "Updates",
      value: statsData.updatesCount.toString(),
      desc: "Active patches & hotfixes",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="stats" className="py-10 border-y border-zinc-800/80 bg-black/40 backdrop-blur-sm relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => soundFX.playClick()}
                className="p-5 rounded-2xl bg-[#0e0e0e]/90 border border-zinc-800 hover:border-zinc-600 transition-colors shadow-lg cursor-pointer group select-none"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {stat.label}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
                    <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight mb-1 group-hover:text-zinc-100 transition-colors">
                  {stat.value}
                </div>

                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
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

