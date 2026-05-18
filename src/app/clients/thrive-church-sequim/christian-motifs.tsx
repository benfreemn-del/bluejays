/**
 * ChristianMotifs — per-section decorative icons for Thrive Church.
 *
 * Lesson learned (Ben, 2026-05-18): my hand-drawn SVGs were rendering
 * as blobs / middle fingers / unrecognizable shapes at low opacity. The
 * fix: use Phosphor's professionally-drawn icons (the same emoji-style
 * silhouettes already used in the nav). They're instantly recognizable
 * and they read great at 15-20% opacity.
 *
 * Per-section variants:
 *   connect       → HandHeart + Heart (welcome / hospitality)
 *   ministries    → Plant + Cross (John 15:5 vine + cross)
 *   beliefs       → Leaf + Anchor + Flame (three tiers)
 *   generosity    → Bread + Fish (feeding miracle)
 *   prayer        → HandsPraying + Flame + Heart (intercession)
 *   visit         → Door + Heart + Dove + Cross (come home)
 *   mission       → Ω + Dove (Christ as fulfillment)
 *   scatter/left/right/corners → original mixed
 */

import {
  Cross,
  Fish,
  Bread,
  Bird,
  HandHeart,
  HandsPraying,
  Heart,
  Flame,
  Anchor,
  DoorOpen,
  Plant,
  Leaf,
} from "@phosphor-icons/react";

type Variant =
  | "connect"
  | "ministries"
  | "beliefs"
  | "generosity"
  | "prayer"
  | "visit"
  | "mission"
  | "scatter"
  | "left"
  | "right"
  | "corners";

type Props = {
  variant?: Variant;
  /** Override the base opacity (default 0.18). */
  opacity?: number;
};

/* Palette */
const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const BREAD = "#c2782e";
const DOVE_BLUE = "#5b9cf6";
const VINE = "#3c8a5a";
const ROSE = "#dc6b6b";

type Icon =
  | "cross"
  | "ichthys"
  | "bread"
  | "dove"
  | "handHeart"
  | "vine"
  | "anchor"
  | "flame"
  | "oliveBranch"
  | "fish"
  | "praisingHands"
  | "door"
  | "heart"
  | "omega";

type Motif = {
  icon: Icon;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
  /** Multiplied against the base opacity. */
  weight?: number;
  /** Color override (default teal). */
  color?: string;
};

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
            filter: "drop-shadow(0 6px 18px rgba(13, 79, 74, 0.15))",
          }}
        >
          {iconFor(m.icon, m.size)}
        </span>
      ))}
    </div>
  );
}

