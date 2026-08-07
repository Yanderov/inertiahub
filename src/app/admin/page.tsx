import prisma from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import { Users, Zap, ShieldAlert, Activity, CheckCircle2, Shield, AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import AdminQuickBanForm from "./AdminQuickBanForm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const twoMinutesAgo = new Date(Date.now() - 120 * 1000);

  const [
    totalUsers,
    onlineUsers,
    bannedUsers,
    totalLogs,
    recentLogs,
    mm2Count,
    pressureCount,
    demonologyCount,
  ] = await Promise.all([
    prisma.hubUser.count(),
    prisma.hubUser.count({ where: { lastSeen: { gte: twoMinutesAgo } } }),
    prisma.hubUser.count({ where: { banned: true } }),
    prisma.scriptLog.count(),
    prisma.scriptLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.hubUser.count({ where: { game: { contains: "mm2", mode: "insensitive" } } }),
    prisma.hubUser.count({ where: { game: { contains: "pressure", mode: "insensitive" } } }),
    prisma.hubUser.count({ where: { game: { contains: "demonology", mode: "insensitive" } } }),
  ]);

  const kpis = [
    {
      title: "Online Script Users",
      value: onlineUsers.toString(),
      subtitle: "Active in the last 2 minutes",
      icon: Activity,
      highlight: "emerald",
    },
    {
      title: "Total Script Injections",
      value: totalLogs.toLocaleString(),
      subtitle: "Lifetime successful loader hooks",
      icon: Zap,
      highlight: "blue",
    },
    {
      title: "Tracked Roblox Users",
      value: totalUsers.toLocaleString(),
      subtitle: "Unique accounts logged",
      icon: Users,
      highlight: "purple",
    },
    {
      title: "Blacklisted HWIDs / Accounts",
      value: bannedUsers.toString(),
      subtitle: "Restricted from loader access",
      icon: ShieldAlert,
      highlight: "rose",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Telemetry Dashboard"
        description="Real-time execution analytics, script telemetry, and user management."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0e0e13] border border-white/[0.08] shadow-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-400">
                    {kpi.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#15151e] border border-white/[0.08] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-zinc-200" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-sans">
                    {kpi.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Section: Game Distribution & Quick Ban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Distribution */}
          <div className="p-6 rounded-2xl bg-[#0e0e13] border border-white/[0.08] shadow-lg lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Distribution
              </div>
              <h2 className="text-base font-bold text-white mb-4">
                Active Game Injections
              </h2>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#14141c] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Murder Mystery 2</div>
                    <div className="text-[10px] font-mono text-zinc-400">Primary Module</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {mm2Count} users
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#14141c] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Pressure</div>
                    <div className="text-[10px] font-mono text-zinc-400">Hadal Blacksite</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    {pressureCount} users
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#14141c] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Demonology</div>
                    <div className="text-[10px] font-mono text-zinc-400">Paranormal Hunt</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-purple-400">
                    {demonologyCount} users
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/users"
              className="mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#161622] hover:bg-[#20202e] text-xs font-mono text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
            >
              <span>Manage All Script Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Ban Action */}
          <div className="p-6 rounded-2xl bg-[#0e0e13] border border-white/[0.08] shadow-lg lg:col-span-2">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Security Action
            </div>
            <h2 className="text-base font-bold text-white mb-2">
              Quick HWID / Roblox Account Ban
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Instantly blacklist an HWID or Roblox User ID from loading any Inertia script.
            </p>

            <AdminQuickBanForm />
          </div>
        </div>

        {/* Bottom Section: Recent Injections Stream */}
        <div className="p-6 rounded-2xl bg-[#0e0e13] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Telemetry Stream
              </div>
              <h2 className="text-base font-bold text-white">
                Recent Script Executions
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              View Full User Registry →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-500 font-mono text-[11px]">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Roblox ID</th>
                  <th className="pb-3 font-medium">Game</th>
                  <th className="pb-3 font-medium">Executor</th>
                  <th className="pb-3 font-medium">HWID</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                      No script executions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                      <td className="py-3 text-white font-sans font-medium">
                        {log.username || "Anonymous"}
                      </td>
                      <td className="py-3 text-zinc-400">
                        {log.robloxId}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                          {log.game || "universal"}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">
                        {log.executor || "Unknown"}
                      </td>
                      <td className="py-3 text-zinc-500 truncate max-w-[120px]" title={log.hwid || ""}>
                        {log.hwid ? `${log.hwid.slice(0, 12)}...` : "—"}
                      </td>
                      <td className="py-3 text-zinc-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
