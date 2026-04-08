"use client";

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
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Quotes,
  X,
  List,
  Truck,
  Recycle,
  Trash,
  House,
  Buildings,
  TreeEvergreen,
  CalendarCheck,
  Timer,
  Medal,
  Certificate,
  CheckCircle,
  Broom,
  Package,
  Leaf,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
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

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0f1a12";
const ACCENT = "#22c55e";
const ACCENT_LIGHT = "#86efac";
const ACCENT_GLOW = "rgba(34, 197, 94, 0.15)";

/* ───────────────────────── TRUCK NAV ICON ───────────────────────── */
function TruckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="10" width="18" height="12" rx="2" stroke={ACCENT} strokeWidth="2" />
      <path d="M21 14H26L29 18V22H21V14Z" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9" cy="24" r="2.5" fill={ACCENT} />
      <circle cx="25" cy="24" r="2.5" fill={ACCENT} />
      <path d="M7 14H17" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ───────────────────────── RECYCLING ARROW PATTERN ───────────────────────── */
function RecyclePattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="recycle-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 L55 30 L45 30 L45 50 L35 50 L35 30 L25 30 Z" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.5" />
            <circle cx="40" cy="60" r="8" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.3" />
            <path d="M36 60 L40 56 L44 60 L40 64 Z" fill="none" stroke={ACCENT_LIGHT} strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#recycle-grid)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING LEAF PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.06 + Math.random() * 0.15,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── SHARED COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {words.map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
    </motion.span>
  );
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>
      {children}
    </motion.section>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || isTouchDevice) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ACCENT}, transparent, ${ACCENT_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Residential Junk Removal", description: "Furniture, appliances, mattresses, electronics, garage cleanouts — we haul it all. Just point and we do the heavy lifting. Same-day service available for most residential jobs.", icon: House },
  { title: "Commercial Cleanouts", description: "Office furniture, equipment, warehouse debris, and retail fixtures. We work around your schedule with minimal disruption to your business operations.", icon: Buildings },
  { title: "Estate Cleanouts", description: "Compassionate, thorough estate and hoarding cleanouts. We sort, donate usable items, recycle what we can, and dispose of the rest responsibly.", icon: Package },
  { title: "Construction Debris", description: "Drywall, lumber, concrete, roofing materials, and renovation waste. We handle post-construction cleanup so your crew can move to the next job.", icon: Trash },
  { title: "Appliance & E-Waste Removal", description: "Refrigerators, washers, dryers, TVs, computers — all removed and recycled according to EPA guidelines. We handle Freon-containing units properly.", icon: Recycle },
  { title: "Yard Waste & Outdoor Cleanup", description: "Branches, stumps, soil, old fencing, shed demolition, and general yard debris. We leave your outdoor space clean and ready for whatever comes next.", icon: TreeEvergreen },
];

const testimonials = [
  { name: "Jennifer R.", text: "Called at 9 AM, they were here by noon. Two guys cleared out my entire garage in under an hour. Incredibly fast, professional, and the price was exactly what they quoted. No surprises.", rating: 5 },
  { name: "Marcus & Diane T.", text: "We used CleanSlate for our mother's estate cleanout. They were respectful, careful with sentimental items, and donated everything they could. Made an overwhelming situation manageable.", rating: 5 },
  { name: "David K. — GC", text: "We use CleanSlate for all our post-construction cleanups. They show up on time, haul everything in one trip, and their pricing is the best in the area. Highly recommend for contractors.", rating: 5 },
];

const guarantees = [
  "Upfront Pricing — No Hidden Fees",
  "Same-Day & Next-Day Service",
  "Eco-Friendly Disposal & Recycling",
  "Fully Licensed & Insured",
  "We Donate Usable Items",
  "Clean Sweep Guarantee",
  "Background-Checked Crews",
  "Free On-Site Estimates",
];

