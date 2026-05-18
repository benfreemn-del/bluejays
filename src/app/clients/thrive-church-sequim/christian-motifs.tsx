/**
 * ChristianMotifs — warm, visible decorative SVGs for Thrive Church
 * cream sections. Four motifs total per Ben's brief (2026-05-18):
 *   cross · ichthys (Jesus fish) · bread (communion loaf) · dove
 *
 * Visible and colorful — not whisper-quiet watermark anymore. Each
 * motif gets its own warm color (teal, amber, bread-tan, dove-blue)
 * with a softer drop shadow so they read as deliberate decoration,
 * not a faint texture.
 *
 * Variants control placement so different sections look unique.
 *
 * Usage:
 *   <section className="relative overflow-hidden ...">
 *     <ChristianMotifs variant="scatter" />
 *     ...content...
 *   </section>
 */

type Variant = "left" | "right" | "scatter" | "corners";

type Props = {
  variant?: Variant;
  /** Override the base opacity (default 0.18 — visible but not loud). */
  opacity?: number;
};

const TEAL = "#0d4f4a";
const AMBER = "#d97706";
const BREAD = "#c2782e";
const DOVE = "#5b9cf6";

export default function ChristianMotifs({
  variant = "scatter",
  opacity = 0.18,
}: Props) {
  const motifs = layouts[variant];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
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
            color: m.color ?? TEAL,
            filter: "drop-shadow(0 6px 18px rgba(13, 79, 74, 0.18))",
          }}
        >
          {iconFor(m.icon)}
        </span>
      ))}
    </div>
  );
}

type Motif = {
  icon: "cross" | "ichthys" | "bread" | "dove";
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
  weight?: number;
  color?: string;
};

const layouts: Record<Variant, Motif[]> = {
  // Long cream sections — 5 motifs scattered with breathing room.
  scatter: [
    { icon: "cross", size: 120, top: "8%", left: "6%", rotate: -8, color: TEAL },
    { icon: "ichthys", size: 140, top: "26%", right: "8%", rotate: 6, color: AMBER },
    { icon: "bread", size: 110, top: "58%", left: "10%", rotate: -12, color: BREAD },
    { icon: "dove", size: 130, top: "72%", right: "12%", rotate: 4, color: DOVE, weight: 0.85 },
    { icon: "cross", size: 80, bottom: "8%", left: "30%", rotate: 14, color: AMBER, weight: 0.75 },
  ],
  // Asymmetric — most weight on left half.
  left: [
    { icon: "cross", size: 130, top: "10%", left: "4%", rotate: -6, color: TEAL },
    { icon: "bread", size: 120, top: "44%", left: "8%", rotate: 8, color: BREAD },
    { icon: "ichthys", size: 100, bottom: "12%", left: "16%", rotate: -10, color: AMBER, weight: 0.85 },
  ],
  // Asymmetric — most weight on right half.
  right: [
    { icon: "ichthys", size: 140, top: "12%", right: "5%", rotate: 8, color: AMBER },
    { icon: "dove", size: 120, top: "48%", right: "9%", rotate: -4, color: DOVE },
    { icon: "cross", size: 90, bottom: "14%", right: "18%", rotate: 12, color: TEAL, weight: 0.8 },
  ],
  // Two anchor motifs in opposite corners — for shorter sections.
  corners: [
    { icon: "cross", size: 130, top: "10%", left: "5%", rotate: -6, color: TEAL },
    { icon: "ichthys", size: 140, bottom: "10%", right: "5%", rotate: 4, color: AMBER },
  ],
};

function iconFor(name: Motif["icon"]) {
  switch (name) {
    case "cross":
      return <CrossIcon />;
    case "ichthys":
      return <IchthysIcon />;
    case "bread":
      return <BreadIcon />;
    case "dove":
      return <DoveIcon />;
  }
}

/* ────────── individual SVGs ────────── */

/** Latin cross. Bold, simple. */
function CrossIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
      <rect x="20" y="3" width="8" height="42" rx="1.5" />
      <rect x="7" y="16" width="34" height="8" rx="1.5" />
    </svg>
  );
}

/** Ichthys (Jesus fish) — bold strokes, classic early-church mark. */
function IchthysIcon() {
  return (
    <svg
      viewBox="0 0 72 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      <path d="M4 16 Q22 -2, 48 16 Q22 34, 4 16 Z" />
      <path d="M48 16 L68 4" />
      <path d="M48 16 L68 28" />
    </svg>
  );
}

/** Bread — communion loaf with scored cross on top. */
function BreadIcon() {
  return (
    <svg viewBox="0 0 64 48" fill="currentColor" className="h-full w-full">
      {/* Loaf body */}
      <path d="M8 24 Q8 10, 22 8 Q32 6, 42 8 Q56 10, 56 24 L56 40 Q56 42, 54 42 L10 42 Q8 42, 8 40 Z" />
      {/* Top crust highlight (slight lighter wash) */}
      <path
        d="M8 24 Q8 10, 22 8 Q32 6, 42 8 Q56 10, 56 24 L56 28 L8 28 Z"
        fill="white"
        opacity="0.15"
      />
      {/* Scored cross on top */}
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="32" y1="12" x2="32" y2="28" />
      </g>
    </svg>
  );
}

/** Stylized dove — peace / Holy Spirit. */
function DoveIcon() {
  return (
    <svg viewBox="0 0 72 48" fill="currentColor" className="h-full w-full">
      {/* Body */}
      <path d="M8 32 Q22 14, 42 18 Q56 22, 64 32 Q48 34, 32 34 Q18 34, 8 32 Z" />
      {/* Upper wing — lifted, layered */}
      <path
        d="M22 22 Q30 4, 44 16 Q34 22, 26 26 Z"
        fill="currentColor"
        opacity="0.78"
      />
      {/* Lower wing */}
      <path
        d="M28 30 Q34 38, 50 32 Q40 32, 30 30 Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Head */}
      <circle cx="60" cy="28" r="4" />
      {/* Beak */}
      <path d="M64 28 L70 26 L64 31 Z" />
      {/* Olive branch sprig */}
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M58 32 L52 40" />
        <ellipse cx="54" cy="36" rx="2.2" ry="1" transform="rotate(-50 54 36)" fill="currentColor" />
        <ellipse cx="55.5" cy="33" rx="2.2" ry="1" transform="rotate(-50 55.5 33)" fill="currentColor" />
      </g>
    </svg>
  );
}
