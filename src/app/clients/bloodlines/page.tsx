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
const GOLD_LIGHT = "#f5deb3";
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
  emoji: string; // single character — characteristic glyph for the place
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
    emoji: "👑",
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
    emoji: "🌲",
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
    emoji: "🏚️",
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
    emoji: "⚔️",
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
    emoji: "🥀",
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
    emoji: "⛰️",
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
    emoji: "💀",
    x: 86,
    y: 22,
    accent: "crimson",
  },
  {
    id: "stonewake-halls",
    name: "Stonewake Halls",
    region: "Masonry Quarter",
    blurb:
      "Beneath Annarose's east curtain, the masonry guilds keep their stonewake bonds in trust. The walls here remember every footstep that has ever crossed them — and a few that haven't, yet.",
    emoji: "🪨",
    x: 44,
    y: 55,
    accent: "gold",
  },
  {
    id: "tideborn-wells",
    name: "Tideborn Wells",
    region: "Healers' Grove",
    blurb:
      "Spring-fed pools where the kingdom's tideborn-bonded healers train. Alice was nine when the water answered her here. The wells have been quieter ever since the Royal Guard started posting watchers.",
    emoji: "💧",
    x: 53,
    y: 47,
    accent: "blue",
  },
  {
    id: "skyveil-crags",
    name: "Skyveil Crags",
    region: "Scout Outposts",
    blurb:
      "A wind-scoured shelf high above the Far Peaks where skyveil-bonded scouts train to hear without listening. Cadets who can't learn to stop hearing the world don't come back down.",
    emoji: "🌬️",
    x: 10,
    y: 7,
    accent: "blue",
  },
  {
    id: "lumengarde-vault",
    name: "Lumengarde Vault",
    region: "Hidden Light",
    blurb:
      "Whispered to exist somewhere between the Wilted Rose's safe houses. A locked stone where a light-elleta is kept that illuminates the truth of any thing it shines on. Nobody alive admits to having seen it open.",
    emoji: "🔆",
    x: 32,
    y: 52,
    accent: "gold",
  },
  {
    id: "pyrelle-reach",
    name: "Pyrelle Reach",
    region: "Sarv-e's Vigil",
    blurb:
      "A scorched basin in the deep west where the eldest pyrelle keeps a contract older than the kingdom. Sarv-e is said to walk the ridge at dusk. The contract is fraying.",
    emoji: "🔥",
    x: 6,
    y: 42,
    accent: "crimson",
  },
  {
    id: "the-archives",
    name: "The Archives",
    region: "Scholar's Tower",
    blurb:
      "Rea's domain. A four-story tower at the edge of the palace grounds where every official history of Annarose is shelved — and where Rea quietly maps which parts of those histories are true.",
    emoji: "📜",
    x: 56,
    y: 50,
    accent: "gold",
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
// Atmospheric Layers — per-section ambient ties to lore
// ──────────────────────────────────────────────────────────────────────
// Pure CSS keyframes only (no JS animation libs, no framer for ambient
// loops per CLAUDE.md Rule 70). All animations gated behind
// prefers-reduced-motion. Each layer is positioned absolute inset-0 so
// it sits behind section content without intercepting clicks.
//
// Iteration logic for each layer:
//   Pass 1 — basic motion + correct lore color
//   Pass 2 — randomized speed/path/size so it doesn't tile uniformly
//   Pass 3 — mobile-aware density + motion-safe gate
//
// All layers expect the parent <section> to be `relative overflow-hidden`.

/** Wilted-rose petals drifting down. Used in HeroBlock — the wilted
 *  rose is the central recurring sigil of the saga. */
function FloatingPetals({ count = 7 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-petal {
          position: absolute;
          top: -40px;
          opacity: 0;
          animation: bl-petal-fall linear infinite;
        }
        @keyframes bl-petal-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0);
            opacity: 0;
          }
          8% {
            opacity: 0.55;
          }
          50% {
            transform: translateY(50vh) translateX(30px) rotate(180deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(120vh) translateX(-20px) rotate(540deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-petal {
            animation: none;
            display: none;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 14.7 + 5) % 100;
        const dur = 22 + (i % 9);
        const delay = (i * 3.1) % 18;
        const scale = 0.7 + ((i * 7) % 10) / 10;
        return (
          <svg
            key={i}
            className="bl-petal"
            width={24 * scale}
            height={24 * scale}
            viewBox="0 0 24 24"
            style={{
              left: `${left}%`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <path
              d="M12 3 Q 7 9, 12 16 Q 17 9, 12 3 Z"
              fill={CRIMSON}
              fillOpacity="0.8"
              stroke={CRIMSON_BRIGHT}
              strokeOpacity="0.5"
              strokeWidth="0.4"
            />
            <path
              d="M12 8 L 12 17"
              stroke={CRIMSON_BRIGHT}
              strokeOpacity="0.6"
              strokeWidth="0.5"
            />
          </svg>
        );
      })}
    </div>
  );
}

/** Slow-drifting fog blobs (large soft gradients). Used in
 *  SynopsisBlock + WorldMapBlock for atmospheric distance. */
function DriftingFog({ tint = GOLD_DEEP, count = 4 }: { tint?: string; count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-fog {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0;
          animation: bl-fog-drift ease-in-out infinite;
        }
        @keyframes bl-fog-drift {
          0%,
          100% {
            transform: translateX(0) scale(1);
            opacity: 0;
          }
          50% {
            transform: translateX(80px) scale(1.15);
            opacity: 0.35;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-fog {
            animation: none;
            opacity: 0.18;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => {
        const top = 10 + (i * 27) % 80;
        const left = 5 + (i * 31) % 85;
        const size = 200 + (i % 4) * 80;
        const dur = 28 + (i % 6) * 4;
        const delay = i * 5;
        return (
          <span
            key={i}
            className="bl-fog"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle, ${tint}55 0%, transparent 70%)`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Distant kingdom silhouette — castle towers + mountain peaks at the
 *  bottom of the section. Used in SynopsisBlock to set the scene. */
function KingdomSilhouette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ height: "40%" }}
    >
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYEnd slice"
        className="absolute bottom-0 w-full h-full"
      >
        {/* Far mountains */}
        <path
          d="M 0 200 L 0 130 L 80 90 L 140 110 L 220 70 L 300 100 L 380 80 L 460 105 L 540 75 L 620 95 L 700 65 L 780 90 L 860 75 L 940 100 L 1020 85 L 1100 110 L 1200 95 L 1200 200 Z"
          fill="#1a1410"
          opacity="0.6"
        />
        {/* Mid mountains */}
        <path
          d="M 0 200 L 0 160 L 60 130 L 140 150 L 200 120 L 280 145 L 360 125 L 440 150 L 520 130 L 600 105 L 680 135 L 760 115 L 840 145 L 920 125 L 1000 150 L 1080 130 L 1160 155 L 1200 145 L 1200 200 Z"
          fill="#0e0a08"
          opacity="0.85"
        />
        {/* Castle silhouette — center, the spires of Annarose */}
        <g transform="translate(540, 120)">
          {/* Main keep */}
          <rect x="40" y="20" width="40" height="60" fill="#0a0606" />
          {/* Keep crenellations */}
          <rect x="40" y="14" width="6" height="6" fill="#0a0606" />
          <rect x="50" y="14" width="6" height="6" fill="#0a0606" />
          <rect x="60" y="14" width="6" height="6" fill="#0a0606" />
          <rect x="70" y="14" width="6" height="6" fill="#0a0606" />
          {/* Left tower */}
          <rect x="20" y="35" width="18" height="45" fill="#0a0606" />
          <polygon points="20,35 38,35 29,18" fill="#0a0606" />
          {/* Right tower */}
          <rect x="82" y="30" width="20" height="50" fill="#0a0606" />
          <polygon points="82,30 102,30 92,12" fill="#0a0606" />
          {/* Far right tower */}
          <rect x="110" y="40" width="14" height="40" fill="#0a0606" />
          <polygon points="110,40 124,40 117,28" fill="#0a0606" />
          {/* Window light glints */}
          <rect x="55" y="35" width="3" height="5" fill={GOLD_DEEP} opacity="0.5" />
          <rect x="62" y="35" width="3" height="5" fill={GOLD_DEEP} opacity="0.4" />
          <rect x="89" y="50" width="3" height="4" fill={GOLD_DEEP} opacity="0.45" />
          <rect x="115" y="55" width="2" height="4" fill={GOLD_DEEP} opacity="0.4" />
        </g>
        {/* Foreground hills */}
        <path
          d="M 0 200 L 0 180 Q 200 160 400 175 T 800 170 T 1200 175 L 1200 200 Z"
          fill="#050304"
        />
      </svg>
    </div>
  );
}

/** Floating gold dust motes drifting upward. Used in BooksBlock + the
 *  Author column for warm "lit room" feel. */
function FloatingDust({ count = 14, tint = GOLD }: { count?: number; tint?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-dust {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          opacity: 0;
          animation: bl-dust-rise linear infinite;
        }
        @keyframes bl-dust-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 0.5;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-120vh) translateX(60px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-dust {
            animation: none;
            display: none;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 7.9 + 2) % 100;
        const dur = 18 + (i % 11);
        const delay = (i * 1.7) % 20;
        const size = 1.5 + (i % 4) * 0.8;
        return (
          <span
            key={i}
            className="bl-dust"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: tint,
              boxShadow: `0 0 ${size * 3}px ${tint}, 0 0 ${size * 6}px ${tint}88`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Three character silhouettes for CharacterRosterBlock — placed at
 *  the section edges so they frame the cast grid without competing
 *  with it. Left: cloaked figure leaning against a wall with a knife
 *  (Phage / Wilted Rose energy). Right: small hooded figure curled up
 *  with a tiny lantern (Talia / kitchen-table-Talia warmth). Top-right
 *  corner: tall caped figure with a sworded canister at the hip
 *  (Sopher / Royal Guard cadet). All low-opacity ghosted silhouettes,
 *  desktop-only (`hidden lg:block`) so the mobile roster grid is the
 *  whole show on phones. */
function CharacterSilhouettes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <style jsx>{`
        .bl-char-flicker {
          animation: bl-char-flicker-pulse 3.5s ease-in-out infinite;
        }
        @keyframes bl-char-flicker-pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-char-flicker {
            animation: none;
          }
        }
      `}</style>

      {/* LEFT — leaning operative with knife (Phage / Wilted Rose) */}
      <svg
        viewBox="0 0 200 400"
        className="absolute left-0 bottom-0 h-[70%] max-h-[600px] w-auto"
        style={{ opacity: 0.16 }}
      >
        {/* Wall behind */}
        <rect x="0" y="0" width="14" height="400" fill="#000" opacity="0.6" />
        {/* Cloaked body — leaning right shoulder against wall */}
        <path
          d="M 50 100 Q 30 150, 32 220 L 28 320 Q 25 360, 40 390 L 90 390 Q 105 380, 105 350 L 110 230 Q 115 170, 100 130 Z"
          fill="#000"
          opacity="0.85"
        />
        {/* Hood */}
        <path
          d="M 50 100 Q 40 70, 60 50 Q 80 30, 100 50 Q 115 70, 105 100 Q 95 110, 80 110 Q 65 110, 50 100 Z"
          fill="#000"
          opacity="0.95"
        />
        {/* Hood interior shadow / face void */}
        <ellipse cx="78" cy="80" rx="12" ry="14" fill="#000" />
        {/* Right shoulder pressed to wall (left side of svg) */}
        <path
          d="M 14 130 Q 30 135, 35 160 L 30 200 Q 18 195, 14 180 Z"
          fill="#000"
          opacity="0.7"
        />
        {/* Right arm hanging */}
        <path
          d="M 105 160 Q 130 200, 135 250 L 130 270 Q 115 270, 110 250 Z"
          fill="#000"
          opacity="0.8"
        />
        {/* Knife in right hand */}
        <g transform="translate(125, 265)">
          <rect x="-1" y="0" width="2" height="6" fill="#0a0a0a" />
          <polygon
            points="-3,6 3,6 1,28 -1,28"
            fill={GOLD_DEEP}
            opacity="0.7"
          />
          {/* Glint on blade */}
          <line
            className="bl-char-flicker"
            x1="0"
            y1="10"
            x2="0"
            y2="22"
            stroke={GOLD_LIGHT}
            strokeWidth="0.6"
          />
        </g>
        {/* Left arm tucked */}
        <path
          d="M 55 170 Q 45 210, 50 250 L 60 250 Q 70 220, 70 180 Z"
          fill="#000"
          opacity="0.8"
        />
      </svg>

      {/* RIGHT — small hooded figure with a tiny lantern (Talia warmth) */}
      <svg
        viewBox="0 0 160 280"
        className="absolute right-2 bottom-0 h-[50%] max-h-[420px] w-auto"
        style={{ opacity: 0.18 }}
      >
        {/* Ground shadow */}
        <ellipse cx="80" cy="270" rx="50" ry="6" fill="#000" opacity="0.4" />
        {/* Body — kneeling/curled */}
        <path
          d="M 50 130 Q 40 170, 45 220 L 40 265 Q 42 275, 50 275 L 110 275 Q 120 275, 122 265 L 120 220 Q 125 175, 115 135 Z"
          fill="#000"
          opacity="0.85"
        />
        {/* Hood pulled forward */}
        <path
          d="M 50 130 Q 45 95, 65 80 Q 85 65, 105 80 Q 122 95, 115 130 Q 100 138, 85 138 Q 65 138, 50 130 Z"
          fill="#000"
          opacity="0.95"
        />
        {/* Face void */}
        <ellipse cx="84" cy="108" rx="10" ry="12" fill="#000" />
        {/* Cradled arm */}
        <path
          d="M 65 165 Q 55 200, 60 230 Q 75 235, 90 225 Q 95 200, 90 175 Z"
          fill="#000"
          opacity="0.85"
        />
        {/* Lantern in cupped hands — warm gold glow */}
        <g transform="translate(78, 210)">
          <ellipse
            className="bl-char-flicker"
            cx="0"
            cy="0"
            rx="14"
            ry="10"
            fill={GOLD}
            opacity="0.8"
            style={{ filter: "blur(3px)" }}
          />
          <rect x="-3" y="-6" width="6" height="10" fill={GOLD_DEEP} />
          <rect x="-4" y="-7" width="8" height="2" fill="#0a0a0a" />
          <line
            x1="0"
            y1="-7"
            x2="0"
            y2="-12"
            stroke="#0a0a0a"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* TOP-RIGHT — tall caped figure with sworded canister at hip
          (Sopher / Royal Guard cadet). Small + high so it doesn't fight
          with the section heading. */}
      <svg
        viewBox="0 0 140 320"
        className="absolute right-[8%] top-[8%] h-[40%] max-h-[340px] w-auto"
        style={{ opacity: 0.13 }}
      >
        {/* Cape behind body */}
        <path
          d="M 30 90 Q 10 180, 25 290 Q 40 300, 55 290 L 60 110 Z"
          fill="#000"
          opacity="0.7"
        />
        <path
          d="M 110 90 Q 130 180, 115 290 Q 100 300, 85 290 L 80 110 Z"
          fill="#000"
          opacity="0.7"
        />
        {/* Body */}
        <path
          d="M 55 80 Q 50 130, 55 200 L 50 295 Q 55 305, 70 305 L 70 305 Q 85 305, 90 295 L 85 200 Q 90 130, 85 80 Z"
          fill="#000"
          opacity="0.92"
        />
        {/* Head — slight cowl, no hood pulled fully */}
        <ellipse cx="70" cy="55" rx="18" ry="22" fill="#000" />
        <path
          d="M 50 60 Q 45 35, 70 32 Q 95 35, 90 60 Q 70 65, 50 60 Z"
          fill="#000"
        />
        {/* Right arm at side */}
        <path
          d="M 88 105 Q 102 150, 100 220 L 95 230 Q 88 215, 88 180 Z"
          fill="#000"
          opacity="0.85"
        />
        {/* Sword canister at hip */}
        <g transform="translate(95, 200)">
          <rect x="0" y="0" width="6" height="40" fill="#0a0a0a" />
          <rect x="-1" y="-3" width="8" height="3" fill={GOLD_DEEP} opacity="0.6" />
          {/* Sword grip just visible */}
          <rect x="2" y="-12" width="2" height="8" fill={GOLD_DEEP} opacity="0.7" />
          {/* Slight glint */}
          <line
            className="bl-char-flicker"
            x1="3"
            y1="0"
            x2="3"
            y2="35"
            stroke={GOLD_LIGHT}
            strokeWidth="0.4"
            opacity="0.5"
          />
        </g>
        {/* Left arm */}
        <path
          d="M 52 105 Q 38 150, 40 220 L 45 230 Q 52 215, 52 180 Z"
          fill="#000"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

/** Floating gold runes — Cinzel-style letterforms drifting through the
 *  scene as ghosted background. Used in CharacterRosterBlock. */
function FloatingRunes({ count = 9 }: { count?: number }) {
  // Letters that recur in character monograms — feels intentional to the
  // page rather than random alphabet soup.
  const RUNES = ["S", "P", "A", "Q", "R", "T", "Φ", "Σ"];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden hidden sm:block"
    >
      <style jsx>{`
        .bl-rune {
          position: absolute;
          color: ${GOLD_DEEP};
          opacity: 0;
          font-family: "Cinzel", serif;
          font-weight: 700;
          animation: bl-rune-drift ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes bl-rune-drift {
          0%,
          100% {
            transform: translateY(0) rotate(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-30px) rotate(8deg);
            opacity: 0.18;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-rune {
            animation: none;
            opacity: 0.1;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => {
        const top = (i * 19) % 90;
        const left = (i * 13.3) % 95;
        const size = 60 + (i % 5) * 24;
        const dur = 14 + (i % 8) * 2;
        const delay = (i * 2.4) % 12;
        return (
          <span
            key={i}
            className="bl-rune"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              fontSize: `${size}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          >
            {RUNES[i % RUNES.length]}
          </span>
        );
      })}
    </div>
  );
}

/** Full landscape backdrop for the World of Annarose section. Star
 *  field + receding mountain layers + castle silhouette with lit
 *  windows + forest patches + river. A small ornate compass-rose
 *  overlay sits in the top-right corner OVER the landscape (not behind
 *  it, per Ben's 2026-05-07 review). Slow ambient motion on stars +
 *  compass — motion-safe. */
function LandscapeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-star {
          animation: bl-star-twinkle ease-in-out infinite;
        }
        .bl-castle-glow {
          animation: bl-castle-glow-pulse 5s ease-in-out infinite;
        }
        .bl-river {
          animation: bl-river-shimmer 8s ease-in-out infinite;
        }
        .bl-compass-rose {
          animation: bl-compass-spin 90s linear infinite;
          transform-origin: center;
        }
        @keyframes bl-star-twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes bl-castle-glow-pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.85;
          }
        }
        @keyframes bl-river-shimmer {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.75;
          }
        }
        @keyframes bl-compass-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-star,
          .bl-castle-glow,
          .bl-river,
          .bl-compass-rose {
            animation: none;
          }
        }
      `}</style>

      {/* Sky-to-ground gradient — slightly warmer than the section's
          near-black so the landscape has tonal depth. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0a14 0%, #100b08 45%, #0c0806 75%, #060403 100%)",
        }}
      />

      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        {/* ─── STARS (upper third) ─────────────────────────────── */}
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 47) % 1200;
          const y = ((i * 23) % 220) + 10;
          const r = (i % 3 === 0 ? 1.4 : 0.7) + ((i * 13) % 5) / 10;
          const dur = 3 + (i % 5);
          const delay = (i * 0.4) % 4;
          return (
            <circle
              key={i}
              className="bl-star"
              cx={x}
              cy={y}
              r={r}
              fill={GOLD_LIGHT}
              opacity="0.5"
              style={{
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* ─── DISTANT MOUNTAINS (atmospheric haze) ─────────────── */}
        <path
          d="M 0 700 L 0 280 L 60 220 L 130 250 L 200 200 L 280 240 L 360 210 L 440 245 L 520 215 L 600 185 L 680 220 L 760 195 L 840 230 L 920 200 L 1000 240 L 1080 210 L 1160 235 L 1200 220 L 1200 700 Z"
          fill="#15110d"
          opacity="0.55"
        />

        {/* ─── MID MOUNTAINS ───────────────────────────────────── */}
        <path
          d="M 0 700 L 0 360 L 80 290 L 160 330 L 240 270 L 330 320 L 420 280 L 510 330 L 600 260 L 700 310 L 800 270 L 900 320 L 1000 285 L 1100 330 L 1200 305 L 1200 700 Z"
          fill="#0c0a08"
          opacity="0.85"
        />

        {/* ─── FOREST PATCHES (left + right of castle) ──────────── */}
        <g opacity="0.7">
          {/* Left forest cluster */}
          {[
            [80, 460], [100, 470], [120, 455], [140, 470], [160, 462],
            [180, 475], [200, 460], [60, 475], [220, 470],
          ].map(([cx, cy], i) => (
            <polygon
              key={`tl-${i}`}
              points={`${cx},${cy - 18} ${cx - 7},${cy} ${cx + 7},${cy}`}
              fill="#0a0e08"
            />
          ))}
          {/* Right forest cluster */}
          {[
            [820, 470], [840, 460], [860, 475], [880, 462], [900, 470],
            [920, 458], [940, 470], [960, 463], [980, 472], [1000, 460],
            [1020, 470], [1040, 462],
          ].map(([cx, cy], i) => (
            <polygon
              key={`tr-${i}`}
              points={`${cx},${cy - 18} ${cx - 7},${cy} ${cx + 7},${cy}`}
              fill="#0a0e08"
            />
          ))}
        </g>

        {/* ─── RIVER (curving across mid-section) ──────────────── */}
        <path
          className="bl-river"
          d="M 0 540 Q 200 510, 380 530 Q 560 555, 740 525 Q 920 495, 1200 520 L 1200 555 Q 920 530, 740 560 Q 560 590, 380 565 Q 200 545, 0 575 Z"
          fill="#1e3a52"
          opacity="0.55"
        />
        <path
          className="bl-river"
          d="M 0 545 Q 200 515, 380 535 Q 560 560, 740 530 Q 920 500, 1200 525"
          fill="none"
          stroke="#3a6586"
          strokeWidth="1.2"
          opacity="0.6"
          style={{ animationDelay: "2s" }}
        />

        {/* ─── CASTLE SILHOUETTE (Annarose, on central hill) ────── */}
        <g transform="translate(540, 380)">
          {/* Hill base */}
          <ellipse cx="65" cy="120" rx="180" ry="20" fill="#08070a" />
          {/* Castle wall */}
          <rect x="20" y="60" width="140" height="60" fill="#06060a" />
          {/* Wall crenellations */}
          {[20, 36, 52, 68, 84, 100, 116, 132, 148].map((x) => (
            <rect key={x} x={x} y="54" width="8" height="6" fill="#06060a" />
          ))}
          {/* Main keep — center, tallest */}
          <rect x="70" y="20" width="40" height="65" fill="#06060a" />
          <rect x="70" y="14" width="6" height="6" fill="#06060a" />
          <rect x="80" y="14" width="6" height="6" fill="#06060a" />
          <rect x="90" y="14" width="6" height="6" fill="#06060a" />
          <rect x="100" y="14" width="6" height="6" fill="#06060a" />
          {/* Center spire */}
          <polygon points="70,14 110,14 90,-2" fill="#06060a" />
          {/* Left tower */}
          <rect x="36" y="35" width="22" height="50" fill="#06060a" />
          <polygon points="36,35 58,35 47,18" fill="#06060a" />
          {/* Right tower */}
          <rect x="124" y="40" width="20" height="45" fill="#06060a" />
          <polygon points="124,40 144,40 134,24" fill="#06060a" />
          {/* Banner on right tower */}
          <rect x="133" y="22" width="1" height="6" fill={GOLD_DEEP} />
          <polygon points="134,22 140,24 134,26" fill={CRIMSON} />

          {/* Lit windows — gold glints */}
          <g className="bl-castle-glow">
            <rect x="84" y="40" width="3" height="5" fill={GOLD} />
            <rect x="92" y="40" width="3" height="5" fill={GOLD} opacity="0.85" />
            <rect x="100" y="40" width="3" height="5" fill={GOLD} opacity="0.7" />
            <rect x="44" y="52" width="3" height="4" fill={GOLD_DEEP} />
            <rect x="50" y="62" width="3" height="4" fill={GOLD_DEEP} opacity="0.8" />
            <rect x="130" y="58" width="3" height="4" fill={GOLD_DEEP} opacity="0.85" />
            <rect x="40" y="78" width="2" height="3" fill={GOLD_DEEP} opacity="0.6" />
            <rect x="60" y="80" width="2" height="3" fill={GOLD_DEEP} opacity="0.6" />
            <rect x="80" y="80" width="2" height="3" fill={GOLD_DEEP} opacity="0.7" />
            <rect x="100" y="80" width="2" height="3" fill={GOLD_DEEP} opacity="0.7" />
            <rect x="125" y="78" width="2" height="3" fill={GOLD_DEEP} opacity="0.6" />
          </g>
          {/* Atmospheric glow halo around castle */}
          <ellipse
            cx="90"
            cy="50"
            rx="80"
            ry="40"
            fill={GOLD_DEEP}
            opacity="0.06"
            style={{ filter: "blur(8px)" }}
          />
        </g>

        {/* ─── FOREGROUND HILLS ─────────────────────────────────── */}
        <path
          d="M 0 700 L 0 620 Q 200 590, 400 615 T 800 605 T 1200 615 L 1200 700 Z"
          fill="#040305"
        />
      </svg>

      {/* Compass-rose overlay — sits visibly OVER the landscape in the
          top-right (top-left on small screens flips). Subtle slow spin.
          Sized smaller than the prior watermark so it reads as a
          cartographer's mark, not a competing focal point. */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-12 w-20 h-20 sm:w-28 sm:h-28 opacity-55">
        <svg viewBox="0 0 100 100" className="bl-compass-rose w-full h-full">
          {/* Outer + inner rings */}
          <circle cx="50" cy="50" r="48" fill="none" stroke={GOLD} strokeWidth="0.6" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={GOLD} strokeWidth="0.4" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="28" fill="none" stroke={GOLD} strokeWidth="0.3" />
          {/* 8-point compass star */}
          <path d="M 50 4 L 55 50 L 50 96 L 45 50 Z" fill={GOLD} />
          <path d="M 4 50 L 50 45 L 96 50 L 50 55 Z" fill={GOLD} opacity="0.75" />
          <path d="M 18 18 L 50 47 L 82 82 L 53 50 Z" fill={GOLD} opacity="0.55" />
          <path d="M 82 18 L 53 47 L 18 82 L 47 50 Z" fill={GOLD} opacity="0.55" />
          {/* Cardinal letters */}
          <text x="50" y="14" fontSize="7" fill={GOLD} textAnchor="middle" fontFamily="Cinzel">N</text>
          <text x="89" y="53" fontSize="6" fill={GOLD} textAnchor="middle" fontFamily="Cinzel" opacity="0.85">E</text>
          <text x="50" y="92" fontSize="6" fill={GOLD} textAnchor="middle" fontFamily="Cinzel" opacity="0.85">S</text>
          <text x="11" y="53" fontSize="6" fill={GOLD} textAnchor="middle" fontFamily="Cinzel" opacity="0.85">W</text>
          {/* Center dot */}
          <circle cx="50" cy="50" r="1.5" fill={GOLD} />
        </svg>
      </div>
    </div>
  );
}

/** Compass-rose watermark — kept in the file but no longer used after
 *  the LandscapeBackdrop refactor (2026-05-07). Retained for any future
 *  surface that wants the original behind-content treatment. */
function CompassWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <style jsx>{`
        .bl-compass {
          animation: bl-compass-spin 120s linear infinite;
          opacity: 0.06;
        }
        @keyframes bl-compass-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-compass {
            animation: none;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 200 200"
        className="bl-compass"
        style={{ width: "min(70%, 600px)", height: "min(70%, 600px)" }}
      >
        <circle cx="100" cy="100" r="95" fill="none" stroke={GOLD} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="80" fill="none" stroke={GOLD} strokeWidth="0.3" />
        <circle cx="100" cy="100" r="55" fill="none" stroke={GOLD} strokeWidth="0.3" strokeDasharray="2 3" />
        {/* 8-point star */}
        <g>
          <path d="M 100 5 L 105 100 L 100 195 L 95 100 Z" fill={GOLD} />
          <path d="M 5 100 L 100 95 L 195 100 L 100 105 Z" fill={GOLD} opacity="0.7" />
          <path d="M 33 33 L 100 95 L 167 167 L 100 105 Z" fill={GOLD} opacity="0.5" />
          <path d="M 167 33 L 105 95 L 33 167 L 95 105 Z" fill={GOLD} opacity="0.5" />
        </g>
        {/* Letters */}
        <text x="100" y="20" fontSize="10" fill={GOLD} textAnchor="middle" fontFamily="Cinzel">N</text>
        <text x="185" y="105" fontSize="10" fill={GOLD} textAnchor="middle" fontFamily="Cinzel">E</text>
        <text x="100" y="190" fontSize="10" fill={GOLD} textAnchor="middle" fontFamily="Cinzel">S</text>
        <text x="15" y="105" fontSize="10" fill={GOLD} textAnchor="middle" fontFamily="Cinzel">W</text>
      </svg>
    </div>
  );
}

/** Full reactive backdrop for the Magic System section. One immersive
 *  scene per elleta — fire / earth / water / air / light — that fades
 *  in when the section enters the viewport AND when the user picks a
 *  new element tab. Per-element scenes share a common shell:
 *    - Element-tinted radial gradient over the section
 *    - 1-2 large animated SVG features (waves / flames / wind / etc.)
 *    - 12-14 floating particles in the element's signature shape
 *
 *  React key={id} on the parent forces full remount on tab change, so
 *  the new element fades in clean instead of cross-fading from the prior.
 *
 *  `playing` prop drives section-in-view fade — when MagicSystemBlock is
 *  out of viewport, the whole backdrop fades to opacity 0 to free the
 *  GPU. CSS animations stay running but invisible. */
function ElementBackdrop({
  id,
  color,
  playing,
}: {
  id: string;
  color: string;
  playing: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000"
      style={{ opacity: playing ? 1 : 0 }}
    >
      <style jsx>{`
        /* Shared particle drift */
        .bl-elem-particle {
          position: absolute;
          opacity: 0;
          animation: bl-elem-float ease-in-out infinite;
        }
        @keyframes bl-elem-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.7;
          }
        }

        /* FIRE — flames lick up from bottom */
        .bl-fire-flame {
          animation: bl-fire-dance ease-in-out infinite;
          transform-origin: 50% 100%;
        }
        @keyframes bl-fire-dance {
          0%,
          100% {
            transform: scaleY(1) scaleX(1) translateX(0);
          }
          25% {
            transform: scaleY(1.15) scaleX(0.9) translateX(-4px);
          }
          50% {
            transform: scaleY(0.92) scaleX(1.08) translateX(3px);
          }
          75% {
            transform: scaleY(1.1) scaleX(0.95) translateX(-2px);
          }
        }
        .bl-fire-glow {
          animation: bl-fire-glow-pulse 3s ease-in-out infinite;
        }
        @keyframes bl-fire-glow-pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        /* EARTH — slow rotating fragments + crack shimmer */
        .bl-earth-frag {
          animation: bl-earth-tumble linear infinite;
        }
        @keyframes bl-earth-tumble {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          15%,
          80% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-100vh) rotate(540deg);
            opacity: 0;
          }
        }
        .bl-earth-crack {
          animation: bl-earth-crack-pulse 4s ease-in-out infinite;
        }
        @keyframes bl-earth-crack-pulse {
          0%,
          100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* WATER — wave shift + ripple expand */
        .bl-water-wave {
          animation: bl-water-roll 8s ease-in-out infinite;
        }
        @keyframes bl-water-roll {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-40px);
          }
        }
        .bl-water-ripple {
          animation: bl-water-ripple-out ease-out infinite;
          transform-origin: center;
        }
        @keyframes bl-water-ripple-out {
          0% {
            transform: scale(0.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        /* AIR — streaks moving across, swirling currents */
        .bl-air-streak {
          animation: bl-air-sweep linear infinite;
        }
        @keyframes bl-air-sweep {
          0% {
            transform: translateX(-30vw);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translateX(130vw);
            opacity: 0;
          }
        }
        .bl-air-swirl {
          animation: bl-air-rotate 18s linear infinite;
          transform-origin: center;
        }
        @keyframes bl-air-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* LIGHT — beams pulse softly, sun core breathes, halo breathes */
        .bl-light-beam {
          animation: bl-light-beam-pulse ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        @keyframes bl-light-beam-pulse {
          0%,
          100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.42;
          }
        }
        .bl-light-halo {
          animation: bl-light-halo-breathe 5s ease-in-out infinite;
        }
        @keyframes bl-light-halo-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.85;
          }
        }
        .bl-light-sun {
          animation: bl-light-sun-breathe 6s ease-in-out infinite;
        }
        @keyframes bl-light-sun-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bl-elem-particle,
          .bl-fire-flame,
          .bl-fire-glow,
          .bl-earth-frag,
          .bl-earth-crack,
          .bl-water-wave,
          .bl-water-ripple,
          .bl-air-streak,
          .bl-air-swirl,
          .bl-light-beam,
          .bl-light-halo,
          .bl-light-sun {
            animation: none;
          }
          .bl-elem-particle {
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Element-tinted radial wash — spreads the active color across
          the section before the foreground scene paints. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${color}22 0%, ${color}0d 35%, transparent 70%)`,
        }}
      />

      {/* ─── FIRE ─── */}
      {id === "fire" && (
        <>
          {/* Heat haze gradient at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color}11 60%, ${color}33 100%)`,
            }}
          />
          {/* Stylized flames rising from bottom */}
          <svg
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYEnd slice"
            className="absolute inset-x-0 bottom-0 w-full h-full"
          >
            {[100, 280, 460, 640, 820, 1000, 1140].map((cx, i) => {
              const w = 70 + (i % 3) * 16;
              const h = 130 + (i % 4) * 35;
              const dur = 2.2 + (i % 4) * 0.4;
              return (
                <path
                  key={cx}
                  className="bl-fire-flame"
                  d={`M ${cx} 700 Q ${cx - w / 2} ${700 - h * 0.6}, ${cx - w * 0.2} ${700 - h * 0.85} Q ${cx} ${700 - h}, ${cx + w * 0.2} ${700 - h * 0.85} Q ${cx + w / 2} ${700 - h * 0.6}, ${cx} 700 Z`}
                  fill={`url(#bl-flame-grad-${i})`}
                  style={{
                    animationDuration: `${dur}s`,
                    animationDelay: `${(i * 0.3) % 2}s`,
                  }}
                />
              );
            })}
            <defs>
              {[100, 280, 460, 640, 820, 1000, 1140].map((_, i) => (
                <linearGradient key={i} id={`bl-flame-grad-${i}`} x1="0" y1="100%" x2="0" y2="0%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                  <stop offset="50%" stopColor={GOLD} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
          </svg>
          {/* Floating embers */}
          {Array.from({ length: 14 }).map((_, i) => {
            const left = (i * 7.9 + 5) % 100;
            const dur = 6 + (i % 5);
            const delay = (i * 0.7) % 6;
            const size = 4 + (i % 4) * 2;
            return (
              <span
                key={i}
                className="bl-elem-particle"
                style={{
                  left: `${left}%`,
                  bottom: "-10px",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? color : GOLD,
                  boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}99`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </>
      )}

      {/* ─── EARTH ─── */}
      {id === "earth" && (
        <>
          {/* Stone texture base */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(146, 64, 14, 0.04) 0 8px, transparent 8px 24px), repeating-linear-gradient(-45deg, rgba(58, 40, 23, 0.05) 0 12px, transparent 12px 36px)",
            }}
          />
          {/* Rocky ground */}
          <svg
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYEnd slice"
            className="absolute inset-x-0 bottom-0 w-full h-2/3"
          >
            <path
              d="M 0 700 L 0 540 L 80 510 L 180 530 L 280 500 L 380 525 L 480 495 L 580 520 L 680 490 L 780 515 L 880 485 L 980 510 L 1080 480 L 1200 505 L 1200 700 Z"
              fill={color}
              opacity="0.18"
            />
            {/* Cracks revealing gold beneath */}
            <path
              className="bl-earth-crack"
              d="M 200 530 L 250 580 L 230 640 M 350 520 L 380 590 L 360 660"
              stroke={GOLD}
              strokeWidth="1.5"
              fill="none"
            />
            <path
              className="bl-earth-crack"
              d="M 700 510 L 730 570 L 720 640 M 850 510 L 890 580 L 880 660"
              stroke={GOLD}
              strokeWidth="1.5"
              fill="none"
              style={{ animationDelay: "1.5s" }}
            />
          </svg>
          {/* Tumbling stone fragments */}
          {Array.from({ length: 14 }).map((_, i) => {
            const left = (i * 11.3 + 3) % 100;
            const dur = 14 + (i % 7) * 2;
            const delay = (i * 1.1) % 12;
            const size = 6 + (i % 4) * 3;
            return (
              <span
                key={i}
                className="bl-earth-frag"
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  bottom: "-30px",
                  width: size,
                  height: size,
                  background: i % 2 === 0 ? color : "#3a2817",
                  clipPath:
                    "polygon(20% 0, 80% 10%, 100% 50%, 80% 95%, 25% 100%, 0 60%)",
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  opacity: 0,
                }}
              />
            );
          })}
        </>
      )}

      {/* ─── WATER ─── */}
      {id === "water" && (
        <>
          {/* Deep gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${color}11 50%, ${color}33 100%)`,
            }}
          />
          {/* Wave at bottom */}
          <svg
            viewBox="0 0 1200 200"
            preserveAspectRatio="xMidYEnd slice"
            className="bl-water-wave absolute inset-x-0 bottom-0 w-[140%] h-[30%]"
            style={{ left: "-20%" }}
          >
            <path
              d="M 0 200 L 0 100 Q 100 70, 200 100 T 400 100 T 600 100 T 800 100 T 1000 100 T 1200 100 L 1200 200 Z"
              fill={color}
              opacity="0.4"
            />
            <path
              d="M 0 200 L 0 130 Q 100 100, 200 130 T 400 130 T 600 130 T 800 130 T 1000 130 T 1200 130 L 1200 200 Z"
              fill={color}
              opacity="0.5"
            />
          </svg>
          {/* Expanding ripples */}
          {[
            [25, 45, 0],
            [70, 35, 1.5],
            [50, 65, 3],
            [85, 55, 4.5],
          ].map(([left, top, delay], i) => (
            <div
              key={i}
              className="bl-water-ripple absolute rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: 80,
                height: 80,
                marginLeft: -40,
                marginTop: -40,
                border: `1.5px solid ${color}`,
                animationDuration: "5s",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          {/* Falling droplets */}
          {Array.from({ length: 10 }).map((_, i) => {
            const left = (i * 13 + 7) % 100;
            const dur = 4 + (i % 4);
            const delay = (i * 0.8) % 5;
            return (
              <span
                key={i}
                className="bl-elem-particle"
                style={{
                  left: `${left}%`,
                  top: 0,
                  width: 4,
                  height: 8,
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  background: `linear-gradient(135deg, ${color}, ${color}66)`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </>
      )}

      {/* ─── AIR ─── */}
      {id === "air" && (
        <>
          {/* Soft cloud gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(8, 145, 178, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(8, 145, 178, 0.06) 0%, transparent 50%)",
            }}
          />
          {/* Wind streaks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const top = (i * 8.7 + 5) % 90;
            const dur = 4 + (i % 5);
            const delay = (i * 0.6) % 5;
            const w = 80 + (i % 4) * 40;
            return (
              <span
                key={i}
                className="bl-air-streak absolute"
                style={{
                  top: `${top}%`,
                  left: 0,
                  width: w,
                  height: 1.5,
                  background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  transform: "rotate(-3deg)",
                }}
              />
            );
          })}
          {/* Swirling current — large rotating shape */}
          <svg
            className="bl-air-swirl absolute"
            style={{
              top: "30%",
              right: "10%",
              width: "40%",
              maxWidth: 500,
              height: "auto",
              opacity: 0.18,
            }}
            viewBox="0 0 200 200"
          >
            <path
              d="M 100 30 Q 160 60, 150 110 Q 140 150, 100 160 Q 60 150, 50 110 Q 40 60, 100 30 Z"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="3 6"
            />
            <path
              d="M 100 50 Q 140 70, 135 105 Q 130 135, 100 140 Q 70 135, 65 105 Q 60 70, 100 50 Z"
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </svg>
        </>
      )}

      {/* ─── LIGHT (Lumengarde) ─── */}
      {id === "light" && (
        <>
          {/* Outer atmospheric wash — soft gold glow filling the section */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "85%",
              maxWidth: 900,
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${color}1f 0%, ${color}0a 40%, transparent 70%)`,
            }}
          />

          {/* Squiggly rays — thin, low-brightness, cubic-bezier curved
              for a more realistic "sunray through atmosphere" feel.
              Rendered BEFORE the sun ball so the sun sits on top and
              keeps the heading text readable. */}
          <svg
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
          >
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i * (360 / 18) * Math.PI) / 180;
              const perpAngle = angle + Math.PI / 2;
              const cx = 400;
              const cy = 400;
              const startR = 130;
              const endR = 560 + (i % 4) * 30;
              // 2 control points → S-curve. Wobble pattern alternates
              // direction so each ray reads as a unique squiggle, not a
              // tiled shape.
              const ctrl1R = startR + (endR - startR) * 0.33;
              const ctrl2R = startR + (endR - startR) * 0.67;
              const wobble1 = ((i % 5) - 2) * 22;
              const wobble2 = -wobble1 * 0.7;
              const x1 = cx + Math.cos(angle) * startR;
              const y1 = cy + Math.sin(angle) * startR;
              const c1x = cx + Math.cos(angle) * ctrl1R + Math.cos(perpAngle) * wobble1;
              const c1y = cy + Math.sin(angle) * ctrl1R + Math.sin(perpAngle) * wobble1;
              const c2x = cx + Math.cos(angle) * ctrl2R + Math.cos(perpAngle) * wobble2;
              const c2y = cy + Math.sin(angle) * ctrl2R + Math.sin(perpAngle) * wobble2;
              const x2 = cx + Math.cos(angle) * endR;
              const y2 = cy + Math.sin(angle) * endR;
              return (
                <path
                  key={i}
                  className="bl-light-beam"
                  d={`M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  style={{
                    animationDuration: `${3 + (i % 5)}s`,
                    animationDelay: `${(i * 0.2) % 3}s`,
                  }}
                />
              );
            })}
          </svg>

          {/* SUN BALL — bright center disc that sits behind the text so
              the heading + subtitle read against a luminous core
              instead of a busy ray pattern. Three layers: outer halo,
              mid disc, inner core (brightest gold-white). */}
          {/* Outer halo (largest, softest) */}
          <div
            className="bl-light-halo absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: 480,
              height: 480,
              marginLeft: -240,
              marginTop: -240,
              background: `radial-gradient(circle, ${color}66 0%, ${color}22 40%, transparent 75%)`,
              filter: "blur(28px)",
            }}
          />
          {/* Mid disc — the sun's body */}
          <div
            className="bl-light-sun absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: 280,
              height: 280,
              marginLeft: -140,
              marginTop: -140,
              background: `radial-gradient(circle, ${GOLD_LIGHT} 0%, ${color} 35%, ${color}66 65%, transparent 90%)`,
              filter: "blur(8px)",
            }}
          />
          {/* Inner core — bright pin of light */}
          <div
            className="bl-light-sun absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: 140,
              height: 140,
              marginLeft: -70,
              marginTop: -70,
              background: `radial-gradient(circle, #fffaf0 0%, ${GOLD_LIGHT} 30%, ${color} 70%, transparent 100%)`,
              filter: "blur(2px)",
              animationDelay: "1s",
            }}
          />

          {/* Light motes drifting */}
          {Array.from({ length: 12 }).map((_, i) => {
            const left = (i * 7.1 + 3) % 100;
            const top = (i * 11.7) % 90;
            const dur = 5 + (i % 6);
            const delay = (i * 0.5) % 6;
            const size = 3 + (i % 4) * 2;
            return (
              <span
                key={i}
                className="bl-elem-particle"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}88`,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

/** Element-specific ambient particles — fire embers, water droplets,
 *  earth fragments, air streaks, light beams. Driven by the active
 *  Magic System tab (MagicSystemBlock). LEGACY: superseded by
 *  ElementBackdrop (2026-05-07); retained until callers swap. */
function ElementParticles({ id, color }: { id: string; color: string }) {
  // Different shapes per element, all sharing the same drift rhythm.
  const renderParticle = (i: number) => {
    const left = (i * 11.3 + 3) % 100;
    const top = (i * 17.7) % 90;
    const dur = 8 + (i % 6);
    const delay = (i * 0.9) % 8;
    const size = 5 + (i % 4) * 3;
    const baseStyle: React.CSSProperties = {
      left: `${left}%`,
      top: `${top}%`,
      animationDuration: `${dur}s`,
      animationDelay: `${delay}s`,
    };
    if (id === "fire") {
      return (
        <span
          key={i}
          className="bl-elem-particle"
          style={{
            ...baseStyle,
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}88`,
          }}
        />
      );
    }
    if (id === "water") {
      return (
        <span
          key={i}
          className="bl-elem-particle"
          style={{
            ...baseStyle,
            width: size + 4,
            height: (size + 4) * 1.4,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            background: `linear-gradient(135deg, ${color}, ${color}66)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      );
    }
    if (id === "earth") {
      return (
        <span
          key={i}
          className="bl-elem-particle"
          style={{
            ...baseStyle,
            width: size + 2,
            height: size + 2,
            background: color,
            opacity: 0.6,
            clipPath:
              "polygon(20% 0, 80% 10%, 100% 50%, 80% 95%, 25% 100%, 0 60%)",
          }}
        />
      );
    }
    if (id === "air") {
      return (
        <span
          key={i}
          className="bl-elem-particle"
          style={{
            ...baseStyle,
            width: size * 4,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            transform: "rotate(-15deg)",
          }}
        />
      );
    }
    // light
    return (
      <span
        key={i}
        className="bl-elem-particle"
        style={{
          ...baseStyle,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}aa`,
        }}
      />
    );
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-elem-particle {
          position: absolute;
          opacity: 0;
          animation: bl-elem-float ease-in-out infinite;
        }
        @keyframes bl-elem-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.7;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-elem-particle {
            animation: none;
            opacity: 0.3;
          }
        }
      `}</style>
      {Array.from({ length: 14 }).map((_, i) => renderParticle(i))}
    </div>
  );
}

/** Library backdrop for ParchmentReaderBlock — bookshelves on both
 *  edges (stacks of spine silhouettes with gold lettering glints) +
 *  a soft candle glow at the bottom-right. Ink wisps still drift on
 *  top of this layer. Bookshelves are desktop-only — on mobile the
 *  parchment scroll is wide enough that flanking shelves crowd it. */
function LibraryBackdrop() {
  // Pre-computed book stack — each entry: [yOffset, height, color, hasGlint]
  const leftStack: Array<[number, number, string, boolean]> = [
    [0, 90, "#1a0e0a", true],
    [92, 70, "#0e0907", false],
    [164, 100, "#1f1108", true],
    [266, 60, "#0a0707", false],
    [328, 85, "#1a0e0a", true],
    [415, 70, "#0e0907", true],
    [487, 95, "#1f1108", false],
    [584, 65, "#0a0707", true],
  ];
  const rightStack: Array<[number, number, string, boolean]> = [
    [10, 80, "#1a0a08", true],
    [92, 95, "#0e0907", true],
    [189, 65, "#1f0e0a", false],
    [256, 90, "#0a0707", true],
    [348, 75, "#1a0e0a", true],
    [425, 70, "#0e0907", false],
    [497, 90, "#1f1108", true],
    [589, 60, "#0a0707", false],
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <style jsx>{`
        .bl-candle-flicker {
          animation: bl-candle-pulse 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes bl-candle-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scaleY(1) scaleX(1);
          }
          30% {
            opacity: 0.85;
            transform: scaleY(1.08) scaleX(0.96);
          }
          60% {
            opacity: 0.7;
            transform: scaleY(0.96) scaleX(1.04);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-candle-flicker {
            animation: none;
          }
        }
      `}</style>

      {/* LEFT BOOKSHELF */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: "min(8%, 110px)" }}
      >
        <div className="relative w-full h-full" style={{ opacity: 0.55 }}>
          {/* Shelf back panel */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, #050304 0%, #0a0606 100%)",
            }}
          />
          {/* Spines */}
          <svg
            viewBox="0 0 100 700"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {leftStack.map(([y, h, color, glint], i) => (
              <g key={`l-${i}`}>
                <rect
                  x="15"
                  y={y}
                  width="70"
                  height={h - 4}
                  fill={color}
                  stroke="#000"
                  strokeWidth="0.4"
                />
                {/* Gold band near top */}
                <rect x="15" y={y + 12} width="70" height="2" fill={GOLD_DEEP} opacity="0.5" />
                {/* Gold lettering glint (vertical title) */}
                {glint && (
                  <rect
                    x="46"
                    y={y + 22}
                    width="8"
                    height={Math.max(20, h - 34)}
                    fill={GOLD}
                    opacity="0.35"
                  />
                )}
              </g>
            ))}
            {/* Edge of shelf */}
            <rect x="0" y="0" width="2" height="700" fill="#000" opacity="0.6" />
            <rect x="98" y="0" width="2" height="700" fill="#1a0e08" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* RIGHT BOOKSHELF */}
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{ width: "min(8%, 110px)" }}
      >
        <div className="relative w-full h-full" style={{ opacity: 0.55 }}>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(270deg, #050304 0%, #0a0606 100%)",
            }}
          />
          <svg
            viewBox="0 0 100 700"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {rightStack.map(([y, h, color, glint], i) => (
              <g key={`r-${i}`}>
                <rect
                  x="15"
                  y={y}
                  width="70"
                  height={h - 4}
                  fill={color}
                  stroke="#000"
                  strokeWidth="0.4"
                />
                <rect x="15" y={y + 12} width="70" height="2" fill={GOLD_DEEP} opacity="0.5" />
                {glint && (
                  <rect
                    x="46"
                    y={y + 22}
                    width="8"
                    height={Math.max(20, h - 34)}
                    fill={GOLD}
                    opacity="0.35"
                  />
                )}
              </g>
            ))}
            <rect x="0" y="0" width="2" height="700" fill="#1a0e08" opacity="0.4" />
            <rect x="98" y="0" width="2" height="700" fill="#000" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* CANDLE GLOW — bottom-right, casting warm light onto the parchment */}
      <div className="absolute bottom-[8%] right-[12%]">
        <div className="relative">
          {/* Halo */}
          <div
            className="absolute"
            style={{
              left: -90,
              top: -90,
              width: 180,
              height: 180,
              background: `radial-gradient(circle, ${GOLD}33 0%, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />
          {/* Candle stick */}
          <div
            className="relative"
            style={{
              width: 8,
              height: 30,
              background: "#0a0807",
              border: `1px solid ${GOLD_DEEP}55`,
              marginLeft: -4,
            }}
          />
          {/* Flame */}
          <div
            className="bl-candle-flicker absolute"
            style={{
              left: -6,
              top: -16,
              width: 12,
              height: 18,
              borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
              background: `radial-gradient(ellipse at center bottom, ${GOLD_LIGHT} 0%, ${GOLD} 40%, ${CRIMSON_BRIGHT} 90%, transparent 100%)`,
              boxShadow: `0 0 16px ${GOLD}, 0 0 32px ${GOLD_DEEP}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Drifting ink wisps — flowing curved paths that ease in and out. Used
 *  in ParchmentReaderBlock to evoke "the writer's quill at work." */
function InkWisps() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <style jsx>{`
        .bl-wisp {
          animation: bl-wisp-flow ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes bl-wisp-flow {
          0%,
          100% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          50% {
            opacity: 0.18;
            transform: translateX(30px) scale(1.05);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-wisp {
            animation: none;
            opacity: 0.1;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <path
          className="bl-wisp"
          d="M 0 100 Q 200 50, 400 150 T 800 100 T 1200 200"
          fill="none"
          stroke={GOLD_DEEP}
          strokeWidth="1"
          style={{ animationDuration: "16s" }}
        />
        <path
          className="bl-wisp"
          d="M 0 350 Q 300 280, 600 380 T 1200 320"
          fill="none"
          stroke={GOLD_DEEP}
          strokeWidth="1.2"
          style={{ animationDuration: "20s", animationDelay: "3s" }}
        />
        <path
          className="bl-wisp"
          d="M 0 500 Q 400 450, 700 520 T 1200 480"
          fill="none"
          stroke={CRIMSON}
          strokeWidth="0.8"
          opacity="0.4"
          style={{ animationDuration: "24s", animationDelay: "6s" }}
        />
      </svg>
    </div>
  );
}

/** Ambient faction-tinted background for FactionSelectorBlock. The tint
 *  shifts based on whatever faction has the most votes so far. */
function FactionAmbient({ tint }: { tint: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${tint}1a 0%, transparent 70%)`,
        transition: "background 1.2s ease-in-out",
      }}
    >
      <style jsx>{`
        .bl-faction-pulse {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: bl-faction-breathe 8s ease-in-out infinite;
        }
        @keyframes bl-faction-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.45;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-faction-pulse {
            animation: none;
            opacity: 0.2;
          }
        }
      `}</style>
      <span
        className="bl-faction-pulse"
        style={{
          top: "20%",
          left: "15%",
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${tint} 0%, transparent 70%)`,
          transition: "background 1.2s ease-in-out",
        }}
      />
      <span
        className="bl-faction-pulse"
        style={{
          bottom: "10%",
          right: "10%",
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${tint} 0%, transparent 70%)`,
          transition: "background 1.2s ease-in-out",
          animationDelay: "3s",
        }}
      />
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
// Wilted Rose Sigil — embossed cover-stamp for the hero book.
// Stylized rose viewed from the side: heavy drooping bud, curving stem,
// thorns, a curling leaf, and a fallen petal at the base. Lore-grounded
// — the wilted-rose mark is the bloodline sigil per Rule 72 synopsis.
// ──────────────────────────────────────────────────────────────────────
function WiltedRoseSigil({ size = 140 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 100 140"
      fill="currentColor"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
    >
      {/* Bud cluster — drooping rose head */}
      <g transform="translate(50, 38)">
        {/* Outermost drooping petal (left, wilting down) */}
        <path
          d="M -22 -2 Q -30 -16, -20 -30 Q -10 -34, -2 -26 Q -10 -16, -16 -10 Q -22 -2, -22 -2 Z"
          opacity="0.7"
        />
        {/* Right outer drooping petal */}
        <path
          d="M 22 -2 Q 30 -14, 22 -28 Q 14 -34, 4 -28 Q 10 -16, 16 -10 Q 22 -2, 22 -2 Z"
          opacity="0.7"
        />
        {/* Lower drooping petal — wilted, hanging */}
        <path
          d="M -10 -2 Q -8 8, -2 12 Q 4 14, 8 6 Q 10 -2, 10 -2 Z"
          opacity="0.55"
        />
        {/* Center bud — tight, embossed */}
        <path
          d="M 0 -10 Q -10 -20, -6 -32 Q 0 -38, 6 -32 Q 10 -20, 0 -10 Z"
          opacity="1"
        />
        {/* Inner detail */}
        <path
          d="M 0 -16 Q -4 -22, -2 -28 Q 0 -30, 2 -28 Q 4 -22, 0 -16 Z"
          opacity="0.5"
        />
      </g>

      {/* Stem — curving down, slight S-curve */}
      <path
        d="M 50 50 Q 46 64, 51 78 Q 56 92, 49 106 Q 46 118, 50 130"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Thorns — three angled barbs */}
      <path
        d="M 48 60 L 42 56 M 53 84 L 60 81 M 47 110 L 41 113"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leaf — single curling leaf mid-stem */}
      <path
        d="M 51 72 Q 38 66, 34 78 Q 36 88, 50 80 Q 53 76, 51 72 Z"
        opacity="0.65"
      />
      <path
        d="M 38 72 Q 42 78, 49 80"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />

      {/* Fallen petal at the base */}
      <path
        d="M 36 124 Q 28 122, 28 132 Q 34 136, 42 130 Q 42 124, 36 124 Z"
        opacity="0.6"
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Metal Corner Stud — bezel-set crimson cabochon at each cover corner.
// Rotated per `corner` prop so the L-bracket points the right way.
// ──────────────────────────────────────────────────────────────────────
function MetalCornerStud({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const rotation = {
    tl: 0,
    tr: 90,
    br: 180,
    bl: 270,
  }[corner];
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
      }}
      aria-hidden="true"
    >
      {/* L-bracket — gold metal */}
      <path
        d="M 2 2 L 28 2 L 28 8 L 8 8 L 8 28 L 2 28 Z"
        fill={GOLD_DEEP}
      />
      {/* Inner highlight along top + left edges */}
      <path
        d="M 3 3 L 27 3 L 27 4 L 4 4 L 4 27 L 3 27 Z"
        fill={GOLD_LIGHT}
        opacity="0.55"
      />
      {/* Bottom + right edge shadow */}
      <path
        d="M 8 7 L 28 7 L 28 8 L 8 8 Z M 7 8 L 8 8 L 8 28 L 7 28 Z"
        fill="rgba(0,0,0,0.4)"
      />
      {/* Corner gem — crimson cabochon */}
      <circle cx="6" cy="6" r="3" fill={CRIMSON} />
      <circle cx="6" cy="6" r="3" fill={CRIMSON_BRIGHT} opacity="0.4" />
      {/* Gem highlight */}
      <circle cx="5" cy="5" r="1" fill={GOLD_LIGHT} opacity="0.7" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Wax-Seal Stat Badge — small parchment-ribbon stamp framing one stat.
// Used in the hero stats line. Crimson wax seal dot on the left,
// parchment background, italic gold text. Small and tight.
// ──────────────────────────────────────────────────────────────────────
function WaxSealStat({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm"
      style={{
        background:
          "linear-gradient(180deg, #e8dcc4 0%, #d4c5a0 50%, #b89668 100%)",
        color: INK,
        fontFamily: "'EB Garamond', serif",
        fontStyle: "italic",
        fontWeight: 500,
        clipPath:
          "polygon(0 0, 8px 50%, 0 100%, calc(100% - 8px) 100%, 100% 50%, calc(100% - 8px) 0)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        textShadow: "0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      {/* Wax seal dot on the left */}
      <span
        aria-hidden="true"
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${CRIMSON_BRIGHT}, ${CRIMSON} 60%, #4a0000 100%)`,
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3)",
        }}
      />
      {children}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Parchment Synopsis Modal — opens on book click. Two parchment pages
// flip open from center revealing the synopsis (left page) + Amazon CTA
// (right page). ESC or backdrop click closes.
// ──────────────────────────────────────────────────────────────────────
function ParchmentSynopsisModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-8"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bloodlines synopsis"
    >
      <style jsx>{`
        .bl-page-flip-wrap {
          animation: bl-page-flip-in 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.05);
          transform-origin: center center;
          will-change: transform, opacity;
        }
        .bl-page-left {
          animation: bl-page-left-flip 0.9s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s
            both;
          transform-origin: right center;
          backface-visibility: hidden;
        }
        .bl-page-right {
          animation: bl-page-right-flip 0.9s cubic-bezier(0.4, 0.0, 0.2, 1) 0.2s
            both;
          transform-origin: left center;
          backface-visibility: hidden;
        }
        @keyframes bl-page-flip-in {
          0% {
            opacity: 0;
            transform: scale(0.85) rotateX(20deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateX(0deg);
          }
        }
        @keyframes bl-page-left-flip {
          0% {
            transform: rotateY(60deg);
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        @keyframes bl-page-right-flip {
          0% {
            transform: rotateY(-60deg);
            opacity: 0;
          }
          100% {
            transform: rotateY(0deg);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-page-flip-wrap,
          .bl-page-left,
          .bl-page-right {
            animation: none;
          }
        }
      `}</style>

      <div
        className="bl-page-flip-wrap relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
        style={{ perspective: "1800px" }}
      >
        {/* Close button — gold, top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close synopsis"
          className="absolute -top-12 right-0 sm:-top-10 sm:-right-2 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD})`,
            color: "#09090b",
            boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 16px ${GOLD}33`,
            fontFamily: "'Cinzel', serif",
          }}
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-0">
          {/* LEFT PAGE — Synopsis */}
          <div
            className="bl-page-left relative px-7 py-9 sm:px-10 sm:py-12 md:px-12 md:py-14 min-h-[520px]"
            style={{
              background:
                "linear-gradient(135deg, #f0e3c7 0%, #e8dcc4 40%, #d4c5a0 100%)",
              borderRight: `2px solid ${GOLD_DEEP}55`,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              boxShadow:
                "inset 0 0 60px rgba(58,40,23,0.18), -8px 8px 24px rgba(0,0,0,0.4)",
              fontFamily: "'EB Garamond', serif",
              color: INK,
            }}
          >
            {/* Aged-paper specks */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 30%, rgba(58,40,23,0.08) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(127,29,29,0.05) 0%, transparent 25%)",
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
              }}
            />

            <p
              className="uppercase tracking-[0.3em] text-[10px] mb-3"
              style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
            >
              The Synopsis
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-6 leading-tight"
              style={{
                color: CRIMSON,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.04em",
              }}
            >
              Bloodlines
            </h2>

            <div className="space-y-4 text-base sm:text-lg leading-relaxed">
              {SYNOPSIS_PARAGRAPHS.map((p, i) => (
                <p key={i} className="relative">
                  {i === 0 && (
                    <span
                      className="float-left mr-2 -mt-1"
                      style={{
                        fontSize: "3.6rem",
                        lineHeight: 1,
                        color: CRIMSON,
                        fontFamily: "'Cinzel', serif",
                        fontWeight: 700,
                        textShadow: `0 1px 0 ${GOLD}66`,
                      }}
                    >
                      {p[0]}
                    </span>
                  )}
                  {i === 0 ? p.slice(1) : p}
                </p>
              ))}
            </div>
          </div>

          {/* RIGHT PAGE — CTAs + lore badge */}
          <div
            className="bl-page-right relative px-7 py-9 sm:px-10 sm:py-12 md:px-12 md:py-14 min-h-[520px] flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(225deg, #f0e3c7 0%, #e8dcc4 40%, #d4c5a0 100%)",
              borderLeft: `2px solid ${GOLD_DEEP}55`,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              boxShadow:
                "inset 0 0 60px rgba(58,40,23,0.18), 8px 8px 24px rgba(0,0,0,0.4)",
              fontFamily: "'EB Garamond', serif",
              color: INK,
            }}
          >
            <div>
              <p
                className="uppercase tracking-[0.3em] text-[10px] mb-3"
                style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
              >
                The First Book
              </p>
              <h3
                className="text-2xl sm:text-3xl font-bold mb-2 leading-tight"
                style={{
                  color: CRIMSON,
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.05em",
                }}
              >
                Lineage of Fire
              </h3>
              <p
                className="italic text-sm sm:text-base mb-6"
                style={{ color: `${INK}cc` }}
              >
                Book One of the Bloodlines saga. For readers 11+.
              </p>

              {/* Wilted-rose sigil watermark */}
              <div
                className="my-8 flex justify-center"
                style={{ color: GOLD_DEEP }}
              >
                <WiltedRoseSigil size={88} />
              </div>

              <p
                className="text-sm sm:text-base italic leading-relaxed mb-6 text-center"
                style={{ color: `${INK}cc` }}
              >
                "Two friends, an ancient power, and a kingdom drawn to war."
              </p>
            </div>

            {/* Amazon CTA */}
            <div className="space-y-3">
              <a
                href={AMAZON_LINEAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-4 text-sm sm:text-base font-semibold tracking-wide rounded-sm transition-transform hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_DEEP} 0%, ${GOLD} 100%)`,
                  color: "#09090b",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.1em",
                  boxShadow: `0 6px 20px rgba(212,168,83,0.35), inset 0 1px 0 rgba(255,255,255,0.4)`,
                }}
              >
                Read on Amazon →
              </a>
              <p
                className="text-xs text-center italic"
                style={{ color: `${INK}99` }}
              >
                Available in paperback and Kindle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 1. HERO — full-bleed monogram + storm vibe
// ──────────────────────────────────────────────────────────────────────
function HeroBlock() {
  const [synopsisOpen, setSynopsisOpen] = useState(false);

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
      <FloatingPetals count={6} />
      <ParchmentSynopsisModal
        open={synopsisOpen}
        onClose={() => setSynopsisOpen(false)}
      />
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

        {/* Monogram rendered as a real leather-bound book — visible
            page edges on right + bottom, dark binding spine on the
            left, gold inner-edge embossing, plus a periodic tremor
            cycle that suggests pressure building behind the cover.
            Motion-safe per Rule 70. */}
        <style jsx>{`
          .bl-book-wrap {
            animation: bl-book-float 6s ease-in-out infinite;
            transform-origin: center center;
            will-change: transform;
          }
          .bl-book {
            animation: bl-book-tremor 4.5s ease-in-out infinite;
            transform-origin: center 70%;
            will-change: transform;
          }
          .bl-book-aura {
            animation: bl-book-aura-pulse 3.2s ease-in-out infinite;
          }
          .bl-rose-sigil {
            animation: bl-rose-pulse 4s ease-in-out infinite;
            will-change: filter, opacity;
          }
          .bl-page-flutter {
            animation: bl-page-flutter 7s ease-in-out infinite;
            transform-origin: left center;
            will-change: transform;
          }
          .bl-ember {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            will-change: transform, opacity;
          }
          .bl-ember-1 {
            animation: bl-ember-drift-1 5.5s ease-in-out infinite;
          }
          .bl-ember-2 {
            animation: bl-ember-drift-2 6.8s ease-in-out infinite 1.2s;
          }
          .bl-ember-3 {
            animation: bl-ember-drift-3 7.2s ease-in-out infinite 0.6s;
          }
          .bl-ember-4 {
            animation: bl-ember-drift-1 6.2s ease-in-out infinite 2.1s;
          }
          .bl-ember-5 {
            animation: bl-ember-drift-2 8s ease-in-out infinite 3.4s;
          }
          .bl-book-btn {
            cursor: pointer;
            background: transparent;
            border: 0;
            padding: 0;
            display: block;
            transition: filter 0.4s ease;
          }
          .bl-book-btn:hover .bl-book {
            animation-play-state: paused;
          }
          .bl-book-btn:hover .bl-book-aura {
            opacity: 1 !important;
            transform: scale(1.18) !important;
          }
          .bl-book-btn:focus-visible {
            outline: 2px solid #d4a853;
            outline-offset: 12px;
            border-radius: 4px;
          }
          @keyframes bl-book-float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }
          @keyframes bl-book-tremor {
            0%,
            55%,
            100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            58% {
              transform: translate(-1.4px, 0.6px) rotate(-0.45deg) scale(1.005);
            }
            61% {
              transform: translate(1.6px, -0.4px) rotate(0.55deg) scale(1.005);
            }
            64% {
              transform: translate(-1.2px, 0.5px) rotate(-0.4deg) scale(1.005);
            }
            67% {
              transform: translate(1.1px, -0.3px) rotate(0.35deg) scale(1.008);
            }
            70% {
              transform: translate(-0.7px, 0.3px) rotate(-0.25deg) scale(1.012);
            }
            73% {
              transform: translate(0.5px, -0.2px) rotate(0.18deg) scale(1.014);
            }
            76% {
              transform: translate(0, -1.2px) rotate(0deg) scale(1.018);
            }
            80% {
              transform: translate(0, -0.6px) rotate(0deg) scale(1.008);
            }
            85% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
          }
          @keyframes bl-book-aura-pulse {
            0%,
            100% {
              opacity: 0.45;
              transform: scale(1);
            }
            50% {
              opacity: 0.9;
              transform: scale(1.1);
            }
          }
          @keyframes bl-rose-pulse {
            0%,
            100% {
              filter: drop-shadow(0 0 4px rgba(212, 168, 83, 0.5))
                drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
              opacity: 0.92;
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(212, 168, 83, 0.85))
                drop-shadow(0 0 24px rgba(127, 29, 29, 0.5))
                drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
              opacity: 1;
            }
          }
          @keyframes bl-page-flutter {
            0%,
            100% {
              transform: skewY(0deg) translateX(0);
            }
            45% {
              transform: skewY(0.3deg) translateX(0.4px);
            }
            55% {
              transform: skewY(-0.3deg) translateX(-0.4px);
            }
          }
          @keyframes bl-ember-drift-1 {
            0% {
              transform: translate(0, 0) scale(0.8);
              opacity: 0;
            }
            15% {
              opacity: 0.9;
            }
            85% {
              opacity: 0.6;
            }
            100% {
              transform: translate(-12px, -120px) scale(1.2);
              opacity: 0;
            }
          }
          @keyframes bl-ember-drift-2 {
            0% {
              transform: translate(0, 0) scale(0.7);
              opacity: 0;
            }
            20% {
              opacity: 0.85;
            }
            80% {
              opacity: 0.5;
            }
            100% {
              transform: translate(18px, -140px) scale(1.3);
              opacity: 0;
            }
          }
          @keyframes bl-ember-drift-3 {
            0% {
              transform: translate(0, 0) scale(0.9);
              opacity: 0;
            }
            18% {
              opacity: 1;
            }
            82% {
              opacity: 0.55;
            }
            100% {
              transform: translate(-4px, -160px) scale(1.4);
              opacity: 0;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .bl-book-wrap,
            .bl-book,
            .bl-book-aura,
            .bl-rose-sigil,
            .bl-page-flutter,
            .bl-ember-1,
            .bl-ember-2,
            .bl-ember-3,
            .bl-ember-4,
            .bl-ember-5 {
              animation: none;
            }
            .bl-ember {
              opacity: 0.5;
            }
          }
        `}</style>

        <div
          className="bl-book-wrap mx-auto mb-8 relative"
          style={{ width: 240, height: 304 }}
        >
          {/* Embers drifting up from the book — five varied points along
              the base edge. Pure CSS keyframe animations, prefers-
              reduced-motion gated. */}
          <span
            aria-hidden="true"
            className="bl-ember bl-ember-1"
            style={{
              left: "18%",
              bottom: 0,
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD} 60%, transparent)`,
              boxShadow: `0 0 8px ${GOLD}, 0 0 14px ${GOLD}88`,
            }}
          />
          <span
            aria-hidden="true"
            className="bl-ember bl-ember-2"
            style={{
              left: "44%",
              bottom: 4,
              width: 3,
              height: 3,
              background: `radial-gradient(circle, ${GOLD_LIGHT}, ${CRIMSON_BRIGHT} 60%, transparent)`,
              boxShadow: `0 0 6px ${CRIMSON_BRIGHT}, 0 0 12px ${GOLD}66`,
            }}
          />
          <span
            aria-hidden="true"
            className="bl-ember bl-ember-3"
            style={{
              left: "72%",
              bottom: 0,
              width: 5,
              height: 5,
              background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD} 50%, transparent)`,
              boxShadow: `0 0 10px ${GOLD}, 0 0 16px ${GOLD}66`,
            }}
          />
          <span
            aria-hidden="true"
            className="bl-ember bl-ember-4"
            style={{
              left: "30%",
              bottom: -4,
              width: 3,
              height: 3,
              background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD_DEEP} 60%, transparent)`,
              boxShadow: `0 0 6px ${GOLD}, 0 0 10px ${GOLD}66`,
            }}
          />
          <span
            aria-hidden="true"
            className="bl-ember bl-ember-5"
            style={{
              left: "62%",
              bottom: -2,
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${GOLD_LIGHT}, ${CRIMSON} 60%, transparent)`,
              boxShadow: `0 0 8px ${CRIMSON_BRIGHT}, 0 0 14px ${GOLD}66`,
            }}
          />

          {/* The clickable book itself — opens the synopsis modal. */}
          <button
            type="button"
            onClick={() => setSynopsisOpen(true)}
            aria-label="Open Bloodlines synopsis — Lineage of Fire"
            className="bl-book-btn absolute inset-0"
          >
            <div className="bl-book relative w-full h-full">
              {/* Outer aura — pulses continuously, looks like the leather
                  is leaking light from behind the cover. */}
              <div
                aria-hidden="true"
                className="bl-book-aura absolute pointer-events-none"
                style={{
                  top: -28,
                  left: -28,
                  right: -28,
                  bottom: -28,
                  background: `radial-gradient(circle, ${GOLD}66 0%, ${GOLD_DEEP}33 35%, transparent 70%)`,
                  filter: "blur(24px)",
                }}
              />

              {/* Page-edge stack — RIGHT side. Subtle flutter animation
                  hints that the pages are loose, ready to open. */}
              <div
                aria-hidden="true"
                className="bl-page-flutter absolute"
                style={{
                  top: 5,
                  right: -4,
                  bottom: 5,
                  width: 7,
                  background:
                    "repeating-linear-gradient(to bottom, #e8dcc4 0px, #e8dcc4 0.8px, #b89668 0.8px, #b89668 1.6px, #d4c5a0 1.6px, #d4c5a0 2.4px)",
                  borderRight: "1px solid #3a2817",
                  borderRadius: "0 2px 2px 0",
                  boxShadow:
                    "1px 0 3px rgba(0, 0, 0, 0.5), inset 1px 0 0 rgba(58, 40, 23, 0.4)",
                }}
              />
              {/* Page-edge stack — BOTTOM side. Same pattern rotated. */}
              <div
                aria-hidden="true"
                className="absolute"
                style={{
                  left: 5,
                  right: 0,
                  bottom: -4,
                  height: 7,
                  background:
                    "repeating-linear-gradient(to right, #e8dcc4 0px, #e8dcc4 0.8px, #b89668 0.8px, #b89668 1.6px, #d4c5a0 1.6px, #d4c5a0 2.4px)",
                  borderBottom: "1px solid #3a2817",
                  borderRadius: "0 0 2px 2px",
                  boxShadow:
                    "0 1px 3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(58, 40, 23, 0.4)",
                }}
              />

              {/* Book cover — leather face. Existing monogram image is
                  used as the leather backdrop; the wilted-rose sigil +
                  metal corner studs render OVER it for the Enchiridion-
                  style heavy-tome feel. */}
              <div
                className="absolute inset-0 rounded-sm overflow-hidden"
                style={{
                  boxShadow:
                    "0 18px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(58, 40, 23, 0.7)",
                }}
              >
                <Image
                  src="/images/clients/bloodlines/bloodlines-monogram.jpg"
                  alt="Bloodlines — leather-bound book embossed with the wilted-rose sigil"
                  width={512}
                  height={640}
                  className="w-full h-full object-cover"
                  priority
                />

                {/* Dark wash over the existing monogram so the new
                    wilted-rose sigil reads as the dominant element. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 50%, rgba(20,12,6,0.55) 0%, rgba(20,12,6,0.7) 70%, rgba(10,6,3,0.85) 100%)",
                  }}
                />

                {/* Inner gold-embossed border — the kind of thin gilt
                    rectangle stamped just inside the leather edge. */}
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    top: 14,
                    left: 18,
                    right: 14,
                    bottom: 14,
                    border: `1px solid ${GOLD_DEEP}`,
                    opacity: 0.7,
                    borderRadius: 2,
                    boxShadow: `inset 0 0 8px ${GOLD_DEEP}55`,
                  }}
                />

                {/* Wilted-rose sigil — embossed on the cover, glowing
                    softly. The lore says the wilted rose is the
                    bloodline mark. */}
                <div
                  aria-hidden="true"
                  className="bl-rose-sigil absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ color: GOLD }}
                >
                  <WiltedRoseSigil size={120} />
                </div>

                {/* Spine binding on the LEFT — dark gradient that fakes
                    the rolled leather binding. Heavier metal bands now
                    spread across the spine + cover edge for the
                    Enchiridion vibe. */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: 14,
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.2) 100%)",
                    borderRight: "1px solid rgba(58, 40, 23, 0.7)",
                  }}
                />

                {/* Heavy metal bands across the spine + over cover */}
                {[42, 100, 168, 230, 280].map((y, i) => (
                  <div
                    key={`band-${i}`}
                    aria-hidden="true"
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{
                      top: y,
                      height: 5,
                      background: `linear-gradient(180deg, ${GOLD_LIGHT}55 0%, ${GOLD_DEEP} 35%, ${GOLD} 50%, ${GOLD_DEEP} 65%, rgba(0,0,0,0.5) 100%)`,
                      boxShadow: `0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 ${GOLD_LIGHT}55`,
                      opacity: 0.85,
                    }}
                  />
                ))}

                {/* Top edge highlight + bottom edge shadow — fakes the
                    3D thickness of the cover material. */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(212, 168, 83, 0.5), transparent)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)",
                  }}
                />

                {/* Subtle hairline crack of light along the right edge —
                    hints that the cover is ALMOST open. Faint gold seam. */}
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    right: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 1,
                    background: `linear-gradient(to bottom, transparent, ${GOLD}66 30%, ${GOLD}99 50%, ${GOLD}66 70%, transparent)`,
                    boxShadow: `0 0 4px ${GOLD}, 0 0 8px ${GOLD}66`,
                  }}
                />

                {/* Metal corner studs — bezel-set crimson cabochons at
                    each cover corner. Anchored absolute. */}
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{ top: 4, left: 4 }}
                >
                  <MetalCornerStud corner="tl" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{ top: 4, right: 4 }}
                >
                  <MetalCornerStud corner="tr" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{ bottom: 4, left: 4 }}
                >
                  <MetalCornerStud corner="bl" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{ bottom: 4, right: 4 }}
                >
                  <MetalCornerStud corner="br" />
                </div>
              </div>
            </div>
          </button>

          {/* Click hint — small italic gold caption beneath the book */}
          <p
            className="absolute left-1/2 -translate-x-1/2 -bottom-7 text-[11px] italic whitespace-nowrap pointer-events-none"
            style={{
              color: `${GOLD_DEEP}cc`,
              fontFamily: "'EB Garamond', serif",
              letterSpacing: "0.08em",
            }}
          >
            tap to open
          </p>
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

        {/* Wax-seal scroll badges — antique parchment ribbons with crimson
            wax-seal dots framing the social proof. */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <WaxSealStat>
            <span className="inline-flex items-center gap-1.5">
              <Star /> 4.4 on Amazon
            </span>
          </WaxSealStat>
          <WaxSealStat>62+ reviews</WaxSealStat>
          <WaxSealStat>For readers 11+</WaxSealStat>
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
    <section className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden">
      <DriftingFog tint={GOLD_DEEP} count={3} />
      <KingdomSilhouette />
      <div className="relative max-w-3xl mx-auto">
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
    <section id="books" className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #09090b 0%, #100b0b 50%, #09090b 100%)" }}>
      <KingdomSilhouette />
      <FloatingDust count={12} tint={GOLD} />
      <DriftingFog tint={CRIMSON} count={2} />
      <div className="relative max-w-6xl mx-auto">
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
                className="absolute -inset-6 rounded-sm opacity-75 blur-3xl transition-all duration-500 group-hover:opacity-100 group-hover:-inset-10 group-hover:blur-[60px]"
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
              <p className="text-lg sm:text-xl italic max-w-md mx-auto mb-6 leading-relaxed" style={{ color: "rgba(232, 220, 196, 0.85)" }}>
                The night that turns Sopher and Proph&apos;s world over. The first book in the saga.
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
                className="absolute -inset-6 rounded-sm opacity-75 blur-3xl transition-all duration-500 group-hover:opacity-100 group-hover:-inset-10 group-hover:blur-[60px]"
                style={{ background: `radial-gradient(circle, ${CRIMSON_BRIGHT} 0%, transparent 70%)` }}
              />
              <Image
                src="/images/clients/bloodlines/cover-house-of-the-rose.jpg"
                alt="House of the Rose — Book Two of the Bloodlines saga by Preston James Hunsaker"
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
                Book Two
              </p>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
              >
                House of the Rose
              </h3>
              <p className="text-lg sm:text-xl italic max-w-md mx-auto mb-6 leading-relaxed" style={{ color: "rgba(232, 220, 196, 0.85)" }}>
                The saga continues. The wilted rose was never just a sigil.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm mb-6" style={{ color: "rgba(232, 220, 196, 0.6)" }}>
                <span className="flex items-center gap-1"><Star /> 4.6</span>
                <span>·</span>
                <span>424 pages</span>
                <span>·</span>
                <span>Ages 11+</span>
              </div>
              <a
                href={AMAZON_HOUSE}
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

  // ── Pan + zoom state ─────────────────────────────────────────
  // The pan-area is the masked viewport; pan-content is the
  // transformed inner div carrying the SVG + pin overlay together
  // so they stay in lockstep through any drag/zoom.
  const panAreaRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef<
    | { startX: number; startY: number; baseTx: number; baseTy: number; pointerId: number; moved: boolean }
    | null
  >(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);

  const SCALE_MIN = 1;
  const SCALE_MAX = 4;

  const clamp = useCallback((v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi), []);

  const resetView = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  // Wheel zoom — must register via addEventListener with passive:false
  // so we can preventDefault and stop the page from scrolling under us.
  useEffect(() => {
    const el = panAreaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((prev) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const next = clamp(prev * factor, SCALE_MIN, SCALE_MAX);
        if (next === SCALE_MIN) {
          // Settle back to origin when fully zoomed out.
          setTx(0);
          setTy(0);
        }
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clamp]);

  // Auto-clear stale pan flag if the pointer is released outside the area.
  useEffect(() => {
    if (!isPanning) return;
    const onUp = () => {
      setIsPanning(false);
      dragRef.current = null;
      pointersRef.current.clear();
      pinchRef.current = null;
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isPanning]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't intercept clicks on the pin buttons — let them bubble
    // through to the LOCATION onClick.
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      pinchRef.current = { startDist: Math.hypot(dx, dy), startScale: scale };
      dragRef.current = null;
      return;
    }
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseTx: tx,
      baseTy: ty,
      pointerId: e.pointerId,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    // Pinch-to-zoom path
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy);
      const next = clamp(
        pinchRef.current.startScale * (dist / pinchRef.current.startDist),
        SCALE_MIN,
        SCALE_MAX,
      );
      setScale(next);
      setIsPanning(true);
      return;
    }
    // Drag-to-pan path
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    setIsPanning(true);
    setTx(drag.baseTx + dx);
    setTy(drag.baseTy + dy);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      dragRef.current = null;
      setIsPanning(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    e.preventDefault();
    if (scale > 1.01) {
      resetView();
    } else {
      setScale(2);
    }
  };

  const isZoomed = scale > 1.01 || Math.abs(tx) > 1 || Math.abs(ty) > 1;

  return (
    <section
      id="world"
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{ background: "#0b0907" }}
    >
      <LandscapeBackdrop />
      <DriftingFog tint={GOLD_DEEP} count={3} />
      <div className="relative max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="The Realm"
          title="The World of Annarose"
          subtitle="Tap a location to learn its lore."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Map — LOTR-style parchment cartography. The hot-spot
              percent coords (LOCATIONS x/y) are still in the viewBox
              0-100/75 space; the underlying SVG art is hand-detailed
              in ink on aged paper to evoke a real cartographer's
              document pulled from a Bloodlines lorebook. */}
          <div
            className="relative aspect-[4/3] rounded-sm overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, #ecdcb8 0%, #d8c39a 70%, #b89b6e 100%)",
              boxShadow:
                "inset 0 0 60px rgba(58, 40, 23, 0.35), 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(58,40,23,0.4)",
              border: `2px solid #8b6914`,
            }}
          >
            {/* Pan/zoom viewport — handles mouse drag + wheel zoom +
                touch pinch. The pan-content child carries the SVG art
                + pin overlay together so they translate/scale as one. */}
            <div
              ref={panAreaRef}
              className={`bl-map-pan-area absolute inset-0 select-none ${isZoomed ? "bl-map-zoomed" : ""} ${isPanning ? "bl-map-panning" : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{
                touchAction: "none",
                cursor: isPanning ? "grabbing" : "grab",
              }}
            >
              <div
                className="bl-map-pan-content absolute inset-0"
                style={{
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 0.28s ease-out",
                  willChange: "transform",
                }}
              >
                <svg
                  viewBox="0 0 100 75"
                  preserveAspectRatio="xMidYMid meet"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  aria-hidden="true"
                >
              <defs>
                {/* Reusable mountain peak symbol — single jagged
                    triangle with snow cap + hatched shading. */}
                <symbol id="bl-peak" viewBox="-3 -4 6 5" overflow="visible">
                  <polygon points="-3 1 0 -4 3 1" fill="#3a2817" />
                  <polygon points="-1.4 -1.2 0 -4 1.4 -1.2 0.4 -1.5 0 -2.4 -0.4 -1.5" fill="#fdfaf3" opacity="0.85" />
                  <path d="M -2.2 0 L -1.4 0.6 M 1.4 0 L 2.2 0.6 M -0.6 -1 L 0 -0.4 M 1 -1.2 L 1.6 -0.5" stroke="#1a0e08" strokeWidth="0.12" />
                </symbol>

                {/* Tree symbol — pine triangle on a tiny trunk. */}
                <symbol id="bl-tree" viewBox="-1 -2 2 2.5" overflow="visible">
                  <polygon points="-0.7 0.2 0 -2 0.7 0.2" fill="#1f3014" />
                  <polygon points="-0.55 -0.4 0 -1.6 0.55 -0.4" fill="#2d4a1f" />
                  <rect x="-0.1" y="0.2" width="0.2" height="0.3" fill="#2a1810" />
                </symbol>

                {/* Hut symbol — tiny gabled house. */}
                <symbol id="bl-hut" viewBox="-1.2 -1.2 2.4 1.5" overflow="visible">
                  <rect x="-0.9" y="-0.4" width="1.8" height="0.7" fill="#3a2817" />
                  <polygon points="-1.05 -0.4 0 -1.2 1.05 -0.4" fill="#3a2817" />
                  <rect x="-0.2" y="0" width="0.4" height="0.3" fill="#1a0e08" />
                </symbol>

                {/* Wave hatch — sea/edges suggestion. */}
                <symbol id="bl-wave" viewBox="0 0 4 1" overflow="visible">
                  <path d="M 0 0.5 Q 1 0, 2 0.5 T 4 0.5" fill="none" stroke="#3a2817" strokeWidth="0.12" />
                </symbol>

                {/* Painted peak — denser Tolkien shading. Layered
                    silhouette + sun-side highlight + shadow ravine
                    + snow cap with flecks of moraine. */}
                <symbol id="bl-peak-painted" viewBox="-3 -4 6 5" overflow="visible">
                  <polygon points="-3 1 0 -4 3 1" fill="#241608" />
                  <polygon points="-1.6 -0.6 0 -4 1.4 -1.4" fill="#3a2817" />
                  <polygon points="-3 1 -1.4 -1.4 0 -2 0 1" fill="#1a0e08" opacity="0.55" />
                  <polygon points="-1.4 -1.2 0 -4 1.4 -1.2 0.6 -1.5 0.2 -2.6 0 -2.4 -0.2 -2.6 -0.6 -1.5" fill="#fdfaf3" opacity="0.92" />
                  <polygon points="0.4 -2.6 0.7 -3 0.5 -2.55" fill="#a89976" opacity="0.6" />
                  <path d="M -2.2 0 L -1.4 0.6 M 1.4 0 L 2.2 0.6 M -0.6 -1 L 0 -0.4 M 1 -1.2 L 1.6 -0.5 M -1.8 0.4 L -1 0.9" stroke="#0d0703" strokeWidth="0.12" fill="none" />
                </symbol>

                {/* Painted tree — multi-layered pine with deep
                    underbrush tone, midtone, light-side flecks. */}
                <symbol id="bl-tree-painted" viewBox="-1 -2 2 2.5" overflow="visible">
                  <polygon points="-0.7 0.2 0 -2 0.7 0.2" fill="#15240e" />
                  <polygon points="-0.55 -0.2 0 -1.8 0.55 -0.2" fill="#22381a" />
                  <polygon points="-0.4 -0.5 0 -1.5 0.4 -0.5" fill="#2f4a25" />
                  <path d="M -0.18 -1 L 0.05 -1.5" stroke="#4d6b3e" strokeWidth="0.06" />
                  <rect x="-0.1" y="0.2" width="0.2" height="0.3" fill="#2a1810" />
                </symbol>

                {/* Stone pillar — Stonewake Halls glyph. Rune-cut
                    column with carved bands. */}
                <symbol id="bl-pillar" viewBox="-1 -2 2 2.5" overflow="visible">
                  <rect x="-0.5" y="-1.4" width="1" height="1.6" fill="#3a2817" />
                  <rect x="-0.7" y="-1.6" width="1.4" height="0.25" fill="#3a2817" />
                  <rect x="-0.7" y="0.2" width="1.4" height="0.25" fill="#3a2817" />
                  <line x1="-0.5" y1="-1.05" x2="0.5" y2="-1.05" stroke="#1a0e08" strokeWidth="0.06" />
                  <line x1="-0.5" y1="-0.55" x2="0.5" y2="-0.55" stroke="#1a0e08" strokeWidth="0.06" />
                  <circle cx="0" cy="-0.8" r="0.13" fill="#7f1d1d" opacity="0.7" />
                </symbol>

                {/* Tideborn Wells — concentric ripples around a
                    spring. Gold filament hints at elleta-bond. */}
                <symbol id="bl-wells" viewBox="-1.4 -1.4 2.8 2.8" overflow="visible">
                  <circle r="1.2" fill="#3a6586" opacity="0.18" />
                  <circle r="1" fill="none" stroke="#3a6586" strokeWidth="0.08" />
                  <circle r="0.7" fill="none" stroke="#3a6586" strokeWidth="0.08" />
                  <circle r="0.4" fill="#5a8aab" />
                  <circle r="0.18" fill="#fdfaf3" opacity="0.85" />
                  <line x1="0.5" y1="-0.5" x2="1.1" y2="-1.1" stroke="#d4a853" strokeWidth="0.07" opacity="0.7" />
                </symbol>

                {/* Skyveil Crags — jagged shelf with curving wind
                    streamers running across the face. */}
                <symbol id="bl-crags" viewBox="-2 -2 4 3" overflow="visible">
                  <polygon points="-1.8 0.6 -1 -1.4 -0.4 -0.4 0.2 -1.8 1 -0.6 1.8 0.6" fill="#241608" />
                  <polygon points="-1 -1.4 -0.7 -0.6 -0.4 -0.4" fill="#fdfaf3" opacity="0.85" />
                  <polygon points="0.2 -1.8 0.6 -1 1 -0.6" fill="#fdfaf3" opacity="0.9" />
                  <path d="M -1.8 -0.4 Q -0.5 -0.6, 0.2 -0.2 Q 1 0.1, 1.8 -0.3" fill="none" stroke="#5a8aab" strokeWidth="0.09" opacity="0.75" />
                  <path d="M -1.6 0.1 Q -0.3 -0.1, 0.4 0.2 Q 1.2 0.5, 1.6 0.2" fill="none" stroke="#5a8aab" strokeWidth="0.07" opacity="0.55" />
                </symbol>

                {/* Lumengarde Vault — locked rune stone with
                    rays of light leaking from the seal. */}
                <symbol id="bl-vault" viewBox="-1.4 -1.4 2.8 2.8" overflow="visible">
                  <rect x="-0.9" y="-1" width="1.8" height="2" fill="#3a2817" rx="0.18" />
                  <rect x="-0.7" y="-0.85" width="1.4" height="1.7" fill="none" stroke="#7c5e2c" strokeWidth="0.07" rx="0.12" />
                  <circle cx="0" cy="-0.05" r="0.32" fill="#facc15" />
                  <circle cx="0" cy="-0.05" r="0.55" fill="none" stroke="#facc15" strokeWidth="0.05" opacity="0.5" />
                  <path d="M 0 -0.05 L 0 -1.3 M 0 -0.05 L 0 0.95 M 0 -0.05 L -1.2 -0.05 M 0 -0.05 L 1.2 -0.05" stroke="#facc15" strokeWidth="0.05" opacity="0.45" />
                  <rect x="-0.2" y="0.25" width="0.4" height="0.55" fill="#1a0e08" />
                  <circle cx="0" cy="0.45" r="0.08" fill="#facc15" />
                </symbol>

                {/* Pyrelle Reach — flame rising from a scorched
                    basin. Sarv-e's vigil. */}
                <symbol id="bl-flame" viewBox="-1.4 -2 2.8 3" overflow="visible">
                  <ellipse cx="0" cy="0.85" rx="1.2" ry="0.18" fill="#3a2817" opacity="0.45" />
                  <path d="M -0.7 0.7 Q -0.85 -0.1, -0.35 -0.65 Q -0.1 -1, 0 -1.7 Q 0.1 -1, 0.35 -0.65 Q 0.85 -0.1, 0.7 0.7 Z" fill="#7f1d1d" />
                  <path d="M -0.45 0.55 Q -0.55 -0.05, -0.15 -0.5 Q 0 -0.85, 0 -1.4 Q 0 -0.85, 0.15 -0.5 Q 0.55 -0.05, 0.45 0.55 Z" fill="#dc2626" />
                  <path d="M -0.22 0.4 Q -0.3 -0.1, 0 -0.5 Q 0.05 -0.85, 0 -1.1 Q -0.05 -0.85, 0 -0.5 Q 0.3 -0.1, 0.22 0.4 Z" fill="#facc15" />
                  <circle cx="0" cy="-0.05" r="0.12" fill="#fdfaf3" opacity="0.85" />
                </symbol>

                {/* Tall tower — Archives / Skyveil cadet roost.
                    Slim spire with three windows + flag. */}
                <symbol id="bl-tower" viewBox="-1 -3 2 3.5" overflow="visible">
                  <rect x="-0.45" y="-2.2" width="0.9" height="2.5" fill="#3a2817" />
                  <polygon points="-0.55 -2.2 0.55 -2.2 0 -2.95" fill="#3a2817" />
                  <line x1="0" y1="-2.95" x2="0" y2="-3.4" stroke="#3a2817" strokeWidth="0.08" />
                  <polygon points="0 -3.4 0.5 -3.25 0 -3.1" fill="#7f1d1d" />
                  <rect x="-0.12" y="-1.7" width="0.24" height="0.32" fill="#fdfaf3" opacity="0.7" />
                  <rect x="-0.12" y="-1.1" width="0.24" height="0.32" fill="#fdfaf3" opacity="0.55" />
                  <rect x="-0.12" y="-0.5" width="0.24" height="0.32" fill="#fdfaf3" opacity="0.45" />
                </symbol>
              </defs>

              {/* Parchment base — already from container bg, but add
                  subtle texture stains so it doesn't look digital. */}
              <g opacity="0.18">
                <ellipse cx="12" cy="9" rx="14" ry="5" fill="#8b6914" />
                <ellipse cx="86" cy="62" rx="12" ry="6" fill="#7a5a35" />
                <ellipse cx="48" cy="40" rx="22" ry="11" fill="#a0824f" opacity="0.5" />
                <ellipse cx="20" cy="65" rx="9" ry="3" fill="#5a3d1c" opacity="0.7" />
                <ellipse cx="78" cy="14" rx="7" ry="4" fill="#5a3d1c" />
                {/* Extra weathering blotches near edges — water rings,
                    candle drips, the stuff that happens to a real
                    map after a few seasons in a saddlebag. */}
                <ellipse cx="8" cy="38" rx="3" ry="5" fill="#8b6914" opacity="0.6" />
                <ellipse cx="93" cy="40" rx="2.5" ry="4" fill="#8b6914" opacity="0.5" />
                <ellipse cx="55" cy="68" rx="6" ry="2" fill="#5a3d1c" opacity="0.4" />
                <ellipse cx="32" cy="48" rx="4" ry="2" fill="#7a5a35" opacity="0.35" />
                <circle cx="68" cy="20" r="1.4" fill="#5a3d1c" opacity="0.5" />
                <circle cx="68" cy="20" r="0.6" fill="#8b6914" opacity="0.7" />
              </g>

              {/* Paper crease lines — subtle diagonal folds where the
                  map has been folded and unfolded many times. Drawn as
                  long, faint linear gradients. */}
              <g opacity="0.13" stroke="#5a3d1c" fill="none">
                <line x1="32" y1="2" x2="36" y2="73" strokeWidth="0.28" strokeLinecap="round" />
                <line x1="65" y1="2" x2="68" y2="73" strokeWidth="0.28" strokeLinecap="round" />
                <line x1="2" y1="35" x2="98" y2="38" strokeWidth="0.28" strokeLinecap="round" />
                {/* Tiny edge wear marks — small ink scuffs near border */}
                <line x1="2.5" y1="14" x2="3.2" y2="13.6" strokeWidth="0.3" />
                <line x1="97.3" y1="22" x2="96.7" y2="22.4" strokeWidth="0.3" />
                <line x1="14" y1="72.5" x2="14.4" y2="71.8" strokeWidth="0.3" />
                <line x1="82" y1="72.4" x2="82.5" y2="71.7" strokeWidth="0.3" />
              </g>

              {/* Decorative TRIPLE border in ink — outer thick, mid
                  thin, inner ornamental dashed */}
              <rect x="0.8" y="0.8" width="98.4" height="73.4" fill="none" stroke="#3a2817" strokeWidth="0.35" />
              <rect x="2" y="2" width="96" height="71" fill="none" stroke="#3a2817" strokeWidth="0.18" />
              <rect x="2.6" y="2.6" width="94.8" height="69.8" fill="none" stroke="#3a2817" strokeWidth="0.08" strokeDasharray="0.4 0.6" opacity="0.7" />

              {/* Ornate corner fleur-de-lis style flourishes (4 corners) */}
              {[
                { tx: 3.5, ty: 3.5, rot: 0 },
                { tx: 96.5, ty: 3.5, rot: 90 },
                { tx: 96.5, ty: 71.5, rot: 180 },
                { tx: 3.5, ty: 71.5, rot: 270 },
              ].map(({ tx, ty, rot }, i) => (
                <g key={i} transform={`translate(${tx}, ${ty}) rotate(${rot})`}>
                  {/* Diagonal corner line */}
                  <path d="M 0 0 L 2 2" stroke="#3a2817" strokeWidth="0.2" />
                  {/* Curling scrollwork */}
                  <path d="M 0 0 Q 1.5 -0.3, 2.4 0.4 Q 2.9 1.2, 2.2 2 Q 1.4 2.8, 0.6 2.4" fill="none" stroke="#3a2817" strokeWidth="0.18" />
                  <path d="M 0 0 Q -0.4 1.6, 0.6 2.4 Q 1.6 3, 2.6 2.6" fill="none" stroke="#3a2817" strokeWidth="0.14" opacity="0.7" />
                  {/* Center pip */}
                  <circle cx="1.6" cy="1.6" r="0.25" fill="#3a2817" />
                  <circle cx="1.6" cy="1.6" r="0.12" fill="#7f1d1d" />
                </g>
              ))}

              {/* Title cartouche — scrollwork-flanked plate */}
              <g transform="translate(50, 4.8)">
                {/* Left scroll curl */}
                <g transform="translate(-23, 0)">
                  <path d="M 0 -0.2 Q -2 -1.3, -1.6 -2.4 Q -0.6 -3, 0.4 -2.6" fill="none" stroke="#3a2817" strokeWidth="0.2" />
                  <path d="M 0 0.2 Q -2 1.3, -1.6 2.4 Q -0.6 3, 0.4 2.6" fill="none" stroke="#3a2817" strokeWidth="0.2" />
                  <circle cx="-1.4" cy="0" r="0.45" fill="#ecdcb8" stroke="#3a2817" strokeWidth="0.15" />
                  <circle cx="-1.4" cy="0" r="0.2" fill="#7f1d1d" />
                </g>
                {/* Right scroll curl (mirrored) */}
                <g transform="translate(23, 0)">
                  <path d="M 0 -0.2 Q 2 -1.3, 1.6 -2.4 Q 0.6 -3, -0.4 -2.6" fill="none" stroke="#3a2817" strokeWidth="0.2" />
                  <path d="M 0 0.2 Q 2 1.3, 1.6 2.4 Q 0.6 3, -0.4 2.6" fill="none" stroke="#3a2817" strokeWidth="0.2" />
                  <circle cx="1.4" cy="0" r="0.45" fill="#ecdcb8" stroke="#3a2817" strokeWidth="0.15" />
                  <circle cx="1.4" cy="0" r="0.2" fill="#7f1d1d" />
                </g>

                {/* Cartouche plate — slightly aged paper inside borders */}
                <rect x="-22" y="-2.6" width="44" height="4.8" fill="#f4e6c8" stroke="#3a2817" strokeWidth="0.28" rx="0.6" />
                <rect x="-21" y="-1.85" width="42" height="3.3" fill="none" stroke="#3a2817" strokeWidth="0.1" rx="0.4" />
                {/* Tiny corner notches inside the plate */}
                <path d="M -20.5 -2.1 L -20.1 -1.7 M 20.5 -2.1 L 20.1 -1.7 M -20.5 1.7 L -20.1 1.3 M 20.5 1.7 L 20.1 1.3" stroke="#3a2817" strokeWidth="0.1" />

                <text x="0" y="0.6" fontSize="2.1" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontWeight="700" letterSpacing="0.45">
                  THE KINGDOM OF ANNAROSE
                </text>

                {/* Decorative flourish line BELOW the cartouche */}
                <path d="M -7 3.4 Q 0 3.9, 7 3.4" fill="none" stroke="#3a2817" strokeWidth="0.13" />
                <circle cx="0" cy="3.6" r="0.22" fill="#7f1d1d" />
                <circle cx="0" cy="3.6" r="0.42" fill="none" stroke="#3a2817" strokeWidth="0.1" />
              </g>

              {/* ───── THE FAR PEAKS (Mt. Raylia, NW corner) ─────
                  Layered painted range: ridge shadow first, then the
                  sun-faced peaks layered on top so the chain reads as
                  Tolkien-painted cartography rather than uniform ink
                  triangles. */}
              <g>
                {/* Distant ridge silhouette behind the peaks */}
                <path d="M 4 16 Q 9 9, 13 11 Q 17 6, 22 9 Q 27 12, 31 11 L 33 17 Z" fill="#241608" opacity="0.75" />
                {/* Foreground sun-faced range */}
                <use href="#bl-peak-painted" x="8" y="11" width="6" height="5" />
                <use href="#bl-peak-painted" x="14" y="9" width="7" height="6" />
                <use href="#bl-peak-painted" x="20" y="11" width="6" height="5" />
                <use href="#bl-peak-painted" x="11" y="14" width="5" height="4" />
                <use href="#bl-peak-painted" x="18" y="13" width="4.5" height="4" />
                {/* Chain of smaller peaks tailing east */}
                <use href="#bl-peak-painted" x="26" y="13" width="3.5" height="3" />
                <use href="#bl-peak-painted" x="30" y="14" width="3" height="2.5" />
                {/* Skyveil cadet roost peaks — far-NW corner */}
                <use href="#bl-peak-painted" x="4" y="9" width="4.5" height="4" />
                <use href="#bl-peak-painted" x="2" y="13" width="3.5" height="3" />
              </g>
              {/* Small range near Wyldhelm border */}
              <g>
                <path d="M 78 19 Q 82 13, 86 14 Q 90 11, 94 14 L 95 20 Z" fill="#241608" opacity="0.75" />
                <use href="#bl-peak-painted" x="80" y="15" width="5" height="4" />
                <use href="#bl-peak-painted" x="85" y="12" width="6" height="5" />
                <use href="#bl-peak-painted" x="91" y="15" width="5" height="4" />
                <use href="#bl-peak-painted" x="84" y="18" width="4" height="3" />
                <use href="#bl-peak-painted" x="89" y="18" width="3.5" height="2.8" />
              </g>
              {/* Western foothills — Pyrelle Reach + scorched basin
                  approaches. A few low painted peaks separate the
                  western coast from the lowlands. */}
              <g>
                <use href="#bl-peak-painted" x="4" y="38" width="4" height="3.2" />
                <use href="#bl-peak-painted" x="9" y="40" width="3.5" height="2.8" />
                <use href="#bl-peak-painted" x="13" y="42" width="3" height="2.5" />
                <ellipse cx="6" cy="44" rx="6" ry="1.5" fill="#3a2817" opacity="0.18" />
              </g>

              {/* Mountain base shadows — soft elliptical patches under
                  each peak chain to fake the shadow they'd cast across
                  the landscape. Adds depth without pulling focus. */}
              <g opacity="0.14" fill="#3a2817">
                <ellipse cx="18" cy="17" rx="14" ry="2" />
                <ellipse cx="86" cy="20.5" rx="9" ry="1.6" />
              </g>

              {/* Forest shadows — flat dark ellipses laid beneath the
                  pine clusters so the canopy reads as massed treetops
                  instead of sparse symbols. */}
              <g opacity="0.18" fill="#1a2010">
                <ellipse cx="22" cy="32" rx="13" ry="2.6" />
                <ellipse cx="68" cy="58" rx="13" ry="2.4" />
                <ellipse cx="43" cy="62.5" rx="4" ry="1.4" />
              </g>

              {/* ───── FOREST PATCHES ───── */}
              {/* Uplands woods */}
              <g>
                {[[14,28],[16,30],[19,29],[21,30.5],[24,29.5],[27,30],[30,29],[15,32],[18,32.5],[22,32],[26,32],[29,32.5],[33,31],[12,30.5],[16,33.5],[20,34],[25,33.5],[30,33.5],[34,32.5]].map(([x,y],i) => (
                  <use key={`uw-${i}`} href="#bl-tree-painted" x={x} y={y} width="1.6" height="2" />
                ))}
              </g>
              {/* Lowlands forest near the Tags */}
              <g>
                {[[58,55],[60,56],[63,55],[66,56.5],[69,55.5],[72,56],[75,55],[60,58],[64,58.5],[68,58],[72,58.5],[76,57.5],[79,58],[58,59],[63,60],[68,60.5],[73,60],[77,60.5]].map(([x,y],i) => (
                  <use key={`lw-${i}`} href="#bl-tree-painted" x={x} y={y} width="1.5" height="1.9" />
                ))}
              </g>
              {/* Sparse trees south of Annarose */}
              <g>
                {[[42,60],[46,61],[40,62.5],[44,63],[48,62.5]].map(([x,y],i) => (
                  <use key={`sw-${i}`} href="#bl-tree-painted" x={x} y={y} width="1.3" height="1.7" />
                ))}
              </g>
              {/* Skyveil pine ridge — sparse alpine treeline below
                  the Crags. */}
              <g>
                {[[6,15],[10,16],[14,17],[18,18],[22,18.5],[26,18]].map(([x,y],i) => (
                  <use key={`sky-${i}`} href="#bl-tree-painted" x={x} y={y} width="1.1" height="1.4" />
                ))}
              </g>

              {/* ───── RIVER (from Mt. Raylia south through Annarose then east to Tags) ───── */}
              <path
                d="M 14 8 Q 18 16, 24 24 Q 30 32, 38 40 Q 45 47, 50 51 Q 56 56, 64 60 Q 72 64, 86 70"
                fill="none"
                stroke="#3a6586"
                strokeWidth="0.55"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 14 8 Q 18 16, 24 24 Q 30 32, 38 40 Q 45 47, 50 51 Q 56 56, 64 60 Q 72 64, 86 70"
                fill="none"
                stroke="#5a8aab"
                strokeWidth="0.18"
                strokeLinecap="round"
                opacity="0.7"
              />
              {/* River label */}
              <text x="32" y="38" fontSize="1.1" fill="#3a6586" fontFamily="Cinzel" fontStyle="italic" transform="rotate(35 32 38)" opacity="0.85">
                Annarose River
              </text>

              {/* ───── ROADS (dashed) ───── */}
              <g stroke="#5a3d1c" strokeWidth="0.22" strokeDasharray="0.6 0.5" fill="none" opacity="0.75">
                {/* Annarose ↔ Uplands */}
                <path d="M 49 50 Q 38 40, 30 30" />
                {/* Annarose ↔ Tags */}
                <path d="M 51 53 Q 60 62, 71 69" />
                {/* Annarose ↔ RGA (Royal Guard Academy) */}
                <path d="M 51 49 L 55 45" />
                {/* RGA ↔ Wilted Rose hidden trail */}
                <path d="M 55 45 Q 47 50, 39 56" strokeDasharray="0.3 0.6" opacity="0.5" />
                {/* North road toward Far Peaks */}
                <path d="M 30 30 Q 22 22, 17 14" />
                {/* East road toward Wyldhelm border (warning) */}
                <path d="M 51 50 Q 70 35, 84 22" strokeDasharray="0.3 0.8" opacity="0.5" />
              </g>

              {/* ───── TOWN/FEATURE ICONS ───── */}
              {/* Annarose castle (large central icon) */}
              <g transform="translate(50, 51.5)">
                {/* Hill base shading */}
                <ellipse cx="0" cy="3" rx="6.5" ry="0.7" fill="#5a3d1c" opacity="0.5" />
                {/* Main wall */}
                <rect x="-3.6" y="-0.6" width="7.2" height="3.2" fill="#3a2817" />
                {/* Crenellations along wall */}
                {[-3.4, -2.4, -1.4, -0.4, 0.6, 1.6, 2.6].map((cx, i) => (
                  <rect key={`cn-${i}`} x={cx} y="-1.2" width="0.6" height="0.6" fill="#3a2817" />
                ))}
                {/* Central keep */}
                <rect x="-1" y="-2.6" width="2" height="2" fill="#3a2817" />
                <polygon points="-1 -2.6 1 -2.6 0 -3.6" fill="#3a2817" />
                {/* Banner */}
                <line x1="0" y1="-3.6" x2="0" y2="-4.5" stroke="#3a2817" strokeWidth="0.12" />
                <polygon points="0 -4.5 1.2 -4.2 0 -3.9" fill="#7f1d1d" />
                {/* Side towers */}
                <rect x="-3.2" y="-1.8" width="1" height="1.4" fill="#3a2817" />
                <polygon points="-3.2 -1.8 -2.2 -1.8 -2.7 -2.5" fill="#3a2817" />
                <rect x="2.2" y="-1.8" width="1" height="1.4" fill="#3a2817" />
                <polygon points="2.2 -1.8 3.2 -1.8 2.7 -2.5" fill="#3a2817" />
                {/* Tiny windows */}
                <rect x="-0.3" y="-1.8" width="0.25" height="0.4" fill="#fdfaf3" opacity="0.5" />
                <rect x="0.05" y="-1.8" width="0.25" height="0.4" fill="#fdfaf3" opacity="0.5" />
              </g>

              {/* The Tags — cluster of huts */}
              <g transform="translate(72, 70)">
                <use href="#bl-hut" x="-2.5" y="-0.3" width="2" height="1.2" />
                <use href="#bl-hut" x="-0.5" y="-0.5" width="2" height="1.3" />
                <use href="#bl-hut" x="1.5" y="-0.2" width="2" height="1.2" />
                <use href="#bl-hut" x="-1.5" y="0.6" width="2" height="1.2" />
                <use href="#bl-hut" x="0.5" y="0.7" width="2" height="1.2" />
                {/* Smoke wisps */}
                <path d="M 0 -1.5 Q 0.4 -2, 0 -2.5 Q -0.4 -3, 0 -3.5" fill="none" stroke="#3a2817" strokeWidth="0.15" opacity="0.6" />
                <path d="M -2 -1.3 Q -2.3 -1.8, -2 -2.3" fill="none" stroke="#3a2817" strokeWidth="0.12" opacity="0.5" />
              </g>

              {/* The Uplands — small village */}
              <g transform="translate(28, 28)">
                <use href="#bl-hut" x="-1.5" y="-0.4" width="1.8" height="1.2" />
                <use href="#bl-hut" x="0" y="-0.6" width="1.8" height="1.2" />
                <use href="#bl-hut" x="-0.5" y="0.5" width="1.8" height="1.2" />
                {/* Path */}
                <path d="M -2 1.5 Q 0 0.8, 2 1.5" fill="none" stroke="#5a3d1c" strokeWidth="0.15" opacity="0.6" />
              </g>

              {/* Royal Guard Academy — fortified building with crossed swords */}
              <g transform="translate(56, 44)">
                <rect x="-2" y="-1.2" width="4" height="2.4" fill="#3a2817" />
                <polygon points="-2.2 -1.2 2.2 -1.2 0 -2.4" fill="#3a2817" />
                {/* Banner */}
                <line x1="0" y1="-2.4" x2="0" y2="-3.2" stroke="#3a2817" strokeWidth="0.1" />
                <polygon points="0 -3.2 0.8 -3, 0 -2.8" fill="#3a2817" />
                {/* Crossed swords below */}
                <g transform="translate(0, 1.8)">
                  <line x1="-1" y1="-0.4" x2="1" y2="0.4" stroke="#3a2817" strokeWidth="0.18" strokeLinecap="round" />
                  <line x1="-1" y1="0.4" x2="1" y2="-0.4" stroke="#3a2817" strokeWidth="0.18" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="0.18" fill="#7f1d1d" />
                </g>
              </g>

              {/* The Wilted Rose — hidden sigil */}
              <g transform="translate(38, 58)">
                {/* Crown */}
                <path d="M -1 -0.8 L -0.6 -1.4 L -0.2 -0.8 L 0 -1.5 L 0.2 -0.8 L 0.6 -1.4 L 1 -0.8 L 1 -0.4 L -1 -0.4 Z" fill="#7f1d1d" stroke="#3a2817" strokeWidth="0.08" />
                {/* Bloom */}
                <path d="M 0 -0.2 Q -0.9 0, -0.7 0.8 Q 0 1.2, 0.7 0.8 Q 0.9 0, 0 -0.2 Z" fill="#7f1d1d" stroke="#3a2817" strokeWidth="0.08" />
                {/* Drooping stem */}
                <path d="M 0 1.2 Q -0.3 1.7, -0.6 2.2" fill="none" stroke="#3a2817" strokeWidth="0.18" strokeLinecap="round" />
                <path d="M -0.4 1.7 Q -0.7 1.6, -0.85 1.9" fill="#3a2817" opacity="0.7" />
              </g>

              {/* Mt. Raylia marker — peak + cave entrance */}
              <g transform="translate(17, 11)">
                {/* Cave mouth */}
                <path d="M -0.6 0 Q 0 -0.7, 0.6 0 L 0.6 0.4 L -0.6 0.4 Z" fill="#1a0e08" />
                <text x="0" y="-1.2" fontSize="0.85" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic">Mt. Raylia</text>
              </g>

              {/* Wyldhelm — ominous tower + warning */}
              <g transform="translate(86, 22)">
                {/* Crooked tower silhouette */}
                <rect x="-0.6" y="-0.5" width="1.2" height="2" fill="#3a2817" />
                <polygon points="-0.6 -0.5 0.6 -0.5 0 -1.4" fill="#3a2817" />
                <rect x="-0.15" y="0.2" width="0.3" height="0.5" fill="#fdfaf3" opacity="0.5" />
                {/* Skull warning */}
                <g transform="translate(2.5, 0.5)" opacity="0.85">
                  <circle cx="0" cy="0" r="0.7" fill="#3a2817" />
                  <circle cx="-0.2" cy="-0.1" r="0.15" fill="#ecdcb8" />
                  <circle cx="0.2" cy="-0.1" r="0.15" fill="#ecdcb8" />
                  <rect x="-0.3" y="0.3" width="0.15" height="0.25" fill="#3a2817" />
                  <rect x="-0.05" y="0.3" width="0.15" height="0.25" fill="#3a2817" />
                  <rect x="0.2" y="0.3" width="0.15" height="0.25" fill="#3a2817" />
                </g>
              </g>

              {/* Sea waves at the very edges (E + S) */}
              <g opacity="0.55">
                <use href="#bl-wave" x="3" y="71" width="3" height="1" />
                <use href="#bl-wave" x="6" y="72" width="3" height="1" />
                <use href="#bl-wave" x="91" y="71" width="3" height="1" />
                <use href="#bl-wave" x="94" y="72" width="3" height="1" />
                <use href="#bl-wave" x="3" y="3.5" width="3" height="1" />
                <use href="#bl-wave" x="91" y="3.5" width="3" height="1" />
              </g>

              {/* ───── NEW LOCATION GLYPHS ───── */}

              {/* Stonewake Halls — masonry pillar east of the castle */}
              <g transform="translate(44, 55)">
                <use href="#bl-pillar" x="-1" y="-2" width="2" height="2.5" />
                <text x="0" y="1.2" fontSize="0.85" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.85">Stonewake</text>
              </g>

              {/* Tideborn Wells — sacred springs north of Annarose */}
              <g transform="translate(53, 47)">
                <use href="#bl-wells" x="-1.4" y="-1.4" width="2.8" height="2.8" />
                <text x="0" y="2.1" fontSize="0.8" fill="#3a6586" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.9">Tideborn</text>
              </g>

              {/* Skyveil Crags — high-NW alpine training shelf */}
              <g transform="translate(10, 7)">
                <use href="#bl-crags" x="-2" y="-2" width="4" height="3" />
                <text x="0" y="2.2" fontSize="0.85" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.85">Skyveil Crags</text>
              </g>

              {/* Lumengarde Vault — hidden light-elleta stone */}
              <g transform="translate(32, 52)">
                <use href="#bl-vault" x="-1.4" y="-1.4" width="2.8" height="2.8" />
                <text x="0" y="2.4" fontSize="0.78" fill="#7c5e2c" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.9">Lumengarde</text>
              </g>

              {/* Pyrelle Reach — Sarv-e's vigil, scorched basin west */}
              <g transform="translate(6, 42)">
                <use href="#bl-flame" x="-1.4" y="-2" width="2.8" height="3" />
                {/* Charred ground rays */}
                <path d="M -2.6 1.4 L -1.6 0.6 M 2.6 1.4 L 1.6 0.6 M -2.4 0 L -1.4 0.2 M 2.4 0 L 1.4 0.2" stroke="#7f1d1d" strokeWidth="0.07" opacity="0.5" />
                <text x="0" y="2.3" fontSize="0.85" fill="#7f1d1d" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.92">Pyrelle Reach</text>
                <text x="0" y="3.1" fontSize="0.6" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.6">— Sarv-e's Vigil —</text>
              </g>

              {/* The Archives — scholar's tower at edge of palace */}
              <g transform="translate(56, 50)">
                <use href="#bl-tower" x="-1" y="-3" width="2" height="3.5" />
                <text x="0" y="1.4" fontSize="0.78" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontStyle="italic" opacity="0.85">Archives</text>
              </g>

              {/* ───── REGION LABELS (italic serif) ───── */}
              <text x="22" y="22" fontSize="1.7" fill="#3a2817" fontFamily="Cinzel" fontStyle="italic" letterSpacing="0.3" opacity="0.78">THE UPLANDS</text>
              <text x="74" y="35" fontSize="1.7" fill="#7f1d1d" fontFamily="Cinzel" fontStyle="italic" letterSpacing="0.3" opacity="0.85">WYLDHELM</text>
              <text x="62" y="66" fontSize="1.7" fill="#3a2817" fontFamily="Cinzel" fontStyle="italic" letterSpacing="0.3" opacity="0.78">THE TAGS</text>
              <text x="9" y="6.5" fontSize="1.4" fill="#3a2817" fontFamily="Cinzel" fontStyle="italic" letterSpacing="0.2" opacity="0.7">THE FAR PEAKS</text>
              {/* Warning text near Wyldhelm */}
              <text x="83" y="27" fontSize="0.9" fill="#7f1d1d" fontFamily="Cinzel" fontStyle="italic" textAnchor="middle" opacity="0.8">— Here be twisted ones —</text>

              {/* ───── OUROBOROS-ROSE COMPASS (bottom-right) ─────
                  Replaces the standard compass rose. A serpent
                  coiled into a circle (mouth biting tail) with an
                  inner Wilted-Rose bloom and 8 cardinal/diagonal
                  rays. The outer serpent ring + the inner bloom
                  rotate in opposite directions; rotation
                  accelerates when the user is actively panning. */}
              <g transform="translate(91, 65)">
                {/* Static base disc — stays put so the spinning
                    rings have something to rotate AGAINST visually. */}
                <circle r="3.4" fill="#ecdcb8" stroke="#3a2817" strokeWidth="0.22" />
                <circle r="3" fill="none" stroke="#3a2817" strokeWidth="0.08" strokeDasharray="0.22 0.32" opacity="0.7" />
                {/* Cardinal letters — these stay aligned to north */}
                <text x="0" y="-3.65" fontSize="0.8" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontWeight="700">N</text>
                <text x="3.65" y="0.3" fontSize="0.65" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontWeight="700" opacity="0.85">E</text>
                <text x="0" y="4.15" fontSize="0.65" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontWeight="700" opacity="0.85">S</text>
                <text x="-3.65" y="0.3" fontSize="0.65" fill="#3a2817" textAnchor="middle" fontFamily="Cinzel" fontWeight="700" opacity="0.85">W</text>

                {/* Outer serpent ring — spins clockwise. The body is
                    a tapered dashed arc; the head + jaws bite the
                    tip of the tail to close the ouroboros. */}
                <g className="bl-map-compass-outer">
                  {/* Serpent body — full ring with scale dashes */}
                  <circle r="2.7" fill="none" stroke="#3a2817" strokeWidth="0.32" />
                  <circle r="2.7" fill="none" stroke="#7c5e2c" strokeWidth="0.18" strokeDasharray="0.35 0.18" opacity="0.85" />
                  <circle r="2.55" fill="none" stroke="#5a3d1c" strokeWidth="0.06" opacity="0.5" />
                  {/* Serpent head — biting position at the top-right */}
                  <g transform="rotate(-30) translate(2.7, 0)">
                    <ellipse cx="0" cy="0" rx="0.42" ry="0.3" fill="#3a2817" />
                    <path d="M 0.42 0 Q 0.55 -0.18, 0.7 -0.05 L 0.7 0.05 Q 0.55 0.18, 0.42 0 Z" fill="#7f1d1d" />
                    {/* Tiny eye pip */}
                    <circle cx="-0.1" cy="-0.1" r="0.07" fill="#facc15" />
                    {/* Forked tongue */}
                    <path d="M 0.6 0 L 0.85 -0.06 M 0.6 0 L 0.85 0.06" stroke="#7f1d1d" strokeWidth="0.05" />
                  </g>
                  {/* Serpent tail tip — narrows into the bite */}
                  <g transform="rotate(-30) translate(2.55, 0)">
                    <path d="M 0 -0.1 L 0.2 -0.04 L 0.2 0.04 L 0 0.1 Z" fill="#3a2817" />
                  </g>
                </g>

                {/* Inner Wilted-Rose bloom — counter-rotates. 8
                    layered petals in crimson + gold filaments. */}
                <g className="bl-map-compass-inner">
                  {/* Petal layer — outer */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((rot) => (
                    <g key={`pet-${rot}`} transform={`rotate(${rot})`}>
                      <path d="M 0 -1.55 Q -0.55 -1.05, 0 -0.3 Q 0.55 -1.05, 0 -1.55 Z" fill="#7f1d1d" stroke="#3a2817" strokeWidth="0.06" />
                    </g>
                  ))}
                  {/* Petal layer — inner (rotated 22.5°) */}
                  {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((rot) => (
                    <g key={`pet2-${rot}`} transform={`rotate(${rot})`}>
                      <path d="M 0 -1.05 Q -0.32 -0.7, 0 -0.18 Q 0.32 -0.7, 0 -1.05 Z" fill="#b91c1c" stroke="#3a2817" strokeWidth="0.05" />
                    </g>
                  ))}
                  {/* Center heart */}
                  <circle r="0.42" fill="#3a2817" />
                  <circle r="0.28" fill="#7f1d1d" />
                  <circle r="0.13" fill="#facc15" />
                  {/* Gold filaments radiating from heart */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((rot) => (
                    <line
                      key={`fil-${rot}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="-1.4"
                      transform={`rotate(${rot + 22.5})`}
                      stroke="#d4a853"
                      strokeWidth="0.04"
                      opacity="0.55"
                    />
                  ))}
                </g>

                {/* Tiny inner pip — ALWAYS at center, anchors the
                    whole device. */}
                <circle r="0.16" fill="#3a2817" />
              </g>

              {/* Scale bar — bottom-center, ruler with league markers
                  in the cartographer's tradition. */}
              <g transform="translate(38, 67.5)">
                {/* Outer rule */}
                <line x1="0" y1="0" x2="14" y2="0" stroke="#3a2817" strokeWidth="0.18" />
                <line x1="0" y1="-0.45" x2="0" y2="0.45" stroke="#3a2817" strokeWidth="0.18" />
                <line x1="14" y1="-0.45" x2="14" y2="0.45" stroke="#3a2817" strokeWidth="0.18" />
                {/* Inner tick marks every 2 units (so 7 segments = 7
                    leagues; pattern of alternating heavy/light */}
                {[2, 4, 6, 8, 10, 12].map((x, i) => (
                  <line key={x} x1={x} y1="-0.3" x2={x} y2="0.3" stroke="#3a2817" strokeWidth={i % 2 === 0 ? "0.16" : "0.1"} />
                ))}
                {/* Filled bar segments — alternating ink and parchment
                    in the classic cartographer style. */}
                <rect x="0" y="0.05" width="2" height="0.5" fill="#3a2817" />
                <rect x="4" y="0.05" width="2" height="0.5" fill="#3a2817" />
                <rect x="8" y="0.05" width="2" height="0.5" fill="#3a2817" />
                <rect x="12" y="0.05" width="2" height="0.5" fill="#3a2817" />
                {/* Labels */}
                <text x="0" y="-0.95" fontSize="0.75" fill="#3a2817" fontFamily="Cinzel" fontWeight="600" textAnchor="middle">0</text>
                <text x="14" y="-0.95" fontSize="0.75" fill="#3a2817" fontFamily="Cinzel" fontWeight="600" textAnchor="middle">14</text>
                <text x="7" y="1.85" fontSize="0.75" fill="#3a2817" fontFamily="Cinzel" fontStyle="italic" textAnchor="middle" opacity="0.85">leagues</text>
              </g>

              {/* "Drawn by" cartouche bottom-left — ornament + signature */}
              <g transform="translate(8, 70)">
                {/* Tiny rose-and-quill ornament */}
                <g transform="translate(-2, -0.4)">
                  <circle cx="0" cy="0" r="0.5" fill="#7f1d1d" stroke="#3a2817" strokeWidth="0.08" />
                  <circle cx="0" cy="0" r="0.2" fill="#3a2817" />
                  <line x1="0.5" y1="0" x2="1.4" y2="-0.2" stroke="#3a2817" strokeWidth="0.1" />
                </g>
                <text fontSize="0.85" fill="#3a2817" fontFamily="Cinzel" fontStyle="italic" opacity="0.65">— After the cartographers of Annarose —</text>
              </g>
            </svg>

            {/* Hot-spots — cartographer's pins. Each renders a colored
                dot with a parchment-toned ring and a small compass-mark
                cross inside when active, so it reads as "marker on a
                map" rather than "generic UI dot." Hit-area extended via
                button padding so fingers + mice have a comfortable
                target on top of the underlying icon. */}
            {LOCATIONS.map((loc) => {
              const isActive = loc.id === active;
              const accentHex =
                loc.accent === "gold" ? GOLD : loc.accent === "crimson" ? CRIMSON_BRIGHT : "#0ea5e9";
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setActive(loc.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group p-2.5 cursor-pointer"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  aria-label={`View ${loc.name}`}
                  aria-pressed={isActive}
                >
                  {/* Outer pulsing ring (active only) — soft fade-in
                      ripple instead of a hard ping. */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 rounded-full animate-ping"
                      style={{
                        width: 28,
                        height: 28,
                        marginLeft: -14,
                        marginTop: -14,
                        background: accentHex,
                        opacity: 0.45,
                      }}
                    />
                  )}
                  {/* The pin itself — slightly bigger when active, with
                      a parchment-cream ring so it sits on the map like
                      a wax seal instead of fighting the ink art. */}
                  <span
                    className="relative block rounded-full transition-all duration-300 group-hover:scale-110"
                    style={{
                      width: isActive ? 20 : 13,
                      height: isActive ? 20 : 13,
                      background: accentHex,
                      boxShadow: `0 0 ${isActive ? 22 : 10}px ${accentHex}, 0 0 ${isActive ? 44 : 22}px ${accentHex}88, 0 1px 3px rgba(58, 40, 23, 0.6)`,
                      border: `2px solid ${isActive ? "#fdfaf3" : "#3a2817"}`,
                    }}
                  >
                    {/* Compass-mark cross inside active pin — feels
                        cartographic rather than abstract. */}
                    {isActive && (
                      <svg
                        viewBox="0 0 16 16"
                        className="absolute inset-0 w-full h-full"
                        aria-hidden="true"
                      >
                        <path
                          d="M 8 3 L 8 13 M 3 8 L 13 8"
                          stroke="#fdfaf3"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                      </svg>
                    )}
                  </span>
                  {/* Label tooltip — flip above for locations near the
                      bottom of the map so it doesn't get cropped, below
                      otherwise. Includes the location's characteristic
                      emoji + name in parchment-on-ink styling that
                      blends with the map's typography. */}
                  {(() => {
                    const placeAbove = loc.y > 58;
                    return (
                      <span
                        className={`absolute left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap rounded-sm transition-all duration-300 inline-flex items-center gap-1.5 ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-95"
                        }`}
                        style={{
                          ...(placeAbove
                            ? { bottom: "100%", marginBottom: 6 }
                            : { top: "100%", marginTop: 6 }),
                          background: "#3a2817",
                          color: "#ecdcb8",
                          fontFamily: "'Cinzel', serif",
                          border: `1px solid ${accentHex}`,
                          boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
                          letterSpacing: "0.18em",
                          transform: `translateX(-50%) translateY(${
                            isActive ? 0 : placeAbove ? 4 : -4
                          }px)`,
                        }}
                      >
                        <span className="text-sm leading-none not-italic" aria-hidden="true">
                          {loc.emoji}
                        </span>
                        {loc.name}
                      </span>
                    );
                  })()}
                </button>
              );
            })}
              </div>
            </div>

            {/* Reset zoom — fades in only when the map is no longer
                at default view. Wax-seal CTA pressed into the
                parchment frame. */}
            {isZoomed && (
              <button
                type="button"
                onClick={resetView}
                className="absolute top-3 right-3 z-10 px-3 py-1.5 text-[10px] uppercase rounded-sm inline-flex items-center gap-1.5 transition-opacity duration-300"
                style={{
                  background: "#3a2817",
                  color: "#ecdcb8",
                  border: `1px solid ${GOLD}`,
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.22em",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                aria-label="Reset map view"
              >
                <span aria-hidden="true">⟲</span>
                <span>Reset</span>
              </button>
            )}

            {/* Pan-zoom hint — fades out the moment the user starts
                interacting so it doesn't crowd the cartography. */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-2.5 py-1 text-[9px] uppercase rounded-sm transition-opacity duration-500"
              style={{
                background: "rgba(58, 40, 23, 0.85)",
                color: "rgba(232, 220, 196, 0.78)",
                border: `1px solid ${GOLD_DEEP}66`,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.22em",
                opacity: isZoomed ? 0 : 0.85,
              }}
            >
              drag · scroll to zoom · double-click
            </div>
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
              className="text-3xl sm:text-4xl font-bold mb-4 transition-opacity duration-500 flex items-center gap-3"
              style={{ color: GOLD, fontFamily: "'Cinzel', serif" }}
            >
              <span className="text-3xl sm:text-4xl leading-none" aria-hidden="true">
                {activeLoc.emoji}
              </span>
              <span>{activeLoc.name}</span>
            </h3>
            <p
              key={activeLoc.id + "-blurb"}
              className="text-base sm:text-lg leading-relaxed transition-opacity duration-500"
              style={{ color: "rgba(232, 220, 196, 0.85)" }}
            >
              {activeLoc.blurb}
            </p>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: `${GOLD_DEEP}33` }}>
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3"
                style={{ color: GOLD_DEEP, fontFamily: "'Cinzel', serif" }}
              >
                <span className="hidden lg:inline">Other Places</span>
                <span className="lg:hidden">All Locations</span>
              </p>

              {/* Mobile — vertical stacked list (full-width rows with
                  region subtitle). Per spec: locations stack as a list
                  below the map. Includes the active row so phone users
                  can re-tap to refresh state. */}
              <div className="flex flex-col gap-2 lg:hidden">
                {LOCATIONS.map((loc) => {
                  const isActive = loc.id === active;
                  const accentHex =
                    loc.accent === "gold"
                      ? GOLD
                      : loc.accent === "crimson"
                      ? CRIMSON_BRIGHT
                      : "#0ea5e9";
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setActive(loc.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-left"
                      style={{
                        background: isActive
                          ? "rgba(212, 168, 83, 0.10)"
                          : "rgba(212, 168, 83, 0.03)",
                        border: `1px solid ${
                          isActive ? GOLD : `${GOLD_DEEP}55`
                        }`,
                      }}
                      aria-pressed={isActive}
                    >
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          background: `${accentHex}22`,
                          border: `1.5px solid ${accentHex}`,
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                        aria-hidden="true"
                      >
                        {loc.emoji}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className="block text-sm font-bold tracking-wide"
                          style={{
                            color: isActive ? GOLD : "rgba(232, 220, 196, 0.92)",
                            fontFamily: "'Cinzel', serif",
                          }}
                        >
                          {loc.name}
                        </span>
                        <span
                          className="block text-[10px] uppercase tracking-[0.2em] mt-0.5"
                          style={{ color: "rgba(232, 220, 196, 0.5)" }}
                        >
                          {loc.region}
                        </span>
                      </span>
                      {isActive && (
                        <span
                          className="text-xs"
                          style={{ color: GOLD }}
                          aria-hidden="true"
                        >
                          ●
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Desktop — original chip pill row */}
              <div className="hidden lg:flex flex-wrap gap-2">
                {LOCATIONS.filter((l) => l.id !== active).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setActive(loc.id)}
                    className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors hover:bg-white/5 inline-flex items-center gap-1.5"
                    style={{
                      border: `1px solid ${GOLD_DEEP}66`,
                      color: "rgba(232, 220, 196, 0.78)",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    <span className="text-sm leading-none" aria-hidden="true">
                      {loc.emoji}
                    </span>
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── bl-map-* keyframes ── ouroboros compass rotates slowly
          all the time, accelerates while panning. Gated behind
          prefers-reduced-motion per CLAUDE.md Rule 70. */}
      <style jsx>{`
        :global(.bl-map-compass-outer) {
          transform-box: fill-box;
          transform-origin: center;
          animation: bl-map-rotate-cw 28s linear infinite;
        }
        :global(.bl-map-compass-inner) {
          transform-box: fill-box;
          transform-origin: center;
          animation: bl-map-rotate-ccw 22s linear infinite;
        }
        :global(.bl-map-panning .bl-map-compass-outer) {
          animation-duration: 4s;
        }
        :global(.bl-map-panning .bl-map-compass-inner) {
          animation-duration: 3s;
        }
        @keyframes bl-map-rotate-cw {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes bl-map-rotate-ccw {
          to {
            transform: rotate(-360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.bl-map-compass-outer),
          :global(.bl-map-compass-inner) {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 5. CHARACTER ROSTER — clickable cards with expand-to-bio
// ──────────────────────────────────────────────────────────────────────
function CharacterRosterBlock() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden">
      <FloatingRunes count={9} />
      <CharacterSilhouettes />
      <div className="relative max-w-6xl mx-auto">
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

  // Intersection-observer gate — the immersive ElementBackdrop only
  // animates while the section is in view. Per Ben's 2026-05-07
  // direction: starts on scroll-into-view OR on tab-click, stops on
  // tab-change OR scroll-out. The key={active} below handles the
  // tab-change reset; this hook handles scroll behavior.
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(127, 29, 29, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212, 168, 83, 0.08) 0%, transparent 50%), #0a0808",
      }}
    >
      {/* Reactive elemental backdrop — fades in on scroll-into-view AND
          on tab-click. key={active} forces clean remount when the user
          picks a new element so the new scene fades in fresh. */}
      <ElementBackdrop
        key={activeElleta.id}
        id={activeElleta.id}
        color={activeElleta.color}
        playing={inView}
      />
      <div className="relative max-w-5xl mx-auto">
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
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a0808 0%, #100b0b 50%, #0a0808 100%)",
      }}
    >
      <LibraryBackdrop />
      <InkWisps />
      <div className="relative max-w-3xl mx-auto">
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

/** Per-faction symbol — each rendered as a tiny inline SVG so it can
 *  animate via shared CSS classes. Color comes from the faction
 *  registry; the symbol's shape is chosen to evoke the faction's role
 *  in the saga (sword/rose/scroll/coin/sigil). */
function FactionSymbol({ id }: { id: string }) {
  if (id === "guard") {
    // Crossed swords
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <g transform="rotate(45 16 16)">
          <rect x="14" y="3" width="4" height="18" fill="currentColor" opacity="0.9" />
          <polygon points="14,3 18,3 16,1" fill="currentColor" />
          <rect x="11" y="20" width="10" height="2" fill="currentColor" />
          <rect x="15" y="22" width="2" height="5" fill="currentColor" />
        </g>
        <g transform="rotate(-45 16 16)">
          <rect x="14" y="3" width="4" height="18" fill="currentColor" opacity="0.7" />
          <polygon points="14,3 18,3 16,1" fill="currentColor" opacity="0.7" />
          <rect x="11" y="20" width="10" height="2" fill="currentColor" opacity="0.7" />
          <rect x="15" y="22" width="2" height="5" fill="currentColor" opacity="0.7" />
        </g>
      </svg>
    );
  }
  if (id === "rose") {
    // Wilted rose with stem and crown
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Crown */}
        <path d="M 10 7 L 12 4 L 14 7 L 16 3 L 18 7 L 20 4 L 22 7 L 22 9 L 10 9 Z" fill="currentColor" opacity="0.85" />
        {/* Bloom */}
        <path d="M 16 11 Q 10 12, 11 18 Q 16 21, 21 18 Q 22 12, 16 11 Z" fill="currentColor" />
        <path d="M 13 14 Q 16 11, 19 14" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
        <path d="M 13.5 16.5 Q 16 13.5, 18.5 16.5" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
        {/* Drooping stem */}
        <path d="M 16 21 Q 14 25, 12 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        {/* Leaf */}
        <path d="M 14 24 Q 11 23, 10 26 Q 13 27, 14 25 Z" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }
  if (id === "scholar") {
    // Open book / scroll
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <path d="M 4 8 Q 16 5, 28 8 L 28 24 Q 16 21, 4 24 Z" fill="currentColor" opacity="0.85" />
        <path d="M 16 7 L 16 23" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
        <path d="M 7 12 L 14 11 M 7 15 L 14 14 M 7 18 L 14 17" stroke="rgba(0,0,0,0.4)" strokeWidth="0.4" />
        <path d="M 18 11 L 25 12 M 18 14 L 25 15 M 18 17 L 25 18" stroke="rgba(0,0,0,0.4)" strokeWidth="0.4" />
      </svg>
    );
  }
  if (id === "trader") {
    // Coin with chevron mark
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.9" />
        <circle cx="16" cy="16" r="9" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
        <path d="M 11 13 L 16 18 L 21 13" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 11 17 L 16 22 L 21 17" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // bonded — elleta sigil (triangle with inner dot + radiating spokes)
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <polygon points="16,3 28,26 4,26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="18" r="3" fill="currentColor" />
      <path d="M 16 12 L 16 8 M 11 22 L 7 24 M 21 22 L 25 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="3" r="1.2" fill="currentColor" />
      <circle cx="28" cy="26" r="1.2" fill="currentColor" />
      <circle cx="4" cy="26" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** 5-up faction crest grid for the quiz intro. Each crest shows the
 *  symbol + label, with a slow rotating outer ring and a soft pulsing
 *  glow per faction color. Motion-safe per Rule 70. */
function FactionPreviewGrid() {
  return (
    <>
      <style jsx>{`
        .bl-faction-crest-glow {
          animation: bl-faction-crest-pulse 4s ease-in-out infinite;
        }
        .bl-faction-crest-ring {
          animation: bl-faction-crest-spin 24s linear infinite;
        }
        @keyframes bl-faction-crest-pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }
        @keyframes bl-faction-crest-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-faction-crest-glow,
          .bl-faction-crest-ring {
            animation: none;
          }
        }
      `}</style>
      <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {Object.values(FACTIONS).map((f, i) => (
          <div key={f.id} className="flex flex-col items-center">
            <div
              className="relative flex items-center justify-center rounded-full w-12 h-12 sm:w-16 sm:h-16"
              style={{
                background: `radial-gradient(circle, ${f.color}26 0%, transparent 70%)`,
              }}
            >
              {/* Pulsing glow */}
              <span
                className="bl-faction-crest-glow absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${f.color}55 0%, transparent 65%)`,
                  filter: "blur(6px)",
                  animationDelay: `${i * 0.6}s`,
                }}
              />
              {/* Slowly-rotating ring with 3 dots — feels alive without
                  being noisy. */}
              <svg
                viewBox="0 0 100 100"
                className="bl-faction-crest-ring absolute inset-0 w-full h-full pointer-events-none"
                style={{ animationDelay: `${-i * 3}s` }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={f.color}
                  strokeOpacity="0.4"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
                <circle cx="50" cy="4" r="2" fill={f.color} />
                <circle cx="93" cy="73" r="1.6" fill={f.color} opacity="0.7" />
                <circle cx="7" cy="73" r="1.6" fill={f.color} opacity="0.7" />
              </svg>
              {/* Symbol */}
              <span
                className="relative w-6 h-6 sm:w-8 sm:h-8"
                style={{ color: f.color }}
              >
                <FactionSymbol id={f.id} />
              </span>
            </div>
            <p
              className="mt-2 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] leading-tight text-center"
              style={{
                color: "rgba(232, 220, 196, 0.7)",
                fontFamily: "'Cinzel', serif",
              }}
            >
              {f.name.replace(/^The /, "")}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

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

  // The ambient layer's tint follows the user's running quiz — picks up
  // whichever faction is leading after each answer. Defaults to gold
  // until the first pick, and locks to the result tint at step 5.
  const ambientTint = useMemo(() => {
    if (step === 5 && result) return result.color;
    if (answers.length === 0) return GOLD;
    const tally: Record<string, number> = {};
    for (const a of answers) tally[a] = (tally[a] || 0) + 1;
    const leading = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
    return leading && FACTIONS[leading] ? FACTIONS[leading].color : GOLD;
  }, [answers, step, result]);

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.08) 0%, transparent 60%), #08070a",
      }}
    >
      <FactionAmbient tint={ambientTint} />
      <div className="relative max-w-3xl mx-auto">
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

              {/* 5-up faction preview — every available outcome is on
                  screen before the user commits to the test. Each crest
                  has a small motion-safe pulse around its symbol so the
                  group reads as alive, not stamped. */}
              <FactionPreviewGrid />

              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 px-8 py-4 mt-8 font-semibold tracking-wide rounded-sm transition-all duration-300 hover:scale-[1.02]"
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
      className="relative py-20 sm:py-24 lg:py-32 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #08070a 0%, #100b0b 50%, #08070a 100%)",
      }}
    >
      <FloatingDust count={10} tint={GOLD} />
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

      <div className="relative max-w-4xl mx-auto">
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

              {/* The imprint — rendered as inline SVG instead of the
                  source PNG. The PNG ships with a solid white BG that
                  mix-blend-mode can't cleanly drop; an SVG monogram
                  renders as gold-on-transparent every time. The "PJH"
                  letterform sits above a small wilted-rose ornament,
                  echoing the central sigil of the saga. */}
              <svg
                viewBox="0 0 200 200"
                className="relative w-[78%] h-[78%]"
                role="img"
                aria-label="Preston James Hunsaker author monogram"
                style={{
                  filter:
                    "drop-shadow(0 0 16px rgba(212, 168, 83, 0.55)) drop-shadow(0 0 4px rgba(212, 168, 83, 0.4))",
                }}
              >
                {/* Subtle decorative arc above the letters */}
                <path
                  d="M 50 75 Q 100 55, 150 75"
                  fill="none"
                  stroke={GOLD_DEEP}
                  strokeWidth="0.8"
                  opacity="0.55"
                />
                <circle cx="50" cy="75" r="1.4" fill={GOLD} />
                <circle cx="100" cy="62" r="1.6" fill={GOLD} />
                <circle cx="150" cy="75" r="1.4" fill={GOLD} />

                {/* PJH monogram in Cinzel gold */}
                <text
                  x="100"
                  y="128"
                  textAnchor="middle"
                  fill={GOLD}
                  fontFamily="'Cinzel', serif"
                  fontWeight="900"
                  fontSize="64"
                  letterSpacing="3"
                >
                  PJH
                </text>

                {/* Wilted rose ornament below — central saga sigil */}
                <g transform="translate(100, 158)">
                  {/* Stem */}
                  <path
                    d="M 0 0 L 0 14"
                    stroke={CRIMSON_BRIGHT}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Leaf left */}
                  <path
                    d="M 0 7 Q -7 4, -10 9 Q -6 11, 0 9 Z"
                    fill={CRIMSON}
                    fillOpacity="0.7"
                  />
                  {/* Leaf right */}
                  <path
                    d="M 0 9 Q 7 6, 10 11 Q 6 13, 0 11 Z"
                    fill={CRIMSON}
                    fillOpacity="0.7"
                  />
                  {/* Bloom (drooping/wilted) */}
                  <path
                    d="M 0 -5 Q -8 -3, -6 4 Q 0 7, 6 4 Q 8 -3, 0 -5 Z"
                    fill={CRIMSON}
                    fillOpacity="0.92"
                    stroke={CRIMSON_BRIGHT}
                    strokeWidth="0.4"
                  />
                  <path
                    d="M -3 -2 Q 0 -5, 3 -2"
                    fill="none"
                    stroke={GOLD_DEEP}
                    strokeWidth="0.5"
                    opacity="0.7"
                  />
                </g>

                {/* Tiny "EST 2023" inscription beneath */}
                <text
                  x="100"
                  y="186"
                  textAnchor="middle"
                  fill={GOLD_DEEP}
                  fontFamily="'Cinzel', serif"
                  fontWeight="600"
                  fontSize="6"
                  letterSpacing="3"
                  opacity="0.7"
                >
                  ✦ ANNAROSE ✦
                </text>
              </svg>
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

