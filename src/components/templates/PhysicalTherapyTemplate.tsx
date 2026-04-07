"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const BodyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v4m0 0l-3 8m3-8l3 8m-6-6h6" />
  </svg>
);

const JointIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
    <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
  </svg>
);

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M6.5 6.5a2 2 0 00-2 2v7a2 2 0 002 2M17.5 6.5a2 2 0 012 2v7a2 2 0 01-2 2M6.5 12h11M3 9v6m18-6v6" />
  </svg>
);

const HandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M18 11V6a1 1 0 00-2 0v4m0-5a1 1 0 00-2 0v5m0-4a1 1 0 00-2 0v5m0-2a1 1 0 00-2 0v4l-1.3-1.7a1.5 1.5 0 00-2.4 1.8L10 19a4 4 0 004 4h2a4 4 0 004-4v-8" />
  </svg>
);

const SpineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v20" />
    <ellipse cx="12" cy="5" rx="3" ry="1.5" />
    <ellipse cx="12" cy="9" rx="3.5" ry="1.5" />
    <ellipse cx="12" cy="13" rx="3.5" ry="1.5" />
    <ellipse cx="12" cy="17" rx="3" ry="1.5" />
    <ellipse cx="12" cy="21" rx="2" ry="1" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="ptGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2dd4bf" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#ptGrid)" />
  </svg>
);

/* ───────────────────────── Body Silhouette Pattern ───────────────────────── */

const BodySilhouettePattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 600">
    {/* Abstract body outlines */}
    <circle cx="400" cy="80" r="30" stroke="#2dd4bf" strokeWidth="0.5" fill="none" />
    <path d="M400 110v80M370 140h60M380 190l-20 100M420 190l20 100" stroke="#2dd4bf" strokeWidth="0.5" fill="none" />
    {/* Spine curves */}
    <path d="M200 100 Q220 200 200 300 Q180 400 200 500" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
    <path d="M600 100 Q580 200 600 300 Q620 400 600 500" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
    {/* Joint circles */}
    <circle cx="150" cy="250" r="20" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
    <circle cx="650" cy="350" r="20" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
    <circle cx="300" cy="450" r="15" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
    <circle cx="500" cy="150" r="15" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const specialties = [
  {
    name: "Sports Rehabilitation",
    desc: "Return to peak performance after sports injuries. Customized programs for athletes at every level with sport-specific recovery protocols.",
    icon: <DumbbellIcon />,
    tags: ["ACL Recovery", "Rotator Cuff", "Concussion Rehab"],
  },
  {
    name: "Post-Surgical Recovery",
    desc: "Accelerate healing after surgery with evidence-based rehabilitation. We partner directly with your surgeon for seamless recovery.",
    icon: <HeartIcon />,
    tags: ["Joint Replacement", "Spinal Surgery", "Arthroscopy"],
  },
  {
    name: "Back & Neck Pain",
    desc: "Eliminate chronic back and neck pain at the source. Manual therapy, targeted exercises, and postural correction for lasting relief.",
    icon: <SpineIcon />,
    tags: ["Disc Herniation", "Sciatica", "Whiplash"],
  },
  {
    name: "Joint Replacement Rehab",
    desc: "Specialized protocols for hip, knee, and shoulder replacements. Regain full range of motion and return to the activities you love.",
    icon: <JointIcon />,
    tags: ["Hip Replacement", "Knee Replacement", "Shoulder"],
  },
  {
    name: "Balance & Fall Prevention",
    desc: "Advanced vestibular therapy and balance training to reduce fall risk. Especially effective for seniors and post-stroke patients.",
    icon: <BodyIcon />,
    tags: ["Vestibular", "Gait Training", "Senior Mobility"],
  },
  {
    name: "Workers Compensation",
    desc: "Get back to work safely and quickly. We handle all workers comp documentation and design return-to-work programs.",
    icon: <HandIcon />,
    tags: ["Work Injury", "Ergonomic Eval", "Return-to-Work"],
  },
];

const therapists = [
  {
    name: "Dr. Sarah Mitchell, DPT",
    title: "Clinic Director",
    image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&q=80",
    specialties: ["Sports Rehab", "Post-Surgical"],
    yearsExp: 16,
  },
  {
    name: "Dr. James Park, DPT",
    title: "Senior Therapist",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    specialties: ["Spine", "Manual Therapy"],
    yearsExp: 12,
  },
  {
    name: "Dr. Elena Vasquez, DPT",
    title: "Balance Specialist",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80",
    specialties: ["Vestibular", "Geriatrics"],
    yearsExp: 9,
  },
];

const conditions = [
  "Rotator Cuff Tears", "ACL / MCL Injuries", "Herniated Discs",
  "Plantar Fasciitis", "Carpal Tunnel", "Frozen Shoulder",
  "Tennis / Golfer Elbow", "Post-Stroke Recovery", "Sciatica",
  "Arthritis Management", "TMJ Disorders", "Scoliosis",
];

const insuranceProviders = [
  "Premera Blue Cross", "Regence", "Aetna", "Cigna",
  "UnitedHealthcare", "Kaiser Permanente", "Molina",
  "Medicare", "L&I / Workers Comp",
];

