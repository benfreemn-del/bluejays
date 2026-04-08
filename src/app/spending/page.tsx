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
  actualSpend?: {
    today: { total: number; byService: Record<string, number> };
    thisWeek: { total: number; byService: Record<string, number> };
    thisMonth: { total: number; byService: Record<string, number> };
    perLeadAverage: number;
    topCostLeads: Array<{ prospectId: string; businessName: string; totalCost: number }>;
    projectedMonthly: number;
  } | null;
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

export default function SpendingPage() {
  const [costs, setCosts] = useState<SystemCosts | null>(null);
  const [pipeline, setPipeline] = useState<PipelineVelocity | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/costs").then((r) => r.json()),
      fetch("/api/pipeline-velocity").then((r) => r.json()),
      fetch("/api/email-stats").then((r) => r.json()).catch(() => null),
    ])
      .then(([c, p, e]) => { setCosts(c); setPipeline(p); setEmailStats(e); })
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

        {/* Real-Time Spend (from system_costs) */}
        {costs?.actualSpend && (
          <div className="p-6 rounded-2xl border border-sky-500/20 bg-sky-500/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Real-Time Spend</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-400">LIVE DATA</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-xl font-extrabold text-sky-400">${costs.actualSpend.today.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">Today</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-xl font-extrabold text-sky-400">${costs.actualSpend.thisWeek.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">This Week</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-xl font-extrabold text-sky-400">${costs.actualSpend.thisMonth.total.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">This Month</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                <p className="text-xl font-extrabold text-amber-400">${costs.actualSpend.projectedMonthly.toFixed(2)}</p>
                <p className="text-white/40 text-xs mt-1">Projected Monthly</p>
              </div>
            </div>
            {/* Service breakdown for this month */}
            {Object.keys(costs.actualSpend.thisMonth.byService).length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-white/50">This Month by Service</p>
                {Object.entries(costs.actualSpend.thisMonth.byService)
                  .sort(([, a], [, b]) => b - a)
                  .map(([service, cost]) => (
                    <div key={service} className="flex justify-between items-center text-sm">
                      <span className="text-white/60 capitalize">{service.replace(/_/g, " ")}</span>
                      <span className="font-medium">${cost.toFixed(4)}</span>
                    </div>
                  ))}
              </div>
            )}
            {/* Top cost leads */}
            {costs.actualSpend.topCostLeads.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-white/50 mb-2">Top Cost Leads</p>
                <div className="space-y-1">
                  {costs.actualSpend.topCostLeads.slice(0, 5).map((lead) => (
                    <div key={lead.prospectId} className="flex justify-between items-center text-sm">
                      <span className="text-white/60">{lead.businessName}</span>
                      <span className="font-medium">${lead.totalCost.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-white/20 text-xs mt-4">Per-lead average: ${costs.actualSpend.perLeadAverage.toFixed(3)}</p>
          </div>
        )}

        {/* Cost Breakdown (Estimated) */}
        {costs && (
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Cost Breakdown</h2>
              {!costs.actualSpend && <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/40">ESTIMATED</span>}
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

        {/* Monthly Subscriptions */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-bold mb-4">Monthly Subscriptions</h2>
          <div className="space-y-3">
            <SubRow name="Vercel Pro" cost={20} status="active" description="Hosting, serverless functions, domains" />
            <SubRow name="SendGrid Essentials" cost={20} status="active" description="Email sending, domain auth, analytics" />
            <SubRow name="Twilio" cost={1.15} status="active" description="Phone number + per-use SMS/calls" />
            <SubRow name="Supabase" cost={0} status="free" description="PostgreSQL database, auth, storage" />
            <SubRow name="Domain (bluejayportfolio.com)" cost={0.94} status="active" description="$11.25/year via Vercel" />
            <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center">
              <span className="font-bold">Total Monthly Fixed Cost</span>
              <span className="font-bold text-lg text-orange-400">$42.09/mo</span>
            </div>
          </div>
        </div>

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
                  const variable = (s.emails * 0.001) + (s.sms * 0.0079) + (s.leads * 0.017) + (s.leads * 0.006);
                  const fixed = 42.09;
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
          <p className="text-white/30 text-xs mt-4">* Assumes 3% close rate (3 sales per 100 leads), 3 emails per lead, 1 text per lead. Variable costs: Google Places ($0.017/search), SendGrid ($0.001/email), Twilio ($0.0079/SMS), AI ($0.006/lead).</p>
        </div>

        {/* Per-Use Cost Reference */}
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-lg font-bold mb-4">Per-Use Cost Reference</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/50">SendGrid email</span><span>$0.001/email</span></div>
              <div className="flex justify-between"><span className="text-white/50">Twilio SMS</span><span>$0.0079/text</span></div>
              <div className="flex justify-between"><span className="text-white/50">Google Places search</span><span>$0.017/search</span></div>
              <div className="flex justify-between"><span className="text-white/50">Google Place Details</span><span>$0.017/lookup</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/50">Google Place Photos</span><span>$0.007/photo</span></div>
              <div className="flex justify-between"><span className="text-white/50">Claude AI response</span><span>~$0.003/response</span></div>
              <div className="flex justify-between"><span className="text-white/50">Perplexity search</span><span>~$0.005/search</span></div>
              <div className="flex justify-between"><span className="text-white/50">Twilio phone number</span><span>$1.15/month</span></div>
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

        {/* ROI Calculator */}
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]">
          <h2 className="text-lg font-bold mb-2 text-emerald-400">The Math That Matters</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="text-center">
              <p className="text-4xl font-black text-white">$997</p>
              <p className="text-white/40 text-sm mt-1">Revenue per sale</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-sky-400">~$2.50</p>
              <p className="text-white/40 text-sm mt-1">Cost per lead at scale</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-emerald-400">399x</p>
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

function SubRow({ name, cost, status, description }: { name: string; cost: number; status: "active" | "free"; description: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-green-500" : "bg-white/20"}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{name}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${status === "active" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
            {status === "free" ? "FREE" : "ACTIVE"}
          </span>
        </div>
        <p className="text-xs text-white/40">{description}</p>
      </div>
      <p className="font-semibold">{cost > 0 ? `$${cost.toFixed(2)}` : "Free"}</p>
    </div>
  );
}
