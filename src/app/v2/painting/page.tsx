"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  PaintRoller,
  PaintBucket,
  House,
  Buildings,
  Palette,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CaretDown,
  Quotes,
  CalendarCheck,
  CheckCircle,
  Wrench,
  ShieldCheck,
  X,
  List,
  Drop,
  Eye,
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
const BG = "#0f0a1e";
const PURPLE = "#8b5cf6";
const PURPLE_LIGHT = "#a78bfa";
const PURPLE_GLOW = "rgba(139, 92, 246, 0.15)";
const SPLASH_PINK = "#ec4899";
const SPLASH_BLUE = "#3b82f6";

/* ───────────────────────── FLOATING PAINT DROPS ───────────────────────── */
function FloatingPaintDrops() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 3 + Math.random() * 5,
    opacity: 0.15 + Math.random() * 0.35,
    color: [PURPLE_LIGHT, SPLASH_PINK, SPLASH_BLUE, "#facc15"][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.3,
            background: p.color,
            borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            rotate: [0, 180],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            rotate: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.1, 0.9, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── WORD REVEAL ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── SECTION REVEAL ───────────────────────── */
function SectionReveal({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
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

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${PURPLE}, transparent, ${SPLASH_PINK}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ───────────────────────── */
function AccordionItem({ title, description, isOpen, onToggle }: { title: string; description: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ───────────────────────── BEFORE/AFTER SLIDER ───────────────────────── */
function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: { beforeSrc: string; afterSrc: string; beforeAlt: string; afterAlt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    const up = () => { isDragging.current = false; };
    const mm = (e: MouseEvent) => handleMove(e.clientX);
    const tm = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", mm);
    window.addEventListener("touchend", up);
    window.addEventListener("touchmove", tm);
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("mousemove", mm); window.removeEventListener("touchend", up); window.removeEventListener("touchmove", tm); };
  }, [handleMove]);

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none" onMouseDown={() => { isDragging.current = true; }} onTouchStart={() => { isDragging.current = true; }}>
      <div className="absolute inset-0">
        <img src={afterSrc} alt={afterAlt} className="w-full h-full object-cover object-center" />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-sm text-white text-sm font-bold" style={{ background: "rgba(139,92,246,0.8)" }}>After</div>
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={beforeSrc} alt={beforeAlt} className="w-full h-full object-cover object-center" />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">Before</div>
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] bg-white/80 z-10" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5"><CaretDown size={12} className="text-slate-800 -rotate-90" /><CaretDown size={12} className="text-slate-800 rotate-90" /></div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Interior Painting", description: "Walls, ceilings, trim, and accent walls with premium zero-VOC paints. Flawless prep, clean edges, and furniture protection included.", icon: House },
  { title: "Exterior Painting", description: "Complete exterior transformations including siding, fascia, soffits, and shutters. Weather-resistant coatings that last 10+ years.", icon: Buildings },
  { title: "Commercial Painting", description: "Office spaces, retail stores, warehouses, and restaurants. We work around your schedule to minimize disruption to your business.", icon: Buildings },
  { title: "Deck Staining", description: "Restore and protect your outdoor living spaces with professional-grade stains and sealants. Pressure washing and prep included.", icon: Wrench },
  { title: "Cabinet Refinishing", description: "Transform your kitchen without a full remodel. Sanding, priming, painting, and new hardware installation for a fraction of the cost.", icon: PaintBucket },
  { title: "Color Consulting", description: "Not sure what colors to choose? Our certified color consultants help you find the perfect palette for your space and style.", icon: Palette },
];

const stats = [
  { value: "2,500+", label: "Projects Completed" },
  { value: "15+", label: "Years in Business" },
  { value: "4.9", label: "Star Rating" },
  { value: "100%", label: "Satisfaction Guarantee" },
];

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80", alt: "Freshly painted living room" },
  { src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80", alt: "Exterior house painting" },
  { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", alt: "Modern kitchen cabinets painted white" },
  { src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80", alt: "Paint color samples on wall" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80", alt: "Professional painter at work" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80", alt: "Beautiful bedroom accent wall" },
];

const processSteps = [
  { step: "01", title: "Free Consultation", description: "We visit your property, discuss your vision, and provide a detailed written estimate with no obligations." },
  { step: "02", title: "Color Selection", description: "Our color consultant helps you choose the perfect palette. We provide large samples so you can see colors in your lighting." },
  { step: "03", title: "Surface Preparation", description: "Thorough cleaning, sanding, patching, priming, and taping. Prep is 80% of a great paint job and we never cut corners." },
  { step: "04", title: "Professional Application", description: "Two premium coats applied with precision. We protect your floors, furniture, and landscaping throughout the process." },
  { step: "05", title: "Final Walkthrough", description: "We walk through every room with you, touch up any imperfections, and make sure you are completely satisfied before we leave." },
];

const testimonials = [
  { name: "Karen & Steve H.", text: "They transformed our entire first floor in just three days. The attention to detail was incredible — perfect lines, zero mess. Our home feels brand new.", rating: 5 },
  { name: "David L.", text: "I hired them for a commercial repaint of our restaurant. They worked overnight so we never had to close. Professional, fast, and the result is stunning.", rating: 5 },
  { name: "Michelle T.", text: "The color consulting service was worth every penny. They helped us pick the perfect palette and the execution was flawless. We get compliments daily.", rating: 5 },
];

const faqData = [
  { title: "How long does a typical interior paint job take?", description: "Most residential interiors are completed in 2-4 days depending on scope. A single room can often be done in one day. We provide a timeline in our estimate so you know exactly what to expect." },
  { title: "What type of paint do you use?", description: "We use premium, low-VOC and zero-VOC paints from Sherwin-Williams and Benjamin Moore. These provide superior coverage, durability, and are safe for your family and pets." },
  { title: "Do you move furniture?", description: "Yes. We carefully move and cover all furniture. Large items are shifted to the center of the room and covered with drop cloths. Everything is returned to its original position when we finish." },
  { title: "Is your work guaranteed?", description: "Absolutely. We offer a 3-year workmanship warranty on all interior projects and a 5-year warranty on exteriors. If anything peels, chips, or blisters due to our work, we fix it free of charge." },
  { title: "How soon can you start?", description: "We typically begin within 1-2 weeks of signing the estimate. For urgent projects, we can often accommodate rush scheduling. Contact us for current availability." },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2PaintingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingPaintDrops />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PaintRoller size={24} weight="duotone" style={{ color: PURPLE }} />
              <span className="text-lg font-bold tracking-tight text-white">Spectrum Painting</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#process" className="hover:text-white transition-colors">Process</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors" style={{ background: PURPLE } as React.CSSProperties}>
                Free Estimate
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "Process", href: "#process" }, { label: "Reviews", href: "#testimonials" }, { label: "Free Estimate", href: "#estimate" }].map((link) => (
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
          <img src="https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=1400&q=80" alt="Beautiful painted interior" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG} 45%, transparent 100%)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 10%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest" style={{ color: PURPLE }}>
              Professional Painting Contractors
            </motion.p>
            <h1 className="text-4xl md:text-7xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Transform Every Surface" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-300 max-w-md leading-relaxed">
              Premium residential and commercial painting with meticulous
              preparation, expert color consulting, and a 100% satisfaction
              guarantee on every project.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 743-2190
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: PURPLE }}>{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── 3. SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Every Surface, Perfected" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: PURPLE_GLOW }}>
                      <svc.icon size={24} weight="duotone" style={{ color: PURPLE }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{svc.description}</p>
                  </GlassCard>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. BEFORE/AFTER GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="See the Transformation" />
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <BeforeAfterSlider
              beforeSrc="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80"
              afterSrc="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
              beforeAlt="Room before painting"
              afterAlt="Room after professional painting"
            />
            <BeforeAfterSlider
              beforeSrc="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
              afterSrc="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80"
              beforeAlt="Exterior before painting"
              afterAlt="Exterior after professional painting"
            />
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryPhotos.map((photo, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl overflow-hidden">
                <motion.div whileHover={{ scale: 1.05 }} transition={springGentle} style={{ willChange: "transform" }}>
                  <img src={photo.src} alt={photo.alt} className="w-full aspect-square object-cover object-center" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&q=80" alt="Painting team at work" className="w-full h-full object-cover object-center" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>About Spectrum</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Craft Meets Color" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>
                  Spectrum Painting has served homeowners and businesses for over
                  15 years with a simple promise: impeccable preparation,
                  premium materials, and craftsmanship you can see in every
                  brushstroke.
                </p>
                <p>
                  Our team of certified painters is trained in the latest
                  techniques and committed to leaving your space cleaner than
                  we found it. From color selection to final walkthrough, we
                  handle every detail.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: CheckCircle, label: "3-5 Year Warranty" },
                  { icon: Drop, label: "Zero-VOC Paints" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon size={18} weight="duotone" style={{ color: PURPLE }} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 6. PROCESS ─── */}
      <SectionReveal id="process" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Proven Process" />
            </h2>
          </div>
          <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 flex items-start gap-6">
                  <div className="text-3xl font-bold shrink-0" style={{ color: PURPLE, opacity: 0.5 }}>{step.step}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Client Reviews</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: PURPLE }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: PURPLE }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. FAQ ─── */}
      <SectionReveal id="faq" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Common Questions</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Frequently Asked" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">Everything you need to know about our painting services, materials, and process.</p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {faqData.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem title={faq.title} description={faq.description} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 9. FREE ESTIMATE CTA ─── */}
      <SectionReveal id="estimate" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: PURPLE }}>Ready to Transform Your Space?</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Get Your Free Estimate</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                  No obligation, no pressure. We will visit your property,
                  discuss your vision, and provide a detailed written quote
                  within 24 hours.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: PURPLE } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Schedule Estimate
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> Call Now
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PaintRoller size={16} weight="duotone" style={{ color: PURPLE }} />
            <span>Spectrum Painting &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
