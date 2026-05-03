"use client";

/* eslint-disable @next/next/no-img-element */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  MagnifyingGlassPlus,
  X,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

/**
 * PhotoZoom — context-based lightbox so that server-component pages can
 * still compose their photo stacks declaratively. The wrapper publishes
 * an `open(index)` function via React context; trigger components (also
 * client) call it.
 *
 * Why context instead of the simpler render-prop API: server components
 * can't pass functions as children to client components (Next.js
 * serialization restriction). With context, both the provider and the
 * triggers are client components — the server page just composes them.
 */

type ZoomCtx = {
  open: (i: number) => void;
};
const ZoomContext = createContext<ZoomCtx | null>(null);

type ImageItem = { src: string; alt?: string };

export function PhotoZoom({
  images,
  children,
}: {
  images: ImageItem[];
  children: React.ReactNode;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(
    () => setOpenIdx((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setOpenIdx((i) =>
        i === null ? null : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx, close, next, prev]);

  return (
    <ZoomContext.Provider value={{ open: setOpenIdx }}>
      {children}
      {openIdx !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close photo viewer"
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>

          {images.length > 1 && (
            <div className="absolute top-6 left-6 z-10 text-[11px] tracking-[0.28em] uppercase text-white/70 font-bold">
              {openIdx + 1} / {images.length}
            </div>
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition cursor-pointer"
            >
              <CaretLeft size={22} weight="bold" />
            </button>
          )}

          <img
            src={images[openIdx].src}
            alt={images[openIdx].alt || ""}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain cursor-default select-none shadow-2xl"
            draggable={false}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="absolute right-3 sm:right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition cursor-pointer"
            >
              <CaretRight size={22} weight="bold" />
            </button>
          )}
        </div>
      )}
    </ZoomContext.Provider>
  );
}

/**
 * ZoomTrigger — wraps any image (or any clickable region) with a button
 * that opens the parent PhotoZoom lightbox at the given index.
 *
 * Used as a drop-in replacement for the previous static <div className="...">
 * <img/> </div> pattern. Children is whatever you want INSIDE the clickable
 * region (typically <img>).
 */
export function ZoomTrigger({
  index,
  className = "",
  ariaLabel = "Zoom in on photo",
  children,
}: {
  index: number;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(ZoomContext);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        ctx?.open(index);
      }}
      aria-label={ariaLabel}
      className={"group relative cursor-zoom-in " + className}
    >
      {children}
      <ZoomBadge />
    </button>
  );
}

/**
 * ZoomBadge — small "magnifier" pill for hover-reveal on a photo.
 * Usually rendered automatically by ZoomTrigger; exported separately
 * for advanced layouts.
 */
export function ZoomBadge({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={
        "pointer-events-none absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/85 text-[#0a1832] backdrop-blur shadow-md opacity-0 group-hover:opacity-100 transition " +
        className
      }
    >
      <MagnifyingGlassPlus size={16} weight="bold" />
    </span>
  );
}
