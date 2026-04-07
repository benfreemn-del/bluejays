"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const SpineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v2m0 4v2m0 4v2m0 4v2" strokeLinecap="round" />
    <path d="M8 4h8M9 8h6M8 12h8M9 16h6M8 20h8" strokeLinecap="round" />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const HandsHealingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M7 11c-1.5 0-3 1-3 3s1 3 3 3h2l3 2 3-2h2c2 0 3-1 3-3s-1.5-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11V7a2 2 0 014 0v4" strokeLinecap="round" />
    <path d="M7 11V9a1 1 0 012 0" strokeLinecap="round" />
    <path d="M15 11V9a1 1 0 012 0v2" strokeLinecap="round" />
  </svg>
);

const BodyAlignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v4m-3 2l3-2 3 2m-6 0v4l-1 4m4-8v4l1 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 12h2m12 0h2" strokeLinecap="round" strokeDasharray="2 2" />
    <path d="M12 2v20" strokeDasharray="1 3" opacity="0.3" />
  </svg>
);

const JointIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9V4m0 16v-5" strokeLinecap="round" />
    <path d="M9.5 10L5 7m14 10l-4.5-3" strokeLinecap="round" />
    <path d="M14.5 10L19 7M5 17l4.5-3" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.25 3.75 3.25 1.75C7 13.5 8 12.5 10 11.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldHeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 16s-3-2.5-3-4.5a2 2 0 014 0 2 2 0 012 0c0 2-3 4.5-3 4.5z" fill="currentColor" stroke="none" opacity="0.3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="chiroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#chiroGrid)" />
  </svg>
);

/* ───────────────────────── Spine Background SVG ───────────────────────── */

const SpineBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 400 800">
    {/* Stylized spine silhouette */}
    <path d="M200 50 Q210 100 200 150 Q190 200 200 250 Q210 300 200 350 Q190 400 200 450 Q210 500 200 550 Q190 600 200 650 Q210 700 200 750" stroke="#14b8a6" strokeWidth="2" fill="none" />
    {/* Vertebrae */}
    {[100, 175, 250, 325, 400, 475, 550, 625, 700].map((y) => (
      <ellipse key={y} cx="200" cy={y} rx="25" ry="8" stroke="#14b8a6" strokeWidth="0.8" fill="none" />
    ))}
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Spinal Adjustments",
    desc: "Precise, manual chiropractic adjustments to restore proper alignment and eliminate nerve interference for lasting relief.",
    icon: <SpineIcon />,
    tags: ["Manual Adjustment", "Diversified Technique", "Drop Table"],
  },
  {
    name: "Sports Injury Rehab",
    desc: "Comprehensive rehabilitation protocols that get athletes back to peak performance faster and stronger than before.",
    icon: <JointIcon />,
    tags: ["Athletic Recovery", "Performance", "Prevention"],
  },
  {
    name: "Massage Therapy",
    desc: "Deep tissue and therapeutic massage integrated with chiropractic care to accelerate healing and reduce muscle tension.",
    icon: <HandsHealingIcon />,
    tags: ["Deep Tissue", "Trigger Point", "Myofascial"],
  },
  {
    name: "Posture Correction",
    desc: "Advanced postural analysis and corrective programs to reverse years of damage from desk work and poor habits.",
    icon: <BodyAlignIcon />,
    tags: ["Digital X-Ray", "Posture Analysis", "Ergonomics"],
  },
  {
    name: "Prenatal Chiropractic",
    desc: "Gentle, specialized care for expecting mothers to reduce back pain, improve comfort, and support a healthier pregnancy.",
    icon: <ShieldHeartIcon />,
    tags: ["Webster Technique", "Pregnancy Care", "Pelvic Balance"],
  },
  {
    name: "Holistic Wellness",
    desc: "Nutrition counseling, lifestyle coaching, and preventive care plans designed to optimize your total body wellness.",
    icon: <LeafIcon />,
    tags: ["Nutrition", "Lifestyle", "Prevention"],
  },
];

const teamMembers = [
  {
    name: "Dr. Sarah Mitchell, DC",
    title: "Clinic Director",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    specialties: ["Spinal Rehabilitation", "Sports Injuries"],
    yearsExp: 16,
  },
  {
    name: "Dr. James Park, DC",
    title: "Associate Chiropractor",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    specialties: ["Prenatal Care", "Pediatric"],
    yearsExp: 11,
  },
  {
    name: "Dr. Emily Torres, DC",
    title: "Wellness Specialist",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964dc31?w=400&q=80",
    specialties: ["Holistic Wellness", "Nutrition"],
    yearsExp: 9,
  },
];

