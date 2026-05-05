"use client";

/**
 * TractorVisual — live SVG configurator that updates as the quiz
 * answers change. Side-view compact tractor in flat industrial style
 * (amber/charcoal palette to match the LP). Each accessory is a
 * separate SVG group that fades + scales in when the matching answer
 * is selected.
 *
 * Why SVG (not PNG layers): instant updates with no asset pipeline,
 * crisp at any size, easy to theme by brand color. Trade-off is no
 * photoreal detail — we lean into stylized "blueprint" feel which
 * matches the engineering/spec aesthetic ITC's brand uses on
 * itcquickattach.com.
 */

type Size = "backyard" | "hobby" | "pro" | "fleet" | undefined;
type UseCase =
  | "landscaping"
  | "firewood"
  | "hunting"
  | "farm"
  | "commercial"
  | undefined;
type Brand =
  | "tym"
  | "kioti"
  | "mahindra"
  | "branson"
  | "kubota"
  | "deere"
  | "other"
  | "shopping"
  | undefined;
type Pain =
  | "no-storage"
  | "saw-doesnt-fit"
  | "branch-scratches"
  | "loose-tools"
  | "low-light"
  | "chain-falls-off";

const BRAND_COLOR: Record<string, string> = {
  tym: "#dc2626", // TYM red
  kioti: "#f97316", // Kioti orange
  mahindra: "#dc2626", // Mahindra red
  branson: "#16a34a", // Branson green
  kubota: "#f97316",
  deere: "#16a34a", // JD green
  other: "#facc15",
  shopping: "#94a3b8",
};

const BRAND_LABEL: Record<string, string> = {
  tym: "TYM",
  kioti: "KIOTI",
  mahindra: "MAHINDRA",
  branson: "BRANSON",
  kubota: "KUBOTA",
  deere: "JOHN DEERE",
  other: "—",
  shopping: "?",
};

