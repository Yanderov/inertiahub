"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if not in development or on public/admin pages
    if (typeof window !== "undefined") {
      fetch("/api/v1/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || undefined,
        }),
      }).catch(() => {
        // Silently ignore tracking errors
      });
    }
  }, [pathname]);

  return null;
}
