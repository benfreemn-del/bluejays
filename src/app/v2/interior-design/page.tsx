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
  CaretDown,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  House,
  PaintBrush,
  Palette,
  Quotes,
  X,
  List,
  CalendarCheck,
  Trophy,
  Sparkle,
  Eye,
  Ruler,
  Armchair,
  Lamp,
  Plant,
  Buildings,
  CheckCircle,
  EnvelopeSimple,
  InstagramLogo,
  FacebookLogo,
  CaretUp,
  SealCheck,
  CurrencyDollar,
  Swatches,
  Columns,
  Lightbulb,
  Couch,
  ShieldCheck,
  HandHeart,
  Users,
  Image,
  HouseLine,
  TreeStructure,
  MagnifyingGlass,
  ChatCircleDots,
  Truck,
  CookingPot,
  Bed,
} from "@phosphor-icons/react";

// ─── COLORS ─────────────────────────────────────────────────────────────────
const BG = "#faf9f6";
const CHARCOAL = "#1a1a1a";
const GOLD = "#b8860b";
const GOLD_LIGHT = "#d4a853";
const CREAM = "#f5f0e8";
const SAGE = "#6b7f5e";

// ─── DATA ───────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: House, title: "Full Room Design", desc: "Complete concept-to-completion interior transformations including furniture selection, color palettes, lighting, and accessories." },
  { icon: CookingPot, title: "Kitchen Remodel", desc: "Custom kitchen designs featuring cabinetry, countertops, backsplash selection, and optimized workflow layouts." },
  { icon: Palette, title: "Color Consultation", desc: "Expert color analysis and palette development tailored to your space, lighting conditions, and personal aesthetic." },
  { icon: Columns, title: "Space Planning", desc: "Strategic floor plan optimization and furniture arrangement to maximize flow, function, and visual balance." },
  { icon: Armchair, title: "Custom Furnishings", desc: "Bespoke furniture sourcing and custom upholstery selections from our network of Pacific Northwest artisans." },
  { icon: Buildings, title: "Home Staging", desc: "Professional staging for real estate listings that highlights architectural features and maximizes buyer appeal." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Discovery", desc: "In-home consultation to understand your lifestyle, preferences, and vision. We photograph the space and discuss your budget." },
  { step: "02", title: "Concept", desc: "We develop mood boards, color palettes, and preliminary layouts. You see the direction before we commit to anything." },
  { step: "03", title: "Design", desc: "Detailed design plans, 3D renderings, material specifications, and a comprehensive furniture and fixtures schedule." },
  { step: "04", title: "Source", desc: "We procure all furnishings, materials, and accessories from our curated vendor network. Every piece is tracked and coordinated." },
  { step: "05", title: "Install", desc: "White-glove installation day. Our team places every item, hangs every piece, and styles every surface to perfection." },
];

