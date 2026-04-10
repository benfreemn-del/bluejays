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
  const contacted = active.filter(
    (p) => p.status === "contacted" || p.status === "responded" || p.status === "paid"
  ).length;
  const responded = active.filter(
    (p) => p.status === "responded" || p.status === "paid"
  ).length;
  const paid = active.filter((p) => p.status === "paid").length;
  // QC gate stats
  const qcPassed = active.filter((p) => p.status === "ready_to_review").length;
  const qcFailed = active.filter((p) => p.status === "qc_failed").length;

  const stats = [
    { label: "Total Prospects", value: total, color: "text-blue-electric", filter: "" },
    { label: "Processing", value: processing, color: "text-cyan-400", filter: "scouted" },
    { label: "Sites Ready", value: generated, color: "text-yellow-400", filter: "pending-review" },
    { label: "QC Passed", value: qcPassed, color: "text-emerald-400", filter: "ready_to_review" },
    { label: "QC Failed", value: qcFailed, color: "text-rose-400", filter: "qc_failed" },
    { label: "Contacted", value: contacted, color: "text-orange-400", filter: "contacted" },
    { label: "Responded", value: responded, color: "text-green-400", filter: "responded" },
    { label: "Paid", value: paid, color: "text-amber-400", filter: "paid" },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {stats.map((stat) => (
        <button
          key={stat.label}
          onClick={() => onFilterStatus?.(activeFilter === stat.filter ? "" : stat.filter)}
          className={`p-4 rounded-xl text-center transition-all cursor-pointer ${
            activeFilter === stat.filter
              ? "bg-blue-electric/10 border-2 border-blue-electric"
              : "bg-surface border border-border hover:border-blue-electric/30"
          }`}
        >
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-muted text-xs mt-1">{stat.label}</p>
        </button>
      ))}
    </div>
  );
}