export function TractorVisual({
  size,
  useCase,
  brand,
  pains,
}: {
  size: Size;
  useCase: UseCase;
  brand: Brand;
  pains: Pain[];
}) {
  // Accessory toggles — each derived from answers.
  const showBrushGuard =
    pains.includes("branch-scratches") || useCase === "hunting" || useCase === "firewood";
  const showSawBoss =
    pains.includes("saw-doesnt-fit") ||
    pains.includes("chain-falls-off") ||
    useCase === "firewood";
  const showToolbox =
    pains.includes("no-storage") ||
    pains.includes("loose-tools") ||
    size === "pro" ||
    size === "fleet";
  const showLightBar = pains.includes("low-light") || useCase === "hunting";
  const showGunMount = useCase === "hunting";
  const showSteps = size === "pro" || size === "fleet" || size === "hobby";

  // Brand color drives the body fill.
  const bodyColor = brand ? BRAND_COLOR[brand] : "#facc15";
  const bodyColorDark = darken(bodyColor, 0.5);
  const brandLabel = brand ? BRAND_LABEL[brand] : "ITC";

  // Tractor scale — visual nod to size selection.
  const scale =
    size === "fleet" ? 1.1 : size === "pro" ? 1.05 : size === "backyard" ? 0.92 : 1.0;

  // Active accessory count for the spec sidebar.
  const accessories: Array<{ icon: string; label: string; active: boolean }> = [
    { icon: "🛡️", label: "Brush guard", active: showBrushGuard },
    { icon: "🪚", label: "SawBoss carrier", active: showSawBoss },
    { icon: "🧰", label: "Toolbox", active: showToolbox },
    { icon: "💡", label: "LED light bar", active: showLightBar },
    { icon: "🦌", label: "Gun mount", active: showGunMount },
    { icon: "🪜", label: "Tractor steps", active: showSteps },
  ];

  return (
    <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/40 to-black/60 p-4 sticky top-20">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold">
          ⚙️ Your build · live preview
        </span>
        <span className="text-[10px] text-amber-50/40">
          {accessories.filter((a) => a.active).length} accessor
          {accessories.filter((a) => a.active).length === 1 ? "y" : "ies"}
        </span>
      </div>

      <svg
        viewBox="0 0 480 300"
        className="w-full h-auto"
        style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))" }}
      >
        {/* Ground line */}
        <line
          x1="20"
          y1="265"
          x2="460"
          y2="265"
          stroke="#3f2d10"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          opacity="0.5"
        />

        <g
          transform={`translate(${(480 - 480 * scale) / 2}, ${(300 - 300 * scale) / 2}) scale(${scale})`}
        >
          {/* ───────── BACK WHEEL ───────── */}
          <circle cx="115" cy="240" r="42" fill="#0c0a09" stroke="#27272a" strokeWidth="2" />
          <circle cx="115" cy="240" r="32" fill="#1c1917" />
          <circle cx="115" cy="240" r="14" fill="#3f3f46" />
          {/* Tread marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={`bw-${deg}`}
              x1="115"
              y1="240"
              x2={115 + 40 * Math.cos((deg * Math.PI) / 180)}
              y2={240 + 40 * Math.sin((deg * Math.PI) / 180)}
              stroke="#27272a"
              strokeWidth="3"
            />
          ))}

          {/* ───────── FRONT WHEEL ───────── */}
          <circle cx="370" cy="252" r="28" fill="#0c0a09" stroke="#27272a" strokeWidth="2" />
          <circle cx="370" cy="252" r="20" fill="#1c1917" />
          <circle cx="370" cy="252" r="9" fill="#3f3f46" />

          {/* ───────── TRACTOR BODY ───────── */}
          {/* Hood */}
          <rect
            x="245"
            y="190"
            width="120"
            height="50"
            rx="4"
            fill={bodyColor}
            stroke={bodyColorDark}
            strokeWidth="2"
          />
          {/* Hood vent */}
          <rect x="280" y="200" width="40" height="3" fill={bodyColorDark} />
          <rect x="280" y="207" width="40" height="3" fill={bodyColorDark} />
          <rect x="280" y="214" width="40" height="3" fill={bodyColorDark} />

          {/* Headlight */}
          <circle cx="358" cy="210" r="6" fill="#fef9c3" stroke={bodyColorDark} strokeWidth="1" />

          {/* Cab base + body */}
          <rect
            x="80"
            y="160"
            width="170"
            height="80"
            rx="6"
            fill={bodyColor}
            stroke={bodyColorDark}
            strokeWidth="2"
          />

          {/* Cab pillars (ROPS) */}
          <rect x="100" y="80" width="6" height="90" fill="#1c1917" />
          <rect x="218" y="80" width="6" height="90" fill="#1c1917" />
          {/* Roof */}
          <rect x="92" y="76" width="138" height="8" rx="2" fill="#1c1917" />

          {/* Cab window */}
          <path
            d="M 110 90 L 220 90 L 220 158 L 110 158 Z"
            fill="#0ea5e9"
            opacity="0.25"
            stroke="#0369a1"
            strokeWidth="1.5"
          />
          {/* Window crossbar */}
          <line x1="165" y1="90" x2="165" y2="158" stroke="#0369a1" strokeWidth="1.5" />

          {/* Brand badge */}
          <rect
            x="270"
            y="220"
            width="70"
            height="14"
            rx="2"
            fill={bodyColorDark}
          />
          <text
            x="305"
            y="231"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="9"
            fontWeight="900"
            fill={brandLabel === "—" || brandLabel === "?" ? "#fef9c3" : "#fef9c3"}
            letterSpacing="1.5"
          >
            {brandLabel}
          </text>

          {/* Driver seat hint */}
          <rect x="155" y="135" width="22" height="14" rx="2" fill="#1c1917" opacity="0.7" />

          {/* Exhaust stack */}
          <rect x="240" y="140" width="6" height="55" fill="#1c1917" />
          <rect x="237" y="138" width="12" height="4" rx="1" fill="#52525b" />

          {/* ───────── ACCESSORIES (toggleable) ───────── */}

          {/* Brush guard — front of tractor, vertical bars */}
          <g
            opacity={showBrushGuard ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="362" y="195" width="3" height="50" fill="#52525b" />
            <rect x="370" y="190" width="3" height="55" fill="#52525b" />
            <rect x="378" y="195" width="3" height="50" fill="#52525b" />
            <rect x="358" y="200" width="26" height="3" fill="#52525b" rx="1" />
            <rect x="358" y="240" width="26" height="3" fill="#52525b" rx="1" />
            {/* Tag */}
            <text
              x="380"
              y="186"
              fontFamily="ui-sans-serif, system-ui"
              fontSize="8"
              fontWeight="700"
              fill="#facc15"
              letterSpacing="1"
            >
              ✓
            </text>
          </g>

          {/* SawBoss carrier — chainsaw on side of cab */}
          <g
            opacity={showSawBoss ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="56" y="200" width="22" height="32" rx="2" fill="#7c2d12" stroke="#3f2d10" strokeWidth="1" />
            <rect x="60" y="206" width="14" height="4" fill="#fbbf24" />
            <text
              x="67"
              y="222"
              fontFamily="ui-sans-serif, system-ui"
              fontSize="6"
              fontWeight="900"
              fill="#fde047"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              SAW
            </text>
            {/* Bar */}
            <rect x="32" y="214" width="28" height="3" fill="#0c0a09" />
            <rect x="30" y="213" width="3" height="5" fill="#0c0a09" />
          </g>

          {/* Toolbox — rectangular box on rear fender */}
          <g
            opacity={showToolbox ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="84" y="138" width="44" height="20" rx="2" fill="#1c1917" stroke="#52525b" strokeWidth="1.5" />
            <rect x="84" y="146" width="44" height="2" fill="#52525b" />
            <circle cx="120" cy="148" r="1.5" fill="#facc15" />
            <text
              x="106"
              y="152"
              fontFamily="ui-sans-serif, system-ui"
              fontSize="6"
              fontWeight="900"
              fill="#fef9c3"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              ITC
            </text>
          </g>

          {/* LED light bar — above ROPS */}
          <g
            opacity={showLightBar ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="100" y="60" width="120" height="10" rx="2" fill="#1c1917" stroke="#52525b" strokeWidth="1" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <rect
                key={`led-${i}`}
                x={104 + i * 11.5}
                y="63"
                width="8"
                height="4"
                rx="1"
                fill="#fef08a"
              />
            ))}
            {/* Light beams hint */}
            <path
              d="M 108 70 L 90 100 M 220 70 L 240 100"
              stroke="#fef08a"
              strokeWidth="1"
              opacity="0.4"
            />
          </g>

          {/* Gun mount — on right ROPS pillar */}
          <g
            opacity={showGunMount ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="226" y="100" width="6" height="38" fill="#3f2d10" />
            {/* Rifle stock */}
            <rect x="232" y="108" width="36" height="6" fill="#7c2d12" rx="1" />
            <rect x="268" y="110" width="6" height="2" fill="#27272a" />
            {/* Mount bracket */}
            <rect x="223" y="106" width="14" height="3" fill="#52525b" />
            <rect x="223" y="132" width="14" height="3" fill="#52525b" />
          </g>

          {/* Tractor steps — under cab */}
          <g
            opacity={showSteps ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="62" y="220" width="20" height="3" fill="#52525b" rx="1" />
            <rect x="62" y="234" width="20" height="3" fill="#52525b" rx="1" />
            <line x1="64" y1="220" x2="64" y2="240" stroke="#27272a" strokeWidth="2" />
            <line x1="80" y1="220" x2="80" y2="240" stroke="#27272a" strokeWidth="2" />
          </g>
        </g>
      </svg>

      {/* Spec sidebar — shows which accessories are active */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {accessories.map((a) => (
          <div
            key={a.label}
            className={`text-[10px] flex items-center gap-1.5 px-2 py-1 rounded border transition ${
              a.active
                ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                : "border-amber-900/30 bg-black/20 text-amber-50/30"
            }`}
          >
            <span className="text-sm">{a.icon}</span>
            <span className="truncate">{a.label}</span>
            {a.active && <span className="ml-auto text-amber-400 text-[8px]">●</span>}
          </div>
        ))}
      </div>
      <p className="text-[9px] text-amber-50/30 italic mt-2 text-center">
        Live render. Updates as you answer.
      </p>
    </div>
  );
}

/* Color util — darken a hex by ratio. */
function darken(hex: string, ratio: number): string {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return hex;
  const [r, g, b] = m.map((c) => parseInt(c, 16));
  const dr = Math.max(0, Math.round(r * (1 - ratio)));
  const dg = Math.max(0, Math.round(g * (1 - ratio)));
  const db = Math.max(0, Math.round(b * (1 - ratio)));
  return `#${[dr, dg, db].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
