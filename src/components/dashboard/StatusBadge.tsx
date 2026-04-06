import type { ProspectStatus } from "@/lib/types";

const statusConfig: Record<
  ProspectStatus,
  { label: string; bg: string; text: string }
> = {
  scouted: { label: "Scouted", bg: "bg-zinc-700", text: "text-zinc-300" },
  scraped: { label: "Scraped", bg: "bg-blue-900/50", text: "text-blue-300" },
  generated: {
    label: "Generated",
    bg: "bg-yellow-900/50",
    text: "text-yellow-300",
  },
  deployed: {
    label: "Deployed",
    bg: "bg-orange-900/50",
    text: "text-orange-300",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-orange-900/50",
    text: "text-orange-300",
  },
  responded: {
    label: "Responded",
    bg: "bg-green-900/50",
    text: "text-green-300",
  },
  paid: { label: "Paid", bg: "bg-amber-900/50", text: "text-amber-300" },
};

export default function StatusBadge({ status }: { status: ProspectStatus }) {
  const config = statusConfig[status] || statusConfig.scouted;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
