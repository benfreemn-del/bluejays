"use client";

/**
 * TractorVisual — live SVG configurator that updates as the quiz
 * answers change. Side-view compact tractor in flat industrial style
 * (amber/charcoal palette to match the LP). Each accessory the user
 * toggles in the configurator has its own SVG group that fades in.
 *
 * The `picked` set is the SAME set the configurator manages — every
 * accessory ID maps 1:1 to an SVG layer (or, where overlapping makes
 * no sense like Milwaukee Packout vs Universal Toolbox, the layer
 * picks one). That guarantees every toggle has a visible effect.
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

export type AccessoryId =
  | "brush-guard"
  | "sawboss"
  | "toolbox"
  | "milwaukee-packout"
  | "light-kit"
  | "tractor-steps"
  | "firearm-mount"
  | "string-trimmer"
  | "fire-extinguisher"
  | "chainbox"
  | "gas-oil-carrier"
  | "rops-mount"
  | "loader-mount";

const BRAND_COLOR: Record<string, string> = {
  tym: "#dc2626",
  kioti: "#f97316",
  mahindra: "#dc2626",
  branson: "#16a34a",
  kubota: "#f97316",
  deere: "#16a34a",
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
  brand,
  picked,
}: {
  size: Size;
  /** Use case is now informational only — kept for future features. */
  useCase?: UseCase;
  brand: Brand;
  /** The accessory IDs the user has toggled on. Each one toggles
   *  its corresponding SVG layer. */
  picked: Set<AccessoryId>;
}) {
  // Each accessory toggle drives its own SVG group. No more deriving
  // from size/useCase — every toggle has a visible effect.
  const has = (a: AccessoryId) => picked.has(a);

  // If both Universal Toolbox AND Milwaukee Packout are picked, render
  // the Packout (red, more eye-catching). User said in earlier feedback
  // they want one slot.
  const showToolbox = has("toolbox") && !has("milwaukee-packout");
  const showPackout = has("milwaukee-packout");

  // Brand color drives the body fill.
  const bodyColor = brand ? BRAND_COLOR[brand] : "#facc15";
  const bodyColorDark = darken(bodyColor, 0.5);
  const brandLabel = brand ? BRAND_LABEL[brand] : "ITC";

  // Tractor scale — visual nod to size selection.
  const scale =
    size === "fleet" ? 1.1 : size === "pro" ? 1.05 : size === "backyard" ? 0.92 : 1.0;

  const accessoriesList: Array<{ id: AccessoryId; icon: string; label: string }> = [
    { id: "brush-guard", icon: "🛡️", label: "Brush guard" },
    { id: "sawboss", icon: "🪚", label: "SawBoss" },
    { id: "toolbox", icon: "🧰", label: "Toolbox" },
    { id: "milwaukee-packout", icon: "🟥", label: "Packout" },
    { id: "light-kit", icon: "💡", label: "LED bar" },
    { id: "tractor-steps", icon: "🪜", label: "Steps" },
    { id: "firearm-mount", icon: "🦌", label: "Gun mount" },
    { id: "string-trimmer", icon: "✂️", label: "Trimmer" },
    { id: "fire-extinguisher", icon: "🧯", label: "Fire ext." },
    { id: "chainbox", icon: "📦", label: "Chainbox" },
    { id: "gas-oil-carrier", icon: "⛽", label: "Gas/oil" },
    { id: "rops-mount", icon: "🔩", label: "ROPS mount" },
    { id: "loader-mount", icon: "🦾", label: "Loader mount" },
  ];

  return (
    <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/40 to-black/60 p-4 sticky top-20">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold">
          ⚙️ Your build · live preview
        </span>
        <span className="text-[10px] text-amber-50/40">
          {picked.size} accessor{picked.size === 1 ? "y" : "ies"}
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
          {/* ───────── LOADER ARM (only when loader-mount picked) ───────── */}
          <g
            opacity={has("loader-mount") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <line x1="365" y1="225" x2="445" y2="195" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
            <rect x="430" y="178" width="22" height="12" fill="#52525b" rx="1" />
            <text
              x="441"
              y="187"
              fontSize="6"
              fontWeight="900"
              fill="#fef9c3"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              ITC
            </text>
          </g>

          {/* ───────── BACK WHEEL ───────── */}
          <circle cx="115" cy="240" r="42" fill="#0c0a09" stroke="#27272a" strokeWidth="2" />
          <circle cx="115" cy="240" r="32" fill="#1c1917" />
          <circle cx="115" cy="240" r="14" fill="#3f3f46" />
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
          <rect x="280" y="200" width="40" height="3" fill={bodyColorDark} />
          <rect x="280" y="207" width="40" height="3" fill={bodyColorDark} />
          <rect x="280" y="214" width="40" height="3" fill={bodyColorDark} />
          <circle cx="358" cy="210" r="6" fill="#fef9c3" stroke={bodyColorDark} strokeWidth="1" />

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
          <rect x="92" y="76" width="138" height="8" rx="2" fill="#1c1917" />

          {/* Cab window */}
          <path
            d="M 110 90 L 220 90 L 220 158 L 110 158 Z"
            fill="#0ea5e9"
            opacity="0.25"
            stroke="#0369a1"
            strokeWidth="1.5"
          />
          <line x1="165" y1="90" x2="165" y2="158" stroke="#0369a1" strokeWidth="1.5" />

          {/* Brand badge */}
          <rect x="270" y="220" width="70" height="14" rx="2" fill={bodyColorDark} />
          <text
            x="305"
            y="231"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="9"
            fontWeight="900"
            fill="#fef9c3"
            letterSpacing="1.5"
          >
            {brandLabel}
          </text>

          {/* Driver seat hint */}
          <rect x="155" y="135" width="22" height="14" rx="2" fill="#1c1917" opacity="0.7" />

          {/* Exhaust stack */}
          <rect x="240" y="140" width="6" height="55" fill="#1c1917" />
          <rect x="237" y="138" width="12" height="4" rx="1" fill="#52525b" />

          {/* ─────── ACCESSORIES (each toggles independently) ─────── */}

          {/* Brush guard — front of tractor, vertical bars */}
          <g
            opacity={has("brush-guard") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="362" y="195" width="3" height="50" fill="#52525b" />
            <rect x="370" y="190" width="3" height="55" fill="#52525b" />
            <rect x="378" y="195" width="3" height="50" fill="#52525b" />
            <rect x="358" y="200" width="26" height="3" fill="#52525b" rx="1" />
            <rect x="358" y="240" width="26" height="3" fill="#52525b" rx="1" />
          </g>

          {/* SawBoss carrier — chainsaw on left side */}
          <g
            opacity={has("sawboss") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="56" y="200" width="22" height="32" rx="2" fill="#7c2d12" stroke="#3f2d10" strokeWidth="1" />
            <rect x="60" y="206" width="14" height="4" fill="#fbbf24" />
            <text x="67" y="222" fontSize="6" fontWeight="900" fill="#fde047" textAnchor="middle">SAW</text>
            <rect x="32" y="214" width="28" height="3" fill="#0c0a09" />
            <rect x="30" y="213" width="3" height="5" fill="#0c0a09" />
          </g>

          {/* Chainbox — small box next to SawBoss */}
          <g
            opacity={has("chainbox") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="56" y="240" width="22" height="14" rx="1" fill="#1c1917" stroke="#52525b" strokeWidth="1" />
            <rect x="56" y="245" width="22" height="2" fill="#52525b" />
            <text x="67" y="252" fontSize="5" fontWeight="900" fill="#fef9c3" textAnchor="middle">CHAIN</text>
          </g>

          {/* Universal Toolbox — neutral grey box on rear fender */}
          <g
            opacity={showToolbox ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="84" y="138" width="44" height="20" rx="2" fill="#1c1917" stroke="#52525b" strokeWidth="1.5" />
            <rect x="84" y="146" width="44" height="2" fill="#52525b" />
            <circle cx="120" cy="148" r="1.5" fill="#facc15" />
            <text x="106" y="152" fontSize="6" fontWeight="900" fill="#fef9c3" textAnchor="middle">ITC</text>
          </g>

          {/* Milwaukee Packout — red box (replaces toolbox if both picked) */}
          <g
            opacity={showPackout ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="84" y="138" width="44" height="20" rx="2" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.5" />
            <rect x="84" y="146" width="44" height="2" fill="#7f1d1d" />
            <circle cx="120" cy="148" r="1.5" fill="#000" />
            <text x="106" y="152" fontSize="6" fontWeight="900" fill="#fef9c3" textAnchor="middle">M18</text>
          </g>

          {/* LED light bar — above ROPS */}
          <g
            opacity={has("light-kit") ? 1 : 0}
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
            <path d="M 108 70 L 90 100 M 220 70 L 240 100" stroke="#fef08a" strokeWidth="1" opacity="0.4" />
          </g>

          {/* Gun mount — on right ROPS pillar */}
          <g
            opacity={has("firearm-mount") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="226" y="100" width="6" height="38" fill="#3f2d10" />
            <rect x="232" y="108" width="36" height="6" fill="#7c2d12" rx="1" />
            <rect x="268" y="110" width="6" height="2" fill="#27272a" />
            <rect x="223" y="106" width="14" height="3" fill="#52525b" />
            <rect x="223" y="132" width="14" height="3" fill="#52525b" />
          </g>

          {/* String trimmer — vertical pole behind cab */}
          <g
            opacity={has("string-trimmer") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <line x1="78" y1="100" x2="78" y2="200" stroke="#52525b" strokeWidth="3" />
            <circle cx="78" cy="98" r="6" fill="#1c1917" stroke="#52525b" strokeWidth="1" />
            <circle cx="78" cy="98" r="3" fill="#fde047" />
            <rect x="74" y="200" width="8" height="6" fill="#52525b" rx="1" />
          </g>

          {/* Fire extinguisher — red cylinder on left ROPS pillar */}
          <g
            opacity={has("fire-extinguisher") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="86" y="100" width="10" height="22" rx="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
            <rect x="88" y="96" width="6" height="5" fill="#0c0a09" />
            <rect x="84" y="106" width="14" height="2" fill="#fef9c3" />
            <text x="91" y="118" fontSize="4" fontWeight="900" fill="#fef9c3" textAnchor="middle">FIRE</text>
          </g>

          {/* Gas/oil carrier — gas can on rear */}
          <g
            opacity={has("gas-oil-carrier") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="60" y="170" width="20" height="22" rx="2" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
            <rect x="65" y="166" width="10" height="5" fill="#7f1d1d" />
            <rect x="62" y="178" width="16" height="3" fill="#fef9c3" />
            <text x="70" y="187" fontSize="4" fontWeight="900" fill="#fef9c3" textAnchor="middle">GAS</text>
          </g>

          {/* Tractor steps — under cab */}
          <g
            opacity={has("tractor-steps") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="62" y="220" width="20" height="3" fill="#52525b" rx="1" />
            <rect x="62" y="234" width="20" height="3" fill="#52525b" rx="1" />
            <line x1="64" y1="220" x2="64" y2="240" stroke="#27272a" strokeWidth="2" />
            <line x1="80" y1="220" x2="80" y2="240" stroke="#27272a" strokeWidth="2" />
          </g>

          {/* ROPS mount — small bracket on left ROPS pillar (subtle) */}
          <g
            opacity={has("rops-mount") ? 1 : 0}
            style={{ transition: "opacity 0.35s ease" }}
          >
            <rect x="96" y="130" width="8" height="3" fill="#facc15" rx="1" />
            <rect x="96" y="140" width="8" height="3" fill="#facc15" rx="1" />
            <circle cx="100" cy="135" r="1.5" fill="#000" />
          </g>
        </g>
      </svg>

      {/* Spec sidebar — shows which accessories are active */}
      <div className="mt-3 grid grid-cols-3 gap-1">
        {accessoriesList.map((a) => {
          const active = picked.has(a.id);
          return (
            <div
              key={a.id}
              className={`text-[9px] flex items-center gap-1 px-1.5 py-0.5 rounded border transition ${
                active
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
                  : "border-amber-900/30 bg-black/20 text-amber-50/30"
              }`}
            >
              <span className="text-xs">{a.icon}</span>
              <span className="truncate">{a.label}</span>
              {active && <span className="ml-auto text-amber-400 text-[7px]">●</span>}
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-amber-50/30 italic mt-2 text-center">
        Live render. Every toggle changes the tractor.
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
