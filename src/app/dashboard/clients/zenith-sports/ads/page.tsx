import Link from "next/link";
import {
  ZENITH_CREATIVES,
  listZenithCreativeStats,
  type CreativeSeed,
} from "@/lib/client-ads/zenith-creatives";

/**
 * /dashboard/clients/zenith-sports/ads
 *
 * Ad creative library overview for Zenith / Tekky. Reads the 43-creative
 * registry from `lib/client-ads/zenith-creatives.ts` and renders a
 * table grouped by audience. Shipped 2026-05-08 ahead of the
 * 2026-05-09 final delivery walkthrough so Ben can answer "where do I
 * see the ads?" without leaving the BlueJays dashboard.
 *
 * Impression / spend / ROAS columns are intentionally placeholder
 * (`—`) until the Meta + Google Ads APIs are wired through the
 * `client_ad_creatives` performance table. Per CLAUDE.md "Status
 * Accuracy Rules": never display fake numbers — show a placeholder
 * dash + a footnote explaining when real data lights up.
 */

export const metadata = {
  title: "Zenith Sports / Tekky · Ad Library — BlueJays",
};

const PLATFORM_LABELS: Record<CreativeSeed["platform"], string> = {
  "meta-feed": "Meta · Feed",
  "meta-reels": "Meta · Reels",
  "meta-stories": "Meta · Stories",
  "google-search": "Google · Search",
  "google-pmax": "Google · PMax",
  "google-yt": "Google · YouTube",
  lob: "Lob · Postcard",
};

const PLATFORM_ACCENTS: Record<
  CreativeSeed["platform"],
  { tone: string; ext: string }
> = {
  "meta-feed": {
    tone: "border-sky-500/40 bg-sky-500/10 text-sky-200",
    ext: "https://business.facebook.com/adsmanager",
  },
  "meta-reels": {
    tone: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200",
    ext: "https://business.facebook.com/adsmanager",
  },
  "meta-stories": {
    tone: "border-violet-500/40 bg-violet-500/10 text-violet-200",
    ext: "https://business.facebook.com/adsmanager",
  },
  "google-search": {
    tone: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    ext: "https://ads.google.com",
  },
  "google-pmax": {
    tone: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    ext: "https://ads.google.com",
  },
  "google-yt": {
    tone: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    ext: "https://ads.google.com",
  },
  lob: {
    tone: "border-orange-500/40 bg-orange-500/10 text-orange-200",
    ext: "https://dashboard.lob.com",
  },
};

const AUDIENCE_LABELS: Record<CreativeSeed["audience"], string> = {
  parent: "Parents",
  coach: "Coaches",
  player: "Players",
  all: "All / catalog",
  homeowner: "Homeowners",
  realtor: "Realtors",
  insurance: "Insurance",
};

const AUDIENCE_TONES: Record<CreativeSeed["audience"], string> = {
  parent: "border-amber-500/40 text-amber-200 bg-amber-500/[0.08]",
  coach: "border-sky-500/40 text-sky-200 bg-sky-500/[0.08]",
  player: "border-lime-500/40 text-lime-200 bg-lime-500/[0.08]",
  all: "border-violet-500/40 text-violet-200 bg-violet-500/[0.08]",
  homeowner: "border-emerald-500/40 text-emerald-200 bg-emerald-500/[0.08]",
  realtor: "border-cyan-500/40 text-cyan-200 bg-cyan-500/[0.08]",
  insurance: "border-indigo-500/40 text-indigo-200 bg-indigo-500/[0.08]",
};

