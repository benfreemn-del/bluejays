"use client";

import { useState } from "react";

interface Props {
  prospectId: string;
  businessName: string;
  ownerName?: string;
  category: string;
  accentColor: string;
  googleReviewUrl: string;
}

type Stage = "rating" | "positive" | "negative" | "submitted";

const STARS = [1, 2, 3, 4, 5];

export default function ReviewClient({
  prospectId,
  businessName,
  accentColor,
  googleReviewUrl,
}: Props) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [stage, setStage] = useState<Stage>("rating");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleStarClick(star: number) {
    setSelected(star);
    if (star === 5) {
      setStage("positive");
    } else {
      setStage("negative");
    }
  }

  async function submitFeedback() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          rating: selected,
          feedback,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStage("submitted");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const accent = accentColor;

  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header bar */}
        <div style={{ background: accent }} className="h-2 w-full" />

        <div className="px-8 py-8 flex flex-col items-center text-center">
          {/* Business name */}
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Review Request
          </p>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{businessName}</h1>

          {/* ── STAGE: Rating ── */}
          {stage === "rating" && (
            <>
              <p className="text-gray-500 text-sm mt-3 mb-6">
                How was your recent experience?
              </p>
              <div className="flex gap-3 mb-6">
                {STARS.map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                    style={{
                      color:
                        star <= (hovered || selected) ? "#f59e0b" : "#d1d5db",
                      filter:
                        star <= (hovered || selected)
                          ? "drop-shadow(0 0 4px rgba(245,158,11,0.4))"
                          : "none",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Tap a star to rate</p>
            </>
          )}

          {/* ── STAGE: Positive (5 stars) ── */}
          {stage === "positive" && (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Thanks so much!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;re so glad you had a great experience. Would you mind
                sharing it on Google? It helps us reach more people.
              </p>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-semibold text-sm shadow-md transition-opacity hover:opacity-90"
                style={{ background: accent }}
              >
                <span>⭐</span>
                Leave a Google Review
              </a>
              <p className="text-xs text-gray-400 mt-4">
                Opens Google in a new tab. Takes 30 seconds.
              </p>
            </>
          )}

          {/* ── STAGE: Negative (1–4 stars) ── */}
          {stage === "negative" && (
            <>
              <div className="text-5xl mb-4">🙏</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Thanks for your honesty
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                We want to make it right. What could we have done better?
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what happened..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 mb-4"
                style={{ focusRingColor: accent } as React.CSSProperties}
              />
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button
                onClick={submitFeedback}
                disabled={submitting || !feedback.trim()}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-50"
                style={{ background: accent }}
              >
                {submitting ? "Sending..." : "Send Feedback"}
              </button>
            </>
          )}

          {/* ── STAGE: Submitted ── */}
          {stage === "submitted" && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Feedback received
              </h2>
              <p className="text-gray-500 text-sm">
                Thank you for taking the time. We&apos;ll use this to improve
                our service.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-300">
            Powered by{" "}
            <a
              href="https://bluejayportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              bluejayportfolio.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
