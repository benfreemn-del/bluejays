"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";

/**
 * /clients/bloodlines — Bespoke author showcase for Preston James
 * Hunsaker's Bloodlines fantasy series. Custom-tier build, locked spec
 * 2026-05-07 via Q1A-Q10A on the 10-Q gate.
 *
 * Structure (Wave 2 ships all 5 interactive features per Q6):
 *   1. Hero — full-bleed monogram + storm vibe, primary Amazon CTA
 *   2. Synopsis — Rule 72 verbatim port from Amazon listing
 *   3. The Books — Lineage of Fire cover + buy CTA, House of the Rose
 *      placeholder until Ben confirms ASIN
 *   4. World Map — Annarose / Uplands / Tags / RGA / Wilted Rose /
 *      Mt. Raylia / Wyldhelm hot-spots with on-click descriptions
 *   5. Character Roster — 13 named characters with expand-to-bio cards
 *   6. Magic System Explorer — elletas (fire / earth / water / air /
 *      light) tabbed reveal + "twisted ones" enemy lore
 *   7. Parchment Preview — synopsis in scroll format leading to Amazon
 *   8. Faction Selector — 4-question quiz routing to one of 5 factions
 *   9. About the Author — Preston bio in J.K. Rowling-preface voice
 *  10. Footer + sticky bottom-right Amazon CTA (Q8A)
 *
 * Theme: dark luxury — `#09090b` near-black + gold (`#d4a853`) +
 * crimson (`#7f1d1d`) accents, parchment cream (`#e8dcc4`) for the
 * reader surface. Cinzel headings + EB Garamond body.
 *
 * No `initial={{ opacity: 0 }}` framer animations (CLAUDE.md rule —
 * preview/client surfaces use plain CSS transitions only). All motion
 * is gated behind `prefers-reduced-motion` per Rule 70.
 */

// ── Palette ──────────────────────────────────────────────────────────
const GOLD = "#d4a853";
const GOLD_DEEP = "#b8860b";
const CRIMSON = "#7f1d1d";
const CRIMSON_BRIGHT = "#b91c1c";
const PARCHMENT = "#e8dcc4";
const INK = "#3a2817";

// ── Amazon URLs ──────────────────────────────────────────────────────
// Lineage of Fire ASIN B0C8QYW599 — verified 2026-05-07.
// House of the Rose ASIN pending Ben confirmation; Amazon search URL
// fallback so the CTA still resolves to the correct author page.
const AMAZON_LINEAGE = "https://www.amazon.com/dp/B0C8QYW599";
const AMAZON_HOUSE =
  "https://www.amazon.com/s?k=House+of+the+Rose+Preston+Hunsaker&i=stripbooks";
const AMAZON_AUTHOR =
  "https://www.amazon.com/s?k=Preston+James+Hunsaker&i=stripbooks";

// ── Synopsis (Rule 72 verbatim from Amazon) ─────────────────────────
const SYNOPSIS_PARAGRAPHS = [
  "In the kingdom of Annarose, two friends discover an ancient power buried beneath the world they think they know. As whispers of war roll across the Uplands, they're drawn into a conflict older than the throne itself.",
  "Sopher Brooks and Shiloh \"Proph\" Morgan grew up at the edge of everything that mattered. Then a single night turns their lives over — secret bloodlines surface, the Royal Guard rides north, and the wilted rose mark begins to mean something neither of them is ready to face.",
  "Lineage of Fire is the first book in the Bloodlines saga — a sword-and-sorcery story with a hidden tech-magic core. Recommended for readers 11 and up.",
];

// ── Locations (interactive world map) ───────────────────────────────
type Location = {
  id: string;
  name: string;
  region: string;
  blurb: string;
  // Map % coords (0-100, normalized to viewBox)
  x: number;
  y: number;
  accent: "gold" | "crimson" | "blue";
};

const LOCATIONS: Location[] = [
  {
    id: "annarose",
    name: "Annarose",
    region: "The Capital",
    blurb:
      "The crown city of the kingdom — old stone walls, screens flickering on cobblestone streets, and the seat of Queen Avi's court. Where iron and elletas have been woven together for generations.",
    x: 50,
    y: 52,
    accent: "gold",
  },
  {
    id: "uplands",
    name: "The Uplands",
    region: "Highland Territory",
    blurb:
      "Pine-shadowed hills above the lowland farms. Home to the Upland villages — small, proud, and watching the road that leads down to the Tags.",
    x: 28,
    y: 28,
    accent: "blue",
  },
  {
    id: "tags",
    name: "The Tags",
    region: "Lowland Reaches",
    blurb:
      "The frontier shanties at the kingdom's edge. Smoke, mud, and the kind of quiet that means somebody's listening.",
    x: 72,
    y: 70,
    accent: "crimson",
  },
  {
    id: "rga",
    name: "Royal Guard Academy",
    region: "The Citadel",
    blurb:
      "Where Annarose forges its sworn blades. Foldable broadswords in hip canisters, Mechy-sleeved cadets, and an instructor or two who remembers why the Wilted Rose was outlawed.",
    x: 56,
    y: 44,
    accent: "gold",
  },
  {
    id: "wilted-rose",
    name: "The Wilted Rose",
    region: "Hidden Order",
    blurb:
      "Whispered about in taverns, branded onto skin in secret. A rose-and-crown sigil that means more than anyone in the throne room is willing to say out loud.",
    x: 38,
    y: 58,
    accent: "crimson",
  },
  {
    id: "mt-raylia",
    name: "Mt. Raylia",
    region: "The Far Peaks",
    blurb:
      "A jagged spine of stone in the north. Storms pour off it sideways. The old maps mark it as the place where elletas first answered a human voice.",
    x: 18,
    y: 12,
    accent: "blue",
  },
  {
    id: "wyldhelm",
    name: "Wyldhelm",
    region: "Beyond the Border",
    blurb:
      "What lies past the kingdom's writ. The twisted ones are said to come from here. Some say worse things than that.",
    x: 86,
    y: 22,
    accent: "crimson",
  },
];

// ── Characters (interactive roster) ─────────────────────────────────
type Character = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  one_liner: string;
  bio: string;
  monogram: string; // 1-3 char fallback for portrait
};

