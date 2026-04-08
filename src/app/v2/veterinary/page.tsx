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
  Heart,
  FirstAidKit,
  Users,
  CalendarCheck,
  CheckCircle,
  Quotes,
  X,
  List,
  PawPrint,
  Syringe,
  Scissors,
  Stethoscope,
  Dog,
  Cat,
  Heartbeat,
  Warning,
  Pill,
  Eye,
  Tooth,
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
const BG = "#0a1a0f";
const GREEN = "#16a34a";
const GREEN_LIGHT = "#22c55e";
const CREAM = "#fef3c7";
const GREEN_GLOW = "rgba(22, 163, 74, 0.15)";
const CREAM_GLOW = "rgba(254, 243, 199, 0.08)";

/* ───────────────────────── FLOATING PAW PRINTS ───────────────────────── */
function FloatingPawPrints() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 10 + Math.random() * 8,
    opacity: 0.06 + Math.random() * 0.12,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, willChange: "transform, opacity" }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [p.rotation, p.rotation + 30],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] },
            rotate: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
          }}
        >
          <PawPrint size={p.size} weight="fill" style={{ color: GREEN_LIGHT }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── PAW HEART SVG ───────────────────────── */
function PawHeartSVG() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${GREEN_GLOW} 0%, transparent 70%)`, filter: "blur(40px)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 220" className="relative z-10 w-52 h-64 md:w-64 md:h-80" fill="none">
        {/* Outer glow ring */}
        <motion.circle cx="100" cy="105" r="90" stroke={GREEN} strokeWidth="0.5" opacity={0.15}
          animate={{ r: [88, 92, 88] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="100" cy="105" r="80" stroke={GREEN} strokeWidth="0.3" opacity={0.1}
          animate={{ r: [78, 82, 78] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />

        {/* Top toe pads — filled with gradient effect */}
        <motion.ellipse cx="68" cy="42" rx="16" ry="20" fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }} />
        <motion.ellipse cx="132" cy="42" rx="16" ry="20" fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "backOut" }} />

        {/* Side toe pads */}
        <motion.ellipse cx="42" cy="78" rx="14" ry="18" fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "backOut" }} />
        <motion.ellipse cx="158" cy="78" rx="14" ry="18" fill={`${GREEN}22`} stroke={GREEN} strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "backOut" }} />

        {/* Inner toe pad details — small highlights */}
        <ellipse cx="68" cy="40" rx="6" ry="8" fill={`${GREEN}15`} />
        <ellipse cx="132" cy="40" rx="6" ry="8" fill={`${GREEN}15`} />
        <ellipse cx="42" cy="76" rx="5" ry="7" fill={`${GREEN}15`} />
        <ellipse cx="158" cy="76" rx="5" ry="7" fill={`${GREEN}15`} />

        {/* Main pad — large heart-shaped bottom */}
        <motion.path
          d="M100 105 C78 105, 52 118, 58 140 C62 152, 76 166, 100 185 C124 166, 138 152, 142 140 C148 118, 122 105, 100 105Z"
          fill={`${GREEN}18`}
          stroke={GREEN}
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
        />
        {/* Main pad inner highlight */}
        <path
          d="M100 115 C85 115, 68 124, 72 138 C74 146, 84 155, 100 168 C116 155, 126 146, 128 138 C132 124, 115 115, 100 115Z"
          fill={`${GREEN}0d`}
        />

        {/* Heartbeat line through the center of the main pad */}
        <motion.path
          d="M65 148 L82 148 L88 135 L94 158 L100 128 L106 158 L112 135 L118 148 L135 148"
          stroke={GREEN_LIGHT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }}
        />

        {/* Sparkle accents */}
        <motion.circle cx="160" cy="30" r="3" fill={GREEN_LIGHT}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="35" cy="45" r="2" fill={CREAM}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.circle cx="170" cy="95" r="2.5" fill={GREEN_LIGHT}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} />
        <motion.circle cx="28" cy="110" r="2" fill={CREAM}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }} />

        {/* Small cross/plus sign — medical symbol */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <rect x="148" cy="160" y="155" width="16" height="4" rx="2" fill={GREEN_LIGHT} opacity={0.4} />
          <rect x="154" cy="160" y="149" width="4" height="16" rx="2" fill={GREEN_LIGHT} opacity={0.4} />
        </motion.g>
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GREEN}, transparent, ${CREAM}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl z-10" style={{ background: BG }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Wellness Exams", description: "Comprehensive annual check-ups including bloodwork, dental assessment, and full physical examination to keep your pet in optimal health.", icon: Stethoscope },
  { title: "Vaccinations", description: "Complete vaccination programs for dogs, cats, and exotic pets. We follow the latest AVMA guidelines to protect your pet from preventable diseases.", icon: Syringe },
  { title: "Surgery", description: "From routine spay/neuter to advanced orthopedic and soft tissue surgery. Our state-of-the-art surgical suite ensures the safest possible outcomes.", icon: FirstAidKit },
  { title: "Dental Care", description: "Professional dental cleanings, extractions, and oral health assessments. Dental disease affects over 80% of pets, and we keep their smiles healthy.", icon: Tooth },
  { title: "Emergency Care", description: "Urgent and emergency veterinary services when your pet needs immediate attention. We are equipped to handle trauma, poisoning, and acute illness.", icon: Warning },
  { title: "Grooming", description: "Full-service grooming including baths, haircuts, nail trims, and ear cleaning. Your pet will look and feel their best after every visit.", icon: Scissors },
];

const petGallery = [
  { src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80", alt: "Happy golden retriever" },
  { src: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80", alt: "Cute tabby cat" },
  { src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80", alt: "Two dogs playing" },
  { src: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80", alt: "Orange cat close up" },
  { src: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&q=80", alt: "Puppy at vet" },
  { src: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&q=80", alt: "Cat being examined" },
];

const testimonials = [
  { name: "Amanda P.", text: "The team here saved our dog's life after he ate something toxic. Their emergency response was incredible. We will never go anywhere else for our pets' care.", rating: 5 },
  { name: "Robert & Linda S.", text: "We have been bringing our three cats here for years. The doctors are thorough, gentle, and genuinely care about our fur babies. Best vet in the city.", rating: 5 },
  { name: "Tyler M.", text: "My anxious rescue dog was terrified of vets until we came here. The fear-free approach they use has made such a difference. He actually wags his tail now.", rating: 5 },
];

const faqs = [
  { q: "What should I bring to my pet's first visit?", a: "Please bring any previous medical records, a list of current medications, and your pet's vaccination history. If your pet is a rescue, bring any adoption paperwork you have." },
  { q: "Do you handle emergencies?", a: "Yes, we offer emergency services during business hours. For after-hours emergencies, we partner with the 24-hour Emergency Animal Hospital and can provide immediate referrals." },
  { q: "What payment options do you accept?", a: "We accept all major credit cards, cash, and CareCredit. We also work with most pet insurance providers and can help you file claims." },
  { q: "How often does my pet need a check-up?", a: "We recommend annual wellness exams for adult pets and twice-yearly visits for seniors (7+ years). Puppies and kittens need more frequent visits for their initial vaccination series." },
  { q: "Do you see exotic pets?", a: "Yes! Our doctors are experienced with rabbits, guinea pigs, reptiles, birds, and other exotic species. Please mention your pet type when booking so we can prepare accordingly." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2VeterinaryPage() {
  const [openService, setOpenService] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingPawPrints />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PawPrint size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-white">Evergreen Veterinary</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: GREEN } as React.CSSProperties}>
                Book Visit
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Gallery", href: "#gallery" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
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
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${CREAM} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div className="space-y-8">
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.1 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN_LIGHT }}>
                Compassionate Pet Care
              </motion.p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Where Every Pet Is Family" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-slate-400 max-w-md leading-relaxed">
              Modern veterinary medicine with old-fashioned compassion. From wellness check-ups to emergency care, your pet deserves the very best.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                Book Appointment <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> (555) 867-5309
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring, delay: 1 }} className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />789 Pet Haven Dr</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />Mon-Sat 7am-8pm</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="hidden md:flex items-center justify-center lg:justify-end">
            <PawHeartSVG />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <SectionReveal className="relative z-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: "20+", label: "Years of Care", icon: Heart },
                { value: "25,000+", label: "Pets Treated", icon: PawPrint },
                { value: "4.9", label: "Google Rating", icon: Star },
                { value: "3", label: "Veterinarians", icon: Stethoscope },
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
          <svg width="100%" height="100%"><pattern id="vet-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={GREEN_LIGHT} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#vet-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Our Services</p>
              <h2 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Complete Pet Healthcare" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md">
                From nose to tail, we provide comprehensive care for your beloved companions. Click any service to learn more.
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

      {/* ─── ABOUT ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>About Us</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Trusted by Pet Parents" />
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Evergreen Veterinary was founded with one simple mission: provide the same level of care for your pets that we would want for our own. Our team of board-certified veterinarians and compassionate support staff treats every animal with gentleness and respect.</p>
                <p>We have invested in the latest diagnostic technology, from digital X-rays to in-house blood labs, so we can diagnose and treat your pet faster. Our fear-free certified practice ensures that every visit is as stress-free as possible for both you and your companion.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Dog, label: "Dogs & Cats" },
                  { icon: Eye, label: "Advanced Diagnostics" },
                  { icon: Heartbeat, label: "Fear-Free Certified" },
                  { icon: Pill, label: "In-House Pharmacy" },
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
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80" alt="Veterinarian with dog" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                  <Heart size={20} weight="duotone" style={{ color: GREEN_LIGHT }} />
                  <span className="text-sm text-white font-medium">Fear-free, compassionate care</span>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Happy Pet Parents</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="What Our Clients Say" />
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

      {/* ─── PET GALLERY ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Our Patients</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Happy & Healthy Pets" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {petGallery.map((img, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ scale: 1.03 }} transition={springFast} className="rounded-2xl overflow-hidden aspect-square cursor-default">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── NEW PATIENT INFO ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <PawPrint size={48} weight="duotone" style={{ color: GREEN_LIGHT }} className="mx-auto mb-4" />
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white mb-4">New Patient Special</h2>
                <p className="text-slate-400 text-lg mb-2">Complete wellness exam, vaccinations review, and health consultation</p>
                <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-6" style={{ color: GREEN_LIGHT }}>$49</p>
                <p className="text-slate-500 text-sm mb-8">Regular value $120 &mdash; first visit discount for new furry friends</p>
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                  <CalendarCheck size={20} weight="duotone" /> Schedule First Visit
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Common Questions</p>
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
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Get in Touch</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white mb-6">
                <WordReveal text="Schedule a Visit" />
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md mb-8">
                Your pet&apos;s health is our priority. Book an appointment today and experience the Evergreen difference.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Location", value: "789 Pet Haven Dr\nDenver, CO 80202" },
                  { icon: Phone, label: "Phone", value: "(555) 867-5309" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 7am-8pm\nSaturday 8am-5pm\nSunday 10am-4pm (emergencies)" },
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
              <h3 className="text-xl font-semibold text-white mb-6">Book an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                  <input type="text" placeholder="Pet's Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50" />
                <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-sm focus:outline-none focus:border-green-500/50">
                  <option value="">Pet Type</option>
                  <option>Dog</option><option>Cat</option><option>Bird</option><option>Reptile</option><option>Other</option>
                </select>
                <textarea placeholder="Describe your pet's needs..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Request Appointment</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── HOURS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>We Are Here For You</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-white">
              <WordReveal text="Our Hours" />
            </h2>
          </div>
          <GlassCard className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { day: "Monday - Friday", hours: "7:00 AM - 8:00 PM" },
                { day: "Saturday", hours: "8:00 AM - 5:00 PM" },
                { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
                { day: "Emergency", hours: "Available 24/7 via partner" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
                  <span className="text-sm font-medium text-white">{item.day}</span>
                  <span className="text-sm text-slate-400">{item.hours}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PawPrint size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
            <span>Evergreen Veterinary &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-600">Website created by Bluejay Business Solutions</p>
        </div>
      </footer>
    </main>
  );
}
