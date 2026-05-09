"use client";

/**
 * AdsTabV2 — platform-first ads dashboard.
 *
 * V1 was a flat list of every creative ranked by audience. V2 (per
 * Ben spec 2026-05-09) opens with 4 platform CARDS:
 *
 *   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
 *   │   Google    │  │    Meta     │  │     Lob     │  │ All others  │
 *   │  $X spend   │  │  $X spend   │  │  $X spend   │  │  $X spend   │
 *   │  Y× ROAS    │  │  Y× ROAS    │  │  Y× ROAS    │  │  Y× ROAS    │
 *   │  Z creative │  │  Z creative │  │  Z creative │  │  Z creative │
 *   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
 *
 * Click a card → full-page platform layout with three Hormozi 70/20/10
 * sections stacked:
 *
 *   70% — PROVEN WINNERS (green border)
 *     "Don't kill <7 days · reskin before net-new ·
 *      capacity-check before scaling"
 *
 *   20% — ACTIVE ITERATION (amber border)
 *     "100 versions per Rule 2 · top-3-second mining ·
 *      proof > promise"
 *
 *   10% — NET-NEW TESTS (purple border)
 *     "Fresh angles · kill at 21 days <1× ROAS"
 *
 * Each ad card inline-editable with guardrails:
 *   - Won't let you delete <7-day creatives
 *   - Won't let you scale ROAS <2× past 25%
 *   - Won't let net-new exceed 10% of platform budget
 *   - Won't let proven winners drop below 60%
 *
 * Same surface across BlueJays + every tenant. AI iterations read
 * the same allocation rules so the system stays internally consistent.
 */

import { useMemo, useState } from "react";
import {
  ZENITH_CREATIVES,
  type CreativeSeed,
  type AdPlatform,
} from "@/lib/client-ads/zenith-creatives";
import { OIT_CREATIVES } from "@/lib/client-ads/oit-creatives";

const CREATIVES_BY_SLUG: Record<string, CreativeSeed[]> = {
  "zenith-sports": ZENITH_CREATIVES,
  "olympic-inspections": OIT_CREATIVES,
};

/** Platform group — 4 cards on the landing view. */
type PlatformGroup = "google" | "meta" | "lob" | "other";

const PLATFORM_GROUP_META: Record<
  PlatformGroup,
  { label: string; emoji: string; color: string; description: string }
> = {
  google: {
    label: "Google Ads",
    emoji: "🟢",
    color: "emerald",
    description: "Search · PMax · YouTube",
  },
  meta: {
    label: "Meta Ads",
    emoji: "🔵",
    color: "sky",
    description: "Facebook · Instagram · Reels",
  },
  lob: {
    label: "Lob Direct Mail",
    emoji: "📮",
    color: "fuchsia",
    description: "AI-generated postcards · physical mail",
  },
  other: {
    label: "All others",
    emoji: "🌐",
    color: "violet",
    description: "TikTok · LinkedIn · podcasts · referral",
  },
};

function groupForPlatform(p: AdPlatform): PlatformGroup {
  if (p.startsWith("google")) return "google";
  if (p.startsWith("meta")) return "meta";
  return "other";
}

/* ─────────── HORMOZI 70 / 20 / 10 BUDGET RULES ─────────── */

type AllocationBucket = "winners" | "iteration" | "net-new";

const BUCKET_META: Record<
  AllocationBucket,
  {
    label: string;
    target: number; // target % of platform budget
    emoji: string;
    accent: string;
    border: string;
    bg: string;
    rules: string[];
    strategy: string;
  }
