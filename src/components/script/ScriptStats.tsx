"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Zap, RefreshCw, Activity } from "lucide-react";

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
      desc: "Unique accounts verified",
      icon: Users,
    },
    {
      id: "injections",
      label: "Injections",
      value: statsData.totalInjections.toLocaleString(),
      desc: "Successful script executions",
      icon: Zap,
    },
    {
      id: "updates",
      label: "Engine Patches",
      value: statsData.updatesCount.toString(),
      desc: "Live hotfixes & updates",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="stats" className="py-8 border-y border-[#181820] bg-[#0c0c0f]/60 backdrop-blur-sm relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="p-4 rounded-xl bg-[#0e0e12] border border-[#1e1e24] shadow-md flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-mono text-zinc-400 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold font-mono text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {stat.desc}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-lg bg-[#15151c] border border-[#23232c] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-zinc-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
