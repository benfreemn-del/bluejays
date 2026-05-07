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
import { LakeMapArt } from "./lake-map-art";
import {
  PRODUCTS,
  formatPrice,
  SHOPIFY_SHOP_URL,
  type Lake,
  type Product,
} from "@/data/laser-lakes-catalog";

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
        className="border-y relative overflow-hidden"
        style={{
          backgroundColor: PALETTE.cream,
          borderColor: PALETTE.border,
        }}
      >
        {/* Ambient lake-at-dusk photo behind the search — sets the
            mood without competing with the foreground. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
            filter: "saturate(0.6)",
          }}
          aria-hidden
        />
        {/* Top-fade so the photo never competes with the headline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${PALETTE.cream} 0%, transparent 30%, transparent 70%, ${PALETTE.cream} 100%)`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
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
        className="border-b relative overflow-hidden"
        style={{
          backgroundColor: "#efe6d3",
          borderColor: PALETTE.border,
        }}
      >
        {/* Ambient wood-grain texture so the section reads as a
            workshop wall, not a flat color field. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=2000&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
            mixBlendMode: "multiply",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
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
            {PRODUCTS.map((p) => {
              // Standard products with a Shopify URL → external link to
              // checkout there. Custom-spec products (no Shopify URL) →
              // open the configurator so Nate can quote them. This is
              // the no-backend rule: standard items go straight to
              // Shopify, custom items handoff to Nate by email.
              const isShopify = Boolean(p.shopifyUrl);
              const Tag: "a" | "button" = isShopify ? "a" : "button";
              const linkProps = isShopify
                ? { href: p.shopifyUrl!, target: "_blank", rel: "noopener noreferrer" }
                : { onClick: () => goConfigure(undefined), type: "button" as const };
              return (
              <Tag
                key={p.id}
                {...(linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement> &
                  React.ButtonHTMLAttributes<HTMLButtonElement>)}
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
                {/* Image area — beautiful product art per category.
                    Lake-map products render the SVG LakeMapArt with
                    a different label per card so the catalog grid
                    looks like a wall of varied finished pieces.
                    Other categories get the matching themed scene. */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <ProductArt product={p} />
                  <div
                    className="absolute inset-0 flex items-end p-4 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45) 100%)",
                    }}
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
                      {isShopify ? "Shop on Shopify ↗" : "Configure →"}
                    </div>
                  </div>
                </div>
              </Tag>
              );
            })}
          </div>

          {/* Direct Shopify shop link — for browsers who want to see
              everything Nate has on his Shopify storefront. */}
          <div className="mt-10 text-center">
            <a
              href={SHOPIFY_SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] underline underline-offset-4 transition hover:translate-x-1"
              style={{ color: PALETTE.walnut }}
            >
              Browse the full Shopify shop ↗
            </a>
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

/** ProductArt — picks the right placeholder visual per product
 *  category. Lake-map products get the SVG lake illustration with
 *  a unique label per card so the catalog wall looks varied.
 *  Wildlife / ornament / sign get themed SVG scenes. All swap to
 *  Nate's real photos once they land — just check p.imageUrl
 *  and render <Image src={p.imageUrl} /> instead.
 */
function ProductArt({ product }: { product: Product }) {
  // Each lake-map product gets a different label so the grid feels
  // like a real catalog of varied pieces, not "the same map x6".
  const lakeMapLabels: Record<string, { label: string; state: string; variant: "warm" | "walnut" | "ebony" }> = {
    "lake-map-classic": { label: "Mille Lacs", state: "MN", variant: "warm" },
    "lake-map-shadowbox": { label: "Lake Tahoe", state: "CA", variant: "walnut" },
    "lake-map-coaster-set": { label: "Burntside", state: "MN", variant: "warm" },
  };

  if (product.category === "lake-map") {
    const cfg = lakeMapLabels[product.id] ?? { label: "Mille Lacs", state: "MN", variant: "warm" as const };
    return (
      <LakeMapArt
        label={cfg.label}
        state={cfg.state}
        variant={cfg.variant}
        className="w-full h-full"
      />
    );
  }

  if (product.category === "ornament") {
    // Ornament — small lake-map roundel on a darker background
    return (
      <div className="w-full h-full relative" style={{ background: "linear-gradient(135deg, #2a1f15 0%, #100b07 100%)" }}>
        <div
          className="absolute inset-[18%] rounded-full overflow-hidden"
          style={{
            boxShadow: "0 8px 30px rgba(217, 159, 88, 0.25), inset 0 0 0 3px rgba(217, 159, 88, 0.4)",
          }}
        >
          <LakeMapArt label="Squam" state="NH" variant="warm" className="w-full h-full" />
        </div>
        {/* Twine hanger */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[18%]"
          style={{ background: "linear-gradient(180deg, transparent 0%, #d99f58 100%)" }}
        />
      </div>
    );
  }

  if (product.category === "wildlife") {
    // Wildlife — silhouette on stained wood
    const isLoon = product.id.includes("loon");
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4a3a2a 0%, #2a1f15 100%)" }}
      >
        <svg viewBox="0 0 600 450" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`wl-bg-${product.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1f2e3a" />
              <stop offset="100%" stopColor="#0c1820" />
            </linearGradient>
          </defs>
          <rect width="600" height="450" fill={`url(#wl-bg-${product.id})`} />
          {/* Faux water reflection lines */}
          {[300, 320, 340, 360, 385, 410].map((y, i) => (
            <line
              key={y}
              x1="0"
              x2="600"
              y1={y}
              y2={y}
              stroke="rgba(217, 159, 88, 0.18)"
              strokeWidth={1.2 + i * 0.1}
            />
          ))}
          {isLoon ? (
            // Loon silhouette
            <g transform="translate(300 230)" fill="#0a0e10" stroke="#d99f58" strokeWidth="1.2">
              <path d="M -90 0 C -85 -40, -40 -55, 10 -50 C 60 -50, 90 -30, 100 -10 C 95 5, 60 15, 0 18 C -50 18, -85 12, -90 0 Z" />
              <path d="M 80 -15 C 100 -25, 120 -45, 130 -75 C 132 -85, 125 -90, 115 -85 C 100 -78, 90 -55, 85 -30 Z" />
              <line x1="120" y1="-78" x2="155" y2="-90" strokeWidth="2.5" />
              <circle cx="118" cy="-65" r="2" fill="#d99f58" />
            </g>
          ) : (
            // Pine trio silhouette
            <g transform="translate(300 280)" fill="#0a0e10" stroke="#d99f58" strokeWidth="1.2">
              {[-110, 0, 110].map((x, i) => {
                const h = i === 1 ? 180 : 140;
                return (
                  <g key={x} transform={`translate(${x} 0)`}>
                    <polygon points={`0,${-h} -35,${-h * 0.55} -22,${-h * 0.55} -50,${-h * 0.25} -32,${-h * 0.25} -65,0 65,0 32,${-h * 0.25} 50,${-h * 0.25} 22,${-h * 0.55} 35,${-h * 0.55}`} />
                    <rect x="-7" y="-5" width="14" height="20" fill="#3a2811" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    );
  }

  // Sign — engraved cabin name plate look
  return (
    <div className="w-full h-full relative">
      <LakeMapArt label="The Williams" state="EST · 2008" variant="warm" className="w-full h-full" />
    </div>
  );
}

export default BespokeExperience;
