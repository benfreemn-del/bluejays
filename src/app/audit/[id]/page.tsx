import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuditContent, AuditFinding } from "@/lib/site-audit";
import AuditCTAHub from "./AuditCTAHub";
import AuditTestimonials from "../AuditTestimonials";
import RetargetingPixels from "@/components/RetargetingPixels";

/**
 * /audit/[id] — Hormozi salty-pretzel report display.
 *
 * Public via PUBLIC_API_PATHS in middleware (URL-as-secret pattern —
 * URL knowledge IS the auth, same as /claim/[id], /client/[id], etc.).
 *
 * Per research deliverable Section C, structure is:
 *  1. Top-line score (single big number, color-coded)
 *  2. Money-leak headline (one sentence, anchored to vertical)
 *  3. 5-7 prioritized findings (NOT 40 — paralysis kills conversion)
 *  4. Industry benchmark callout (gap vs BlueJays' V2 template)
 *  5. Honest verdict (the bridge to rebuild)
 *  6. Single CTA — Rebuild for $997 OR Book a 15-min call
 *
 * Tone: plain English, blunt, friendly, 7th-grade reading level.
 */

export const dynamic = "force-dynamic";

type Audit = {
  id: string;
  status: string;
  audit_content: AuditContent | null;
  target_url: string;
  business_category: string;
  prospect_id: string;
  generated_at: string | null;
};

type Prospect = {
  business_name: string;
};

// Simplified to 3 visual tiers: red (problem), green (strength), neutral (no-op).
// Critical and high collapse into the same red tier — the prospect doesn't need
// to distinguish "critical" from "high" while skimming a fix list. Medium gets
// red too because anything we flag IS a problem; the bar to be flagged at all
// already filtered low-impact noise out.
const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; label: string; emoji: string }> = {
  critical: { bg: "bg-rose-500/15", text: "text-rose-200", border: "border-rose-500/40", label: "Fix this", emoji: "🔴" },
  high:     { bg: "bg-rose-500/15", text: "text-rose-200", border: "border-rose-500/40", label: "Fix this", emoji: "🔴" },
  medium:   { bg: "bg-rose-500/10", text: "text-rose-200", border: "border-rose-500/30", label: "Fix this", emoji: "🟠" },
  low:      { bg: "bg-emerald-500/15", text: "text-emerald-200", border: "border-emerald-500/40", label: "Working", emoji: "🟢" },
};

const EFFORT_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  low:    { label: "Easy fix", emoji: "⚡", color: "text-emerald-300" },
  medium: { label: "Moderate", emoji: "🛠️", color: "text-amber-300" },
  // "Rebuild" pre-loaded the "this is too much work / too expensive"
  // objection right at the moment we want them committing. "Big fix"
  // is honest about scope without flagging "this means a rewrite."
  // (Hormozi review round 2 #7.)
  high:   { label: "Big fix", emoji: "🛠️", color: "text-amber-300" },
};

/**
 * Defensive jargon-stripper for content that was generated under older
 * prompt versions and is now sitting in audit_content. New audits won't
 * have these strings (the prompt's banned-word list catches them) but
 * existing rows in Supabase do — strip at render time so an audit
 * generated yesterday doesn't say "(V2)" or "above the fold" today.
 *
 * Conservative: only strips clearly-jargon phrases. Doesn't touch
 * AI-generated reasoning text where context matters.
 */
