"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GRADIENT =
  "linear-gradient(to right, #3b82f6, #8b5cf6, #10b981, #eab308)";

// Hide on operator/dashboard routes — no need there
const HIDE_PATTERNS = [
  /^\/dashboard/,
  /^\/lead\//,
  /^\/image-mapper/,
  /^\/preview-device/,
  /^\/spending/,
  /^\/test-cohort/,
];

export default function ScrollProgressBar() {
  const pathname = usePathname() || "/";
  const barRef = useRef<HTMLDivElement>(null);

  const hidden = HIDE_PATTERNS.some((rx) => rx.test(pathname));

  useEffect(() => {
    if (hidden) return;
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar!.style.transform = `scaleX(${Math.min(1, Math.max(0, scrolled))})`;
      ticking = false;
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => document.removeEventListener("scroll", onScroll);
  }, [hidden, pathname]);

  if (hidden) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{ transform: "scaleX(0)", background: GRADIENT }}
      />
    </div>
  );
}
