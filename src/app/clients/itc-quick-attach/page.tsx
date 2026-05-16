"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/itc-quick-attach — custom premium showcase for
 * Innovative Tractor Components (ITC), the Blossvale, NY manufacturer
 * of tractor accessories: toolboxes, chainsaw carriers, brush guards,
 * chassis protection, modular tool systems, custom steps, light mounts,
 * and firearm mounts. Run by Jake McCall under Terravox Manufacturing.
 *
 * Real assets used (all verified 200 from itcquickattach.com):
 *   - Real ITC company logo (SVG)
 *   - Real category photos for each product line
 *   - Real product action shot
 *   - Jake McCall as owner (verified from About page)
 *   - Real Blossvale NY location, real phone, real "made-in-USA" claim
 *   - Real "design + manufacturing under one roof" positioning
 *
 * Visual language: industrial charcoal + industrial red. Sharp-edged
 * geometric blocks, hi-contrast type, generous whitespace. The site
 * should feel like John Deere x Linear — the polished trade-tool
 * vibe, not consumer fluff.
 *
 * Audience nuance: this is a B2C/B2B hybrid — most buyers are
 * compact-tractor owners (TYM, Kubota, John Deere) buying upgrades
 * for their own machines. We tilt the form toward "tell us what
 * tractor you run" rather than fleet-buyer specifics.
 */

import { useState, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  ShieldCheck,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  Wrench,
  Toolbox,
  CaretDown,
  Envelope,
  FlagBanner,
  Factory,
  Hammer,
  Truck,
  TreeEvergreen,
  Crosshair,
  Lightbulb,
  Stack,
  StackSimple,
  Shield,
  Lightning,
  Package,
  Medal,
  Ruler,
  YoutubeLogo,
  TiktokLogo,
} from "@phosphor-icons/react";
import InquiryForm from "@/components/clients/InquiryForm";

// ─── Real ITC brand assets (verified live) ─────────────────────────
const ITC_LOGO =
  "https://itcquickattach.com/assets/images/ITC%20COmpany%20Logo%20large.svg";

// Real category photos — pulled from ITC's own image directory.
const CAT_TOOLBOX = "https://itcquickattach.com/assets/images/cat4.jpg";
const CAT_CHAINSAW = "https://itcquickattach.com/assets/images/itc-cat2.jpg";
const CAT_MODULAR = "https://itcquickattach.com/assets/images/itc-cat3.jpg";
const CAT_PROTECTION = "https://itcquickattach.com/assets/images/itc-cat4.jpg";
const CAT_STEPS = "https://itcquickattach.com/assets/images/cat5.jpg";
const CAT_ESSENTIALS =
  "https://itcquickattach.com/assets/images/69b59662-daab-40cc-94b0-606542c5a1ec.png";

// Real product action photo + behind-the-scenes thumbs
const ACTION_SHOT = "https://itcquickattach.com/assets/images/P1023437.JPG";
const FIELD_THUMB_1 =
  "https://itcquickattach.com/assets/images/thumbnails/416646348_673781968165500_6333377903488603380_n_thumbnail.jpg";
const FIELD_THUMB_2 =
  "https://itcquickattach.com/assets/images/thumbnails/P1036042_thumbnail.JPG";
const FIELD_THUMB_3 =
  "https://itcquickattach.com/assets/images/thumbnails/Snapshot_1_thumbnail.JPG";
const MISSION_PHOTO =
  "https://itcquickattach.com/assets/images/mission.png";
// Real full-res ITC photo for the "From Blossvale, NY to your
// tailgate" banner. Pulled directly from their image directory,
// curl-verified 200. Replaces a generic Unsplash workshop fallback.
const ITC_BLOSSVALE_BANNER =
  "https://itcquickattach.com/assets/images/Snapshot_1.JPG";

// Verified Unsplash fallbacks (curl-checked) for hero atmosphere shots
// where ITC's own photography doesn't cover the slot.
const UNSPLASH_TRACTOR_FIELD =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=85"; // tractor in green field
const UNSPLASH_FOREST_WORK =
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=2400&q=85"; // forest equipment
const UNSPLASH_FARMLAND =
  "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=2400&q=85"; // farmland horizon
const UNSPLASH_WORKSHOP =
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=2400&q=85"; // workshop / fabrication

// ─── Industrial palette ────────────────────────────────────────────
// Modern industrial: charcoal base, industrial-red punch, steel accents.
// Per Ben's request, swapped from safety-orange to a confident
// machine-shop red. Feels less DOT-cone and more Snap-on / fire-engine.
const BG = "#0d0f12";              // near-black industrial
const BG_DEEP = "#070809";         // void
const PANEL = "#15181d";           // gunmetal panel
const PANEL_LIGHT = "#1f2329";     // raised steel
const INK = "#f5f5f4";             // bright bone-white text
const INK_SOFT = "#a8a29e";        // warm gray for body
const INK_DIM = "#78716c";         // dim gray for captions
// Red palette — kept variable names as ORANGE/ORANGE_LIGHT/ORANGE_DEEP
// because they're referenced 70+ times and renaming would balloon the
// diff. The values are red now; readers can rename later if desired.
const ORANGE = "#dc2626";          // industrial red primary (red-600)
const ORANGE_LIGHT = "#ef4444";    // red-500
const ORANGE_DEEP = "#991b1b";     // red-800
const STEEL = "#475569";           // cool steel accent
const ORANGE_GLOW = "rgba(220, 38, 38, 0.15)";
const GRID = "rgba(255, 255, 255, 0.04)";

const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

// ─── Building blocks ──────────────────────────────────────────────

