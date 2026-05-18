/**
 * ChristianMotifs — per-section decorative SVGs for Thrive Church.
 *
 * Each section gets its OWN visual hook so the long cream stretches
 * don't feel uniform. The motifs riff on classic warm/Christ symbolism:
 *
 *   connect       → open hands + small hearts (welcome / hospitality)
 *   ministries    → vine + leaves (John 15:5 "I am the vine")
 *   beliefs       → olive branch / anchor / flame (the three tiers)
 *   generosity    → loaves + fishes (the feeding miracle)
 *   prayer        → praying hands + candle flame (intercession)
 *   visit         → open welcome door + heart (come home)
 *   mission       → large stylized Α + Ω alphabet (alpha + omega watermark)
 *   scatter       → original mixed cross / ichthys / bread / dove set
 *   left / right  → asymmetric mixed scatter
 *   corners       → 2-anchor mixed
 *
 * Default opacity 0.18 (visible, not loud). Each motif gets its own
 * warm color so the section feels alive rather than monochrome.
 */

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
const AMBER_LIGHT = "#fbbf24";
const BREAD = "#c2782e";
const DOVE = "#5b9cf6";
const VINE = "#3c8a5a";
const ROSE = "#dc6b6b";

type Icon =
  | "cross"
  | "ichthys"
  | "bread"
  | "dove"
  | "openHands"
  | "vine"
  | "anchor"
  | "flame"
  | "oliveBranch"
  | "fish"
  | "praisingHands"
  | "candle"
  | "door"
  | "heart"
  | "alpha"
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
          {iconFor(m.icon)}
        </span>
      ))}
    </div>
  );
}

const layouts: Record<Variant, Motif[]> = {
  // ── Per-section bespoke arrangements ────────────────────────────
  connect: [
    { icon: "openHands", size: 200, top: "16%", left: "4%", rotate: -4, color: TEAL },
    { icon: "heart", size: 56, top: "32%", left: "26%", color: ROSE, weight: 0.7 },
    { icon: "heart", size: 42, bottom: "22%", right: "20%", color: AMBER, weight: 0.6 },
    { icon: "openHands", size: 160, bottom: "10%", right: "4%", rotate: 8, color: AMBER },
  ],

  ministries: [
    // Vine flowing across the top from upper-left to upper-right
    { icon: "vine", size: 280, top: "4%", left: "-2%", rotate: -4, color: VINE },
    { icon: "vine", size: 240, top: "20%", right: "-2%", rotate: 12, color: VINE, weight: 0.85 },
    // A few accent crosses lower
    { icon: "cross", size: 70, bottom: "12%", left: "8%", rotate: -10, color: TEAL, weight: 0.75 },
    { icon: "cross", size: 60, bottom: "18%", right: "10%", rotate: 8, color: AMBER, weight: 0.7 },
  ],

  beliefs: [
    // Three tiers — one symbol per: oliveBranch (preferences) / anchor (convictions) / flame (absolutes)
    { icon: "oliveBranch", size: 160, top: "8%", left: "2%", rotate: -8, color: VINE },
    { icon: "anchor", size: 130, top: "42%", right: "4%", rotate: 4, color: TEAL_DEEP },
    { icon: "flame", size: 140, bottom: "8%", left: "16%", rotate: 0, color: AMBER },
  ],

  generosity: [
    // Loaves on one side, fishes on the other — feeding miracle
    { icon: "bread", size: 180, top: "12%", left: "4%", rotate: -6, color: BREAD },
    { icon: "bread", size: 130, top: "62%", left: "12%", rotate: 8, color: AMBER, weight: 0.85 },
    { icon: "fish", size: 160, top: "20%", right: "6%", rotate: 14, color: DOVE },
    { icon: "fish", size: 140, bottom: "16%", right: "16%", rotate: -10, color: TEAL, weight: 0.85 },
  ],

  prayer: [
    { icon: "praisingHands", size: 220, top: "12%", left: "6%", rotate: -4, color: TEAL },
    { icon: "candle", size: 140, top: "20%", right: "10%", color: AMBER },
    { icon: "heart", size: 50, bottom: "18%", left: "32%", color: ROSE, weight: 0.65 },
  ],

  visit: [
    { icon: "door", size: 220, top: "10%", left: "4%", color: TEAL_DEEP },
    { icon: "heart", size: 50, top: "30%", left: "28%", color: AMBER, weight: 0.7 },
    { icon: "cross", size: 80, bottom: "12%", right: "8%", rotate: 6, color: TEAL, weight: 0.8 },
    { icon: "dove", size: 140, top: "18%", right: "6%", rotate: -8, color: DOVE, weight: 0.85 },
  ],

  mission: [
    // Massive watermark Α + Ω anchoring the section corners
    { icon: "alpha", size: 360, top: "4%", left: "1%", color: TEAL, weight: 0.55 },
    { icon: "omega", size: 360, bottom: "4%", right: "1%", color: AMBER, weight: 0.55 },
    { icon: "dove", size: 120, top: "44%", right: "16%", rotate: -6, color: DOVE, weight: 0.85 },
  ],

  // ── Original generic layouts (used by sections that haven't been
  //     given a bespoke variant yet) ────────────────────────────────
  scatter: [
    { icon: "cross", size: 120, top: "8%", left: "6%", rotate: -8, color: TEAL },
    { icon: "ichthys", size: 140, top: "26%", right: "8%", rotate: 6, color: AMBER },
    { icon: "bread", size: 110, top: "58%", left: "10%", rotate: -12, color: BREAD },
    { icon: "dove", size: 130, top: "72%", right: "12%", rotate: 4, color: DOVE, weight: 0.85 },
    { icon: "cross", size: 80, bottom: "8%", left: "30%", rotate: 14, color: AMBER, weight: 0.75 },
  ],
  left: [
    { icon: "cross", size: 130, top: "10%", left: "4%", rotate: -6, color: TEAL },
    { icon: "bread", size: 120, top: "44%", left: "8%", rotate: 8, color: BREAD },
    { icon: "ichthys", size: 100, bottom: "12%", left: "16%", rotate: -10, color: AMBER, weight: 0.85 },
  ],
  right: [
    { icon: "ichthys", size: 140, top: "12%", right: "5%", rotate: 8, color: AMBER },
    { icon: "dove", size: 120, top: "48%", right: "9%", rotate: -4, color: DOVE },
    { icon: "cross", size: 90, bottom: "14%", right: "18%", rotate: 12, color: TEAL, weight: 0.8 },
  ],
  corners: [
    { icon: "cross", size: 130, top: "10%", left: "5%", rotate: -6, color: TEAL },
    { icon: "ichthys", size: 140, bottom: "10%", right: "5%", rotate: 4, color: AMBER },
  ],
};

