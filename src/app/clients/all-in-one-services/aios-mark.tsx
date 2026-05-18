/**
 * AIOSMark — All In One Service's LLC brand mark, v2.
 *
 * The previous mark (copper shield with abstract hammer + carpenter's
 * square inside) read as "vague badge." Ben asked for something more
 * grounded that actually says "contractor" at a glance.
 *
 * v2 design rationale:
 * - A gable-roof silhouette is the universal "house / shelter" symbol.
 *   Every contractor uses it. Instantly readable at favicon size.
 * - A bubble-level line cuts through the roof — references the literal
 *   tool every GC reaches for AND the brand line "Built Right.
 *   Finished Clean." (level work = clean work).
 * - The level bubble is offset slightly right-of-center, which is what
 *   a real spirit level looks like when you're checking a wall — it's
 *   the kind of detail a contractor will recognize.
 * - Three colors visible: copper-amber (the trade), petrol blue (the
 *   blueprint), warm cream (the ink). Same three colors used through
 *   the page.
 *
 * Each instance gets a unique gradient ID so multiple instances on the
 * same page don't collide.
 */

let _idCounter = 0;
function uniqueId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}`;
}

type Props = {
  size?: number;
  className?: string;
  /** When true, drops the glow shadow (use inside small spaces). */
  flat?: boolean;
};

export default function AIOSMark({ size = 32, className = "", flat = false }: Props) {
  const roofGrad = uniqueId("aios-roof");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={
        flat
          ? undefined
          : { filter: "drop-shadow(0 0 10px rgba(217, 119, 6, 0.40))" }
      }
    >
      <defs>
        {/* Copper roof gradient — top-down, bright to deep */}
        <linearGradient id={roofGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* Gable roof — solid copper triangle, slight overhang. The
          base sits ~8px above the bottom so the level line + foundation
          rule have room below. */}
      <path
        d="M32 6
           L58 36
           L52 36
           L32 13
           L12 36
           L6 36 Z"
        fill={`url(#${roofGrad})`}
      />
      {/* Roof inner — the "attic" triangle, slightly darker */}
      <path
        d="M32 14
           L51 36
           L13 36 Z"
        fill="#7c2d12"
        opacity="0.85"
      />
      {/* Roof inner highlight — adds depth */}
      <path
        d="M32 14
           L51 36
           L32 36 Z"
        fill="#451a03"
        opacity="0.35"
      />

      {/* Bubble-level body — a horizontal capsule sitting just below
          the roof eaves. Petrol-blue stroke, warm-cream fill. */}
      <rect
        x="6"
        y="40"
        width="52"
        height="8"
        rx="3"
        fill="#fef6e8"
        stroke="#0e7490"
        strokeWidth="1.5"
      />

      {/* Level vial — the glass tube inside the level body. Subtle
          petrol-blue tint, slightly inset from the body edges. */}
      <rect
        x="12"
        y="42.5"
        width="40"
        height="3"
        rx="1"
        fill="#cffafe"
        stroke="#0e7490"
        strokeWidth="0.4"
      />

      {/* Level bubble — the air bubble inside the vial. Offset 1px
          right-of-center on purpose — that's what a real level looks
          like when you're checking a wall. Sells the realism. */}
      <ellipse cx="34" cy="44" rx="3.2" ry="1.4" fill="#0e7490" />
      {/* Bubble highlight — tiny glint */}
      <ellipse cx="33.2" cy="43.6" rx="1" ry="0.4" fill="#cffafe" opacity="0.9" />

      {/* Center reference marks on the vial — two thin black hashes
          that real levels have for "the bubble should be between these
          lines when it's level." Realism detail. */}
      <line x1="30" y1="42.5" x2="30" y2="45.5" stroke="#0c4a6e" strokeWidth="0.5" />
      <line x1="38" y1="42.5" x2="38" y2="45.5" stroke="#0c4a6e" strokeWidth="0.5" />

      {/* Foundation rule — a thin copper baseline under everything,
          like the bottom rule of a builder's drawing. */}
      <line
        x1="4"
        y1="56"
        x2="60"
        y2="56"
        stroke="#d97706"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Small tick marks on the rule — measurement hashes */}
      <line x1="14" y1="54" x2="14" y2="58" stroke="#d97706" strokeWidth="0.8" />
      <line x1="32" y1="53" x2="32" y2="59" stroke="#d97706" strokeWidth="1" />
      <line x1="50" y1="54" x2="50" y2="58" stroke="#d97706" strokeWidth="0.8" />
    </svg>
  );
}