const layouts: Record<Variant, Motif[]> = {
  // ── Per-section bespoke arrangements ────────────────────────────
  connect: [
    { icon: "handHeart", size: 170, top: "18%", left: "4%", rotate: -4, color: TEAL },
    { icon: "heart", size: 60, top: "40%", left: "26%", color: ROSE, weight: 0.85 },
    { icon: "heart", size: 48, bottom: "20%", right: "22%", color: AMBER, weight: 0.75 },
    { icon: "handHeart", size: 150, bottom: "10%", right: "4%", rotate: 8, color: AMBER },
  ],

  ministries: [
    // Vine flowing across the top + cross accents lower
    { icon: "vine", size: 200, top: "4%", left: "2%", rotate: -6, color: VINE },
    { icon: "vine", size: 170, top: "10%", right: "4%", rotate: 12, color: VINE, weight: 0.85 },
    { icon: "cross", size: 80, bottom: "12%", left: "8%", rotate: -10, color: TEAL, weight: 0.8 },
    { icon: "cross", size: 70, bottom: "18%", right: "10%", rotate: 8, color: AMBER, weight: 0.75 },
  ],

  beliefs: [
    // Three-tier symbols
    { icon: "oliveBranch", size: 140, top: "8%", left: "2%", rotate: -8, color: VINE },
    { icon: "anchor", size: 130, top: "42%", right: "4%", rotate: 4, color: TEAL_DEEP },
    { icon: "flame", size: 140, bottom: "8%", left: "16%", color: AMBER },
  ],

  generosity: [
    // Loaves + fishes
    { icon: "bread", size: 170, top: "12%", left: "4%", rotate: -6, color: BREAD },
    { icon: "bread", size: 130, top: "62%", left: "12%", rotate: 8, color: AMBER, weight: 0.85 },
    { icon: "fish", size: 160, top: "20%", right: "6%", rotate: 14, color: DOVE_BLUE },
    { icon: "fish", size: 140, bottom: "16%", right: "16%", rotate: -10, color: TEAL, weight: 0.85 },
  ],

  prayer: [
    { icon: "praisingHands", size: 180, top: "14%", left: "6%", rotate: -4, color: TEAL },
    { icon: "flame", size: 120, top: "20%", right: "10%", color: AMBER },
    { icon: "heart", size: 55, bottom: "20%", left: "32%", color: ROSE, weight: 0.75 },
  ],

  visit: [
    { icon: "door", size: 200, top: "10%", left: "4%", color: TEAL_DEEP },
    { icon: "heart", size: 55, top: "30%", left: "26%", color: AMBER, weight: 0.85 },
    { icon: "cross", size: 90, bottom: "12%", right: "8%", rotate: 6, color: TEAL, weight: 0.85 },
    { icon: "dove", size: 140, top: "18%", right: "6%", rotate: -8, color: DOVE_BLUE, weight: 0.85 },
  ],

  mission: [
    // Single Ω watermark upper-right + dove drifting mid-right (Alpha
    // removed per Ben 2026-05-18).
    { icon: "omega", size: 180, top: "6%", right: "4%", color: AMBER, weight: 0.65 },
    { icon: "dove", size: 120, top: "44%", right: "14%", rotate: -6, color: DOVE_BLUE, weight: 0.85 },
  ],

  // ── Generic layouts ────────────────────────────────
  scatter: [
    { icon: "cross", size: 110, top: "8%", left: "6%", rotate: -8, color: TEAL },
    { icon: "ichthys", size: 130, top: "26%", right: "8%", rotate: 6, color: AMBER },
    { icon: "bread", size: 110, top: "58%", left: "10%", rotate: -12, color: BREAD },
    { icon: "dove", size: 120, top: "72%", right: "12%", rotate: 4, color: DOVE_BLUE, weight: 0.85 },
    { icon: "cross", size: 80, bottom: "8%", left: "30%", rotate: 14, color: AMBER, weight: 0.75 },
  ],
  left: [
    { icon: "cross", size: 120, top: "10%", left: "4%", rotate: -6, color: TEAL },
    { icon: "bread", size: 120, top: "44%", left: "8%", rotate: 8, color: BREAD },
    { icon: "ichthys", size: 100, bottom: "12%", left: "16%", rotate: -10, color: AMBER, weight: 0.85 },
  ],
  right: [
    { icon: "ichthys", size: 130, top: "12%", right: "5%", rotate: 8, color: AMBER },
    { icon: "dove", size: 110, top: "48%", right: "9%", rotate: -4, color: DOVE_BLUE },
    { icon: "cross", size: 90, bottom: "14%", right: "18%", rotate: 12, color: TEAL, weight: 0.8 },
  ],
  corners: [
    { icon: "cross", size: 120, top: "10%", left: "5%", rotate: -6, color: TEAL },
    { icon: "ichthys", size: 130, bottom: "10%", right: "5%", rotate: 4, color: AMBER },
  ],
};

function iconFor(name: Icon, size: number) {
  // Phosphor icons take size in px — we let our parent <span> control
  // the visible size via width/height, but pass size=100% so the icon
  // fills the span.
  const props = { size: "100%" as const, weight: "fill" as const };
  switch (name) {
    case "cross": return <Cross {...props} />;
    case "ichthys": return <Fish {...props} />;
    case "bread": return <Bread {...props} />;
    case "dove": return <Bird {...props} />;
    case "handHeart": return <HandHeart {...props} />;
    case "vine": return <Plant {...props} />;
    case "anchor": return <Anchor {...props} />;
    case "flame": return <Flame {...props} />;
    case "oliveBranch": return <Leaf {...props} />;
    case "fish": return <Fish {...props} />;
    case "praisingHands": return <HandsPraying {...props} />;
    case "door": return <DoorOpen {...props} />;
    case "heart": return <Heart {...props} />;
    case "omega": return <OmegaText size={size} />;
  }
}

/** Greek Omega character — Phosphor doesn't have this so we render it
 *  as the Unicode character at the requested size. Looks like a proper
 *  watermark. */
function OmegaText({ size }: { size: number }) {
  return (
    <span
      style={{
        fontFamily: "'Fraunces', serif",
        fontSize: size * 0.92,
        fontWeight: 600,
        lineHeight: 1,
        color: "currentColor",
      }}
    >
      Ω
    </span>
  );
}
