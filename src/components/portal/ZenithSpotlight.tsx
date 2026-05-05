"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CAMPS } from "@/app/clients/zenith-sports/camps/camps-data";

/**
 * ZenithSpotlight — soccer-specific dashboard section for the Zenith
 * Sports owner portal Overview tab. Two cards:
 *   · 🎯 Drill of the Week — deterministic pick from the existing TEKKY
 *      drill library, refreshes weekly. Embeds the YouTube preview.
 *   · 📅 Upcoming Camps — next 3 camps from camps-data.ts, or a clear
 *      "Add your first camp" empty state when the catalog is empty.
 *
 * Both cards reuse content Philip + Paul already maintain — no new data
 * source, just surfacing it where the daily owner-portal eye lands.
 */

// Mirror of the TIERS shape from training-drills.tsx — kept inline here
// to avoid pulling the entire training-drills component (and its DOM
// styles) into this server-rendered card. Source of truth is still
// training-drills.tsx; sync updates manually if drills change.
const FEATURED_DRILLS: { id: string; name: string; tier: string }[] = [
  { id: "bX-HMzizdxU", name: "Instep Touch", tier: "Foundations" },
  { id: "Wzlr9RpBNs4", name: "Outside-Foot Gather, Instep Pass", tier: "Foundations" },
  { id: "G8aa_34JpFg", name: "Sole Trap, Instep Pass", tier: "Foundations" },
  { id: "l40Cq1RJ_QI", name: "La Croqueta", tier: "Skill Moves" },
  { id: "074-lKwl9kI", name: "La Croqueta · 2 Touch Shift", tier: "Skill Moves" },
  { id: "n4625BwqiU0", name: "Push Pull", tier: "Skill Moves" },
  { id: "v4bHgBiPW6I", name: "Inside · Outside", tier: "Skill Moves" },
  { id: "Lnny2pLZmiI", name: "Sole Drag", tier: "Skill Moves" },
];

/** ISO week number — drives the deterministic drill pick so it rotates
 *  weekly, same drill for everyone in the same week. */
function weekOfYear(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export default function ZenithSpotlight() {
  // Drill rotates weekly — deterministic so Philip + Paul see the same
  // featured drill all week, refreshes Monday automatically.
  const featuredDrill = useMemo(() => {
    const week = weekOfYear(new Date());
    return FEATURED_DRILLS[week % FEATURED_DRILLS.length] ?? FEATURED_DRILLS[0];
  }, []);

  // Next 3 camps — chronological, drop past camps + null-startDate ones
  // unless we have nothing else to show.
  const upcomingCamps = useMemo(() => {
    const now = new Date();
    const dated = CAMPS.filter((c) => c.startDate)
      .map((c) => ({ ...c, _ts: new Date(c.startDate!).getTime() }))
      .filter((c) => c._ts >= now.getTime() - 1000 * 60 * 60 * 24)
      .sort((a, b) => a._ts - b._ts);
    return dated.slice(0, 3);
  }, []);

  return (
    <section className="grid lg:grid-cols-[0.55fr_0.45fr] gap-3">
      {/* DRILL OF THE WEEK */}
      <div className="rounded-2xl border border-lime-500/25 bg-gradient-to-br from-lime-950/30 via-slate-900/60 to-slate-900/40 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-lime-300">
            🎯 Drill of the Week
          </p>
          <Link
            href="/clients/zenith-sports/training-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-wider font-bold text-lime-300 hover:text-lime-200"
          >
            Full library →
          </Link>
        </div>

        {featuredDrill && (
          <>
            <div className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/[0.04] mb-2.5">
              {/* youtube-nocookie keeps the preview privacy-friendly */}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${featuredDrill.id}?rel=0&modestbranding=1`}
                title={featuredDrill.name}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-white truncate">
                {featuredDrill.name}
              </p>
              <span className="text-[10px] uppercase tracking-wider text-lime-300/80 font-bold">
                {featuredDrill.tier}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
              Featured this week. Drop the link in your team chat or attach
              to your next coach-affiliate email.
            </p>
          </>
        )}
      </div>

      {/* UPCOMING CAMPS */}
      <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-900/40 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-blue-300">
            📅 Upcoming Camps
          </p>
          <Link
            href="/clients/zenith-sports/camps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-wider font-bold text-blue-300 hover:text-blue-200"
          >
            Camps page →
          </Link>
        </div>

        {upcomingCamps.length > 0 ? (
          <ul className="space-y-2">
            {upcomingCamps.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5"
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-bold text-white truncate">
                    {c.name}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold whitespace-nowrap">
                    {c.startDate
                      ? new Date(c.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight truncate">
                  {c.city}, {c.state} · {c.format} · {c.ageRange}
                  {c.ballIncluded && (
                    <span className="ml-1.5 text-[10px] text-lime-300 font-bold">
                      · ⚽ ball included
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-blue-500/30 bg-blue-500/[0.04] p-4 text-center">
            <p className="text-2xl mb-1">⛳</p>
            <p className="text-sm font-bold text-white mb-1">
              No camps in the catalog yet
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Camps are your highest-volume parent-lead funnel. Add the
              first one to populate the public Camps page.
            </p>
            <Link
              href="mailto:ben@bluejayportfolio.com?subject=Add a camp to Zenith"
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 hover:text-blue-100"
            >
              Email Ben to add one →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