const PORTFOLIO_ITEMS = [
  { title: "Capitol Hill Loft", type: "Modern Minimalist", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop", desc: "1,200 sq ft open concept loft transformed with clean lines and warm neutrals" },
  { title: "Queen Anne Victorian", type: "Traditional Revival", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop", desc: "Full home restoration honoring original architectural details with modern comfort" },
  { title: "Bellevue Kitchen", type: "Contemporary Kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop", desc: "Chef-grade kitchen with waterfall island and custom walnut cabinetry" },
  { title: "Mercer Island Estate", type: "Luxury Residential", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop", desc: "5,000 sq ft lakefront estate with bespoke furnishings throughout" },
  { title: "Ballard Studio", type: "Creative Workspace", img: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop", desc: "Design studio conversion balancing productivity with Nordic calm" },
  { title: "Fremont Bungalow", type: "Bohemian Eclectic", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop", desc: "Craftsman bungalow layered with global textiles and vintage finds" },
];

const TESTIMONIALS = [
  {
    name: "Jennifer & Mark Whitfield",
    room: "Kitchen",
    quote: "Elena transformed our dated galley kitchen into a stunning open-concept space. The custom island she designed is where our family gathers every evening now.",
    budget: "$45,000 - $55,000",
    palette: ["#2d3436", "#dfe6e9", "#b8860b", "#6b7f5e"],
    rating: 5,
  },
  {
    name: "David Chen",
    room: "Living Room",
    quote: "The living room feels like it belongs in Architectural Digest. Elena has an extraordinary eye for scale and proportion that makes everything feel intentional.",
    budget: "$28,000 - $35,000",
    palette: ["#f5f0e8", "#1a1a1a", "#8B7355", "#4a6741"],
    rating: 5,
  },
  {
    name: "Sarah Lindqvist",
    room: "Master Suite",
    quote: "Our master suite is now a true sanctuary. The custom headboard, the linen drapes, the layered lighting — every detail creates this sense of effortless luxury.",
    budget: "$32,000 - $40,000",
    palette: ["#e8ddd0", "#3d405b", "#d4a853", "#81b29a"],
    rating: 5,
  },
];

const PACKAGES = [
  {
    name: "Design Consultation",
    price: "$250",
    period: "per session",
    desc: "Perfect for homeowners who want expert guidance but prefer to execute themselves.",
    features: ["2-hour in-home consultation", "Color palette recommendations", "Furniture layout sketch", "Shopping list with sources", "Follow-up email summary"],
    popular: false,
  },
  {
    name: "Room Transformation",
    price: "$2,500",
    period: "starting at",
    desc: "Our signature service for a complete single-room makeover from concept to installation.",
    features: ["Full design concept & mood board", "3D rendering of final design", "Custom furniture sourcing", "Project management", "White-glove installation", "60-day satisfaction guarantee"],
    popular: true,
  },
  {
    name: "Whole Home Design",
    price: "$10,000+",
    period: "custom quote",
    desc: "Comprehensive design for your entire home, creating a cohesive story across every room.",
    features: ["Every room designed cohesively", "Architectural consultation", "Custom millwork & built-ins", "Lighting design plan", "Art & accessory curation", "Priority scheduling", "Lifetime design support"],
    popular: false,
  },
];

const FAQ_ITEMS = [
  { q: "How long does a typical room design project take?", a: "Most single-room projects take 8-12 weeks from initial consultation to final installation. Whole-home projects typically run 4-6 months. We provide a detailed timeline during your discovery session so there are never surprises." },
  { q: "Do I need to purchase all new furniture?", a: "Absolutely not. We love incorporating existing pieces that have meaning to you. During our discovery session, we identify what stays, what goes, and what gets reimagined. Many of our favorite designs blend cherished heirlooms with fresh selections." },
  { q: "What is your design fee structure?", a: "We offer transparent flat-rate design fees based on room count and scope. There are no hidden markups on furniture or materials — you always see the wholesale and retail pricing. Our consultation fee is applied toward any full design project." },
  { q: "Can you work within my budget?", a: "We design beautifully at every price point. During our discovery session, we discuss your investment range openly and then create a design that maximizes impact within those parameters. We always present options at different tiers." },
  { q: "Do you handle contractor coordination?", a: "Yes. For projects involving renovation work, we coordinate with our trusted network of licensed Seattle-area contractors. We manage timelines, handle site visits, and ensure the finished product matches our design specifications exactly." },
  { q: "What areas do you serve?", a: "We serve the greater Seattle metropolitan area including Bellevue, Kirkland, Mercer Island, Queen Anne, Capitol Hill, Ballard, Fremont, and surrounding Eastside communities. We occasionally take on projects in Tacoma and Olympia for larger scopes." },
];

const STYLE_QUIZ_QUESTIONS = [
  {
    question: "Which setting feels most like home to you?",
    options: [
      { label: "A sleek city penthouse with floor-to-ceiling glass", style: "Modern" },
      { label: "A cozy library with rich wood paneling and a fireplace", style: "Traditional" },
      { label: "A bright beach house with natural textures", style: "Transitional" },
      { label: "A Marrakech riad with layered textiles and lanterns", style: "Bohemian" },
      { label: "A Helsinki cabin with pale wood and clean lines", style: "Scandinavian" },
    ],
  },
  {
    question: "Your ideal color palette leans toward...",
    options: [
      { label: "Monochrome — blacks, whites, and grays", style: "Modern" },
      { label: "Warm jewel tones — burgundy, navy, emerald", style: "Traditional" },
      { label: "Soft neutrals with one bold accent", style: "Transitional" },
      { label: "Earthy and eclectic — terracotta, mustard, teal", style: "Bohemian" },
      { label: "Muted and airy — whites, pale blues, soft grays", style: "Scandinavian" },
    ],
  },
  {
    question: "When you shop for furniture, you gravitate toward...",
    options: [
      { label: "Geometric shapes and polished metals", style: "Modern" },
      { label: "Tufted upholstery and carved details", style: "Traditional" },
      { label: "Classic silhouettes in updated fabrics", style: "Transitional" },
      { label: "Vintage finds and global artisan pieces", style: "Bohemian" },
      { label: "Minimal forms in natural materials", style: "Scandinavian" },
    ],
  },
  {
    question: "Your dream weekend activity is...",
    options: [
      { label: "Touring a contemporary art museum", style: "Modern" },
      { label: "Browsing antique shops and estate sales", style: "Traditional" },
      { label: "Hosting an elegant dinner party", style: "Transitional" },
      { label: "Exploring a flea market in a new city", style: "Bohemian" },
      { label: "A quiet morning with coffee and a design book", style: "Scandinavian" },
    ],
  },
];

const STYLE_RESULTS: Record<string, { description: string; colors: string[]; mood: string }> = {
  Modern: {
    description: "You gravitate toward clean lines, bold contrasts, and sophisticated minimalism. Your spaces feel curated and intentional, with every object earning its place.",
    colors: ["#1a1a1a", "#ffffff", "#b8860b", "#4a4a4a", "#e0e0e0"],
    mood: "Sleek, refined, architectural",
  },
  Traditional: {
    description: "You appreciate heritage, craftsmanship, and timeless elegance. Your spaces feel collected over time, layered with rich textures and meaningful objects.",
    colors: ["#2d1b15", "#8b4513", "#d4a853", "#1a3c40", "#f5f0e8"],
    mood: "Warm, layered, distinguished",
  },
  Transitional: {
    description: "You blend the best of classic and contemporary with effortless sophistication. Your spaces feel current yet enduring, comfortable yet polished.",
    colors: ["#f5f0e8", "#6b7f5e", "#b8860b", "#3d3d3d", "#d4c5a9"],
    mood: "Balanced, elegant, approachable",
  },
  Bohemian: {
    description: "You celebrate self-expression, global influences, and creative layering. Your spaces tell stories through collected objects, bold patterns, and unexpected pairings.",
    colors: ["#c2703e", "#2d5a3d", "#d4a853", "#8b3a62", "#e8c47c"],
    mood: "Eclectic, expressive, adventurous",
  },
  Scandinavian: {
    description: "You value simplicity, natural light, and functional beauty. Your spaces feel calm and purposeful, with an emphasis on quality materials and thoughtful design.",
    colors: ["#f0ede8", "#4a6741", "#c4b49a", "#7a8b99", "#ffffff"],
    mood: "Calm, minimal, organic",
  },
};

const COLOR_PALETTES = [
  {
    name: "Coastal Calm",
    colors: ["#e8f4f8", "#a3c9d3", "#5b8fa8", "#2c5f72", "#1a3c4a"],
    description: "Inspired by Pacific Northwest shorelines — soft blues and sandy neutrals that evoke morning fog over Puget Sound.",
  },
  {
    name: "Urban Sophistication",
    colors: ["#f5f0e8", "#b8860b", "#1a1a1a", "#6b6b6b", "#d4a853"],
    description: "The palette of a Seattle penthouse — warm golds against charcoal, with cream softness. Modern luxury at its finest.",
  },
  {
    name: "Forest Retreat",
    colors: ["#f0ede8", "#6b7f5e", "#3d5a3d", "#8b7355", "#2d1b15"],
    description: "Drawn from the mossy forests of the Cascades — deep greens, weathered wood tones, and earthy warmth.",
  },
  {
    name: "Desert Warmth",
    colors: ["#faf5ef", "#c2703e", "#d4a853", "#8b5e3c", "#3d2b1f"],
    description: "Terracotta and sand meet burnished gold — a palette that brings warmth and groundedness to any space.",
  },
  {
    name: "Nordic Minimal",
    colors: ["#ffffff", "#e8e4de", "#b0a99f", "#6b6b6b", "#2d2d2d"],
    description: "Pure and restrained — the quiet confidence of Scandinavian design. Whites, warm grays, and deliberate contrast.",
  },
];

const ROOM_TYPES_BUDGET = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Home Office",
  "Dining Room",
  "Outdoor Space",
];

const FINISH_LEVELS = ["Standard", "Premium", "Luxury"];

const BUDGET_ESTIMATES: Record<string, Record<string, { min: number; max: number; perSqft: number }>> = {
  "Living Room": { Standard: { min: 8000, max: 15000, perSqft: 35 }, Premium: { min: 18000, max: 35000, perSqft: 70 }, Luxury: { min: 40000, max: 75000, perSqft: 120 } },
  Kitchen: { Standard: { min: 15000, max: 30000, perSqft: 80 }, Premium: { min: 35000, max: 60000, perSqft: 150 }, Luxury: { min: 65000, max: 120000, perSqft: 250 } },
  Bedroom: { Standard: { min: 5000, max: 12000, perSqft: 25 }, Premium: { min: 15000, max: 28000, perSqft: 55 }, Luxury: { min: 30000, max: 55000, perSqft: 95 } },
  Bathroom: { Standard: { min: 8000, max: 18000, perSqft: 100 }, Premium: { min: 20000, max: 40000, perSqft: 200 }, Luxury: { min: 45000, max: 80000, perSqft: 350 } },
  "Home Office": { Standard: { min: 4000, max: 10000, perSqft: 30 }, Premium: { min: 12000, max: 22000, perSqft: 55 }, Luxury: { min: 25000, max: 45000, perSqft: 90 } },
  "Dining Room": { Standard: { min: 6000, max: 14000, perSqft: 35 }, Premium: { min: 16000, max: 30000, perSqft: 65 }, Luxury: { min: 35000, max: 60000, perSqft: 110 } },
  "Outdoor Space": { Standard: { min: 5000, max: 15000, perSqft: 25 }, Premium: { min: 18000, max: 35000, perSqft: 55 }, Luxury: { min: 40000, max: 80000, perSqft: 100 } },
};

const COMPARISON_ROWS = [
  { feature: "Personalized Design Vision", us: true, them: "Generic" },
  { feature: "3D Renderings Before Purchase", us: true, them: "No" },
  { feature: "Trade-Only Vendor Access", us: true, them: "Retail Only" },
  { feature: "White-Glove Installation", us: true, them: "DIY" },
  { feature: "Transparent Flat-Rate Pricing", us: true, them: "Hidden Markups" },
  { feature: "Post-Install Styling Adjustments", us: true, them: "No" },
  { feature: "Licensed & Insured", us: true, them: "Varies" },
];

const CERTIFICATIONS = ["ASID Member", "NCIDQ Certified", "LEED Accredited", "BBB A+", "Houzz Best of Design", "Seattle Met Top Designer"];

const MAGAZINE_FEATURES = [
  { name: "Seattle Met", year: "2024" },
  { name: "Pacific NW Magazine", year: "2023" },
  { name: "Luxe Interiors + Design", year: "2023" },
];

// ─── MOOD BOARD SWATCH DATA ────────────────────────────────────────────────
const MOOD_SWATCHES = [
  { type: "circle", size: 140, color: "#d4a853", label: "Brushed Gold", x: 8, y: 15, rotation: -5, img: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=300&h=300&fit=crop" },
  { type: "rect", width: 180, height: 120, color: "#6b7f5e", label: "Sage Linen", x: 55, y: 5, rotation: 3, img: "https://images.unsplash.com/photo-1528459105426-b9548367069b?w=400&h=300&fit=crop" },
  { type: "square", size: 120, color: "#f5f0e8", label: "Warm Ivory", x: 30, y: 55, rotation: -8, img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300&h=300&fit=crop" },
  { type: "rect", width: 160, height: 100, color: "#1a1a1a", label: "Charcoal Velvet", x: 65, y: 50, rotation: 5, img: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&h=300&fit=crop" },
  { type: "circle", size: 100, color: "#b8860b", label: "Amber Marble", x: 10, y: 70, rotation: 12, img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=300&h=300&fit=crop" },
  { type: "square", size: 110, color: "#8B7355", label: "Walnut Grain", x: 78, y: 25, rotation: -3, img: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=300&h=300&fit=crop" },
];

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-md bg-black/[0.03] border border-black/[0.06] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ accent, main, sub }: { accent: string; main: string; sub?: string }) {
  return (
    <div className="text-center mb-16">
      <span className="text-sm font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>{accent}</span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light mt-3" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
        {main}
      </h2>
      {sub && <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: "#6b6b6b" }}>{sub}</p>}
      <div className="w-20 h-[2px] mx-auto mt-6" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
    </div>
  );
}

function StarRow({ count = 5, size = 16 }: { count?: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} weight="fill" size={size} style={{ color: GOLD }} />
      ))}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function InteriorDesignShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [budgetRoom, setBudgetRoom] = useState("Living Room");
  const [budgetSize, setBudgetSize] = useState(300);
  const [budgetFinish, setBudgetFinish] = useState("Premium");
  const [activePalette, setActivePalette] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", room: "", message: "" });
  const [hoveredSwatch, setHoveredSwatch] = useState<number | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const handleQuizAnswer = useCallback((style: string) => {
    const newAnswers = [...quizAnswers, style];
    setQuizAnswers(newAnswers);
    if (newAnswers.length >= 4) {
      const counts: Record<string, number> = {};
      newAnswers.forEach((s) => { counts[s] = (counts[s] || 0) + 1; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setQuizResult(winner);
    } else {
      setQuizStep(quizStep + 1);
    }
  }, [quizAnswers, quizStep]);

  const resetQuiz = useCallback(() => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizResult(null);
  }, []);

  const budgetData = BUDGET_ESTIMATES[budgetRoom]?.[budgetFinish];
  const budgetMin = budgetData ? Math.round(budgetData.min + budgetData.perSqft * Math.max(0, budgetSize - 200)) : 0;
  const budgetMax = budgetData ? Math.round(budgetData.max + budgetData.perSqft * Math.max(0, budgetSize - 200)) : 0;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: BG, color: CHARCOAL }}>

      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="text-xl font-light tracking-wide" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
            <span style={{ color: GOLD }}>Cascadia</span> Interiors
          </a>
          <div className="hidden md:flex items-center gap-8">
            {["Services", "About", "Portfolio", "Pricing", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium tracking-wide transition-colors hover:opacity-70"
                style={{ color: CHARCOAL }}
              >
                {item}
              </a>
            ))}
            <a
              href="tel:+12065551234"
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: GOLD }}
            >
              (206) 555-1234
            </a>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-black/[0.05] bg-white/90 backdrop-blur-xl"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {["Services", "About", "Portfolio", "Pricing", "Contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium py-2"
                    style={{ color: CHARCOAL }}
                  >
                    {item}
                  </a>
                ))}
                <a
                  href="tel:+12065551234"
                  className="px-5 py-3 rounded-full text-center text-white font-medium"
                  style={{ background: GOLD }}
                >
                  (206) 555-1234
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════ HERO — MOOD BOARD COLLAGE ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 40%, ${GOLD}10 0%, transparent 60%)` }} />

        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-medium tracking-[0.25em] uppercase" style={{ color: GOLD }}>
              Seattle Interior Design Studio
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-light mt-4 leading-[1.15]"
              style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}
            >
              Spaces That{" "}
              <span className="italic" style={{ color: GOLD }}>
                Tell Your Story
              </span>
            </h1>
            <p className="text-lg mt-6 leading-relaxed max-w-lg" style={{ color: "#5a5a5a" }}>
              Elena Vasquez and her team create thoughtful, livable interiors for discerning
              Pacific Northwest homeowners. Fifteen years of transforming Seattle homes into
              personal masterpieces.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="#contact"
                className="px-8 py-3.5 rounded-full text-white font-medium transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: GOLD }}
              >
                Book a Consultation
              </a>
              <a
                href="#portfolio"
                className="px-8 py-3.5 rounded-full font-medium transition-all hover:scale-105 border"
                style={{ color: CHARCOAL, borderColor: `${CHARCOAL}30` }}
              >
                View Portfolio
              </a>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {["ASID Member", "NCIDQ Certified", "15+ Years"].map((badge) => (
                <span
                  key={badge}
                  className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide"
                  style={{ background: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Mood Board Collage side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-square max-w-[520px] mx-auto"
          >
            {MOOD_SWATCHES.map((swatch, i) => {
              const isHovered = hoveredSwatch === i;
              return (
                <motion.div
                  key={i}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${swatch.x}%`,
                    top: `${swatch.y}%`,
                    zIndex: isHovered ? 20 : 10 - i,
                  }}
                  animate={{
                    rotate: isHovered ? 0 : swatch.rotation,
                    scale: isHovered ? 1.12 : 1,
                    y: isHovered ? -8 : [0, -3, 0],
                  }}
                  transition={isHovered ? { duration: 0.3 } : { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  onMouseEnter={() => setHoveredSwatch(i)}
                  onMouseLeave={() => setHoveredSwatch(null)}
                >
                  <div
                    className="overflow-hidden shadow-xl transition-shadow duration-300"
                    style={{
                      width: swatch.type === "circle" ? swatch.size : swatch.type === "square" ? swatch.size : swatch.width,
                      height: swatch.type === "circle" ? swatch.size : swatch.type === "square" ? swatch.size : swatch.height,
                      borderRadius: swatch.type === "circle" ? "50%" : swatch.type === "square" ? "16px" : "12px",
                      boxShadow: isHovered
                        ? `0 20px 40px ${CHARCOAL}30, 0 0 0 3px ${GOLD}40`
                        : `0 8px 24px ${CHARCOAL}15`,
                    }}
                  >
                    <img
                      src={swatch.img}
                      alt={swatch.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Label */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: CHARCOAL, color: "#fff" }}
                      >
                        {swatch.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Center color palette dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 z-0">
              {[GOLD, SAGE, CREAM, CHARCOAL, GOLD_LIGHT].map((c, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ background: c }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BAR ═══════════════════ */}
      <section className="py-8 border-y" style={{ borderColor: `${CHARCOAL}08`, background: `linear-gradient(to right, ${CREAM}, ${BG}, ${CREAM})` }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "200+", label: "Projects Completed" },
            { value: "15", label: "Years Experience" },
            { value: "3", label: "Magazine Features" },
            { value: "98%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-light" style={{ color: GOLD, fontFamily: "'Georgia', serif" }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: "#7a7a7a" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section id="services" className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading accent="What We Do" main="Design Services" sub="From a single room refresh to a whole-home transformation, every project receives the same meticulous attention to detail." />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-8 h-full hover:shadow-lg transition-all group">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors"
                    style={{ background: `${GOLD}12` }}
                  >
                    <svc.icon size={28} style={{ color: GOLD }} />
                  </div>
                  <h3 className="text-xl font-medium mb-3" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>{svc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{svc.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT ELENA ═══════════════════ */}
      <section id="about" className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=750&fit=crop&crop=top"
                alt="Elena Vasquez, Principal Designer"
                className="rounded-2xl shadow-xl w-full object-cover object-top"
                style={{ maxHeight: 500 }}
              />
              <div
                className="absolute -bottom-6 -right-6 px-6 py-4 rounded-xl shadow-lg"
                style={{ background: "white" }}
              >
                <div className="text-sm font-medium" style={{ color: GOLD }}>Principal Designer</div>
                <div className="text-lg font-light" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>Elena Vasquez</div>
                <div className="text-xs mt-1" style={{ color: "#999" }}>NCIDQ #24-7891</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>Meet the Designer</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-6" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
              Design With <span className="italic" style={{ color: GOLD }}>Intention</span>
            </h2>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "#5a5a5a" }}>
              <p>
                Elena Vasquez founded Cascadia Interiors in 2011 after a decade of designing luxury hospitality
                spaces across the Pacific Northwest. Her background in architecture gives her a structural eye
                that most decorators lack — she sees how light, proportion, and material intersect to create feeling.
              </p>
              <p>
                Her design philosophy centers on the idea that great interiors should feel inevitable — as though
                the space was always meant to look this way. Every choice, from the doorknob finish to the sofa
                silhouette, earns its place through both beauty and purpose.
              </p>
              <p>
                Based in Seattle, Elena leads a team of four designers who share her commitment to craftsmanship,
                client collaboration, and the belief that your home should be the most beautiful place you spend your time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {MAGAZINE_FEATURES.map((mag) => (
                <span
                  key={mag.name}
                  className="px-4 py-2 rounded-full text-xs font-medium"
                  style={{ background: `${SAGE}15`, color: SAGE, border: `1px solid ${SAGE}30` }}
                >
                  Featured in {mag.name} ({mag.year})
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STYLE QUIZ ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            accent="Interactive"
            main="Discover Your Design Style"
            sub="Answer four quick questions and we will reveal the aesthetic that resonates with your soul."
          />

          <GlassCard className="p-8 sm:p-12">
            {quizResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-8">
                  <span className="text-sm font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>Your Style Is</span>
                  <h3 className="text-3xl sm:text-4xl font-light mt-2" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
                    {quizResult}
                  </h3>
                </div>

                <p className="text-center text-base leading-relaxed mb-8" style={{ color: "#5a5a5a" }}>
                  {STYLE_RESULTS[quizResult]?.description}
                </p>

                <div className="text-center mb-4 text-sm font-medium" style={{ color: "#7a7a7a" }}>Your Palette</div>
                <div className="flex justify-center gap-3 mb-4">
                  {STYLE_RESULTS[quizResult]?.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-xl shadow-md border border-black/[0.06]"
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="text-center text-sm italic mb-8" style={{ color: SAGE }}>
                  Mood: {STYLE_RESULTS[quizResult]?.mood}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#contact"
                    className="px-8 py-3 rounded-full text-white text-center font-medium"
                    style={{ background: GOLD }}
                  >
                    Design My Space in This Style
                  </a>
                  <button
                    onClick={resetQuiz}
                    className="px-8 py-3 rounded-full font-medium border text-center"
                    style={{ borderColor: `${CHARCOAL}20`, color: CHARCOAL }}
                  >
                    Retake Quiz
                  </button>
                </div>
              </motion.div>
            ) : (
              <div>
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="h-1.5 flex-1 rounded-full transition-all"
                      style={{ background: step <= quizStep ? GOLD : `${CHARCOAL}15` }}
                    />
                  ))}
                </div>

                <h3 className="text-xl font-medium mb-6" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
                  {STYLE_QUIZ_QUESTIONS[quizStep]?.question}
                </h3>

                <div className="space-y-3">
                  {STYLE_QUIZ_QUESTIONS[quizStep]?.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleQuizAnswer(opt.style)}
                      className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group"
                      style={{ borderColor: `${CHARCOAL}10` }}
                    >
                      <span className="text-sm" style={{ color: "#5a5a5a" }}>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="text-center mt-6 text-sm" style={{ color: "#999" }}>
                  Question {quizStep + 1} of 4
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ BUDGET ESTIMATOR ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            accent="Plan Your Investment"
            main="Budget Estimator"
            sub="Get a preliminary sense of what your project might cost. Every project is unique — this is a starting point for our conversation."
          />

          <GlassCard className="p-8 sm:p-12" style={{ background: "white" }}>
            {/* Room Type */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3" style={{ color: CHARCOAL }}>Room Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROOM_TYPES_BUDGET.map((room) => (
                  <button
                    key={room}
                    onClick={() => setBudgetRoom(room)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: budgetRoom === room ? GOLD : "transparent",
                      color: budgetRoom === room ? "white" : CHARCOAL,
                      borderColor: budgetRoom === room ? GOLD : `${CHARCOAL}15`,
                    }}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Slider */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3" style={{ color: CHARCOAL }}>
                Room Size: <span style={{ color: GOLD }}>{budgetSize} sq ft</span>
              </label>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={budgetSize}
                onChange={(e) => setBudgetSize(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${GOLD} 0%, ${GOLD} ${((budgetSize - 100) / 700) * 100}%, ${CHARCOAL}15 ${((budgetSize - 100) / 700) * 100}%, ${CHARCOAL}15 100%)` }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "#999" }}>
                <span>100 sq ft</span>
                <span>800 sq ft</span>
              </div>
            </div>

            {/* Finish Level */}
            <div className="mb-10">
              <label className="block text-sm font-medium mb-3" style={{ color: CHARCOAL }}>Finish Level</label>
              <div className="grid grid-cols-3 gap-3">
                {FINISH_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setBudgetFinish(level)}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: budgetFinish === level ? GOLD : "transparent",
                      color: budgetFinish === level ? "white" : CHARCOAL,
                      borderColor: budgetFinish === level ? GOLD : `${CHARCOAL}15`,
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div
              className="p-8 rounded-2xl text-center"
              style={{ background: `linear-gradient(135deg, ${CREAM}, ${BG})` }}
            >
              <div className="text-sm font-medium tracking-wide uppercase mb-2" style={{ color: SAGE }}>Estimated Investment Range</div>
              <div className="text-3xl sm:text-4xl font-light" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
                ${budgetMin.toLocaleString()} — ${budgetMax.toLocaleString()}
              </div>
              <div className="text-sm mt-3" style={{ color: "#999" }}>
                For a {budgetSize} sq ft {budgetRoom.toLowerCase()} with {budgetFinish.toLowerCase()} finishes
              </div>
              <a
                href="#contact"
                className="inline-block mt-6 px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
                style={{ background: GOLD }}
              >
                Get a Precise Quote
              </a>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ COLOR PALETTE EXPLORER ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            accent="Explore"
            main="Color Palette Gallery"
            sub="Color sets the mood for every room. Explore five curated palettes that reflect distinct design philosophies."
          />

          {/* Palette tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {COLOR_PALETTES.map((pal, i) => (
              <button
                key={pal.name}
                onClick={() => setActivePalette(i)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all border"
                style={{
                  background: activePalette === i ? CHARCOAL : "transparent",
                  color: activePalette === i ? "white" : CHARCOAL,
                  borderColor: activePalette === i ? CHARCOAL : `${CHARCOAL}15`,
                }}
              >
                {pal.name}
              </button>
            ))}
          </div>

          {/* Active palette display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePalette}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 sm:p-12">
                <h3 className="text-2xl font-light text-center mb-2" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
                  {COLOR_PALETTES[activePalette].name}
                </h3>
                <p className="text-center text-sm mb-8 max-w-lg mx-auto" style={{ color: "#6b6b6b" }}>
                  {COLOR_PALETTES[activePalette].description}
                </p>

                <div className="flex justify-center gap-4 sm:gap-6 mb-6">
                  {COLOR_PALETTES[activePalette].colors.map((c, i) => (
                    <div key={i} className="text-center group">
                      <div
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl shadow-lg border border-black/[0.06] transition-transform group-hover:scale-110"
                        style={{ background: c }}
                      />
                      <div className="text-xs mt-2 font-mono" style={{ color: "#999" }}>{c}</div>
                    </div>
                  ))}
                </div>

                {/* Palette bar */}
                <div className="h-6 rounded-full overflow-hidden flex mt-4">
                  {COLOR_PALETTES[activePalette].colors.map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════ DESIGN PROCESS ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading accent="How We Work" main="Our Design Process" sub="Five clear steps from first conversation to final reveal. No surprises, just beautiful results." />

          <div className="space-y-0 relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[2px] hidden md:block" style={{ background: `${GOLD}25` }} />

            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-6 sm:gap-8 py-8"
              >
                {/* Step marker */}
                <div
                  className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg font-light z-10"
                  style={{ background: "white", color: GOLD, border: `2px solid ${GOLD}40`, fontFamily: "'Georgia', serif" }}
                >
                  {step.step}
                </div>
                <div className="flex-1 pt-1 sm:pt-3">
                  <h3 className="text-xl font-medium mb-2" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PORTFOLIO ═══════════════════ */}
      <section id="portfolio" className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading accent="Our Work" main="Portfolio Highlights" sub="A selection of recent projects across Seattle and the Eastside." />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-xs font-medium tracking-wide uppercase" style={{ color: GOLD_LIGHT }}>{item.type}</span>
                  <h3 className="text-lg font-medium text-white mt-1" style={{ fontFamily: "'Georgia', serif" }}>{item.title}</h3>
                  <p className="text-sm text-white/70 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS — ROOM TRANSFORMATION CARDS ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeading accent="Client Stories" main="Room Transformations" sub="Real projects, real budgets, real results from Seattle homeowners." />

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="p-8 h-full flex flex-col" style={{ background: "white" }}>
                  {/* Room type header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs font-medium tracking-[0.15em] uppercase" style={{ color: GOLD }}>
                        {t.room} Design
                      </span>
                      <div className="text-sm mt-1" style={{ color: "#999" }}>Investment: {t.budget}</div>
                    </div>
                    <StarRow count={t.rating} size={14} />
                  </div>

                  {/* Color palette swatch */}
                  <div className="flex gap-2 mb-6">
                    {t.palette.map((c, ci) => (
                      <div
                        key={ci}
                        className="w-8 h-8 rounded-lg border border-black/[0.06]"
                        style={{ background: c }}
                        title={`${t.room} palette color ${ci + 1}`}
                      />
                    ))}
                    <div className="flex items-center ml-2">
                      <span className="text-xs" style={{ color: "#bbb" }}>Design palette</span>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="flex-1">
                    <Quotes size={24} weight="fill" style={{ color: `${GOLD}30` }} className="mb-3" />
                    <p className="text-sm leading-relaxed italic" style={{ color: "#5a5a5a" }}>
                      {t.quote}
                    </p>
                  </div>

                  {/* Client */}
                  <div className="mt-6 pt-4 border-t" style={{ borderColor: `${CHARCOAL}08` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ background: SAGE }}>
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: CHARCOAL }}>{t.name}</div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: SAGE }}>
                          <SealCheck size={12} weight="fill" /> Verified Client
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPETITOR COMPARISON ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading accent="Why Us" main="Cascadia Interiors vs. The Rest" sub="See how working with a dedicated design studio compares to going it alone." />

          <GlassCard className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${GOLD}08` }}>
                  <th className="text-left p-4 font-medium" style={{ color: CHARCOAL }}>Feature</th>
                  <th className="text-center p-4 font-medium" style={{ color: GOLD }}>Cascadia</th>
                  <th className="text-center p-4 font-medium" style={{ color: "#999" }}>Others</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: `1px solid ${CHARCOAL}06` }}>
                    <td className="p-4" style={{ color: "#5a5a5a" }}>{row.feature}</td>
                    <td className="p-4 text-center">
                      <CheckCircle size={22} weight="fill" style={{ color: SAGE }} className="inline" />
                    </td>
                    <td className="p-4 text-center text-sm" style={{ color: "#bbb" }}>{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ PRICING PACKAGES ═══════════════════ */}
      <section id="pricing" className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeading accent="Investment" main="Design Packages" sub="Transparent pricing with no hidden markups. Your design fee covers everything." />

          <div className="grid md:grid-cols-3 gap-8">
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {pkg.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-xs font-medium text-white z-10"
                    style={{ background: GOLD }}
                  >
                    Most Popular
                  </div>
                )}
                <GlassCard
                  className="p-8 h-full flex flex-col"
                  style={{
                    background: "white",
                    border: pkg.popular ? `2px solid ${GOLD}40` : undefined,
                  }}
                >
                  <h3 className="text-xl font-medium mb-2" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-light" style={{ color: GOLD, fontFamily: "'Georgia', serif" }}>{pkg.price}</span>
                    <span className="text-sm" style={{ color: "#999" }}>{pkg.period}</span>
                  </div>
                  <p className="text-sm mb-6" style={{ color: "#6b6b6b" }}>{pkg.desc}</p>

                  <ul className="space-y-3 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#5a5a5a" }}>
                        <CheckCircle size={18} weight="fill" style={{ color: SAGE }} className="flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-8 block text-center px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
                    style={{
                      background: pkg.popular ? GOLD : "transparent",
                      color: pkg.popular ? "white" : CHARCOAL,
                      border: pkg.popular ? "none" : `1px solid ${CHARCOAL}20`,
                    }}
                  >
                    Get Started
                  </a>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CERTIFICATIONS / PARTNER BADGES ═══════════════════ */}
      <section className="py-16 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-sm font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>Credentials</span>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {CERTIFICATIONS.map((cert) => (
              <span
                key={cert}
                className="px-5 py-2 rounded-full text-xs font-medium"
                style={{ background: `${SAGE}10`, color: SAGE, border: `1px solid ${SAGE}20` }}
              >
                <ShieldCheck size={14} className="inline mr-1 -mt-0.5" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ACCORDION ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading accent="Questions" main="Frequently Asked" />

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden" style={{ background: "white" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-base font-medium pr-4" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <CaretDown size={20} style={{ color: GOLD }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ VIDEO TESTIMONIAL PLACEHOLDER ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-4xl mx-auto">
          <GlassCard className="relative overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&h=500&fit=crop"
              alt="Cascadia Interiors project showcase"
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer mb-4"
                style={{ background: `${GOLD}e0` }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-0 h-0 border-l-[18px] border-t-[12px] border-b-[12px] border-l-white border-t-transparent border-b-transparent ml-1" />
              </motion.div>
              <div className="text-white text-xl font-light" style={{ fontFamily: "'Georgia', serif" }}>Watch Our Design Process</div>
              <div className="text-white/60 text-sm mt-1">A behind-the-scenes look at how we transform spaces</div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ SERVICE AREA ═══════════════════ */}
      <section className="py-24 px-6" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading accent="Where We Work" main="Service Area" sub="Proudly serving the greater Seattle metropolitan area and Eastside communities." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Capitol Hill", "Queen Anne", "Ballard", "Fremont",
              "Bellevue", "Kirkland", "Mercer Island", "Redmond",
              "Wallingford", "Madison Park", "Laurelhurst", "Magnolia",
            ].map((area) => (
              <GlassCard key={area} className="px-5 py-3 text-center" style={{ background: "white" }}>
                <span className="text-sm font-medium" style={{ color: CHARCOAL }}>{area}</span>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin size={18} style={{ color: GOLD }} />
                <span className="text-sm font-medium" style={{ color: CHARCOAL }}>Coverage Radius</span>
              </div>
              <span className="text-sm" style={{ color: "#7a7a7a" }}>30 miles from downtown Seattle</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock size={18} style={{ color: GOLD }} />
                <span className="text-sm font-medium" style={{ color: CHARCOAL }}>Response Time</span>
              </div>
              <span className="text-sm" style={{ color: "#7a7a7a" }}>Within 24 hours of inquiry</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CalendarCheck size={18} style={{ color: GOLD }} />
                <span className="text-sm font-medium" style={{ color: CHARCOAL }}>Availability</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: SAGE }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: SAGE }} />
                </span>
                <span className="text-sm" style={{ color: SAGE }}>Accepting new clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT / CONSULTATION FORM ═══════════════════ */}
      <section id="contact" className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Info side */}
          <div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>Get Started</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-6" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
              Book Your <span className="italic" style={{ color: GOLD }}>Consultation</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "#5a5a5a" }}>
              Your journey begins with a complimentary 15-minute phone conversation. We will discuss your vision,
              timeline, and how Cascadia Interiors can bring your dream space to life.
            </p>

            <div className="space-y-5">
              <a href="tel:+12065551234" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12` }}>
                  <Phone size={22} style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#999" }}>Call or Text</div>
                  <div className="text-base font-medium group-hover:underline" style={{ color: CHARCOAL }}>(206) 555-1234</div>
                </div>
              </a>

              <a href="mailto:elena@cascadiainteriors.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12` }}>
                  <EnvelopeSimple size={22} style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#999" }}>Email</div>
                  <div className="text-base font-medium group-hover:underline" style={{ color: CHARCOAL }}>elena@cascadiainteriors.com</div>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=123+Pine+Street+Suite+400+Seattle+WA+98101"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12` }}>
                  <MapPin size={22} style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#999" }}>Design Studio</div>
                  <div className="text-base font-medium group-hover:underline" style={{ color: CHARCOAL }}>123 Pine Street, Suite 400, Seattle, WA 98101</div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}12` }}>
                  <Clock size={22} style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#999" }}>Studio Hours</div>
                  <div className="text-base font-medium" style={{ color: CHARCOAL }}>Mon–Fri 9:00 AM – 5:30 PM</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${CHARCOAL}08` }}>
                <InstagramLogo size={20} style={{ color: CHARCOAL }} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${CHARCOAL}08` }}>
                <FacebookLogo size={20} style={{ color: CHARCOAL }} />
              </a>
            </div>
          </div>

          {/* Form side */}
          <GlassCard className="p-8" style={{ background: "white" }}>
            <h3 className="text-xl font-medium mb-6" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>Request a Consultation</h3>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-current"
                  style={{ borderColor: `${CHARCOAL}15`, color: CHARCOAL }}
                  placeholder="Your name"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-current"
                    style={{ borderColor: `${CHARCOAL}15`, color: CHARCOAL }}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-current"
                    style={{ borderColor: `${CHARCOAL}15`, color: CHARCOAL }}
                    placeholder="(206) 555-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Room(s) of Interest</label>
                <select
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-current"
                  style={{ borderColor: `${CHARCOAL}15`, color: CHARCOAL, background: "white" }}
                >
                  <option value="">Select a room type</option>
                  {ROOM_TYPES_BUDGET.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="Whole Home">Whole Home</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Tell Us About Your Project</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-current resize-none"
                  style={{ borderColor: `${CHARCOAL}15`, color: CHARCOAL }}
                  placeholder="What are you hoping to achieve with your space? Any specific style preferences, timeline, or budget range?"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full text-white font-medium transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ background: GOLD }}
              >
                Send Consultation Request
              </button>
              <p className="text-xs text-center" style={{ color: "#bbb" }}>
                We respond within 24 hours. Your information is never shared.
              </p>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════ GOOGLE REVIEWS HEADER ═══════════════════ */}
      <section className="py-12 px-6" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <StarRow count={5} size={22} />
            <span className="text-2xl font-light" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>4.9</span>
          </div>
          <p className="text-sm" style={{ color: "#7a7a7a" }}>
            Based on 87 Google Reviews
          </p>
        </div>
      </section>

      {/* ═══════════════════ CTA BANNER ═══════════════════ */}
      <section className="py-20 px-6 text-center" style={{ background: `linear-gradient(135deg, ${CHARCOAL}, #2a2a2a)` }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            Ready to Transform Your <span className="italic" style={{ color: GOLD_LIGHT }}>Space</span>?
          </h2>
          <p className="text-white/60 mb-8">
            Complimentary 15-minute phone consultation. No obligation, just inspiration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+12065551234"
              className="px-8 py-3.5 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ background: GOLD }}
            >
              Call (206) 555-1234
            </a>
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-full font-medium transition-all hover:scale-105 border border-white/20 text-white"
            >
              Send a Message
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-16 px-6" style={{ background: BG, borderTop: `1px solid ${CHARCOAL}08` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="text-xl font-light mb-4" style={{ color: CHARCOAL, fontFamily: "'Georgia', serif" }}>
                <span style={{ color: GOLD }}>Cascadia</span> Interiors
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#7a7a7a" }}>
                Thoughtful interior design for Pacific Northwest homes. Led by Elena Vasquez, NCIDQ certified.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-medium mb-4 tracking-wide" style={{ color: CHARCOAL }}>Services</h4>
              <ul className="space-y-2">
                {SERVICES.slice(0, 4).map((svc) => (
                  <li key={svc.title}>
                    <a href="#services" className="text-sm hover:underline" style={{ color: "#7a7a7a" }}>{svc.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-medium mb-4 tracking-wide" style={{ color: CHARCOAL }}>Quick Links</h4>
              <ul className="space-y-2">
                {["Portfolio", "About Elena", "Pricing", "FAQ", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/ /g, "")}`} className="text-sm hover:underline" style={{ color: "#7a7a7a" }}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-medium mb-4 tracking-wide" style={{ color: CHARCOAL }}>Contact</h4>
              <div className="space-y-2 text-sm" style={{ color: "#7a7a7a" }}>
                <a href="tel:+12065551234" className="block hover:underline">(206) 555-1234</a>
                <a href="mailto:elena@cascadiainteriors.com" className="block hover:underline">elena@cascadiainteriors.com</a>
                <a
                  href="https://maps.google.com/?q=123+Pine+Street+Suite+400+Seattle+WA+98101"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline"
                >
                  123 Pine Street, Suite 400<br />Seattle, WA 98101
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: `${CHARCOAL}08` }}>
            <p className="text-xs" style={{ color: "#bbb" }}>
              &copy; {new Date().getFullYear()} Cascadia Interiors. All rights reserved.
            </p>
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#bbb" }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
              <a
                href="https://bluejayportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70"
                style={{ color: GOLD }}
              >
                bluejayportfolio.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
