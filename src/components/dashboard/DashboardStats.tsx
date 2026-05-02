import type { Prospect } from "@/lib/types";

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
  const contacted = active.filter((p) => CONTACTED_STATUSES.has(p.status)).length;
  const responded = active.filter(
    (p) =>
      p.status === "responded" ||
      p.status === "interested" ||
      p.status === "claimed" ||
      p.status === "paid" ||
      p.status === "dns_transfer" ||
      p.status === "live"
  ).length;
  const paid = active.filter(
    (p) => p.status === "paid" || p.status === "dns_transfer" || p.status === "live"
  ).length;
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

  return (
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
  );
}
