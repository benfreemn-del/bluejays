"use client";

/* eslint-disable @next/next/no-img-element -- Static marketing showcase uses plain img tags intentionally. */

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useInView, AnimatePresence } from "framer-motion";
import {
  PawPrint, Dog, Cat, Bird, Fish, Scissors, Heart, Star, ShieldCheck, Clock,
  Phone, MapPin, ArrowRight, CheckCircle, CaretDown, List, X, Quotes, Car,
  Camera, Bone, Bed, Sun, FirstAid, Trophy, CalendarCheck, Envelope,
  CurrencyDollar, Play, Question, Sparkle, Users, Medal
} from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Warm cream + playful teal/coral
   ═══════════════════════════════════════════════════════════════ */
const TEAL = "#0d9488";
const CORAL = "#f97066";
const BG = "#faf8f5";
const DARK = "#1c1917";
const AMBER = "#d97706";

/* ─── animation presets ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

/* ═══════════════════════════════════════════════════════════════
   DECORATIVE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function PawPattern({
  opacity = 0.04,
  color = TEAL,
}: {
  opacity?: number;
  color?: string;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="pawPat"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="60" cy="42" r="9" fill={color} opacity="0.25" />
          <circle cx="43" cy="28" r="5" fill={color} opacity="0.18" />
          <circle cx="77" cy="28" r="5" fill={color} opacity="0.18" />
          <circle cx="38" cy="42" r="5" fill={color} opacity="0.18" />
          <circle cx="82" cy="42" r="5" fill={color} opacity="0.18" />
          <circle cx="60" cy="100" r="7" fill={CORAL} opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pawPat)" />
    </svg>
  );
}

function SectionReveal({
  children,
  className = "",
  id,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={spring}
    >
      {children}
    </motion.section>
  );
}

function WordReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap gap-x-3 ${className}`}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {text.split(" ").map((word, i) => (
        <motion.span key={i} variants={fadeUp} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function MagneticButton({
  children,
  className = "",
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springFast);
  const springY = useSpring(y, springFast);
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isTouchDevice) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
    },
    [x, y, isTouchDevice],
  );
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);
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

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/60 bg-white/80 backdrop-blur-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ShimmerBorder({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-[2px] overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${TEAL}, transparent, ${CORAL}, transparent)`,
          willChange: "transform",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-white z-10">{children}</div>
    </div>
  );
}

function SectionTag({ text }: { text: string }) {
  return (
    <span
      className="inline-block text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border"
      style={{
        color: TEAL,
        borderColor: `${TEAL}33`,
        background: `${TEAL}0d`,
      }}
    >
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const services = [
  {
    name: "Dog Walking",
    desc: "Reliable daily walks with GPS tracking, photo updates, and personalized routes tailored to your pup's energy level and temperament.",
    icon: PawPrint,
    price: "From $20",
  },
  {
    name: "Pet Sitting",
    desc: "In-home visits to feed, play, and cuddle your fur babies while you're away. Medications administered on schedule too.",
    icon: Heart,
    price: "From $25",
  },
  {
    name: "Overnight Boarding",
    desc: "Cozy overnight stays in supervised suites with bedtime routines, late-night potty breaks, and morning snuggles.",
    icon: Bed,
    price: "From $65",
  },
  {
    name: "Doggy Daycare",
    desc: "A full day of socialization, exercise, and enrichment activities in our spacious 5,000 sq ft indoor/outdoor play areas.",
    icon: Dog,
    price: "From $45",
  },
  {
    name: "Grooming",
    desc: "Full-service spa — baths, breed-specific haircuts, nail trimming, teeth brushing, ear cleaning, and de-shedding treatments.",
    icon: Scissors,
    price: "From $40",
  },
  {
    name: "Pet Taxi",
    desc: "Safe, comfortable transportation to vet appointments, groomers, the airport, or anywhere your pet needs to go in Seattle.",
    icon: Car,
    price: "From $30",
  },
];

const petTypes = [
  {
    name: "Dogs",
    desc: "From energetic puppies to mellow seniors, we match our care to your dog's breed, size, and personality. Group play or solo walks — whatever suits your pup best.",
    icon: Dog,
    img: "https://images.unsplash.com/photo-1536323760109-ca8c07450053?w=600&q=80",
    features: ["Group & solo play", "Breed-specific exercise", "Puppy socialization", "Senior gentle care"],
  },
  {
    name: "Cats",
    desc: "Quiet, calm cat care with separate spaces, vertical climbing areas, window perches for bird-watching, and the patience every feline deserves.",
    icon: Cat,
    img: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&q=80",
    features: ["Separate cat quarters", "Vertical play areas", "Gentle handling", "Litter maintenance"],
  },
  {
    name: "Small Animals",
    desc: "Rabbits, hamsters, guinea pigs, and ferrets — we know the special handling, diet, and habitat needs that keep each species happy and healthy.",
    icon: Fish,
    img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
    features: ["Species-specific diets", "Habitat cleaning", "Gentle handling", "Exercise supervision"],
  },
  {
    name: "Birds",
    desc: "Parakeets, cockatiels, and parrots deserve expert care too. Fresh food, cage cleaning, social time, and lots of gentle conversation.",
    icon: Bird,
    img: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
    features: ["Cage maintenance", "Fresh food daily", "Social interaction", "Flight time"],
  },
];

const pricingPlans = [
  {
    name: "Drop-In Visit",
    price: "$25",
    per: "per visit",
    features: [
      "30-minute in-home visit",
      "Feeding & fresh water",
      "Playtime & cuddles",
      "Photo update via text",
      "Medication administration",
      "Mail & package retrieval",
    ],
    popular: false,
    icon: Heart,
  },
  {
    name: "Full Day Daycare",
    price: "$45",
    per: "per day",
    features: [
      "8+ hours of supervised care",
      "Group play sessions by size",
      "Lunch & healthy snacks",
      "Full daily report card",
      "Nap time supervision",
      "Training reinforcement",
    ],
    popular: true,
    icon: Sun,
  },
  {
    name: "Overnight Boarding",
    price: "$65",
    per: "per night",
    features: [
      "24-hour supervision & care",
      "Private sleeping suite",
      "Evening & morning walks",
      "Breakfast & dinner included",
      "Morning photo update",
      "Bedtime tuck-in routine",
    ],
    popular: false,
    icon: Bed,
  },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600&q=80",
    alt: "Golden retriever playing fetch",
  },
  {
    src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80",
    alt: "Happy pug portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=600&q=80",
    alt: "Cat napping in sunshine",
  },
  {
    src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
    alt: "Puppy bath time grooming",
  },
  {
    src: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600&q=80",
    alt: "Fluffy white dog smiling",
  },
  {
    src: "https://images.unsplash.com/photo-1583511666445-775f1f2116f5?w=600&q=80",
    alt: "Two dogs playing together",
  },
  {
    src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&q=80",
    alt: "Dog with bandana outdoors",
  },
  {
    src: "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=600&q=80",
    alt: "Sleeping kitten on blanket",
  },
];

const testimonials = [
  {
    name: "Jessica & Max",
    pet: "Golden Retriever",
    text: "Max literally SPRINTS to the door when he sees the Happy Tails van pull up. Morgan and the whole team treat him like family. The daily report cards with photos absolutely make my day!",
    rating: 5,
  },
  {
    name: "David & Luna",
    pet: "Tabby Cat",
    text: "We were so nervous about leaving Luna for a week, but they sent us photos and videos every single day. She was purring when we picked her up! Now we actually enjoy our vacations.",
    rating: 5,
  },
  {
    name: "Sarah & Biscuit",
    pet: "Mini Goldendoodle",
    text: "Biscuit comes home from daycare exhausted and happy. The grooming is incredible too — she always looks like she just came from a dog show. Absolutely worth every penny.",
    rating: 5,
  },
  {
    name: "Tom & Mochi",
    pet: "Dwarf Rabbit",
    text: "Finding someone who actually knows how to care for rabbits is SO hard. Morgan is amazing with Mochi — he gets the specialized attention he needs, and I get peace of mind.",
    rating: 5,
  },
];

const reportCardItems = [
  {
    icon: Camera,
    label: "Photos & Videos",
    desc: "Multiple adorable snapshots sent throughout the day via text",
  },
  {
    icon: Bone,
    label: "Meals & Treats",
    desc: "Every meal logged with portions, appetite notes, and treat count",
  },
  {
    icon: Sun,
    label: "Activity Level",
    desc: "Playtime minutes, walks completed, nap duration — a full breakdown",
  },
  {
    icon: Heart,
    label: "Mood & Behavior",
    desc: "How they're feeling, who their friends are, and tail wags counted",
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Background Checked" },
  { icon: Medal, label: "Bonded & Insured" },
  { icon: FirstAid, label: "Pet First Aid Certified" },
  { icon: Trophy, label: "CPPS Certified" },
  { icon: Star, label: "10+ Years Experience" },
  { icon: Users, label: "Former Humane Society Volunteer" },
];

const quizOptions = [
  {
    label: "Regular walks & exercise",
    icon: Dog,
    color: TEAL,
    rec: "Our Dog Walking + Daycare combo keeps active pups happy and tired! Starting from just $20/walk.",
  },
  {
    label: "Overnight care while I travel",
    icon: Bed,
    color: CORAL,
    rec: "Overnight Boarding with daily report cards — your pet's home away from home. Just $65/night.",
  },
  {
    label: "A full grooming makeover",
    icon: Sparkle,
    color: AMBER,
    rec: "Our Grooming Spa will have your pet looking (and smelling) fabulous. Starting at $40.",
  },
];

const comparisonRows = [
  { feature: "CPPS Certified Staff", us: true, them: "Rarely" },
  { feature: "Daily Photo Report Cards", us: true, them: "No" },
  { feature: "Pet First Aid Trained", us: true, them: "Sometimes" },
  { feature: "Background Checked", us: true, them: "Varies" },
  { feature: "Bonded & Insured", us: true, them: "Sometimes" },
  { feature: "Small Group Sizes (Max 8)", us: true, them: "No" },
  { feature: "Personalized Care Plans", us: true, them: "Rarely" },
];

const faqs = [
  {
    q: "What vaccinations are required?",
    a: "All dogs must be current on rabies, distemper/parvo, and bordetella. Cats need rabies and FVRCP. We require proof of vaccination before the first visit for the safety of all our furry guests.",
  },
  {
    q: "Can I see the facility before booking?",
    a: "Absolutely! We love giving tours. Come see our play areas, boarding suites, grooming stations, and meet the whole team. We want you to feel 100% confident in your choice.",
  },
  {
    q: "What happens if my pet gets sick or injured?",
    a: "All staff are pet first aid certified. We have a close relationship with Seattle Emergency Vet Clinic just 5 minutes away and will contact you immediately if anything happens. Your pet's safety is our #1 priority.",
  },
  {
    q: "How do daily report cards work?",
    a: "You'll receive a text message each evening with photos, meal info, activity levels, mood notes, and fun moments from the day. It's like having a window into your pet's day while you're at work or on vacation!",
  },
  {
    q: "Do you accept cats and small animals?",
    a: "Yes! We care for dogs, cats, rabbits, hamsters, guinea pigs, birds, and more. Our cat and small animal areas are completely separate from the dog play zones for everyone's comfort and safety.",
  },
];

const heroCards = [
  {
    img: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80",
    label: "Dogs",
    accent: TEAL,
  },
  {
    img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    label: "Cats",
    accent: CORAL,
  },
  {
    img: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80",
    label: "Small Pets",
    accent: AMBER,
  },
];

const certPartners = [
  "CPPS Certified",
  "Pet Sitters International",
  "NAPPS Member",
  "Pet First Aid & CPR",
  "Seattle Humane Society",
  "BBB Accredited",
];

const serviceAreaItems = [
  { label: "Coverage", value: "Greater Seattle Area", icon: MapPin },
  { label: "Response Time", value: "Same-Day Booking Available", icon: Clock },
  { label: "Availability", value: "7 Days a Week, 7AM-7PM", icon: CalendarCheck },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function V2PetServicesShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [activePetType, setActivePetType] = useState(0);

  return (
    <main
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{ background: BG, color: DARK }}
    >
      {/* ════════════════════════════════════════════════════════
          1. NAVIGATION
          ════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <GlassCard className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-2">
              <PawPrint size={24} weight="fill" style={{ color: CORAL }} />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: DARK }}
              >
                Happy Tails Pet Care
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-stone-500">
              {["Services", "Pricing", "Gallery", "About", "Contact"].map(
                (l) => (
                  <a
                    key={l}
                    href={`#${l.toLowerCase()}`}
                    className="hover:text-stone-900 transition-colors"
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
            <div className="flex items-center gap-3">
              <MagneticButton
                className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer"
                style={{ background: TEAL }}
              >
                Book a Visit
              </MagneticButton>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
                style={{ color: DARK }}
              >
                {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
              </button>
            </div>
          </GlassCard>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-2 overflow-hidden"
              >
                <GlassCard className="flex flex-col gap-1 px-4 py-4">
                  {["Services", "Pricing", "Gallery", "About", "Contact"].map(
                    (l) => (
                      <a
                        key={l}
                        href={`#${l.toLowerCase()}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      >
                        {l}
                      </a>
                    ),
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          2. HERO — ANIMATED CARD STACK (Pattern #15)
          ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 overflow-hidden">
        {/* Warm gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, #fef7f0 0%, ${BG} 40%, #f0fdf9 100%)`,
          }}
        />
        <PawPattern opacity={0.035} />
        {/* Soft glow orbs */}
        <div
          className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none"
          style={{ background: `${TEAL}12` }}
        />
        <div
          className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none"
          style={{ background: `${CORAL}10` }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — text content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ background: `${CORAL}15`, color: CORAL }}
              >
                <PawPrint size={16} weight="fill" /> Seattle&apos;s Most Loved
                Pet Care
              </div>
              <h1
                className="text-4xl md:text-6xl tracking-tighter leading-[1.05] font-extrabold"
                style={{ color: DARK }}
              >
                <WordReveal text="Because Every Tail Deserves to Wag" />
              </h1>
            </motion.div>

            <p className="text-lg text-stone-500 max-w-md leading-relaxed">
              Professional dog walking, pet sitting, boarding, daycare, and
              grooming — all delivered with love by CPPS-certified caregivers
              on Greenwood Ave in Seattle.
            </p>

            <div className="flex flex-wrap gap-4">
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg"
                style={{ background: TEAL }}
              >
                Book a Visit <ArrowRight size={18} weight="bold" />
              </MagneticButton>
              <MagneticButton
                className="px-8 py-4 rounded-full text-base font-semibold flex items-center gap-2 cursor-pointer border-2"
                style={{ color: DARK, borderColor: `${DARK}20` }}
              >
                <Phone size={18} weight="duotone" /> (206) 555-0844
              </MagneticButton>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3">
              {[
                "Background Checked",
                "Bonded & Insured",
                "First Aid Certified",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    color: TEAL,
                    borderColor: `${TEAL}30`,
                    background: `${TEAL}08`,
                  }}
                >
                  <CheckCircle size={14} weight="fill" /> {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right — animated card stack (desktop) */}
          <div className="hidden lg:flex items-center justify-center relative h-[520px]">
            {heroCards.map((card, i) => {
              const rotations = [-8, 0, 8];
              const offsets = [-40, 0, 40];
              return (
                <motion.div
                  key={card.label}
                  className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white cursor-pointer"
                  style={{ zIndex: 10 + i }}
                  initial={{
                    rotate: rotations[i],
                    x: offsets[i],
                    y: i * 8,
                  }}
                  animate={{
                    rotate: rotations[i],
                    x: offsets[i],
                    y: i * 8,
                  }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.06,
                    zIndex: 30,
                    y: -20,
                    transition: springFast,
                  }}
                >
                  <img
                    src={card.img}
                    alt={card.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white"
                      style={{ background: card.accent }}
                    >
                      {card.label}
                    </span>
                    <PawPrint
                      size={20}
                      weight="fill"
                      className="text-white/70"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile — horizontal scroll */}
          <div className="lg:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {heroCards.map((card) => (
              <div
                key={card.label}
                className="flex-shrink-0 w-48 h-64 rounded-2xl overflow-hidden shadow-lg border-2 border-white relative"
              >
                <img
                  src={card.img}
                  alt={card.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span
                  className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: card.accent }}
                >
                  {card.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. TRUST BAR / STATS
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        className="relative py-14 overflow-hidden border-y"
        style={{ borderColor: `${TEAL}15` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #f0fdf9 0%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "5,000+", label: "Happy Pets Served", ic: PawPrint },
              { val: "10+", label: "Years Experience", ic: Clock },
              { val: "100%", label: "Certified Staff", ic: ShieldCheck },
              { val: "4.9", label: "Google Rating", ic: Star },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <s.ic size={22} weight="fill" style={{ color: TEAL }} />
                  <span
                    className="text-3xl md:text-4xl font-extrabold"
                    style={{ color: DARK }}
                  >
                    {s.val}
                  </span>
                </div>
                <span className="text-stone-500 text-sm font-medium tracking-wide uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          4. SERVICES
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        id="services"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.025} color={CORAL} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Our Services" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Everything Your Pet Needs
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${TEAL}, ${CORAL})`,
              }}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name}
                  whileHover={{ y: -6 }}
                  transition={spring}
                  className="group relative p-7 rounded-2xl border bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                  style={{ borderColor: `${TEAL}15` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${TEAL}10, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            i % 2 === 0 ? `${TEAL}15` : `${CORAL}15`,
                        }}
                      >
                        <Icon
                          size={24}
                          weight="duotone"
                          style={{ color: i % 2 === 0 ? TEAL : CORAL }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono text-stone-400"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: DARK }}
                    >
                      {service.name}
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed mb-3">
                      {service.desc}
                    </p>
                    <span
                      className="text-sm font-bold"
                      style={{ color: TEAL }}
                    >
                      {service.price}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          5. PET TYPE SELECTOR
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Who We Care For" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              All Creatures Welcome
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${CORAL}, ${TEAL})`,
              }}
            />
          </div>

          {/* Pet type tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {petTypes.map((pet, i) => {
              const Icon = pet.icon;
              return (
                <button
                  key={pet.name}
                  onClick={() => setActivePetType(i)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer border"
                  style={
                    activePetType === i
                      ? {
                          background: TEAL,
                          color: "white",
                          borderColor: TEAL,
                        }
                      : {
                          background: "white",
                          color: DARK,
                          borderColor: `${TEAL}20`,
                        }
                  }
                >
                  <Icon
                    size={18}
                    weight={activePetType === i ? "fill" : "duotone"}
                  />{" "}
                  {pet.name}
                </button>
              );
            })}
          </div>

          {/* Active pet content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePetType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src={petTypes[activePetType].img}
                  alt={petTypes[activePetType].name}
                  className="w-full h-[380px] object-cover"
                />
              </div>
              <div className="space-y-5">
                <h3
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: DARK }}
                >
                  {petTypes[activePetType].name}
                </h3>
                <p className="text-stone-500 leading-relaxed text-lg">
                  {petTypes[activePetType].desc}
                </p>
                <ul className="space-y-2">
                  {petTypes[activePetType].features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-stone-600"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        style={{ color: TEAL }}
                      />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton
                  className="px-6 py-3 rounded-full text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
                  style={{ background: TEAL }}
                >
                  Book {petTypes[activePetType].name} Care{" "}
                  <ArrowRight size={16} weight="bold" />
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          6. PRICING PACKAGES
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        id="pricing"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Pricing" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Simple, Transparent Pricing
            </h2>
            <p className="text-stone-500 mt-4 max-w-lg mx-auto">
              No hidden fees. No surprise charges. Just honest pricing for
              honest pet care.
            </p>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${TEAL}, ${CORAL})`,
              }}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => {
              const PlanIcon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  whileHover={{ y: -8 }}
                  transition={spring}
                  className={`relative rounded-2xl p-8 border ${plan.popular ? "shadow-xl" : "shadow-sm"}`}
                  style={{
                    background: plan.popular
                      ? "white"
                      : "rgba(255,255,255,0.7)",
                    borderColor: plan.popular ? TEAL : `${TEAL}20`,
                  }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: CORAL }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${TEAL}10` }}
                  >
                    <PlanIcon
                      size={24}
                      weight="duotone"
                      style={{ color: TEAL }}
                    />
                  </div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: DARK }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: TEAL }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-stone-400">{plan.per}</span>
                  </div>
                  <div
                    className="h-px my-5"
                    style={{ background: `${TEAL}15` }}
                  />
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-stone-600"
                      >
                        <CheckCircle
                          size={16}
                          weight="fill"
                          style={{ color: TEAL }}
                        />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                    style={
                      plan.popular
                        ? { background: TEAL, color: "white" }
                        : { background: `${TEAL}10`, color: TEAL }
                    }
                  >
                    Book Now
                  </MagneticButton>
                </motion.div>
              );
            })}
          </div>
          <p className="text-center text-sm text-stone-400 mt-8">
            <CurrencyDollar
              size={16}
              weight="duotone"
              className="inline mr-1"
              style={{ color: TEAL }}
            />
            Multi-pet discount: 15% off for each additional pet. Weekly and
            monthly packages available.
          </p>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          7. DAILY REPORT CARD
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTag text="Daily Report Card" />
              <h2
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6"
                style={{ color: DARK }}
              >
                Know Exactly How Their Day Went
              </h2>
              <p className="text-stone-500 leading-relaxed mb-8 text-lg">
                Every pet parent receives a daily report card with photos, meal
                logs, activity updates, and mood notes. It&apos;s like having a
                window into your pet&apos;s day — no wondering, no worrying.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reportCardItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border"
                    style={{ borderColor: `${TEAL}15` }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${CORAL}12` }}
                    >
                      <item.icon
                        size={20}
                        weight="duotone"
                        style={{ color: CORAL }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: DARK }}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock report card */}
            <div className="relative">
              <ShimmerBorder>
                <div className="p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden border-2"
                      style={{ borderColor: TEAL }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=100&q=80"
                        alt="Pet avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: DARK }}
                      >
                        Max&apos;s Daily Report
                      </p>
                      <p className="text-xs text-stone-400">
                        April 11, 2026
                      </p>
                    </div>
                    <span
                      className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: TEAL }}
                    >
                      Great Day!
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden mb-4 border border-stone-100">
                    <img
                      src="https://images.unsplash.com/photo-1558929996-da64ba858215?w=500&q=80"
                      alt="Max playing at daycare"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Meals", val: "2/2 Eaten", icon: Bone },
                      { label: "Walks", val: "3 Walks", icon: PawPrint },
                      { label: "Mood", val: "Tail Wags!", icon: Heart },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="text-center p-3 rounded-lg"
                        style={{ background: `${TEAL}08` }}
                      >
                        <s.icon
                          size={16}
                          weight="fill"
                          style={{ color: TEAL }}
                          className="mx-auto mb-1"
                        />
                        <p className="text-xs text-stone-400">{s.label}</p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: TEAL }}
                        >
                          {s.val}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed italic">
                    &ldquo;Max had a blast today! He played with his best buddy
                    Charlie in the big yard and got extra belly rubs during nap
                    time. Ate all his food and drank plenty of water. A+
                    pupper!&rdquo;
                  </p>
                </div>
              </ShimmerBorder>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          8. SAFETY & TRUST BADGES
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} color={CORAL} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Safety & Trust" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Your Pet&apos;s Safety Is Our Obsession
            </h2>
            <p className="text-stone-500 mt-4 max-w-lg mx-auto">
              We go above and beyond so you never have to worry. Every team
              member passes rigorous screening and training.
            </p>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${CORAL}, ${TEAL})`,
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={spring}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/70 border backdrop-blur-sm hover:shadow-md transition-shadow"
                style={{ borderColor: `${TEAL}15` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: i % 2 === 0 ? `${TEAL}12` : `${CORAL}12`,
                  }}
                >
                  <badge.icon
                    size={28}
                    weight="duotone"
                    style={{ color: i % 2 === 0 ? TEAL : CORAL }}
                  />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: DARK }}
                >
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          9. ABOUT MORGAN BAILEY
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        id="about"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=700&q=80"
                  alt="Happy Tails team with adorable pets"
                  className="w-full h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:bottom-6 md:-right-6">
                <div
                  className="px-5 py-3 rounded-xl shadow-lg text-white font-bold text-sm"
                  style={{ background: CORAL }}
                >
                  <Heart size={16} weight="fill" className="inline mr-1" />{" "}
                  10+ Years of Love
                </div>
              </div>
            </div>
            <div>
              <SectionTag text="About Us" />
              <h2
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6"
                style={{ color: DARK }}
              >
                Meet Morgan Bailey
              </h2>
              <p className="text-stone-500 leading-relaxed mb-4 text-lg">
                Happy Tails Pet Care was founded by Morgan Bailey, a Certified
                Professional Pet Sitter (CPPS) with over 10 years of experience
                and a deep passion for animals that started as a volunteer at
                the Seattle Humane Society.
              </p>
              <p className="text-stone-500 leading-relaxed mb-8">
                &ldquo;Every pet that walks through our doors becomes part of
                our family. We don&apos;t just watch your pets — we genuinely
                love them.&rdquo; Located at 3612 Greenwood Ave N in Seattle,
                Happy Tails has grown from a one-person dog walking service
                into the neighborhood&apos;s most trusted pet care facility.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: "CPPS Certified" },
                  { icon: Heart, label: "Pet-First Approach" },
                  { icon: Star, label: "4.9 Google Rating" },
                  { icon: CheckCircle, label: "Fully Insured" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="p-4 flex items-center gap-3 rounded-xl bg-white/80 border"
                    style={{ borderColor: `${TEAL}15` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${TEAL}12` }}
                    >
                      <badge.icon
                        size={20}
                        weight="duotone"
                        style={{ color: TEAL }}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: DARK }}
                    >
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          10. PHOTO GALLERY
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        id="gallery"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Happy Pets Gallery" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Smiles, Zoomies &amp; Belly Rubs
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${TEAL}, ${CORAL})`,
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={spring}
                className={`group relative rounded-2xl overflow-hidden shadow-md border-2 border-white ${i < 2 ? "md:row-span-2" : ""}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${i < 2 ? "h-64 md:h-full" : "h-48"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: `${TEAL}cc` }}
                  >
                    {img.alt}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          11. WHAT DOES YOUR PET NEED? QUIZ
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <SectionTag text="Interactive Quiz" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              <Question
                size={36}
                weight="duotone"
                className="inline mr-2"
                style={{ color: CORAL }}
              />
              What Does Your Pet Need?
            </h2>
          </div>
          <div className="space-y-4 mb-8">
            {quizOptions.map((opt, i) => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={i}
                  onClick={() => setQuizChoice(i)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl text-left border-2 transition-all cursor-pointer ${quizChoice === i ? "shadow-lg" : "shadow-sm"}`}
                  style={{
                    background: quizChoice === i ? `${opt.color}10` : "white",
                    borderColor: quizChoice === i ? opt.color : `${TEAL}15`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${opt.color}15` }}
                  >
                    <OptIcon
                      size={22}
                      weight="fill"
                      style={{ color: opt.color }}
                    />
                  </div>
                  <span
                    className="text-base font-semibold flex-1"
                    style={{ color: DARK }}
                  >
                    {opt.label}
                  </span>
                  {quizChoice === i && (
                    <CheckCircle
                      size={22}
                      weight="fill"
                      style={{ color: opt.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {quizChoice !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="p-6 rounded-2xl border-2 text-center"
                style={{
                  background: `${quizOptions[quizChoice].color}08`,
                  borderColor: `${quizOptions[quizChoice].color}30`,
                }}
              >
                <p className="text-stone-600 mb-4">
                  {quizOptions[quizChoice].rec}
                </p>
                <a
                  href="tel:+12065550844"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
                  style={{ background: TEAL }}
                >
                  <Phone size={16} weight="fill" /> Call (206) 555-0844
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          12. GOOGLE REVIEWS + TESTIMONIALS
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} color={CORAL} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Google Reviews Header */}
          <div className="text-center mb-4">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border shadow-sm mb-4"
              style={{ borderColor: `${TEAL}20` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={18}
                    weight="fill"
                    style={{ color: "#facc15" }}
                  />
                ))}
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: DARK }}
              >
                4.9
              </span>
              <span className="text-sm text-stone-400">
                from 287 Google reviews
              </span>
            </div>
          </div>
          <div className="text-center mb-16">
            <SectionTag text="Pet Parent Love" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              What Our Pet Families Say
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${CORAL}, ${TEAL})`,
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={spring}
                className="p-6 rounded-2xl bg-white/80 border backdrop-blur-sm"
                style={{ borderColor: `${TEAL}15` }}
              >
                <Quotes
                  size={28}
                  weight="fill"
                  style={{ color: CORAL }}
                  className="mb-3 opacity-50"
                />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      weight="fill"
                      style={{ color: "#facc15" }}
                    />
                  ))}
                </div>
                <p className="text-stone-600 leading-relaxed text-sm mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div
                  className="flex items-center gap-2 pt-3 border-t"
                  style={{ borderColor: `${TEAL}10` }}
                >
                  <CheckCircle
                    size={16}
                    weight="fill"
                    style={{ color: TEAL }}
                  />
                  <div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: DARK }}
                    >
                      {t.name}
                    </span>
                    <span className="text-xs text-stone-400 ml-2">
                      ({t.pet})
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 ml-auto">
                    Verified
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          13. COMPETITOR COMPARISON TABLE
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="Why Choose Us" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Happy Tails vs. The Competition
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${TEAL}, ${CORAL})`,
              }}
            />
          </div>
          <GlassCard className="overflow-hidden">
            <div
              className="grid grid-cols-3 text-center text-sm font-bold p-4 border-b"
              style={{
                borderColor: `${TEAL}10`,
                background: `${TEAL}08`,
              }}
            >
              <span className="text-stone-500">Feature</span>
              <span style={{ color: TEAL }}>Happy Tails</span>
              <span className="text-stone-400">Others</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 text-center text-sm p-4 items-center ${i < comparisonRows.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: `${TEAL}08` }}
              >
                <span className="text-stone-600 font-medium text-left">
                  {row.feature}
                </span>
                <span>
                  <CheckCircle
                    size={20}
                    weight="fill"
                    style={{ color: TEAL }}
                    className="mx-auto"
                  />
                </span>
                <span className="text-stone-400">{row.them}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          14. VIDEO TOUR PLACEHOLDER
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <SectionTag text="Virtual Tour" />
          <h2
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8"
            style={{ color: DARK }}
          >
            Take a Peek Inside Happy Tails
          </h2>
          <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-white group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1587764379873-97837921fd44?w=1200&q=80"
              alt="Tour the Happy Tails facility"
              className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: CORAL }}
              >
                <Play
                  size={36}
                  weight="fill"
                  className="text-white ml-1"
                />
              </motion.div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <span
                className="px-4 py-2 rounded-full text-sm font-bold text-white backdrop-blur-md"
                style={{ background: `${TEAL}cc` }}
              >
                Watch Our Facility Tour
              </span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          15. EMERGENCY / AVAILABILITY BANNER
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-12 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 100%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div
            className="rounded-2xl p-6 md:p-8 border flex flex-col md:flex-row items-center gap-6"
            style={{
              background: "white",
              borderColor: `${TEAL}20`,
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{ background: TEAL }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span
                className="text-lg font-bold"
                style={{ color: DARK }}
              >
                Same-Day Booking Available
              </span>
            </div>
            <div className="flex flex-wrap gap-6 md:ml-auto">
              {serviceAreaItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-sm"
                >
                  <item.icon
                    size={18}
                    weight="duotone"
                    style={{ color: TEAL }}
                  />
                  <div>
                    <span className="text-stone-400 text-xs block">
                      {item.label}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: DARK }}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          16. CERTIFICATIONS / PARTNER ROW
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, #f0fdf9 0%, ${BG} 100%)`,
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <p className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-6">
            Trusted Certifications &amp; Memberships
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {certPartners.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                style={{
                  color: TEAL,
                  borderColor: `${TEAL}25`,
                  background: "white",
                }}
              >
                <ShieldCheck size={16} weight="fill" /> {cert}
              </span>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          17. NEW CLIENT SPECIAL
          ════════════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${TEAL}, ${TEAL}dd, #0f766e)`,
          }}
        />
        <PawPattern opacity={0.06} color="white" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <PawPrint
            size={48}
            weight="fill"
            className="mx-auto mb-6 text-white/60"
          />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            New Client Special!
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            First-time visitors get a complimentary temperament assessment and
            20% off their first service. Your pet&apos;s happiness starts here!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+12065550844"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white font-bold text-lg hover:bg-white/90 transition-colors"
              style={{ color: TEAL }}
            >
              <Phone size={20} weight="fill" /> (206) 555-0844
            </a>
            <a
              href="mailto:woof@happytailspetcare.com"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 transition-colors"
            >
              <Envelope size={20} weight="fill" /> Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          18. FAQ
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <SectionTag text="FAQ" />
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: DARK }}
            >
              Common Questions
            </h2>
            <div
              className="h-1 w-16 mx-auto mt-4 rounded-full"
              style={{
                background: `linear-gradient(to right, ${TEAL}, ${CORAL})`,
              }}
            />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white/80 overflow-hidden"
                style={{ borderColor: `${TEAL}15` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left group cursor-pointer"
                >
                  <span
                    className="text-base font-semibold pr-4"
                    style={{ color: DARK }}
                  >
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={spring}
                  >
                    <CaretDown
                      size={20}
                      className="text-stone-400 shrink-0"
                    />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={spring}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 md:px-6 md:pb-6 text-stone-500 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          19. CONTACT
          ════════════════════════════════════════════════════════ */}
      <SectionReveal
        id="contact"
        className="relative py-24 md:py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #fef7f0 50%, ${BG} 100%)`,
          }}
        />
        <PawPattern opacity={0.02} color={CORAL} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionTag text="Get in Touch" />
              <h2
                className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6"
                style={{ color: DARK }}
              >
                Book Your Pet&apos;s Visit
              </h2>
              <p className="text-stone-500 leading-relaxed mb-8">
                Schedule a tour, book a service, or just say hi. We&apos;re
                always happy to talk about pets!
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    title: "Address",
                    text: "3612 Greenwood Ave N, Seattle, WA 98103",
                    link: "https://maps.google.com/?q=3612+Greenwood+Ave+N+Seattle+WA+98103",
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    text: "(206) 555-0844",
                    link: "tel:+12065550844",
                  },
                  {
                    icon: Envelope,
                    title: "Email",
                    text: "woof@happytailspetcare.com",
                    link: "mailto:woof@happytailspetcare.com",
                  },
                  {
                    icon: Clock,
                    title: "Hours",
                    text: "Mon-Sun 7AM-7PM",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${TEAL}12` }}
                    >
                      <item.icon
                        size={20}
                        weight="duotone"
                        style={{ color: TEAL }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: DARK }}
                      >
                        {item.title}
                      </p>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={
                            item.link.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            item.link.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-sm hover:underline"
                          style={{ color: TEAL }}
                        >
                          {item.text}
                        </a>
                      ) : (
                        <p className="text-sm text-stone-500">{item.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-2xl border bg-white/80 p-8 shadow-sm"
              style={{ borderColor: `${TEAL}15` }}
            >
              <h3
                className="text-xl font-semibold mb-6"
                style={{ color: DARK }}
              >
                Book an Appointment
              </h3>
              <form
                className="space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone-500 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm focus:outline-none"
                      style={{ borderColor: `${TEAL}20`, color: DARK }}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-500 mb-1.5">
                      Pet&apos;s Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm focus:outline-none"
                      style={{ borderColor: `${TEAL}20`, color: DARK }}
                      placeholder="Pet's name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-stone-500 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm focus:outline-none"
                    style={{ borderColor: `${TEAL}20`, color: DARK }}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-500 mb-1.5">
                    Service Needed
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm focus:outline-none"
                    style={{ borderColor: `${TEAL}20`, color: DARK }}
                  >
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.name} value={s.name.toLowerCase()}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-stone-500 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm focus:outline-none"
                    style={{ borderColor: `${TEAL}20`, color: DARK }}
                  />
                </div>
                <MagneticButton
                  className="w-full py-4 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: TEAL }}
                >
                  Book Now <ArrowRight size={18} weight="bold" />
                </MagneticButton>
              </form>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          20. HAPPY PET GUARANTEE
          ════════════════════════════════════════════════════════ */}
      <SectionReveal className="relative py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, #f0fdf9 100%)`,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <ShimmerBorder>
            <div className="p-8 md:p-12">
              <Heart
                size={48}
                weight="fill"
                style={{ color: CORAL }}
                className="mx-auto mb-4"
              />
              <h2
                className="text-2xl md:text-4xl font-extrabold mb-4"
                style={{ color: DARK }}
              >
                Our Happy Pet Guarantee
              </h2>
              <p className="text-stone-500 leading-relaxed max-w-2xl mx-auto text-lg mb-6">
                If your pet isn&apos;t happy, we&apos;re not happy. We
                guarantee a safe, fun, and loving experience for every furry,
                feathered, and fuzzy friend that comes through our doors.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Certified Staff",
                  "Pet First Aid",
                  "Daily Photo Updates",
                  "100% Satisfaction",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
                    style={{
                      color: TEAL,
                      borderColor: `${TEAL}30`,
                      background: `${TEAL}08`,
                    }}
                  >
                    <CheckCircle size={16} weight="fill" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </ShimmerBorder>
        </div>
      </SectionReveal>

      {/* ════════════════════════════════════════════════════════
          21. FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer
        className="relative border-t py-10 overflow-hidden"
        style={{
          borderColor: `${TEAL}10`,
          background: `linear-gradient(180deg, ${BG} 0%, #f5f0eb 100%)`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint
                  size={22}
                  weight="fill"
                  style={{ color: CORAL }}
                />
                <span
                  className="text-lg font-bold"
                  style={{ color: DARK }}
                >
                  Happy Tails Pet Care
                </span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Because every tail deserves to wag. Professional pet care
                delivered with love in the Greenwood neighborhood of Seattle,
                WA.
              </p>
            </div>
            <div>
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: DARK }}
              >
                Quick Links
              </h4>
              <div className="space-y-2">
                {[
                  "Services",
                  "Pricing",
                  "Gallery",
                  "About",
                  "Contact",
                ].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="block text-sm text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: DARK }}
              >
                Contact
              </h4>
              <div className="space-y-2 text-sm text-stone-500">
                <p>
                  <a
                    href="tel:+12065550844"
                    className="hover:underline"
                  >
                    (206) 555-0844
                  </a>
                </p>
                <p>
                  <a
                    href="mailto:woof@happytailspetcare.com"
                    className="hover:underline"
                  >
                    woof@happytailspetcare.com
                  </a>
                </p>
                <p>
                  <a
                    href="https://maps.google.com/?q=3612+Greenwood+Ave+N+Seattle+WA+98103"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    3612 Greenwood Ave N, Seattle, WA 98103
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div
            className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: `${TEAL}10` }}
          >
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <PawPrint
                size={14}
                weight="fill"
                style={{ color: CORAL }}
              />
              <span>
                Happy Tails Pet Care &copy; {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-500"><path d="M24.3 4.2c-1.5-.4-3.2.1-4.5 1.1-1-.7-2.3-1-3.5-.8-2.4.4-4.2 2.5-4.2 4.9v.6c-3.2.8-6 2.8-7.8 5.6-.3.5-.1 1.1.4 1.4.5.3 1.1.1 1.4-.4 1.5-2.3 3.7-4 6.3-4.7.5-.1 1-.1 1.5 0 .8.2 1.4.8 1.7 1.5.3.8.2 1.6-.2 2.3l-2.8 4.3c-.6.9-.4 2.1.4 2.8l2.5 2.1c.4.3.8.5 1.3.5h5.2c.5 0 1-.2 1.3-.5l1.2-1c.6-.5.8-1.3.6-2l-1-3.2c-.2-.5 0-1.1.4-1.4l3.8-2.5c1.3-.9 2.1-2.3 2.1-3.9V9.6c0-2.5-1.7-4.7-4.1-5.3v-.1z" fill="currentColor"/></svg>Created by{" "}
                <a
                  href="https://bluejayportfolio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  bluejayportfolio.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