const faqData = [
  { q: "How does pricing work?", a: "We price based on how much space your items take up in our truck — not by weight or item count. We give you an exact quote on-site before we start, and that price is guaranteed. No hidden fees, no surprises." },
  { q: "Do I need to be home during the removal?", a: "Not necessarily. As long as we can access the items and you've approved the quote, we can complete the job while you're away. We'll send before-and-after photos when we're done." },
  { q: "What happens to my stuff after you take it?", a: "We sort everything. Usable items go to local charities and donation centers. Recyclable materials go to certified recycling facilities. Only true waste goes to the landfill. We typically divert 60-70% from landfills." },
  { q: "Can you handle hazardous materials?", a: "We cannot haul hazardous waste like paint, chemicals, or asbestos. However, we can point you to licensed hazardous waste disposal services in your area and handle everything else." },
  { q: "How quickly can you come out?", a: "We offer same-day service for most jobs when you call before noon. Next-day appointments are almost always available. For large commercial or estate cleanouts, we recommend booking 2-3 days ahead." },
  { q: "Do you offer dumpster rental as an alternative?", a: "We focus on full-service junk removal where our crew does all the loading. However, for large ongoing projects, we can recommend trusted dumpster rental partners and handle the final cleanup." },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2JunkRemovalPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <RecyclePattern />
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <TruckIcon size={24} />
              <span className="text-lg font-bold tracking-tight text-white">CleanSlate Junk Removal</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#portfolio" className="hover:text-white transition-colors">Results</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ACCENT } as React.CSSProperties}>
                Free Quote
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
                  {[{ label: "Services", href: "#services" }, { label: "Results", href: "#portfolio" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#testimonials" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1600&q=80" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG}f0 0%, ${BG}dd 50%, ${BG}aa 100%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>
                Fast &bull; Affordable &bull; Eco-Friendly
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Your Junk Gone, Same Day" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              From single items to full property cleanouts, CleanSlate makes junk disappear. Upfront pricing, eco-friendly disposal, and crews that treat your space with respect.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                Book Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 328-JUNK
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ACCENT }} />Serving the Greater Metro Area</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ACCENT }} />7 Days a Week, 7am-7pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
              <Truck size={200} weight="duotone" style={{ color: ACCENT }} className="relative z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. STATS / TRUST BAR ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { icon: Star, label: "4.9 Star Rating", desc: "1,200+ jobs completed" },
                { icon: Timer, label: "Same-Day Service", desc: "Call before noon" },
                { icon: Recycle, label: "70% Recycled", desc: "Eco-friendly disposal" },
                { icon: Medal, label: "10+ Years", desc: "Trusted locally" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                    <stat.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stat.label}</p>
                    <p className="text-xs text-slate-400">{stat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What We Haul</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Full-Service Junk Removal" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                You point, we haul. No job too big or too small — from a single couch to a full estate cleanout, our insured crews handle the heavy lifting so you don&apos;t have to.
              </p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                        </div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openService === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 4. PORTFOLIO / BEFORE & AFTER ─── */}
      <SectionReveal id="portfolio" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Results</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Clean Spaces, Happy Faces" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {portfolioImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-[4/3] rounded-xl overflow-hidden">
                <motion.img src={img} alt={`Junk removal project ${i + 1}`} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>About CleanSlate</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="10 Years of Clearing the Way" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                CleanSlate was founded on a simple idea: junk removal should be fast, affordable, and responsible. Over 10 years and 1,200+ jobs later, we&apos;re the area&apos;s most trusted name in hauling.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every load we pick up is sorted by hand. Usable items go to local charities. Recyclables go to certified facilities. We typically divert 60-70% of what we haul from landfills — because doing the right thing matters.
              </p>
            </div>
            <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: Leaf, label: "Eco-Friendly", desc: "70% diverted from landfill" },
                { icon: ShieldCheck, label: "Fully Insured", desc: "Complete liability coverage" },
                { icon: Timer, label: "Same-Day", desc: "Fast turnaround times" },
                { icon: Certificate, label: "Background Checked", desc: "Trusted, vetted crews" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 text-center">
                    <item.icon size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="4 Simple Steps" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { step: "01", title: "Book Online or Call", desc: "Schedule your free estimate online or call us. We offer 2-hour arrival windows so you're not waiting around all day." },
              { step: "02", title: "We Quote On-Site", desc: "Our crew arrives, assesses the job, and gives you an all-inclusive price. No obligation — if you don't like the price, you pay nothing." },
              { step: "03", title: "We Haul Everything", desc: "Say the word and we get to work. We do all the lifting, loading, and cleanup. You don't touch a thing." },
              { step: "04", title: "We Sort & Recycle", desc: "Your junk is sorted responsibly. Donations go to charity, recyclables to facilities, and only true waste to the landfill." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <span className="text-5xl font-black absolute top-3 right-4 opacity-5 text-white">{item.step}</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4" style={{ background: ACCENT, color: "white" }}>{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 7. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Customer Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Cleared Out & Stress-Free" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ACCENT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ACCENT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. GUARANTEE ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Promise</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="The CleanSlate Guarantee" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {guarantees.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <CheckCircle size={20} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">{item}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqData.map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-sm md:text-base font-semibold text-white pr-4">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={18} className="text-slate-400 shrink-0" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Ready to Clear the Clutter?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Estimate Today</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">Same-day service available. Upfront pricing. No obligation. Let us do the heavy lifting.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book Free Estimate
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (555) 328-JUNK
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 11. CONTACT FORM ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Let Us Clear It Out" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Tell us what you need gone and we&apos;ll give you an honest, upfront quote. Most jobs completed same-day or next-day.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Service Area</p><p className="text-sm text-slate-400">Greater Metro Area &amp; surrounding communities<br />Up to 40-mile radius</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 328-JUNK (5865)</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">7 Days a Week: 7:00 AM - 7:00 PM<br />Same-day service when you call before noon</p></div>
                </div>
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Request Your Free Quote</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 focus:outline-none focus:border-green-500/50 transition-colors">
                  <option value="">What do you need removed?</option>
                  <option value="furniture">Furniture &amp; Household Items</option>
                  <option value="appliances">Appliances</option>
                  <option value="garage">Garage / Basement Cleanout</option>
                  <option value="estate">Estate Cleanout</option>
                  <option value="construction">Construction Debris</option>
                  <option value="yard">Yard Waste</option>
                  <option value="commercial">Commercial Cleanout</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Tell us about the job (what items, location, access, etc.)..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors resize-none" />
                <MagneticButton className="w-full px-6 py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2" style={{ background: ACCENT } as React.CSSProperties}>
                  Get My Free Quote <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 12. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} weight="duotone" style={{ color: ACCENT }} />
            <span>CleanSlate Junk Removal &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ─── 13. FIXED CLAIM BANNER ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
        <GlassCard className="px-5 py-3">
          <p className="text-xs text-center text-slate-300">
            Claim your FREE website at{" "}
            <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">
              bluejayportfolio.com
            </a>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}
