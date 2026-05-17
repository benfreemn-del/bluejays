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
  /** Optional poster image path. Only used when videoSrc is set. */
  posterUrl?: string;
  /** Optional video source path. Falsy / omitted = render the clean
   *  "video coming soon" fallback INSTEAD of a broken player. This is
   *  the default so the page never shows a 404'd <video> element on
   *  prod (server passes videoSrc only when the file is confirmed). */
  videoSrc?: string | null;
  /** Video aspect ratio. "horizontal" = 16:9 (the original Loom/YT
   *  format), "vertical" = 9:16 (VSL #2 phone-recorded selfie).
   *  Vertical uses object-contain + max-h so the video doesn't
   *  stretch and centers within the player surface. */
  aspect?: "horizontal" | "vertical";
};

export default function ProductAuditVideoBlock({
  calendlyUrl,
  posterUrl,
  videoSrc,
  aspect = "horizontal",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [unmuted, setUnmuted] = useState(false);
  // Treat both "no videoSrc provided" and "file 404'd" as missing.
  // The page now passes videoSrc only when the file is confirmed on
  // disk, so the most common state until Ben uploads is "missing".
  const [videoMissing, setVideoMissing] = useState(!videoSrc);

  const unmuteVideo = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    void el.play().catch(() => {});
    setUnmuted(true);
  };

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
      <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/[0.06]">
        <p className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
          <span className="text-base">🎁</span>
          Free for audit takers
        </p>
      </div>

      <div className="p-6 md:p-10">
        <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 md:mb-5">
          Watch this first.
        </h3>
        <p className="text-slate-300 text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
          60 seconds. Two paths. The right one&apos;s obvious.
        </p>

        {/* Video player. Aspect ratio adapts: horizontal = 16:9 box (legacy
            Loom/YT format), vertical = phone-shot 9:16 contained in a max-
            height box and centered so it doesn't stretch. */}
        {!showCalendar && (
          <div
            className={
              aspect === "vertical"
                // Vertical 9:16: container is sized to hug the video itself
                // (no letterbox bars). aspect-[9/16] forces 9:16 ratio,
                // max-h-[70vh] caps height on tall viewports, max-w-[min(...)]
                // caps width so the container doesn't outgrow the video.
                ? "relative rounded-2xl overflow-hidden border border-white/10 bg-black mx-auto w-full aspect-[9/16] max-h-[70vh] max-w-[315px]"
                : "relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video"
            }
          >
            {!videoMissing ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc ?? undefined}
                  poster={posterUrl}
                  autoPlay
                  muted
                  controls
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover bg-black"
                />
                {!unmuted && (
                  <button
                    type="button"
                    onClick={unmuteVideo}
                    aria-label="Tap to hear Ben"
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] transition-opacity hover:bg-black/55 cursor-pointer"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-amber-950 text-2xl shadow-2xl shadow-amber-500/50 ring-4 ring-amber-300/40 animate-pulse">
                      🔊
                    </span>
                    <span className="mt-3 text-sm font-bold text-white uppercase tracking-wider drop-shadow-lg">
                      Tap for sound
                    </span>
                  </button>
                )}
              </>
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.06] p-6 md:p-7">
              <p className="text-emerald-300 text-xs uppercase tracking-wider font-bold mb-3">
                ✓ Next step
              </p>
              <p className="text-white text-lg md:text-xl font-semibold leading-snug">
                Grab one of the{" "}
                <span className="text-amber-300">5 spots</span> open this
                month.
              </p>
              <p className="text-slate-300 text-sm md:text-base mt-3 leading-relaxed">
                30-min call. I&apos;ll have your audit reviewed beforehand.
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