const testimonials = [
  {
    name: "Karen S.",
    text: "After years of chronic back pain, Dr. Mitchell gave me my life back. I can finally play with my kids without wincing. The entire team is phenomenal.",
    condition: "Chronic Back Pain",
    rating: 5,
  },
  {
    name: "David R.",
    text: "Tore my rotator cuff playing baseball. Their rehab program had me back on the field in half the time my surgeon predicted. Incredible results.",
    condition: "Sports Injury",
    rating: 5,
  },
  {
    name: "Michelle T.",
    text: "Prenatal care here was a game-changer. My pregnancy was so much more comfortable and my delivery went smoother than my first. Cannot recommend enough.",
    condition: "Prenatal Care",
    rating: 5,
  },
];

const conditions = [
  "Back Pain", "Neck Pain", "Sciatica", "Headaches & Migraines",
  "Herniated Discs", "Whiplash", "Scoliosis", "Carpal Tunnel",
  "TMJ Disorders", "Shoulder Pain", "Hip Pain", "Knee Pain",
  "Plantar Fasciitis", "Fibromyalgia", "Arthritis", "Pinched Nerves",
];

const faqs = [
  {
    q: "Does chiropractic care hurt?",
    a: "Most patients feel immediate relief after an adjustment. You may hear a popping sound, which is simply gas releasing from the joint. Our doctors use gentle techniques tailored to your comfort level.",
  },
  {
    q: "Do I need a referral to see a chiropractor?",
    a: "No referral is needed. You can schedule directly with us. We accept most insurance plans and offer affordable self-pay options for those without coverage.",
  },
  {
    q: "How many sessions will I need?",
    a: "Every patient is unique. After your initial exam and X-rays, we will create a personalized treatment plan. Some patients find relief in just a few visits, while others benefit from ongoing wellness care.",
  },
  {
    q: "Is chiropractic care safe for children?",
    a: "Absolutely. Pediatric chiropractic uses extremely gentle techniques appropriate for children of all ages. Many parents bring their kids in for wellness checkups, sports injuries, and growing pains.",
  },
  {
    q: "What should I expect at my first visit?",
    a: "Your first visit includes a comprehensive health history, physical exam, digital X-rays if needed, and your first adjustment. Plan for about 60 minutes so we can thoroughly understand your condition.",
  },
];

/* ───────────────────────── Section Header Component ───────────────────────── */

