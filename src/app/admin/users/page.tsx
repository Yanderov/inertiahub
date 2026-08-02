"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchUsers();
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
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
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

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            User Accounts & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Manage granular roles (ADMIN, EDITOR, USER), two-factor authenticator statuses, and user access.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs text-foreground focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No users matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">RBAC Role</th>
                  <th className="px-6 py-4">2FA TOTP</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs">
                          {user.name ? user.name[0] : user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block">{user.name || "Anonymous"}</span>
                          <span className="text-[11px] text-foreground-muted">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-surface-base border border-border text-xs font-bold text-foreground focus:outline-none focus:border-brand-500"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.isTwoFactorEnabled
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-surface-base text-foreground-muted border border-border"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {user.isTwoFactorEnabled ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-foreground-muted">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-surface-base transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
