"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

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
  Eye,
  Envelope,
  PlayCircle,
  Recycle,
  Plant,
  Medal,
  Check,
  Certificate,
  HandPointing,
  SealCheck,
  FlowerLotus,
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
const BG = "#0f1a0f";
const PRIMARY = "#16a34a";
const PRIMARY_LIGHT = "#22c55e";
const EARTH = "#a3845b";
const EARTH_DARK = "#7c6340";
const PRIMARY_GLOW = "rgba(22, 163, 74, 0.15)";
const EARTH_GLOW = "rgba(163, 132, 91, 0.12)";

/* ───────────────────────── FLOATING LEAF SVG BG ───────────────────────── */
function FloatingLeaves() {
  const leaves = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 14,
    duration: 12 + Math.random() * 10,
    size: 14 + Math.random() * 10,
    opacity: 0.06 + Math.random() * 0.1,
    rotation: Math.random() * 360,
    sway: 25 + Math.random() * 50,
    color: i % 3 === 0 ? EARTH : PRIMARY_LIGHT,
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
          <Leaf size={l.size} weight="fill" style={{ color: l.color }} />
        </motion.div>
      ))}
    </div>
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
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${PRIMARY}, transparent, ${EARTH}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── 3D TILT CARD ───────────────────────── */
function TiltCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, springFast);
  const sRotY = useSpring(rotY, springFast);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / (rect.height / 2)) * -8);
    rotY.set(((e.clientX - cx) / (rect.width / 2)) * 8);
  }, [rotX, rotY]);

  const handleLeave = useCallback(() => { rotX.set(0); rotY.set(0); }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: "preserve-3d", willChange: "transform", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────── LEAF SVG PATTERN ───────────────────────── */
function LeafPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="leaf-pat" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 Q50 30 40 50 Q30 30 40 10Z" fill={PRIMARY_LIGHT} fillOpacity="0.4" />
            <path d="M10 60 Q20 50 30 60 Q20 70 10 60Z" fill={EARTH} fillOpacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#leaf-pat)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Landscape Design", desc: "Custom design from site analysis to 3D concept — blending Pacific Northwest ecology with bold, artful composition.", icon: PaintBrush },
  { title: "Lawn Maintenance", desc: "Weekly mowing, edging, fertilization, and seasonal treatments that keep your lawn magazine-cover green year-round.", icon: Leaf },
  { title: "Hardscaping", desc: "Patios, walkways, retaining walls, and fire pits built with natural stone and premium pavers — structures that last decades.", icon: Mountains },
  { title: "Irrigation Systems", desc: "Smart irrigation design, installation, and repairs. Efficient watering that conserves water while keeping every zone thriving.", icon: Drop },
  { title: "Outdoor Lighting", desc: "Architectural and path lighting that transforms your property after dark — LED, smart controls, warm ambiance.", icon: Lightning },
  { title: "Tree & Shrub Care", desc: "Expert pruning, shaping, disease treatment, and transplanting. Keeping your mature canopy healthy and beautiful.", icon: Tree },
  { title: "Water Features", desc: "Ponds, fountains, streams, and waterfalls designed to bring soothing sound and movement to your outdoor space.", icon: Drop },
  { title: "Seasonal Cleanup", desc: "Spring prep, fall leaf removal, gutter clearing, and winter bed prep — keeping your yard pristine every season.", icon: Flower },
];

const processSteps = [
  { step: "01", title: "Site Visit & Vision", desc: "We walk your property together, listen to your goals, assess soil and sun, and capture measurements.", icon: Eye },
  { step: "02", title: "Concept Design", desc: "Diego creates a detailed concept with 3D renderings, plant palettes, material selections, and a phased budget.", icon: Ruler },
  { step: "03", title: "Plant Selection", desc: "We hand-pick every plant for your site conditions — native species, seasonal color, texture, and mature size.", icon: Plant },
  { step: "04", title: "Expert Installation", desc: "Our certified crews build with precision — proper grading, soil prep, irrigation ties, and clean workmanship.", icon: Shovel },
  { step: "05", title: "Ongoing Care", desc: "Maintenance programs keep your investment thriving season after season. We are partners for the long haul.", icon: Heart },
];

