"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Avoid tracking admin or api calls in client telemetry
    if (pathname.startsWith("/api") || pathname.startsWith("/admin")) return;

    const track = async () => {
      try {
        await fetch("/api/v1/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || undefined,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
            browser: navigator.userAgent.split(" ").pop() || "unknown",
          }),
        });
      } catch (e) {
        // Non-blocking
      }
    };

    track();
  }, [pathname]);

  return null;
}
