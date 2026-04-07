"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const HouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const DoorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
    <path d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
    <circle cx="15.5" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const HandshakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M7 11l4-4 3.5 3.5L18 7" />
    <path d="M20 7v4h-4" />
    <path d="M4 17l4-4" />
    <path d="M15 17l-3-3" />
  </svg>
);

const BedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M3 7v10M3 13h18M21 7v10M7 13V9a2 2 0 012-2h6a2 2 0 012 2v4" />
  </svg>
);

const BathIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h1" />
  </svg>
);

const RulerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M3 21h18M3 21V3l6 4v2l-3-2v14h15" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="reGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c8a45e" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#reGrid)" />
  </svg>
);

/* ───────────────────────── House Outline Pattern ───────────────────────── */

const HousePattern = ({ opacity = 0.025 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="housePat" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M60 10 L100 40 L100 100 L20 100 L20 40 Z" fill="none" stroke="#c8a45e" strokeWidth="0.4" />
        <path d="M50 100 L50 70 L70 70 L70 100" fill="none" stroke="#c8a45e" strokeWidth="0.3" />
        <path d="M30 55 L30 75 L45 75 L45 55 Z" fill="none" stroke="#c8a45e" strokeWidth="0.3" />
        <path d="M75 55 L75 75 L90 75 L90 55 Z" fill="none" stroke="#c8a45e" strokeWidth="0.3" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#housePat)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const listings = [
  { address: "142 Oak Ridge Drive", price: "$425,000", beds: 4, baths: 3, sqft: "2,400", tag: "New Listing", neighborhood: "Westlake Hills", image: "https://images.unsplash.com/photo-1625602812206-5ec545ca1231?w=600&q=80" },
  { address: "89 Lakewood Blvd", price: "$675,000", beds: 5, baths: 4, sqft: "3,200", tag: "Featured", neighborhood: "Lakefront", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80" },
  { address: "301 Maple Court", price: "$299,000", beds: 3, baths: 2, sqft: "1,800", tag: "Open House", neighborhood: "Downtown", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80" },
  { address: "55 Sunset Terrace", price: "$525,000", beds: 4, baths: 3, sqft: "2,800", tag: "Reduced", neighborhood: "Sunset Ridge", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80" },
  { address: "712 Birch Lane", price: "$389,000", beds: 3, baths: 2, sqft: "2,100", tag: "New Listing", neighborhood: "Maplewood", image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80" },
  { address: "28 Crestview Heights", price: "$850,000", beds: 6, baths: 5, sqft: "4,100", tag: "Luxury", neighborhood: "Crestview Estates", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80" },
];

const recentlySold = [
  { address: "45 Elm Street", price: "$415,000", daysOnMarket: 8 },
  { address: "220 Park Ave", price: "$730,000", daysOnMarket: 12 },
  { address: "18 Willow Creek Dr", price: "$340,000", daysOnMarket: 5 },
  { address: "901 Summit Blvd", price: "$1,200,000", daysOnMarket: 14 },
  { address: "67 Riverside Ct", price: "$560,000", daysOnMarket: 6 },
];

const services = [
  {
    name: "Buyer Representation",
    desc: "From dream home discovery to closing day, we guide every step with white-glove service and fierce negotiation.",
    icon: <KeyIcon />,
    tags: ["First-Time Buyers", "Luxury Homes", "Relocation"],
  },
  {
    name: "Seller Services",
    desc: "Strategic pricing, professional staging, and aggressive marketing to sell your home fast and above asking.",
    icon: <HouseIcon />,
    tags: ["Market Analysis", "Staging", "Photography"],
  },
  {
    name: "Market Analysis",
    desc: "Hyper-local data insights, comparable sales, and trend forecasting so you make informed decisions every time.",
    icon: <ChartIcon />,
    tags: ["CMA Reports", "Price Trends", "Neighborhood Data"],
  },
  {
    name: "Investment Properties",
    desc: "Identify high-yield opportunities, multi-family units, and portfolio-building strategies for serious investors.",
    icon: <MapPinIcon />,
    tags: ["Multi-Family", "ROI Analysis", "Portfolio Growth"],
  },
  {
    name: "Relocation Assistance",
    desc: "Moving across town or across the country, we coordinate every detail so your transition is seamless.",
    icon: <DoorIcon />,
    tags: ["Corporate Relocation", "Area Tours", "School Districts"],
  },
  {
    name: "Luxury Estates",
    desc: "Discreet, high-touch service for premier properties. Private showings, curated marketing, and global reach.",
    icon: <ShieldIcon />,
    tags: ["Private Listings", "Global Network", "Concierge"],
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "Found our dream home in just two weeks. The team was incredible throughout the entire process. They anticipated every need before we even asked.",
    transactionType: "Buyer",
    rating: 5,
  },
  {
    name: "David & Lisa K.",
    text: "Sold our house above asking price in only 8 days on market. Their staging advice and marketing strategy made all the difference.",
    transactionType: "Seller",
    rating: 5,
  },
  {
    name: "James R.",
    text: "As a first-time buyer, I was overwhelmed. They made everything simple, explained each step, and negotiated a price well below listing.",
    transactionType: "First-Time Buyer",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How do I get started buying a home?",
    a: "Schedule a free consultation and we will assess your goals, budget, and timeline. We handle pre-approval referrals, neighborhood research, and property tours from day one.",
  },
  {
    q: "What makes Prestige Realty different?",
    a: "We limit our client roster to ensure every buyer and seller gets direct, senior-level attention. No hand-offs to junior agents, no assembly line. Your home is personal and our service matches.",
  },
  {
    q: "How do you price my home for sale?",
    a: "We prepare a comprehensive market analysis using recent comparable sales, current inventory, neighborhood trends, and property condition to recommend a strategic listing price.",
  },
  {
    q: "Do you handle luxury and investment properties?",
    a: "Absolutely. We have a dedicated luxury division with global marketing reach and a proven investor advisory practice specializing in multi-family and commercial opportunities.",
  },
  {
    q: "What areas do you serve?",
    a: "We specialize in the greater metro area including Westlake Hills, Lakefront, Sunset Ridge, Crestview Estates, Downtown, and surrounding communities.",
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
        className="inline-block text-[#c8a45e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#c8a45e]/20 bg-[#c8a45e]/5"
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
        <span className="text-[#c8a45e]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#c8a45e] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function RealEstateTemplate() {
  return (
    <TemplateLayout
      businessName="Prestige Realty"
      tagline="Your dream home is closer than you think. Expert agents, exclusive listings, and personalized service."
      accentColor="#c8a45e"
      accentColorLight="#d4b76a"
      heroGradient="linear-gradient(135deg, #1a1a0e 0%, #0d0d08 100%)"
      heroImage="https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=1400&q=80"
      phone="(555) 123-4567"
      address="Downtown, Your City"
    >
      {/* ════════════════ Luxury Marquee Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#c8a45e] via-[#b8943e] to-[#c8a45e] text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <KeyIcon />
            <p className="text-sm font-bold tracking-wide">EXCLUSIVE LISTINGS &mdash; COMPLIMENTARY HOME VALUATIONS</p>
          </div>
          <div className="flex items-center gap-2 bg-black/15 backdrop-blur-sm px-5 py-2 rounded-full border border-black/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
            </span>
            <span className="text-xs font-bold tracking-wider">AVAILABLE NOW: (555) 123-4567</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-14 relative overflow-hidden bg-[#0c0a06] border-b border-[#c8a45e]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#c8a45e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Homes Sold", icon: <TrophyIcon /> },
              { value: "$180M+", label: "In Sales Volume", icon: <ChartIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "4.9", label: "Client Rating", icon: <StarIcon /> },
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
                  <span className="text-[#c8a45e]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</span>
                </div>
                <span className="text-muted text-sm font-medium tracking-wide uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Featured Listings ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a06 0%, #0f0d08 50%, #0a0a06 100%)" }}
      >
        <HousePattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#c8a45e]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#c8a45e]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="FEATURED PROPERTIES"
            title="Find Your Dream Home"
            highlightWord="Dream Home"
            subtitle="Hand-selected properties representing the finest homes on the market. Each one inspected, verified, and ready for your private showing."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.address}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#c8a45e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#c8a45e15,transparent_70%)]" />
                {/* Numbered badge */}
                <div className="absolute top-0 right-0 z-30">
                  <span className="text-5xl font-extrabold text-white/[0.04] group-hover:text-[#c8a45e]/10 transition-colors duration-300 leading-none pr-4 pt-2 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Tags */}
                  <span className="absolute top-3 left-3 bg-[#c8a45e] text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10">
                    {listing.tag}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-full z-10 border border-white/10">
                    {listing.neighborhood}
                  </span>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center z-10">
                    <span className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-[#c8a45e] text-black text-sm font-bold px-8 py-3 rounded-full shadow-lg shadow-[#c8a45e]/20">
                      Schedule Showing
                    </span>
                  </div>
                  {/* Price overlay at bottom of image */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <p className="text-3xl font-extrabold text-white drop-shadow-lg">{listing.price}</p>
                  </div>
                </div>
                {/* Info */}
                <div className="p-5 relative z-10">
                  <p className="font-bold text-lg mb-3">{listing.address}</p>
                  <div className="flex gap-5 text-muted text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#c8a45e]"><BedIcon /></span>
                      {listing.beds} Beds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#c8a45e]"><BathIcon /></span>
                      {listing.baths} Baths
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#c8a45e]"><RulerIcon /></span>
                      {listing.sqft} sqft
                    </span>
                  </div>
                </div>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a45e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Recently Sold Ticker ════════════════ */}
      <section className="py-5 relative overflow-hidden bg-[#0c0a06] border-y border-[#c8a45e]/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[40%] w-[300px] h-[200px] rounded-full blur-[100px] bg-[#c8a45e]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-6 overflow-hidden">
            <span className="text-[#c8a45e] text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap flex-shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8a45e] animate-pulse" />
              Recently Sold
            </span>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {recentlySold.map((sold) => (
                <div key={sold.address} className="flex items-center gap-3 whitespace-nowrap flex-shrink-0 px-4 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[#c8a45e] text-[10px] font-bold tracking-wider bg-[#c8a45e]/10 px-2 py-0.5 rounded-full">SOLD</span>
                  <span className="text-sm text-muted">{sold.address}</span>
                  <span className="text-sm font-bold text-white">{sold.price}</span>
                  <span className="text-[10px] text-muted/60 uppercase tracking-wider">{sold.daysOnMarket} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ Our Services ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a06 0%, #100e08 50%, #0a0a06 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#c8a45e]/5" />
          <div className="absolute bottom-[15%] right-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#c8a45e]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE OFFER"
            title="Premium Services"
            highlightWord="Services"
            subtitle="Full-spectrum real estate representation backed by deep market knowledge and an uncompromising commitment to your success."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#c8a45e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#c8a45e15,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a45e]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#c8a45e]/10 border border-[#c8a45e]/20 flex items-center justify-center text-[#c8a45e] group-hover:bg-[#c8a45e]/20 group-hover:border-[#c8a45e]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#c8a45e]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#c8a45e] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#c8a45e]/70 bg-[#c8a45e]/8 border border-[#c8a45e]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ About / Your Trusted Agent ════════════════ */}
      <section
        id="about"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0d08 0%, #120f08 50%, #0f0d08 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#c8a45e]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#c8a45e]/4" />
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
                    src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&q=80"
                    alt="Real estate agent"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Secondary image */}
                <div className="absolute bottom-0 right-0 w-[65%] h-[55%] rounded-2xl overflow-hidden border-2 border-white/[0.06] shadow-2xl z-20">
                  <img
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80"
                    alt="Luxury home"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Accent badge - years */}
                <div className="absolute top-[55%] left-[60%] z-30 bg-[#c8a45e] rounded-2xl px-5 py-4 shadow-xl shadow-[#c8a45e]/20 border border-[#d4b76a]/30">
                  <span className="block text-3xl font-extrabold text-black leading-none">15+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/70">Years of<br />Excellence</span>
                </div>
                {/* Second badge - homes sold */}
                <div className="absolute top-[10%] right-[5%] z-30 bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-[#c8a45e]/30">
                  <span className="block text-2xl font-extrabold text-[#c8a45e] leading-none">500+</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Homes<br />Sold</span>
                </div>
                {/* Decorative corner lines */}
                <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#c8a45e]/20 rounded-tl-xl" />
                <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#c8a45e]/20 rounded-br-xl" />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                tag="YOUR TRUSTED AGENT"
                title="Unmatched Expertise"
                highlightWord="Expertise"
                center={false}
              />
              <p className="text-muted leading-relaxed mb-6 text-lg -mt-8">
                With over 15 years navigating the local market, Prestige Realty has become the name synonymous with results. We do not just list homes &mdash; we launch them.
              </p>
              <p className="text-muted leading-relaxed mb-8">
                Whether you&apos;re a first-time buyer searching for the perfect starter, an investor building a portfolio, or a seller who demands top dollar &mdash; our track record of $180M+ in closed transactions speaks for itself.
              </p>
              {/* Feature list */}
              <div className="space-y-4">
                {[
                  { icon: <HandshakeIcon />, title: "White-Glove Service", desc: "Direct access to your dedicated agent from first showing to closing day" },
                  { icon: <ShieldIcon />, title: "Market Intelligence", desc: "Real-time data, pricing strategies, and insider neighborhood knowledge" },
                  { icon: <KeyIcon />, title: "Results-Driven", desc: "Average 8 days on market, consistently above-asking final sale prices" },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#c8a45e]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#c8a45e]/10 border border-[#c8a45e]/20 flex items-center justify-center text-[#c8a45e] shrink-0">
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

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#c8a45e]/10 to-[#0a0a06]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a45e]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a45e]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#c8a45e" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#c8a45e" strokeWidth="0.5" fill="none" />
            <path d="M500 50 L580 130 L580 320 L420 320 L420 130 Z" stroke="#c8a45e" strokeWidth="0.4" fill="none" />
            <path d="M460 320 L460 240 L540 240 L540 320" stroke="#c8a45e" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#c8a45e]">PRESTIGE REALTY?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <HouseIcon />, title: "Exclusive Listings", desc: "Access to off-market properties and pre-list opportunities before anyone else" },
              { icon: <ChartIcon />, title: "Data-Driven", desc: "Every recommendation backed by comprehensive market data and analytics" },
              { icon: <PhoneIcon />, title: "Always Available", desc: "Seven days a week availability because your dream home does not keep business hours" },
              { icon: <ShieldIcon />, title: "Proven Results", desc: "500+ successful transactions totaling over $180 million in volume" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#c8a45e]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#c8a45e]/10 border border-[#c8a45e]/20 flex items-center justify-center text-[#c8a45e] mb-4 group-hover:bg-[#c8a45e]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #0a0a06 0%, #0d0b06 50%, #0a0a06 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#c8a45e]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#c8a45e" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#c8a45e" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#c8a45e" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT SUCCESS"
            title="Trusted by Hundreds"
            highlightWord="Hundreds"
            subtitle="Real stories from real clients who trusted us with the biggest transaction of their lives."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#c8a45e]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#c8a45e]/40 via-[#c8a45e]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#c8a45e10,transparent_70%)]" />
                <div className="relative z-10">
                  {/* Transaction type tag */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a45e]/70 bg-[#c8a45e]/8 border border-[#c8a45e]/10 px-2.5 py-1 rounded-full">
                    {t.transactionType}
                  </span>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#c8a45e] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8a45e]/30 to-[#c8a45e]/10 flex items-center justify-center text-sm font-bold text-[#c8a45e]">
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

      {/* ════════════════ Free Home Valuation CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0d08 0%, #130f08 50%, #0f0d08 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#c8a45e]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#c8a45e]/20 relative overflow-hidden bg-gradient-to-b from-[#c8a45e]/[0.06] to-transparent"
          >
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#c8a45e15,transparent_60%)]" />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#c8a45e]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#c8a45e]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#c8a45e]/10 text-[#c8a45e] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#c8a45e]/20">
                  <HouseIcon />
                  COMPLIMENTARY
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  What&apos;s Your <span className="text-[#c8a45e]">Home Worth?</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Get a free, no-obligation home valuation from our market experts. Find out what your property could sell for in today&apos;s market &mdash; delivered within 24 hours.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#c8a45e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c8a45e]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#c8a45e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c8a45e]/50 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter your home address..."
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#c8a45e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c8a45e]/50 transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#c8a45e]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c8a45e]/50 transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#c8a45e] to-[#b8943e] text-black font-bold text-lg hover:from-[#d4b76a] hover:to-[#c8a45e] transition-all duration-300 shadow-lg shadow-[#c8a45e]/20"
                >
                  Get Free Valuation
                </button>
                <p className="text-center text-white/30 text-xs">
                  No spam, no pressure. Just expert market insight delivered to your inbox.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a06 0%, #0d0b06 50%, #0a0a06 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#c8a45e]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#c8a45e]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#c8a45e]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#c8a45e10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#c8a45e]/10 border border-[#c8a45e]/20 flex items-center justify-center text-[#c8a45e] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#c8a45e] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8a45e]/10 via-[#c8a45e]/5 to-[#0a0a06]" />
        <HousePattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a45e]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#c8a45e]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#c8a45e] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#c8a45e]/20 bg-[#c8a45e]/5">
              YOUR NEXT CHAPTER
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to Find Your <span className="text-[#c8a45e]">Dream Home?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              The perfect property is out there waiting for you. Let us open the door. Schedule your complimentary consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#c8a45e] to-[#b8943e] text-black font-bold items-center justify-center text-lg hover:from-[#d4b76a] hover:to-[#c8a45e] transition-all duration-300 shadow-lg shadow-[#c8a45e]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:5551234567"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#c8a45e]/30 text-[#c8a45e] font-bold items-center justify-center text-lg hover:bg-[#c8a45e]/10 hover:border-[#c8a45e]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call Now</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
