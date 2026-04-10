"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

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
  Heart,
  Drop,
  FlowerLotus,
  User,
  CalendarCheck,
  CheckCircle,
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
const BG = "#1a0f1e";
const ACCENT = "#c084fc";
const ACCENT_LIGHT = "#e9d5ff";
const ACCENT_GLOW = "rgba(192, 132, 252, 0.15)";

/* ───────────────────────── LOTUS NAV ICON ───────────────────────── */
function LotusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L22 12L16 28L10 12L16 4Z" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14Z" fill={ACCENT_LIGHT} />
      <path d="M4 16H10" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M22 16H28" stroke={ACCENT_LIGHT} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ───────────────────────── FLOWING CURVES PATTERN ───────────────────────── */
function FlowingCurvesPattern() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="flowing-curves" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 0,100 C 50,0 150,200 200,100" stroke={ACCENT_LIGHT} fill="none" strokeWidth="0.5"/>
            <path d="M 0,0 C 50,100 150,0 200,100" stroke={ACCENT_LIGHT} fill="none" strokeWidth="0.25" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flowing-curves)" />
      </svg>
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES ───────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 12 + Math.random() * 8,
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
  { title: "Botox & Fillers", description: "Smooth fine lines and restore youthful volume with our expert-administered injectables. We create natural-looking results tailored to your unique facial anatomy.", icon: Sparkle },
  { title: "Laser Treatments", description: "Address sun damage, unwanted hair, and skin texture irregularities with our state-of-the-art laser technologies for a clearer, smoother complexion.", icon: Star },
  { title: "Chemical Peels", description: "Reveal brighter, more even-toned skin by gently removing dull outer layers. Our peels are customized for your skin type and concerns, from acne to aging.", icon: Drop },
  { title: "Microneedling", description: "Stimulate collagen production to improve skin firmness, reduce scarring, and minimize pores. A minimally invasive treatment for significant rejuvenation.", icon: FlowerLotus },
  { title: "Body Contouring", description: "Non-surgically sculpt and tone your body. Our advanced treatments help reduce stubborn fat pockets and tighten skin for a more defined silhouette.", icon: User },
  { title: "IV Therapy", description: "Boost your wellness from within. Our nutrient-rich IV drips are formulated to enhance energy, improve hydration, and support overall health and vitality.", icon: Heart },
];

const testimonials = [
  { name: "Jessica L.", text: "My skin has never looked better! The team at Radiance is so knowledgeable and made me feel completely at ease. The results from my laser treatment are incredible.", rating: 5 },
  { name: "Emily R.", text: "I was nervous about getting fillers, but the practitioner was an artist. The result is so natural and refreshed. I feel like myself, just a more confident version!", rating: 5 },
  { name: "Samantha B.", text: "The IV therapy is a game-changer. I feel so much more energetic and my skin is glowing. It's become a non-negotiable part of my wellness routine.", rating: 5 },
];

const certifications = [
  "Board-Certified Practitioners", "Licensed Medical Aestheticians", "Advanced Injector Training", "Laser Safety Certified", "HIPAA Compliant", "Clean & Sterile Environment", "Member of AmSpa", "Top-Rated Local Med Spa",
];

