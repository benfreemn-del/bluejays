"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/tacos-yum — custom one-off premium showcase for Tacos Yum.
 *
 * IMPORTANT: tacosyum.com is currently offline (ECONNREFUSED at build
 * time). Only signal I had was the audit-submission email
 * bobstaco@tacosyum.com — so "Bob" is treated as the owner/chef.
 *
 * Everything below — menu items, prices, photos, testimonials, hours,
 * address — is REALISTIC PLACEHOLDER content built for the premium
 * showcase quality bar. It must be replaced with Bob's actual content
 * before this page goes to him as a live preview-to-pay site. Look for
 * the "// REPLACE WITH:" comments throughout marking every spot that
 * needs swapping.
 *
 * Visual language: warm Mexican-inspired but modern. Terra cotta + deep
 * red + cream + gold. Bold-as-a-taco hero, food-photography-driven
 * gallery, menu organized by category, late-night vibe in the
 * footer. NOT kitschy — confident and appetite-cuing.
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
  Phone,
  Envelope,
  MapPin,
  Clock,
  Fire,
  Pepper,
  Leaf,
  CookingPot,
  ForkKnife,
  ShoppingBag,
  Truck,
  Users,
  CaretDown,
  InstagramLogo,
  FacebookLogo,
  Sparkle,
  Coffee,
} from "@phosphor-icons/react";

// ─── Stock food photography ────────────────────────────────────────
// REPLACE WITH: Bob's real photos of his actual tacos, his shop, his
// staff, his trompo. Until then, these high-quality Unsplash food
// shots set the visual tone. All checked against image-validator.
const HERO_TACOS_TOP = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1800&q=85";  // hero — colorful tacos overhead
const TACOS_PLATTER = "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=85";   // street tacos plate
const CARNE_ASADA = "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&q=85";        // carne asada close-up
const SINGLE_TACO = "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&q=85";    // single taco macro
const SALSA_TRIO = "https://images.unsplash.com/photo-1542528180-a1208c5169a5?w=1200&q=85";     // salsas / sides (replaced 2026-05-01: original 1576367035905 was 404)
const RESTAURANT_INT = "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=1600&q=85"; // restaurant interior
const HANDS_TORTILLAS = "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=1200&q=85"; // making tortillas
// (BURRITO const removed 2026-05-01: was 404 + unused in render anyway)

// ─── Warm Mexican-inspired palette ─────────────────────────────────
const BG = "#fef9f3";              // warm cream
const BG_DEEP = "#f5e8d4";         // sandy cream
const PANEL = "#ffffff";
const INK = "#2a1810";             // deep coffee-brown
const INK_SOFT = "#6b4a3a";         // muted brown
const RED = "#c8362d";              // chili red — primary
const RED_DEEP = "#9a2820";
const TERRACOTTA = "#d97742";       // terra cotta secondary
const GOLD = "#d4a64f";             // warm gold accent
const GREEN = "#558b6e";             // cilantro / lime green
const RED_GLOW = "rgba(200, 54, 45, 0.10)";

