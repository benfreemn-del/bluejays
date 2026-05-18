"use client";

import { useEffect, useState } from "react";

import {
  formatAcos,
  formatMoney,
  getMockOptimizerPreview,
  type AmazonCampaign,
  type AmazonConnection,
} from "@/lib/amazon-ads";

/**
 * Amazon Ads optimizer status tile for indie author clients.
 *
 * Two render modes:
 *   - "pending" (no API connection yet) — explains what the optimizer
 *     will do, shows a plausible preview, links to the connect flow.
 *   - "live" — real campaigns + 7d performance + most recent decisions.
 *
 * Per CLAUDE.md "Amazon Ads Optimizer" pattern.
 */

export default function AmazonAdsTile({ slug }: { slug: string }) {
  const [connection, setConnection] = useState<AmazonConnection | null>(null);
  const [campaigns, setCampaigns] = useState<AmazonCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/clients/${slug}/amazon-ads`);
        const j = await r.json();
        if (j.ok) {
          setConnection(j.connection);
          setCampaigns(j.campaigns || []);
        }
      } catch {
        // mock-mode — no API yet
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const isLive = !!connection?.profile_id;
  const targetAcos = connection?.target_acos_pct ?? 30;
  const preview = !isLive ? getMockOptimizerPreview(targetAcos) : null;
  const showCampaigns = isLive ? campaigns : preview?.campaigns ?? [];
  const decisions = preview?.decisions ?? [];

  return (
    <section className="rounded-2xl border border-orange-500/25 bg-orange-950/15 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-orange-300">
            🅰️ Amazon Ads optimizer
          </p>
          <h3 className="text-base font-bold text-white mt-0.5">
            {isLive
              ? `Live · target ACoS ${formatAcos(targetAcos)}`
              : "Pending Amazon Ads API access"}
          </h3>
        </div>
        {!isLive && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-1 rounded">
            Preview · sample data
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {!isLive && (
            <div className="rounded-lg border border-orange-500/30 bg-slate-900/50 p-3 mb-3 text-xs text-slate-300 leading-relaxed">
              <p className="mb-1">
                <strong className="text-orange-200">
                  Once connected, the optimizer will:
                </strong>
              </p>
              <ul className="space-y-0.5 text-slate-300 ml-3">
                <li>• Pause keywords burning &gt; 2× target ACoS after 30+ clicks</li>
                <li>• Bid up keywords with ACoS &lt; 0.5× target after 5+ orders</li>
                <li>• Add common negatives weekly (auto campaigns)</li>
                <li>• Surface every decision in your Friday work-log digest</li>
              </ul>
              <p className="mt-2 text-orange-300/80">
                Amazon Ads API access takes about 2 weeks to provision.
                Ben starts the LWA / advertising-API request when you say
                go.
              </p>
            </div>
          )}

          {showCampaigns.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {showCampaigns.slice(0, 3).map((c) => {
                const acos = c.acos_7d_pct ?? 0;
                const tone =
                  acos > targetAcos * 1.5
                    ? "text-rose-300 bg-rose-500/[0.08] border-rose-500/30"
                    : acos < targetAcos * 0.6
                      ? "text-emerald-300 bg-emerald-500/[0.08] border-emerald-500/30"
                      : "text-amber-300 bg-amber-500/[0.08] border-amber-500/30";
                return (
                  <div
                    key={c.id}
                    className="rounded border border-slate-800 bg-slate-950/60 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {c.campaign_name}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {c.campaign_type.replace("_", " ")} ·{" "}
                          {c.orders_7d} orders / 7d
                        </p>
                      </div>
                      <span
                        className={`text-[10px] tabular-nums font-bold px-2 py-0.5 rounded border ${tone}`}
                      >
                        ACoS {formatAcos(c.acos_7d_pct)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>
                        Spend{" "}
                        <span className="text-slate-200 font-semibold tabular-nums">
                          {formatMoney(c.spend_7d_cents)}
                        </span>
                      </span>
                      <span>
                        Sales{" "}
                        <span className="text-emerald-300 font-semibold tabular-nums">
                          {formatMoney(c.sales_7d_cents)}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {decisions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-orange-300 font-bold mb-1.5">
                Recent decisions (preview)
              </p>
              <ul className="space-y-1">
                {decisions.map((d, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-slate-300 leading-relaxed border-l-2 border-orange-500/40 pl-2"
                  >
                    <span className="font-bold text-orange-200">
                      {d.action.replace(/_/g, " ")}:
                    </span>{" "}
                    {d.rationale}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
