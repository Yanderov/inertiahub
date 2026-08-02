"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundFX } from "@/lib/audio";

export default function SoundController() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(soundFX.isEnabled());

    // Global listener for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [role='button'], input, select, textarea, .interactive-hover");
      if (target) {
        soundFX.playHover();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [role='button'], .interactive-click");
      if (target) {
        soundFX.playClick();
      }
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleToggle = () => {
    const newState = soundFX.toggleSound();
    setEnabled(newState);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={handleToggle}
        aria-label="Toggle Sound Effects"
        title={enabled ? "Sound FX Enabled (Click to Mute)" : "Sound FX Muted (Click to Enable)"}
        className="p-2.5 rounded-full bg-surface-elevated/80 hover:bg-surface-elevated border border-border/80 text-foreground-muted hover:text-foreground shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 group flex items-center gap-2"
      >
        {enabled ? (
          <Volume2 className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
        ) : (
          <VolumeX className="w-4 h-4 text-foreground-muted/60" />
        )}
        <span className="hidden group-hover:inline text-[11px] font-semibold pr-1 text-foreground-subtle transition-all">
          {enabled ? "SFX On" : "SFX Muted"}
        </span>
      </button>
    </div>
  );
}
