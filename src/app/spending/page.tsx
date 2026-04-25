"use client";

import { useState, useEffect, useCallback } from "react";

interface RecurringCost {
  id: string;
  service: string;
  displayName: string;
  category: string;
  monthlyCostUsd: number;
  active: boolean;
  startedOn: string;
  endedOn: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
}

interface BurnProjection {
  siteCount: number;
  recurring: number;
  variablePerSite: number;
  variableTotal: number;
  total: number;
  perSiteCost: number;
  marginAtFullPrice: number;
  paidCustomersToday: number;
  notes: string[];
}

interface SystemCosts {
  totalEmailsSent: number;
  totalSmsSent: number;
  totalLeads: number;
  estimatedEmailCost: number;
  estimatedSmsCost: number;
  estimatedAiCost: number;
  estimatedInfraCost: number;
  totalEstimatedCost: number;
  costPerLead: number;
  revenuePerSale: number;
  breakEvenLeads: number;
  paidCustomers: number;
  revenue: number;
  profit: number;
  actualSpend?: {
    today: { total: number; byService: Record<string, number> };
    thisWeek: { total: number; byService: Record<string, number> };
    thisMonth: { total: number; byService: Record<string, number> };
    perLeadAverage: number;
    topCostLeads: Array<{ prospectId: string; businessName: string; totalCost: number }>;
    projectedMonthly: number;
  } | null;
}

interface CostAnalytics {
  dailyCosts: { date: string; total: number; byService: Record<string, number> }[];
  allTime: { total: number; byService: Record<string, number>; count: number };
  today: { total: number; byService: Record<string, number> };
  thisWeek: { total: number; byService: Record<string, number> };
  thisMonth: { total: number; byService: Record<string, number> };
  perLeadCost: {
    average: number;
    median: number;
    breakdown: {
      googlePlaces: number;
      sendgrid: number;
      twilio: number;
      siteGeneration: number;
      aiProcessing: number;
    };
  };
  roi: {
    totalRevenue: number;
    totalSpend: number;
    netProfit: number;
    roiMultiple: number;
    conversionRate: number;
    costPerAcquisition: number;
    projectedMonthlyRevenue: number;
    projectedMonthlyProfit: number;
    breakEvenLeads: number;
  };
}

interface PipelineVelocity {
  funnel: { stage: string; count: number; color: string }[];
  velocity: { avgDaysToContact: number; avgDaysToResponse: number; avgDaysToSale: number };
  conversions: { scoutToContact: number; contactToResponse: number; responseToSale: number; overall: number };
  stuckLeads: number;
  totalRevenue: number;
  projectedRevenue: number;
}

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  recentEvents: { type: string; email: string; url?: string; timestamp: string }[];
}

interface DeliverabilityHealth {
  domain: string;
  health: {
    score: number;
    grade: string;
    openRate: number;
    bounceRate: number;
    spamRate: number;
    domainAuth: { spf: boolean; dkim: boolean; dmarc: boolean };
    warmupStatus: string;
    dailySendLimit: number;
    sentToday: number;
    alerts: string[];
  };
  sending: { allowed: boolean; remaining: number; limit: number; phase: number };
  bounces: { totalHardBounces: number; totalSoftBounces: number };
}

// Fixed monthly costs — update here when subscriptions change
const FIXED_MONTHLY = 242.09; // Vercel $20 + SendGrid $20 + Twilio $1.15 + Domain $0.94 + Claude Max $200

