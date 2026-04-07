"use client";

import { useState, useEffect } from "react";

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
}

interface PipelineVelocity {
  funnel: { stage: string; count: number; color: string }[];
  velocity: { avgDaysToContact: number; avgDaysToResponse: number; avgDaysToSale: number };
  conversions: { scoutToContact: number; contactToResponse: number; responseToSale: number; overall: number };
  stuckLeads: number;
  totalRevenue: number;
  projectedRevenue: number;
}

export default function SpendingPage() {
  const [costs, setCosts] = useState<SystemCosts | null>(null);
  const [pipeline, setPipeline] = useState<PipelineVelocity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/costs").then((r) => r.json()),
      fetch("/api/pipeline-velocity").then((r) => r.json()),
    ])
      .then(([c, p]) => { setCosts(c); setPipeline(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            <StatCard label="Total Spent" value={`$${costs.totalEstimatedCost.toFixed(2)}`} color="text-red-400" />
            <StatCard label="Net Profit" value={`$${costs.profit.toFixed(2)}`} color={costs.profit >= 0 ? "text-green-400" : "text-red-400"} />
            <StatCard label="Paid Customers" value={costs.paidCustomers.toString()} color="text-amber-400" />
          </div>
        )}

        {/* Cost Breakdown */}
        {costs && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-6">Cost Breakdown</h2>
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

        {/* Unit Economics */}
        {costs && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-sky-400">${costs.costPerLead.toFixed(2)}</p>
              <p className="text-white/40 text-sm mt-1">Cost Per Lead</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-green-400">${costs.revenuePerSale}</p>
              <p className="text-white/40 text-sm mt-1">Revenue Per Sale</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <p className="text-3xl font-extrabold text-amber-400">{costs.breakEvenLeads}</p>
              <p className="text-white/40 text-sm mt-1">Leads to Break Even</p>
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
              ⚠️ {pipeline.stuckLeads} leads stuck (contacted but no response in 7+ days)
            </p>
            <p className="text-white/40 text-sm mt-1">Consider running the auto-funnel follow-up or trying a different channel.</p>
          </div>
        )}

        {/* Service Costs Reference */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-bold mb-4">Service Cost Reference</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/50">SendGrid email</span><span>$0.001/email</span></div>
              <div className="flex justify-between"><span className="text-white/50">Twilio SMS</span><span>$0.0079/text</span></div>
              <div className="flex justify-between"><span className="text-white/50">Twilio phone number</span><span>$1.15/month</span></div>
              <div className="flex justify-between"><span className="text-white/50">Google Places search</span><span>$0.017/search</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/50">Vercel hosting</span><span>Free tier</span></div>
              <div className="flex justify-between"><span className="text-white/50">Supabase database</span><span>Free tier</span></div>
              <div className="flex justify-between"><span className="text-white/50">Claude AI response</span><span>~$0.003/response</span></div>
              <div className="flex justify-between"><span className="text-white/50">Perplexity search</span><span>~$0.005/search</span></div>
            </div>
          </div>
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
