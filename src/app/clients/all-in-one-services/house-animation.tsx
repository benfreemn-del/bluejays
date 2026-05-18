"use client";

/**
 * HouseAnimation — a 2-story craftsman cottage that draws itself
 * piece-by-piece on first viewport entry, then loops smoke from
 * the chimney forever. Desktop-only feature (hidden on mobile by
 * the consumer via Tailwind `hidden lg:block`).
 *
 * Visual reference: a Studio Ghibli-style cottage at golden hour.
 * Warm cream walls, deep moss roof, lit windows, smoke rising. A
 * tiny narrative — "we build the home you live in" — without a
 * single word.
 *
 * Animation timeline (~3.5s total):
 *   0.20s  Grass strip slides up from bottom
 *   0.50s  House body grows up from foundation
 *   1.00s  Roof drops in from above
 *   1.30s  Chimney slides in from sky
 *   1.50s  Door appears
 *   1.70s  Windows pop in (staggered)
 *   2.20s  Lights fade on inside windows (golden glow)
 *   2.60s  Fence pickets cascade in left to right
 *   3.00s  Smoke wisps start rising (LOOP forever)
 *
 * Color tokens hard-coded to the PNW Heritage palette so the
 * scene reads on either Paper or Stone section backgrounds.
 */

import { motion } from "framer-motion";

// PNW Heritage palette (matches page.tsx)
const MOSS = "#2d4a35";         // roof, grass, trim
const MOSS_LIGHT = "#3d6b48";   // grass highlight, gradient
const MOSS_DEEP = "#1f3525";    // roof shadow
const WARM_WALL = "#e8d4a0";    // craftsman warm sand walls
const WARM_WALL_SHADOW = "#c7b483";
const CREAM = "#faf6ed";        // trim, window frames
const COPPER = "#b45309";       // door
const COPPER_LIGHT = "#d97706";
const BRICK = "#8b5a3c";        // chimney
const BRICK_LIGHT = "#a06d4a";
const GLOW = "#fbbf24";         // lit windows + sun
const SKY_HAZE = "#ffffff";     // smoke (pops against blue)

// Sky palette — golden-hour PNW morning, blends with cream horizon
const SKY_TOP = "#7fb3d4";      // soft blue at the top
const SKY_MID = "#b4d4e3";      // pale sky
const SKY_HORIZON = "#fde7c1";  // warm peach glow above horizon
const SUN_CORE = "#fcd34d";     // warm yellow
const SUN_HALO = "#fde68a";     // soft outer halo
const CLOUD = "#ffffff";        // tiny puffy clouds

