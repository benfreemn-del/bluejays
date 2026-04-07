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
  const total = prospects.filter((p) => p.status !== "dismissed").length;
  const contacted = prospects.filter(
    (p) => p.status === "contacted" || p.status === "responded" || p.status === "paid"
  ).length;
  const responded = prospects.filter(
    (p) => p.status === "responded" || p.status === "paid"
  ).length;
  const paid = prospects.filter((p) => p.status === "paid").length;
  const generated = prospects.filter(
    (p) => p.status !== "scouted" && p.status !== "scraped" && p.status !== "dismissed"
  ).length;

  const stats = [
    { label: "Total Prospects", value: total, color: "text-blue-electric", filter: "" },
    { label: "Sites Generated", value: generated, color: "text-yellow-400", filter: "generated" },
    { label: "Contacted", value: contacted, color: "text-orange-400", filter: "contacted" },
    { label: "Responded", value: responded, color: "text-green-400", filter: "responded" },
    { label: "Paid", value: paid, color: "text-amber-400", filter: "paid" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
