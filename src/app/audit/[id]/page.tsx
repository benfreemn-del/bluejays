import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuditContent, AuditFinding } from "@/lib/site-audit";
import RetargetingPixels from "@/components/RetargetingPixels";
import PartnerRefCapture from "@/components/PartnerRefCapture";
import ProductAuditVideoBlock from "./ProductAuditVideoBlock";
import AuditFaqVideos from "./AuditFaqVideos";
import AuditCTAHub from "./AuditCTAHub";
import StickyBookCallPill from "./StickyBookCallPill";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

/**
 * /audit/[id] — Product Audit Results (Phase 3 of the 2026-05-15
 * product-audit rebuild).
 *
 * Simpler than the legacy website-audit report: emphasizes the
 * TOP 5 biggest fixes, recaps the 4 reasons from the landing, and
 * folds everything else under a scroll-to-see ranked list. The
 * video block at the top runs a 2-min Ben pitch + auto-handoffs
 * to a Calendly embed when the video ends (BAM-FAM, Hormozi).
 *
 * Old report layout preserved verbatim at /audit-classic/[id]
 * (Phase 1 duplicate, internal paths rewritten).
 *
 * Public via PUBLIC_API_PATHS — URL-as-secret pattern.
 */

export const dynamic = "force-dynamic";

const CALENDLY_URL =
  process.env.AGENCY_CALENDLY_URL ||
  process.env.GROWTH_ENGINE_CALENDLY_URL ||
  "https://calendly.com/benfreeman-bluejayportfolio/30min";

type Audit = {
  id: string;
  status: string;
  audit_content: AuditContent | null;
  target_url: string;
  business_category: string;
  prospect_id: string;
  generated_at: string | null;
  first_viewed_at: string | null;
};

type Prospect = { business_name: string };

const FOUR_REASONS_RECAP = [
  { n: 1, accent: "rose", title: "Your product page is a brochure, not a buy-button." },
  { n: 2, accent: "amber", title: "Your distributor owns the customer relationship — you don't." },
  { n: 3, accent: "sky", title: "You can't retarget the people who almost bought." },
  { n: 4, accent: "violet", title: "Your funnel doesn't speak to the buyer who actually decides." },
] as const;

const RECAP_RING: Record<string, string> = {
  rose: "border-rose-500/30 bg-rose-500/[0.04] text-rose-300",
  amber: "border-amber-500/30 bg-amber-500/[0.04] text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/[0.04] text-sky-300",
  violet: "border-violet-500/30 bg-violet-500/[0.04] text-violet-300",
};

async function getViewCount(id: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { data } = await supabase
    .from("site_audits")
    .select("view_count")
    .eq("id", id)
    .maybeSingle();
  return ((data as { view_count?: number } | null)?.view_count ?? 0) as number;
}

