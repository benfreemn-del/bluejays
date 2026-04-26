import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";
import { getDefaultTemplateForCategory, TEMPLATES } from "@/lib/review-blast-templates";
import ReviewBlastForm from "./ReviewBlastForm";

/**
 * /review-blast/[id] — public submission page for paid Review Blast
 * customers. The `id` path param is the upsell row UUID — its presence
 * IS the credential (URL-as-secret pattern, same as /client/[id]).
 *
 * Per CLAUDE.md "Review Blast Wave 1" spec (#10A): customer pastes
 * up to 50 phone numbers (one per line), picks a category template,
 * submits. We queue the submission with status='pending_a2p' until
 * A2P 10DLC approves; then the cron dispatches all 50 SMS within 1
 * hour.
 *
 * Optional + fillable whenever — no urgency banner, no countdown.
 * The customer can come back and submit anytime after their $99
 * Review Blast purchase.
 *
 * NOT in PROTECTED_PATHS (middleware) — this is a customer-facing
 * route, gated by knowledge of the upsell UUID.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Review Blast — Submit Your Customer List",
  robots: { index: false, follow: false }, // never let search index this
};

export default async function ReviewBlastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: upsellId } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  // Look up the upsell row + verify it's a paid review_blast SKU.
  const { data: upsell } = await supabase
    .from("upsells")
    .select("id, prospect_id, sku, status")
    .eq("id", upsellId)
    .maybeSingle();

  if (!upsell || upsell.sku !== "review_blast") {
    notFound();
  }

  if (upsell.status !== "paid" && upsell.status !== "fulfilled") {
    return (
      <main className="mx-auto max-w-2xl p-8 text-slate-100">
        <h1 className="text-2xl font-semibold mb-4">Review Blast — Pending Payment</h1>
        <p className="text-slate-300 mb-6">
          This Review Blast hasn&apos;t been paid for yet. Once payment
          completes, you&apos;ll be able to submit your customer list here.
        </p>
        <Link href="/" className="text-sky-400 hover:underline">
          ← Back to BlueJays
        </Link>
      </main>
    );
  }

  const prospect = await getProspect(upsell.prospect_id as string);
  if (!prospect) notFound();

  // Check for existing submission so we can render the right state.
  const { data: existing } = await supabase
    .from("review_blast_submissions")
    .select("id, status, sms_count_target, sms_count_sent, sms_count_failed, submitted_at, dispatched_at, completed_at")
    .eq("upsell_id", upsellId)
    .maybeSingle();

  const defaultTemplateKey = getDefaultTemplateForCategory(prospect.category);

  return (
    <main className="mx-auto max-w-2xl p-8 text-slate-100">
      <header className="mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          Review Blast — {prospect.businessName}
        </p>
        <h1 className="text-2xl font-semibold">
          Submit your customer list
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Paste up to 50 phone numbers below. We&apos;ll text each customer
          a friendly request to leave you a review. Five-star reviews
          land on Google; under-five-star feedback comes privately to
          your email so you can address it directly.
        </p>
      </header>

      {existing ? (
        <ExistingSubmissionPanel submission={existing} />
      ) : (
        <ReviewBlastForm
          upsellId={upsellId}
          businessName={prospect.businessName}
          defaultTemplateKey={defaultTemplateKey}
          templates={TEMPLATES}
        />
      )}

      <footer className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500">
        <p>
          By submitting, you confirm these are your own past customers
          who have an existing relationship with {prospect.businessName}.
          BlueJays sends the SMS on your behalf and complies with
          carrier opt-out (STOP/HELP) rules. Replies route to{" "}
          {prospect.email || "your business email on file"}.
        </p>
      </footer>
    </main>
  );
}

function ExistingSubmissionPanel({
  submission,
}: {
  submission: {
    id: string;
    status: string;
    sms_count_target: number;
    sms_count_sent: number;
    sms_count_failed: number;
    submitted_at: string;
    dispatched_at: string | null;
    completed_at: string | null;
  };
}) {
  const STATUS_LABELS: Record<string, string> = {
    pending_a2p: "Submitted — waiting on carrier approval",
    pending_dispatch: "Submitted — queued for delivery",
    dispatching: "Sending now…",
    sent: "Delivered",
    failed: "Failed — please email bluejaycontactme@gmail.com",
    cancelled: "Cancelled",
  };

  const STATUS_COLOR: Record<string, string> = {
    pending_a2p: "bg-amber-900/40 border-amber-700",
    pending_dispatch: "bg-amber-900/40 border-amber-700",
    dispatching: "bg-sky-900/40 border-sky-700",
    sent: "bg-emerald-900/40 border-emerald-700",
    failed: "bg-rose-900/40 border-rose-700",
    cancelled: "bg-slate-900/40 border-slate-700",
  };

  return (
    <div className={`rounded-lg border p-6 ${STATUS_COLOR[submission.status] || "bg-slate-900/40 border-slate-700"}`}>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
      <h2 className="text-lg font-semibold mb-3">
        {STATUS_LABELS[submission.status] || submission.status}
      </h2>

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-slate-400">Phone numbers submitted:</span>{" "}
          <span className="font-mono">{submission.sms_count_target}</span>
        </p>
        {submission.dispatched_at && (
          <p>
            <span className="text-slate-400">SMS sent:</span>{" "}
            <span className="font-mono">{submission.sms_count_sent}</span>
          </p>
        )}
        {submission.sms_count_failed > 0 && (
          <p>
            <span className="text-slate-400">SMS failed:</span>{" "}
            <span className="font-mono text-rose-400">{submission.sms_count_failed}</span>
          </p>
        )}
        <p>
          <span className="text-slate-400">Submitted:</span>{" "}
          {new Date(submission.submitted_at).toLocaleString()}
        </p>
        {submission.completed_at && (
          <p>
            <span className="text-slate-400">Completed:</span>{" "}
            {new Date(submission.completed_at).toLocaleString()}
          </p>
        )}
      </div>

      {submission.status === "pending_a2p" && (
        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          Your list is queued. We&apos;re currently waiting on a regulatory
          approval from carriers (called A2P 10DLC) before any SMS can
          send — this is a one-time approval that typically takes 1-2
          weeks. The moment it&apos;s approved, your 50 SMS automatically
          dispatch within an hour. You don&apos;t need to do anything.
        </p>
      )}
    </div>
  );
}
