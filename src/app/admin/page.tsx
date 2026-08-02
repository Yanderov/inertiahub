"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Newspaper,
  BookOpen,
  Users,
  GitCommit,
  RefreshCw,
  Eye,
  UserCheck,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    const [analyticsRes, usersRes, newsRes, blogRes, auditRes, telemetryRes] =
      await Promise.allSettled([
        fetch("/api/v1/analytics").then((r) => r.json()),
        fetch("/api/v1/users").then((r) => r.json()),
        fetch("/api/v1/news").then((r) => r.json()),
        fetch("/api/v1/blog").then((r) => r.json()),
        fetch("/api/v1/audit-logs?limit=5").then((r) => r.json()),
        fetch("/api/v1/telemetry/ping").then((r) => r.json()),
      ]);

    const unwrap = (result: PromiseSettledResult<any>, fallback: any) =>
      result.status === "fulfilled" && result.value?.data !== undefined
        ? result.value
        : fallback;

    const analytics = unwrap(analyticsRes, { data: null });
    const users = unwrap(usersRes, { pagination: null });
    const news = unwrap(newsRes, { pagination: null });
    const blog = unwrap(blogRes, { pagination: null });
    const audits = unwrap(auditRes, { data: [] });
    const telemetry =
      telemetryRes.status === "fulfilled" && telemetryRes.value
        ? telemetryRes.value
        : null;

    setOverview({
      analytics: analytics.data || { totalViews: 0, uniqueVisitors: 0 },
      usersCount: users.pagination?.total || 0,
      newsCount: news.pagination?.total || 0,
      blogCount: blog.pagination?.total || 0,
      recentAudits: audits.data || [],
      hub: telemetry || null,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
        <span className="text-xs text-zinc-400 font-mono">Loading dashboard metrics...</span>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Page Views",
      value: overview?.analytics?.totalViews?.toLocaleString() || "0",
      desc: "All website page hits",
      icon: Eye,
    },
    {
      label: "Unique Visitors",
      value: overview?.analytics?.uniqueVisitors?.toLocaleString() || "0",
      desc: "Unique IP visits",
      icon: Users,
    },
    {
      label: "Registered Accounts",
      value: overview?.usersCount || "0",
      desc: "Admin and web users",
      icon: UserCheck,
    },
    {
      label: "Published Articles",
      value: (overview?.newsCount || 0) + (overview?.blogCount || 0),
      desc: "News, blog & updates",
      icon: Newspaper,
    },
  ];

  const shortcuts = [
    {
      href: "/admin/hub",
      label: "Roblox Hub Control",
      desc: "Loader versions, bans, features & live chat",
      icon: Gamepad2,
      badge: "Core",
    },
    {
      href: "/admin/users",
      label: "Users & Injections",
      desc: "Roblox HWIDs, injects & web accounts",
      icon: Users,
    },
    {
      href: "/admin/news",
      label: "News & Releases",
      desc: "Publish announcements & updates",
      icon: Newspaper,
    },
    {
      href: "/admin/changelog",
      label: "Changelog",
      desc: "Script version patch notes",
      icon: GitCommit,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            System health, Roblox telemetry, website traffic, and fast management shortcuts.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchOverview();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-5 rounded-xl bg-[#0c0c0e] border border-zinc-800/80 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                  {m.label}
                </span>
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                  {m.value}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Roblox Hub Telemetry Overview */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Roblox Script Telemetry</h2>
          </div>
          <Link
            href="/admin/users"
            className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
          >
            View all players →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Unique Script Users
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {overview?.hub?.uniqueUsers ?? "—"}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Distinct Roblox user accounts</div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Total Injections
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {overview?.hub?.totalInjections ?? "—"}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Script executions recorded</div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Currently Online
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {overview?.hub?.activeNow ?? "—"}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Heartbeat received in the last 45 seconds</div>
          </div>
        </div>

        {overview?.hub?.byGame && (
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 text-xs">
            <span className="text-zinc-500 font-mono text-[11px] mr-1">Injections by Game:</span>
            {Object.entries(overview.hub.byGame).map(([game, count]) => (
              <span
                key={game}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-[11px] flex items-center gap-1.5"
              >
                <span className="capitalize">{game}</span>
                <span className="font-mono text-zinc-500 font-bold">({String(count)})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Quick Navigation Cards */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="pb-3 border-b border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white">Management Sections</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="p-4 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                      {s.label}
                    </span>
                    {s.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed truncate">
                    {s.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Audit Activity */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Recent Admin Activity</h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
          >
            View all logs →
          </Link>
        </div>

        {overview?.recentAudits?.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">No recent activity logged.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/40">
            {overview?.recentAudits?.map((log: any) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-zinc-200">
                    <span className="font-semibold text-white">{log.action}</span>
                    <span className="text-zinc-500 mx-2">on</span>
                    <span className="text-zinc-400 font-mono">{log.entity}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    By {log.user?.name || log.user?.email || "System"}
                    {log.ipAddress ? ` • IP: ${log.ipAddress}` : ""}
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
