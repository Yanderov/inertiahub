"use client";

import { useEffect, useRef } from "react";

export default function DynamicGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const update = () => {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;

      container.style.setProperty("--mouse-x", `${currentX}px`);
      container.style.setProperty("--mouse-y", `${currentY}px`);

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
      style={
        {
          "--mouse-x": "50vw",
          "--mouse-y": "50vh",
        } as React.CSSProperties
      }
    >
      {/* Dense Checkered Grid (20px cells) */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Dynamic Mouse-Following Subtle Monochrome Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 80%)`,
        }}
      />

      {/* Soft Vignette Mask around viewport edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
