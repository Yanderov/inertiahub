"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Crosshair, Compass, Ghost, ShieldAlert } from "lucide-react";
import { soundFX } from "@/lib/audio";

interface GalleryItem {
  id: string;
  title: string;
  game: string;
  category: "mm2" | "pressure" | "demonology";
  image: string;
  badge: string;
  desc: string;
  icon: any;
}

export default function ScriptGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const galleryItems: GalleryItem[] = [
    // 1 & 2: Murder Mystery 2
    {
      id: "mm2-gameplay",
      title: "MM2 In-Game Gameplay & Role HUD",
      game: "Murder Mystery 2",
      category: "mm2",
      badge: "In-Game Live HUD",
      image: "/gallery/mm2_1.jpg",
      desc: "Live role recognition showing Murderer, Sheriff, Gun Status, keybinds, and real-time active player counts in MM2.",
      icon: Crosshair,
    },
    {
      id: "mm2-menu",
      title: "MM2 Inertia Menu & Sheriff Combat",
      game: "Murder Mystery 2",
      category: "mm2",
      badge: "Combat & Sheriff Aim",
      image: "/gallery/mm2_2.png",
      desc: "Tactical Sheriff aim control with Silent Aim, Piercing Bullet, Wall Check, Anti-Desync, and Instant Gun Fire.",
      icon: Crosshair,
    },

    // 3 & 4: Pressure
    {
      id: "pressure-station",
      title: "Pressure Hadal Blacksite Sector",
      game: "Pressure",
      category: "pressure",
      badge: "Hadal Station Live",
      image: "/gallery/pressure_1.png",
      desc: "Hadal Blacksite atmospheric depth run with entity alerts, room tracking, and mission waypoint highlights.",
      icon: Compass,
    },
    {
      id: "pressure-menu",
      title: "Pressure Inertia Module & Vitals",
      game: "Pressure",
      category: "pressure",
      badge: "Entity Radar & UI",
      image: "/gallery/pressure_2.png",
      desc: "Inertia script menu loaded inside Pressure with full Potassium compatibility, oxygen monitor, and entity radar.",
      icon: Compass,
    },

    // 5 & 6: Demonology
    {
      id: "demonology-night",
      title: "Demonology Paranormal Investigation",
      game: "Demonology",
      category: "demonology",
      badge: "Ghost Hunting Live",
      image: "/gallery/demonology_1.png",
      desc: "Night-time paranormal investigation showing Ghost Radar, room locator (Blue Bedroom), and active ghost distance tracking.",
      icon: Ghost,
    },
    {
      id: "demonology-radar",
      title: "Demonology Evidence & Entity List",
      game: "Demonology",
      category: "demonology",
      badge: "Evidence & Radar",
      image: "/gallery/demonology_2.png",
      desc: "Live ghost identification database, EMF level 5 recorder, spirit box response helper, and directional radar compass.",
      icon: Ghost,
    },
  ];

  const filteredItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  return (
    <section id="gallery" className="py-16 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Live In-Game Captures
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Real In-Game Screenshots
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Actual captures of InertiaHub running across Murder Mystery 2, Pressure, and Demonology.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "all", label: "All Screenshots (6)" },
            { id: "mm2", label: "Murder Mystery 2 (2)" },
            { id: "pressure", label: "Pressure (2)" },
            { id: "demonology", label: "Demonology (2)" },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setFilter(tab.id);
                  soundFX.playClick();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-[#0d0d0d]/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Gallery Grid: 2 per game */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setSelectedImage(item);
                  soundFX.playClick();
                }}
                className="group relative rounded-2xl bg-[#0e0e0e]/95 border border-zinc-800 hover:border-zinc-500 overflow-hidden shadow-xl cursor-pointer transition-all flex flex-col justify-between"
              >
                {/* Image Aspect Box */}
                <div className="aspect-video relative overflow-hidden bg-black/90">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 border border-zinc-700/80 backdrop-blur-md">
                      <Icon className="w-3 h-3 text-zinc-300" />
                      <span className="text-[10px] font-semibold text-white tracking-wide">
                        {item.game}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-black/80 border border-zinc-700/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Sub-Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900/90 border border-zinc-700/70 px-2 py-0.5 rounded backdrop-blur-sm">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Caption Footer */}
                <div className="p-4 bg-[#0a0a0a]">
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fullscreen Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-[#0c0c0c] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    soundFX.playClick();
                  }}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/80 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Lightbox Image */}
                <div className="aspect-video w-full relative bg-black flex items-center justify-center">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Lightbox Info */}
                <div className="p-5 sm:p-6 bg-[#0a0a0a] border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        {selectedImage.game}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {selectedImage.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      {selectedImage.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {selectedImage.desc}
                    </p>
                  </div>

                  <a
                    href="#script"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedImage(null);
                      soundFX.playClick();
                      document.getElementById("script")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="shrink-0 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md"
                  >
                    Copy Script
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
