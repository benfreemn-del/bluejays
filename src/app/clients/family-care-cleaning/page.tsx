"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase. */

/**
 * /clients/family-care-cleaning — Family Care Cleaning
 *
 * Bespoke premium showcase for a family-run residential cleaning
 * company serving Clallam & Jefferson Counties (Olympic Peninsula, WA).
 *
 * Logo: a Canva lemon-illustration circle stamp — warm gold ring,
 * fresh leaf-green, lemon-yellow center, white type. The entire
 * palette is built from that mark. Per the quality rule, feminine /
 * family service = LIGHT theme: warm cream backgrounds, deep
 * leaf-green type, gold accent.
 *
 * Pattern reference: hector-landscaping/page.tsx (light editorial
 * structure) and masters-window-tinting/page.tsx (custom premium
 * feel). Network credit footer → /audit.
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
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  House,
  Buildings,
  Quotes,
  CaretDown,
  Medal,
  SealCheck,
  Certificate,
  Drop,
  Leaf,
  Sun,
  Heart,
  Calendar,
  Envelope,
  Broom,
  HandHeart,
  PaintRoller,
  Bed,
  Bathtub,
  CookingPot,
  Armchair,
  Plant,
  Truck,
  Confetti,
  Check,
  Eye,
  ChatCircleText,
  Lock,
  HouseSimple,
} from "@phosphor-icons/react";

import StickyNav from "./sticky-nav";
import FamilyCareCleaningContactForm from "./contact-form";
import BluejayLogo from "@/components/BluejayLogo";

/* ───────────────────────── BUSINESS DATA ───────────────────────── */
const BUSINESS = {
  name: "Family Care Cleaning",
  tagline: "Cleaning with care.",
  phoneDisplay: "(360) 843-7705",
  phoneHref: "tel:+13608437705",
  email: "familycarecleaning@gmail.com",
  area: "Clallam & Jefferson Counties · Olympic Peninsula, WA",
  social: {
    // None published on the live site. Leave empty rather than fake.
  },
} as const;

const LOGO =
  "https://images.squarespace-cdn.com/content/v1/6882ff2619d6d56ba1b8c61b/22797918-efdb-486d-8680-b864f45c4a64/Famliy+Care+%281%29.png?format=1500w";

/* ───────────────────────── PHOTO LIBRARY ─────────────────────────
   Curated Unsplash residential-cleaning photography. Bright, warm,
   sun-filled, family-home aesthetic — not industrial. Each photo is
   loaded once and referenced by semantic key. */
const PHOTOS = {
  // Hero — bright sunlit living room with gallery wall, plants, leather
  // couch. Warm/family/Peninsula feeling. Verified 2026-05-14.
  hero: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1800&q=85&auto=format&fit=crop",

  // Room tab + service spotlights (all verified live 2026-05-14).
  kitchen:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80&auto=format&fit=crop",
  bathroom:
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=80&auto=format&fit=crop",
  bedroom:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80&auto=format&fit=crop",
  living:
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80&auto=format&fit=crop",

  // Hero floating card — cleaner in PPE wiping shutters. Actual
  // cleaning-action shot (filename kept legacy for diff readability;
  // alt text describes accurately).
  cleaningAction:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80&auto=format&fit=crop",

  // Move-in/move-out service — fresh, calm living space, the "ready
  // to start" feeling.
  moveInOut:
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1400&q=80&auto=format&fit=crop",

  // Special-event service — bright living room with sunlit window,
  // warm tones with teal accents.
  freshHome:
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80&auto=format&fit=crop",

  // Service Area — misty Pacific Northwest conifer forest. The
  // Olympic Peninsula in one frame.
  pacificNW:
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80&auto=format&fit=crop",
} as const;

/* ───────────────────────── COLORS (logo-derived) ───────────────────── */
const BG = "#fdf8ec";            // warm cream — page base
const BG_DEEP = "#f8efd6";       // slightly richer band
const BG_WHITE = "#ffffff";
const INK = "#1f2820";           // near-black w/ green warmth
const INK_SOFT = "rgba(31,40,32,0.68)";
const INK_FAINT = "rgba(31,40,32,0.5)";
const GOLD = "#f5b826";          // logo ring
const GOLD_DEEP = "#d99a0f";     // accent for buttons / strokes
const GOLD_DARK = "#a87708";     // hover / depth
const LEAF = "#4a7c3a";          // leaf-green from logo
const LEAF_DEEP = "#2f5c24";     // primary text / dark sections
const LEAF_INK = "#1f3f17";      // deepest leaf
const LEMON = "#ffd24a";         // lemon highlight
const CITRUS_GLOW = "rgba(245, 184, 38, 0.18)";
const LEAF_GLOW = "rgba(74, 124, 58, 0.14)";

/* ───────────────────────── ANIM ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── FLOATING CITRUS BG ───────────────────────
   Subtle floating lemon-yellow + leaf-green dots like Hector's
   leaves. Light pops on the cream base, never distracting. */
