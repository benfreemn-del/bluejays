"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  House,
  MapPin,
  Bed,
  Bathtub,
  ArrowsOutSimple,
  Phone,
  Envelope,
  ArrowRight,
  Buildings,
  ChartLineUp,
  CurrencyDollar,
  Star,
  Calendar,
  User,
  CheckCircle,
  ShieldCheck,
  CaretDown,
  Clock,
  X,
  List,
  Handshake,
  Play,
  Key,
  MagnifyingGlass,
  Target,
  Trophy,
  Scales,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SPRING CONFIGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COLORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BLACK = "#09090b";
const DEFAULT_GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a017";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return { GOLD: c, GOLD_GLOW: `${c}26` };
}

const PALETTE = ["#b8860b", "#0f172a", "#10b981", "#d2b48c", "#475569", "#d4a017"];
const pickPaletteColor = (i: number) => PALETTE[i % PALETTE.length];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SERVICE ICON MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  buy: House,
  sell: CurrencyDollar,
  listing: House,
  market: ChartLineUp,
  invest: ChartLineUp,
  rental: Buildings,
  property: Buildings,
  commercial: Buildings,
  relocation: MapPin,
  staging: House,
  consult: User,
  apprais: CurrencyDollar,
  mortgage: CurrencyDollar,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return House;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STOCK FALLBACK IMAGES (UNIQUE TO REAL ESTATE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STOCK_HERO_POOL = ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80"];
const STOCK_ABOUT_POOL = ["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80"];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GOLD PARTICLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function GoldParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 10,
    size: 1 + Math.random() * 2,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: accent, opacity: p.opacity }}
          animate={{ y: [800, -20], x: [0, Math.sin(p.id) * 30, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LUXURY PATTERN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function LuxuryPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const pid = `luxPatPrev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="40" height="40" fill="none" stroke={accent} strokeWidth="0.3" />
          <line x1="10" y1="10" x2="50" y2="50" stroke={accent} strokeWidth="0.2" />
          <line x1="50" y1="10" x2="10" y2="50" stroke={accent} strokeWidth="0.2" />
          <circle cx="30" cy="30" r="2" fill={accent} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GLASS CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.10] bg-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAGNETIC BUTTON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y, isTouchDevice]);

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  }
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SHIMMER BORDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#09090b] z-10">{children}</div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACCORDION ITEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-zinc-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-zinc-400 leading-relaxed">{answer}</p></motion.div>)}
      </AnimatePresence>
    </GlassCard>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SECTION HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-zinc-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN PREVIEW COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATED SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2RealEstatePreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { GOLD, GOLD_GLOW } = getAccent(data.accentColor);

  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];


  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);


  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);


  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const usedUrls = new Set([heroImage, heroCardImage, aboutImage].filter(Boolean));
  const galleryFromReal = uniquePhotos.slice(3).filter((u) => !usedUrls.has(u));
  const galleryImages =
    galleryFromReal.length >= 4
      ? galleryFromReal.slice(0, 4)
      : [
          ...galleryFromReal,
          ...pickGallery(STOCK_GALLERY, data.businessName).filter(
            (u) => !usedUrls.has(u) && !galleryFromReal.includes(u)
          ),
        ].slice(0, 4);
  const phoneDigits = data.phone.replace(/\D/g, "");

  const processSteps = [
    { step: "01", title: "Consultation", desc: "We sit down to understand your goals, timeline, budget, and dream home vision." },
    { step: "02", title: "Search & Listing Strategy", desc: "Whether buying or selling, we craft a targeted plan to position you for success." },
    { step: "03", title: "Tours & Showings", desc: "We schedule and attend every showing, providing expert insight on each property." },
    { step: "04", title: "Negotiate & Close", desc: "We negotiate aggressively on your behalf and manage every detail through closing." },
    { step: "05", title: "Welcome Home / Sold!", desc: "Keys in hand or sold sign in the yard â€” we celebrate your success together." },
  ];

  const serviceTypeBadges = ["Buying", "Selling", "Investing", "First-Time Buyers", "Luxury Homes", "Relocation"];

  const marketStats = [
    { label: "Average Days on Market", value: "12", icon: Calendar },
    { label: "Homes Sold This Year", value: "50+", icon: Key },
    { label: "Average Sale Price", value: "$650K", icon: CurrencyDollar },
  ];

  const whyChoosePillars = [
    { title: "Local Market Expert", desc: "Deep knowledge of every neighborhood, school district, and market trend in the area.", icon: MagnifyingGlass },
    { title: "Proven Track Record", desc: "Hundreds of successful transactions and a reputation built on results, not promises.", icon: Trophy },
    { title: "Full-Service Support", desc: "From your first showing to closing day and beyond â€” we handle every detail.", icon: Handshake },
    { title: "Negotiation Skills", desc: "We fight for every dollar, ensuring you get the best possible price on your biggest investment.", icon: Scales },
  ];

  const areasWeServe = [
    "Downtown", "Westside", "North Hills", "Lakefront", "Midtown", "Eastview", "Southgate", "Old Town"
  ];

  const comparisonRows = [
    { feature: "Local Market Knowledge", us: true, them: "Limited" },
    { feature: "Full Negotiation Support", us: true, them: "DIY" },
    { feature: "Staging & Prep Advice", us: true, them: "No" },
    { feature: "Inspection Guidance", us: true, them: "No" },
    { feature: "Contract & Legal Review", us: true, them: "Basic" },
    { feature: "After-Close Support", us: true, them: "No" },
    { feature: "Personal Availability", us: true, them: "Call Center" },
  ];

  const quizOptions = [
    { label: "Ready to Buy", desc: "Let us find your dream home in the perfect neighborhood.", icon: House, color: `${GOLD}` },
    { label: "Ready to Sell", desc: "Maximize your sale price with our proven listing strategy.", icon: CurrencyDollar, color: `${GOLD}` },
    { label: "Just Exploring", desc: "Get a free market analysis â€” no pressure, just answers.", icon: MagnifyingGlass, color: `${GOLD}` },
    { label: "Investing", desc: "Discover high-ROI opportunities in today's market.", icon: ChartLineUp, color: `${GOLD}` },
  ];

  const faqs = [
    { q: `What services does ${data.businessName} offer?`, a: `We provide comprehensive real estate services including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Contact us for a personalized consultation.` },
    { q: "Do you work with first-time buyers?", a: "Absolutely. We specialize in guiding first-time buyers through every step of the process, from pre-approval to closing." },
    { q: "How do you determine listing prices?", a: "We conduct thorough comparative market analysis using current sales data, market trends, and property condition to recommend an optimal listing price." },
    { q: "What areas do you serve?", a: `${data.businessName} serves ${data.address} and surrounding communities. Contact us to discuss your specific area.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Jennifer H.", text: "Found our dream home in just two weeks. The process was incredibly smooth and stress-free.", rating: 5 },
    { name: "Michael T.", text: "Sold above asking price in just ten days. Their market knowledge is unmatched.", rating: 5 },
    { name: "Amanda K.", text: "As first-time buyers, they guided us through everything. Patient, knowledgeable, and trustworthy.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "DM Sans, system-ui, sans-serif", background: BLACK, color: "#fff" }}>
      <GoldParticles accent={GOLD} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 1. NAV â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Buildings size={24} weight="bold" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Properties</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Book Viewing
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Properties", href: "#gallery" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 2. HERO â€” CINEMATIC â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury property" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/40" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] uppercase mb-6" style={{ color: GOLD }}>{data.businessName}</p>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
              <div className="h-px w-24 mt-6" style={{ backgroundColor: GOLD }} />
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-lg">
              {(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf('.', 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + '...'; })()}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-xl text-base font-bold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Explore Properties <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-xl text-base font-bold text-zinc-300 border border-white/15 flex items-center gap-2 cursor-pointer hover:border-white/20 transition-colors">
                <Phone size={18} weight="bold" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent z-20" />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 3. STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${GOLD}1a` }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070707 0%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${GOLD}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [House, CurrencyDollar, Calendar, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center p-6 rounded-2xl backdrop-blur-md bg-white/[0.08] border border-white/[0.10]">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: GOLD }} />
                    <span className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: GOLD }}>{stat.value}</span>
                  </div>
                  <span className="text-zinc-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 1: SERVICE TYPE BADGES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 100%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-3">
            {serviceTypeBadges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300 hover:scale-105" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>
                <House size={16} weight="fill" style={{ color: GOLD }} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 2: MARKET STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070707 0%, #09090b 50%, #070707 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Market Insight" title="Local Market Expertise" subtitle={`${data.businessName} delivers results backed by real data and deep local knowledge.`} accent={GOLD} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={stat.label} className="p-8 text-center group hover:border-white/15 transition-all duration-500">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
                    <Icon size={28} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ color: GOLD }}>{stat.value}</p>
                  <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 4. SERVICES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${GOLD}08` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Services" title="How We Serve You" subtitle={`${data.businessName} provides comprehensive real estate expertise for buyers, sellers, and investors.`} accent={GOLD} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              const tile = pickPaletteColor(i);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.07]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${GOLD}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: `${tile}22`, borderColor: `${tile}55` }}>
                        <Icon size={24} weight="duotone" style={{ color: tile }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: `${tile}99` }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: GOLD }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• BEAST MODE: NEIGHBORHOOD SPOTLIGHT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.025} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${GOLD}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Neighborhoods" title={`Explore ${data.city || "Local"} Neighborhoods`} subtitle="Find the perfect community that fits your lifestyle, budget, and vision for the future." accent={GOLD} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Downtown", avgPrice: "$550Kâ€“$850K", vibe: "Walkable urban living with restaurants, nightlife, and culture at your doorstep.", icon: Buildings },
              { name: "Suburbs", avgPrice: "$400Kâ€“$650K", vibe: "Quiet streets, top-rated schools, and spacious lots perfect for growing families.", icon: House },
              { name: "Waterfront", avgPrice: "$750Kâ€“$1.2M", vibe: "Stunning views, premium finishes, and resort-style living year-round.", icon: Key },
              { name: "Family-Friendly", avgPrice: "$350Kâ€“$550K", vibe: "Parks, playgrounds, and community events â€” designed for families that thrive together.", icon: Handshake },
            ].map((hood) => (
              <GlassCard key={hood.name} className="p-7 group hover:border-white/15 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border" style={{ background: `${GOLD}15`, borderColor: `${GOLD}33` }}>
                  <hood.icon size={24} weight="duotone" style={{ color: GOLD }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{hood.name}</h3>
                <p className="text-sm font-semibold mb-3" style={{ color: GOLD }}>{hood.avgPrice}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{hood.vibe}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 5. ABOUT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} /></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 relative">
              <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[4/3]"><img src={aboutImage} alt={`${data.businessName} agent`} className="w-full h-full object-cover" /></div>
              <div className="absolute -bottom-4 right-8 md:-bottom-6 md:right-8">
                <div className="px-6 py-4 rounded-xl backdrop-blur-xl bg-white/[0.08] border border-white/[0.13]">
                  <div className="flex items-center gap-3"><Star size={20} weight="fill" style={{ color: GOLD }} /><div><p className="font-bold text-sm">Top Agent</p><p className="text-xs text-zinc-500">In Your Area</p></div></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Your Agent</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Expert Guidance</h2>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-6">{data.about}</p>
              <div className="flex flex-col gap-3 mb-8">
                {data.stats.slice(0, 3).map((stat, i) => {
                  const icons = [Calendar, CurrencyDollar, User];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={stat.label} className="flex items-center gap-3 text-sm text-zinc-500">
                      <Icon size={16} style={{ color: GOLD }} /><span>{stat.value} {stat.label}</span>
                    </div>
                  );
                })}
              </div>
              <MagneticButton className="px-6 py-3 rounded-xl text-black font-bold" style={{ background: GOLD } as React.CSSProperties}>
                <span className="flex items-center gap-2"><Phone size={16} weight="bold" /> Contact Agent</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 4: WHY CHOOSE THIS AGENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.025} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${GOLD}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Why Us" title="Your Trusted Partner" subtitle="Buying or selling your biggest investment deserves more than an average agent." accent={GOLD} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyChoosePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              const tile = pickPaletteColor(i + 2);
              return (
                <GlassCard key={pillar.title} className="p-7 group hover:border-white/15 transition-all duration-500">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tile}22`, border: `1px solid ${tile}55` }}>
                      <Icon size={28} weight="duotone" style={{ color: tile }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{pillar.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 6. PROCESS (5-step) â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.025} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Process" title="How We Work for You" accent={GOLD} /></AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${GOLD}33, ${GOLD}11)` }} />}
                <GlassCard className="p-6 text-center relative h-full">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black" style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}0a)`, color: GOLD, border: `1px solid ${GOLD}33` }}>{step.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 7. GALLERY â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${GOLD}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Portfolio" title="Featured Properties" accent={GOLD} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Modern Luxury Estate", "Waterfront Retreat", "Contemporary Villa", "Penthouse Living"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.10]">
                  <img src={src} alt={titles[i]} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4"><span className="px-3 py-1 text-xs font-bold rounded-full text-black" style={{ backgroundColor: GOLD }}>Featured</span></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-lg font-bold text-white">{titles[i]}</h3></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 5: AREAS WE SERVE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Coverage" title="Areas We Serve" subtitle={`${data.businessName} knows every neighborhood, every street, every opportunity.`} accent={GOLD} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {areasWeServe.map((area) => (
              <GlassCard key={area} className="p-5 text-center group hover:border-white/15 transition-all duration-300">
                <MapPin size={22} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">{area}</p>
                <p className="text-zinc-500 text-xs mt-1">& surrounding areas</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 6: COMPETITOR COMPARISON â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070707 0%, #09090b 50%, #070707 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Compare" title={`${data.businessName} vs. Online Brokers`} subtitle="See the difference a dedicated local agent makes on your biggest investment." accent={GOLD} />
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/15">
                    <th className="text-left px-6 py-4 text-zinc-400 font-medium">Feature</th>
                    <th className="text-center px-6 py-4 font-bold" style={{ color: GOLD }}>{data.businessName}</th>
                    <th className="text-center px-6 py-4 text-zinc-500 font-medium">Discount Brokers</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white/[0.07]" : ""}>
                      <td className="px-6 py-4 text-zinc-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: GOLD }} />
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 7: VIDEO PLACEHOLDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Virtual Tour" title="See Our Featured Listings" accent={GOLD} />
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.13] aspect-video group cursor-pointer">
            <img src={galleryImages[0] || heroImage} alt="Featured listings tour" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 mb-4 transition-all duration-300 group-hover:scale-110" style={{ borderColor: GOLD, background: `${GOLD}22` }}>
                <Play size={36} weight="fill" style={{ color: GOLD }} />
              </div>
              <p className="text-white text-lg font-bold">Watch the Virtual Tour</p>
              <p className="text-zinc-400 text-sm mt-1">Explore our listings from the comfort of your home</p>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 8: BUYING OR SELLING QUIZ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #070707 0%, #09090b 50%, #070707 100%)" }} />
        <LuxuryPattern opacity={0.025} accent={GOLD} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Started" title="Buying or Selling?" subtitle="Tell us where you are in your journey and we'll guide you from here." accent={GOLD} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizOptions.map((option) => {
              const Icon = option.icon;
              return (
                <GlassCard key={option.label} className="p-6 group hover:border-white/15 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
                      <Icon size={24} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{option.label}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{option.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <MagneticButton className="px-8 py-4 rounded-xl text-base font-bold text-black flex items-center gap-2 mx-auto cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
              <Phone size={18} weight="bold" /> Call to Discuss Your Options
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 9: GOOGLE REVIEWS HEADER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 8. TESTIMONIALS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* FEATURE 9: Google Reviews Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" style={{ color: GOLD }} />)}
              </div>
              <span className="text-white font-bold text-sm">{data.googleRating || "5.0"}</span>
              <span className="text-zinc-400 text-sm">({data.reviewCount || "50"}+ Reviews on Google)</span>
            </div>
          </div>
          <AnimatedSection>          <SectionHeader badge="Testimonials" title="Client Success Stories" accent={GOLD} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: GOLD }} />)}</div>
                <p className="text-zinc-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <CheckCircle size={14} weight="fill" style={{ color: GOLD }} />
                    <span className="text-xs text-zinc-500">Verified</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 9. CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD}cc, ${GOLD})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <House size={48} weight="fill" className="mx-auto mb-6 text-black/60" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black mb-4">Begin Your Journey</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">Whether buying or selling, {data.businessName} delivers an unparalleled real estate experience.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Phone size={20} weight="bold" /> {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 10. LOCATION â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Office" title="Visit Us" accent={GOLD} /></AnimatedSection>
          <div className="text-center"><GlassCard className="p-8 inline-block"><div className="flex items-center gap-3 text-lg"><MapPin size={24} weight="duotone" style={{ color: GOLD }} /><MapLink address={data.address} className="text-white font-semibold" /></div><p className="text-zinc-400 text-sm mt-2">Serving buyers and sellers across the region</p></GlassCard></div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 11. HOURS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Hours" title="Office Hours" accent={GOLD} /></AnimatedSection>
            <div className="text-center"><ShimmerBorder accent={GOLD}><div className="p-8"><Clock size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-4" /><p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p><p className="text-sm mt-4 font-semibold" style={{ color: GOLD }}>Private viewings available by appointment</p></div></ShimmerBorder></div>
          </div>
        </section>
      )}

      
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD}15, ${GOLD}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time â€” claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: GOLD }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 12. FAQ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={GOLD} /></AnimatedSection>
          <div className="space-y-3">{faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />)}</div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 13. CONTACT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Get in Touch</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Start Your Search</h2>
              <div className="h-px w-16 mb-6" style={{ backgroundColor: GOLD }} />
              <p className="text-zinc-400 leading-relaxed mb-8">Whether buying or selling, our team is ready to deliver an exceptional experience tailored to your vision.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.08] border border-white/8"><Phone size={20} style={{ color: GOLD }} /><div><p className="text-xs text-zinc-600">Call</p><PhoneLink phone={data.phone} className="text-sm font-medium" /></div></div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.08] border border-white/8"><MapPin size={20} style={{ color: GOLD }} /><div><p className="text-xs text-zinc-600">Office</p><MapLink address={data.address} className="text-sm font-medium" /></div></div>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Schedule Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-zinc-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 focus:outline-none text-sm" placeholder="(206) 287-2304" /></div>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Interest</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Buying or Selling?</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-zinc-400 mb-1.5">Message</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-zinc-500 focus:outline-none text-sm resize-none" placeholder="Tell us about your real estate needs..." /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-bold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Schedule Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FEATURE 10: FREE HOME VALUATION CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 50%, #09090b 100%)" }} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[30%] w-[600px] h-[400px] rounded-full blur-[200px]" style={{ background: `${GOLD}08` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ShimmerBorder accent={GOLD}>
            <div className="p-8 md:p-14 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
                <House size={32} weight="duotone" style={{ color: GOLD }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>Free Market Analysis</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">What&apos;s Your Home Worth?</h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-8">
                Your home is your biggest investment. Get a complimentary, no-obligation market analysis from {data.businessName} and discover your property&apos;s true value in today&apos;s market.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton className="px-8 py-4 rounded-xl text-base font-bold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  <Target size={18} weight="bold" /> Get My Free Valuation
                </MagneticButton>
                <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-xl text-base font-bold text-zinc-300 border border-white/15 flex items-center gap-2 cursor-pointer hover:border-white/20 transition-colors">
                  <Phone size={18} weight="bold" /> <PhoneLink phone={data.phone} />
                </MagneticButton>
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 14. TRUST â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #070707 100%)" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={GOLD}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: GOLD }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-black text-white mb-4">Our Commitment</h2>
              <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto text-lg">At {data.businessName}, we believe every client deserves exceptional service, transparent communication, and results that exceed expectations.</p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Expert Guidance", "Market Knowledge", "White-Glove Service", "Proven Results"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}><CheckCircle size={16} weight="fill" />{item}</span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MARKET STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #0d0d0d 50%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.015} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <ChartLineUp size={40} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Local Market Insights</h2>
            <p className="text-zinc-400 mt-3 max-w-xl mx-auto">Stay informed with the latest real estate trends in your area.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "12", label: "Avg. Days on Market", note: "Homes are selling fast" },
              { stat: "$585K", label: "Median Home Price", note: "Up 4.2% year-over-year" },
              { stat: "97%", label: "List-to-Sale Ratio", note: "Sellers get near asking" },
              { stat: "2.1", label: "Months of Inventory", note: "Strong seller's market" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/15 p-6 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-3xl font-extrabold mb-1" style={{ color: GOLD }}>{m.stat}</p>
                <p className="text-sm text-white font-semibold">{m.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• NEIGHBORHOOD GUIDE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #09090b 100%)" }} />
        <LuxuryPattern opacity={0.01} accent={GOLD} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <MapPin size={40} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Neighborhood Spotlight</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: GOLD }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { area: "Downtown Core", highlights: "Walk score 95+, restaurants, nightlife, transit access, luxury condos" },
              { area: "Waterfront District", highlights: "Stunning views, parks, bike trails, upscale dining, marina access" },
              { area: "Family Suburbs", highlights: "Top-rated schools, large lots, community parks, quiet streets" },
              { area: "Historic Quarter", highlights: "Charming character homes, tree-lined streets, boutique shopping, cafes" },
            ].map((n) => (
              <div key={n.area} className="flex items-start gap-4 rounded-2xl border border-white/15 p-6" style={{ background: "rgba(255,255,255,0.06)" }}>
                <House size={28} weight="duotone" style={{ color: GOLD }} className="shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white">{n.area}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-1">{n.highlights}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• MID-PAGE CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD}15 0%, #09090b 50%, ${GOLD}08 100%)` }} />
        <LuxuryPattern opacity={0.02} accent={GOLD} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Key size={44} weight="fill" style={{ color: GOLD }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Your Dream Home Awaits</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8 text-lg">
            Whether you&apos;re buying your first home or selling a luxury property, {data.businessName} provides expert guidance every step of the way.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: GOLD }}>
            <Phone size={20} weight="fill" /> Schedule a Consultation
          </a>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• 15. FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="relative z-10 border-t border-white/8 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #09090b 0%, #060606 100%)" }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><Buildings size={22} weight="bold" style={{ color: GOLD }} /><span className="text-lg font-bold text-white">{data.businessName}</span></div><p className="text-sm text-zinc-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "About", "Properties", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-zinc-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-zinc-500"><p><PhoneLink phone={data.phone} /></p><p><MapLink address={data.address} /></p>{data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>)}</div></div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500"><Buildings size={14} weight="bold" style={{ color: GOLD }} /><span>{data.businessName} &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-zinc-600"><BluejayLogo className="w-4 h-4" /><span>Built by <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>BlueJays</a> — get your free site audit</span></div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={GOLD} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