/** BluejayFeather — small inline SVG feather glyph for the footer
 *  network-credit. Stylized blue-jay primary feather with center vane
 *  + barbs. Currentcolor so the parent's text-color flows through. */
function BluejayFeather({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 2 Q 6 8, 7 14 Q 8 19, 12 22 Q 16 19, 17 14 Q 18 8, 12 2 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 4 L 12 22"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      {/* Barbs */}
      <path d="M 12 7 L 9 9 M 12 9 L 8.5 11 M 12 11 L 8.2 13 M 12 13 L 8.5 15 M 12 15 L 9 17 M 12 17 L 9.5 18.5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.4" strokeLinecap="round" />
      <path d="M 12 7 L 15 9 M 12 9 L 15.5 11 M 12 11 L 15.8 13 M 12 13 L 15.5 15 M 12 15 L 15 17 M 12 17 L 14.5 18.5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.4" strokeLinecap="round" />
    </svg>
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
        <p className="text-base italic mb-6" style={{ color: "rgba(232, 220, 196, 0.7)" }}>
          A fantasy saga by Preston James Hunsaker.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base mb-8" style={{ color: "rgba(232, 220, 196, 0.7)" }}>
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
        {/* Network-credit. The feather + "BlueJays" together link to the
            BlueJays portfolio home (per Ben 2026-05-07) — separate hop
            from the /audit landing page so the brand link stays clean. */}
        <p
          className="text-sm flex items-center justify-center gap-1.5 flex-wrap"
          style={{ color: "rgba(232, 220, 196, 0.55)" }}
        >
          <span>Built by</span>
          <a
            href="https://bluejayportfolio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:opacity-100 transition-opacity"
            style={{ color: GOLD_DEEP }}
          >
            <BluejayFeather size={15} />
            <span className="underline-offset-2 hover:underline font-semibold tracking-wide">
              BlueJays
            </span>
          </a>
          <span>—</span>
          <a
            href="https://bluejayportfolio.com/audit"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "rgba(232, 220, 196, 0.55)" }}
          >
            get your free site audit
          </a>
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
