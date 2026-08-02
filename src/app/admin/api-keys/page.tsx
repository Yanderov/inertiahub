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
  Eye,
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
    { id: "news:read", label: "Read News & Dispatches" },
    { id: "news:write", label: "Create & Update News" },
    { id: "blog:read", label: "Read Engineering Blog" },
    { id: "blog:write", label: "Create & Update Blog" },
    { id: "media:upload", label: "Upload & Optimize Media" },
    { id: "statistics:read", label: "Query Telemetry Stats" },
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
    if (!confirm("Are you sure you want to revoke this API key? Services using it will lose access immediately.")) return;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            API Keys & External Access
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Provision SHA-256 hashed secret keys for microservice automation and external REST API v1 integrations.
          </p>
        </div>

        <button
          onClick={() => {
            setName("");
            setNewlyCreatedKey(null);
            setError("");
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Generate New API Key
        </button>
      </div>

      {/* Keys Table */}
      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No active API keys found. Generate a key to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Key Identifier</th>
                  <th className="px-6 py-4">Prefix</th>
                  <th className="px-6 py-4">Assigned Scopes</th>
                  <th className="px-6 py-4">Last Used</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground block">{key.name}</span>
                      <span className="text-[11px] text-foreground-muted font-mono">{key.id}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-brand-300 font-bold bg-surface-base px-2 py-1 rounded-md border border-border">
                        {key.prefix}...
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {key.permissions?.map((p: string) => (
                          <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-base border border-border text-foreground-subtle">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-foreground-muted">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never used"}
                    </td>

                    <td className="px-6 py-4 text-foreground-muted">
                      {formatDate(key.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-surface-base transition-colors"
                        title="Revoke Key"
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

      {/* Generator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-lg w-full rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-400" />
                {newlyCreatedKey ? "Key Generated Successfully" : "Provision API Key"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-foreground-muted hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed">
                  <strong>Important:</strong> Copy this secret key immediately. For security reasons, it will never be displayed again.
                </div>

                <div className="p-4 rounded-2xl bg-surface-base border border-border flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-brand-300 font-bold break-all select-all">
                    {newlyCreatedKey}
                  </span>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="p-2 rounded-xl bg-surface-elevated border border-border text-foreground hover:text-brand-400 shrink-0"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-surface-base border border-border text-foreground hover:bg-surface-elevated"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    Key Purpose Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Microservice Telemetry Ingestion"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-2">
                    Scope Permissions
                  </label>
                  <div className="space-y-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-base/60 border border-border/50 text-xs text-foreground cursor-pointer hover:bg-surface-base"
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="rounded bg-surface-elevated border-border text-brand-500"
                        />
                        <span>{perm.label}</span>
                        <span className="ml-auto font-mono text-[10px] text-foreground-muted">{perm.id}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-base border border-border text-foreground-subtle hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-90 disabled:opacity-50"
                  >
                    {generating ? "Generating..." : "Generate Secret Key"}
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
