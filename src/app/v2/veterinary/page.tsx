"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Star,
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  FirstAidKit,
  CalendarCheck,
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
  Tooth,
  Play,
  CheckCircle,
  Shield,
  Envelope,
  Certificate,
  Bird,
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
const BG = "#f7faf8";
const GREEN = "#16a34a";
const GREEN_LIGHT = "#22c55e";
const ROSE = "#e11d48";
const GREEN_GLOW = "rgba(22, 163, 74, 0.15)";
const ROSE_GLOW = "rgba(225, 29, 72, 0.10)";

/* ───────────────────────── FLOATING PAW PRINTS ───────────────────────── */
function FloatingPawPrints() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 10 + Math.random() * 8,
    opacity: 0.04 + Math.random() * 0.08,
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

/* ───────────────────────── PARALLAX COLLAGE PHOTO ───────────────────────── */
function CollagePhoto({ photo, index, scrollYProgress }: { photo: { src: string; alt: string; z: number; x: number; y: number; w: string; speed: number; rotate: number }; index: number; scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, photo.speed * -200]);
  return (
    <motion.div
      className={`absolute ${photo.w} aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white`}
      style={{
        left: `${photo.x}%`,
        top: `${photo.y}%`,
        zIndex: photo.z,
        rotate: photo.rotate,
        y: yOffset,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay: 0.3 + index * 0.15 }}
    >
      <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover object-top" />
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
  return <div className={`rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
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
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${GREEN}, transparent, ${ROSE}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── COUNTER ANIMATION ───────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Wellness Exams", description: "Comprehensive annual check-ups including bloodwork, dental assessment, and full physical examination. We catch issues early so your pet stays healthy longer.", icon: Stethoscope },
  { title: "Vaccinations", description: "Complete vaccination programs for dogs, cats, and exotic pets following the latest AVMA guidelines. Core and lifestyle vaccines customized to your pet.", icon: Syringe },
  { title: "Surgery", description: "From routine spay/neuter to advanced orthopedic and soft tissue surgery. Our surgical suite features patient monitoring and heated recovery beds.", icon: FirstAidKit },
  { title: "Dental Care", description: "Professional dental cleanings, extractions, and oral health assessments under anesthesia with full monitoring. Dental disease affects 80% of pets by age 3.", icon: Tooth },
  { title: "Emergency Care", description: "Urgent and emergency veterinary services when your pet needs immediate attention. Trauma, poisoning, acute illness handled with speed and skill.", icon: Warning },
  { title: "Grooming", description: "Full-service grooming including baths, breed-specific haircuts, nail trims, ear cleaning, and de-shedding treatments. Your pet leaves happy.", icon: Scissors },
  { title: "Senior Pet Care", description: "Specialized geriatric wellness programs with semi-annual bloodwork, arthritis management, and cognitive health monitoring for pets 7 years and older.", icon: Heartbeat },
  { title: "Exotic Animals", description: "Experienced care for rabbits, guinea pigs, reptiles, birds, and other exotic species. Dr. Hartmann has special training in avian and exotic medicine.", icon: Bird },
];

const petTypes = [
  { name: "Dogs", description: "From playful puppies to senior companions, we provide breed-specific care tailored to your dog's unique needs.", icon: Dog, img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80" },
  { name: "Cats", description: "Feline-friendly handling with separate waiting areas and exam rooms. We speak cat and we make sure they know it.", icon: Cat, img: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=80" },
  { name: "Exotic Pets", description: "Rabbits, birds, reptiles, guinea pigs, and more. Specialized husbandry advice and medical care for your unique companion.", icon: Bird, img: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&q=80" },
  { name: "Senior Pets", description: "Geriatric wellness programs, arthritis management, and cognitive health monitoring for pets in their golden years.", icon: Heartbeat, img: "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=500&q=80" },
];

const fearFreeFeatures = [
  { title: "Fear-Free Certified", description: "Every team member is Fear Free Certified, trained to minimize fear, anxiety, and stress during veterinary visits.", icon: Certificate },
  { title: "Gentle Handling", description: "Low-stress restraint techniques, towel wraps, and patience-first approach. We never rush your pet through an exam.", icon: Heart },
  { title: "Calming Treats & Pheromones", description: "Adaptil and Feliway diffusers in every room. Treats and positive reinforcement throughout the visit.", icon: PawPrint },
  { title: "Separate Waiting Areas", description: "Dogs and cats never have to share a waiting room. Separate entrances, separate spaces, separate calm.", icon: Shield },
];

const wellnessPlans = [
  {
    name: "Puppy/Kitten Plan",
    price: "$39",
    period: "/mo",
    features: ["All core vaccinations", "3 wellness exams", "Spay/neuter discount", "Deworming protocol", "Microchipping included", "24/7 nurse hotline"],
    featured: false,
  },
  {
    name: "Adult Plan",
    price: "$29",
    period: "/mo",
    features: ["Annual comprehensive exam", "Core vaccinations", "Dental cleaning discount", "Bloodwork panel", "Flea/tick prevention", "15% off all services"],
    featured: true,
  },
  {
    name: "Senior Plan",
    price: "$49",
    period: "/mo",
    features: ["Semi-annual exams", "Full bloodwork (2x/year)", "Arthritis management", "Dental cleaning included", "Thyroid screening", "Priority scheduling"],
    featured: false,
  },
];

const testimonials = [
  { name: "The Park Family", pet: "Bailey", text: "Dr. Hartmann saved our golden retriever Bailey's life. Emergency surgery at 11pm. She stayed all night monitoring him. We owe her everything.", rating: 5 },
  { name: "Kevin T.", pet: "Mochi", text: "Mochi (our cat) used to SCREAM at the vet. At Northshore, she actually purrs. Fear-free is real. I never believed it until I saw it myself.", rating: 5 },
  { name: "Zoe M.", pet: "Spike", text: "Our bearded dragon Spike needed surgery. Most vets wouldn't touch him. Dr. Hartmann didn't hesitate. She treated him like he was a golden retriever.", rating: 5 },
  { name: "Sandra & Jeff W.", pet: "Max", text: "They caught a heart condition in our senior lab Max during a routine checkup. Early detection saved his life. We're forever grateful to this team.", rating: 5 },
  { name: "Priya K.", pet: "Luna", text: "Best grooming in Kirkland. Luna comes home smelling amazing and actually happy. No more post-grooming anxiety. The groomers here are true animal lovers.", rating: 5 },
];

const comparisonRows = [
  { feature: "Fear-Free Certified Staff", us: true, them: "Rarely" },
  { feature: "Exotic Animal Care", us: true, them: "No" },
  { feature: "Same-Day Emergency Visits", us: true, them: "Sometimes" },
  { feature: "Separate Cat/Dog Areas", us: true, them: "No" },
  { feature: "In-House Lab Results", us: true, them: "Sent Out (days)" },
  { feature: "Wellness Plan Options", us: true, them: "Varies" },
  { feature: "24/7 Nurse Hotline", us: true, them: "No" },
];

const collagePhotos = [
  { src: "/images/vet-hero-dog.png", alt: "Australian Shepherd at Northshore Vet", z: 30, x: 0, y: 0, w: "w-64 md:w-80", speed: 0.15, rotate: -3 },
  { src: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80", alt: "Orange cat relaxing", z: 20, x: 55, y: 15, w: "w-44 md:w-56", speed: 0.25, rotate: 4 },
  { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80", alt: "Two happy dogs", z: 25, x: 10, y: 55, w: "w-40 md:w-48", speed: 0.2, rotate: -2 },
  { src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80", alt: "Two happy dogs", z: 15, x: 50, y: 60, w: "w-44 md:w-52", speed: 0.3, rotate: 3 },
  { src: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80", alt: "Puppy portrait", z: 22, x: 70, y: -5, w: "w-36 md:w-44", speed: 0.18, rotate: -5 },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function V2VeterinaryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openService, setOpenService] = useState<number | null>(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  /* Parallax for hero collage */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#1c1917" }}>
      <FloatingPawPrints />

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PawPrint size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span className="text-lg font-bold tracking-tight text-[#1c1917]">Northshore Vet Clinic</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-[#6b7280]">
              <a href="#services" className="hover:text-[#1c1917] transition-colors">Services</a>
              <a href="#fear-free" className="hover:text-[#1c1917] transition-colors">Fear-Free</a>
              <a href="#about" className="hover:text-[#1c1917] transition-colors">Dr. Hartmann</a>
              <a href="#testimonials" className="hover:text-[#1c1917] transition-colors">Reviews</a>
              <a href="#contact" className="hover:text-[#1c1917] transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                Schedule a Visit
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
                  {[{ label: "Services", href: "#services" }, { label: "Fear-Free", href: "#fear-free" }, { label: "Dr. Hartmann", href: "#about" }, { label: "Reviews", href: "#testimonials" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-[#4b5563] hover:text-[#1c1917] hover:bg-gray-50 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ═══ 1. HERO — PET PHOTO COLLAGE WITH PARALLAX ═══ */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center pt-24 pb-16 z-10 overflow-hidden">
        {/* Warm gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${ROSE} 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <div className="space-y-8 relative z-20">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-200 bg-green-50/80 backdrop-blur-sm">
              <Heart size={14} weight="fill" style={{ color: ROSE }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>New Patients Welcome</span>
            </motion.div>
            <div>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 }} className="text-sm uppercase tracking-widest mb-4" style={{ color: GREEN_LIGHT }}>
                Northshore Vet Clinic &mdash; Kirkland, WA
              </motion.p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] font-bold text-[#1c1917]">
                <WordReveal text="Compassionate Care for Every Pet" />
              </h1>
            </div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.6 }} className="text-lg text-[#6b7280] max-w-md leading-relaxed">
              Dr. Lisa Hartmann and her Fear Free Certified team have been treating dogs, cats, and exotic pets in Kirkland for over 15 years. Your pet is family &mdash; we treat them that way.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.8 }} className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20" style={{ background: GREEN } as React.CSSProperties}>
                Schedule a Visit <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-[#1c1917] border border-gray-200 bg-white/60 backdrop-blur-sm flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" style={{ color: GREEN }} /> (425) 555-0196
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right: Parallax Pet Photo Collage */}
          <div className="relative h-[400px] md:h-[520px] lg:h-[560px] hidden md:block">
            {collagePhotos.map((photo, i) => (
              <CollagePhoto key={i} photo={photo} index={i} scrollYProgress={scrollYProgress} />
            ))}
          </div>

          {/* Mobile single hero image */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="md:hidden rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3]">
            <img src="/images/vet-hero-dog.png" alt="Australian Shepherd at Northshore Vet" className="w-full h-full object-cover object-top" />
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. TRUST BAR ═══ */}
      <SectionReveal className="relative z-10 -mt-4 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <GlassCard className="p-6 md:p-8">
            <motion.div className="grid grid-cols-2 sm:grid-cols-5 gap-6 md:gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {[
                { value: 15, suffix: "+", label: "Years of Care", icon: Heart },
                { value: 0, label: "WSU Trained", icon: Certificate, text: "WSU" },
                { value: 0, label: "Fear Free Certified", icon: Shield, text: "Fear Free" },
                { value: 2000, suffix: "+", label: "Patients Treated", icon: PawPrint },
                { value: 49, suffix: "", label: "Google Rating", icon: Star, text: "4.9" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center">
                  <stat.icon size={24} weight="duotone" style={{ color: GREEN_LIGHT }} className="mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-[#1c1917]">
                    {stat.text ? stat.text : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="text-xs text-[#6b7280] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══ 3. SERVICES ═══ */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <svg width="100%" height="100%"><pattern id="vet-paw-pattern" width="60" height="60" patternUnits="userSpaceOnUse"><text x="30" y="35" textAnchor="middle" fontSize="18" fill={GREEN} opacity="0.5">&#x1F43E;</text></pattern><rect width="100%" height="100%" fill="url(#vet-paw-pattern)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Our Services</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Complete Pet Healthcare" />
            </h2>
            <p className="text-[#6b7280] mt-4 max-w-xl mx-auto">From nose to tail, we provide comprehensive care for dogs, cats, exotic pets, and senior companions.</p>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors" style={{ background: GREEN_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1c1917] mb-2">{svc.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{svc.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ 4. PET TYPES WE TREAT ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(100px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Who We Treat</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Every Pet Deserves Great Care" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {petTypes.map((pet, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }} transition={springFast}>
                <GlassCard className="overflow-hidden h-full">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={pet.img} alt={pet.name} className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <pet.icon size={16} weight="duotone" style={{ color: GREEN }} />
                        <span className="text-sm font-semibold text-[#1c1917]">{pet.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-[#6b7280] leading-relaxed">{pet.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ 5. BEFORE / AFTER ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Grooming Transformations</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="The Northshore Glow-Up" />
            </h2>
            <p className="text-[#6b7280] mt-4 max-w-lg mx-auto">Our professional grooming team works wonders. See the transformation for yourself.</p>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="relative aspect-[16/9] md:aspect-[2.4/1]">
              <img src="/images/vet-before-after.png" alt="Dog grooming transformation at Northshore Vet Clinic" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Scissors size={20} weight="duotone" style={{ color: GREEN_LIGHT }} />
                <span className="text-sm font-semibold text-[#1c1917]">Professional Pet Grooming</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Heart size={16} weight="fill" style={{ color: ROSE }} />
                <span>Bath, haircut, nails, ears &mdash; the full spa day</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══ 6. FEAR-FREE SECTION ═══ */}
      <SectionReveal id="fear-free" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent, rgba(22,163,74,0.03), transparent)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={spring} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50/80 mb-6">
                <Heart size={14} weight="fill" style={{ color: ROSE }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROSE }}>Fear-Free Practice</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="We Understand Pet Anxiety" />
              </h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md mb-4">
                Vet visits don&apos;t have to be stressful. Our entire team is Fear Free Certified &mdash; meaning we&apos;ve invested hundreds of hours learning how to make your pet&apos;s experience calm, comfortable, and even enjoyable.
              </p>
              <p className="text-[#6b7280] leading-relaxed max-w-md">
                From pheromone diffusers to calming treats, from gentle handling to separate species waiting areas &mdash; every detail is designed around your pet&apos;s emotional wellbeing.
              </p>
            </div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
              {fearFreeFeatures.map((f, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <GlassCard className="p-5 h-full">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: ROSE_GLOW }}>
                      <f.icon size={20} weight="duotone" style={{ color: ROSE }} />
                    </div>
                    <h3 className="text-base font-semibold text-[#1c1917] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{f.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ 7. MEET DR. NAKAMURA ═══ */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] max-w-md mx-auto lg:mx-0 shadow-xl">
                <img src="https://plus.unsplash.com/premium_photo-1702599248518-dc32349b900a?w=600&q=80" alt="Dr. Lisa Hartmann, DVM with a happy patient" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <GlassCard className="px-4 py-3 inline-flex items-center gap-3">
                    <Stethoscope size={18} weight="duotone" style={{ color: GREEN_LIGHT }} />
                    <span className="text-sm text-[#1c1917] font-medium">15 Years in Veterinary Medicine</span>
                  </GlassCard>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Meet Your Vet</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="Dr. Lisa Hartmann, DVM" />
              </h2>
              <div className="space-y-4 text-[#6b7280] leading-relaxed">
                <p>Dr. Hartmann grew up on a farm in Yakima, Washington. She knew by age 8 she would be a veterinarian &mdash; after bottle-feeding an orphaned lamb through the night and watching it thrive.</p>
                <p>She graduated from Washington State University&apos;s College of Veterinary Medicine and completed advanced training in small animal surgery and exotic animal medicine. She founded Northshore Vet Clinic in Kirkland 15 years ago with one goal: treat every patient like family.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Certificate, label: "WSU College of Vet Medicine" },
                  { icon: Shield, label: "Fear Free Certified" },
                  { icon: Bird, label: "Exotic Animal Specialist" },
                  { icon: Heart, label: "AAHA Accredited" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GREEN_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
                    </div>
                    <span className="text-sm text-[#4b5563]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ 8. WELLNESS PLANS ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent, rgba(22,163,74,0.04), transparent)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Wellness Plans</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Affordable Preventive Care" />
            </h2>
            <p className="text-[#6b7280] mt-4 max-w-xl mx-auto">Spread the cost of your pet&apos;s healthcare across easy monthly payments. No surprises, no deductibles.</p>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {wellnessPlans.map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                {plan.featured ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#1c1917]">{plan.name}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: GREEN }}>POPULAR</span>
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-[#1c1917]">{plan.price}</span>
                        <span className="text-[#6b7280]">{plan.period}</span>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm text-[#4b5563]">
                            <CheckCircle size={16} weight="fill" style={{ color: GREEN_LIGHT }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                        Enroll Now
                      </MagneticButton>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-[#1c1917] mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#1c1917]">{plan.price}</span>
                      <span className="text-[#6b7280]">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-[#4b5563]">
                          <CheckCircle size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-[#1c1917] border border-gray-200 cursor-pointer">
                      Learn More
                    </MagneticButton>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ 9. CHECKUP QUIZ ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Quick Check</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="When Was Your Pet's Last Checkup?" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { label: "Under 6 Months", color: "#16a34a", bg: "bg-green-50", border: "border-green-200", recommendation: "Great job! You're on track. Keep up with regular wellness visits to maintain your pet's health." },
              { label: "6 - 12 Months", color: "#d97706", bg: "bg-amber-50", border: "border-amber-200", recommendation: "Time to schedule! Annual exams catch issues early. Call us at (425) 555-0196 to book your pet's checkup." },
              { label: "Over a Year", color: "#dc2626", bg: "bg-red-50", border: "border-red-200", recommendation: "Your pet needs to be seen soon. Pets age 5-7x faster than humans. Call (425) 555-0196 today for a $49 new patient exam." },
            ].map((option, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setQuizAnswer(quizAnswer === i ? null : i)}
                  className={`w-full rounded-2xl border-2 p-6 text-center transition-all cursor-pointer ${quizAnswer === i ? `${option.bg} ${option.border} shadow-md` : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: `${option.color}15` }}>
                    <Clock size={24} weight="duotone" style={{ color: option.color }} />
                  </div>
                  <span className="text-base font-semibold text-[#1c1917]">{option.label}</span>
                </button>
                <AnimatePresence>
                  {quizAnswer === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <div className={`mt-3 p-4 rounded-xl ${option.bg} border ${option.border}`}>
                        <p className="text-sm leading-relaxed" style={{ color: option.color }}>{option.recommendation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ 10. TESTIMONIALS — PET NAME CARDS ═══ */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent, rgba(22,163,74,0.03), transparent)` }} />
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-6">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Happy Pet Parents</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Stories From Our Family" />
            </h2>
          </div>
          {/* Google Reviews Header */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={20} weight="fill" style={{ color: "#facc15" }} />))}</div>
            <span className="text-lg font-bold text-[#1c1917]">4.9</span>
            <span className="text-sm text-[#6b7280]">from 200+ reviews on Google</span>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className={i >= 3 ? "lg:col-span-1 md:col-span-1" : ""}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <PawPrint size={18} weight="fill" style={{ color: GREEN_LIGHT }} />
                    <span className="text-sm font-bold" style={{ color: GREEN }}>{t.pet}</span>
                    <span className="text-xs text-[#9ca3af]">&apos;s story</span>
                  </div>
                  <Quotes size={24} weight="fill" style={{ color: GREEN_LIGHT }} className="mb-2 opacity-40" />
                  <p className="text-[#4b5563] leading-relaxed flex-1 text-sm">{t.text}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1c1917]">{t.name}</span>
                      <CheckCircle size={14} weight="fill" style={{ color: GREEN_LIGHT }} />
                    </div>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => (<Star key={j} size={12} weight="fill" style={{ color: "#facc15" }} />))}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ═══ 11. COMPETITOR COMPARISON ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Why Northshore</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917]">
              <WordReveal text="Northshore vs Chain Vet Clinics" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-[#6b7280] font-medium">Feature</th>
                    <th className="text-center px-6 py-4 font-semibold text-[#1c1917]">Northshore Vet</th>
                    <th className="text-center px-6 py-4 text-[#6b7280] font-medium">Chain Clinics</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className={i < comparisonRows.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="px-6 py-4 text-[#4b5563]">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle size={20} weight="fill" style={{ color: GREEN_LIGHT }} className="inline-block" />
                      </td>
                      <td className="px-6 py-4 text-center text-[#9ca3af]">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ═══ 12. VIDEO PLACEHOLDER ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video shadow-xl cursor-pointer group">
            <img src="https://plus.unsplash.com/premium_photo-1661942274165-00cc8d55a93f?w=1200&q=80" alt="Inside Northshore Vet Clinic — exam room with care team" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <motion.div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl" whileHover={{ scale: 1.1 }} transition={springFast}>
                <Play size={36} weight="fill" style={{ color: GREEN }} className="ml-1" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white text-xl md:text-2xl font-bold">Tour Our Hospital</p>
              <p className="text-white/70 text-sm mt-1">See where the magic happens</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ 13. NEW CLIENT SPECIAL ═══ */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={spring}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 bg-rose-50/80 mb-6">
                  <Heart size={14} weight="fill" style={{ color: ROSE }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROSE }}>Limited Time Offer</span>
                </div>
                <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold text-[#1c1917] mb-4">New Client Special</h2>
                <p className="text-[#6b7280] text-lg mb-2">Complete wellness exam, vaccination review, and full health consultation</p>
                <p className="text-5xl md:text-6xl font-bold tracking-tighter mb-2" style={{ color: GREEN }}>$49</p>
                <p className="text-[#9ca3af] text-sm mb-8">Regular value $120 &mdash; first visit discount for new furry friends</p>
                <MagneticButton className="px-10 py-4 rounded-full text-base font-semibold text-white inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20" style={{ background: GREEN } as React.CSSProperties}>
                  <CalendarCheck size={20} weight="duotone" /> Claim Your $49 Exam
                </MagneticButton>
              </motion.div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ═══ 14. CONTACT ═══ */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: GREEN_LIGHT }}>Get in Touch</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-[#1c1917] mb-6">
                <WordReveal text="Schedule a Visit" />
              </h2>
              <p className="text-[#6b7280] leading-relaxed max-w-md mb-8">
                Your pet&apos;s health is our priority. Book an appointment today and experience the Northshore difference.
              </p>

              {/* Emergency CTA */}
              <div className="mb-8 p-4 rounded-xl border-2 border-red-200 bg-red-50/80">
                <div className="flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Pet Emergency?</p>
                    <p className="text-sm text-red-600">Call <a href="tel:4255550196" className="font-bold underline">(425) 555-0196</a> immediately</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Location", value: "10234 NE 68th St, Kirkland, WA 98033", href: "https://maps.google.com/?q=10234+NE+68th+St+Kirkland+WA+98033" },
                  { icon: Phone, label: "Phone", value: "(425) 555-0196", href: "tel:4255550196" },
                  { icon: Envelope, label: "Email", value: "care@northshorevetclinic.com", href: "mailto:care@northshorevetclinic.com" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri 7am-7pm\nSaturday 8am-5pm\nSunday 10am-4pm (emergencies)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: GREEN_LIGHT }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1c1917]">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel={item.href.startsWith("https") ? "noopener noreferrer" : undefined} className="text-sm hover:underline" style={{ color: GREEN }}>{item.value}</a>
                      ) : (
                        <p className="text-sm text-[#6b7280] whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold text-[#1c1917] mb-6">Book an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-green-500/50" />
                  <input type="text" placeholder="Pet's Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-green-500/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-green-500/50" />
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-green-500/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#9ca3af] text-sm focus:outline-none focus:border-green-500/50">
                    <option value="">Pet Type</option>
                    <option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option><option>Reptile</option><option>Other</option>
                  </select>
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#9ca3af] text-sm focus:outline-none focus:border-green-500/50">
                    <option value="">Service Needed</option>
                    <option>Wellness Exam</option><option>Vaccinations</option><option>Surgery Consult</option><option>Dental</option><option>Grooming</option><option>Emergency</option><option>Other</option>
                  </select>
                </div>
                <textarea placeholder="Tell us about your pet and their needs..." rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-green-500/50 resize-none" />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GREEN } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} weight="duotone" /> Request Appointment</span>
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ═══ 15. FOOTER ═══ */}
      <footer className="relative z-10 border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <PawPrint size={24} weight="duotone" style={{ color: GREEN_LIGHT }} />
                <span className="text-lg font-bold tracking-tight text-[#1c1917]">Northshore Vet Clinic</span>
              </div>
              <p className="text-sm text-[#6b7280] max-w-sm mb-4">Compassionate veterinary care for dogs, cats, and exotic pets in Kirkland, WA. Fear Free Certified practice led by Dr. Lisa Hartmann, DVM.</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-700">AAHA Accredited</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-700">WSVA Member</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-200 bg-green-50 text-green-700">Fear Free Certified</span>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-4">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Fear-Free", "Dr. Hartmann", "Reviews", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-").replace("dr.-", "")}`} className="block text-sm text-[#6b7280] hover:text-[#1c1917] transition-colors">{link}</a>
                ))}
              </div>
            </div>
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-[#1c1917] mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-[#6b7280]">
                <a href="tel:4255550196" className="block hover:text-[#1c1917] transition-colors">(425) 555-0196</a>
                <a href="mailto:care@northshorevetclinic.com" className="block hover:text-[#1c1917] transition-colors">care@northshorevetclinic.com</a>
                <a href="https://maps.google.com/?q=10234+NE+68th+St+Kirkland+WA+98033" target="_blank" rel="noopener noreferrer" className="block hover:text-[#1c1917] transition-colors">10234 NE 68th St<br />Kirkland, WA 98033</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
              <PawPrint size={16} weight="duotone" style={{ color: GREEN_LIGHT }} />
              <span>Northshore Vet Clinic &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-[#6b7280] flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1c1917] transition-colors">bluejayportfolio.com</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
