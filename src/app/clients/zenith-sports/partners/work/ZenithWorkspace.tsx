"use client";

/**
 * ZenithWorkspace — interactive client component for the Zenith partner
 * workspace. The shape mirrors BlueJays /partners/work but is rebuilt
 * around the Zenith use case: partners share a referral link in their
 * existing network (team chat, IG DM, parent email, club newsletter)
 * and occasionally call within their network using the script library.
 *
 * Sections:
 *   1. Hero — partner referral link, big copy button, week stats
 *   2. Share kit — pre-written copy for team chat / IG / email / SMS
 *   3. Script links — by audience (coach / club / parent / camp)
 *   4. Recent referrals — last 10
 *   5. Help / payout reminder
 */

import { useState } from "react";
import Link from "next/link";
import type { PartnerReferral } from "@/lib/partners";

type Stats = {
  weekCents: number;
  weekCount: number;
  owedCents: number;
  paidCents: number;
  totalReferrals: number;
  /** Optional: this calendar month's earnings so far. Falls back to
   *  weekCents × 4 if the back-end didn't compute it. */
  monthCents?: number;
};

// Monthly goal milestones — partners climb the ladder, each rung
// unlocks a real Zenith perk. Order matters; render the next-up
// goal as the active target.
const GOAL_LADDER = [
  { cents: 10000, label: "First $100", perk: "First check / Venmo" },
  { cents: 25000, label: "$250 / mo", perk: "Free TEKKY ball" },
  { cents: 50000, label: "$500 / mo", perk: "Custom share kit + 1:1 with Philip" },
  { cents: 100000, label: "$1,000 / mo", perk: "Co-branded camp opportunity" },
  { cents: 250000, label: "$2,500 / mo", perk: "Equity-share conversation" },
];

type ZenithWorkspaceProps = {
  partner: {
    id: string;
    code: string;
    name: string;
    email: string;
  };
  partnerLink: string;
  dashboardLink: string;
  stats: Stats;
  recentReferrals: PartnerReferral[];
};

