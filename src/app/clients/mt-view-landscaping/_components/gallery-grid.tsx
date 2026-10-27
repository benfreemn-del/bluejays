"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { PHOTO_PATH } from "../_lib/site";
import { PHOTOS, type Photo } from "../_lib/photos";

const body = "font-[family-name:var(--font-inter)]";

const FILTERS = [
  { key: "all", label: "All work" },
  { key: "water", label: "Ponds & Waterfalls" },
  { key: "hardscape", label: "Patios & Stone" },
  { key: "walls", label: "Walls" },
  { key: "planting", label: "Gardens" },
  { key: "lawn", label: "Lawns" },
  { key: "lighting", label: "Lighting" },
  { key: "winter", label: "In the snow" },
  { key: "trees", label: "Specimen trees" },
];

/**
 * Masonry photo grid with a full-screen lightbox (arrow keys, swipe, Esc).
 * `ids` = which photos, in order. `filters` turns on the category chips
 * (used on the /gallery page).
 */
export default function GalleryGrid({ ids, filters = false, eager = 0 }: { ids: string[]; filters?: boolean; eager?: number }) {
  const all: Photo[] = ids.map((id) => PHOTOS.find((p) => p.id === id)).filter((p): p is Photo => !!p);
  const [cat, setCat] = useState("all");
  const shown = cat === "all" ? all : all.filter((p) => p.cats.includes(cat));
  const [idx, setIdx] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [idx, step]);

  const cur = idx === null ? null : shown[idx];
  const counts = (k: string) => (k === "all" ? all.length : all.filter((p) => p.cats.includes(k)).length);

  return (
    <div>
      {filters && (
        <div className={`flex flex-wrap gap-2 mb-7 ${body}`}>
          {FILTERS.filter((f) => counts(f.key) > 0).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setCat(f.key)}
              className={`px-4 py-2 rounded-full text-[15px] font-semibold border transition-colors ${
                cat === f.key ? "bg-[#234E36] text-white border-[#234E36]" : "bg-[#FBF8F1] text-[#234E36] border-[#A8A294]/40 hover:border-[#2F7D4F]"
              }`}
            >
              {f.label} <span className={`font-medium ${cat === f.key ? "text-white/85" : "text-[#4A5A4E]"}`}>{counts(f.key)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Row-major grid (not CSS columns) so the curated best-first order reads left to right, top to bottom. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {shown.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIdx(i)}
            className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-[#D9DCCF] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2F7D4F]/50"
            aria-label={`View larger: ${p.alt}`}
          >
            <img
              src={`${PHOTO_PATH}/${p.id}-640.webp`}
              srcSet={`${PHOTO_PATH}/${p.id}-640.webp 640w, ${PHOTO_PATH}/${p.id}-960.webp 960w, ${PHOTO_PATH}/${p.id}-1600.webp 1600w`}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              width={p.w}
              height={p.h}
              alt={p.alt}
              loading={i < eager ? "eager" : "lazy"}
              fetchPriority={i === 0 && eager > 0 ? "high" : undefined}
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {cur && idx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-[#11140f]/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={cur.alt}
          onClick={() => setIdx(null)}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <img
            src={`${PHOTO_PATH}/${cur.id}-${cur.big ? 2400 : 1600}.webp`}
            alt={cur.alt}
            className="max-w-[94vw] max-h-[82vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className={`absolute bottom-5 left-0 right-0 text-center px-16 ${body} text-[15px] text-white/85`}>
            {cur.alt} <span className="text-white/50">· {idx + 1} / {shown.length}</span>
          </p>
          <button type="button" aria-label="Close" onClick={() => setIdx(null)} className="absolute top-4 right-4 p-2 text-white/85 hover:text-white">
            <X size={32} />
          </button>
          <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-2 sm:left-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <CaretLeft size={28} weight="bold" />
          </button>
          <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-2 sm:right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <CaretRight size={28} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
