"use client";

import { useState } from "react";
import {
  Search,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Loader2,
  RefreshCw,
  UserX,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HubUserRecord {
  id: string;
  robloxId: string;
  username: string | null;
  hwid: string | null;
  executor: string | null;
  game: string | null;
  placeId: string | null;
  injections: number;
  lastSeen: string | Date;
  banned: boolean;
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: HubUserRecord[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<HubUserRecord[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "banned">("all");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleBan = async (user: HubUserRecord) => {
    const nextBanned = !user.banned;
    setActionLoadingId(user.id);

    try {
      const res = await fetch(`/api/v1/telemetry/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: nextBanned,
          reason: nextBanned ? "Banned via Admin Users Panel" : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update ban status");
      }

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, banned: nextBanned } : u))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update ban state");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isUserOnline = (lastSeen: string | Date) => {
    const time = new Date(lastSeen).getTime();
    return Date.now() - time < 120 * 1000;
  };

  // Filter users based on search term and tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      u.robloxId.includes(searchTerm) ||
      (u.hwid?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.game?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "online") {
      return isUserOnline(u.lastSeen);
    }
    if (filter === "banned") {
      return u.banned;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e0e13] p-3 rounded-2xl border border-white/[0.08]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username, Roblox ID, HWID, game..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#08080a] border border-white/[0.06] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-[#14141c] p-1 rounded-xl border border-white/[0.06] shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filter === "all"
                ? "bg-[#20202c] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilter("online")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              filter === "online"
                ? "bg-[#20202c] text-emerald-400 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Online ({users.filter((u) => isUserOnline(u.lastSeen)).length})
          </button>
          <button
            onClick={() => setFilter("banned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              filter === "banned"
                ? "bg-[#20202c] text-rose-400 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Banned ({users.filter((u) => u.banned).length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e13] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 font-mono text-[11px] bg-[#111116]/80">
                <th className="py-3.5 px-4 font-medium">Roblox Account</th>
                <th className="py-3.5 px-4 font-medium">Roblox ID</th>
                <th className="py-3.5 px-4 font-medium">HWID</th>
                <th className="py-3.5 px-4 font-medium">Game & Place</th>
                <th className="py-3.5 px-4 font-medium">Injections</th>
                <th className="py-3.5 px-4 font-medium">Last Seen</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const online = isUserOnline(user.lastSeen);
                  const isProcessing = actionLoadingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        user.banned ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Account / Username */}
                      <td className="py-3.5 px-4 font-sans font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-[#181824] border border-white/[0.1] flex items-center justify-center font-bold text-[11px] text-zinc-300">
                              {(user.username || "R")[0].toUpperCase()}
                            </div>
                            {online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0e0e13]" />
                            )}
                          </div>
                          <div>
                            <div>{user.username || "Unknown"}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {user.executor || "Unknown Executor"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roblox ID */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopy(user.robloxId, `roblox-${user.id}`)}
                          className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white bg-white/[0.03] px-2 py-1 rounded border border-white/[0.06] transition-colors"
                          title="Click to copy Roblox ID"
                        >
                          <span>{user.robloxId}</span>
                          {copiedField === `roblox-${user.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-500" />
                          )}
                        </button>
                      </td>

                      {/* HWID */}
                      <td className="py-3.5 px-4">
                        {user.hwid ? (
                          <button
                            onClick={() => handleCopy(user.hwid!, `hwid-${user.id}`)}
                            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white bg-white/[0.03] px-2 py-1 rounded border border-white/[0.06] transition-colors truncate max-w-[130px]"
                            title={user.hwid}
                          >
                            <span className="truncate">{user.hwid.slice(0, 10)}...</span>
                            {copiedField === `hwid-${user.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-500" />
                            )}
                          </button>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Game & Place */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                            {user.game || "universal"}
                          </span>
                          {user.placeId && (
                            <div className="text-[10px] text-zinc-600 mt-0.5">
                              Place: {user.placeId}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Injections */}
                      <td className="py-3.5 px-4 text-zinc-300 font-bold">
                        {user.injections.toLocaleString()}
                      </td>

                      {/* Last Seen */}
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {new Date(user.lastSeen).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.banned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                            <ShieldAlert className="w-3 h-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleBan(user)}
                          disabled={isProcessing}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                            user.banned
                              ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : user.banned ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          <span>{user.banned ? "Unban" : "Ban"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
