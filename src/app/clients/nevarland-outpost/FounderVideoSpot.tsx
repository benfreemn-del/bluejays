"use client";

/**
 * FounderVideoSpot — cinematic frame for Christopher's 60-90s
 * founder-letter video. Lives between the Story section + the
 * Adult Tees grid so the personal voice carries through.
 *
 * Two states, one slot:
 *   1. Video URL configured (NEXT_PUBLIC_NEVARLAND_FOUNDER_VIDEO_URL or
 *      videoUrl prop) → renders the actual video element with
 *      autoplay-muted + controls + aspect-video shell. Loom/YouTube
 *      iframes also supported via toEmbedUrl()-style detection.
 *
 *   2. No URL yet → renders a "coming soon" cinematic placeholder
 *      that LOOKS like the eventual video frame: founder photo as
 *      poster, animated play-button, subtitle teasing what they'll
 *      hear when they hit play. When Christopher records his clip,
 *      one env var flip and the placeholder swaps for the real video
 *      — same frame, same vibe, no layout shift.
 *
 * Visual: rust-bordered frame with corner ticks (like a film cell),
 * paper-grain noise on the surrounding band, "Letter 01" film-strip
 * label that ties to the brand's typewriter accent.
 */

import { useState } from "react";

const FOUNDER_PHOTO =
  "https://www.nevarlandoutpost.com/cdn/shop/files/20260215_120213.jpg?v=1771735328&width=1500";
const ACCENT_RUST = "#c45836";
const ACCENT_RUST_LIGHT = "#d97757";
const METAL = "#c4a570";
const BG_BLACK = "#0a0a0a";

function toEmbedUrl(raw: string | null | undefined): { kind: "iframe" | "video" | null; src: string } {
  if (!raw) return { kind: null, src: "" };
  const url = raw.trim();
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i);
  if (loomMatch) return { kind: "iframe", src: `https://www.loom.com/embed/${loomMatch[1]}` };
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return { kind: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: "video", src: url };
  return { kind: null, src: "" };
}

