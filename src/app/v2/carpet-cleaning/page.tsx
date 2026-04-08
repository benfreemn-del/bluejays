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
  Sparkle,
  Wind,
  Drop,
  Dog,
  Rug,
  BuildingOffice,
  CheckCircle,
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
const BG = "#0f1520";
const ACCENT = "#06b6d4";
const ACCENT_LIGHT = "#67e8f9";
const ACCENT_GLOW = "rgba(6, 182, 212, 0.15)";

/* ───────────────────────── SPARKLE NAV ICON ───────────────────────── */
function SparkleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L18.6667 10.6667L25.3333 13.3333L18.6667 16L16 22.6667L13.3333 16L6.66667 13.3333L13.3333 10.6667L16 4Z" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.3333 4L24 8L22.6667 4L24 0L25.3333 4Z" fill={ACCENT} />
      <path d="M9.33333 22.6667L8 26.6667L6.66667 22.6667L4 21.3333L6.66667 20L8 16L9.33333 20L12 21.3333L9.33333 22.6667Z" stroke={ACCENT} strokeWidth="1.5" />
    </svg>
  );
}

/* ───────────────────────── BUBBLE SVG PATTERN ───────────────────────── */
function BubblePattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.04]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="bubble-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill={ACCENT_LIGHT} />
            <circle cx="40" cy="50" r="2" fill={ACCENT_LIGHT} />
            <circle cx="70" cy="20" r="1" fill={ACCENT_LIGHT} />
            <circle cx="25" cy="70" r="2.5" fill={ACCENT_LIGHT} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bubble-pattern)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 10 + Math.random() * 8,
    size: 1.5 + Math.random() * 3,
    opacity: 0.05 + Math.random() * 0.1,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: ACCENT_LIGHT, willChange: "transform, opacity" }}
          animate={{ y: ["110vh", "-10vh"], opacity: [0, p.opacity, p.opacity, 0] }}
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

