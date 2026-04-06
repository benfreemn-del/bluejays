import type { Prospect } from "@/lib/types";

export default function DashboardStats({
  prospects,
}: {
  prospects: Prospect[];
}) {
  const total = prospects.length;
  const contacted = prospects.filter(
    (p) =>
      p.status === "contacted" ||
      p.status === "responded" ||
      p.status === "paid"
  ).length;
  const responded = prospects.filter(
    (p) => p.status === "responded" || p.status === "paid"
  ).length;
  const paid = prospects.filter((p) => p.status === "paid").length;
  const generated = prospects.filter(
    (p) => p.status !== "scouted" && p.status !== "scraped"
  ).length;

  const stats = [
    { label: "Total Prospects", value: total, color: "text-blue-electric" },
    { label: "Sites Generated", value: generated, color: "text-yellow-400" },
    { label: "Contacted", value: contacted, color: "text-orange-400" },
    { label: "Responded", value: responded, color: "text-green-400" },
    { label: "Paid", value: paid, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-xl bg-surface border border-border text-center"
        >
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-muted text-xs mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