function iconFor(name: Icon) {
  switch (name) {
    case "cross": return <CrossIcon />;
    case "ichthys": return <IchthysIcon />;
    case "bread": return <BreadIcon />;
    case "dove": return <DoveIcon />;
    case "openHands": return <OpenHandsIcon />;
    case "vine": return <VineIcon />;
    case "anchor": return <AnchorIcon />;
    case "flame": return <FlameIcon />;
    case "oliveBranch": return <OliveBranchIcon />;
    case "fish": return <FishIcon />;
    case "praisingHands": return <PraisingHandsIcon />;
    case "candle": return <CandleIcon />;
    case "door": return <DoorIcon />;
    case "heart": return <HeartIcon />;
    case "alpha": return <AlphaIcon />;
    case "omega": return <OmegaIcon />;
  }
}

/* ────────── individual SVGs ────────── */

function CrossIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className="h-full w-full">
      <rect x="20" y="3" width="8" height="42" rx="1.5" />
      <rect x="7" y="16" width="34" height="8" rx="1.5" />
    </svg>
  );
}

function IchthysIcon() {
  return (
    <svg viewBox="0 0 72 32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M4 16 Q22 -2, 48 16 Q22 34, 4 16 Z" />
      <path d="M48 16 L68 4" />
      <path d="M48 16 L68 28" />
    </svg>
  );
}

function BreadIcon() {
  return (
    <svg viewBox="0 0 64 48" fill="currentColor" className="h-full w-full">
      <path d="M8 24 Q8 10, 22 8 Q32 6, 42 8 Q56 10, 56 24 L56 40 Q56 42, 54 42 L10 42 Q8 42, 8 40 Z" />
      <path d="M8 24 Q8 10, 22 8 Q32 6, 42 8 Q56 10, 56 24 L56 28 L8 28 Z" fill="white" opacity="0.15" />
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
        <line x1="20" y1="20" x2="44" y2="20" />
        <line x1="32" y1="12" x2="32" y2="28" />
      </g>
    </svg>
  );
}