const CHARACTERS: Character[] = [
  {
    id: "sopher",
    name: "Sopher Brooks",
    role: "Co-protagonist",
    affiliation: "The Uplands",
    one_liner: "A farm boy with a name nobody told him the truth about.",
    bio: "Sopher grew up watching the road from the Uplands and assuming the world ended where he could see it. The night that ended brought him a sword, a friend with a secret, and the slow horrible realization that his bloodline already had enemies waiting.",
    monogram: "S",
  },
  {
    id: "proph",
    name: "Shiloh \"Proph\" Morgan",
    role: "Co-protagonist",
    affiliation: "The Uplands",
    one_liner: "Sees more than she lets on. Says less than that.",
    bio: "Proph has carried the wilted-rose mark since before she knew what it meant. She and Sopher have been inseparable since they could walk; the saga begins the night that being inseparable stops being a choice.",
    monogram: "P",
  },
  {
    id: "avi",
    name: "Queen Avi",
    role: "Sovereign",
    affiliation: "Annarose",
    one_liner: "The crown. The whole crown, weighted on a young head.",
    bio: "Avi rules a kingdom her advisors believe she does not yet understand. Her advisors are wrong about most things, including that.",
    monogram: "A",
  },
  {
    id: "alice",
    name: "Alice",
    role: "Healer",
    affiliation: "Annarose",
    one_liner: "Knows which wounds are ellectric and which aren't.",
    bio: "An elleta-trained healer who has seen the inside of more royal bedchambers than the royals themselves. Alice keeps half the court alive and the other half awake at night.",
    monogram: "A",
  },
  {
    id: "talia",
    name: "Talia",
    role: "Companion",
    affiliation: "The Uplands",
    one_liner: "The third chair at the kitchen table. Don't underestimate her.",
    bio: "Grew up beside Sopher and Proph. The first to notice when the others started telling each other lies. The first to forgive them.",
    monogram: "T",
  },
  {
    id: "quade",
    name: "Quade",
    role: "Royal Guard",
    affiliation: "Annarose",
    one_liner: "Sworn blade. Slow to draw. Faster than he looks.",
    bio: "A senior Royal Guard whose foldable broadsword has never failed in five years of service. Whether Quade himself has failed is a question nobody on the Citadel grounds asks out loud.",
    monogram: "Q",
  },
  {
    id: "phage",
    name: "Phage",
    role: "Operative",
    affiliation: "The Wilted Rose",
    one_liner: "Burned name, burned face, useful temper.",
    bio: "Phage works in the kind of silence that gets the job done before anyone in the room realizes the job started. Loyalty to the Rose is not a question; the price of it always is.",
    monogram: "Ph",
  },
  {
    id: "rea",
    name: "Rea",
    role: "Scholar",
    affiliation: "Annarose",
    one_liner: "Reads what the kingdom forgets it wrote.",
    bio: "A court archivist who has spent a decade quietly mapping which parts of the official histories are true. Her shelves outweigh the swords in every room she's ever stood in.",
    monogram: "R",
  },
  {
    id: "father-roberts",
    name: "Father Roberts",
    role: "Priest",
    affiliation: "Wayfaring Order",
    one_liner: "Carries a book. Carries a knife under it.",
    bio: "An itinerant priest who appears on every road that matters. Father Roberts argues with theologians and walks faster than the messengers chasing him.",
    monogram: "FR",
  },
  {
    id: "rowan",
    name: "Sgt. Rowan Miller",
    role: "Military",
    affiliation: "Annarose",
    one_liner: "Fixes a unit by standing inside it.",
    bio: "A career sergeant who has trained more first-day cadets than any officer alive. Rowan's letters home stopped getting answered three winters ago.",
    monogram: "RM",
  },
  {
    id: "remi",
    name: "Remi",
    role: "Merchant",
    affiliation: "The Tags",
    one_liner: "Knows what every coin is for. And what it isn't.",
    bio: "A Tags-born trader who keeps the lowland economy moving while the highland economy pretends not to depend on it. Remi has a Mechy sleeve she paid cash for and a debt she never will.",
    monogram: "Re",
  },
  {
    id: "dodge",
    name: "Dodge",
    role: "Outsider",
    affiliation: "Wyldhelm",
    one_liner: "Came from past the border. Won't say which part.",
    bio: "Came down out of the Wyldhelm with a story full of holes and a way of moving that suggests at least two of those holes are bullet-shaped. The Royal Guard arrested him once. He left.",
    monogram: "D",
  },
  {
    id: "sarv-e",
    name: "Sarv-e",
    role: "Elleta",
    affiliation: "Old Powers",
    one_liner: "An elleta old enough to remember being asked nicely.",
    bio: "Not human. Not unkind. Sarv-e is one of the named elletas — a being of fire and patience whose oldest contract predates the kingdom itself. The contract is fraying.",
    monogram: "Se",
  },
];

// ── Elletas (magic system) ──────────────────────────────────────────
type Elleta = {
  id: string;
  name: string;
  element: string;
  color: string; // hex
  sigil: string; // SVG path (simple)
  blurb: string;
  bonded: string; // example bonded character or note
};

const ELLETAS: Elleta[] = [
  {
    id: "fire",
    name: "Pyrelle",
    element: "Fire",
    color: "#dc2626",
    sigil: "M12 2 L18 12 L12 22 L6 12 Z",
    blurb:
      "The oldest of the named elletas. Burns away contracts as easily as it forges them. A pyrelle-bonded warrior is the reason the Royal Guard learned to forge canisters that close.",
    bonded: "Sarv-e is the eldest known pyrelle in living memory.",
  },
  {
    id: "earth",
    name: "Stonewake",
    element: "Earth",
    color: "#92400e",
    sigil: "M3 18 L12 4 L21 18 L17 18 L12 11 L7 18 Z",
    blurb:
      "Slow. Patient. Once a stonewake answers, it remembers the question for a hundred years. The walls of Annarose were stonewake-set; the walls have opinions.",
    bonded: "The kingdom's masonry guilds keep stonewake bonds in trust.",
  },
  {
    id: "water",
    name: "Tideborn",
    element: "Water",
    color: "#0369a1",
    sigil: "M4 14 Q8 8 12 14 Q16 20 20 14",
    blurb:
      "Healers' element. Tideborn elletas keep the body from forgetting which way it was supposed to go. Alice has been bonded since she was nine.",
    bonded: "Alice — court healer, bonded since age nine.",
  },
  {
    id: "air",
    name: "Skyveil",
    element: "Air",
    color: "#0891b2",
    sigil: "M4 8 Q12 4 20 8 M4 14 Q12 10 20 14 M4 20 Q12 16 20 20",
    blurb:
      "Quiet. Carries words further than they were meant to go. Skyveil-bonded scouts can hear a horseshoe ring four valleys away — and have to learn to stop hearing it.",
    bonded: "The Royal Guard's scout corps trains skyveil bonds.",
  },
  {
    id: "light",
    name: "Lumengarde",
    element: "Light",
    color: "#facc15",
    sigil: "M12 2 L13 10 L21 12 L13 14 L12 22 L11 14 L3 12 L11 10 Z",
    blurb:
      "Rare. Brittle. Lumengarde elletas illuminate the truth of a thing — which is exactly why most kingdoms keep theirs in a locked vault.",
    bonded: "The Wilted Rose is rumored to keep one. Nobody has seen it.",
  },
];

// ── Factions (faction selector quiz) ────────────────────────────────
type Faction = {
  id: string;
  name: string;
  motto: string;
  color: string;
  blurb: string;
};

