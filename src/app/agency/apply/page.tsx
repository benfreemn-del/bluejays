import type { Metadata } from "next";
import Link from "next/link";
import ApplyForm from "./ApplyForm";

// Apply funnel for the AI Marketing System ($10K full system).
//
// noindex/nofollow — bottom of the funnel, reached only via /agency.
// Keeping it out of search prevents it from outranking the offer page.
export const metadata: Metadata = {
  title: "Apply — AI Marketing System | BlueJays",
  description:
    "Apply for the BlueJays AI Marketing System. We only take customers we can actually help — this 8-question form helps us decide if we're a fit.",
  robots: { index: false, follow: false },
};

export default function AgencyApplyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        {/* Lightweight header — keep focus on the form */}
        <div className="mb-8">
          <Link
            href="/agency"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <span aria-hidden>←</span>
            <span>Back to the system overview</span>
          </Link>
        </div>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-violet-400 font-semibold mb-3">
            Step 1 of 2 — Application
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Tell us about your business.
          </h1>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
            We turn down most applicants because the AI Marketing System only
            works for a specific kind of business. Eight quick questions. If
            we&apos;re a fit, we&apos;ll send you Ben&apos;s calendar within 24
            hours to book a 30-minute strategy call. If we&apos;re not,
            we&apos;ll tell you why and send you somewhere that can actually
            help.
          </p>
        </header>

        <ApplyForm />

        <p className="mt-10 text-xs text-slate-500 text-center">
          Your information is private and only seen by Ben at BlueJays. We
          don&apos;t sell or share applicant data — full stop.
        </p>
      </div>
    </main>
  );
}