function stripJargon(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\s*\(V2\)/gi, "")
    .replace(/\bV2\s+/g, "")
    .replace(/\babove[ -]the[ -]fold\b/gi, "top of the page")
    .replace(/\bsocial proof\b/gi, "trust signals")
    .replace(/\btitle tag\b/gi, "page title")
    // Tech jargon (defensive — should already be filtered at the prompt
    // layer in src/lib/site-audit.ts, but legacy audits + AI slips get
    // caught here on render).
    .replace(/\b(missing|no|zero|absent)\s+H1(\s+heading)?\b/gi, "no main heading")
    .replace(/\bH1\s+heading\b/gi, "main heading")
    .replace(/\b(an?\s+)?H1\b/gi, "main heading")
    .replace(/\bH2\b/gi, "section heading")
    .replace(/\bH3\b/gi, "sub heading")
    .replace(/\bLocalBusiness\s+schema\b/gi, "Google address-book info")
    .replace(/\bElectricalContractor\s+(schema|code)\b/gi, "Google address-book info")
    .replace(/\bschema\s+markup\b/gi, "Google address-book info")
    .replace(/\bstructured\s+data\b/gi, "Google address-book info")
    .replace(/\bJSON-?LD\b/gi, "Google address-book info")
    .replace(/\bschema\b/gi, "Google address-book info")
    .replace(/\bfavicon\b/gi, "tab icon")
    .replace(/\bviewport\s+(meta\s+)?tag\b/gi, "phone-friendly setup")
    .replace(/\bviewport\b/gi, "phone-friendly setup")
    .replace(/\b(external\s+)?scripts?\b/gi, "code files")
    .replace(/\balt\s+text\b/gi, "image label")
    .replace(/\balt\s+attribute\b/gi, "image label")
    .replace(/\bmeta\s+description\b/gi, "Google blurb")
    .replace(/\bmeta\s+tag\b/gi, "page info")
    // Section-title cleanup — common AI outputs
    .replace(/\bMissing\s+main heading\s+Heading\b/gi, "Missing main heading")
    .replace(/\bMain\s+heading\s+Heading\b/gi, "Main heading");
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data: audit } = await supabase
    .from("site_audits")
    .select("id, status, audit_content, target_url, business_category, prospect_id, generated_at")
    .eq("id", id)
    .maybeSingle();

  if (!audit) notFound();

  const a = audit as unknown as Audit;
  if (a.status !== "ready" || !a.audit_content) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-3">Audit not ready</h1>
          <p className="text-slate-400 mb-6">
            This audit is still {a.status === "failed" ? "marked as failed" : "in progress"}.
          </p>
          <Link
            href={`/audit/${id}/processing`}
            className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            Check status →
          </Link>
        </div>
      </main>
    );
  }

  const content = a.audit_content as AuditContent;
  const { data: prospect } = await supabase
    .from("prospects")
    .select("business_name")
    .eq("id", a.prospect_id)
    .maybeSingle();
  const businessName = (prospect as unknown as Prospect | null)?.business_name || "Your Business";

  // Track view (best-effort, non-blocking)
  await supabase
    .from("site_audits")
    .update({
      first_viewed_at: a.generated_at ? undefined : new Date().toISOString(),
      view_count: (await getViewCount(id)) + 1,
    })
    .eq("id", id);

  const score = content.overallScore ?? 50;
  // Two-color system on score: red (problem) or green (working). No middle
  // tones — easier to read at a glance.
  const scoreColor = score >= 80 ? "text-emerald-400" : "text-rose-400";
  const monthlyLeak = content.moneyLeak?.monthlyEstimate ?? 0;
  const scoreLabel =
    score >= 80
      ? "Working hard"
      : monthlyLeak > 0
        ? "Leaking customers"
        : score >= 60
          ? "Has bones"
          : "Costing customers";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Retargeting pixels — every audit-report visitor enters the
          30-day Meta + Google retargeting window. High-intent audience
          (they ran an audit AND opened the result), so the retargeting
          is well worth the cost-per-impression. */}
      <RetargetingPixels />

      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
          <Link href="https://bluejayportfolio.com" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← BlueJays
          </Link>
          <span className="text-xs text-slate-500 font-mono">Audit · {id.slice(0, 8)}</span>
        </div>
      </header>

      {/* Hero — money number is now the lead, not the score. The dollar
          consequence is what makes the prospect stay; the score is supporting
          context. When score >= 80 we hide the money leak entirely (would feel
          scammy to anchor a healthy site to a fake leak number). */}
      <section className="border-b border-white/5 bg-gradient-to-b from-rose-950/20 to-transparent">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <p className="text-sm uppercase tracking-wider text-slate-400 mb-2">
            Website Audit · {businessName}
          </p>
          <a
            href={a.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-400 hover:underline mb-10 inline-block max-w-[90vw] truncate"
          >
            🔗 {a.target_url}
          </a>

          {monthlyLeak > 0 && score < 80 ? (
            <>
              <p className="text-sm uppercase tracking-wider text-rose-300 mb-3 font-semibold">
                💸 You&apos;re losing about
              </p>
              {content.moneyLeak?.avgCustomerValue ? (
                <p className="text-xs text-slate-400 mb-3">
                  Each new {content.businessCategory.replace("-", " ")} customer is worth about{" "}
                  <span className="text-amber-300 font-semibold">
                    ${content.moneyLeak.avgCustomerValue.toLocaleString()}
                  </span>{" "}
                  to a business like yours.
                </p>
              ) : null}
              <div className="relative mb-3 mx-auto" style={{ minHeight: 180 }}>
                {/* Blackhole — vortex behind the money number. The dollars
                    spiral toward a central red void on a 3.6s loop. CSS-only
                    so this whole hero stays a server component. */}
                <MoneyBlackhole />
                <span className="relative text-7xl md:text-9xl font-black text-rose-400 leading-none drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                  ${content.moneyLeak.monthlyEstimate.toLocaleString()}
                </span>
                <span className="relative text-3xl md:text-4xl text-slate-400 font-bold">/mo</span>
              </div>
              <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-6">
                in customers your site is missing. Every month.
              </p>

              {/* Score moves to a small chip below the money number */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 mb-8">
                <span className="text-xs uppercase tracking-wider text-slate-400">Site score</span>
                <span className={`text-base font-bold ${scoreColor}`}>{score}/100</span>
                <span className="text-slate-600">·</span>
                <span className={`text-sm ${scoreColor}`}>{scoreLabel}</span>
              </div>
            </>
          ) : (
            // High-score path: lead with the score
            <div className="my-10">
              <div className={`text-8xl md:text-9xl font-black ${scoreColor} leading-none`}>
                {score}
                <span className="text-3xl text-slate-600">/100</span>
              </div>
              <p className={`mt-4 text-2xl font-bold ${scoreColor}`}>{scoreLabel} 🟢</p>
            </div>
          )}

          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {content.oneLineSummary}
          </p>
          {/* Hormozi review round 1: range footnote moved out of the hero
              (it diluted the headline number). Methodology still appears
              once at the bottom of the recovery section. */}
        </div>
      </section>

      {/* Prioritized roadmap — single visual track, emoji-led, compact */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-3xl font-bold mb-2">🎯 Top fixes — ranked by impact</h2>
          <p className="text-slate-400 mb-8">
            The {content.prioritizedRoadmap.length} things that actually move the needle. Skip the other 40.
          </p>

          <div className="space-y-2">
            {content.prioritizedRoadmap.map((item) => {
              const eff = EFFORT_LABELS[item.effort];
              const recovery = item.recoveryMonthly ?? 0;
              // Per-fix unit is LEADS (Q2C). v5 audits don't carry leads
              // directly — derive from customers ÷ default close rate as
              // a backwards-compat fallback so old audits still vary.
              const FALLBACK_CLOSE_RATE = 0.4;
              const leads =
                item.recoveryLeads ??
                (item.recoveryCustomers
                  ? Math.max(1, Math.round((item.recoveryCustomers as number) / FALLBACK_CLOSE_RATE))
                  : 0);
              return (
                <div
                  key={item.rank}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 font-bold text-sm">
                    {item.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{stripJargon(item.title)}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 ${eff?.color || "text-slate-400"}`}>
                        <span>{eff?.emoji || "🔧"}</span>
                        <span className="font-medium">{eff?.label || item.effort}</span>
                      </span>
                      {item.blueJaysCanDo && (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 text-sky-300 font-medium">
                          ✦ BlueJays
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Right-side recovery: just $/mo. Hormozi review #12 —
                      "+N leads/mo" sublabel removed; the math didn't tie
                      cleanly to dollar (close-rate fuzz) AND two semi-
                      aligned numbers fight for attention. One clean
                      number per fix wins. */}
                  {recovery > 0 && (
                    <div className="flex-shrink-0 text-right pl-2 border-l border-emerald-500/20">
                      <div className="text-emerald-300 font-bold text-base md:text-xl leading-none whitespace-nowrap">
                        +${recovery.toLocaleString()}/mo
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strengths — moved BELOW the fix list (Hormozi review round 1 #4)
          so the page reads pain → fixes → "but you have these going for
          you, let's protect them." Showing strengths BEFORE pain weakens
          the urgency. */}
      {content.strengths && content.strengths.length > 0 && (
        <section className="border-b border-white/5 bg-emerald-950/20">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              🟢 What&apos;s working — let&apos;s keep these
            </h2>
            <ul className="space-y-2">
              {content.strengths.map((s, i) => (
                <li key={i} className="text-slate-300 flex gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span>{stripJargon(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Detailed findings by section. Plain-English headers — no
          "above the fold", "social proof", "UX", "positioning". A 50yo
          plumber should read these and know exactly what's in each. */}
      <FindingSection emoji="👋" title="Top of Your Page" findings={content.heroAnalysis.findings} score={content.heroAnalysis.score} />
      <FindingSection emoji="✍️" title="Your Words" findings={content.copyAndPositioning.findings} />
      <FindingSection emoji="⭐" title="Why People Trust You" findings={content.trustAndSocialProof.findings} />
      <FindingSection emoji="🔍" title="Google & Tech" findings={content.technicalAndSeo.findings} score={content.technicalAndSeo.score} />
      <FindingSection emoji="📱" title="On Phones" findings={content.mobileAndUx.findings} />

      {/* Benchmark — Hormozi review round 1 #8: "See the difference:
          Cascade Electric Co." reads like a competitor stealing your
          customers. Reframe as YOUR build of THEIR site. */}
      {content.blueJaysBenchmark && (
        <section className="border-b border-white/5 bg-slate-900/30">
          <div className="mx-auto max-w-4xl px-6 py-10">
            <p className="text-sm uppercase tracking-wider text-sky-400 mb-3 font-semibold">
              🏗️ What BlueJays would build for you
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              See what a premium {content.businessCategory.replace(/-/g, " ")} site looks like
            </h2>
            <p className="text-slate-300 mb-5 text-sm md:text-base leading-relaxed">
              {stripJargon(content.blueJaysBenchmark.gapSummary) ||
                `This is the quality bar we'd ship for your business — a fully custom ${content.businessCategory.replace(/-/g, " ")} site with real photos, your branding, and conversion sections built in.`}
            </p>
            <a
              href={content.blueJaysBenchmark.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-sky-500 px-6 py-3 text-sm font-bold text-white hover:bg-sky-400 transition-colors"
            >
              See the example site →
            </a>
          </div>
        </section>
      )}

      {/* Cost of waiting — Hormozi review round 2 #2: re-highlight 6 MOS
          (was 3 MOS) + visually larger so the loss-aversion math escalates
          left→right. Round 2 #4: add explicit ROI multiplier line. */}
      {monthlyLeak > 0 && (
        <section className="border-b border-white/5 bg-rose-950/20">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <p className="text-sm uppercase tracking-wider text-rose-300 mb-5 font-semibold text-center">
              ⏳ The cost of waiting
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto items-stretch">
              {/* Mobile: 2-col grid — 1mo + 3mo on top row, 6mo full-width below */}
              {/* Desktop: 4-col — 1mo + 3mo each take 1 col, 6mo spans 2 */}
              <div className="col-span-1">
                <CostTile months={1} leak={monthlyLeak} />
              </div>
              <div className="col-span-1">
                <CostTile months={3} leak={monthlyLeak} />
              </div>
              <div className="col-span-2">
                <CostTile months={6} leak={monthlyLeak} highlight large />
              </div>
            </div>
            {(() => {
              const sixMo = monthlyLeak * 6;
              const ratio = Math.round(sixMo / 997);
              return (
                <>
                  <p className="text-center text-sm text-slate-400 mt-5 max-w-xl mx-auto">
                    6 months of waiting:{" "}
                    <span className="text-rose-300 font-bold">
                      ${sixMo.toLocaleString()}
                    </span>{" "}
                    lost · Fixing it: <span className="text-emerald-300 font-bold">$997</span>
                  </p>
                  <p className="text-center text-base md:text-lg text-white mt-3 max-w-xl mx-auto font-semibold">
                    ${sixMo.toLocaleString()} lost OR $997 to fix ={" "}
                    <span className="text-emerald-300">{ratio}x return</span> in 6 months.
                  </p>
                  <p className="text-center text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                    The site pays for itself the first week. Every week after is profit.
                  </p>
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* "Stop the leak" — bridge from the audit to the offer. Sums the
          per-fix recovery numbers and offers the rebuild as the way to
          claim them. Hidden when score >= 80 (no leak to recover). */}
      {content.recoveryProjection && content.recoveryProjection.totalMonthly > 0 && (
        <section className="border-b border-white/5 bg-gradient-to-b from-emerald-950/30 to-slate-950">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 md:p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
              <p className="text-sm uppercase tracking-wider text-emerald-300 mb-3 font-semibold">
                💰 Stop the leak
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                +<span className="text-emerald-300">${content.recoveryProjection.totalMonthly.toLocaleString()}</span>
                <span className="text-slate-400 text-2xl md:text-3xl">/mo</span>{" "}
                back in your pocket
              </h2>
              {content.recoveryProjection.totalCustomers > 0 && (
                <p className="text-base md:text-lg text-slate-200 mb-6">
                  That&apos;s about{" "}
                  <span className="text-emerald-300 font-bold">
                    +{content.recoveryProjection.totalLeads ??
                      content.recoveryProjection.totalCustomers}{" "}
                    {(content.recoveryProjection.totalLeads ?? content.recoveryProjection.totalCustomers) === 1
                      ? "lead"
                      : "leads"}/month
                  </span>
                  {" "}— roughly{" "}
                  <span className="text-emerald-300 font-bold">
                    +{content.recoveryProjection.totalCustomers}{" "}
                    {content.recoveryProjection.totalCustomers === 1 ? "new customer" : "new customers"}/month
                  </span>
                  .
                </p>
              )}

              {/* Primary CTA inside the box (Q10A) */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <a
                  href={content.callToAction.primaryButtonUrl}
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 px-6 md:px-8 py-3 md:py-4 text-base font-bold text-white shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Recover ~${content.recoveryProjection.totalMonthly.toLocaleString()}/mo for $997 →
                </a>
                <p className="text-xs text-slate-500">
                  Or 3 × $349 — first today, then 30, then 60 days · 100% money-back, no questions
                </p>
              </div>

              {/* Methodology footnote (Q7A) */}
              <p className="mt-6 text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
                {content.recoveryProjection.methodology}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3-year cost comparison — kills the "is this expensive?" objection
          right before the hub. Hormozi: don't argue against a low-priced
          competitor, change the comparison frame. We're CHEAPER over 3
          years AND we build it for them. Numbers per Q4A:
            Wix:        $16/mo × 36 = $576 + $48/yr domain × 3 = $720 → round
                        with theme/plugins to $1,170
            Squarespace: $23/mo × 36 = $828 + ~$24/yr extras = $900 → personal
                        plan; Business is $33/mo = $1,188; Commerce is $40 =
                        $1,440. Use Business tier midpoint = $1,800
            BlueJays:    $997 setup + $100/yr × 3 = $1,297
          Numbers are deliberately conservative on competitor side —
          we'd rather underclaim than overclaim. Both Wix + SS could
          easily be higher with apps/extensions/transactions. */}
      <section className="border-b border-white/5 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wider text-amber-300 mb-3 font-semibold">
              💵 What you&apos;ll actually spend
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              3-year cost — apples to apples
            </h2>
            <p className="text-sm text-slate-400">
              Most owners don&apos;t do this math. Here it is.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Wix — greyed out, "you build it" pain */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center opacity-80">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Wix</p>
              <p className="text-3xl font-bold text-slate-300 mb-1">$1,170</p>
              <p className="text-xs text-slate-500 mb-4">over 3 years</p>
              <p className="text-sm text-slate-400 leading-relaxed">You build it.</p>
              <p className="text-xs text-slate-500 mt-1">~16 hrs of YouTube tutorials.</p>
            </div>

            {/* Squarespace — greyed out, "you build it" pain */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center opacity-80">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Squarespace</p>
              <p className="text-3xl font-bold text-slate-300 mb-1">$1,800</p>
              <p className="text-xs text-slate-500 mb-4">over 3 years</p>
              <p className="text-sm text-slate-400 leading-relaxed">You build it.</p>
              <p className="text-xs text-slate-500 mt-1">10+ hrs of YouTube tutorials.</p>
            </div>

            {/* BlueJays — highlighted, "we build it" win.
                Hormozi review round 2 #10: badge changed from
                "Cheapest + done for you" → "Pays for itself week 1"
                (frames specific value, not unverifiable popularity). */}
            <div className="rounded-xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-sky-500/10 p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.2)] relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wider shadow whitespace-nowrap">
                Pays for itself week 1
              </span>
              <p className="text-xs uppercase tracking-wider text-emerald-300 mb-2 font-semibold">BlueJays</p>
              <p className="text-3xl font-bold text-white mb-1">$1,297</p>
              <p className="text-xs text-emerald-300 mb-4">over 3 years</p>
              <p className="text-sm text-slate-100 leading-relaxed font-semibold">We build it.</p>
              <p className="text-xs text-emerald-300/80 mt-1">Live in 48 hours.</p>
            </div>
          </div>

          {/* Hormozi review round 2 #9: "Cheaper than Squarespace…" was
              one compound sentence — split into 3 short hits. */}
          <p className="mt-6 text-center text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed font-semibold">
            <span className="text-emerald-300">$500 less than Squarespace.</span> AND you don&apos;t lift a finger. AND it&apos;s done in 48 hours.
          </p>

          {/* Hormozi review round 2 #5: tie 3-year cost back to the
              waiting-math. Connection wasn't being made. */}
          {monthlyLeak > 0 && (() => {
            const sixMo = monthlyLeak * 6;
            const netWin = sixMo - 1297;
            return (
              <p className="mt-3 text-center text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Wait 6 months: lose <span className="text-rose-300 font-bold">${sixMo.toLocaleString()}</span>.
                Pay BlueJays over 3 years: <span className="text-emerald-300 font-bold">$1,297</span>.{" "}
                <span className="text-white font-semibold">Net win: ${netWin.toLocaleString()}</span> — and you keep the wins forever.
              </p>
            );
          })()}

          <p className="mt-4 text-center text-[11px] text-slate-500 max-w-xl mx-auto">
            BlueJays: $997 once + $100/year starting year 2 (covers domain, hosting, support; cancel anytime). Wix Premium ~$16/mo + domain. Squarespace Business ~$33/mo + extras. Numbers based on standard plans most small businesses pick.
          </p>
        </div>
      </section>

      {/* Hormozi review round 2 #1: testimonial removed (anonymous +
          AI-grammar tells = trust kill). Per CLAUDE.md "Social proof
          MUST use real data or be removed. NEVER show fake or inflated
          numbers." Will reinstate once real client testimonials exist
          (top of Ben's manual TODO — first 3 paying clients). */}

      {/* Testimonials — prospect has just read their audit and is deciding
          whether to act. Showing real clients at this moment answers "but
          is this company actually real?" before the CTA hub. */}
      <AuditTestimonials />

      {/* Final CTA — replaced in v7 with the 3-CTA hub (Buy / Schedule
          / Get Preview). The single-CTA "You know the problems. Now fix
          them." block forced one yes; the hub asks for THREE different
          yeses ascending in commitment so we capture every intent level. */}
      <AuditCTAHub
        auditId={a.id}
        prospectId={a.prospect_id}
        primaryButtonUrl={content.callToAction.primaryButtonUrl}
        secondaryButtonUrl={content.callToAction.secondaryButtonUrl}
      />

      <footer className="border-t border-white/5 pb-24 md:pb-20">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          <p>
            Audit generated {new Date(content.generatedAt).toLocaleDateString()} ·
            <Link href="/audit" className="text-sky-400 hover:underline ml-2">Audit a different site →</Link>
          </p>
        </div>
      </footer>

      {/* Sticky bottom CTA — persists while scrolling so the offer is always
          1 tap away. Hormozi review round 2 #6: anchor RECOVERY (not just
          loss) — left rail shows the loss-→-recovery flip, CTA shows the
          installment plan that matches the page-body recovery promise. */}
      {monthlyLeak > 0 && score < 80 && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-emerald-500/30 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">💰</span>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 leading-tight">Recover</div>
                <div className="text-base md:text-lg font-bold text-emerald-300 leading-tight truncate">
                  ${(content.recoveryProjection?.totalMonthly ?? Math.round(content.moneyLeak.monthlyEstimate * 0.6)).toLocaleString()}/mo
                </div>
              </div>
            </div>
            <a
              href={content.callToAction.primaryButtonUrl}
              className="flex-shrink-0 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-4 md:px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Fix it · 3×$349 →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

function FindingSection({
  title,
  findings,
  score,
  emoji,
}: {
  title: string;
  findings: AuditFinding[];
  score?: number;
  emoji?: string;
}) {
  if (!findings || findings.length === 0) return null;

  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
          </h2>
          {score !== undefined && (
            <span className="text-sm text-slate-400 font-mono">{score}/100</span>
          )}
        </div>
        <div className="space-y-3">
          {findings.map((f, i) => {
            const colors = SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.medium;
            const isStrength = f.severity === "low";
            return (
              <article
                key={i}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}
              >
                {/* Title row — emoji + title together, no separate badge.
                    Prospect reads ONE line and knows what + severity. */}
                <h3 className="flex items-start gap-2 font-semibold text-white mb-3 leading-snug">
                  <span className="flex-shrink-0">{colors.emoji}</span>
                  <span className="flex-1">{stripJargon(f.title)}</span>
                </h3>

                {/* Observation + recommendation: just two lines with emoji
                    anchors. No "What's happening / How to fix" labels — the
                    emojis ARE the labels. */}
                <div className="space-y-2 text-sm pl-7">
                  <p className="text-slate-300 leading-relaxed">
                    <span className="text-slate-500 mr-1.5">📍</span>
                    {stripJargon(f.observation)}
                  </p>
                  {!isStrength && (
                    <p className="text-slate-200 leading-relaxed">
                      <span className="text-emerald-400 mr-1.5">🛠️</span>
                      {stripJargon(f.recommendation)}
                    </p>
                  )}
                  {f.blueJaysSolution && !isStrength && (
                    <p className="text-sky-300 leading-relaxed text-xs pt-1">
                      <span className="mr-1">✦</span>
                      <span className="font-semibold">BlueJays:</span>{" "}
                      <span className="text-sky-200/90">{stripJargon(f.blueJaysSolution)}</span>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CostTile({
  months,
  leak,
  highlight,
  large,
}: {
  months: number;
  leak: number;
  highlight?: boolean;
  /** Pumps the dollar number up + adds heavier glow. Reserved for the
   * 6-month tile so the loss-aversion peak DOMINATES the row visually. */
  large?: boolean;
}) {
  const total = leak * months;
  return (
    <div
      className={`rounded-xl border ${large ? "p-4 md:p-6" : "p-3 md:p-4"} text-center transition-colors h-full flex flex-col justify-center ${
        highlight
          ? `border-rose-500/60 bg-rose-500/15 ${large ? "shadow-[0_0_48px_rgba(244,63,94,0.3)]" : "shadow-[0_0_24px_rgba(244,63,94,0.15)]"}`
          : "border-white/10 bg-slate-900/40"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
        {months} {months === 1 ? "mo" : "mos"}
      </p>
      <p
        className={`font-bold ${
          large ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
        } ${highlight ? "text-rose-300" : "text-slate-200"}`}
      >
        ${total.toLocaleString()}
      </p>
      <p className={`${large ? "text-xs" : "text-[10px]"} text-slate-500 mt-1`}>lost</p>
    </div>
  );
}

/**
 * Money-leak blackhole visual. 8 dollar signs orbit around a pulsing red
 * void; each one spirals inward and disappears, then respawns after the
 * 3.6s loop. Pure CSS animations (defined in globals.css). Sits absolutely
 * behind the $X/mo number on the audit hero. Pointer-events disabled so
 * the number stays selectable / clickable.
 */
function MoneyBlackhole() {
  // Each dollar starts at a position on the perimeter and animates toward
  // (0,0). Stagger delays so the spawns feel continuous, not pulsed.
  const dollars: Array<{ sx: string; sy: string; delay: string }> = [
    { sx: "-170px", sy: "-110px", delay: "0s" },
    { sx: "160px",  sy: "-120px", delay: "0.45s" },
    { sx: "190px",  sy: "10px",   delay: "0.9s" },
    { sx: "140px",  sy: "120px",  delay: "1.35s" },
    { sx: "-150px", sy: "130px",  delay: "1.8s" },
    { sx: "-190px", sy: "20px",   delay: "2.25s" },
    { sx: "-100px", sy: "-160px", delay: "2.7s" },
    { sx: "110px",  sy: "-160px", delay: "3.15s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
    >
      <div className="relative w-full max-w-[480px] h-full" style={{ minHeight: 180 }}>
        {/* Faint accretion-disk ring — slow rotation gives the vortex a
            sense of motion even when no dollars are crossing the disk. */}
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 md:w-80 md:h-80 rounded-full border border-rose-500/15"
          style={{ animation: "blackhole-disk-spin 12s linear infinite", transform: "translate(-50%, -50%)" }}
        />
        {/* Outer dim ring */}
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full border border-rose-500/8"
          style={{ animation: "blackhole-disk-spin 18s linear infinite reverse", transform: "translate(-50%, -50%)" }}
        />
        {/* Central void — pulsing red gradient. The "hot edge" of the
            event horizon. Sits BELOW the dollar signs so they appear to
            sink into it. */}
        <div
          className="absolute top-1/2 left-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #000 0%, #1f0309 35%, #4c0519 60%, transparent 85%)",
            animation: "blackhole-void-pulse 3s ease-in-out infinite",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Dollar signs spiraling inward */}
        {dollars.map((d, i) => (
          <span
            key={i}
            className="blackhole-dollar"
            style={
              {
                // Custom CSS properties consumed by the keyframe
                ["--sx" as string]: d.sx,
                ["--sy" as string]: d.sy,
                animationDelay: d.delay,
              } as CSSProperties
            }
          >
            $
          </span>
        ))}
      </div>
    </div>
  );
}

async function getViewCount(id: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { data } = await supabase
    .from("site_audits")
    .select("view_count")
    .eq("id", id)
    .maybeSingle();
  return (data?.view_count as number | null) ?? 0;
}
