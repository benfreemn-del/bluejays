"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChartBar,
  Funnel,
  TrendUp,
  TrendDown,
  Warning,
  Lightning,
  CurrencyDollar,
  Envelope,
  Eye,
  CursorClick,
  ChatCircle,
  Trophy,
  ArrowClockwise,
} from "@phosphor-icons/react";

// ==================== TYPES ====================

interface FunnelStageData {
  stage: string;
  count: number;
  rate: number;
  dropOff: number;
  dropOffRate: number;
}

interface CategoryBreakdown {
  category: string;
  label: string;
  total: number;
  contacted: number;
  opened: number;
  clicked: number;
  responded: number;
  claimed: number;
  paid: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  claimRate: number;
  conversionRate: number;
}

interface DailyMetric {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  responded: number;
  claimed: number;
  paid: number;
  openRate: number;
  clickRate: number;
}

interface AnalyticsData {
  overview: {
    totalProspects: number;
    totalContacted: number;
    totalOpened: number;
    totalClicked: number;
    totalResponded: number;
    totalClaimed: number;
    totalPaid: number;
    overallOpenRate: number;
    overallClickRate: number;
    overallResponseRate: number;
    overallClaimRate: number;
    overallConversionRate: number;
    revenue: number;
  };
  funnel: FunnelStageData[];
  byCategory: CategoryBreakdown[];
  byDay: DailyMetric[];
  topPerformingCategories: Array<{ category: string; label: string; conversionRate: number; count: number }>;
  bottlenecks: Array<{ from: string; to: string; dropOffRate: number; suggestion: string }>;
}

// ==================== MINI CHART COMPONENTS ====================

