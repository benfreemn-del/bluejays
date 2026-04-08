"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import { PawPrint, Dog, Cat, Scissors, Heart, Star, ShieldCheck, Clock, Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Users, Quotes, Van } from "@phosphor-icons/react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: spring } };

const ORANGE = "#f59e0b";
const SKY = "#0ea5e9";
const BG = "#0a1015";

function FloatingParticles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 6, size: 2 + Math.random() * 4, opacity: 0.15 + Math.random() * 0.3, isSky: Math.random() > 0.5 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isSky ? SKY : ORANGE, willChange: "transform, opacity" }}
          animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }}
        />
      ))}
    </div>
  );
}

function PawPattern({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="pawGrid" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="35" r="8" fill={ORANGE} opacity="0.3" />
          <circle cx="35" cy="22" r="4" fill={ORANGE} opacity="0.2" />
          <circle cx="65" cy="22" r="4" fill={ORANGE} opacity="0.2" />
          <circle cx="30" cy="35" r="4" fill={ORANGE} opacity="0.2" />
          <circle cx="70" cy="35" r="4" fill={ORANGE} opacity="0.2" />
          <circle cx="50" cy="85" r="6" fill={SKY} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pawGrid)" />
    </svg>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function SectionReveal({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return <motion.section ref={ref} id={id} className={className} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }} transition={spring}>{children}</motion.section>;
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span ref={ref} className={`inline-flex flex-wrap gap-x-3 ${className}`} variants={stagger} initial="hidden" animate={isInView ? "show" : "hidden"}>
      {text.split(" ").map((word, i) => <motion.span key={i} variants={fadeUp} className="inline-block">{word}</motion.span>)}
    </motion.span>
  );
}

function MagneticButton({ children, className = "", onClick, style }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${ORANGE}, transparent, ${SKY}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0a1015] z-10">{children}</div>
    </div>
  );
}

const services = [
  { name: "Professional Grooming", desc: "Full-service grooming including baths, haircuts, nail trimming, and breed-specific styling.", icon: Scissors },
  { name: "Overnight Boarding", desc: "Comfortable, supervised overnight stays with playtime, feeding schedules, and bedtime cuddles.", icon: Heart },
  { name: "Doggy Daycare", desc: "A full day of socialization, exercise, and enrichment activities in our spacious play areas.", icon: Dog },
  { name: "Behavior Training", desc: "Positive reinforcement training from certified professionals — obedience, agility, and manners.", icon: Star },
  { name: "Dog Walking", desc: "Reliable daily walks with GPS tracking, photo updates, and personalized routes for your pup.", icon: PawPrint },
  { name: "Pet Taxi Service", desc: "Safe, comfortable transportation to vet appointments, groomers, or anywhere your pet needs to go.", icon: Van },
];

const stats = [{ value: "5,000+", label: "Happy Pets Served" }, { value: "12+", label: "Years Experience" }, { value: "100%", label: "Certified Staff" }, { value: "4.9★", label: "Pet Parent Rating" }];

const galleryImages = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
  "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=600&q=80",
  "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&q=80",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80",
  "https://images.unsplash.com/photo-1587015990127-424b954b3729?w=600&q=80",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80",
];

const testimonials = [
  { name: "Jessica M.", text: "My golden retriever absolutely LOVES daycare here. He gets so excited when we pull into the parking lot. The staff truly cares about every pet.", rating: 5 },
  { name: "Mark & Sarah T.", text: "We were nervous about boarding our cat for the first time, but they sent us photo updates every few hours. She was happier than at home!", rating: 5 },
  { name: "Diana P.", text: "The grooming is outstanding. My poodle always comes back looking like a show dog. Plus the pet taxi is so convenient for vet visits.", rating: 5 },
];

