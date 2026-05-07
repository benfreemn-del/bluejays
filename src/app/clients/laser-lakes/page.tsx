import Link from "next/link";
import LakeInquiryForm from "./LakeInquiryForm.client";
import EmailCaptureFooter from "./EmailCaptureFooter.client";
import { BespokeExperience } from "./bespoke-experience.client";

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
          backgroundColor: "#1f1a14",
          color: "#f6f1e8",
        }}
      >
        <div className="absolute inset-0 opacity-40">
          {/* Cabin/lake atmosphere — soft duotone gradient */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 70% 30%, rgba(217, 159, 88, 0.32), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(99, 70, 39, 0.4), transparent 70%)",
            }}
          />
        </div>

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
              className="aspect-[4/5] rounded-md shadow-2xl overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, #c9a87a 0%, #8c6a3f 50%, #5d4225 100%)",
              }}
            >
              {/* Concentric contour rings — three layered SVG circles. */}
              <svg
                viewBox="0 0 400 500"
                className="absolute inset-0 w-full h-full"
                style={{ animation: "lakes-ring-pulse 6s ease-in-out infinite" }}
                aria-hidden
              >
                <defs>
                  <radialGradient id="lakeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 240, 210, 0.15)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="200" cy="250" r="180" fill="url(#lakeGlow)" />
                {[40, 70, 100, 130, 160, 185].map((r, i) => (
                  <circle
                    key={r}
                    cx="200"
                    cy="250"
                    r={r}
                    fill="none"
                    stroke="rgba(255, 240, 210, 0.18)"
                    strokeWidth={1.2 + i * 0.15}
                  />
                ))}
              </svg>
              {/* Water shimmer overlay — diagonal sweep */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 35%, rgba(255, 240, 210, 0.18) 50%, transparent 65%)",
                  animation: "lakes-shimmer 8s ease-in-out infinite",
                }}
              />
              <div className="absolute inset-6 border-2 border-amber-100/20 rounded-sm flex items-center justify-center">
                <div className="text-center relative z-10">
                  <p
                    className="text-amber-100/80 text-xs uppercase tracking-[0.4em] mb-3"
                  >
                    Featured piece
                  </p>
                  <p
                    className="text-amber-50 text-3xl"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    Lake Burntside
                  </p>
                  <p className="text-amber-100/60 text-sm mt-2">
                    Custom · 18&quot; × 24&quot; · 3-layer Baltic birch
                  </p>
                </div>
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

      {/* ─── CUSTOM MAPS — flagship product ───────────────────────────── */}
      <section
        id="custom-maps"
        className="border-t border-b"
        style={{ borderColor: "rgba(43, 36, 28, 0.1)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <p
              className="text-xs uppercase tracking-[0.32em] mb-4"
              style={{ color: "#8c6a3f" }}
            >
              The Flagship
            </p>
            <h2
              className="text-4xl md:text-5xl mb-5"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              Custom Lake Maps · $325 – $650
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed opacity-80">
              Tell Nate the name of your lake. He&apos;ll cut you a 3-layer
              wood map showing the exact shoreline, a stained finish you
              choose, and your family name engraved at the bottom. About 3
              weeks from sketch to ship.
            </p>
          </div>

          {/* How it gets made — three-step */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            <ProcessStep
              n="01"
              title="Tell us your lake"
              body="Drop the lake name + your family name in the form below. Nate sketches the cut, sends you a preview, and you approve before any wood gets cut."
            />
            <ProcessStep
              n="02"
              title="Hand-cut + stained"
              body="Three layers of Baltic birch laser-cut to your shoreline, then sanded and stained by hand. You pick the finish — natural, walnut, espresso, or whitewash."
            />
            <ProcessStep
              n="03"
              title="Shipped to your door"
              body="Signed, padded, boxed, and shipped. Most maps reach you within 3 weeks of approval. Each piece comes with mounting hardware and a hand-written care card."
            />
          </div>

          {/* Inquiry form */}
          <div
            className="rounded-2xl p-6 md:p-10 max-w-3xl mx-auto"
            style={{
              backgroundColor: "#fff8ec",
              border: "1px solid rgba(43, 36, 28, 0.12)",
            }}
          >
            <h3
              className="text-2xl mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Start your custom map
            </h3>
            <p className="text-sm opacity-75 mb-6 leading-relaxed">
              Nate replies personally within a day. No deposit until you&apos;ve
              approved the sketch.
            </p>
            <LakeInquiryForm />
          </div>
        </div>
      </section>

      {/* ─── SHOP — collections grid ──────────────────────────────────── */}
      <section
        id="shop"
        style={{
          backgroundColor: "#ebe2d2",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-[0.32em] mb-4"
              style={{ color: "#8c6a3f" }}
            >
              Ready to Ship
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              Shop the collections
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <CollectionCard
              title="Wall Art"
              priceFrom="22"
              description="Wolf Song · Bald Eagle · Northwoods animals. Layered wood with hand-finished detail."
              accent="#8c6a3f"
              shopifyUrl="https://laserlakes.com/collections/wall-art"
            />
            <CollectionCard
              title="Ornaments"
              priceFrom="15"
              description="Minnesota-shaped, lake-shaped, wildlife. Tied with twine. Ship for the holidays."
              accent="#5d7c4a"
              shopifyUrl="https://laserlakes.com/collections/ornaments"
            />
            <CollectionCard
              title="Lake Maps · Stock"
              priceFrom="245"
              description="Pre-cut maps of popular Minnesota lakes — Mille Lacs, Minnetonka, Gull, more."
              accent="#3a5871"
              shopifyUrl="https://laserlakes.com/collections/lake-maps"
            />
          </div>

          <p className="text-center text-xs opacity-60 mt-10">
            All purchases process through our secure Shopify storefront. Same
            shipping, same returns, same Nate.
          </p>
        </div>
      </section>

      {/* ─── BEHIND THE SCENES ────────────────────────────────────────── */}
      <section
        id="story"
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1f1a14", color: "#f6f1e8" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div
            className="aspect-square rounded-md shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #5d4225 0%, #2b241c 100%)",
            }}
          >
            <div className="h-full flex items-center justify-center">
              <p
                className="text-amber-100/40 text-xs uppercase tracking-[0.32em]"
              >
                Workshop photo · place your shot here
              </p>
            </div>
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
      <section id="stories" style={{ backgroundColor: "#f6f1e8" }}>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
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
        style={{ backgroundColor: "#2b241c", color: "#f6f1e8" }}
      >
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
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
          <span>Site by BlueJays</span>
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
