import Link from "next/link";
import EmailCaptureFooter from "./EmailCaptureFooter.client";
import { BespokeExperience } from "./bespoke-experience.client";
import BluejayFeather from "@/components/BluejayFeather";

export const metadata = {
  title: "Laser Lakes — Custom Lake Maps + Wood Wildlife Art (Minnesota)",
  description:
    "Layered Baltic-birch lake maps, hand-cut and finished in Minnesota. Custom maps of the lake your family loves, plus rustic wood wildlife art and ornaments.",
};

/**
 * /clients/laser-lakes — public marketing front for Nate's laserlakes.com.
 *
 * Replaces the Shopify default-theme storefront homepage. Shopify still owns
 * cart + checkout — Shop links here point at his existing Shopify product
 * pages so we don't break his fulfillment.
 *
 * Brand interpretation:
 *   · Warm cream / charcoal palette (cabin walls + wood smoke, not white)
 *   · Big photography of the actual cut wood — pieces are the headline
 *   · Hand-drawn-feel serif headlines (Playfair) over clean sans body
 *   · Lake / Northwoods iconography but restrained — never kitschy
 */
export default function LaserLakesPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "#f6f1e8",
        color: "#2b241c",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top nav — sparse, lets the brand breathe */}
      <nav
        className="border-b sticky top-0 z-30 backdrop-blur"
        style={{
          borderColor: "rgba(43, 36, 28, 0.08)",
          backgroundColor: "rgba(246, 241, 232, 0.92)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/clients/laser-lakes"
            className="font-bold text-lg tracking-wider"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Laser Lakes
          </Link>
          <div className="hidden sm:flex items-center gap-7 text-sm font-medium">
            <a href="#lake-browser" className="hover:opacity-70 transition-opacity">
              Find Your Lake
            </a>
            <a href="#catalog" className="hover:opacity-70 transition-opacity">
              The Pieces
            </a>
            <a href="#configure" className="hover:opacity-70 transition-opacity">
              Configure
            </a>
            <a href="#story" className="hover:opacity-70 transition-opacity">
              Our Story
            </a>
            <a href="#stories" className="hover:opacity-70 transition-opacity">
              Reviews
            </a>
          </div>
          <a
            href="#custom-maps"
            className="text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-full transition-colors"
            style={{
              backgroundColor: "#2b241c",
              color: "#f6f1e8",
            }}
          >
            Start Your Map
          </a>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#0c1820",
          color: "#f6f1e8",
        }}
      >
        {/* REAL LAKE PHOTO — moody Northwoods lake at dusk fills the
            entire hero background. Provides the actual nature vibe
            instead of flat brown. Image is from Unsplash CDN
            (stable hot-link), darkened with overlays so the
            foreground copy stays legible. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1431512284068-4c4002298068?w=2400&q=85&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.55,
            filter: "saturate(1.05)",
          }}
          aria-hidden
        />
        {/* Dusk-warm gradient overlay — pulls the photo toward the
            brand's amber + warm-walnut palette without losing the
            water depth. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(12, 24, 32, 0.85) 0%, rgba(31, 26, 20, 0.65) 45%, rgba(12, 18, 24, 0.85) 100%)",
          }}
          aria-hidden
        />
        {/* Amber + walnut radial glows — keep the cabin warmth */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 75% 25%, rgba(217, 159, 88, 0.32), transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(99, 70, 39, 0.45), transparent 65%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p
              className="text-xs uppercase tracking-[0.32em] mb-5"
              style={{ color: "#d99f58" }}
            >
              Handcrafted in Minnesota · Since 2020
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl leading-[1.05] font-bold mb-6"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              Layered wood maps of the lakes you love.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl mb-8 opacity-90">
              Every Laser Lakes piece is hand-finished Baltic birch — the
              shoreline of <em>your</em> lake, cut in three layers, sanded by
              hand, and signed by Nate. Made one at a time in our Minnesota
              workshop.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#lake-browser"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "#d99f58",
                  color: "#1f1a14",
                }}
              >
                Find Your Lake →
              </a>
              <a
                href="#catalog"
                className="inline-flex items-center justify-center px-7 py-4 rounded-full text-sm font-bold uppercase tracking-widest border transition-colors"
                style={{
                  borderColor: "rgba(246, 241, 232, 0.3)",
                  color: "#f6f1e8",
                }}
              >
                Browse the Pieces
              </a>
            </div>
          </div>

          {/* Hero piece showcase — placeholder for Nate's photo. Beauty
              pass: animated concentric "contour" rings simulating a lake
              map being cut, plus a subtle water-shimmer overlay. Drops
              away cleanly the moment a real photo replaces it. */}
          <div className="relative">
            <style>{`
              @keyframes lakes-shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              @keyframes lakes-ring-pulse {
                0%, 100% { opacity: 0.35; }
                50% { opacity: 0.55; }
              }
            `}</style>
            <div
              className="aspect-[4/5] rounded-md shadow-2xl overflow-hidden relative ring-1 ring-amber-100/15"
              style={{
                boxShadow:
                  "0 25px 70px -15px rgba(0,0,0,0.6), 0 8px 25px -8px rgba(217, 159, 88, 0.25)",
              }}
            >
              {/* Nate's actual Burntside Lake Map photo from his Shopify
                  CDN. The real piece — varnished birch, hand-stained,
                  layered shoreline — does the heavy lifting. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://laserlakes.com/cdn/shop/files/BurntsideLakeMap_Top3234_30db2ab9-8e5f-445f-b004-95f5c3166d03.jpg"
                alt="Burntside Lake Map — hand-cut three-layer Baltic birch, signed by Nate"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Subtle warm vignette for premium product-photo feel */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%)",
                }}
              />
              {/* Water shimmer sweep across the photo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 35%, rgba(255, 240, 210, 0.16) 50%, transparent 65%)",
                  animation: "lakes-shimmer 8s ease-in-out infinite",
                }}
              />
              {/* Caption strip overlaid bottom — the photo is the headline */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between text-[10px] tracking-[0.32em] uppercase font-bold"
                style={{
                  color: "#f6f1e8",
                  background:
                    "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
                }}
              >
                <span>Burntside Lake · MN</span>
                <span>3-layer Baltic birch</span>
              </div>
            </div>
            <div
              className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
              style={{ backgroundColor: "#f6f1e8", color: "#1f1a14" }}
            >
              Made by hand · Nate
            </div>
          </div>
        </div>
      </section>

      {/* ─── BESPOKE EXPERIENCE — lake browser + catalog + configurator ─── */}
      <BespokeExperience />


      {/* ─── BEHIND THE SCENES ────────────────────────────────────────── */}
      <section
        id="story"
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1f1a14", color: "#f6f1e8" }}
      >
        {/* Workshop / pine-forest ambient — adds the cabin-and-trees
            mood under Nate's process story. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=2400&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
            filter: "saturate(1.1) hue-rotate(-5deg)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(31, 26, 20, 0.92) 0%, rgba(31, 26, 20, 0.7) 50%, rgba(31, 26, 20, 0.92) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div
            className="aspect-square rounded-md shadow-2xl overflow-hidden ring-1 ring-amber-200/15"
            style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)" }}
          >
            {/* Real Ten Mile Lake detail shot — shows the layered
                Baltic-birch construction up close. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://laserlakes.com/cdn/shop/files/TenMileIMG_3050.jpg"
              alt="Ten Mile Lake Map · close-up showing the three-layer Baltic birch construction"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-[0.32em] mb-5"
              style={{ color: "#d99f58" }}
            >
              The Difference is in the Details
            </p>
            <h2
              className="text-4xl md:text-5xl mb-6"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              One workshop. One Nate. One map at a time.
            </h2>
            <div className="space-y-4 text-lg leading-relaxed opacity-90">
              <p>
                Laser Lakes started with a single map, made for a family who
                wanted something on their cabin wall that meant more than
                another framed print.
              </p>
              <p>
                Five years later, every piece still leaves the workshop
                signed in pencil on the back. No outsourced fulfillment, no
                drop-shipping, no &quot;made by Laser Lakes design team&quot;
                — just Nate, the laser, and a stack of Baltic birch that
                came in last Tuesday.
              </p>
              <p>
                Featured by{" "}
                <span style={{ color: "#d99f58" }}>OneLaser</span> as a
                national maker example.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS / STORIES ──────────────────────────────────── */}
      <section id="stories" style={{ backgroundColor: "#f6f1e8" }} className="relative overflow-hidden">
        {/* Misty Northwoods lake at sunrise — adds dimension behind
            the testimonials so the section doesn't read as a flat
            cream rectangle. Heavily faded so the white quote cards
            still have contrast. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=2400&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #f6f1e8 0%, transparent 25%, transparent 75%, #f6f1e8 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-[0.32em] mb-4"
              style={{ color: "#8c6a3f" }}
            >
              The Stories
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              On walls across the Northwoods
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Testimonial
              quote="The finished piece brought happy tears to our Mom. Nate captured everything perfectly — even the little island we used to swim to."
              attribution="Aimee · Minnesota"
              gift="60th birthday gift · Burntside Lake"
            />
            <Testimonial
              quote="Hung above the fireplace at the cabin. Three weeks from order to door. Could not believe the level of detail."
              attribution="Mark · Brainerd Lakes Area"
              gift="Anniversary · Ten Mile Lake"
            />
            <Testimonial
              quote="I bought one for my dad's retirement and three more for my siblings. Now everyone has a piece of the lake we grew up on."
              attribution="Sarah · Saint Paul"
              gift="Family commission · Mille Lacs"
            />
          </div>

          <p className="text-center text-sm opacity-75">
            Tag your piece{" "}
            <span className="font-bold">#laserlakes</span> on Facebook to be
            featured.
          </p>
        </div>
      </section>

      {/* ─── EMAIL CAPTURE FOOTER ────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#2b241c", color: "#f6f1e8" }}
      >
        {/* Dusk lake reflection photo — sets the close-of-page mood */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.32,
            filter: "saturate(0.85)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(43, 36, 28, 0.6) 0%, rgba(43, 36, 28, 0.85) 60%, #2b241c 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
          <p
            className="text-xs uppercase tracking-[0.32em] mb-4"
            style={{ color: "#d99f58" }}
          >
            Be First To Know
          </p>
          <h2
            className="text-3xl md:text-4xl mb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            New maps + holiday ornaments
          </h2>
          <p className="text-base opacity-80 mb-8 leading-relaxed">
            One short email when a new lake gets added or the seasonal
            ornaments are back in stock. No spam — Nate writes them himself.
          </p>
          <EmailCaptureFooter />
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        style={{
          backgroundColor: "#1f1a14",
          color: "rgba(246, 241, 232, 0.6)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p
              className="font-bold text-base mb-2"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#f6f1e8",
              }}
            >
              Laser Lakes
            </p>
            <p className="leading-relaxed">
              Handcrafted Baltic-birch lake maps + wood wildlife art.
              Minnesota-made. Shipped nationwide.
            </p>
          </div>
          <div>
            <p
              className="font-bold uppercase tracking-widest text-xs mb-3"
              style={{ color: "#d99f58" }}
            >
              Shop
            </p>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://laserlakes.com/collections/lake-maps"
                  className="hover:text-white"
                >
                  Lake Maps
                </a>
              </li>
              <li>
                <a
                  href="https://laserlakes.com/collections/wall-art"
                  className="hover:text-white"
                >
                  Wall Art
                </a>
              </li>
              <li>
                <a
                  href="https://laserlakes.com/collections/ornaments"
                  className="hover:text-white"
                >
                  Ornaments
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p
              className="font-bold uppercase tracking-widest text-xs mb-3"
              style={{ color: "#d99f58" }}
            >
              Connect
            </p>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://facebook.com/laserlakesmn"
                  className="hover:text-white"
                >
                  Facebook · @laserlakesmn
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@laserlakes.com"
                  className="hover:text-white"
                >
                  hello@laserlakes.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="border-t mx-auto max-w-7xl px-6 py-5 text-xs opacity-50 flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: "rgba(246, 241, 232, 0.08)" }}
        >
          <span>© {new Date().getFullYear()} Laser Lakes · All rights reserved.</span>
          {/* Built-by-BlueJays credit — small blue feather icon links
              to Ben's portfolio + free audit funnel. Per CLAUDE.md the
              footer credit on every client site uses this exact phrase
              + format so each new customer becomes a backlink to /audit. */}
          <a
            href="https://bluejayportfolio.com/audit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:opacity-100 transition-opacity"
          >
            <BluejayFeather size={14} className="shrink-0" />
            <span>
              Built by{" "}
              <span className="underline decoration-dotted underline-offset-2">
                BlueJays
              </span>
            </span>
          </a>
        </div>
      </footer>
    </main>
  );
}

function ProcessStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#fff8ec",
        border: "1px solid rgba(43, 36, 28, 0.08)",
      }}
    >
      <p
        className="text-3xl mb-3"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: "#d99f58",
        }}
      >
        {n}
      </p>
      <h3 className="text-lg font-bold mb-2 leading-tight">{title}</h3>
      <p className="text-sm opacity-80 leading-relaxed">{body}</p>
    </div>
  );
}

function CollectionCard({
  title,
  priceFrom,
  description,
  accent,
  shopifyUrl,
}: {
  title: string;
  priceFrom: string;
  description: string;
  accent: string;
  shopifyUrl: string;
}) {
  return (
    <a
      href={shopifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl overflow-hidden transition-transform hover:-translate-y-1"
      style={{
        backgroundColor: "#fff8ec",
        border: "1px solid rgba(43, 36, 28, 0.1)",
      }}
    >
      <div
        className="aspect-[4/3] flex items-center justify-center text-white"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #2b241c 100%)`,
        }}
      >
        <span
          className="text-3xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="text-sm opacity-70">from ${priceFrom}</span>
        </div>
        <p className="text-sm opacity-75 leading-relaxed mb-3">{description}</p>
        <p
          className="text-xs uppercase tracking-widest font-bold group-hover:underline"
          style={{ color: accent }}
        >
          Shop the collection ↗
        </p>
      </div>
    </a>
  );
}

function Testimonial({
  quote,
  attribution,
  gift,
}: {
  quote: string;
  attribution: string;
  gift: string;
}) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#fff8ec",
        border: "1px solid rgba(43, 36, 28, 0.08)",
      }}
    >
      <p
        className="text-3xl mb-3"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: "#d99f58",
          lineHeight: 1,
        }}
      >
        &ldquo;
      </p>
      <p className="text-base leading-relaxed mb-4">{quote}</p>
      <p className="font-bold text-sm">— {attribution}</p>
      <p className="text-xs opacity-60 mt-1">{gift}</p>
    </div>
  );
}
