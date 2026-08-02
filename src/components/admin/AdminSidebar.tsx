"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Newspaper,
  BookOpen,
  GitCommit,
  Layers,
  Megaphone,
  Image as ImageIcon,
  Users,
  KeyRound,
  ShieldAlert,
  Settings,
  Globe,
  Sliders,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Live Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "News & Releases", href: "/admin/news", icon: Newspaper },
    { label: "Engineering Blog", href: "/admin/blog", icon: BookOpen },
    { label: "Platform Changelog", href: "/admin/changelog", icon: GitCommit },
    { label: "Dynamic Pages CMS", href: "/admin/pages", icon: Layers },
    { label: "Banner Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Sharp Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "User RBAC & Access", href: "/admin/users", icon: Users },
    { label: "API Keys & Tokens", href: "/admin/api-keys", icon: KeyRound },
    { label: "Audit & Governance", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "Platform Metrics", href: "/admin/statistics", icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-surface-base border-r border-border/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground block">
                Inertia<span className="text-brand-400">Admin</span>
              </span>
              <span className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider">
                Console v3.0
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted px-3 py-2">
            Platform Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-elevated/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-foreground-muted"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Public Site Return */}
        <div className="p-4 border-t border-border/60 bg-surface-subtle/30">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-surface-elevated border border-border text-xs font-semibold text-foreground-subtle hover:text-foreground transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            View Public Site
          </Link>
        </div>
      </div>
    </aside>
  );
}
