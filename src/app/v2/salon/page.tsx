"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Scissors,
  PaintBrush,
  Sparkle,
  Drop,
  Flower,
  Heart,
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowRight,
  Star,
  InstagramLogo,
  Clock,
  CalendarBlank,
  User,
} from "@phosphor-icons/react";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 200, damping: 25 };

/* ─── stagger ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};
const letterReveal = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: spring },
};
const sectionStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── morphing blob ─── */
function MorphingBlob() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.6">
              <animate attributeName="stop-color" values="#e11d48;#fb7185;#fda4af;#e11d48" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0.3">
              <animate attributeName="stop-color" values="#fda4af;#e11d48;#fb7185;#fda4af" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="blobBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <motion.path
          fill="url(#blobGrad)"
          filter="url(#blobBlur)"
          animate={{
            d: [
              "M200,50 C300,50 370,120 360,200 C350,300 280,370 200,360 C100,350 40,280 50,200 C60,100 120,50 200,50Z",
              "M200,60 C280,40 380,130 350,210 C320,310 260,380 180,350 C80,320 30,250 60,180 C90,90 140,70 200,60Z",
              "M210,55 C310,70 360,150 340,230 C310,330 240,370 170,340 C70,300 50,220 80,160 C110,80 150,45 210,55Z",
              "M200,50 C300,50 370,120 360,200 C350,300 280,370 200,360 C100,350 40,280 50,200 C60,100 120,50 200,50Z",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      {/* inner glow */}
      <div className="absolute inset-12 rounded-full bg-rose-500/10 blur-3xl" />
    </div>
  );
}

/* ─── flowing gradient background ─── */
function FlowingGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.06) 0%, transparent 60%)",
            "radial-gradient(ellipse at 60% 50%, rgba(251,113,133,0.06) 0%, transparent 60%)",
            "radial-gradient(ellipse at 40% 60%, rgba(253,164,175,0.05) 0%, transparent 60%)",
            "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.06) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── magnetic spring button ─── */
function SpringButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springFast);
  const sy = useSpring(y, springFast);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || isTouchDevice) return;
      const rect = el.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
    },
    [x, y, isTouchDevice]
  );

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
      <motion.div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

/* ─── gallery item with hover zoom/blur ─── */
function GalleryItem({
  title,
  category,
  height,
  delay,
}: {
  title: string;
  category: string;
  height: string;
  delay: number;
}) {
  const gradients = [
    "from-rose-900/80 to-stone-900/80",
    "from-pink-900/80 to-stone-800/80",
    "from-red-900/60 to-stone-900/80",
    "from-rose-800/60 to-neutral-900/80",
  ];
  const grad = gradients[delay % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...spring, delay: delay * 0.1 }}
      className={`relative ${height} rounded-2xl overflow-hidden cursor-pointer group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
      {/* shimmer pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <pattern id={`pat-${delay}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(225,29,72,0.3)" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pat-${delay})`} />
        </svg>
      </div>
      {/* hover overlay */}
      <motion.div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all duration-500 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <p className="text-white font-bold text-lg">{title}</p>
          <p className="text-rose-300 text-sm mt-1">{category}</p>
        </motion.div>
      </motion.div>
      {/* zoom effect on the bg */}
      <motion.div
        className="absolute inset-0 scale-100 group-hover:scale-110 transition-transform duration-700"
      />
    </motion.div>
  );
}

/* ─── services data ─── */
const serviceCategories = [
  {
    title: "Hair",
    items: [
      { name: "Precision Cut & Style", price: "$85+", time: "60 min" },
      { name: "Color & Highlights", price: "$150+", time: "120 min" },
      { name: "Balayage", price: "$200+", time: "150 min" },
      { name: "Blowout & Styling", price: "$55+", time: "45 min" },
    ],
  },
  {
    title: "Skin",
    items: [
      { name: "Hydrating Facial", price: "$120+", time: "60 min" },
      { name: "Microdermabrasion", price: "$150+", time: "45 min" },
      { name: "Chemical Peel", price: "$180+", time: "30 min" },
      { name: "LED Light Therapy", price: "$90+", time: "30 min" },
    ],
  },
  {
    title: "Nails",
    items: [
      { name: "Gel Manicure", price: "$55+", time: "45 min" },
      { name: "Spa Pedicure", price: "$70+", time: "60 min" },
      { name: "Nail Art Design", price: "$30+", time: "30 min" },
      { name: "Dip Powder Set", price: "$65+", time: "60 min" },
    ],
  },
];

