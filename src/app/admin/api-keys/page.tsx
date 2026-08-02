"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
  Key,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([
    "news:read",
    "blog:read",
    "statistics:read",
  ]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const availablePermissions = [
    { id: "news:read", label: "Read News", desc: "Allow reading published announcements and news" },
    { id: "news:write", label: "Write News", desc: "Allow publishing or updating news articles" },
    { id: "blog:read", label: "Read Blog", desc: "Allow fetching blog posts via API" },
    { id: "blog:write", label: "Write Blog", desc: "Allow authoring blog articles" },
    { id: "media:upload", label: "Upload Media", desc: "Allow uploading images and script attachments" },
    { id: "statistics:read", label: "Read Statistics", desc: "Allow querying hub traffic & user statistics" },
  ];

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/api-keys");
      const data = await res.json();
      setKeys(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create API key");

      setNewlyCreatedKey(data.data.key);
      fetchKeys();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? External services using it will lose access immediately.")) return;
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) fetchKeys();
    } catch (e) {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subscriptions & API Keys</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Generate and manage access tokens for external automated systems and integrations.
          </p>
        </div>

        <button
          onClick={() => {
            setName("");
            setNewlyCreatedKey(null);
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Keys Table Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-zinc-300" />
              <span>Active Keys & Scopes</span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Secret keys provide authenticated programmatic access to website APIs.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">{keys.length} total keys</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Key Name</th>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3">Assigned Permissions</th>
                <th className="px-4 py-3">Last Used</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    Loading keys...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No active API keys found. Click &quot;Generate New Key&quot; to create one.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-100">{key.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{key.id}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                        {key.prefix}...
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {key.permissions?.map((p: string) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700/60"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-400">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never used"}
                    </td>

                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {formatDate(key.createdAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-rose-900/60 text-zinc-400 hover:text-rose-300 text-xs font-medium transition-colors border border-zinc-700 flex items-center gap-1.5 ml-auto"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3 h-3" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                {newlyCreatedKey ? "Key Generated Successfully" : "Create New Access Key"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs leading-relaxed">
                  <strong>Important:</strong> Copy this secret key immediately. For security reasons, you will not be able to view it again.
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold break-all select-all">
                    {newlyCreatedKey}
                  </span>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shrink-0 transition-colors"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 font-mono">
                    Key Description / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Discord Bot / Automation Service"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                    Permissions / Scopes
                  </label>
                  <div className="space-y-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer hover:border-zinc-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-white"
                        />
                        <div>
                          <div className="font-semibold text-white">{perm.label}</div>
                          <div className="text-[10px] text-zinc-500">{perm.desc}</div>
                        </div>
                        <span className="ml-auto font-mono text-[10px] text-zinc-500">{perm.id}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {generating ? "Creating..." : "Create Access Key"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
