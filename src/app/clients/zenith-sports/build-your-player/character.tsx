"use client";

/**
 * Hyper-realistic stylized soccer-player avatar that morphs as the
 * builder sliders change. Pure SVG (no Three.js) so it renders in <2ms
 * and stays sharp at any size — critical because this page is the ad
 * landing destination and must look stunning on phone + desktop.
 *
 * What's live-wired to the sliders:
 *   - Height of the player    → height slider (36–84 inches, 3' – 7'0")
 *   - Kit (jersey/shorts/sock design)  → skill-tier slider
 *   - Stars around the player → number + brightness scale with skill
 *   - Jersey number on chest  → CURRENT AGE (live as you slide age)
 *   - TEKKY ball at right foot → always smaller-than-regulation
 *   - Background aura color   → tier color
 *   - Floor shadow            → tier color
 *
 * Per-tier kits (not just color swaps — full kit design changes):
 *   Rec       — gray training top, no detail
 *   Travel    — teal jersey, white V-neck + sleeve cuffs
 *   Club      — cobalt jersey, white pinstripe + chest panel + sponsor
 *   ECNL/MLS  — lime jersey, navy chest band + crest
 *   Elite     — violet jersey, gold trim, gold sleeve cuffs, "PRO" stars
 *
 * Designed for vertical phone ads (9:16) AND square / landscape ad
 * placements — the SVG viewBox is 240x440, full-width responsive.
 */

type Props = {
  age: number;
  heightInches: number;
  skillLevel: number; // 1-5
};

type Kit = {
  name: string;
  subtitle: string;
  primary: string;       // jersey body color
  primaryDark: string;   // shading on jersey
  trim: string;          // sleeves, V-neck, sock band
  shorts: string;
  shortsAccent: string;
  socks: string;
  sockBand: string;
  cleats: string;
  cleatStripe: string;
  hasChestPanel?: boolean;
  hasSponsor?: boolean;
  hasCrest?: boolean;
  hasGoldTrim?: boolean;
  starCount: number;     // halo of stars around player
};

// Skill-tier kits ladder up the TEKKY ball palette
// (mint-teal → cobalt → lime → violet)
const KITS: Kit[] = [
  {
    name: "Rec", subtitle: "Just getting started",
    primary: "#94a3b8", primaryDark: "#64748b",
    trim: "#cbd5e1", shorts: "#1e293b", shortsAccent: "#475569",
    socks: "#94a3b8", sockBand: "#cbd5e1",
    cleats: "#1a1a1a", cleatStripe: "#94a3b8",
    starCount: 1,
  },
  {
    name: "Travel", subtitle: "Comp soccer",
    primary: "#3BDAC0", primaryDark: "#1FAE96",
    trim: "#ffffff", shorts: "#0a1832", shortsAccent: "#3BDAC0",
    socks: "#0a1832", sockBand: "#3BDAC0",
    cleats: "#0a0a0a", cleatStripe: "#3BDAC0",
    hasCrest: true,
    starCount: 3,
  },
  {
    name: "Club", subtitle: "Premier / Travel-elite",
    primary: "#2C4DD8", primaryDark: "#1A36AB",
    trim: "#ffffff", shorts: "#0a1832", shortsAccent: "#2C4DD8",
    socks: "#0a1832", sockBand: "#2C4DD8",
    cleats: "#0a0a0a", cleatStripe: "#2C4DD8",
    hasChestPanel: true, hasSponsor: true, hasCrest: true,
    starCount: 5,
  },
  {
    name: "ECNL / MLS Next", subtitle: "National-tier",
    primary: "#a3e635", primaryDark: "#65a30d",
    trim: "#0a1832", shorts: "#0a1832", shortsAccent: "#a3e635",
    socks: "#0a1832", sockBand: "#a3e635",
    cleats: "#0a0a0a", cleatStripe: "#a3e635",
    hasChestPanel: true, hasSponsor: true, hasCrest: true,
    starCount: 7,
  },
  {
    name: "Elite", subtitle: "Pro / academy pathway",
    primary: "#8A6FDF", primaryDark: "#6448C2",
    trim: "#fbbf24", shorts: "#0a0a1a", shortsAccent: "#fbbf24",
    socks: "#0a0a1a", sockBand: "#fbbf24",
    cleats: "#0a0a0a", cleatStripe: "#fbbf24",
    hasChestPanel: true, hasSponsor: true, hasCrest: true, hasGoldTrim: true,
    starCount: 9,
  },
];

