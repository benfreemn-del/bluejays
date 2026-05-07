"use client";

/**
 * BespokeExperience — the centerpiece of the Laser Lakes site.
 *
 * Combines:
 *   · Cinematic intro with the hero pitch
 *   · LakeBrowser (search "is my lake there?")
 *   · OrderConfigurator (multi-step wizard, pre-fills lake on click)
 *   · Product catalog grid (every Nate product, hand-clickable)
 *
 * Stays mounted as a single client component so picking a lake in the
 * browser jumps the configurator into step 2 with that lake pre-set —
 * no page navigation, no form re-entry.
 */

import { useRef, useState } from "react";
import { LakeBrowser } from "./lake-browser.client";
import { OrderConfigurator } from "./order-configurator.client";
import { PRODUCTS, formatPrice, type Lake } from "@/data/laser-lakes-catalog";

const PALETTE = {
  ink: "#2b241c",
  inkSoft: "rgba(43, 36, 28, 0.65)",
  cream: "#f6f1e8",
  walnut: "#5b3d1f",
  border: "rgba(43, 36, 28, 0.15)",
};

export function BespokeExperience() {
  const [pickedLake, setPickedLake] = useState<Lake | null>(null);
  const [configKey, setConfigKey] = useState(0);
  const configRef = useRef<HTMLDivElement>(null);

  const goConfigure = (lake?: Lake) => {
    setPickedLake(lake ?? null);
    setConfigKey((k) => k + 1); // force remount of configurator with new initial lake
    requestAnimationFrame(() => {
      configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      {/* ─── LAKE BROWSER ─── */}
      <section
        id="lake-browser"
        className="border-y"
        style={{
          backgroundColor: PALETTE.cream,
          borderColor: PALETTE.border,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div
              className="text-[10px] tracking-[0.32em] uppercase font-extrabold mb-3"
              style={{ color: PALETTE.walnut }}
            >
              The catalog
            </div>
            <h2
              className="text-4xl md:text-6xl leading-[1.05]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: PALETTE.ink,
              }}
            >
              Search for{" "}
              <em className="not-italic" style={{ color: PALETTE.walnut }}>
                your lake.
              </em>
            </h2>
            <p
              className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
              style={{ color: PALETTE.inkSoft }}
            >
              Hundreds of contour files cut and ready. If yours isn&apos;t in
              the list, Nate cuts it from scratch — same price, same lead
              time, every time.
            </p>
          </div>
          <LakeBrowser onPick={(l) => goConfigure(l)} />
        </div>
      </section>

      {/* ─── PRODUCT CATALOG GRID ─── */}
      <section
        id="catalog"
        className="border-b"
        style={{
          backgroundColor: "#efe6d3",
          borderColor: PALETTE.border,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div
              className="text-[10px] tracking-[0.32em] uppercase font-extrabold mb-3"
              style={{ color: PALETTE.walnut }}
            >
              The pieces
            </div>
            <h2
              className="text-4xl md:text-6xl leading-[1.05]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: PALETTE.ink,
              }}
            >
              Every piece, hand-cut <br />
              <em className="not-italic" style={{ color: PALETTE.walnut }}>
                in Minnesota.
              </em>
            </h2>
            <p
              className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: PALETTE.inkSoft }}
            >
              Maps. Shadowboxes. Coasters. Cabin signs. Wildlife. Every
              piece starts at Nate&apos;s laser, ends at his hand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goConfigure(undefined)}
                className="group text-left rounded-lg overflow-hidden border-2 transition-all hover:translate-y-[-3px]"
                style={{
                  backgroundColor: PALETTE.cream,
                  borderColor: PALETTE.border,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = PALETTE.walnut;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = PALETTE.border;
                }}
              >
                {/* Image area — placeholder gradient until Nate sends real photos */}
                <div
                  className="aspect-[4/3] relative overflow-hidden"
                  style={{
                    background:
                      p.category === "lake-map"
                        ? "linear-gradient(135deg, #2c4a5a 0%, #1a2e3a 100%)"
                        : p.category === "wildlife"
                          ? "linear-gradient(135deg, #4a3a2a 0%, #2a1f15 100%)"
                          : p.category === "ornament"
                            ? "linear-gradient(135deg, #6b5436 0%, #3a2811 100%)"
                            : "linear-gradient(135deg, #5e4a36 0%, #2e1f13 100%)",
                  }}
                >
                  {/* Concentric ring overlay simulating lake contours */}
                  {p.category === "lake-map" && (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, transparent 20%, rgba(255,255,255,0.08) 21%, transparent 24%, rgba(255,255,255,0.08) 35%, transparent 38%, rgba(255,255,255,0.06) 50%, transparent 53%, rgba(255,255,255,0.06) 65%, transparent 68%, rgba(255,255,255,0.04) 80%, transparent 83%)",
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0 flex items-end p-4"
                    style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)" }}
                  >
                    {p.isFeatured && (
                      <span
                        className="text-[9px] uppercase tracking-[0.22em] font-extrabold px-2 py-1 rounded"
                        style={{ backgroundColor: PALETTE.cream, color: PALETTE.walnut }}
                      >
                        Best seller
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                      className="font-bold text-lg leading-tight"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        color: PALETTE.ink,
                      }}
                    >
                      {p.name}
                    </h3>
                    <span className="text-[9px] uppercase tracking-[0.18em] font-extrabold px-2 py-1 rounded shrink-0"
                      style={{
                        backgroundColor: "rgba(43, 36, 28, 0.08)",
                        color: PALETTE.inkSoft,
                      }}
                    >
                      {p.category.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed mt-1.5" style={{ color: PALETTE.inkSoft }}>
                    {p.blurb}
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{ color: PALETTE.inkSoft }}>
                        From
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          color: PALETTE.ink,
                        }}
                      >
                        {formatPrice(p.basePriceCents)}
                      </div>
                    </div>
                    <div
                      className="text-[11px] tracking-[0.2em] uppercase font-extrabold transition group-hover:translate-x-1"
                      style={{ color: PALETTE.walnut }}
                    >
                      Configure →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONFIGURATOR ─── */}
      <section
        ref={configRef}
        id="configure"
        className="border-b"
        style={{
          backgroundColor: PALETTE.cream,
          borderColor: PALETTE.border,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-10">
            <div
              className="text-[10px] tracking-[0.32em] uppercase font-extrabold mb-3"
              style={{ color: PALETTE.walnut }}
            >
              Build it
            </div>
            <h2
              className="text-4xl md:text-6xl leading-[1.05]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: PALETTE.ink,
              }}
            >
              Configure your{" "}
              <em className="not-italic" style={{ color: PALETTE.walnut }}>
                heirloom.
              </em>
            </h2>
            <p
              className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: PALETTE.inkSoft }}
            >
              Five steps. Real-time price. No charge until Nate confirms the
              quote and sends the Stripe link.
            </p>
          </div>
          <OrderConfigurator key={configKey} initialLake={pickedLake} />
        </div>
      </section>
    </>
  );
}

export default BespokeExperience;
