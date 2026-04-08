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
  Truck,
  Package,
  House,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  ShieldCheck,
  Users,
  CheckCircle,
  CaretDown,
  Quotes,
  CalendarCheck,
  Warehouse,
  Buildings,
  CubeTransparent,
  Path,
  ListChecks,
  Handshake,
  X,
  List,
  Envelope,
} from "@phosphor-icons/react";

/* ───────────────────────── SPRING CONFIG ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const springGentle = { type: "spring" as const, stiffness: 60, damping: 18 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ───────────────────────── COLORS ───────────────────────── */
const BG = "#0f1520";
const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fb923c";
const NAVY = "#1e293b";
const ORANGE_GLOW = "rgba(249, 115, 22, 0.15)";

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 2 + Math.random() * 3,
    opacity: 0.12 + Math.random() * 0.25,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ORANGE_LIGHT, willChange: "transform, opacity" }}
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
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return (
    <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

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

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${ORANGE_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: NAVY }}>{children}</div>
    </div>
  );
}

function AccordionItem({ title, description, icon: Icon, isOpen, onToggle }: { title: string; description: string; icon: React.ElementType; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ORANGE_GLOW }}>
            <Icon size={20} weight="duotone" style={{ color: ORANGE }} />
          </div>
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── TRUCK SVG ───────────────────────── */
function AnimatedTruck() {
  return (
    <motion.div className="relative flex items-center justify-center" animate={{ x: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ willChange: "transform" }}>
      <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ORANGE_GLOW} 0%, transparent 70%)`, filter: "blur(40px)", willChange: "transform" }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <svg viewBox="0 0 200 120" className="relative z-10 w-56 h-36 md:w-72 md:h-44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.rect x="10" y="20" width="110" height="60" rx="6" stroke={ORANGE} strokeWidth="2.5" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut" }} />
        <motion.path d="M120 40 L160 40 L175 60 L175 80 L120 80 Z" stroke={ORANGE_LIGHT} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }} />
        <motion.circle cx="50" cy="85" r="10" stroke={ORANGE} strokeWidth="2.5" fill="none" animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.circle cx="155" cy="85" r="10" stroke={ORANGE} strokeWidth="2.5" fill="none" animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.rect x="25" y="30" width="20" height="15" rx="2" stroke={ORANGE_LIGHT} strokeWidth="1.5" fill="none" opacity={0.4} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }} />
        <motion.rect x="55" y="30" width="20" height="15" rx="2" stroke={ORANGE_LIGHT} strokeWidth="1.5" fill="none" opacity={0.4} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.8 }} />
        <motion.rect x="85" y="30" width="20" height="15" rx="2" stroke={ORANGE_LIGHT} strokeWidth="1.5" fill="none" opacity={0.4} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 2.1 }} />
      </svg>
    </motion.div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Local Moving", description: "Efficient same-city relocations with careful handling of all your belongings. Our trained crews ensure everything arrives safely at your new home, on time and within budget.", icon: House },
  { title: "Long-Distance Moving", description: "Cross-state and nationwide moves with GPS tracking, dedicated trucks, and guaranteed delivery windows. We handle the logistics so you can focus on your fresh start.", icon: Path },
  { title: "Packing Services", description: "Professional packing with premium materials. From fragile china to bulky furniture, our expert packers protect every item with custom wrapping and labeled inventory systems.", icon: Package },
  { title: "Storage Solutions", description: "Climate-controlled, secure storage facilities for short or long-term needs. Perfect for staged moves, renovations, or downsizing with flexible month-to-month plans.", icon: Warehouse },
  { title: "Commercial Moving", description: "Office and business relocations with minimal downtime. We work after hours and weekends to keep your business running while we handle the heavy lifting.", icon: Buildings },
  { title: "Specialty Items", description: "Piano moving, art handling, antique transport, and oversized item relocation by certified specialists with custom crating and white-glove delivery service.", icon: CubeTransparent },
];

const stats = [
  { value: "15,000+", label: "Moves Completed" },
  { value: "4.9", label: "Star Rating" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "25+", label: "Years of Experience" },
];

const process = [
  { step: "01", title: "Free Quote", description: "Request your personalized estimate online or over the phone. We visit your home for accurate pricing with no hidden fees.", icon: CalendarCheck },
  { step: "02", title: "Pack & Prepare", description: "Our team arrives with all materials needed. We professionally pack, label, and inventory every item for a seamless transition.", icon: Package },
  { step: "03", title: "Move Day", description: "Our trained movers load, transport, and deliver your belongings with care. GPS tracking lets you follow your items in real time.", icon: Truck },
  { step: "04", title: "Unpack & Settle", description: "We unpack, assemble furniture, and place everything exactly where you want it. Walk into your new home ready to live.", icon: House },
];

const testimonials = [
  { name: "Jennifer M.", text: "Absolutely the best moving experience we have ever had. The crew was professional, fast, and treated our belongings like their own. Not a single scratch on anything.", rating: 5 },
  { name: "Robert K.", text: "We moved our entire office over a weekend and were back in business Monday morning. Their commercial team is incredibly organized and efficient.", rating: 5 },
  { name: "Amanda T.", text: "Moving cross-country was stressful enough, but these guys made the actual move the easiest part. GPS tracking gave us peace of mind the entire way.", rating: 5 },
];

const checklist = [
  "Start packing non-essentials 4 weeks early",
  "Notify utilities, banks, and subscriptions of address change",
  "Label every box by room and contents",
  "Keep important documents in a personal bag",
  "Take photos of electronics before disconnecting",
  "Prepare an essentials box for the first night",
  "Confirm moving date and crew details 48 hours before",
  "Do a final walkthrough of your old home",
];

const faqs = [
  { q: "How far in advance should I book?", a: "We recommend booking 2-4 weeks ahead for local moves and 4-8 weeks for long-distance. Peak season (May-September) fills up fast, so earlier is better." },
  { q: "Are my belongings insured during the move?", a: "Yes. Every move includes basic valuation coverage at no extra cost. We also offer full replacement value protection for complete peace of mind." },
  { q: "Do you disassemble and reassemble furniture?", a: "Absolutely. Our crews bring all necessary tools and hardware. We disassemble at origin and reassemble at destination at no additional charge." },
  { q: "What items can you not move?", a: "For safety and legal reasons, we cannot transport hazardous materials, perishable foods, or live plants across state lines. We provide a complete list during your estimate." },
  { q: "How do you handle fragile or valuable items?", a: "Specialty items receive custom crating, padding, and white-glove handling. We use climate-controlled trucks for art, antiques, and electronics." },
];

const serviceAreas = ["Portland Metro", "Seattle", "San Francisco", "Los Angeles", "Denver", "Phoenix", "Salt Lake City", "Boise"];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2MovingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Truck size={24} weight="duotone" style={{ color: ORANGE }} />
              <span className="text-lg font-bold tracking-tight text-white">SwiftHaul Moving</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#estimate" className="hover:text-white transition-colors">Free Estimate</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: ORANGE }}>Get Quote</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Services", href: "#services" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#testimonials" }, { label: "Free Estimate", href: "#estimate" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10">
        {/* Hero bg image overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}, transparent 30%, ${BG})` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: ORANGE }}>Reliable Professional Movers</motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Moving Made Stress-Free" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              From your first box to your last, we handle every detail of your move with care, speed, and precision. Local or long-distance, your belongings are in expert hands.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 987-6543
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ORANGE }} />Portland, OR</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ORANGE }} />Mon-Sat 7am-7pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <AnimatedTruck />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: ORANGE }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Full-Service Moving Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Whether you are moving across town or across the country, our trained professionals handle every aspect of your relocation with precision and care.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem title={svc.title} description={svc.description} icon={svc.icon} isOpen={openService === i} onToggle={() => setOpenService(openService === i ? null : i)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>About Us</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
              <WordReveal text="25 Years of Trusted Moves" />
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              SwiftHaul Moving was founded on a simple promise: treat every customer&apos;s belongings as if they were our own. From a single truck in 2001 to a fleet of 50+ vehicles, we have grown by earning trust one move at a time.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Our crews are background-checked, drug-tested, and continuously trained in the latest packing and handling techniques. We are fully licensed, bonded, and insured for your complete peace of mind.
            </p>
          </div>
          <motion.div className="grid grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: ShieldCheck, label: "Fully Insured", desc: "Complete coverage" },
              { icon: Users, label: "Expert Crews", desc: "Background-checked" },
              { icon: Truck, label: "50+ Trucks", desc: "Modern fleet" },
              { icon: Handshake, label: "No Hidden Fees", desc: "Transparent pricing" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-5 text-center">
                  <item.icon size={28} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Quote, Pack, Move, Unpack" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {process.map((p, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{p.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: ORANGE_GLOW }}>
                    <p.icon size={24} weight="duotone" style={{ color: ORANGE }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Customer Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Customers Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: ORANGE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: ORANGE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── MOVING CHECKLIST ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Be Prepared</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Your Moving Checklist" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Download our free checklist or follow these essentials to make sure nothing is forgotten on moving day.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {checklist.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle size={20} weight="duotone" style={{ color: ORANGE }} className="shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Common Questions</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer">
                    <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                        <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FREE ESTIMATE CTA ─── */}
      <SectionReveal id="estimate" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>No Obligation</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Estimate</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Tell us about your move and receive a detailed, no-obligation quote within 24 hours. No hidden fees, no surprises.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>
                    <CalendarCheck size={20} weight="duotone" /> Request Estimate
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Now
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREAS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Where We Serve</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Service Areas" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {serviceAreas.map((area, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-4 text-center">
                  <MapPin size={20} weight="duotone" style={{ color: ORANGE }} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{area}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} weight="duotone" style={{ color: ORANGE }} />
            <span>SwiftHaul Moving &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
