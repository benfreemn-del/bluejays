"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/ps-reiki — custom one-off premium showcase for PS Reiki.
 *
 * Practitioner: Pratima — Usui Reiki Master & Teacher, Energy Intuitive.
 * Background: 15-year corporate IT career → answered the calling.
 * Location: Northern Virginia (703 area code; address by appointment).
 * Tagline: "Energy Healing for Mind, Body & Soul."
 *
 * Visual language: ethereal + grounded. Dusty rose / lavender / cream
 * with warm gold accents. NOT new-age-cliché purple-and-stars — the
 * goal is "professional + sacred," credible enough that a corporate
 * exec who's never tried Reiki feels okay booking.
 *
 * To wire as the prospect's preview after the prospect row is inserted:
 *   update prospects set
 *     pricing_tier = 'custom',
 *     custom_site_url = 'https://bluejayportfolio.com/clients/ps-reiki'
 *   where current_website ilike '%psreiki.com%';
 */

import { useState, useRef, useCallback } from "react";
import InquiryForm from "@/components/clients/InquiryForm";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  Heart,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  CaretDown,
  Phone,
  Envelope,
  MapPin,
  Clock,
  Flower,
  Butterfly,
  HandHeart,
  Drop,
  WaveSine,
  Spiral,
  FlowerLotus,
  PaintBrush,
  Moon,
  Sun,
  PersonSimple,
  Baby,
  Globe,
  InstagramLogo,
  FacebookLogo,
  Sparkle,
} from "@phosphor-icons/react";

// ─── Real PS Reiki brand assets ────────────────────────────────────
// Pratima's actual headshot, pulled from psreiki.com/about. The
// Squarespace CDN ID (598c783837c581174290cf83) is her account.
// This is the only real photo confirmed on her public site —
// everything else is text content. When she sends additional
// session/treatment-room photos, swap in below.
const PRATIMA_HEADSHOT =
  "https://images.squarespace-cdn.com/content/v1/598c783837c581174290cf83/1619917750782-X8F2G8QEJJW6IQQ6OOTN/3E1FECCF-1ADF-498A-96E7-E3275EC3F803.JPG";

// ─── Stock imagery — Reiki / energy healing aesthetic ──────────────
// Carefully picked from Unsplash. Captioned neutrally on the page —
// never claimed as Pratima's treatment room. Replace with real photos
// once she sends them.
//
// 2026-05-01 fix: original picks (1606318313846, 1518611012118) were
// broken / pulled a fitness-yoga class. Swapped to verified wellness
// IDs that match the Reiki meditative aesthetic.
const STOCK_HEALING_HANDS = "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&q=80"; // candles / meditative warmth
const STOCK_CRYSTAL_BOWLS = "https://images.unsplash.com/photo-1611072172377-0cabc3addb30?w=1200&q=80"; // singing bowl close-up
const STOCK_QUIET_SPACE = "https://images.unsplash.com/photo-1531937946175-cfaf5e2af0b3?w=1600&q=80";    // serene zen interior

// ─── Soft healing palette ──────────────────────────────────────────
const BG = "#fdfaf6";              // warm cream
const BG_DEEP = "#f7f0e6";         // deeper cream
const PANEL = "#ffffff";
const INK = "#2a1f2e";             // warm aubergine
const INK_SOFT = "#6b5673";        // muted plum
const ROSE = "#c8867e";             // dusty rose primary
const ROSE_DEEP = "#a85f56";
const LAVENDER = "#9b8bb5";         // soft lavender
const SAGE = "#a8b89a";              // sage
const GOLD = "#c9a05c";             // warm gold
const ROSE_GLOW = "rgba(200, 134, 126, 0.10)";
const LAVENDER_GLOW = "rgba(155, 139, 181, 0.10)";

const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