export default async function ProductAuditResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data: audit } = await supabase
    .from("site_audits")
    .select(
      "id, status, audit_content, target_url, business_category, prospect_id, generated_at, first_viewed_at",
    )
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
  const businessName = (prospect as unknown as Prospect | null)?.business_name || "Your Product";

  // Track view (best-effort, non-blocking)
  await supabase
    .from("site_audits")
    .update({
      first_viewed_at: a.first_viewed_at ? undefined : new Date().toISOString(),
      view_count: (await getViewCount(id)) + 1,
    })
    .eq("id", id);

  // Top 5 fixes — pulled from the pre-ranked prioritizedRoadmap.
  // If the audit only generated 3 fixes (small site), we show what's
  // there; no padding with fake items.
  const top5 = (content.prioritizedRoadmap || []).slice(0, 5);

  // Everything else — the rest of the prioritized roadmap + every
  // section finding that wasn't already in the top-5 highlight cards.
  // Flattened into a single ranked list so the scroll-to-see surface
  // is one coherent list, not 7 sub-sections.
  const restRoadmap = (content.prioritizedRoadmap || []).slice(5);
  const allSectionFindings: Array<{ section: string; finding: AuditFinding }> = [];
  for (const [section, value] of Object.entries(content)) {
    if (typeof value !== "object" || value === null) continue;
    const findings = (value as { findings?: AuditFinding[] }).findings;
    if (!Array.isArray(findings)) continue;
    for (const f of findings) {
      allSectionFindings.push({ section, finding: f });
    }
  }

  const score = content.overallScore ?? 50;
  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
  const scoreBadge =
    score >= 80
      ? "Working well"
      : score >= 50
        ? "Has leaks"
        : "Leaking hard";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <RetargetingPixels />
      <PartnerRefCapture />
      {/* Sticky bottom-right "Book my call" pill — fights the 5-decision
          gap between peak score-reveal emotion and the Calendly handoff
          at the bottom of the page. Auto-hides when AuditCTAHub
          (id="pick-your-move") scrolls into view to avoid double-CTA. */}
      <StickyBookCallPill
        scheduleUrl={`/schedule/${a.prospect_id}?type=fullsystem&source=audit-pill`}
      />

      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href={SITE_ORIGIN}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            {id.slice(0, 8)}
          </span>
        </div>
      </header>

      {/* ── HERO STRIP ─────────────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-gradient-to-b from-amber-950/20 to-transparent">
        <div className="mx-auto max-w-4xl px-6 py-10 md:py-14 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            Product Audit · {businessName}
          </p>
          <a
            href={a.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-400 hover:underline inline-block max-w-[90vw] truncate mb-6"
          >
            🔗 {a.target_url}
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-3">
            <div>
              <span className={`text-5xl md:text-6xl font-black tabular-nums ${scoreColor}`}>
                {score}
              </span>
              <span className="text-2xl md:text-3xl text-slate-500 font-bold">/100</span>
            </div>
            <span className={`text-sm font-bold uppercase tracking-wider ${scoreColor}`}>
              {scoreBadge}
            </span>
          </div>
          {content.oneLineSummary && (
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {content.oneLineSummary}
            </p>
          )}
        </div>
      </section>

      {/* ── VIDEO + CALENDAR HANDOFF ───────────────────────────────── */}
      {/* Server-side check: pass videoSrc only when the file actually
          exists on disk. The component renders a clean "video coming
          soon" fallback when videoSrc is falsy — replaces the broken
          <video> player we saw in the 2026-05-15 live review. Auto-
          enables when Ben drops the file at the expected path; no
          code changes required. */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
          <ProductAuditVideoBlock
            calendlyUrl={CALENDLY_URL}
            aspect="vertical"
            // VSL #2 — phone-recorded 9:16 selfie at /public/audit-assets/vsl-2.mp4.
            // Always wire the path; do NOT existsSync at runtime — that would
            // make Next's NFT tracer bundle the ENTIRE /public/ directory into
            // every serverless function that shares a chunk with this page,
            // blowing past the 250 MB function size cap (cost us 5 failed
            // deploys on 2026-05-16 before we found the diagnostic). If the
            // file is missing, the <video> element gets a 404 on src and the
            // component's `videoMissing` state fallback kicks in cleanly.
            videoSrc="/audit-assets/vsl-2.mp4"
          />
        </div>
      </section>

      {/* ── PRE-CALL FAQ VIDEOS (top-5 objection layer) ────────────
          116-Funnels chunk 13a — confirmation-page 60-second FAQ
          videos handle the top objections BEFORE the prospect hits
          Calendly. Quoted "up to 40% show-rate lift." Renders 5
          accordion cards with script fallback until Loom URLs land
          in `src/lib/audit-faq-data.ts`. Recording protocol +
          scripts in `docs/playbooks/audit-faq-videos.md`. */}
      <AuditFaqVideos />

      {/* ── TOP 5 BIGGEST THINGS ───────────────────────────────────── */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-2">
              Top 5 biggest things to fix
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Fix these first.
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Ranked by dollar impact. Everything else is below.
            </p>
          </div>

          {top5.length === 0 ? (
            <p className="text-center text-slate-400 italic">
              No fixes to surface — your product page is in great shape.
            </p>
          ) : (
            <div className="space-y-4">
              {top5.map((fix, i) => (
                <div
                  key={fix.rank}
                  className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/[0.06] to-transparent p-5 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-300 text-xl font-black">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-white leading-snug mb-2">
                        {fix.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                          Impact: {fix.impact}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300">
                          Effort: {fix.effort}
                        </span>
                        {fix.recoveryMonthly > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            +${fix.recoveryMonthly.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4 REASONS RECAP ────────────────────────────────────────── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              The 4 things every product brand gets wrong
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              Which of these is yours?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FOUR_REASONS_RECAP.map((r) => (
              <div
                key={r.n}
                className={`rounded-xl border ${RECAP_RING[r.accent]} p-4 flex items-start gap-3`}
              >
                <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 text-sm font-bold">
                  {r.n}
                </span>
                <p className="text-sm font-medium text-white leading-snug">
                  {r.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERYTHING ELSE — smaller, ranked, requires scroll ─────── */}
      <section className="border-b border-white/5 bg-slate-950/60">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Everything else
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-slate-200">
              The full ranked list
            </h2>
            <p className="text-slate-500 text-xs mt-2">
              Top 5 above. Rest below. Tackle them in order.
            </p>
          </div>

          {/* Remaining roadmap items (rank 6+) */}
          {restRoadmap.length > 0 && (
            <ol className="space-y-2 mb-8">
              {restRoadmap.map((fix, i) => (
                <li
                  key={fix.rank}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 flex items-start gap-3"
                >
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 text-xs font-bold text-slate-400">
                    {i + 6}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 leading-snug">
                      {fix.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Impact {fix.impact} · Effort {fix.effort}
                      {fix.recoveryMonthly > 0 && (
                        <> · +${fix.recoveryMonthly.toLocaleString()}/mo</>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Per-section findings — even smaller, one liner each */}
          {allSectionFindings.length > 0 && (
            <details className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <summary className="text-sm font-semibold text-slate-300 cursor-pointer">
                Section-by-section notes ({allSectionFindings.length})
              </summary>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                {allSectionFindings.map((row, i) => (
                  <li key={i} className="flex items-start gap-2 py-1">
                    <span className="flex-shrink-0 text-slate-600 text-[10px] uppercase tracking-wider mt-0.5">
                      {row.section.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-slate-300">{row.finding.title}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {restRoadmap.length === 0 && allSectionFindings.length === 0 && (
            <p className="text-center text-slate-500 text-sm italic">
              Nothing else to flag — top 5 covers everything.
            </p>
          )}
        </div>
      </section>

      {/* ── 3-FORK CTA HUB (#pick-your-move) ─────────────────────────
          Per redesigned funnel architecture (`bluejays-funnels.ts`
          inbound-audit D0 step 2): "CTA hub click — buy / schedule /
          preview fork chosen." This is the close surface that the
          AuditFaqVideos component scrolls to via #pick-your-move.

          Replaces the previous single-Calendly scarcity footer because
          AuditCTAHub is strictly broader: anchor card for $10,000 Full
          System (AI System path) + funnel-preview upsell + 3-fork grid
          (Buy / Schedule / Build me a preview) + trust badges. Aligns
          with Brunson stack-slide methodology (chunk 18+19 — show
          every commitment level, let prospect pick the highest one
          they're ready for) and Hormozi quick-win-front-end pattern
          (`reference_hormozi_offer_design.md`).

          Checkout URLs go through /claim/[prospectId] which handles
          Stripe session creation. Schedule fork goes through
          /schedule/[prospectId] which renders the Calendly embed. */}
      <AuditCTAHub
        auditId={a.id}
        prospectId={a.prospect_id}
        primaryButtonUrl={`/claim/${a.prospect_id}?plan=installment&source=audit`}
        secondaryButtonUrl={`/claim/${a.prospect_id}?plan=full&source=audit`}
      />

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500 space-y-2">
          <p className="text-slate-400 text-sm">
            — Ben, BlueJays ·{" "}
            <a href="mailto:ben@bluejayportfolio.com" className="text-sky-400 hover:underline">
              ben@bluejayportfolio.com
            </a>
          </p>
          <p>
            Audit generated {new Date(content.generatedAt).toLocaleDateString()} ·{" "}
            <Link href="/audit" className="text-sky-400 hover:underline">
              Audit a different product →
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
