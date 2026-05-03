"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { PlayCircle, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

/**
 * TrainingDrills — full TEKKY drill library, scraped from the live
 * zenithsports.org/pages/training page (26 videos across Warm Up,
 * Beginner, Intermediate). Each card shows the YouTube thumbnail and
 * opens the YouTube watch URL in a new tab on click.
 *
 * Why client-only: the per-tier "Show all" toggle is purely interactive.
 * No data fetching, just useState.
 *
 * Why thumbnails (not embedded iframes): 26 iframes would each open
 * a network connection to YouTube on first paint (massive LCP cost).
 * Using img.youtube.com/vi/{id}/hqdefault.jpg is a single tiny image
 * per card and the click takes the user to YouTube anyway.
 */

const NAVY_INK = "#0f172a";
const ELECTRIC = "#1d4ed8";
const LIME = "#a3e635";
const INK_SOFT_LIGHT = "#475569";

type Drill = { id: string; name: string };
type Tier = { label: string; tag: string; accent: string; drills: Drill[] };

const TIERS: Tier[] = [
  {
    label: "Warm Up",
    tag: "01",
    accent: ELECTRIC,
    drills: [
      { id: "bX-HMzizdxU", name: "Instep Touch" },
      { id: "Wzlr9RpBNs4", name: "Outside-Foot Gather, Instep Pass" },
      { id: "g28gQ2aZ-0k", name: "1 Touch Instep Pass" },
      { id: "mukre9VRGx4", name: "1 Touch Outside Foot Pass" },
      { id: "qXGWT_-_yF4", name: "Laces Gather and Pass" },
      { id: "nyGSAw-4Xw0", name: "1 Touch Laces" },
      { id: "68vbXVsSKes", name: "Instep Trap, Outside Touch, Instep Pass" },
      { id: "G8aa_34JpFg", name: "Sole Trap, Instep Pass" },
      { id: "rab0LPa33VI", name: "Sole Trap, Outside Foot Pass" },
      { id: "hWQGlKbx0HM", name: "Sole Trap, Cross Body Drag, Instep Pass" },
    ],
  },
  {
    label: "Beginner",
    tag: "02",
    accent: ELECTRIC,
    drills: [
      { id: "l40Cq1RJ_QI", name: "La Croqueta" },
      { id: "074-lKwl9kI", name: "La Croqueta · 2 Touch Shift" },
      { id: "n4625BwqiU0", name: "Push Pull" },
      { id: "v4bHgBiPW6I", name: "Inside · Outside" },
      { id: "Lnny2pLZmiI", name: "Sole Drag" },
      { id: "ojviCQ0mrsY", name: "V-Cut" },
      { id: "nPzYPHHwgGU", name: "L-Drag" },
      { id: "2h1hwvVDTXI", name: "Inside · Outside Combo" },
      { id: "Kaj6ymLWsB8", name: "Scissors · Outside Push" },
      { id: "6mCwL9xHfLk", name: "Double Scissors · Outside Push" },
    ],
  },
  {
    label: "Intermediate",
    tag: "03",
    accent: ELECTRIC,
    drills: [
      { id: "aLWVJfbAn9I", name: "Tap Tap Drag · La Croqueta · Drag" },
      { id: "2mqCyIdrlBs", name: "Push Pull U-Drag with Cone" },
      { id: "p7k4AF7piT4", name: "L-Drag Roll" },
      { id: "9frnJdNJW9o", name: "Roll · Stepover [The Jay Jay]" },
      { id: "ldiRz5W-Mjo", name: "Single Leg V-Cut to L-Drag" },
      { id: "fydguVA6Fzw", name: "Touch In · Scissors · Touch Out" },
    ],
  },
];

function DrillCard({ drill }: { drill: Drill }) {
  // hqdefault is the most reliable thumbnail size — maxresdefault doesn't
  // exist for every video, while hqdefault is guaranteed by YouTube.
  const thumb = `https://img.youtube.com/vi/${drill.id}/hqdefault.jpg`;
  const watch = `https://www.youtube.com/watch?v=${drill.id}`;
  return (
    <a
      href={watch}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white border border-slate-200 hover:border-[#1d4ed8] transition overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:ring-offset-2"
      aria-label={`Watch ${drill.name} on YouTube`}
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={thumb}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Hover scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Play badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/95 text-[#0a1832] shadow-lg group-hover:scale-110 transition-transform">
            <PlayCircle size={36} weight="fill" />
          </span>
        </div>
        {/* "Watch on YouTube" pill bottom-right */}
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur text-[#0a1832] px-2 py-1 text-[9px] tracking-[0.18em] uppercase font-bold opacity-0 group-hover:opacity-100 transition">
          YouTube
          <ArrowUpRight size={10} weight="bold" />
        </div>
      </div>
      <div className="p-5">
        <h3
          className="text-[15px] font-extrabold uppercase tracking-tight leading-tight"
          style={{ color: NAVY_INK }}
        >
          {drill.name}
        </h3>
      </div>
    </a>
  );
}

function TierBlock({ tier, idx }: { tier: Tier; idx: number }) {
  // Show first 6 by default to keep the section scannable; "Show all"
  // expands inline. On the smallest tier (intermediate, 6 drills) the
  // toggle is hidden because everything fits already.
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tier.drills : tier.drills.slice(0, 6);
  const hasMore = tier.drills.length > 6;
  return (
    <div className={idx > 0 ? "mt-16" : ""}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div
          className="text-[10px] tracking-[0.32em] uppercase font-extrabold flex items-center gap-3"
          style={{ color: tier.accent }}
        >
          <span className="inline-block w-10 h-px" style={{ background: tier.accent }} />
          {tier.tag} · {tier.label}
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase font-bold" style={{ color: INK_SOFT_LIGHT }}>
          {tier.drills.length} drills
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((d) => (
          <DrillCard key={d.id} drill={d} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-extrabold text-[#0a1832] hover:text-[#1d4ed8] transition cursor-pointer"
          >
            {expanded ? `Show fewer ${tier.label.toLowerCase()} drills` : `Show all ${tier.drills.length} ${tier.label.toLowerCase()} drills`}
            <span aria-hidden style={{ background: LIME }} className="inline-block w-2 h-2" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TrainingDrills() {
  return (
    <>
      {TIERS.map((tier, i) => (
        <TierBlock key={tier.label} tier={tier} idx={i} />
      ))}
    </>
  );
}
