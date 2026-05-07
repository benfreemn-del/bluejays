/**
 * MeyerMark — recreates Meyer Electric's plug-in-circle brand mark as
 * inline SVG, recolored from their original blue/white scheme to the
 * new yellow→orange-on-black scheme Ben locked 2026-05-06.
 *
 * Original: blue circle, white stylized plug inside (2 prongs + body
 * + cord curl). "Meyer" stacked above, "Electric" below.
 *
 * This component renders ONLY the icon portion (plug + circle) at any
 * size — the "MEYER ELECTRIC" wordmark continues to be rendered as
 * separate text in Space Grotesk, matching the screenshot template
 * Ben sourced. So the lockup pattern is: [MeyerMark icon] + text.
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

export default function MeyerMark({ size = 32, className = "", flat = false }: Props) {
  const gid = uniqueId("meyer-mark-grad");
  const innerGid = uniqueId("meyer-mark-inner");
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
          : { filter: "drop-shadow(0 0 12px rgba(250, 204, 21, 0.4))" }
      }
    >
      <defs>
        {/* Yellow → orange radial — bright center, deeper at edge */}
        <radialGradient id={gid} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        {/* Subtle inner highlight for premium feel */}
        <radialGradient id={innerGid} cx="50%" cy="35%" r="40%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
      </defs>

      {/* Outer circle — yellow→orange gradient */}
      <circle cx="32" cy="32" r="30" fill={`url(#${gid})`} />

      {/* Inner highlight ring */}
      <circle cx="32" cy="32" r="30" fill={`url(#${innerGid})`} />

      {/* Subtle outline */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#0a0a0a"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {/* Stylized plug glyph — simplified version of Meyer's mark.
          - Two prongs at top (rounded rectangles)
          - Plug body (rounded square with internal slot lines)
          - Cord swooping down + right
          Black for max contrast against the yellow-orange. */}
      <g fill="#0a0a0a">
        {/* Left prong */}
        <rect x="22" y="14" width="5" height="11" rx="2" />
        {/* Right prong */}
        <rect x="37" y="14" width="5" height="11" rx="2" />
        {/* Plug body */}
        <path
          d="M19 26
             Q19 24 21 24
             L43 24
             Q45 24 45 26
             L45 38
             Q45 41 42 41
             L36 41
             Q34 41 34 43
             L34 47
             Q34 49 32 49
             Q30 49 30 47
             L30 43
             Q30 41 28 41
             L22 41
             Q19 41 19 38
             Z"
        />
        {/* Inner slot detail (highlight) */}
        <rect x="23" y="29" width="3" height="6" rx="1" fill="#0a0a0a" />
        <rect x="38" y="29" width="3" height="6" rx="1" fill="#0a0a0a" />
      </g>

      {/* Small spark accent dots around the plug for energy feel */}
      <circle cx="14" cy="20" r="1.2" fill="#fde047" opacity="0.7" />
      <circle cx="50" cy="22" r="1" fill="#fb923c" opacity="0.6" />
      <circle cx="52" cy="44" r="1.4" fill="#fde047" opacity="0.65" />
    </svg>
  );
}
