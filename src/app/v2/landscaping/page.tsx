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
  Tree,
  Leaf,
  Quotes,
  X,
  List,
  CalendarCheck,
  Heart,
  Users,
  Sun,
  Drop,
  Lightning,
  Shovel,
  Mountains,
  Flower,
  CheckCircle,
  Snowflake,
  PaintBrush,
  Ruler,
  Lightbulb,
  Eye,
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
const BG = "#0a1a0a";
const GREEN = "#15803d";
const GREEN_LIGHT = "#22c55e";
const BROWN = "#92400e";
const BROWN_LIGHT = "#b45309";
const GREEN_GLOW = "rgba(21, 128, 61, 0.15)";
const BROWN_GLOW = "rgba(146, 64, 14, 0.12)";

/* ───────────────────────── FALLING LEAVES ───────────────────────── */
function FallingLeaves() {
  const leaves = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 10 + Math.random() * 8,
    size: 12 + Math.random() * 10,
    opacity: 0.08 + Math.random() * 0.15,
    rotation: Math.random() * 360,
    swayAmount: 30 + Math.random() * 60,
    color: i % 3 === 0 ? BROWN_LIGHT : GREEN_LIGHT,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {leaves.map((l) => (
        <motion.div
          key={l.id}
          className="absolute"
          style={{ left: `${l.x}%`, willChange: "transform, opacity" }}
          animate={{
            y: ["-5vh", "110vh"],
            x: [-l.swayAmount / 2, l.swayAmount / 2, -l.swayAmount / 2],
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
          <Leaf size={l.size} weight="fill" style={{ color: l.color }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── LANDSCAPE SVG ───────────────────────── */
function LandscapeSVG() {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ perspective: 800, willChange: "transform" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${GREEN_GLOW} 0%, transparent 70%)`, filter: "blur(30px)", willChange: "transform" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 160 120" className="relative z-10 w-48 h-36 md:w-64 md:h-48" fill="none">
        {/* Ground */}
        <motion.path d="M0 100 Q40 85, 80 90 Q120 95, 160 85 L160 120 L0 120Z" fill={GREEN} fillOpacity="0.15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        {/* Tree trunk */}
        <motion.rect x="75" y="50" width="10" height="50" rx="3" fill={BROWN} fillOpacity="0.6" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.3 }} style={{ transformOrigin: "bottom" }} />
        {/* Tree crown */}
        <motion.ellipse cx="80" cy="40" rx="28" ry="30" stroke={GREEN_LIGHT} strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5 }} />
        {/* Small bush left */}
        <motion.ellipse cx="30" cy="90" rx="18" ry="12" stroke={GREEN_LIGHT} strokeWidth="1.5" fill="none" opacity="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
        {/* Small bush right */}
        <motion.ellipse cx="130" cy="88" rx="15" ry="10" stroke={GREEN_LIGHT} strokeWidth="1.5" fill="none" opacity="0.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.2 }} />
        {/* Sun */}
        <motion.circle cx="135" cy="20" r="8" fill={BROWN_LIGHT} fillOpacity="0.3" animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        {/* Flower */}
        <motion.circle cx="50" cy="85" r="3" fill={BROWN_LIGHT} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      </svg>
    </motion.div>
  );
}

/* ───────────────────────── REUSABLE COMPONENTS ───────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((word, i) => (<motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>))}
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
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GREEN}, transparent, ${BROWN_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Landscape Design", description: "Custom landscape architecture from concept to blueprint. We blend aesthetics with functionality to create outdoor spaces that complement your home and lifestyle.", icon: PaintBrush },
  { title: "Installation", description: "Expert installation of plants, trees, sod, gardens, and decorative features. Our crews handle everything from small garden beds to complete property transformations.", icon: Shovel },
  { title: "Lawn Maintenance", description: "Weekly mowing, edging, fertilization, aeration, and seasonal clean-ups. Keep your lawn lush and green year-round with our comprehensive maintenance programs.", icon: Leaf },
  { title: "Hardscaping", description: "Patios, retaining walls, walkways, fire pits, and outdoor kitchens built with premium materials. Durable, beautiful structures that extend your living space outdoors.", icon: Mountains },
  { title: "Irrigation Systems", description: "Smart irrigation design, installation, and repair. Efficient watering systems that keep your landscape thriving while conserving water and reducing utility bills.", icon: Drop },
  { title: "Outdoor Lighting", description: "Architectural and landscape lighting that transforms your property after dark. Path lights, uplights, accent lighting, and smart controls for ambiance and security.", icon: Lightning },
];

const beforeAfterGallery = [
  { before: "https://images.unsplash.com/photo-1560749003-f4b1e17e2dff?w=600&q=80", after: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80", label: "Front Yard Transformation" },
  { before: "https://images.unsplash.com/photo-1609347744403-2306e8a9ae27?w=600&q=80", after: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80", label: "Backyard Patio Project" },
  { before: "https://images.unsplash.com/photo-1501685532562-aa6846b14a0e?w=600&q=80", after: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80", label: "Garden Redesign" },
];

const processSteps = [
  { step: "01", title: "Consultation", description: "We visit your property to understand the space, your vision, and your budget. Every great landscape starts with listening.", icon: Eye },
  { step: "02", title: "Design", description: "Our designers create detailed plans with 3D renderings, plant selections, and material choices for your approval.", icon: Ruler },
  { step: "03", title: "Build", description: "Our expert crews bring the design to life with precision installation, quality materials, and clean workmanship.", icon: Shovel },
  { step: "04", title: "Maintain", description: "Ongoing care programs keep your investment thriving season after season. We are with you for the long haul.", icon: Leaf },
];

const testimonials = [
  { name: "Mark & Susan H.", text: "They transformed our barren backyard into an absolute oasis. The patio, fire pit, and plantings are stunning. We practically live outside now and our neighbors are jealous.", rating: 5 },
  { name: "Jennifer L.", text: "The front yard redesign added instant curb appeal. They listened to exactly what I wanted and delivered beyond my expectations. Professional and punctual from start to finish.", rating: 5 },
  { name: "Tom D., Property Manager", text: "We use them for all 12 of our commercial properties. The maintenance crews are reliable, thorough, and the properties have never looked better. Great communication too.", rating: 5 },
];

const seasonalServices = [
  { season: "Spring", services: ["Clean-ups & mulching", "Planting & sod installation", "Irrigation activation", "Fertilization program start"], icon: Flower, color: GREEN_LIGHT },
  { season: "Summer", services: ["Weekly maintenance", "Lawn treatments", "Pest management", "Irrigation monitoring"], icon: Sun, color: BROWN_LIGHT },
  { season: "Fall", services: ["Leaf removal", "Aeration & overseeding", "Fall plantings", "Irrigation winterization"], icon: Leaf, color: BROWN_LIGHT },
  { season: "Winter", services: ["Snow removal", "De-icing services", "Holiday lighting", "Winter pruning"], icon: Snowflake, color: GREEN_LIGHT },
];

const faqs = [
  { q: "How much does landscaping typically cost?", a: "Projects range widely based on scope. A basic front yard refresh might start at $2,000-5,000, while a full backyard transformation with hardscaping can range from $15,000-75,000+. We provide detailed quotes after a free consultation." },
  { q: "What is the best time to start a landscaping project?", a: "Spring and fall are ideal for planting. Hardscaping can be done most of the year except during freezing conditions. We recommend booking design consultations 4-6 weeks before you want work to begin." },
  { q: "Do you offer maintenance plans?", a: "Yes. We offer weekly, bi-weekly, and monthly maintenance plans that include mowing, edging, blowing, weeding, fertilization, and seasonal services. Plans are customized to your property size and needs." },
  { q: "Are you licensed and insured?", a: "Absolutely. We are fully licensed, bonded, and insured. Our team members are certified by the National Association of Landscape Professionals and maintain ongoing education credentials." },
  { q: "Do you guarantee your plants?", a: "We offer a one-year guarantee on all plants and trees we install, provided the recommended care instructions are followed. If anything does not survive, we replace it at no charge." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2LandscapingPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeBA, setActiveBA] = useState(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FallingLeaves />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Tree size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Evergreen Landscapes</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: GREEN } as React.CSSProperties}>
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
                  {[{ label: "Services", href: "#services" }, { label: "Gallery", href: "#gallery" }, { label: "About", href: "#about" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${BROWN} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN_LIGHT }}>
                Outdoor Living Experts
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Transform Your Outdoor Space" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              From concept to creation, we design and build landscapes that turn ordinary yards into extraordinary outdoor living spaces. Nature, craftsmanship, artistry.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                Get Free Estimate <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 298-4567
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />Serving the Greater Metro Area</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />Mon-Sat 7am-6pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80" alt="Beautiful landscaped backyard" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0a] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border border-green-500/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Free Estimates</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "18+", label: "Years in Business", icon: Star },
                { value: "2,500+", label: "Projects Completed", icon: CheckCircle },
                { value: "4.9", label: "Google Rating", icon: Star },
                { value: "100%", label: "Licensed & Insured", icon: ShieldCheck },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <stat.icon size={24} weight="duotone" style={{ color: GREEN_LIGHT }} className="mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="land-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={GREEN_LIGHT} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#land-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Complete Landscape Solutions" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From design to installation to ongoing maintenance, we handle every aspect of your outdoor space. Click any service to learn more.
              </p>
            </div>
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GREEN_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: GREEN_LIGHT }} />
                        </div>
                        <span className="text-lg font-semibold text-white">{svc.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}>
                        <CaretDown size={20} className="text-slate-400" />
                      </motion.div>
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

      {/* ─── BEFORE / AFTER SHOWCASE ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Transformations</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Before & After" />
            </h2>
          </div>
          {/* Tab buttons */}
          <div className="flex justify-center gap-3 mb-8">
            {beforeAfterGallery.map((item, i) => (
              <button key={i} onClick={() => setActiveBA(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeBA === i ? "text-white" : "text-slate-500 hover:text-slate-300"}`} style={activeBA === i ? { background: GREEN } : {}}>
                {item.label}
              </button>
            ))}
          </div>
          {/* Gallery display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
              <img src={beforeAfterGallery[activeBA].before} alt="Before" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-700/80 backdrop-blur-sm text-white text-sm font-bold">Before</div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
              <img src={beforeAfterGallery[activeBA].after} alt="After" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-sm text-white text-sm font-bold" style={{ background: `${GREEN}cc` }}>After</div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>About Us</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Rooted in Craftsmanship" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Evergreen Landscapes has been transforming outdoor spaces for over 18 years. What started as a small lawn care operation has grown into a full-service landscape design and construction company serving the greater metro area.</p>
                <p>Our team of certified landscape professionals combines horticultural expertise with design creativity to deliver results that exceed expectations. We treat every property as if it were our own, with attention to detail and a commitment to quality that shows in every project.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "Licensed & Bonded" },
                  { icon: Lightbulb, label: "Certified Designers" },
                  { icon: Users, label: "30+ Person Crew" },
                  { icon: Heart, label: "Locally Owned" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GREEN_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800&q=80" alt="Beautiful residential landscaping" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Tree size={20} weight="duotone" style={{ color: GREEN_LIGHT }} />
                  <span className="text-sm text-white font-medium">2,500+ projects and counting</span>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg width="100%" height="100%"><pattern id="land-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={GREEN_LIGHT} /></pattern><rect width="100%" height="100%" fill="url(#land-dots)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>How We Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black opacity-5 text-white">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: i % 2 === 0 ? GREEN_GLOW : BROWN_GLOW }}>
                    <step.icon size={24} weight="duotone" style={{ color: i % 2 === 0 ? GREEN_LIGHT : BROWN_LIGHT }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BROWN_LIGHT }}>{step.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 z-10">
                      <ArrowRight size={20} style={{ color: GREEN_LIGHT }} className="opacity-40" />
                    </div>
                  )}
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Happy Homeowners" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GREEN_LIGHT }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GREEN_LIGHT }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SEASONAL SERVICES ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Year-Round Care</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Seasonal Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalServices.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <s.icon size={28} weight="duotone" style={{ color: s.color }} className="mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-3">{s.season}</h3>
                  <ul className="space-y-2">
                    {s.services.map((svc, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle size={14} weight="duotone" style={{ color: GREEN_LIGHT }} className="shrink-0" />{svc}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                  <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} className="text-slate-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: BROWN_LIGHT }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Free Consultation" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Ready to transform your outdoor space? Contact us for a free on-site consultation and estimate. No obligation, just expert advice.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Service Area", value: "Greater Metro Area\nUp to 50 mile radius" },
                  { icon: Phone, label: "Phone", value: "(555) 298-4567" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 7am-6pm\nSaturday 8am-4pm\nSunday Closed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: GREEN_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request a Free Estimate</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                <input type="text" placeholder="Property Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm focus:outline-none focus:border-green-500/50">
                  <option value="">Service Needed</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Describe your project..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Request Free Estimate</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Tree size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
            <span>Evergreen Landscapes &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
