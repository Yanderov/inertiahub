"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Crosshair, Compass, Ghost } from "lucide-react";

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
    {
      id: "mm2-gameplay",
      title: "MM2 Role HUD & Gun Status",
      game: "Murder Mystery 2",
      category: "mm2",
      badge: "In-Game Live HUD",
      image: "/gallery/mm2_1.jpg",
      desc: "Real-time role identification showing Murderer, Sheriff, Hero, and Gun status with minimal screen footprint.",
      icon: Crosshair,
    },
    {
      id: "mm2-menu",
      title: "MM2 Inertia Menu & Sheriff Combat",
      game: "Murder Mystery 2",
      category: "mm2",
      badge: "Combat & Desync",
      image: "/gallery/mm2_2.png",
      desc: "Tactical Sheriff aim control with Silent Aim, Quantum Gun Grab, Anti-Desync, and Instant Revolver Fire.",
      icon: Crosshair,
    },
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
    {
      id: "demonology-night",
      title: "Demonology Paranormal Investigation",
      game: "Demonology",
      category: "demonology",
      badge: "Ghost Hunting Live",
      image: "/gallery/demonology_1.png",
      desc: "Night-time paranormal investigation showing Ghost Radar, room locator, and active ghost distance tracking.",
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Live In-Game Captures
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Actual In-Game UI
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real captures of Inertia running live across Murder Mystery 2, Pressure, and Demonology.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {[
            { id: "all", label: "All Screenshots" },
            { id: "mm2", label: "MM2" },
            { id: "pressure", label: "Pressure" },
            { id: "demonology", label: "Demonology" },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? "bg-[#1c1c24] text-white border border-[#2f2f3c] font-semibold shadow-sm"
                    : "bg-[#0e0e12] text-zinc-400 border border-[#1e1e24] hover:text-zinc-200 hover:border-[#282832]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedImage(item)}
                className="group rounded-xl bg-[#0e0e12] border border-[#1e1e24] hover:border-[#2f2f3c] overflow-hidden cursor-pointer transition-all shadow-lg flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-black">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-zinc-700/80 backdrop-blur-md">
                    <Icon className="w-3 h-3 text-zinc-300" />
                    <span className="text-[10px] font-mono font-medium text-white">
                      {item.game}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900/90 border border-zinc-700/70 px-2 py-0.5 rounded">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0e0e12]">
                  <h3 className="text-xs font-bold text-white mb-1 group-hover:text-zinc-200">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-3xl w-full bg-[#0e0e12] border border-[#24242c] rounded-2xl overflow-hidden shadow-2xl"
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/80 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="aspect-video w-full bg-black flex items-center justify-center">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4 bg-[#0a0a0d] border-t border-[#1c1c24] flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {selectedImage.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {selectedImage.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      document.getElementById("script")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200"
                  >
                    Copy Script
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
