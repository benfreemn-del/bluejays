"use client";

/**
 * ScrollProgress — a thin gradient bar at the very top of the page
 * that fills as the visitor scrolls through the site. Uses the
 * AIOS brand palette (moss → copper) so it reads as a unique
 * detail, not a generic "scroll progress" indicator.
 *
 * Sits at z-[60] (above sticky nav z-50) so it always shows.
 * Hidden on prefers-reduced-motion is NOT enforced — this is a
 * subtle progress signal, not an animation.
 */

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = h.scrollHeight - h.clientHeight;
      const next = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setPct(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] pointer-events-none"
      aria-hidden="true"
    >
      {/* Track — barely visible */}
      <div
        className="h-[3px]"
        style={{
          background: "rgba(26, 22, 18, 0.06)",
        }}
      />
      {/* Fill — moss → copper gradient, anchored top */}
      <div
        className="absolute top-0 left-0 h-[3px] transition-[width] duration-150 ease-out"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, #2d4a35 0%, #3d6b48 30%, #d97706 70%, #fbbf24 100%)",
          boxShadow: "0 0 8px rgba(217, 119, 6, 0.4)",
        }}
      />
    </div>
  );
}
