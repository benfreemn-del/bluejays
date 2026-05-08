"use client";

/**
 * EmberCanvas — pointer-reactive particle layer for the Nevarland
 * Outpost hero. Embers drift up like sparks off a heat-press, mouse
 * movement creates a subtle wind that pushes them sideways. Touch
 * works the same way on mobile.
 *
 * Pure canvas2d, no deps. Render loop pauses when the tab is hidden
 * so it doesn't burn battery. ~60 particles on desktop, ~30 on
 * mobile (auto-detected by viewport width).
 *
 * Color palette stays in the brand: warm rust → orange embers,
 * faintly glowing. Background lit so they read against the near-
 * black hero without overpowering the typography.
 */

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
};

export default function EmberCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particleCount = 60;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Lower count on narrow viewports to keep mobile smooth.
      particleCount = width < 700 ? 30 : 60;
    };

    const spawn = (atY?: number): Particle => {
      const maxLife = 260 + Math.random() * 180;
      return {
        x: Math.random() * width,
        y: atY ?? height + Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.4 + Math.random() * 0.7),
        size: 1 + Math.random() * 2.5,
        life: 0,
        maxLife,
        hue: 14 + Math.random() * 18, // 14-32 → orange/rust band
      };
    };

    const seed = () => {
      particlesRef.current = Array.from({ length: particleCount }, () =>
        spawn(Math.random() * height),
      );
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      const list = particlesRef.current;
      const ptr = pointerRef.current;

      for (let i = 0; i < list.length; i++) {
        const p = list[i];

        // Mouse wind — gentle push proportional to inverse distance.
        if (ptr.active) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const force = (1 - Math.sqrt(d2) / 110) * 0.18;
            p.vx += (dx / Math.max(Math.sqrt(d2), 1)) * force;
            p.vy += (dy / Math.max(Math.sqrt(d2), 1)) * force * 0.4;
          }
        }

        // Lazy upward drift + horizontal jitter to feel like rising heat.
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.01 - 0.005;
        // Damping so embers don't accelerate forever.
        p.vx *= 0.97;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Wrap edges horizontally; respawn at bottom when life expires
        // OR when ember floats off the top.
        if (p.life > p.maxLife || p.y < -10) {
          list[i] = spawn();
          continue;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Fade in over first 60 ticks, fade out over last 60.
        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = Math.min((p.maxLife - p.life) / 80, 1);
        const alpha = Math.min(fadeIn, fadeOut) * 0.85;

        // Glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 65%, ${alpha})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, 80%, 50%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core ember
        ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    resize();
    seed();
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    // Listen on window so pointer events still pass through to the
    // CTA buttons sitting above the canvas. We translate the global
    // pointer to canvas-local coords inside onPointer.
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      // pointer-events-none so clicks fall through to the CTA buttons.
      // Pointer position is read from window pointermove + translated
      // to canvas-local coords in JS.
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