export default function HouseAnimation() {
  return (
    <div className="relative w-full" aria-hidden="true">
      <svg
        viewBox="0 0 600 460"
        className="w-full h-auto block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Gradient defs ── */}
        <defs>
          {/* Sky — soft blue → pale → peach horizon */}
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SKY_TOP} />
            <stop offset="50%" stopColor={SKY_MID} />
            <stop offset="88%" stopColor={SKY_HORIZON} />
            <stop offset="100%" stopColor={CREAM} />
          </linearGradient>
          {/* Sun — bright core fading to warm halo */}
          <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor={SUN_CORE} />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SUN_HALO} stopOpacity="0.6" />
            <stop offset="60%" stopColor={SUN_HALO} stopOpacity="0.2" />
            <stop offset="100%" stopColor={SUN_HALO} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roof-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MOSS_LIGHT} />
            <stop offset="100%" stopColor={MOSS_DEEP} />
          </linearGradient>
          <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={WARM_WALL} />
            <stop offset="100%" stopColor={WARM_WALL_SHADOW} />
          </linearGradient>
          <linearGradient id="grass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MOSS_LIGHT} />
            <stop offset="100%" stopColor={MOSS} />
          </linearGradient>
          <linearGradient id="chimney-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRICK_LIGHT} />
            <stop offset="100%" stopColor={BRICK} />
          </linearGradient>
          <linearGradient id="door-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COPPER_LIGHT} />
            <stop offset="100%" stopColor={COPPER} />
          </linearGradient>
          <radialGradient id="window-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={GLOW} stopOpacity="0.95" />
            <stop offset="100%" stopColor={GLOW} stopOpacity="0.4" />
          </radialGradient>
          {/* Slight blur for smoke */}
          <filter id="smoke-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* ── SKY ── fades in first, sets the dawn-light mood ── */}
        <motion.rect
          x="0"
          y="0"
          width="600"
          height="400"
          fill="url(#sky-grad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.05 }}
        />

        {/* ── SUN ── rises from below the horizon during the build ── */}
        {/* Outer halo (soft glow) */}
        <motion.circle
          r="65"
          fill="url(#sun-halo)"
          initial={{ cx: 440, cy: 420, opacity: 0 }}
          animate={{ cx: 440, cy: 130, opacity: 0.85 }}
          transition={{ duration: 2.5, delay: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
        />
        {/* Sun core — bright disc */}
        <motion.circle
          r="22"
          fill="url(#sun-grad)"
          initial={{ cx: 440, cy: 420, opacity: 0 }}
          animate={{ cx: 440, cy: 130, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
        />
        {/* Soft inner highlight on sun */}
        <motion.circle
          r="10"
          fill="#fef9c3"
          initial={{ cx: 434, cy: 420, opacity: 0 }}
          animate={{ cx: 434, cy: 124, opacity: 0.7 }}
          transition={{ duration: 2.5, delay: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
        />

        {/* ── CLOUDS ── tiny puffy clouds drifting slowly across the sky ── */}
        {/* Cloud 1 — left side, mid sky */}
        <motion.g
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        >
          <motion.g
            animate={{ x: [0, 25, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="90" cy="110" rx="22" ry="10" fill={CLOUD} opacity="0.9" />
            <ellipse cx="78" cy="106" rx="13" ry="8" fill={CLOUD} opacity="0.85" />
            <ellipse cx="103" cy="106" rx="14" ry="8" fill={CLOUD} opacity="0.85" />
            <ellipse cx="90" cy="100" rx="11" ry="7" fill={CLOUD} opacity="0.9" />
          </motion.g>
        </motion.g>
        {/* Cloud 2 — center-left, higher up */}
        <motion.g
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 1.2, delay: 1.4 }}
        >
          <motion.g
            animate={{ x: [0, 35, 0] }}
            transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="220" cy="60" rx="18" ry="8" fill={CLOUD} opacity="0.85" />
            <ellipse cx="210" cy="57" rx="11" ry="7" fill={CLOUD} opacity="0.85" />
            <ellipse cx="230" cy="57" rx="12" ry="7" fill={CLOUD} opacity="0.85" />
          </motion.g>
        </motion.g>
        {/* Cloud 3 — right side, low (near sun) */}
        <motion.g
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ duration: 1.2, delay: 1.6 }}
        >
          <motion.g
            animate={{ x: [0, -22, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="520" cy="175" rx="20" ry="9" fill={CLOUD} opacity="0.88" />
            <ellipse cx="508" cy="172" rx="12" ry="7" fill={CLOUD} opacity="0.85" />
            <ellipse cx="532" cy="172" rx="13" ry="7" fill={CLOUD} opacity="0.85" />
            <ellipse cx="520" cy="167" rx="10" ry="6" fill={CLOUD} opacity="0.88" />
          </motion.g>
        </motion.g>
        {/* Cloud 4 — far-right, small + high */}
        <motion.g
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 1.2, delay: 1.8 }}
        >
          <motion.g
            animate={{ x: [0, -30, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="380" cy="40" rx="14" ry="6" fill={CLOUD} opacity="0.8" />
            <ellipse cx="372" cy="38" rx="9" ry="5" fill={CLOUD} opacity="0.8" />
            <ellipse cx="388" cy="38" rx="9" ry="5" fill={CLOUD} opacity="0.8" />
          </motion.g>
        </motion.g>

        {/* ── Soft ambient glow under house (always present, subtle) ── */}
        <ellipse
          cx="300"
          cy="400"
          rx="240"
          ry="14"
          fill={MOSS}
          opacity="0.08"
        />

        {/* ── GRASS ── slides up from bottom ── */}
        <motion.rect
          x="0"
          y="0"
          width="600"
          height="60"
          fill="url(#grass-grad)"
          initial={{ y: 460 }}
          animate={{ y: 400 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        />
        {/* Grass tufts — tiny decorative spikes */}
        {[40, 100, 170, 250, 350, 440, 510, 560].map((x, i) => (
          <motion.path
            key={`tuft-${i}`}
            d={`M ${x} 402 q 2 -6 4 0 M ${x + 5} 402 q 2 -8 4 0 M ${x + 11} 402 q 2 -5 4 0`}
            stroke={MOSS_DEEP}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.04 }}
          />
        ))}

        {/* ── HOUSE BODY ── grows from foundation ── */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "300px 400px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        >
          {/* Main 2-story rectangle */}
          <rect
            x="180"
            y="170"
            width="240"
            height="230"
            fill="url(#wall-grad)"
          />
          {/* Mid-floor band (separates story 1 from story 2) */}
          <rect x="178" y="278" width="244" height="6" fill={CREAM} />
          {/* Lower foundation line */}
          <rect x="172" y="396" width="256" height="6" fill={MOSS_DEEP} />
        </motion.g>

        {/* ── ROOF ── drops in from above ── */}
        <motion.g
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.34, 1.4, 0.64, 1] }}
        >
          {/* Main roof triangle */}
          <polygon
            points="155,180 300,75 445,180"
            fill="url(#roof-grad)"
          />
          {/* Roof eave shadow strip */}
          <polygon
            points="155,180 300,75 445,180 445,188 300,83 155,188"
            fill={MOSS_DEEP}
            opacity="0.6"
          />
          {/* Decorative roof peak ornament — small dormer triangle */}
          <polygon
            points="285,108 300,92 315,108 315,128 285,128"
            fill={WARM_WALL}
          />
          <polygon
            points="285,108 300,92 315,108"
            fill={MOSS_DEEP}
            opacity="0.7"
          />
          {/* Tiny dormer window */}
          <rect x="293" y="114" width="14" height="12" fill={CREAM} stroke={MOSS} strokeWidth="1" />
          <line x1="300" y1="114" x2="300" y2="126" stroke={MOSS} strokeWidth="1" />
        </motion.g>

        {/* ── CHIMNEY ── slides down ── */}
        <motion.g
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
        >
          <rect x="368" y="92" width="32" height="68" fill="url(#chimney-grad)" />
          {/* Chimney cap */}
          <rect x="362" y="88" width="44" height="8" fill={MOSS_DEEP} />
          {/* Brick texture suggestion */}
          <line x1="368" y1="108" x2="400" y2="108" stroke={BRICK} strokeWidth="0.8" opacity="0.7" />
          <line x1="368" y1="124" x2="400" y2="124" stroke={BRICK} strokeWidth="0.8" opacity="0.7" />
          <line x1="368" y1="140" x2="400" y2="140" stroke={BRICK} strokeWidth="0.8" opacity="0.7" />
          <line x1="384" y1="96" x2="384" y2="160" stroke={BRICK} strokeWidth="0.6" opacity="0.5" />
        </motion.g>

        {/* ── DOOR ── grows up ── */}
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{ transformOrigin: "300px 396px" }}
          transition={{ duration: 0.5, delay: 1.5, ease: "easeOut" }}
        >
          {/* Door frame */}
          <rect x="276" y="312" width="48" height="84" fill={CREAM} />
          {/* Door panel */}
          <rect x="280" y="316" width="40" height="80" fill="url(#door-grad)" />
          {/* Door inset detail */}
          <rect x="285" y="323" width="30" height="32" fill="none" stroke={COPPER} strokeWidth="1" opacity="0.5" />
          <rect x="285" y="362" width="30" height="28" fill="none" stroke={COPPER} strokeWidth="1" opacity="0.5" />
          {/* Doorknob */}
          <circle cx="312" cy="356" r="2.2" fill={GLOW} />
          {/* Door step */}
          <rect x="266" y="396" width="68" height="6" fill={MOSS_DEEP} />
        </motion.g>

        {/* ── WINDOWS ── (4 total, staggered pop-in) ── */}
        {/* Upper-left window */}
        <Window x={210} y={200} delay={1.7} glowDelay={2.2} />
        {/* Upper-right window */}
        <Window x={345} y={200} delay={1.78} glowDelay={2.28} />
        {/* Lower-left window */}
        <Window x={210} y={310} delay={1.86} glowDelay={2.36} />
        {/* Lower-right window */}
        <Window x={345} y={310} delay={1.94} glowDelay={2.44} />

        {/* ── FENCE ── pickets cascade in left to right ── */}
        {/* Front lower rail */}
        <motion.rect
          x="20"
          y="384"
          width="140"
          height="4"
          fill={CREAM}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ transformOrigin: "20px 386px" }}
          transition={{ duration: 0.5, delay: 2.5 }}
        />
        <motion.rect
          x="440"
          y="384"
          width="140"
          height="4"
          fill={CREAM}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ transformOrigin: "580px 386px" }}
          transition={{ duration: 0.5, delay: 2.5 }}
        />
        {/* Left-side pickets */}
        {[20, 40, 60, 80, 100, 120, 140].map((x, i) => (
          <motion.g
            key={`pl-${i}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 2.55 + i * 0.04 }}
          >
            <rect x={x} y="362" width="10" height="34" fill={CREAM} />
            {/* Picket point */}
            <polygon
              points={`${x},362 ${x + 5},356 ${x + 10},362`}
              fill={CREAM}
            />
            {/* Subtle shadow */}
            <rect x={x + 7} y="362" width="3" height="34" fill={WARM_WALL_SHADOW} opacity="0.4" />
          </motion.g>
        ))}
        {/* Right-side pickets */}
        {[440, 460, 480, 500, 520, 540, 560].map((x, i) => (
          <motion.g
            key={`pr-${i}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 2.6 + i * 0.04 }}
          >
            <rect x={x} y="362" width="10" height="34" fill={CREAM} />
            <polygon
              points={`${x},362 ${x + 5},356 ${x + 10},362`}
              fill={CREAM}
            />
            <rect x={x + 7} y="362" width="3" height="34" fill={WARM_WALL_SHADOW} opacity="0.4" />
          </motion.g>
        ))}

        {/* ── TREE ── tucked behind left side (decorative) ── */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: "100px 360px" }}
          transition={{ duration: 0.6, delay: 2.4, ease: "easeOut" }}
        >
          {/* Trunk */}
          <rect x="97" y="320" width="6" height="60" fill={MOSS_DEEP} opacity="0.85" />
          {/* Foliage — layered evergreen triangles */}
          <polygon points="80,330 100,260 120,330" fill={MOSS} />
          <polygon points="78,310 100,240 122,310" fill={MOSS_LIGHT} />
          <polygon points="82,280 100,220 118,280" fill={MOSS} />
        </motion.g>

        {/* ── SMOKE ── (LOOP forever after delay) ── */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={`smoke-${i}`}
            cx={384}
            cy={92}
            r={5 + i * 0.5}
            fill={SKY_HAZE}
            filter="url(#smoke-blur)"
            initial={{ opacity: 0 }}
            animate={{
              cy: [92, 60, 28, -10],
              cx: [384, 384 + (i % 2 === 0 ? 8 : -8), 384 + (i % 2 === 0 ? -4 : 12), 384 + (i % 2 === 0 ? 14 : -6)],
              opacity: [0, 0.7, 0.5, 0],
              r: [3, 6, 10, 14],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 3.0 + i * 1.0,
              ease: "easeOut",
            }}
          />
        ))}

        {/* ── PATHWAY ── from door to fence ── */}
        <motion.polygon
          points="290,400 310,400 320,440 280,440"
          fill={WARM_WALL_SHADOW}
          opacity="0.4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.5, delay: 2.7 }}
        />
      </svg>
    </div>
  );
}