function BarChart({ data, maxVal, color }: { data: number[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm min-w-[3px] transition-all"
          style={{
            height: `${maxVal > 0 ? Math.max(2, (val / maxVal) * 100) : 2}%`,
            backgroundColor: color,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function FunnelChart({ stages }: { stages: FunnelStageData[] }) {
  const maxCount = stages.length > 0 ? stages[0].count : 1;
  return (
    <div className="space-y-1.5">
      {stages.map((stage, i) => {
        const width = maxCount > 0 ? Math.max(8, (stage.count / maxCount) * 100) : 8;
        const colors = [
          "bg-blue-500", "bg-blue-400", "bg-cyan-400", "bg-teal-400",
          "bg-green-400", "bg-emerald-400", "bg-yellow-400", "bg-orange-400", "bg-red-400",
        ];
        return (
          <div key={stage.stage} className="flex items-center gap-3">
            <div className="w-24 text-xs text-muted text-right shrink-0">{stage.stage}</div>
            <div className="flex-1 relative">
              <div
                className={`h-7 ${colors[i % colors.length]} rounded-r-md flex items-center transition-all`}
                style={{ width: `${width}%` }}
              >
                <span className="text-[10px] font-bold text-white px-2 whitespace-nowrap">
                  {stage.count}
                </span>
              </div>
            </div>
            <div className="w-16 text-right shrink-0">
              {i > 0 && stage.dropOffRate > 0 ? (
                <span className={`text-[10px] ${stage.dropOffRate > 50 ? "text-red-400" : stage.dropOffRate > 30 ? "text-yellow-400" : "text-muted"}`}>
                  -{stage.dropOffRate}%
                </span>
              ) : (
                <span className="text-[10px] text-muted">{stage.rate}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"funnel" | "category" | "daily">("funnel");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/funnel-analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400">Failed to load analytics data.</div>
      </div>
    );
  }

  const { overview, funnel, byCategory, byDay, topPerformingCategories, bottlenecks } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <h1 className="text-xl font-bold">Funnel Analytics</h1>
            <span className="text-xs text-muted bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ArrowClockwise size={14} />
              Refresh
            </button>
            <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">Dashboard</a>
            <a href="/deliverability" className="text-sm text-muted hover:text-foreground transition-colors">Deliverability</a>
            <a href="/spending" className="text-sm text-muted hover:text-foreground transition-colors">Spending</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPICard icon={<Envelope size={18} />} label="Contacted" value={overview.totalContacted} color="text-blue-400" />
          <KPICard icon={<Eye size={18} />} label="Open Rate" value={`${overview.overallOpenRate}%`} color="text-cyan-400" />
          <KPICard icon={<CursorClick size={18} />} label="Click Rate" value={`${overview.overallClickRate}%`} color="text-teal-400" />
          <KPICard icon={<ChatCircle size={18} />} label="Response Rate" value={`${overview.overallResponseRate}%`} color="text-green-400" />
          <KPICard icon={<Trophy size={18} />} label="Claim Rate" value={`${overview.overallClaimRate}%`} color="text-yellow-400" />
          <KPICard icon={<Lightning size={18} />} label="Conversion" value={`${overview.overallConversionRate}%`} color="text-orange-400" />
          <KPICard icon={<CurrencyDollar size={18} />} label="Revenue" value={`$${overview.revenue.toLocaleString()}`} color="text-emerald-400" />
        </div>

        {/* Funnel Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Funnel size={20} className="text-blue-400" />
              <h2 className="text-lg font-bold">Conversion Funnel</h2>
            </div>
            <FunnelChart stages={funnel} />
          </div>

          {/* Bottleneck Alerts */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Warning size={20} className="text-orange-400" />
              <h2 className="text-lg font-bold">Drop-off Alerts</h2>
            </div>
            {bottlenecks.length === 0 ? (
              <div className="text-sm text-muted py-4 text-center">
                No significant bottlenecks detected.
              </div>
            ) : (
              <div className="space-y-3">
                {bottlenecks.map((b, i) => (
                  <div key={i} className="p-3 bg-orange-400/5 border border-orange-400/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {b.from} → {b.to}
                      </span>
                      <span className="text-sm font-bold text-red-400">-{b.dropOffRate}%</span>
                    </div>
                    <p className="text-xs text-muted">{b.suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Top Performing Categories */}
            {topPerformingCategories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <TrendUp size={14} className="text-green-400" />
                  Top Categories
                </h3>
                <div className="space-y-2">
                  {topPerformingCategories.map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {i + 1}. {c.label}
                      </span>
                      <span className="font-medium text-green-400">{c.conversionRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 w-fit">
          {(["funnel", "category", "daily"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-blue-500/20 text-blue-400 font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab === "funnel" ? "By Funnel Step" : tab === "category" ? "By Category" : "By Day"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "funnel" && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ChartBar size={20} className="text-blue-400" />
              Funnel Step Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted font-medium">Stage</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Count</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">% of Total</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Drop-off</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Drop-off %</th>
                    <th className="text-left py-2 px-3 text-muted font-medium w-48">Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {funnel.map((stage, i) => (
                    <tr key={stage.stage} className="border-b border-border/50 hover:bg-background/50">
                      <td className="py-2.5 px-3 font-medium">{stage.stage}</td>
                      <td className="py-2.5 px-3 text-right">{stage.count}</td>
                      <td className="py-2.5 px-3 text-right">{stage.rate}%</td>
                      <td className="py-2.5 px-3 text-right">
                        {i > 0 ? (
                          <span className="text-red-400">-{stage.dropOff}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {i > 0 ? (
                          <span className={stage.dropOffRate > 50 ? "text-red-400 font-bold" : stage.dropOffRate > 30 ? "text-yellow-400" : "text-muted"}>
                            {stage.dropOffRate}%
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-400 transition-all"
                            style={{ width: `${stage.rate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "category" && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ChartBar size={20} className="text-blue-400" />
              Category Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted font-medium">Category</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Total</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Contacted</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Open %</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Click %</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Response %</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Claim %</th>
                    <th className="text-right py-2 px-3 text-muted font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.map((cat) => (
                    <tr key={cat.category} className="border-b border-border/50 hover:bg-background/50">
                      <td className="py-2.5 px-3 font-medium">{cat.label}</td>
                      <td className="py-2.5 px-3 text-right">{cat.total}</td>
                      <td className="py-2.5 px-3 text-right">{cat.contacted}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cat.openRate >= 30 ? "text-green-400" : cat.openRate >= 15 ? "text-yellow-400" : "text-muted"}>
                          {cat.openRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cat.clickRate >= 10 ? "text-green-400" : "text-muted"}>
                          {cat.clickRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cat.responseRate >= 5 ? "text-green-400" : "text-muted"}>
                          {cat.responseRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cat.claimRate > 0 ? "text-green-400 font-bold" : "text-muted"}>
                          {cat.claimRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {cat.paid > 0 ? (
                          <span className="text-emerald-400">{cat.paid}</span>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "daily" && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ChartBar size={20} className="text-blue-400" />
              Daily Trends (Last 30 Days)
            </h2>

            {byDay.length === 0 ? (
              <div className="text-center text-muted py-8">No daily data available yet.</div>
            ) : (
              <>
                {/* Mini chart */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted mb-1">Emails Sent</p>
                    <BarChart data={byDay.map((d) => d.sent)} maxVal={Math.max(...byDay.map((d) => d.sent), 1)} color="#3b82f6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Opens</p>
                    <BarChart data={byDay.map((d) => d.opened)} maxVal={Math.max(...byDay.map((d) => d.opened), 1)} color="#06b6d4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Clicks</p>
                    <BarChart data={byDay.map((d) => d.clicked)} maxVal={Math.max(...byDay.map((d) => d.clicked), 1)} color="#22c55e" />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-surface">
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-muted font-medium">Date</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Sent</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Opened</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Clicked</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Open %</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Click %</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Responded</th>
                        <th className="text-right py-2 px-3 text-muted font-medium">Claimed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byDay].reverse().map((day) => (
                        <tr key={day.date} className="border-b border-border/50 hover:bg-background/50">
                          <td className="py-2 px-3 font-mono text-xs">{day.date}</td>
                          <td className="py-2 px-3 text-right">{day.sent}</td>
                          <td className="py-2 px-3 text-right">{day.opened}</td>
                          <td className="py-2 px-3 text-right">{day.clicked}</td>
                          <td className="py-2 px-3 text-right">
                            <span className={day.openRate >= 30 ? "text-green-400" : day.openRate >= 15 ? "text-yellow-400" : "text-muted"}>
                              {day.openRate}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className={day.clickRate >= 10 ? "text-green-400" : "text-muted"}>
                              {day.clickRate}%
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {day.responded > 0 ? (
                              <span className="text-green-400 font-bold">{day.responded}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {day.claimed > 0 ? (
                              <span className="text-emerald-400 font-bold">{day.claimed}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ==================== KPI CARD COMPONENT ====================

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}
