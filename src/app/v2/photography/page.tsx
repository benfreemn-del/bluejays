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
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Camera,
  Aperture,
  FilmStrip,
  Quotes,
  X,
  List,
  CalendarCheck,
  Heart,
  Users,
  Trophy,
  Sparkle,
  Eye,
  Package,
  Buildings,
  VideoCamera,
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
const BG = "#faf9f7";
const GOLD = "#ca8a04";
const GOLD_LIGHT = "#eab308";
const GOLD_GLOW = "rgba(202, 138, 4, 0.12)";

/* ───────────────────────── APERTURE SVG ───────────────────────── */
function ApertureSVG() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${GOLD_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 200" className="relative z-10 w-52 h-52 md:w-64 md:h-64" fill="none">
        {/* Outer glow rings */}
        <motion.circle cx="100" cy="100" r="94" stroke={GOLD} strokeWidth="0.5" opacity={0.12}
          animate={{ r: [92, 96, 92] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="100" r="86" stroke={GOLD} strokeWidth="0.3" opacity={0.08}
          animate={{ r: [84, 88, 84] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Outer lens barrel */}
        <motion.circle cx="100" cy="100" r="78" fill={`${GOLD}08`} stroke={GOLD} strokeWidth="2.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }} />
        {/* Focus ring grooves */}
        <motion.circle cx="100" cy="100" r="72" stroke={GOLD} strokeWidth="0.8" opacity={0.25}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }} />
        <motion.circle cx="100" cy="100" r="68" stroke={GOLD_LIGHT} strokeWidth="0.5" opacity={0.15}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }} />

        {/* Aperture blades — filled trapezoids */}
        {[0, 51.4, 102.8, 154.3, 205.7, 257.1, 308.6].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const nextRad = ((angle + 51.4) * Math.PI) / 180;
          const innerR = 22;
          const outerR = 55;
          const x1 = 100 + innerR * Math.cos(rad);
          const y1 = 100 + innerR * Math.sin(rad);
          const x2 = 100 + outerR * Math.cos(rad + 0.15);
          const y2 = 100 + outerR * Math.sin(rad + 0.15);
          const x3 = 100 + outerR * Math.cos(nextRad - 0.15);
          const y3 = 100 + outerR * Math.sin(nextRad - 0.15);
          const x4 = 100 + innerR * Math.cos(nextRad);
          const y4 = 100 + innerR * Math.sin(nextRad);
          return (
            <motion.polygon
              key={i}
              points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
              fill={`${GOLD}18`} stroke={GOLD_LIGHT} strokeWidth="0.8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.1, ease: "backOut" }}
              style={{ transformOrigin: "100px 100px" }}
            />
          );
        })}

        {/* Inner hexagon aperture opening */}
        <motion.polygon
          points="100,78 119,89 119,111 100,122 81,111 81,89"
          fill={`${GOLD}0d`} stroke={GOLD_LIGHT} strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2, delay: 1.5 }}
        />

        {/* Center lens element */}
        <motion.circle cx="100" cy="100" r="15" fill={`${GOLD}22`} stroke={GOLD} strokeWidth="1.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 1.8, ease: "backOut" }} />
        <circle cx="100" cy="98" r="8" fill={`${GOLD}15`} />
        <motion.circle cx="100" cy="100" r="5" fill={GOLD_LIGHT}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }} />

        {/* Light refraction sparkles */}
        <motion.circle cx="88" cy="88" r="2" fill={GOLD_LIGHT}
          animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }} />
        <motion.circle cx="115" cy="92" r="1.5" fill="#ffffff"
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 2.3 }} />
        <motion.circle cx="92" cy="112" r="1.5" fill={GOLD_LIGHT}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2.6 }} />

        {/* Lens flare streak */}
        <motion.line x1="75" y1="75" x2="125" y2="125" stroke={GOLD_LIGHT} strokeWidth="0.8" strokeLinecap="round" opacity={0.15}
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 3, repeat: Infinity }} />

        {/* Sparkle accents */}
        <motion.circle cx="175" cy="25" r="3" fill={GOLD_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="20" cy="35" r="2" fill="#ffffff"
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="180" cy="165" r="2.5" fill={GOLD_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="18" cy="170" r="2" fill="#ffffff"
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />
      </svg>
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
  return <div className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GOLD}, transparent, ${GOLD_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const galleryShowcase = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", alt: "Wedding couple on beach", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", alt: "Professional portrait", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80", alt: "Urban landscape photography", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", alt: "Wedding ceremony details", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80", alt: "Event photography", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80", alt: "Product photography flat lay", span: "col-span-2 row-span-1" },
];

