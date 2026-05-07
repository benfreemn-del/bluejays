"use client";

/**
 * AIBotFlowChart — client-facing visual map of every AI bot running on
 * THIS tenant's account. Mirrors the internal /dashboard/ai-bots layout
 * (head → branches → leaves) but tightened for owner-facing use:
 *
 *   - Reads from the same CATEGORIES data the existing AISkillsTab uses
 *     so the two views never drift out of sync.
 *   - Per-bot status (active / available / coming / trainable) is
 *     resolved against the tenant slug — locked bots render dimmed
 *     with a "tier-locked" pill so the upgrade path is visible.
 *   - Click any leaf to surface its full description in a sticky
 *     bottom drawer (mirrors the dashboard pattern).
 *
 * Mounted at the top of AISkillsTab — visual at a glance, the existing
 * detailed category list still lives below for drill-down.
 */

import { useState } from "react";
import {
  CATEGORIES,
  statusFor,
  type Capability,
  type Status,
  type Category,
} from "./AISkillsTab";

type ActiveBot = {
  cap: Capability;
  category: Category;
  status: Status;
};

const BRANCH_COLORS: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  "lead-acquisition": {
    border: "border-sky-500/40",
    bg: "bg-sky-950/30",
    text: "text-sky-200",
    ring: "ring-sky-500/30",
  },
  messaging: {
    border: "border-violet-500/40",
    bg: "bg-violet-950/30",
    text: "text-violet-200",
    ring: "ring-violet-500/30",
  },
  "sales-conversations": {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/30",
    text: "text-emerald-200",
    ring: "ring-emerald-500/30",
  },
  "performance-optimization": {
    border: "border-amber-500/40",
    bg: "bg-amber-950/30",
    text: "text-amber-200",
    ring: "ring-amber-500/30",
  },
  analytics: {
    border: "border-rose-500/40",
    bg: "bg-rose-950/30",
    text: "text-rose-200",
    ring: "ring-rose-500/30",
  },
};

const FALLBACK_COLOR = {
  border: "border-slate-500/40",
  bg: "bg-slate-900/40",
  text: "text-slate-200",
  ring: "ring-slate-500/30",
};

function colorFor(catId: string) {
  return BRANCH_COLORS[catId] ?? FALLBACK_COLOR;
}

const STATUS_PILL: Record<Status, { label: string; cls: string }> = {
  active: {
    label: "Live",
    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  available: {
    label: "Ready · awaiting config",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  coming: {
    label: "Roadmap",
    cls: "bg-slate-700/40 text-slate-400 border-slate-600/40",
  },
  trainable: {
    label: "Trainable",
    cls: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
};

export default function AIBotFlowChart({
  slug,
  businessName,
}: {
  slug: string;
  /** Optional pretty name for the head node ("ITC Quick Attach", "Zenith Sports").
   *  Falls back to the slug. */
  businessName?: string;
}) {
  const [active, setActive] = useState<ActiveBot | null>(null);

  const head = businessName ?? slug;
  const totalBots = CATEGORIES.reduce((sum, c) => sum + c.capabilities.length, 0);
  const liveBots = CATEGORIES.flatMap((c) => c.capabilities).filter(
    (c) => statusFor(c, slug) === "active",
  ).length;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900/60 via-slate-950/50 to-slate-900/60 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300 font-bold mb-1">
            Your AI stack · live map
          </p>
          <h3 className="text-lg font-black tracking-tight text-violet-100">
            🧠 {liveBots} of {totalBots} bots running on your account
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-violet-300/70">
          Click any node for details
        </span>
      </div>

      {/* ─── Head node ─── */}
      <div className="flex justify-center mb-1">
        <div className="rounded-2xl border-2 border-violet-300/40 bg-gradient-to-br from-violet-950/60 to-slate-900/60 px-6 py-4 text-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <div className="text-3xl mb-1">🧠</div>
          <div className="text-sm font-black tracking-tight text-violet-100">
            {head}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-violet-300/70 mt-0.5">
            AI Marketing System
          </div>
        </div>
      </div>

      {/* Vertical line down */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-gradient-to-b from-violet-300/40 to-violet-300/10" />
      </div>

      {/* Horizontal connector */}
      <div className="relative h-4 mb-0">
        <div
          className="absolute left-[8%] right-[8%] top-1/2 h-px bg-violet-300/15"
          aria-hidden="true"
        />
      </div>

      {/* ─── Branch columns ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const c = colorFor(cat.id);
          const branchLive = cat.capabilities.filter(
            (cap) => statusFor(cap, slug) === "active",
          ).length;
          return (
            <div key={cat.id} className="flex flex-col items-center">
              <div className="w-px h-5 bg-violet-300/15" />

              {/* Branch header */}
              <div
                className={`w-full rounded-lg border ${c.border} ${c.bg} px-3 py-2 text-center mb-2`}
              >
                <div className="text-xl mb-0.5">{cat.emoji}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${c.text} leading-tight`}>
                  {cat.label}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {branchLive}/{cat.capabilities.length} live
                </div>
              </div>

              <div className="w-px h-2 bg-violet-300/10" />

              {/* Bot leaves */}
              <ul className="w-full space-y-1.5">
                {cat.capabilities.map((cap, i) => {
                  const status = statusFor(cap, slug);
                  const isActive = status === "active";
                  const isComing = status === "coming";
                  const open = active?.cap === cap;
                  return (
                    <li key={cap.title} className="relative">
                      {i > 0 && (
                        <div
                          aria-hidden="true"
                          className="absolute left-1/2 -top-1.5 w-px h-1.5 bg-violet-300/10"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setActive(open ? null : { cap, category: cat, status })
                        }
                        className={`w-full text-left rounded-md border bg-slate-900/40 px-2.5 py-1.5 transition-colors ${
                          open
                            ? `${c.border} ${c.bg} ring-1 ${c.ring}`
                            : `border-slate-800 hover:${c.border}`
                        } ${isComing ? "opacity-55" : ""}`}
                        title={cap.title}
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="text-base leading-none mt-0.5">{cap.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-white leading-tight truncate">
                              {cap.title}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`inline-block w-1 h-1 rounded-full ${
                                  isActive
                                    ? "bg-emerald-400"
                                    : status === "available"
                                      ? "bg-amber-400"
                                      : status === "trainable"
                                        ? "bg-violet-400"
                                        : "bg-slate-500"
                                }`}
                              />
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 truncate">
                                {STATUS_PILL[status].label.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ─── Detail drawer (sticky bottom) ─── */}
      {active && (
        <div className="mt-5 rounded-xl border border-violet-500/30 bg-violet-950/20 p-4 relative">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute top-2 right-3 text-slate-400 hover:text-white text-lg leading-none"
            aria-label="Close detail"
          >
            ✕
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="text-3xl shrink-0">{active.cap.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-base font-bold text-white">
                  {active.cap.title}
                </h4>
                <span
                  className={`text-[9px] uppercase tracking-wider font-bold border px-1.5 py-0.5 rounded ${
                    STATUS_PILL[active.status].cls
                  }`}
                >
                  {STATUS_PILL[active.status].label}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  · {active.category.label}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {active.cap.detail}
              </p>
              {active.cap.seeItIn && (
                <p className="text-[11px] text-violet-300 mt-2">
                  See it in action: <span className="font-bold">{active.cap.seeItIn.label}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
