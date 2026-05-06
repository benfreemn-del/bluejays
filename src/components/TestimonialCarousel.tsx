"use client";

/**
 * TestimonialCarousel — drop-in carousel of real customer quotes for a
 * showcase page. Pulls from /api/client-testimonials?client=<slug> on
 * mount so quotes the client adds via the admin dashboard go live
 * instantly without a redeploy.
 *
 * Renders nothing if zero active testimonials exist — keeps the
 * showcase page clean during the "we just launched" window.
 *
 * Per brand-voice guide: 11+ short quotes drives ~+68% landing-page
 * conversion. Each card shows name + location + role + quote, with
 * a video badge if a video_url is attached.
 */

import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  photo_url: string | null;
  video_url: string | null;
};

export function TestimonialCarousel({
  clientSlug,
  accentColor = "#a3e635",
  bgClass = "",
  heading = "What people say",
  subheading,
  /** Optional cap. If you only want N quotes shown publicly. */
  limit,
}: {
  clientSlug: string;
  accentColor?: string;
  bgClass?: string;
  heading?: string;
  subheading?: string;
  limit?: number;
}) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/client-testimonials?client=${encodeURIComponent(clientSlug)}`,
        );
        const j = (await r.json()) as {
          ok: boolean;
          testimonials?: Testimonial[];
        };
        if (!cancelled && j.ok && j.testimonials) {
          const trimmed = limit ? j.testimonials.slice(0, limit) : j.testimonials;
          setItems(trimmed);
        }
      } catch {
        /* silent — empty list renders nothing */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientSlug, limit]);

  // Don't render the section at all until either we have quotes or
  // we've finished loading + confirmed it's empty (in which case we
  // skip the whole section). Avoids flash-of-empty-quotes.
  if (!loaded || items.length === 0) return null;

  const cur = items[active]!;
  const next = () => setActive((a) => (a + 1) % items.length);
  const prev = () => setActive((a) => (a - 1 + items.length) % items.length);

  return (
    <section className={`py-14 sm:py-20 ${bgClass}`}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <p
          className="text-[11px] tracking-[0.32em] uppercase font-bold mb-3"
          style={{ color: accentColor }}
        >
          {heading}
        </p>
        {subheading && (
          <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-8">
            {subheading}
          </h2>
        )}

        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 transition">
          <blockquote
            className="text-lg sm:text-2xl font-semibold leading-relaxed text-white"
            style={{ fontFamily: "ui-serif, Georgia, serif", fontStyle: "italic" }}
          >
            &ldquo;{cur.quote}&rdquo;
          </blockquote>

          <div className="mt-6 flex items-center justify-center gap-3">
            {cur.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cur.photo_url}
                alt={cur.name}
                className="w-12 h-12 rounded-full object-cover border-2"
                style={{ borderColor: accentColor }}
              />
            )}
            <div className="text-left">
              <div className="text-sm font-bold text-white">{cur.name}</div>
              {(cur.role || cur.location) && (
                <div className="text-[11px] uppercase tracking-wider text-white/50">
                  {[cur.role, cur.location].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            {cur.video_url && (
              <a
                href={cur.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-[11px] tracking-wider uppercase font-bold px-3 py-1.5 rounded-full border transition"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}55`,
                }}
                title="Watch video"
              >
                ▶ Watch
              </a>
            )}
          </div>

          {/* Carousel controls — only when 2+ quotes */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Dot indicators — show position + tap-to-jump on mobile. */}
        {items.length > 1 && (
          <div className="mt-5 flex justify-center gap-1.5">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-8" : "w-3 opacity-40"
                }`}
                style={{
                  background: i === active ? accentColor : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialCarousel;
