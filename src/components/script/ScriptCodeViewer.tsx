"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, FileCode, ExternalLink } from "lucide-react";

export default function ScriptCodeViewer() {
  const [copied, setCopied] = useState(false);

  const fileData = {
    name: "murdermistery2.lua",
    title: "Murder Mystery 2 Dedicated Hub (v2.4)",
    lines: "8,055 lines",
    size: "429 KB",
    rawUrl: "/scripts/murdermistery2.lua",
    loadstring: `loadstring(game:HttpGet("https://inertiahub.xyz/scripts/murdermistery2.lua"))()`,
    codePreview: `--[[
    Inertia Hub — Murder Mystery 2 Dedicated Engine (v2.4)
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

-- [DESYNC ENGINE] High-frequency physics displacement & camera priority
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

-- [GUN RECOVERY] 0ms Quantum Blink & Multi-Limb Touch Replication
do
    -- Instantly grabs fallen sheriff revolver in 1 network tick
    -- Dispatches firetouchinterest for all character parts without position drift
end`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.loadstring);
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
              Direct access to complete, un-obfuscated script files and raw downloads.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141417] hover:bg-[#1f1f23] border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-mono transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied Loadstring</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Loadstring</span>
                </>
              )}
            </button>

            <a
              href={fileData.rawUrl}
              download={fileData.name}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download .lua</span>
            </a>
          </div>
        </div>

        {/* Code Viewer Window */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0f]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/80">
          {/* File Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#121214] border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#222226] border border-zinc-700/80 text-xs font-mono text-white font-semibold shadow-sm">
                <FileCode className="w-3.5 h-3.5 text-zinc-300" />
                <span>{fileData.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 pr-2">
              <span>{fileData.lines}</span>
              <span>•</span>
              <span>{fileData.size}</span>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 sm:p-5 bg-[#070709] overflow-x-auto">
            <pre className="font-mono text-xs text-zinc-300 leading-relaxed">
              <code>{fileData.codePreview}</code>
            </pre>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-[#121214] border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">{fileData.title}</span>
            </div>
            <a
              href={fileData.rawUrl}
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
