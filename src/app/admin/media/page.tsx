"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  FileCheck,
  Zap,
} from "lucide-react";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/v1/media");
      const data = await res.json();
      setMedia(data.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload file");

      fetchMedia();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      const res = await fetch(`/api/v1/media/${id}`, { method: "DELETE" });
      if (res.ok) fetchMedia();
    } catch (e) {}
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredMedia = media.filter(
    (m) =>
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.mimeType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Sharp Media & Asset Storage
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            Uploaded images are automatically compressed into optimized WebP and high-res thumbnail representations.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-md transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? "Compressing & Uploading..." : "Upload Asset"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media files..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs text-foreground focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface-elevated/40 border border-border text-center text-xs text-foreground-muted space-y-2">
          <ImageIcon className="w-8 h-8 text-foreground-muted mx-auto" />
          <p>No media assets uploaded yet. Click "Upload Asset" to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-surface-elevated/60 border border-border/80 overflow-hidden group hover:border-brand-500/40 transition-all flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="h-44 bg-surface-base flex items-center justify-center p-2 relative overflow-hidden">
                {item.mimeType.startsWith("image/") ? (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.filename}
                    className="h-full w-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <FileCheck className="w-12 h-12 text-foreground-muted" />
                )}

                {/* Sharp WebP Optimization Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Sharp WebP
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 space-y-3 bg-surface-elevated/80 border-t border-border/60">
                <div>
                  <h4 className="font-semibold text-xs text-foreground truncate" title={item.filename}>
                    {item.filename}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-foreground-muted mt-0.5">
                    <span>{formatSize(item.size)}</span>
                    {item.width && item.height && (
                      <span>• {item.width}x{item.height}px</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-400 hover:text-brand-300"
                  >
                    {copiedId === item.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy URL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
