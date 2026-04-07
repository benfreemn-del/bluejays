"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const ChildIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21c0-4.5 3-7 6.5-7s6.5 2.5 6.5 7" />
    <path d="M9 7h6" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M8 7h8M8 11h5" />
  </svg>
);

const SmallStarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const BlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const TreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22V10" />
    <path d="M6 12l6-8 6 8H6z" />
    <path d="M8 16l4-5 4 5H8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const StarFillIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/* ───────────────────────── Playful Pattern ───────────────────────── */

const PlayPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="playGrid" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="25" cy="25" r="2" fill="#60a5fa" />
        <circle cx="75" cy="75" r="2" fill="#60a5fa" />
        <rect x="70" y="20" width="6" height="6" rx="1" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
        <path d="M20 75l5-8 5 8z" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="1" fill="#60a5fa" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#playGrid)" />
  </svg>
);

const ChildSilhouette = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.02]" viewBox="0 0 1000 600">
    <circle cx="150" cy="300" r="40" stroke="#60a5fa" strokeWidth="0.8" fill="none" />
    <path d="M110 350c0-30 20-45 40-45s40 15 40 45" stroke="#60a5fa" strokeWidth="0.6" fill="none" />
    <circle cx="850" cy="250" r="35" stroke="#60a5fa" strokeWidth="0.6" fill="none" />
    <path d="M815 290c0-25 18-40 35-40s35 15 35 40" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
    <path d="M400 100l15-25 15 25z" stroke="#60a5fa" strokeWidth="0.4" fill="none" />
    <rect x="600" y="400" width="30" height="30" rx="3" stroke="#60a5fa" strokeWidth="0.4" fill="none" />
    <circle cx="500" cy="500" r="15" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
    <path d="M200 500 Q350 450 500 500 Q650 550 800 500" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const programs = [
  {
    name: "Infant Care",
    ages: "6 weeks - 12 months",
    desc: "A gentle, nurturing environment with low ratios where every coo and cuddle matters. Sensory play, tummy time, and bonding activities designed for your baby's first year.",
    icon: <HeartIcon />,
    tags: ["1:3 Ratio", "Sensory Play", "Daily Reports"],
  },
  {
    name: "Toddler Program",
    ages: "1 - 2 years",
    desc: "Active exploration through music, movement, and discovery. Our toddler rooms are designed for safe adventure with age-appropriate learning stations and outdoor play.",
    icon: <SunIcon />,
    tags: ["1:4 Ratio", "Music & Movement", "Outdoor Play"],
  },
  {
    name: "Preschool",
    ages: "3 - 5 years",
    desc: "Kindergarten readiness through play-based STEAM curriculum. Reading, math foundations, social skills, and creative expression in a structured yet joyful setting.",
    icon: <BookIcon />,
    tags: ["STEAM Curriculum", "Pre-Reading", "Social Skills"],
  },
  {
    name: "After-School Care",
    ages: "5 - 12 years",
    desc: "Homework help, enrichment activities, and supervised free play. A safe and stimulating space for kids to thrive after the school bell rings.",
    icon: <SmallStarIcon />,
    tags: ["Homework Help", "Enrichment", "Safe Transport"],
  },
];

const dailySchedule = [
  { time: "7:00 AM", activity: "Arrival & Free Play", desc: "Warm welcome, self-directed play stations" },
  { time: "8:30 AM", activity: "Circle Time", desc: "Songs, calendar, weather, and group sharing" },
  { time: "9:00 AM", activity: "Morning Learning", desc: "STEAM activities, reading, math foundations" },
  { time: "10:00 AM", activity: "Outdoor Play", desc: "Playground, nature walks, and physical activity" },
  { time: "11:00 AM", activity: "Creative Arts", desc: "Painting, crafts, music, and sensory exploration" },
  { time: "12:00 PM", activity: "Lunch & Story Time", desc: "Nutritious meal followed by quiet reading" },
  { time: "1:00 PM", activity: "Nap / Quiet Time", desc: "Restful break with soft music and cozy spaces" },
  { time: "3:00 PM", activity: "Afternoon Enrichment", desc: "Science experiments, cooking, and gardening" },
  { time: "4:30 PM", activity: "Free Play & Pickup", desc: "Indoor/outdoor play until parent arrival" },
];

