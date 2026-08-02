"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [prefix, setPrefix] = useState("INERTIA");
  const [description, setDescription] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/promos");
    const json = await res.json();
    setPromos(json.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, description, maxUses, expiresAt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      setMessage(`Generated ${json.data.code}`);
      setDescription("");
      setMaxUses("");
      setExpiresAt("");
      await load();
    } catch (error: any) {
      setMessage(error.message);
    } finally { setBusy(false); }
  };

  const toggle = async (promo: any) => {
    await fetch("/api/v1/promos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: promo.id, enabled: !promo.enabled }) });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/promos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Promo Codes</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Generate and manage real codes. No fake claims or hidden behavior.</p>
        </div>
        <button onClick={load} className="text-zinc-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Prefix" className="px-3 py-2 bg-black border border-white/10 rounded text-sm text-zinc-200" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 bg-black border border-white/10 rounded text-sm text-zinc-200 md:col-span-2" />
        <input value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))} placeholder="Max uses" className="px-3 py-2 bg-black border border-white/10 rounded text-sm text-zinc-200" />
        <button disabled={busy} onClick={create} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.08] hover:bg-white/[0.13] rounded text-sm text-zinc-100 disabled:opacity-40"><Plus className="w-4 h-4" /> Generate</button>
      </div>
      <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="px-3 py-2 bg-black border border-white/10 rounded text-sm text-zinc-400" />
      {message && <div className="text-sm text-zinc-300 bg-white/[0.04] rounded px-4 py-3">{message}</div>}

      <div className="space-y-1 bg-white/[0.06]">
        {promos.length === 0 ? <div className="bg-black p-6 text-sm text-zinc-600">No promo codes.</div> : promos.map((promo) => (
          <div key={promo.id} className="bg-black px-5 py-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-100 select-all">{promo.code}</span>
                <span className={`text-[10px] uppercase ${promo.enabled ? "text-emerald-400" : "text-zinc-600"}`}>{promo.enabled ? "enabled" : "disabled"}</span>
              </div>
              <div className="text-xs text-zinc-600 mt-1">{promo.description || "No description"} · {promo.usedCount}/{promo.maxUses ?? "∞"}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigator.clipboard.writeText(promo.code)} className="p-2 text-zinc-500 hover:text-white"><Copy className="w-4 h-4" /></button>
              <button onClick={() => toggle(promo)} className="text-xs text-zinc-500 hover:text-white">{promo.enabled ? "Disable" : "Enable"}</button>
              <button onClick={() => remove(promo.id)} className="p-2 text-zinc-600 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
