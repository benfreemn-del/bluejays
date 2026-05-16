import Link from "next/link";

/**
 * Global 404 — catches every unmatched route across the app. Replaces
 * the bare Next.js default ("This page could not be found") with a
 * BlueJays-branded fallback that routes the visitor back into the
 * funnel instead of letting them bounce.
 *
 * Routes this covers (verified 2026-05-16): /audit/[bad-id], /clients/
 * [non-existent-slug], /proposal/[bad-id], /schedule/[bad-id],
 * /review/[bad-id], /v2/[non-existent-category], plus any totally
 * unknown path.
 *
 * NOTE: /claim/[bad-id], /preview/[bad-id], /lead/[bad-id] do NOT
 * hit this file — they return 200 with their own "loading" state
 * even for invalid IDs. Those are separate bugs worth fixing later
 * (they currently render a fake checkout / infinite spinner for
 * unknown IDs).
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050a14] text-white flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Subtle ambient glows — same palette as Hero */}
      <div
        className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.08] blur-[160px] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-[15%] right-[8%] w-[400px] h-[400px] rounded-full bg-blue-700/[0.1] blur-[140px] pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-sky-400 font-semibold mb-3">
          404 · page not found
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md mx-auto">
          The link may have expired, the page moved, or the URL was mistyped.
          Pick where you want to go next.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/audit"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.55)] active:scale-[0.97] transition-all duration-300"
          >
            Run a free audit →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/15 text-white/75 hover:text-white hover:border-white/30 text-base font-semibold transition-all duration-300"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/35">
          Think this is broken on our end?{" "}
          <a
            href="mailto:bluejaycontactme@gmail.com"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Tell us
          </a>
          .
        </p>
      </div>
    </main>
  );
}