export default function FounderVideoSpot({
  videoUrl,
}: {
  /** Optional override — usually set via env var read in the parent. */
  videoUrl?: string | null;
}) {
  const [coverDismissed, setCoverDismissed] = useState(false);
  const resolved = toEmbedUrl(
    videoUrl ?? (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_NEVARLAND_FOUNDER_VIDEO_URL
      : null) ?? null,
  );
  const hasVideo = resolved.kind !== null;

  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: BG_BLACK }}
    >
      {/* Ambient glow — rust + sage so the frame floats off black */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(196,88,54,0.16) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(107,125,79,0.10) 0%, transparent 60%)",
        }}
      />
      {/* Animated paper-grain — tiny opacity pulse so the surface
          breathes instead of staying static. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay nv-grain"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22/></svg>')",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Film-strip label */}
        <div className="text-center mb-6">
          <span
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.32em] font-bold"
            style={{
              color: METAL,
              borderColor: `${METAL}55`,
              background: "rgba(0,0,0,0.5)",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full nv-pulse"
              style={{ background: ACCENT_RUST_LIGHT }}
            />
            Letter 01 · From the Outpost
          </span>
        </div>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white text-center leading-[1.1] mb-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Hear it from the man at the press.
        </h2>
        <p
          className="text-base sm:text-lg text-center leading-relaxed mb-10 italic max-w-xl mx-auto"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Special Elite', monospace",
          }}
        >
          Sixty seconds with Christopher. Why the Outpost exists, what's
          coming next, and what every tee really means.
        </p>

        {/* The frame — rust border, corner ticks, slight rotation in the
            outer wrapper for handmade feel */}
        <div className="relative">
          {/* Corner ticks */}
          {[
            { top: -1, left: -1, br: false, bl: false, tr: false, tl: true },
            { top: -1, right: -1, br: false, bl: false, tr: true, tl: false },
            { bottom: -1, left: -1, br: false, bl: true, tr: false, tl: false },
            { bottom: -1, right: -1, br: true, bl: false, tr: false, tl: false },
          ].map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute w-5 h-5 pointer-events-none"
              style={{
                top: c.top,
                left: c.left,
                right: c.right,
                bottom: c.bottom,
                borderTop: c.tl || c.tr ? `2px solid ${ACCENT_RUST}` : undefined,
                borderBottom: c.bl || c.br ? `2px solid ${ACCENT_RUST}` : undefined,
                borderLeft: c.tl || c.bl ? `2px solid ${ACCENT_RUST}` : undefined,
                borderRight: c.tr || c.br ? `2px solid ${ACCENT_RUST}` : undefined,
              }}
            />
          ))}

          <div
            className="relative aspect-video rounded-md overflow-hidden border-2 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            style={{ borderColor: `${ACCENT_RUST}55` }}
          >
            {hasVideo ? (
              resolved.kind === "iframe" ? (
                <iframe
                  src={resolved.src}
                  title="Letter 01 · From the Outpost"
                  className="absolute inset-0 w-full h-full"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={resolved.src}
                  controls
                  preload="metadata"
                  poster={FOUNDER_PHOTO}
                  className="absolute inset-0 w-full h-full bg-black"
                />
              )
            ) : (
              <button
                type="button"
                onClick={() => setCoverDismissed((v) => !v)}
                className="absolute inset-0 group block w-full h-full"
                aria-label="Founder video coming soon"
              >
                {/* Founder image as poster */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FOUNDER_PHOTO}
                  alt="Christopher in the Outpost workspace"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Cinematic letterbox + dim */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.85) 100%)",
                    opacity: coverDismissed ? 0.5 : 1,
                  }}
                />
                {/* Play button */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 group-hover:scale-110 nv-play-pulse"
                  style={{
                    background: `${ACCENT_RUST}ee`,
                    boxShadow: `0 0 40px ${ACCENT_RUST}aa, inset 0 0 0 3px rgba(255,255,255,0.15)`,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-9 h-9 text-white ml-1"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {/* Coming-soon caption bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-left"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.95) 100%)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] mb-1"
                    style={{
                      color: ACCENT_RUST_LIGHT,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Coming soon
                  </p>
                  <p
                    className="text-base sm:text-lg font-bold text-white"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Christopher recording the first letter.
                  </p>
                  <p
                    className="text-xs italic mt-1"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "'Special Elite', monospace",
                    }}
                  >
                    Phone-shot · natural light · the why behind every tee.
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Sprocket holes left + right (film cell flair) — desktop only,
              hidden on mobile to avoid edge crowding. */}
          <div
            aria-hidden="true"
            className="hidden md:flex absolute -left-6 top-0 bottom-0 flex-col justify-around"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="block w-3 h-3 rounded-sm"
                style={{ background: `${ACCENT_RUST}66` }}
              />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="hidden md:flex absolute -right-6 top-0 bottom-0 flex-col justify-around"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="block w-3 h-3 rounded-sm"
                style={{ background: `${ACCENT_RUST}66` }}
              />
            ))}
          </div>
        </div>

        <p
          className="text-[11px] uppercase tracking-[0.24em] text-center mt-6"
          style={{
            color: "rgba(255,255,255,0.42)",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          More letters dropping with every drop.
        </p>
      </div>

      <style jsx>{`
        .nv-grain {
          opacity: 0.06;
          animation: nv-grain-shift 8s ease-in-out infinite;
        }
        @keyframes nv-grain-shift {
          0%, 100% { opacity: 0.05; transform: translate(0, 0); }
          50%      { opacity: 0.08; transform: translate(-3px, 2px); }
        }
        .nv-pulse {
          animation: nv-pulse 1.6s ease-in-out infinite;
        }
        @keyframes nv-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.4); }
        }
        .nv-play-pulse {
          animation: nv-play-pulse 2.4s ease-in-out infinite;
        }
        @keyframes nv-play-pulse {
          0%, 100% {
            box-shadow: 0 0 40px rgba(196,88,54,0.6),
                        inset 0 0 0 3px rgba(255,255,255,0.15);
          }
          50% {
            box-shadow: 0 0 70px rgba(196,88,54,0.95),
                        0 0 0 12px rgba(196,88,54,0.18),
                        inset 0 0 0 3px rgba(255,255,255,0.22);
          }
        }
      `}</style>
    </section>
  );
}
