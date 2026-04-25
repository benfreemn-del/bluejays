"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */

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
  Baby,
  CheckCircle,
  Image,
  Sliders,
  Palette,
  Timer,
  Printer,
  Lightbulb,
  Handshake,
  SealCheck,
  Envelope,
  CoatHanger,
  Sun,
  CameraRotate,
  Gift,
  Play,
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
const CHARCOAL = "#1a1a1a";
const GOLD = "#ca8a04";
const GOLD_LIGHT = "#eab308";
const COOL_SLATE = "#64748b";
const GOLD_GLOW = "rgba(202, 138, 4, 0.12)";
const TEXT_MUTED = "#6b7280";

/* ───────────────────────── SHUTTER SVG HERO ───────────────────────── */
function ShutterRevealHero() {
  const bladeCount = 6;
  const cx = 300;
  const cy = 300;
  const R = 320;

  const blades = Array.from({ length: bladeCount }, (_, i) => {
    const angle = (i * 360) / bladeCount;
    const rad = (angle * Math.PI) / 180;
    const nextRad = ((angle + 360 / bladeCount) * Math.PI) / 180;
    const outerR = R;
    const midR = R * 0.45;
    const points = [
      `${cx + midR * Math.cos(rad)},${cy + midR * Math.sin(rad)}`,
      `${cx + outerR * Math.cos(rad + 0.18)},${cy + outerR * Math.sin(rad + 0.18)}`,
      `${cx + outerR * Math.cos(nextRad - 0.18)},${cy + outerR * Math.sin(nextRad - 0.18)}`,
      `${cx + midR * Math.cos(nextRad)},${cy + midR * Math.sin(nextRad)}`,
    ].join(" ");
    return { points, angle };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <svg viewBox="0 0 600 600" className="w-[600px] h-[600px] md:w-[900px] md:h-[900px]" fill="none">
        {blades.map((blade, i) => (
          <motion.polygon
            key={i}
            points={blade.points}
            fill={CHARCOAL}
            stroke={GOLD}
            strokeWidth="0.5"
            initial={{ rotate: 0, opacity: 1 }}
            animate={{ rotate: blade.angle + 60, opacity: 0 }}
            transition={{
              duration: 1.8,
              delay: 0.3 + i * 0.08,
              ease: [0.33, 1, 0.68, 1],
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        {/* Outer ring stays */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={R - 5}
          stroke={GOLD}
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        />
        {/* Inner ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={R * 0.45}
          stroke={GOLD}
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 1, opacity: 0.8 }}
          animate={{ pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        />
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
  return <div className={`rounded-2xl border border-gray-200 bg-black/[0.03] backdrop-blur-xl shadow-sm ${className}`}>{children}</div>;
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
      <div className="relative rounded-2xl bg-[#faf9f7] z-10">{children}</div>
    </div>
  );
}

/* ───────────────────────── DATA ───────────────────────── */
const services = [
  { title: "Wedding Photography", description: "Full-day coverage from getting ready to the sparkler exit. Candid emotions, stunning details, and timeless portraits that tell your complete love story.", icon: Heart, price: "From $3,500" },
  { title: "Portrait Sessions", description: "Individual, couples, or family portraits in the studio or at a scenic PNW location. Authentic expressions in natural light that capture who you really are.", icon: Users, price: "From $350" },
  { title: "Professional Headshots", description: "Corporate headshots and personal branding photography. Clean, polished images for LinkedIn, company websites, and marketing materials.", icon: Buildings, price: "From $250" },
  { title: "Event Coverage", description: "Corporate events, galas, product launches, and celebrations. Discreet, professional coverage that captures the energy and highlights of your event.", icon: CalendarCheck, price: "From $800" },
  { title: "Product Photography", description: "E-commerce product shots, flat lays, and lifestyle compositions. Clean, compelling images optimized for web that help your products sell.", icon: Package, price: "From $500" },
  { title: "Maternity Sessions", description: "Celebrate the beauty of motherhood with elegant maternity portraits. Studio or outdoor sessions with wardrobe styling guidance included.", icon: Baby, price: "From $400" },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", alt: "Romantic wedding couple at sunset", category: "Weddings" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", alt: "Wedding ceremony exchange of vows", category: "Weddings" },
  { src: "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=600&q=80", alt: "Professional portrait", category: "Portraits" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80", alt: "Natural light studio portrait", category: "Portraits" },
  { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80", alt: "Live corporate event", category: "Events" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80", alt: "Wedding ceremony aisle florals", category: "Events" },
  { src: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=600&q=80", alt: "Minimalist product on white", category: "Products" },
  { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", alt: "Brand collaboration session", category: "Products" },
  { src: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=600&q=80", alt: "Coastal landscape cityscape", category: "Landscapes" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", alt: "Mountain landscape at golden hour", category: "Landscapes" },
  { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", alt: "Corporate professional headshot", category: "Headshots" },
  { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80", alt: "Casual lifestyle portrait", category: "Headshots" },
];

const galleryCategories = ["All", "Weddings", "Portraits", "Events", "Products", "Landscapes", "Headshots"];

const testimonials = [
  { name: "Sarah & James K.", sessionType: "Wedding", photosDelivered: 847, turnaround: "6 weeks", rating: 5, text: "Mike captured our Snoqualmie Falls ceremony with such artistry. Every candid moment, every detail. We cried looking through the gallery for the first time." },
  { name: "David Nguyen", sessionType: "Headshots", photosDelivered: 45, turnaround: "5 days", rating: 5, text: "Needed updated headshots for my LinkedIn and company bio. Mike made the session feel effortless and the results are incredibly polished. Multiple colleagues asked who my photographer was." },
  { name: "The Ramirez Family", sessionType: "Family Portrait", photosDelivered: 120, turnaround: "2 weeks", rating: 5, text: "Our annual family session at Discovery Park was magical. Mike has a gift for getting genuine smiles from our three kids. These photos are treasures we will cherish forever." },
  { name: "Priya Sharma, CEO", sessionType: "Corporate Event", photosDelivered: 340, turnaround: "10 days", rating: 5, text: "Hired Cascade Lens for our annual tech summit. Mike and his second photographer covered every keynote, breakout, and candid networking moment. The board was thrilled with the results." },
];

const processSteps = [
  { step: "01", title: "Consult", description: "We start with a relaxed conversation about your vision, preferred style, and the story you want to tell.", icon: Handshake },
  { step: "02", title: "Plan", description: "I scout locations, plan the timeline, and prepare a mood board so we are aligned before the shutter clicks.", icon: Lightbulb },
  { step: "03", title: "Shoot", description: "The session itself is relaxed and fun. I guide you through natural poses while capturing authentic moments.", icon: Camera },
  { step: "04", title: "Edit", description: "Each image is individually color-graded and retouched to match my signature warm, editorial style.", icon: Sliders },
  { step: "05", title: "Deliver", description: "Your final gallery arrives in a beautiful online viewer with full download and print release included.", icon: Gift },
];

const pricingTiers = [
  { name: "Essential", price: "$350", sub: "Perfect for headshots & minis", features: ["1-hour session", "1 location", "25 edited images", "Online gallery", "Print release", "48-hour sneak peek"], highlight: false },
  { name: "Signature", price: "$850", sub: "Most popular for families & couples", features: ["2-hour session", "2 locations", "60 edited images", "Online gallery", "Print release", "10 fine art prints", "Wardrobe guidance", "48-hour sneak peek"], highlight: true },
  { name: "Luxury", price: "$1,800", sub: "Full experience for weddings & events", features: ["Full-day coverage", "Unlimited locations", "150+ edited images", "Online gallery", "Print release", "Custom album", "Second photographer", "Engagement session included"], highlight: false },
];

const faqs = [
  { q: "How far in advance should I book?", a: "For weddings, I recommend booking 8-12 months in advance as prime Seattle dates fill quickly, especially June through September. For portrait sessions and headshots, 2-3 weeks notice is usually sufficient." },
  { q: "When will I receive my photos?", a: "Headshots and mini sessions are delivered within 1 week. Portrait sessions within 2 weeks. Weddings within 6-8 weeks. Every booking includes a sneak peek of 15-20 images within 48 hours." },
  { q: "Do you travel for destination weddings?", a: "Absolutely. I have photographed weddings throughout the Pacific Northwest, from the San Juan Islands to the Oregon Coast. Travel fees apply for locations more than 50 miles from Seattle." },
  { q: "What is included in the print release?", a: "All packages include a personal-use print release, meaning you can print your images anywhere for personal use. Commercial licensing for business use is available as an add-on." },
  { q: "What should I wear to my session?", a: "I send a detailed style guide after booking. In general, I recommend solid colors or subtle patterns in a cohesive palette. Avoid large logos and neon colors. Earth tones and jewel tones photograph beautifully in the Pacific Northwest." },
  { q: "Do you offer videography?", a: "I partner with two talented Seattle videographers and can offer combined photo and video packages at a bundled rate. Ask about our duo coverage options for weddings." },
  { q: "What happens if it rains on our session day?", a: "Welcome to Seattle! I have a list of gorgeous covered locations and we can always reschedule. Light overcast skies actually create the most flattering, even light for portraits." },
];

const sessionTypes = [
  { id: "wedding", label: "Wedding", base: 3500 },
  { id: "portrait", label: "Portrait", base: 350 },
  { id: "headshots", label: "Headshots", base: 250 },
  { id: "event", label: "Event", base: 800 },
  { id: "product", label: "Product", base: 500 },
];
const durationOptions = [
  { label: "1 hour", multiplier: 1 },
  { label: "2 hours", multiplier: 1.6 },
  { label: "Half day (4 hrs)", multiplier: 2.5 },
  { label: "Full day (8 hrs)", multiplier: 4 },
];
const addOns = [
  { id: "prints", label: "Fine Art Prints (10 pack)", price: 200 },
  { id: "album", label: "Custom Photo Album", price: 350 },
  { id: "rush", label: "Rush Delivery (3 days)", price: 150 },
  { id: "second", label: "Second Photographer", price: 500 },
];

const styleQuizPairs = [
  { a: { label: "Dark & Moody", img: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80" }, b: { label: "Light & Airy", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" } },
  { a: { label: "Posed & Polished", img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&q=80" }, b: { label: "Candid & Natural", img: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=400&q=80" } },
  { a: { label: "Bold Colors", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80" }, b: { label: "Soft Pastels", img: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&q=80" } },
  { a: { label: "Urban & Edgy", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80" }, b: { label: "Nature & Organic", img: "https://images.unsplash.com/photo-1491147334573-44cbb4602074?w=400&q=80" } },
];

const styleResults: Record<string, { name: string; description: string }> = {
  "0000": { name: "Classic Elegance", description: "You love timeless, moody imagery with careful posing and rich tones set in urban environments. Think editorial magazine spreads." },
  "0001": { name: "Romantic Storyteller", description: "You are drawn to dramatic, posed compositions with saturated colors but in natural settings. Think fairy tale meets fine art." },
  "0010": { name: "Vintage Film", description: "You appreciate dark moody tones, posed compositions, with soft muted palettes. Think nostalgic and dreamy." },
  "0011": { name: "Woodland Romance", description: "You love moody, posed imagery with soft tones in organic settings. Think enchanted forest editorial." },
  "0100": { name: "Bold Documentary", description: "Dark, candid moments with vivid colors in urban settings speak to you. Think raw photojournalism with punch." },
  "0101": { name: "Nature Documentary", description: "You love authentic candid moments in natural settings with bold colors. Think National Geographic meets lifestyle." },
  "0110": { name: "Dreamy Candid", description: "Moody candid moments with soft pastels in city settings. Think indie film stills." },
  "0111": { name: "Free Spirit", description: "You are drawn to candid, natural, soft-toned imagery in nature. Think bohemian golden hour magic." },
  "1000": { name: "Modern Editorial", description: "Bright, posed imagery with bold colors in urban settings. Think high-fashion lookbook." },
  "1001": { name: "Garden Party", description: "Light and airy posed portraits with bold colors in nature. Think spring wedding in a botanical garden." },
  "1010": { name: "Soft Portrait", description: "Bright, posed, pastel-toned imagery in urban settings. Think minimalist beauty campaign." },
  "1011": { name: "Ethereal", description: "Light, posed, soft-toned portraits in nature. Think angelic and heavenly." },
  "1100": { name: "Lifestyle Pop", description: "Bright, candid imagery with vivid colors in the city. Think social media influencer content." },
  "1101": { name: "Golden Hour", description: "Light, candid, vivid imagery in nature. Think perfect sunset family sessions." },
  "1110": { name: "Pastel Dreams", description: "Bright, candid, soft pastel tones in the city. Think whimsical and modern." },
  "1111": { name: "Pacific Northwest Natural", description: "Light, candid, soft-toned imagery in natural settings. This is our signature style, perfect for the PNW landscape." },
};

const sessionPrepTips = [
  { icon: CoatHanger, title: "What to Wear", tips: ["Coordinate, do not match exactly", "Solid colors and earth tones photograph best", "Avoid large logos and neon", "Layers add visual interest", "Bring a second outfit for variety"] },
  { icon: Clock, title: "Timing Tips", tips: ["Golden hour (1 hr before sunset) is magic", "Overcast days = soft, even light", "Allow 15 min buffer for parking/walking", "Arrive makeup-ready for fastest start"] },
  { icon: Sun, title: "Day-Of Prep", tips: ["Get a good night of rest", "Eat a meal before your session", "Bring water and touch-up supplies", "Leave valuables in your car", "Relax and trust the process"] },
];

const serviceAreas = [
  "Seattle", "Bellevue", "Kirkland", "Redmond", "Tacoma", "Olympia",
  "Snoqualmie", "Woodinville", "Issaquah", "Mercer Island", "Bainbridge Island",
  "San Juan Islands",
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE — Cascade Lens Photography — Beast Mode Showcase
   Owner: Mike Chen | Seattle, WA | (206) 482-9137
   ═══════════════════════════════════════════════════════════════ */
export default function V2PhotographyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [galleryFilter, setGalleryFilter] = useState("All");

  /* Session Builder state */
  const [selectedSession, setSelectedSession] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  /* Style Quiz state */
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  const sessionPrice = Math.round(
    sessionTypes[selectedSession].base * durationOptions[selectedDuration].multiplier +
    addOns.filter((a) => selectedAddOns.includes(a.id)).reduce((s, a) => s + a.price, 0)
  );

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const handleQuizAnswer = (choice: number) => {
    const next = [...quizAnswers, choice];
    setQuizAnswers(next);
    if (next.length >= styleQuizPairs.length) {
      setQuizDone(true);
    } else {
      setQuizStep(quizStep + 1);
    }
  };

  const quizKey = quizAnswers.join("");
  const quizResult = styleResults[quizKey] || styleResults["1111"];

  const filteredGallery = galleryFilter === "All"
    ? galleryImages
    : galleryImages.filter((img) => img.category === galleryFilter);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden" style={{ background: BG, color: CHARCOAL }}>

      {/* ─── NAV ─── */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <Aperture size={24} weight="duotone" style={{ color: GOLD }} />
              <span className="text-lg font-bold tracking-tight" style={{ color: CHARCOAL }}>Cascade Lens Photography</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: COOL_SLATE }}>
              {["Gallery", "Services", "About", "Pricing", "Contact"].map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-[#1a1a1a] transition-colors">{link}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:+12064829137">
                <MagneticButton className="px-4 md:px-5 py-2 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Book Session
                </MagneticButton>
              </a>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: CHARCOAL }}>
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="md:hidden mt-2 overflow-hidden">
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Gallery", "Services", "About", "Pricing", "Contact"].map((link) => (
                    <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors" style={{ color: COOL_SLATE }}>{link}</a>
                  ))}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ─── HERO: Camera Shutter Reveal ─── */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 z-10 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(120px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD_LIGHT} 0%, transparent 70%)`, filter: "blur(100px)" }} />
        </div>

        {/* Shutter animation overlay */}
        <ShutterRevealHero />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mx-auto max-w-7xl px-4 md:px-6 w-full relative z-30"
        >
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 1.8 }} className="text-sm uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Seattle&apos;s Premier Photography Studio
            </motion.p>
            <h1 className="text-4xl md:text-7xl tracking-tighter leading-[0.95] font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Your Story Deserves Art" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 2.2 }} className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: COOL_SLATE }}>
              Award-winning photography by Mike Chen. Weddings, portraits, headshots, and events across the Pacific Northwest.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 2.4 }} className="flex flex-wrap justify-center gap-4">
              <a href="#contact">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Book Your Session <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </a>
              <a href="tel:+12064829137">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold border border-gray-300 flex items-center gap-2 cursor-pointer" style={{ color: CHARCOAL }}>
                  <Phone size={18} weight="duotone" /> (206) 482-9137
                </MagneticButton>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <SectionReveal className="relative z-10 py-8 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12+", label: "Years Experience" },
              { value: "2,500+", label: "Sessions Delivered" },
              { value: "4.9", label: "Google Rating" },
              { value: "48hr", label: "Sneak Peek Guarantee" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: COOL_SLATE }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICES ─── */}
      <SectionReveal id="services" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg width="100%" height="100%"><pattern id="lens-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={GOLD} strokeWidth="0.5" /></pattern><rect width="100%" height="100%" fill="url(#lens-grid)" /></svg>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>What We Offer</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Photography Services" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <svc.icon size={24} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: CHARCOAL }}>{svc.title}</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: COOL_SLATE }}>{svc.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm font-semibold" style={{ color: GOLD }}>{svc.price}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── ABOUT MIA CHEN ─── */}
      <SectionReveal id="about" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80" alt="Mike Chen photographing on location" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="px-4 py-3 inline-flex items-center gap-3 bg-white/80">
                  <Trophy size={20} weight="duotone" style={{ color: GOLD }} />
                  <span className="text-sm font-medium" style={{ color: CHARCOAL }}>PNW Photographer of the Year 2024</span>
                </GlassCard>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Meet Mike Chen</p>
              <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold mb-6" style={{ color: CHARCOAL }}>
                <WordReveal text="The Heart Behind the Lens" />
              </h2>
              <div className="space-y-4 leading-relaxed" style={{ color: COOL_SLATE }}>
                <p>I fell in love with photography chasing golden hour light along the Puget Sound. Twelve years later, that same wonder drives every session. Based in Seattle, I specialize in authentic, editorial-style imagery that feels timeless rather than trendy.</p>
                <p>My philosophy is simple: connection first, camera second. The most powerful images happen when people forget they are being photographed. Whether it is a bride&apos;s first look at Kerry Park, a CEO&apos;s confident gaze in the studio, or a family laughing at Discovery Park, I find the truth in every frame.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: "12+ Years in Seattle" },
                  { icon: Trophy, label: "Award-Winning" },
                  { icon: FilmStrip, label: "500+ Sessions/Year" },
                  { icon: Eye, label: "Editorial Quality" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GOLD_GLOW }}>
                      <item.icon size={16} weight="duotone" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm" style={{ color: COOL_SLATE }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── SESSION BUILDER ─── */}
      <SectionReveal id="builder" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Build Your Session</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Session Price Estimator" />
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: COOL_SLATE }}>Customize your perfect photography session and see a live price estimate.</p>
          </div>
          <GlassCard className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Session Type */}
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: CHARCOAL }}>Session Type</label>
                <div className="space-y-2">
                  {sessionTypes.map((s, i) => (
                    <button key={s.id} onClick={() => setSelectedSession(i)} className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all cursor-pointer ${selectedSession === i ? "border-yellow-600 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="font-medium" style={{ color: CHARCOAL }}>{s.label}</span>
                      <span className="float-right" style={{ color: COOL_SLATE }}>from ${s.base}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Duration */}
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: CHARCOAL }}>Duration</label>
                <div className="space-y-2 mb-6">
                  {durationOptions.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDuration(i)} className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all cursor-pointer ${selectedDuration === i ? "border-yellow-600 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="font-medium" style={{ color: CHARCOAL }}>{d.label}</span>
                      <span className="float-right" style={{ color: COOL_SLATE }}>{d.multiplier}x</span>
                    </button>
                  ))}
                </div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: CHARCOAL }}>Add-Ons</label>
                <div className="space-y-2">
                  {addOns.map((a) => (
                    <button key={a.id} onClick={() => toggleAddOn(a.id)} className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all cursor-pointer ${selectedAddOns.includes(a.id) ? "border-yellow-600 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${selectedAddOns.includes(a.id) ? "border-yellow-600 bg-yellow-600 text-white" : "border-gray-300"}`}>
                          {selectedAddOns.includes(a.id) && <CheckCircle size={12} weight="fill" />}
                        </span>
                        <span style={{ color: CHARCOAL }}>{a.label}</span>
                      </span>
                      <span className="float-right" style={{ color: COOL_SLATE }}>+${a.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Price display */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm" style={{ color: COOL_SLATE }}>Estimated Investment</p>
                <motion.p key={sessionPrice} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-5xl font-bold" style={{ color: GOLD }}>
                  ${sessionPrice.toLocaleString()}
                </motion.p>
              </div>
              <a href="#contact">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Book This Session <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </a>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── STYLE QUIZ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Discover Your Aesthetic</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="What Is Your Photography Style?" />
            </h2>
          </div>
          <GlassCard className="p-6 md:p-10">
            {!quizDone ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-medium" style={{ color: COOL_SLATE }}>
                    Question {quizStep + 1} of {styleQuizPairs.length}
                  </p>
                  <div className="flex gap-1.5">
                    {styleQuizPairs.map((_, i) => (
                      <div key={i} className="w-8 h-1.5 rounded-full" style={{ background: i <= quizStep ? GOLD : "#e5e7eb" }} />
                    ))}
                  </div>
                </div>
                <p className="text-lg font-semibold mb-6 text-center" style={{ color: CHARCOAL }}>Which style speaks to you?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[styleQuizPairs[quizStep].a, styleQuizPairs[quizStep].b].map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuizAnswer(idx)}
                      className="relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer group border-2 border-transparent hover:border-yellow-500 transition-colors"
                    >
                      <img src={opt.img} alt={opt.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <span className="text-white font-semibold text-lg">{opt.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GOLD_GLOW }}>
                  <Palette size={32} weight="duotone" style={{ color: GOLD }} />
                </div>
                <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>Your Photography Style Is</p>
                <h3 className="text-3xl font-bold mb-4" style={{ color: CHARCOAL }}>{quizResult.name}</h3>
                <p className="max-w-md mx-auto mb-6" style={{ color: COOL_SLATE }}>{quizResult.description}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a href="#contact">
                    <MagneticButton className="px-6 py-3 rounded-full text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                      Book a {quizResult.name} Session
                    </MagneticButton>
                  </a>
                  <MagneticButton onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizDone(false); }} className="px-6 py-3 rounded-full text-sm font-semibold border border-gray-300 cursor-pointer" style={{ color: CHARCOAL }}>
                    Retake Quiz
                  </MagneticButton>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── GALLERY FILTER ─── */}
      <SectionReveal id="gallery" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Portfolio</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Featured Work" />
            </h2>
          </div>
          {/* Category filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${galleryFilter === cat ? "text-white" : "border border-gray-200 hover:border-gray-300"}`}
                style={galleryFilter === cat ? { background: GOLD } : { color: COOL_SLATE }}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Gallery grid */}
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((img) => (
                <motion.div
                  key={img.src}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={springFast}
                  className="rounded-2xl overflow-hidden aspect-square relative group cursor-default"
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <p className="text-white text-sm font-medium">{img.alt}</p>
                      <p className="text-white/70 text-xs mt-0.5">{img.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── PROCESS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>How It Works</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="The Experience" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-5 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {processSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative">
                <GlassCard className="p-5 text-center h-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: GOLD_GLOW }}>
                    <step.icon size={22} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: GOLD }}>{step.step}</div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: CHARCOAL }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: COOL_SLATE }}>{step.description}</p>
                </GlassCard>
                {i < processSteps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight size={16} style={{ color: GOLD }} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── TESTIMONIALS: Photo Session Recap Cards ─── */}
      <SectionReveal id="testimonials" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Client Love</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Session Recaps" />
            </h2>
            {/* Google Reviews header */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" style={{ color: GOLD }} />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: CHARCOAL }}>4.9</span>
              <span className="text-sm" style={{ color: COOL_SLATE }}>(127 reviews on Google)</span>
            </div>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-0 h-full overflow-hidden">
                  {/* Polaroid-style top bar */}
                  <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: GOLD_GLOW }}>
                        <Camera size={18} weight="duotone" style={{ color: GOLD }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{t.sessionType}</p>
                        <p className="text-xs" style={{ color: COOL_SLATE }}>{t.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={12} weight="fill" style={{ color: GOLD }} />
                      ))}
                    </div>
                  </div>
                  {/* Quote area — polaroid inner frame */}
                  <div className="px-6 py-5">
                    <Quotes size={24} weight="fill" style={{ color: GOLD }} className="mb-2 opacity-40" />
                    <p className="text-sm leading-relaxed" style={{ color: COOL_SLATE }}>{t.text}</p>
                  </div>
                  {/* Session stats footer */}
                  <div className="px-6 pb-5 pt-2 flex items-center gap-6 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Image size={14} weight="duotone" style={{ color: GOLD }} />
                      <span className="text-xs font-medium" style={{ color: CHARCOAL }}>{t.photosDelivered} photos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Timer size={14} weight="duotone" style={{ color: GOLD }} />
                      <span className="text-xs font-medium" style={{ color: CHARCOAL }}>{t.turnaround}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <SealCheck size={14} weight="fill" style={{ color: GOLD }} />
                      <span className="text-xs" style={{ color: COOL_SLATE }}>Verified Client</span>
                    </div>
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
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Investment</p>
            <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Session Packages" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {pricingTiers.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp}>
                {pkg.highlight ? (
                  <ShimmerBorder>
                    <div className="p-6 md:p-8">
                      <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: GOLD }}>Most Popular</div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: CHARCOAL }}>{pkg.name}</h3>
                      <p className="text-xs mb-4" style={{ color: COOL_SLATE }}>{pkg.sub}</p>
                      <div className="text-4xl font-bold mb-6" style={{ color: CHARCOAL }}>{pkg.price}</div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-3 text-sm" style={{ color: COOL_SLATE }}>
                            <Sparkle size={14} weight="fill" style={{ color: GOLD }} />{f}
                          </li>
                        ))}
                      </ul>
                      <a href="#contact">
                        <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                          Book Now
                        </MagneticButton>
                      </a>
                    </div>
                  </ShimmerBorder>
                ) : (
                  <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                    <h3 className="text-xl font-bold mb-1" style={{ color: CHARCOAL }}>{pkg.name}</h3>
                    <p className="text-xs mb-4" style={{ color: COOL_SLATE }}>{pkg.sub}</p>
                    <div className="text-4xl font-bold mb-6" style={{ color: CHARCOAL }}>{pkg.price}</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {pkg.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm" style={{ color: COOL_SLATE }}>
                          <Sparkle size={14} weight="duotone" style={{ color: GOLD }} />{f}
                        </li>
                      ))}
                    </ul>
                    <a href="#contact">
                      <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 cursor-pointer" style={{ color: CHARCOAL }}>
                        Book Now
                      </MagneticButton>
                    </a>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Why Cascade Lens</p>
            <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Cascade Lens vs. The Competition" />
            </h2>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold" style={{ color: CHARCOAL }}>Feature</th>
                    <th className="px-6 py-4 text-center font-semibold" style={{ color: GOLD }}>Cascade Lens</th>
                    <th className="px-6 py-4 text-center font-semibold" style={{ color: COOL_SLATE }}>Average Photographer</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["48-Hour Sneak Peek", true, false],
                    ["Full Print Release Included", true, "Sometimes"],
                    ["Professional Retouching", true, "Basic"],
                    ["Online Gallery + Downloads", true, true],
                    ["Backup Equipment On-Site", true, false],
                    ["Location Scouting", true, false],
                    ["Wardrobe Styling Guide", true, false],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3" style={{ color: CHARCOAL }}>{row[0] as string}</td>
                      <td className="px-6 py-3 text-center">
                        {row[1] === true ? <CheckCircle size={18} weight="fill" style={{ color: "#16a34a" }} className="mx-auto" /> : <span style={{ color: COOL_SLATE }}>{String(row[1])}</span>}
                      </td>
                      <td className="px-6 py-3 text-center" style={{ color: COOL_SLATE }}>
                        {row[2] === true ? <CheckCircle size={18} weight="fill" style={{ color: "#16a34a" }} className="mx-auto" /> : row[2] === false ? <span className="text-red-400">No</span> : <span>{String(row[2])}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ─── SESSION PREP TIPS ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Prepare for Your Session</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Session Prep Tips" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {sessionPrepTips.map((tip, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <tip.icon size={24} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: CHARCOAL }}>{tip.title}</h3>
                  <ul className="space-y-2">
                    {tip.tips.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm" style={{ color: COOL_SLATE }}>
                        <CheckCircle size={14} weight="fill" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
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

      {/* ─── WHAT MAKES US DIFFERENT ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>The Cascade Lens Difference</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="What Sets Us Apart" />
            </h2>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
            {[
              { icon: Eye, title: "Artistic Eye", description: "Every image is composed with editorial precision. We do not just document. We create visual stories that evoke emotion and stand the test of time." },
              { icon: Sun, title: "Natural Light Mastery", description: "Seattle light is moody, dramatic, and beautiful. We know exactly when and where to find the golden hour magic that makes Pacific Northwest photography legendary." },
              { icon: Timer, title: "Fast Turnaround", description: "Sneak peeks within 48 hours, full galleries within 2 weeks for portraits. We respect your excitement and do not keep you waiting months." },
              { icon: CameraRotate, title: "Backup Everything", description: "Dual card slots, backup camera body, and redundant storage. Your once-in-a-lifetime moments are protected from the first click to final delivery." },
              { icon: Printer, title: "Full Print Release", description: "Every package includes a personal print release. Your images are yours to print, share, and display however you choose." },
              { icon: Palette, title: "Signature Editing", description: "Each image is individually color-graded in our warm, editorial style. No batch filters, no presets. Every photo gets the attention it deserves." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_GLOW }}>
                    <item.icon size={24} weight="duotone" style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: CHARCOAL }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: COOL_SLATE }}>{item.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      {/* ─── VIDEO TESTIMONIAL PLACEHOLDER ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <img src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1200&q=80" alt="Behind the scenes photography" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: GOLD }}
              >
                <Play size={36} weight="fill" className="text-white ml-1" />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6">
              <p className="text-white text-lg font-semibold">Behind the Scenes</p>
              <p className="text-white/70 text-sm">See how the magic happens at a Cascade Lens session</p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ─── LIMITED AVAILABILITY CTA ─── */}
      <SectionReveal className="relative z-10 py-12">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <ShimmerBorder>
            <div className="p-8 md:p-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full"
                  style={{ background: "#ef4444" }}
                />
                <span className="text-sm font-semibold" style={{ color: "#ef4444" }}>Limited Availability</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: CHARCOAL }}>
                Now Booking Summer & Fall 2026
              </h3>
              <p className="max-w-lg mx-auto mb-6" style={{ color: COOL_SLATE }}>
                Peak season dates are filling fast. Secure your preferred date with a deposit to lock in current pricing.
              </p>
              <a href="#contact">
                <MagneticButton className="px-8 py-4 rounded-full text-base font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  Check Availability <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </a>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ─── FAQ ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Common Questions</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Frequently Asked Questions" />
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                  <span className="text-base font-semibold pr-4" style={{ color: CHARCOAL }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={spring}>
                    <CaretDown size={20} style={{ color: COOL_SLATE }} className="shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                      <p className="px-5 pb-5 leading-relaxed" style={{ color: COOL_SLATE }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ─── SERVICE AREA ─── */}
      <SectionReveal className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Where We Shoot</p>
            <h2 className="text-4xl md:text-5xl tracking-tighter leading-none font-bold" style={{ color: CHARCOAL }}>
              <WordReveal text="Service Area" />
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: COOL_SLATE }}>
              Based in Seattle, serving the entire Puget Sound region. Travel available for destination sessions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area) => (
              <div key={area} className="px-4 py-2 rounded-full border border-gray-200 text-sm" style={{ color: COOL_SLATE }}>
                <MapPin size={12} weight="fill" style={{ color: GOLD }} className="inline mr-1" />
                {area}
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
            <span className="text-sm font-medium" style={{ color: CHARCOAL }}>Currently accepting bookings</span>
            <span className="text-sm" style={{ color: COOL_SLATE }}>&mdash; Average response time: 2 hours</span>
          </div>
        </div>
      </SectionReveal>

      {/* ─── CONTACT / BOOKING FORM ─── */}
      <SectionReveal id="contact" className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: GOLD }}>Let&apos;s Create Together</p>
              <h2 className="text-4xl md:text-6xl tracking-tighter leading-none font-bold mb-6" style={{ color: CHARCOAL }}>
                <WordReveal text="Book Your Session" />
              </h2>
              <p className="leading-relaxed max-w-md mb-8" style={{ color: COOL_SLATE }}>
                Every great image starts with a conversation. Tell me about your vision and let&apos;s create something extraordinary together.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Studio", value: "2847 Westlake Ave N, Suite 210\nSeattle, WA 98109", href: "https://maps.google.com/?q=2847+Westlake+Ave+N+Suite+210+Seattle+WA+98109" },
                  { icon: Phone, label: "Phone", value: "(206) 482-9137", href: "tel:+12064829137" },
                  { icon: Envelope, label: "Email", value: "hello@cascadelens.com", href: "mailto:hello@cascadelens.com" },
                  { icon: Clock, label: "Availability", value: "By appointment\nWeekends book fast", href: undefined },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon size={20} weight="duotone" style={{ color: GOLD }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-sm whitespace-pre-line underline decoration-gray-300 hover:decoration-gray-500 transition-colors" style={{ color: COOL_SLATE }}>
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm whitespace-pre-line" style={{ color: COOL_SLATE }}>{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Certifications */}
              <div className="mt-8 flex flex-wrap gap-2">
                {["PPA Member", "PNW Certified", "Fully Insured", "BBB A+"].map((badge) => (
                  <span key={badge} className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium" style={{ color: COOL_SLATE }}>
                    <SealCheck size={12} weight="fill" style={{ color: GOLD }} className="inline mr-1" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: CHARCOAL }}>Inquire About a Session</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500/50" style={{ color: CHARCOAL }} />
                  <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500/50" style={{ color: CHARCOAL }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500/50" style={{ color: CHARCOAL }} />
                  <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 focus:outline-none focus:border-yellow-500/50">
                    <option value="">Session Type</option>
                    {services.map((s, i) => (<option key={i} value={s.title}>{s.title}</option>))}
                  </select>
                </div>
                <input type="text" placeholder="Preferred Date(s)" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500/50" style={{ color: CHARCOAL }} />
                <textarea placeholder="Tell me about your vision, the occasion, and any questions you have..." rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500/50 resize-none" style={{ color: CHARCOAL }} />
                <MagneticButton className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: GOLD } as React.CSSProperties}>
                  <span className="flex items-center justify-center gap-2"><CalendarCheck size={18} /> Send Inquiry</span>
                </MagneticButton>
                <p className="text-xs text-center" style={{ color: COOL_SLATE }}>I respond to all inquiries within 24 hours. No spam, ever.</p>
              </form>
            </GlassCard>
          </div>
        </div>
      </SectionReveal>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center gap-2">
              <Aperture size={20} weight="duotone" style={{ color: GOLD }} />
              <span className="text-sm font-semibold" style={{ color: CHARCOAL }}>Cascade Lens Photography</span>
            </div>
            <div className="text-center">
              <p className="text-sm" style={{ color: COOL_SLATE }}>
                <a href="https://maps.google.com/?q=2847+Westlake+Ave+N+Suite+210+Seattle+WA+98109" target="_blank" rel="noopener noreferrer" className="hover:underline">2847 Westlake Ave N, Suite 210, Seattle, WA 98109</a>
                {" "}&bull;{" "}
                <a href="tel:+12064829137" className="hover:underline">(206) 482-9137</a>
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-xs" style={{ color: COOL_SLATE }}>
                &copy; {new Date().getFullYear()} Cascade Lens Photography. All rights reserved.
              </p>
              <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: COOL_SLATE }}>
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">bluejayportfolio.com</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
