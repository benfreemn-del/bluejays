"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */
/* eslint-disable react-hooks/purity -- Decorative particle values are intentionally randomized for static visual effects in these marketing pages and previews; this preserves existing appearance without changing business logic. */
import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Sparkle, Heart, Clock, Phone, MapPin, CaretDown, List, X, Star, ArrowRight, CheckCircle, ShieldCheck, Syringe, Drop, Leaf, Flower, Crown, Eyedropper, HandHeart, Certificate } from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";
import { pickFromPool, pickGallery } from "@/lib/stock-image-picker";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const BG = "#0a0a0a";
const DEFAULT_BLUSH = "#f9a8d4";
const GOLD = "#d4a853";
function getAccent(accentColor?: string) { const c = accentColor || DEFAULT_BLUSH; return { ACCENT: c, ACCENT_GLOW: `${c}26` }; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = { botox: Syringe, filler: Syringe, laser: Sparkle, peel: Drop, facial: Heart, body: Sparkle, skin: Heart, injection: Syringe, hydra: Drop, micro: Sparkle, led: Sparkle, wellness: Leaf, lip: Syringe, contour: Eyedropper, chemical: Drop, dermaplaning: Sparkle, rf: Sparkle, prp: Syringe };
function getServiceIcon(n: string) { const l = n.toLowerCase(); for (const [k, I] of Object.entries(SERVICE_ICON_MAP)) { if (l.includes(k)) return I; } return Sparkle; }

const STOCK_HERO_POOL = [
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1400&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400&q=80",
];
const STOCK_ABOUT_POOL = [
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
];
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  "https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
];

/* ─── Decorative helpers ─── */

function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 8, duration: 5 + Math.random() * 7, size: 2 + Math.random() * 3, opacity: 0.12 + Math.random() * 0.25, isGold: Math.random() > 0.6 }));
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.isGold ? GOLD : accent, willChange: "transform, opacity" }} animate={{ y: ["-10vh", "110vh"], opacity: [0, p.opacity, p.opacity, 0] }} transition={{ y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }, opacity: { duration: p.duration, repeat: Infinity, delay: p.delay, times: [0, 0.1, 0.9, 1] } }} />
      ))}
    </div>
  );
}

function SpaWavePattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  const patternId = `spaWaveV2Prev-${accent.replace("#", "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={patternId} width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="3" fill={accent} opacity="0.2" />
          <circle cx="25" cy="15" r="1.5" fill={accent} opacity="0.3" />
          <circle cx="15" cy="25" r="2" fill={GOLD} opacity="0.15" />
          <circle cx="60" cy="50" r="2.5" fill={accent} opacity="0.2" />
          <circle cx="55" cy="55" r="1" fill={GOLD} opacity="0.25" />
          <circle cx="40" cy="70" r="2" fill={accent} opacity="0.15" />
          <circle cx="70" cy="30" r="1.5" fill={accent} opacity="0.2" />
          <path d="M30 40 Q35 35 40 40" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function FlowingCurves({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 1000 600" preserveAspectRatio="none">
      <motion.path d="M100 0 Q120 100 100 200 Q80 300 100 400 Q120 500 100 600" fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      <motion.path d="M500 0 Q480 150 500 300 Q520 450 500 600" fill="none" stroke={GOLD} strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
      <motion.path d="M850 0 Q870 100 850 200 Q830 300 850 400" fill="none" stroke={accent} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
    </svg>
  );
}

/* ─── Shared UI components ─── */

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>{children}</div>;
}

function MagneticButton({ children, className = "", onClick, style, href }: { children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties; href?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, springFast); const springY = useSpring(y, springFast);
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!ref.current || isTouchDevice) return; const rect = ref.current.getBoundingClientRect(); x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25); y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25); }, [x, y, isTouchDevice]);
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  if (href) return <motion.a href={href} ref={ref as unknown as React.Ref<HTMLAnchorElement>} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>} onMouseLeave={handleMouseLeave} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.a>;
  return <motion.button ref={ref} style={{ x: springX, y: springY, willChange: "transform", ...style }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={className} whileTap={{ scale: 0.97 }}>{children}</motion.button>;
}

function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD}, transparent)`, willChange: "transform" }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="relative rounded-2xl bg-[#0e0e0e] z-10">{children}</div>
    </div>
  );
}