function SectionHeader({
  tag,
  title,
  highlightWord,
  subtitle,
  center = true,
}: {
  tag: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  center?: boolean;
}) {
  const parts = title.split(highlightWord);
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <motion.span
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-block text-[#14b8a6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#14b8a6]/20 bg-[#14b8a6]/5"
      >
        {tag}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-extrabold tracking-tight"
      >
        {parts[0]}
        <span className="text-[#14b8a6]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#14b8a6] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
      />
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-muted mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function ChiropracticTemplate() {
  return (
    <TemplateLayout
      businessName="Evergreen Chiropractic"
      tagline="Natural healing for lasting pain relief. Trusted by Issaquah families for over 15 years."
      accentColor="#14b8a6"
      accentColorLight="#2dd4bf"
      heroGradient="linear-gradient(135deg, #0a1f1c 0%, #0d1117 100%)"
      heroImage="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1400&q=80"
      phone="(425) 555-0107"
      address="321 Front St N, Issaquah, WA 98027"
    >
      {/* ════════════════ Wellness Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#14b8a6] via-[#0d9488] to-[#14b8a6] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <SpineIcon />
            <p className="text-sm font-bold tracking-wide">HEALING &mdash; WELLNESS &mdash; NATURAL PAIN RELIEF</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold tracking-wider">ACCEPTING NEW PATIENTS: (425) 555-0107</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a0f0e] border-b border-[#14b8a6]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#14b8a6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15,000+", label: "Patients Treated", icon: <CheckCircleIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
              { value: "3", label: "Doctors on Staff", icon: <SpineIcon /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[#14b8a6]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080d0c 0%, #0a1210 50%, #080d0c 100%)" }}
      >
        <GridPattern />
        <SpineBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#14b8a6]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#14b8a6]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Chiropractic Services"
            highlightWord="Services"
            subtitle="Comprehensive chiropractic care rooted in evidence-based techniques and a genuine commitment to your total wellness."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#14b8a6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#14b8a615,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6] group-hover:bg-[#14b8a6]/20 group-hover:border-[#14b8a6]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#14b8a6]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#14b8a6] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#14b8a6]/70 bg-[#14b8a6]/8 border border-[#14b8a6]/10 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Patient Comfort ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0c1614 50%, #0a1210 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#14b8a6]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#14b8a6]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Stack */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                {/* Main image */}
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80"
                    alt="Chiropractic treatment room"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80"
                    alt="Patient consultation"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#14b8a6] rounded-2xl px-5 py-4 shadow-xl shadow-[#14b8a6]/20 border border-[#2dd4bf]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Drug-Free<br />Healing</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#14b8a6]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#14b8a6]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="YOUR COMFORT MATTERS"
                title="Patient-First Approach"
                highlightWord="Patient-First"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Evergreen Chiropractic, we believe healing starts with trust. Every treatment plan is built around your unique needs, comfort level, and wellness goals.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Our modern Issaquah clinic features state-of-the-art digital X-ray, private treatment rooms, and a warm, welcoming environment designed to put you at ease from the moment you walk in.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <SpineIcon />, title: "Gentle Techniques", desc: "Multiple adjustment methods so we can match your comfort level" },
                  { icon: <HandsHealingIcon />, title: "Personalized Plans", desc: "Custom treatment protocols built around your body and goals" },
                  { icon: <LeafIcon />, title: "Natural Healing", desc: "Drug-free, non-invasive care that works with your body, not against it" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#14b8a6]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6] shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-0.5">{feature.title}</h4>
                      <p className="text-muted text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080d0c 0%, #0a100f 50%, #080d0c 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#14b8a6]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR DOCTORS"
            title="Meet Your Care Team"
            highlightWord="Care Team"
            subtitle="Board-certified doctors of chiropractic dedicated to helping you live without pain."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#14b8a6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d0c] via-[#080d0c]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#14b8a6]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#2dd4bf]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#14b8a6] text-sm font-semibold mb-3">{member.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((s) => (
                        <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0c1614 50%, #0a1210 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#14b8a6]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#14b8a6" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#14b8a6" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PATIENT STORIES"
            title="Real Patients, Real Results"
            highlightWord="Real Results"
            subtitle="Hear from patients who found lasting relief through our natural, hands-on approach to healing."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#14b8a6]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#14b8a6]/40 via-[#14b8a6]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#14b8a610,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Condition tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14b8a6]/70 bg-[#14b8a6]/8 border border-[#14b8a6]/10 px-2.5 py-1 rounded-full">
                    {t.condition}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#14b8a6] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14b8a6]/30 to-[#14b8a6]/10 flex items-center justify-center text-sm font-bold text-[#14b8a6]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Patient</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Conditions Treated ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080d0c 0%, #0a100f 50%, #080d0c 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#14b8a6]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CONDITIONS WE TREAT"
            title="Comprehensive Pain Relief"
            highlightWord="Pain Relief"
            subtitle="From acute injuries to chronic conditions, we have the expertise to help you heal naturally."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conditions.map((condition, i) => (
              <motion.div
                key={condition}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-[#14b8a6]/30 bg-white/[0.02] transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-[#14b8a6]/40 group-hover:bg-[#14b8a6] transition-colors duration-300 shrink-0" />
                <span className="text-sm font-medium text-muted group-hover:text-white transition-colors duration-300">{condition}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0c1614 50%, #0a1210 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#14b8a6]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#14b8a6]/4" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="COMMON QUESTIONS"
            title="Frequently Asked Questions"
            highlightWord="Questions"
          />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#14b8a6]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#14b8a610,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#14b8a6] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ New Patient Offer ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#14b8a6]/10 to-[#080d0c]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#14b8a6" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#14b8a6]/20 relative overflow-hidden bg-gradient-to-b from-[#14b8a6]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#14b8a615,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#14b8a6]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#14b8a6]/30 rounded-br-2xl" />
            <div className="relative z-10 text-center">
              <span className="inline-flex items-center gap-2 bg-[#14b8a6]/10 text-[#14b8a6] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#14b8a6]/20">
                <LeafIcon />
                NEW PATIENT SPECIAL
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                Complete Exam + X-Rays for <span className="text-[#14b8a6]">$49</span>
              </h2>
              <p className="text-muted max-w-lg mx-auto mb-6">
                New patients receive a comprehensive consultation, full spinal examination, digital X-rays, and a personalized treatment plan &mdash; all for just $49 (a $350 value).
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted mb-8">
                {["Full Spinal Exam", "Digital X-Rays", "Treatment Plan", "Doctor Consultation"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircleIcon />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="tel:4255550107"
                className="inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold text-lg items-center justify-center hover:from-[#2dd4bf] hover:to-[#14b8a6] transition-all duration-300 shadow-lg shadow-[#14b8a6]/20 gap-2"
              >
                <PhoneIcon />
                <span>Call to Schedule: (425) 555-0107</span>
              </a>
              <p className="text-white/30 text-xs mt-4">Limited time offer. New patients only. Insurance accepted.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#14b8a6]/10 via-[#14b8a6]/5 to-[#080d0c]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#14b8a6]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#14b8a6] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#14b8a6]/20 bg-[#14b8a6]/5">
              START HEALING TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Free <span className="text-[#14b8a6]">Consultation</span> &mdash; No Obligation
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Take the first step toward a pain-free life. Our doctors will evaluate your condition and recommend a treatment plan tailored to your needs &mdash; absolutely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold items-center justify-center text-lg hover:from-[#2dd4bf] hover:to-[#14b8a6] transition-all duration-300 shadow-lg shadow-[#14b8a6]/25 gap-2"
              >
                <span>Book Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550107"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#14b8a6]/30 text-[#14b8a6] font-bold items-center justify-center text-lg hover:bg-[#14b8a6]/10 hover:border-[#14b8a6]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0107</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
