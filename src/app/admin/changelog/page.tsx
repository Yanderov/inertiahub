"use client";

import { useEffect, useState } from "react";
import {
  GitCommit,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminChangelogPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    version: "v3.0.0",
    title: "",
    description: "",
    changesJson: `[
  { "type": "FEATURE", "description": "Launched zero-trust TOTP authentication engine" },
  { "type": "OPTIMIZATION", "description": "Automated Sharp WebP image compression pipeline" }
]`,
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchReleases = async () => {
    try {
      const res = await fetch("/api/v1/changelog");
      const data = await res.json();
      setReleases(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      version: "v3.1.0",
      title: "",
      description: "",
      changesJson: `[
  { "type": "FEATURE", "description": "New feature description" }
]`,
      status: "PUBLISHED",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setForm({
      version: item.version,
      title: item.title,
      description: item.description || "",
      changesJson: JSON.stringify(item.changes || [], null, 2),
      status: item.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let parsedChanges = [];
      try {
        parsedChanges = JSON.parse(form.changesJson);
      } catch (err) {
        throw new Error("Invalid JSON format in changes list");
      }

      const url = editingItem ? `/api/v1/changelog/${editingItem.id}` : "/api/v1/changelog";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: form.version,
          title: form.title,
          description: form.description,
          changes: parsedChanges,
          status: form.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save release");

      setShowModal(false);
      fetchReleases();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this release?")) return;
    try {
      const res = await fetch(`/api/v1/changelog/${id}`, { method: "DELETE" });
      if (res.ok) fetchReleases();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Changelog Releases
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Maintain version history, release notes, and deployment changelog entries.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Version Release
        </button>
      </div>

      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : releases.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No changelog releases logged.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {releases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-brand-300 bg-surface-base px-2 py-1 rounded-md border border-border">
                        {rel.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">{rel.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(rel.releaseDate)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(rel)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-brand-400 hover:bg-surface-base"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rel.id)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-surface-base"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-xl w-full rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit Version Release" : "Publish New Release"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground text-xs">
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">Version Tag</label>
                  <input
                    type="text"
                    required
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    placeholder="v3.1.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">Release Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Performance Engine Upgrade & Edge Caching"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summary of what changed in this version..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Structured Changes Array (JSON)
                </label>
                <textarea
                  rows={6}
                  value={form.changesJson}
                  onChange={(e) => setForm({ ...form, changesJson: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                />
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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
