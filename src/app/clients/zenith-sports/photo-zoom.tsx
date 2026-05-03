"use client";

/* eslint-disable @next/next/no-img-element */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
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
  // Real magnification inside the lightbox. scale=1 fits to viewport,
  // scale=2.5 doubles+ for inspecting product details. originX/Y are the
  // click point in image-coordinate-space so the zoom expands FROM where
  // the user clicked instead of from the center.
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 }); // percent
  const imgRef = useRef<HTMLImageElement>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const resetZoom = useCallback(() => {
    setScale(1);
    setOrigin({ x: 50, y: 50 });
  }, []);
  const next = useCallback(() => {
    resetZoom();
    setOpenIdx((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length, resetZoom]);
  const prev = useCallback(() => {
    resetZoom();
    setOpenIdx((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [images.length, resetZoom]);

  // Click on the image: toggle 1x ↔ 2.5x, anchored on where you clicked.
  // Second click anywhere on a zoomed image resets back to fit-to-viewport.
  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setScale(2.5);
  };

  // Wheel = continuous zoom (1x to 5x). Trackpads + mice both work.
  const onWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(1, s - e.deltaY * 0.005)));
  };

  // Reset zoom whenever the lightbox closes or the image changes.
  useEffect(() => {
    if (openIdx === null) resetZoom();
  }, [openIdx, resetZoom]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "+" || e.key === "=")
        setScale((s) => Math.min(5, s + 0.5));
      else if (e.key === "-" || e.key === "_")
        setScale((s) => Math.max(1, s - 0.5));
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx, close, next, prev, resetZoom]);

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

          {/* Click image to toggle 2.5x zoom anchored at click point.
              Wheel/trackpad scrolls between 1x and 5x. Keyboard +/-/0 also
              work. transform-origin uses percent so the zoom anchors on
              the user's click instead of the image center. */}
          <img
            ref={imgRef}
            src={images[openIdx].src}
            alt={images[openIdx].alt || ""}
            onClick={onImageClick}
            onWheel={onWheel}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transition: "transform 180ms ease-out",
              cursor: scale > 1 ? "zoom-out" : "zoom-in",
            }}
            className="max-w-full max-h-full object-contain select-none shadow-2xl"
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
      // Don't hardcode `relative` here — callers need to be able to pass
      // their own positioning (e.g. `absolute -bottom-6 -right-6` for the
      // floating thumbnail badges on the Meet TEKKY layout). Two
      // conflicting Tailwind position classes leads to undefined wins.
      className={"group cursor-zoom-in " + className}
    >
      {children}
    </button>
  );
}
