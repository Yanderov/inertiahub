"use client";

import { useState } from "react";
import { ShieldAlert, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminQuickBanForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const isRobloxId = /^\d+$/.test(identifier.trim());

      const res = await fetch("/api/v1/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addBan",
          hwid: isRobloxId ? "" : identifier.trim(),
          robloxId: isRobloxId ? identifier.trim() : null,
          reason: reason.trim() || "Blacklisted by admin via dashboard",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add ban");
      }

      setSuccessMessage(`Successfully banned ${identifier.trim()}`);
      setIdentifier("");
      setReason("");
      router.refresh();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBan} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
            HWID or Roblox User ID
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. 182749182 or 5d8a9f..."
            required
            className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
            Ban Reason (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Leaking, unauthorized debug"
            className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {successMessage && (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {successMessage}
            </span>
          )}
          {errorMessage && (
            <span className="text-rose-400 font-medium">{errorMessage}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !identifier.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-rose-900/30"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          <span>Apply Instant Ban</span>
        </button>
      </div>
    </form>
  );
}