const faqs = [
  { q: "What vaccinations are required?", a: "All pets must be current on rabies, distemper, and bordetella. We require proof of vaccination before the first visit for the safety of all our furry guests." },
  { q: "Can I see the facility before booking?", a: "Absolutely! We encourage facility tours. Come see our play areas, boarding suites, and grooming stations. We want you to feel confident in your choice." },
  { q: "Do you accept cats and other pets?", a: "Yes! While we specialize in dogs, we also care for cats, rabbits, and other small pets. Our cat boarding area is separate and calm." },
  { q: "What if my pet has special needs?", a: "We're experienced with senior pets, puppies, medical conditions, and anxiety. We create customized care plans for every pet's unique needs." },
];

export default function V2PetServicesShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: "#f1f5f9" }}>
      <FloatingParticles />

      {/* 1. NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2"><PawPrint size={24} weight="fill" style={{ color: ORANGE }} /><span className="text-lg font-bold tracking-tight text-white">Happy Tails Pet Care</span></div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-black transition-colors cursor-pointer" style={{ background: ORANGE }}>Book Now</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>{mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden mt-2 overflow-hidden"><GlassCard className="flex flex-col gap-1 px-4 py-4">{["Services", "Gallery", "About", "Contact"].map((l) => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{l}</a>)}</GlassCard></motion.div>)}</AnimatePresence>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0f1520 0%, ${BG} 50%, #0d1218 100%)` }} />
        <PawPattern opacity={0.05} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ORANGE}0a` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${SKY}08` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ORANGE }}>Trusted Pet Care Professionals</p>
              <h1 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <WordReveal text="Where Every Pet Gets the Royal Treatment" />
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">Professional grooming, daycare, boarding, and training — all delivered with love by certified pet care specialists.</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-black flex items-center gap-2 cursor-pointer" style={{ background: ORANGE }}>Book Appointment <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> (425) 555-0183</MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: ORANGE }} /> Bellevue, WA</span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: ORANGE }} /> Open 7 Days a Week</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1400&q=80" alt="Happy dog at pet care" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1015] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6"><div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ORANGE}4d` }}><Heart size={18} weight="fill" style={{ color: ORANGE }} /><span className="text-sm font-semibold text-white">5,000+ Happy Pets</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden border-y border-white/10">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0c1218 0%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const icons = [PawPrint, Clock, ShieldCheck, Star];
              return (<div key={stat.label} className="text-center"><div className="flex items-center justify-center gap-2 mb-2">{(() => { const Icon = icons[i]; return <Icon size={22} weight="fill" style={{ color: ORANGE }} />; })()}<span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span></div><span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span></div>);
            })}
          </div>
        </div>
      </SectionReveal>

      {/* 4. SERVICES */}
      <SectionReveal id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Our Services</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Everything Your Pet Needs</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ORANGE}15, transparent 70%)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: `${ORANGE}26`, borderColor: `${ORANGE}33` }}><Icon size={24} weight="duotone" style={{ color: ORANGE }} /></div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* 5. ABOUT */}
      <SectionReveal id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10"><img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80" alt="Pet care team" className="w-full h-[400px] object-cover" /></div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6"><div className="px-5 py-3 rounded-xl backdrop-blur-md border text-black font-bold text-sm shadow-lg" style={{ background: `${ORANGE}e6`, borderColor: `${ORANGE}80` }}>5,000+ Happy Pets</div></div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>About Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">We Love What We Do</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Happy Tails was founded by pet lovers, for pet lovers. Every member of our team is certified in pet first aid, animal behavior, and grooming. We treat every pet like our own because that&apos;s exactly what they deserve.</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: ShieldCheck, label: "Certified Staff" }, { icon: Heart, label: "Pet-First Approach" }, { icon: Star, label: "5-Star Rated" }, { icon: CheckCircle, label: "Fully Insured" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ORANGE}26` }}><badge.icon size={20} weight="duotone" style={{ color: ORANGE }} /></div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* 6. GALLERY */}
      <SectionReveal id="gallery" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Gallery</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Our Happy Clients</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((src, i) => (
              <div key={i} className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] ${i < 2 ? "md:row-span-2" : ""}`}>
                <img src={src} alt={`Happy pet ${i + 1}`} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i < 2 ? "h-64 md:h-full" : "h-48"}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* 7. TESTIMONIALS */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Pet Parent Love</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <Quotes size={28} weight="fill" style={{ color: ORANGE }} className="mb-4 opacity-40" />
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={16} weight="fill" style={{ color: ORANGE }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5"><span className="text-sm font-semibold text-white">{t.name}</span></div>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* 8. FAQ */}
      <SectionReveal className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">Common Questions</h2>
            <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${ORANGE}, transparent)` }} />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
                  <span className="text-lg font-semibold text-white pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
                </button>
                <AnimatePresence initial={false}>{openFaq === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden"><p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{faq.a}</p></motion.div>)}</AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* 9. NEW CLIENT */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE}cc, ${ORANGE})` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PawPrint size={48} weight="fill" className="mx-auto mb-6 text-black/60" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">New Client Special!</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">First-time visitors get a complimentary temperament assessment and 20% off their first service. Your pet&apos;s happiness starts here.</p>
          <a href="tel:+14255550183" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors"><Phone size={20} weight="fill" /> (425) 555-0183</a>
        </div>
      </section>

      {/* 10. CONTACT */}
      <SectionReveal id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d1218 50%, ${BG} 100%)` }} />
        <PawPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Book Your Pet&apos;s Visit</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Schedule a tour, book a service, or ask us anything. We&apos;re here to help!</p>
              <div className="space-y-5">
                {[{ icon: MapPin, title: "Address", text: "456 Pet Haven Dr, Bellevue, WA 98004" }, { icon: Phone, title: "Phone", text: "(425) 555-0183" }, { icon: Clock, title: "Hours", text: "Mon-Sun 7AM-7PM" }].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ORANGE}26` }}><item.icon size={20} weight="duotone" style={{ color: ORANGE }} /></div>
                    <div><p className="text-sm font-semibold text-white">{item.title}</p><p className="text-sm text-slate-400">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Book an Appointment</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">Your Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Your name" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Pet&apos;s Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Pet's name" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Service Needed</label><select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm"><option value="" className="bg-neutral-900">Select a service</option>{services.map((s) => <option key={s.name} value={s.name.toLowerCase()} className="bg-neutral-900">{s.name}</option>)}</select></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-black flex items-center justify-center gap-2 cursor-pointer" style={{ background: ORANGE }}>Book Now <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* 11. GUARANTEE */}
      <SectionReveal className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0c1218 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder><div className="p-8 md:p-12">
            <Heart size={48} weight="fill" style={{ color: ORANGE }} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Happy Pet Guarantee</h2>
            <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">If your pet isn&apos;t happy, we&apos;re not happy. We guarantee a safe, fun, and loving experience for every furry friend.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Certified Staff", "Pet First Aid", "Photo Updates", "Satisfaction Guaranteed"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ORANGE, borderColor: `${ORANGE}33`, background: `${ORANGE}0d` }}><CheckCircle size={16} weight="fill" /> {item}</span>
              ))}
            </div>
          </div></ShimmerBorder>
        </div>
      </SectionReveal>

      {/* 12. FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060a0f 100%)` }} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-3"><PawPrint size={22} weight="fill" style={{ color: ORANGE }} /><span className="text-lg font-bold text-white">Happy Tails Pet Care</span></div><p className="text-sm text-slate-500 leading-relaxed">Professional pet care with love. Grooming, daycare, boarding, and training.</p></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4><div className="space-y-2">{["Services", "Gallery", "About", "Contact"].map((link) => <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>)}</div></div>
            <div><h4 className="text-sm font-semibold text-white mb-3">Contact</h4><div className="space-y-2 text-sm text-slate-500"><p>(425) 555-0183</p><p>456 Pet Haven Dr, Bellevue, WA 98004</p></div></div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500"><PawPrint size={14} weight="fill" style={{ color: ORANGE }} /><span>Happy Tails Pet Care &copy; {new Date().getFullYear()}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-600"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg><span>Website created by Bluejay Business Solutions</span></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
