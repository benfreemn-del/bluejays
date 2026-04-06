import type { Prospect, Category, ProspectStatus } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface ProspectTableProps {
  prospects: Prospect[];
  categoryFilter: string;
  statusFilter: string;
  onCategoryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSelectProspect: (p: Prospect) => void;
  onSendEmail: (p: Prospect) => void;
}

const allStatuses: ProspectStatus[] = [
  "scouted",
  "scraped",
  "generated",
  "pending-review",
  "approved",
  "deployed",
  "contacted",
  "responded",
  "paid",
];

export default function ProspectTable({
  prospects,
  categoryFilter,
  statusFilter,
  onCategoryChange,
  onStatusChange,
  onSelectProspect,
  onSendEmail,
}: ProspectTableProps) {
  const filtered = prospects.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground"
        >
          <option value="">All Categories</option>
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_CONFIG[cat].label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-surface border border-border text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <span className="h-10 flex items-center text-muted text-sm">
          {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-light border-b border-border">
              <th className="text-left p-3 font-medium text-muted">
                Business
              </th>
              <th className="text-left p-3 font-medium text-muted">
                Category
              </th>
              <th className="text-left p-3 font-medium text-muted">City</th>
              <th className="text-left p-3 font-medium text-muted">Rating</th>
              <th className="text-left p-3 font-medium text-muted">Status</th>
              <th className="text-left p-3 font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prospect) => (
              <tr
                key={prospect.id}
                className="border-b border-border hover:bg-surface-light/50 cursor-pointer transition-colors"
                onClick={() => onSelectProspect(prospect)}
              >
                <td className="p-3">
                  <div>
                    <p className="font-medium">{prospect.businessName}</p>
                    {prospect.phone && (
                      <p className="text-muted text-xs">{prospect.phone}</p>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        CATEGORY_CONFIG[prospect.category]?.accentColor + "20",
                      color:
                        CATEGORY_CONFIG[prospect.category]?.accentColor,
                    }}
                  >
                    {CATEGORY_CONFIG[prospect.category]?.label}
                  </span>
                </td>
                <td className="p-3 text-muted">{prospect.city}</td>
                <td className="p-3">
                  {prospect.googleRating && (
                    <span className="text-yellow-400">
                      {prospect.googleRating} ({prospect.reviewCount})
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <StatusBadge status={prospect.status} />
                </td>
                <td className="p-3">
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {prospect.generatedSiteUrl && (
                      <a
                        href={prospect.generatedSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-electric/10 text-blue-electric hover:bg-blue-electric/20 transition-colors"
                      >
                        Preview
                      </a>
                    )}
                    {prospect.email && prospect.generatedSiteUrl && (
                      <button
                        onClick={() => onSendEmail(prospect)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        Email
                      </button>
                    )}
                    {prospect.generatedSiteUrl && (
                      <button
                        onClick={() => onSelectProspect(prospect)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                      >
                        IG DM
                      </button>
                    )}
                    {prospect.phone && (
                      <button
                        onClick={async () => {
                          await fetch("/api/call-lists", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ prospectId: prospect.id, action: "add" }),
                          });
                          alert(`${prospect.businessName} added to priority call list!`);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                      >
                        Call
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No prospects found. Run a scout to find businesses!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
