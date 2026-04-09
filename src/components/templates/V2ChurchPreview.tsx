"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Cross,
  BookOpen,
  Heart,
  UsersThree,
  HandsPraying,
  Church,
  MusicNotes,
  Baby,
  Handshake,
  List,
  X,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  CaretDown,
  Envelope,
  CalendarBlank,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import type { GeneratedSiteData } from "@/lib/generator";
import BluejayLogo from "../BluejayLogo";
import { MapLink, PhoneLink } from "@/components/templates/MapLink";
import ClaimBanner from "@/components/ClaimBanner";

/* ───────────────────────── SPRING CONFIGS ───────────────────────── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ───────────────────────── COLORS ───────────────────────── */
const NAVY = "#1a1a2e";
const DEFAULT_GOLD = "#d4a853";
const GOLD_LIGHT = "#e2c07a";

function getAccent(accentColor?: string) {
  const c = accentColor || DEFAULT_GOLD;
  return {
    GOLD: c,
    GOLD_GLOW: `${c}26`,
    GOLD_LIGHT,
  };
}

/* ───────────────────────── SERVICE ICON MAP ───────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SERVICE_ICON_MAP: Record<string, any> = {
  worship: Church,
  sunday: Church,
  prayer: HandsPraying,
  bible: BookOpen,
  study: BookOpen,
  youth: UsersThree,
  children: Baby,
  music: MusicNotes,
  outreach: Handshake,
  small: BookOpen,
  mission: Heart,
  community: UsersThree,
};

function getServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Cross;
}

/* ───────────────────────── STOCK FALLBACK IMAGES ───────────────────────── */
const STOCK_HERO = "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=1400&q=80";
const STOCK_ABOUT = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80";
const STOCK_GALLERY = [
  "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&q=80",
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80",
  "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&q=80",
  "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&q=80",
];