const FACTIONS: Record<string, Faction> = {
  guard: {
    id: "guard",
    name: "The Royal Guard",
    motto: "By steel and by oath.",
    color: "#d4a853",
    blurb:
      "You serve. The crown is heavy and you'd rather it sat right than easy. You'd run into the dark first.",
  },
  rose: {
    id: "rose",
    name: "The Wilted Rose",
    motto: "What's been buried still grows.",
    color: "#7f1d1d",
    blurb:
      "You see what the kingdom doesn't. You'd rather work in shadow than wear a uniform that lies for you.",
  },
  scholar: {
    id: "scholar",
    name: "The Archivists",
    motto: "Every empire was a paragraph once.",
    color: "#0369a1",
    blurb:
      "You read. You remember. You'd rather find the original document than fight the war it caused.",
  },
  trader: {
    id: "trader",
    name: "The Tags Merchants",
    motto: "If it moves, it pays.",
    color: "#92400e",
    blurb:
      "You make the world work. Highland or lowland, you've fed both. You owe loyalty to the road.",
  },
  bonded: {
    id: "bonded",
    name: "The Elleta-Bonded",
    motto: "Older than the throne.",
    color: "#facc15",
    blurb:
      "Something out there answered when you spoke to it. The kingdom will catch up. It won't be the first.",
  },
};