export default function ZenithWorkspace({
  partner,
  partnerLink,
  dashboardLink,
  stats,
  recentReferrals,
}: ZenithWorkspaceProps) {
  const firstName = partner.name.split(/\s+/)[0] || "Partner";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      {/* Hero — link + week stats */}
      <section>
        <p className="text-xs uppercase tracking-widest text-lime-300 font-semibold mb-3">
          Welcome back, {firstName}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
          Your referral link, ready to share.
        </h1>
        <p className="text-slate-400 max-w-xl mb-8 leading-relaxed">
          One link works for everything — TEKKY ball sales, coaching package
          signups, parent referrals. Cookie tracks 90 days from click. Earn
          on every sale within that window.
        </p>

        <CopyBlock
          label="Your link"
          value={partnerLink}
          accent="lime"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <Stat label="This week" value={`$${(stats.weekCents / 100).toFixed(0)}`} sub={`${stats.weekCount} sale${stats.weekCount === 1 ? "" : "s"}`} highlight />
          <Stat label="Owed" value={`$${(stats.owedCents / 100).toFixed(0)}`} sub="next payout" />
          <Stat label="Paid out" value={`$${(stats.paidCents / 100).toFixed(0)}`} sub="all time" />
          <Stat label="Referrals" value={stats.totalReferrals.toString()} sub="all time" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Link
            href={dashboardLink}
            className="rounded-full border border-lime-500/30 bg-lime-500/5 hover:bg-lime-500/10 text-lime-200 px-3 py-1.5 transition-colors"
          >
            Full dashboard →
          </Link>
          <Link
            href="/clients/zenith-sports/partners/script"
            className="rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-slate-200 px-3 py-1.5 transition-colors"
          >
            Script library →
          </Link>
        </div>

        {/* Monthly progress meter — gives partners a concrete next-rung
            target. Renders the next un-cleared milestone with a fill bar. */}
        <GoalProgress monthCents={stats.monthCents ?? stats.weekCents * 4} />
      </section>

      {/* Share kit — pre-written copy for the channels Zenith partners
          actually use. Skip-the-blank-page-energy. */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-1">Share kit</h2>
        <p className="text-sm text-slate-400 mb-6">
          Tap to copy. Drop into your team chat, IG bio, parent email — the link
          tracks the rest.
        </p>

        <div className="space-y-4">
          <ShareCard
            channel="📲 Team chat / SMS to a parent"
            body={`The ball I use at trainings, if anyone's looking — TEKKY. ${partnerLink}`}
          />
          <ShareCard
            channel="📷 Instagram caption"
            body={`The ball that fixes the touch gap I keep seeing in U10–U19. We use it at training every week. Link in bio: ${partnerLink}`}
          />
          <ShareCard
            channel="✉️ Parent email opener"
            body={`A few of you have asked what ball we're using at training. It's TEKKY — engineered to force a clean first touch every rep. There's a 15% discount through my partner link if you want to pick one up: ${partnerLink}`}
          />
          <ShareCard
            channel="🏟️ Club / DOC pitch"
            body={`Quick one — wholesale margin opens at 50+ balls + co-branded boxes. Worth a 10-min call? ${partnerLink}`}
          />
        </div>
      </section>

      {/* Script library shortcuts */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-1">Live call scripts</h2>
        <p className="text-sm text-slate-400 mb-6">
          If you&apos;d rather call than DM, scripts are pre-written by audience —
          just open and read.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <ScriptLink
            href="/clients/zenith-sports/partners/script?audience=coach"
            emoji="🥅"
            title="Coach pitch"
            sub="$25/ball + $100/coaching package"
            accent="lime"
          />
          <ScriptLink
            href="/clients/zenith-sports/partners/script?audience=club"
            emoji="🏟️"
            title="Club / DOC pitch"
            sub="Wholesale + co-branded boxes"
            accent="sky"
          />
          <ScriptLink
            href="/clients/zenith-sports/partners/script?audience=parent"
            emoji="👨‍👩‍👧"
            title="Parent referral"
            sub="$20 per referred parent"
            accent="amber"
          />
          <ScriptLink
            href="/clients/zenith-sports/partners/script?audience=camp"
            emoji="🏕️"
            title="Camp / academy"
            sub="Bake into registration fee"
            accent="violet"
          />
        </div>
      </section>

      {/* Recent referrals */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-1">Recent referrals</h2>
        <p className="text-sm text-slate-400 mb-6">
          Most recent first. Updates in real time as parents check out.
        </p>

        {recentReferrals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-lime-500/30 bg-gradient-to-br from-lime-950/20 to-slate-900/30 p-6 sm:p-8">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-slate-100 font-bold mb-2">
              Your first sale is the hardest. Then it gets easy.
            </p>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Most active partners hit their first sale within 7 days. The
              ones who don&apos;t are just sitting on the link. Pick the path
              that matches you:
            </p>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <a
                href={`sms:&body=${encodeURIComponent(`The ball I use at trainings — TEKKY. ${partnerLink}`)}`}
                className="rounded-lg border border-lime-500/30 bg-lime-500/5 hover:bg-lime-500/10 px-3 py-2.5 text-lime-200 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-wider font-bold mb-0.5">
                  📲 1-min play
                </div>
                <div className="text-[12px] text-slate-300">
                  Text 3 parents on your roster
                </div>
              </a>
              <Link
                href="/clients/zenith-sports/partners/script?audience=coach"
                className="rounded-lg border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 px-3 py-2.5 text-sky-200 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-wider font-bold mb-0.5">
                  📞 5-min play
                </div>
                <div className="text-[12px] text-slate-300">
                  Call one fellow coach
                </div>
              </Link>
              <Link
                href="/clients/zenith-sports/partners/script?audience=club"
                className="rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 px-3 py-2.5 text-violet-200 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-wider font-bold mb-0.5">
                  🎯 30-min play
                </div>
                <div className="text-[12px] text-slate-300">
                  Pitch your DOC
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-lime-500/15 bg-slate-900/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3">Referred</th>
                  <th className="text-left px-4 py-3">Kind</th>
                  <th className="text-left px-4 py-3">Closed</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lime-500/10">
                {recentReferrals.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-white">
                      {r.business_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {kindLabel(r.kind || "other")}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(r.closed_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-mono">
                      ${(r.amount_cents / 100).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      <PayoutBadge status={r.payout_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Help footer */}
      <section className="rounded-2xl border border-lime-500/15 bg-lime-950/15 p-6">
        <p className="text-xs uppercase tracking-wider text-lime-300 font-semibold mb-2">
          Need help?
        </p>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Payouts go out every Monday for the previous week — Venmo or Zelle direct.
          Refunds void the related payout. Anything else, Philip replies personally.
        </p>
        <a
          href="mailto:partners@zenithsports.org"
          className="inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200"
        >
          partners@zenithsports.org →
        </a>
      </section>
    </div>
  );
}

/* ─────────────── helpers ─────────────── */

function kindLabel(k: string): string {
  switch (k) {
    case "ball":
      return "Ball sale";
    case "coaching-package":
      return "Coaching pkg";
    case "parent-referral":
      return "Parent ref";
    case "club-wholesale":
      return "Club wholesale";
    case "camp":
      return "Camp partner";
    default:
      return k.replace(/-/g, " ");
  }
}

function CopyBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "lime" | "sky";
}) {
  const [copied, setCopied] = useState(false);
  const colorMap = {
    lime: {
      border: "border-lime-500/30",
      bg: "bg-lime-500/5",
      label: "text-lime-300",
      value: "text-lime-100",
      btn: "bg-lime-400 hover:bg-lime-300 text-slate-950",
      btnCopied: "bg-emerald-500 text-white",
    },
    sky: {
      border: "border-sky-500/30",
      bg: "bg-sky-500/5",
      label: "text-sky-300",
      value: "text-sky-100",
      btn: "bg-sky-400 hover:bg-sky-300 text-slate-950",
      btnCopied: "bg-emerald-500 text-white",
    },
  };
  const c = colorMap[accent];

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore — older browsers */
    }
  }

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] uppercase tracking-wider ${c.label} font-bold mb-1.5`}>
            {label}
          </p>
          <p className={`font-mono text-sm break-all ${c.value}`}>{value}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`rounded-md px-4 py-2 text-sm font-bold transition-colors ${
            copied ? c.btnCopied : c.btn
          }`}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function ShareCard({ channel, body }: { channel: string; body: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="rounded-xl border border-lime-500/15 bg-slate-900/30 p-4 hover:border-lime-500/30 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-lime-200">{channel}</p>
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            copied
              ? "bg-emerald-500 text-white"
              : "bg-lime-400 hover:bg-lime-300 text-slate-950"
          }`}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{body}</p>
    </div>
  );
}

