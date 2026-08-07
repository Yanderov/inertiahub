"use client";

import { RefreshCw, Radio } from "lucide-react";

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
    <header className="px-8 py-5 border-b border-white/[0.08] bg-[#0c0c10]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
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
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[#14141c] border border-white/[0.08] text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetry Stream Active</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161620] hover:bg-[#20202c] border border-white/[0.08] hover:border-white/20 text-xs font-mono text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : "text-zinc-400"}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
}