/* ───────────────────────── FLOATING LIGHT PARTICLES ───────────────────────── */
function FloatingParticles({ accent }: { accent: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 7,
    size: 2 + Math.random() * 4,
    opacity: 0.12 + Math.random() * 0.28,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden md:block">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: GOLD_LIGHT,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            y: { duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" },
            opacity: {
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              times: [0, 0.1, 0.9, 1],
            },
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── CROSS PATTERN SVG ───────────────────────── */
function CrossPattern({ opacity = 0.03, accent }: { opacity?: number; accent: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0h4v28h28v4H32v28h-4V32H0v-4h28V0z' fill='${encodeURIComponent(accent)}' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ───────────────────────── WAVE BACKGROUND ───────────────────────── */
function WaveBackground({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
        <motion.path
          fill={accent}
          fillOpacity="0.3"
          animate={{
            d: [
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
              "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ───────────────────────── GLASS CARD ───────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}

/* ───────────────────────── MAGNETIC BUTTON ───────────────────────── */
function MagneticButton({ children, className = "", onClick, style, href }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  href?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.25);
      y.set((e.clientY - cy) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  if (href) {
    return (
      <motion.a
        href={href}
        ref={ref as unknown as React.Ref<HTMLAnchorElement>}
        style={{ x: springX, y: springY, willChange: "transform", ...style }}
        onMouseMove={handleMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={handleMouseLeave}
        className={className}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY, willChange: "transform", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── SHIMMER BORDER ───────────────────────── */
function ShimmerBorder({ children, className = "", accent }: { children: React.ReactNode; className?: string; accent: string }) {
  return (
    <div className={`relative rounded-2xl p-[1px] overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, ${GOLD_LIGHT}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl z-10" style={{ background: NAVY }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── ACCORDION ITEM ───────────────────────── */
function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string; answer: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer">
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring}>
          <CaretDown size={20} className="text-slate-400 shrink-0" />
        </motion.div>
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

/* ───────────────────────── SECTION HEADER ───────────────────────── */
function SectionHeader({ badge, title, subtitle, accent }: {
  badge: string; title: string; subtitle?: string; accent: string;
}) {
  return (
    <div className="text-center mb-16">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: accent, borderColor: `${accent}33`, background: `${accent}0d` }}>
        {badge}
      </span>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{title}</h2>
      <div className="h-0.5 w-16 mx-auto mt-4" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      {subtitle && <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed mx-auto">{subtitle}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN PREVIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
/* ───────────────────────── ANIMATED SECTION ───────────────────────── */
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function V2ChurchPreview({ data }: { data: GeneratedSiteData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { GOLD, GOLD_GLOW } = getAccent(data.accentColor);

  const heroImage = data.photos?.[0] || STOCK_HERO;
  const aboutImage = data.photos?.[1] || STOCK_ABOUT;
  const galleryImages = data.photos?.length > 2 ? data.photos.slice(2, 6) : STOCK_GALLERY;

  const phoneDigits = data.phone.replace(/\D/g, "");

  const ministries = [
    { title: "Children's Ministry", desc: "A safe, fun environment where kids discover God's love through age-appropriate teaching and activities.", icon: Baby },
    { title: "Youth Group", desc: "Dynamic gatherings for teens to explore their faith, build lasting friendships, and grow as future leaders.", icon: UsersThree },
    { title: "Worship Team", desc: "Musicians and vocalists leading our congregation into God's presence through modern and traditional worship.", icon: MusicNotes },
    { title: "Small Groups", desc: "Intimate gatherings in homes for Bible study, prayer, and authentic community.", icon: BookOpen },
    { title: "Outreach", desc: "Serving our neighbors and the nations through local missions, food drives, and global partnerships.", icon: Handshake },
    { title: "Prayer Ministry", desc: "Dedicated teams interceding for our church, community, and world.", icon: HandsPraying },
  ];

  const faqs = [
    { q: `What can I expect at ${data.businessName}?`, a: `You can expect a warm welcome, uplifting worship music, a relevant message from Scripture, and a community that genuinely cares. We offer services for all ages and have ${data.services.length > 0 ? data.services.map(s => s.name).slice(0, 3).join(", ") : "worship, Bible study, and fellowship"}.` },
    { q: "What should I wear?", a: "Come as you are! Some people dress up and some come casual. We want you to feel comfortable." },
    { q: "Is there something for my kids?", a: `Absolutely! ${data.businessName} offers engaging, age-appropriate programs for children of all ages during our services.` },
    { q: "How can I get connected?", a: `The best way to connect is to visit us on a Sunday, fill out a connect card, or call us at ${data.phone}. We would love to help you find your place here.` },
  ];

  /* Fallback testimonials */
  const fallbackTestimonials = [
    { name: "Grace H.", text: "This community welcomed our family with open arms. The sermons are inspiring and the people are genuine.", rating: 5 },
    { name: "Daniel F.", text: "Found my spiritual home here. The youth programs are incredible and my kids love it.", rating: 5 },
    { name: "Maria S.", text: "The worship experience is uplifting every single week. Truly a blessing in our lives.", rating: 5 }
  ];
  const testimonials = data.testimonials?.length > 0 ? data.testimonials : fallbackTestimonials;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: NAVY, color: "#f1f5f9" }}>
      <FloatingParticles accent={GOLD} />

      {/* ══════════════════ 1. NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Cross size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight text-white">{data.businessName}</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#ministries" className="hover:text-white transition-colors">Ministries</a>
              <a href="#contact" className="hover:text-white transition-colors">Visit Us</a>
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Plan Your Visit
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
                  {[{ label: "Services", href: "#services" }, { label: "About", href: "#about" }, { label: "Ministries", href: "#ministries" }, { label: "Visit Us", href: "#contact" }].map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">{link.label}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════════════════ 2. HERO ══════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">

        <div className="absolute inset-0">
          <img src={heroImage} alt={`${data.businessName}`} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-widest mb-4" style={{ color: GOLD }}>Welcome to {data.businessName}</p>
              <h1 className="text-3xl md:text-6xl tracking-tighter leading-none font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                {data.tagline}
              </h1>
            </div>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              {data.about.length > 160 ? data.about.slice(0, 160).trim() + "..." : data.about}
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                Plan Your Visit <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton href={`tel:${phoneDigits}`} className="px-8 py-4 rounded-full text-base font-semibold text-white border border-white/10 flex items-center gap-2 cursor-pointer">
                <Phone size={18} weight="duotone" /> <PhoneLink phone={data.phone} />
              </MagneticButton>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2"><MapPin size={16} weight="duotone" style={{ color: GOLD }} /> <MapLink address={data.address} /></span>
              <span className="flex items-center gap-2"><Clock size={16} weight="duotone" style={{ color: GOLD }} /> {data.hours || "Sundays 9AM & 11AM"}</span>
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={heroImage} alt={`${data.businessName} worship`} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="px-4 py-2 rounded-full backdrop-blur-md bg-black/50 border flex items-center gap-2" style={{ borderColor: `${GOLD}4d` }}>
                  <Heart size={18} weight="fill" style={{ color: GOLD }} />
                  <span className="text-sm font-semibold text-white">Everyone Welcome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. STATS ══════════════════ */}
      <section className="relative z-10 py-16 overflow-hidden border-y" style={{ borderColor: `${GOLD}1a` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #161628 0%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px]" style={{ background: `${GOLD}08` }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {data.stats.map((stat, i) => {
              const statIcons = [Heart, UsersThree, BookOpen, Star];
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon size={22} weight="fill" style={{ color: GOLD }} />
                    <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium tracking-wide uppercase">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 4. ABOUT ══════════════════ */}
      <section id="about" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <WaveBackground accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src={aboutImage} alt={`${data.businessName} community`} className="w-full h-[400px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div className="px-5 py-3 rounded-xl backdrop-blur-md border text-white font-bold text-sm shadow-lg" style={{ background: `${GOLD}e6`, borderColor: `${GOLD}80` }}>
                  {data.stats[0] ? `${data.stats[0].value} ${data.stats[0].label}` : "Welcome Home"}
                </div>
              </div>
            </div>

            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Welcome Home</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">Our Story, Your Story</h2>
              <p className="text-slate-400 leading-relaxed mb-8">{data.about}</p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, label: "Welcoming Community" },
                  { icon: BookOpen, label: "Bible-Centered" },
                  { icon: UsersThree, label: "All Ages Welcome" },
                  { icon: HandsPraying, label: "Spirit-Led Worship" },
                ].map((badge) => (
                  <GlassCard key={badge.label} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <badge.icon size={20} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.label}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 5. SERVICES / SERVICE TIMES ══════════════════ */}
      <section id="services" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #161628 50%, ${NAVY} 100%)` }} />
        <CrossPattern accent={GOLD} />
        <WaveBackground accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${GOLD}08` }} />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `${GOLD}05` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Join Us" title="Services & Programs" subtitle={`${data.businessName} offers worship, fellowship, and programs for every age and season of life.`} accent={GOLD} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service, i) => {
              const Icon = getServiceIcon(service.name);
              return (
                <div key={service.name} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${GOLD}4d, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border" style={{ background: GOLD_GLOW, borderColor: `${GOLD}33` }}>
                        <Icon size={24} weight="duotone" style={{ color: GOLD }} />
                      </div>
                      <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{service.description || ""}</p>
                    {service.price && <p className="text-sm font-semibold mt-3" style={{ color: GOLD }}>{service.price}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 6. BELIEFS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #161628 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.025} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="What We Believe" title="Our Core Beliefs" accent={GOLD} /></AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "The Gospel", desc: "We believe in the transformative power of Jesus Christ and His saving grace for all people.", icon: Cross },
              { title: "God's Word", desc: "The Bible is our foundation — the inspired, authoritative guide for faith and daily living.", icon: BookOpen },
              { title: "Love in Action", desc: "We are called to love God and love others through compassion, service, and generosity.", icon: Heart },
              { title: "Community", desc: "We grow together as a family of believers, supporting one another through every season of life.", icon: UsersThree },
              { title: "Prayer", desc: "Prayer is the heartbeat of our church. We believe in the power of coming before God together.", icon: HandsPraying },
              { title: "The Holy Spirit", desc: "We are led and empowered by the Holy Spirit, who guides, comforts, and transforms us daily.", icon: Church },
            ].map((belief) => (
              <GlassCard key={belief.title} className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                  <belief.icon size={24} weight="duotone" style={{ color: GOLD }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{belief.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{belief.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 7. MINISTRIES ══════════════════ */}
      <section id="ministries" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <WaveBackground accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader badge="Get Involved" title="Our Ministries" subtitle={`There are many ways to connect and grow at ${data.businessName}.`} accent={GOLD} />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministries.map((m, i) => (
              <div key={m.title} className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-opacity-30 transition-all duration-500 overflow-hidden bg-white/[0.02]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ background: GOLD_GLOW, borderColor: `${GOLD}33` }}>
                      <m.icon size={24} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 8. GALLERY ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #161628 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full blur-[200px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Our Community" title="Life at Our Church" accent={GOLD} /></AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleryImages.map((src, i) => {
              const titles = ["Worship Service", "Bible Study", "Community Fellowship", "Church Family"];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-opacity-30 transition-all duration-500">
                  <img src={src} alt={titles[i] || `Gallery ${i + 1}`} className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold text-white mb-1">{titles[i] || `Photo ${i + 1}`}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. TESTIMONIALS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Stories" title="What Our Members Say" accent={GOLD} /></AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <GlassCard key={i} className="p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={16} weight="fill" style={{ color: GOLD }} />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. CTA ══════════════════ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD}cc, ${GOLD})` }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='none'/%3E%3Cpath d='M0 0L40 40M40 0L0 40' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Cross size={48} weight="fill" className="mx-auto mb-6 text-black/70" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">You Belong Here</h2>
          <p className="text-lg text-black/70 mb-8 max-w-xl mx-auto">
            No matter where you are in your faith journey, there is a place for you at {data.businessName}. Come as you are and discover a community that welcomes you with open arms.
          </p>
          <PhoneLink phone={data.phone} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-black/80 transition-colors">
            <Church size={22} weight="fill" /> Plan Your Visit
          </PhoneLink>
        </div>
      </section>

      {/* ══════════════════ 11. SERVICE AREAS ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="Find Us" title="Our Location" accent={GOLD} /></AnimatedSection>
          <div className="text-center">
            <GlassCard className="p-8 inline-block">
              <div className="flex items-center gap-3 text-lg">
                <MapPin size={24} weight="duotone" style={{ color: GOLD }} />
                <MapLink address={data.address} className="text-white font-semibold" />
              </div>
              <p className="text-slate-400 text-sm mt-2">Welcoming neighbors from across the community</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 12. HOURS ══════════════════ */}
      {data.hours && (
        <section className="relative z-10 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #161628 50%, ${NAVY} 100%)` }} />
          <WaveBackground accent={GOLD} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${GOLD}06` }} />
          </div>

          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <AnimatedSection>          <SectionHeader badge="Service Times" title="When We Gather" accent={GOLD} /></AnimatedSection>
            <div className="text-center">
              <ShimmerBorder accent={GOLD}>
                <div className="p-8">
                  <CalendarBlank size={32} weight="duotone" style={{ color: GOLD }} className="mx-auto mb-4" />
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">{data.hours}</p>
                  <p className="text-sm mt-4 font-semibold" style={{ color: GOLD }}>Everyone is welcome — come as you are</p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </section>
      )}

      
      {/* ══════════════════ MID-PAGE CTA ══════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)` }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>
            Don&apos;t Miss Out
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-6 text-sm sm:text-base">
            Limited time — claim your free professional website today before it&apos;s offered to a competitor.
          </p>
          <a
            href={`/claim/${data.id}`}
            className="inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-full text-white font-bold text-base hover:shadow-lg transition-all duration-300"
            style={{ background: ACCENT }}
          >
            Claim This Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════ 13. FAQ ══════════════════ */}
      <section className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full blur-[160px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <AnimatedSection>          <SectionHeader badge="FAQ" title="Common Questions" accent={GOLD} /></AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.q} answer={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 14. CONTACT ══════════════════ */}
      <section id="contact" className="relative z-10 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #12122a 50%, ${NAVY} 100%)` }} />
        <CrossPattern opacity={0.02} accent={GOLD} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]" style={{ background: `${GOLD}06` }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border" style={{ color: GOLD, borderColor: `${GOLD}33`, background: `${GOLD}0d` }}>Visit Us</span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">We Would Love to Meet You</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Whether you are visiting for the first time or looking for a church home, we welcome you. Contact {data.businessName} today.</p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                    <MapPin size={20} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <div><p className="text-sm font-semibold text-white">Address</p><MapLink address={data.address} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                    <Phone size={20} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <div><p className="text-sm font-semibold text-white">Phone</p><PhoneLink phone={data.phone} className="text-sm text-slate-400" /></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                    <Envelope size={20} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <div><p className="text-sm font-semibold text-white">Connect</p><p className="text-sm text-slate-400">Reach out — we would love to hear from you</p></div>
                </div>
                {data.hours && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <Clock size={20} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <div><p className="text-sm font-semibold text-white">Service Times</p><p className="text-sm text-slate-400 whitespace-pre-line">{data.hours}</p></div>
                  </div>
                )}
              </div>
            </div>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Connect With Us</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none transition-colors text-sm resize-none" placeholder="How can we help you?" />
                </div>
                <MagneticButton className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Send Message <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════ 15. FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #111128 100%)` }} />
        <CrossPattern opacity={0.015} accent={GOLD} />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cross size={22} weight="duotone" style={{ color: GOLD }} />
                <span className="text-lg font-bold text-white">{data.businessName}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {data.about.length > 120 ? data.about.slice(0, 120).trim() + "..." : data.about}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "About", "Ministries", "Visit Us"].map((link) => (
                  <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
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
              <Cross size={14} weight="duotone" style={{ color: GOLD }} />
              <span>{data.businessName} &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline"}}>bluejayportfolio.com</a></span>
            </div>
          </div>
        </div>
      </footer>

      <ClaimBanner businessName={data.businessName} accentColor={GOLD} prospectId={data.id} />
      <div className="h-14 md:h-28" />
    </main>
  );
}