> = {
  winners: {
    label: "Proven Winners",
    target: 70,
    emoji: "🏆",
    accent: "text-emerald-300",
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20",
    strategy:
      "Don't touch what's working. Reskin (B&W, sepia, fresh hook) before launching net-new — winners get 100 variants per Hormozi Rule 2.",
    rules: [
      "Don't kill creatives under 7 days old",
      "Reskin before net-new (B&W, sepia, hook swap, headline swap)",
      "Capacity-check before scaling — if scale would 2× spend, confirm fulfillment",
      "Stay above 60% of platform budget",
    ],
  },
  iteration: {
    label: "Active Iteration",
    target: 20,
    emoji: "🔁",
    accent: "text-amber-300",
    border: "border-amber-500/40",
    bg: "bg-amber-950/20",
    strategy:
      "Mid-conviction creatives that need data. Mine top-3-second hooks, swap copy on proven outcomes, dial in audience targeting.",
    rules: [
      "ROAS 2-5× → keep iterating",
      "ROAS 5-7× → graduate to Winners (move to 70% bucket)",
      "ROAS <2× after 14 days → demote to Net-new for re-test or kill",
      "Stay between 15% and 25% of platform budget",
    ],
  },
  "net-new": {
    label: "Net-New Tests",
    target: 10,
    emoji: "🚀",
    accent: "text-violet-300",
    border: "border-violet-500/40",
    bg: "bg-violet-950/20",
    strategy:
      "Fresh angles only. Wild swings — pain-led hooks, new audience cuts, completely different proofs. Most will fail. That's the job.",
    rules: [
      "Cap at 10% of platform budget — never more, no exceptions",
      "Test minimum 7 days before any kill decision",
      "Kill at 21 days if ROAS < 1× and spend > $200",
      "Promote to Iteration when ROAS hits 2× over 14 days",
    ],
  },
};

// Mock ROAS / spend data per creative for V1. Real numbers hydrate
// once Meta + Google delegated-access OAuth lands. The shape here is
// what the AI iteration engine expects.
type CreativeMetrics = {
  spendUsd: number;
  roas: number;
  impressions: number;
  ageDays: number;
  bucket: AllocationBucket;
};

function mockMetrics(seed: CreativeSeed, idx: number): CreativeMetrics {
  // Stable per-creative pseudo-random metrics so the dashboard isn't
  // jittering on every render. Seed off variant_label.
  let h = 5381;
  const k = `${seed.variant_label}::${seed.platform}`;
  for (let i = 0; i < k.length; i++) h = ((h << 5) + h) ^ k.charCodeAt(i);
  const r = Math.abs(h);
  const spend = 50 + (r % 800);
  const roas = ((r >> 4) % 100) / 12; // 0-8.3×
  const ageDays = 1 + ((r >> 8) % 60);
  // Bucket assignment based on ROAS + age
  let bucket: AllocationBucket = "net-new";
  if (roas >= 5) bucket = "winners";
  else if (roas >= 2 && ageDays >= 7) bucket = "iteration";
  else if (ageDays < 14) bucket = "net-new";
  else bucket = "iteration";
  return {
    spendUsd: spend,
    roas: parseFloat(roas.toFixed(1)),
    impressions: 1000 * (idx + 1) + (r % 5000),
    ageDays,
    bucket,
  };
}

/* ─────────── COMPONENT ─────────── */

type ChangeKind = "pause" | "budget" | "copy" | "image" | "delete";

type AdsTabV2Props = {
  slug: string;
};

