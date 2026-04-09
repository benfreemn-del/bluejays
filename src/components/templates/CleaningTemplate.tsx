"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 8l.72 2.17L21 13l-2.28.83L18 16l-.72-2.17L15 13l2.28-.83L18 10zM7 14l.72 2.17L10 17l-2.28.83L7 20l-.72-2.17L4 17l2.28-.83L7 14z" />
  </svg>
);

const SprayBottleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15 3h-2v3h-2V3H9l1 3H8v2h8V6h-2l1-3z" />
    <path d="M10 8v1a1 1 0 00-1 1v10a2 2 0 002 2h2a2 2 0 002-2V10a1 1 0 00-1-1V8" />
    <path d="M17 5l2-1m-2 3l2 1m-2-1h2" strokeLinecap="round" />
  </svg>
);

const MopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v10M8 12h8l1 2v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1l1-2z" />
    <path d="M9 16v5m2-5v6m2-6v5" strokeLinecap="round" />
  </svg>
);

const HouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

/* ───────────────────────── Bubble Pattern ───────────────────────── */

const BubblePattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="cleanBubbles" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="8" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
        <circle cx="60" cy="60" r="5" fill="none" stroke="#38bdf8" strokeWidth="0.4" />
        <circle cx="60" cy="15" r="3" fill="none" stroke="#38bdf8" strokeWidth="0.3" />
        <circle cx="15" cy="65" r="4" fill="none" stroke="#38bdf8" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cleanBubbles)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Residential Cleaning",
    desc: "Regular house cleaning that keeps every room sparkling. Kitchens, bathrooms, bedrooms, and living areas polished to perfection.",
    icon: <HouseIcon />,
    tags: ["Weekly", "Bi-Weekly", "Monthly"],
  },
  {
    name: "Deep Cleaning",
    desc: "Intensive top-to-bottom cleaning that reaches every hidden corner. Baseboards, behind appliances, inside cabinets, and more.",
    icon: <SparkleIcon />,
    tags: ["Spring Clean", "Heavy Duty", "Sanitization"],
  },
  {
    name: "Move-In / Move-Out",
    desc: "Get your full deposit back or start fresh in your new home. We leave every surface spotless and inspection-ready.",
    icon: <CheckmarkIcon />,
    tags: ["Apartments", "Houses", "Condos"],
  },
  {
    name: "Office Cleaning",
    desc: "Professional workspace cleaning that impresses clients and keeps employees healthy. Desks, floors, restrooms, and break rooms.",
    icon: <SprayBottleIcon />,
    tags: ["Daily", "Nightly", "Weekend"],
  },
  {
    name: "Recurring Service",
    desc: "Set it and forget it. We come on your schedule so your home always looks its best without you lifting a finger.",
    icon: <CalendarIcon />,
    tags: ["Flexible", "Consistent", "Priority"],
  },
  {
    name: "One-Time Clean",
    desc: "Hosting a party? Post-renovation mess? Special event? One call and we handle it all, no commitment required.",
    icon: <MopIcon />,
    tags: ["Events", "Post-Reno", "Seasonal"],
  },
];