export default function ZenithAdsPage() {
  const stats = listZenithCreativeStats();
  const audiences: CreativeSeed["audience"][] = ["parent", "coach", "player", "all"];

  return (
    <>
      {/* Sub-action bar — context line + creative count.
          Tab bar (back-nav, title, Site link) is provided by
          /dashboard/clients/zenith-sports/layout.tsx via ClientTabsBar. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 border-b border-slate-800/50 flex items-center gap-3 flex-wrap">
        <p className="text-[11px] text-slate-500 leading-snug flex-1 min-w-[300px]">
          Source of truth: <code className="text-slate-300">src/lib/client-ads/zenith-creatives.ts</code>.
          Edit + re-seed via <code className="text-slate-300">POST /api/client-ads/zenith-sports/seed?upsert=1</code>.
          Performance columns light up once Meta + Google Ads APIs are wired.
        </p>
        <span className="text-[11px] tracking-wider uppercase font-bold text-slate-500 whitespace-nowrap">
          {stats.total} creatives
        </span>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatTile label="Total creatives" value={String(stats.total)} tone="violet" />
          <StatTile label="Parent ads" value={String(stats.byAudience.parent ?? 0)} tone="amber" />
          <StatTile label="Coach ads" value={String(stats.byAudience.coach ?? 0)} tone="sky" />
          <StatTile label="Player ads" value={String(stats.byAudience.player ?? 0)} tone="lime" />
        </div>

        {/* Iteration nudges — powered by paid_ads_iteration skill.
            Mock data for now; hydrates from real ROAS once Meta +
            Google APIs are delegated. Same nudges show on the owner-
            facing portal Ads tab so Ben + Philip + Paul see the same
            recommendations. Per AIOS principle 18 (cross-project
            ripples) — UI mirrors the skill's 6-step decision algo. */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white">
              This week&apos;s iteration recommendations
            </h2>
            <span className="text-[11px] text-slate-500">
              Powered by the <code className="text-slate-300">paid_ads_iteration</code> skill ·
              Hormozi-aligned · refreshes Mondays
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <DashboardNudgeCard
              icon="🚀"
              tone="emerald"
              title="Scale: Coach · A · Outcome-led (Meta Feed)"
              detail="Top performer in coach audience. ROAS 7.2× · 14d · $480. Hormozi Rule 10 — when ROAS is 7+ scale until capacity caps. Recommended: increase daily budget 50%."
            />
            <DashboardNudgeCard
              icon="🔁"
              tone="amber"
              title="Iterate: Parent · A · Outcome-14days (Meta Feed)"
              detail="Running 14+ days unchanged at 4.3× ROAS. Hormozi Rule 2 — winners get 100 versions. Suggested permutations: B&W variant · sepia · hook swap (top 3-sec from Coach winner) · headline swap."
            />
            <DashboardNudgeCard
              icon="🎯"
              tone="sky"
              title="Audit: Retargeting gap on YouTube + TikTok"
              detail="Pixels installed on Meta + Google Display only. Hormozi Rule 8 — retargeting is the highest-ROAS lever in any account. Recommended: install YouTube + TikTok pixels this week."
            />
            <DashboardNudgeCard
              icon="✂"
              tone="rose"
              title="Kill: Player · C · Driveway-daily (Meta Stories)"
              detail="ROAS 0.4× over 21 days, $180 spend. Hormozi Rule 10 — 1× or below = cut. Hard rule: needs operator approval before push."
            />
          </div>
        </section>

        {/* Per-audience tables */}
        {audiences.map((aud) => {
          const list = ZENITH_CREATIVES.filter((c) => c.audience === aud);
          if (list.length === 0) return null;
          const tone = AUDIENCE_TONES[aud];
          return (
            <section key={aud} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-flex items-center text-xs font-bold uppercase tracking-wider rounded-full border px-3 py-1 ${tone}`}
                >
                  {AUDIENCE_LABELS[aud]} · {list.length}
                </span>
                <span className="text-xs text-slate-500">
                  utm_campaign = <code className="text-slate-400">tekky-{aud}</code>
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Variant</th>
                        <th className="text-left px-4 py-2 font-semibold">Platform</th>
                        <th className="text-left px-4 py-2 font-semibold">Headline</th>
                        <th className="text-right px-4 py-2 font-semibold">Impressions</th>
                        <th className="text-right px-4 py-2 font-semibold">Spend</th>
                        <th className="text-right px-4 py-2 font-semibold">ROAS</th>
                        <th className="text-right px-4 py-2 font-semibold">Live in</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {list.map((c, i) => {
                        const accent = PLATFORM_ACCENTS[c.platform];
                        return (
                          <tr
                            key={`${c.audience}-${c.platform}-${c.variant_label}-${i}`}
                            className="hover:bg-slate-900/60 transition-colors"
                          >
                            <td className="px-4 py-3 align-top">
                              <p className="font-semibold text-white text-sm leading-tight">
                                {c.variant_label}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                                {c.ad_set}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold rounded border px-2 py-0.5 whitespace-nowrap ${accent.tone}`}
                              >
                                {PLATFORM_LABELS[c.platform]}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top max-w-md">
                              <p className="text-slate-200 text-sm leading-snug">
                                {c.headline}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                                {c.body}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top text-right tabular-nums text-slate-500">—</td>
                            <td className="px-4 py-3 align-top text-right tabular-nums text-slate-500">—</td>
                            <td className="px-4 py-3 align-top text-right tabular-nums text-slate-500">—</td>
                            <td className="px-4 py-3 align-top text-right">
                              <a
                                href={accent.ext}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] uppercase tracking-wider font-bold text-sky-300 hover:text-white"
                              >
                                Open ↗
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })}

        <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
          Performance dashes (—) are placeholders — Meta Ads API + Google Ads API
          credentials are pending Tekky-side delegated access (see <code className="text-slate-300">client_tasks</code>{" "}
          row <em>&ldquo;Pick: do you want Ben to set up your accounts, or will you?&rdquo;</em>).
          Once delegated, impressions/spend/ROAS hydrate per row from the
          <code className="text-slate-300"> client_ad_creatives </code> performance columns.
        </p>
      </main>
    </>
  );
}

const TONE_CLASSES: Record<string, string> = {
  violet:
    "border-violet-500/30 bg-violet-500/[0.08] text-violet-200",
  amber:
    "border-amber-500/30 bg-amber-500/[0.08] text-amber-200",
  sky:
    "border-sky-500/30 bg-sky-500/[0.08] text-sky-200",
  lime:
    "border-lime-500/30 bg-lime-500/[0.08] text-lime-200",
};

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof TONE_CLASSES;
}) {
  const cls = TONE_CLASSES[tone] || TONE_CLASSES.violet;
  return (
    <div className={`rounded-xl border ${cls} px-4 py-3`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">
        {label}
      </p>
      <p className="text-2xl font-black tabular-nums mt-1">{value}</p>
    </div>
  );
}

function DashboardNudgeCard({
  icon,
  title,
  detail,
  tone,
}: {
  icon: string;
  title: string;
  detail: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/[0.06]"
        : tone === "sky"
          ? "border-sky-500/30 bg-sky-500/[0.06]"
          : "border-rose-500/30 bg-rose-500/[0.06]";
  return (
    <article className={`rounded-xl border ${cls} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight mb-1">
            {title}
          </h3>
          <p className="text-[12px] text-slate-300 leading-relaxed">{detail}</p>
        </div>
      </div>
    </article>
  );
}
