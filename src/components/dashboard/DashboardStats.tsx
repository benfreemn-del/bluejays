import type { Prospect } from "@/lib/types";
import {
  type CategoryGroup,
  CATEGORY_GROUP_LABEL,
  CATEGORY_GROUP_EMOJI,
  getCategoryGroup,
} from "@/lib/category-groups";

interface DashboardStatsProps {
  prospects: Prospect[];
  onFilterStatus?: (status: string) => void;
  activeFilter?: string;
}

export default function DashboardStats({
  prospects,
  onFilterStatus,
  activeFilter,
}: DashboardStatsProps) {
  const active = prospects.filter((p) => p.status !== "dismissed");
  const total = active.length;
  const processing = active.filter(
    (p) => p.status === "scouted" || p.status === "scraped" || p.status === "generated"
  ).length;
  const generated = active.filter(
    (p) => p.generatedSiteUrl && p.status !== "scouted" && p.status !== "scraped" && p.status !== "generated"
  ).length;
  // "Contacted" = we have made contact in any form. Cold-outreach
  // pitches (status='contacted'), engagement signals (email_opened,
  // link_clicked, engaged), inbound interactions (audit_preview_
  // requested = clicked CTA, audit_marketing = manually tagged after
  // a call, fullsystem_inquiry = booked discovery), all the way
  // through to live customers — any of these mean we've touched
  // them. Was previously only counting (contacted, responded, paid)
  // which missed every audit-funnel touch + every post-paid stage.
  const CONTACTED_STATUSES = new Set([
    "contacted",
    "email_opened",
    "engaged",
    "link_clicked",
    "responded",
    "interested",
    "claimed",
    "paid",
    "dns_transfer",
    "live",
    "audit_preview_requested",
    "audit_marketing",
    "fullsystem_inquiry",
  ]);
  const PAID_STATUSES = new Set(["paid", "dns_transfer", "live"]);
  const RESPONDED_STATUSES = new Set([
    "responded",
    "interested",
    "claimed",
    "paid",
    "dns_transfer",
    "live",
  ]);

  const contacted = active.filter((p) => CONTACTED_STATUSES.has(p.status)).length;
  const responded = active.filter((p) => RESPONDED_STATUSES.has(p.status)).length;
  const paid = active.filter((p) => PAID_STATUSES.has(p.status)).length;
  const qcPassed = active.filter((p) => p.status === "ready_to_review").length;
  const qcFailed = active.filter((p) => p.status === "qc_failed").length;
  const approved = active.filter((p) => p.status === "approved").length;

  const stats = [
    { label: "Prospects", value: total, color: "text-blue-electric", filter: "" },
    { label: "Processing", value: processing, color: "text-cyan-400", filter: "scouted" },
    { label: "QC Pass", value: qcPassed, color: "text-emerald-400", filter: "ready_to_review" },
    { label: "QC Fail", value: qcFailed, color: "text-rose-400", filter: "qc_failed" },
    { label: "Approved", value: approved, color: "text-green-500", filter: "approved" },
    { label: "Contacted", value: contacted, color: "text-orange-400", filter: "contacted" },
    { label: "Replied", value: responded, color: "text-green-400", filter: "responded" },
    { label: "Paid", value: paid, color: "text-amber-400", filter: "paid" },
  ];

  // 2D matrix — Hormozi backend review C2 (2026-05-16). Slices the
  // same active-prospect set by vertical (manufacturer / author /
  // service) so Ben can see at a glance: "Manufacturer pipeline is
  // 12 wide, 2 paid; Service is 145 wide, 8 paid." Pairs with the
  // status-only row above for a quick orientation read.
  const groups: CategoryGroup[] = ["manufacturer", "author", "service"];
  const byGroup: Record<CategoryGroup, { total: number; contacted: number; paid: number }> = {
    manufacturer: { total: 0, contacted: 0, paid: 0 },
    author: { total: 0, contacted: 0, paid: 0 },
    service: { total: 0, contacted: 0, paid: 0 },
  };
  for (const p of active) {
    const g = getCategoryGroup(p.category);
    byGroup[g].total += 1;
    if (CONTACTED_STATUSES.has(p.status)) byGroup[g].contacted += 1;
    if (PAID_STATUSES.has(p.status)) byGroup[g].paid += 1;
  }

  const GROUP_ACCENT: Record<CategoryGroup, string> = {
    manufacturer: "border-amber-500/20 bg-amber-500/[0.04] text-amber-300",
    author: "border-violet-500/20 bg-violet-500/[0.04] text-violet-300",
    service: "border-sky-500/20 bg-sky-500/[0.04] text-sky-300",
  };

  return (
    <div className="space-y-3">
      {/* Status row — 8 tiles, 1D (status) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => onFilterStatus?.(activeFilter === stat.filter ? "" : stat.filter)}
            className={`rounded-xl px-3 py-4 text-center transition-all cursor-pointer ${
              activeFilter === stat.filter
                ? "bg-blue-electric/10 border-2 border-blue-electric"
                : "bg-surface border border-border hover:border-blue-electric/30"
            }`}
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-muted whitespace-nowrap">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Vertical breakdown — 3 tiles, 2D (status × category-group).
          Hormozi: pairs the funnel-stage view above with a vertical
          view so the manufacturer-vs-service pipeline gap is visible. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {groups.map((g) => {
          const stats = byGroup[g];
          return (
            <div
              key={g}
              className={`rounded-xl border p-3.5 ${GROUP_ACCENT[g]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>{CATEGORY_GROUP_EMOJI[g]}</span>
                  {CATEGORY_GROUP_LABEL[g]}
                </p>
                <p className="text-xl font-bold text-white tabular-nums">{stats.total}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-black/20 border border-white/[0.04] px-2.5 py-1.5">
                  <p className="text-white/40 uppercase tracking-wider">Contacted</p>
                  <p className="text-white font-bold tabular-nums">{stats.contacted}</p>
                </div>
                <div className="rounded-lg bg-black/20 border border-white/[0.04] px-2.5 py-1.5">
                  <p className="text-white/40 uppercase tracking-wider">Paid</p>
                  <p className="text-white font-bold tabular-nums">{stats.paid}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