function FloatingCitrus() {
  const items = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 14,
    duration: 14 + Math.random() * 10,
    size: 14 + Math.random() * 14,
    opacity: 0.18 + Math.random() * 0.16,
    rotation: Math.random() * 360,
    sway: 25 + Math.random() * 45,
    isLeaf: i % 3 === 0,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {items.map((l) => (
        <motion.div
          key={l.id}
          className="absolute"
          style={{ left: `${l.x}%`, willChange: "transform, opacity" }}
          animate={{
            y: ["-5vh", "110vh"],
            x: [-l.sway / 2, l.sway / 2, -l.sway / 2],
            rotate: [l.rotation, l.rotation + 360],
            opacity: [0, l.opacity, l.opacity, 0],
          }}
          transition={{
            y: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            x: { duration: l.duration / 3, repeat: Infinity, delay: l.delay, ease: "easeInOut" },
            rotate: { duration: l.duration, repeat: Infinity, delay: l.delay, ease: "linear" },
            opacity: { duration: l.duration, repeat: Infinity, delay: l.delay, times: [0, 0.05, 0.9, 1] },
          }}
        >
          {l.isLeaf ? (
            <Leaf size={l.size} weight="fill" style={{ color: LEAF }} />
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: l.size,
                height: l.size,
                background: `radial-gradient(circle at 30% 30%, ${LEMON}, ${GOLD_DEEP})`,
                boxShadow: `0 2px 8px ${CITRUS_GLOW}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── REUSABLE PRIMITIVES ───────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {text.split(" ").map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

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
  const isInView = useInView(ref, { once: true, margin: "300px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

function CreamCard({
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
      className={`rounded-2xl border border-[#2f5c24]/10 bg-white shadow-[0_18px_50px_-30px_rgba(31,40,32,0.18)] ${className}`}
      style={style}
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
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
    },
    [x, y, isTouchDevice],
  );
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);
  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── LEMON-WEDGE SVG DIVIDER ───────────────────
   Repeating subtle citrus-slice motif. Used as a watermark behind
   ribbon section headers. */
function CitrusPattern({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="citrus-pat" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="22" fill="none" stroke={GOLD_DEEP} strokeWidth="1.5" />
            <circle cx="60" cy="60" r="14" fill="none" stroke={GOLD_DEEP} strokeWidth="1" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="60"
                y1="46"
                x2="60"
                y2="74"
                stroke={GOLD_DEEP}
                strokeWidth="0.8"
                transform={`rotate(${deg} 60 60)`}
              />
            ))}
            <path d="M30 30 Q40 20 50 30 Q40 35 30 30Z" fill={LEAF} fillOpacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#citrus-pat)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  {
    title: "Routine Cleaning",
    blurb:
      "The visit you put on the calendar. We arrive on the day you booked, do the work the way we did it last time, and leave the house feeling cared for.",
    photo: PHOTOS.living,
    icon: Broom,
    pillar: "Most popular",
    bullets: [
      "Weekly, bi-weekly, or monthly cadence",
      "Same team each visit when possible",
      "Custom checklist tailored to your home",
      "Easy reschedule — life happens",
    ],
  },
  {
    title: "Detail & Deep Cleaning",
    blurb:
      "Everything in a routine clean, plus the corners that don't usually get attention — baseboards, vents, behind appliances, inside drawers, the spots that pile up over a season.",
    photo: PHOTOS.kitchen,
    icon: Sparkle,
    pillar: "Seasonal favorite",
    bullets: [
      "Top-to-bottom interior reset",
      "Inside cabinets, drawers & appliances",
      "Baseboards, doors, trim & vents",
      "A great quarterly or spring-clean choice",
    ],
  },
  {
    title: "Move-In & Move-Out",
    blurb:
      "Moving is stressful enough. Whether you're handing off the keys or just got them, we make the home feel ready to start fresh — inside cabinets, appliances, every surface.",
    photo: PHOTOS.moveInOut,
    icon: Truck,
    pillar: "Owners, renters & PMs",
    bullets: [
      "Inside cabinets, drawers & appliances",
      "Full kitchen + every bathroom",
      "Baseboards, doors, trim",
      "Windows, mirrors, floors finished",
    ],
  },
  {
    title: "Special Event & One-Time",
    blurb:
      "Before family lands. After the party clears out. Listing photos next week. A one-time visit that fits the day, with no commitment to a recurring schedule.",
    photo: PHOTOS.freshHome,
    icon: Confetti,
    pillar: "By the day",
    bullets: [
      "Pre-event prep (host with confidence)",
      "Post-event reset (we'll handle it)",
      "Realtor staging & listing-day clean",
      "Airbnb / short-term turnovers",
    ],
  },
] as const;

const trustChips = [
  { icon: HandHeart, label: "Family-owned & operated" },
  { icon: ShieldCheck, label: "Insured & background-checked" },
  { icon: MapPin, label: "Olympic Peninsula local" },
  { icon: Sparkle, label: "Bring our own supplies" },
  { icon: Lock, label: "Trusted with your keys" },
];

const whyUs = [
  {
    title: "Care, not a checklist",
    icon: Heart,
    desc: "We clean your home the way we'd clean ours. Care is in the details — the corners noticed, the picture frame straightened, the towel folded the way you like it.",
  },
  {
    title: "Same family. Same trust.",
    icon: HandHeart,
    desc: "Family-owned and run from day one. The person who quotes your home is the person you'll see at the door, every visit.",
  },
  {
    title: "Local to the Peninsula",
    icon: MapPin,
    desc: "Based on the Olympic Peninsula and serving Clallam & Jefferson Counties — Port Angeles, Sequim, Port Townsend, and everywhere in between.",
  },
  {
    title: "Honest, no-surprise quotes",
    icon: CheckCircle,
    desc: "Free, no-obligation quotes that match your home's size and the work you actually want. No upsells, no fine print.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Tell us about your home",
    desc: "Send a note or call — square footage, bedrooms, pets, what's needed and when. We'll get back within one business day.",
    icon: ChatCircleText,
  },
  {
    step: "02",
    title: "Free quote, your way",
    desc: "We confirm scope, frequency, and a fair, flat-feel quote. No obligation. If it's not the right fit, we'll say so.",
    icon: Eye,
  },
  {
    step: "03",
    title: "First visit",
    desc: "Our team arrives on time with everything needed. We walk the home with you first, then get to work — and leave it ready to enjoy.",
    icon: Sparkle,
  },
  {
    step: "04",
    title: "Care, on repeat",
    desc: "Routine cleans get a custom checklist that grows with your home. Same team when possible. Easy reschedule. Always a real human on the other end.",
    icon: Calendar,
  },
];

const includedRooms = [
  {
    name: "Kitchen",
    icon: CookingPot,
    photo: PHOTOS.kitchen,
    items: [
      "Counters, backsplash & stovetop wiped",
      "Sink scrubbed, polished & drained",
      "Outside of appliances cleaned",
      "Cabinet fronts spot-cleaned",
      "Floors swept & mopped",
      "Trash emptied, liner replaced",
    ],
  },
  {
    name: "Bathrooms",
    icon: Bathtub,
    photo: PHOTOS.bathroom,
    items: [
      "Tubs, showers & glass cleaned",
      "Toilet inside, outside & base",
      "Sinks, faucets & counters polished",
      "Mirrors streak-free",
      "Floors swept & mopped",
      "Towels straightened, trash out",
    ],
  },
  {
    name: "Bedrooms",
    icon: Bed,
    photo: PHOTOS.bedroom,
    items: [
      "Beds made (linens changed if left out)",
      "Dust nightstands, dressers, ledges",
      "Mirrors & glass polished",
      "Floors vacuumed or mopped",
      "Trash emptied",
      "Light tidying & straightening",
    ],
  },
  {
    name: "Living Spaces",
    icon: Armchair,
    photo: PHOTOS.living,
    items: [
      "Dust all surfaces — high & low",
      "Couches & cushions straightened",
      "Coffee tables, shelves, electronics",
      "Baseboards spot-checked",
      "Floors vacuumed & mopped",
      "Smudges off doors, frames, switches",
    ],
  },
];

const addOns = [
  { label: "Inside oven", icon: CookingPot },
  { label: "Inside fridge", icon: Drop },
  { label: "Interior windows", icon: Sun },
  { label: "Laundry — wash, dry & fold", icon: PaintRoller },
  { label: "Inside cabinets & drawers", icon: HouseSimple },
  { label: "Wall spot-cleaning", icon: Sparkle },
];

const serviceCities = {
  clallam: [
    "Port Angeles",
    "Sequim",
    "Forks",
    "Joyce",
    "Carlsborg",
    "Diamond Point",
    "Clallam Bay",
    "Neah Bay",
  ],
  jefferson: [
    "Port Townsend",
    "Port Hadlock",
    "Chimacum",
    "Quilcene",
    "Brinnon",
    "Port Ludlow",
    "Marrowstone",
    "Cape George",
  ],
};

const faqs = [
  {
    q: "Do you bring your own cleaning supplies?",
    a: "Yes. We bring everything — vacuums, cloths, mops, and the products we trust. If you'd rather we use something specific from your home (a favorite floor cleaner, fragrance-free options for allergies), just leave it out and we will.",
  },
  {
    q: "Are you insured?",
    a: "Yes — we're fully insured, and every cleaner is background-checked before they step into a client's home. Peace of mind is part of the service.",
  },
  {
    q: "What's your service area?",
    a: "Clallam and Jefferson Counties on the Olympic Peninsula. That includes Port Angeles, Sequim, Port Townsend, Forks, Port Hadlock, Quilcene, and most points between. If you're close to the edge and not sure, call — we'll let you know straight.",
  },
  {
    q: "Do I need to be home during the cleaning?",
    a: "Most of our regular clients aren't. We coordinate access ahead of time — many leave a key or code with us — and we lock up exactly the way we found it. Whatever's most comfortable for your routine, we'll work with.",
  },
  {
    q: "How does pricing work?",
    a: "Every quote is based on home size, scope, and frequency — no two homes are the same, so we don't quote without learning yours first. Quotes are free and there's no obligation. Recurring cadences come with a friendlier rate than one-time deep cleans.",
  },
  {
    q: "What if I need to reschedule?",
    a: "Life happens. Give us a heads-up when you can and we'll find another window that works. No penalty — we'd rather see you on the right day than the wrong one.",
  },
  {
    q: "Can I add things to a visit?",
    a: "Yes. Inside the oven, fridge, interior windows, laundry — let us know ahead of time and we'll plan the visit around it. Most add-ons are a small flat add to the regular rate.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function FamilyCareCleaningPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRoom, setActiveRoom] = useState<number>(0);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{
        background: BG,
        color: INK,
        // Set Inter as the inherited base font so sticky-nav links,
        // CTA button label, form fields, and anything without an
        // explicit class don't fall back to the Next default (Geist).
        // fcc-serif on headlines still overrides cleanly to Fraunces.
        fontFamily:
          "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      {/* Page-scoped font stack: editorial serif headlines + clean sans body. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap');
        .fcc-serif { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; }
        .fcc-sans  { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
      `}</style>

      <FloatingCitrus />

      {/* ═════════════ NAV ═════════════ */}
      <div className="relative z-50">
        <StickyNav
          businessName={BUSINESS.name}
          logoSrc={LOGO}
          phoneDisplay={BUSINESS.phoneDisplay}
          phoneHref={BUSINESS.phoneHref}
        />
      </div>

      {/* ═════════════ 1 · HERO ═════════════ */}
      <section
        id="top"
        className="relative pt-14 pb-20 md:pt-20 md:pb-28 z-10 overflow-hidden"
      >
        {/* Warm radial glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 15% 20%, ${CITRUS_GLOW} 0%, transparent 55%),
                         radial-gradient(ellipse at 85% 70%, ${LEAF_GLOW} 0%, transparent 55%)`,
          }}
        />
        <CitrusPattern opacity={0.04} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT — copy */}
            <div className="relative">
              {/* Logo as hero monogram on mobile, smaller on desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring, delay: 0.05 }}
                className="mb-7 inline-block"
              >
                <img
                  src={LOGO}
                  alt="Family Care Cleaning logo"
                  className="h-24 sm:h-28 md:h-32 w-auto drop-shadow-[0_8px_30px_rgba(217,154,15,0.35)]"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="fcc-sans text-[12px] sm:text-[13px] uppercase tracking-[0.3em] font-semibold mb-5 flex items-center gap-3"
                style={{ color: GOLD_DARK }}
              >
                <span
                  className="inline-block w-8 h-px"
                  style={{ background: GOLD_DEEP }}
                />
                {BUSINESS.area}
              </motion.p>

              <h1 className="fcc-serif text-[44px] sm:text-[60px] lg:text-[78px] xl:text-[88px] leading-[0.95] tracking-[-0.02em] font-semibold text-[#1f3f17]">
                <WordReveal text="Cleaning with care," />
                <br />
                <span className="italic font-normal" style={{ color: GOLD_DARK }}>
                  <WordReveal text="visit after visit." />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.5 }}
                className="fcc-sans mt-8 text-[17px] sm:text-[19px] leading-[1.6] max-w-xl"
                style={{ color: INK_SOFT }}
              >
                A family-run cleaning service on the Olympic Peninsula. We
                show up on the day you booked, do the work the way we said
                we would, and leave your home feeling cared for — not just
                cleaned.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.7 }}
                className="mt-9 flex flex-wrap gap-4"
              >
                <a href="#contact">
                  <MagneticButton
                    className="px-8 py-4 rounded-full text-[15px] font-semibold flex items-center gap-2 cursor-pointer fcc-sans shadow-[0_14px_38px_-14px_rgba(47,92,36,0.55)]"
                    style={{
                      background: LEAF_DEEP,
                      color: BG,
                    }}
                  >
                    Get a free quote
                    <ArrowRight size={18} weight="bold" />
                  </MagneticButton>
                </a>
                <a href={BUSINESS.phoneHref}>
                  <MagneticButton
                    className="px-8 py-4 rounded-full text-[15px] font-semibold flex items-center gap-2 cursor-pointer fcc-sans border-2"
                    style={{
                      background: "transparent",
                      borderColor: GOLD_DEEP,
                      color: GOLD_DARK,
                    }}
                  >
                    <Phone size={18} weight="fill" />
                    {BUSINESS.phoneDisplay}
                  </MagneticButton>
                </a>
              </motion.div>

              {/* Trust chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...spring, delay: 0.9 }}
                className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[13px] fcc-sans"
                style={{ color: INK_SOFT }}
              >
                {trustChips.slice(0, 4).map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-2">
                    <t.icon size={16} weight="duotone" style={{ color: LEAF_DEEP }} />
                    {t.label}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — photo collage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.3 }}
              className="relative h-[460px] sm:h-[540px] lg:h-[620px]"
            >
              {/* Main photo — large */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[78%] rounded-3xl overflow-hidden shadow-[0_30px_80px_-30px_rgba(31,40,32,0.4)] border-4 border-white"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ right: "12%" }}
              >
                <img
                  src={PHOTOS.hero}
                  alt="Sunlit, freshly cleaned home — Family Care Cleaning"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 60%, rgba(31,40,32,0.18))",
                  }}
                />
              </motion.div>

              {/* Floating card — towels stack, bottom right */}
              <motion.div
                className="absolute bottom-0 right-0 w-[58%] sm:w-[52%] h-[44%] rounded-2xl overflow-hidden shadow-[0_22px_60px_-22px_rgba(31,40,32,0.5)] border-4 border-white"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <img
                  src={PHOTOS.cleaningAction}
                  alt="Family Care Cleaning crew wiping shutters during a routine clean"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.div>

              {/* Floating badge — top-left */}
              <motion.div
                className="absolute top-[58%] left-0 sm:left-[-4%]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <CreamCard
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ background: BG_WHITE }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${LEMON}, ${GOLD_DEEP})`,
                    }}
                  >
                    <HandHeart size={22} weight="fill" color="#fff" />
                  </div>
                  <div>
                    <div className="fcc-sans text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: GOLD_DARK }}>
                      Family-owned
                    </div>
                    <div className="fcc-serif text-[15px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                      Olympic Peninsula
                    </div>
                  </div>
                </CreamCard>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═════════════ 2 · TRUST RIBBON ═════════════ */}
      <section className="relative z-10 py-6 border-y border-[#2f5c24]/10" style={{ background: BG_DEEP }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            className="flex flex-wrap justify-center gap-x-8 gap-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {trustChips.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-center gap-2 fcc-sans text-[13px]"
                style={{ color: LEAF_INK }}
              >
                <t.icon size={18} weight="duotone" style={{ color: GOLD_DEEP }} />
                <span className="whitespace-nowrap font-medium">{t.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════ 3 · SERVICES — accordion ═════════════ */}
      <SectionReveal id="services" className="relative z-10 py-20 md:py-28">
        <CitrusPattern opacity={0.025} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
            {/* LEFT — sticky header */}
            <div className="lg:sticky lg:top-32">
              <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
                Services
              </p>
              <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] font-semibold mb-6" style={{ color: LEAF_INK }}>
                <WordReveal text="Four ways we" />
                <br />
                <span className="italic font-normal" style={{ color: GOLD_DARK }}>
                  <WordReveal text="care for a home." />
                </span>
              </h2>
              <p className="fcc-sans text-[16px] leading-relaxed max-w-md" style={{ color: INK_SOFT }}>
                Routine visits to keep things steady. Detail cleans for the
                seasonal reset. Move-in / move-out when life shifts. And
                one-time visits when the calendar calls for it. Click any
                service to see what&rsquo;s included.
              </p>

              <div className="mt-8 hidden lg:flex items-center gap-3 p-4 rounded-2xl border border-[#2f5c24]/15 bg-white">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: LEAF }} />
                <span className="fcc-sans text-[14px]" style={{ color: INK_SOFT }}>
                  Currently scheduling new homes
                </span>
              </div>
            </div>

            {/* RIGHT — accordion */}
            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {services.map((svc, i) => {
                const Icon = svc.icon;
                const isOpen = openService === i;
                return (
                  <motion.div key={i} variants={fadeUp}>
                    <CreamCard className="overflow-hidden">
                      <button
                        onClick={() => setOpenService(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: i % 2 === 0 ? CITRUS_GLOW : LEAF_GLOW,
                            }}
                          >
                            <Icon size={22} weight="duotone" style={{ color: i % 2 === 0 ? GOLD_DARK : LEAF_DEEP }} />
                          </div>
                          <div className="min-w-0">
                            <div className="fcc-serif text-[20px] sm:text-[22px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                              {svc.title}
                            </div>
                            <div className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-semibold mt-1" style={{ color: GOLD_DARK }}>
                              {svc.pillar}
                            </div>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring} className="shrink-0 ml-3">
                          <CaretDown size={20} style={{ color: INK_FAINT }} />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={spring}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 md:px-6 md:pb-7 pl-[4.75rem] grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5 md:gap-6">
                              <div>
                                <p className="fcc-sans text-[15px] leading-relaxed mb-4" style={{ color: INK_SOFT }}>
                                  {svc.blurb}
                                </p>
                                <ul className="space-y-2">
                                  {svc.bullets.map((b, j) => (
                                    <li key={j} className="flex items-start gap-2 fcc-sans text-[14px]" style={{ color: INK }}>
                                      <Check size={16} weight="bold" className="mt-0.5 shrink-0" style={{ color: LEAF_DEEP }} />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#2f5c24]/10">
                                <img
                                  src={svc.photo}
                                  alt={`${svc.title} — Family Care Cleaning`}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CreamCard>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════ 4 · WHY US — value props ═════════════ */}
      <SectionReveal className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: BG_DEEP }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${CITRUS_GLOW} 0%, transparent 55%),
                         radial-gradient(ellipse at 80% 50%, ${LEAF_GLOW} 0%, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
              Our standard
            </p>
            <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] font-semibold" style={{ color: LEAF_INK }}>
              <WordReveal text="Why homeowners" />
              <br />
              <span className="italic font-normal" style={{ color: GOLD_DARK }}>
                <WordReveal text="call us back." />
              </span>
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {whyUs.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <CreamCard className="p-7 h-full">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: `linear-gradient(135deg, ${LEMON}, ${GOLD})`,
                      }}
                    >
                      <Icon size={26} weight="duotone" color="#fff" />
                    </div>
                    <h3 className="fcc-serif text-[20px] font-semibold mb-2.5" style={{ color: LEAF_INK }}>
                      {v.title}
                    </h3>
                    <p className="fcc-sans text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                      {v.desc}
                    </p>
                  </CreamCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═════════════ 5 · WHAT'S INCLUDED — interactive room tabs ═════════════ */}
      <SectionReveal id="included" className="relative z-10 py-20 md:py-28">
        <CitrusPattern opacity={0.03} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
              What&rsquo;s included
            </p>
            <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] font-semibold max-w-3xl mx-auto" style={{ color: LEAF_INK }}>
              <WordReveal text="Every room," />
              <br />
              <span className="italic font-normal" style={{ color: GOLD_DARK }}>
                <WordReveal text="end to end." />
              </span>
            </h2>
            <p className="fcc-sans text-[16px] leading-relaxed max-w-xl mx-auto mt-5" style={{ color: INK_SOFT }}>
              The baseline for every routine visit. Add-ons live further down
              — anything we don&rsquo;t cover is something we&rsquo;ll quote
              clearly up front.
            </p>
          </div>

          {/* Room selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {includedRooms.map((r, i) => {
              const Icon = r.icon;
              const isActive = activeRoom === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveRoom(i)}
                  className={`fcc-sans inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-semibold transition-all border-2 cursor-pointer ${
                    isActive ? "shadow-[0_10px_30px_-12px_rgba(47,92,36,0.5)]" : ""
                  }`}
                  style={
                    isActive
                      ? { background: LEAF_DEEP, color: BG, borderColor: LEAF_DEEP }
                      : { background: "transparent", color: LEAF_INK, borderColor: "rgba(47,92,36,0.2)" }
                  }
                >
                  <Icon size={16} weight={isActive ? "fill" : "duotone"} />
                  {r.name}
                </button>
              );
            })}
          </div>

          {/* Room content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoom}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8"
            >
              {/* Checklist */}
              <CreamCard className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: LEAF_GLOW }}
                  >
                    {(() => {
                      const Icon = includedRooms[activeRoom].icon;
                      return <Icon size={22} weight="duotone" style={{ color: LEAF_DEEP }} />;
                    })()}
                  </div>
                  <h3 className="fcc-serif text-[28px] font-semibold" style={{ color: LEAF_INK }}>
                    {includedRooms[activeRoom].name}
                  </h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {includedRooms[activeRoom].items.map((item, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring, delay: j * 0.05 }}
                      className="flex items-start gap-2.5 fcc-sans text-[15px]"
                      style={{ color: INK }}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: LEAF_DEEP }}
                      >
                        <Check size={12} weight="bold" color="#fff" />
                      </span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CreamCard>

              {/* Room photo */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto shadow-[0_22px_60px_-25px_rgba(31,40,32,0.4)] border-4 border-white">
                <img
                  src={includedRooms[activeRoom].photo}
                  alt={`Family Care Cleaning — ${includedRooms[activeRoom].name}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 65%, rgba(31,40,32,0.25))",
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Add-ons strip */}
          <div className="mt-14">
            <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold text-center mb-5" style={{ color: GOLD_DARK }}>
              Optional add-ons
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {addOns.map((a, i) => {
                const Icon = a.icon;
                return (
                  <motion.span
                    key={i}
                    variants={fadeUp}
                    className="fcc-sans inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium border"
                    style={{
                      background: BG_WHITE,
                      color: LEAF_INK,
                      borderColor: "rgba(217,154,15,0.4)",
                    }}
                  >
                    <Icon size={14} weight="duotone" style={{ color: GOLD_DARK }} />
                    {a.label}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════ 6 · PROCESS ═════════════ */}
      <SectionReveal id="process" className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: LEAF_INK }}>
        {/* Dark band — break the cream monotony, add depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            background: `radial-gradient(ellipse at 20% 30%, ${GOLD} 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 70%, ${LEAF} 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <svg width="100%" height="100%">
            <pattern id="dot-pattern-dark" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.2" fill={GOLD} />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dot-pattern-dark)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD }}>
              How it works
            </p>
            <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[60px] leading-[0.98] tracking-[-0.02em] font-semibold text-white">
              <WordReveal text="Four steps" />
              <br />
              <span className="italic font-normal" style={{ color: LEMON }}>
                <WordReveal text="to a cared-for home." />
              </span>
            </h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} variants={fadeUp} className="relative">
                  <div
                    className="rounded-2xl p-6 sm:p-7 h-full border"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(245,184,38,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="fcc-serif text-[40px] font-semibold leading-none"
                        style={{ color: GOLD }}
                      >
                        {step.step}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(245,184,38,0.15)" }}
                      >
                        <Icon size={18} weight="duotone" style={{ color: LEMON }} />
                      </div>
                    </div>
                    <h3 className="fcc-serif text-[22px] font-semibold mb-2.5 text-white">
                      {step.title}
                    </h3>
                    <p className="fcc-sans text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                      {step.desc}
                    </p>
                  </div>
                  {/* Connecting arrow on desktop */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: GOLD }}
                      >
                        <ArrowRight size={12} weight="bold" color={LEAF_INK} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═════════════ 7 · CARE MANIFESTO ═════════════ */}
      <SectionReveal className="relative z-10 py-24 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${CITRUS_GLOW} 0%, transparent 60%)`,
          }}
        />
        <CitrusPattern opacity={0.04} />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <Quotes size={48} weight="duotone" style={{ color: GOLD_DEEP }} className="mx-auto mb-6" />
          <p className="fcc-serif text-[28px] sm:text-[38px] lg:text-[44px] leading-[1.2] tracking-[-0.01em] font-medium" style={{ color: LEAF_INK }}>
            Care is the corners noticed. The picture frame straightened. The
            towel folded the way you fold it. <span className="italic" style={{ color: GOLD_DARK }}>It&rsquo;s the difference between a house cleaned and a home cared for.</span>
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="block w-12 h-px" style={{ background: GOLD_DEEP }} />
            <span className="fcc-sans text-[12px] uppercase tracking-[0.3em] font-semibold" style={{ color: GOLD_DARK }}>
              The Family Care way
            </span>
            <span className="block w-12 h-px" style={{ background: GOLD_DEEP }} />
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════ 8 · SERVICE AREA ═════════════ */}
      <SectionReveal id="area" className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: BG_DEEP }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(ellipse at 80% 30%, ${LEAF_GLOW} 0%, transparent 50%)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT — copy + city columns */}
            <div>
              <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
                Where we clean
              </p>
              <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[58px] leading-[0.98] tracking-[-0.02em] font-semibold mb-6" style={{ color: LEAF_INK }}>
                The whole{" "}
                <span className="italic" style={{ color: GOLD_DARK }}>
                  Olympic Peninsula.
                </span>
              </h2>
              <p className="fcc-sans text-[16px] leading-relaxed mb-8 max-w-md" style={{ color: INK_SOFT }}>
                Based locally, serving Clallam and Jefferson Counties
                from end to end. If you&rsquo;re close to the edge and
                not sure, call — we&rsquo;ll let you know straight.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold mb-3 flex items-center gap-2" style={{ color: LEAF_DEEP }}>
                    <MapPin size={14} weight="fill" />
                    Clallam County
                  </h3>
                  <ul className="space-y-2">
                    {serviceCities.clallam.map((c) => (
                      <li
                        key={c}
                        className="fcc-serif text-[16px] sm:text-[17px]"
                        style={{ color: INK }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold mb-3 flex items-center gap-2" style={{ color: LEAF_DEEP }}>
                    <MapPin size={14} weight="fill" />
                    Jefferson County
                  </h3>
                  <ul className="space-y-2">
                    {serviceCities.jefferson.map((c) => (
                      <li
                        key={c}
                        className="fcc-serif text-[16px] sm:text-[17px]"
                        style={{ color: INK }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT — Olympic Peninsula image */}
            <div className="relative h-[440px] sm:h-[520px] rounded-3xl overflow-hidden shadow-[0_30px_70px_-30px_rgba(31,40,32,0.4)] border-4 border-white">
              <img
                src={PHOTOS.pacificNW}
                alt="Misty Olympic Peninsula conifer forest"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(31,40,32,0.55))",
                }}
              />
              <div className="absolute bottom-6 left-6 right-6">
                <CreamCard
                  className="px-5 py-4 flex items-center gap-3 max-w-sm backdrop-blur-md"
                  style={{ background: "rgba(253,248,236,0.92)" }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${LEMON}, ${GOLD_DEEP})`,
                    }}
                  >
                    <House size={20} weight="fill" color="#fff" />
                  </div>
                  <div>
                    <div className="fcc-serif text-[17px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                      Local to the Peninsula
                    </div>
                    <div className="fcc-sans text-[13px]" style={{ color: INK_SOFT }}>
                      Two counties · One family
                    </div>
                  </div>
                </CreamCard>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════ 9 · FAQ ═════════════ */}
      <SectionReveal id="faq" className="relative z-10 py-20 md:py-28">
        <CitrusPattern opacity={0.025} />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
              Common questions
            </p>
            <h2 className="fcc-serif text-[40px] sm:text-[52px] leading-[0.98] tracking-[-0.02em] font-semibold" style={{ color: LEAF_INK }}>
              <WordReveal text="Good to know" />
              <br />
              <span className="italic font-normal" style={{ color: GOLD_DARK }}>
                <WordReveal text="before we visit." />
              </span>
            </h2>
          </div>

          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <CreamCard className="overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer gap-4"
                    >
                      <span className="fcc-serif text-[17px] sm:text-[19px] font-semibold" style={{ color: LEAF_INK }}>
                        {f.q}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring} className="shrink-0">
                        <CaretDown size={18} style={{ color: GOLD_DARK }} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={spring}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-6 md:px-6 md:pb-7 fcc-sans text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CreamCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═════════════ 10 · CONTACT ═════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: BG_DEEP }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 30%, ${CITRUS_GLOW} 0%, transparent 55%),
                         radial-gradient(ellipse at 70% 70%, ${LEAF_GLOW} 0%, transparent 55%)`,
          }}
        />
        <CitrusPattern opacity={0.035} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-start">
            {/* LEFT — info column */}
            <div>
              <p className="fcc-sans text-[12px] uppercase tracking-[0.28em] font-semibold mb-4" style={{ color: GOLD_DARK }}>
                Free quote
              </p>
              <h2 className="fcc-serif text-[40px] sm:text-[52px] lg:text-[58px] leading-[0.98] tracking-[-0.02em] font-semibold mb-6" style={{ color: LEAF_INK }}>
                Tell us about{" "}
                <span className="italic" style={{ color: GOLD_DARK }}>
                  your home.
                </span>
              </h2>
              <p className="fcc-sans text-[16px] leading-relaxed max-w-md mb-10" style={{ color: INK_SOFT }}>
                Send a note with your home&rsquo;s size, how often
                you&rsquo;d like a visit, and anything that needs extra
                care. We&rsquo;ll be back in touch within one business day
                with a no-obligation quote.
              </p>

              <div className="space-y-5">
                <a
                  href={BUSINESS.phoneHref}
                  className="flex items-start gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition"
                    style={{
                      background: `linear-gradient(135deg, ${LEMON}, ${GOLD})`,
                    }}
                  >
                    <Phone size={20} weight="fill" color="#fff" />
                  </div>
                  <div>
                    <div className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: GOLD_DARK }}>
                      Call us
                    </div>
                    <div className="fcc-serif text-[22px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                      {BUSINESS.phoneDisplay}
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="flex items-start gap-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition"
                    style={{
                      background: `linear-gradient(135deg, ${LEAF}, ${LEAF_DEEP})`,
                    }}
                  >
                    <Envelope size={20} weight="fill" color="#fff" />
                  </div>
                  <div>
                    <div className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: GOLD_DARK }}>
                      Email us
                    </div>
                    <div className="fcc-serif text-[17px] sm:text-[18px] font-semibold leading-tight break-all" style={{ color: LEAF_INK }}>
                      {BUSINESS.email}
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: LEAF_GLOW }}
                  >
                    <MapPin size={20} weight="duotone" style={{ color: LEAF_DEEP }} />
                  </div>
                  <div>
                    <div className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: GOLD_DARK }}>
                      Service area
                    </div>
                    <div className="fcc-serif text-[17px] sm:text-[18px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                      Clallam & Jefferson Counties
                    </div>
                    <div className="fcc-sans text-[13px] mt-0.5" style={{ color: INK_SOFT }}>
                      Olympic Peninsula, Washington
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: CITRUS_GLOW }}
                  >
                    <Clock size={20} weight="duotone" style={{ color: GOLD_DARK }} />
                  </div>
                  <div>
                    <div className="fcc-sans text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: GOLD_DARK }}>
                      Reply time
                    </div>
                    <div className="fcc-serif text-[17px] sm:text-[18px] font-semibold leading-tight" style={{ color: LEAF_INK }}>
                      Within one business day
                    </div>
                    <div className="fcc-sans text-[13px] mt-0.5" style={{ color: INK_SOFT }}>
                      A real human, every time
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — form */}
            <FamilyCareCleaningContactForm
              services={services.map((s) => s.title)}
            />
          </div>
        </div>
      </SectionReveal>

      {/* ═════════════ 11 · FOOTER ═════════════ */}
      <footer className="relative z-10 py-12 border-t border-[#2f5c24]/15" style={{ background: LEAF_INK, color: "#f5e9c2" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={LOGO}
                alt="Family Care Cleaning"
                className="h-14 w-auto"
              />
              <div>
                <div className="fcc-serif text-[20px] font-semibold leading-tight text-white">
                  Family Care Cleaning
                </div>
                <div className="fcc-sans text-[12px] tracking-[0.18em] uppercase mt-1" style={{ color: LEMON }}>
                  Cleaning with care
                </div>
              </div>
            </div>

            <div className="fcc-sans text-[14px] flex flex-wrap gap-x-6 gap-y-2" style={{ color: "rgba(255,255,255,0.78)" }}>
              <a href={BUSINESS.phoneHref} className="hover:text-white inline-flex items-center gap-1.5">
                <Phone size={14} weight="fill" />
                {BUSINESS.phoneDisplay}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-white inline-flex items-center gap-1.5">
                <Envelope size={14} weight="fill" />
                {BUSINESS.email}
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#f5e9c2]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="fcc-sans text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              © {new Date().getFullYear()} Family Care Cleaning · Clallam & Jefferson Counties, WA
            </div>
            <div className="fcc-sans text-[12px] flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              <BluejayLogo size={16} className="text-[#7dd3fc] shrink-0" />
              <span>
                Built by{" "}
                <a
                  href="https://bluejayportfolio.com"
                  className="font-bold hover:opacity-100"
                  style={{ color: "#7dd3fc" }}
                >
                  BlueJays
                </a>{" "}
                — get your free site audit
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
