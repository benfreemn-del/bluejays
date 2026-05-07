/**
 * LakeMapArt — pure-SVG illustration that mimics a finished Laser
 * Lakes wood lake map. Used as the hero placeholder + as the
 * background art on lake-map product cards until Nate sends real
 * photos.
 *
 * Renders:
 *   · Wood-grain frame (filled with a layered wood-tone gradient
 *     and subtle horizontal grain stripes)
 *   · Irregular lake silhouette with 3-4 islands (custom path —
 *     looks like a real lake, not a circle)
 *   · Concentric depth-contour rings inside the lake shape
 *   · Optional engraved label (lake name + state) under the lake,
 *     burned-in look (slightly recessed text shadow)
 *
 * Pure server-renderable; no client deps. Drops anywhere.
 */

export function LakeMapArt({
  label = "Lake Burntside",
  state = "MN",
  variant = "warm",
  className = "",
}: {
  label?: string;
  state?: string;
  /** "warm" = honey/amber wood (hero default) ·
   *  "walnut" = darker walnut tone (catalog cards) ·
   *  "ebony" = nearly-black, gold engraving (premium) */
  variant?: "warm" | "walnut" | "ebony";
  className?: string;
}) {
  const palette =
    variant === "ebony"
      ? {
          plank1: "#2a1f15",
          plank2: "#100b07",
          grain: "rgba(217, 159, 88, 0.08)",
          lakeFill: "#0c1f2a",
          lakeStroke: "rgba(217, 159, 88, 0.45)",
          contour: "rgba(217, 159, 88, 0.22)",
          engrave: "#d99f58",
          engraveShadow: "rgba(0,0,0,0.7)",
        }
      : variant === "walnut"
        ? {
            plank1: "#7a5232",
            plank2: "#4a3017",
            grain: "rgba(255, 230, 180, 0.05)",
            lakeFill: "#1c3849",
            lakeStroke: "rgba(255, 230, 180, 0.55)",
            contour: "rgba(255, 230, 180, 0.28)",
            engrave: "#f6f1e8",
            engraveShadow: "rgba(0,0,0,0.55)",
          }
        : {
            // WARM (hero) — pushed brighter + more saturated. The
            // previous version was muddy because the wood-grain
            // turbulence filter overwhelmed the base honey color.
            // Lighter plank tone + warmer second stop + reduced
            // grain noise opacity all conspire to keep the lake
            // legible against the wood.
            plank1: "#e0bb83",
            plank2: "#9b7340",
            grain: "rgba(60, 36, 12, 0.05)",
            lakeFill: "#1f4a5f",
            lakeStroke: "rgba(255, 248, 230, 0.7)",
            contour: "rgba(255, 248, 230, 0.4)",
            engrave: "#2b1a08",
            engraveShadow: "rgba(255, 240, 210, 0.55)",
          };

  return (
    <svg
      viewBox="0 0 600 750"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${label}, ${state} — wood lake map illustration`}
    >
      <defs>
        {/* Wood plank gradient — diagonal so it reads like sawn lumber */}
        <linearGradient id="ll-plank" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.plank1} />
          <stop offset="100%" stopColor={palette.plank2} />
        </linearGradient>

        {/* Reusable wood-grain filter — turbulence noise mapped to the
            wood color so plank looks real, not flat. */}
        <filter id="ll-wood-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85 0.05"
            numOctaves="3"
            seed="3"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"
          />
          <feComposite operator="in" in2="SourceGraphic" />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>

        {/* Engraving shadow — burned-in look on the engraved text */}
        <filter id="ll-engrave" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
          <feOffset dy="1" />
          <feFlood floodColor={palette.engraveShadow} floodOpacity="0.8" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Lake water gradient — slightly deeper toward the centre to
            sell the "this is water, not paint" trick. */}
        <radialGradient id="ll-water" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={palette.lakeFill} stopOpacity="1" />
          <stop offset="80%" stopColor={palette.lakeFill} stopOpacity="0.85" />
        </radialGradient>
      </defs>

      {/* Plank background — fills the full canvas */}
      <rect width="600" height="750" fill="url(#ll-plank)" />

      {/* Wood-grain noise overlay — reduced from 55% → 25% so the
          plank color stays warm + the lake stays legible. */}
      <rect
        width="600"
        height="750"
        filter="url(#ll-wood-grain)"
        opacity="0.25"
      />

      {/* Subtle horizontal grain stripes — multiple thin lines at
          slightly different opacities so it feels like real plank grain
          instead of a CSS gradient. */}
      <g opacity="0.45">
        {Array.from({ length: 30 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2="600"
            y1={i * 25 + (i % 3) * 4}
            y2={i * 25 + (i % 3) * 4}
            stroke={palette.grain}
            strokeWidth={i % 4 === 0 ? 1.6 : 0.8}
          />
        ))}
      </g>

      {/* ─── LAKE SHAPE ─────────────────────────────────────────────
          Hand-drawn irregular path resembling a real lake outline
          (Burntside-shaped — narrow channels + broad bays). Centered
          around (300, 340) within an ~400px envelope. */}
      <g transform="translate(300 340)">
        {/* Outer shoreline */}
        <path
          d="M -160 -40
             C -180 -90, -120 -150, -60 -160
             C 20 -180, 90 -150, 130 -120
             C 180 -85, 195 -30, 175 30
             C 165 75, 130 100, 95 110
             C 55 130, 0 130, -40 145
             C -90 165, -160 130, -180 70
             C -200 30, -185 -10, -160 -40 Z"
          fill="url(#ll-water)"
          stroke={palette.lakeStroke}
          strokeWidth="2.5"
        />

        {/* Depth contour rings — three nested, slightly offset paths */}
        <path
          d="M -130 -30
             C -150 -75, -100 -120, -50 -130
             C 20 -145, 80 -120, 115 -95
             C 155 -65, 165 -20, 150 25
             C 140 60, 110 80, 80 90
             C 45 105, 0 105, -30 115
             C -75 130, -135 105, -150 60
             C -165 25, -150 -5, -130 -30 Z"
          fill="none"
          stroke={palette.contour}
          strokeWidth="1.2"
        />
        <path
          d="M -100 -20
             C -120 -55, -80 -90, -40 -100
             C 15 -110, 65 -90, 95 -70
             C 125 -45, 135 -10, 120 25
             C 115 50, 90 65, 65 70
             C 35 80, 0 80, -25 90
             C -60 100, -110 80, -120 45
             C -132 20, -120 -5, -100 -20 Z"
          fill="none"
          stroke={palette.contour}
          strokeWidth="1"
        />
        <path
          d="M -65 -10
             C -80 -35, -50 -60, -20 -65
             C 15 -72, 50 -60, 70 -45
             C 90 -28, 95 -5, 85 18
             C 80 35, 60 45, 40 48
             C 20 55, -5 55, -20 60
             C -45 67, -78 53, -85 30
             C -92 12, -82 -3, -65 -10 Z"
          fill="none"
          stroke={palette.contour}
          strokeWidth="0.8"
        />

        {/* Islands — three small irregular shapes inside the lake */}
        <ellipse cx="-30" cy="20" rx="14" ry="9" fill={palette.plank1} stroke={palette.lakeStroke} strokeWidth="1" />
        <ellipse cx="40" cy="-30" rx="10" ry="6" fill={palette.plank1} stroke={palette.lakeStroke} strokeWidth="1" />
        <ellipse cx="80" cy="40" rx="8" ry="5" fill={palette.plank1} stroke={palette.lakeStroke} strokeWidth="1" />

        {/* Tiny depth-marker dots scattered through the lake — subtle */}
        {[
          [-90, -50],
          [60, -70],
          [-120, 30],
          [110, 0],
          [0, -90],
          [50, 70],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="1.6"
            fill={palette.contour}
          />
        ))}
      </g>

      {/* ─── ENGRAVED LABEL ──────────────────────────────────────────
          Lake name + state below the lake shape, in serif-engraving
          style with a soft drop-shadow to read as burned-in. */}
      <g filter="url(#ll-engrave)">
        <text
          x="300"
          y="600"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="38"
          fontWeight="700"
          letterSpacing="0.12em"
          fill={palette.engrave}
        >
          {label.toUpperCase()}
        </text>
        <text
          x="300"
          y="640"
          textAnchor="middle"
          fontFamily="'Inter', system-ui, sans-serif"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.42em"
          fill={palette.engrave}
          opacity="0.7"
        >
          {state}
        </text>

        {/* Decorative engraved divider — small star + thin lines */}
        <g transform="translate(300 670)">
          <line x1="-50" y1="0" x2="-12" y2="0" stroke={palette.engrave} strokeWidth="0.8" opacity="0.55" />
          <line x1="12" y1="0" x2="50" y2="0" stroke={palette.engrave} strokeWidth="0.8" opacity="0.55" />
          <circle cx="0" cy="0" r="2" fill={palette.engrave} opacity="0.7" />
        </g>
      </g>

      {/* Subtle inner glow vignette so the art doesn't look flat at the
          edges of its container. */}
      <rect
        width="600"
        height="750"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="60"
        style={{ filter: "blur(40px)" }}
      />
    </svg>
  );
}

export default LakeMapArt;