function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}><CaretDown size={20} className="text-slate-400 shrink-0" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
            <p className="px-5 pb-5 md:px-6 md:pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function SectionHeader({ badge, title, subtitle, accent }: { badge: string; title: string; subtitle?: string; accent: string }) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>{badge}</span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 1, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: "easeOut" as const }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Treatment categories for filter ─── */
const TREATMENT_CATEGORIES = ["All", "Face", "Body", "Skin", "Injectables"];

/* ─── Skin concern quiz options ─── */
const SKIN_CONCERNS = [
  { label: "Fine Lines & Wrinkles", icon: Sparkle, color: "#f9a8d4", recommendation: "Botox, dermal fillers, or microneedling can smooth and rejuvenate." },
  { label: "Acne & Scarring", icon: Drop, color: "#a78bfa", recommendation: "Chemical peels, laser therapy, or PRP can restore clear, smooth skin." },
  { label: "Sun Damage & Pigmentation", icon: Flower, color: "#fbbf24", recommendation: "IPL photofacial or laser treatments can even your skin tone beautifully." },
];

/* ─── Membership tiers ─── */
const MEMBERSHIP_TIERS = [
  { name: "Gold", price: "$99/mo", perks: ["10% off all treatments", "Monthly facial or peel", "Priority booking", "Birthday special"], popular: false },
  { name: "Platinum", price: "$199/mo", perks: ["15% off all treatments", "Monthly premium treatment", "Free skin analysis quarterly", "VIP event access", "Complimentary add-ons"], popular: true },
  { name: "Diamond", price: "$349/mo", perks: ["20% off all treatments", "Two premium treatments/mo", "Free products monthly", "Concierge booking", "Exclusive member pricing", "Annual renewal gift"], popular: false },
];

/* ─── Product/certification badges ─── */
const PRODUCT_BADGES = ["Allergan", "Galderma", "SkinCeuticals", "Obagi", "ZO Skin Health", "Juvederm"];

