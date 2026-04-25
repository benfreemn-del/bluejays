"use client";

import { useState } from "react";

interface Props {
  code: string;
  variant: "promoter" | "passive" | "detractor";
  score: number | undefined;
  firstName: string;
  businessName: string;
  referralUrl: string;
}

/**
 * Client half of the NPS thanks page. Renders one of three variants:
 *
 *   - promoter  → celebration + referral amplification surface
 *   - passive   → "what would have made it a 9 or 10?" textarea
 *   - detractor → "what went wrong? I want to fix it." textarea +
 *                 explicit 24-hour personal-outreach promise
 *
 * Both textarea variants POST to /api/nps/feedback/[code]. The route
 * handler decides whether to SMS Ben immediately based on the score
 * (detractor = SMS now; passive = batch up).
 *
 * Form is local-state only. After successful submit, swap to a thank
 * you confirmation in place — no full page navigation, no flash.
 */
export default function NpsThanksClient({
  code,
  variant,
  score,
  firstName,
  businessName,
  referralUrl,
}: Props) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/nps/feedback/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedback.trim(),
          score,
          variant,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Submit failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Promoter variant — referral amplifier
  if (variant === "promoter") {
    const mailto = `mailto:?subject=${encodeURIComponent(
      `A web designer worth knowing`,
    )}&body=${encodeURIComponent(
      `Wanted to pass this along — Ben at BlueJays built our site at ${businessName} and it's been great. Worth a look:\n\n${referralUrl}`,
    )}`;
    const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
    const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;

    return (
      <main className="min-h-screen bg-[#faf9f6] text-slate-900 px-6 py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl">
              {score !== undefined ? score : "★"}
            </div>
            <h1 className="text-4xl font-bold mb-3">
              Awesome — thanks {firstName}!
            </h1>
            <p className="text-lg text-slate-600">
              That means a lot. If you know any other business owners who
              could use the same upgrade, here&apos;s your personal link.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Your referral link
            </div>
            <div className="flex items-center gap-2 mb-4">
              <code className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-sm font-mono break-all">
                {referralUrl}
              </code>
              <CopyButton text={referralUrl} />
            </div>
            <p className="text-sm text-slate-600">
              Every business that claims a site through this link gets{" "}
              <strong>$100 off</strong> — and you get{" "}
              <strong>$100 off your renewal OR a free year of management</strong>
              , your call.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={mailto}
              className="text-center bg-white border border-slate-200 hover:border-slate-400 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            >
              ✉️ Email a friend
            </a>
            <a
              href={linkedinShare}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-white border border-slate-200 hover:border-slate-400 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            >
              Share on LinkedIn
            </a>
            <a
              href={facebookShare}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-white border border-slate-200 hover:border-slate-400 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
            >
              Share on Facebook
            </a>
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            — Ben
          </p>
        </div>
      </main>
    );
  }

  // Detractor & passive variants — both have feedback textareas, but
  // different copy + urgency. Submitted state is shared.
  if (submitted) {
    return (
      <main className="min-h-screen bg-[#faf9f6] text-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Got it — thank you</h1>
          {variant === "detractor" ? (
            <p className="text-slate-600">
              I&apos;ll personally reach out within 24 hours. — Ben
            </p>
          ) : (
            <p className="text-slate-600">
              I read every response. Appreciate you taking the time. — Ben
            </p>
          )}
        </div>
      </main>
    );
  }

  const isDetractor = variant === "detractor";

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-900 px-6 py-16">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold ${
              isDetractor
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {score !== undefined ? score : "?"}
          </div>
          <h1 className="text-3xl font-bold mb-3">
            {isDetractor
              ? `Thank you, ${firstName}`
              : `Thanks for the feedback`}
          </h1>
          <p className="text-lg text-slate-600">
            {isDetractor
              ? "What went wrong? I want to fix it."
              : "What would have made it a 9 or 10?"}
          </p>
          {isDetractor && (
            <p className="text-sm text-slate-500 mt-3">
              I&apos;ll personally reach out within 24 hours.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
            placeholder={
              isDetractor
                ? "Tell me what happened — I read every response personally."
                : "Whatever's on your mind — short or long, both fine."
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            required
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !feedback.trim()}
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">— Ben</p>
      </div>
    </main>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