const services = [
  { title: "Wedding Photography", description: "Full-day coverage of your love story. From getting-ready moments to the last dance, I capture every emotion, every detail, every unforgettable second.", icon: Heart, price: "From $3,500" },
  { title: "Portrait Sessions", description: "Professional headshots, family portraits, and personal branding sessions. Studio or on-location, I bring out your authentic self in every frame.", icon: Users, price: "From $350" },
  { title: "Commercial Photography", description: "Brand imagery, product photography, and corporate events. Elevate your brand with visuals that tell your story and drive engagement.", icon: Buildings, price: "From $1,200" },
  { title: "Event Coverage", description: "Corporate events, galas, conferences, and celebrations. Discreet, professional coverage that captures the energy and highlights of your event.", icon: VideoCamera, price: "From $800" },
  { title: "Product Photography", description: "E-commerce ready product shots, flat lays, and lifestyle compositions. Clean, compelling images that sell your products.", icon: Package, price: "From $500" },
  { title: "Real Estate", description: "Interior and exterior architectural photography that showcases properties at their absolute best. HDR, twilight, and aerial options available.", icon: Buildings, price: "From $250" },
];

const recentWork = [
  { src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80", alt: "Couple at golden hour" },
  { src: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&q=80", alt: "Corporate headshot" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80", alt: "Studio portrait" },
  { src: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&q=80", alt: "Real estate interior" },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", alt: "Product on white" },
  { src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80", alt: "Live event" },
];

const testimonials = [
  { name: "Sarah & James W.", text: "The wedding photos exceeded every expectation. The way he captured the candid moments between us was pure magic. We relive our day every time we look through the gallery.", rating: 5 },
  { name: "Olivia T., CEO", text: "Our brand photography session transformed our entire marketing presence. The images are stunning, on-brand, and have significantly increased our engagement across all platforms.", rating: 5 },
  { name: "The Martinez Family", text: "We have been coming back for family portraits every year for five years now. Every session feels natural and fun, and the photos are absolute treasures we will have forever.", rating: 5 },
];

const packages = [
  { name: "Essential", price: "$350", features: ["1-hour session", "20 edited images", "Online gallery", "Print release"], highlight: false },
  { name: "Signature", price: "$750", features: ["2-hour session", "50 edited images", "Online gallery", "Print release", "10 fine art prints", "Second location"], highlight: true },
  { name: "Luxury", price: "$1,500", features: ["4-hour session", "100+ edited images", "Online gallery", "Print release", "20 fine art prints", "Album included", "Second photographer"], highlight: false },
];

const faqs = [
  { q: "How far in advance should I book?", a: "For weddings, I recommend booking 6-12 months in advance as dates fill quickly. For portrait sessions and commercial work, 2-4 weeks notice is usually sufficient." },
  { q: "When will I receive my photos?", a: "Portraits and commercial shoots are delivered within 2 weeks. Weddings are delivered within 6-8 weeks. A sneak peek of 15-20 images is provided within 48 hours." },
  { q: "Do you offer videography?", a: "I partner with talented videographers and can offer combined photo and video packages. Ask about our duo coverage options for weddings and events." },
  { q: "Can I print the photos myself?", a: "Yes. All packages include a print release, so you have full rights to print your images anywhere. I also offer professional printing through my lab partner for archival-quality results." },
  { q: "What is your style?", a: "My style is best described as editorial and emotive with a timeless feel. I lean toward natural light, warm tones, and authentic moments over heavily posed or overly filtered looks." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2PhotographyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Camera size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">Lumen Studios</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">About</a>
              <a href="#pricing" className="hover:text-[#1c1917] transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                Book Session
              </MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-[#1c1917] hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Gallery", href: "#gallery" }, { label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Pricing", href: "#pricing" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
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
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>
                Fine Art Photography
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Capturing Moments That Last Forever" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              Award-winning photography that transforms fleeting moments into timeless art. Weddings, portraits, commercial work, and everything in between.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                View Portfolio <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 432-1098
              </MagneticButton>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <ApertureSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── FULL-WIDTH GALLERY SHOWCASE ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Portfolio</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Featured Work" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryShowcase.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className={`${img.span} rounded-2xl overflow-hidden relative group cursor-default`}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[#1c1917] text-sm font-medium">{img.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%"><pattern id="photo-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={GOLD} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#photo-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>What I Offer</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Photography Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: GOLD_LIGHT }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1c1917] mb-2">{svc.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed flex-1">{svc.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold" style={{ color: GOLD }}>{svc.price}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT / ARTIST STATEMENT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80" alt="Photographer with camera" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Trophy size={20} weight="duotone" style={{ color: GOLD }} />
                  <span className="text-sm text-[#1c1917] font-medium">Award-winning photographer since 2012</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Artist Statement</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="The Art of Seeing" />
              </h2>
              <div className="space-y-4 text-[#6b7280] leading-relaxed">
                <p>Photography is not about cameras and lenses. It is about seeing light, emotion, and story in the everyday. For over a decade, I have dedicated my craft to capturing the authentic beauty in people, places, and moments.</p>
                <p>My approach is simple: connect first, then photograph. The best images happen when subjects forget the camera is there. Whether it is a bride&apos;s first look, a CEO&apos;s confident gaze, or a product&apos;s finest details, I find the truth in every frame.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: "12+ Years Experience" },
                  { icon: Trophy, label: "Award-Winning Work" },
                  { icon: FilmStrip, label: "500+ Sessions/Year" },
                  { icon: Eye, label: "Editorial Quality" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm text-[#4b5563]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Client Love</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Kind Words" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: GOLD }} className="mb-3 opacity-50" />
                  <p className="text-[#4b5563] leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: GOLD }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PRICING PACKAGES ─── */}
      <SectionReveal id="pricing" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Investment</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Portrait Packages" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {packages.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp}>
                {pkg.highlight ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8">
                      <div className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: GOLD }}>Most Popular</div>
                      <h3 className="text-xl font-bold text-[#1c1917] mb-2">{pkg.name}</h3>
                      <div className="text-4xl font-bold text-[#1c1917] mb-6">{pkg.price}</div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm text-[#4b5563]">
                            <Sparkle size={14} weight="fill" style={{ color: GOLD }} />{f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                        Book Now
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <h3 className="text-xl font-bold text-[#1c1917] mb-2">{pkg.name}</h3>
                    <div className="text-4xl font-bold text-[#1c1917] mb-6">{pkg.price}</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {pkg.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-[#6b7280]">
                          <Sparkle size={14} weight="duotone" style={{ color: GOLD }} />{f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-[#1c1917] border border-gray-200 cursor-pointer">
                      Book Now
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── RECENT WORK GRID ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Latest Shots</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Recent Work" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {recentWork.map((img, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.03 }} transition={springFast} className="rounded-2xl overflow-hidden aspect-square cursor-default">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                  <span className="text-base font-semibold text-[#1c1917] pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} className="text-[#6b7280] shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 text-[#6b7280] leading-relaxed">{faq.a}</p>
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
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Let&apos;s Create</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="Book Your Session" />
              </h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md mb-8">
                Every great image starts with a conversation. Tell me about your vision and let&apos;s create something extraordinary together.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Studio", value: "1200 Artisan Way, Loft 4B\nNashville, TN 37203" },
                  { icon: Phone, label: "Phone", value: "(555) 432-1098" },
                  { icon: Clock, label: "Availability", value: "By appointment\nWeekends book fast" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1c1917]">{item.label}</p>
                      <p className="text-sm text-[#6b7280] whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Inquire Now</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-500/50" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#9ca3af] text-sm focus:outline-none focus:border-yellow-500/50">
                  <option value="">Session Type</option>
                  {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                </select>
                <textarea placeholder="Tell me about your vision..." rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ background: GOLD_LIGHT } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} /> Send Inquiry</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <Camera size={16} weight="duotone" style={{ color: GOLD }} />
            <span>Lumen Studios &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-[#6b7280]">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>
    </main>
  );
}
