"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Newspaper,
  BookOpen,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      // Aggregate stats in parallel
      const [analyticsRes, usersRes, newsRes, blogRes, auditRes] = await Promise.all([
        fetch("/api/v1/analytics").then((r) => r.json()),
        fetch("/api/v1/users").then((r) => r.json()),
        fetch("/api/v1/news").then((r) => r.json()),
        fetch("/api/v1/blog").then((r) => r.json()),
        fetch("/api/v1/audit-logs?limit=5").then((r) => r.json()),
      ]);

      setOverview({
        analytics: analyticsRes.data || { totalViews: 0, uniqueVisitors: 0 },
        usersCount: usersRes.pagination?.total || 0,
        newsCount: newsRes.pagination?.total || 0,
        blogCount: blogRes.pagination?.total || 0,
        recentAudits: auditRes.data || [],
      });
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Page Ingestions",
      value: overview?.analytics?.totalViews?.toLocaleString() || "0",
      change: "Live edge telemetry",
      icon: Eye,
      color: "text-brand-400",
    },
    {
      label: "Unique Platform Visitors",
      value: overview?.analytics?.uniqueVisitors?.toLocaleString() || "0",
      change: "Privacy-hashed IPs",
      icon: Users,
      color: "text-accent-400",
    },
    {
      label: "Registered User Accounts",
      value: overview?.usersCount || "0",
      change: "RBAC Enforced",
      icon: ShieldCheck,
      color: "text-emerald-400",
    },
    {
      label: "Dispatched CMS Items",
      value: (overview?.newsCount || 0) + (overview?.blogCount || 0),
      change: "News & Engineering Blogs",
      icon: Newspaper,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Console Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Global overview of platform telemetry, content dispatches, and cluster security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Dispatch News
          </Link>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated border border-border text-foreground-subtle hover:text-foreground transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-surface-elevated/60 border border-border/80 space-y-3 hover:border-brand-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  {stat.label}
                </span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs text-foreground-muted">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Launch & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Actions Grid */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
            Administrative Shortcuts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/media"
              className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/50 transition-all space-y-2 group"
            >
              <HardDrive className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-foreground">Media Storage</h3>
              <p className="text-xs text-foreground-muted">Upload & optimize assets via Sharp</p>
            </Link>

            <Link
              href="/admin/api-keys"
              className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/50 transition-all space-y-2 group"
            >
              <KeyRound className="w-5 h-5 text-accent-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-foreground">API Keys</h3>
              <p className="text-xs text-foreground-muted">Provision scoped v1 tokens</p>
            </Link>

            <Link
              href="/admin/users"
              className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/50 transition-all space-y-2 group"
            >
              <Users className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-foreground">User RBAC</h3>
              <p className="text-xs text-foreground-muted">Manage roles & security status</p>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/70 hover:border-brand-500/50 transition-all space-y-2 group"
            >
              <Activity className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-bold text-foreground">Live Telemetry</h3>
              <p className="text-xs text-foreground-muted">Traffic trends & device analytics</p>
            </Link>
          </div>
        </div>

        {/* Right: Recent Immutable Audit Trail */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
              Recent Audit Log Dispatches
            </h2>
            <Link href="/admin/audit-logs" className="text-xs font-semibold text-brand-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden">
            {overview?.recentAudits?.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground-muted">
                No recent administrative actions recorded.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {overview?.recentAudits?.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-surface-elevated/80 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {log.action}
                        </span>
                        <span className="font-semibold text-foreground">{log.entity}</span>
                      </div>
                      <p className="text-[11px] text-foreground-muted">
                        User: {log.user?.name || log.user?.email || "System"} • IP: {log.ipAddress || "Internal"}
                      </p>
                    </div>

                    <span className="text-[11px] text-foreground-muted shrink-0">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
