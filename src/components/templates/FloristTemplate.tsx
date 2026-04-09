"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const FlowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 15c2.5-2 5-2.5 5-6a5 5 0 00-10 0c0 3.5 2.5 4 5 6z" />
    <path d="M12 15v7" />
    <path d="M9 18c-2 0-4-.5-4-2.5S7 12 9 12" />
    <path d="M15 18c2 0 4-.5 4-2.5S17 12 15 12" />
  </svg>
);

const RoseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 3c-1.5 2-4 3-4 6 0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2.5-4-4-6z" />
    <path d="M10 9c0 1.1.9 2 2 2s2-.9 2-2" />
    <path d="M12 13v8" />
    <path d="M8 17c-2-1-3-3-3-5" />
    <path d="M16 17c2-1 3-3 3-5" />
    <path d="M9 21h6" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
);

const RibbonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2a4 4 0 00-4 4c0 2.5 1.5 4 4 5 2.5-1 4-2.5 4-5a4 4 0 00-4-4z" />
    <path d="M8 11l-3 10 4-2 3 3 3-3 4 2-3-10" />
    <circle cx="12" cy="6" r="1.5" />
  </svg>
);

const VaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M8 2h8v3c0 0 2 1 2 4v2c0 2-1 3-2 4v4c0 1.5-1.5 3-4 3s-4-1.5-4-3v-4c-1-1-2-2-2-4V9c0-3 2-4 2-4V2z" />
    <path d="M10 2v3M14 2v3" />
    <path d="M9 12h6" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const SmallHeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

/* ───────────────────────── Floral Pattern ───────────────────────── */

const FloralPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="floralGrid" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="1" fill="#fb7185" />
        <circle cx="0" cy="0" r="0.5" fill="#fb7185" />
        <circle cx="80" cy="0" r="0.5" fill="#fb7185" />
        <circle cx="0" cy="80" r="0.5" fill="#fb7185" />
        <circle cx="80" cy="80" r="0.5" fill="#fb7185" />
        <path d="M20 40 Q30 30 40 40 Q50 30 60 40" stroke="#fb7185" strokeWidth="0.3" fill="none" />
        <path d="M40 20 Q30 30 40 40 Q30 50 40 60" stroke="#fb7185" strokeWidth="0.3" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#floralGrid)" />
  </svg>
);

const RoseSilhouette = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.025]" viewBox="0 0 1000 600">
    <path d="M200 300c0-80 60-140 120-140s80 40 80 80-40 100-80 140c-40-40-120-40-120-80z" stroke="#fb7185" strokeWidth="0.8" fill="none" />
    <path d="M700 250c0-60 40-100 80-100s60 30 60 60-30 80-60 100c-30-30-80-30-80-60z" stroke="#fb7185" strokeWidth="0.5" fill="none" />
    <path d="M500 400c-20-40-10-80 20-100s50-10 60 20-10 60-30 80c-20-10-40-10-50 0z" stroke="#fb7185" strokeWidth="0.4" fill="none" />
    <path d="M100 150 Q200 100 300 150 Q400 200 500 150" stroke="#fb7185" strokeWidth="0.3" fill="none" />
    <path d="M600 450 Q700 400 800 450 Q900 500 1000 450" stroke="#fb7185" strokeWidth="0.3" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Wedding Florals",
    desc: "Bridal bouquets, ceremony arches, centerpieces, and full venue transformations designed to make your dream wedding bloom into reality.",
    icon: <HeartIcon />,
    tags: ["Bridal Bouquets", "Ceremony Arches", "Centerpieces"],
  },
  {
    name: "Event Design",
    desc: "Corporate galas, charity dinners, milestone celebrations. Bespoke floral installations that set the perfect tone and leave lasting impressions.",
    icon: <RibbonIcon />,
    tags: ["Corporate Events", "Galas", "Celebrations"],
  },
  {
    name: "Flower Subscriptions",
    desc: "Fresh seasonal arrangements delivered to your door weekly, bi-weekly, or monthly. Curated by our designers to brighten every room in your home.",
    icon: <FlowerIcon />,
    tags: ["Weekly Delivery", "Seasonal", "Home Decor"],
  },
  {
    name: "Sympathy & Memorial",
    desc: "Thoughtful tribute arrangements, casket sprays, and memorial wreaths crafted with the utmost care and reverence during difficult times.",
    icon: <LeafIcon />,
    tags: ["Casket Sprays", "Wreaths", "Tributes"],
  },
  {
    name: "Everyday Arrangements",
    desc: "Birthdays, anniversaries, just because. Hand-crafted bouquets using the freshest blooms sourced from local and international growers.",
    icon: <VaseIcon />,
    tags: ["Birthdays", "Anniversaries", "Get Well"],
  },
  {
    name: "Corporate Accounts",
    desc: "Regular lobby installations, executive desk arrangements, and branded event florals that elevate your workplace with natural beauty.",
    icon: <RoseIcon />,
    tags: ["Office Flowers", "Lobby Design", "Branding"],
  },
];