const teachers = [
  {
    name: "Ms. Hannah Rivera",
    title: "Lead Infant Teacher",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    credentials: "B.S. Early Childhood Education",
    years: 12,
  },
  {
    name: "Mr. James Park",
    title: "Preschool Director",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    credentials: "M.Ed. Child Development",
    years: 15,
  },
  {
    name: "Ms. Aisha Thompson",
    title: "Toddler Lead Teacher",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
    credentials: "B.A. Psychology, CDA Certified",
    years: 8,
  },
];

const philosophyPoints = [
  {
    icon: <BlockIcon />,
    title: "Play-Based Learning",
    desc: "Children learn best through play. Our curriculum transforms every activity into an opportunity for discovery, problem-solving, and creative thinking.",
  },
  {
    icon: <HeartIcon />,
    title: "Emotional Intelligence",
    desc: "We teach children to name their emotions, resolve conflicts kindly, and build empathy, skills that serve them for life beyond the classroom.",
  },
  {
    icon: <TreeIcon />,
    title: "Nature Connection",
    desc: "Daily outdoor time, garden projects, and nature-based activities help children develop a lifelong love of the natural world around them.",
  },
  {
    icon: <BookIcon />,
    title: "Kindergarten Readiness",
    desc: "Every child enters kindergarten confident, curious, and equipped with strong pre-reading, math, and social foundations built through joyful learning.",
  },
];

const safetyFeatures = [
  { title: "Secure Entry System", desc: "Keypad-controlled doors with buzzer entry. Only authorized caregivers can access the facility." },
  { title: "Live Camera Access", desc: "Parents can watch their child's day through secure, password-protected live streaming cameras." },
  { title: "Background-Checked Staff", desc: "Every team member passes comprehensive FBI background checks and ongoing monitoring." },
  { title: "CPR & First Aid Trained", desc: "All staff maintain current CPR and pediatric first aid certifications renewed annually." },
  { title: "Allergy-Safe Protocols", desc: "Detailed allergy management plans with epi-pen trained staff and nut-free meal options." },
  { title: "Emergency Preparedness", desc: "Monthly fire drills, earthquake preparedness, and a detailed emergency communication plan for every family." },
];

const testimonials = [
  {
    name: "Amanda K.",
    text: "Our daughter started at Little Explorers at 8 months old. She is now in kindergarten and reading at a first-grade level. The teachers here are truly exceptional and genuinely love what they do.",
    childAge: "Parent of Infant Graduate",
    rating: 5,
  },
  {
    name: "Marcus & Priya D.",
    text: "The daily photo updates and detailed progress reports give us so much peace of mind at work. We feel like partners in our son's development, not just customers.",
    childAge: "Toddler Parents",
    rating: 5,
  },
  {
    name: "Jennifer W.",
    text: "After trying three other daycares, we finally found our home. The safety measures, the curriculum, the warmth of the staff. Little Explorers is everything we were searching for.",
    childAge: "Preschool Parent",
    rating: 5,
  },
];

