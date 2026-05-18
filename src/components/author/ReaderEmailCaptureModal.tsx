"use client";

import { useEffect, useState } from "react";

/**
 * Generic reader email-capture modal for indie author clients.
 *
 * Opens when a reader hits a high-intent moment on the bespoke author
 * showcase — finishing the faction quiz, clicking a world-map location,
 * reading to the bottom of a parchment chapter. Submits to
 * /api/clients/[slug]/reader-capture which writes one client_leads row
 * tagged with the source (faction_quiz / world_map / parchment / etc.)
 * so the author can later run different welcome sequences per tag.
 *
 * Replaces the "interactive features capture leads" claim on /agency
 * with actual working capture. Per CLAUDE.md "Series-LTV Reader Funnel"
 * (locked 2026-05-18).
 */

export type ReaderSource =
  | "faction_quiz"
  | "world_map"
  | "parchment_reader"
  | "chapter_one"
  | "preorder"
  | "newsletter"
  | "other";

export type ReaderCaptureContext = {
  faction?: string;       // from faction quiz result
  location?: string;      // from world-map click
  chapter?: string;       // from parchment reader
  book?: string;          // book #1 / book #2 / etc.
};

export default function ReaderEmailCaptureModal({
  slug,
  source,
  context,
  isOpen,
  onClose,
  /** Headline override. Defaults are source-specific. */
  headline,
  /** Subheadline override. */
  subheadline,
  /** Lead-magnet name (the thing they get for signing up). */
  lure = "free chapter and the newsletter",
  /** Accent color tailwind class — defaults to amber. */
  accentClass = "bg-amber-500 hover:bg-amber-400 text-amber-950",
}: {
  slug: string;
  source: ReaderSource;
  context?: ReaderCaptureContext;
  isOpen: boolean;
  onClose: () => void;
  headline?: string;
  subheadline?: string;
  lure?: string;
  accentClass?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setName("");
      setDone(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/clients/${slug}/reader-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          source,
          context: context ?? {},
        }),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.error || "Could not save your email — try again?");
      } else {
        setDone(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const defaultHeadlines: Record<ReaderSource, string> = {
    faction_quiz: context?.faction
      ? `${context.faction} traits suit you — want the exclusive backstory chapter?`
      : "Get the exclusive backstory chapter for your faction",
    world_map: context?.location
      ? `Going deeper on ${context.location}?`
      : "Get the illustrated location map + chapter 1",
    parchment_reader: "Hooked? Get the next chapter free",
    chapter_one: "Send me chapter 1 free",
    preorder: "Be first in line when book 2 drops",
    newsletter: "Join the reader list",
    other: "Get more from the saga",
  };
  const defaultSubs: Record<ReaderSource, string> = {
    faction_quiz:
      "I'll send the chapter to your inbox plus the once-a-month reader letter. Easy unsubscribe.",
    world_map:
      "Detailed map PDF + chapter 1 + once-a-month reader letter. No spam, ever.",
    parchment_reader:
      "Your next chapter, plus monthly updates from the writing desk. Unsubscribe whenever.",
    chapter_one:
      "Sent within 60 seconds. You'll also get the monthly reader letter — unsubscribe anytime.",
    preorder:
      "I'll text you the moment the next book is available for pre-order. One email, then silence.",
    newsletter:
      "One letter per month. Worldbuilding deep-dives, ARC opportunities, occasional giveaways.",
    other:
      "One email per month. Unsubscribe anytime, no hard feelings.",
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-gradient-to-b from-stone-900 to-black p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-100 text-xl leading-none"
        >
          ×
        </button>

        {!done ? (
          <>
            <h2 className="text-xl font-bold text-amber-100 leading-snug pr-6">
              {headline || defaultHeadlines[source]}
            </h2>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              {subheadline || defaultSubs[source]}
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
              {error && (
                <p className="text-xs text-rose-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className={`w-full font-bold rounded-lg py-3 text-sm tracking-wider uppercase disabled:opacity-50 ${accentClass}`}
              >
                {submitting ? "Sending…" : `Send me the ${lure}`}
              </button>
              <p className="text-[10px] text-stone-500 text-center">
                One email per month. Unsubscribe in one click.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✉️</div>
            <h2 className="text-xl font-bold text-amber-100">
              On its way to your inbox.
            </h2>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              Check spam if it doesn&apos;t arrive in 5 minutes. The reader
              letter goes out monthly — see you there.
            </p>
            <button
              onClick={onClose}
              className="mt-5 inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg px-5 py-2.5"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
