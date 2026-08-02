"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ShieldCheck, Activity, Bell } from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="h-16 px-6 bg-surface-base border-b border-border/80 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left status badge */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Cluster Online
        </span>
        <span className="text-xs text-foreground-muted hidden sm:inline">
          PostgreSQL Connected
        </span>
      </div>

      {/* Right User & Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/account/settings"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-elevated/60 border border-border/80 hover:bg-surface-elevated text-xs transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">
            {user?.name ? user.name[0] : "A"}
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">{user?.name || "Admin User"}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/15 text-brand-300 border border-brand-500/20">
            {user?.role || "ADMIN"}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          title="Sign out of console"
          className="p-2 rounded-xl text-foreground-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