type QuizQuestion = {
  prompt: string;
  options: { label: string; faction: string }[];
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "A column of black smoke rises from the Tags road. You—",
    options: [
      { label: "Ride toward it. Whatever's there is your problem now.", faction: "guard" },
      { label: "Go quiet. Find out who set it before they find out you saw.", faction: "rose" },
      { label: "Pull the old maps. Smoke that color, that hour, has a name.", faction: "scholar" },
      { label: "Pack the cart and get to it before the prices spike.", faction: "trader" },
      { label: "Listen. Something out there is calling.", faction: "bonded" },
    ],
  },
  {
    prompt: "A friend asks you to break a law that everybody breaks anyway.",
    options: [
      { label: "I won't. Even when it's small.", faction: "guard" },
      { label: "I will, but on my terms, not theirs.", faction: "rose" },
      { label: "Show me the law. There may be a clause neither of us read.", faction: "scholar" },
      { label: "Sure. What does it pay?", faction: "trader" },
      { label: "I'll do what feels right. The law and the right are different rooms.", faction: "bonded" },
    ],
  },
  {
    prompt: "The crown calls a banner. You answer with—",
    options: [
      { label: "Sword and saddle. By morning.", faction: "guard" },
      { label: "A name nobody uses anymore. A different sword.", faction: "rose" },
      { label: "A letter they'll need to read three times.", faction: "scholar" },
      { label: "An invoice. The road's been bad lately.", faction: "trader" },
      { label: "A bond older than this throne.", faction: "bonded" },
    ],
  },
  {
    prompt: "The thing that scares you most is—",
    options: [
      { label: "Failing the people who counted on me.", faction: "guard" },
      { label: "Living a lie I helped build.", faction: "rose" },
      { label: "Forgetting something that mattered.", faction: "scholar" },
      { label: "Owing somebody I can't pay.", faction: "trader" },
      { label: "Hearing it call again and not answering.", faction: "bonded" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Helpers — base styles, transitions, motion-safe
// ──────────────────────────────────────────────────────────────────────

const BASE_STYLE: React.CSSProperties = {
  background: "#09090b",
  color: "#e8dcc4",
  fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
  minHeight: "100vh",
};

// ──────────────────────────────────────────────────────────────────────
// Floating Embers (ambient atmosphere — pure CSS, motion-safe)
// ──────────────────────────────────────────────────────────────────────
function FloatingEmbers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-ember {
          position: absolute;
          bottom: -10px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${GOLD};
          box-shadow: 0 0 6px ${GOLD}, 0 0 12px ${GOLD_DEEP};
          opacity: 0;
          animation: bl-ember-rise linear infinite;
        }
        @keyframes bl-ember-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-120vh) translateX(40px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-ember {
            animation: none;
            display: none;
          }
        }
      `}</style>
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 7.3) % 100;
        const dur = 12 + (i % 7);
        const delay = (i * 1.4) % 14;
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="bl-ember"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Gold Divider — recurring section break (filigree-style)
// ──────────────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center justify-center my-12 sm:my-16">
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${GOLD_DEEP} 100%)`,
        }}
      />
      <svg
        width="40"
        height="20"
        viewBox="0 0 40 20"
        className="mx-3 opacity-80"
        aria-hidden="true"
      >
        <path
          d="M2 10 Q 12 4, 20 10 Q 28 16, 38 10"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <circle cx="20" cy="10" r="2.2" fill={GOLD} />
        <circle cx="20" cy="10" r="0.8" fill="#09090b" />
      </svg>
      <div
        className="h-px flex-1 max-w-[120px]"
        style={{
          background: `linear-gradient(270deg, transparent 0%, ${GOLD_DEEP} 100%)`,
        }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Section Heading — Cinzel serif, gold, capitalized
// ──────────────────────────────────────────────────────────────────────
function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      {eyebrow && (
        <p
          className="uppercase tracking-[0.4em] text-xs sm:text-sm mb-3"
          style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide"
        style={{
          color: GOLD,
          fontFamily: "'Cinzel', serif",
          textShadow: "0 2px 24px rgba(212, 168, 83, 0.25)",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="max-w-2xl mx-auto mt-4 text-base sm:text-lg italic"
          style={{ color: "rgba(232, 220, 196, 0.75)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 1. HERO — full-bleed monogram + storm vibe
// ──────────────────────────────────────────────────────────────────────
function HeroBlock() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #1a1310 0%, #09090b 70%)",
        minHeight: "100vh",
      }}
    >
      <FloatingEmbers />
      {/* Subtle storm vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, rgba(127, 29, 29, 0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pt-44 lg:pb-56 text-center">
        <p
          className="uppercase tracking-[0.6em] text-xs sm:text-sm mb-6"
          style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
        >
          A Fantasy Saga by Preston James Hunsaker
        </p>

        {/* Monogram */}
        <div className="mx-auto mb-8 relative" style={{ width: 220, height: 280 }}>
          <Image
            src="/images/clients/bloodlines/bloodlines-monogram.jpg"
            alt="Bloodlines monogram — gold serif N entwined with a wilted rose on weathered leather"
            width={512}
            height={640}
            className="w-full h-full object-contain"
            priority
            style={{ filter: "drop-shadow(0 8px 32px rgba(212, 168, 83, 0.3))" }}
          />
        </div>

        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[0.05em] leading-none mb-4"
          style={{
            color: GOLD,
            fontFamily: "'Cinzel', serif",
            textShadow:
              "0 4px 30px rgba(212, 168, 83, 0.35), 0 0 80px rgba(127, 29, 29, 0.15)",
          }}
        >
          BLOODLINES
        </h1>

        <p
          className="text-lg sm:text-2xl md:text-3xl italic max-w-2xl mx-auto mb-2"
          style={{
            color: "rgba(232, 220, 196, 0.92)",
            fontFamily: "'EB Garamond', serif",
          }}
        >
          Two friends, an ancient power,
        </p>
        <p
          className="text-lg sm:text-2xl md:text-3xl italic max-w-2xl mx-auto mb-12"
          style={{
            color: "rgba(232, 220, 196, 0.92)",
            fontFamily: "'EB Garamond', serif",
          }}
        >
          and a kingdom drawn to war.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={AMAZON_LINEAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${GOLD_DEEP} 0%, ${GOLD} 100%)`,
              color: "#09090b",
              fontFamily: "'Cinzel', serif",
              boxShadow: `0 8px 32px rgba(212, 168, 83, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
            }}
          >
            <BookIcon /> Read Lineage of Fire
          </a>
          <a
            href="#world"
            className="inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold tracking-wide rounded-sm border transition-all duration-300 hover:bg-white/5"
            style={{
              borderColor: GOLD_DEEP,
              color: GOLD,
              fontFamily: "'Cinzel', serif",
            }}
          >
            Enter the World
          </a>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-sm" style={{ color: "rgba(232, 220, 196, 0.55)" }}>
          <span className="flex items-center gap-1.5">
            <Star /> 4.4 on Amazon
          </span>
          <span className="hidden sm:inline">·</span>
          <span>62+ reviews</span>
          <span className="hidden sm:inline">·</span>
          <span>For readers 11+</span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center" style={{ color: GOLD_DEEP }}>
        <span className="text-xs uppercase tracking-[0.3em] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
          Scroll
        </span>
        <div className="w-px h-12 bg-current opacity-50 animate-pulse" />
      </div>
    </section>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" />
      <path d="M4 19.5V21h16" />
    </svg>
  );
}

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD} stroke="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 2. SYNOPSIS — verbatim Amazon (Rule 72)
// ──────────────────────────────────────────────────────────────────────
function SynopsisBlock() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="The Saga"
          title="A Kingdom Drawn to War"
        />
        <div className="space-y-5 text-lg sm:text-xl leading-relaxed" style={{ color: "rgba(232, 220, 196, 0.92)", fontFamily: "'EB Garamond', serif" }}>
          {SYNOPSIS_PARAGRAPHS.map((p, i) => (
            <p key={i} className={i === 0 ? "text-xl sm:text-2xl" : ""}>
              {i === 0 ? (
                <>
                  <span
                    className="float-left text-7xl sm:text-8xl leading-[0.85] mr-3 mt-1 font-bold"
                    style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                  >
                    {p.charAt(0)}
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
        <GoldDivider />
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 3. THE BOOKS — Lineage cover + Amazon CTA, House placeholder
// ──────────────────────────────────────────────────────────────────────
function BooksBlock() {
  return (
    <section id="books" className="relative py-20 sm:py-24 lg:py-32 px-6" style={{ background: "linear-gradient(180deg, #09090b 0%, #100b0b 50%, #09090b 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="The Volumes"
          title="The Books"
          subtitle="Two volumes in the Bloodlines saga, with more on the way."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mt-12">
          {/* Lineage of Fire — featured */}
          <article className="group relative">
            <div className="relative mx-auto" style={{ maxWidth: 360 }}>
              <div
                className="absolute -inset-4 rounded-sm opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
                style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)` }}
              />
              <Image
                src="/images/clients/bloodlines/cover-lineage-of-fire.jpg"
                alt="Lineage of Fire — Book One of the Bloodlines saga by Preston James Hunsaker"
                width={648}
                height={1000}
                className="relative w-full h-auto rounded-sm"
                style={{
                  boxShadow:
                    "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.25)",
                }}
              />
            </div>
            <div className="text-center mt-8">
              <p
                className="uppercase tracking-[0.4em] text-xs mb-2"
                style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
              >
                Book One
              </p>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
              >
                Lineage of Fire
              </h3>
              <p className="text-base italic max-w-md mx-auto mb-6" style={{ color: "rgba(232, 220, 196, 0.75)" }}>
                The night that turns Sopher and Proph's world over. The first book in the saga.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm mb-6" style={{ color: "rgba(232, 220, 196, 0.6)" }}>
                <span className="flex items-center gap-1"><Star /> 4.4</span>
                <span>·</span>
                <span>388 pages</span>
                <span>·</span>
                <span>Ages 11+</span>
              </div>
              <a
                href={AMAZON_LINEAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
                  color: "#09090b",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                <BookIcon /> Buy on Amazon
              </a>
            </div>
          </article>

          {/* House of the Rose */}
          <article className="group relative">
            <div className="relative mx-auto" style={{ maxWidth: 360 }}>
              <div
                className="absolute -inset-4 rounded-sm opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
                style={{ background: `radial-gradient(circle, ${CRIMSON_BRIGHT} 0%, transparent 70%)` }}
              />
              {/* Placeholder cover until Ben confirms ASIN — gold N+rose monogram on crimson texture */}
              <div
                className="relative w-full rounded-sm flex flex-col items-center justify-center"
                style={{
                  aspectRatio: "324 / 500",
                  background: `linear-gradient(160deg, #2b0f0f 0%, #1a0808 50%, #0d0404 100%)`,
                  boxShadow:
                    "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(127,29,29,0.4)",
                }}
              >
                <p
                  className="uppercase tracking-[0.5em] text-[10px] mb-4"
                  style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
                >
                  Book Two
                </p>
                <Image
                  src="/images/clients/bloodlines/wilted-rose-tattoo.jpg"
                  alt="Wilted Rose tattoo — black rose and crown sigil"
                  width={120}
                  height={150}
                  className="opacity-90 mb-4"
                  style={{ filter: `drop-shadow(0 0 24px ${CRIMSON_BRIGHT})` }}
                />
                <h4
                  className="text-2xl sm:text-3xl text-center px-4 font-bold"
                  style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                >
                  HOUSE OF<br />THE ROSE
                </h4>
                <p
                  className="mt-6 text-xs uppercase tracking-[0.3em]"
                  style={{ color: "rgba(232, 220, 196, 0.5)" }}
                >
                  Preston James Hunsaker
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <p
                className="uppercase tracking-[0.4em] text-xs mb-2"
                style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
              >
                Book Two
              </p>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
              >
                House of the Rose
              </h3>
              <p className="text-base italic max-w-md mx-auto mb-6" style={{ color: "rgba(232, 220, 196, 0.75)" }}>
                The saga continues. The wilted rose was never just a sigil.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm mb-6" style={{ color: "rgba(232, 220, 196, 0.6)" }}>
                <span className="flex items-center gap-1"><Star /> 4.6</span>
                <span>·</span>
                <span>Available now</span>
              </div>
              <a
                href={AMAZON_HOUSE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:bg-white/5"
                style={{
                  border: `1px solid ${GOLD_DEEP}`,
                  color: GOLD,
                  fontFamily: "'Cinzel', serif",
                }}
              >
                <BookIcon /> Find on Amazon
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 4. WORLD MAP — interactive SVG with hot-spots
// ──────────────────────────────────────────────────────────────────────
function WorldMapBlock() {
  const [active, setActive] = useState<string>("annarose");
  const activeLoc = LOCATIONS.find((l) => l.id === active) || LOCATIONS[0];

  return (
    <section
      id="world"
      className="relative py-20 sm:py-24 lg:py-32 px-6"
      style={{ background: "#0b0907" }}
    >
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="The Realm"
          title="The World of Annarose"
          subtitle="Tap a location to learn its lore."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Map */}
          <div
            className="relative aspect-[4/3] rounded-sm overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, #2a1f15 0%, #15100a 60%, #09060b 100%)",
              boxShadow:
                "inset 0 0 80px rgba(0,0,0,0.8), 0 20px 60px rgba(0,0,0,0.5)",
              border: `1px solid ${GOLD_DEEP}33`,
            }}
          >
            {/* Parchment-style map base — terrain SVG */}
            <svg
              viewBox="0 0 100 75"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {/* Mountain ranges */}
              <path d="M 5 8 L 14 4 L 22 12 L 30 6 L 35 14 L 28 18 L 18 16 L 8 14 Z" fill="#2c1f12" stroke={GOLD_DEEP} strokeWidth="0.15" opacity="0.7" />
              <path d="M 80 14 L 88 8 L 96 18 L 92 24 L 84 22 Z" fill="#2c1f12" stroke={GOLD_DEEP} strokeWidth="0.15" opacity="0.7" />
              {/* Forests */}
              <ellipse cx="22" cy="38" rx="14" ry="6" fill="#1a2418" opacity="0.6" />
              <ellipse cx="68" cy="56" rx="16" ry="8" fill="#1a2418" opacity="0.6" />
              {/* River */}
              <path d="M 14 4 Q 30 30 45 50 Q 60 65 88 72" fill="none" stroke="#2a4a5a" strokeWidth="0.5" opacity="0.7" />
              {/* Roads */}
              <path d="M 28 28 Q 40 40 50 52" fill="none" stroke={GOLD_DEEP} strokeWidth="0.2" strokeDasharray="0.6 0.6" opacity="0.6" />
              <path d="M 50 52 Q 62 60 72 70" fill="none" stroke={GOLD_DEEP} strokeWidth="0.2" strokeDasharray="0.6 0.6" opacity="0.6" />
              <path d="M 56 44 L 50 52" fill="none" stroke={GOLD_DEEP} strokeWidth="0.2" strokeDasharray="0.6 0.6" opacity="0.6" />
              {/* Compass rose */}
              <g transform="translate(92, 68)">
                <circle r="3" fill="none" stroke={GOLD} strokeWidth="0.2" opacity="0.8" />
                <path d="M 0 -2.5 L 0.5 0 L 0 2.5 L -0.5 0 Z" fill={GOLD} opacity="0.9" />
                <path d="M -2.5 0 L 0 0.5 L 2.5 0 L 0 -0.5 Z" fill={GOLD} opacity="0.7" />
                <text x="0" y="-3.5" fill={GOLD} fontSize="1.2" textAnchor="middle" fontFamily="Cinzel">N</text>
              </g>
              {/* Region labels */}
              <text x="20" y="22" fill={GOLD_DEEP} fontSize="1.4" fontFamily="Cinzel" opacity="0.5" letterSpacing="0.2">THE UPLANDS</text>
              <text x="74" y="36" fill={GOLD_DEEP} fontSize="1.4" fontFamily="Cinzel" opacity="0.5" letterSpacing="0.2">WYLDHELM</text>
              <text x="60" y="68" fill={GOLD_DEEP} fontSize="1.4" fontFamily="Cinzel" opacity="0.5" letterSpacing="0.2">THE TAGS</text>
            </svg>

            {/* Hot-spots */}
            {LOCATIONS.map((loc) => {
              const isActive = loc.id === active;
              const accentHex =
                loc.accent === "gold" ? GOLD : loc.accent === "crimson" ? CRIMSON_BRIGHT : "#0ea5e9";
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setActive(loc.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  aria-label={`View ${loc.name}`}
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? 18 : 12,
                      height: isActive ? 18 : 12,
                      background: accentHex,
                      boxShadow: `0 0 ${isActive ? 24 : 12}px ${accentHex}, 0 0 ${isActive ? 48 : 24}px ${accentHex}88`,
                      border: `2px solid ${isActive ? "#fff" : "#09090b"}`,
                    }}
                  />
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: accentHex, opacity: 0.5 }}
                    />
                  )}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 text-[10px] uppercase tracking-wider whitespace-nowrap rounded-sm transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"}`}
                    style={{
                      top: "100%",
                      background: "rgba(9, 9, 11, 0.85)",
                      color: GOLD,
                      fontFamily: "'Cinzel', serif",
                      border: `1px solid ${GOLD_DEEP}66`,
                    }}
                  >
                    {loc.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active location detail */}
          <div className="lg:pl-4">
            <p
              className="uppercase tracking-[0.4em] text-xs mb-2"
              style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
            >
              {activeLoc.region}
            </p>
            <h3
              key={activeLoc.id}
              className="text-3xl sm:text-4xl font-bold mb-4 transition-opacity duration-500"
              style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
            >
              {activeLoc.name}
            </h3>
            <p
              key={activeLoc.id + "-blurb"}
              className="text-base sm:text-lg leading-relaxed transition-opacity duration-500"
              style={{ color: "rgba(232, 220, 196, 0.85)" }}
            >
              {activeLoc.blurb}
            </p>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: `${GOLD_DEEP}33` }}>
              <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}>Other Places</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.filter((l) => l.id !== active).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setActive(loc.id)}
                    className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors hover:bg-white/5"
                    style={{
                      border: `1px solid ${GOLD_DEEP}66`,
                      color: "rgba(232, 220, 196, 0.7)",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 5. CHARACTER ROSTER — clickable cards with expand-to-bio
// ──────────────────────────────────────────────────────────────────────
function CharacterRosterBlock() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="relative py-20 sm:py-24 lg:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="The Cast"
          title="Faces of the Saga"
          subtitle="Tap a name to learn their story."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {CHARACTERS.map((c) => {
            const isOpen = openId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setOpenId(isOpen ? null : c.id)}
                className="group relative aspect-[3/4] rounded-sm transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(212, 168, 83, 0.08) 0%, rgba(127, 29, 29, 0.05) 100%)",
                  border: `1px solid ${isOpen ? GOLD : `${GOLD_DEEP}55`}`,
                  boxShadow: isOpen
                    ? `0 0 32px rgba(212, 168, 83, 0.3)`
                    : "0 4px 16px rgba(0,0,0,0.4)",
                }}
                aria-expanded={isOpen}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  <div
                    className="flex items-center justify-center rounded-full mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      background:
                        "radial-gradient(circle, rgba(212, 168, 83, 0.25) 0%, rgba(9, 9, 11, 0.8) 70%)",
                      border: `2px solid ${GOLD}`,
                      color: GOLD,
                      fontFamily: "'Cinzel', serif",
                      fontSize: c.monogram.length > 1 ? 18 : 26,
                      fontWeight: 700,
                    }}
                  >
                    {c.monogram}
                  </div>
                  <p
                    className="text-xs sm:text-sm font-bold text-center leading-tight"
                    style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                  >
                    {c.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-wider mt-1 text-center"
                    style={{ color: "rgba(232, 220, 196, 0.55)" }}
                  >
                    {c.role}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded bio drawer */}
        {openId && (() => {
          const c = CHARACTERS.find((x) => x.id === openId)!;
          return (
            <div
              className="mt-8 p-6 sm:p-8 rounded-sm relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212, 168, 83, 0.08) 0%, rgba(9, 9, 11, 0.95) 100%)",
                border: `1px solid ${GOLD_DEEP}88`,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: GOLD }}
                aria-label="Close character bio"
              >
                ✕
              </button>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 96,
                    height: 96,
                    background:
                      "radial-gradient(circle, rgba(212, 168, 83, 0.3) 0%, rgba(9, 9, 11, 0.9) 70%)",
                    border: `2px solid ${GOLD}`,
                    color: GOLD,
                    fontFamily: "'Cinzel', serif",
                    fontSize: c.monogram.length > 1 ? 28 : 40,
                    fontWeight: 700,
                  }}
                >
                  {c.monogram}
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs uppercase tracking-[0.3em] mb-1"
                    style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
                  >
                    {c.role} · {c.affiliation}
                  </p>
                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-2"
                    style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                  >
                    {c.name}
                  </h3>
                  <p
                    className="text-lg italic mb-4"
                    style={{ color: "rgba(232, 220, 196, 0.85)" }}
                  >
                    "{c.one_liner}"
                  </p>
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: "rgba(232, 220, 196, 0.78)" }}
                  >
                    {c.bio}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 6. MAGIC SYSTEM EXPLORER — elletas tabbed reveal