function DoveIcon() {
  return (
    <svg viewBox="0 0 72 48" fill="currentColor" className="h-full w-full">
      <path d="M8 32 Q22 14, 42 18 Q56 22, 64 32 Q48 34, 32 34 Q18 34, 8 32 Z" />
      <path d="M22 22 Q30 4, 44 16 Q34 22, 26 26 Z" fill="currentColor" opacity="0.78" />
      <path d="M28 30 Q34 38, 50 32 Q40 32, 30 30 Z" fill="currentColor" opacity="0.55" />
      <circle cx="60" cy="28" r="4" />
      <path d="M64 28 L70 26 L64 31 Z" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M58 32 L52 40" />
        <ellipse cx="54" cy="36" rx="2.2" ry="1" transform="rotate(-50 54 36)" fill="currentColor" />
        <ellipse cx="55.5" cy="33" rx="2.2" ry="1" transform="rotate(-50 55.5 33)" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Open Hands — two hands reaching toward each other, palms-up. */
function OpenHandsIcon() {
  return (
    <svg viewBox="0 0 96 64" fill="currentColor" className="h-full w-full">
      {/* Left hand — palm + fingers */}
      <path d="M6 44 Q4 28, 14 22 L22 22 L22 14 Q22 10, 26 10 Q30 10, 30 14 L30 22 L34 22 Q38 22, 38 26 L38 36 Q38 50, 26 54 L18 54 Q10 54, 6 48 Z" />
      {/* Right hand — mirrored */}
      <path d="M90 44 Q92 28, 82 22 L74 22 L74 14 Q74 10, 70 10 Q66 10, 66 14 L66 22 L62 22 Q58 22, 58 26 L58 36 Q58 50, 70 54 L78 54 Q86 54, 90 48 Z" />
      {/* Small radiant heart between the hands */}
      <path d="M48 30 C42 25, 41 21, 45 19 Q48 18, 48 21 Q48 18, 51 19 C55 21, 54 25, 48 30 Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

/** Vine + leaves — flowing organic curve with grape clusters. */
function VineIcon() {
  return (
    <svg viewBox="0 0 192 64" fill="currentColor" className="h-full w-full">
      {/* Main vine stem */}
      <path
        d="M4 40 Q40 12, 80 40 T156 40 Q176 30, 188 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaves along the vine */}
      {[
        { cx: 28, cy: 26, r: -25 },
        { cx: 60, cy: 22, r: 15 },
        { cx: 96, cy: 28, r: -20 },
        { cx: 128, cy: 22, r: 10 },
        { cx: 164, cy: 30, r: -15 },
      ].map((leaf, i) => (
        <g key={i} transform={`rotate(${leaf.r} ${leaf.cx} ${leaf.cy})`}>
          <path
            d={`M${leaf.cx} ${leaf.cy - 12} Q${leaf.cx + 12} ${leaf.cy - 4} ${leaf.cx} ${leaf.cy + 4} Q${leaf.cx - 12} ${leaf.cy - 4} ${leaf.cx} ${leaf.cy - 12} Z`}
            fill="currentColor"
            opacity="0.85"
          />
          {/* Leaf vein */}
          <line
            x1={leaf.cx}
            y1={leaf.cy - 12}
            x2={leaf.cx}
            y2={leaf.cy + 4}
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="0.8"
          />
        </g>
      ))}
      {/* Grape cluster */}
      <g transform="translate(80, 46)" opacity="0.85">
        {[
          [0, 0], [-5, 4], [5, 4], [-9, 9], [0, 9], [9, 9], [-4, 14], [4, 14],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

/** Anchor — Hebrews 6:19. */
function AnchorIcon() {
  return (
    <svg viewBox="0 0 64 80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      {/* Ring + crossbar */}
      <circle cx="32" cy="14" r="7" />
      <line x1="32" y1="21" x2="32" y2="64" />
      <line x1="20" y1="28" x2="44" y2="28" />
      {/* Hook curves */}
      <path d="M8 52 Q8 70, 32 70 Q56 70, 56 52" />
      {/* Hook barbs */}
      <path d="M8 52 L4 44" />
      <path d="M8 52 L14 56" />
      <path d="M56 52 L60 44" />
      <path d="M56 52 L50 56" />
    </svg>
  );
}

/** Flame — Holy Spirit / Pentecost. */
function FlameIcon() {
  return (
    <svg viewBox="0 0 48 72" fill="currentColor" className="h-full w-full">
      <path d="M24 4 Q14 22, 14 36 Q14 50, 24 50 Q34 50, 34 36 Q34 22, 24 4 Z" />
      <path d="M24 18 Q18 30, 18 40 Q18 48, 24 48 Q30 48, 30 40 Q30 30, 24 18 Z" fill="white" opacity="0.35" />
      <ellipse cx="24" cy="64" rx="14" ry="3" opacity="0.5" />
    </svg>
  );
}

/** Olive branch — peace. */
function OliveBranchIcon() {
  return (
    <svg viewBox="0 0 96 64" fill="currentColor" className="h-full w-full">
      <path
        d="M4 50 Q40 30, 90 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Olive leaves alternating along the stem */}
      {[
        { cx: 16, cy: 44, r: -30, up: true },
        { cx: 28, cy: 40, r: 30, up: false },
        { cx: 40, cy: 35, r: -30, up: true },
        { cx: 52, cy: 30, r: 30, up: false },
        { cx: 64, cy: 25, r: -30, up: true },
        { cx: 76, cy: 20, r: 30, up: false },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy + (leaf.up ? -8 : 8)}
          rx="9"
          ry="3"
          transform={`rotate(${leaf.r} ${leaf.cx} ${leaf.cy + (leaf.up ? -8 : 8)})`}
          opacity="0.9"
        />
      ))}
      {/* A few olives */}
      <circle cx="32" cy="38" r="2.5" opacity="0.85" />
      <circle cx="56" cy="28" r="2.5" opacity="0.85" />
      <circle cx="80" cy="18" r="2.5" opacity="0.85" />
    </svg>
  );
}

/** Single Fish — feeding-the-5000 motif (paired with bread). */
function FishIcon() {
  return (
    <svg viewBox="0 0 80 36" fill="currentColor" className="h-full w-full">
      {/* Body */}
      <path d="M4 18 Q24 4, 56 18 Q24 32, 4 18 Z" />
      {/* Tail */}
      <path d="M56 18 L74 6 L70 18 L74 30 Z" />
      {/* Eye */}
      <circle cx="22" cy="16" r="2" fill="white" opacity="0.85" />
      {/* Body curve highlight */}
      <path d="M16 12 Q30 8, 50 12" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Gill */}
      <path d="M30 12 Q28 18, 30 24" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5" />
    </svg>
  );
}

/** Praising / Praying hands — two hands lifted with palms together. */
function PraisingHandsIcon() {
  return (
    <svg viewBox="0 0 80 96" fill="currentColor" className="h-full w-full">
      {/* Left hand */}
      <path d="M20 90 Q12 88, 12 72 L12 30 Q12 22, 18 22 Q24 22, 24 30 L24 50 L28 22 Q28 14, 34 14 Q40 14, 40 22 L40 90 Z" />
      {/* Right hand — mirrored */}
      <path d="M60 90 Q68 88, 68 72 L68 30 Q68 22, 62 22 Q56 22, 56 30 L56 50 L52 22 Q52 14, 46 14 Q40 14, 40 22 L40 90 Z" />
      {/* Small light glow above */}
      <circle cx="40" cy="6" r="4" fill="currentColor" opacity="0.55" />
      {/* Radiating rays from the glow */}
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <line x1="40" y1="0" x2="40" y2="-4" />
        <line x1="32" y1="3" x2="29" y2="0" />
        <line x1="48" y1="3" x2="51" y2="0" />
      </g>
    </svg>
  );
}

/** Candle with flame — intercession. */
function CandleIcon() {
  return (
    <svg viewBox="0 0 48 80" fill="currentColor" className="h-full w-full">
      {/* Candle body */}
      <rect x="16" y="32" width="16" height="40" rx="2" />
      {/* Holder/base */}
      <path d="M12 72 L36 72 L34 78 L14 78 Z" />
      {/* Wick */}
      <line x1="24" y1="32" x2="24" y2="26" stroke="currentColor" strokeWidth="1.5" />
      {/* Flame */}
      <path d="M24 8 Q18 16, 18 22 Q18 28, 24 28 Q30 28, 30 22 Q30 16, 24 8 Z" />
      <path d="M24 16 Q21 22, 21 25 Q21 27, 24 27 Q27 27, 27 25 Q27 22, 24 16 Z" fill="white" opacity="0.45" />
    </svg>
  );
}

/** Open welcome door / arched threshold. */
function DoorIcon() {
  return (
    <svg viewBox="0 0 64 96" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      {/* Arched frame */}
      <path d="M6 90 L6 32 Q6 8, 32 8 Q58 8, 58 32 L58 90" />
      {/* Door — slightly ajar, with warm light spilling out */}
      <path d="M14 90 L14 36 Q14 16, 32 16 L32 90 Z" fill="currentColor" opacity="0.18" stroke="currentColor" />
      <path d="M32 90 L32 16 Q50 16, 50 36 L50 90 Z" stroke="currentColor" opacity="0.45" />
      {/* Light spilling out from the open crack */}
      <line x1="32" y1="90" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
      {/* Door handles */}
      <circle cx="24" cy="56" r="1.8" fill="currentColor" />
      <circle cx="40" cy="56" r="1.8" fill="currentColor" />
      {/* Welcome mat suggestion */}
      <line x1="2" y1="90" x2="62" y2="90" strokeWidth="2.5" />
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

/** Alpha (Α) — capital Greek letter, watermark scale. */
function AlphaIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M14 90 L50 8 L86 90" />
      <line x1="28" y1="62" x2="72" y2="62" />
    </svg>
  );
}

/** Omega (Ω) — capital Greek letter, watermark scale. */
function OmegaIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M16 92 L36 92 Q14 86, 14 56 Q14 14, 50 14 Q86 14, 86 56 Q86 86, 64 92 L84 92" />
    </svg>
  );
}
