"use client";

import { use, useState } from "react";

/**
 * Public ARC reviewer application form.
 *
 * URL: /clients/[slug]/arc/apply
 *
 * Anonymous readers fill this out. Submission writes one row in
 * arc_reviewers with status='applied'. The author triages from the
 * /dashboard/clients/[slug]/arc kanban.
 *
 * Per CLAUDE.md "ARC Reader CRM" pattern.
 */

const PLATFORMS: { value: string; label: string; emoji: string }[] = [
  { value: "amazon", label: "Amazon", emoji: "🅰️" },
  { value: "goodreads", label: "Goodreads", emoji: "📚" },
  { value: "bookbub", label: "BookBub", emoji: "📖" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "tiktok", label: "TikTok", emoji: "🎬" },
  { value: "blog", label: "My book blog", emoji: "✏️" },
  { value: "barnes_noble", label: "Barnes & Noble", emoji: "🛒" },
  { value: "other", label: "Other", emoji: "•" },
];

export default function ArcApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [reach, setReach] = useState("");
  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(p: string) {
    setPlatforms((curr) =>
      curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || platforms.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/clients/${slug}/arc/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          platforms,
          reach_estimate: reach ? Number(reach) : null,
          motivation: motivation.trim() || null,
        }),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.error || "Couldn't submit — try again?");
      } else {
        setDone(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-400 font-bold mb-2">
            Advance Reader Copy · application
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-100">
            Want a free copy before launch?
          </h1>
          <p className="mt-3 text-stone-300 leading-relaxed">
            We send advance reader copies (ARCs) to a small group of
            committed readers two weeks before launch day. In exchange,
            you post an honest review on at least one of the platforms
            you select below within 7 days of receipt. Brief application
            so we make sure the book is right for you.
          </p>
        </header>

        {done ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
            <div className="text-5xl mb-3">✉️</div>
            <h2 className="text-xl font-bold text-emerald-100">
              Application received.
            </h2>
            <p className="mt-2 text-emerald-200/80 leading-relaxed">
              Approvals go out a week before launch. Watch your inbox.
              In the meantime, you'll also be on the monthly reader
              letter — unsubscribe anytime.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-5 rounded-2xl border border-amber-500/20 bg-stone-900/60 p-6"
          >
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Caroline Marsh"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-2">
                Where will you post the review?{" "}
                <span className="text-stone-500 normal-case font-normal">
                  (pick at least one)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                      platforms.includes(p.value)
                        ? "border-amber-400 bg-amber-500/15 text-amber-100"
                        : "border-stone-700 bg-stone-950 text-stone-300 hover:border-stone-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={platforms.includes(p.value)}
                      onChange={() => togglePlatform(p.value)}
                    />
                    <span>{p.emoji}</span>
                    <span className="text-sm font-semibold">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                Approx. follower / subscriber count{" "}
                <span className="text-stone-500 normal-case font-normal">
                  (optional, across all platforms)
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={reach}
                onChange={(e) => setReach(e.target.value)}
                placeholder="500"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                Why do you want to read this?{" "}
                <span className="text-stone-500 normal-case font-normal">
                  (1-2 sentences, optional)
                </span>
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={3}
                placeholder="Loved the first book / a friend recommended you / faction quiz said I was Marauder…"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim() || platforms.length === 0}
              className="w-full text-sm font-bold uppercase tracking-wider rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-amber-950 py-3"
            >
              {submitting ? "Sending…" : "Submit application"}
            </button>
            <p className="text-[10px] text-stone-500 text-center">
              We pick about 50 reviewers per launch. Approvals go out a
              week before launch day.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
