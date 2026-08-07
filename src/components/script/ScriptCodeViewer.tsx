"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, FileText, ExternalLink } from "lucide-react";

export default function ScriptCodeViewer() {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<"mm2" | "loader" | "pressure" | "demonology">("mm2");

  const files = {
    mm2: {
      name: "murdermistery2.lua",
      title: "Murder Mystery 2 Dedicated Hub (v2.4)",
      lines: "8,055 lines",
      size: "429 KB",
      rawUrl: "/scripts/murdermistery2.lua",
      codePreview: `--[[
    Inertia Hub — Murder Mystery 2 v2.4
    Ultra Desync, Quantum Blink Gun Grab, Silent Aim & Pixel Surf Engine
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local HttpService = game:GetService("HttpService")

local LP = Players.LocalPlayer
local Camera = workspace.CurrentCamera
local Mouse = LP:GetMouse()

-- [DESYNC ENGINE] High-frequency network displacement
do
    local lastCF, lastVel, lastAng, appliedTo = nil, nil, nil, nil
    local tickCount = 0

    E.desyncModes = { "Ultra Jitter", "Hyper Orbit", "Teleport Blink", "Sky/Void Blink", "Random Chaos", "Sine Phase" }
    E.desyncAngles = { "Hyper Spin", "Random Chaos", "Inverted", "None" }
    E.velDesyncModes = { "Break Predict", "Sky Launch", "Random Chaos", "Tornado" }

    -- Displacement executed on Heartbeat, restored on priority -1 RenderStepped
    tc(RunService.Heartbeat:Connect(function()
        restoreNow()
        if not (F.Desync or F.VelDesync) then return end
        -- ... Ultra Jitter / Hyper Orbit / Velocity inversion logic ...
    end))
end

-- [GUN RECOVERY] Zero-latency Quantum Blink
do
    -- Instantly grabs fallen sheriff revolver in 1 network tick
    -- Touches with all body parts and restores CFrame with 0ms latency
end`,
    },
    loader: {
      name: "loader.lua",
      title: "Universal Auto-Detect Loader",
      lines: "450 lines",
      size: "19 KB",
      rawUrl: "/api/v1/script/loader",
      codePreview: `--[[
    Inertia Hub — Universal Loader
    Detects game PlaceId & automatically launches corresponding module
]]

local placeId = game.PlaceId
local supportedGames = {
    [142823291] = "mm2",          -- Murder Mystery 2
    [12411473842] = "pressure",    -- Pressure (Hadal Blacksite)
    [15376909628] = "demonology",  -- Demonology
}

local gameSlug = supportedGames[placeId] or "universal"
print("[Inertia] Detected Game: " .. gameSlug)

loadstring(game:HttpGet("https://inertiahub.xyz/api/v1/script/" .. gameSlug))()`,
    },
    pressure: {
      name: "pressure.lua",
      title: "Pressure (Hadal Blacksite Module)",
      lines: "3,820 lines",
      size: "194 KB",
      rawUrl: "/api/v1/script/pressure",
      codePreview: `--[[
    Inertia Hub — Pressure (Hadal Blacksite)
    Entity ESP, Keycard Finder, Fast Swim & Oxygen Bypass
]]

local monsters = { "Angler", "Froger", "Pandemonium", "Blitz", "Eyefest", "WallDweller" }
-- Real-time spawn alerts and room waypoint rendering...`,
    },
    demonology: {
      name: "demonology.lua",
      title: "Demonology Ghost Hunting Module",
      lines: "3,650 lines",
      size: "192 KB",
      rawUrl: "/api/v1/script/demonology",
      codePreview: `--[[
    Inertia Hub — Demonology Paranormal Investigation
    Ghost Tracker, EMF 5 Logger, Spirit Box Helper & Cursed Items ESP
]]

local evidenceDatabase = {
    ["EMF5"] = false,
    ["Freezing"] = false,
    ["Fingerprints"] = false,
    ["SpiritBox"] = false,
}
-- Automated evidence identification engine...`,
    },
  };

  const active = files[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(`loadstring(game:HttpGet("https://inertiahub.xyz${active.rawUrl}"))()`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Script Source & Raw Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              Luau Source Code
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Direct access to complete, un-obfuscated script files.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-mono transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied URL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Loadstring</span>
                </>
              )}
            </button>

            <a
              href={active.rawUrl}
              download={active.name}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download .lua</span>
            </a>
          </div>
        </div>

        {/* Code Viewer Window */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/70">
          {/* File Tab Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#101016]/80 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1">
              {(["mm2", "loader", "pressure", "demonology"] as const).map((key) => {
                const f = files[key];
                const isSelected = selectedFile === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFile(key)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all select-none cursor-pointer ${
                      isSelected
                        ? "text-white font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeCodeTab"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-[#1c1c26] border border-white/[0.1] rounded-lg shadow-sm"
                      />
                    )}
                    <FileText className="w-3.5 h-3.5 relative z-10 text-zinc-400" />
                    <span className="relative z-10">{f.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-400 pr-2">
              <span>{active.lines}</span>
              <span>•</span>
              <span>{active.size}</span>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 sm:p-5 bg-[#070709] overflow-x-auto">
            <pre className="font-mono text-xs text-zinc-300 leading-relaxed">
              <code>{active.codePreview}</code>
            </pre>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-[#101016]/80 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">{active.title}</span>
            </div>
            <a
              href={active.rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
            >
              <span>Raw Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
