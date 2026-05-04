"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClientHyperloopRun, ClientInsight } from "@/lib/client-hyperloop";
import type {
  ClientSubscription,
  SubscriptionService,
} from "@/lib/client-subscriptions";
import { TIERS } from "@/lib/client-subscriptions";

/**
 * /dashboard/clients/[slug]/insights
 *
 * Hyperloop variant analysis surfaced for the operator. Two panels:
 *
 *   1. Subscription panel — current Hyperloop + Claude subs, MRR,
 *      "upgrade" buttons that flip the client to a higher tier
 *   2. Insights panel — funnel-template winners/losers + ad-creative
 *      winners/losers, with "Run analysis" button (manual trigger)
 *
 * Run mode is determined by the active subscription tier:
 *   none / manual / weekly / daily
 *
 * Subscriptions tab makes it 1-click to upgrade a client to Pro / Elite,
 * which immediately changes the cron behavior (no deploy needed).
 */

type RunResult = ClientHyperloopRun & { mode: string; capabilities: string[] };

export default function InsightsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [subs, setSubs] = useState<ClientSubscription[]>([]);
  const [mrr, setMrr] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubs = useCallback(async () => {
    const r = await fetch(`/api/client-subscriptions?client=${slug}`);
    const j = (await r.json()) as {
      ok: boolean;
      subscriptions?: ClientSubscription[];
      mrr?: number;
    };
    if (j.ok) {
      setSubs(j.subscriptions ?? []);
      setMrr(j.mrr ?? 0);
    }
  }, [slug]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const runAnalysis = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/client-hyperloop/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ client: slug }),
      });
      const j = (await r.json()) as { ok: boolean; result?: RunResult; error?: string };
      if (j.ok && j.result) setResult(j.result);
      else setError(j.error || "Analysis failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setRunning(false);
    }
  };

  const updateSubscription = async (
    service: SubscriptionService,
    tier: string,
    managed_by: "bluejays" | "client",
  ) => {
    if (!confirm(`Switch ${service} to ${tier} (managed by ${managed_by})?`)) return;
    await fetch(`/api/client-subscriptions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_slug: slug,
        service,
        tier,
        managed_by,
        status: tier === "none" ? "cancelled" : "active",
      }),
    });
    loadSubs();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link href={`/dashboard/clients/${slug}`} className="text-slate-400 hover:text-white text-sm">
            ← Tasks
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1 truncate">
            {slug} <span className="text-slate-500 font-normal">/ insights</span>
          </h1>
          <button
            onClick={runAnalysis}
            disabled={running}
            className="text-[11px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-2.5 py-1 rounded disabled:opacity-50"
          >
            {running ? "Running…" : "Run analysis"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-24 space-y-8">
        {/* Subscription panel */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Subscriptions · ${mrr.toFixed(2)}/mo MRR
            </h2>
          </div>

          <div className="space-y-3">
            {(["hyperloop", "claude"] as SubscriptionService[]).map((service) => {
              const current = subs.find(
                (s) =>
                  s.service === service &&
                  (s.status === "active" || s.status === "trialing"),
              );
              return (
                <div
                  key={service}
                  className="border border-slate-800 bg-slate-900/40 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h3 className="font-bold capitalize">{service}</h3>
                    {current ? (
                      <>
                        <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          {current.tier}
                        </span>
                        <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {current.managed_by === "bluejays"
                            ? "BlueJays-managed"
                            : "Client-owned"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ${(current.monthly_price_usd ?? 0).toFixed(2)}/mo
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                        Not subscribed
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TIERS[service].map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() =>
                          updateSubscription(
                            service,
                            tier.id,
                            current?.managed_by ?? "bluejays",
                          )
                        }
                        disabled={current?.tier === tier.id}
                        className={`text-[10px] tracking-wider uppercase font-bold px-2 py-1 rounded transition ${
                          current?.tier === tier.id
                            ? "bg-emerald-500/20 text-emerald-300 cursor-default"
                            : "border border-slate-700 text-slate-400 hover:text-white"
                        }`}
                        title={tier.pitch}
                      >
                        {tier.label} · ${tier.monthlyPriceUsd}/mo
                      </button>
                    ))}
                  </div>
                  {current && current.managed_by === "bluejays" && (
                    <button
                      onClick={() =>
                        updateSubscription(service, current.tier, "client")
                      }
                      className="mt-2 text-[10px] text-amber-300 hover:text-amber-200 underline"
                    >
                      Mark as transitioned to client-owned
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Run result */}
        {error && (
          <div className="border border-rose-500/30 bg-rose-950/30 rounded-lg p-4 text-rose-300 text-sm">
            ⚠ {error}
          </div>
        )}

        {result && (
          <section>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Last analysis
              </h2>
              <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300">
                mode: {result.mode}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(result.ran_at).toLocaleString()}
              </span>
            </div>

            {result.mode === "none" && (
              <div className="border border-amber-500/30 bg-amber-950/20 rounded-lg p-4 text-amber-200 text-sm">
                <strong>Hyperloop is off for this client.</strong> Subscribe
                them to a Hyperloop tier above to enable variant analysis.
                The funnel + ads still run as-coded — no auto-optimization.
              </div>
            )}

            {result.mode !== "none" && result.insights.length === 0 && (
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4 text-slate-400 text-sm">
                No actionable insights yet — collect more send/conversion data first.
              </div>
            )}

            {result.insights.length > 0 && (
              <div className="space-y-2">
                {result.insights
                  .sort((a, b) =>
                    a.analysis.verdict === "winner" ? -1 :
                    a.analysis.verdict === "loser" ? 1 : 0)
                  .map((ins) => (
                    <InsightCard key={ins.variantId + ins.kind} insight={ins} />
                  ))}
              </div>
            )}
          </section>
        )}

        {!result && !running && (
          <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
            <div className="text-3xl mb-2">📊</div>
            <p>Hit <span className="text-violet-300 font-bold">Run analysis</span> to see funnel + ad winners.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function InsightCard({ insight }: { insight: ClientInsight }) {
  const verdict = insight.analysis.verdict;
  const color =
    verdict === "winner"
      ? "border-emerald-500/40 bg-emerald-950/20"
      : verdict === "loser"
        ? "border-rose-500/40 bg-rose-950/20"
        : "border-slate-800 bg-slate-900/40";
  const verdictColor =
    verdict === "winner"
      ? "bg-emerald-500/20 text-emerald-300"
      : verdict === "loser"
        ? "bg-rose-500/20 text-rose-300"
        : verdict === "insufficient_data"
          ? "bg-slate-700/40 text-slate-400"
          : "bg-blue-500/20 text-blue-300";
  return (
    <article className={`border rounded-lg p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
          {insight.kind}
        </span>
        <span
          className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${verdictColor}`}
        >
          {verdict.replace("_", " ")}
        </span>
      </div>
      <div className="text-[14px] font-bold tracking-tight mb-1">
        {insight.variantName}
      </div>
      <div className="text-[12px] text-slate-300 mb-2">{insight.headline}</div>
      <div className="text-[12px] text-slate-400 italic">
        → {insight.recommendation}
      </div>
    </article>
  );
}