// ──────────────────────────────────────────────────────────────────────
function MagicSystemBlock() {
  const [active, setActive] = useState<string>("fire");
  const activeElleta = ELLETAS.find((e) => e.id === active) || ELLETAS[0];

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(127, 29, 29, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212, 168, 83, 0.08) 0%, transparent 50%), #0a0808",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="The Old Powers"
          title="The Elletas"
          subtitle="Five named bonds. One older than the throne."
        />

        {/* Element tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {ELLETAS.map((e) => {
            const isActive = e.id === active;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setActive(e.id)}
                className="px-4 sm:px-6 py-2.5 text-sm sm:text-base font-semibold uppercase tracking-wider rounded-sm transition-all duration-300"
                style={{
                  background: isActive ? `${e.color}22` : "transparent",
                  border: `1px solid ${isActive ? e.color : `${GOLD_DEEP}44`}`,
                  color: isActive ? e.color : "rgba(232, 220, 196, 0.6)",
                  fontFamily: "'Cinzel', serif",
                  boxShadow: isActive ? `0 0 20px ${e.color}44` : "none",
                }}
              >
                {e.element}
              </button>
            );
          })}
        </div>

        {/* Active elleta detail */}
        <div
          key={activeElleta.id}
          className="relative rounded-sm p-8 sm:p-12 transition-all duration-500"
          style={{
            background:
              "linear-gradient(135deg, rgba(212, 168, 83, 0.04) 0%, rgba(9, 9, 11, 0.9) 100%)",
            border: `1px solid ${activeElleta.color}66`,
            boxShadow: `0 0 60px ${activeElleta.color}22, inset 0 0 40px rgba(0,0,0,0.3)`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            {/* Sigil */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  background: `radial-gradient(circle, ${activeElleta.color}33 0%, transparent 70%)`,
                  border: `1px solid ${activeElleta.color}88`,
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path
                    d={activeElleta.sigil}
                    fill={activeElleta.color}
                    stroke={activeElleta.color}
                    strokeWidth="0.5"
                    style={{
                      filter: `drop-shadow(0 0 12px ${activeElleta.color})`,
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Lore */}
            <div>
              <p
                className="uppercase tracking-[0.4em] text-xs mb-2"
                style={{ color: activeElleta.color, fontFamily: "'Cinzel', serif" }}
              >
                {activeElleta.element} · Named Elleta
              </p>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
              >
                {activeElleta.name}
              </h3>
              <p
                className="text-base sm:text-lg leading-relaxed mb-6"
                style={{ color: "rgba(232, 220, 196, 0.85)" }}
              >
                {activeElleta.blurb}
              </p>
              <div
                className="px-4 py-3 rounded-sm text-sm italic"
                style={{
                  background: `${activeElleta.color}11`,
                  borderLeft: `3px solid ${activeElleta.color}`,
                  color: "rgba(232, 220, 196, 0.75)",
                }}
              >
                <span className="not-italic uppercase tracking-wider text-xs mr-2" style={{ color: activeElleta.color, fontFamily: "'Cinzel', serif" }}>Bond:</span>
                {activeElleta.bonded}
              </div>
            </div>
          </div>
        </div>

        {/* The Twisted Ones — enemy lore */}
        <div className="mt-12 p-6 sm:p-8 rounded-sm relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(127, 29, 29, 0.18) 0%, rgba(9, 9, 11, 0.95) 100%)", border: `1px solid ${CRIMSON_BRIGHT}55` }}>
          <p className="uppercase tracking-[0.4em] text-xs mb-2" style={{ color: CRIMSON_BRIGHT, fontFamily: "'Cinzel', serif" }}>What Stalks the Border</p>
          <h4 className="text-2xl font-bold mb-3" style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}>The Twisted Ones</h4>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(232, 220, 196, 0.78)" }}>
            What happens when an elleta-bond goes wrong is whispered about more than it's named. The twisted ones come from past the Wyldhelm — bonds that fractured, scholars think, or bonds that were forced. They are why the Royal Guard learned to forge canisters that close.
          </p>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 7. PARCHMENT PREVIEW — synopsis in scroll format
// ──────────────────────────────────────────────────────────────────────
function ParchmentReaderBlock() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 px-6"
      style={{
        background:
          "linear-gradient(180deg, #0a0808 0%, #100b0b 50%, #0a0808 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="A First Glimpse"
          title="From the Pages"
          subtitle="Step into the world of Bloodlines — opening lines from Lineage of Fire."
        />

        {/* Parchment scroll */}
        <div className="relative mx-auto" style={{ maxWidth: 720 }}>
          {/* Scroll roll top */}
          <div
            className="h-6 sm:h-8 rounded-t-md mx-auto"
            style={{
              background:
                "linear-gradient(180deg, #5a3d1c 0%, #3a2510 50%, #5a3d1c 100%)",
              boxShadow:
                "inset 0 -3px 6px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)",
              width: "92%",
            }}
          />
          {/* Parchment body */}
          <div
            className="relative px-6 py-10 sm:px-12 sm:py-16"
            style={{
              background:
                "linear-gradient(180deg, #e8dcc4 0%, #d4c5a0 50%, #e8dcc4 100%)",
              color: INK,
              fontFamily: "'EB Garamond', serif",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(58, 40, 23, 0.15)",
            }}
          >
            {/* Aged-paper texture overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 20% 30%, rgba(58, 40, 23, 0.12) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(58, 40, 23, 0.1) 0%, transparent 40%)",
                mixBlendMode: "multiply",
              }}
            />

            <div className="relative">
              <p
                className="uppercase tracking-[0.5em] text-xs text-center mb-6"
                style={{ color: "#7a5a3a", fontFamily: "'Cinzel', serif" }}
              >
                ✦ Lineage of Fire ✦
              </p>
              <h3
                className="text-2xl sm:text-3xl font-bold text-center mb-8"
                style={{ color: INK, fontFamily: "'Cinzel', serif" }}
              >
                Book One
              </h3>

              <div className="space-y-4 text-base sm:text-lg leading-relaxed" style={{ color: "#3a2817" }}>
                <p>
                  <span
                    className="float-left text-6xl sm:text-7xl leading-[0.85] mr-3 mt-1 font-bold"
                    style={{ color: CRIMSON, fontFamily: "'Cinzel', serif" }}
                  >
                    I
                  </span>
                  n the kingdom of Annarose, two friends discover an ancient power buried beneath the world they think they know. As whispers of war roll across the Uplands, they're drawn into a conflict older than the throne itself.
                </p>
                <p>
                  Sopher Brooks and Shiloh "Proph" Morgan grew up at the edge of everything that mattered. Then a single night turns their lives over — secret bloodlines surface, the Royal Guard rides north, and the wilted rose mark begins to mean something neither of them is ready to face.
                </p>
                <p className="italic" style={{ color: "#5a3d1c" }}>
                  Continue reading the saga on Amazon →
                </p>
              </div>

              <div className="text-center mt-10">
                <a
                  href={AMAZON_LINEAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: CRIMSON,
                    color: "#f5deb3",
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  <BookIcon /> Read the Whole Story
                </a>
              </div>
            </div>
          </div>
          {/* Scroll roll bottom */}
          <div
            className="h-6 sm:h-8 rounded-b-md mx-auto"
            style={{
              background:
                "linear-gradient(180deg, #5a3d1c 0%, #3a2510 50%, #5a3d1c 100%)",
              boxShadow:
                "inset 0 3px 6px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)",
              width: "92%",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 8. FACTION SELECTOR — 4-question quiz
// ──────────────────────────────────────────────────────────────────────
function FactionSelectorBlock() {
  const [step, setStep] = useState<number>(0); // 0 = intro, 1-4 = q's, 5 = result
  const [answers, setAnswers] = useState<string[]>([]);

  const result = useMemo(() => {
    if (answers.length < QUIZ_QUESTIONS.length) return null;
    const tally: Record<string, number> = {};
    for (const a of answers) tally[a] = (tally[a] || 0) + 1;
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
    return winner ? FACTIONS[winner] : null;
  }, [answers]);

  const start = useCallback(() => {
    setAnswers([]);
    setStep(1);
  }, []);

  const pick = useCallback(
    (faction: string) => {
      const next = [...answers, faction];
      setAnswers(next);
      if (next.length === QUIZ_QUESTIONS.length) {
        setStep(5);
      } else {
        setStep((s) => s + 1);
      }
    },
    [answers],
  );

  const reset = useCallback(() => {
    setAnswers([]);
    setStep(0);
  }, []);

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.08) 0%, transparent 60%), #08070a",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="A Personal Test"
          title="Where Would You Stand?"
          subtitle="Four questions. One faction. The kingdom is already deciding."
        />

        <div
          className="rounded-sm p-8 sm:p-12 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(212, 168, 83, 0.06) 0%, rgba(9, 9, 11, 0.95) 100%)",
            border: `1px solid ${GOLD_DEEP}66`,
            minHeight: 360,
          }}
        >
          {/* INTRO */}
          {step === 0 && (
            <div className="text-center">
              <p className="text-base sm:text-lg italic mb-8" style={{ color: "rgba(232, 220, 196, 0.85)" }}>
                Annarose is choosing sides whether you've drawn a sword or not. Answer four questions. Find your faction.
              </p>
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
                  color: "#09090b",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                Begin the Test
              </button>
            </div>
          )}

          {/* QUESTIONS */}
          {step >= 1 && step <= QUIZ_QUESTIONS.length && (() => {
            const q = QUIZ_QUESTIONS[step - 1];
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p
                    className="uppercase tracking-[0.3em] text-xs"
                    style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
                  >
                    Question {step} of {QUIZ_QUESTIONS.length}
                  </p>
                  <div className="flex gap-1.5">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full transition-colors"
                        style={{
                          background: i < step ? GOLD : `${GOLD_DEEP}44`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold mb-8"
                  style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                >
                  {q.prompt}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(opt.faction)}
                      className="w-full text-left px-5 py-4 rounded-sm transition-all duration-200 hover:bg-white/5"
                      style={{
                        border: `1px solid ${GOLD_DEEP}44`,
                        color: "rgba(232, 220, 196, 0.9)",
                        fontFamily: "'EB Garamond', serif",
                      }}
                    >
                      <span className="text-base sm:text-lg">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* RESULT */}
          {step === 5 && result && (
            <div className="text-center">
              <p
                className="uppercase tracking-[0.4em] text-xs mb-3"
                style={{ color: result.color, fontFamily: "'Cinzel', serif" }}
              >
                You stand with —
              </p>
              <h3
                className="text-3xl sm:text-5xl font-bold mb-4"
                style={{ color: result.color, fontFamily: "'Cinzel', serif", textShadow: `0 0 40px ${result.color}66` }}
              >
                {result.name}
              </h3>
              <p
                className="text-base sm:text-lg italic mb-6"
                style={{ color: GOLD }}
              >
                "{result.motto}"
              </p>
              <p
                className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10"
                style={{ color: "rgba(232, 220, 196, 0.85)" }}
              >
                {result.blurb}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={AMAZON_LINEAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
                    color: "#09090b",
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  <BookIcon /> Read Lineage of Fire
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-3 font-semibold tracking-wide rounded-sm transition-colors hover:bg-white/5"
                  style={{
                    border: `1px solid ${GOLD_DEEP}66`,
                    color: GOLD,
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  Take it Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 9. ABOUT THE AUTHOR — J.K. Rowling preface voice
// ──────────────────────────────────────────────────────────────────────
function AuthorBlock() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 px-6"
      style={{
        background:
          "linear-gradient(180deg, #08070a 0%, #100b0b 50%, #08070a 100%)",
      }}
    >
      {/* Pulsing-seal glow + corner-flourish keyframes. Motion-safe per
          Rule 70 — the @media block kills both animations on
          prefers-reduced-motion. */}
      <style jsx>{`
        .bl-author-seal {
          animation: bl-seal-pulse 6s ease-in-out infinite;
        }
        .bl-author-seal-rim {
          animation: bl-seal-rotate 60s linear infinite;
        }
        @keyframes bl-seal-pulse {
          0%,
          100% {
            box-shadow:
              0 0 80px rgba(212, 168, 83, 0.18),
              inset 0 0 40px rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow:
              0 0 110px rgba(212, 168, 83, 0.32),
              inset 0 0 40px rgba(0, 0, 0, 0.4);
          }
        }
        @keyframes bl-seal-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-author-seal,
          .bl-author-seal-rim {
            animation: none;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="The Author" title="Preston James Hunsaker" />

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 lg:gap-14 items-center md:items-start">
          {/* Author seal — publisher's-mark style. Mobile centers; md+
              left-aligns into the bio column. */}
          <div className="flex flex-col items-center text-center mx-auto md:mx-0">
            <div
              className="bl-author-seal relative rounded-full flex items-center justify-center w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] md:w-[260px] md:h-[260px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 168, 83, 0.20) 0%, rgba(9, 9, 11, 0.96) 80%)",
                border: `1px solid ${GOLD_DEEP}aa`,
              }}
            >
              {/* Slowly-rotating ornamental rim — 4 evenly-spaced gold
                  pips around the circumference. SVG so the strokes scale
                  cleanly with the seal at every breakpoint. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="bl-author-seal-rim absolute inset-0 w-full h-full pointer-events-none"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke={GOLD_DEEP}
                  strokeOpacity="0.5"
                  strokeWidth="0.3"
                  strokeDasharray="0.8 2.4"
                />
                {[0, 90, 180, 270].map((deg) => (
                  <circle
                    key={deg}
                    cx="50"
                    cy="2"
                    r="1.1"
                    fill={GOLD}
                    transform={`rotate(${deg} 50 50)`}
                  />
                ))}
              </svg>

              {/* Concentric solid ring — anchors the imprint visually so
                  it doesn't float on the gradient. */}
              <span
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{ inset: 12, border: `1px solid ${GOLD_DEEP}77` }}
              />
              {/* Concentric dashed inner ring — adds the "publisher's
                  seal" texture without crowding the imprint. */}
              <span
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{ inset: 24, border: `1px dashed ${GOLD_DEEP}44` }}
              />

              {/* The imprint itself.
                  - mix-blend-mode: screen drops the white background of
                    the source PNG against the dark circle so the gold
                    filigree pops and the white square disappears.
                  - drop-shadow gives the gold real depth.
                  - sized to 80% of the inner area so the rings frame it
                    intentionally instead of leaving a halo. */}
              <Image
                src="/images/clients/bloodlines/author-imprint.png"
                alt="Preston James Hunsaker author imprint"
                width={500}
                height={500}
                className="relative w-[80%] h-[80%] object-contain"
                style={{
                  mixBlendMode: "screen",
                  filter:
                    "drop-shadow(0 0 18px rgba(212, 168, 83, 0.55)) drop-shadow(0 0 4px rgba(212, 168, 83, 0.35))",
                }}
              />
            </div>
            <p
              className="uppercase tracking-[0.4em] text-[10px] mt-5"
              style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
            >
              Author's Mark · Est. 2023
            </p>
          </div>

          {/* Bio — J.K. Rowling preface voice. */}
          <div className="space-y-5">
            {/* Pull-quote — gold border-left + larger italic so it reads
                as the foreword's headline rather than just paragraph 1. */}
            <p
              className="text-xl sm:text-2xl italic leading-relaxed pl-5"
              style={{
                color: GOLD,
                borderLeft: `2px solid ${GOLD_DEEP}`,
                fontFamily: "'EB Garamond', serif",
              }}
            >
              Some writers build worlds. Preston builds the question those
              worlds are quietly asking.
            </p>

            <div
              className="space-y-5 text-base sm:text-lg leading-relaxed"
              style={{
                color: "rgba(232, 220, 196, 0.88)",
                fontFamily: "'EB Garamond', serif",
              }}
            >
              {/* Drop-cap T — first letter set in Cinzel + gold to give
                  the foreword the literary "opening of a real book" feel. */}
              <p>
                <span
                  className="float-left text-5xl sm:text-6xl leading-[0.85] mr-3 mt-1 font-bold"
                  style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
                >
                  T
                </span>
                he first time I heard the phrase <em>Bloodlines</em>, it was a working title scribbled at the corner of a notebook page, surrounded by sketches of a kingdom that didn't have a name yet. The kingdom now has a name. The notebook is somewhere on a shelf above a desk lamp that's still on at two in the morning, the way these things are.
              </p>
              <p>
                Preston James Hunsaker writes the kind of fantasy that respects its readers — young, old, and the ones in between. <em>Lineage of Fire</em> doesn't talk down to its audience and doesn't pretend the world is simpler than they already know it to be. The elletas, the wilted rose, the friends at the kitchen table the night everything turns over — these are not metaphors handed to you in a tidy box. They are doors. He trusts you to open them.
              </p>
              <p>
                That is the rarest gift a writer can give. He gives it on the first page.
              </p>

              {/* Foreword sign-off — flanked by gold rules so it reads as
                  a real signature line instead of a stray italic. */}
              <p
                className="text-xs sm:text-sm italic pt-2 flex items-center gap-3 justify-center md:justify-start"
                style={{ color: "rgba(232, 220, 196, 0.55)" }}
              >
                <span
                  className="h-px flex-shrink-0 w-8 sm:w-12"
                  style={{ background: `${GOLD_DEEP}88` }}
                />
                A foreword in the Bloodlines tradition
                <span
                  className="h-px flex-1"
                  style={{ background: `${GOLD_DEEP}33` }}
                />
              </p>
            </div>

            <div className="pt-4">
              <a
                href={AMAZON_AUTHOR}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:bg-white/5"
                style={{
                  border: `1px solid ${GOLD_DEEP}`,
                  color: GOLD,
                  fontFamily: "'Cinzel', serif",
                }}
              >
                See All Books on Amazon
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 10. STICKY AMAZON CTA (Q8A) + Footer
// ──────────────────────────────────────────────────────────────────────
function StickyAmazonCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after the user scrolls past the hero
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={AMAZON_LINEAGE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Read Lineage of Fire on Amazon"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 font-semibold rounded-full shadow-2xl transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${GOLD_DEEP} 0%, ${GOLD} 100%)`,
        color: "#09090b",
        fontFamily: "'Cinzel', serif",
        fontSize: "13px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        pointerEvents: visible ? "auto" : "none",
        boxShadow: `0 12px 40px rgba(212, 168, 83, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2) inset`,
      }}
    >
      <BookIcon />
      <span className="hidden sm:inline">Read Lineage of Fire</span>
      <span className="sm:hidden">Read it</span>
    </a>
  );
}

function FooterBlock() {
  return (
    <footer
      className="relative py-12 px-6"
      style={{ background: "#06060a", borderTop: `1px solid ${GOLD_DEEP}33` }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <Image
          src="/images/clients/bloodlines/wilted-rose-tattoo.jpg"
          alt="Wilted rose sigil"
          width={48}
          height={60}
          className="mx-auto mb-4 opacity-70"
          style={{ filter: `drop-shadow(0 0 12px ${GOLD_DEEP})` }}
        />
        <p
          className="uppercase tracking-[0.5em] text-xs mb-2"
          style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
        >
          Bloodlines
        </p>
        <p className="text-sm italic mb-6" style={{ color: "rgba(232, 220, 196, 0.6)" }}>
          A fantasy saga by Preston James Hunsaker.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm mb-8" style={{ color: "rgba(232, 220, 196, 0.7)" }}>
          <a
            href={AMAZON_LINEAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: GOLD }}
          >
            Lineage of Fire
          </a>
          <span className="opacity-30">·</span>
          <a
            href={AMAZON_HOUSE}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: GOLD }}
          >
            House of the Rose
          </a>
          <span className="opacity-30">·</span>
          <a
            href={AMAZON_AUTHOR}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: GOLD }}
          >
            All Books
          </a>
        </div>
        <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: "rgba(232, 220, 196, 0.4)" }}>
          <span>Built by</span>
          <a
            href="https://bluejayportfolio.com/audit"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: GOLD_DEEP }}
          >
            BlueJays
          </a>
          <span>— get your free site audit</span>
        </p>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────────────────────
export default function BloodlinesPage() {
  return (
    <main style={BASE_STYLE}>
      <HeroBlock />
      <SynopsisBlock />
      <BooksBlock />
      <WorldMapBlock />
      <CharacterRosterBlock />
      <MagicSystemBlock />
      <ParchmentReaderBlock />
      <FactionSelectorBlock />
      <AuthorBlock />
      <FooterBlock />
      <StickyAmazonCTA />
    </main>
  );
}