const spring = { type: "spring" as const, stiffness: 100, damping: 22 };
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
};

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
      className={`rounded-2xl border transition-all ${className}`}
      style={{
        background: PANEL,
        borderColor: "rgba(200, 54, 45, 0.12)",
        boxShadow: "0 1px 3px rgba(42, 24, 16, 0.04)",
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

// ─── Menu data ─────────────────────────────────────────────────────
// REPLACE WITH: Bob's actual menu — names, descriptions, prices.
// These follow the "real Mexican street-taco-spot" archetype.

const menuTacos = [
  { name: "Carne Asada", description: "Marinated grilled steak, hand-pressed corn tortilla, cilantro, onion, salsa verde", price: "4.50", icon: Fire, badge: "Most ordered" },
  { name: "Al Pastor", description: "Trompo-cooked pork with pineapple, onion, salsa roja", price: "4.50", icon: Fire, badge: "Trompo daily" },
  { name: "Pollo Asado", description: "Citrus-marinated chicken, charred and squeezed with lime", price: "4.25", icon: Fire },
  { name: "Carnitas", description: "Slow-braised pork shoulder, crispy edges, fresh salsa", price: "4.50", icon: Fire },
  { name: "Lengua", description: "Tender braised beef tongue. The taco the chefs order. Trust us.", price: "4.75", icon: Fire, badge: "Chef's pick" },
  { name: "Roasted Veggie", description: "Charred poblano, corn, black beans, queso fresco — the vegetarian taco that doesn't apologize", price: "4.25", icon: Leaf, badge: "Veg" },
  { name: "Camarón", description: "Garlic-lime grilled shrimp, slaw, chipotle crema", price: "5.50", icon: Pepper, badge: "Friday fresh" },
  { name: "Birria", description: "Slow-cooked beef in adobo, dipped in consomé. Saturday + Sunday only.", price: "5.25", icon: Fire, badge: "Weekends" },
];

const menuBowlsBurritos = [
  { name: "Build-Your-Own Burrito", description: "Choose your protein, beans, rice, salsas, and toppings. We don't cut corners on size.", price: "11.50" },
  { name: "Power Bowl", description: "Same fillings as the burrito but in a bowl with extra greens. Macros without the work.", price: "11.50" },
  { name: "Quesabirria", description: "Cheesy birria tacos with consomé for dipping. Three for $12.50.", price: "12.50" },
  { name: "Sopes (3)", description: "Hand-pressed thick masa cups loaded with beans, protein, lettuce, queso fresco, crema", price: "10.50" },
];

const menuSidesAndDrinks = [
  { name: "Chips + Salsa Trio", description: "Mild verde · medium roja · habanero (it's hot)", price: "5.00", icon: Pepper },
  { name: "Esquites", description: "Cup of charred corn, lime, mayo, cotija, Tajín. Order two.", price: "5.50", icon: CookingPot },
  { name: "Guacamole", description: "Made when you order it. Real avocados, real lime, real cilantro.", price: "6.00", icon: Leaf },
  { name: "Mexican Coke", description: "Glass bottle, real cane sugar", price: "3.50", icon: Coffee },
  { name: "Horchata (housemade)", description: "Cinnamon rice milk. Pairs with everything spicy.", price: "4.00", icon: Coffee },
  { name: "Jarritos", description: "Tamarindo · Mandarina · Limón · Sandía · Toronja", price: "3.50", icon: Coffee },
];

const credentials = [
  { value: "Hand-pressed", label: "Tortillas" },
  { value: "Made-to-order", label: "Every Taco" },
  { value: "Trompo", label: "Daily" },
  { value: "Late", label: "'til 11pm" },
];

const testimonials = [
  {
    name: "Local regular",
    role: "Lunch every Tuesday",
    text: "Best al pastor I've had outside Mexico City. The trompo is the real deal — you can smell it from the parking lot. I plan my week around Tuesdays now.",
    rating: 5,
  },
  {
    name: "First-timer",
    role: "Walked in for lunch",
    text: "Showed up for one taco. Came back four hours later for dinner. That should tell you everything. The lengua is the move.",
    rating: 5,
  },
  {
    name: "Catering client",
    role: "Office launch event",
    text: "Catered our 80-person team launch. Bob set up the trompo on-site and people were filming it. The tacos disappeared faster than the announcements.",
    rating: 5,
  },
  {
    name: "Late-night customer",
    role: "After-shift regular",
    text: "I work nights. They're open till 11. The carnitas at 10:30pm after a 12-hour shift is what makes this town worth living in.",
    rating: 5,
  },
  {
    name: "Vegetarian critic",
    role: "Skeptic-turned-believer",
    text: "I'm always nervous ordering the veg option at a taco place. The roasted veggie taco here is genuinely good — not just \"good for vegetarian.\" Just good, period.",
    rating: 5,
  },
];

const faqItems = [
  {
    q: "Do you take reservations?",
    a: "Walk-ins only for the dining room. We move fast — even when there's a line, you'll usually be eating in under 10 minutes. For groups of 10+ or full-restaurant events, call us at the number below to plan ahead.",
  },
  {
    q: "Do you cater?",
    a: "Yes — and we bring the trompo. Office launches, weddings, backyard parties, late-night film shoots. We do taco bars from 20 people up to 200+. Pricing scales by headcount and protein selection. Call to scope.",
  },
  {
    q: "Are the tortillas really hand-pressed?",
    a: "Every corn tortilla is hand-pressed when you order. We mill our masa fresh in the morning. Flour tortillas (for burritos) come from a local tortilleria we trust — we'd rather buy excellent than make mediocre.",
  },
  {
    q: "How spicy is your habanero salsa?",
    a: "Hot. Like, ask-for-water hot. Our medium roja is most people's spicy threshold. The habanero is for capsaicin enthusiasts. We don't gatekeep but we will warn you.",
  },
  {
    q: "Are you celiac-safe?",
    a: "Most of our food is naturally gluten-free (corn tortillas, all proteins, salsas, bowls). Cross-contamination is our only risk — the kitchen handles flour tortillas at the same surfaces. Tell us at the counter and we'll change gloves and prep your order on a clean board.",
  },
  {
    q: "Do you deliver?",
    a: "Through DoorDash, Uber Eats, and Grubhub. Pickup is faster and we like seeing your face — but if delivery is what fits your day, we get it. Same kitchen, same quality.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function TacosYumPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"tacos" | "bowls" | "sides">("tacos");

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "Menu", href: "#menu" },
          { label: "About", href: "#about" },
          { label: "Catering", href: "#catering" },
          { label: "Reviews", href: "#reviews" },
          { label: "Visit", href: "#visit" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-sm transition-colors"
            style={{ color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = RED)}
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
        style={{ background: "rgba(254, 249, 243, 0.92)", borderColor: "rgba(200, 54, 45, 0.10)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
              style={{ background: `linear-gradient(135deg, ${RED} 0%, ${TERRACOTTA} 100%)` }}
            >
              🌮
            </div>
            <div>
              <div className="font-black text-base tracking-tight" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                Tacos Yum
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: RED }}>
                Tacos worth driving for
              </div>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-8">{navItems()}</div>
          <a
            href="#order"
            className="hidden md:inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03]"
            style={{ background: RED, color: "white" }}
          >
            Order ahead <ArrowRight size={14} weight="bold" />
          </a>
          <button onClick={() => setMobileMenuOpen((v) => !v)} className="md:hidden p-2 -mr-2" style={{ color: INK }}>
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ background: BG, borderColor: "rgba(200, 54, 45, 0.10)" }}>
            {navItems(true)}
            <a href="#order" className="mt-2 text-sm font-semibold" style={{ color: RED }}>
              Order ahead →
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section id="top" className="relative pt-28 md:pt-36 pb-12 md:pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 1100px 600px at 50% 0%, ${RED_GLOW}, transparent 70%)` }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: "rgba(200, 54, 45, 0.30)", background: "rgba(200, 54, 45, 0.06)", color: RED }}
            >
              <Fire size={14} weight="fill" /> Hand-pressed · Made-to-order · Open late
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Tacos worth{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${RED_DEEP} 0%, ${TERRACOTTA} 50%, ${GOLD} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                driving for.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl max-w-xl mb-9 leading-relaxed"
              style={{ color: INK_SOFT }}
            >
              Real ingredients. Bold flavor. Made fast. From the trompo we cook al pastor on
              every day to the corn tortillas we press by hand for every order — this is
              the taco shop your town has been waiting for.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <MagneticButton
                href="#menu"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_8px_24px_rgba(200,54,45,0.30)]"
                style={{ background: RED, color: "white" }}
              >
                See the menu <ArrowRight size={14} weight="bold" />
              </MagneticButton>
              <a
                href="#order"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border text-sm font-semibold transition-colors"
                style={{ borderColor: RED, color: RED, background: "transparent" }}
              >
                Order ahead
              </a>
            </motion.div>

            {/* Credential row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
              {credentials.map((c) => (
                <Card key={c.label} className="p-3 text-center">
                  <div className="text-base md:text-lg font-extrabold tracking-tight" style={{ color: RED, fontFamily: "Georgia, serif" }}>
                    {c.value}
                  </div>
                  <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: INK_SOFT }}>
                    {c.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Hero food shot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            <div
              className="absolute -inset-4 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${RED} 0%, ${TERRACOTTA} 100%)`,
                opacity: 0.18,
                filter: "blur(40px)",
              }}
            />
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/5]"
              style={{ boxShadow: "0 24px 60px rgba(200, 54, 45, 0.25)" }}
            >
              <img
                src={HERO_TACOS_TOP}
                alt="A spread of street tacos — the kind you're about to eat"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT / OWNER STORY ──────────────────────────────────── */}
      <SectionReveal id="about" className="relative px-6 py-20 md:py-24" style={{ background: BG_DEEP }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
              The shop
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-6"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Built by Bob.{" "}
              <span style={{ color: RED, fontStyle: "italic" }}>Run by hand.</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: INK_SOFT }}>
              {/* REPLACE WITH: Bob's actual backstory — where he learned, why
                  he started Tacos Yum, what he's trying to build. The
                  paragraphs below are realistic placeholder framing that
                  matches the indie-taco-shop archetype. */}
              <p>
                Bob spent fifteen years cooking in restaurants from San Diego to Mexico City
                before he realized the taco he wanted to eat every day didn&apos;t exist where
                he lived. So he built it.
              </p>
              <p>
                The trompo runs every day. The masa gets milled fresh every morning. Salsas
                are made in-house, in small batches, by people who care. Nothing comes out of
                a freezer. Nothing comes off a microwave. Every taco is built when you order
                it — and most of them hit the counter in under five minutes.
              </p>
              <p>
                We&apos;re not the cheapest taco place. We&apos;re the one that takes the
                tortilla seriously and the salsa even more so. Eat one. You&apos;ll
                understand.
              </p>
            </div>
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3]"
              style={{ boxShadow: "0 12px 40px rgba(200, 54, 45, 0.18)" }}
            >
              <img
                src={HANDS_TORTILLAS}
                alt="Tortillas being pressed by hand — what we do every order"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── MENU ─────────────────────────────────────────────────── */}
      <SectionReveal id="menu" className="relative px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
              The menu
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Eight tacos. One philosophy.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Make it how it&apos;s supposed to be made. Don&apos;t cut the corner everyone else cuts.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { key: "tacos" as const, label: "Tacos", icon: Fire },
              { key: "bowls" as const, label: "Bowls + Burritos", icon: ForkKnife },
              { key: "sides" as const, label: "Sides + Drinks", icon: CookingPot },
            ].map((t) => {
              const active = activeMenuTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveMenuTab(t.key)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: active ? RED : "transparent",
                    color: active ? "white" : INK_SOFT,
                    border: `1px solid ${active ? RED : "rgba(200, 54, 45, 0.25)"}`,
                  }}
                >
                  <t.icon size={14} weight="duotone" />
                  {t.label}
                </button>
              );
            })}
          </motion.div>

          {/* Menu items */}
          <div className="grid md:grid-cols-2 gap-3">
            {(activeMenuTab === "tacos" ? menuTacos : activeMenuTab === "bowls" ? menuBowlsBurritos : menuSidesAndDrinks).map(
              (item) => (
                <motion.div key={item.name} variants={fadeUp}>
                  <Card className="p-5 hover:shadow-[0_4px_16px_rgba(200,54,45,0.12)] transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <h3
                          className="text-lg font-bold truncate"
                          style={{ color: INK, fontFamily: "Georgia, serif" }}
                        >
                          {item.name}
                        </h3>
                        {(item as { badge?: string }).badge && (
                          <span
                            className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: GOLD, color: INK }}
                          >
                            {(item as { badge?: string }).badge}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xl font-black tabular-nums whitespace-nowrap"
                        style={{ color: RED, fontFamily: "Georgia, serif" }}
                      >
                        ${item.price}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ),
            )}
          </div>

          <motion.div variants={fadeUp} className="text-center mt-10">
            <p className="text-sm mb-2" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              All tacos served on hand-pressed corn tortillas. Flour tortilla available on request.
            </p>
            <p className="text-xs" style={{ color: INK_SOFT }}>
              Prices are placeholder until Bob confirms — call (xxx) xxx-xxxx to verify before ordering.
            </p>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── PHOTO GALLERY BAND ───────────────────────────────────── */}
      <SectionReveal className="relative px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
              The food
            </p>
            <h2
              className="text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              You eat with your eyes first.
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[TACOS_PLATTER, CARNE_ASADA, SINGLE_TACO, SALSA_TRIO].map((src, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden aspect-square"
                style={{ boxShadow: "0 4px 16px rgba(200, 54, 45, 0.10)" }}
              >
                <img
                  src={src}
                  alt={`Food shot ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── CATERING ─────────────────────────────────────────────── */}
      <SectionReveal id="catering" className="relative px-6 py-20 md:py-24" style={{ background: BG_DEEP }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3]"
              style={{ boxShadow: "0 12px 40px rgba(200, 54, 45, 0.18)" }}
            >
              <img
                src={RESTAURANT_INT}
                alt="The kind of energy a Tacos Yum catering setup brings"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
                Catering
              </p>
              <h2
                className="text-3xl md:text-4xl font-black tracking-tight mb-4"
                style={{ color: INK, fontFamily: "Georgia, serif" }}
              >
                Put the trompo at your event.
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: INK_SOFT }}>
                Office launches, weddings, backyard parties, late-night film shoots —
                we&apos;ll bring the trompo, the tortilla press, and a team that knows how
                to feed 200 people without losing the quality of feeding 4. Watching Bob
                shave al pastor off the trompo is half the experience.
              </p>
              <ul className="space-y-2 mb-7">
                {[
                  "20–200+ headcount",
                  "Trompo on-site (al pastor cooked in front of guests)",
                  "Custom protein selection + dietary accommodations",
                  "All paper goods, salsas, sides included",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm" style={{ color: INK }}>
                    <CheckCircle size={18} weight="fill" style={{ color: GREEN }} className="flex-shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href="#order"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_4px_16px_rgba(200,54,45,0.25)]"
                style={{ background: RED, color: "white" }}
              >
                Get a catering quote <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionReveal id="reviews" className="relative px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
              The locals
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Five stars and lunch-break loyalty.
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Real reviews coming soon — these are anchor placeholders until Google + Yelp populate.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <motion.div key={t.name + t.role} variants={fadeUp}>
                <Card className="p-6 h-full flex flex-col">
                  <Quotes size={26} weight="fill" style={{ color: RED }} className="mb-3 opacity-70" />
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: INK }}>
                    {t.text}
                  </p>
                  <div className="pt-4 border-t" style={{ borderColor: "rgba(200, 54, 45, 0.15)" }}>
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
      <SectionReveal id="faq" className="relative px-6 py-20 md:py-24" style={{ background: BG_DEEP }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: RED }}>
              Common questions
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Before you walk in.
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
                        style={{ color: RED }}
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

      {/* ── VISIT / ORDER ────────────────────────────────────────── */}
      <SectionReveal id="visit" className="relative px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${RED_GLOW}, transparent 70%)` }}
        />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-5"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Pull up.{" "}
              <span style={{ color: RED, fontStyle: "italic" }}>
                We&apos;ll have a taco ready in five.
              </span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Walk in. Order ahead. Have us cater. Whichever fits your day.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} id="order" className="mb-8">
            <InquiryForm
              slug="tacos-yum"
              accent={RED}
              accentDeep={RED_DEEP}
              ink={INK}
              inkSoft={INK_SOFT}
              serif="Georgia, serif"
              submitLabel="Send my inquiry"
              successHeading="Pedido recibido."
              successBody="Bob will get back to you within one business day. For same-day catering or larger group inquiries, you can also call ahead — number on the way."
              fields={[
                {
                  type: "radio",
                  name: "inquiry_type",
                  label: "What are you reaching out about?",
                  required: true,
                  options: [
                    { value: "catering", label: "Catering / event", description: "Trompo on-site, taco bars, 20+ people" },
                    { value: "large-order", label: "Large pickup order", description: "10+ tacos / family-style for a single party" },
                    { value: "general", label: "General question", description: "Hours, menu, allergies, anything else" },
                    { value: "press-collab", label: "Press or collab", description: "Media, partnerships, food bloggers" },
                  ],
                },
                { type: "text", name: "name", label: "Your name *", placeholder: "First and last name", required: true },
                { type: "email", name: "email", label: "Email *", placeholder: "you@example.com", required: true },
                { type: "tel", name: "phone", label: "Phone (preferred for catering)", placeholder: "(555) 555-1234" },
                { type: "text", name: "event_date", label: "Event date (catering only)", placeholder: "e.g. Saturday June 14" },
                { type: "text", name: "headcount", label: "Headcount (catering only)", placeholder: "e.g. 50 guests" },
                {
                  type: "textarea",
                  name: "details",
                  label: "Details",
                  placeholder: "Office launch, wedding rehearsal, dietary needs (vegetarian, gluten-free, etc.), special requests…",
                  rows: 3,
                },
              ]}
            />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <MapPin size={20} weight="duotone" style={{ color: RED }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Address</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  Address pending — Bob will provide<br />Walk-ins + pickup
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <Clock size={20} weight="duotone" style={{ color: RED }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Hours</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  Daily 11am–11pm<br />Birria: weekends only
                </p>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <Truck size={20} weight="duotone" style={{ color: RED }} className="mb-2" />
                <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Delivery</p>
                <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                  DoorDash · Uber Eats · Grubhub<br />Same kitchen, same quality
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 border-t"
        style={{ borderColor: "rgba(200, 54, 45, 0.12)", background: BG }}
      >
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: INK_SOFT }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-base"
              style={{ background: `linear-gradient(135deg, ${RED} 0%, ${TERRACOTTA} 100%)` }}
            >
              🌮
            </div>
            <span className="font-black" style={{ color: INK, fontFamily: "Georgia, serif" }}>
              Tacos Yum
            </span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} · Tacos worth driving for · Open 11am–11pm</p>
        </div>
      </footer>
    </main>
  );
}
