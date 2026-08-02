"use client";

import { useEffect, useState } from "react";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Pin,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "ANNOUNCEMENT",
    summary: "",
    content: "",
    isPinned: false,
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/v1/news");
      const data = await res.json();
      setNews(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      slug: "",
      category: "ANNOUNCEMENT",
      summary: "",
      content: "",
      isPinned: false,
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
      category: item.category,
      summary: item.summary || "",
      content: item.content,
      isPinned: item.isPinned || false,
      status: item.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !editingItem ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : prev.slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingItem ? `/api/v1/news/${editingItem.id}` : "/api/v1/news";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save article");

      setShowModal(false);
      fetchNews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      const res = await fetch(`/api/v1/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNews();
      }
    } catch (e) {}
  };

  const filteredNews = news.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            News & Platform Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Author and publish releases, system notices, and company dispatches.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create News Article
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs text-foreground focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* News Table */}
      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No news articles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.isPinned && <Pin className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                        <span className="font-semibold text-foreground">{item.title}</span>
                      </div>
                      <span className="text-[11px] text-foreground-muted block mt-0.5 font-mono">
                        /news/{item.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-surface-base border border-border text-foreground-subtle">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">{item.views || 0}</td>
                    <td className="px-6 py-4 text-foreground-muted">{formatDate(item.publishedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/news/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-base"
                          title="Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-brand-400 hover:bg-surface-base"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-surface-base"
                          title="Delete"
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

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit News Article" : "Create News Article"}
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

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="InertiaHub 3.0 Engine Release"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="inertiahub-3-engine-release"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="ANNOUNCEMENT / RELEASE / SECURITY"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Brief 1-2 sentence overview for cards and meta descriptions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Full Article Content (Markdown)
                </label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write complete article details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    Publication Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded bg-surface-base border-border text-brand-500 focus:ring-0"
                  />
                  <label htmlFor="isPinned" className="text-xs font-semibold text-foreground cursor-pointer">
                    Pin to top of news list
                  </label>
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
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving Dispatch..." : editingItem ? "Update Dispatch" : "Publish Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
