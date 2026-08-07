"use client";

import { RefreshCw } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminHeader({
  title,
  description,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  return (
    <header className="px-8 py-5 border-b border-zinc-800 bg-[#0d0d0f]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#141417] border border-zinc-800 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetry Stream Active</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : "text-zinc-400"}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
}
