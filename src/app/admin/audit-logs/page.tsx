"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/v1/audit-logs?limit=100");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.name && l.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (l.user?.email && l.user.email.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = actionFilter === "ALL" || l.action === actionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Immutable Audit Trail & Governance
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Tamper-evident logs of administrative actions, user role modifications, and system mutations.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated border border-border text-foreground hover:bg-surface-elevated/80 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
          Refresh Stream
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, user, or entity..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs text-foreground focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-foreground-muted" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="ROLE_CHANGE">ROLE_CHANGE</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No audit log entries recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Actor User</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{log.entity}</td>
                    <td className="px-6 py-4 text-foreground-subtle">
                      {log.user?.name || log.user?.email || "Anonymous / Automated"}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-foreground-muted">
                      {log.ipAddress || "Internal"}
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
