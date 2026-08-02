"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Radio,
  Gamepad2,
  Users,
  MessageSquare,
  Send,
  Layers,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type HubState = {
  versions: any[];
  features: any[];
  bans: any[];
  logs: any[];
  chat: any[];
  onlineUsers: any[];
  chatChannel: string;
};

const GAMES = [
  { id: "mm2", name: "Murder Mystery 2 (MM2)" },
  { id: "pressure", name: "Pressure" },
  { id: "demonology", name: "Demonology" },
  { id: "universal", name: "Universal / All Games" },
];

export default function AdminHubPage() {
  const [data, setData] = useState<HubState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms
  const [chatChannel, setChatChannel] = useState("mm2");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementDuration, setAnnouncementDuration] = useState("6");
  const [versionForm, setVersionForm] = useState({ version: "", title: "", notes: "" });
  const [featureForm, setFeatureForm] = useState({ game: "mm2", key: "", label: "" });
  const [banForm, setBanForm] = useState({ hwid: "", robloxId: "", reason: "", expiresAt: "" });

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/hub");
      if (!res.ok) throw new Error("Failed to load hub data");
      const json = await res.json();
      setData(json);
      setChatChannel(json.chatChannel || "mm2");
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const run = async (payload: any, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.details || "Action failed");
      setMsg({ type: "success", text: okText });
      await fetchState();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-500" />
        <span className="text-xs text-zinc-400 font-mono">Loading Hub state...</span>
      </div>
    );
  }

  const currentVersion = data?.versions.find((v) => v.isCurrent);
  const maintenance = !(currentVersion?.enabled ?? true);

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">Roblox Hub Control</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                maintenance
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {maintenance ? "Maintenance Mode" : "Online & Serving"}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Control loader delivery, live online players, game feature toggles, bans, and in-game broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchState}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Alert Status Banner */}
      {msg && (
        <div
          className={`px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 border ${
            msg.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              : "bg-rose-950/40 text-rose-300 border-rose-800/60"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 1. Master Controls */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Radio className="w-4 h-4 text-zinc-300" />
          <h2 className="text-sm font-semibold text-white">Master Switches & Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loader Serving Switch */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <span>Script Loader Distribution</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    maintenance ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {maintenance ? "OFF / MAINTENANCE" : "ACTIVE"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                {maintenance
                  ? "Execution is locked. When players run the script loader in Roblox, they will receive a 'Maintenance' notification."
                  : `Script serves normally to all executors (Current Active Version: v${currentVersion?.version || "—"}).`}
              </p>
            </div>
            <button
              disabled={busy || !currentVersion}
              onClick={() =>
                currentVersion &&
                run(
                  { action: "toggleVersion", id: currentVersion.id, enabled: maintenance },
                  maintenance ? "Loader enabled (Serving online)." : "Loader disabled (Maintenance mode on)."
                )
              }
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors disabled:opacity-40"
              title={maintenance ? "Turn On" : "Turn Off"}
            >
              {maintenance ? (
                <ToggleLeft className="w-7 h-7 text-rose-400" />
              ) : (
                <ToggleRight className="w-7 h-7 text-emerald-400" />
              )}
            </button>
          </div>

          {/* In-Game Chat Channel */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-zinc-100">In-Game Hub Chat Channel</div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                The global room name where connected Roblox players can send and receive chat messages in the GUI.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={chatChannel}
                onChange={(e) => setChatChannel(e.target.value)}
                placeholder="mm2"
                className="w-24 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
              />
              <button
                disabled={busy || chatChannel === data?.chatChannel}
                onClick={() =>
                  run({ action: "setSetting", key: "hub.chatChannel", value: chatChannel }, "Chat channel updated.")
                }
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors disabled:opacity-30 border border-zinc-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Online Players Live */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Live Online Players in Roblox</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {(data?.onlineUsers || []).length} connected (45s heartbeat window)
          </span>
        </div>

        {(data?.onlineUsers || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            No active players currently connected to the Hub loader.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(data?.onlineUsers || []).map((online) => (
              <div
                key={online.robloxId}
                className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{online.username || "Roblox Player"}</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    ID: {online.robloxId} • {online.game || "Universal"}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Online
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Loader Versions */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-white">Script Loader Versions</h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Select which release is served to users when they execute the loader
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/40">
          {(data?.versions || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">No versions registered yet.</div>
          ) : (
            (data?.versions || []).map((v) => (
              <div key={v.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{v.version}</span>
                    {v.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active Served Version
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        v.enabled ? "bg-zinc-800 text-zinc-300" : "bg-rose-950 text-rose-400 border border-rose-900"
                      }`}
                    >
                      {v.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {(v.title || v.notes) && (
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {v.title} {v.title && v.notes ? "— " : ""}
                      <span className="text-zinc-500">{v.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={busy || v.isCurrent}
                    onClick={() => run({ action: "setVersion", id: v.id }, `v${v.version} set as active.`)}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors disabled:opacity-30 border border-zinc-700"
                  >
                    Set as Current
                  </button>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run({ action: "toggleVersion", id: v.id, enabled: !v.enabled }, `v${v.version} toggled.`)
                    }
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-30 border ${
                      v.enabled
                        ? "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                        : "bg-rose-900/30 text-rose-300 border-rose-800 hover:bg-rose-900/50"
                    }`}
                  >
                    {v.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Version Form */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Register New Version
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              placeholder="Version (e.g. v3.7.0)"
              value={versionForm.version}
              onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              placeholder="Title (e.g. Combat & Anti-Coin Update)"
              value={versionForm.title}
              onChange={(e) => setVersionForm({ ...versionForm, title: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              placeholder="Release notes & details"
              value={versionForm.notes}
              onChange={(e) => setVersionForm({ ...versionForm, notes: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 sm:col-span-1"
            />
            <button
              disabled={busy || !versionForm.version.trim()}
              onClick={() =>
                run({ action: "createVersion", ...versionForm }, "New version registered.").then(() =>
                  setVersionForm({ version: "", title: "", notes: "" })
                )
              }
              className="px-3 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Version
            </button>
          </div>
        </div>
      </div>

      {/* 4. Remote Game Features */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-white">Remote Per-Game Features</h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Remotely enable or disable cheat features (ESP, Aim, Autofarm) per game
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GAMES.map((game) => {
            const features = (data?.features || []).filter((f) => f.game === game.id);
            return (
              <div key={game.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">{game.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{features.length} features</span>
                </div>

                {features.length === 0 ? (
                  <div className="py-3 text-center text-[11px] text-zinc-500 bg-zinc-950/60 rounded border border-zinc-800/50">
                    No remote features configured for this game.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/60 border border-zinc-800/60 rounded overflow-hidden bg-zinc-950/50">
                    {features.map((f) => (
                      <div key={`${f.game}.${f.key}`} className="px-3 py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-medium text-zinc-200">{f.label || f.key}</span>
                          <span className="text-[10px] font-mono text-zinc-500 ml-2">({f.key})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={busy}
                            onClick={() =>
                              run(
                                {
                                  action: "upsertFeature",
                                  game: f.game,
                                  key: f.key,
                                  label: f.label,
                                  enabled: !f.enabled,
                                },
                                `${f.label || f.key} is now ${!f.enabled ? "Enabled" : "Disabled"}.`
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                              f.enabled
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                            }`}
                          >
                            {f.enabled ? "Enabled" : "Disabled"}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              run({ action: "deleteFeature", game: f.game, key: f.key }, "Feature removed.")
                            }
                            className="p-1 rounded text-zinc-600 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Feature Form */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Add New Remote Feature
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={featureForm.game}
              onChange={(e) => setFeatureForm({ ...featureForm, game: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              {GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Feature Key (e.g. silent_aim, esp)"
              value={featureForm.key}
              onChange={(e) => setFeatureForm({ ...featureForm, key: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              placeholder="Display Label (e.g. Silent Aim)"
              value={featureForm.label}
              onChange={(e) => setFeatureForm({ ...featureForm, label: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              disabled={busy || !featureForm.key.trim()}
              onClick={() =>
                run(
                  {
                    action: "upsertFeature",
                    game: featureForm.game,
                    key: featureForm.key.trim().toLowerCase(),
                    label: featureForm.label.trim() || featureForm.key.trim(),
                    enabled: true,
                  },
                  "Feature registered."
                ).then(() => setFeatureForm({ ...featureForm, key: "", label: "" }))
              }
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Feature
            </button>
          </div>
        </div>
      </div>

      {/* 5. In-Game Announcement Broadcast */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Live In-Game Screen Broadcast</h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Instantly displays a toast notification on all connected Roblox screens
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            placeholder="Type notification message to broadcast to all players in Roblox..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="flex-1 w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
          <select
            value={announcementDuration}
            onChange={(e) => setAnnouncementDuration(e.target.value)}
            className="w-full sm:w-36 px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-zinc-500"
          >
            <option value="4">4 seconds</option>
            <option value="6">6 seconds</option>
            <option value="10">10 seconds</option>
            <option value="15">15 seconds</option>
          </select>
          <button
            disabled={busy || !announcementText.trim()}
            onClick={() =>
              run(
                {
                  action: "broadcast",
                  text: announcementText.trim(),
                  duration: Number(announcementDuration) || 6,
                },
                "Broadcast dispatched to all active Roblox clients."
              ).then(() => setAnnouncementText(""))
            }
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Broadcast Now
          </button>
        </div>
      </div>

      {/* 6. HWID & Roblox ID Bans */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white">HWID & Roblox Account Bans</h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Blacklist hardware IDs or Roblox user IDs from loading the script
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/40">
          {(data?.bans || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">No active HWID or account bans.</div>
          ) : (
            (data?.bans || []).map((b) => (
              <div key={b.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-rose-300">
                      {b.hwid ? `HWID: ${b.hwid}` : `Roblox ID: ${b.robloxId}`}
                    </span>
                    {b.robloxId && b.hwid && (
                      <span className="text-[10px] font-mono text-zinc-500">ID: {b.robloxId}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Reason: <span className="text-zinc-300">{b.reason || "Violating terms / exploiting"}</span>
                    {b.expiresAt && ` • Expires: ${formatDate(b.expiresAt)}`}
                  </div>
                </div>

                <button
                  disabled={busy}
                  onClick={() => run({ action: "deleteBan", id: b.id }, "Ban removed.")}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors disabled:opacity-30 border border-zinc-700 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Unban
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Ban Form */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Ban Player or HWID
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              placeholder="HWID identifier"
              value={banForm.hwid}
              onChange={(e) => setBanForm({ ...banForm, hwid: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              placeholder="Roblox User ID (numeric)"
              value={banForm.robloxId}
              onChange={(e) => setBanForm({ ...banForm, robloxId: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              placeholder="Reason (e.g. Leaking script)"
              value={banForm.reason}
              onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              disabled={busy || (!banForm.hwid.trim() && !banForm.robloxId.trim())}
              onClick={() =>
                run({ action: "createBan", ...banForm }, "Ban created.").then(() =>
                  setBanForm({ hwid: "", robloxId: "", reason: "", expiresAt: "" })
                )
              }
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Apply Ban
            </button>
          </div>
        </div>
      </div>

      {/* 7. Chat Moderation */}
      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-semibold text-white">In-Game Hub Chat Moderation</h2>
          </div>
          <button
            disabled={busy || (data?.chat || []).length === 0}
            onClick={() => run({ action: "clearChat" }, "Chat cleared.")}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 text-xs font-medium transition-colors border border-zinc-700 disabled:opacity-30 flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Clear All Messages
          </button>
        </div>

        {(data?.chat || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            No in-game messages logged in channel &quot;{data?.chatChannel || "mm2"}&quot;.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(data?.chat || []).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{m.username || "Anonymous"}</span>
                    <span className="text-[10px] font-mono text-zinc-500">ID: {m.robloxId}</span>
                    <span className="text-[10px] text-zinc-600">· {formatDate(m.createdAt)}</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 break-words">{m.text}</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => run({ action: "deleteChatMessage", id: m.id }, "Message deleted.")}
                  className="p-1 rounded text-zinc-600 hover:text-rose-400 transition-colors shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
