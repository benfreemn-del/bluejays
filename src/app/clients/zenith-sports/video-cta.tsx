"use client";

import { useEffect, useState } from "react";
import { PlayCircle, X } from "@phosphor-icons/react/dist/ssr";

/**
 * VideoCta — "See it in action" trigger that opens a YouTube video in a
 * full-screen modal instead of just anchor-jumping. The original anchor
 * (#meet) only scrolled to the Meet TEKKY copy section, which felt
 * broken since the CTA promises a video.
 *
 * Picked Instep Touch (bX-HMzizdxU) — the foundational warm-up drill —
 * as the demo because it's the most "hello, this is what the ball does"
 * clip in Zenith's library. Easy to swap by changing VIDEO_ID.
 */

const VIDEO_ID = "bX-HMzizdxU"; // Instep Touch — foundational TEKKY drill
const VIDEO_TITLE = "TEKKY in action — Instep Touch warm-up";

type Props = {
  className?: string;
  label?: string;
};

export default function VideoCta({
  className = "",
  label = "See it in action",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          "inline-flex items-center gap-2 border border-white/40 text-white px-7 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase hover:bg-white/10 transition cursor-pointer " +
          className
        }
      >
        <PlayCircle size={16} weight="bold" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={VIDEO_TITLE}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Close video"
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
          {/* 16:9 responsive iframe — clicks INSIDE the player don't close */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl aspect-video shadow-2xl"
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
              title={VIDEO_TITLE}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}
