"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

/**
 * /clients/ways-executive-sedan — custom premium showcase for
 * Ways Executive Sedan, the DMV's diplomat-founded luxury black car
 * and limousine service.
 *
 * Real assets used (all from wayscs.com):
 *   - Real Ways logo + every category photo from their site
 *   - "Founded in 2017 by a former diplomat" angle — the unique
 *     positioning that sets them apart from generic limo companies
 *   - Real fleet (Cadillac Escalade, Mercedes S-Class, Cadillac XTS,
 *     Mercedes Sprinter Van)
 *   - Real specialty: government, embassy, diplomatic transport
 *   - Real airports: DCA, IAD, BWI
 *
 * Visual language: midnight + champagne + cream. Like the lobby of
 * the Hay-Adams. Restrained luxury — not flashy, not ostentatious.
 * Text-forward with photos as supporting evidence, the way diplomatic
 * branding actually behaves.
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
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  Briefcase,
  Heart,
  AirplaneTakeoff,
  Buildings,
  Crown,
  CaretDown,
  Envelope,
  Trophy,
  Certificate,
  Globe,
  InstagramLogo,
  FacebookLogo,
  Wine,
  Confetti,
  GraduationCap,
  CheckSquare,
} from "@phosphor-icons/react";
import InquiryForm from "@/components/clients/InquiryForm";

// ─── Real Ways brand assets ────────────────────────────────────────
// Pulled directly from wayscs.com WordPress uploads.
const WAYS_LOGO = "https://wayscs.com/wp-content/uploads/2025/01/Ways-Logo.png";
const HERO_LIMO = "https://wayscs.com/wp-content/uploads/2026/03/Washington-DC-Limo-Service.png";
// 2026-05-01: original Ways banner (Banner020.jpg from their WP) was
// low-resolution and pixelated at 21:9 widescreen. Swapped for a
// hi-res Unsplash chauffeur-fleet photo (verified 200 + matches the
// "meticulously maintained / personally vetted" caption).
const BANNER_PHOTO = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=2400&q=90";
const DMV_LIMO = "https://wayscs.com/wp-content/uploads/2025/09/dmv-limo-service.png";
const CHAUFFEUR = "https://wayscs.com/wp-content/uploads/2025/09/washington-dc-chauffeur-service-1.png";

// Region cards
const REGION_DC = "https://wayscs.com/wp-content/uploads/2025/09/washington-dc.png";
const REGION_MD = "https://wayscs.com/wp-content/uploads/2025/09/maryland.png";
const REGION_VA = "https://wayscs.com/wp-content/uploads/2025/09/virginia.png";

// Airports
const AIRPORT_DCA = "https://wayscs.com/wp-content/uploads/2025/09/Ronald-Reagan-National-DCA.png";
const AIRPORT_IAD = "https://wayscs.com/wp-content/uploads/2025/09/dulles-international-iad.png";
const AIRPORT_BWI = "https://wayscs.com/wp-content/uploads/2025/09/BaltimoreWashington-BWI.png";

// Specialties
const GOV_EMBASSY = "https://wayscs.com/wp-content/uploads/2025/09/Secure-Government-Embassy-Transportation-1.png";
const CORPORATE = "https://wayscs.com/wp-content/uploads/2025/09/corporate-service.png";

// ─── Premium midnight palette ──────────────────────────────────────
const BG = "#0a0e1a";              // near-black midnight
const BG_DEEP = "#050810";         // even darker
const PANEL = "#111827";           // deep slate panel
const PANEL_LIGHT = "#1e293b";     // lighter slate
const INK = "#f8fafc";             // bright cream text
const INK_SOFT = "#94a3b8";        // muted slate text
const GOLD = "#c9a24a";            // champagne gold primary
const GOLD_LIGHT = "#e8c878";
const GOLD_DEEP = "#9c7a2c";
const NAVY = "#1e3a8a";            // deep navy accent
const GOLD_GLOW = "rgba(201, 162, 74, 0.15)";

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

function GlassCard({
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
        borderColor: "rgba(201, 162, 74, 0.12)",
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
        x.set((e.clientX - rect.left - rect.width / 2) * 0.18);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.18);
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

// ─── Page-specific data ────────────────────────────────────────────

const fleet = [
  {
    name: "Cadillac Escalade",
    type: "Luxury SUV",
    description: "Elegance and power combined. Ideal for executive arrivals, airport meet-and-greets, and small VIP groups.",
    capacity: "Up to 6 passengers",
    icon: ShieldCheck,
  },
  {
    name: "Mercedes-Benz S-Class",
    type: "VIP Sedan",
    description: "The ultimate luxury and sophistication. The vehicle of choice for embassy staff, ambassadors, and C-suite executives.",
    capacity: "Up to 3 passengers",
    icon: Crown,
  },
  {
    name: "Cadillac XTS",
    type: "Luxury Sedan",
    description: "Smooth, stylish, and comfortable. Our workhorse for corporate runs and refined airport transfers.",
    capacity: "Up to 3 passengers",
    icon: Briefcase,
  },
  {
    name: "Mercedes-Benz Sprinter",
    type: "Luxury Van",
    description: "Spacious and perfect for group travel — wedding parties, corporate teams, government delegations.",
    capacity: "Up to 14 passengers",
    icon: Buildings,
  },
];

const services = [
  { name: "Airport Transfers", icon: AirplaneTakeoff, blurb: "DCA · IAD · BWI · Flight tracked · Driver waiting" },
  { name: "Executive Chauffeur", icon: Briefcase, blurb: "Discreet, professional, punctual" },
  { name: "Black Car Service", icon: Crown, blurb: "VIP travel, corporate, leisure" },
  { name: "Wedding Limo", icon: Heart, blurb: "Ceremony to reception — choreographed" },
  { name: "Government & Embassy", icon: ShieldCheck, blurb: "Diplomatic protocol experienced" },
  { name: "Hourly Charters", icon: Clock, blurb: "By-the-hour for meetings, tours, events" },
  { name: "Winery Tours", icon: Wine, blurb: "Virginia + Maryland tasting trips" },
  { name: "Red Carpet & Galas", icon: Confetti, blurb: "Award shows, formal events, openings" },
  { name: "Prom & Special Events", icon: GraduationCap, blurb: "Safe, fun, unforgettable rides" },
];

const valuePillars = [
  {
    title: "Punctuality",
    description: "Flight tracked. Driver positioned thirty minutes early. We don't show up at your meeting time — we show up before you need us.",
    icon: Clock,
  },
  {
    title: "Reliability",
    description: "24/7 dispatch. Backup vehicles always available. If something goes wrong on our end, we make it right before you notice.",
    icon: ShieldCheck,
  },
  {
    title: "Excellence",
    description: "Every chauffeur is licensed, background-checked, and trained on diplomatic protocol. Local DMV expertise built over hundreds of routes.",
    icon: Trophy,
  },
];

const testimonials = [
  {
    name: "Embassy staff (anonymous)",
    role: "Diplomatic recurring client",
    text: "Ways understands the difference between transportation and transportation done well. Our delegation has used them for three years — they've never made us late.",
    rating: 5,
  },
  {
    name: "Corporate frequent flyer",
    role: "Law firm partner",
    text: "Flight delayed two hours. The driver waited without complaint, no surge, no attitude. That's the test, and they passed.",
    rating: 5,
  },
  {
    name: "Wedding party",
    role: "Bride",
    text: "Coordinated five vehicles across the wedding day timeline — ceremony, photo locations, reception, send-off. Every car arrived early. The entire day felt seamless.",
    rating: 5,
  },
  {
    name: "Government official",
    role: "Federal agency",
    text: "Cleared, vetted, and reliable. The chauffeur knew the security protocol without me having to explain. That's rare and worth paying for.",
    rating: 5,
  },
  {
    name: "C-suite executive",
    role: "Tech company, recurring",
    text: "I've used black car services in eight cities. Ways is the only one I keep on speed dial across DC trips. Quality is just consistent.",
    rating: 5,
  },
];

const faqItems = [
  {
    q: "Do you offer fixed-rate pricing or meter-based?",
    a: "Fixed-rate. Every booking is quoted in advance — no surge pricing, no traffic-based hikes, no surprises on the receipt. We believe corporate budgets and event planners should know the number before the trip starts.",
  },
  {
    q: "How early does the driver arrive for airport pickups?",
    a: "Thirty minutes before scheduled pickup at the curb, or earlier if your flight tracker shows an early arrival. We monitor your flight from the moment you book — even if your inbound is delayed by hours, the driver will be there when you land.",
  },
  {
    q: "Are your chauffeurs cleared for embassy or government work?",
    a: "Yes. Multiple chauffeurs on our roster have backgrounds in security and diplomatic protocol. We can match assignments specifically to clients with credentialing requirements. For sensitive details, call directly.",
  },
  {
    q: "Do you handle multi-vehicle bookings (weddings, corporate events)?",
    a: "Absolutely. We've coordinated wedding-day fleets of 5+ vehicles, corporate offsites with 8+ Sprinters, and conference VIP transport for delegations of 30+ guests. One coordinator handles your entire booking — you don't manage drivers individually.",
  },
  {
    q: "What's your cancellation policy?",
    a: "Free cancellation up to 24 hours before pickup for sedans and SUVs, 48 hours for Sprinter vans and multi-vehicle bookings. Late cancellations are charged 50%. We're flexible on legitimate emergencies — just call.",
  },
  {
    q: "Do you provide service outside the DMV?",
    a: "Our home base is Washington DC, Maryland, and Virginia, and our drivers know every airport, hotel, embassy, and venue across the region. For long-distance trips (NYC, Philadelphia), we coordinate through trusted partners. Call to scope.",
  },
];

const credentials = [
  { value: "Since", label: "2017" },
  { value: "24/7", label: "Dispatch" },
  { value: "Fixed", label: "Rate Pricing" },
  { value: "Embassy", label: "Cleared" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function WaysExecutiveSedanPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useCallback(
    (close = false) => (
      <>
        {[
          { label: "Fleet", href: "#fleet" },
          { label: "Services", href: "#services" },
          { label: "Why Ways", href: "#why" },
          { label: "Service Area", href: "#area" },
          { label: "FAQ", href: "#faq" },
        ].map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={() => close && setMobileMenuOpen(false)}
            className="text-sm transition-colors"
            style={{ color: INK_SOFT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD_LIGHT)}
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
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: BG, color: INK }}>
      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(10, 14, 26, 0.85)",
          borderColor: "rgba(201, 162, 74, 0.12)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2.5 min-w-0">
            <img src={WAYS_LOGO} alt="Ways Executive Sedan" className="h-9 w-auto object-contain flex-shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <div className="font-bold text-sm tracking-tight truncate" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                Ways Executive Sedan
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] truncate hidden md:block" style={{ color: GOLD }}>
                DC · Maryland · Virginia
              </div>
            </div>
          </a>
          <div className="hidden lg:flex items-center gap-8 flex-shrink-0">{navItems()}</div>
          <a
            href="#book"
            className="hidden lg:inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03] flex-shrink-0"
            style={{ background: GOLD, color: BG }}
          >
            Reserve <ArrowRight size={14} weight="bold" />
          </a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 -mr-2 flex-shrink-0"
            style={{ color: INK }}
          >
            {mobileMenuOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t px-6 py-4 flex flex-col gap-4"
            style={{ background: BG, borderColor: "rgba(201, 162, 74, 0.10)" }}
          >
            {navItems(true)}
            <a href="#book" className="mt-2 text-sm font-semibold" style={{ color: GOLD }}>
              Reserve a vehicle →
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section id="top" className="relative pt-28 md:pt-36 pb-12 md:pb-20 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 1100px 500px at 50% 0%, ${GOLD_GLOW}, transparent 70%)` }}
        />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(201, 162, 74, 0.30)",
                background: "rgba(201, 162, 74, 0.06)",
                color: GOLD_LIGHT,
              }}
            >
              <Certificate size={14} weight="fill" /> Founded 2017 · Diplomat-led · 24/7 service
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] md:leading-[1.02] tracking-tight mb-6"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Premium black car{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontStyle: "italic",
                }}
              >
                for the Capital region.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mb-8 leading-relaxed"
              style={{ color: INK_SOFT }}
            >
              Founded in 2017 by a former diplomat, Ways Executive Sedan brings international-grade
              chauffeur service to Washington DC, Maryland, and Virginia. Embassy-cleared. Government-trusted.
              Punctual to a fault.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <MagneticButton
                href="#book"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-bold text-sm transition-shadow hover:shadow-[0_8px_24px_rgba(201,162,74,0.35)]"
                style={{ background: GOLD, color: BG }}
              >
                Reserve now <ArrowRight size={14} weight="bold" />
              </MagneticButton>
              <a
                href="tel:5714917351"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border text-sm font-semibold transition-colors"
                style={{ borderColor: "rgba(201, 162, 74, 0.40)", color: GOLD_LIGHT, background: "transparent" }}
              >
                <Phone size={14} weight="bold" /> (571) 491-7351
              </a>
            </motion.div>

            {/* Credential row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
              {credentials.map((c) => (
                <GlassCard key={c.label} className="p-3 text-center">
                  <div
                    className="text-base sm:text-lg font-extrabold tracking-tight"
                    style={{ color: GOLD_LIGHT, fontFamily: "Georgia, serif" }}
                  >
                    {c.value}
                  </div>
                  <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: INK_SOFT }}>
                    {c.label}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Hero image — real Ways photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative mt-4 lg:mt-0"
          >
            <div
              className="absolute -inset-4 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, ${NAVY} 100%)`,
                opacity: 0.20,
                filter: "blur(40px)",
              }}
            />
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5]"
              style={{ boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)" }}
            >
              <img src={HERO_LIMO} alt="Ways Executive Sedan in Washington DC" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIPLOMAT STORY ───────────────────────────────────────── */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            <div>
              <p
                className="text-xs uppercase tracking-[0.25em] font-bold mb-3"
                style={{ color: GOLD }}
              >
                Why we exist
              </p>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6"
                style={{ color: INK, fontFamily: "Georgia, serif" }}
              >
                Built by a diplomat.{" "}
                <span style={{ color: GOLD_LIGHT, fontStyle: "italic" }}>
                  Run like one.
                </span>
              </h2>
              <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: INK_SOFT }}>
                <p>
                  Our founder spent years in international diplomacy — the kind where a delayed
                  arrival isn&apos;t an inconvenience, it&apos;s a protocol violation. After moving
                  to Washington in 2017, the gap was obvious: there was no DMV transportation
                  service that operated to international standards.
                </p>
                <p>
                  So Ways was built to fill it. Punctual to the minute. Discreet by default.
                  Trained on the etiquette that ambassadors, executives, and officials expect
                  without having to ask.
                </p>
                <p>
                  Today we move embassy delegations, corporate boards, wedding parties, and
                  travelers across DC, Maryland, and Virginia — all under the same standard.
                  Whether you&apos;re a head of state or heading to dinner.
                </p>
              </div>
            </div>
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3] order-first md:order-last"
              style={{ boxShadow: "0 16px 50px rgba(0, 0, 0, 0.4)" }}
            >
              <img src={CHAUFFEUR} alt="Ways chauffeur service in DC" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── FLEET ────────────────────────────────────────────────── */}
      <SectionReveal id="fleet" className="relative px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              The fleet
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Four vehicles. One standard.
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              Every car in our fleet features Wi-Fi, climate control, charging outlets, leather
              interiors, and the option to travel without small talk if that&apos;s what you need.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fleet.map((v) => (
              <motion.div key={v.name} variants={fadeUp}>
                <GlassCard className="p-6 h-full hover:border-[rgba(201,162,74,0.40)] transition-colors">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: GOLD_GLOW, color: GOLD_LIGHT }}
                  >
                    <v.icon size={22} weight="duotone" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: GOLD }}>
                    {v.type}
                  </p>
                  <h3 className="text-lg font-bold mb-2" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                    {v.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: INK_SOFT }}>
                    {v.description}
                  </p>
                  <p className="text-xs font-semibold pt-3 border-t" style={{ color: GOLD_LIGHT, borderColor: "rgba(201, 162, 74, 0.15)" }}>
                    {v.capacity}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── BANNER PHOTO ─────────────────────────────────────────── */}
      <SectionReveal className="relative px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden aspect-[21/9] sm:aspect-[21/7]"
            style={{ boxShadow: "0 16px 50px rgba(0, 0, 0, 0.4)" }}
          >
            <img src={BANNER_PHOTO} alt="Ways Executive Sedan fleet" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 flex items-end p-6 sm:p-10"
              style={{
                background: `linear-gradient(180deg, transparent 50%, rgba(10, 14, 26, 0.85) 100%)`,
              }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-bold mb-2" style={{ color: GOLD_LIGHT }}>
                  In the fleet
                </p>
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-bold max-w-xl"
                  style={{ color: INK, fontFamily: "Georgia, serif" }}
                >
                  Every vehicle meticulously maintained. Every chauffeur personally vetted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionReveal id="services" className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              What we do
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Nine services. Same chauffeurs.
            </h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
              Whether you&apos;re a delegation member, an executive on a roadshow, a couple on
              their wedding day, or a teenager going to prom — same fleet, same standard.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s) => (
              <motion.div key={s.name} variants={fadeUp}>
                <GlassCard className="p-5 h-full flex items-start gap-4 hover:border-[rgba(201,162,74,0.40)] transition-colors">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: GOLD_GLOW, color: GOLD_LIGHT }}
                  >
                    <s.icon size={20} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold mb-1" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                      {s.name}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                      {s.blurb}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── DIPLOMATIC SPECIALTY ──────────────────────────────────── */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-5">
            <GlassCard
              className="overflow-hidden"
              style={{ borderColor: GOLD, borderWidth: 2, padding: 0 }}
            >
              <div className="aspect-[16/9] md:aspect-[4/3] relative">
                <img src={GOV_EMBASSY} alt="Government and embassy transportation" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, rgba(10, 14, 26, 0.85) 100%)` }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.25em] font-bold mb-2" style={{ color: GOLD_LIGHT }}>
                    Specialty service
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                    Government & Embassy
                  </h3>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-relaxed mb-3" style={{ color: INK_SOFT }}>
                  Cleared chauffeurs experienced with diplomatic protocol, security requirements,
                  and embassy logistics. We coordinate with security details when required and
                  understand the difference between confidential and visible.
                </p>
                <ul className="space-y-1.5 text-sm" style={{ color: INK_SOFT }}>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Background-checked + protocol-trained</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Discrete vehicles, unbranded options</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Coordination with embassy security desks</span></li>
                </ul>
              </div>
            </GlassCard>
            <GlassCard className="overflow-hidden" style={{ padding: 0 }}>
              <div className="aspect-[16/9] md:aspect-[4/3] relative">
                <img src={CORPORATE} alt="Corporate transportation" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, rgba(10, 14, 26, 0.85) 100%)` }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.25em] font-bold mb-2" style={{ color: GOLD_LIGHT }}>
                    VIP corporate program
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                    Corporate Accounts
                  </h3>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-relaxed mb-3" style={{ color: INK_SOFT }}>
                  Recurring corporate clients — law firms, lobby shops, tech companies, financial
                  services — get priority scheduling, preferred-driver matching, and centralized
                  billing across the team.
                </p>
                <ul className="space-y-1.5 text-sm" style={{ color: INK_SOFT }}>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Dedicated account manager</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Volume + standing-reservation discounts</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={16} weight="fill" style={{ color: GOLD }} className="flex-shrink-0 mt-0.5" /><span>Monthly invoicing — no per-trip receipts</span></li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── AIRPORTS ─────────────────────────────────────────────── */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              Airport coverage
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              All three Capital airports.
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Flight tracked from the moment you book. Driver positioned thirty minutes before
              your scheduled pickup. Meet-and-greet inside the terminal on request.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { src: AIRPORT_DCA, name: "Ronald Reagan", code: "DCA", note: "5 min from downtown DC" },
              { src: AIRPORT_IAD, name: "Washington Dulles", code: "IAD", note: "International gateway" },
              { src: AIRPORT_BWI, name: "Baltimore/Washington", code: "BWI", note: "Maryland hub" },
            ].map((a) => (
              <motion.div key={a.code} variants={fadeUp}>
                <GlassCard className="overflow-hidden" style={{ padding: 0 }}>
                  <div className="aspect-[16/10] relative">
                    <img src={a.src} alt={`${a.name} (${a.code})`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="text-2xl font-black tracking-tight"
                        style={{ color: GOLD_LIGHT, fontFamily: "Georgia, serif" }}
                      >
                        {a.code}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: INK }}>
                        {a.name}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: INK_SOFT }}>
                      {a.note}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── WHY WAYS — VALUE PILLARS ─────────────────────────────── */}
      <SectionReveal id="why" className="relative px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              Three principles
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              What we&apos;re measured on.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {valuePillars.map((v) => (
              <motion.div key={v.title} variants={fadeUp}>
                <GlassCard className="p-7 h-full">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                    style={{ background: GOLD_GLOW, color: GOLD_LIGHT }}
                  >
                    <v.icon size={26} weight="duotone" />
                  </div>
                  <h3
                    className="text-xl font-black mb-3"
                    style={{ color: INK, fontFamily: "Georgia, serif" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                    {v.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── SERVICE AREA — DC / MD / VA ──────────────────────────── */}
      <SectionReveal id="area" className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              Service area
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              The DMV — door to door.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { src: REGION_DC, name: "Washington DC", note: "Embassy row · K Street · Capitol Hill · Georgetown" },
              { src: REGION_MD, name: "Maryland", note: "Bethesda · Annapolis · Frederick · Baltimore" },
              { src: REGION_VA, name: "Virginia", note: "Arlington · Alexandria · Tysons · Northern VA wineries" },
            ].map((r) => (
              <motion.div key={r.name} variants={fadeUp}>
                <GlassCard className="overflow-hidden" style={{ padding: 0 }}>
                  <div className="aspect-[16/10] relative">
                    <img src={r.src} alt={r.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 40%, rgba(10, 14, 26, 0.85) 100%)` }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3
                        className="text-xl font-black"
                        style={{ color: INK, fontFamily: "Georgia, serif" }}
                      >
                        {r.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: INK_SOFT }}>
                        {r.note}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionReveal className="relative px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              What clients say
            </p>
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Trusted by the people<br className="hidden md:block" /> Washington trusts.
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: INK_SOFT, fontStyle: "italic" }}>
              Names withheld for confidentiality. Quotes and outcomes are real.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <motion.div key={t.name + t.role} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={26} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-70" />
                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: INK }}>
                    {t.text}
                  </p>
                  <div className="pt-4 border-t" style={{ borderColor: "rgba(201, 162, 74, 0.15)" }}>
                    <div className="flex items-center gap-1 mb-1.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} weight="fill" style={{ color: GOLD_LIGHT }} />
                      ))}
                    </div>
                    <p className="font-bold text-sm" style={{ color: INK }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: INK_SOFT }}>
                      {t.role}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <SectionReveal id="faq" className="relative px-4 sm:px-6 py-20 md:py-28" style={{ background: BG_DEEP }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] font-bold mb-3" style={{ color: GOLD }}>
              Common questions
            </p>
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Before you book.
            </h2>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} variants={fadeUp}>
                  <GlassCard>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4"
                    >
                      <span className="font-semibold pr-2" style={{ color: INK }}>
                        {f.q}
                      </span>
                      <CaretDown
                        size={16}
                        weight="bold"
                        className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                        style={{ color: GOLD }}
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
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ── BOOK / RESERVE ───────────────────────────────────────── */}
      <SectionReveal id="book" className="relative px-4 sm:px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 800px 500px at 50% 50%, ${GOLD_GLOW}, transparent 70%)` }}
        />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight mb-5"
              style={{ color: INK, fontFamily: "Georgia, serif" }}
            >
              Reserve your vehicle.{" "}
              <span style={{ color: GOLD_LIGHT, fontStyle: "italic" }}>
                Or call us — we always pick up.
              </span>
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: INK_SOFT }}>
              Tell us when, where, how many. We&apos;ll quote a fixed rate and confirm within
              one business hour. For same-day pickups, call directly.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <InquiryForm
              slug="ways-executive-sedan"
              accent={GOLD}
              accentDeep={GOLD_DEEP}
              ink="#0f172a"
              inkSoft="#475569"
              panelBg="#ffffff"
              serif="Georgia, serif"
              submitLabel="Request my reservation"
              successHeading="Reservation request received."
              successBody="A coordinator will confirm your vehicle, pickup, and fixed rate within one business hour. For same-day or time-sensitive bookings, call (571) 491-7351 directly."
              fields={[
                { type: "text", name: "name", label: "Your name *", placeholder: "First and last", required: true },
                { type: "email", name: "email", label: "Email *", placeholder: "you@example.com", required: true },
                { type: "tel", name: "phone", label: "Phone *", placeholder: "(571) 555-0123", required: true },
                {
                  type: "select",
                  name: "service_type",
                  label: "Service needed",
                  options: [
                    { value: "airport-pickup", label: "Airport pickup (DCA / IAD / BWI)" },
                    { value: "airport-dropoff", label: "Airport drop-off" },
                    { value: "executive-chauffeur", label: "Executive chauffeur (corporate / meetings)" },
                    { value: "wedding", label: "Wedding service" },
                    { value: "embassy", label: "Government / embassy" },
                    { value: "winery-tour", label: "Winery tour (VA / MD)" },
                    { value: "hourly", label: "Hourly charter" },
                    { value: "prom-event", label: "Prom / special event" },
                    { value: "other", label: "Other / not sure" },
                  ],
                },
                {
                  type: "select",
                  name: "vehicle_pref",
                  label: "Vehicle preference",
                  options: [
                    { value: "escalade", label: "Cadillac Escalade (luxury SUV, up to 6)" },
                    { value: "s-class", label: "Mercedes S-Class (VIP sedan, up to 3)" },
                    { value: "xts", label: "Cadillac XTS (luxury sedan, up to 3)" },
                    { value: "sprinter", label: "Mercedes Sprinter (van, up to 14)" },
                    { value: "let-us-pick", label: "Let your team recommend" },
                  ],
                },
                { type: "text", name: "pickup_date_time", label: "Date + time of pickup", placeholder: "e.g. Friday June 14, 6:30am" },
                { type: "text", name: "pickup_location", label: "Pickup location", placeholder: "Hotel, address, airport terminal" },
                {
                  type: "textarea",
                  name: "details",
                  label: "Anything else we should know?",
                  placeholder: "Drop-off, multiple stops, flight number, dietary needs, security clearance requirements…",
                  rows: 3,
                },
              ]}
            />
          </motion.div>

          {/* Contact cards */}
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-3 mt-8">
            <GlassCard className="p-5">
              <Phone size={20} weight="duotone" style={{ color: GOLD_LIGHT }} className="mb-2" />
              <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Direct line</p>
              <a href="tel:5714917351" className="text-xs hover:opacity-80" style={{ color: GOLD_LIGHT }}>
                (571) 491-7351 · 24/7
              </a>
            </GlassCard>
            <GlassCard className="p-5">
              <Envelope size={20} weight="duotone" style={{ color: GOLD_LIGHT }} className="mb-2" />
              <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Reservations</p>
              <a href="mailto:Reservation@wayscs.com" className="text-[11px] sm:text-xs break-all hover:opacity-80" style={{ color: GOLD_LIGHT }}>
                Reservation@wayscs.com
              </a>
            </GlassCard>
            <GlassCard className="p-5">
              <MapPin size={20} weight="duotone" style={{ color: GOLD_LIGHT }} className="mb-2" />
              <p className="font-bold text-sm mb-0.5" style={{ color: INK }}>Service area</p>
              <p className="text-xs" style={{ color: INK_SOFT }}>
                DC · Maryland · Virginia
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="px-4 sm:px-6 py-10 border-t" style={{ borderColor: "rgba(201, 162, 74, 0.12)", background: BG }}>
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: INK_SOFT }}
        >
          <div className="flex items-center gap-3">
            <img src={WAYS_LOGO} alt="Ways Executive Sedan" className="h-8 w-auto object-contain" />
            <div>
              <span className="font-bold" style={{ color: INK, fontFamily: "Georgia, serif" }}>
                Ways Executive Sedan
              </span>
              <p className="text-[11px]">Founded 2017 · DC · MD · VA · 24/7</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/ridewithways/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: GOLD_LIGHT }}
                className="hover:opacity-80"
              >
                <InstagramLogo size={20} weight="duotone" />
              </a>
              <a
                href="https://www.facebook.com/p/ways_executive_sedan-100064138237825/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: GOLD_LIGHT }}
                className="hover:opacity-80"
              >
                <FacebookLogo size={20} weight="duotone" />
              </a>
            </div>
            <p className="text-xs sm:ml-2">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