/* ───────────────────────── Section Header ───────────────────────── */

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
        className="inline-block text-[#60a5fa] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/5"
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
        <span className="text-[#60a5fa]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#60a5fa] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function DaycareTemplate() {
  return (
    <TemplateLayout
      businessName="Little Explorers Daycare"
      tagline="Where curiosity grows and every child shines. Nurturing care and joyful learning in Redmond."
      accentColor="#60a5fa"
      accentColorLight="#93c5fd"
      heroGradient="linear-gradient(135deg, #0f1a2e 0%, #080d1a 100%)"
      heroImage="https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=1400&q=80"
      phone="(425) 555-0114"
      address="123 Discovery Lane, Redmond, WA"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#60a5fa] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <p className="text-sm font-bold tracking-wide">STATE LICENSED &mdash; 5-STAR RATED &mdash; OPEN 7AM TO 6PM</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">ENROLLING NOW: (425) 555-0114</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#080c14] border-b border-[#60a5fa]/10">
        <PlayPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#60a5fa]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "18+", label: "Years Serving Families" },
              { value: "1,200+", label: "Children Nurtured" },
              { value: "4.9", label: "Parent Rating" },
              { value: "3:1", label: "Infant Ratio" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#60a5fa]">
                  {stat.value}
                </span>
                <span className="block text-muted text-sm font-medium tracking-wide uppercase mt-2">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Programs ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080c14 0%, #0a1020 50%, #080c14 100%)" }}
      >
        <PlayPattern />
        <ChildSilhouette />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#60a5fa]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#60a5fa]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR PROGRAMS"
            title="Age-Based Programs"
            highlightWord="Programs"
            subtitle="Developmentally appropriate care and curriculum designed for every stage, from first steps to first grade and beyond."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program, i) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#60a5fa15,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] group-hover:bg-[#60a5fa]/20 group-hover:border-[#60a5fa]/40 transition-all duration-300">
                      {program.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#60a5fa]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold group-hover:text-[#60a5fa] transition-colors duration-300">{program.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#60a5fa]/70 bg-[#60a5fa]/8 border border-[#60a5fa]/10 px-2.5 py-1 rounded-full">
                      {program.ages}
                    </span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-5">{program.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#60a5fa]/70 bg-[#60a5fa]/8 border border-[#60a5fa]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Daily Schedule ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0c1228 50%, #0a1020 100%)" }}
      >
        <PlayPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#60a5fa]/6" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="A DAY AT LITTLE EXPLORERS"
            title="Daily Schedule"
            highlightWord="Schedule"
            subtitle="A thoughtfully structured day balancing learning, play, rest, and exploration for every age group."
          />
          <div className="space-y-3">
            {dailySchedule.map((item, i) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-[#60a5fa]/20 transition-all duration-300 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#60a5fa08,transparent_70%)]" />
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <div className="flex items-center gap-2 shrink-0 w-28">
                    <div className="text-[#60a5fa]"><ClockIcon /></div>
                    <span className="text-sm font-bold text-[#60a5fa]">{item.time}</span>
                  </div>
                  <div className="w-px h-8 bg-[#60a5fa]/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm group-hover:text-[#60a5fa] transition-colors duration-300">{item.activity}</h4>
                    <p className="text-muted text-xs">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Our Teachers ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080c14 0%, #0a0f1c 50%, #080c14 100%)" }}
      >
        <PlayPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#60a5fa]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Our Teachers"
            highlightWord="Teachers"
            subtitle="Passionate, credentialed educators who see every child as a unique learner with unlimited potential."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, i) => (
              <motion.div
                key={teacher.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/30 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#60a5fa]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#93c5fd]/30">
                    {teacher.years}+ YRS
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
                    <p className="text-[#60a5fa] text-sm font-semibold mb-2">{teacher.title}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
                      {teacher.credentials}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Learning Philosophy ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1328 50%, #0a1020 100%)" }}
      >
        <PlayPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#60a5fa]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#60a5fa]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR APPROACH"
            title="Learning Philosophy"
            highlightWord="Philosophy"
            subtitle="We believe every child is a natural explorer. Our philosophy blends play, nature, and structured learning into a joyful experience."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {philosophyPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex items-start gap-5 p-6 rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#60a5fa10,transparent_70%)]" />
                <div className="relative z-10 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] shrink-0 group-hover:bg-[#60a5fa]/20 group-hover:border-[#60a5fa]/40 transition-all duration-300">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#60a5fa] transition-colors duration-300">{point.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Safety & Security ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080c14 0%, #0a0f1c 50%, #080c14 100%)" }}
      >
        <PlayPattern opacity={0.02} />
        <ChildSilhouette />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#60a5fa]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PEACE OF MIND"
            title="Safety & Security"
            highlightWord="Security"
            subtitle="Your child's safety is our absolute highest priority. Every measure is in place so you can focus on your day with confidence."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#60a5fa12,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] shrink-0 group-hover:bg-[#60a5fa]/20 transition-all duration-300">
                      <ShieldIcon />
                    </div>
                    <div className="flex-1">
                      <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#60a5fa]/10 transition-colors duration-300 leading-none float-right">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-[#60a5fa] transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#60a5fa]/10 to-[#080c14]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <circle cx="200" cy="200" r="40" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="60" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
            <circle cx="800" cy="200" r="40" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
            <path d="M0 300 Q250 250 500 300 Q750 350 1000 300" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
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
              WHY FAMILIES CHOOSE <span className="text-[#60a5fa]">LITTLE EXPLORERS</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldIcon />, title: "State Licensed", desc: "Fully licensed, inspected, and exceeding all state requirements for childcare" },
              { icon: <HeartIcon />, title: "Low Ratios", desc: "Small class sizes mean more individual attention for every child" },
              { icon: <CameraIcon />, title: "Live Cameras", desc: "Watch your child's day in real time through secure parent streaming" },
              { icon: <SunIcon />, title: "Outdoor Focus", desc: "Daily outdoor time with a nature-based curriculum and large play area" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] mb-4 group-hover:bg-[#60a5fa]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080c14 0%, #0a1020 50%, #080c14 100%)" }}
      >
        <PlayPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#60a5fa]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#60a5fa" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PARENT TESTIMONIALS"
            title="Trusted by Families"
            highlightWord="Families"
            subtitle="Real stories from real families who entrust us with their most precious gift every day."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#60a5fa]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#60a5fa]/40 via-[#60a5fa]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#60a5fa10,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#60a5fa]/70 bg-[#60a5fa]/8 border border-[#60a5fa]/10 px-2.5 py-1 rounded-full">
                    {t.childAge}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#60a5fa] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarFillIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#60a5fa]/30 to-[#60a5fa]/10 flex items-center justify-center text-sm font-bold text-[#60a5fa]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Parent</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Enrollment CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1020 0%, #0d1328 50%, #0a1020 100%)" }}
      >
        <PlayPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#60a5fa]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#60a5fa]/20 relative overflow-hidden bg-gradient-to-b from-[#60a5fa]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#60a5fa15,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#60a5fa]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#60a5fa]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#60a5fa]/10 text-[#60a5fa] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#60a5fa]/20">
                  <ChildIcon />
                  SPACES ARE LIMITED
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Enroll or <span className="text-[#60a5fa]">Book a Tour</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  See our classrooms, meet our teachers, and discover why hundreds of Redmond families trust Little Explorers with their children.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Parent's Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#60a5fa]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#60a5fa]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#60a5fa]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Child's Age"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#60a5fa]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your family and what you are looking for..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#60a5fa]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 resize-none transition-colors"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white font-bold text-lg hover:from-[#93c5fd] hover:to-[#60a5fa] transition-all duration-300 shadow-lg shadow-[#60a5fa]/20"
                  >
                    Start Enrollment
                  </button>
                  <button
                    type="button"
                    className="w-full h-14 rounded-xl border border-[#60a5fa]/30 text-[#60a5fa] font-bold text-lg hover:bg-[#60a5fa]/10 transition-all duration-300"
                  >
                    Book a Tour
                  </button>
                </div>
                <p className="text-center text-white/30 text-xs">
                  We respond to all inquiries within 24 hours. Tours available Monday through Friday.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#60a5fa]/10 via-[#60a5fa]/5 to-[#080c14]" />
        <PlayPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#60a5fa]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#60a5fa]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#60a5fa] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#60a5fa]/20 bg-[#60a5fa]/5">
              THEIR FUTURE STARTS HERE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Give Your Child the <span className="text-[#60a5fa]">Best Start</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Every day at Little Explorers is an adventure in learning, growing, and discovering. Join our family and watch your child thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white font-bold items-center justify-center text-lg hover:from-[#93c5fd] hover:to-[#60a5fa] transition-all duration-300 shadow-lg shadow-[#60a5fa]/25 gap-2"
              >
                <span>Enroll Today</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550114"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#60a5fa]/30 text-[#60a5fa] font-bold items-center justify-center text-lg hover:bg-[#60a5fa]/10 hover:border-[#60a5fa]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0114</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
