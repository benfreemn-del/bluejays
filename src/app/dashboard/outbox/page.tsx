/**
 * /dashboard/outbox — Ben-only dashboard for pending bj ai draft-touch
 * approvals. Each row shows the prospect + drafted subject + body +
 * tone notes + reasoning, with one-tap Approve / Reject buttons.
 *
 * Companion to the SMS-reply approval flow ("YES <code>" / "NO <code>"
 * from OWNER_PHONE_NUMBER, handled in /api/inbound/sms). Use whichever
 * is faster — both hit the same approveOutboxDraft helper.
 *
 * Server component — fetches on every load. Listed under /dashboard so
 * middleware admin gate applies automatically.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { listPendingDrafts } from "@/lib/outbox";
import OutboxApprovalControls from "./OutboxApprovalControls";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Outbox — BlueJays Dashboard",
  robots: { index: false, follow: false },
};

type ProspectMini = {
  id: string;
  business_name: string | null;
  email: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
};

export default async function OutboxPage() {
  const drafts = await listPendingDrafts(100);

  // Pull every prospect referenced in one batched query so the page is
  // a single round-trip beyond the drafts query.
  const prospectIds = Array.from(new Set(drafts.map((d) => d.prospect_id)));
  let prospectMap = new Map<string, ProspectMini>();
  if (prospectIds.length > 0 && isSupabaseConfigured()) {
    const { data: rows } = await supabase
      .from("prospects")
      .select("id, business_name, email, category, city, state")
      .in("id", prospectIds);
    if (rows) {
      for (const r of rows as ProspectMini[]) prospectMap.set(r.id, r);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-base font-semibold text-white">Outbox</h1>
          <span className="text-xs text-slate-500 tabular-nums">
            {drafts.length} pending
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Nothing pending
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Run{" "}
              <code className="font-mono text-slate-300">
                bj ai draft-touch --prospect-id &lt;uuid&gt;
              </code>{" "}
              to draft a new outreach touch. Approved drafts ship via SendGrid;
              rejected drafts disappear from this list.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {drafts.map((d) => {
              const p = prospectMap.get(d.prospect_id);
              const businessName = p?.business_name || "(prospect)";
              const ageMin = Math.floor(
                (Date.now() - new Date(d.created_at).getTime()) / 60_000,
              );
              return (
                <li
                  key={d.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden"
                >
                  {/* Header strip */}
                  <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base font-semibold text-white truncate">
                          {businessName}
                        </span>
                        {p?.category && (
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="font-mono text-sky-300/80">
                          {d.short_code}
                        </span>
                        <span>·</span>
                        <span>{d.channel}</span>
                        <span>·</span>
                        <span>{ageMin < 60 ? `${ageMin}m ago` : `${Math.floor(ageMin / 60)}h ago`}</span>
                        {p?.email && (
                          <>
                            <span>·</span>
                            <span className="truncate">{p.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <OutboxApprovalControls
                      id={d.id}
                      shortCode={d.short_code}
                    />
                  </div>

                  {/* Subject + body */}
                  <div className="px-6 py-4 space-y-3">
                    {d.subject && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                          Subject
                        </p>
                        <p className="text-sm text-white font-medium">
                          {d.subject}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                        Body
                      </p>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {d.body}
                      </p>
                    </div>
                    {(d.tone_notes || d.reasoning) && (
                      <details className="text-xs text-slate-500">
                        <summary className="cursor-pointer hover:text-slate-300 transition-colors">
                          Why this angle?
                        </summary>
                        <div className="mt-2 space-y-1 pl-3 border-l border-white/10">
                          {d.tone_notes && (
                            <p>
                              <span className="text-slate-600">Tone:</span>{" "}
                              {d.tone_notes}
                            </p>
                          )}
                          {d.reasoning && (
                            <p>
                              <span className="text-slate-600">Reasoning:</span>{" "}
                              {d.reasoning}
                            </p>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
