"use client";

import { useEffect, useState } from "react";

/**
 * Floating "Watch Walkthrough" button on every preview page.
 *
 * Fetches the prospect's TTS walkthrough video from /api/videos/[id] and,
 * if one is ready, shows a pill button above the DeviceToggleBar. Clicking it
 * opens a full-screen modal that plays the MP4.
 *
 * This is how the AI TTS video gets in front of business owners — the template-
 * internal Play buttons on "Video Testimonial" cards are separate, decorative
 * placeholders for a different UX (fake testimonial video proof). This component
 * surfaces the REAL generated walkthrough video, no matter which V2 template
 * the preview renders with.
 */
export default function PreviewVideoButton({ prospectId }: { prospectId: string }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/videos/${prospectId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { videoUrl: string | null };
        if (!cancelled && data.videoUrl) setVideoUrl(data.videoUrl);
      } catch {
        // swallow — no video just means no button
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prospectId]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!videoUrl) return null;

  return (
    <>
      {/* Floating pill — sits above DeviceToggleBar (z-9999) on desktop */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-[9998] flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl hover:brightness-110 transition-all"
        aria-label="Watch personalized walkthrough video"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Watch Walkthrough
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Personalized walkthrough video"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/70 border border-white/20 p-2 text-white hover:bg-black/90 transition-colors"
              aria-label="Close video"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-auto max-h-[85vh] bg-black"
            >
              Your browser doesn&apos;t support HTML5 video.{" "}
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Download the video
              </a>{" "}
              instead.
            </video>
          </div>
        </div>
      ) : null}
    </>
  );
}
