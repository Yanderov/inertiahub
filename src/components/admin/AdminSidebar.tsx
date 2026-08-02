"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gamepad2,
  KeyRound,
  Users,
  Megaphone,
  GitCommit,
  Newspaper,
  BookOpen,
  ShieldAlert,
  BarChart3,
  Globe,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Hub Control", href: "/admin/hub", icon: Gamepad2, badge: "Roblox" },
        { label: "Subscriptions & Keys", href: "/admin/api-keys", icon: KeyRound },
        { label: "Users & Injections", href: "/admin/users", icon: Users },
      ],
    },
    {
      title: "Content & Alerts",
      items: [
        { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { label: "Changelog", href: "/admin/changelog", icon: GitCommit },
        { label: "News", href: "/admin/news", icon: Newspaper },
        { label: "Blog", href: "/admin/blog", icon: BookOpen },
      ],
    },
    {
      title: "System & Logs",
      items: [
        { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#09090b] border-r border-zinc-800/80 flex flex-col justify-between select-none">
      <div className="overflow-y-auto py-2">
        {/* Brand Header */}
        <Link
          href="/admin"
          className="flex items-center justify-between px-5 h-14 border-b border-zinc-800/60 mb-3 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
              IH
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                Inertia Admin
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono">Control Panel</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Live
          </span>
        </Link>

        {/* Navigation Sections */}
        <nav className="px-3 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-1.5 font-mono">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "text-white bg-zinc-800/90 shadow-sm border border-zinc-700/60"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800/60 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">↗</span>
        </Link>
      </div>
    </aside>
  );
}