const testimonials = [
  {
    name: "Michael R.",
    text: "After my knee replacement, I was terrified I would never run again. Summit had me jogging in four months. These therapists are miracle workers.",
    caseType: "Joint Replacement",
    rating: 5,
  },
  {
    name: "Sarah T.",
    text: "Chronic back pain ruled my life for years. Dr. Mitchell and her team found the root cause and gave me my life back. I cannot thank them enough.",
    caseType: "Back & Neck Pain",
    rating: 5,
  },
  {
    name: "David K.",
    text: "Tore my ACL playing soccer. Summit got me back on the field stronger than before. Their sports rehab program is the best in Bellevue, hands down.",
    caseType: "Sports Rehab",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Do I need a referral to start physical therapy?",
    a: "In Washington State, you can access physical therapy through direct access without a physician referral. However, some insurance plans may require one for coverage. We will verify your benefits before your first visit.",
  },
  {
    q: "How long is a typical treatment session?",
    a: "Most sessions are 45 to 60 minutes of one-on-one time with your therapist. Your first evaluation appointment is typically 60 minutes to allow for a thorough assessment.",
  },
  {
    q: "How many sessions will I need?",
    a: "Every patient is different. Most conditions see significant improvement within 6 to 12 sessions. We will create a personalized plan with clear goals and milestones during your first visit.",
  },
  {
    q: "What should I wear to my appointment?",
    a: "Wear comfortable, loose-fitting clothing that allows easy movement. Athletic wear is ideal. If we are treating a specific joint, wear clothing that allows easy access to that area.",
  },
  {
    q: "Do you accept my insurance?",
    a: "We accept most major insurance plans including Premera, Regence, Aetna, Cigna, UnitedHealthcare, Kaiser, Medicare, and L&I Workers Comp. Contact us and we will verify your coverage at no charge.",
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
        className="inline-block text-[#2dd4bf] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/5"
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
        <span className="text-[#2dd4bf]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#2dd4bf] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PhysicalTherapyTemplate() {
  return (
    <TemplateLayout
      businessName="Summit Physical Therapy"
      tagline="Evidence-based rehabilitation to restore your strength, mobility, and quality of life."
      accentColor="#2dd4bf"
      accentColorLight="#5eead4"
      heroGradient="linear-gradient(135deg, #0f1f1d 0%, #0a1412 100%)"
      heroImage="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80"
      phone="(425) 555-0134"
      address="245 Summit Ave, Bellevue, WA 98004"
    >
      {/* ════════════════ Recovery Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#2dd4bf] via-[#14b8a6] to-[#2dd4bf] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <HeartIcon />
            <p className="text-sm font-bold tracking-wide">RECOVERY &middot; STRENGTH &middot; MOVEMENT &middot; HEALING</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <PhoneIcon />
            <span className="text-xs font-bold tracking-wider">BOOK NOW: (425) 555-0134</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a1210] border-b border-[#2dd4bf]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#2dd4bf]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Patients Recovered", icon: <TrophyIcon /> },
              { value: "98%", label: "Success Rate", icon: <CheckCircleIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "6", label: "Expert Therapists", icon: <UsersIcon /> },
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
                  <span className="text-[#2dd4bf]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Specialties ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0f0e 0%, #0d1614 50%, #0a0f0e 100%)" }}
      >
        <GridPattern />
        <BodySilhouettePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#2dd4bf]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#2dd4bf]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE TREAT"
            title="Our Specialties"
            highlightWord="Specialties"
            subtitle="Comprehensive rehabilitation services designed to get you back to doing what you love, faster and stronger."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec, i) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#2dd4bf]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#2dd4bf15,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] group-hover:bg-[#2dd4bf]/20 group-hover:border-[#2dd4bf]/40 transition-all duration-300">
                      {spec.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#2dd4bf]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#2dd4bf] transition-colors duration-300">{spec.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{spec.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {spec.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#2dd4bf]/70 bg-[#2dd4bf]/8 border border-[#2dd4bf]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Treatment Approach ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0d1816 50%, #0a1210 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#2dd4bf]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#2dd4bf]/4" />
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
                    src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80"
                    alt="Physical therapy session"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"
                    alt="Rehabilitation exercise"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#2dd4bf] rounded-2xl px-5 py-4 shadow-xl shadow-[#2dd4bf]/20 border border-[#5eead4]/30">
                  <span className="block text-3xl font-extrabold text-white leading-none">15+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Years of<br />Healing</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#2dd4bf]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#2dd4bf]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="OUR APPROACH"
                title="Evidence-Based Healing"
                highlightWord="Healing"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                At Summit Physical Therapy, we combine hands-on manual therapy with cutting-edge rehabilitation techniques to deliver results that last.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Every patient receives a comprehensive evaluation and a personalized treatment plan. We do not believe in cookie-cutter protocols. Your body is unique, and your recovery plan should be too. Our therapists spend one-on-one time with you at every visit.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <SpineIcon />, title: "Manual Therapy", desc: "Hands-on joint mobilization and soft tissue techniques" },
                  { icon: <DumbbellIcon />, title: "Therapeutic Exercise", desc: "Progressive strengthening tailored to your specific goals" },
                  { icon: <BodyIcon />, title: "Movement Analysis", desc: "Biomechanical assessment to identify and correct imbalances" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#2dd4bf]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] shrink-0">
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

      {/* ════════════════ Therapist Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1614 0%, #0f1a18 50%, #0d1614 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#2dd4bf]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="YOUR CARE TEAM"
            title="Meet Your Therapists"
            highlightWord="Therapists"
            subtitle="Doctoral-level physical therapists with specialized certifications and a passion for helping you recover."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {therapists.map((therapist, i) => (
              <motion.div
                key={therapist.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#2dd4bf]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1210] via-[#0a1210]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#2dd4bf]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#5eead4]/30">
                    {therapist.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{therapist.name}</h3>
                    <p className="text-[#2dd4bf] text-sm font-semibold mb-3">{therapist.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((s) => (
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

      {/* ════════════════ Conditions Treated Grid ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0f0e 0%, #0d1614 50%, #0a0f0e 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#2dd4bf]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CONDITIONS WE TREAT"
            title="Comprehensive Care"
            highlightWord="Care"
            subtitle="From acute injuries to chronic conditions, our therapists have the expertise to help you heal."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {conditions.map((condition, i) => (
              <motion.div
                key={condition}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-[#2dd4bf]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-2 h-2 rounded-full bg-[#2dd4bf]/50 group-hover:bg-[#2dd4bf] shrink-0 transition-colors duration-300" />
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">{condition}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Insurance Accepted ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#2dd4bf]/10 to-[#0a0f0e]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#2dd4bf" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#2dd4bf" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              INSURANCE <span className="text-[#2dd4bf]">ACCEPTED</span>
            </h2>
            <p className="text-muted mt-4 max-w-xl mx-auto">We work with most major insurance providers. No-charge benefits verification before your first visit.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-4">
            {insuranceProviders.map((provider, i) => (
              <motion.div
                key={provider}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group px-6 py-3 rounded-xl border border-white/[0.06] hover:border-[#2dd4bf]/30 bg-white/[0.02] transition-all duration-500"
              >
                <span className="text-sm font-semibold text-white/70 group-hover:text-[#2dd4bf] transition-colors duration-300">{provider}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0f0e 0%, #0d1614 50%, #0a0f0e 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#2dd4bf]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#2dd4bf" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#2dd4bf" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#2dd4bf" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PATIENT STORIES"
            title="Real Recovery Results"
            highlightWord="Results"
            subtitle="Hear from patients who regained their strength and got back to the life they love."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#2dd4bf]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#2dd4bf]/40 via-[#2dd4bf]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#2dd4bf10,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Case type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2dd4bf]/70 bg-[#2dd4bf]/8 border border-[#2dd4bf]/10 px-2.5 py-1 rounded-full">
                    {t.caseType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#2dd4bf] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2dd4bf]/30 to-[#2dd4bf]/10 flex items-center justify-center text-sm font-bold text-[#2dd4bf]">
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

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1210 0%, #0d1816 50%, #0a1210 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#2dd4bf]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#2dd4bf]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#2dd4bf]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#2dd4bf10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#2dd4bf] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Appointment CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1614 0%, #101e1b 50%, #0d1614 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#2dd4bf]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#2dd4bf]/20 relative overflow-hidden bg-gradient-to-b from-[#2dd4bf]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#2dd4bf15,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#2dd4bf]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#2dd4bf]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#2dd4bf]/10 text-[#2dd4bf] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#2dd4bf]/20">
                  <HeartIcon />
                  START YOUR RECOVERY
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Book Your <span className="text-[#2dd4bf]">Evaluation</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Take the first step toward recovery. Schedule your comprehensive evaluation and get a personalized treatment plan.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#2dd4bf]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#2dd4bf]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#2dd4bf]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Area of Pain / Concern"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#2dd4bf]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2dd4bf]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your condition or injury..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#2dd4bf]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#2dd4bf]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] text-white font-bold text-lg hover:from-[#5eead4] hover:to-[#2dd4bf] transition-all duration-300 shadow-lg shadow-[#2dd4bf]/20"
                >
                  Schedule My Evaluation
                </button>
                <p className="text-center text-white/30 text-xs">
                  Most insurance accepted. We will verify your benefits before your first visit at no charge.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2dd4bf]/10 via-[#2dd4bf]/5 to-[#0a0f0e]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2dd4bf]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#2dd4bf]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#2dd4bf] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/5">
              YOUR RECOVERY STARTS TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Move Better. <span className="text-[#2dd4bf]">Live Better.</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Do not let pain hold you back. Our expert therapists are ready to build a recovery plan that gets you back to the life you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] text-white font-bold items-center justify-center text-lg hover:from-[#5eead4] hover:to-[#2dd4bf] transition-all duration-300 shadow-lg shadow-[#2dd4bf]/25 gap-2"
              >
                <span>Book Evaluation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550134"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#2dd4bf]/30 text-[#2dd4bf] font-bold items-center justify-center text-lg hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0134</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
