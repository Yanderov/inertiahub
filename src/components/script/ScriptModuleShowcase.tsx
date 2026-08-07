"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  Shield,
  Eye,
  Move,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Ghost,
  Check,
  CircleDot,
  Radio
} from "lucide-react";

export default function ScriptModuleShowcase() {
  const [activeGame, setActiveGame] = useState<"mm2" | "pressure" | "demonology">("mm2");
  const [activeTab, setActiveTab] = useState<string>("combat");

  // Local state for interactive UI controls
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    // MM2
    "Knife Silent Aim": true,
    "Sheriff Silent Aim": true,
    "Auto Grab Gun": true,
    "Auto Equip Gun": true,
    "Gun Drop Notify": true,
    "Desync (Fake Position)": true,
    "Velocity Desync": true,
    "Show Server Ghost": false,
    "Role ESP & Outline": true,
    "Gun Drop ESP & Tracer": true,
    "Player Chams": true,
    "Pixel Surf Engine": true,
    "Auto Bunny-Hop": true,
    "Anti-Fling & Void Rescue": true,
    "Smart Coin Aura": true,
    "Fake Headless & Korblox": true,
    // Pressure
    "Angler & Froger ESP": true,
    "Door & Keycard ESP": true,
    "Infinite Oxygen & Stamina": true,
    // Demonology
    "Ghost Tracker & Radar": true,
    "EMF Level 5 Auto-Logger": true,
    "Cursed Items ESP": true,
  });

  const [sliders, setSliders] = useState<Record<string, number>>({
    "Teleport Range": 500,
    "Desync Speed": 20,
    "Silent Aim FOV": 180,
    "Hit Chance": 100,
    "Coin Aura Range": 25,
  });

  const [dropdowns, setDropdowns] = useState<Record<string, string>>({
    "Desync Mode": "Ultra Jitter",
    "Spin Angles": "Hyper Spin",
    "Velocity Mode": "Break Predict",
    "Grab Method": "Quantum Blink (Fastest)",
    "Target HitPart": "HumanoidRootPart",
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSlider = (key: string, val: number) => {
    setSliders((prev) => ({ ...prev, [key]: val }));
  };

  const handleDropdown = (key: string, val: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <section id="features" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Module Engine Preview
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Interactive Script Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Preview the internal features and logic running inside the script.
          </p>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#101014] border border-[#1e1e24] mb-5">
          {[
            { id: "mm2", name: "Murder Mystery 2", icon: Crosshair },
            { id: "pressure", name: "Pressure", icon: Compass },
            { id: "demonology", name: "Demonology", icon: Ghost },
          ].map((g) => {
            const isSelected = activeGame === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGame(g.id as any);
                  setActiveTab(g.id === "mm2" ? "combat" : g.id === "pressure" ? "entities" : "ghost");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#1c1c24] text-white border border-[#2d2d38] shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>

        {/* Script UI Simulation Window */}
        <div className="rounded-2xl border border-[#24242c] bg-[#0c0c0f] overflow-hidden shadow-2xl">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#121216] border-b border-[#1f1f26]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              <span className="text-xs font-mono text-zinc-300 ml-2 font-medium">
                Inertia Hub // {activeGame.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[#1c1c22] bg-[#0f0f13] px-3 py-1.5 overflow-x-auto gap-1 no-scrollbar">
            {activeGame === "mm2" && (
              <>
                {[
                  { id: "combat", label: "Combat & Aim" },
                  { id: "desync", label: "Desync Engine" },
                  { id: "gun", label: "Gun Recovery" },
                  { id: "visuals", label: "Visuals / ESP" },
                  { id: "movement", label: "Movement & Surf" },
                  { id: "misc", label: "Misc & Farm" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                      activeTab === t.id
                        ? "bg-[#1c1c24] text-white border border-[#2b2b36]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            )}

            {activeGame === "pressure" && (
              <>
                {[
                  { id: "entities", label: "Monsters & Alerts" },
                  { id: "navigation", label: "Doors & Loot" },
                  { id: "physics", label: "Swim & Oxygen" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === t.id
                        ? "bg-[#1c1c24] text-white border border-[#2b2b36]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            )}

            {activeGame === "demonology" && (
              <>
                {[
                  { id: "ghost", label: "Ghost Radar" },
                  { id: "evidence", label: "Evidence Assistant" },
                  { id: "items", label: "Cursed Items" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === t.id
                        ? "bg-[#1c1c24] text-white border border-[#2b2b36]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Tab Content Body */}
          <div className="p-5">
            {/* MM2 COMBAT */}
            {activeGame === "mm2" && activeTab === "combat" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Sheriff & Gun Combat
                  </div>
                  <ToggleItem label="Sheriff Silent Aim" enabled={toggles["Sheriff Silent Aim"]} onToggle={() => handleToggle("Sheriff Silent Aim")} />
                  <DropdownItem label="Hit Part" value={dropdowns["Target HitPart"]} options={["HumanoidRootPart", "Head", "Torso"]} onChange={(v) => handleDropdown("Target HitPart", v)} />
                  <SliderItem label="Silent Aim FOV" value={sliders["Silent Aim FOV"]} min={30} max={500} unit="px" onChange={(v) => handleSlider("Silent Aim FOV", v)} />
                  <SliderItem label="Hit Chance" value={sliders["Hit Chance"]} min={0} max={100} unit="%" onChange={(v) => handleSlider("Hit Chance", v)} />
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Murderer & Knife Combat
                  </div>
                  <ToggleItem label="Knife Silent Aim" enabled={toggles["Knife Silent Aim"]} onToggle={() => handleToggle("Knife Silent Aim")} />
                  <div className="text-[11px] text-zinc-400 leading-relaxed bg-[#0a0a0d] p-2.5 rounded-lg border border-[#181820]">
                    Predictive trajectory calculation with ping compensation. Automatically leads moving targets when throwing the knife.
                  </div>
                  <div className="pt-2">
                    <button className="w-full py-2 rounded-lg bg-[#181822] hover:bg-[#20202e] text-zinc-200 text-xs font-mono border border-[#2a2a38] transition-all">
                      Kill All Murderer Action
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MM2 DESYNC */}
            {activeGame === "mm2" && activeTab === "desync" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Position Desync (Jitter & Teleport)
                  </div>
                  <ToggleItem label="Desync (Fake Position)" enabled={toggles["Desync (Fake Position)"]} onToggle={() => handleToggle("Desync (Fake Position)")} />
                  <DropdownItem label="Desync Mode" value={dropdowns["Desync Mode"]} options={["Ultra Jitter", "Hyper Orbit", "Teleport Blink", "Sky/Void Blink", "Random Chaos", "Sine Phase"]} onChange={(v) => handleDropdown("Desync Mode", v)} />
                  <SliderItem label="Teleport Range" value={sliders["Teleport Range"]} min={10} max={3000} unit=" studs" onChange={(v) => handleSlider("Teleport Range", v)} />
                  <SliderItem label="Desync Speed" value={sliders["Desync Speed"]} min={1} max={50} unit="x" onChange={(v) => handleSlider("Desync Speed", v)} />
                  <DropdownItem label="Spin Angles" value={dropdowns["Spin Angles"]} options={["Hyper Spin", "Random Chaos", "Inverted", "None"]} onChange={(v) => handleDropdown("Spin Angles", v)} />
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Velocity Desync & Ghost
                  </div>
                  <ToggleItem label="Velocity Desync" enabled={toggles["Velocity Desync"]} onToggle={() => handleToggle("Velocity Desync")} />
                  <DropdownItem label="Velocity Mode" value={dropdowns["Velocity Mode"]} options={["Break Predict", "Sky Launch", "Random Chaos", "Tornado"]} onChange={(v) => handleDropdown("Velocity Mode", v)} />
                  <ToggleItem label="Show Server Ghost" enabled={toggles["Show Server Ghost"]} onToggle={() => handleToggle("Show Server Ghost")} />
                  <div className="text-[11px] text-zinc-400 bg-[#0a0a0d] p-2.5 rounded-lg border border-[#181820] leading-relaxed">
                    Zero local screen lag: position restored on priority -1 RenderStep while sending extreme fake coordinates on physics Heartbeat.
                  </div>
                </div>
              </div>
            )}

            {/* MM2 GUN RECOVERY */}
            {activeGame === "mm2" && activeTab === "gun" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Instant Gun Recovery (Zero Teleport)
                  </div>
                  <ToggleItem label="Auto Grab Gun" enabled={toggles["Auto Grab Gun"]} onToggle={() => handleToggle("Auto Grab Gun")} />
                  <ToggleItem label="Auto Equip Gun" enabled={toggles["Auto Equip Gun"]} onToggle={() => handleToggle("Auto Equip Gun")} />
                  <ToggleItem label="Gun Drop Notify" enabled={toggles["Gun Drop Notify"]} onToggle={() => handleToggle("Gun Drop Notify")} />
                  <div className="text-[11px] text-zinc-400 bg-[#0a0a0d] p-2.5 rounded-lg border border-[#181820] leading-relaxed">
                    Mode: <span className="text-emerald-400 font-mono font-semibold">Pure Packet Touch</span> (Zero Teleport). Multi-limb firetouchinterest replicated in 0ms.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22] mb-3">
                      Manual Pickup Action
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      Sends high-priority touch replication packets directly into the dropped gun without modifying your character coordinates or triggering movement checks.
                    </p>
                  </div>
                  <button className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs transition-all hover:bg-zinc-200">
                    Grab Gun Now
                  </button>
                </div>
              </div>
            )}

            {/* MM2 VISUALS */}
            {activeGame === "mm2" && activeTab === "visuals" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Player & Role ESP
                  </div>
                  <ToggleItem label="Role ESP & Outline" enabled={toggles["Role ESP & Outline"]} onToggle={() => handleToggle("Role ESP & Outline")} />
                  <ToggleItem label="Player Chams" enabled={toggles["Player Chams"]} onToggle={() => handleToggle("Player Chams")} />
                  <ToggleItem label="Gun Drop ESP & Tracer" enabled={toggles["Gun Drop ESP & Tracer"]} onToggle={() => handleToggle("Gun Drop ESP & Tracer")} />
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Rendering Engine
                  </div>
                  <div className="text-xs text-zinc-400 space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-[#1a1a20]">
                      <span>Murderer Highlight</span>
                      <span className="font-mono text-rose-400">Crimson #FF2A2A</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1a1a20]">
                      <span>Sheriff Highlight</span>
                      <span className="font-mono text-blue-400">Azure #2A7FFF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1a1a20]">
                      <span>Gun Drop Tracer</span>
                      <span className="font-mono text-amber-400">Gold #FFB800</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MM2 MOVEMENT */}
            {activeGame === "mm2" && activeTab === "movement" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Physics & Surf Mechanics
                  </div>
                  <ToggleItem label="Pixel Surf Engine" enabled={toggles["Pixel Surf Engine"]} onToggle={() => handleToggle("Pixel Surf Engine")} />
                  <ToggleItem label="Auto Bunny-Hop" enabled={toggles["Auto Bunny-Hop"]} onToggle={() => handleToggle("Auto Bunny-Hop")} />
                  <ToggleItem label="Anti-Fling & Void Rescue" enabled={toggles["Anti-Fling & Void Rescue"]} onToggle={() => handleToggle("Anti-Fling & Void Rescue")} />
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Velocity Parameters
                  </div>
                  <div className="text-xs text-zinc-400 space-y-2">
                    <p className="text-[11px] text-zinc-400 leading-relaxed bg-[#0a0a0d] p-2.5 rounded-lg border border-[#181820]">
                      Source-style smooth ramp physics with custom air-acceleration vectors and automatic slope detection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MM2 MISC */}
            {activeGame === "mm2" && activeTab === "misc" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Automation & Cosmetics
                  </div>
                  <ToggleItem label="Smart Coin Aura" enabled={toggles["Smart Coin Aura"]} onToggle={() => handleToggle("Smart Coin Aura")} />
                  <SliderItem label="Coin Aura Range" value={sliders["Coin Aura Range"]} min={5} max={60} unit=" studs" onChange={(v) => handleSlider("Coin Aura Range", v)} />
                  <ToggleItem label="Fake Headless & Korblox" enabled={toggles["Fake Headless & Korblox"]} onToggle={() => handleToggle("Fake Headless & Korblox")} />
                </div>

                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Optimization & Sounds
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed bg-[#0a0a0d] p-2.5 rounded-lg border border-[#181820]">
                    Custom sound replacement engine for guns and murders, low-spec potato mode, and sound mutes for noisy lobbies.
                  </div>
                </div>
              </div>
            )}

            {/* PRESSURE */}
            {activeGame === "pressure" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Hadal Monsters & Hazards
                  </div>
                  <ToggleItem label="Angler & Froger ESP" enabled={toggles["Angler & Froger ESP"]} onToggle={() => handleToggle("Angler & Froger ESP")} />
                  <ToggleItem label="Door & Keycard ESP" enabled={toggles["Door & Keycard ESP"]} onToggle={() => handleToggle("Door & Keycard ESP")} />
                  <ToggleItem label="Infinite Oxygen & Stamina" enabled={toggles["Infinite Oxygen & Stamina"]} onToggle={() => handleToggle("Infinite Oxygen & Stamina")} />
                </div>
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Blacksite Utilities
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Automated underwater sub navigation, monster spawn warnings before door opens, and keycard pathfinding markers.
                  </p>
                </div>
              </div>
            )}

            {/* DEMONOLOGY */}
            {activeGame === "demonology" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Paranormal Investigation
                  </div>
                  <ToggleItem label="Ghost Tracker & Radar" enabled={toggles["Ghost Tracker & Radar"]} onToggle={() => handleToggle("Ghost Tracker & Radar")} />
                  <ToggleItem label="EMF Level 5 Auto-Logger" enabled={toggles["EMF Level 5 Auto-Logger"]} onToggle={() => handleToggle("EMF Level 5 Auto-Logger")} />
                  <ToggleItem label="Cursed Items ESP" enabled={toggles["Cursed Items ESP"]} onToggle={() => handleToggle("Cursed Items ESP")} />
                </div>
                <div className="p-4 rounded-xl bg-[#111115] border border-[#1e1e26] space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-[#1a1a22]">
                    Investigation Tools
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Live favorite room visualizer, spirit box frequency logger, and instant sanity freeze during ghost hunting phases.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToggleItem({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0f] border border-[#1a1a22] hover:border-[#262634] transition-colors cursor-pointer select-none"
    >
      <span className="text-xs font-medium text-zinc-200">{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${enabled ? "bg-white justify-end" : "bg-zinc-800 justify-start"}`}>
        <div className={`w-3 h-3 rounded-full ${enabled ? "bg-black" : "bg-zinc-500"}`} />
      </div>
    </div>
  );
}

function SliderItem({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="p-2 rounded-lg bg-[#0c0c0f] border border-[#1a1a22] space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-200 font-bold">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

function DropdownItem({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="p-2 rounded-lg bg-[#0c0c0f] border border-[#1a1a22] flex items-center justify-between gap-2">
      <span className="text-xs text-zinc-400 whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#14141a] text-zinc-200 text-xs font-mono px-2 py-1 rounded border border-[#242430] outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#111116] text-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