const pricingPlans = [
  {
    name: "Essential",
    price: "$129",
    per: "per visit",
    desc: "Perfect for maintaining a tidy home",
    features: [
      "Kitchen & bathroom deep wipe",
      "Vacuuming & mopping all floors",
      "Dusting all surfaces",
      "Trash removal & bag replacement",
      "Bed making & tidying",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: "$219",
    per: "per visit",
    desc: "Our most popular — thorough & complete",
    features: [
      "Everything in Essential",
      "Inside appliance cleaning",
      "Baseboard & trim wiping",
      "Window sill & track cleaning",
      "Cabinet exterior polish",
      "Light fixture dusting",
    ],
    popular: true,
  },
  {
    name: "Luxury",
    price: "$349",
    per: "per visit",
    desc: "White-glove service, nothing overlooked",
    features: [
      "Everything in Premium",
      "Interior window cleaning",
      "Closet & pantry organization",
      "Laundry wash, dry & fold",
      "Fridge & oven deep clean",
      "Garage & patio sweep",
      "Eco-friendly product upgrade",
    ],
    popular: false,
  },
];

const teamMembers = [
  {
    name: "Maria Santos",
    title: "Lead Technician",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    yearsExp: 8,
  },
  {
    name: "David Park",
    title: "Operations Manager",
    image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&q=80",
    yearsExp: 12,
  },
  {
    name: "Sarah Thompson",
    title: "Quality Inspector",
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&q=80",
    yearsExp: 6,
  },
];

const testimonials = [
  {
    name: "Lauren K.",
    text: "My house has never been this clean. They scrubbed places I didn&apos;t even know existed. Absolutely worth every penny and then some.",
    service: "Deep Cleaning",
    rating: 5,
  },
  {
    name: "Marcus T.",
    text: "We use them weekly for our office and the difference is night and day. Professional, punctual, and incredibly thorough every single time.",
    service: "Office Cleaning",
    rating: 5,
  },
  {
    name: "Amy R.",
    text: "Got our full security deposit back thanks to their move-out clean. The landlord said it looked better than when we moved in. Amazing.",
    service: "Move-Out Clean",
    rating: 5,
  },
];

const serviceAreas = [
  "Seattle", "Bellevue", "Redmond", "Kirkland", "Renton",
  "Tacoma", "Lynnwood", "Bothell", "Issaquah", "Mercer Island",
  "Burien", "Tukwila",
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
        className="inline-block text-[#38bdf8] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5"
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
        <span className="text-[#38bdf8]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#38bdf8] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function CleaningTemplate() {
  return (
    <TemplateLayout
      businessName="Sparkle Clean Pro"
      tagline="Spotless homes and offices, guaranteed. Seattle's most trusted cleaning service since 2015."
      accentColor="#38bdf8"
      accentColorLight="#7dd3fc"
      heroGradient="linear-gradient(135deg, #0c1929 0%, #0a1220 100%)"
      heroImage="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&q=80"
      phone="(206) 555-0120"
      address="Seattle, WA"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#38bdf8] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC4zIiBvcGFjaXR5PSIwLjE1Ii8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <SparkleIcon />
            <p className="text-sm font-bold tracking-wide">SPOTLESS, RELIABLE, TRUSTWORTHY</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">BOOK TODAY: (206) 555-0120</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0a1220] border-b border-[#38bdf8]/10">
        <BubblePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#38bdf8]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5,000+", label: "Homes Cleaned", icon: <HouseIcon /> },
              { value: "100%", label: "Satisfaction Rate", icon: <CheckCircleIcon /> },
              { value: "9+", label: "Years in Seattle", icon: <ClockIcon /> },
              { value: "50+", label: "Team Members", icon: <UsersIcon /> },
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
                  <span className="text-[#38bdf8]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #080f1a 0%, #0c1929 50%, #080f1a 100%)" }}
      >
        <BubblePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#38bdf8]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#38bdf8]/4" />
        </div>
        {/* Industry SVG silhouette */}
        <svg className="absolute bottom-0 left-0 w-full h-40 opacity-[0.02] pointer-events-none" viewBox="0 0 1200 160">
          <path d="M0 160V80l100-20 100 30 100-40 100 20 100-30 100 40 100-20 100 30 100-40 100 20 100-30 100 40V160z" fill="#38bdf8" />
        </svg>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Cleaning Services"
            highlightWord="Services"
            subtitle="From weekly touch-ups to heavy-duty deep cleans, we handle every mess with precision and care."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#38bdf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#38bdf815,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] group-hover:bg-[#38bdf8]/20 group-hover:border-[#38bdf8]/40 transition-all duration-300">
                      {svc.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#38bdf8]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#38bdf8] transition-colors duration-300">{svc.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{svc.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8]/70 bg-[#38bdf8]/8 border border-[#38bdf8]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Pricing Plans ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0c1929 0%, #0e1f35 50%, #0c1929 100%)" }}
      >
        <BubblePattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#38bdf8]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="TRANSPARENT PRICING"
            title="Simple, Honest Plans"
            highlightWord="Plans"
            subtitle="No hidden fees, no surprise charges. Pick the plan that fits your needs and we handle the rest."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  plan.popular
                    ? "border-[#38bdf8]/40 bg-[#38bdf8]/[0.04]"
                    : "border-white/[0.06] hover:border-[#38bdf8]/30 bg-white/[0.02]"
                }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#38bdf810,transparent_60%)]" />
                  </>
                )}
                <div className="relative z-10">
                  {plan.popular && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-3 py-1 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted text-sm mb-6">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#38bdf8]">
                      {plan.price}
                    </span>
                    <span className="text-muted text-sm ml-2">{plan.per}</span>
                  </div>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-3">
                        <CheckCircleIcon />
                        <span className="text-muted text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white hover:from-[#7dd3fc] hover:to-[#38bdf8] shadow-lg shadow-[#38bdf8]/20"
                        : "border-2 border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/10 hover:border-[#38bdf8]/50"
                    }`}
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Trust Badges ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#38bdf8]/10 to-[#080f1a]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <circle cx="200" cy="200" r="150" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="120" stroke="#38bdf8" strokeWidth="0.4" fill="none" />
            <circle cx="800" cy="200" r="150" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
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
              WHY SEATTLE TRUSTS <span className="text-[#38bdf8]">SPARKLE CLEAN PRO</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckmarkIcon />,
                title: "Fully Bonded",
                desc: "Every job is covered by our comprehensive bonding policy. Your property is fully protected.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: "Fully Insured",
                desc: "Licensed and insured for your peace of mind. Accidents are rare, but you are always covered.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ),
                title: "Background Checked",
                desc: "Every team member passes a thorough background check before they ever enter your home.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-8 rounded-2xl border border-white/[0.06] hover:border-[#38bdf8]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] mb-5 group-hover:bg-[#38bdf8]/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0c1929 0%, #0e1d30 50%, #0c1929 100%)" }}
      >
        <BubblePattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#38bdf8]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet the Sparkle Crew"
            highlightWord="Sparkle Crew"
            subtitle="A dedicated team of cleaning professionals who take immense pride in every spotless surface."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#38bdf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080f1a] via-[#080f1a]/30 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#38bdf8]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#7dd3fc]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#38bdf8] text-sm font-semibold">{member.title}</p>
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
        style={{ background: "linear-gradient(180deg, #080f1a 0%, #0c1929 50%, #080f1a 100%)" }}
      >
        <BubblePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#38bdf8]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#38bdf8" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#38bdf8" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#38bdf8" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Loved by Thousands"
            highlightWord="Thousands"
            subtitle="Real stories from real clients who trust us with their homes and offices week after week."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#38bdf8]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#38bdf8]/40 via-[#38bdf8]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#38bdf810,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#38bdf8]/70 bg-[#38bdf8]/8 border border-[#38bdf8]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#38bdf8] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38bdf8]/30 to-[#38bdf8]/10 flex items-center justify-center text-sm font-bold text-[#38bdf8]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Client</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Service Area ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0c1929 0%, #0e1f35 50%, #0c1929 100%)" }}
      >
        <BubblePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#38bdf8]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#38bdf8]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHERE WE CLEAN"
            title="Our Service Area"
            highlightWord="Service Area"
            subtitle="Proudly serving the greater Seattle metropolitan area and surrounding communities."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {serviceAreas.map((area, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-[#38bdf8]/30 bg-white/[0.02] transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#38bdf8] shrink-0">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium group-hover:text-[#38bdf8] transition-colors duration-300">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Quote CTA ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #080f1a 0%, #0d1a2d 50%, #080f1a 100%)" }}
      >
        <BubblePattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#38bdf8]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#38bdf8]/20 relative overflow-hidden bg-gradient-to-b from-[#38bdf8]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#38bdf815,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#38bdf8]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#38bdf8]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#38bdf8]/10 text-[#38bdf8] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#38bdf8]/20">
                  <SparkleIcon />
                  FREE ESTIMATE
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Get Your Free <span className="text-[#38bdf8]">Quote Today</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your space and we will send you a custom quote within hours. No obligation, no pressure, just sparkling results.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#38bdf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#38bdf8]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#38bdf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#38bdf8]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#38bdf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#38bdf8]/50 transition-colors"
                  />
                  <select className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#38bdf8]/15 text-white/50 text-sm focus:outline-none focus:border-[#38bdf8]/50 transition-colors appearance-none">
                    <option value="">Select Service Type</option>
                    <option value="residential">Residential Cleaning</option>
                    <option value="deep">Deep Cleaning</option>
                    <option value="move">Move-In / Move-Out</option>
                    <option value="office">Office Cleaning</option>
                    <option value="recurring">Recurring Service</option>
                    <option value="onetime">One-Time Clean</option>
                  </select>
                </div>
                <textarea
                  placeholder="Tell us about your space (sq ft, number of rooms, any special requests)..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#38bdf8]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#38bdf8]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white font-bold text-lg hover:from-[#7dd3fc] hover:to-[#38bdf8] transition-all duration-300 shadow-lg shadow-[#38bdf8]/20"
                >
                  Get My Free Quote
                </button>
                <p className="text-center text-white/30 text-xs">
                  We respond within 2 hours. Your information is never shared with third parties.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/10 via-[#38bdf8]/5 to-[#080f1a]" />
        <BubblePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#38bdf8]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#38bdf8] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/5">
              BOOK NOW
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your Spotless Home <span className="text-[#38bdf8]">Awaits</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Life is too short to spend it cleaning. Let our expert team handle the dirty work while you enjoy the things that matter most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white font-bold items-center justify-center text-lg hover:from-[#7dd3fc] hover:to-[#38bdf8] transition-all duration-300 shadow-lg shadow-[#38bdf8]/25 gap-2"
              >
                <span>Get Free Quote</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550120"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#38bdf8]/30 text-[#38bdf8] font-bold items-center justify-center text-lg hover:bg-[#38bdf8]/10 hover:border-[#38bdf8]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(206) 555-0120</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