function GlassCard({ children, className = "", style, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (<div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`} style={style} onClick={onClick}>{children}</div>);
}

function MagneticButton({ children, className = "", onClick, style, type }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; type?: "button" | "submit" | "reset" }) {
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
    <motion.button ref={ref} type={type} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>
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
  { title: "Deep Steam Cleaning", description: "Our hot water extraction method penetrates deep into carpet fibers, removing embedded dirt, allergens, and bacteria for a truly deep clean.", icon: Wind },
  { title: "Advanced Stain Removal", description: "We tackle tough stains like wine, coffee, ink, and pet accidents using specialized, non-toxic solutions that are safe for your family and pets.", icon: Sparkle },
  { title: "Pet Odor & Dander Treatment", description: "Our enzymatic treatment breaks down and eliminates pet odors at the source, rather than just masking them, leaving your carpets fresh.", icon: Dog },
  { title: "Upholstery & Fabric Cleaning", description: "We safely clean sofas, chairs, and other upholstered furniture, removing dirt and allergens to restore their beauty and freshness.", icon: Rug },
  { title: "Tile & Grout Cleaning", description: "Our high-pressure cleaning system removes years of built-up grime from tile and grout lines, making your floors look new again.", icon: Drop },
  { title: "Commercial Carpet Care", description: "Customized cleaning plans for offices, retail spaces, and high-traffic commercial areas to maintain a professional and healthy environment.", icon: BuildingOffice },
];

const testimonials = [
  { name: "Jessica L.", text: "FreshStart made our 10-year-old carpets look brand new. The team was professional, on time, and the pet odor is completely gone. I'm amazed!", rating: 5 },
  { name: "Mark T., Property Manager", text: "We use FreshStart for all our apartment turnovers. They are reliable, efficient, and do a fantastic job every time. Their commercial service is a lifesaver.", rating: 5 },
  { name: "The Rodriguez Family", text: "With two kids and a dog, our carpets take a beating. FreshStart's deep cleaning service is a miracle worker. Highly recommend their services!", rating: 5 },
];

const certifications = [
  "IICRC Certified Technicians", "Eco-Friendly Cleaning Solutions", "Licensed & Insured", "100% Satisfaction Guarantee", "Advanced Stain Removal Certified", "Pet Odor Control Specialists", "5-Star Rated on Google", "Fast Drying Times",
];

const faqData = [
  { q: "How long does it take for carpets to dry?", a: "Typically, carpets will be dry to the touch within 4-6 hours. However, we recommend minimizing foot traffic for 24 hours for best results. Air circulation from fans can speed up the process." },
  { q: "Are your cleaning products safe for kids and pets?", a: "Absolutely. We use non-toxic, biodegradable cleaning solutions that are powerful on dirt but gentle on your loved ones and the environment." },
  { q: "Do I need to move my furniture before you arrive?", a: "We ask that you move small items and breakables. Our technicians can typically move light furniture (sofas, chairs, tables) and will move it back after cleaning." },
  { q: "How often should I have my carpets professionally cleaned?", a: "Most manufacturers recommend professional deep cleaning every 12-18 months to maintain your carpet's warranty and prolong its life. Homes with pets or children may benefit from cleaning every 6-9 months." },
  { q: "Can you remove any stain?", a: "We have a very high success rate with our advanced stain removal techniques. While we can't guarantee removal of every stain (e.g., permanent dyes), we can significantly improve or completely remove the vast majority." },
  { q: "What is the difference between steam cleaning and dry cleaning?", a: "We use hot water extraction (often called steam cleaning), which is the method recommended by most carpet manufacturers. It provides a deeper, more thorough clean than chemical 'dry' cleaning methods." },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1595896123483-175037c191b6?w=600&q=80",
  "https://images.unsplash.com/photo-1616627781431-d508090f8801?w=600&q=80",
  "https://images.unsplash.com/photo-1567016432779-1fee74a5f39b?w=600&q=80",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80",
  "https://images.unsplash.com/photo-1540574163024-5884b0b5b529?w=600&q=80",
  "https://images.unsplash.com/photo-1615875617133-22a7952a3924?w=600&q=80",
];

/* ───────────────────────── MAIN PAGE COMPONENT ───────────────────────── */
export default function V2CarpetCleaningPage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Services", id: "services" },
    { name: "About", id: "about" },
    { name: "Testimonials", id: "testimonials" },
    { name: "Contact", id: "contact" },
  ];

  return (
    <div style={{ background: BG, color: "#e2e8f0" }} className="font-sans antialiased relative">
      <BubblePattern />
      <FloatingParticles />

      {/* ────────────────── HEADER & NAV ────────────────── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl mx-auto z-50">
        <GlassCard className="flex items-center justify-between p-3">
          <motion.div whileHover={{ scale: 1.05 }} transition={springFast} className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo("hero")}>
            <SparkleIcon size={32} />
            <span className="font-bold text-lg text-white">FreshStart</span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <MagneticButton key={link.id} className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors" onClick={() => scrollTo(link.id)}>
                {link.name}
              </MagneticButton>
            ))}
          </nav>
          <MagneticButton className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
            Get a Free Quote <ArrowRight />
          </MagneticButton>
          <div className="md:hidden">
            <MagneticButton onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full">
              <List size={24} weight="bold" />
            </MagneticButton>
          </div>
        </GlassCard>
      </header>

      {/* ────────────────── MOBILE MENU ────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={spring}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg md:hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <SparkleIcon size={28} />
                <span className="font-bold text-lg text-white">FreshStart</span>
              </div>
              <MagneticButton onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full">
                <X size={24} weight="bold" />
              </MagneticButton>
            </div>
            <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] gap-6">
              {navLinks.map((link) => (
                <span key={link.id} onClick={() => scrollTo(link.id)} className="text-3xl font-semibold text-slate-200">
                  {link.name}
                </span>
              ))}
              <button onClick={() => scrollTo("contact")} className="mt-4 px-8 py-4 rounded-full text-xl font-semibold text-white" style={{ background: ACCENT }}>
                Get a Free Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-12">
        {/* ────────────────── HERO ────────────────── */}
        <section id="hero" className="relative min-h-[80vh] flex items-center justify-center text-center -mt-20 -mb-12 md:-mb-24">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80" alt="Clean living room carpet" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, transparent, ${BG} 80%)` }}></div>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tighter">
              <WordReveal text="A Deeper Clean, A Fresher Home" />
            </h1>
            <p className="text-lg md:text-xl max-w-2xl text-slate-300 mb-10">
              <WordReveal text="Experience the FreshStart difference. We remove the toughest dirt and allergens, leaving your carpets spotless, healthy, and smelling fresh." />
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                Book Your Cleaning
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-slate-300 bg-white/5 border border-white/10" onClick={() => scrollTo("services")}>
                View Our Services
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* ────────────────── STATS BAR ────────────────── */}
        <SectionReveal className="grid grid-cols-2 md:grid-cols-4 gap-8 my-24 text-center">
          <div className="flex flex-col items-center gap-2">
            <Star size={32} weight="fill" style={{ color: ACCENT_LIGHT }} />
            <p className="font-semibold text-white">5-Star Rated</p>
            <p className="text-sm text-slate-400">Over 200 Reviews</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck size={32} weight="fill" style={{ color: ACCENT_LIGHT }} />
            <p className="font-semibold text-white">IICRC Certified</p>
            <p className="text-sm text-slate-400">Industry Standard</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={32} weight="fill" style={{ color: ACCENT_LIGHT }} />
            <p className="font-semibold text-white">Satisfaction Guaranteed</p>
            <p className="text-sm text-slate-400">We Get It Right</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkle size={32} weight="fill" style={{ color: ACCENT_LIGHT }} />
            <p className="font-semibold text-white">Eco-Friendly</p>
            <p className="text-sm text-slate-400">Safe for Family & Pets</p>
          </div>
        </SectionReveal>

        {/* ────────────────── SERVICES ────────────────── */}
        <SectionReveal id="services" className="py-24">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Our Cleaning Services</h2>
          <p className="text-lg text-center max-w-3xl mx-auto text-slate-300 mb-12">From a single room to your entire home or office, we have the expertise to restore your carpets and fabrics.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <GlassCard key={i} className="p-6 cursor-pointer" onClick={() => setOpenAccordion(openAccordion === i ? null : i)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <service.icon size={28} weight="light" style={{ color: ACCENT }} />
                    <h3 className="font-semibold text-lg text-white">{service.title}</h3>
                  </div>
                  <motion.div animate={{ rotate: openAccordion === i ? 180 : 0 }} transition={spring}><CaretDown /></motion.div>
                </div>
                <AnimatePresence>
                  {openAccordion === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                      <p className="text-slate-400 pt-3 border-t border-white/10">{service.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ────────────────── PORTFOLIO/GALLERY ────────────────── */}
        <SectionReveal id="portfolio" className="py-24">
          <h2 className="text-4xl font-bold text-center text-white mb-4">See the Difference</h2>
          <p className="text-lg text-center max-w-3xl mx-auto text-slate-300 mb-12">Our results speak for themselves. We take pride in transforming dull, dirty carpets into vibrant, clean floors.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolioImages.map((src, i) => (
              <motion.div key={i} className="relative aspect-square rounded-lg overflow-hidden" whileHover={{ scale: 1.03, zIndex: 10 }} transition={springFast}>
                <img src={src} alt={`Carpet cleaning result ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
              </motion.div>
            ))}
          </div>
        </SectionReveal>

        {/* ────────────────── ABOUT SECTION ────────────────── */}
        <SectionReveal id="about" className="py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 md:h-full rounded-lg overflow-hidden">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80" alt="Team member cleaning" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Your Local Carpet Experts</h2>
            <p className="text-slate-300 mb-4">FreshStart Carpet Cleaning was founded on a simple principle: to provide our community with the highest quality cleaning services, backed by honesty and integrity. We are a family-owned business dedicated to creating healthier, happier homes.</p>
            <p className="text-slate-300 mb-6">Our IICRC-certified technicians use state-of-the-art equipment and eco-friendly products to deliver a superior clean every time. We don't just clean your carpets; we care for your home.</p>
            <MagneticButton className="px-6 py-3 rounded-full text-md font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
              Meet the Team
            </MagneticButton>
          </div>
        </SectionReveal>

        {/* ────────────────── 4-STEP PROCESS ────────────────── */}
        <SectionReveal className="py-24">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Our Simple 4-Step Process</h2>
          <p className="text-lg text-center max-w-3xl mx-auto text-slate-300 mb-16">We make professional carpet cleaning easy and hassle-free.</p>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[1, 2, 3].map(i => <div key={i} className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: `linear-gradient(to right, ${i > 0 ? ACCENT_GLOW : 'transparent'}, ${ACCENT_GLOW}, transparent)` }}></div>)}
            <div className="absolute top-8 left-0 w-full h-px hidden md:block" style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 50%, transparent 100%)`, opacity: 0.2 }}></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}><span className="text-2xl font-bold" style={{ color: ACCENT_LIGHT }}>1</span></div>
              <h3 className="font-semibold text-lg text-white mb-2">Get a Quote</h3>
              <p className="text-slate-400 text-sm">Contact us via phone or our online form for a fast, free, and no-obligation estimate.</p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}><span className="text-2xl font-bold" style={{ color: ACCENT_LIGHT }}>2</span></div>
              <h3 className="font-semibold text-lg text-white mb-2">Schedule Service</h3>
              <p className="text-slate-400 text-sm">We book a convenient time for our technicians to visit your home or business.</p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}><span className="text-2xl font-bold" style={{ color: ACCENT_LIGHT }}>3</span></div>
              <h3 className="font-semibold text-lg text-white mb-2">Deep Cleaning</h3>
              <p className="text-slate-400 text-sm">Our experts use advanced equipment to perform a thorough, deep clean of your carpets.</p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}><span className="text-2xl font-bold" style={{ color: ACCENT_LIGHT }}>4</span></div>
              <h3 className="font-semibold text-lg text-white mb-2">Enjoy Freshness</h3>
              <p className="text-slate-400 text-sm">Your carpets are left clean, fresh, and dry in hours, not days. Enjoy your revitalized space!</p>
            </div>
          </div>
        </SectionReveal>

        {/* ────────────────── TESTIMONIALS ────────────────── */}
        <SectionReveal id="testimonials" className="py-24">
          <h2 className="text-4xl font-bold text-center text-white mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 flex flex-col">
                <Quotes size={32} weight="fill" className="mb-4" style={{ color: ACCENT }} />
                <p className="text-slate-300 mb-6 flex-grow">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{t.name}</p>
                  <div className="flex gap-1">{Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: "#f59e0b" }} />)}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ────────────────── GUARANTEE / CERTIFICATIONS ────────────────── */}
        <SectionReveal className="py-24">
          <GlassCard className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">Our 100% Satisfaction Guarantee</h2>
                <p className="text-slate-300 mb-6">We stand behind our work. If you're not completely satisfied with the results of our cleaning, simply let us know within 48 hours and we will re-clean the area for free. Your happiness is our top priority.</p>
                <div className="flex justify-center md:justify-start">
                  <ShieldCheck size={64} weight="duotone" style={{ color: ACCENT }} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white mb-6 text-center md:text-left">Our Commitment to Quality</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={18} weight="bold" style={{ color: ACCENT_LIGHT }} />
                      <span className="text-slate-300">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </SectionReveal>

        {/* ────────────────── FAQ ────────────────── */}
        <SectionReveal id="faq" className="py-24 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <GlassCard key={i} className="p-1 overflow-hidden">
                <button className="w-full flex justify-between items-center p-5 text-left" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                  <h3 className="font-semibold text-lg text-white">{faq.q}</h3>
                  <motion.div animate={{ rotate: openFAQ === i ? 45 : 0 }} transition={spring}><Plus size={20} /></motion.div>
                </button>
                <AnimatePresence>
                  {openFAQ === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                      <p className="text-slate-300 p-5 pt-0">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </SectionReveal>

        {/* ────────────────── CTA BANNER ────────────────── */}
        <SectionReveal>
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Ready for Spotless Carpets?</h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8">Let us bring new life to your floors. Get a free, no-obligation quote today and see why we're the top-rated carpet cleaners in the area.</p>
              <MagneticButton className="px-8 py-4 rounded-full text-lg font-semibold text-white" style={{ background: ACCENT }} onClick={() => scrollTo("contact")}>
                Get My Free Quote Now
              </MagneticButton>
            </div>
          </ShimmerBorder>
        </SectionReveal>

        {/* ────────────────── CONTACT ────────────────── */}
        <SectionReveal id="contact" className="py-24 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 mb-8">Have questions or ready to schedule? Reach out to our friendly team. We're here to help!</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><Phone size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400">Call Us</p>
                  <a href="tel:123-456-7890" className="text-white font-semibold text-lg hover:text-cyan-300">123-456-7890</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><MapPin size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400">Our Location</p>
                  <p className="text-white font-semibold text-lg">123 Clean St, Fresh City, 12345</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GlassCard className="p-3 rounded-full"><Clock size={24} style={{ color: ACCENT_LIGHT }} /></GlassCard>
                <div>
                  <p className="text-slate-400">Business Hours</p>
                  <p className="text-white font-semibold text-lg">Mon-Sat: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Send Us a Message</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="email" placeholder="Your Email" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <textarea placeholder="Tell us about your cleaning needs..." rows={4} className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
              <MagneticButton type="submit" className="w-full py-3 rounded-lg text-lg font-semibold text-white" style={{ background: ACCENT }}>
                Request Estimate
              </MagneticButton>
            </form>
          </GlassCard>
        </SectionReveal>
      </main>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="max-w-6xl mx-auto px-4 py-8 border-t border-white/10 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} FreshStart Carpet Cleaning. All Rights Reserved.</p>
        <p className="mt-2">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-cyan-400">bluejayportfolio.com</a></p>
      </footer>

      {/* ────────────────── FIXED CLAIM BANNER ────────────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <GlassCard className="px-4 py-2 flex items-center gap-3">
          <CheckCircle weight="fill" style={{ color: ACCENT }} />
          <p className="text-sm text-white font-medium">100% Satisfaction Guaranteed!</p>
        </GlassCard>
      </div>
    </div>
  );
}

// Helper component, assuming Plus icon might not be in the library
const Plus = (props: any) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
