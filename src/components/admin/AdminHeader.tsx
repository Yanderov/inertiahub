"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

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
    <header className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-white/5">
      <div className="text-[13px] text-zinc-600">Admin console</div>

      <div className="flex items-center gap-2">
        <Link
          href="/account/settings"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
        >
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-medium text-zinc-300">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </span>
          <span className="font-medium hidden sm:inline">
            {user?.name || "Admin"}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