/* ── Reusable window with light-on glow ── */
function Window({
  x,
  y,
  delay,
  glowDelay,
}: {
  x: number;
  y: number;
  delay: number;
  glowDelay: number;
}) {
  return (
    <>
      {/* Frame + panes pop in together */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{ transformOrigin: `${x + 22}px ${y + 22}px` }}
        transition={{ duration: 0.35, delay, ease: "easeOut" }}
      >
        {/* Outer cream frame */}
        <rect x={x} y={y} width="44" height="44" fill={CREAM} />
        {/* Glass — starts dark cool, lights up later */}
        <rect x={x + 3} y={y + 3} width="38" height="38" fill="#1c2419" />
        {/* Light glow — starts hidden, fades in */}
        <motion.rect
          x={x + 3}
          y={y + 3}
          width="38"
          height="38"
          fill="url(#window-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: glowDelay, ease: "easeOut" }}
        />
        {/* Mullions — cross-pane detail */}
        <line x1={x + 22} y1={y + 3} x2={x + 22} y2={y + 41} stroke={CREAM} strokeWidth="2.5" />
        <line x1={x + 3} y1={y + 22} x2={x + 41} y2={y + 22} stroke={CREAM} strokeWidth="2.5" />
        {/* Curtain hint — soft inset top */}
        <motion.rect
          x={x + 3}
          y={y + 3}
          width="38"
          height="8"
          fill={WARM_WALL}
          opacity="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: glowDelay + 0.2 }}
        />
        {/* Window sill */}
        <rect x={x - 2} y={y + 44} width="48" height="3" fill={MOSS_DEEP} />
      </motion.g>
    </>
  );
}