export default function SpendingPage() {
  const [costs, setCosts] = useState<SystemCosts | null>(null);
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [pipeline, setPipeline] = useState<PipelineVelocity | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [deliverability, setDeliverability] = useState<DeliverabilityHealth | null>(null);
  const [recurring, setRecurring] = useState<RecurringCost[]>([]);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [siteTarget, setSiteTarget] = useState(5000);
  const [projection, setProjection] = useState<BurnProjection | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRecurring = useCallback(async () => {
    setRecurringLoading(true);
    try {
      const r = await fetch("/api/recurring-costs").then((res) => res.json());
      setRecurring(r.recurringCosts || []);
    } catch {
      // ignore
    } finally {
      setRecurringLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/costs").then((r) => r.json()),
      fetch("/api/costs/analytics").then((r) => r.json()).catch(() => null),
      fetch("/api/pipeline-velocity").then((r) => r.json()),
      fetch("/api/email-stats").then((r) => r.json()).catch(() => null),
      fetch("/api/email-deliverability").then((r) => r.json()).catch(() => null),
      fetch("/api/recurring-costs").then((r) => r.json()).catch(() => ({ recurringCosts: [] })),
    ])
      .then(([c, a, p, e, d, rc]) => {
        setCosts(c);
        setAnalytics(a);
        setPipeline(p);
        setEmailStats(e);
        setDeliverability(d);
        setRecurring(rc?.recurringCosts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/spending/projection?siteCount=${siteTarget}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && !data?.error) setProjection(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [siteTarget]);

  const recurringTotal = recurring
    .filter((r) => r.active)
    .reduce((sum, r) => sum + r.monthlyCostUsd, 0);
  const recurringByCategory = recurring
    .filter((r) => r.active)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.monthlyCostUsd;
      return acc;
    }, {});

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050a14]">
      <header className="border-b border-white/[0.06] bg-[#0a1628] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600" />
            <h1 className="text-xl font-bold">Spending & Analytics</h1>
          </div>
          <a href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Dashboard</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Revenue Overview */}
        {costs && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={`$${costs.revenue.toLocaleString()}`} color="text-green-400" />
            <StatCard label="Total Spent" value={`$${(analytics?.allTime.total || costs.totalEstimatedCost).toFixed(2)}`} color="text-red-400" />
            <StatCard label="Net Profit" value={`$${(analytics?.roi.netProfit ?? costs.profit).toFixed(2)}`} color={(analytics?.roi.netProfit ?? costs.profit) >= 0 ? "text-green-400" : "text-red-400"} />
            <StatCard label="Paid Customers" value={costs.paidCustomers.toString()} color="text-amber-400" />
          </div>
        )}

        {/* Real-Time Spend Dashboard */}
        {analytics && (
          <div className="p-6 rounded-2xl border border-sky-500/20 bg-sky-500/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Real-Time Cost Dashboard</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-400">LIVE DATA</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-sky-400">${analytics.today.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">Today</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-sky-400">${analytics.thisWeek.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">This Week</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-sky-400">${analytics.thisMonth.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">This Month</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-purple-400">${analytics.allTime.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">All-Time</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-amber-400">{analytics.allTime.count}</p>
                <p className="text-white/40 text-xs mt-1">Total Actions</p>
              </div>
            </div>
          </div>
        )}

        {/* Recurring Infrastructure Costs */}
        <RecurringCostsSection
          rows={recurring}
          total={recurringTotal}
          byCategory={recurringByCategory}
          loading={recurringLoading}
          showAdd={showAddRecurring}
          onToggleAdd={() => setShowAddRecurring((v) => !v)}
          onChange={refreshRecurring}
        />

        {/* 5K-Site Projection Calculator */}
        <ProjectionCalculator
          siteTarget={siteTarget}
          onChange={setSiteTarget}
          projection={projection}
        />

        {/* Daily Cost Chart */}
        {analytics && analytics.dailyCosts.length > 0 && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-2">Daily Cost Chart</h2>
            <p className="text-white/40 text-sm mb-6">Last 30 days of API spending</p>
            <div className="flex items-end gap-[3px] h-40">
              {analytics.dailyCosts.map((day) => {
                const maxCost = Math.max(...analytics.dailyCosts.map((d) => d.total), 0.01);
                const height = day.total > 0 ? Math.max(4, (day.total / maxCost) * 100) : 2;
                const isToday = day.date === new Date().toISOString().split("T")[0];
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-all cursor-pointer ${
                        isToday ? "bg-sky-400" : day.total > 0 ? "bg-sky-500/70 hover:bg-sky-400" : "bg-white/[0.04]"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-[#1a2744] border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                        <p className="font-medium text-white">{day.date}</p>
                        <p className="text-sky-400 font-bold">${day.total.toFixed(4)}</p>
                        {Object.entries(day.byService).map(([svc, cost]) => (
                          <p key={svc} className="text-white/50">
                            {svc.replace(/_/g, " ")}: ${(cost as number).toFixed(4)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/30">
              <span>{analytics.dailyCosts[0]?.date}</span>
              <span>{analytics.dailyCosts[analytics.dailyCosts.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {/* Per-Lead Cost Breakdown */}
        {analytics && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-2">Per-Lead Cost Breakdown</h2>
            <p className="text-white/40 text-sm mb-6">Average cost to acquire a lead through the full funnel</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                    <p className="text-3xl font-extrabold text-sky-400">${analytics.perLeadCost.average.toFixed(3)}</p>
                    <p className="text-white/40 text-xs mt-1">Average Per Lead</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                    <p className="text-3xl font-extrabold text-green-400">${analytics.perLeadCost.median.toFixed(3)}</p>
                    <p className="text-white/40 text-xs mt-1">Median Per Lead</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <CostBreakdownRow
                  label="Google Places API"
                  cost={analytics.perLeadCost.breakdown.googlePlaces}
                  total={analytics.perLeadCost.average}
                  color="bg-blue-500"
                />
                <CostBreakdownRow
                  label="SendGrid Email"
                  cost={analytics.perLeadCost.breakdown.sendgrid}
                  total={analytics.perLeadCost.average}
                  color="bg-green-500"
                />
                <CostBreakdownRow
                  label="Twilio (SMS/Voice)"
                  cost={analytics.perLeadCost.breakdown.twilio}
                  total={analytics.perLeadCost.average}
                  color="bg-purple-500"
                />
                <CostBreakdownRow
                  label="Site Generation"
                  cost={analytics.perLeadCost.breakdown.siteGeneration}
                  total={analytics.perLeadCost.average}
                  color="bg-amber-500"
                />
                <CostBreakdownRow
                  label="AI Processing"
                  cost={analytics.perLeadCost.breakdown.aiProcessing}
                  total={analytics.perLeadCost.average}
                  color="bg-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cost by Service */}
        {analytics && Object.keys(analytics.allTime.byService).length > 0 && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-4">Cost by Service (All-Time)</h2>
            <div className="space-y-3">
              {Object.entries(analytics.allTime.byService)
                .sort(([, a], [, b]) => b - a)
                .map(([service, cost]) => {
                  const pct = analytics.allTime.total > 0 ? (cost / analytics.allTime.total) * 100 : 0;
                  const serviceColors: Record<string, string> = {
                    google_places: "bg-blue-500",
                    sendgrid_email: "bg-green-500",
                    twilio_sms: "bg-purple-500",
                    twilio_voice: "bg-indigo-500",
                    site_generation: "bg-amber-500",
                    manus: "bg-amber-500",
                    openai: "bg-emerald-500",
                    openai_tts: "bg-teal-500",
                    openai_proposal: "bg-emerald-400",
                    video_generation: "bg-teal-600",
                    claude: "bg-violet-500",
                    perplexity: "bg-cyan-500",
                    ai_response: "bg-red-500",
                    pipeline: "bg-sky-500",
                  };
                  const serviceLabels: Record<string, string> = {
                    google_places: "Google Places",
                    sendgrid_email: "SendGrid Email",
                    twilio_sms: "Twilio SMS",
                    twilio_voice: "Twilio Voice",
                    site_generation: "Site Generation",
                    manus: "Manus (Site Gen)",
                    openai: "OpenAI (GPT-4.1-mini)",
                    openai_tts: "OpenAI TTS (Video — paused)",
                    openai_proposal: "OpenAI (Proposals)",
                    video_generation: "Video Generation (paused)",
                    claude: "Anthropic (Claude)",
                    perplexity: "Perplexity AI",
                    ai_response: "AI Sales Agent",
                    pipeline: "Pipeline Total",
                  };
                  return (
                    <div key={service}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-white/60">{serviceLabels[service] || service.replace(/_/g, " ")}</span>
                        <span className="font-medium">${cost.toFixed(4)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${serviceColors[service] || "bg-white/20"}`}
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ROI Projections */}
        {analytics && (
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]">
            <h2 className="text-lg font-bold mb-2 text-emerald-400">ROI Projections</h2>
            <p className="text-white/40 text-sm mb-6">Based on current conversion rates and $997 price point</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-green-400">${analytics.roi.totalRevenue.toLocaleString()}</p>
                <p className="text-white/40 text-xs mt-1">Total Revenue</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-red-400">${analytics.roi.totalSpend.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">Total Spend</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className={`text-2xl font-extrabold ${analytics.roi.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ${analytics.roi.netProfit.toLocaleString()}
                </p>
                <p className="text-white/40 text-xs mt-1">Net Profit</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-amber-400">{analytics.roi.roiMultiple}x</p>
                <p className="text-white/40 text-xs mt-1">ROI Multiple</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                <p className="text-xl font-bold text-white">{analytics.roi.conversionRate}%</p>
                <p className="text-white/40 text-xs mt-1">Conversion Rate</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                <p className="text-xl font-bold text-white">${analytics.roi.costPerAcquisition.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">Cost Per Acquisition</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                <p className="text-xl font-bold text-white">{analytics.roi.breakEvenLeads}</p>
                <p className="text-white/40 text-xs mt-1">Leads to Break Even</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-center">
                <p className="text-sm text-white/50 mb-1">Projected Monthly Revenue</p>
                <p className="text-2xl font-black text-emerald-400">${analytics.roi.projectedMonthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/50 mb-1">Projected Monthly Profit</p>
                <p className={`text-2xl font-black ${analytics.roi.projectedMonthlyProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ${analytics.roi.projectedMonthlyProfit.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-white/30 text-xs mt-4 text-center">
              Projections based on current {analytics.roi.conversionRate}% conversion rate at $997/sale.
              {analytics.roi.roiMultiple > 0 && ` Every $1 spent returns $${analytics.roi.roiMultiple.toFixed(1)} in revenue.`}
            </p>
          </div>
        )}

        {/* Cost Breakdown (Estimated) */}
        {costs && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Cost Breakdown (Estimated)</h2>
              {analytics?.allTime.total ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">REAL DATA ABOVE</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/40">ESTIMATED</span>
              )}
            </div>
            <div className="space-y-4">
              <CostRow label="Email Sending (SendGrid)" count={`${costs.totalEmailsSent} emails`} cost={costs.estimatedEmailCost} color="bg-green-500" />
              <CostRow label="SMS Sending (Twilio)" count={`${costs.totalSmsSent} texts`} cost={costs.estimatedSmsCost} color="bg-blue-500" />
              <CostRow label="AI Processing (Claude/Perplexity)" count="Quality review + responses" cost={costs.estimatedAiCost} color="bg-purple-500" />
              <CostRow label="Infrastructure (Vercel/Supabase/Twilio)" count="Monthly base costs" cost={costs.estimatedInfraCost} color="bg-orange-500" />
              <div className="border-t border-white/[0.06] pt-4 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">${costs.totalEstimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Funnel */}
        {pipeline && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-6">Sales Funnel</h2>
            <div className="space-y-3">
              {pipeline.funnel.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-white/50">{stage.stage}</span>
                  <div className="flex-1 h-8 bg-white/[0.04] rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 text-xs font-bold text-white transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (stage.count / Math.max(1, pipeline.funnel[0].count)) * 100)}%`,
                        backgroundColor: stage.color,
                      }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Rates */}
        {pipeline && (
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard label="Scout → Contact" value={`${pipeline.conversions.scoutToContact}%`} color="text-orange-400" />
            <StatCard label="Contact → Response" value={`${pipeline.conversions.contactToResponse}%`} color="text-green-400" />
            <StatCard label="Response → Sale" value={`${pipeline.conversions.responseToSale}%`} color="text-amber-400" />
            <StatCard label="Overall Conversion" value={`${pipeline.conversions.overall}%`} color="text-sky-400" />
          </div>
        )}

        {/* Pipeline Velocity */}
        {pipeline && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-sky-400">{pipeline.velocity.avgDaysToContact}d</p>
              <p className="text-white/40 text-sm mt-1">Avg Days to Contact</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-green-400">{pipeline.velocity.avgDaysToResponse}d</p>
              <p className="text-white/40 text-sm mt-1">Avg Days to Response</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-amber-400">{pipeline.velocity.avgDaysToSale}d</p>
              <p className="text-white/40 text-sm mt-1">Avg Days to Sale</p>
            </div>
          </div>
        )}

        {/* Stuck Leads Alert */}
        {pipeline && pipeline.stuckLeads > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 font-semibold">
              {pipeline.stuckLeads} leads stuck (contacted but no response in 7+ days)
            </p>
            <p className="text-white/40 text-sm mt-1">Consider running the auto-funnel follow-up or trying a different channel.</p>
          </div>
        )}

        {/* Cost Per Lead at Scale */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-bold mb-2">Cost Per Lead at Scale</h2>
          <p className="text-white/40 text-sm mb-6">How costs change as volume increases. 1 sale = $997.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-4">Scenario</th>
                  <th className="text-right py-2 px-3">Leads/mo</th>
                  <th className="text-right py-2 px-3">Emails</th>
                  <th className="text-right py-2 px-3">Texts</th>
                  <th className="text-right py-2 px-3">Variable</th>
                  <th className="text-right py-2 px-3">Fixed</th>
                  <th className="text-right py-2 px-3">Total</th>
                  <th className="text-right py-2 px-3">Per Lead</th>
                  <th className="text-right py-2 pl-3">Sales @ 3%</th>
                  <th className="text-right py-2 pl-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Starting", leads: 20, emails: 60, sms: 20 },
                  { name: "Growing", leads: 50, emails: 150, sms: 50 },
                  { name: "Cruising", leads: 100, emails: 300, sms: 100 },
                  { name: "Scaling", leads: 250, emails: 750, sms: 250 },
                  { name: "Full Speed", leads: 500, emails: 1500, sms: 500 },
                ].map((s) => {
                  // variable: emails + sms + google places + AI (proposals $0.004 only; video paused)
                  const variable = (s.emails * 0.001) + (s.sms * 0.0079) + (s.leads * 0.017) + (s.leads * 0.004);
                  const fixed = recurringTotal > 0 ? recurringTotal : FIXED_MONTHLY;
                  const total = variable + fixed;
                  const perLead = total / s.leads;
                  const sales = Math.round(s.leads * 0.03);
                  const revenue = sales * 997;
                  const profit = revenue - total;
                  return (
                    <tr key={s.name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-medium">{s.name}</td>
                      <td className="text-right px-3 text-white/60">{s.leads}</td>
                      <td className="text-right px-3 text-white/60">{s.emails}</td>
                      <td className="text-right px-3 text-white/60">{s.sms}</td>
                      <td className="text-right px-3">${variable.toFixed(2)}</td>
                      <td className="text-right px-3">${fixed.toFixed(2)}</td>
                      <td className="text-right px-3 font-medium">${total.toFixed(2)}</td>
                      <td className="text-right px-3 text-sky-400 font-bold">${perLead.toFixed(2)}</td>
                      <td className="text-right pl-3 text-white/60">{sales} (${revenue.toLocaleString()})</td>
                      <td className={`text-right pl-3 font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>${profit.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-white/30 text-xs mt-4">* Assumes 3% close rate, 3 emails/lead, 1 SMS/lead. Variable costs: Google Places ($0.017/search), SendGrid ($0.001/email), Twilio ($0.0079/SMS), proposals ($0.004/lead). Video generation paused. Fixed ${(recurringTotal > 0 ? recurringTotal : FIXED_MONTHLY).toFixed(2)}/mo from live recurring_costs table.</p>
        </div>

        {/* Per-Use Cost Reference */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-bold mb-4">Per-Use Cost Reference</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Outreach</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/50">SendGrid email</span><span>$0.001/email</span></div>
                <div className="flex justify-between"><span className="text-white/50">Twilio SMS</span><span>$0.0079/text</span></div>
                <div className="flex justify-between"><span className="text-white/50">Twilio phone number</span><span>$1.15/month</span></div>
              </div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2 mt-4">Scouting</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/50">Google Places search</span><span>$0.017/search</span></div>
                <div className="flex justify-between"><span className="text-white/50">Google Place Details</span><span>$0.017/lookup</span></div>
                <div className="flex justify-between"><span className="text-white/50">Google Place Photos</span><span>$0.007/photo</span></div>
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">AI Pipeline</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/50">GPT-4.1-mini (proposals)</span><span>~$0.004/proposal</span></div>
                <div className="flex justify-between"><span className="text-white/50">GPT-4.1-mini (QC scoring)</span><span>~$0.002/site</span></div>
                <div className="flex justify-between"><span className="text-white/50">OpenAI TTS (video audio)</span><span className="text-white/30">~$0.015/min — paused</span></div>
                <div className="flex justify-between"><span className="text-white/50">Video generation (Puppeteer+ffmpeg)</span><span className="text-white/30">~$0.05/video — paused</span></div>
                <div className="flex justify-between"><span className="text-white/50">Claude AI sales response</span><span>~$0.003/response</span></div>
                <div className="flex justify-between"><span className="text-white/50">Perplexity search</span><span>~$0.005/search</span></div>
              </div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2 mt-4">Anti-Bounce System</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-white/50">DNS auth checks (SPF/DKIM/DMARC)</span><span className="text-green-400">Free</span></div>
                <div className="flex justify-between"><span className="text-white/50">Bounce suppression list</span><span className="text-green-400">Built-in</span></div>
                <div className="flex justify-between"><span className="text-white/50">Warm-up schedule tracking</span><span className="text-green-400">Built-in</span></div>
                <div className="flex justify-between"><span className="text-white/50">Soft bounce retry (next day)</span><span>$0.001/retry</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Tracking */}
        {emailStats && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-6">Email Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-sky-400">{emailStats.delivered}</p>
                <p className="text-white/40 text-sm mt-1">Delivered</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-green-400">{emailStats.openRate}%</p>
                <p className="text-white/40 text-sm mt-1">Open Rate</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-amber-400">{emailStats.clickRate}%</p>
                <p className="text-white/40 text-sm mt-1">Click Rate</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                <p className="text-2xl font-extrabold text-red-400">{emailStats.bounceRate}%</p>
                <p className="text-white/40 text-sm mt-1">Bounce Rate</p>
              </div>
            </div>
            {emailStats.opened > 0 && (
              <div className="space-y-2 text-sm">
                <p className="text-white/50 font-medium">Unique opens: {emailStats.opened} | Unique clicks: {emailStats.clicked}</p>
              </div>
            )}
            {emailStats.recentEvents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white/50 mb-2">Recent Activity</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {emailStats.recentEvents.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                      <span className={`w-2 h-2 rounded-full ${e.type === "open" ? "bg-green-500" : e.type === "click" ? "bg-amber-500" : e.type === "bounce" ? "bg-red-500" : "bg-sky-500"}`} />
                      <span className="font-medium">{e.type.toUpperCase()}</span>
                      <span>{e.email}</span>
                      {e.url && <span className="text-sky-400 truncate max-w-[200px]">{e.url}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {emailStats.delivered === 0 && (
              <p className="text-white/30 text-sm">No email events yet. Data will appear after your first outreach campaign. Set up the SendGrid Event Webhook at: Settings → Mail Settings → Event Webhook → URL: https://bluejayportfolio.com/api/email-tracking</p>
            )}
          </div>
        )}

        {/* Anti-Bounce & Deliverability Health */}
        <div className="p-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Anti-Bounce & Deliverability Health</h2>
            {deliverability && (
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                deliverability.health.grade === "A" ? "bg-green-500/20 text-green-400" :
                deliverability.health.grade === "B" ? "bg-blue-500/20 text-blue-400" :
                deliverability.health.grade === "C" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                Grade {deliverability.health.grade} — {deliverability.health.score}/100
              </span>
            )}
          </div>
          <p className="text-white/40 text-sm mb-6">
            Our built-in bounce suppression system keeps domain reputation high and prevents wasted send credits.
          </p>

          {deliverability ? (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Domain Auth */}
              <div className="p-4 rounded-xl bg-white/[0.03] space-y-3">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Domain Auth</p>
                <div className="space-y-2">
                  {[
                    { key: "SPF", ok: deliverability.health.domainAuth.spf, tip: "Authorizes our sending server" },
                    { key: "DKIM", ok: deliverability.health.domainAuth.dkim, tip: "Cryptographic signature on emails" },
                    { key: "DMARC", ok: deliverability.health.domainAuth.dmarc, tip: "Policy for failed auth" },
                  ].map(({ key, ok, tip }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{key}</span>
                        <p className="text-[10px] text-white/30">{tip}</p>
                      </div>
                      <span className={`text-sm font-bold ${ok ? "text-green-400" : "text-red-400"}`}>
                        {ok ? "✓ Pass" : "✗ Fail"}
                      </span>
                    </div>
                  ))}
                </div>
                {(!deliverability.health.domainAuth.spf || !deliverability.health.domainAuth.dkim || !deliverability.health.domainAuth.dmarc) && (
                  <p className="text-[11px] text-yellow-400 mt-2">⚠ Fix domain auth → up to 40% more emails land in inbox vs spam</p>
                )}
              </div>

              {/* Warm-up Status */}
              <div className="p-4 rounded-xl bg-white/[0.03] space-y-2">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Warm-up Schedule</p>
                <p className="text-2xl font-extrabold text-violet-400 capitalize">
                  {deliverability.health.warmupStatus.replace(/-/g, " ")}
                </p>
                <p className="text-sm text-white/50">Phase {deliverability.sending.phase}</p>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{
                      width: `${deliverability.health.dailySendLimit > 0
                        ? Math.min(100, (deliverability.health.sentToday / deliverability.health.dailySendLimit) * 100)
                        : 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white/40">
                  {deliverability.health.sentToday} / {deliverability.health.dailySendLimit} today
                  {" "}({deliverability.sending.remaining} remaining)
                </p>
                <p className="text-[11px] text-white/30 pt-1">
                  Gradual ramp-up protects sender score. Sending within limits = lower bounce rate = lower cost per delivered email.
                </p>
              </div>

              {/* Bounce Stats */}
              <div className="p-4 rounded-xl bg-white/[0.03] space-y-2">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Bounce Suppression</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/50">Hard bounces suppressed</span>
                      <span className={`font-bold ${deliverability.bounces.totalHardBounces > 0 ? "text-red-400" : "text-green-400"}`}>
                        {deliverability.bounces.totalHardBounces}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30">Never re-sent — saves ${(deliverability.bounces.totalHardBounces * 0.001).toFixed(3)} in avoided send costs</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/50">Soft bounces (retry queue)</span>
                      <span className="font-bold text-yellow-400">{deliverability.bounces.totalSoftBounces}</span>
                    </div>
                    <p className="text-[10px] text-white/30">Auto-retried next day at $0.001/retry</p>
                  </div>
                  <div className="border-t border-white/[0.04] pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Bounce rate</span>
                      <span className={`font-bold ${deliverability.health.bounceRate <= 2 ? "text-green-400" : "text-red-400"}`}>
                        {deliverability.health.bounceRate.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-white/30">Target: under 2%. Above 5% = SendGrid account risk.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {["Domain Auth", "Warm-up Schedule", "Bounce Suppression"].map((label) => (
                <div key={label} className="p-4 rounded-xl bg-white/[0.03] animate-pulse h-32 flex items-center justify-center">
                  <p className="text-white/20 text-sm">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 text-sm p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div>
              <p className="text-white/30 text-xs mb-1">Cost of a bounced email</p>
              <p className="font-semibold">$0.001 wasted per hard bounce</p>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">Cost of inbox vs spam</p>
              <p className="font-semibold">~40% conversion rate difference</p>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">System cost to run</p>
              <p className="font-semibold text-green-400">$0 extra — built in</p>
            </div>
          </div>

          {deliverability?.health.alerts && deliverability.health.alerts.length > 0 && (
            <div className="mt-4 space-y-1">
              {deliverability.health.alerts.map((alert, i) => (
                <p key={i} className="text-xs text-yellow-400 flex gap-1.5">
                  <span>⚠</span><span>{alert}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* The Math That Matters */}
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]">
          <h2 className="text-lg font-bold mb-2 text-emerald-400">The Math That Matters</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="text-center">
              <p className="text-4xl font-black text-white">$997</p>
              <p className="text-white/40 text-sm mt-1">Revenue per sale</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-sky-400">
                {analytics ? `$${analytics.perLeadCost.average.toFixed(2)}` : "~$2.50"}
              </p>
              <p className="text-white/40 text-sm mt-1">Cost per lead {analytics ? "(actual)" : "(estimated)"}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-emerald-400">
                {analytics && analytics.perLeadCost.average > 0
                  ? `${Math.round(997 / analytics.perLeadCost.average)}x`
                  : "399x"}
              </p>
              <p className="text-white/40 text-sm mt-1">ROI per sale</p>
            </div>
          </div>
          <p className="text-white/30 text-xs mt-6 text-center">At 100 leads/month with 3% close rate = 3 sales = $2,991 revenue on ~$292 spend = <span className="text-emerald-400 font-bold">$2,699 profit/month</span></p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-white/40 text-sm mt-1">{label}</p>
    </div>
  );
}

function CostRow({ label, count, cost, color }: { label: string; count: string; cost: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-white/40">{count}</p>
      </div>
      <p className="font-semibold">${cost.toFixed(2)}</p>
    </div>
  );
}

function CostBreakdownRow({ label, cost, total, color }: { label: string; cost: number; total: number; color: string }) {
  const pct = total > 0 ? (cost / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="text-white/60">{label}</span>
        <span className="font-medium">${cost.toFixed(4)} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recurring infrastructure costs section
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  database: "bg-emerald-500",
  hosting: "bg-sky-500",
  email: "bg-amber-500",
  sms: "bg-purple-500",
  tools: "bg-indigo-500",
  other: "bg-white/30",
};

function RecurringCostsSection({
  rows,
  total,
  byCategory,
  loading,
  showAdd,
  onToggleAdd,
  onChange,
}: {
  rows: RecurringCost[];
  total: number;
  byCategory: Record<string, number>;
  loading: boolean;
  showAdd: boolean;
  onToggleAdd: () => void;
  onChange: () => void | Promise<void>;
}) {
  const categories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  return (
    <div className="p-6 rounded-2xl border border-orange-500/20 bg-orange-500/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Recurring Infrastructure Costs</h2>
          <p className="text-white/40 text-sm mt-1">Fixed monthly subscriptions — burns whether we generate sites or not.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-orange-400">${total.toFixed(2)}<span className="text-sm font-medium text-white/40">/mo</span></span>
          <button
            onClick={onToggleAdd}
            className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold hover:bg-orange-500/30 transition-colors"
          >
            {showAdd ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {/* Category breakdown stacked bar */}
      {categories.length > 0 && (
        <div className="mb-4">
          <div className="h-2 flex rounded-full overflow-hidden bg-white/[0.04]">
            {categories.map(([cat, amount]) => (
              <div
                key={cat}
                className={CATEGORY_COLORS[cat] || "bg-white/30"}
                style={{ width: `${(amount / total) * 100}%` }}
                title={`${cat}: $${amount.toFixed(2)}/mo`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs">
            {categories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat] || "bg-white/30"}`} />
                <span className="text-white/60 capitalize">{cat}</span>
                <span className="text-white/40">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && <AddRecurringForm onSaved={async () => { await onChange(); onToggleAdd(); }} />}

      {/* Rows */}
      <div className="space-y-2 mt-4">
        {loading && rows.length === 0 ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-white/40 text-sm">No recurring costs tracked yet. Click + Add to seed Supabase Pro, Vercel, etc.</p>
        ) : (
          rows.map((row) => <RecurringCostRow key={row.id} row={row} onChange={onChange} />)
        )}
      </div>
    </div>
  );
}

function RecurringCostRow({ row, onChange }: { row: RecurringCost; onChange: () => void | Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draftCost, setDraftCost] = useState(row.monthlyCostUsd.toString());
  const [busy, setBusy] = useState(false);

  const saveCost = async () => {
    const n = Number(draftCost);
    if (!Number.isFinite(n) || n < 0) return;
    setBusy(true);
    try {
      await fetch(`/api/recurring-costs/${encodeURIComponent(row.service)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ monthlyCostUsd: n }),
      });
      await onChange();
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const endSubscription = async () => {
    if (!confirm(`End subscription "${row.displayName}"? It will be marked inactive (history preserved).`)) return;
    setBusy(true);
    try {
      await fetch(`/api/recurring-costs/${encodeURIComponent(row.service)}`, { method: "DELETE" });
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${row.active ? "bg-white/[0.03]" : "bg-white/[0.01] opacity-60"}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_COLORS[row.category] || "bg-white/30"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{row.displayName}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40 capitalize">{row.category}</span>
          {!row.active && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">ENDED</span>
          )}
        </div>
        {row.notes && <p className="text-xs text-white/40 truncate">{row.notes}</p>}
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <span className="text-white/40 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            value={draftCost}
            onChange={(e) => setDraftCost(e.target.value)}
            className="w-20 px-2 py-1 text-sm rounded bg-white/[0.05] border border-white/10 text-white"
            autoFocus
          />
          <button
            onClick={saveCost}
            disabled={busy}
            className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setDraftCost(row.monthlyCostUsd.toString()); }}
            className="px-2 py-1 text-xs rounded bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => row.active && setEditing(true)}
          disabled={!row.active}
          className={`font-semibold text-sm ${row.active ? "hover:text-orange-400 cursor-pointer" : "cursor-not-allowed"}`}
          title={row.active ? "Click to edit" : "Subscription ended"}
        >
          ${row.monthlyCostUsd.toFixed(2)}<span className="text-white/40 text-xs">/mo</span>
        </button>
      )}
      {row.active && !editing && (
        <button
          onClick={endSubscription}
          disabled={busy}
          className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          title="End subscription"
        >
          End
        </button>
      )}
    </div>
  );
}

function AddRecurringForm({ onSaved }: { onSaved: () => void | Promise<void> }) {
  const [service, setService] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState("tools");
  const [monthlyCostUsd, setMonthlyCostUsd] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = Number(monthlyCostUsd);
    if (!service.trim() || !displayName.trim() || !Number.isFinite(n) || n < 0) {
      setError("service, display name, and a non-negative cost are required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/recurring-costs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service: service.trim(),
          displayName: displayName.trim(),
          category,
          monthlyCostUsd: n,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || `HTTP ${res.status}`);
        return;
      }
      setService("");
      setDisplayName("");
      setMonthlyCostUsd("");
      setNotes("");
      await onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="service slug (e.g. cloudflare)"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="px-2 py-1.5 text-sm rounded bg-white/[0.04] border border-white/10"
        />
        <input
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="px-2 py-1.5 text-sm rounded bg-white/[0.04] border border-white/10"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2 py-1.5 text-sm rounded bg-white/[0.04] border border-white/10"
        >
          <option value="database">database</option>
          <option value="hosting">hosting</option>
          <option value="email">email</option>
          <option value="sms">sms</option>
          <option value="tools">tools</option>
          <option value="other">other</option>
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Monthly $"
          value={monthlyCostUsd}
          onChange={(e) => setMonthlyCostUsd(e.target.value)}
          className="px-2 py-1.5 text-sm rounded bg-white/[0.04] border border-white/10"
        />
      </div>
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-2 py-1.5 text-sm rounded bg-white/[0.04] border border-white/10"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-bold hover:bg-orange-500/30 disabled:opacity-50"
      >
        {busy ? "Adding..." : "Add subscription"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// 5K-site projection calculator
// ---------------------------------------------------------------------------

function ProjectionCalculator({
  siteTarget,
  onChange,
  projection,
}: {
  siteTarget: number;
  onChange: (n: number) => void;
  projection: BurnProjection | null;
}) {
  const presets = [100, 500, 1000, 2500, 5000];
  return (
    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">5K-Site Projection Calculator</h2>
          <p className="text-white/40 text-sm mt-1">Project monthly burn at scale. Variable cost averaged from system_costs over the last 30 days.</p>
        </div>
        <span className="text-3xl font-black text-amber-400">{siteTarget.toLocaleString()}</span>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={siteTarget}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>0</span>
          <span>1K</span>
          <span>2.5K</span>
          <span>5K</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              siteTarget === p
                ? "bg-amber-500/30 text-amber-300"
                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08]"
            }`}
          >
            {p.toLocaleString()}
          </button>
        ))}
      </div>

      {projection ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-xl font-extrabold text-orange-400">${projection.recurring.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">Recurring/mo</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-xl font-extrabold text-sky-400">${projection.variableTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">Variable/mo</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-2xl font-black text-amber-300">${projection.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">Total Burn/mo</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] text-center">
              <p className="text-xl font-extrabold text-emerald-400">${projection.perSiteCost.toFixed(4)}</p>
              <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider">Per Site / Month</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Margin/site/mo at $100/yr renewal</p>
              <p className={`text-2xl font-black ${projection.marginAtFullPrice >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${projection.marginAtFullPrice.toFixed(4)}
              </p>
              <p className="text-white/30 text-[10px] mt-1">($100/yr = $8.33/mo per site)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Annual gross margin at {siteTarget.toLocaleString()} sites</p>
              <p className={`text-2xl font-black ${projection.marginAtFullPrice >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${(projection.marginAtFullPrice * 12 * siteTarget).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-white/30 text-[10px] mt-1">renewal sub revenue minus all infra</p>
            </div>
          </div>

          {projection.notes.length > 0 && (
            <div className="mt-3 space-y-1">
              {projection.notes.map((n, i) => (
                <p key={i} className="text-[11px] text-amber-300/70">⓵ {n}</p>
              ))}
            </div>
          )}
          <p className="text-white/30 text-xs mt-3 text-center">
            Today: {projection.paidCustomersToday} paid customer{projection.paidCustomersToday === 1 ? "" : "s"} · variable/site = ${projection.variablePerSite.toFixed(4)}/mo
          </p>
        </>
      ) : (
        <p className="text-white/40 text-sm">Loading projection...</p>
      )}
    </div>
  );
}