export default function CharacterBuilder({
  age,
  heightInches,
  skillLevel,
}: Props) {
  const kit = KITS[Math.min(Math.max(skillLevel - 1, 0), 4)];

  // Player figure scales with height. FEET anchored at FOOT_Y so the
  // floor shadow + ball + stat chips all sit cleanly at the bottom.
  //
  // Range deliberately wide so 7'0" (max) genuinely MAXES OUT the
  // available rectangle — at scale 1.35, the native 280px figure
  // becomes ~378px on screen and the head sits ~30px from the
  // viewBox top, leaving just enough headroom for the tier badge.
  //
  //   36" (3'0") → scale 0.55  (small kid silhouette, mid-frame)
  //   84" (7'0") → scale 1.35  (towering pro, fills frame top to bottom)
  const figureScale = 0.55 + ((heightInches - 36) / (84 - 36)) * 0.8;
  const FOOT_Y = 405;
  const figureTopY = FOOT_Y - 280 * figureScale;
  // Ball scales with height too but capped — never larger than ~half
  // the player's torso width so it always reads as "smaller than reg."
  const ballRadius = Math.min(22 * (figureScale * 0.85), 30);

  // Star positions — arc around upper body, decreasing density toward
  // bottom. Render `kit.starCount` stars at varying sizes/opacities
  // for a "rising star" feel that scales with skill level.
  const stars = Array.from({ length: kit.starCount }).map((_, i) => {
    const angle = (i / Math.max(kit.starCount, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 75 + ((i % 3) * 8); // jitter so they don't form perfect ring
    return {
      cx: 120 + Math.cos(angle) * radius * figureScale,
      cy: (figureTopY + 90 * figureScale) + Math.sin(angle) * radius * figureScale,
      size: 4 + (i % 2) * 2 + (skillLevel - 1) * 0.5,
      opacity: 0.4 + (i / kit.starCount) * 0.5,
    };
  });

  // Live jersey number = the user's age. Drops a digit at 100+ — never
  // happens in practice (slider max 35) but defensive.
  const jerseyNumber = String(age).slice(-2);

  return (
    <div className="relative w-full h-full flex items-end justify-center">
      {/* Background radial glow in tier color */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${kit.primary}40 0%, ${kit.primary}10 40%, transparent 70%)`,
        }}
      />

      {/* Tier name + subtitle floating top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center z-10">
        <div
          className="text-[10px] tracking-[0.32em] uppercase font-extrabold transition-colors"
          style={{ color: kit.primary }}
        >
          {kit.name}
        </div>
        <div className="text-[10px] text-white/40 mt-0.5">{kit.subtitle}</div>
      </div>

      <svg
        viewBox="0 0 240 460"
        width="100%"
        height="100%"
        className="max-h-[520px] transition-all duration-500"
        style={{ filter: `drop-shadow(0 16px 32px ${kit.primary}55)` }}
      >
        {/* SVG defs — gradients + filters */}
        <defs>
          {/* Skin gradient (slight cheek/jaw shading) */}
          <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6d5b5" />
            <stop offset="100%" stopColor="#d9b48a" />
          </linearGradient>
          {/* Jersey gradient — primary at top, slightly darker at hem */}
          <linearGradient id="jersey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kit.primary} />
            <stop offset="100%" stopColor={kit.primaryDark} />
          </linearGradient>
          {/* Shorts gradient */}
          <linearGradient id="shorts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kit.shorts} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
          </linearGradient>
          {/* Calf muscle shading */}
          <linearGradient id="calf" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d9b48a" />
            <stop offset="50%" stopColor="#f6d5b5" />
            <stop offset="100%" stopColor="#d9b48a" />
          </linearGradient>
          {/* Star gradient — bright center, fades */}
          <radialGradient id="starGlow">
            <stop offset="0%" stopColor={kit.trim} stopOpacity="1" />
            <stop offset="60%" stopColor={kit.primary} stopOpacity="0.7" />
            <stop offset="100%" stopColor={kit.primary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle pitch lines in background — 2-point perspective */}
        <g opacity="0.06" stroke="white" strokeWidth="0.5">
          <line x1="0" y1={FOOT_Y + 8} x2="240" y2={FOOT_Y + 8} />
          <line x1="40" y1={FOOT_Y + 18} x2="200" y2={FOOT_Y + 18} />
          <line x1="60" y1={FOOT_Y + 28} x2="180" y2={FOOT_Y + 28} />
        </g>

        {/* Floor shadow ellipse — anchored under feet */}
        <ellipse
          cx="120"
          cy={FOOT_Y + 6}
          rx={60 * figureScale}
          ry={10 * figureScale}
          fill={kit.primary}
          opacity="0.28"
        />
        <ellipse
          cx="120"
          cy={FOOT_Y + 8}
          rx={42 * figureScale}
          ry={5 * figureScale}
          fill="#000"
          opacity="0.45"
        />

        {/* Stars — render BEHIND player so the figure stays the focal */}
        {stars.map((s, i) => (
          <Star
            key={i}
            cx={s.cx}
            cy={s.cy}
            size={s.size}
            color={kit.trim}
            glowColor={kit.primary}
            opacity={s.opacity}
          />
        ))}

        {/* Player figure — feet planted at FOOT_Y, scaled with height.
            Athletic young player (Messi-esque): proper V-torso, full
            arm anatomy (shoulder + bicep + forearm + fist at hip),
            modern messy hair with side fade, fitted jersey with clean
            hem, athletic stance with subtle weight on the standing leg
            so the right foot can sit on top of the ball. */}
        <g transform={`translate(120, ${figureTopY}) scale(${figureScale})`}>
          {/* ───── HEAD ───── */}
          {/* Neck — angled slightly to suggest motion / look forward */}
          <path
            d="M -7 38 L -8 50 Q 0 53 8 50 L 7 38 Z"
            fill="url(#skin)"
          />
          {/* Neck shadow under jaw */}
          <path
            d="M -8 40 Q 0 44 8 40 L 7 38 L -7 38 Z"
            fill="#c9a37a"
            opacity="0.55"
          />
          {/* Head — narrower, younger oval (smaller than before, no aged jowl) */}
          <ellipse cx="0" cy="18" rx="17" ry="20" fill="url(#skin)" />
          {/* Ears — tucked tighter to head */}
          <ellipse cx="-16" cy="20" rx="2.5" ry="4" fill="#d9b48a" />
          <ellipse cx="16" cy="20" rx="2.5" ry="4" fill="#d9b48a" />
          {/* Hair — modern medium-length with messy front + side fade.
              Layered for depth. */}
          <path
            d="M -17 14 Q -19 -2 -8 -10 Q 0 -13 8 -10 Q 19 -2 17 14 L 15 8 Q 12 -2 6 -3 L -6 -3 Q -12 -2 -15 8 Z"
            fill="#1a0f08"
          />
          {/* Hair messy bangs across forehead */}
          <path
            d="M -14 6 Q -8 -2 -2 4 Q 4 -2 14 6 Q 8 8 0 6 Q -8 8 -14 6 Z"
            fill="#0f0805"
          />
          {/* Side-fade gradient hint (darker at temples) */}
          <ellipse cx="-15" cy="14" rx="3" ry="6" fill="#0f0805" opacity="0.7" />
          <ellipse cx="15" cy="14" rx="3" ry="6" fill="#0f0805" opacity="0.7" />
          {/* Eyebrows — slight athletic intensity (tilted in) */}
          <path d="M -9 16 L -3 17" stroke="#0f0805" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 9 16 L 3 17" stroke="#0f0805" strokeWidth="1.4" strokeLinecap="round" />
          {/* Eyes — sharper almond shape */}
          <ellipse cx="-6" cy="21" rx="1.4" ry="1.2" fill="#0f0805" />
          <ellipse cx="6" cy="21" rx="1.4" ry="1.2" fill="#0f0805" />
          {/* Eye highlight */}
          <circle cx="-5.5" cy="20.5" r="0.4" fill="#fff" />
          <circle cx="6.5" cy="20.5" r="0.4" fill="#fff" />
          {/* Subtle confident smirk */}
          <path d="M -3 30 Q 0 32 3 30" stroke="#a07050" strokeWidth="0.7" fill="none" strokeLinecap="round" />

          {/* ───── SHOULDERS + JERSEY BODY (drawn first, arms over) ───── */}
          {/* Trapezius / shoulder line */}
          <path
            d="M -38 56 Q -22 50 0 52 Q 22 50 38 56 L 36 64 Q 0 60 -36 64 Z"
            fill={kit.primaryDark}
            opacity="0.85"
          />
          {/* Jersey body — fitted athletic cut, clean horizontal hem */}
          <path
            d="M -38 56
               L -36 148
               L 36 148
               L 38 56
               Q 30 50 18 54
               Q 9 58 0 58
               Q -9 58 -18 54
               Q -30 50 -38 56 Z"
            fill="url(#jersey)"
          />

          {/* Chest panel (Club / ECNL / Elite) */}
          {kit.hasChestPanel && (
            <path
              d="M -20 62 Q 0 70 20 62 L 22 95 Q 0 102 -22 95 Z"
              fill={kit.primaryDark}
              opacity="0.55"
            />
          )}

          {/* V-neck collar */}
          <path
            d="M -11 56 L 0 70 L 11 56 L 9 56 L 0 66 L -9 56 Z"
            fill={kit.trim}
          />
          {kit.hasGoldTrim && (
            <path
              d="M -11 56 L 0 70 L 11 56"
              stroke="#fbbf24"
              strokeWidth="1.5"
              fill="none"
            />
          )}

          {/* Side pinstripe (Club + above) */}
          {kit.hasChestPanel && (
            <>
              <line x1="-34" y1="62" x2="-34" y2="146" stroke={kit.trim} strokeWidth="1.5" opacity="0.65" />
              <line x1="34" y1="62" x2="34" y2="146" stroke={kit.trim} strokeWidth="1.5" opacity="0.65" />
            </>
          )}

          {/* Sponsor patch */}
          {kit.hasSponsor && (
            <text
              x="0"
              y="86"
              textAnchor="middle"
              fontSize="6"
              fontWeight="900"
              fill={kit.trim}
              opacity="0.9"
              fontFamily="ui-sans-serif, system-ui"
              letterSpacing="0.5"
            >
              TEKKY
            </text>
          )}

          {/* Crest (small Z) on left chest */}
          {kit.hasCrest && (
            <g transform="translate(-22, 80)">
              <circle cx="0" cy="0" r="5" fill={kit.trim} opacity="0.95" />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontSize="7"
                fontWeight="900"
                fill={kit.primaryDark}
                fontFamily="ui-sans-serif, system-ui"
              >
                Z
              </text>
              {kit.hasGoldTrim && (
                <circle cx="0" cy="0" r="6" stroke="#fbbf24" strokeWidth="1" fill="none" />
              )}
            </g>
          )}

          {/* Jersey number — LIVE = current age */}
          <text
            x="0"
            y="128"
            textAnchor="middle"
            fontSize={jerseyNumber.length === 1 ? 40 : 34}
            fontWeight="900"
            fill={kit.trim}
            opacity="0.95"
            fontFamily="ui-sans-serif, system-ui"
            letterSpacing="-1"
          >
            {jerseyNumber}
          </text>
          <text
            x="0"
            y="128"
            textAnchor="middle"
            fontSize={jerseyNumber.length === 1 ? 40 : 34}
            fontWeight="900"
            fill="none"
            stroke={kit.primaryDark}
            strokeWidth="0.6"
            fontFamily="ui-sans-serif, system-ui"
            letterSpacing="-1"
          >
            {jerseyNumber}
          </text>

          {/* ───── ARMS ─────
              Drawn AFTER jersey body so the sleeve overlaps the shoulder.
              Each arm: fitted sleeve (upper) + skin forearm + fist at hip.
              Total length now reaches down to ~y=145 (jersey hem level)
              instead of stopping awkwardly at ~y=118 like before. */}
          {/* LEFT arm — slightly relaxed at side */}
          <g>
            {/* Upper sleeve */}
            <path
              d="M -38 56 Q -46 78 -48 100 L -38 102 Q -34 80 -32 60 Z"
              fill="url(#jersey)"
            />
            {/* Sleeve cuff trim */}
            <ellipse cx="-43" cy="100" rx="6" ry="2.5" fill={kit.trim} />
            {kit.hasGoldTrim && (
              <ellipse cx="-43" cy="98.5" rx="6" ry="1" fill="#fbbf24" />
            )}
            {/* Forearm (skin) */}
            <path
              d="M -47 100 Q -49 120 -46 138 L -38 138 Q -38 120 -39 102 Z"
              fill="url(#skin)"
            />
            {/* Fist at hip level */}
            <ellipse cx="-42" cy="142" rx="5" ry="6" fill="#d9b48a" />
            {/* Knuckle definition */}
            <path d="M -45 141 L -39 141" stroke="#a07050" strokeWidth="0.5" opacity="0.5" />
          </g>
          {/* RIGHT arm — bent slightly forward (Messi pose hint) */}
          <g>
            <path
              d="M 38 56 Q 46 78 48 100 L 38 102 Q 34 80 32 60 Z"
              fill="url(#jersey)"
            />
            <ellipse cx="43" cy="100" rx="6" ry="2.5" fill={kit.trim} />
            {kit.hasGoldTrim && (
              <ellipse cx="43" cy="98.5" rx="6" ry="1" fill="#fbbf24" />
            )}
            <path
              d="M 47 100 Q 49 120 46 138 L 38 138 Q 38 120 39 102 Z"
              fill="url(#skin)"
            />
            <ellipse cx="42" cy="142" rx="5" ry="6" fill="#d9b48a" />
            <path d="M 39 141 L 45 141" stroke="#a07050" strokeWidth="0.5" opacity="0.5" />
          </g>

          {/* ───── SHORTS ───── */}
          <path
            d="M -36 148
               L -32 196
               L -10 198
               L -2 162
               L 2 162
               L 10 198
               L 32 196
               L 36 148 Z"
            fill="url(#shorts)"
          />
          {/* Waistband */}
          <rect x="-36" y="148" width="72" height="3.5" fill={kit.shortsAccent} opacity="0.85" />
          {/* Side accent stripe on shorts */}
          <path
            d="M -34 152 L -32 192 L -29 192 L -31 152 Z"
            fill={kit.shortsAccent}
            opacity="0.85"
          />
          <path
            d="M 34 152 L 32 192 L 29 192 L 31 152 Z"
            fill={kit.shortsAccent}
            opacity="0.85"
          />

          {/* ───── LEGS (athletic calves with shading) ───── */}
          {/* LEFT leg (standing leg, fully planted) */}
          <path
            d="M -22 198 Q -20 222 -18 244 L -8 244 Q -8 222 -10 198 Z"
            fill="url(#calf)"
          />
          {/* Calf muscle highlight */}
          <path d="M -16 210 Q -14 224 -15 240" stroke="#c9a37a" strokeWidth="0.7" fill="none" opacity="0.6" />
          {/* RIGHT leg */}
          <path
            d="M 10 198 Q 8 222 8 244 L 18 244 Q 20 222 22 198 Z"
            fill="url(#calf)"
          />
          <path d="M 16 210 Q 14 224 15 240" stroke="#c9a37a" strokeWidth="0.7" fill="none" opacity="0.6" />

          {/* ───── SOCKS ───── */}
          <rect x="-20" y="244" width="14" height="22" fill={kit.socks} rx="1.5" />
          <rect x="6" y="244" width="14" height="22" fill={kit.socks} rx="1.5" />
          {/* Sock band — thick stripe near top */}
          <rect x="-20" y="246" width="14" height="4" fill={kit.sockBand} />
          <rect x="6" y="246" width="14" height="4" fill={kit.sockBand} />
          {kit.hasGoldTrim && (
            <>
              <rect x="-20" y="250" width="14" height="1" fill="#fbbf24" />
              <rect x="6" y="250" width="14" height="1" fill="#fbbf24" />
            </>
          )}

          {/* ───── CLEATS ───── */}
          {/* Left cleat */}
          <ellipse cx="-13" cy="270" rx="13" ry="5.5" fill={kit.cleats} />
          {/* Cleat tongue/laces detail */}
          <path d="M -16 268 L -10 268" stroke={kit.cleatStripe} strokeWidth="1.2" />
          <path d="M -25 268 Q -13 264 -1 268 L -1 272 Q -13 274 -25 272 Z" fill={kit.cleatStripe} opacity="0.85" />
          {/* Right cleat */}
          <ellipse cx="13" cy="270" rx="13" ry="5.5" fill={kit.cleats} />
          <path d="M 10 268 L 16 268" stroke={kit.cleatStripe} strokeWidth="1.2" />
          <path d="M 1 268 Q 13 264 25 268 L 25 272 Q 13 274 1 272 Z" fill={kit.cleatStripe} opacity="0.85" />
          {/* Studs */}
          {[-20, -14, -8, 8, 14, 20].map((x, i) => (
            <circle key={i} cx={x} cy="275" r="0.8" fill="#000" opacity="0.6" />
          ))}
        </g>

        {/* The TEKKY ball — actual product photo clipped to a circle so
            it reads as photo-realistic at the player's foot. The native
            image has ~25% white padding on each side around the ball,
            so we render the image at ~1.6x the ball's bounding box and
            recenter — the white padding extends outside the clip path
            and only the ball itself shows through. */}
        <defs>
          <clipPath id="ballClip">
            <circle cx="170" cy={FOOT_Y - 6} r={ballRadius} />
          </clipPath>
        </defs>
        <image
          href="https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg"
          x={170 - ballRadius * 1.55}
          y={FOOT_Y - 6 - ballRadius * 1.55}
          width={ballRadius * 3.1}
          height={ballRadius * 3.1}
          clipPath="url(#ballClip)"
          preserveAspectRatio="xMidYMid slice"
        />
        {/* Subtle outline + drop-shadow ring for definition against the
            navy background (otherwise the white panels blend in). */}
        <circle
          cx="170"
          cy={FOOT_Y - 6}
          r={ballRadius}
          fill="none"
          stroke="#0a1832"
          strokeWidth="0.6"
          opacity="0.5"
        />
        {/* Highlight glint to give the ball lift off the floor */}
        <ellipse
          cx={170 - ballRadius * 0.35}
          cy={FOOT_Y - 6 - ballRadius * 0.4}
          rx={ballRadius * 0.18}
          ry={ballRadius * 0.1}
          fill="white"
          opacity="0.45"
        />

        {/* Reg-ball reference (faded — visual proof TEKKY is smaller) */}
        <g transform={`translate(60, ${FOOT_Y - 6})`} opacity="0.22">
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

      {/* Stat overlay bottom */}
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        <StatChip
          label="Age"
          value={age >= 24 ? `${age}` : `U-${age}`}
          color={kit.primary}
        />
        <StatChip
          label="Height"
          value={`${Math.floor(heightInches / 12)}'${heightInches % 12}"`}
          color={kit.primary}
        />
        <StatChip
          label="Tier"
          value={kit.name.split(" ")[0]}
          color={kit.primary}
        />
      </div>
    </div>
  );
}

/** 5-point star with a soft glow halo. Used for the skill aura. */
function Star({
  cx,
  cy,
  size,
  color,
  glowColor,
  opacity,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  glowColor: string;
  opacity: number;
}) {
  // Generate a 5-point star path centered at (0,0)
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size * 0.42;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
  }
  return (
    <g transform={`translate(${cx}, ${cy})`} opacity={opacity}>
      {/* Soft glow */}
      <circle r={size * 2.5} fill={glowColor} opacity="0.22" />
      <polygon points={pts.join(" ")} fill={color} />
      {/* Inner highlight */}
      <polygon
        points={pts
          .map((p) => {
            const [x, y] = p.split(",").map(Number);
            return `${x * 0.5},${y * 0.5}`;
          })
          .join(" ")}
        fill="#ffffff"
        opacity="0.4"
      />
    </g>
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
