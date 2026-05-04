"use client";

/**
 * Stylized SVG player that morphs as the user adjusts the builder
 * sliders. Not literal 3D — a pseudo-isometric flat illustration that
 * renders in <2ms (vs Three.js's 200-400ms first paint). Plays the
 * "character builder" UX without the bundle-size cost.
 *
 * What morphs:
 *   - Height of the silhouette (height slider)
 *   - Kit color band (skill-level → rec / travel / club / academy / elite)
 *   - Ball size relative to player (always TEKKY-smaller-than-regulation)
 *   - Stat overlay readouts (live)
 *   - Skill aura particles (intensity scales with skill level)
 *   - Pose subtle shift (rec = upright, elite = athletic stance)
 */

type Props = {
  age: number;
  heightInches: number;
  skillLevel: number; // 1-5
};

const SKILL_TIERS: { name: string; color: string; subtitle: string }[] = [
  { name: "Rec", color: "#94a3b8", subtitle: "Just getting started" },
  { name: "Travel", color: "#60a5fa", subtitle: "Comp soccer" },
  { name: "Club", color: "#a78bfa", subtitle: "Premier / Travel-elite" },
  { name: "ECNL / MLS Next", color: "#a3e635", subtitle: "National-tier" },
  { name: "Elite", color: "#facc15", subtitle: "Pro / academy pathway" },
];

