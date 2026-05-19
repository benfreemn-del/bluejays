"use client";

/* eslint-disable @next/next/no-img-element */

import { Quotes } from "@phosphor-icons/react/dist/ssr";

/**
 * ReviewsCarousel — editorial pull-quote treatment for Section 8.
 *
 * v4 redesign (2026-05-19): no more sliding carousel. One large
 * Fraunces pull-quote (the longest, most specific review — Jay Freeman)
 * + small Google G + a quiet 4-up tile of additional reviewer avatars +
 * names with a "View all 14 →" link. Single editorial moment, not an
 * interactive slider.
 */

type Review = {
  name: string;
  meta: string;
  date: string;
  text: string;
  profilePic: string;
};

type Props = {
  reviews: Review[];
  viewAllUrl: string;
};

const GOOGLE_G = (
  <span
    aria-hidden
    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[8px] font-bold align-middle"
    style={{
      background:
        "conic-gradient(from 90deg, #4285F4 0deg 90deg, #EA4335 90deg 180deg, #FBBC04 180deg 270deg, #34A853 270deg 360deg)",
    }}
  >
    G
  </span>
);

export default function ReviewsCarousel({ reviews, viewAllUrl }: Props) {
  // Pull the longest, most specific review forward as the pull-quote.
  // Falls back to first review if list is short.
  const sorted = [...reviews].sort((a, b) => b.text.length - a.text.length);
  const featured = sorted[0] ?? reviews[0];
  const tiles = reviews
    .filter((r) => r !== featured)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* Featured pull-quote — 8 of 12 columns */}
      <figure className="lg:col-span-8">
        <Quotes
          size={36}
          weight="duotone"
          className="text-[#3E4A36] mb-6 opacity-70"
        />
        <blockquote className="font-[family-name:var(--font-playfair)] font-light text-[28px] sm:text-[34px] lg:text-[38px] leading-[1.25] tracking-[-0.015em] text-[#1C1F1A]">
          &ldquo;{featured?.text}&rdquo;
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-4">
          <img
            src={featured?.profilePic}
            alt={featured?.name}
            className="w-12 h-12 rounded-full object-cover object-top border border-[#A8A294]/30"
            loading="lazy"
          />
          <div className="font-[family-name:var(--font-inter)] text-[14px] text-[#1C1F1A]">
            <p className="font-medium">{featured?.name}</p>
            <p className="text-[12px] text-[#A8A294] mt-0.5">
              {GOOGLE_G}
              <span className="ml-2 align-middle">
                {featured?.meta} · {featured?.date}
              </span>
            </p>
          </div>
        </figcaption>
      </figure>

      {/* Right rail — 4 quieter reviewer tiles + view-all */}
      <aside className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-[#A8A294]/25">
        <p className="font-[family-name:var(--font-inter)] text-[10px] tracking-[0.22em] uppercase text-[#A8A294] mb-6">
          More from Google
        </p>
        <ul className="space-y-5">
          {tiles.map((r, i) => (
            <li key={i} className="flex items-start gap-3">
              <img
                src={r.profilePic}
                alt={r.name}
                className="w-9 h-9 rounded-full object-cover object-top border border-[#A8A294]/30 shrink-0"
                loading="lazy"
              />
              <div className="font-[family-name:var(--font-inter)] text-[13px] min-w-0">
                <p className="text-[#1C1F1A] font-medium truncate">{r.name}</p>
                <p className="text-[12px] text-[#1C1F1A]/65 leading-snug mt-0.5 line-clamp-2">
                  &ldquo;{r.text.slice(0, 88)}
                  {r.text.length > 88 ? "…" : ""}&rdquo;
                </p>
              </div>
            </li>
          ))}
        </ul>
        <a
          href={viewAllUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[13px] text-[#3E4A36] underline underline-offset-4 decoration-1 hover:decoration-2 transition-all"
        >
          {GOOGLE_G}
          <span>View all 14 reviews on Google →</span>
        </a>
      </aside>
    </div>
  );
}
