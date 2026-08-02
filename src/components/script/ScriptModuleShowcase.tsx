"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Crosshair,
  Move,
  Sparkles,
  Shield,
  Compass,
  Check,
  Zap,
  Activity,
  Ghost,
  Radio
} from "lucide-react";
import { soundFX } from "@/lib/audio";

interface FeatureToggle {
  name: string;
  desc: string;
  defaultState?: boolean;
}

export default function ScriptModuleShowcase() {
  const [selectedGame, setSelectedGame] = useState<string>("mm2");
  const [activeTab, setActiveTab] = useState<string>("visuals");
  const [toggledStates, setToggledStates] = useState<Record<string, boolean>>({});

  const games = [
    { id: "mm2", name: "Murder Mystery 2", short: "MM2", icon: Crosshair },
    { id: "pressure", name: "Pressure", short: "Hadal Blacksite", icon: Compass },
    { id: "demonology", name: "Demonology", short: "Ghost Hunting", icon: Ghost },
  ];

  const gameModules: Record<
    string,
    {
      tabs: { id: string; label: string; icon: any }[];
      content: Record<string, { title: string; subtitle: string; items: FeatureToggle[] }>;
    }
  > = {
    mm2: {
      tabs: [
        { id: "visuals", label: "Visuals & ESP", icon: Eye },
        { id: "combat", label: "Combat & Aim", icon: Crosshair },
        { id: "motion", label: "Physics & Surf", icon: Move },
        { id: "misc", label: "Farm & AI Chat", icon: Sparkles },
      ],
      content: {
        visuals: {
          title: "MM2 Role ESP & Shaders",
          subtitle: "Precise role identification and atmospheric rendering engine.",
          items: [
            { name: "Role ESP & Outline", desc: "Live role recognition for Murderer (Red), Sheriff (Blue), and Hero.", defaultState: true },
            { name: "3D Bounding Boxes & Chams", desc: "Corner bounding boxes, player chams, and directional skeleton tracers.", defaultState: true },
            { name: "Gun Drop Alert & Tracer", desc: "Instantly highlights dropped sheriff gun with real-time waypoint tracers.", defaultState: true },
            { name: "Cinematic In-Game Shaders", desc: "Atmospheric bloom, volumetric lighting, and depth of field presets.", defaultState: true },
          ],
        },
        combat: {
          title: "Knife Silent Aim & Combat",
          subtitle: "Predictive throw trajectories and auto-aim mechanics.",
          items: [
            { name: "Knife Silent Aim", desc: "Velocity predictive trajectory targeting with ping-offset compensation.", defaultState: true },
            { name: "Sheriff Auto-Aim", desc: "Adjustable FOV circle, smoothness control, and bone hitpart prioritization.", defaultState: true },
            { name: "Auto Grab Dropped Gun", desc: "Retrieves fallen sheriff weapon instantly upon dropping.", defaultState: true },
            { name: "Anti-Aim Slots", desc: "Desync client angles across 3 customizable desync anti-aim slots.", defaultState: false },
          ],
        },
        motion: {
          title: "Pixel Surf & Physics Bypass",
          subtitle: "Source-style surf physics and anti-death protections.",
          items: [
            { name: "Pixel Surf Engine", desc: "Smooth ramp surfing with custom gravity (80) and surf speed (60).", defaultState: true },
            { name: "Auto Bunny-Hop", desc: "Continuous bunny-hopping with air-strafe acceleration multiplier.", defaultState: true },
            { name: "Anti-Fling & Void Rescue", desc: "Prevents body flinging collisions and auto-spawns safe void platforms.", defaultState: true },
            { name: "Directional Flight & Noclip", desc: "Smooth flight controller with velocity braking and wall phase bypass.", defaultState: false },
          ],
        },
        misc: {
          title: "Smart Farm & Neural AI",
          subtitle: "Automated progression, coin gathering, and deep neural chat integration.",
          items: [
            { name: "Smart Coin Aura", desc: "Collects coins within configurable radial distance without erratic movement.", defaultState: true },
            { name: "DeepSeek AI In-Game Chat", desc: "Context-aware AI companion with humanized typing speed.", defaultState: false },
            { name: "Fake Headless & Korblox", desc: "Local cosmetic overrides for Headless Horseman and Korblox Deathspeaker.", defaultState: true },
            { name: "Audio Mute Filters", desc: "Selectively mute loud gun shots, coin pings, and kill alerts.", defaultState: true },
          ],
        },
      },
    },
    pressure: {
      tabs: [
        { id: "entity_esp", label: "Monster & Entity ESP", icon: Eye },
        { id: "navigation", label: "Blacksite Navigation", icon: Compass },
        { id: "safety", label: "Movement & Oxygen", icon: Shield },
      ],
      content: {
        entity_esp: {
          title: "Hadal Entity ESP & Early Alerts",
          subtitle: "Real-time detection for all deep-sea monsters and anomalies.",
          items: [
            { name: "Angler & Froger ESP", desc: "Full monster tracking with early audio/visual warnings before room entry.", defaultState: true },
            { name: "Pandemonium & Blitz Alert", desc: "Critical danger HUD warning when high-speed entities spawn.", defaultState: true },
            { name: "Eyefest & Squiddle ESP", desc: "Highlights wall entities, eye hazards, and tentacle traps through walls.", defaultState: true },
            { name: "Wall Dweller Alert", desc: "Audio cue and distance tracer when a Wall Dweller stalks behind you.", defaultState: true },
          ],
        },
        navigation: {
          title: "Blacksite Loot & Door Helpers",
          subtitle: "Instant item discovery and objective pathfinding.",
          items: [
            { name: "Door & Keycard ESP", desc: "Highlights current room exit doors, clearance keycards, and keypads.", defaultState: true },
            { name: "Kroner & Item Highlight", desc: "Visualizes Kroner piles, batteries, medkits, and flashlight rechargers.", defaultState: true },
            { name: "Locker & Safe Spot ESP", desc: "Spots closest vacant lockers and safe hiding vents in advance.", defaultState: true },
            { name: "Objective Auto-Marker", desc: "Directional beacon pointing directly to the submarine generator/task.", defaultState: true },
          ],
        },
        safety: {
          title: "Movement & Ocean Physics",
          subtitle: "Fast swimming, infinite stamina, and deep dive speed.",
          items: [
            { name: "Fast Swim & Glider Speed", desc: "Increases underwater velocity to 32 and glider sprint to 60.", defaultState: true },
            { name: "Infinite Oxygen & Stamina", desc: "Prevents drowning during underwater flooded sector navigation.", defaultState: true },
            { name: "Fullbright & Night Vision", desc: "Eliminates murky ocean darkness with crystal clear ambient lighting.", defaultState: true },
            { name: "Turret & Hazard ESP", desc: "Visualizes automated turrets, steam pipes, and electric puddles.", defaultState: true },
          ],
        },
      },
    },
    demonology: {
      tabs: [
        { id: "ghost_esp", label: "Ghost & Entity ESP", icon: Ghost },
        { id: "evidence", label: "Evidence Assistant", icon: Radio },
        { id: "items", label: "Cursed Items & Sanity", icon: Activity },
      ],
      content: {
        ghost_esp: {
          title: "Ghost Tracker & Room Visualizer",
          subtitle: "Accurate paranormal entity tracking and ghost room pinpointing.",
          items: [
            { name: "Ghost Cham & Distance ESP", desc: "Real-time ghost location, hunting state status, and walking speed meter.", defaultState: true },
            { name: "Favorite Room Visualizer", desc: "Highlights the active ghost haunt room with ambient temperature cues.", defaultState: true },
            { name: "Hunting Warning Banner", desc: "Instant screen warning and heartbeat alert when ghost initiates hunt.", defaultState: true },
            { name: "Player & Sanity ESP", desc: "Live health and sanity tracker for all co-op squad members.", defaultState: true },
          ],
        },
        evidence: {
          title: "Automated Evidence Assistant",
          subtitle: "Simplifies ghost type identification and evidence logging.",
          items: [
            { name: "EMF Level 5 Auto-Logger", desc: "Alerts and records EMF spikes instantly when electromagnetic activity triggers.", defaultState: true },
            { name: "Freezing Temp & Orbs", desc: "Automated ghost orb detector and sub-zero freezing temp radar.", defaultState: true },
            { name: "Fingerprints & UV Scanner", desc: "Highlights UV handprints on doors, light switches, and windows.", defaultState: true },
            { name: "Spirit Box Response Radar", desc: "Logs ghost voice responses directly to HUD with distance marker.", defaultState: true },
          ],
        },
        items: {
          title: "Cursed Possessions & Utility",
          subtitle: "Find Tarot cards, Ouija boards, and protect squad sanity.",
          items: [
            { name: "Cursed Items ESP", desc: "Highlights Ouija Board, Tarot Cards, Music Box, and Voodoo Doll instantly.", defaultState: true },
            { name: "Sanity Freeze / Anti-Drain", desc: "Minimizes dark room sanity depletion during active investigation.", defaultState: false },
            { name: "Breaker & Fuse Box ESP", desc: "Pinpoints electrical fuse box to maintain house power effortlessly.", defaultState: true },
            { name: "Instant Interaction / Grab", desc: "Fast pickup for video cameras, crucifies, and smudge sticks.", defaultState: true },
          ],
        },
      },
    },
  };

  const currentGame = gameModules[selectedGame] || gameModules.mm2;
  const currentTab = currentGame.tabs.find((t) => t.id === activeTab)
    ? activeTab
    : currentGame.tabs[0].id;
  const currentSection = currentGame.content[currentTab] || currentGame.content[currentGame.tabs[0].id];

  const handleToggle = (name: string, defaultVal: boolean) => {
    const curr = toggledStates[name] !== undefined ? toggledStates[name] : defaultVal;
    setToggledStates({ ...toggledStates, [name]: !curr });
    soundFX.playClick();
  };

  return (
    <section id="features" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Module Showcase
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Interactive Script Engine Modules
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select a game to inspect its active modules, features, and engine configurations.
          </p>
        </div>

        {/* Game Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#090909]/90 border border-zinc-800 backdrop-blur-md mb-6 shadow-lg">
          {games.map((g) => {
            const isSelected = selectedGame === g.id;
            const Icon = g.icon;
            return (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedGame(g.id);
                  setActiveTab(gameModules[g.id].tabs[0].id);
                  soundFX.playClick();
                }}
                className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-colors ${
                  isSelected ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeGameSelector"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-zinc-800/90 border border-zinc-700/80 rounded-xl -z-10 shadow-sm"
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{g.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Module Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {currentGame.tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  soundFX.playClick();
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white border border-zinc-600 shadow-md"
                    : "bg-[#0d0d0d]/80 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Module Content Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedGame}-${currentTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-6 rounded-2xl bg-[#0c0c0c]/85 border border-zinc-800 backdrop-blur-md shadow-xl"
          >
            <div className="mb-6 pb-4 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-white mb-1">
                {currentSection.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentSection.items.map((item, idx) => {
                const isEnabled =
                  toggledStates[item.name] !== undefined
                    ? toggledStates[item.name]
                    : item.defaultState ?? true;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggle(item.name, item.defaultState ?? true)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                      isEnabled
                        ? "bg-[#111111] border-zinc-700 hover:border-zinc-500 shadow-sm"
                        : "bg-[#090909] border-zinc-850 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-xs sm:text-sm">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                        isEnabled ? "bg-white justify-end" : "bg-zinc-800 justify-start"
                      }`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-4 h-4 rounded-full ${isEnabled ? "bg-black" : "bg-zinc-500"}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