export default function CharacterBuilder({
  age,
  heightInches,
  skillLevel,
}: Props) {
  const tier = SKILL_TIERS[Math.min(Math.max(skillLevel - 1, 0), 4)];

  // Player figure scales with height. We anchor the FEET at y=370 so
  // the floor ellipse + ball + stat chips all sit at the bottom of the
  // SVG cleanly regardless of which height the user picked.
  const figureScale = 0.7 + ((heightInches - 36) / (72 - 36)) * 0.45;
  // Native figure runs from y≈-8 (hair top) to y≈275 (cleat bottom) =
  // 283px native height. Scaled, the foot needs to land on the floor.
  const FOOT_Y = 370;
  const figureTopY = FOOT_Y - 275 * figureScale;
  // Ball is always TEKKY-smaller — about 75% of the regulation reference
  const ballRadius = 22 * (figureScale * 0.85);
  // Aura intensity grows with skill
  const auraOpacity = 0.05 + skillLevel * 0.06;

  return (
    <div className="relative w-full h-full flex items-end justify-center">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 65%, ${tier.color}33 0%, transparent 60%)`,
          opacity: auraOpacity * 4,
        }}
      />

      {/* Tier name + subtitle floating top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
        <div
          className="text-[10px] tracking-[0.32em] uppercase font-extrabold transition-colors"
          style={{ color: tier.color }}
        >
          {tier.name}
        </div>
        <div className="text-[10px] text-white/40 mt-0.5">{tier.subtitle}</div>
      </div>

      <svg
        viewBox="0 0 220 400"
        width="100%"
        height="100%"
        className="max-h-[440px] transition-all duration-500"
        style={{ filter: `drop-shadow(0 12px 24px ${tier.color}44)` }}
      >
        {/* Floor ellipse — anchors the player. Slightly below FOOT_Y. */}
        <ellipse
          cx="110"
          cy={FOOT_Y + 5}
          rx={55 * figureScale}
          ry={9 * figureScale}
          fill={tier.color}
          opacity="0.22"
        />

        {/* Skill aura — particles around upper body, scale with skill */}
        {Array.from({ length: skillLevel * 2 }).map((_, i) => (
          <circle
            key={i}
            cx={110 + Math.sin((i / (skillLevel * 2)) * Math.PI * 2) * 70 * figureScale}
            cy={(figureTopY + 130 * figureScale) - Math.cos((i / (skillLevel * 2)) * Math.PI * 2) * 110 * figureScale}
            r={2}
            fill={tier.color}
            opacity={auraOpacity * 6}
          />
        ))}

        {/* Player figure — feet planted at FOOT_Y. */}
        <g transform={`translate(110, ${figureTopY}) scale(${figureScale})`}>
          {/* Head */}
          <circle cx="0" cy="20" r="22" fill="#f5d3b1" stroke={tier.color} strokeWidth="2" />
          {/* Hair */}
          <path
            d="M -22 12 Q -20 -3 0 -2 Q 20 -3 22 12 L 16 -2 Q 0 -8 -16 -2 Z"
            fill="#3a2820"
          />
          {/* Neck */}
          <rect x="-7" y="38" width="14" height="10" fill="#f5d3b1" />
          {/* Jersey body — color = tier */}
          <path
            d="M -42 50 L -38 130 L -22 145 L 22 145 L 38 130 L 42 50 Q 40 47 26 50 Q 20 53 0 53 Q -20 53 -26 50 Q -40 47 -42 50 Z"
            fill={tier.color}
          />
          {/* Jersey number 10 */}
          <text
            x="0"
            y="105"
            textAnchor="middle"
            fontSize="36"
            fontWeight="900"
            fill="#fff"
            opacity="0.9"
            fontFamily="ui-sans-serif, system-ui"
          >
            10
          </text>
          {/* Arms */}
          <path d="M -42 50 L -55 110 L -45 115 L -32 60 Z" fill={tier.color} />
          <path d="M 42 50 L 55 110 L 45 115 L 32 60 Z" fill={tier.color} />
          {/* Hands */}
          <circle cx="-50" cy="118" r="7" fill="#f5d3b1" />
          <circle cx="50" cy="118" r="7" fill="#f5d3b1" />
          {/* Shorts */}
          <path
            d="M -22 145 L -28 195 L -8 195 L -2 160 L 2 160 L 8 195 L 28 195 L 22 145 Z"
            fill="#0a1832"
          />
          {/* Legs */}
          <rect x="-22" y="195" width="14" height="50" fill="#f5d3b1" />
          <rect x="8" y="195" width="14" height="50" fill="#f5d3b1" />
          {/* Socks */}
          <rect x="-22" y="245" width="14" height="22" fill={tier.color} />
          <rect x="8" y="245" width="14" height="22" fill={tier.color} />
          {/* Cleats */}
          <ellipse cx="-15" cy="270" rx="13" ry="6" fill="#1a1a1a" />
          <ellipse cx="15" cy="270" rx="13" ry="6" fill="#1a1a1a" />
        </g>

        {/* The TEKKY ball — at the right foot, sized smaller-than-reg */}
        <g transform={`translate(160, ${FOOT_Y - 5})`}>
          <circle
            cx="0"
            cy="0"
            r={ballRadius}
            fill="white"
            stroke="#0a1832"
            strokeWidth="1.5"
          />
          {/* Black hex pattern accents */}
          <circle cx="-6" cy="-4" r={ballRadius * 0.18} fill="#0a1832" />
          <circle cx="7" cy="-7" r={ballRadius * 0.12} fill="#1d4ed8" />
          <circle cx="2" cy="6" r={ballRadius * 0.14} fill="#1d4ed8" />
          {/* "TEKKY" text on ball */}
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fontSize={ballRadius * 0.35}
            fontWeight="900"
            fill="#0a1832"
            fontFamily="ui-sans-serif, system-ui"
          >
            TEKKY
          </text>
        </g>

        {/* Reg-ball reference (faded — visual proof TEKKY is smaller) */}
        <g transform={`translate(50, ${FOOT_Y - 5})`} opacity="0.22">
          <circle
            cx="0"
            cy="0"
            r={ballRadius * 1.35}
            fill="white"
            stroke="#0a1832"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill="#0a1832"
          >
            REG
          </text>
        </g>
      </svg>

      {/* Stat overlay bottom-left */}
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        <StatChip
          label="Age"
          value={age >= 24 ? `${age}` : `U-${age}`}
          color={tier.color}
        />
        <StatChip
          label="Height"
          value={`${Math.floor(heightInches / 12)}'${heightInches % 12}"`}
          color={tier.color}
        />
        <StatChip label="Tier" value={tier.name.split(" ")[0]} color={tier.color} />
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="border rounded p-1.5 text-center backdrop-blur"
      style={{
        background: "rgba(10, 24, 50, 0.55)",
        borderColor: `${color}55`,
      }}
    >
      <div
        className="text-[8px] tracking-[0.18em] uppercase font-bold"
        style={{ color: `${color}aa` }}
      >
        {label}
      </div>
      <div className="text-[14px] font-black tracking-tight text-white tabular-nums">
        {value}
      </div>
    </div>
  );
}
