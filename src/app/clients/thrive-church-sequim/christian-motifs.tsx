/**
 * ChristianMotifs — soft scattered decorative SVGs for Thrive Church
 * cream sections. Cross + ichthys (Jesus fish) + wheat sprig + dove +
 * small heart. Rendered at ~6-8% opacity so they read as a subtle
 * watermark layer, not loud decoration. Each section can pick a
 * `variant` to vary the set + placement so the page doesn't repeat.
 *
 * Usage:
 *   <section className="relative ...">
 *     <ChristianMotifs variant="left" />
 *     ...rest of section...
 *   </section>
 */

type Variant = "left" | "right" | "scatter" | "corners";

type Props = {
  variant?: Variant;
  /** Override the base opacity (default 0.07 — keep low). */
  opacity?: number;
  /** Color override (default deep teal). */
  color?: string;
};

const DEFAULT_COLOR = "#0d4f4a";

export default function ChristianMotifs({
  variant = "scatter",
  opacity = 0.07,
  color = DEFAULT_COLOR,
}: Props) {
  const motifs = layouts[variant];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ color }}
    >
      {motifs.map((m, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: m.top,
            left: m.left,
            right: m.right,
            bottom: m.bottom,
            width: m.size,
            height: m.size,
            transform: m.rotate ? `rotate(${m.rotate}deg)` : undefined,
            opacity: opacity * (m.weight ?? 1),
          }}
        >
          {iconFor(m.icon)}
        </span>
      ))}
    </div>
  );
}

type Motif = {
  icon: "cross" | "ichthys" | "wheat" | "dove" | "heart" | "sun";
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
  /** Multiplied against the base opacity for per-motif strength. */
  weight?: number;
};

const layouts: Record<Variant, Motif[]> = {
  left: [
    { icon: "cross", size: 48, top: "12%", left: "4%", rotate: -8 },
    { icon: "ichthys", size: 56, top: "62%", left: "6%", rotate: 6 },
    { icon: "wheat", size: 40, top: "82%", left: "12%", rotate: -14 },
  ],
  right: [
    { icon: "cross", size: 44, top: "16%", right: "5%", rotate: 9 },
    { icon: "dove", size: 52, top: "55%", right: "9%", rotate: -6 },
    { icon: "heart", size: 32, top: "78%", right: "14%", weight: 0.85 },
  ],
  scatter: [
    { icon: "cross", size: 36, top: "9%", left: "8%", rotate: -10, weight: 0.9 },
    { icon: "ichthys", size: 44, top: "22%", right: "12%", rotate: 8 },
    { icon: "wheat", size: 38, top: "48%", left: "5%", rotate: -16, weight: 0.85 },
    { icon: "dove", size: 46, top: "58%", right: "8%", rotate: 4 },
    { icon: "heart", size: 28, top: "78%", left: "18%", weight: 0.7 },
    { icon: "cross", size: 30, bottom: "10%", right: "16%", rotate: 12, weight: 0.85 },
  ],
  corners: [
    { icon: "cross", size: 56, top: "8%", left: "5%", rotate: -6 },
    { icon: "ichthys", size: 60, bottom: "10%", right: "5%", rotate: 4 },
  ],
};

function iconFor(name: Motif["icon"]) {
  switch (name) {
    case "cross":
      return <CrossIcon />;
    case "ichthys":
      return <IchthysIcon />;
    case "wheat":
      return <WheatIcon />;
    case "dove":
      return <DoveIcon />;
    case "heart":
      return <HeartIcon />;
    case "sun":
      return <SunIcon />;
  }
}

/* ────────── individual SVGs ────────── */

function CrossIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
      <rect x="20" y="4" width="8" height="40" rx="1.5" />
      <rect x="8" y="16" width="32" height="8" rx="1.5" />
    </svg>
  );
}

/** Ichthys (Jesus fish) — early-church symbol, two simple arcs. */
function IchthysIcon() {
  return (
    <svg viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-full w-full">
      <path d="M4 16 Q20 -4, 44 16" />
      <path d="M4 16 Q20 36, 44 16" />
      {/* Tail crossover */}
      <path d="M44 16 L60 4" />
      <path d="M44 16 L60 28" />
    </svg>
  );
}

/** Wheat sprig — bread of life. */
function WheatIcon() {
  return (
    <svg viewBox="0 0 48 64" fill="currentColor" className="h-full w-full">
      {/* Stalk */}
      <rect x="22" y="20" width="3" height="44" rx="1.5" />
      {/* Grain pairs left/right */}
      {[8, 16, 24, 32, 40].map((y) => (
        <g key={y}>
          <ellipse cx="14" cy={y} rx="6" ry="3" transform={`rotate(-22 14 ${y})`} />
          <ellipse cx="33" cy={y} rx="6" ry="3" transform={`rotate(22 33 ${y})`} />
        </g>
      ))}
      {/* Top single grain */}
      <ellipse cx="23.5" cy="6" rx="3" ry="5" />
    </svg>
  );
}

/** Stylized dove — peace, Holy Spirit. */
function DoveIcon() {
  return (
    <svg viewBox="0 0 64 48" fill="currentColor" className="h-full w-full">
      {/* Body */}
      <path d="M10 28 Q22 14, 38 18 Q50 22, 56 30 Q44 32, 32 32 Q20 32, 10 28 Z" />
      {/* Wing curve */}
      <path d="M22 22 Q28 8, 38 18 Q32 20, 26 24 Z" fill="currentColor" opacity="0.85" />
      {/* Head dot */}
      <circle cx="54" cy="26" r="3" />
      {/* Beak */}
      <path d="M57 26 L62 25 L57 28 Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className="h-full w-full">
      <path d="M16 28 C 4 20, 2 12, 8 7 C 12 4, 16 8, 16 12 C 16 8, 20 4, 24 7 C 30 12, 28 20, 16 28 Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
      <circle cx="24" cy="24" r="8" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="22"
          y="4"
          width="4"
          height="8"
          rx="1.5"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}