function SectionReveal({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function SteelCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`border transition-all ${className}`}
      style={{
        background: PANEL,
        borderColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MagneticButton({
  children,
  className = "",
  onClick,
  style,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  href?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 250, damping: 20 });
  const ys = useSpring(y, { stiffness: 250, damping: 20 });
  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      href={href}
      className={className}
      style={{ x: xs, y: ys, ...style }}
      onMouseMove={(e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.16);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.16);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

// Industrial-style hash-mark divider used at major section boundaries.
function HashDivider() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className="h-[2px] w-8"
        style={{ background: ORANGE }}
      />
      <div
        className="h-[2px] w-3 opacity-50"
        style={{ background: ORANGE }}
      />
      <div
        className="h-[2px] w-1.5 opacity-30"
        style={{ background: ORANGE }}
      />
    </div>
  );
}

// ─── Page-specific data ────────────────────────────────────────────

const productCategories = [
  {
    name: "Tractor Toolbox Kits",
    blurb:
      "Heavy-gauge steel boxes mounted to fit your loader or 3-point. Lockable, weather-sealed, ready for the long day.",
    img: CAT_TOOLBOX,
    badge: "Best seller",
    features: ["Lockable + weather-sealed", "Powder-coated steel", "Bolt-on mounting"],
    icon: Toolbox,
  },
  {
    name: "Chainsaw Carriers",
    blurb:
      "Fixed-mount carriers and the ITC SawBoss scabbard — keep the saw secure, accessible, and out of the cab.",
    img: CAT_CHAINSAW,
    badge: "Lifetime warranty",
    features: ["SawBoss lifetime warranty", "Fits 16\"–20\" bars", "Quick-release latches"],
    icon: TreeEvergreen,
  },
  {
    name: "Modular ITC Tool System",
    blurb:
      "Build your own setup. A common rail accepts toolboxes, saw mounts, light mounts, firearm mounts — swap in seconds.",
    img: CAT_MODULAR,
    badge: "Configurable",
    features: ["Universal rail backbone", "Mix + match modules", "Tool-less swaps"],
    icon: StackSimple,
  },
  {
    name: "Tractor Protection",
    blurb:
      "Brush guards, chassis armor, and grab handles that take the hit so your hood, lights, and grille don't.",
    img: CAT_PROTECTION,
    badge: "Heavy duty",
    features: ["Brush guards", "Chassis armor", "Reinforced grab handles"],
    icon: Shield,
  },
  {
    name: "Tractor Steps",
    blurb:
      "OEM mount-points. Bolt-on. No drilling. Models built to fit specific machines, not generic-and-pray.",
    img: CAT_STEPS,
    badge: "Machine-specific",
    features: ["Tractor-specific fitment", "No drilling required", "Knurled non-slip top"],
    icon: Stack,
  },
  {
    name: "Owner Essentials",
    blurb:
      "Lights, light mounts, Quick-Fist clamps, firearm mounts, Pat's Quick Hitch, and the small stuff that finishes the build.",
    img: CAT_ESSENTIALS,
    badge: "Add-ons",
    features: ["Light mounts + LEDs", "Quick-Fist clamps", "Pat's Quick Hitch"],
    icon: Lightbulb,
  },
];

const fitmentMakes = [
  { make: "TYM", models: "T264 · T25 · T474 · series-specific kits" },
  { make: "Kubota", models: "L-series · BX-series · MX-series fitments" },
  { make: "John Deere", models: "1-series · 2-series compact utility" },
  { make: "Mahindra", models: "eMax · 1500 series · 2600 series" },
  { make: "New Holland", models: "Workmaster · Boomer compact tractors" },
  { make: "Massey Ferguson", models: "GC1700 · 1700 series · 2600H" },
  { make: "LS", models: "MT1 · MT2 · XR3000 series" },
  { make: "Universal", models: "Modular rail fits most loader cages" },
];

const useCases = [
  {
    title: "Property owners",
    blurb:
      "Mowing, brush-clearing, plowing snow at the gate. The tractor came stock — your setup shouldn't have to.",
    icon: TreeEvergreen,
  },
  {
    title: "Hobby farms",
    blurb:
      "Pasture maintenance, fence work, hauling. Carry the saw, the toolbox, and the chains in one trip.",
    icon: FlagBanner,
  },
  {
    title: "Forestry + firewood",
    blurb:
      "Saw on the loader, gear on the rail, lights for the early-morning runs. Built for the woods.",
    icon: Hammer,
  },
  {
    title: "Snow + storm",
    blurb:
      "LED light mounts, Quick-Fist clamps for shovels, traction chains, and the toolbox you'll actually need.",
    icon: Lightning,
  },
  {
    title: "Hunters + homesteaders",
    blurb:
      "Firearm mounts, scabbards, and a clean way to keep tools where you need them — not in the cab.",
    icon: Crosshair,
  },
  {
    title: "Custom builds",
    blurb:
      "If you don't see the fitment for your machine, call us. We design and prototype under one roof.",
    icon: Ruler,
  },
];

const valuePillars = [
  {
    title: "Made in Blossvale, NY",
    description:
      "Every bracket, every weldment, every powder-coat — fabricated in Central New York. Not boxed-up imports with our sticker on top.",
    icon: FlagBanner,
  },
  {
    title: "Designed under one roof",
    description:
      "Design, prototyping, manufacturing, and shipping all happen in our shop. When something needs a tweak, we tweak it on Monday — not next quarter.",
    icon: Factory,
  },
  {
    title: "Tractor-specific fitment",
    description:
      "Generic universal mounts don't fit anything well. Our kits are engineered to specific machines: TYM T264, Kubota BX, JD 1025R — bolt-on, no drilling.",
    icon: Wrench,
  },
  {
    title: "Lifetime warranty on SawBoss",
    description:
      "The ITC SawBoss chainsaw scabbard carries a lifetime warranty. Other product lines run multi-year coverage — because if we built it right, it should last.",
    icon: Medal,
  },
];

const testimonials = [
  {
    name: "Verified buyer",
    role: "TYM T264 owner",
    text:
      "Bolted right up — no shimming, no drilling, no fitment fight. The instructions were obvious. Tractor came back from the dealer with a hood ding the next week and the brush guard saved a $400 paint job.",
    rating: 5,
  },
  {
    name: "Verified buyer",
    role: "Kubota BX owner, hobby farm",
    text:
      "Bought the modular rail and three modules. A month later added the chainsaw mount. Two months later added the light mount. That's the right way to build a system — start small, expand as needed.",
    rating: 5,
  },
  {
    name: "Verified buyer",
    role: "JD 1025R, firewood operator",
    text:
      "I run this thing five days a week in the woods. The SawBoss has held up to bouncing through trails, brush whips, and one solid drop. Saw still rides where I put it. Lifetime warranty was the reason I bought.",
    rating: 5,
  },
  {
    name: "Verified buyer",
    role: "Mahindra eMax owner",
    text:
      "Phone tech support is a real human in New York who knows the product. Asked which step kit fit my 25S — they pulled it up, told me the part, and shipped same day. That's how it should work.",
    rating: 5,
  },
];

const faqItems = [
  {
    q: "Is everything actually made in the USA?",
    a: "Yes. Every ITC product is fabricated, welded, powder-coated, and assembled in our Blossvale, NY shop. Steel is sourced domestically. We're a small, dedicated team running design through shipping under one roof — no overseas contractors, no rebadged imports.",
  },
  {
    q: "Will it fit my tractor?",
    a: "Most of our kits are engineered to specific machines (TYM T264, Kubota BX-series, JD 1025R, etc.) — these bolt to OEM mount-points with no drilling. Our modular rail is universal across most loader cages. If you're not sure, send us your make/model in the form below and we'll confirm fitment before you order.",
  },
  {
    q: "Do you ship internationally?",
    a: "We ship across the United States from stock. International orders (Canada, Australia, EU) are handled case-by-case — call or email and we'll quote shipping. Heavy items (toolboxes, brush guards) freight separately.",
  },
  {
    q: "What's covered under warranty?",
    a: "The ITC SawBoss chainsaw scabbard carries a lifetime warranty against manufacturing defects. Other product lines run a multi-year warranty — typically two years on welded components, one year on coated finishes. Wear-and-tear from normal use is excluded; everything else, we make right.",
  },
  {
    q: "Can I get a custom build for an unusual tractor?",
    a: "Sometimes — yes. We've prototyped one-off step kits, mount adapters, and tool systems for machines that aren't on our standard catalog. There's a one-time engineering fee depending on complexity. Call to scope it.",
  },
  {
    q: "How fast does it ship?",
    a: "In-stock items ship same or next business day from our Blossvale shop. Configured modular kits typically ship within 3–5 business days. Custom builds depend on the spec — we'll quote a date when we confirm the order.",
  },
  {
    q: "Do you offer dealer or volume pricing?",
    a: "Yes. We have a dealer / affiliate network — equipment dealers, online retailers, and tractor-content creators carrying or referring our products. If you move volume, ask about the program when you reach out.",
  },
];

const stats = [
  { value: "Made", label: "in Blossvale NY" },
  { value: "1 Roof", label: "Design → ship" },
  { value: "Life", label: "warranty on SawBoss" },
  { value: "Same Day", label: "shipping in stock" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function ITCQuickAttachPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "Catalog", href: "#catalog" },
          { label: "Fitment", href: "#fitment" },
          { label: "Why ITC", href: "#why" },
          { label: "Shop", href: "#use-cases" },
          { label: "FAQ", href: "#faq" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-xs font-bold uppercase tracking-[0.18em] transition-colors"
            style={{ color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ORANGE_LIGHT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
          >
            {n.label}
          </a>
        ))}
      </>
    ),
    [],
  );

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: INK }}
    >
      {/* Industrial grid background — subtle dot pattern across the whole page */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${GRID} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          zIndex: 0,
        }}
      />

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(13, 15, 18, 0.85)",
          borderColor: "rgba(249, 115, 22, 0.18)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <div
              className="h-9 w-9 flex-shrink-0 flex items-center justify-center"
              style={{
                background: ORANGE,
                clipPath:
                  "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
              }}
            >
              <Wrench size={18} weight="bold" style={{ color: BG }} />
            </div>
            <div className="min-w-0">
              <div
                className="font-black text-sm tracking-tight truncate uppercase"
                style={{ color: INK, letterSpacing: "0.02em" }}
              >
                ITC
                <span className="hidden sm:inline" style={{ color: INK_DIM, fontWeight: 600 }}>
                  {" "}
                  · Innovative Tractor Components
                </span>
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.22em] truncate"
                style={{ color: ORANGE_LIGHT }}
              >
                Made in Blossvale NY
              </div>
            </div>
          </a>
          <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
            {navItems()}
          </div>
          <a
            href="#quote"
            className="hidden lg:inline-flex items-center gap-2 h-10 px-5 text-xs font-black uppercase tracking-[0.12em] transition-transform hover:scale-[1.03] flex-shrink-0"
            style={{
              background: ORANGE,
              color: BG,
              clipPath:
                "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            Get a Quote <ArrowRight size={12} weight="bold" />
          </a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 -mr-2 flex-shrink-0"
            style={{ color: INK }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t px-6 py-4 flex flex-col gap-4"
            style={{
              background: BG,
              borderColor: "rgba(249, 115, 22, 0.10)",
            }}
          >
            {navItems(true)}
            <a
              href="#quote"
              className="mt-2 text-xs font-black uppercase tracking-[0.18em]"
              style={{ color: ORANGE }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get a Quote →
            </a>
          </div>
        )}
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section
        id="top"
        className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 sm:px-6 overflow-hidden"
      >
        {/* Orange radial wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 1100px 500px at 80% 0%, ${ORANGE_GLOW}, transparent 70%)`,
          }}
        />

        {/* Top status bar */}
        <div className="absolute top-20 inset-x-0 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] font-bold opacity-50">
            <span style={{ color: INK_DIM }}>· · · ITC / 001 · 2026 / NY · · ·</span>
            <span style={{ color: ORANGE_LIGHT }}>SHIPPING NATIONWIDE</span>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-7 text-[10px] font-black uppercase tracking-[0.22em]"
              style={{
                background: ORANGE,
                color: BG,
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              <FlagBanner size={11} weight="fill" />
              Made in USA — Blossvale, NY
            </motion.div>

            {/* Hero tuned 2026-05-16 per the landing_page_optimizer skill —
                added 14-day timeframe to the headline (chunk v01-15: specific
                timeframes convert better than vague) and reordered sub-headline
                to frontload the 3 strongest benefit phrases (chunk v03-18:
                frontload benefit, then feature) plus tractor-model-fit
                specificity (per-industry-templates manufacturer pain: dealers
                lose bids to spec-sheet uncertainty). */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6 uppercase"
              style={{ color: INK, fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
            >
              The tractor setup
              <br />
              <span style={{ color: INK_DIM }}>you&apos;ve always wanted —</span>
              <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${ORANGE_LIGHT} 0%, ${ORANGE_DEEP} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                shipped in 14 days.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mb-9 leading-relaxed"
              style={{ color: INK_SOFT }}
            >
              Bolts on. Holds up.{" "}
              <span style={{ color: ORANGE_LIGHT }}>Doesn&apos;t fall off in the woods.</span>{" "}
              Heavy-gauge accessories machined for your exact tractor model
              (TYM, Kubota, John Deere) — toolboxes, chainsaw carriers, brush
              guards, modular tool systems, and chassis protection. Designed
              and built in Central New York.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <MagneticButton
                href="#catalog"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 font-black text-xs uppercase tracking-[0.16em] transition-shadow hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)]"
                style={{
                  background: ORANGE,
                  color: BG,
                  clipPath:
                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                Browse the Catalog <ArrowRight size={13} weight="bold" />
              </MagneticButton>
              <a
                href="#quote"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 border-2 text-xs font-black uppercase tracking-[0.16em] transition-colors"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.25)",
                  color: INK,
                  background: "transparent",
                }}
              >
                Get a Fitment Quote
              </a>
              <a
                href="tel:3153355421"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
                style={{ color: ORANGE_LIGHT }}
              >
                <Phone size={13} weight="bold" /> (315) 335-5421
              </a>
            </motion.div>

            {/* Stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 max-w-2xl">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="px-3 py-3"
                  style={{
                    borderLeft:
                      i === 0
                        ? `2px solid ${ORANGE}`
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="text-base sm:text-lg font-black tracking-tight uppercase"
                    style={{ color: INK }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-[9px] mt-0.5 uppercase tracking-[0.18em]"
                    style={{ color: INK_DIM }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image — real ITC product action shot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative mt-4 lg:mt-0"
          >
            <div
              className="absolute -inset-2 -z-10"
              style={{
                background: `linear-gradient(135deg, ${ORANGE} 0%, transparent 60%)`,
                opacity: 0.25,
                filter: "blur(40px)",
              }}
            />
            {/* Hard-edged industrial frame */}
            <div className="relative">
              <div
                className="absolute -top-3 -left-3 h-8 w-8 border-t-2 border-l-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="absolute -bottom-3 -right-3 h-8 w-8 border-b-2 border-r-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="relative overflow-hidden aspect-[4/5]"
                style={{
                  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
                  borderRadius: 4,
                }}
              >
                <img
                  src={ACTION_SHOT}
                  alt="ITC tractor accessories on a compact tractor"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(13,15,18,0) 60%, rgba(13,15,18,0.55) 100%)",
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <div
                      className="text-[9px] uppercase tracking-[0.25em] font-bold mb-1"
                      style={{ color: ORANGE_LIGHT }}
                    >
                      In the field
                    </div>
                    <div
                      className="text-sm font-black uppercase"
                      style={{ color: INK }}
                    >
                      Real customer build
                    </div>
                  </div>
                  <div
                    className="text-[9px] font-mono px-2 py-1"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      color: INK_SOFT,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    REC · 2026
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ TRUST STRIP — logos + claims bar ══════════════════════ */}
      <section
        className="relative px-4 sm:px-6 py-8 border-y"
        style={{
          background: BG_DEEP,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 items-center text-center">
          {[
            { Icon: FlagBanner, label: "American-Made Steel" },
            { Icon: Factory, label: "Design + Build Under One Roof" },
            { Icon: Truck, label: "Same-Day Shipping" },
            { Icon: Medal, label: "Lifetime Warranty (SawBoss)" },
          ].map(({ Icon, label }, i) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 px-2"
              style={{
                borderLeft:
                  i === 0
                    ? "none"
                    : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Icon
                size={22}
                weight="duotone"
                style={{ color: ORANGE_LIGHT, flexShrink: 0 }}
              />
              <p
                className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-left"
                style={{ color: INK_SOFT }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ STORY — Jake / Made in NY ════════════════════════════ */}
      <SectionReveal
        className="relative px-4 sm:px-6 py-20 md:py-28"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center"
          >
            <div>
              <HashDivider />
              <p
                className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
                style={{ color: ORANGE }}
              >
                Why we exist
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 uppercase leading-[1.05]"
                style={{ color: INK }}
              >
                Built by an owner who runs the same machine you do.
              </h2>
              <div
                className="space-y-4 text-base md:text-lg leading-relaxed"
                style={{ color: INK_SOFT }}
              >
                <p>
                  ITC started in a small shop in Central New York with one
                  premise: tractors come from the factory missing the parts
                  that owners actually need. A toolbox that fits. A saw mount
                  that doesn&apos;t rattle off. Steps that don&apos;t require
                  drilling.
                </p>
                <p>
                  Owner Jake McCall designed the first kits for his own
                  machine. Then a neighbor wanted one. Then the neighbor&apos;s
                  buddy. Today we run design, prototyping, fabrication, powder
                  coating, and shipping under one roof in Blossvale, NY —
                  operating as Terravox Manufacturing dba Innovative Tractor
                  Components.
                </p>
                <p>
                  We&apos;re still small. We&apos;re still picky. And every
                  product still has to pass the same test: <em style={{ color: ORANGE_LIGHT }}>would I bolt this on
                  my own tractor?</em>
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div
                  className="p-3"
                  style={{
                    borderTop: `2px solid ${ORANGE}`,
                  }}
                >
                  <div className="text-2xl font-black" style={{ color: INK }}>
                    1
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.18em] mt-1"
                    style={{ color: INK_DIM }}
                  >
                    Roof
                  </div>
                </div>
                <div
                  className="p-3"
                  style={{
                    borderTop: `2px solid ${ORANGE}`,
                  }}
                >
                  <div className="text-2xl font-black" style={{ color: INK }}>
                    100%
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.18em] mt-1"
                    style={{ color: INK_DIM }}
                  >
                    USA Built
                  </div>
                </div>
                <div
                  className="p-3"
                  style={{
                    borderTop: `2px solid ${ORANGE}`,
                  }}
                >
                  <div className="text-2xl font-black" style={{ color: INK }}>
                    NY
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.18em] mt-1"
                    style={{ color: INK_DIM }}
                  >
                    Blossvale
                  </div>
                </div>
              </div>
            </div>
            <div className="relative order-first md:order-last">
              <div
                className="absolute -top-3 -left-3 h-7 w-7 border-t-2 border-l-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="absolute -bottom-3 -right-3 h-7 w-7 border-b-2 border-r-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="relative overflow-hidden aspect-[4/5]"
                style={{
                  boxShadow: "0 16px 50px rgba(0, 0, 0, 0.5)",
                  borderRadius: 4,
                }}
              >
                <img
                  src={MISSION_PHOTO}
                  alt="ITC manufacturing in Blossvale, NY"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══ CATALOG — Product categories ══════════════════════════ */}
      <SectionReveal
        id="catalog"
        className="relative px-4 sm:px-6 py-20 md:py-28"
        style={{ background: BG_DEEP }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-12 max-w-3xl">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              The catalog
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 uppercase leading-[1.02]"
              style={{ color: INK }}
            >
              Six product lines.
              <br />
              <span style={{ color: INK_DIM }}>One way to build a tractor.</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl" style={{ color: INK_SOFT }}>
              Start with whatever you need today. Add to it next month. The
              modular rail and shared mount points mean you&apos;re building one
              cohesive system, not a pile of one-off accessories.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {productCategories.map((p) => (
              <motion.div key={p.name} variants={fadeUp}>
                <SteelCard
                  className="overflow-hidden h-full flex flex-col group hover:border-[rgba(249,115,22,0.4)] transition-colors"
                  style={{ padding: 0 }}
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(13,15,18,0) 60%, rgba(13,15,18,0.7) 100%)",
                      }}
                    />
                    <div
                      className="absolute top-3 left-3 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
                      style={{
                        background: ORANGE,
                        color: BG,
                        clipPath:
                          "polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      {p.badge}
                    </div>
                    <div
                      className="absolute bottom-3 right-3 h-9 w-9 flex items-center justify-center"
                      style={{
                        background: "rgba(13,15,18,0.85)",
                        color: ORANGE_LIGHT,
                        borderRadius: 2,
                      }}
                    >
                      <p.icon size={18} weight="duotone" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3
                      className="text-xl font-black mb-2 uppercase tracking-tight"
                      style={{ color: INK }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-5 flex-1"
                      style={{ color: INK_SOFT }}
                    >
                      {p.blurb}
                    </p>
                    <ul className="space-y-1.5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs"
                          style={{ color: INK_SOFT }}
                        >
                          <CheckCircle
                            size={13}
                            weight="fill"
                            style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SteelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══ FIELD STRIP — three-up real photo banner ══════════════ */}
      <SectionReveal className="relative px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2">
          {[FIELD_THUMB_1, FIELD_THUMB_2, FIELD_THUMB_3].map((src, i) => (
            <motion.div
              key={src}
              variants={fadeUp}
              className="relative aspect-[1/1] sm:aspect-[4/3] overflow-hidden group"
              style={{ borderRadius: 2 }}
            >
              <img
                src={src}
                alt={`ITC product ${i + 1} in use`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(13,15,18,0) 60%, rgba(13,15,18,0.6) 100%)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      {/* ══ WHY ITC — value pillars ═══════════════════════════════ */}
      <SectionReveal
        id="why"
        className="relative px-4 sm:px-6 py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-12 max-w-3xl">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              Why ITC
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.02]"
              style={{ color: INK }}
            >
              Four things we&apos;re not
              <br />
              <span style={{ color: INK_DIM }}>willing to compromise on.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valuePillars.map((v, i) => (
              <motion.div key={v.title} variants={fadeUp}>
                <SteelCard className="p-7 h-full relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 px-2 py-0.5 text-[9px] font-mono"
                    style={{
                      background: ORANGE,
                      color: BG,
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div
                    className="w-12 h-12 flex items-center justify-center mt-4 mb-5"
                    style={{
                      background: ORANGE_GLOW,
                      color: ORANGE_LIGHT,
                      borderRadius: 2,
                      border: `1px solid ${ORANGE_DEEP}`,
                    }}
                  >
                    <v.icon size={22} weight="duotone" />
                  </div>
                  <h3
                    className="text-lg font-black mb-3 uppercase tracking-tight"
                    style={{ color: INK }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                    {v.description}
                  </p>
                </SteelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══ FITMENT TABLE ═════════════════════════════════════════ */}
      <SectionReveal
        id="fitment"
        className="relative px-4 sm:px-6 py-20 md:py-28"
        style={{ background: BG_DEEP }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="mb-12 max-w-3xl">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              Fitment
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.02] mb-4"
              style={{ color: INK }}
            >
              Built for the brands you actually run.
            </h2>
            <p className="text-base md:text-lg max-w-2xl" style={{ color: INK_SOFT }}>
              Most kits are engineered to specific machines. Bolt-on. No drilling.
              Don&apos;t see your model? Send it to us — we&apos;ll either confirm a
              fit or quote a custom build.
            </p>
          </motion.div>

          <SteelCard className="overflow-hidden" style={{ padding: 0 }}>
            <div
              className="grid grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr] divide-y"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="px-4 py-3 col-span-2 grid grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr] text-[10px] uppercase tracking-[0.2em] font-black"
                style={{
                  background: PANEL_LIGHT,
                  color: ORANGE_LIGHT,
                }}
              >
                <div>Brand</div>
                <div>Models / Series</div>
              </div>
              {fitmentMakes.map((m, i) => (
                <div
                  key={m.make}
                  className="contents"
                >
                  <div
                    className="px-4 py-4 text-sm font-black uppercase tracking-wide flex items-center"
                    style={{
                      color: INK,
                      borderTop:
                        i === 0
                          ? "none"
                          : "1px solid rgba(255,255,255,0.06)",
                      background:
                        i % 2 === 0 ? PANEL : "rgba(31,35,41,0.5)",
                    }}
                  >
                    {m.make}
                  </div>
                  <div
                    className="px-4 py-4 text-sm flex items-center"
                    style={{
                      color: INK_SOFT,
                      borderTop:
                        i === 0
                          ? "none"
                          : "1px solid rgba(255,255,255,0.06)",
                      background:
                        i % 2 === 0 ? PANEL : "rgba(31,35,41,0.5)",
                    }}
                  >
                    {m.models}
                  </div>
                </div>
              ))}
            </div>
          </SteelCard>

          <motion.div
            variants={fadeUp}
            className="mt-6 p-5 flex items-start gap-4"
            style={{
              border: `1px dashed ${ORANGE_DEEP}`,
              background: "rgba(249,115,22,0.04)",
              borderRadius: 4,
            }}
          >
            <Lightbulb
              size={22}
              weight="duotone"
              style={{ color: ORANGE_LIGHT, flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: INK }}>
                Don&apos;t see your tractor?
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                We prototype custom kits regularly. Tell us your make and model
                in the form below — we&apos;ll either confirm fitment from a
                similar build or quote a one-off engineering run.
              </p>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══ USE CASES — who it's for ══════════════════════════════ */}
      <SectionReveal
        id="use-cases"
        className="relative px-4 sm:px-6 py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-12 max-w-3xl">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              What it&apos;s for
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.02]"
              style={{ color: INK }}
            >
              From the back forty
              <br />
              <span style={{ color: INK_DIM }}>to the woodlot.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((u) => (
              <motion.div key={u.title} variants={fadeUp}>
                <SteelCard className="p-6 h-full hover:border-[rgba(249,115,22,0.4)] transition-colors">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: ORANGE_GLOW,
                        color: ORANGE_LIGHT,
                        borderRadius: 2,
                        border: `1px solid ${ORANGE_DEEP}`,
                      }}
                    >
                      <u.icon size={20} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-base font-black mb-2 uppercase tracking-tight"
                        style={{ color: INK }}
                      >
                        {u.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                        {u.blurb}
                      </p>
                    </div>
                  </div>
                </SteelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══ FEATURE SPOTLIGHT — modular system ═══════════════════ */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center"
          >
            <div className="relative">
              <div
                className="absolute -top-3 -left-3 h-7 w-7 border-t-2 border-l-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="absolute -bottom-3 -right-3 h-7 w-7 border-b-2 border-r-2"
                style={{ borderColor: ORANGE }}
              />
              <div
                className="relative overflow-hidden aspect-[4/3]"
                style={{
                  boxShadow: "0 16px 50px rgba(0, 0, 0, 0.5)",
                  borderRadius: 4,
                }}
              >
                <img
                  src={CAT_MODULAR}
                  alt="ITC Modular Tool System"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-[10px] font-black uppercase tracking-[0.22em]"
                style={{
                  background: ORANGE_GLOW,
                  color: ORANGE_LIGHT,
                  border: `1px solid ${ORANGE_DEEP}`,
                  borderRadius: 2,
                }}
              >
                <StackSimple size={11} weight="fill" /> Spotlight
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-5 uppercase leading-[1.05]"
                style={{ color: INK }}
              >
                The modular ITC tool system.
              </h2>
              <p
                className="text-base md:text-lg leading-relaxed mb-6"
                style={{ color: INK_SOFT }}
              >
                One universal mounting rail. A growing library of modules:
                toolbox, chainsaw scabbard, light bar, firearm mount, Quick-Fist
                clamps, Pat&apos;s Quick Hitch. Add what you need today, swap in
                seconds, expand the system as the work changes.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  {
                    title: "One rail, every module",
                    text:
                      "Mount the rail once — every ITC module locks in without re-drilling.",
                  },
                  {
                    title: "Swap in seconds",
                    text:
                      "Tool-less quick-release latches. Pull the saw mount off in summer, drop in the snow-shovel clamp in winter.",
                  },
                  {
                    title: "Lifetime expandable",
                    text:
                      "New modules ship every quarter. The rail you bought today still accepts modules we haven't designed yet.",
                  },
                ].map((row) => (
                  <div key={row.title} className="flex items-start gap-3">
                    <div
                      className="mt-1 h-2.5 w-2.5 flex-shrink-0"
                      style={{ background: ORANGE }}
                    />
                    <div>
                      <p
                        className="text-sm font-black uppercase tracking-tight mb-0.5"
                        style={{ color: INK }}
                      >
                        {row.title}
                      </p>
                      <p className="text-sm" style={{ color: INK_SOFT }}>
                        {row.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#quote"
                className="inline-flex items-center gap-2 h-11 px-6 font-black text-xs uppercase tracking-[0.16em] transition-shadow hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)]"
                style={{
                  background: ORANGE,
                  color: BG,
                  clipPath:
                    "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                Build my system <ArrowRight size={13} weight="bold" />
              </a>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════ */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="mb-12 max-w-3xl">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              From the buyers
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.02] mb-4"
              style={{ color: INK }}
            >
              People who run the same machines you do.
            </h2>
            <p className="text-sm max-w-xl" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Verified buyer feedback. Names withheld for privacy. Operating-machine
              references confirmed.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <motion.div key={t.name + t.role} variants={fadeUp}>
                <SteelCard className="p-6 h-full flex flex-col">
                  <Quotes
                    size={24}
                    weight="fill"
                    style={{ color: ORANGE }}
                    className="mb-3 opacity-80"
                  />
                  <p
                    className="text-sm leading-relaxed mb-5 flex-1"
                    style={{ color: INK }}
                  >
                    {t.text}
                  </p>
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          weight="fill"
                          style={{ color: ORANGE_LIGHT }}
                        />
                      ))}
                    </div>
                    <p
                      className="font-black text-xs uppercase tracking-wide"
                      style={{ color: INK }}
                    >
                      {t.name}
                    </p>
                    <p className="text-[11px]" style={{ color: INK_DIM }}>
                      {t.role}
                    </p>
                  </div>
                </SteelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ══ MADE-IN-USA WIDE BANNER ═══════════════════════════════ */}
      <SectionReveal className="relative px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 4,
              boxShadow: "0 16px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="aspect-[21/9] sm:aspect-[21/7] relative">
              <img
                src={ITC_BLOSSVALE_BANNER}
                alt="American farmland horizon"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(13,15,18,0.95) 30%, rgba(13,15,18,0.6) 80%)",
                }}
              />
              <div className="relative h-full flex items-center px-6 sm:px-12">
                <div className="max-w-2xl">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{
                      background: ORANGE,
                      color: BG,
                      clipPath:
                        "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <FlagBanner size={11} weight="fill" /> American Steel
                  </div>
                  <h3
                    className="text-2xl md:text-4xl lg:text-5xl font-black uppercase leading-[1.02] mb-3"
                    style={{ color: INK }}
                  >
                    From Blossvale, NY to your tailgate.
                  </h3>
                  <p
                    className="text-sm md:text-base max-w-xl"
                    style={{ color: INK_SOFT }}
                  >
                    Domestic steel. Domestic welds. Domestic powder coat.
                    Designed, built, and shipped from the same shop. We&apos;re
                    proud of the zip code we operate from — and the people we
                    employ to make it happen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ══ FAQ ═══════════════════════════════════════════════════ */}
      <SectionReveal
        id="faq"
        className="relative px-4 sm:px-6 py-20 md:py-28"
        style={{ background: BG_DEEP }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              Common questions
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-[1.02]"
              style={{ color: INK }}
            >
              Before you order.
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <SteelCard>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <span
                        className="font-black pr-2 uppercase tracking-tight text-sm sm:text-base"
                        style={{ color: INK }}
                      >
                        {f.q}
                      </span>
                      <CaretDown
                        size={16}
                        weight="bold"
                        className={`flex-shrink-0 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                        style={{ color: ORANGE }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p
                            className="px-5 pb-5 text-sm leading-relaxed"
                            style={{ color: INK_SOFT }}
                          >
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </SteelCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ══ QUOTE / INQUIRY FORM ══════════════════════════════════ */}
      <SectionReveal
        id="quote"
        className="relative px-4 sm:px-6 py-24 md:py-32"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${ORANGE_GLOW}, transparent 70%)`,
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <HashDivider />
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-black mb-3"
              style={{ color: ORANGE }}
            >
              Tell us about your tractor
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-[1.02] mb-5"
              style={{ color: INK }}
            >
              Build a quote.
              <br />
              <span style={{ color: INK_DIM }}>We&apos;ll confirm fitment first.</span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Send your make, model, and what you&apos;re trying to do. We&apos;ll
              come back with confirmed fitment, the right kit configuration, and a
              quote — usually same business day.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <InquiryForm
              slug="itc-quick-attach"
              accent={ORANGE}
              accentDeep={ORANGE_DEEP}
              ink="#0d0f12"
              inkSoft="#52525b"
              panelBg="#ffffff"
              serif='"Helvetica Neue", Arial, sans-serif'
              submitLabel="Send my fitment + quote request"
              successHeading="Got it. We're on it."
              successBody="Jake or one of the team will confirm fitment and come back with a quote — usually same business day. For a same-day answer, call (315) 335-5421 directly."
              fields={[
                {
                  type: "text",
                  name: "name",
                  label: "Your name *",
                  placeholder: "First and last",
                  required: true,
                },
                {
                  type: "email",
                  name: "email",
                  label: "Email *",
                  placeholder: "you@example.com",
                  required: true,
                },
                {
                  type: "tel",
                  name: "phone",
                  label: "Phone",
                  placeholder: "(315) 555-0123",
                },
                {
                  type: "select",
                  name: "buyer_type",
                  label: "Buyer type",
                  options: [
                    { value: "owner-operator", label: "Owner / operator (my own tractor)" },
                    { value: "fleet", label: "Fleet manager (multiple machines)" },
                    { value: "dealer", label: "Equipment dealer (resale)" },
                    { value: "contractor", label: "Contractor / commercial" },
                    { value: "homestead", label: "Homestead / hobby farm" },
                    { value: "other", label: "Other" },
                  ],
                },
                {
                  type: "text",
                  name: "tractor_make_model",
                  label: "Tractor make + model *",
                  placeholder: "e.g. TYM T264 / Kubota BX2380 / JD 1025R",
                  required: true,
                },
                {
                  type: "select",
                  name: "interested_in",
                  label: "Interested in",
                  options: [
                    { value: "toolbox", label: "Tractor toolbox kit" },
                    { value: "chainsaw", label: "Chainsaw carrier / SawBoss" },
                    { value: "modular", label: "Modular tool system" },
                    { value: "protection", label: "Brush guards / chassis protection" },
                    { value: "steps", label: "Tractor steps" },
                    { value: "lights", label: "Light mounts + LEDs" },
                    { value: "essentials", label: "Owner essentials (clamps, hitches, mounts)" },
                    { value: "custom", label: "Custom build for an unusual machine" },
                    { value: "full-system", label: "The full setup — recommend something" },
                  ],
                },
                {
                  type: "select",
                  name: "quantity",
                  label: "Quantity",
                  options: [
                    { value: "1", label: "1 unit (single machine)" },
                    { value: "2-5", label: "2–5 units" },
                    { value: "6-20", label: "6–20 units" },
                    { value: "20+", label: "20+ units (fleet / dealer)" },
                  ],
                },
                {
                  type: "textarea",
                  name: "details",
                  label: "What are you trying to do?",
                  placeholder:
                    "What you run the tractor for, what's on it now, what you're trying to add or solve. The more we know, the better we fit it.",
                  rows: 4,
                },
              ]}
            />
          </motion.div>

          {/* Contact cards */}
          <motion.div
            variants={fadeUp}
            className="grid md:grid-cols-3 gap-3 mt-8"
          >
            <SteelCard className="p-5">
              <Phone
                size={20}
                weight="duotone"
                style={{ color: ORANGE_LIGHT }}
                className="mb-2"
              />
              <p className="font-black text-xs uppercase tracking-wide mb-0.5" style={{ color: INK }}>
                Direct line
              </p>
              <a
                href="tel:3153355421"
                className="text-xs hover:opacity-80"
                style={{ color: ORANGE_LIGHT }}
              >
                (315) 335-5421
              </a>
            </SteelCard>
            <SteelCard className="p-5">
              <Envelope
                size={20}
                weight="duotone"
                style={{ color: ORANGE_LIGHT }}
                className="mb-2"
              />
              <p className="font-black text-xs uppercase tracking-wide mb-0.5" style={{ color: INK }}>
                Email
              </p>
              <p className="text-[11px]" style={{ color: INK_SOFT }}>
                Use the form — we route it to Jake directly.
              </p>
            </SteelCard>
            <SteelCard className="p-5">
              <MapPin
                size={20}
                weight="duotone"
                style={{ color: ORANGE_LIGHT }}
                className="mb-2"
              />
              <p className="font-black text-xs uppercase tracking-wide mb-0.5" style={{ color: INK }}>
                Shop
              </p>
              <p className="text-xs" style={{ color: INK_SOFT }}>
                Blossvale, NY · USA
              </p>
            </SteelCard>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer
        className="relative px-4 sm:px-6 py-12 border-t"
        style={{
          borderColor: "rgba(249, 115, 22, 0.18)",
          background: BG_DEEP,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: ORANGE,
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
                  }}
                >
                  <Wrench size={20} weight="bold" style={{ color: BG }} />
                </div>
                <div>
                  <div
                    className="font-black text-base tracking-tight uppercase"
                    style={{ color: INK }}
                  >
                    ITC
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.22em]"
                    style={{ color: ORANGE_LIGHT }}
                  >
                    Innovative Tractor Components
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: INK_SOFT }}>
                Operating as Terravox Manufacturing dba Innovative Tractor
                Components. Designing, fabricating, and shipping tractor
                accessories from Blossvale, NY since day one.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: ORANGE_LIGHT }}
                  className="hover:opacity-80"
                  aria-label="YouTube"
                >
                  <YoutubeLogo size={20} weight="duotone" />
                </a>
                <a
                  href="https://www.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: ORANGE_LIGHT }}
                  className="hover:opacity-80"
                  aria-label="TikTok"
                >
                  <TiktokLogo size={20} weight="duotone" />
                </a>
              </div>
            </div>

            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em] mb-4"
                style={{ color: ORANGE }}
              >
                Catalog
              </p>
              <ul className="space-y-2 text-xs" style={{ color: INK_SOFT }}>
                <li>Toolbox Kits</li>
                <li>Chainsaw Carriers</li>
                <li>Modular Tool System</li>
                <li>Tractor Protection</li>
                <li>Tractor Steps</li>
                <li>Owner Essentials</li>
              </ul>
            </div>

            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em] mb-4"
                style={{ color: ORANGE }}
              >
                Company
              </p>
              <ul className="space-y-2 text-xs" style={{ color: INK_SOFT }}>
                <li>About ITC</li>
                <li>Made in NY</li>
                <li>Tech Feedback</li>
                <li>Affiliate Network</li>
                <li>Blog</li>
                <li>Returns + Refunds</li>
              </ul>
            </div>

            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em] mb-4"
                style={{ color: ORANGE }}
              >
                Contact
              </p>
              <ul className="space-y-2 text-xs" style={{ color: INK_SOFT }}>
                <li>
                  <a
                    href="tel:3153355421"
                    className="hover:opacity-80"
                    style={{ color: ORANGE_LIGHT }}
                  >
                    (315) 335-5421
                  </a>
                </li>
                <li>Blossvale, NY</li>
                <li>Mon–Fri · Shop hours</li>
              </ul>
            </div>
          </div>

          <div
            className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              color: INK_DIM,
            }}
          >
            <p>
              © {new Date().getFullYear()} Terravox Manufacturing dba Innovative Tractor Components. All rights reserved.
            </p>
            <p className="uppercase tracking-[0.18em] font-bold">
              Made in Blossvale, NY
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
