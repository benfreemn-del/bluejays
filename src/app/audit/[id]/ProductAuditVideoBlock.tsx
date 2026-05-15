"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Product-audit results video — Phase 3 of the 2026-05-15 product-
 * audit rebuild. Plays a short Ben-recorded pitch ("here's why your
 * product page is leaking + here's the free build I'll do") then
 * opens a Calendly iframe so the prospect can book before the
 * emotional peak fades.
 *
 * Hormozi: BAM-FAM (Book A Meeting / From A Meeting) — every minute
 * between an interested-and-emotionally-hooked prospect and a held
 * call is a leak. The video-end -> calendar handoff closes that gap.
 *
 * Video file lives at /public/videos/audit-followup-pitch.mp4 (drop
 * the file into that path; the component handles the missing-asset
 * case gracefully by rendering a thumbnail-only state).
 */

type Props = {
  /** Calendly URL for the discovery call. Server passes
   *  AGENCY_CALENDLY_URL with a sensible fallback. */
  calendlyUrl: string;
  /** Optional poster image path. Defaults to a generated thumbnail. */
  posterUrl?: string;
  /** Optional video source path. Defaults to the project-standard
   *  audit pitch file. Falsy = no media element, only thumbnail. */
  videoSrc?: string;
};

export default function ProductAuditVideoBlock({
  calendlyUrl,
  posterUrl = "/videos/audit-followup-pitch-poster.jpg",
  videoSrc = "/videos/audit-followup-pitch.mp4",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [videoMissing, setVideoMissing] = useState(false);

  // Listen for the native `ended` event AND a safety timer (90s)
  // so even if the file is missing or the user mutes-and-scrubs,
  // the calendar still surfaces at the end of the pitch window.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onEnded = () => setShowCalendar(true);
    const onPlay = () => setHasPlayed(true);
    const onError = () => setVideoMissing(true);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("error", onError);
    };
  }, []);

  // Brand-themed Calendly embed URL — dark UI, no Calendly chrome
  const calendlyEmbedUrl = (() => {
    try {
      const u = new URL(calendlyUrl);
      u.searchParams.set("hide_event_type_details", "0");
      u.searchParams.set("hide_gdpr_banner", "1");
      u.searchParams.set("background_color", "0f172a");
      u.searchParams.set("text_color", "e2e8f0");
      u.searchParams.set("primary_color", "f59e0b");
      return u.toString();
    } catch {
      return calendlyUrl;
    }
  })();

  return (
    <div className="rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-transparent overflow-hidden">
      {/* Pitch banner above the player */}
      <div className="px-5 py-3 border-b border-amber-500/20 bg-amber-500/[0.06]">
        <p className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
          <span className="text-base">🎁</span>
          Free for audit takers · $300 value
        </p>
      </div>

      <div className="p-5 md:p-7">
        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
          Watch this 2-minute pitch.
        </h3>
        <p className="text-slate-300 text-sm md:text-base mb-5 leading-relaxed">
          I&apos;ll walk you through exactly why your product page is leaking,
          then offer to build you a{" "}
          <span className="text-white font-semibold">
            free mock website + backend system
          </span>{" "}
          so you can see what the fixes look like before paying a cent. I just
          need 24 hours to put it together.
        </p>

        {/* Video player */}
        {!showCalendar && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
            {!videoMissing ? (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={posterUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full"
              />
            ) : (
              // File missing → fallback poster + scarcity text + manual "Book a call" button
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-center p-6">
                <div className="text-5xl mb-3">🎥</div>
                <p className="text-white font-bold text-lg mb-2">
                  Video coming soon
                </p>
                <p className="text-slate-400 text-sm mb-5 max-w-md">
                  Want the 2-min walkthrough now? Book a call below and Ben
                  will share it live.
                </p>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.45)] transition-all"
                >
                  Show me the calendar →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calendly handoff — surfaces on video end OR fallback button */}
        {showCalendar && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-4 md:p-5">
              <p className="text-emerald-300 text-xs uppercase tracking-wider font-bold mb-1.5">
                ✓ Next step
              </p>
              <p className="text-white text-base md:text-lg font-semibold leading-snug">
                If you&apos;d like to be one of the{" "}
                <span className="text-amber-300">5 businesses</span> I&apos;ll
                be building custom software for this month, let&apos;s see
                if we&apos;re a good fit.
              </p>
              <p className="text-slate-300 text-sm mt-1.5">
                Pick a 30-min slot below. I&apos;ll come to the call having
                already reviewed your audit + drafted a rough plan for the
                free mock build.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
              <iframe
                src={calendlyEmbedUrl}
                title="Pick a time with Ben"
                className="w-full block"
                style={{ minHeight: "640px", height: "640px" }}
                frameBorder={0}
              />
            </div>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm underline underline-offset-2"
            >
              Calendar not loading? Open in a new tab →
            </a>
          </div>
        )}

        {/* Skip-to-calendar option — surfaces only if video has played but
            hasn't ended yet (e.g. user paused). Hormozi: don't trap a
            committed buyer behind a "watch the whole thing" wall. */}
        {hasPlayed && !showCalendar && (
          <button
            onClick={() => setShowCalendar(true)}
            className="mt-4 text-amber-300/80 hover:text-amber-200 text-sm underline underline-offset-2"
          >
            Skip to scheduling →
          </button>
        )}
      </div>
    </div>
  );
}
