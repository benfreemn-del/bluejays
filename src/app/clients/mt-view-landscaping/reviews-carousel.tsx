"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { Star, Quotes, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

/**
 * ReviewsCarousel — sliding banner of REAL Google reviews for Mt View.
 *
 * Implementation: CSS scroll-snap horizontal track. Native swipe on
 * mobile, smooth scroll on desktop with prev/next arrow buttons that
 * scroll by one card-width. All reviews are real, verified 5-star,
 * pulled from the Google Business Profile (5.0 · 14 reviews) on
 * 2026-05-02 via Chrome automation.
 *
 * Why scroll-snap (vs. JS-driven slider): fewer moving parts, native
 * keyboard + swipe accessibility, no layout shifts, tiny bundle.
 */

const PRIMARY = "#16a34a";
const PRIMARY_LIGHT = "#22c55e";

type Review = {
  name: string;
  meta: string;
  date: string;
  text: string;
  profilePic: string;
};

type Props = {
  reviews: Review[];
  /** Public Google Maps URL — pointed at the Mt View listing's reviews tab */
  viewAllUrl: string;
};

export default function ReviewsCarousel({ reviews, viewAllUrl }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Card width + gap. Match the className: card is w-[85vw] sm:w-[420px], gap-5
    const cardWidth = window.innerWidth < 640 ? window.innerWidth * 0.85 + 20 : 440;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll track — native horizontal scroll-snap */}
      <div
        ref={trackRef}
        className="overflow-x-auto snap-x snap-mandatory scroll-pl-4 pb-4 -mx-4 px-4 flex gap-5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {reviews.map((r, i) => (
          <article
            key={i}
            className="snap-start shrink-0 w-[85vw] sm:w-[420px] rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-6 flex flex-col"
          >
            {/* 5 gold stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={18} weight="fill" style={{ color: "#fbbf24" }} />
              ))}
            </div>

            <Quotes
              size={28}
              weight="fill"
              style={{ color: PRIMARY_LIGHT }}
              className="mb-3 opacity-50"
            />

            <p className="text-[15px] text-slate-200 leading-relaxed flex-1 mb-6">
              {r.text}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <img
                src={r.profilePic}
                alt={r.name}
                className="w-11 h-11 rounded-full object-cover border border-white/10"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {r.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {r.meta} · {r.date}
                </p>
              </div>
              {/* Tiny Google "G" — signals these are verified Google reviews */}
              <div className="flex flex-col items-center text-[9px] text-slate-500 leading-tight">
                <span
                  aria-hidden
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                  style={{
                    background:
                      "conic-gradient(from 90deg, #4285F4 0deg 90deg, #EA4335 90deg 180deg, #FBBC04 180deg 270deg, #34A853 270deg 360deg)",
                  }}
                >
                  G
                </span>
                <span className="mt-0.5 uppercase tracking-wider text-[8px]">
                  Google
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Prev / Next buttons — desktop only */}
      <div className="hidden md:flex items-center justify-between gap-3 mt-6">
        <a
          href={viewAllUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          View all 14 reviews on Google
          <span aria-hidden>→</span>
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous review"
            className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center cursor-pointer"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next review"
            className="w-10 h-10 rounded-full text-emerald-950 transition-colors flex items-center justify-center cursor-pointer"
            style={{ background: PRIMARY }}
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Mobile-only: View all link below */}
      <div className="md:hidden mt-5 text-center">
        <a
          href={viewAllUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
        >
          View all 14 reviews on Google
          <span aria-hidden>→</span>
        </a>
      </div>
    </div>
  );
}