const galleryItems = [
  { src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80", title: "Garden Romance Bouquet" },
  { src: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80", title: "Ceremony Arch in Bloom" },
  { src: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80", title: "Peony & Rose Cascade" },
  { src: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=600&q=80", title: "Wildflower Meadow" },
  { src: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80", title: "Luxury Centerpiece" },
  { src: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80", title: "Blush Bridal Collection" },
];

const weddingPackages = [
  {
    name: "Intimate",
    price: "$1,200",
    desc: "Up to 50 guests",
    features: ["Bridal bouquet", "1 bridesmaid bouquet", "2 boutonnieres", "6 table arrangements", "Complimentary consultation"],
  },
  {
    name: "Classic",
    price: "$3,500",
    desc: "Up to 150 guests",
    features: ["Bridal bouquet", "4 bridesmaid bouquets", "6 boutonnieres", "Ceremony arch florals", "15 table centerpieces", "Cake flowers", "Design consultation"],
    popular: true,
  },
  {
    name: "Grand",
    price: "$7,000+",
    desc: "150+ guests, full design",
    features: ["Full bridal party florals", "Ceremony installation", "25+ centerpieces", "Sweetheart table design", "Lounge area florals", "Day-of floral coordinator", "Custom design board"],
  },
];

const subscriptionPlans = [
  { name: "Petite Posy", price: "$35/week", desc: "A charming hand-tied bouquet perfect for a bedside table or small space." },
  { name: "Seasonal Signature", price: "$55/week", desc: "A lush designer arrangement showcasing the best of what is in season." },
  { name: "Luxe Living", price: "$95/week", desc: "A statement piece designed to transform your entryway or dining table." },
];

const seasonalSpecials = [
  { season: "Spring", title: "Cherry Blossom Romance", desc: "Delicate cherry blossoms paired with ranunculus and garden roses in blush and ivory." },
  { season: "Summer", title: "Sunlit Meadow", desc: "Vibrant sunflowers, dahlias, and wildflowers bursting with golden summer energy." },
  { season: "Autumn", title: "Harvest Warmth", desc: "Rich burgundy roses, amber chrysanthemums, and dried botanicals in copper tones." },
  { season: "Winter", title: "Frosted Elegance", desc: "White amaryllis, silver eucalyptus, and evergreen accents for a winter wonderland." },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "Bloom and Vine made our wedding absolutely magical. The ceremony arch took everyone's breath away and the centerpieces were beyond anything I imagined.",
    occasion: "Wedding",
    rating: 5,
  },
  {
    name: "David & Lisa K.",
    text: "We have been subscription members for over a year. Every single delivery feels like a gift. Our home has never looked or smelled more beautiful.",
    occasion: "Subscription",
    rating: 5,
  },
  {
    name: "Rachel T.",
    text: "They handled the flowers for our corporate gala with incredible professionalism. The installations were show-stopping and our guests could not stop talking about them.",
    occasion: "Corporate Event",
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
        className="inline-block text-[#fb7185] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#fb7185]/20 bg-[#fb7185]/5"
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
        <span className="text-[#fb7185]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#fb7185] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function FloristTemplate() {
  return (
    <TemplateLayout
      businessName="Bloom & Vine Florist"
      tagline="Artisan floral design for life's most beautiful moments. Hand-crafted with love in Seattle."
      accentColor="#fb7185"
      accentColorLight="#fda4af"
      heroGradient="linear-gradient(135deg, #fdf5f0 0%, #f0f5f0 50%, #fdf9f7 100%)"
      themeMode="light"
      heroImage="https://images.unsplash.com/photo-1469259943454-aa100abba749?w=1400&q=80"
      phone="(206) 555-0113"
      address="Pike Place Market District, Seattle, WA"
    >
      {/* ════════════════ Fresh Flowers Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#fb7185] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <FlowerIcon />
            <p className="text-sm font-bold tracking-wide">FRESH FLOWERS DAILY &mdash; SAME-DAY DELIVERY IN SEATTLE</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-xs font-bold tracking-wider">ORDER BY 1PM: (206) 555-0113</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#fdf9f7] border-b border-[#fb7185]/10">
        <FloralPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#fb7185]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,500+", label: "Weddings Designed" },
              { value: "15+", label: "Years of Artistry" },
              { value: "50K+", label: "Bouquets Delivered" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#fb7185]">
                  {stat.value}
                </span>
                <span className="block text-muted text-sm font-medium tracking-wide uppercase mt-2">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Services ════════════════ */}
      <section
        id="services"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #fdf9f7 50%, #ffffff 100%)" }}
      >
        <FloralPattern />
        <RoseSilhouette />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#fb7185]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#fb7185]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR CRAFT"
            title="Floral Services"
            highlightWord="Services"
            subtitle="From intimate bouquets to grand wedding installations, every stem is placed with intention, passion, and artisan care."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#fb7185]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb718515,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb7185]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/20 flex items-center justify-center text-[#fb7185] group-hover:bg-[#fb7185]/20 group-hover:border-[#fb7185]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-gray-100 group-hover:text-[#fb7185]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#fb7185] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#fb7185]/70 bg-[#fb7185]/8 border border-[#fb7185]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fff1f2 50%, #fdf9f7 100%)" }}
      >
        <FloralPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#fb7185]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR PORTFOLIO"
            title="Arrangement Gallery"
            highlightWord="Gallery"
            subtitle="A curated look at our recent designs, from garden-inspired romance to modern minimalist elegance."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-[#fb7185]/30 transition-all duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fdf9f7] via-[#fdf9f7]/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fb7185]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb7185]/70">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-[#fb7185] transition-colors duration-300">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Wedding Packages ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #fdf9f7 50%, #ffffff 100%)" }}
      >
        <FloralPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#fb7185]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#fb7185]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WEDDING FLORALS"
            title="Wedding Packages"
            highlightWord="Packages"
            subtitle="Transparent pricing, breathtaking results. Every package includes a complimentary design consultation."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {weddingPackages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  pkg.popular
                    ? "border-[#fb7185]/40 bg-gradient-to-b from-[#fb7185]/[0.08] to-transparent"
                    : "border-gray-200 hover:border-[#fb7185]/30 bg-white"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb7185] to-transparent" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb718510,transparent_70%)]" />
                <div className="relative z-10">
                  {pkg.popular && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/20 px-3 py-1 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                  <p className="text-muted text-sm mb-4">{pkg.desc}</p>
                  <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#fb7185] mb-6">
                    {pkg.price}
                  </p>
                  <div className="space-y-3">
                    {pkg.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#fb7185]/10 border border-[#fb7185]/20 flex items-center justify-center text-[#fb7185] shrink-0">
                          <CheckIcon />
                        </div>
                        <span className="text-sm text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`w-full h-12 rounded-xl font-bold text-sm mt-8 transition-all duration-300 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white hover:from-[#fda4af] hover:to-[#fb7185] shadow-lg shadow-[#fb7185]/20"
                        : "border border-[#fb7185]/30 text-[#fb7185] hover:bg-[#fb7185]/10"
                    }`}
                  >
                    Book Consultation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Subscription Plans ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fff1f2 50%, #fdf9f7 100%)" }}
      >
        <FloralPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[160px] bg-[#fb7185]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="FRESH EVERY WEEK"
            title="Flower Subscriptions"
            highlightWord="Subscriptions"
            subtitle="Bring the beauty of fresh flowers into your home or office with a curated subscription plan."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#fb7185]/30 transition-all duration-500 overflow-hidden bg-white text-center"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#fb718510,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#fb7185]/10 border border-[#fb7185]/20 flex items-center justify-center text-[#fb7185] mb-4 group-hover:bg-[#fb7185]/20 group-hover:scale-110 transition-all duration-300">
                    <FlowerIcon />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#fb7185] transition-colors duration-300">{plan.name}</h3>
                  <p className="text-2xl font-extrabold text-[#fb7185] mb-3">{plan.price}</p>
                  <p className="text-muted text-sm leading-relaxed">{plan.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Seasonal Specials ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #fdf9f7 50%, #ffffff 100%)" }}
      >
        <FloralPattern />
        <RoseSilhouette />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#fb7185]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="LIMITED EDITIONS"
            title="Seasonal Specials"
            highlightWord="Specials"
            subtitle="Exclusive collections that celebrate the unique beauty of each season, available for a limited time."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalSpecials.map((special, i) => (
              <motion.div
                key={special.season}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl border border-gray-200 hover:border-[#fb7185]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb718512,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb7185]/70 bg-[#fb7185]/8 border border-[#fb7185]/10 px-2.5 py-1 rounded-full">
                    {special.season}
                  </span>
                  <h3 className="text-lg font-bold mt-4 mb-3 group-hover:text-[#fb7185] transition-colors duration-300">{special.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{special.desc}</p>
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
        style={{ background: "linear-gradient(180deg, #fdf9f7 0%, #fff1f2 50%, #fdf9f7 100%)" }}
      >
        <FloralPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#fb7185]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#fb7185" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#fb7185" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#fb7185" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="KIND WORDS"
            title="Client Testimonials"
            highlightWord="Testimonials"
            subtitle="Hear from the couples, families, and businesses who trust us with their most meaningful moments."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#fb7185]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#fb7185]/40 via-[#fb7185]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#fb718510,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb7185]/70 bg-[#fb7185]/8 border border-[#fb7185]/10 px-2.5 py-1 rounded-full">
                    {t.occasion}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#fb7185] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fb7185]/30 to-[#fb7185]/10 flex items-center justify-center text-sm font-bold text-[#fb7185]">
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

      {/* ════════════════ Order / Inquiry CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #fdf9f7 50%, #ffffff 100%)" }}
      >
        <FloralPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#fb7185]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#fb7185]/20 relative overflow-hidden bg-gradient-to-b from-[#fb7185]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb718515,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#fb7185]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#fb7185]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#fb7185]/10 text-[#fb7185] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#fb7185]/20">
                  <CalendarIcon />
                  BOOK A CONSULTATION
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Order or <span className="text-[#fb7185]">Inquire</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your vision. Whether it is a wedding, event, or a simple bouquet, we would love to bring your floral dreams to life.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#fb7185]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#fb7185]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#fb7185]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Event Date (if applicable)"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#fb7185]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your floral vision..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#fb7185]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white font-bold text-lg hover:from-[#fda4af] hover:to-[#fb7185] transition-all duration-300 shadow-lg shadow-[#fb7185]/20"
                >
                  Send Inquiry
                </button>
                <p className="text-center text-gray-400 text-xs">
                  We respond to all inquiries within 24 hours. Same-day orders call (206) 555-0113 directly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fb7185]/5 via-[#fb7185]/[0.02] to-white" />
        <FloralPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb7185]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#fb7185]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#fb7185] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#fb7185]/20 bg-[#fb7185]/5">
              LET US CREATE SOMETHING BEAUTIFUL
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Every Bloom Tells a <span className="text-[#fb7185]">Story</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              From the first petal to the final ribbon, we pour our hearts into every arrangement. Let us make your next moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white font-bold items-center justify-center text-lg hover:from-[#fda4af] hover:to-[#fb7185] transition-all duration-300 shadow-lg shadow-[#fb7185]/25 gap-2"
              >
                <span>Order Now</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550113"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#fb7185]/30 text-[#fb7185] font-bold items-center justify-center text-lg hover:bg-[#fb7185]/10 hover:border-[#fb7185]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (206) 555-0113</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
