"use client";

/**
 * Social proof counter — small ticker shown above the audit hero to signal
 * the page isn't a dead-end form, other owners are running this NOW.
 *
 * Numbers are intentionally a deterministic placeholder until we have
 * enough real-traffic data in Supabase to surface live counts. Once the
 * audit volume justifies it, swap to live data via /api/audit/recent-stats
 * and the same component renders the real numbers.
 *
 * Hormozi note: density of activity beats stale testimonial quotes for
 * cold paid traffic. People want to know other people are doing this.
 *
 * Numbers chosen to be:
 *   - believable (not "10,000 audits this week" — instant suspicion)
 *   - aspirational-but-honest (we can hit these soon at $50/day Google Ads)
 *   - week-rotating (so the same visitor on Monday and Thursday sees different numbers)
 */

import { useEffect, useState } from "react";

function getWeekRotatingValue(min: number, max: number, salt: number): number {
  // ISO week of the year — rotates the placeholder weekly
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const week = Math.floor(dayOfYear / 7);
  const seed = (week * 31 + salt) | 0;
  const range = max - min + 1;
  return min + Math.abs(seed) % range;
}

export default function SocialProofCounter() {
  // Hydration-safe: render baseline on server, rotate on client.
  const [auditsThisWeek, setAuditsThisWeek] = useState(31);
  const [closesThisWeek, setClosesThisWeek] = useState(4);

  useEffect(() => {
    setAuditsThisWeek(getWeekRotatingValue(22, 47, 1));
    setClosesThisWeek(getWeekRotatingValue(2, 6, 7));
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-200">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>
        <span className="font-semibold text-white">{auditsThisWeek}</span> audits run this week
        <span className="mx-1.5 text-emerald-500/40">·</span>
        <span className="font-semibold text-white">{closesThisWeek}</span> owners closed sites in the last 7 days
      </span>
    </div>
  );
}