const projects = [
  { title: "Japanese Zen Garden", location: "Capitol Hill", scope: "Stone paths, koi pond, bamboo fencing, moss beds", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80" },
  { title: "Modern Patio", location: "Bellevue", scope: "600 sq ft paver patio, fire pit, built-in seating", image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&q=80" },
  { title: "Native Plant Restoration", location: "Magnolia", scope: "Full yard native conversion, pollinator garden, rain garden", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80" },
  { title: "Outdoor Kitchen", location: "Mercer Island", scope: "Built-in grill, bar counter, pergola, landscape lighting", image: "/images/landscaping-outdoor-grill.png" },
  { title: "Rain Garden", location: "Fremont", scope: "Bioswale, native plantings, permeable pavers, downspout capture", image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80" },
  { title: "Fire Pit Lounge", location: "Kirkland", scope: "Natural stone fire pit, curved seating wall, accent lighting", image: "/images/landscaping-fire-pit.png" },
];

const seasonalData = [
  { season: "Spring", color: PRIMARY_LIGHT, icon: Flower, tasks: ["New plantings & mulching", "Soil amendment & fertilization", "Irrigation activation", "Lawn dethatching"] },
  { season: "Summer", color: EARTH, icon: Sun, tasks: ["Irrigation monitoring & adjustment", "Weekly lawn maintenance", "Pest & disease management", "Deadheading & shaping"] },
  { season: "Fall", color: EARTH_DARK, icon: Leaf, tasks: ["Leaf removal & cleanup", "Aeration & overseeding", "Fall bulb planting", "Irrigation winterization"] },
  { season: "Winter", color: PRIMARY, icon: Snowflake, tasks: ["Structural pruning", "Design planning for spring", "Hardscape repairs", "Holiday lighting install"] },
];

const testimonials = [
  { name: "The Watsons", text: "Diego turned our mud pit into a Japanese garden. The neighbors stop to take photos every time they walk by.", image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=400&q=80" },
  { name: "Jen & Mike R.", text: "Our backyard is now the reason we don't go on vacation. Why leave paradise?", image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&q=80" },
  { name: "Dr. Sarah Kim", text: "The native plant rain garden handles all our runoff AND looks beautiful year-round.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80" },
  { name: "The Andersons", text: "From bare dirt to outdoor kitchen with dining for 12. Diego is a magician.", image: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=400&q=80" },
  { name: "Paul T.", text: "We hired 3 landscapers before Diego. He's the only one who actually DESIGNED something.", image: "https://images.unsplash.com/photo-1560749003-f4b1e17e2dff?w=400&q=80" },
];

const comparisonRows = [
  { feature: "Licensed Landscape Architect", us: true, them: false },
  { feature: "Custom 3D Design Renderings", us: true, them: false },
  { feature: "Native Plant Expertise", us: true, them: false },
  { feature: "Irrigation Engineering", us: true, them: "Sometimes" },
  { feature: "Year-Round Maintenance Plans", us: true, them: "Limited" },
  { feature: "Eco-Friendly / Sustainable Methods", us: true, them: false },
  { feature: "Project Warranty", us: true, them: "Varies" },
];

const ecoFeatures = [
  { title: "Native Plants", desc: "Pacific Northwest species that thrive naturally — less water, zero pesticides, maximum beauty.", icon: Plant },
  { title: "Water Conservation", desc: "Smart irrigation, rain gardens, and permeable surfaces that reduce water use by up to 50%.", icon: Drop },
  { title: "Organic Methods", desc: "No synthetic fertilizers or harmful chemicals. Healthy soil biology builds a self-sustaining landscape.", icon: Recycle },
  { title: "Pollinator Gardens", desc: "Designed habitats for bees, butterflies, and hummingbirds — supporting local biodiversity.", icon: FlowerLotus },
];

const faqs = [
  { q: "How much does a landscape design cost?", a: "Landscape design fees start at $2,500 for a comprehensive plan including 3D renderings and plant palettes. Full yard makeovers with installation typically range from $8,000 to $50,000+ depending on scope, materials, and site complexity. We provide detailed quotes after a free on-site consultation." },
  { q: "What is the best time of year to start a project?", a: "Spring and early fall are ideal for planting in the Pacific Northwest. Hardscaping (patios, walls, walkways) can be done most of the year. We recommend booking your design consultation 4-6 weeks before you want installation to begin." },
  { q: "Do you offer maintenance after installation?", a: "Absolutely. We offer weekly, bi-weekly, and monthly maintenance plans customized to your property. These include mowing, edging, fertilization, seasonal pruning, irrigation management, and cleanup. Most clients find ongoing care essential to protect their investment." },
  { q: "Are you licensed and insured?", a: "Yes. Diego is a WALP-certified licensed landscape architect. Cascade Landscapes is fully licensed, bonded, and insured in Washington State. We carry general liability and workers compensation coverage on every job site." },
  { q: "Do you guarantee your plants?", a: "We offer a one-year warranty on all plants and trees we install, provided recommended care instructions are followed. If anything does not survive within that year, we replace it at no additional cost." },
  { q: "Can you work with my existing landscape?", a: "Absolutely. Many of our projects involve refreshing or enhancing existing landscapes rather than starting from scratch. Diego can assess what is working, what needs attention, and create a phased plan that respects your budget and existing plantings." },
];

/* hero floating card images — all unique */
const heroCards = [
  { src: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=600&q=80", alt: "Lush garden pathway" },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", alt: "Stone patio with furniture" },
  { src: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=80", alt: "Beautiful garden design" },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2LandscapingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openService, setOpenService] = useState<number | null>(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingLeaves />

      {/* ═══════════════ NAV ═══════════════ */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Tree size={24} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Cascade Landscapes</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              {["Services", "Portfolio", "About", "Reviews", "Contact"].map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="hidden sm:flex px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                Free Consultation
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "Portfolio", "About", "Reviews", "Contact"].map((l) => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══════════════ 1. HERO — FLOATING CARDS OVER GRADIENT ═══════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-12 z-10 overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${BG} 0%, #0a2a12 30%, #0f1a0f 50%, #1a0f0a 70%, ${BG} 100%)` }} />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.12, filter: "blur(100px)" }} />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${EARTH} 0%, transparent 60%)`, opacity: 0.08, filter: "blur(80px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[70vh]">
            {/* Text */}
            <div className="lg:col-span-5 space-y-6 z-10">
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-[0.2em]" style={{ color: PRIMARY_LIGHT }}>
                Seattle&apos;s Premier Landscape Architect
              </motion.p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] font-bold text-white">
                <WordReveal text="Transforming Seattle's Outdoors" />
              </h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
                Diego Herrera brings 16 years of licensed landscape architecture to every yard — blending Pacific Northwest ecology with bold tropical design.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  Free Design Consultation <ArrowRight size={18} weight="bold" />
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> (206) 555-0642
                </MagneticButton>
              </motion.div>
            </div>

            {/* Floating Cards */}
            <div className="lg:col-span-7 relative hidden md:block" style={{ perspective: 1200 }}>
              <div className="relative h-[520px]">
                {heroCards.map((card, i) => {
                  const positions = [
                    { top: "0%", left: "5%", rotate: -6, z: 3 },
                    { top: "12%", left: "35%", rotate: 4, z: 2 },
                    { top: "30%", left: "10%", rotate: -2, z: 1 },
                  ];
                  const p = positions[i];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 60, rotateY: -15 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ ...spring, delay: 0.3 + i * 0.2 }}
                      className="absolute"
                      style={{ top: p.top, left: p.left, zIndex: p.z }}
                    >
                      <TiltCard
                        className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/40"
                        style={{ transform: `rotate(${p.rotate}deg)` }}
                      >
                        <div className="relative w-[280px] h-[200px] md:w-[320px] md:h-[220px]">
                          <img src={card.src} alt={card.alt} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)` }} />
                        </div>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile hero image */}
            <div className="md:hidden">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={heroCards[0].src} alt={heroCards[0].alt} className="w-full h-[250px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 2. TRUST BAR ═══════════════ */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-5 md:p-6">
            <motion.div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {[
                { icon: Medal, label: "16 Years Experience" },
                { icon: Certificate, label: "WALP Certified" },
                { icon: CheckCircle, label: "500+ Yards Transformed" },
                { icon: SealCheck, label: "Licensed Architect" },
                { icon: Recycle, label: "Eco-Pro Certified" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-slate-300">
                  <item.icon size={18} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ 3. SERVICES — 8 ACCORDION CARDS ═══════════════ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <LeafPattern opacity={0.025} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side — sticky header */}
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>What We Do</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Complete Landscape Services" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                From initial design to ongoing seasonal care, Cascade Landscapes handles every element of your outdoor space. Click any service to learn more.
              </p>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                  <span className="text-sm text-slate-400">Now scheduling spring &amp; summer projects</span>
                </div>
              </div>
            </div>
            {/* Right side — accordion */}
            <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {services.map((svc, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="overflow-hidden">
                    <button
                      onClick={() => setOpenService(openService === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: i % 2 === 0 ? PRIMARY_GLOW : EARTH_GLOW }}>
                          <svc.icon size={20} weight="duotone" style={{ color: i % 2 === 0 ? PRIMARY_LIGHT : EARTH }} />
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
                          <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed pl-[4.5rem]">{svc.desc}</p>
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

      {/* ═══════════════ 4. BEFORE / AFTER ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY}40, transparent)` }} />
        </div>
        <div className="mx-auto max-w-5xl px-4 md:px-6 relative">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>The Cascade Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Before & After" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                <img src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80" alt="Landscape transformation — before state" className="w-full h-full object-cover" style={{ objectPosition: "left center" }} />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/80 text-white backdrop-blur-sm">Before</div>
              </div>
            </GlassCard>
            <GlassCard className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                <img src="/images/landscaping-before-after.png" alt="Landscape transformation — before and after" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm" style={{ background: `${PRIMARY}cc` }}>After</div>
              </div>
            </GlassCard>
          </div>
          <p className="text-center text-slate-500 text-sm mt-6">Complete yard transformation — new patio, plantings, lighting, and irrigation.</p>
        </div>
      </SectionReveal>

      {/* ═══════════════ WHY CASCADE — VALUE PROPS ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY_LIGHT }}>The Cascade Promise</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Why Homeowners Trust Us" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Certificate, title: "Licensed Architect", desc: "Diego is a WALP-certified licensed landscape architect — not a mow-and-go crew with a truck." },
              { icon: PaintBrush, title: "Custom Designs", desc: "Every project gets original 3D concept renderings tailored to your property, taste, and budget." },
              { icon: Recycle, title: "Eco-First Approach", desc: "Native plants, organic soil, water conservation — landscapes that are beautiful and responsible." },
              { icon: ShieldCheck, title: "1-Year Warranty", desc: "Every plant and installation backed by a full one-year guarantee. If it does not thrive, we replace it." },
            ].map((v, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                    <v.icon size={24} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 5. DESIGN PROCESS — 5 STEPS ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%"><pattern id="land-dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill={PRIMARY_LIGHT} /></pattern><rect width="100%" height="100%" fill="url(#land-dots)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>How We Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Design Process" />
            </h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line connecting steps */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px hidden md:block" style={{ background: `linear-gradient(180deg, transparent, ${PRIMARY}60, ${EARTH}40, transparent)` }} />
            <motion.div className="space-y-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {processSteps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className={`flex items-start gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <GlassCard className="p-6 inline-block">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                          <step.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: EARTH }}>Step {step.step}</span>
                          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </GlassCard>
                  </div>
                  <div className="hidden md:flex w-12 shrink-0 justify-center relative z-10">
                    <div className="w-4 h-4 rounded-full border-2 mt-8" style={{ borderColor: PRIMARY_LIGHT, background: BG }} />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 6. MEET DIEGO — OWNER SPOTLIGHT ═══════════════ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.08, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&q=80" alt="Diego Herrera — Cascade Landscapes founder" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-5 py-3 flex items-center gap-3">
                  <Certificate size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="text-sm text-white font-medium">WALP Certified Landscape Architect</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Meet Your Designer</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Diego Herrera" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Born in Medell&iacute;n and raised in Seattle, Diego brings a rare tropical design sensibility to Pacific Northwest landscapes. His Colombian roots inspire bold color palettes and lush layering that stand out against the evergreen backdrop of the Puget Sound.</p>
                <p>With 16 years of licensed landscape architecture, a WALP certification, and a deep commitment to sustainable design, Diego has transformed over 500 Seattle-area yards into living works of art.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "WALP Certified" },
                  { icon: ShieldCheck, label: "Licensed & Insured" },
                  { icon: Recycle, label: "Eco-Pro Certified" },
                  { icon: Heart, label: "Locally Owned" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                    </div>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 7. PROJECT PORTFOLIO — STAGGERED MASONRY ═══════════════ */}
      <SectionReveal id="portfolio" className="relative z-10 py-16 md:py-24">
        <LeafPattern opacity={0.02} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Project Portfolio" />
            </h2>
          </div>
          <motion.div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {projects.map((p, i) => {
              const heights = ["h-[280px]", "h-[340px]", "h-[260px]", "h-[320px]", "h-[290px]", "h-[350px]"];
              return (
                <motion.div key={i} variants={fadeUp} className="break-inside-avoid">
                  <div className="group relative rounded-2xl overflow-hidden border border-white/10">
                    <img src={p.image} alt={p.title} className={`w-full ${heights[i]} object-cover transition-transform duration-700 group-hover:scale-105`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-semibold text-lg">{p.title}</h3>
                      <p className="text-sm mt-1 flex items-center gap-1" style={{ color: PRIMARY_LIGHT }}>
                        <MapPin size={14} weight="fill" /> {p.location}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{p.scope}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 8. SEASONAL SERVICES CALENDAR ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Year-Round Partnership</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Seasonal Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {seasonalData.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full group hover:border-green-500/20 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                      <s.icon size={22} weight="duotone" style={{ color: s.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{s.season}</h3>
                  </div>
                  <ul className="space-y-2">
                    {s.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle size={14} weight="duotone" style={{ color: s.color }} className="shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 9. YARD QUIZ ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <HandPointing size={32} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mx-auto mb-3" />
                <h2 className="text-3xl md:text-4xl tracking-tighter font-bold text-white mb-2">What Does Your Yard Need?</h2>
                <p className="text-slate-400">Select the option that best describes your situation.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Regular Maintenance", color: PRIMARY_LIGHT, desc: "Weekly lawn care & upkeep" },
                  { label: "Full Makeover", color: "#f59e0b", desc: "Complete redesign & build" },
                  { label: "Hardscaping Project", color: EARTH, desc: "Patio, walkway, or wall" },
                  { label: "Seasonal Cleanup", color: "#f97316", desc: "One-time cleanup service" },
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizChoice(i)}
                    className={`p-5 rounded-xl text-left border transition-all duration-300 cursor-pointer ${quizChoice === i ? "border-green-500/50 bg-white/[0.08]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
                  >
                    <div className="w-3 h-3 rounded-full mb-3" style={{ background: opt.color }} />
                    <div className="text-white font-semibold">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
              {quizChoice !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <MagneticButton className="px-8 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                    <span className="flex items-center gap-2"><Phone size={16} weight="duotone" /> Call (206) 555-0642 for a Free Quote</span>
                  </MagneticButton>
                </motion.div>
              )}
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════ 10. PRICING ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Transparent Pricing</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Investment Guide" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { title: "Weekly Lawn Care", price: "from $45", period: "/visit", features: ["Mowing & edging", "Blowing & cleanup", "Seasonal fertilization", "Weed management"], accent: PRIMARY },
              { title: "Landscape Design", price: "from $2,500", period: "", features: ["Site analysis & vision", "3D concept renderings", "Full plant palette", "Installation blueprint"], accent: PRIMARY_LIGHT, highlight: true },
              { title: "Full Yard Makeover", price: "from $8,000+", period: "", features: ["Complete design & build", "Hardscaping included", "Irrigation & lighting", "1-year plant warranty"], accent: EARTH },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                {tier.highlight ? (
                  <ShimmerBorder>
                    <div className="p-7">
                      <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY_LIGHT }}>Most Popular</div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                      <div className="text-3xl font-black text-white">{tier.price}<span className="text-base font-normal text-slate-500">{tier.period}</span></div>
                      <ul className="mt-6 space-y-3">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                            <Check size={16} weight="bold" style={{ color: PRIMARY_LIGHT }} />{f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                        Get Started
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-7 h-full">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                    <div className="text-3xl font-black text-white">{tier.price}<span className="text-base font-normal text-slate-500">{tier.period}</span></div>
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={16} weight="bold" style={{ color: tier.accent }} />{f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/10 cursor-pointer">
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 11. ECO-FRIENDLY SECTION ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.06, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: PRIMARY_LIGHT }}>Earth-First Landscaping</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Sustainable by Design" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Every Cascade project starts with the planet in mind. Diego integrates native species, water-saving technology, and organic soil practices into every design — creating landscapes that are beautiful today and resilient for generations.
              </p>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {ecoFeatures.map((eco, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PRIMARY_GLOW }}>
                        <eco.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{eco.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">{eco.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80" alt="Sustainable native plant garden" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0f]/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="px-4 py-2 rounded-full backdrop-blur-md border border-green-500/30 bg-black/40 flex items-center gap-2">
                  <Recycle size={16} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  <span className="text-sm font-medium text-white">50% Less Water Usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ EMERGENCY / STORM RESPONSE ═══════════════ */}
      <SectionReveal className="relative z-10 py-8">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${PRIMARY}30` }}>
                    <Tree size={24} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Storm Damage? We Respond Fast.</h3>
                  <p className="text-sm text-slate-400">Emergency tree removal and landscape repair for existing clients within 24 hours. New clients welcome for urgent situations.</p>
                </div>
              </div>
              <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white whitespace-nowrap cursor-pointer flex items-center gap-2" style={{ background: PRIMARY } as React.CSSProperties}>
                <Phone size={16} weight="duotone" /> Call Now
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══════════════ 12. TESTIMONIALS — PHOTO CARDS ═══════════════ */}
      <SectionReveal id="reviews" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Google Reviews Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/[0.03]">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={18} weight="fill" style={{ color: PRIMARY_LIGHT }} />))}</div>
              <span className="text-sm text-white font-medium">4.9</span>
              <span className="text-sm text-slate-400">from 200+ Google reviews</span>
            </div>
          </div>
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-4">
              <WordReveal text="What Homeowners Say" />
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={16} weight="fill" style={{ color: PRIMARY_LIGHT }} />))}</div>
              <span>4.9 average from 200+ reviews</span>
            </div>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className={i >= 3 ? "sm:col-span-1 lg:col-span-1" : ""}>
                <GlassCard className="overflow-hidden h-full flex flex-col">
                  <div className="h-36 overflow-hidden relative">
                    <img src={t.image} alt={`Project for ${t.name}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a0f] via-transparent to-transparent" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <Quotes size={24} weight="fill" style={{ color: PRIMARY_LIGHT }} className="mb-2 opacity-40" />
                    <p className="text-sm text-slate-300 leading-relaxed flex-1">{t.text}</p>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{t.name}</span>
                      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: PRIMARY_LIGHT }} />))}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 13. COMPETITOR COMPARISON ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Why Cascade</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Cascade vs Mow-and-Go Services" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-semibold text-white">Cascade</th>
                    <th className="text-center p-4 text-slate-500 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: PRIMARY_LIGHT }} className="inline-block" />
                      </td>
                      <td className="p-4 text-center text-slate-500">
                        {row.them === true ? <CheckCircle size={20} weight="fill" className="inline-block text-slate-500" /> : row.them === false ? <X size={20} className="inline-block text-red-400/60" /> : <span className="text-xs">{row.them}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ 14. VIDEO PLACEHOLDER ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" alt="Beautiful landscaped backyard" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 group-hover:scale-110 transition-transform">
                <PlayCircle size={48} weight="fill" style={{ color: PRIMARY_LIGHT }} />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white font-semibold text-lg">See Our Transformations</p>
              <p className="text-slate-400 text-sm mt-1">Watch Diego and the team bring yards to life</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 15. CONTACT FORM ═══════════════ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: `radial-gradient(circle, ${PRIMARY} 0%, transparent 60%)`, opacity: 0.05, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Get Started</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Free Design Consultation" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Ready to transform your outdoor space? Diego personally visits every property for a no-obligation design consultation.
              </p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Office", value: "4520 Sand Point Way NE, Seattle, WA 98105", href: "https://maps.google.com/?q=4520+Sand+Point+Way+NE+Seattle+WA+98105" },
                  { icon: Phone, label: "Phone", value: "(206) 555-0642", href: "tel:+12065550642" },
                  { icon: Envelope, label: "Email", value: "design@cascadelandscapes.com", href: "mailto:design@cascadelandscapes.com" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 7am-6pm | Sat 8am-4pm" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm text-slate-400">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                <span className="text-sm text-slate-400">Now booking spring and summer projects</span>
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Request Your Free Consultation</h3>
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
                <textarea placeholder="Tell us about your vision..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: PRIMARY } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Book Free Consultation</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══════════════ ENHANCED SERVICE AREA ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Where We Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Serving Greater Seattle" />
            </h2>
          </div>
          <GlassCard className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <MapPin size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Coverage Area</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Seattle, Bellevue, Kirkland, Mercer Island, Redmond, Issaquah, Sammamish, Woodinville, and surrounding communities within 30 miles.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <Clock size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Response Time</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Free consultations typically scheduled within 3-5 business days. Emergency tree and storm damage response within 24 hours for existing clients.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: PRIMARY_GLOW }}>
                  <CalendarCheck size={28} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Availability</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRIMARY_LIGHT }} />
                  <span className="text-sm font-medium" style={{ color: PRIMARY_LIGHT }}>Accepting New Projects</span>
                </div>
                <p className="text-sm text-slate-400">Mon-Fri 7am-6pm | Sat 8am-4pm</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex flex-wrap justify-center gap-3">
                {["Capitol Hill", "Ballard", "Fremont", "Magnolia", "Queen Anne", "Bellevue", "Kirkland", "Mercer Island", "Redmond", "Sammamish"].map((area) => (
                  <span key={area} className="px-3 py-1 rounded-full text-xs border border-white/10 text-slate-400 bg-white/[0.02]">{area}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══════════════ FAQ ═══════════════ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: EARTH }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Frequently Asked" />
            </h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══════════════ 16. FOOTER ═══════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tree size={22} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
                <span className="text-lg font-bold text-white">Cascade Landscapes</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">Transforming Seattle&apos;s outdoors since 2010. Licensed landscape architecture with a passion for sustainable, site-specific design.</p>
              <div className="flex flex-wrap gap-2">
                {["WALP", "Eco-Pro", "Licensed", "Insured"].map((badge) => (
                  <span key={badge} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 text-slate-500 bg-white/[0.02]">{badge}</span>
                ))}
              </div>
            </div>
            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {services.slice(0, 6).map((svc) => (
                  <li key={svc.title}><a href="#services" className="hover:text-white transition-colors">{svc.title}</a></li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#about" className="hover:text-white transition-colors">About Diego</a></li>
                <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Free Consultation</a></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-slate-500">
                <p className="flex items-start gap-2">
                  <Phone size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href="tel:+12065550642" className="hover:text-white transition-colors">(206) 555-0642</a>
                </p>
                <p className="flex items-start gap-2">
                  <Envelope size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href="mailto:design@cascadelandscapes.com" className="hover:text-white transition-colors">design@cascadelandscapes.com</a>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <a href="https://maps.google.com/?q=4520+Sand+Point+Way+NE+Seattle+WA+98105" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">4520 Sand Point Way NE<br />Seattle, WA 98105</a>
                </p>
                <p className="flex items-start gap-2">
                  <Clock size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} className="mt-0.5 shrink-0" />
                  <span>Mon-Fri 7am-6pm<br />Sat 8am-4pm</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Tree size={14} weight="duotone" style={{ color: PRIMARY_LIGHT }} />
              <span>Cascade Landscapes &copy; {new Date().getFullYear()}. All rights reserved.</span>
            </div>
            <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400 transition-colors">bluejayportfolio.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
