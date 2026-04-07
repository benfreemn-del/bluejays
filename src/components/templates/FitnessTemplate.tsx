"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const DumbbellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M6.5 6.5h11M6.5 17.5h11" strokeLinecap="round" />
    <rect x="3" y="5" width="3" height="14" rx="1" />
    <rect x="18" y="5" width="3" height="14" rx="1" />
    <rect x="1" y="8" width="2" height="8" rx="0.5" />
    <rect x="21" y="8" width="2" height="8" rx="0.5" />
    <path d="M9.5 6.5v11M14.5 6.5v11" strokeLinecap="round" strokeWidth="1" opacity="0.3" />
  </svg>
);

const HeartRateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="10" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
  </svg>
);

const TimerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" strokeLinecap="round" />
    <path d="M10 2h4M12 2v3" strokeLinecap="round" />
    <path d="M20 5l-1.5 1.5" strokeLinecap="round" />
  </svg>
);

const MedalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="14" r="6" />
    <path d="M9 2l-3 10M15 2l3 10" strokeLinecap="round" />
    <path d="M12 10v2m-2 1l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="14" r="3" strokeWidth="0.8" strokeDasharray="2 2" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22c4.97 0 7-3.58 7-7 0-4-3-7-3-7s.5 2-2 3c-1.5.6-1-2.5-1-2.5S10 11 10 15c0 2.5 1 4 2 4s1.5-.5 1.5-1.5S12 16 12 16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
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

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="fitGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f43f5e" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#fitGrid)" />
  </svg>
);

/* ───────────────────────── Fitness Background SVG ───────────────────────── */

const FitnessBackground = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.015] pointer-events-none" viewBox="0 0 600 600">
    {/* Dumbbell silhouette */}
    <rect x="50" y="280" width="60" height="40" rx="5" stroke="#f43f5e" strokeWidth="1" fill="none" />
    <rect x="490" y="280" width="60" height="40" rx="5" stroke="#f43f5e" strokeWidth="1" fill="none" />
    <rect x="30" y="260" width="20" height="80" rx="3" stroke="#f43f5e" strokeWidth="1" fill="none" />
    <rect x="550" y="260" width="20" height="80" rx="3" stroke="#f43f5e" strokeWidth="1" fill="none" />
    <line x1="110" y1="300" x2="490" y2="300" stroke="#f43f5e" strokeWidth="1" />
    {/* Heartbeat line */}
    <path d="M50 450 L150 450 L200 400 L250 500 L300 380 L350 520 L400 450 L550 450" stroke="#f43f5e" strokeWidth="0.8" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const programs = [
  {
    name: "Strength Training",
    desc: "Progressive overload programs with free weights, machines, and functional equipment to build raw power and sculpted muscle.",
    icon: <DumbbellIcon />,
    tags: ["Free Weights", "Machines", "Progressive Overload"],
  },
  {
    name: "HIIT Classes",
    desc: "High-intensity interval training that torches calories, boosts metabolism, and delivers maximum results in minimum time.",
    icon: <FlameIcon />,
    tags: ["Fat Burn", "Cardio", "Full Body"],
  },
  {
    name: "Personal Training",
    desc: "One-on-one coaching with certified trainers who build custom programs around your goals, schedule, and fitness level.",
    icon: <MedalIcon />,
    tags: ["1-on-1", "Custom Plans", "Accountability"],
  },
  {
    name: "Group Fitness",
    desc: "Energizing group classes from spin to yoga to boxing. Community-driven workouts that keep you motivated and coming back.",
    icon: <UsersIcon />,
    tags: ["Spin", "Yoga", "Boxing"],
  },
  {
    name: "Cardio & Endurance",
    desc: "State-of-the-art cardio equipment and endurance programming to improve heart health, stamina, and athletic performance.",
    icon: <HeartRateIcon />,
    tags: ["Treadmills", "Rowing", "Stairmaster"],
  },
  {
    name: "Recovery & Mobility",
    desc: "Guided stretching, foam rolling, cryotherapy, and recovery protocols to reduce soreness and prevent injury.",
    icon: <TimerIcon />,
    tags: ["Stretching", "Foam Rolling", "Cryotherapy"],
  },
];