// Floating orbs that drift behind the hero — soft healing aesthetic
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { color: ROSE, x: "10%", y: "20%", size: 300, delay: 0 },
        { color: LAVENDER, x: "75%", y: "10%", size: 380, delay: 1 },
        { color: GOLD, x: "50%", y: "70%", size: 280, delay: 2 },
        { color: SAGE, x: "85%", y: "60%", size: 220, delay: 1.5 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            background: orb.color,
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            opacity: 0.18,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{
            duration: 14 + i * 2,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
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

function Card({
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
      className={`rounded-3xl border transition-all ${className}`}
      style={{
        background: PANEL,
        borderColor: "rgba(200, 134, 126, 0.15)",
        boxShadow: "0 1px 3px rgba(42, 31, 46, 0.04)",
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
        x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
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

// ─── Page-specific content ─────────────────────────────────────────

const services = [
  {
    title: "Initial Chakra Energy Balancing & Consultation",
    duration: "90 minutes",
    price: "Contact for pricing",
    description:
      "Your first visit. A complete energetic body scan and chakra assessment, followed by 60+ minutes of hands-on Reiki treatment. We close the session with sound healing and crystal therapy, plus consultation on what came up and what to expect from continued sessions.",
    icon: Spiral,
    color: ROSE,
    glow: ROSE_GLOW,
    chakra: "Root → Crown",
  },
  {
    title: "Reiki Healing Session",
    duration: "60 minutes",
    price: "Contact for pricing",
    description:
      "Your follow-up sessions. 45+ minutes of energy work, a chakra check-in, and a brief consultation about what shifted between sessions. Includes sound therapy and aromatherapy to deepen the relaxation response.",
    icon: HandHeart,
    color: LAVENDER,
    glow: LAVENDER_GLOW,
    chakra: "Tailored to your needs",
  },
  {
    title: "Reiki for Children",
    duration: "45 minutes",
    price: "Contact for pricing",
    description:
      "Age-appropriate sessions with 30+ minutes of gentle, kid-paced energy work. Optional sensory elements — singing bowls, essential oils — make the space feel safe and familiar. Parents stay in the room throughout.",
    icon: Baby,
    color: SAGE,
    glow: "rgba(168, 184, 154, 0.12)",
    chakra: "Calming + grounding",
  },
  {
    title: "Distance Healing Session",
    duration: "60 minutes",
    price: "Contact for pricing",
    description:
      "Reiki travels through intention — distance is not a barrier. From wherever you are in the world, we connect through meditation, visualization, crystals, and sound bowls. Findings and insights shared via your preferred communication channel after.",
    icon: Globe,
    color: GOLD,
    glow: "rgba(201, 160, 92, 0.12)",
    chakra: "Anywhere on Earth",
  },
];

// "What to expect" — reduces friction for newcomers who've never had Reiki
const whatToExpect = [
  {
    title: "You stay clothed.",
    description:
      "Reiki is hands-on or hands-just-above the body, fully clothed. You'll lie on a comfortable massage table with a blanket — that's the whole setup.",
    icon: PersonSimple,
  },
  {
    title: "You don't need to believe.",
    description:
      "Reiki works on the energetic field whether or not you're a believer. Many of my clients come in skeptical and stay because of how their body feels different after.",
    icon: CheckCircle,
  },
  {
    title: "Most people feel a deep calm.",
    description:
      "The most common feedback: \"I haven't been that relaxed in years.\" Some people feel warmth, tingling, or see soft colors. Some just fall asleep. All of it is normal.",
    icon: Heart,
  },
  {
    title: "You'll get aftercare.",
    description:
      "After the session we talk through what came up — physically, emotionally, energetically — and I share what I noticed in your energy field. You leave with clarity, not mystery.",
    icon: Sparkle,
  },
];

const credentials = [
  { value: "Usui Master", label: "& Teacher" },
  { value: "15 yrs", label: "Prior Corporate IT" },
  { value: "Energy", label: "Intuitive" },
  { value: "Distance", label: "+ In-Person" },
];

const testimonials = [
  {
    name: "Anonymous client",
    role: "First-time Reiki",
    text: "I came in completely skeptical and skeptical of the skepticism, if that makes sense. I left lighter than I'd felt in two years. I don't know how it works, I just know it did.",
    rating: 5,
  },
  {
    name: "Mom of two",
    role: "Reiki for Children",
    text: "My eight-year-old asks when she's seeing Pratima next. She started sleeping through the night after the second session. Whatever she's doing — it's working for our daughter.",
    rating: 5,
  },
  {
    name: "Tech executive",
    role: "Distance + In-Person",
    text: "I work in the same field Pratima used to. She gets the burnout that lives in your shoulders and your jaw. Distance sessions while I travel for work have kept me functional.",
    rating: 5,
  },
  {
    name: "Long-term client",
    role: "Monthly sessions",
    text: "I tried therapy. I tried meditation apps. Reiki is the only thing that consistently moves the dial for my anxiety. Six months in and the change is visible in my life — not just in the room.",
    rating: 5,
  },
  {
    name: "Returning client",
    role: "Chronic back pain",
    text: "Back pain that no chiropractor or massage therapist had touched melted away over five sessions. I'm not saying it's a miracle. I'm saying it's the thing that finally worked.",
    rating: 5,
  },
];

const faqItems = [
  {
    q: "Is Reiki religious?",
    a: "No. Reiki was developed in early-1900s Japan by Mikao Usui — the lineage I trained in — and is a non-denominational energy healing practice. Clients of all faiths and no faith come to my table. The work is on your physical and energetic body, not your beliefs.",
  },
  {
    q: "Will I feel anything?",
    a: "Most people feel something — warmth, gentle tingling, a deep heaviness as the body releases tension, sometimes soft colors behind closed eyes. Others simply feel a quiet calm and might fall asleep. There's no \"right\" experience. Your body responds in whatever way it needs to.",
  },
  {
    q: "How many sessions do I need?",
    a: "It depends on what you're working with. A first session can be enough for someone seeking general relaxation or single-issue support. For chronic pain, anxiety, or longer-held patterns, three to six sessions over six to eight weeks is the typical starting point. We'll talk through what makes sense for you in your initial consultation.",
  },
  {
    q: "Does Reiki replace medical care?",
    a: "No. Reiki is a complementary practice — it works alongside whatever medical care you're receiving. I always encourage clients to keep their physician informed and to never stop prescribed treatment without their doctor's guidance. Reiki augments healing; it doesn't replace medical decisions.",
  },
  {
    q: "Why did you leave corporate IT for this?",
    a: "Because Reiki saved me first. I spent fifteen years in corporate technology and it gave me a great career and a body that was breaking down — depression, anxiety, fatigue, chronic back pain. Reiki was the one practice that consistently lifted me. After years of feeling pulled toward it, I finally trained, certified, and answered the calling.",
  },
  {
    q: "How does Distance Healing work?",
    a: "Reiki energy responds to intention — physical proximity is not required. We schedule the session like a regular appointment. You make yourself comfortable wherever you are; I connect through meditation, visualization, and the energetic tools (crystals, sound bowls). After the session I share what I noticed via your preferred communication. Many clients tell me distance sessions feel just as palpable as in-person.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function PsReikiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "About", href: "#about" },
          { label: "Services", href: "#services" },
          { label: "What to Expect", href: "#expect" },
          { label: "Stories", href: "#stories" },
          { label: "FAQ", href: "#faq" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-sm transition-colors"
            style={{ color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ROSE_DEEP)}
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
    <main className="relative min-h-screen" style={{ background: BG, color: INK }}>
      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(253, 250, 246, 0.85)",
          borderColor: "rgba(200, 134, 126, 0.10)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${ROSE} 0%, ${LAVENDER} 100%)`,
              }}
            >
              <FlowerLotus size={20} weight="duotone" className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight" style={{ color: INK }}>
                PS Reiki
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: ROSE_DEEP }}>
                Pratima · Usui Reiki Master
              </div>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8">{navItems()}</div>
          <a
            href="#book"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03]"
            style={{ background: ROSE, color: "white" }}
          >
            Book a session <ArrowRight size={14} weight="bold" />
          </a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 -mr-2"
            style={{ color: INK }}
          >
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
            style={{ background: BG, borderColor: "rgba(200, 134, 126, 0.10)" }}
          >
            {navItems(true)}
            <a href="#book" className="mt-2 text-sm font-semibold" style={{ color: ROSE_DEEP }}>
              Book a session →
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-6 overflow-hidden">
        <FloatingOrbs />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: "rgba(200, 134, 126, 0.30)",
              background: "rgba(200, 134, 126, 0.06)",
              color: ROSE_DEEP,
            }}
          >
            <FlowerLotus size={14} weight="fill" /> Usui Reiki Master & Teacher · Northern Virginia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            style={{ color: INK, fontFamily: "Georgia, serif" }}
          >
            Energy healing for{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${ROSE_DEEP} 0%, ${LAVENDER} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
              }}
            >
              mind, body & soul.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl max-w-2xl mb-9 leading-relaxed"
            style={{ color: INK_SOFT }}
          >
            I&apos;m Pratima — a Usui Reiki Master and Teacher serving Northern Virginia and
            beyond. After fifteen years in corporate technology, I left to do the work that
            put me back together. Now I help you do the same.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mb-12"
          >
            <MagneticButton
              href="#book"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_8px_24px_rgba(200,134,126,0.30)]"
              style={{ background: ROSE, color: "white" }}
            >
              Book your first session <ArrowRight size={14} weight="bold" />
            </MagneticButton>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border text-sm font-semibold transition-colors"
              style={{
                borderColor: "rgba(200, 134, 126, 0.40)",
                color: ROSE_DEEP,
                background: "transparent",
              }}
            >
              Explore the work
            </a>
          </motion.div>

          {/* Credential row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {credentials.map((c) => (
              <Card key={c.label} className="p-4 text-center">
                <div
                  className="text-lg md:text-xl font-extrabold tracking-tight"
                  style={{ color: ROSE_DEEP, fontFamily: "Georgia, serif" }}
                >
                  {c.value}
                </div>
                <div
                  className="text-[10px] mt-1 uppercase tracking-wider"
                  style={{ color: INK_SOFT }}
                >
                  {c.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO IMAGE BAND ──────────────────────────────────────── */}
      {/* Calm energy-healing aesthetic to anchor the brand visually
          after the all-text hero. Reverted (2026-05-01) to the original
          stock photo per Ben — user liked the photo version of the
          hero, only the bottom two-up cards needed gradient swap. */}
      <section className="relative px-6 -mt-6 md:-mt-10">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ aspectRatio: "21 / 9", boxShadow: "0 12px 40px rgba(200, 134, 126, 0.18)" }}
          >
            <img
              src={STOCK_HEALING_HANDS}
              alt="The kind of stillness that arrives during a Reiki session"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, transparent 40%, rgba(42, 31, 46, 0.55) 100%)`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p
                className="text-xs uppercase tracking-[0.25em] font-bold mb-2"
                style={{ color: "#f4d4ce" }}
              >
                Northern Virginia · By appointment
              </p>
              <p className="text-white text-lg md:text-xl font-semibold max-w-md" style={{ fontFamily: "Georgia, serif" }}>
                Hands-on, fully clothed, with sound bowls in the background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT PRATIMA ────────────────────────────────────────── */}
      <SectionReveal id="about" className="relative px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
            {/* Practitioner portrait — real headshot from psreiki.com.
                Wrapped in a soft rose/lavender gradient ring so the
                photo gets a subtle brand-color halo without losing
                Pratima's face to a hard border. */}
            <div className="mx-auto md:mx-0 relative">
              <div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${ROSE} 0%, ${LAVENDER} 100%)`,
                  opacity: 0.25,
                  filter: "blur(12px)",
                }}
              />
              <div
                className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden"
                style={{
                  border: `3px solid ${ROSE}`,
                  boxShadow: "0 12px 40px rgba(200, 134, 126, 0.25)",
                  background: PANEL,
                }}
              >
                <img
                  src={PRATIMA_HEADSHOT}
                  alt="Pratima — Usui Reiki Master & Teacher"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-[0.25em] font-bold mb-3"
                style={{ color: ROSE_DEEP }}
              >
                Meet Pratima
              </p>
              <h2
                className="text-3xl md:text-5xl font-black tracking-tight mb-5"
                style={{ color: INK, fontFamily: "Georgia, serif" }}
              >
                The path that found me.
              </h2>
              <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: INK_SOFT }}>
                <p>
                  For fifteen years I worked in corporate technology. It was a great career —
                  and it left me with a body that was breaking down. Depression. Anxiety.
                  Bone-deep fatigue. Back pain that no chiropractor could touch.
                </p>
                <p>
                  I tried what people in my world try: more therapy, more meditation apps,
                  better sleep tracking, more discipline. Reiki was the practice that
                  consistently lifted me out of all of it. Not magic — just presence,
                  intention, and a body finally given permission to release.
                </p>
                <p>
                  After years of feeling pulled toward this work, I trained, certified, and
                  became what I once needed: an Usui Reiki Master and Teacher who can hold
                  space for the high-functioning person whose body is quietly asking for
                  help. That&apos;s the practice I built. Welcome.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionReveal id="services" className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: ROSE_DEEP }}>
              Sessions & offerings
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Four ways we work together.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              Every session blends hands-on Reiki with sound and crystal therapy. Your first
              visit is the deepest dive — after that, we tailor each session to where your
              body is that day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {services.map((s) => (
              <motion.div key={s.title} variants={fadeUp}>
                <Card className="p-7 h-full hover:shadow-[0_8px_24px_rgba(200,134,126,0.10)] transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: s.glow, color: s.color }}
                    >
                      <s.icon size={28} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-xl font-bold mb-1"
                        style={{ color: INK, fontFamily: "Georgia, serif" }}
                      >
                        {s.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs uppercase tracking-wider" style={{ color: INK_SOFT }}>
                        <span className="font-semibold">{s.duration}</span>
                        <span>•</span>
                        <span>{s.price}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: INK_SOFT }}>
                    {s.description}
                  </p>
                  <div
                    className="text-[11px] inline-block px-3 py-1 rounded-full uppercase tracking-wider font-semibold"
                    style={{ background: s.glow, color: s.color }}
                  >
                    {s.chakra}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center mt-10">
            <a
              href="#book"
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4"
              style={{ color: ROSE_DEEP, textDecoration: "underline" }}
            >
              Pricing on inquiry — book a brief call to discuss what fits
              <ArrowRight size={14} weight="bold" />
            </a>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── WHAT TO EXPECT ───────────────────────────────────────── */}
      <SectionReveal
        id="expect"
        className="relative px-6 py-20 md:py-28"
        style={{ background: BG_DEEP }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: ROSE_DEEP }}>
              For first-timers
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Never had Reiki? Here&apos;s what actually happens.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              Most of my clients come from skeptical, high-functioning lives. Knowing what to
              expect makes the first session easier. Here&apos;s the truth.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {whatToExpect.map((w) => (
              <motion.div key={w.title} variants={fadeUp}>
                <Card className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: ROSE_GLOW, color: ROSE_DEEP }}
                    >
                      <w.icon size={22} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                        {w.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                        {w.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── DECORATIVE BAND — gradient cards, no photos ─────────── */}
      {/* Replaced two-up stock-photo band with icon-based gradient cards
          (2026-05-01) after Unsplash IDs kept resolving to wrong content
          (foot reflexology instead of singing bowls, fitness yoga
          instead of serene space, broken 404 URLs). Icons + soft
          gradients are zero-risk visually + match the ethereal brand
          aesthetic better than literal stock photos anyway. Swap to
          real photos from Pratima's space when she sends them. */}
      <SectionReveal className="relative px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-5">
          {/* Sound + crystal therapy card */}
          <motion.div variants={fadeUp}>
            <div
              className="relative rounded-3xl overflow-hidden h-72 md:h-[420px] flex flex-col justify-end p-8 md:p-10"
              style={{
                background: `linear-gradient(135deg, ${ROSE} 0%, ${LAVENDER} 60%, ${GOLD} 100%)`,
                boxShadow: "0 8px 24px rgba(200, 134, 126, 0.20)",
              }}
            >
              {/* Decorative concentric rings — sound waves */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-white"
                    style={{
                      width: 120 + i * 60,
                      height: 120 + i * 60,
                    }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              {/* Center icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <WaveSine size={56} weight="duotone" className="text-white" style={{ opacity: 0.95 }} />
              </div>
              {/* Caption */}
              <div className="relative z-10">
                <p
                  className="text-xs uppercase tracking-[0.25em] font-bold mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  Sound + crystal therapy
                </p>
                <p
                  className="text-white text-xl md:text-2xl font-semibold leading-snug"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  The bowls do half the work — they bypass thinking entirely.
                </p>
              </div>
            </div>
          </motion.div>

          {/* After the session card */}
          <motion.div variants={fadeUp}>
            <div
              className="relative rounded-3xl overflow-hidden h-72 md:h-[420px] flex flex-col justify-end p-8 md:p-10"
              style={{
                background: `linear-gradient(135deg, ${LAVENDER} 0%, ${SAGE} 60%, ${ROSE} 100%)`,
                boxShadow: "0 8px 24px rgba(155, 139, 181, 0.20)",
              }}
            >
              {/* Decorative breathing circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  className="rounded-full"
                  style={{
                    width: 240,
                    height: 240,
                    background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
                  }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              {/* Center icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <FlowerLotus size={56} weight="duotone" className="text-white" style={{ opacity: 0.95 }} />
              </div>
              {/* Caption */}
              <div className="relative z-10">
                <p
                  className="text-xs uppercase tracking-[0.25em] font-bold mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  After the session
                </p>
                <p
                  className="text-white text-xl md:text-2xl font-semibold leading-snug"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Most people walk out lighter than they&apos;ve been in months.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionReveal id="stories" className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: ROSE_DEEP }}>
              Stories from the table
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              The work, in their words.
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Names withheld for privacy. Outcomes are real.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <motion.div key={t.name + t.role} variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col">
                  <Quotes size={26} weight="fill" style={{ color: ROSE }} className="mb-3 opacity-70" />
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: INK }}>
                    {t.text}
                  </p>
                  <div className="pt-4 border-t" style={{ borderColor: "rgba(200, 134, 126, 0.15)" }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} weight="fill" style={{ color: GOLD }} />
                      ))}
                    </div>
                    <p className="font-bold text-sm" style={{ color: INK }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: INK_SOFT }}>
                      {t.role}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <SectionReveal id="faq" className="relative px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: ROSE_DEEP }}>
              Common questions
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Before your first session.
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <Card>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <span className="font-semibold" style={{ color: INK }}>
                        {f.q}
                      </span>
                      <CaretDown
                        size={16}
                        weight="bold"
                        className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                        style={{ color: ROSE_DEEP }}
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
                          <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ── BOOK / CONTACT ───────────────────────────────────────── */}
      <SectionReveal id="book" className="relative px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${ROSE_GLOW}, transparent 70%)`,
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-5"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Ready to begin?{" "}
              <span style={{ color: ROSE_DEEP, fontStyle: "italic" }}>
                Reach out today.
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Whether you&apos;re curious, skeptical, or already deep in the work — call, text,
              or email. I personally respond within one business day.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-8">
            <InquiryForm
              slug="ps-reiki"
              accent={ROSE}
              accentDeep={ROSE_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              serif="Georgia, serif"
              submitLabel="Request my session"
              successHeading="You're on the list."
              successBody="Pratima will personally reach out within one business day to confirm your time and answer any questions before your first session."
              fields={[
                { type: "text", name: "name", label: "Your name *", placeholder: "First and last name", required: true },
                { type: "email", name: "email", label: "Email *", placeholder: "you@example.com", required: true },
                { type: "tel", name: "phone", label: "Phone (optional)", placeholder: "(703) 555-0123" },
                {
                  type: "select",
                  name: "session_type",
                  label: "Which session interests you?",
                  options: [
                    { value: "initial-90", label: "Initial Chakra Energy Balancing & Consultation (90 min)" },
                    { value: "standard-60", label: "Reiki Healing Session (60 min)" },
                    { value: "children-45", label: "Reiki for Children (45 min)" },
                    { value: "distance-60", label: "Distance Healing Session (60 min)" },
                    { value: "not-sure", label: "Not sure yet — help me pick" },
                  ],
                },
                { type: "text", name: "preferred_dates", label: "Preferred date(s) or days of week", placeholder: "e.g. Saturdays, or week of June 10" },
                {
                  type: "textarea",
                  name: "what_brings_you",
                  label: "What brings you in? (optional)",
                  placeholder: "Anxiety, chronic pain, curiosity, supporting a recovery — whatever you're comfortable sharing.",
                  rows: 3,
                },
              ]}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="text-center text-sm mb-8" style={{ color: INK_SOFT }}>
            Prefer to skip the form?{" "}
            <a href="tel:7039578371" className="font-semibold underline" style={{ color: ROSE_DEEP }}>
              Call (703) 957-8371
            </a>{" "}
            or{" "}
            <a href="mailto:pratima.reiki@gmail.com" className="font-semibold underline" style={{ color: ROSE_DEEP }}>
              email Pratima directly
            </a>
            .
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <MapPin size={20} weight="duotone" style={{ color: ROSE_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Location</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  Northern Virginia<br />By appointment · Address shared at booking
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <Clock size={20} weight="duotone" style={{ color: ROSE_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Hours</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  By appointment<br />Tues–Sat · Distance sessions worldwide
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <Sparkle size={20} weight="duotone" style={{ color: ROSE_DEEP }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Connect</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <a
                    href="https://instagram.com/ps_reiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: ROSE_DEEP }}
                  >
                    <InstagramLogo size={18} weight="duotone" />
                  </a>
                  <a
                    href="https://facebook.com/psreiki1"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: ROSE_DEEP }}
                  >
                    <FacebookLogo size={18} weight="duotone" />
                  </a>
                  <span className="text-xs" style={{ color: INK_SOFT }}>
                    @ps_reiki
                  </span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 border-t"
        style={{ borderColor: "rgba(200, 134, 126, 0.12)", background: BG }}
      >
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: INK_SOFT }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${ROSE} 0%, ${LAVENDER} 100%)`,
              }}
            >
              <FlowerLotus size={14} weight="duotone" className="text-white" />
            </div>
            <span className="font-semibold" style={{ color: INK, fontFamily: "Georgia, serif" }}>
              PS Reiki · Pratima
            </span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} · Energy Healing for Mind, Body & Soul · Northern Virginia
          </p>
        </div>
      </footer>
    </main>
  );
}
