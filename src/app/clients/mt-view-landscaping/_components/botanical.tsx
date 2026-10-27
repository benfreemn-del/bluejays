/**
 * Subtle botanical accents for the light (paper / bone / mint) sections:
 * a maple leaf, a classic leaf, and a fern frond, drawn as thin line art in
 * the brand green at very low opacity. Purely decorative: aria-hidden, no
 * pointer events, tucked half off the section edge so they never sit under
 * text. Hidden below the sm breakpoint, where there's no spare white space.
 *
 * Usage: the parent section needs `relative overflow-hidden`; put content
 * in a `relative` wrapper so it stacks above the leaf.
 */

type Kind = "maple" | "leaf" | "fern";
type Spot = "tl" | "tr" | "bl" | "br";

const POS: Record<Spot, string> = {
  tl: "-top-6 -left-8",
  tr: "-top-6 -right-8",
  bl: "-bottom-6 -left-8",
  br: "-bottom-6 -right-8",
};

function Maple() {
  return (
    <g>
      <path d="M50 5 L56 22 L66 16 L63 38 L78 28 L76 36 L92 34 L84 48 L90 52 L70 64 L72 74 L54 70 L52 92 L48 92 L46 70 L28 74 L30 64 L10 52 L16 48 L8 34 L24 36 L22 28 L37 38 L34 16 L44 22 Z" />
      <path d="M50 92 L50 12 M50 66 L80 40 M50 66 L20 40 M50 60 L64 22 M50 60 L36 22 M50 70 L68 70 M50 70 L32 70" />
    </g>
  );
}

function Leaf() {
  return (
    <g>
      <path d="M50 95 C 18 72, 14 30, 50 5 C 86 30, 82 72, 50 95 Z" />
      <path d="M50 98 L50 8 M50 30 L34 20 M50 30 L66 20 M50 45 L28 33 M50 45 L72 33 M50 60 L27 49 M50 60 L73 49 M50 75 L32 66 M50 75 L68 66" />
    </g>
  );
}

function Fern() {
  // A curved stem with alternating leaflets that shrink toward the tip.
  const leaflets = Array.from({ length: 11 }, (_, i) => {
    const t = i / 11;
    const y = 92 - t * 82;
    const x = 50 + Math.sin(t * 2.2) * 9;
    const len = 26 * (1 - t * 0.75);
    const side = i % 2 === 0 ? 1 : -1;
    return { x, y, len, side };
  });
  return (
    <g>
      <path d="M50 96 C 58 70, 62 40, 54 6" />
      {leaflets.map(({ x, y, len, side }, i) => (
        <path
          key={i}
          d={`M${x.toFixed(1)} ${y.toFixed(1)} q ${(side * len * 0.55).toFixed(1)} ${(-len * 0.35).toFixed(1)} ${(side * len).toFixed(1)} ${(-len * 0.12).toFixed(1)} q ${(-side * len * 0.45).toFixed(1)} ${(len * 0.28).toFixed(1)} ${(-side * len).toFixed(1)} ${(len * 0.12).toFixed(1)} Z`}
        />
      ))}
    </g>
  );
}

const SHAPES: Record<Kind, () => React.ReactElement> = { maple: Maple, leaf: Leaf, fern: Fern };

export default function Botanical({
  kind,
  spot,
  size = 240,
  rotate = 0,
  wideOnly = false,
  className = "",
}: {
  kind: Kind;
  spot: Spot;
  size?: number;
  rotate?: number;
  /** Only show on large screens (for spots that are empty only in the 3-column layout). */
  wideOnly?: boolean;
  className?: string;
}) {
  const Shape = SHAPES[kind];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`pointer-events-none select-none absolute hidden ${wideOnly ? "lg:block" : "sm:block"} ${POS[spot]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="#2F7D4F"
      fillOpacity={0.035}
      stroke="#2F7D4F"
      strokeOpacity={0.16}
      strokeWidth={0.9}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <Shape />
    </svg>
  );
}
