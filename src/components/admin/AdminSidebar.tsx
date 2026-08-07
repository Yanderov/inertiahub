"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Radio,
  CheckCircle2,
} from "lucide-react";

export default function AdminSidebar({ user }: { user?: { email: string; name?: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Script Users & Bans",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch {
      window.location.href = "/auth/login";
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-[#0c0c10] border-r border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 z-40">
      <div>
        {/* Logo & Brand Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#181822] border border-white/[0.12] flex items-center justify-center text-xs font-mono font-bold text-white shadow-inner">
              IN
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight leading-none">
                Inertia Admin
              </div>
              <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Control
              </div>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Control Center
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  item.active
                    ? "bg-[#181824] text-white border border-white/[0.12] shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? "text-white" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </Link>

        <div className="p-3 rounded-xl bg-[#111116] border border-white/[0.06] flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              {user?.name || user?.email || "Admin User"}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              {user?.role || "ADMIN"}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
