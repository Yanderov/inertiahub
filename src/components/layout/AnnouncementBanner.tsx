"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X, Info, AlertTriangle, CheckCircle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  link?: string | null;
  linkText?: string | null;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/v1/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && data.data.length > 0) {
          const first = data.data[0];
          const isDismissed = sessionStorage.getItem(`dismiss_announcement_${first.id}`);
          if (!isDismissed) {
            setAnnouncement(first);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`dismiss_announcement_${announcement.id}`, "true");
    setDismissed(true);
  };

  const getBadgeStyle = () => {
    switch (announcement.type) {
      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "FEATURE":
      default:
        return "bg-brand-500/10 text-brand-400 border-brand-500/20";
    }
  };

  return (
    <div className="relative isolate flex items-center justify-between gap-x-6 overflow-hidden bg-surface-subtle/80 px-4 py-2.5 sm:px-6 backdrop-blur-md border-b border-border/40 text-xs sm:text-sm z-50">
      <div className="flex items-center gap-x-3 mx-auto flex-wrap justify-center text-center">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
          <Sparkles className="w-3 h-3 animate-pulse" />
          {announcement.type}
        </span>
        <span className="font-medium text-foreground-subtle">
          <strong className="font-semibold text-foreground mr-1.5">{announcement.title}:</strong>
          {announcement.content}
        </span>
        {announcement.link && (
          <Link
            href={announcement.link}
            className="inline-flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300 transition-colors group ml-1"
          >
            {announcement.linkText || "Explore updates"}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="text-foreground-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-surface-elevated/50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
