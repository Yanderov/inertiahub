"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      if (cursorRef.current) {
        // Direct zero-latency hardware transform
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], input, select, textarea, .cursor-pointer"
      );
      setIsHovering(!!target);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform -translate-x-1/2 -translate-y-1/2"
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      {/* Precision Crisp Inner Dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-transform duration-100 ease-out ${
          isClicked ? "scale-75" : isHovering ? "scale-150" : "scale-100"
        }`}
      />
      {/* Precision Hover Ring (Locked to pointer position, no floaty lag) */}
      <div
        className={`absolute -inset-2.5 rounded-full border border-white/40 transition-all duration-150 ease-out ${
          isHovering
            ? "scale-125 border-white/80 bg-white/10 opacity-100"
            : isClicked
            ? "scale-90 border-white opacity-90"
            : "scale-0 opacity-0"
        }`}
      />
    </div>
  );
}
