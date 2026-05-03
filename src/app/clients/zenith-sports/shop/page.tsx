/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally; photos are hosted on zenithsports.org's Shopify CDN. */

/**
 * /clients/zenith-sports/shop — companion shop page to the Zenith Sports
 * showcase. Three real products (TEKKY ball, grip socks, performance tee).
 * Every "Buy Now" CTA is an external link to Zenith's existing Shopify
 * checkout — we are not building cart functionality here, we are
 * funneling buyers to the live store.
 *
 * Sections:
 *   - Promo marquee (same as main)
 *   - Sticky nav (active = "Shop")
 *   - Banner hero (bread.jpg)
 *   - 3 product cards with hero photo + thumbnails + buy-now external link
 *   - Bundle promo strip ("Buy 2 shirts for $30")
 *   - Why TEKKY mini-band (anchors back to main page if they want context)
 *   - Footer (same as main)
 */

import type { Metadata, Viewport } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Star,
  CheckCircle,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Tag,
  Envelope,
  InstagramLogo,
  FacebookLogo,
} from "@phosphor-icons/react/dist/ssr";

import StickyNav from "../sticky-nav";

export const metadata: Metadata = {
  title:
    "Shop the TEKKY · Zenith Sports — Training Ball, Grip Socks, Performance Tees",
  description:
    "Shop Zenith Sports' lineup: the TEKKY Advanced Training Ball ($59.95), TEKKY grip socks ($15.00), and high-performance training tees ($17.50). Built for youth soccer players who train technical skill first.",
};

export const viewport: Viewport = {
  themeColor: "#0a1832",
};

/* ───────────────────────── COLORS ───────────────────────── */
const NAVY = "#0a1832";
const NAVY_DEEP = "#050d1f";
const NAVY_INK = "#0f172a";
const IVORY = "#f5f3ee";
const IVORY_SOFT = "#ebe7dd";
const ELECTRIC = "#1d4ed8";
const LIME = "#a3e635";
const AMBER = "#f59e0b";
const INK_SOFT_LIGHT = "#475569";

const LOGO =
  "https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png";

/* ───────────────────────── PHOTOS (curl-verified 200) ───────────────────────── */
const PHOTOS = {
  bread: "https://zenithsports.org/cdn/shop/files/bread.jpg",
  meet: "https://zenithsports.org/cdn/shop/files/meet.jpg",

  // The TEKKY ball
  ballHero: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg",
  ballThumb1: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00002.jpg",
  ballThumb2: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00003.jpg",
  ballThumb3: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00005.jpg",
  ballThumb4: "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00007.jpg",

  // Grip socks
  socksWhite:
    "https://zenithsports.org/cdn/shop/files/Tekky_Socks_White_Web_eaa7877d-0611-4947-bf90-832db80b57b4.jpg",
  socksBlack: "https://zenithsports.org/cdn/shop/files/Tekky_Socks_Black_Web.jpg",

  // Performance tee
  shirtBlack:
    "https://zenithsports.org/cdn/shop/files/ZenithSports-Shirt-Black-00003_a47e1900-60a5-42bd-b6b4-cb2bb43e9a00.jpg",
  shirtGray:
    "https://zenithsports.org/cdn/shop/files/Performance_T-Shirt_Gray_Front_Web.jpg",
} as const;

/* ───────────────────────── REAL SHOPIFY URLS ───────────────────────── */
const SHOP_URLS = {
  tekkyBall:
    "https://zenithsports.org/products/the-tekky-advanced-youth-training-ball",
  socks: "https://zenithsports.org/products/tekky-grip-socks",
  shirt: "https://zenithsports.org/products/high-performance-tekky-t-white-copy",
} as const;

/* ───────────────────────── PROMO MARQUEE ───────────────────────── */
const PROMO_TEXT =
  "TEKKY HIGH PERFORMANCE TEES — 30% OFF · BUY 2 SHIRTS FOR $30 · TEKKY GRIP SOCKS — GET $5 OFF YOUR 2ND PAIR · DISCOUNTS APPLIED AT CHECKOUT";