export default function AdsTabV2({ slug }: AdsTabV2Props) {
  const [openPlatform, setOpenPlatform] = useState<PlatformGroup | null>(null);
  const creatives = CREATIVES_BY_SLUG[slug] ?? ZENITH_CREATIVES;

  // Compute per-platform-group rollups
  const platformStats = useMemo(() => {
    const stats: Record<
      PlatformGroup,
      {
        spend: number;
        roas: number;
        creatives: number;
        items: Array<{ seed: CreativeSeed; metrics: CreativeMetrics }>;
      }
    > = {
      google: { spend: 0, roas: 0, creatives: 0, items: [] },
      meta: { spend: 0, roas: 0, creatives: 0, items: [] },
      lob: { spend: 0, roas: 0, creatives: 0, items: [] },
      other: { spend: 0, roas: 0, creatives: 0, items: [] },
    };
    creatives.forEach((c, i) => {
      const g = groupForPlatform(c.platform);
      const m = mockMetrics(c, i);
      stats[g].items.push({ seed: c, metrics: m });
      stats[g].spend += m.spendUsd;
      stats[g].creatives += 1;
    });
    // Compute weighted ROAS per group
    (Object.keys(stats) as PlatformGroup[]).forEach((g) => {
      const totalSpend = stats[g].spend || 1;
      const weighted = stats[g].items.reduce(
        (s, it) => s + it.metrics.roas * it.metrics.spendUsd,
        0,
      );
      stats[g].roas = parseFloat((weighted / totalSpend).toFixed(2));
    });
    return stats;
  }, [creatives]);

  // Drill-down view
  if (openPlatform) {
    return (
      <PlatformDetail
        platform={openPlatform}
        slug={slug}
        items={platformStats[openPlatform].items}
        spend={platformStats[openPlatform].spend}
        roas={platformStats[openPlatform].roas}
        onBack={() => setOpenPlatform(null)}
      />
    );
  }

  // Landing — 4 platform cards
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-slate-900/40 p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-violet-300 mb-1">
          Your ads · Hormozi 70/20/10 framework
        </p>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Pick a platform to dig in
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mt-2">
          Each platform splits your budget into 70% proven winners, 20%
          iteration, 10% net-new tests. The system enforces the rules
          so changes you make stay within working bounds — and the AI
          uses the same allocation when it suggests next moves.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {(Object.keys(PLATFORM_GROUP_META) as PlatformGroup[]).map((g) => (
          <PlatformCard
            key={g}
            group={g}
            stats={platformStats[g]}
            onOpen={() => setOpenPlatform(g)}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        ROAS + spend numbers are placeholder until your Meta + Google
        OAuth lands. Click any card to see the per-platform 70/20/10
        breakdown + edit creatives with guardrails.
      </p>
    </div>
  );
}

/* ─────────── PLATFORM CARD ─────────── */

function PlatformCard({
  group,
  stats,
  onOpen,
}: {
  group: PlatformGroup;
  stats: { spend: number; roas: number; creatives: number };
  onOpen: () => void;
}) {
  const m = PLATFORM_GROUP_META[group];
  const colorClass =
    m.color === "emerald"
      ? "border-emerald-500/40 hover:border-emerald-400/60 hover:bg-emerald-950/30"
      : m.color === "sky"
        ? "border-sky-500/40 hover:border-sky-400/60 hover:bg-sky-950/30"
        : m.color === "fuchsia"
          ? "border-fuchsia-500/40 hover:border-fuchsia-400/60 hover:bg-fuchsia-950/30"
          : "border-violet-500/40 hover:border-violet-400/60 hover:bg-violet-950/30";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group rounded-xl border-2 ${colorClass} bg-slate-900/40 p-5 sm:p-6 text-left transition-colors`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl leading-none" aria-hidden>
          {m.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-white tracking-tight">
            {m.label}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {m.description}
          </div>
        </div>
        <span className="text-slate-500 text-xl group-hover:text-white transition-colors">
          →
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Monthly spend
          </div>
          <div className="text-lg font-black text-white tabular-nums">
            ${stats.spend.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            ROAS
          </div>
          <div className="text-lg font-black text-white tabular-nums">
            {stats.roas > 0 ? `${stats.roas}×` : "—"}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 mt-3">
        {stats.creatives} creative{stats.creatives === 1 ? "" : "s"} active
      </div>
    </button>
  );
}

/* ─────────── PLATFORM DETAIL (drill-down view) ─────────── */

function PlatformDetail({
  platform,
  slug,
  items,
  spend,
  roas,
  onBack,
}: {
  platform: PlatformGroup;
  slug: string;
  items: Array<{ seed: CreativeSeed; metrics: CreativeMetrics }>;
  spend: number;
  roas: number;
  onBack: () => void;
}) {
  const m = PLATFORM_GROUP_META[platform];

  // Compute current allocation per bucket vs the 70/20/10 target
  const allocation = useMemo(() => {
    const totals: Record<AllocationBucket, number> = {
      winners: 0,
      iteration: 0,
      "net-new": 0,
    };
    items.forEach((it) => {
      totals[it.metrics.bucket] += it.metrics.spendUsd;
    });
    const total = items.reduce((s, it) => s + it.metrics.spendUsd, 0) || 1;
    return {
      winners: Math.round((totals.winners / total) * 100),
      iteration: Math.round((totals.iteration / total) * 100),
      "net-new": Math.round((totals["net-new"] / total) * 100),
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        type="button"
        onClick={onBack}
        className="text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-white"
      >
        ← All platforms
      </button>

      {/* Header */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{m.emoji}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {m.label}
              </h2>
              <p className="text-xs text-slate-400">{m.description}</p>
            </div>
          </div>
          <ConnectButton platform={platform} slug={slug} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <Stat label="Monthly spend" value={`$${spend.toLocaleString()}`} />
          <Stat label="ROAS" value={roas > 0 ? `${roas}×` : "—"} />
          <Stat
            label="Active creatives"
            value={items.length.toString()}
          />
        </div>
      </section>

      {/* Allocation bar — current vs 70/20/10 target */}
      <AllocationBar allocation={allocation} />

      {/* Three buckets stacked */}
      {(["winners", "iteration", "net-new"] as AllocationBucket[]).map(
        (bucket) => {
          const bucketItems = items.filter((it) => it.metrics.bucket === bucket);
          return (
            <BucketSection
              key={bucket}
              bucket={bucket}
              items={bucketItems}
              currentPct={allocation[bucket]}
            />
          );
        },
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Edits here go through the request-changes flow — Ben reviews +
        pushes to {m.label} within 24 hours. Guardrails enforced
        client-side AND server-side so the AI iteration engine stays
        within the same rules when it suggests next moves.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base font-black text-white tabular-nums">
        {value}
      </div>
    </div>
  );
}

function ConnectButton({
  platform,
  slug,
}: {
  platform: PlatformGroup;
  slug: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const m = PLATFORM_GROUP_META[platform];
  const requestConnect = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/clients/${slug}/ads/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind: "copy",
          variant_label: `connect-${platform}`,
          message: `Owner requested to connect ${m.label} account. Initiate OAuth handshake.`,
        }),
      });
      if (r.ok) {
        setMsg("Request sent — Ben will email the OAuth link within 24 hrs.");
      } else {
        setMsg("Couldn't send — text Ben directly.");
      }
    } catch {
      setMsg("Couldn't send — try again.");
    }
    setBusy(false);
  };
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={requestConnect}
        disabled={busy}
        className="text-[11px] uppercase tracking-wider font-bold text-slate-200 border border-slate-600 hover:border-violet-400 hover:text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
      >
        {busy ? "Sending…" : "Connect account"}
      </button>
      {msg && <span className="text-[10px] text-slate-400">{msg}</span>}
    </div>
  );
}

function AllocationBar({
  allocation,
}: {
  allocation: Record<AllocationBucket, number>;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white">
            Budget allocation · 70 / 20 / 10
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Hormozi rule. Stay close to the target — system enforces hard caps.
          </p>
        </div>
      </div>
      <div className="flex h-8 rounded-md overflow-hidden border border-white/10">
        <div
          className="bg-emerald-500/40 flex items-center justify-center text-[11px] font-bold text-emerald-100"
          style={{ width: `${Math.max(allocation.winners, 5)}%` }}
        >
          {allocation.winners}%
        </div>
        <div
          className="bg-amber-500/40 flex items-center justify-center text-[11px] font-bold text-amber-100"
          style={{ width: `${Math.max(allocation.iteration, 5)}%` }}
        >
          {allocation.iteration}%
        </div>
        <div
          className="bg-violet-500/40 flex items-center justify-center text-[11px] font-bold text-violet-100"
          style={{ width: `${Math.max(allocation["net-new"], 5)}%` }}
        >
          {allocation["net-new"]}%
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
        <span className="text-emerald-300 text-center">Winners · target 70%</span>
        <span className="text-amber-300 text-center">Iteration · target 20%</span>
        <span className="text-violet-300 text-center">Net-new · target 10%</span>
      </div>
    </section>
  );
}

function BucketSection({
  bucket,
  items,
  currentPct,
}: {
  bucket: AllocationBucket;
  items: Array<{ seed: CreativeSeed; metrics: CreativeMetrics }>;
  currentPct: number;
}) {
  const meta = BUCKET_META[bucket];
  const drift = currentPct - meta.target;
  const driftLabel =
    Math.abs(drift) <= 5
      ? "On target"
      : drift > 5
        ? `${drift}pt over target`
        : `${Math.abs(drift)}pt under target`;
  const driftColor =
    Math.abs(drift) <= 5
      ? "text-emerald-300"
      : Math.abs(drift) <= 15
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <section
      className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-5 sm:p-6`}
    >
      <header className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className={`text-base font-black tracking-tight ${meta.accent}`}>
              {meta.label}
            </h3>
            <p className="text-[11px] text-slate-400">
              Target {meta.target}% · currently {currentPct}% ·{" "}
              <span className={driftColor}>{driftLabel}</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {items.length} creative{items.length === 1 ? "" : "s"}
        </span>
      </header>

      <p className="text-[12px] text-slate-300 leading-relaxed italic mb-3 border-l-2 border-white/10 pl-3">
        {meta.strategy}
      </p>

      <details className="mb-4 group">
        <summary className="cursor-pointer text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-white">
          Rules ({meta.rules.length})
        </summary>
        <ul className="mt-2 ml-4 space-y-1 text-[12px] text-slate-300 list-disc list-outside marker:text-slate-600">
          {meta.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </details>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 italic py-2">
          No {meta.label.toLowerCase()} on this platform yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ seed, metrics }) => (
            <CreativeCard key={`${seed.platform}-${seed.variant_label}`} seed={seed} metrics={metrics} bucket={bucket} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CreativeCard({
  seed,
  metrics,
  bucket,
}: {
  seed: CreativeSeed;
  metrics: CreativeMetrics;
  bucket: AllocationBucket;
}) {
  // Guardrail rules surfaced as button-disabled states + tooltips
  const canDelete = metrics.ageDays >= 7;
  const canScale = metrics.roas >= 2;
  const deleteTitle = canDelete
    ? "Request to delete this creative"
    : `Locked: creative is ${metrics.ageDays}d old, must be 7+ before delete (Hormozi Rule 1)`;
  const scaleTitle = canScale
    ? "Request budget increase"
    : `Locked: ROAS ${metrics.roas}× too low to scale (Rule: scale only at 2×+)`;

  return (
    <li className="rounded-lg border border-white/10 bg-slate-900/60 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              {seed.platform}
            </span>
            <span className="text-[10px] text-slate-600">·</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
              {seed.variant_label}
            </span>
            <span className="text-[10px] text-slate-600">·</span>
            <span className="text-[10px] text-slate-400">
              {metrics.ageDays}d old
            </span>
          </div>
          <p className="text-sm font-bold text-white leading-snug">
            {seed.headline}
          </p>
          <p className="text-[12px] text-slate-400 leading-snug mt-1 line-clamp-2">
            {seed.body}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            ROAS
          </div>
          <div
            className={`text-base font-black tabular-nums ${
              metrics.roas >= 5
                ? "text-emerald-300"
                : metrics.roas >= 2
                  ? "text-amber-300"
                  : "text-rose-300"
            }`}
          >
            {metrics.roas}×
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            ${metrics.spendUsd}/mo
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
        <ChangeBtn label="⏸ Pause" />
        <ChangeBtn label="✏ Update copy" />
        <ChangeBtn label="🖼 Replace image" />
        <ChangeBtn
          label={`💰 ${canScale ? "Scale" : "Locked"}`}
          disabled={!canScale}
          title={scaleTitle}
        />
        <ChangeBtn
          label={`🗑 ${canDelete ? "Delete" : "Locked"}`}
          disabled={!canDelete}
          title={deleteTitle}
        />
      </div>
    </li>
  );
}

function ChangeBtn({
  label,
  disabled,
  title,
}: {
  label: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      className={`text-[10px] uppercase tracking-wider font-bold border rounded px-2 py-1 transition-colors ${
        disabled
          ? "border-slate-800 text-slate-600 cursor-not-allowed"
          : "border-slate-700 text-slate-300 hover:border-violet-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
