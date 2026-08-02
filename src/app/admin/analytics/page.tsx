"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, Users, Globe2, Monitor, RefreshCw, Layers } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/v1/analytics");
      const resData = await res.json();
      setData(resData.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Analytics
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Site traffic and visitor analytics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated border border-border text-foreground hover:bg-surface-elevated/80 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-surface-elevated/60 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Page Views</span>
            <Eye className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{data?.totalViews?.toLocaleString() || "0"}</div>
          <p className="text-xs text-foreground-muted">All time</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated/60 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Unique Visitors</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{data?.uniqueVisitors?.toLocaleString() || "0"}</div>
          <p className="text-xs text-foreground-muted">All time</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated/60 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Top Page</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground truncate">{data?.topPages?.[0]?.path || "/"}</div>
          <p className="text-xs text-foreground-muted">{data?.topPages?.[0]?._count?.id || 0} views</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-elevated/60 border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">Sessions</span>
            <Globe2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {data?.devices?.reduce((sum: number, d: any) => sum + (d._count?.id || 0), 0)?.toLocaleString() || "0"}
          </div>
          <p className="text-xs text-foreground-muted">Across all devices</p>
        </div>
      </div>

      {/* Tables Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" /> Top Pages
          </h3>

          <div className="divide-y divide-border/40 text-xs">
            {data?.topPages?.length === 0 ? (
              <p className="text-foreground-muted py-4">No data yet.</p>
            ) : (
              data?.topPages?.map((p: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <span className="font-mono text-foreground-subtle">{p.path}</span>
                  <span className="font-bold text-foreground bg-surface-base px-2.5 py-1 rounded-md border border-border">
                    {p._count?.id} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Monitor className="w-4 h-4 text-brand-400" /> Devices
          </h3>

          <div className="divide-y divide-border/40 text-xs">
            {data?.devices?.length === 0 ? (
              <p className="text-foreground-muted py-4">No data yet.</p>
            ) : (
              data?.devices?.map((d: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <span className="capitalize font-semibold text-foreground-subtle">{d.device || "Desktop"}</span>
                  <span className="font-bold text-foreground bg-surface-base px-2.5 py-1 rounded-md border border-border">
                    {d._count?.id} sessions
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