function PromoMarquee() {
  return (
    <div
      className="relative overflow-hidden border-b border-white/10"
      style={{ background: NAVY_DEEP, color: LIME }}
    >
      <div className="flex whitespace-nowrap py-2 animate-zenith-marquee group hover:[animation-play-state:paused]">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-8 text-[11px] tracking-[0.22em] uppercase font-bold"
          >
            {PROMO_TEXT}
            <span className="mx-6 text-white/40">·</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes zenith-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-zenith-marquee {
          animation: zenith-marquee 38s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-zenith-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── PRODUCT CARD ───────────────────────── */
type Product = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceCents: number;
  reviews: { stars: number; count: string };
  hero: string;
  thumbs: string[];
  description: string;
  bullets: string[];
  variants?: string;
  shopUrl: string;
  badge?: { label: string; color?: string };
};

function ProductCard({ product, index }: { product: Product; index: number }) {
  const reversed = index % 2 === 1;
  return (
    <article
      id={product.id}
      className="group bg-white border border-slate-200 hover:border-[#1d4ed8]/40 transition overflow-hidden"
    >
      <div className={`grid lg:grid-cols-2 ${reversed ? "lg:[direction:rtl]" : ""}`}>
        {/* Photos */}
        <div className="relative bg-[#f5f3ee] aspect-[4/3] lg:aspect-auto lg:[direction:ltr]">
          <img
            src={product.hero}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(1.06) contrast(1.04)" }}
          />
          {product.badge && (
            <div
              className="absolute top-5 left-5 px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase font-extrabold"
              style={{
                background: product.badge.color || LIME,
                color: NAVY_INK,
              }}
            >
              {product.badge.label}
            </div>
          )}
          {/* Thumbnail strip */}
          {product.thumbs.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
              {product.thumbs.map((t, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white border border-white/80 shadow overflow-hidden"
                >
                  <img
                    src={t}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copy */}
        <div className="p-8 sm:p-10 lg:p-14 flex flex-col [direction:ltr]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#1d4ed8]">
              {product.tagline}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  weight="fill"
                  className="text-[#f59e0b]"
                />
              ))}
              <span
                className="ml-1 text-[10px] uppercase tracking-wider font-bold"
                style={{ color: INK_SOFT_LIGHT }}
              >
                {product.reviews.stars.toFixed(1)} · {product.reviews.count}
              </span>
            </div>
          </div>

          <h2
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.95]"
            style={{ color: NAVY_INK }}
          >
            {product.name}
          </h2>

          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: INK_SOFT_LIGHT }}
          >
            {product.description}
          </p>

          <ul className="mt-6 space-y-2.5">
            {product.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <CheckCircle
                  size={16}
                  weight="fill"
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: ELECTRIC }}
                />
                <span style={{ color: NAVY_INK }}>{b}</span>
              </li>
            ))}
          </ul>

          {product.variants && (
            <div
              className="mt-6 inline-flex self-start items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 border border-slate-300"
              style={{ color: NAVY_INK }}
            >
              <Tag size={12} weight="bold" />
              {product.variants}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4 pt-6 border-t border-slate-200">
            <div>
              <div
                className="text-[10px] tracking-[0.28em] uppercase font-extrabold"
                style={{ color: INK_SOFT_LIGHT }}
              >
                Price
              </div>
              <div
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{ color: NAVY_INK }}
              >
                {product.price}
              </div>
            </div>
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 bg-[#0a1832] text-white px-7 py-4 text-[12px] font-extrabold tracking-[0.2em] uppercase hover:bg-[#1d4ed8] transition group/cta"
            >
              <ShoppingCart size={14} weight="bold" />
              Buy on Zenith Sports
              <ArrowUpRight
                size={14}
                weight="bold"
                className="group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function ZenithSportsShopPage() {
  const products: Product[] = [
    {
      id: "tekky-ball",
      name: "The TEKKY — Advanced Training Ball",
      tagline: "The hero product",
      price: "$59.95",
      priceCents: 5995,
      reviews: { stars: 5.0, count: "5 reviews" },
      hero: PHOTOS.ballHero,
      thumbs: [
        PHOTOS.ballThumb1,
        PHOTOS.ballThumb2,
        PHOTOS.ballThumb3,
        PHOTOS.ballThumb4,
      ],
      description:
        "Elevate your game with TEKKY, the ultimate training ball. The smaller, heavier design has been engineered to help players improve technical abilities, control, and comfort on the pitch. Smaller in size yet weighted to FIFA size-5 spec — perfect for ages 5 and up.",
      bullets: [
        "Smaller surface area trains pinpoint touch",
        "Full FIFA-spec weight builds genuine strength",
        "Engineered for ages 5 through high school",
        "Feels effortless on the regulation ball after",
      ],
      shopUrl: SHOP_URLS.tekkyBall,
      badge: { label: "Bestseller" },
    },
    {
      id: "grip-socks",
      name: "TEKKY Grip Socks",
      tagline: "Footwork foundation",
      price: "$15.00",
      priceCents: 1500,
      reviews: { stars: 5.0, count: "Verified buyers" },
      hero: PHOTOS.socksWhite,
      thumbs: [PHOTOS.socksBlack],
      description:
        "Stable footwork starts with stable feet. TEKKY grip socks lock the foot inside the boot — no internal slide, no wasted motion, no blisters from a foot sliding sideways through a turn.",
      bullets: [
        "Internal grip pads at the forefoot and heel",
        "Premium athletic-cotton blend for breathability",
        "Sized for youth and adult feet",
        "$5 off your second pair — auto-applied at checkout",
      ],
      variants: "2 colors: White · Black",
      shopUrl: SHOP_URLS.socks,
    },
    {
      id: "performance-tee",
      name: "High Performance TEKKY Training Tee",
      tagline: "On-pitch identity",
      price: "$17.50",
      priceCents: 1750,
      reviews: { stars: 5.0, count: "Verified buyers" },
      hero: PHOTOS.shirtGray,
      thumbs: [PHOTOS.shirtBlack],
      description:
        "Lightweight, sweat-wicking performance fabric designed for full-effort training. Cut for movement — sleeves stay clean on a throw-in, body stays put on a sprint.",
      bullets: [
        "Moisture-wicking high-performance fabric",
        "Athletic cut — no bunching, no twisting",
        "TEKKY badge embroidered, not printed",
        "Currently 30% off across all colors",
      ],
      variants: "4 colors available",
      shopUrl: SHOP_URLS.shirt,
      badge: { label: "30% Off", color: AMBER },
    },
  ];

  return (
    <div
      id="top"
      className="min-h-screen"
      style={{
        background: IVORY,
        color: NAVY_INK,
        fontFamily:
          "ui-sans-serif, system-ui, 'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <PromoMarquee />
      <StickyNav
        businessName="Zenith Sports"
        logoSrc={LOGO}
        activePath="shop"
      />

      {/* ─────────────── BANNER HERO ─────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY }}
      >
        <div className="absolute inset-0">
          <img
            src={PHOTOS.bread}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(1.05) contrast(1.04)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(10,24,50,0.92) 0%, rgba(10,24,50,0.7) 50%, rgba(10,24,50,0.55) 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 sm:pt-24 lg:pt-28 pb-24 sm:pb-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em]" style={{ color: LIME }}>
              <span className="inline-block w-6 h-px" style={{ background: LIME }} />
              Zenith Shop
            </div>

            <h1 className="mt-7 text-[12vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black uppercase leading-[0.9] tracking-tighter text-white">
              Train better.
              <br />
              <span style={{ color: LIME }}>Look better.</span>
            </h1>

            <p
              className="mt-8 max-w-2xl text-base md:text-xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              The TEKKY ball, grip socks engineered for stable footwork, and
              high-performance training tees — every checkout runs through
              Zenith Sports&apos; own store.
            </p>

            <div className="mt-10 flex flex-wrap gap-6 items-center text-[11px] tracking-[0.22em] uppercase font-bold text-white/70">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} weight="bold" style={{ color: LIME }} />
                Direct from Zenith
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck size={16} weight="bold" style={{ color: LIME }} />
                Ships from US
              </span>
              <span className="inline-flex items-center gap-2">
                <Star size={16} weight="fill" style={{ color: AMBER }} />
                5.0 across all products
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── PROMO STRIP ─────────────── */}
      <section
        className="relative py-7 border-y border-[#1d4ed8]/20"
        style={{ background: AMBER }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-3">
            <Tag size={22} weight="bold" style={{ color: NAVY_INK }} />
            <span
              className="text-[12px] sm:text-[13px] tracking-[0.22em] uppercase font-extrabold"
              style={{ color: NAVY_INK }}
            >
              Buy 2 Shirts for $30
            </span>
          </div>
          <span
            className="text-sm sm:text-base font-semibold"
            style={{ color: NAVY_INK }}
          >
            · Plus $5 off your 2nd pair of grip socks. Discounts apply
            automatically at checkout.
          </span>
          <a
            href={SHOP_URLS.shirt}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:ml-auto inline-flex items-center gap-2 bg-[#0a1832] text-white px-5 py-3 text-[11px] font-extrabold tracking-[0.2em] uppercase hover:bg-[#1d4ed8] transition"
          >
            Shop the bundle
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </section>

      {/* ─────────────── PRODUCT GRID ─────────────── */}
      <section className="relative py-24 sm:py-32 lg:py-40" style={{ background: IVORY }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em]" style={{ color: ELECTRIC }}>
              <span className="inline-block w-6 h-px" style={{ background: ELECTRIC }} />
              The lineup
            </div>
            <h2
              className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92]"
              style={{ color: NAVY_INK }}
            >
              Three products.
              <br />
              <span style={{ color: ELECTRIC }}>One philosophy.</span>
            </h2>
            <p
              className="mt-7 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: INK_SOFT_LIGHT }}
            >
              Tap any &ldquo;Buy on Zenith Sports&rdquo; button to head straight to
              checkout on Zenith&apos;s own store. No accounts to create here.
            </p>
          </div>

          <div className="space-y-8 lg:space-y-12">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── BUNDLE CALLOUT ─────────────── */}
      <section
        className="relative py-24 sm:py-32 overflow-hidden"
        style={{ background: NAVY_DEEP }}
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src={PHOTOS.meet}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(5,13,31,0.92), rgba(29,78,216,0.55))" }} />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em]" style={{ color: LIME }}>
            <span className="inline-block w-6 h-px" style={{ background: LIME }} />
            Stack the deal
          </div>
          <h2 className="mt-6 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-white">
            Buy 2 shirts.
            <br />
            <span style={{ color: AMBER }}>Pay $30.</span>
          </h2>
          <p
            className="mt-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Performance tees are listed at $17.50 each — but stack two in your
            cart and the bundle drops the total to $30 automatically. Grip
            socks: get $5 off your second pair, same checkout, same magic.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={SHOP_URLS.shirt}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#a3e635] text-[#0a1832] px-7 py-4 text-[12px] font-extrabold tracking-[0.22em] uppercase hover:bg-white transition"
            >
              <ShoppingCart size={14} weight="bold" />
              Shop the tees
              <ArrowUpRight size={14} weight="bold" />
            </a>
            <a
              href={SHOP_URLS.socks}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-7 py-4 text-[12px] font-extrabold tracking-[0.22em] uppercase hover:bg-white/10 transition"
            >
              Add the grip socks
              <ArrowUpRight size={14} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────── WHY TEKKY MINI BAND ─────────────── */}
      <section className="relative py-24 sm:py-32" style={{ background: IVORY_SOFT }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em]" style={{ color: ELECTRIC }}>
                <span className="inline-block w-6 h-px" style={{ background: ELECTRIC }} />
                New here?
              </div>
              <h2
                className="mt-6 text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.92]"
                style={{ color: NAVY_INK }}
              >
                Wondering why
                <br />
                <span style={{ color: ELECTRIC }}>a smaller ball?</span>
              </h2>
              <p
                className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT_LIGHT }}
              >
                The TEKKY is engineered smaller in size yet weighted to
                regulation FIFA size-5. The combination forces sharper focus
                on every touch, builds real foot strength through resistance,
                and trains the kind of precision US Soccer&apos;s player pipeline
                has been missing for years.
              </p>
              <a
                href="/clients/zenith-sports#about"
                className="mt-10 inline-flex items-center gap-2 border-2 border-[#0a1832] text-[#0a1832] px-7 py-4 text-[12px] font-extrabold tracking-[0.22em] uppercase hover:bg-[#0a1832] hover:text-white transition group"
              >
                Read the full story
                <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="lg:col-span-5">
              {/* Clean 2x2 grid (was staggered with mt-8 / -mt-4 / mt-4 which
                  pushed the photo column noticeably taller than the text
                  column on desktop, leaving an awkward whitespace gap below
                  "Read the full story"). Even grid keeps both columns the
                  same visual weight under items-center. */}
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square overflow-hidden bg-slate-200">
                  <img src={PHOTOS.ballHero} alt="" aria-hidden className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden bg-slate-200">
                  <img src={PHOTOS.ballThumb1} alt="" aria-hidden className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden bg-slate-200">
                  <img src={PHOTOS.ballThumb2} alt="" aria-hidden className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden bg-slate-200">
                  <img src={PHOTOS.ballThumb3} alt="" aria-hidden className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer style={{ background: NAVY_DEEP, color: "rgba(255,255,255,0.75)" }} className="pt-24 pb-10 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <a href="/clients/zenith-sports" className="inline-flex items-center gap-3">
                <img src={LOGO} alt="Zenith Sports" className="h-14 w-auto" />
                <div>
                  <div className="text-[18px] font-extrabold uppercase tracking-tight text-white">
                    Zenith Sports
                  </div>
                  <div className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ color: LIME }}>
                    Home of the TEKKY
                  </div>
                </div>
              </a>
              <p className="mt-7 max-w-md text-sm leading-relaxed">
                Building Better Players, One Touch at a Time. The TEKKY is an
                innovative training tool designed to reshape the future of US
                Soccer by building a stronger technical foundation for the
                next generation of players.
              </p>

              <form
                className="mt-8 flex max-w-md border border-white/15 bg-white/[0.04]"
                action="mailto:info@zenithsports.org"
                method="get"
              >
                <input
                  type="email"
                  name="body"
                  placeholder="Email for TEKKY drops + drills"
                  className="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 bg-[#a3e635] text-[#0a1832] text-[11px] font-extrabold uppercase tracking-[0.2em] hover:bg-white transition"
                >
                  Join
                </button>
              </form>
            </div>

            <div className="lg:col-span-3">
              <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#a3e635]">
                Quick Links
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  { href: "/clients/zenith-sports", label: "Home" },
                  { href: "/clients/zenith-sports#about", label: "About" },
                  { href: "/clients/zenith-sports#tekky", label: "The TEKKY" },
                  { href: "/clients/zenith-sports/shop", label: "Apparel & Shop" },
                  { href: "/clients/zenith-sports#training", label: "Trainings" },
                  { href: "/clients/zenith-sports#contact", label: "Contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="hover:text-white transition">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <div className="text-[10px] tracking-[0.28em] uppercase font-extrabold text-[#a3e635]">
                Get in touch
              </div>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Envelope size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a href="mailto:info@zenithsports.org" className="hover:text-white transition">
                    info@zenithsports.org
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <InstagramLogo size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a
                    href="https://www.instagram.com/zenithsports.tekky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Instagram
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FacebookLogo size={16} weight="bold" className="mt-0.5 flex-shrink-0" />
                  <a
                    href="https://www.facebook.com/zenithsports.tekky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-[11px] tracking-[0.18em] uppercase font-semibold text-white/40">
            <div>© 2026 — Zenith Sports · All Rights Reserved</div>
            <div>
              Site by{" "}
              <a
                href="https://bluejaywebdesign.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-[#a3e635] transition"
              >
                BlueJays
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