const membershipPlans = [
  {
    name: "Essential",
    price: "$49",
    period: "/month",
    description: "Perfect for self-motivated athletes who just need the space and equipment.",
    features: [
      "Full gym access 5AM-10PM",
      "Locker room & showers",
      "Free WiFi",
      "Fitness assessment",
      "Mobile app access",
    ],
    highlighted: false,
  },
  {
    name: "Performance",
    price: "$89",
    period: "/month",
    description: "Our most popular plan. Unlimited classes plus everything in Essential.",
    features: [
      "24/7 gym access",
      "Unlimited group classes",
      "2 personal training sessions/mo",
      "InBody composition scans",
      "Nutrition consultation",
      "Guest passes (2/month)",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$149",
    period: "/month",
    description: "The ultimate package for those committed to total transformation.",
    features: [
      "24/7 VIP access",
      "Unlimited classes & PT sessions",
      "Weekly body composition scans",
      "Custom meal plans",
      "Recovery suite access",
      "Priority class booking",
      "Free merchandise quarterly",
    ],
    highlighted: false,
  },
];

const trainers = [
  {
    name: "Marcus Cole",
    title: "Head Coach",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80",
    specialties: ["Strength & Conditioning", "Olympic Lifting"],
    yearsExp: 12,
  },
  {
    name: "Aisha Johnson",
    title: "HIIT Specialist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    specialties: ["HIIT", "Fat Loss", "Nutrition"],
    yearsExp: 8,
  },
  {
    name: "Ryan Nakamura",
    title: "Personal Trainer",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
    specialties: ["Bodybuilding", "Sports Performance"],
    yearsExp: 10,
  },
];

const transformations = [
  {
    name: "Jake M.",
    text: "Lost 45 pounds in 6 months and gained more muscle than I had in my 20s. The trainers here pushed me past limits I did not know I had. Life-changing.",
    result: "Lost 45 lbs",
    rating: 5,
  },
  {
    name: "Priya S.",
    text: "After two kids, I felt completely out of shape. The group classes brought me back to life. I am stronger now at 38 than I was at 25. This gym is my second home.",
    result: "Total Transformation",
    rating: 5,
  },
  {
    name: "Carlos D.",
    text: "Trained at big box gyms for years with zero progress. Three months at Iron and Oak and I finally see real results. The coaching difference is night and day.",
    result: "Gained 20 lbs Muscle",
    rating: 5,
  },
];

const schedule = [
  { time: "5:30 AM", mon: "HIIT Burn", tue: "Strength", wed: "HIIT Burn", thu: "Strength", fri: "HIIT Burn", sat: "Open Gym" },
  { time: "7:00 AM", mon: "Yoga Flow", tue: "Spin", wed: "Yoga Flow", thu: "Spin", fri: "Yoga Flow", sat: "Community WOD" },
  { time: "12:00 PM", mon: "Express HIIT", tue: "Express Lift", wed: "Express HIIT", thu: "Express Lift", fri: "Express HIIT", sat: "--" },
  { time: "5:30 PM", mon: "Boxing", tue: "Strength", wed: "Boxing", thu: "Strength", fri: "Open Gym", sat: "--" },
  { time: "7:00 PM", mon: "Yoga Restore", tue: "HIIT Burn", wed: "Yoga Restore", thu: "HIIT Burn", fri: "--", sat: "--" },
];

const faqs = [
  {
    q: "Do I need to be in shape to join?",
    a: "Absolutely not. We welcome all fitness levels, from complete beginners to competitive athletes. Every class and program can be scaled to your current ability. Our trainers meet you where you are.",
  },
  {
    q: "What is included in the free trial?",
    a: "Your 7-day free trial includes full gym access, unlimited group classes, a fitness assessment with one of our coaches, and a tour of our facility. No credit card required to start.",
  },
  {
    q: "Can I freeze my membership?",
    a: "Yes. We offer membership freezes for up to 3 months per year for travel, injury, or other life events. Just give us 7 days notice and your membership will be paused.",
  },
  {
    q: "What are your hours?",
    a: "Performance and Elite members have 24/7 key-fob access. Essential members can access the gym from 5AM to 10PM, seven days a week. Staffed hours are 6AM to 8PM weekdays and 7AM to 2PM weekends.",
  },
  {
    q: "Do you offer nutrition coaching?",
    a: "Yes. Performance members receive a nutrition consultation, and Elite members get fully custom meal plans updated monthly. We also host monthly nutrition workshops open to all members.",
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
        className="inline-block text-[#f43f5e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f43f5e]/20 bg-[#f43f5e]/5"
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
        <span className="text-[#f43f5e]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#f43f5e] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function FitnessTemplate() {
  return (
    <TemplateLayout
      businessName="Iron & Oak Fitness"
      tagline="Forge your strongest self. Seattle's premier strength and conditioning gym."
      accentColor="#f43f5e"
      accentColorLight="#fb7185"
      heroGradient="linear-gradient(135deg, #1a0a0e 0%, #0d1117 100%)"
      heroImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
      phone="(206) 555-0109"
      address="742 Pike St, Seattle, WA 98101"
    >
      {/* ════════════════ Energy Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#f43f5e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <DumbbellIcon />
            <p className="text-sm font-bold tracking-wide">STRENGTH &mdash; COMMUNITY &mdash; TRANSFORMATION</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
            </span>
            <span className="text-xs font-bold tracking-wider">7-DAY FREE TRIAL &mdash; NO COMMITMENT</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a0b] border-b border-[#f43f5e]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#f43f5e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,500+", label: "Members Strong", icon: <UsersIcon /> },
              { value: "50+", label: "Classes Weekly", icon: <ClockIcon /> },
              { value: "15", label: "Expert Trainers", icon: <MedalIcon /> },
              { value: "4.9", label: "Google Rating", icon: <StarIcon /> },
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
                  <span className="text-[#f43f5e]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Programs ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a080a 0%, #0f0a0c 50%, #0a080a 100%)" }}
      >
        <GridPattern />
        <FitnessBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#f43f5e]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#f43f5e]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR PROGRAMS"
            title="Training Programs"
            highlightWord="Programs"
            subtitle="From strength and conditioning to yoga and recovery, we have the programs and coaching to match any goal."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, i) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f43f5e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f43f5e15,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f43f5e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 flex items-center justify-center text-[#f43f5e] group-hover:bg-[#f43f5e]/20 group-hover:border-[#f43f5e]/40 transition-all duration-300">
                      {program.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#f43f5e]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#f43f5e] transition-colors duration-300">{program.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{program.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#f43f5e]/70 bg-[#f43f5e]/8 border border-[#f43f5e]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Membership Plans ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a0c 0%, #120c0f 50%, #0f0a0c 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#f43f5e]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="MEMBERSHIP"
            title="Choose Your Plan"
            highlightWord="Your Plan"
            subtitle="Straightforward pricing with no hidden fees. Every plan includes access to our 15,000 sq ft facility."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {membershipPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  plan.highlighted
                    ? "border-[#f43f5e]/40 bg-[#f43f5e]/[0.04] scale-[1.02]"
                    : "border-white/[0.06] hover:border-[#f43f5e]/30 bg-white/[0.02]"
                }`}
              >
                {/* Highlighted glow */}
                {plan.highlighted && (
                  <>
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#f43f5e12,transparent_70%)]" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f43f5e]/50 to-transparent" />
                  </>
                )}
                <div className="relative z-10">
                  {plan.highlighted && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/20 px-3 py-1 rounded-full mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#f43f5e]">
                      {plan.price}
                    </span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted text-sm mb-6 leading-relaxed">{plan.description}</p>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm">
                        <span className="text-[#f43f5e]"><CheckCircleIcon /></span>
                        <span className="text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#contact"
                    className={`block w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white hover:from-[#fb7185] hover:to-[#f43f5e] shadow-lg shadow-[#f43f5e]/20"
                        : "border-2 border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e]/10 hover:border-[#f43f5e]/50"
                    }`}
                  >
                    Start Free Trial
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Trainers ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a080a 0%, #0d0a0c 50%, #0a080a 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#f43f5e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR COACHES"
            title="Meet Your Trainers"
            highlightWord="Trainers"
            subtitle="Certified coaches who have walked the walk. They do not just teach fitness, they live it."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {trainers.map((trainer, i) => (
              <motion.div
                key={trainer.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#f43f5e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a080a] via-[#0a080a]/30 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#f43f5e]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#fb7185]/30">
                    {trainer.yearsExp}+ YRS
                  </div>
                  {/* Info overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{trainer.name}</h3>
                    <p className="text-[#f43f5e] text-sm font-semibold mb-3">{trainer.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specialties.map((s) => (
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

      {/* ════════════════ Transformation Stories ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a0c 0%, #120c0f 50%, #0f0a0c 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f43f5e]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#f43f5e" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#f43f5e" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#f43f5e" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="SUCCESS STORIES"
            title="Real Transformations"
            highlightWord="Transformations"
            subtitle="These are not stock photos. These are real members who put in the work and let us help them get there."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {transformations.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#f43f5e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#f43f5e]/40 via-[#f43f5e]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#f43f5e10,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Result tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f43f5e]/70 bg-[#f43f5e]/8 border border-[#f43f5e]/10 px-2.5 py-1 rounded-full">
                    {t.result}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#f43f5e] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f43f5e]/30 to-[#f43f5e]/10 flex items-center justify-center text-sm font-bold text-[#f43f5e]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Member</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Class Schedule ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a080a 0%, #0d0a0c 50%, #0a080a 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#f43f5e]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WEEKLY SCHEDULE"
            title="Class Schedule"
            highlightWord="Schedule"
            subtitle="Plan your week with our full lineup of classes. All classes included with Performance and Elite memberships."
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-[#f43f5e]">Time</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <th key={day} className="p-4 text-left text-xs font-bold uppercase tracking-wider text-muted">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-[#f43f5e]/[0.03] transition-colors duration-300">
                    <td className="p-4 text-sm font-bold text-white whitespace-nowrap">{row.time}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat].map((cls, j) => (
                      <td key={j} className="p-4">
                        <span className={`text-sm ${cls === "--" ? "text-white/10" : "text-muted font-medium"}`}>
                          {cls}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0a0c 0%, #120c0f 50%, #0f0a0c 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#f43f5e]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#f43f5e]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#f43f5e]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#f43f5e10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/20 flex items-center justify-center text-[#f43f5e] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#f43f5e] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Trial CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f43f5e]/10 via-[#f43f5e]/5 to-[#0a080a]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f43f5e]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#f43f5e]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#f43f5e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#f43f5e]/20 bg-[#f43f5e]/5">
              START TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your First 7 Days Are <span className="text-[#f43f5e]">Completely Free</span>
            </h2>
            <p className="text-muted text-lg mb-6 max-w-xl mx-auto leading-relaxed">
              No credit card. No commitment. No pressure. Walk in, work out, and see why Iron &amp; Oak is Seattle&apos;s fastest-growing gym.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted mb-10">
              {["Full Gym Access", "All Group Classes", "Fitness Assessment", "Coach Intro Session"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-[#f43f5e]"><BoltIcon /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white font-bold items-center justify-center text-lg hover:from-[#fb7185] hover:to-[#f43f5e] transition-all duration-300 shadow-lg shadow-[#f43f5e]/25 gap-2"
              >
                <span>Claim Free Trial</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550109"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#f43f5e]/30 text-[#f43f5e] font-bold items-center justify-center text-lg hover:bg-[#f43f5e]/10 hover:border-[#f43f5e]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (206) 555-0109</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