const faqData = [
  { q: "Is there any downtime with these treatments?", a: "Downtime varies. Many treatments like Botox and IV therapy have no downtime, while others like deep chemical peels may require a few days of social downtime. We discuss this fully during your consultation." },
  { q: "How do I know which treatment is right for me?", a: "Every new client receives a complimentary, in-depth skin analysis and consultation. We listen to your goals and create a personalized treatment plan just for you." },
  { q: "Are the treatments painful?", a: "We prioritize your comfort. Most treatments involve minimal discomfort, often described as a slight pinching or warming sensation. We use topical numbing creams where appropriate." },
  { q: "How long do results last?", a: "This depends on the treatment and individual factors. Botox typically lasts 3-4 months, while results from laser or microneedling can last for years with proper skincare maintenance." },
  { q: "What are your safety protocols?", a: "Your safety is our top priority. Our facility is medically supervised, and we adhere to the strictest standards of sterilization and safety for all procedures." },
  { q: "Do you offer payment plans or packages?", a: "Yes, we offer packages for multiple sessions at a discounted rate and partner with financing companies like Cherry to make treatments more accessible." },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
  "https://images.unsplash.com/photo-1616394584738-63467862dc64?w=600&q=80",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
  "https://images.unsplash.com/photo-1556228852-6d45a7d8b182?w=600&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f114723584?w=600&q=80",
  "https://images.unsplash.com/photo-1620916566280-ca2a2923574d?w=600&q=80",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function V2MedSpaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openService, setOpenService] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <main style={{ background: BG }} className="text-slate-300 overflow-x-hidden">
      <FlowingCurvesPattern />
      <FloatingParticles />

      {/* ─── 1. STICKY NAVIGATION ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="mx-auto max-w-lg p-8">
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X size={24} className="text-white" />
                </button>
              </div>
              <nav className="flex flex-col items-center gap-6 text-center">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-2xl font-medium text-white hover:text-purple-300 transition-colors">
                    {link.label}
                  </a>
                ))}
                <MagneticButton className="mt-4 px-8 py-3 rounded-full text-lg font-semibold text-white" style={{ background: ACCENT } as React.CSSProperties}>
                  Book Now
                </MagneticButton>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl mx-auto">
        <GlassCard className="flex items-center justify-between p-3 md:p-4">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <LotusIcon />
            <span className="font-bold tracking-tight text-white text-lg">Radiance Med Spa</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <MagneticButton className="hidden md:block px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT } as React.CSSProperties}>
              Book Now
            </MagneticButton>
            <button onClick={() => setIsMenuOpen(true)} className="p-2 md:hidden">
              <List size={24} className="text-white" />
            </button>
          </div>
        </GlassCard>
      </header>

      {/* ─── 2. HERO SECTION ─── */}
      <div className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1600&q=80)" }}
        />
        <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to top, ${BG} 20%, transparent 60%)` }} />
        <div className="absolute inset-0 z-10" style={{ background: `radial-gradient(circle at center, transparent, ${BG} 90%)` }} />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none font-bold text-white mb-6">
            <WordReveal text="Discover Your Inner Radiance" />
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">
            <WordReveal text="Experience the art of aesthetic medicine in a serene, luxurious environment. Your journey to rejuvenation starts here." className="gap-x-2" />
          </p>
          <motion.div className="flex flex-wrap justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.2 }}>
            <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
              <Sparkle size={20} weight="duotone" /> Explore Treatments
            </MagneticButton>
            <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
              <CalendarCheck size={18} weight="duotone" /> Book Consultation
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* ─── 3. STATS / TRUST BAR ─── */}
      <SectionReveal className="relative z-10 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[ 
              { icon: Star, num: "500+", text: "5-Star Reviews" },
              { icon: User, num: "1,000+", text: "Happy Clients" },
              { icon: ShieldCheck, num: "10+", text: "Years of Experience" },
              { icon: Leaf, num: "99%", text: "Natural Results" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <item.icon size={36} weight="duotone" className="mx-auto mb-3" style={{ color: ACCENT }} />
                <p className="text-3xl md:text-4xl font-bold text-white">{item.num}</p>
                <p className="text-sm text-slate-400">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 4. SERVICES GRID ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Expertise</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Signature Treatments" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((service, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <service.icon size={28} weight="duotone" style={{ color: ACCENT }} />
                      <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                    </div>
                    <AnimatePresence initial={false}>
                      {openService === i ? (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="text-sm text-slate-400 leading-relaxed overflow-hidden">
                          {service.description}
                        </motion.p>
                      ) : (
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{service.description}</p>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => setOpenService(openService === i ? null : i)} className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium" style={{ background: ACCENT_GLOW }}>
                    {openService === i ? "Show Less" : "Learn More"}
                    <motion.div animate={{ rotate: openService === i ? 180 : 0 }} transition={spring}><CaretDown size={16} /></motion.div>
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 5. PORTFOLIO / GALLERY ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Work</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Real Clients, Real Results" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {portfolioImages.map((src, i) => (
              <motion.div key={i} variants={fadeUp} className="aspect-square overflow-hidden rounded-xl relative group">
                <img src={src} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 6. ABOUT SECTION ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="aspect-square rounded-2xl overflow-hidden" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
              <img src="https://images.unsplash.com/photo-1512290923902-8a9f31c8364a?w=800&q=80" alt="Serene spa interior" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Philosophy</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Beauty Through Science & Serenity" />
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                At Radiance Med Spa, we believe that true beauty is a reflection of health and confidence. We bridge the gap between clinical results and a luxurious spa experience, providing medically-proven aesthetic treatments in a tranquil, welcoming environment.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our team of board-certified practitioners and licensed aestheticians is dedicated to understanding your unique goals. We use a personalized, educational approach to craft treatment plans that deliver natural, beautiful results, empowering you to feel your most radiant self.
              </p>
              <MagneticButton className="px-8 py-3 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer border" style={{ borderColor: ACCENT }}>
                Meet Our Team <ArrowRight size={18} />
              </MagneticButton>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 7. PROCESS SECTION ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Your Journey</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our 4-Step Rejuvenation Process" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[ 
              { title: "Consultation", desc: "We listen to your goals and analyze your skin to create a personalized plan." },
              { title: "Treatment", desc: "Relax in our serene environment as our experts perform your chosen service." },
              { title: "Aftercare", desc: "We provide detailed instructions to ensure optimal results and healing." },
              { title: "Follow-Up", desc: "We schedule a follow-up to assess your results and ensure your satisfaction." },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 border-2" style={{ borderColor: ACCENT, background: ACCENT_GLOW }}>
                  <span className="text-2xl font-bold" style={{ color: ACCENT_LIGHT }}>{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-px border-t border-dashed border-white/20" style={{ transform: "translateX(50%)" }} />} 
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 8. TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Client Love</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Are Saying" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-8 h-full flex flex-col">
                  <Quotes size={32} weight="fill" className="mb-4" style={{ color: ACCENT }} />
                  <p className="text-slate-300 mb-6 flex-grow">&quot;{t.text}&quot;</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">- {t.name}</span>
                    <div className="flex gap-0.5">{Array(t.rating).fill(0).map((_, j) => <Star key={j} size={16} weight="fill" className="text-amber-400" />)}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 9. GUARANTEE / CERTIFICATIONS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Our Promise</p>
          <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
            <WordReveal text="Committed to Excellence & Safety" />
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
            We uphold the highest standards in the industry. Our commitment is to provide you with safe, effective treatments administered by highly trained and certified professionals.
          </p>
          <motion.div className="flex flex-wrap justify-center gap-x-6 gap-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {certifications.map((cert, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-slate-300">
                <CheckCircle size={18} weight="duotone" style={{ color: ACCENT }} />
                <span className="text-sm font-medium">{cert}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── 10. FAQ ─── */}
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

      {/* ─── 11. CTA BANNER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <p className="text-sm uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Begin Your Transformation</p>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">Ready to Glow?</h2>
                <p className="text-slate-400 text-lg mb-6 max-w-lg mx-auto">Schedule your complimentary consultation today and let our experts design a personalized plan for your unique skin and body goals.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>
                    <CalendarCheck size={20} weight="duotone" /> Book Free Consultation
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 inline-flex items-center gap-2 cursor-pointer">
                    <Phone size={18} weight="duotone" /> (555) 123-4567
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── 12. CONTACT SECTION ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Visit Our Sanctuary" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Find us in the heart of the city, your personal escape for aesthetic excellence. Contact us to schedule your visit.
              </p>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Contact & Location</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Address</p><p className="text-sm text-slate-400">123 Wellness Ave, Suite 100<br />Serenity City, ST 12345</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 123-4567</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} weight="duotone" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Tuesday - Saturday: 9:00 AM - 6:00 PM<br />Closed Sunday & Monday</p></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── 13. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LotusIcon size={16} />
            <span>Radiance Med Spa &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></p>
        </div>
      </footer>

      {/* ─── 14. FIXED CLAIM BANNER ─── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
        <GlassCard className="p-3">
          <p className="text-xs text-center text-slate-300">Claim your FREE website at <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white underline">bluejayportfolio.com</a></p>
        </GlassCard>
      </div>
    </main>
  );
}
