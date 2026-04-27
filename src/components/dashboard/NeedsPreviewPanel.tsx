"use client";

import { useEffect, useState } from "react";

type PreviewCandidate = {
  prospectId: string;
  businessName: string;
  email: string;
  phone: string | null;
  city: string;
  state: string;
  category: string;
  auditId: string;
  auditEmailStep: number;
  lastAuditEmailAt: string | null;
  daysSinceLastEmail: number | null;
  generateUrl: string;
};

/**
 * Dashboard tile — audit prospects who completed the 5-email Hormozi
 * sequence but haven't converted and have no preview site yet.
 *
 * Ben generates a preview for each via /lead/[id]. Once the preview
 * exists, the daily followup-cron graduates them to "approved" and
 * the auto-enroll cron starts the cold outreach funnel.
 *
 * Empty-state renders nothing so the dashboard stays clean when
 * the queue is clear.
 */
export default function NeedsPreviewPanel() {
  const [candidates, setCandidates] = useState<PreviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit/needs-preview")
      .then((r) => r.json())
      .then((data) => {
        setCandidates(data.prospects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || candidates.length === 0) return null;

  return (
    <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-fuchsia-500 text-white text-xs font-bold">
            {candidates.length}
          </span>
          <h3 className="text-sm font-semibold text-fuchsia-200">
            Needs Preview — Audit Complete, No Close
          </h3>
        </div>
        <span className="text-xs text-fuchsia-400/70">
          Generate a preview → they enter the cold funnel
        </span>
      </div>

      <div className="space-y-2">
        {candidates.map((c) => (
          <div
            key={c.auditId}
            className="flex items-center justify-between rounded-lg bg-fuchsia-900/20 border border-fuchsia-500/20 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{c.businessName}</p>
              <p className="text-xs text-fuchsia-300/70">
                {c.category} · {c.city}, {c.state}
                {c.daysSinceLastEmail !== null
                  ? ` · Email 5 sent ${c.daysSinceLastEmail}d ago`
                  : ""}
              </p>
            </div>
            <a
              href={c.generateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 shrink-0 inline-flex items-center gap-1 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 px-2.5 py-1 text-xs font-medium text-fuchsia-200 hover:bg-fuchsia-500/30 transition-colors"
            >
              Generate →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
