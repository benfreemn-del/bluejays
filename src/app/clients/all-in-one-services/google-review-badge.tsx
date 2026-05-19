"use client";

/**
 * GoogleReviewBadge — floating bottom-left review chip. Shows
 * the verified 4.6★ aggregate rating + review count, links out
 * to Birdeye (or Google Business Profile when configured), and
 * is dismissible.
 *
 * Slides in 2 seconds after page load so it doesn't steal focus
 * from the hero animation. Persists dismissal in sessionStorage
 * so it doesn't re-pop on the same visit.
 */

import { useEffect, useState } from "react";
import { Star, X } from "@phosphor-icons/react";

const RATING = 4.6;
const REVIEW_COUNT = 18;
const REVIEW_URL =
  "https://reviews.birdeye.com/all-in-one-services-167497956805754";

// PNW Heritage palette
const PAPER = "#fbf6ec";
const ESPRESSO = "#1a1612";
const ESPRESSO_SOFT = "rgba(26, 22, 18, 0.70)";
const ESPRESSO_DIM = "rgba(26, 22, 18, 0.45)";
const MOSS = "#2d4a35";

export default function GoogleReviewBadge() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Respect prior dismissal within the same session
    try {
      if (sessionStorage.getItem("aios-review-dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage may be unavailable in some private modes — fine.
    }
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem("aios-review-dismissed", "1");
    } catch {
      /* noop */
    }
  }

  if (dismissed) return null;

  return (
    <a
      href={REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`See all ${REVIEW_COUNT} Google reviews — ${RATING} stars`}
      className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-[55] transition-all duration-500 ease-out"
      style={{
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="flex items-center gap-3 pl-3.5 pr-9 py-2.5 rounded-full shadow-xl backdrop-blur"
        style={{
          background: PAPER,
          border: `1px solid rgba(26, 22, 18, 0.12)`,
          fontFamily: "'Inter', sans-serif",
          boxShadow:
            "0 8px 24px rgba(26, 22, 18, 0.18), 0 2px 6px rgba(26, 22, 18, 0.08)",
        }}
      >
        {/* Google G — multicolor authentic Google logo */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>

        {/* Stars + rating */}
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[16px] font-bold tabular-nums"
              style={{ color: ESPRESSO, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {RATING}
            </span>
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={11}
                  weight="fill"
                  style={{ color: i <= Math.round(RATING) ? "#fbbf24" : "rgba(0,0,0,0.15)" }}
                />
              ))}
            </span>
          </div>
          <span
            className="text-[10.5px] mt-1 tracking-[0.04em]"
            style={{
              color: ESPRESSO_SOFT,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {REVIEW_COUNT} verified reviews ·{" "}
            <span style={{ color: MOSS, fontWeight: 600 }}>Read all →</span>
          </span>
        </div>

        {/* Dismiss button — absolutely positioned over the right edge */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss review badge"
          className="absolute right-2 top-2 inline-flex items-center justify-center w-5 h-5 rounded-full transition-opacity hover:opacity-100"
          style={{
            color: ESPRESSO_DIM,
            opacity: 0.6,
            background: "transparent",
          }}
        >
          <X size={11} weight="bold" />
        </button>
      </div>
    </a>
  );
}