function ScriptLink({
  href,
  emoji,
  title,
  sub,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  accent: "lime" | "sky" | "amber" | "violet";
}) {
  const colorMap = {
    lime: "border-lime-500/20 hover:border-lime-500/50 text-lime-300",
    sky: "border-sky-500/20 hover:border-sky-500/50 text-sky-300",
    amber: "border-amber-500/20 hover:border-amber-500/50 text-amber-300",
    violet: "border-violet-500/20 hover:border-violet-500/50 text-violet-300",
  };
  return (
    <Link
      href={href}
      className={`rounded-xl border ${colorMap[accent]} bg-slate-900/40 p-5 transition-colors flex items-start gap-3`}
    >
      <span className="text-2xl shrink-0 leading-none">{emoji}</span>
      <div className="min-w-0">
        <p className="font-bold text-base leading-tight mb-1">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-lime-500/10 bg-slate-900/40"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">
        {label}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

/** Monthly progress meter — finds the next un-cleared milestone in
 *  GOAL_LADDER, renders a fill bar showing progress toward it, and
 *  surfaces the perk that unlocks. Once a partner is past the top
 *  rung, shows a "Pro tier — let's talk equity" message. */
function GoalProgress({ monthCents }: { monthCents: number }) {
  const next = GOAL_LADDER.find((g) => monthCents < g.cents);
  if (!next) {
    return (
      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/15 p-4">
        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">
          🏆 Top tier
        </div>
        <p className="text-sm text-slate-200">
          You&apos;ve cleared every monthly milestone. Philip will reach out
          about equity-share + co-branded camp opportunities.
        </p>
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, (monthCents / next.cents) * 100));
  const remaining = (next.cents - monthCents) / 100;
  return (
    <div className="mt-6 rounded-xl border border-lime-500/20 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="text-[11px] uppercase tracking-wider font-bold text-lime-300">
          This month · next goal: {next.label}
        </div>
        <div className="text-[10px] text-slate-500 tabular-nums">
          ${(monthCents / 100).toFixed(0)} of ${(next.cents / 100).toFixed(0)}
        </div>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-lime-500 to-lime-300 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">
        <strong className="text-lime-300">${remaining.toFixed(0)} more</strong>{" "}
        unlocks: <span className="text-slate-100">{next.perk}</span>.
      </p>
    </div>
  );
}

function PayoutBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    owed: {
      label: "Owed",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    paid: {
      label: "Paid",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    void: {
      label: "Void",
      cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
  };
  const m = map[status] || map.owed;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
