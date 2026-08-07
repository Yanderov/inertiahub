"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crosshair, Compass, Ghost, ZoomIn } from "lucide-react";

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Live In-Game Captures
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Visual Demonstration
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Captured directly on live Roblox production instances.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#111113] p-1 rounded-xl border border-zinc-800 backdrop-blur-md">
            {[
              { id: "all", label: "All Games" },
              { id: "mm2", label: "MM2" },
              { id: "pressure", label: "Pressure" },
              { id: "demonology", label: "Demonology" },
            ].map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative px-3 py-1 rounded-lg text-xs font-medium transition-all select-none cursor-pointer ${
                    isSelected ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeGalleryFilterTab"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#222226] border border-zinc-700/80 rounded-lg shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="group relative rounded-2xl overflow-hidden bg-[#111113] border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg flex flex-col justify-between"
              >
                {/* Image Container */}
                <div
                  onClick={() => setSelectedImage(item)}
                  className="relative aspect-video w-full overflow-hidden cursor-pointer bg-[#070709]"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent opacity-80" />
                  
                  {/* Overlay button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold shadow-lg">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Expand
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/80 backdrop-blur-md text-white border border-zinc-700">
                      <Icon className="w-3 h-3 text-zinc-300" />
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#111113] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#141417]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">
                    {selectedImage.title}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {selectedImage.game}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Image */}
              <div className="p-3 bg-[#070709] flex items-center justify-center">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow-inner"
                />
              </div>

              {/* Footer info */}
              <div className="p-4 border-t border-zinc-800 bg-[#141417] flex items-center justify-between">
                <p className="text-xs text-zinc-300">
                  {selectedImage.desc}
                </p>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shrink-0 ml-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
