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
  Skull,
  PaintBrush,
  Palette,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Quotes,
  X,
  List,
  CalendarCheck,
  ShieldCheck,
  Drop,
  Eye,
  Heart,
  Pencil,
  Diamond,
  Flower,
  Compass,
  SealCheck,
  FirstAidKit,
  InstagramLogo,
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
const BG = "#0a0a0a";
const CRIMSON = "#b91c1c";
const CRIMSON_LIGHT = "#ef4444";
const CRIMSON_GLOW = "rgba(185, 28, 28, 0.15)";

/* ───────────────────────── FLOATING INK SPLATTER PARTICLES ───────────────────────── */
function InkSplatterParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 8,
    size: 3 + Math.random() * 6,
    opacity: 0.08 + Math.random() * 0.15,
    isBlob: Math.random() > 0.5,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.isBlob ? p.size * 1.5 : p.size,
            borderRadius: p.isBlob ? "40% 60% 50% 50%" : "50%",
            background: CRIMSON_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: p.isBlob ? [0, 180, 360] : [0, 0, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
            rotate: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── UTILITY COMPONENTS ───────────────────────── */
function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
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
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${CRIMSON}, transparent, ${CRIMSON_LIGHT}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── GALLERY DATA ───────────────────────── */
const galleryImages = [
  { src: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80", alt: "Intricate sleeve tattoo with black and gray shading", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", alt: "Geometric mandala tattoo on forearm", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=400&q=80", alt: "Watercolor style floral tattoo", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=400&q=80", alt: "Traditional American tattoo design", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=80", alt: "Fine line minimalist tattoo work", span: "col-span-1 row-span-1" },
  { src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&q=80", alt: "Full back piece Japanese style tattoo", span: "col-span-2 row-span-1" },
];

/* ───────────────────────── STYLES DATA ───────────────────────── */
const tattooStyles = [
  { name: "Traditional", description: "Bold outlines, vibrant colors, and iconic imagery. American traditional with a modern edge.", icon: Compass },
  { name: "Realism", description: "Photorealistic portraits, nature, and objects with stunning detail and depth. Black & gray or full color.", icon: Eye },
  { name: "Geometric", description: "Sacred geometry, mandala patterns, and mathematical precision. Clean lines meet spiritual symbolism.", icon: Diamond },
  { name: "Watercolor", description: "Flowing pigment splashes and vivid gradients that mimic watercolor paintings on skin.", icon: PaintBrush },
  { name: "Blackwork", description: "Bold black ink designs from ornamental patterns to dotwork and heavy tribal. Maximum impact.", icon: Skull },
  { name: "Custom Design", description: "Your vision, our artistry. We collaborate with you to create a completely original piece.", icon: Pencil },
];

const stats = [
  { value: "10,000+", label: "Tattoos Completed" },
  { value: "4.9", label: "Star Rating" },
  { value: "15+", label: "Years of Art" },
  { value: "6", label: "Award-Winning Artists" },
];

const testimonials = [
  { name: "Jake M.", text: "The realism work here is next level. My portrait sleeve is absolutely incredible. Every session was professional, clean, and exceeded my expectations.", rating: 5 },
  { name: "Rachel T.", text: "I was so nervous for my first tattoo but the artist made me feel completely at ease. The design was exactly what I envisioned. I have already booked my next piece.", rating: 5 },
  { name: "Chris D.", text: "Best shop in the city, hands down. The custom geometric piece they designed for me gets compliments constantly. Worth every penny and the wait.", rating: 5 },
];

const aftercareSteps = [
  { title: "Hours 1-6", description: "Keep the bandage on for 2-6 hours. Your artist will give you specific timing based on your tattoo." },
  { title: "Day 1-3", description: "Gently wash with unscented soap, pat dry, and apply a thin layer of recommended aftercare ointment 2-3 times daily." },
  { title: "Week 1-2", description: "Continue moisturizing. Light peeling is normal. Do not pick or scratch. Avoid submerging in water." },
  { title: "Week 3-4", description: "Skin should be healed. Continue moisturizing daily. Apply SPF 30+ when exposed to sun to preserve colors." },
];

const faqItems = [
  { q: "How much does a tattoo cost?", a: "Pricing depends on size, detail, and placement. Small pieces start around $150, while larger custom work is quoted at a $150/hour rate. We provide free consultations with exact quotes." },
  { q: "Does it hurt?", a: "Pain varies by person and body placement. Most describe it as a scratching or burning sensation. Our artists work efficiently and offer breaks. Many clients find it much more tolerable than expected." },
  { q: "How do I book an appointment?", a: "Contact us through our booking form, DM us on Instagram, or call the studio. For custom work, we recommend a consultation first to discuss your design, placement, and timeline." },
  { q: "Can I bring my own design?", a: "Absolutely. Bring reference images, sketches, or even just an idea. Our artists will work with you to create the perfect design. We also have a portfolio of flash designs available." },
  { q: "How long does a tattoo take to heal?", a: "Surface healing takes 2-3 weeks. Full skin recovery underneath takes about 4-6 weeks. Following our aftercare instructions ensures the best possible healing and color retention." },
];

const artists = [
  { name: "Marcus Vex", specialty: "Realism & Portraits", experience: "12 years", initials: "MV" },
  { name: "Luna Kai", specialty: "Watercolor & Illustrative", experience: "8 years", initials: "LK" },
  { name: "Dom Blackwell", specialty: "Blackwork & Geometric", experience: "15 years", initials: "DB" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function V2TattooPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <InkSplatterParticles />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PaintBrush size={24} weight="duotone" style={{ color: CRIMSON }} />
              <span className="text-lg font-bold tracking-tight text-white" style={{ fontStyle: "italic" }}>Iron & Ink Studio</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#styles" className="hover:text-white transition-colors">Styles</a>
              <a href="#artists" className="hover:text-white transition-colors">Artists</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#booking" className="hover:text-white transition-colors">Book Now</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: CRIMSON }}>Book Session</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Gallery", href: "#gallery" }, { label: "Styles", href: "#styles" }, { label: "Artists", href: "#artists" }, { label: "Reviews", href: "#testimonials" }, { label: "Book Now", href: "#booking" }].map((link) => (
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${CRIMSON_GLOW} 0%, transparent 70%)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full">
          <div className="max-w-3xl space-y-8">
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: CRIMSON }}>Premium Tattoo Studio</motion.p>
            <h1 className="text-4xl md:text-7xl tracking-tighter leading-none font-black text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              <WordReveal text="Your Body. Your Art. Your Story." />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Award-winning artists creating one-of-a-kind tattoos in a premium studio environment. From bold traditional to hyper-realistic portraits, we turn your vision into permanent art.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: CRIMSON }}>
                Book a Consultation <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <InstagramLogo size={18} weight="duotone" /> @ironandink
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><SealCheck size={16} weight="duotone" style={{ color: CRIMSON }} />Award-Winning Artists</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} weight="duotone" style={{ color: CRIMSON }} />Licensed & Sterile</span>
              <span className="flex items-center gap-2"><Drop size={16} weight="duotone" style={{ color: CRIMSON }} />Premium Inks Only</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: CRIMSON }}>{s.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── PORTFOLIO GALLERY (MASONRY) ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>Our Work</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Portfolio Gallery" /></h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[250px]" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {galleryImages.map((img, i) => (
              <motion.div key={i} variants={fadeUp} className={`${img.span} group relative rounded-2xl overflow-hidden cursor-pointer`}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm text-white font-medium">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── STYLES ─── */}
      <SectionReveal id="styles" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${CRIMSON_GLOW} 0%, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>What We Do</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Tattoo Styles" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {tattooStyles.map((style, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={springGentle}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: CRIMSON_GLOW }}>
                    <style.icon size={24} weight="duotone" style={{ color: CRIMSON }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{style.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{style.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ARTIST BIO ─── */}
      <SectionReveal id="artists" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" alt="Tattoo artist at work in studio" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>Meet the Artists</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Award-Winning Talent" /></h2>
              <p className="text-slate-400 leading-relaxed mb-6">Our studio brings together some of the most talented and dedicated tattoo artists in the industry. Each artist has their own specialty but shares our commitment to excellence, safety, and creating art that lasts a lifetime.</p>
              <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {artists.map((artist, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <GlassCard className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ background: CRIMSON_GLOW, color: CRIMSON }}>{artist.initials}</div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{artist.name}</h3>
                        <p className="text-xs text-slate-400">{artist.specialty} &bull; {artist.experience}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>Client Stories</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white"><WordReveal text="What Our Clients Say" /></h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <Quotes size={28} weight="fill" style={{ color: CRIMSON }} className="mb-3 opacity-50" />
                  <p className="text-slate-300 leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: CRIMSON }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── AFTERCARE INFO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>Aftercare Guide</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Protect Your Investment" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">Proper aftercare is essential for a vibrant, long-lasting tattoo. Follow these steps to ensure your new art heals perfectly.</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm"><FirstAidKit size={18} weight="duotone" style={{ color: CRIMSON }} /><span className="text-slate-300">Medical-grade products provided</span></div>
                <div className="flex items-center gap-2 text-sm"><Heart size={18} weight="duotone" style={{ color: CRIMSON }} /><span className="text-slate-300">Free touch-ups included</span></div>
              </div>
            </div>
            <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {aftercareSteps.map((step, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: CRIMSON_GLOW, color: CRIMSON }}>{i + 1}</div>
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </GlassCard>
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
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: CRIMSON }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white"><WordReveal text="Frequently Asked Questions" /></h2>
          </div>
          <motion.div className="space-y-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400" /></motion.div>
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

      {/* ─── BOOKING / CONTACT ─── */}
      <SectionReveal id="booking" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6"><WordReveal text="Ready to Get Inked?" /></h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">Book a free consultation to discuss your design, get a quote, and reserve your spot. Walk-ins welcome for small pieces, but consultations are recommended for custom work.</p>
              <div className="flex flex-wrap gap-4">
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: CRIMSON }}>
                  <CalendarCheck size={20} weight="duotone" /> Book Consultation
                </MagneticButton>
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                  <Phone size={18} weight="duotone" /> Call Studio
                </MagneticButton>
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Studio Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4"><MapPin size={20} weight="duotone" style={{ color: CRIMSON }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Location</p><p className="text-sm text-slate-400">321 Ink Boulevard<br />Austin, TX 78701</p></div></div>
                <div className="flex items-start gap-4"><Phone size={20} weight="duotone" style={{ color: CRIMSON }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Phone</p><p className="text-sm text-slate-400">(555) 654-3210</p></div></div>
                <div className="flex items-start gap-4"><Clock size={20} weight="duotone" style={{ color: CRIMSON }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400">Tuesday - Saturday: 11:00 AM - 9:00 PM<br />Sunday: 12:00 PM - 6:00 PM<br />Monday: Closed</p></div></div>
                <div className="flex items-start gap-4"><InstagramLogo size={20} weight="duotone" style={{ color: CRIMSON }} className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-white">Social</p><p className="text-sm text-slate-400">@ironandink<br />Daily portfolio updates & flash drops</p></div></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PaintBrush size={16} weight="duotone" style={{ color: CRIMSON }} />
            <span>Iron & Ink Studio &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
