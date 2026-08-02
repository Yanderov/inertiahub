"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Shield,
  Trash2,
  Lock,
  Gamepad2,
  UserCheck,
  UserX,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"roblox" | "web">("roblox");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [hubUsers, setHubUsers] = useState<any[]>([]);
  const [hubLoading, setHubLoading] = useState(true);
  const [hubSearch, setHubSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchHubUsers = async () => {
    setHubLoading(true);
    try {
      const query = hubSearch ? `?search=${encodeURIComponent(hubSearch)}` : "";
      const res = await fetch(`/api/v1/telemetry/users${query}`);
      const data = await res.json();
      setHubUsers(data.data || []);
    } catch (e) {
      setHubUsers([]);
    } finally {
      setHubLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHubUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }

      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this web user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/v1/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleBan = async (hubUser: any) => {
    const nextBanned = !hubUser.banned;
    if (!confirm(`Are you sure you want to ${nextBanned ? "ban" : "unban"} this Roblox player?`)) return;
    try {
      const res = await fetch(`/api/v1/telemetry/users/${hubUser.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: nextBanned }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update ban state");
      }
      fetchHubUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Users & Injections</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage Roblox players executing the script and website admin accounts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setActiveTab("roblox")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "roblox"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roblox Injections ({hubUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("web")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "web"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-zinc-300" />
            <span>Website Accounts ({users.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Roblox Injected Users */}
      {activeTab === "roblox" && (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Roblox Injected Players & Hardware IDs</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Every Roblox account that has injected the script loader with their HWID, executor, and game history.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={hubSearch}
                  onChange={(e) => setHubSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchHubUsers();
                  }}
                  placeholder="Search username, ID or HWID..."
                  className="w-64 pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <button
                onClick={fetchHubUsers}
                disabled={hubLoading}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${hubLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Roblox Player</th>
                  <th className="px-4 py-3">HWID</th>
                  <th className="px-4 py-3">Executor</th>
                  <th className="px-4 py-3">Last Game</th>
                  <th className="px-4 py-3">Injects</th>
                  <th className="px-4 py-3">Last Seen</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {hubLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                      Loading injections...
                    </td>
                  </tr>
                ) : hubUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No injections recorded yet.
                    </td>
                  </tr>
                ) : (
                  hubUsers.map((hub) => (
                    <tr key={hub.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100">{hub.username || "Unknown"}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">ID: {hub.robloxId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 max-w-[140px] truncate" title={hub.hwid || ""}>
                        {hub.hwid || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700/60">
                          {hub.executor || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 capitalize">{hub.game || "Universal"}</td>
                      <td className="px-4 py-3 font-mono text-zinc-200 font-semibold">{hub.injections}</td>
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{formatDate(hub.lastSeen)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
                            hub.banned
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hub.banned ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                          />
                          {hub.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleBan(hub)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                            hub.banned
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80"
                              : "bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/80"
                          }`}
                        >
                          {hub.banned ? "Unban" : "Ban Player"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Website Accounts */}
      {activeTab === "web" && (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-300" />
                <span>Website Users & Administrator Accounts</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Registered user accounts on the website, their assigned access roles and 2FA status.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-64 pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">2FA Security</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No user accounts found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-100">{user.name || "Anonymous"}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-zinc-500"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="USER">USER</option>
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
                            user.isTwoFactorEnabled
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          {user.isTwoFactorEnabled ? "2FA Active" : "2FA Disabled"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 text-xs font-medium transition-colors border border-zinc-700 flex items-center gap-1.5 ml-auto"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
