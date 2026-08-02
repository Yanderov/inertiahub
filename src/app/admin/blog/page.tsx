"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "ARCHITECTURE,PERFORMANCE",
    coverImage: "",
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/v1/blog");
      const data = await res.json();
      setPosts(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: "ARCHITECTURE,PERFORMANCE",
      coverImage: "",
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
      excerpt: item.excerpt || "",
      content: item.content,
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      coverImage: item.coverImage || "",
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
      const url = editingItem ? `/api/v1/blog/${editingItem.id}` : "/api/v1/blog";
      const method = editingItem ? "PUT" : "POST";

      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog post");

      setShowModal(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/v1/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {}
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Engineering Blog Management
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Publish in-depth technical blogs and platform architecture deep dives.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Write Technical Post
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blog articles..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs text-foreground focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Blog Table */}
      <div className="rounded-3xl bg-surface-elevated/50 border border-border/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted">
            No blog posts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-base/80 border-b border-border/60 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title & Slug</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Read Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPosts.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="text-[11px] text-foreground-muted block mt-0.5 font-mono">
                        /blog/{item.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.tags?.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-base border border-border text-foreground-subtle">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.readingTime}m
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${item.slug}`}
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

      {/* Blog Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit Technical Post" : "Write Technical Post"}
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
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Architecting Zero-Trust Edge Networks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="architecting-zero-trust-edge"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="SECURITY, PERFORMANCE, EDGE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Excerpt / Abstract
                </label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary of the engineering post..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Article Markdown Body
                </label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write full markdown technical post..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1">
                  Status
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
                  {saving ? "Saving Post..." : editingItem ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
