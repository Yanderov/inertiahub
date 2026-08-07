"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crosshair,
  Eye,
  Move,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Ghost,
  CheckCircle2
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
    "Target Part": "HumanoidRootPart",
    "Desync Mode": "Ultra Jitter",
    "Spin Angles": "Hyper Spin",
    "Velocity Mode": "Break Predict",
    "Wall Check": "Ignore Walls",
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

  const tabsByGame = {
    mm2: [
      { id: "combat", label: "Sheriff & Knife", icon: Crosshair },
      { id: "desync", label: "Desync & Ghost", icon: Zap },
      { id: "gun", label: "Gun Recovery (0ms)", icon: Sparkles },
      { id: "visuals", label: "Visuals & ESP", icon: Eye },
      { id: "movement", label: "Movement & Surf", icon: Move },
      { id: "misc", label: "Economy & Misc", icon: Sliders },
    ],
    pressure: [
      { id: "monsters", label: "Monsters & Alert", icon: Compass },
      { id: "esp", label: "Rooms & Keycards", icon: Eye },
      { id: "utility", label: "Oxygen & Speed", icon: Zap },
    ],
    demonology: [
      { id: "ghost", label: "Ghost Radar & ESP", icon: Ghost },
      { id: "evidence", label: "Auto-Evidence", icon: CheckCircle2 },
    ],
  };

  const currentTabs = tabsByGame[activeGame];

  return (
    <section id="features" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Interactive GUI Emulator
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Module Architecture
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Preview the live in-game menu tabs, toggles, sliders, and desync configurations.
          </p>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 mb-6 p-1 rounded-xl bg-[#111113] border border-zinc-800">
          {[
            { id: "mm2", name: "Murder Mystery 2", count: "v2.4 Live" },
            { id: "pressure", name: "Pressure", count: "Hadal Suite" },
            { id: "demonology", name: "Demonology", count: "Ghost Hunting" },
          ].map((game) => {
            const isSelected = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  setActiveGame(game.id as any);
                  setActiveTab(tabsByGame[game.id as keyof typeof tabsByGame][0].id);
                }}
                className={`relative flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all select-none cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeGameSelectorTab"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#222226] border border-zinc-700/80 rounded-lg shadow-sm"
                  />
                )}
                <span className="relative z-10">{game.name}</span>
                <span className={`relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isSelected 
                    ? "bg-[#111113] text-zinc-200 border-zinc-700" 
                    : "bg-[#141417] text-zinc-500 border-zinc-800"
                }`}>
                  {game.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive In-Game Window Mockup */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0f]/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden">
          {/* Mockup Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#121214]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-white font-semibold">
                Inertia Hub UI • {activeGame.toUpperCase()}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Interactive Preview
            </span>
          </div>

          {/* Subcategory Navigation Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-zinc-800 bg-[#101012] overflow-x-auto no-scrollbar">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap select-none cursor-pointer ${
                    isSelected ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeSubModuleTab"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#222226] border border-zinc-700/80 rounded-lg shadow-sm"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Module Content */}
          <div className="p-4 sm:p-6 min-h-[290px] bg-[#09090b]/60">
            {/* MM2 COMBAT */}
            {activeGame === "mm2" && activeTab === "combat" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Sheriff Gun Combat
                  </div>
                  <ToggleItem label="Sheriff Silent Aim" enabled={toggles["Sheriff Silent Aim"]} onToggle={() => handleToggle("Sheriff Silent Aim")} />
                  <DropdownItem label="Target Part" value={dropdowns["Target Part"]} options={["HumanoidRootPart", "Head", "Random"]} onChange={(v) => handleDropdown("Target Part", v)} />
                  <SliderItem label="Silent Aim FOV" value={sliders["Silent Aim FOV"]} min={30} max={360} unit="°" onChange={(v) => handleSlider("Silent Aim FOV", v)} />
                  <SliderItem label="Hit Chance" value={sliders["Hit Chance"]} min={10} max={100} unit="%" onChange={(v) => handleSlider("Hit Chance", v)} />
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Murderer Knife Combat
                  </div>
                  <ToggleItem label="Knife Silent Aim" enabled={toggles["Knife Silent Aim"]} onToggle={() => handleToggle("Knife Silent Aim")} />
                  <DropdownItem label="Wall Check" value={dropdowns["Wall Check"]} options={["Ignore Walls", "Strict LineOfSight"]} onChange={(v) => handleDropdown("Wall Check", v)} />
                  <div className="text-[11px] text-zinc-400 bg-[#070709] p-3 rounded-lg border border-zinc-800/80 leading-relaxed">
                    Automatically computes predictive trajectory velocity vectors with dynamic ping compensation and raycast verification.
                  </div>
                </div>
              </div>
            )}

            {/* MM2 DESYNC */}
            {activeGame === "mm2" && activeTab === "desync" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Position Desync (Jitter & Teleport)
                  </div>
                  <ToggleItem label="Desync (Fake Position)" enabled={toggles["Desync (Fake Position)"]} onToggle={() => handleToggle("Desync (Fake Position)")} />
                  <DropdownItem label="Desync Mode" value={dropdowns["Desync Mode"]} options={["Ultra Jitter", "Hyper Orbit", "Teleport Blink", "Sky/Void Blink", "Random Chaos", "Sine Phase"]} onChange={(v) => handleDropdown("Desync Mode", v)} />
                  <SliderItem label="Teleport Range" value={sliders["Teleport Range"]} min={10} max={3000} unit=" studs" onChange={(v) => handleSlider("Teleport Range", v)} />
                  <SliderItem label="Desync Speed" value={sliders["Desync Speed"]} min={1} max={50} unit="x" onChange={(v) => handleSlider("Desync Speed", v)} />
                  <DropdownItem label="Spin Angles" value={dropdowns["Spin Angles"]} options={["Hyper Spin", "Random Chaos", "Inverted", "None"]} onChange={(v) => handleDropdown("Spin Angles", v)} />
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Velocity Desync & Ghost
                  </div>
                  <ToggleItem label="Velocity Desync" enabled={toggles["Velocity Desync"]} onToggle={() => handleToggle("Velocity Desync")} />
                  <DropdownItem label="Velocity Mode" value={dropdowns["Velocity Mode"]} options={["Break Predict", "Sky Launch", "Random Chaos", "Tornado"]} onChange={(v) => handleDropdown("Velocity Mode", v)} />
                  <ToggleItem label="Show Server Ghost" enabled={toggles["Show Server Ghost"]} onToggle={() => handleToggle("Show Server Ghost")} />
                  <div className="text-[11px] text-zinc-400 bg-[#070709] p-3 rounded-lg border border-zinc-800/80 leading-relaxed">
                    Zero local screen lag: position restored on priority -1 RenderStep while sending extreme fake coordinates on physics Heartbeat.
                  </div>
                </div>
              </div>
            )}

            {/* MM2 GUN RECOVERY */}
            {activeGame === "mm2" && activeTab === "gun" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Instant Gun Recovery (0ms Touch)
                  </div>
                  <ToggleItem label="Auto Grab Gun" enabled={toggles["Auto Grab Gun"]} onToggle={() => handleToggle("Auto Grab Gun")} />
                  <ToggleItem label="Auto Equip Gun" enabled={toggles["Auto Equip Gun"]} onToggle={() => handleToggle("Auto Equip Gun")} />
                  <ToggleItem label="Gun Drop Notify" enabled={toggles["Gun Drop Notify"]} onToggle={() => handleToggle("Gun Drop Notify")} />
                  <div className="text-[11px] text-zinc-400 bg-[#070709] p-3 rounded-lg border border-zinc-800/80 leading-relaxed">
                    Mode: <span className="text-emerald-400 font-mono font-semibold">Pure Packet Touch</span> (Zero Teleport). Multi-limb firetouchinterest replicated in 0ms.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800 mb-3">
                      Manual Pickup Action
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      Sends high-priority touch replication packets directly into the dropped gun without modifying your character coordinates or triggering movement checks.
                    </p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all active:scale-95 shadow-md">
                    Grab Gun Now (Manual Trigger)
                  </button>
                </div>
              </div>
            )}

            {/* MM2 VISUALS */}
            {activeGame === "mm2" && activeTab === "visuals" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Player & Role ESP
                  </div>
                  <ToggleItem label="Role ESP & Outline" enabled={toggles["Role ESP & Outline"]} onToggle={() => handleToggle("Role ESP & Outline")} />
                  <ToggleItem label="Player Chams" enabled={toggles["Player Chams"]} onToggle={() => handleToggle("Player Chams")} />
                  <ToggleItem label="Gun Drop ESP & Tracer" enabled={toggles["Gun Drop ESP & Tracer"]} onToggle={() => handleToggle("Gun Drop ESP & Tracer")} />
                </div>

                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Role Highlights
                  </div>
                  <div className="text-xs text-zinc-400 space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                      <span>Murderer Highlight</span>
                      <span className="font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">Crimson #FF2A2A</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                      <span>Sheriff Highlight</span>
                      <span className="font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Azure #2A7FFF</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                      <span>Gun Drop Tracer</span>
                      <span className="font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">Gold #FFB800</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MM2 MOVEMENT */}
            {activeGame === "mm2" && activeTab === "movement" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Speed & Bunny Hop
                  </div>
                  <ToggleItem label="Pixel Surf Engine" enabled={toggles["Pixel Surf Engine"]} onToggle={() => handleToggle("Pixel Surf Engine")} />
                  <ToggleItem label="Auto Bunny-Hop" enabled={toggles["Auto Bunny-Hop"]} onToggle={() => handleToggle("Auto Bunny-Hop")} />
                </div>
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Character Safety
                  </div>
                  <ToggleItem label="Anti-Fling & Void Rescue" enabled={toggles["Anti-Fling & Void Rescue"]} onToggle={() => handleToggle("Anti-Fling & Void Rescue")} />
                </div>
              </div>
            )}

            {/* MM2 MISC */}
            {activeGame === "mm2" && activeTab === "misc" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Economy & Coins
                  </div>
                  <ToggleItem label="Smart Coin Aura" enabled={toggles["Smart Coin Aura"]} onToggle={() => handleToggle("Smart Coin Aura")} />
                  <SliderItem label="Coin Aura Range" value={sliders["Coin Aura Range"]} min={5} max={50} unit=" studs" onChange={(v) => handleSlider("Coin Aura Range", v)} />
                </div>
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Local Cosmetics
                  </div>
                  <ToggleItem label="Fake Headless & Korblox" enabled={toggles["Fake Headless & Korblox"]} onToggle={() => handleToggle("Fake Headless & Korblox")} />
                </div>
              </div>
            )}

            {/* PRESSURE */}
            {activeGame === "pressure" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Entity Detection
                  </div>
                  <ToggleItem label="Angler & Froger ESP" enabled={toggles["Angler & Froger ESP"]} onToggle={() => handleToggle("Angler & Froger ESP")} />
                  <ToggleItem label="Door & Keycard ESP" enabled={toggles["Door & Keycard ESP"]} onToggle={() => handleToggle("Door & Keycard ESP")} />
                </div>
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Vitals & Speed
                  </div>
                  <ToggleItem label="Infinite Oxygen & Stamina" enabled={toggles["Infinite Oxygen & Stamina"]} onToggle={() => handleToggle("Infinite Oxygen & Stamina")} />
                </div>
              </div>
            )}

            {/* DEMONOLOGY */}
            {activeGame === "demonology" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
                    Paranormal Investigation
                  </div>
                  <ToggleItem label="Ghost Tracker & Radar" enabled={toggles["Ghost Tracker & Radar"]} onToggle={() => handleToggle("Ghost Tracker & Radar")} />
                  <ToggleItem label="EMF Level 5 Auto-Logger" enabled={toggles["EMF Level 5 Auto-Logger"]} onToggle={() => handleToggle("EMF Level 5 Auto-Logger")} />
                  <ToggleItem label="Cursed Items ESP" enabled={toggles["Cursed Items ESP"]} onToggle={() => handleToggle("Cursed Items ESP")} />
                </div>
                <div className="p-4 rounded-xl bg-[#111113] border border-zinc-800 space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider pb-1 border-b border-zinc-800">
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
      className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer select-none"
    >
      <span className="text-xs font-medium text-zinc-200">{label}</span>
      <div className={`w-9 h-5 rounded-full transition-all flex items-center p-0.5 ${enabled ? "bg-white justify-end" : "bg-zinc-800 justify-start"}`}>
        <motion.div layout className={`w-4 h-4 rounded-full shadow-sm ${enabled ? "bg-black" : "bg-zinc-500"}`} />
      </div>
    </div>
  );
}

function SliderItem({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-100 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

function DropdownItem({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-between gap-2">
      <span className="text-xs text-zinc-400 whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#141417] text-zinc-200 text-xs font-mono px-2.5 py-1 rounded-lg border border-zinc-700 outline-none cursor-pointer focus:border-zinc-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#111113] text-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
