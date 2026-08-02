"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function AdminPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/v1/pages");
      const data = await res.json();
      setPages(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      slug: "",
      content: "",
      status: "PUBLISHED",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content,
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
      const url = editingItem ? `/api/v1/pages/${editingItem.id}` : "/api/v1/pages";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save page");

      setShowModal(false);
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dynamic page?")) return;
    try {
      const res = await fetch(`/api/v1/pages/${id}`, { method: "DELETE" });
      if (res.ok) fetchPages();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Dynamic Pages CMS
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Create and edit custom static and marketing pages served directly at root URLs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </button>
      </div>

      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No dynamic pages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Route</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground block">{p.title}</span>
                      <span className="text-[11px] font-mono text-brand-300">/{p.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(p.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-base"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-brand-400 hover:bg-surface-base"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
          <div className="max-w-2xl w-full rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit Dynamic Page" : "Create Dynamic Page"}
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
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: !editingItem
                          ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                          : form.slug,
                      })
                    }
                    placeholder="About Us"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">URL Path Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="about"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Page Content (Markdown)
                </label>
                <textarea
                  required
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter markdown body content..."
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
                  {saving ? "Saving..." : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
