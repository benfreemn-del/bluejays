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
  "pending-review": {
    label: "Needs Review",
    bg: "bg-red-900/50",
    text: "text-red-300",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-900/50",
    text: "text-emerald-300",
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
  engaged: {
    label: "Engaged",
    bg: "bg-cyan-900/50",
    text: "text-cyan-300",
  },
  link_clicked: {
    label: "Link Clicked",
    bg: "bg-teal-900/50",
    text: "text-teal-300",
  },
  responded: {
    label: "Responded",
    bg: "bg-green-900/50",
    text: "text-green-300",
  },
  interested: {
    label: "Interested",
    bg: "bg-lime-900/50",
    text: "text-lime-300",
  },
  claimed: {
    label: "Claimed",
    bg: "bg-violet-900/50",
    text: "text-violet-300",
  },
  paid: { label: "Paid", bg: "bg-amber-900/50", text: "text-amber-300" },
  dismissed: { label: "Dismissed", bg: "bg-zinc-800/50", text: "text-zinc-500" },
  unsubscribed: {
    label: "Unsubscribed",
    bg: "bg-red-900/50",
    text: "text-red-400",
  },
  "pro-bono": { label: "Pro Bono", bg: "bg-amber-900/50", text: "text-amber-300" },
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
