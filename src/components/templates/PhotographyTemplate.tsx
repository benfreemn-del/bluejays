"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ApertureIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
  </svg>
);

const LensIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const FrameIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="6" y="6" width="12" height="12" rx="1" />
    <path d="M3 3l3 3M21 3l-3 3M3 21l3-3M21 21l-3-3" />
  </svg>
);

const FlashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
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

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="photoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a855f7" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#photoGrid)" />
  </svg>
);

/* ───────────────────────── Aperture Pattern ───────────────────────── */

const AperturePattern = ({ opacity = 0.02 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 400 400">
    <circle cx="80" cy="80" r="40" stroke="#a855f7" strokeWidth="0.5" fill="none" />
    <circle cx="80" cy="80" r="25" stroke="#a855f7" strokeWidth="0.3" fill="none" />
    <circle cx="80" cy="80" r="10" stroke="#a855f7" strokeWidth="0.3" fill="none" />
    <circle cx="320" cy="150" r="50" stroke="#a855f7" strokeWidth="0.5" fill="none" />
    <circle cx="320" cy="150" r="30" stroke="#a855f7" strokeWidth="0.3" fill="none" />
    <circle cx="320" cy="150" r="12" stroke="#a855f7" strokeWidth="0.3" fill="none" />
    <circle cx="150" cy="320" r="35" stroke="#a855f7" strokeWidth="0.5" fill="none" />
    <circle cx="150" cy="320" r="20" stroke="#a855f7" strokeWidth="0.3" fill="none" />
    <circle cx="150" cy="320" r="8" stroke="#a855f7" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const portfolioCategories = [
  {
    name: "Weddings",
    desc: "Timeless, emotion-driven coverage that tells the story of your most important day. Every glance, every tear, every celebration preserved forever.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    count: "200+ weddings",
  },
  {
    name: "Portraits",
    desc: "Authentic, expressive portrait sessions for families, couples, seniors, and professionals. Natural light and expert posing bring out the real you.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    count: "500+ sessions",
  },
  {
    name: "Commercial",
    desc: "Brand photography, product shoots, corporate headshots, and marketing imagery that elevates your business and drives results.",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&q=80",
    count: "150+ brands",
  },
];

const packages = [
  {
    name: "Essentials",
    price: "$1,200",
    desc: "Perfect for smaller events and portrait sessions",
    features: [
      "3-hour photo coverage",
      "1 photographer",
      "150+ edited images",
      "Online gallery with downloads",
      "Print release included",
      "2-week turnaround",
    ],
    popular: false,
  },
  {
    name: "Signature",
    price: "$2,800",
    desc: "Our most popular package for weddings and events",
    features: [
      "8-hour photo coverage",
      "2 photographers",
      "500+ edited images",
      "Engagement session included",
      "Premium online gallery",
      "Custom USB keepsake",
      "1-week turnaround",
      "Complimentary 16x20 print",
    ],
    popular: true,
  },
  {
    name: "Luxury",
    price: "$4,500",
    desc: "The complete, all-inclusive experience for your milestone",
    features: [
      "Full-day coverage (12 hours)",
      "2 photographers + assistant",
      "800+ edited images",
      "Engagement + bridal session",
      "Premium leather album",
      "Canvas wall art collection",
      "Same-week sneak peeks",
      "Second shooter for ceremony",
      "Drone aerial coverage",
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Amanda & Jake",
    text: "Our wedding photos are beyond anything we imagined. Every emotion, every detail captured flawlessly. We have cried happy tears looking through them more times than we can count.",
    sessionType: "Wedding",
    rating: 5,
  },
  {
    name: "Sarah K.",
    text: "The portrait session was so comfortable and natural. The photos do not look posed at all. My family was blown away by the quality and artistry. Truly exceptional work.",
    sessionType: "Family Portrait",
    rating: 5,
  },
  {
    name: "Pinnacle Brands",
    text: "Our product photography doubled our e-commerce conversion rate. The attention to lighting, styling, and brand consistency was remarkable. A true professional.",
    sessionType: "Commercial",
    rating: 5,
  },
];

const bookingSteps = [
  { step: "01", title: "Reach Out", desc: "Fill out our inquiry form or give us a call. We will respond within 24 hours with availability and details." },
  { step: "02", title: "Consultation", desc: "We meet (in person or video) to discuss your vision, style preferences, locations, and create a custom shot list." },
  { step: "03", title: "Shoot Day", desc: "We bring the artistry, gear, and creative direction. You bring yourself. We handle everything from setup to direction." },
  { step: "04", title: "Delivery", desc: "Receive your professionally edited images in a curated online gallery with full download and print rights." },
];

const faqs = [
  {
    q: "How far in advance should I book?",
    a: "For weddings, we recommend booking 8-12 months in advance, especially for peak season (May-October). Portrait sessions can typically be booked 2-4 weeks out. Contact us to check availability.",
  },
  {
    q: "Do you travel for sessions?",
    a: "Absolutely. We are based in Olympia, WA but travel throughout the Pacific Northwest at no extra charge. Destination sessions beyond 100 miles may include a small travel fee.",
  },
  {
    q: "How many photos will I receive?",
    a: "It depends on the package and event length. Weddings typically yield 500-800+ edited images. Portrait sessions deliver 150+ images. Every photo is individually color-graded and retouched.",
  },
  {
    q: "Can I print my own photos?",
    a: "Yes. Every package includes a full print release so you can make unlimited prints anywhere you choose. We also offer fine art prints and albums through our professional lab.",
  },
  {
    q: "What happens if it rains on my wedding day?",
    a: "Some of the most stunning photos happen in overcast or rainy conditions. We always have a weather contingency plan, and we bring gear for any conditions. Rain never ruins a great session.",
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
        className="inline-block text-[#a855f7] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#a855f7]/20 bg-[#a855f7]/5"
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
        <span className="text-[#a855f7]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#a855f7] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PhotographyTemplate() {
  return (
    <TemplateLayout
      businessName="Blue Ridge Photography"
      tagline="Artistry. Emotion. Storytelling. Premium photography that captures the moments that matter most."
      accentColor="#a855f7"
      accentColorLight="#c084fc"
      heroGradient="linear-gradient(135deg, #f5f0ff 0%, #ede5ff 100%)"
      themeMode="light"
      heroImage="https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1400&q=80"
      phone="(360) 555-0115"
      address="Olympia, WA"
    >
      {/* ════════════════ Accent Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#a855f7] via-[#9333ea] to-[#a855f7] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <CameraIcon />
            <p className="text-sm font-bold tracking-wide">ARTISTRY &mdash; EMOTION &mdash; STORYTELLING</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="text-xs font-bold tracking-wider">BOOKING 2026 SEASON NOW</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#faf9f7] border-b border-[#a855f7]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#a855f7]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "800+", label: "Sessions Delivered", icon: <CameraIcon /> },
              { value: "12+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "200+", label: "Weddings Shot", icon: <ImageIcon /> },
              { value: "100%", label: "5-Star Reviews", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#a855f7]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Portfolio Gallery ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <AperturePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#a855f7]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#a855f7]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PORTFOLIO"
            title="Stories Through a Lens"
            highlightWord="Lens"
            subtitle="Every frame tells a story. Browse our work across weddings, portraits, and commercial photography."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {portfolioCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-gray-200 hover:border-[#a855f7]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f7] via-[#faf9f7]/60 to-transparent" />
                  {/* Count badge */}
                  <div className="absolute top-4 right-4 bg-[#a855f7]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                    {cat.count}
                  </div>
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                    <p className="text-muted text-sm leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Packages (3-Tier Pricing) ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f0ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#a855f7]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="INVESTMENT"
            title="Photography Packages"
            highlightWord="Packages"
            subtitle="Transparent pricing with no hidden fees. Every package includes professionally edited images and print rights."
          />
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col ${
                  pkg.popular
                    ? "border-[#a855f7]/40 bg-gradient-to-b from-[#a855f7]/[0.08] to-transparent scale-[1.02]"
                    : "border-gray-200 hover:border-[#a855f7]/30 bg-white"
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7]" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#a855f715,transparent_70%)]" />
                <div className="relative z-10 flex flex-col flex-1">
                  {pkg.popular && (
                    <span className="inline-block self-start text-[10px] font-bold uppercase tracking-[0.2em] text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/20 px-3 py-1 rounded-full mb-4">
                      MOST POPULAR
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                  <p className="text-muted text-sm mb-4">{pkg.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#a855f7]">
                      {pkg.price}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <span className="text-[#a855f7] mt-0.5 shrink-0"><CheckCircleIcon /></span>
                        <span className="text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-300 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white hover:from-[#c084fc] hover:to-[#a855f7] shadow-lg shadow-[#a855f7]/20"
                        : "border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 hover:border-[#a855f7]/50"
                    }`}
                  >
                    Choose {pkg.name}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ About the Photographer ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#a855f7]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#a855f7]/4" />
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
                <div className="absolute top-0 left-0 w-[75%] h-[70%] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl z-10">
                  <img
                    src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80"
                    alt="Photographer at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80"
                    alt="Camera detail"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#a855f7] rounded-2xl px-5 py-4 shadow-xl shadow-[#a855f7]/20 border border-[#c084fc]/30">
                  <span className="block text-3xl font-extrabold text-[#1c1917] leading-none">12+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b5563]">Years of<br />Artistry</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#a855f7]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#a855f7]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="THE ARTIST"
                title="Meet Your Photographer"
                highlightWord="Photographer"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                Hi, I&apos;m Alex Mercer, the founder and lead photographer at Blue Ridge Photography. For over a decade, I have been capturing the most meaningful moments for families and businesses across the Pacific Northwest.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                My approach is simple: real emotion, natural light, and cinematic composition. I do not just take photos &mdash; I craft visual stories that you will treasure for generations. Every session is personal, intentional, and designed around you.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <ApertureIcon />, title: "Cinematic Style", desc: "Rich tones, dramatic light, and editorial composition in every frame" },
                  { icon: <LensIcon />, title: "Premium Gear", desc: "Professional-grade cameras, lenses, and lighting for flawless results" },
                  { icon: <FrameIcon />, title: "Full Service", desc: "From consultation to gallery delivery, a seamless experience start to finish" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-[#a855f7]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] shrink-0">
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

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f0ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#a855f7]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#a855f7" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#a855f7" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#a855f7" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT LOVE"
            title="What Clients Say"
            highlightWord="Clients"
            subtitle="Real words from real people who trusted Blue Ridge Photography with their most cherished moments."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#a855f7]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#a855f7]/40 via-[#a855f7]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#a855f710,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a855f7]/70 bg-[#a855f7]/8 border border-[#a855f7]/10 px-2.5 py-1 rounded-full">
                    {t.sessionType}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#a855f7] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7]/30 to-[#a855f7]/10 flex items-center justify-center text-sm font-bold text-[#a855f7]">
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

      {/* ════════════════ Booking Process ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <AperturePattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#a855f7]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#a855f7]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW IT WORKS"
            title="The Booking Process"
            highlightWord="Process"
            subtitle="From initial inquiry to gallery delivery, we make every step seamless and enjoyable."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookingSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-7 rounded-2xl border border-gray-200 hover:border-[#a855f7]/30 bg-white transition-all duration-500 shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#a855f712,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#a855f7]/30 to-[#a855f7]/5 block mb-4">{item.step}</span>
                  <h4 className="font-bold mb-2 group-hover:text-[#a855f7] transition-colors duration-300">{item.title}</h4>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #faf9f7 0%, #f5f0ff 50%, #faf9f7 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#a855f7]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#a855f7]/4" />
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
                className="group p-6 rounded-2xl border border-gray-200 hover:border-[#a855f7]/20 transition-all duration-500 overflow-hidden relative bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#a855f710,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-[#1c1917] group-hover:text-[#a855f7] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Inquiry CTA ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #ffffff 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#a855f7]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#a855f7]/20 relative overflow-hidden bg-gradient-to-b from-[#a855f7]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#a855f715,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#a855f7]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#a855f7]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#a855f7]/10 text-[#a855f7] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#a855f7]/20">
                  <CameraIcon />
                  LET&apos;S CREATE TOGETHER
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Send an <span className="text-[#a855f7]">Inquiry</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your vision and we will craft a custom photography experience around you. We respond within 24 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#a855f7]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#a855f7]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#a855f7]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Session Type (Wedding, Portrait, etc.)"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#a855f7]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your vision, preferred dates, and any special requests..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#a855f7]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white font-bold text-lg hover:from-[#c084fc] hover:to-[#a855f7] transition-all duration-300 shadow-lg shadow-[#a855f7]/20"
                >
                  Send Inquiry
                </button>
                <p className="text-center text-gray-400 text-xs">
                  No commitment required. We will follow up within 24 hours with availability and a custom quote.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7]/5 via-[#a855f7]/[0.02] to-white" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#a855f7]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#a855f7] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#a855f7]/20 bg-[#a855f7]/5">
              YOUR STORY AWAITS
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Every Moment Deserves <span className="text-[#a855f7]">Artistry</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Whether it is a once-in-a-lifetime celebration or a brand that needs to stand out, Blue Ridge Photography turns your vision into timeless imagery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white font-bold items-center justify-center text-lg hover:from-[#c084fc] hover:to-[#a855f7] transition-all duration-300 shadow-lg shadow-[#a855f7]/25 gap-2"
              >
                <span>Book Your Session</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:3605550115"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#a855f7]/30 text-[#a855f7] font-bold items-center justify-center text-lg hover:bg-[#a855f7]/10 hover:border-[#a855f7]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (360) 555-0115</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