/* ─── Comparison table ─── */
const COMPARISON_ROWS = [
  { feature: "Board-Certified Providers", us: true, them: "Sometimes" },
  { feature: "Personalized Treatment Plans", us: true, them: "Rarely" },
  { feature: "Medical-Grade Products", us: true, them: "Varies" },
  { feature: "Complimentary Consultations", us: true, them: "No" },
  { feature: "Membership Savings", us: true, them: "No" },
  { feature: "Before & After Documentation", us: true, them: "Sometimes" },
  { feature: "Follow-Up Care Included", us: true, them: "Extra Cost" },
];

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function V2MedSpaPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const { ACCENT, ACCENT_GLOW } = getAccent(data.accentColor);
  const uniquePhotos = data.photos ? [...new Set(data.photos)] : [];
  const heroImage = uniquePhotos[0] || pickFromPool(STOCK_HERO_POOL, data.businessName);
  const heroCardImage = uniquePhotos[1] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 1);
  const aboutImage = uniquePhotos[2] || pickFromPool(STOCK_ABOUT_POOL, data.businessName, 2);
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 8) : pickGallery(STOCK_GALLERY, data.businessName);
  const phoneDigits = data.phone.replace(/\D/g, "");

  /* Categorize services for the treatment menu */
  function categorizeService(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("botox") || lower.includes("filler") || lower.includes("injection") || lower.includes("lip")) return "Injectables";
    if (lower.includes("body") || lower.includes("contour") || lower.includes("sculpt") || lower.includes("coolsculpt")) return "Body";
    if (lower.includes("peel") || lower.includes("laser") || lower.includes("micro") || lower.includes("dermaplaning") || lower.includes("led") || lower.includes("hydra")) return "Skin";
    return "Face";
  }

  const filteredServices = activeCategory === "All" ? data.services : data.services.filter(s => categorizeService(s.name) === activeCategory);

  const processSteps = [
    { step: "01", title: "Consultation", desc: "Meet with our medical team to discuss your goals, review your skin, and create a personalized treatment plan." },
    { step: "02", title: "Treatment Plan", desc: "We design a customized approach using the latest techniques and medical-grade products for optimal results." },
    { step: "03", title: "Your Treatment", desc: "Relax in our luxury suite while our board-certified providers deliver your treatment with precision and care." },
    { step: "04", title: "Follow-Up Care", desc: "We schedule follow-up appointments to monitor your progress and ensure you love your results." },
  ];

  const faqs = [
    { q: `What treatments does ${data.businessName} offer?`, a: `We offer a comprehensive menu of aesthetic treatments including ${data.services.slice(0, 3).map(s => s.name).join(", ")}, and more. Each treatment is performed by licensed, board-certified professionals.` },
    { q: "Is there any downtime after treatments?", a: "Downtime varies by treatment. Non-invasive procedures like facials and LED therapy have zero downtime. Injectables may have minimal swelling for 24-48 hours. We discuss recovery expectations during your consultation." },
    { q: "How do I know which treatment is right for me?", a: "During your complimentary consultation, our medical team evaluates your skin, discusses your goals, and recommends a personalized plan. We never push unnecessary treatments." },
    { q: "Are your treatments safe?", a: `Absolutely. ${data.businessName} uses only FDA-approved products and medical-grade equipment. All providers are board-certified with extensive training in aesthetic medicine.` },
    { q: "Do you offer financing or membership plans?", a: "Yes! We offer flexible membership tiers that provide ongoing savings, as well as financing options for larger treatment packages. Ask about our Gold, Platinum, and Diamond memberships." },
  ];

  const fallbackTestimonials = [
    { name: "Stephanie G.", text: "The results are incredible. I look ten years younger and the procedure was completely painless. The staff made me feel so comfortable.", rating: 5 },
    { name: "Diane W.", text: "Best med spa in the area. The staff is knowledgeable and the facility is gorgeous. My skin has never looked better.", rating: 5 },
    { name: "Kristin R.", text: "Finally found a place I trust for my treatments. Professional, clean, and truly results-driven. The membership saves me hundreds.", rating: 5 },
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ fontFamily: "Jost, system-ui, sans-serif", background: BG, color: "#f1f5f9" }}>
      <FloatingParticles accent={ACCENT} />

      {/* ─── 1. NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="fill" style={{ color: ACCENT }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#treatments" className="hover:text-white transition-colors">Treatments</a>
              <a href="#results" className="hover:text-white transition-colors">Results</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Consultation</MagneticButton>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">{mobileMenuOpen ? <X size={24} /> : <List size={24} />}</button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {[{ label: "Treatments", href: "#treatments" }, { label: "Results", href: "#results" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={data.businessName} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <SpaWavePattern opacity={0.04} accent={ACCENT} />
        <FlowingCurves opacity={0.04} accent={ACCENT} />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${ACCENT}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none" style={{ background: `${GOLD}06` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: ACCENT }}>Premium Aesthetic Medicine</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>{data.tagline}</h1>
            </div>
            <p className="text-lg text-white/80 max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{(() => { const t = data.about; if (t.length <= 180) return t; const dot = t.indexOf(".", 80); return dot > 0 && dot < 220 ? t.slice(0, dot + 1) : t.slice(0, 180).trim() + "..."; })()}</p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer"><Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} /></MagneticButton>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Board Certified", "FDA Approved", "Free Consult"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroCardImage} alt={`${data.businessName} treatment`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${ACCENT}4d` }}>
                  <Crown size={18} weight="fill" style={{ color: GOLD }} />
                  <span className="text-sm font-semibold text-white">Luxury Med Spa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATS ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0e0a0c 0%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Sparkle, Clock, Star, ShieldCheck];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: ACCENT }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. TREATMENT MENU (with category filter) ─── */}
      <section id="treatments" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern accent={ACCENT} />
        <FlowingCurves opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${ACCENT}08` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Treatment Menu" title="Our Treatments" subtitle={`${data.businessName} offers a full menu of aesthetic treatments tailored to your unique beauty goals.`} accent={ACCENT} />
          {/* Category filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {TREATMENT_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer" style={{ background: activeCategory === cat ? ACCENT : "rgba(255,255,255,0.05)", color: activeCategory === cat ? "#000" : "#94a3b8", border: `1px solid ${activeCategory === cat ? ACCENT : "rgba(255,255,255,0.1)"}` }}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${ACCENT}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${ACCENT}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: ACCENT_GLOW, borderColor: `${ACCENT}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: ACCENT }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full" style={{ color: GOLD, background: `${GOLD}15` }}>{categorizeService(service.name)}</span>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: ACCENT }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. SKIN CONCERN QUIZ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <FlowingCurves opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Skin Quiz" title="What&apos;s Your Skin Concern?" subtitle="Select your primary concern and get a personalized treatment recommendation." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKIN_CONCERNS.map((concern, i) => (
              <button key={concern.label} onClick={() => setQuizAnswer(i)} className="text-left cursor-pointer group">
                <GlassCard className={`p-6 h-full transition-all duration-300 ${quizAnswer === i ? "ring-2" : ""}`} style={quizAnswer === i ? { borderColor: concern.color, boxShadow: `0 0 20px ${concern.color}22` } as React.CSSProperties : undefined}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border" style={{ background: `${concern.color}15`, borderColor: `${concern.color}33` }}>
                    <concern.icon size={28} weight="duotone" style={{ color: concern.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{concern.label}</h3>
                  <AnimatePresence>
                    {quizAnswer === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                        <p className="text-sm leading-relaxed mt-3 pb-1" style={{ color: concern.color }}>{concern.recommendation}</p>
                        <PhoneLink phone={data.phone} className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-white">
                          <Phone size={14} weight="fill" /> Book a Consult
                        </PhoneLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. BEFORE & AFTER ─── */}
      <section id="results" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>
            <SectionHeader badge="Real Results" title="Before & After" subtitle="See the visible transformations our treatments deliver." accent={ACCENT} />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["/images/medspa-before-after-1.png", "/images/medspa-before-after-2.png", "/images/medspa-before-after-3.png"].map((src, i) => {
              const titles = ["Skin Rejuvenation", "Facial Contouring", "Anti-Aging Treatment"];
              return (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06] group">
                  <div className="relative overflow-hidden">
                    <img src={src} alt={`${titles[i]} before and after`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-5 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <h3 className="text-sm font-bold text-white mb-1">{titles[i]}</h3>
                    <p className="text-xs text-slate-500">Real patient results</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 7. ABOUT ─── */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <FlowingCurves opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} team`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${ACCENT}e6`, borderColor: `${ACCENT}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Board Certified"}
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Our Practice</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Where Science Meets Beauty</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ icon: Certificate, label: "Board Certified" }, { icon: ShieldCheck, label: "FDA Approved" }, { icon: Star, label: "5-Star Rated" }, { icon: HandHeart, label: "Patient-Focused" }].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: ACCENT }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. PROCESS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.025} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Your Journey" title="How It Works" accent={ACCENT} /></AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < processSteps.length - 1 && <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px" style={{ background: `linear-gradient(to right, ${ACCENT}33, ${ACCENT}11)` }} />}
                <GlassCard className="p-6 text-center relative">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black" style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}0a)`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>{step.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. MEMBERSHIP TIERS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <FlowingCurves opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[15%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Memberships" title="VIP Treatment Plans" subtitle="Join our membership program and enjoy exclusive savings on all treatments." accent={ACCENT} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MEMBERSHIP_TIERS.map((tier) => (
              <div key={tier.name} className="relative">
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-xs font-bold" style={{ background: GOLD, color: "#000" }}>Most Popular</div>}
                <ShimmerBorder accent={tier.popular ? GOLD : ACCENT} className="h-full">
                  <div className="p-7 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={20} weight="fill" style={{ color: tier.popular ? GOLD : ACCENT }} />
                      <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    </div>
                    <p className="text-3xl font-extrabold text-white mb-6">{tier.price}</p>
                    <ul className="space-y-3 flex-1">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle size={16} weight="fill" style={{ color: tier.popular ? GOLD : ACCENT }} className="shrink-0 mt-0.5" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white text-center cursor-pointer" style={{ background: tier.popular ? GOLD : ACCENT } as React.CSSProperties}>
                      Join {tier.name}
                    </MagneticButton>
                  </div>
                </ShimmerBorder>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. PRODUCT BADGES ─── */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${ACCENT}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0e0a0c 0%, ${BG} 100%)` }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] mb-6" style={{ color: ACCENT }}>Trusted Products We Use</p>
          <div className="flex flex-wrap justify-center gap-4">
            {PRODUCT_BADGES.map((brand) => (
              <span key={brand} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border" style={{ color: "#e2e8f0", borderColor: `${ACCENT}22`, background: `${ACCENT}08` }}>
                <Sparkle size={14} weight="fill" style={{ color: GOLD }} /> {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. GALLERY ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Our Facility" title="A Luxury Experience" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((src, i) => {
              const captions = ["Treatment Suite", "Reception Area", "Consultation Room", "Laser Suite", "Relaxation Lounge", "Product Bar"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 aspect-square">
                  <img src={src} alt={captions[i] || `Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-sm font-bold text-white">{captions[i] || `Gallery ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 12. COMPARISON TABLE ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <FlowingCurves opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Why Choose Us" title={`${data.businessName} vs. The Competition`} accent={ACCENT} /></AnimatedSection>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    <th className="text-center p-4 font-bold text-white">{data.businessName}</th>
                    <th className="text-center p-4 text-slate-400 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="border-b border-white/5">
                      <td className="p-4 text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center"><CheckCircle size={20} weight="fill" className="mx-auto" style={{ color: "#22c55e" }} /></td>
                      <td className="p-4 text-center text-slate-500">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── 13. GOOGLE REVIEWS HEADER + TESTIMONIALS ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          {data.googleRating && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border" style={{ borderColor: `${ACCENT}22`, background: `${ACCENT}08` }}>
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: j < Math.round(data.googleRating || 5) ? GOLD : "#334155" }} />)}</div>
                <span className="text-white font-bold">{data.googleRating}</span>
                {data.reviewCount && <span className="text-slate-400 text-sm">({data.reviewCount}+ reviews)</span>}
              </div>
            </div>
          )}
          <AnimatedSection><SectionHeader badge="Client Love" title="What Our Clients Say" accent={ACCENT} /></AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="text-4xl mb-3" style={{ color: `${ACCENT}40` }}>&ldquo;</div>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.rating || 5 }).map((_, j) => <Star key={j} size={18} weight="fill" style={{ color: GOLD }} />)}</div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">{t.text}</p>
                <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-xs text-slate-500">Verified Patient</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 14. VIDEO PLACEHOLDER ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Virtual Tour" title="Step Inside Our Spa" accent={ACCENT} /></AnimatedSection>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video">
            <img src={galleryImages[0] || heroImage} alt="Virtual tour" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-md bg-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-0 h-0 border-l-[16px] border-t-[10px] border-b-[10px] border-l-white border-t-transparent border-b-transparent ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white font-semibold text-lg">Take a Virtual Tour</p>
              <p className="text-white/60 text-sm">See our luxury treatment rooms and state-of-the-art facility</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 15. CTA ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc, ${ACCENT})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Sparkle size={48} weight="fill" className="mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Book Your Consultation</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Discover your most radiant self. Schedule a complimentary consultation today.</p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 transition-colors">
            <Phone size={22} weight="fill" /> Call {data.phone}
          </PhoneLink>
        </div>
      </section>

      {/* ─── 16. SERVICE AREA ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="Location" title="Visit Our Spa" accent={ACCENT} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: ACCENT }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">&amp; Surrounding Areas</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                <span className="text-sm font-medium" style={{ color: "#22c55e" }}>Accepting New Patients</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── 17. HOURS ─── */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
          <FlowingCurves opacity={0.02} accent={ACCENT} />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection><SectionHeader badge="Hours" title="When We&apos;re Available" accent={ACCENT} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={ACCENT}>
                <div className="p-8">
                  <Clock size={32} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      {/* ─── 18. FAQ ─── */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection><SectionHeader badge="FAQ" title="Common Questions" accent={ACCENT} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 19. CONTACT ─── */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #100a0e 50%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>Contact Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Start Your Journey</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Ready to look and feel your best? Contact {data.businessName} today for a complimentary consultation.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><MapPin size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Phone size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div></div>
                <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Sparkle size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Consultations</p><p className="text-sm text-slate-400">Complimentary for all new patients</p></div></div>
                {data.hours && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ACCENT_GLOW }}><Clock size={20} weight="duotone" style={{ color: ACCENT }} /></div><div><p className="text-sm font-semibold text-white">Hours</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div></div>}
              </div>
            </div>
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Book a Consultation</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-400 mb-1.5">First Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Jane" /></div>
                  <div><label className="block text-sm text-slate-400 mb-1.5">Last Name</label><input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="Doe" /></div>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Phone</label><input type="tel" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm" placeholder="(555) 123-4567" /></div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Treatment Interest</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none text-sm">
                    <option value="" className="bg-neutral-900">Select a treatment</option>
                    {data.services.map((s) => <option key={s.name} value={s.name.toLowerCase().replace(/\s+/g, "-")} className="bg-neutral-900">{s.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm text-slate-400 mb-1.5">Tell Us About Your Goals</label><textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none text-sm resize-none" placeholder="What are you hoping to achieve?" /></div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: ACCENT } as React.CSSProperties}>Book Consultation <ArrowRight size={18} weight="bold" /></MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ─── 20. GUARANTEE ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0e0a0c 100%)` }} />
        <SpaWavePattern opacity={0.015} accent={ACCENT} />
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[180px]" style={{ background: `${ACCENT}06` }} /></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder accent={ACCENT}>
            <div className="p-8 md:p-12">
              <ShieldCheck size={48} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">Our Beauty Promise</h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto text-lg">
                {data.businessName} is committed to your satisfaction. Every treatment is performed by board-certified professionals using FDA-approved products. Your safety and results are our top priority.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {["Board Certified", "FDA Approved", "Free Consultations", "Results Guaranteed"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border" style={{ color: ACCENT, borderColor: `${ACCENT}33`, background: `${ACCENT}0d` }}>
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </section>

      {/* ─── PRODUCT SHOWCASE ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d0d0d 100%)` }} />
        <SpaWavePattern opacity={0.012} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Crown size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Premium Products We Trust</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">We only use medical-grade, FDA-approved products from industry-leading brands to ensure your safety and results.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Allergan", "Galderma", "SkinMedica", "Obagi", "ZO Skin Health", "Revance", "SkinCeuticals", "Merz"].map((brand) => (
              <div key={brand} className="rounded-2xl border border-white/10 p-5 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Certificate size={28} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-2" />
                <span className="text-white font-semibold text-sm">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SKINCARE TIPS ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0d0d0d 0%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <Flower size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Expert Skincare Tips</h2>
            <div className="w-16 h-1 mx-auto mt-3 rounded-full" style={{ background: ACCENT }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Daily SPF Protection", desc: "Wear broad-spectrum SPF 30+ every day, rain or shine. UV damage is the #1 cause of premature aging and pigmentation." },
              { title: "Retinol at Night", desc: "Incorporate a medical-grade retinol into your evening routine to stimulate collagen production and accelerate cell turnover." },
              { title: "Hydrate from Within", desc: "Drink at least 8 glasses of water daily and use a hyaluronic acid serum to lock in moisture for plump, glowing skin." },
            ].map((tip) => (
              <div key={tip.title} className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Sparkle size={24} weight="fill" style={{ color: ACCENT }} className="mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEMBERSHIP BENEFITS ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d0d0d 100%)` }} />
        <SpaWavePattern opacity={0.015} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <HandHeart size={40} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Membership Benefits</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Join our VIP membership for exclusive savings and priority booking on all treatments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tier: "Gold", price: "$99/mo", perks: ["10% off all treatments", "Monthly facial included", "Priority booking", "Birthday treatment free"] },
              { tier: "Platinum", price: "$199/mo", perks: ["20% off all treatments", "Monthly facial + peel", "Same-day appointments", "Complimentary consultations", "Product discounts"] },
              { tier: "Diamond", price: "$349/mo", perks: ["30% off all treatments", "Monthly premium treatment", "VIP lounge access", "Exclusive events", "Annual skin analysis", "Friend referral bonuses"] },
            ].map((plan) => (
              <div key={plan.tier} className="rounded-2xl border border-white/10 p-6 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <h3 className="text-xl font-bold text-white mb-1">{plan.tier}</h3>
                <p className="text-2xl font-extrabold mb-4" style={{ color: ACCENT }}>{plan.price}</p>
                <ul className="space-y-2 text-left">
                  {plan.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle size={16} weight="fill" style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MID-PAGE CTA ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15 0%, ${BG} 50%, ${ACCENT}08 100%)` }} />
        <SpaWavePattern opacity={0.02} accent={ACCENT} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Sparkle size={44} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Your Glow-Up Starts Here</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            Book a complimentary consultation with our expert team at {data.businessName}. We&apos;ll create a personalized treatment plan tailored to your unique skin goals.
          </p>
          <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-105" style={{ background: ACCENT }}>
            <Phone size={20} weight="fill" /> Book Your Consultation
          </a>
        </div>
      </section>

      {/* ─── ENHANCED CERTIFICATIONS ─── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #0d0d0d 100%)` }} />
        <SpaWavePattern opacity={0.01} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <Certificate size={36} weight="duotone" style={{ color: ACCENT }} className="mx-auto mb-3" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our Credentials</h2>
            <p className="text-slate-400 mt-2 max-w-lg mx-auto">
              Your safety and satisfaction are our top priorities. {data.businessName} maintains the highest medical standards in the industry.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Board Certified Providers",
              "FDA-Approved Treatments",
              "HIPAA Compliant",
              "Medical Director Oversight",
              "Sterile Technique Certified",
              "Continuing Education Required",
            ].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <Certificate size={18} weight="fill" style={{ color: ACCENT }} />
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #0d0d0d 0%, ${BG} 100%)` }} />
        <SpaWavePattern opacity={0.012} accent={ACCENT} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why Choose <span style={{ color: ACCENT }}>{data.businessName}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Medical Expertise",
                desc: "Treatments administered by board-certified providers with extensive aesthetic training",
              },
              {
                title: "Premium Products Only",
                desc: "We exclusively use FDA-approved, medical-grade products from leading manufacturers",
              },
              {
                title: "Personalized Plans",
                desc: "Every treatment plan is customized to your unique skin type, goals, and lifestyle",
              },
              {
                title: "Natural-Looking Results",
                desc: "We enhance your natural beauty — our goal is results that look refreshed, never overdone",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 p-6 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <CheckCircle size={28} weight="fill" style={{ color: ACCENT }} className="mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 21. FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${BG} 0%, #060606 100%)` }} />
        <SpaWavePattern opacity={0.015} accent={ACCENT} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={22} weight="fill" style={{ color: ACCENT }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Treatments", "Results", "About", "Contact"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <p><PhoneLink phone={data.phone} /></p>
                <p><MapLink address={data.address} /></p>
                {data.socialLinks && Object.entries(data.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors capitalize">{platform}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkle size={14} weight="fill" style={{ color: ACCENT }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <BluejayLogo className="w-4 h-4" />
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={ACCENT} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