/* ─── team data ─── */
const team = [
  { name: "Aria Laurent", role: "Creative Director", specialty: "Color Specialist" },
  { name: "Maya Chen", role: "Senior Stylist", specialty: "Balayage Expert" },
  { name: "Sofia Reyes", role: "Esthetician", specialty: "Advanced Skincare" },
  { name: "Lena Park", role: "Nail Artist", specialty: "3D Nail Art" },
];

/* ─── gallery data ─── */
const gallery = [
  { title: "Platinum Waves", category: "Hair", height: "h-72" },
  { title: "Bridal Updo", category: "Special Event", height: "h-96" },
  { title: "Rose Balayage", category: "Color", height: "h-80" },
  { title: "Gel Art Collection", category: "Nails", height: "h-64" },
  { title: "Radiance Facial", category: "Skin", height: "h-88" },
  { title: "Copper Highlights", category: "Color", height: "h-72" },
];

/* ═══════ MAIN PAGE ═══════ */
export default function V2SalonPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const heroText = "Where Art Meets Beauty";
  const letters = heroText.split("");

  return (
    <div className="min-h-[100dvh] bg-[#1c1917] text-stone-100 overflow-x-hidden">
      <FlowingGradient />

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative min-h-[100dvh] z-10">
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[100dvh] max-w-7xl mx-auto px-4 md:px-6"
        >
          {/* left — letter-by-letter reveal */}
          <div className="flex flex-col justify-center py-24 lg:py-0">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-wrap"
            >
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  variants={letterReveal}
                  className={`text-3xl md:text-7xl lg:text-8xl tracking-tighter leading-none font-bold ${
                    letter === " " ? "mr-3 md:mr-5" : ""
                  } ${
                    i >= heroText.indexOf("Beauty")
                      ? "text-rose-500"
                      : "text-white"
                  }`}
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 1.2 }}
              className="mt-8 text-lg text-stone-400 max-w-md leading-relaxed"
            >
              An elevated salon experience where every detail is curated for
              your transformation. Artistry, precision, and care in every touch.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 1.4 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <SpringButton className="px-8 py-4 bg-rose-600 text-white font-semibold rounded-xl">
                <span className="relative z-10 flex items-center gap-2">
                  Book Appointment <CalendarBlank weight="bold" size={18} />
                </span>
              </SpringButton>
              <SpringButton className="px-8 py-4 border border-stone-700 text-stone-300 rounded-xl hover:border-rose-500/50 transition-colors">
                <span className="relative z-10 flex items-center gap-2">
                  <Phone weight="bold" size={18} /> (555) 891-2345
                </span>
              </SpringButton>
            </motion.div>
          </div>

          {/* right — morphing blob — hidden on mobile */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.5 }}
              className="w-full max-w-lg"
            >
              <MorphingBlob />
            </motion.div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1c1917] to-transparent z-20" />
      </section>

      {/* ══════ SERVICE MENU — Editorial Layout ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={sectionStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-rose-400 text-sm font-semibold uppercase tracking-widest">
              Service Menu
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              Curated <span className="text-rose-500">Services</span>
            </motion.h2>
          </motion.div>

          {/* asymmetric editorial columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {serviceCategories.map((cat, ci) => {
              const colSpan =
                ci === 0 ? "lg:col-span-5" : ci === 1 ? "lg:col-span-4" : "lg:col-span-3";
              return (
                <motion.div
                  key={cat.title}
                  className={colSpan}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: ci * 0.05 }}
                >
                  <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] h-full">
                    <div className="flex items-center gap-3 mb-8">
                      {ci === 0 ? (
                        <Scissors size={28} weight="duotone" className="text-rose-400" />
                      ) : ci === 1 ? (
                        <Sparkle size={28} weight="duotone" className="text-rose-400" />
                      ) : (
                        <PaintBrush size={28} weight="duotone" className="text-rose-400" />
                      )}
                      <h3 className="text-2xl font-bold tracking-tight">{cat.title}</h3>
                    </div>
                    <div className="space-y-0">
                      {cat.items.map((item, ii) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ ...spring, delay: ci * 0.1 + ii * 0.06 }}
                          className="py-4 border-b border-white/5 last:border-0 group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-stone-200 group-hover:text-rose-300 transition-colors">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                                <Clock size={12} weight="bold" />
                                <span>{item.time}</span>
                              </div>
                            </div>
                            <span className="text-rose-400 font-semibold text-lg whitespace-nowrap">
                              {item.price}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════ TEAM ══════ */}
      <section className="relative z-10 py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={sectionStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-rose-400 text-sm font-semibold uppercase tracking-widest">
              Our Artists
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              Meet the <span className="text-rose-500">Team</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ GALLERY ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={sectionStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-rose-400 text-sm font-semibold uppercase tracking-widest">
              Portfolio
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              Our <span className="text-rose-500">Gallery</span>
            </motion.h2>
          </motion.div>

          {/* masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {gallery.map((item, i) => (
              <GalleryItem
                key={item.title}
                title={item.title}
                category={item.category}
                height={item.height}
                delay={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            variants={sectionStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="text-rose-400 text-sm font-semibold uppercase tracking-widest">
              Reviews
            </motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
              What Clients <span className="text-rose-500">Say</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Emily Watson",
                text: "Absolutely transformed my hair. The balayage is flawless and exactly what I envisioned. The studio atmosphere is incredible.",
                rating: 5,
              },
              {
                name: "Jessica Park",
                text: "Best facial I have ever had. My skin is glowing weeks later. The team here truly understands skincare at a professional level.",
                rating: 5,
              },
              {
                name: "Rachel Green",
                text: "Their nail art is next-level. I get compliments constantly. Worth every penny for the artistry and lasting quality.",
                rating: 5,
              },
              {
                name: "Aisha Khan",
                text: "From the moment you walk in, you feel pampered. Every detail is thought through. This is my forever salon.",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="h-full p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={16} weight="fill" className="text-rose-400" />
                    ))}
                  </div>
                  <p className="text-stone-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <p className="font-semibold text-white">{t.name}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ BOOKING CTA ══════ */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest">
                Book Now
              </p>
              <h2 className="mt-3 text-4xl md:text-6xl tracking-tighter leading-none font-bold">
                Your <span className="text-rose-500">Transformation</span> Awaits
              </h2>
              <p className="mt-6 text-stone-400 max-w-md leading-relaxed">
                Reserve your appointment and step into a world of elevated
                beauty. New clients receive a complimentary consultation.
              </p>
              <div className="mt-10 space-y-6">
                {[
                  { icon: Phone, text: "(555) 891-2345" },
                  { icon: EnvelopeSimple, text: "hello@luxestudio.com" },
                  { icon: MapPin, text: "48 Rose Avenue, Suite 12" },
                  { icon: Clock, text: "Tue - Sat: 9AM - 7PM" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-4 text-stone-300">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={22} weight="duotone" className="text-rose-400" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right — booking form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={spring}
            >
              <div className="p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="space-y-5">
                  {[
                    { label: "Full Name", type: "text", placeholder: "Your name" },
                    { label: "Email", type: "email", placeholder: "you@email.com" },
                    { label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm font-medium text-stone-300 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-stone-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Service
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-stone-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all appearance-none">
                      <option value="">Select a service</option>
                      <option value="cut">Precision Cut & Style</option>
                      <option value="color">Color & Highlights</option>
                      <option value="balayage">Balayage</option>
                      <option value="facial">Hydrating Facial</option>
                      <option value="nails">Gel Manicure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-stone-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 outline-none transition-all"
                    />
                  </div>
                  <SpringButton className="w-full px-8 py-4 bg-rose-600 text-white font-semibold rounded-xl mt-2">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Your Visit <ArrowRight weight="bold" size={18} />
                    </span>
                  </SpringButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="relative z-10 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scissors size={24} weight="duotone" className="text-rose-400" />
            <span className="font-bold text-lg tracking-tight">Luxe Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-stone-500 hover:text-rose-400 transition-colors">
              <InstagramLogo size={22} weight="bold" />
            </a>
          </div>
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Luxe Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Team Card (with parallax on scroll) ─── */
function TeamCard({
  member,
  index,
}: {
  member: { name: string; role: string; specialty: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const bgColors = [
    "from-rose-900/40 to-stone-900",
    "from-pink-900/40 to-stone-900",
    "from-red-900/30 to-stone-900",
    "from-rose-800/30 to-neutral-900",
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...spring, delay: index * 0.05 }}
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={spring}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden"
      >
        {/* photo placeholder with parallax */}
        <motion.div
          style={{ y }}
          className={`h-64 bg-gradient-to-br ${bgColors[index]} flex items-center justify-center`}
        >
          <User size={64} weight="thin" className="text-rose-300/30" />
        </motion.div>
        <div className="p-6">
          <h3 className="font-bold text-lg">{member.name}</h3>
          <p className="text-rose-400 text-sm font-medium">{member.role}</p>
          <p className="text-stone-500 text-xs mt-1">{member.specialty}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
