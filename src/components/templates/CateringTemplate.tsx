"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const PlateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

const ChefHatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M6 20h12M6 20V13M18 20V13M6 13a4 4 0 01-1-7.874A5.002 5.002 0 0115 4a5 5 0 014.9 4.03A3.5 3.5 0 0118 13" />
  </svg>
);

const WineGlassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M8 2h8l-1 9a4 4 0 01-3 3.874V20h3v2H9v-2h3v-5.126A4 4 0 019 11L8 2z" />
    <path d="M7 6h10" />
  </svg>
);

const UtensilsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 002-2V2M6 2v20M17.5 2c-1.4 0-2.5 2.7-2.5 6 0 2.2 1.1 4 2.5 4s2.5-1.8 2.5-4c0-3.3-1.1-6-2.5-6zM17.5 12v10" />
  </svg>
);

const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22c4.97 0 8-3.58 8-8 0-5.5-4-8-6-12-2 4-6 6.5-6 12 0 4.42 3.03 8 8 8z" />
    <path d="M12 22c-2 0-4-1.5-4-4 0-3 2-4.5 3-6.5 1 2 3 3.5 3 6.5 0 2.5-2 4-4 4z" />
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M2 18h20v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zM4 18v-3a2 2 0 012-2h12a2 2 0 012 2v3M12 4v2M8 4v2M16 4v2" />
    <path d="M2 18c2-2 4-3 6-3s4 1 6 3" />
    <rect x="7" y="6" width="2" height="7" rx="1" />
    <rect x="11" y="6" width="2" height="7" rx="1" />
    <rect x="15" y="6" width="2" height="7" rx="1" />
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

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="cateringGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fb923c" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cateringGrid)" />
  </svg>
);

/* ───────────────────────── Plate SVG Decoration ───────────────────────── */

const PlateDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" viewBox="0 0 800 400">
    <circle cx="400" cy="200" r="120" stroke="#fb923c" strokeWidth="0.8" fill="none" />
    <circle cx="400" cy="200" r="80" stroke="#fb923c" strokeWidth="0.5" fill="none" />
    <circle cx="400" cy="200" r="40" stroke="#fb923c" strokeWidth="0.3" fill="none" />
    <path d="M280 200 Q340 150 400 200 Q460 250 520 200" stroke="#fb923c" strokeWidth="0.4" fill="none" />
    <path d="M300 140 L500 260M300 260 L500 140" stroke="#fb923c" strokeWidth="0.2" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Wedding Catering",
    desc: "From intimate ceremonies to grand ballroom receptions. Custom menus, tasting sessions, and white-glove service that makes your day absolutely flawless.",
    icon: <WineGlassIcon />,
    tags: ["Plated Dinner", "Buffet", "Cocktail Hour"],
  },
  {
    name: "Corporate Events",
    desc: "Impress clients and energize teams with executive lunch spreads, gala dinners, product launches, and conference-ready catering built for impact.",
    icon: <PlateIcon />,
    tags: ["Conferences", "Galas", "Working Lunches"],
  },
  {
    name: "Private Parties",
    desc: "Birthday bashes, anniversaries, milestone celebrations. Fully customized menus that match your theme and wow every single guest.",
    icon: <CakeIcon />,
    tags: ["Birthdays", "Anniversaries", "Graduations"],
  },
  {
    name: "BBQ & Outdoor",
    desc: "Slow-smoked brisket, cedar-plank salmon, grilled seasonal vegetables. Rustic outdoor dining that delivers bold Pacific Northwest flavor.",
    icon: <FireIcon />,
    tags: ["Smoked Meats", "Seafood", "Farm Tables"],
  },
  {
    name: "Holiday Catering",
    desc: "Thanksgiving feasts, holiday parties, New Year galas. Seasonal menus crafted with locally sourced ingredients and festive elegance.",
    icon: <ChefHatIcon />,
    tags: ["Thanksgiving", "Holiday Party", "New Year"],
  },
  {
    name: "Meal Prep Programs",
    desc: "Weekly chef-prepared meals delivered to your office or home. Health-focused, portion-controlled, and bursting with fresh seasonal flavor.",
    icon: <UtensilsIcon />,
    tags: ["Weekly Delivery", "Health-Focused", "Custom Plans"],
  },
];

const sampleMenus = [
  {
    style: "Pacific Northwest",
    desc: "Locally sourced, ocean-to-table cuisine celebrating the best of Washington State.",
    items: [
      "Cedar-Plank Wild Salmon with Dill Cream",
      "Dungeness Crab Cakes with Lemon Aioli",
      "Herb-Crusted Rack of Lamb",
      "Roasted Beet & Goat Cheese Salad",
      "Huckleberry Panna Cotta",
    ],
    accent: "FROM $68/PERSON",
  },
  {
    style: "Mediterranean Feast",
    desc: "Sun-kissed flavors from Greece, Italy, and the coast of Spain, crafted with local ingredients.",
    items: [
      "Grilled Halloumi & Fig Bruschetta",
      "Slow-Braised Lamb Shoulder with Tzatziki",
      "Wood-Fired Eggplant Parmesan",
      "Saffron Risotto with Prawns",
      "Olive Oil Cake with Citrus Glaze",
    ],
    accent: "FROM $62/PERSON",
  },
  {
    style: "Asian Fusion",
    desc: "Bold, layered flavors blending Japanese, Thai, and Korean traditions with modern technique.",
    items: [
      "Tuna Poke Wonton Crisps",
      "Miso-Glazed Black Cod",
      "Thai Basil Chicken Lettuce Wraps",
      "Korean Short Rib Sliders",
      "Matcha White Chocolate Mousse",
    ],
    accent: "FROM $58/PERSON",
  },
];

const planningSteps = [
  {
    step: "01",
    title: "Free Consultation",
    desc: "Tell us your vision, guest count, and dietary needs. We listen, take notes, and build a plan around your event.",
  },
  {
    step: "02",
    title: "Menu Design",
    desc: "Our executive chef crafts a custom menu tailored to your theme. Includes a private tasting session for you and your guests.",
  },
  {
    step: "03",
    title: "Logistics & Setup",
    desc: "We coordinate venue layouts, staffing, rentals, and timelines so every detail is handled well before the big day.",
  },
  {
    step: "04",
    title: "Flawless Execution",
    desc: "Day-of, our team arrives early, sets up beautifully, serves with precision, and handles all cleanup. You just enjoy.",
  },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80", alt: "Elegant plated dinner" },
  { src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80", alt: "Wedding reception table" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", alt: "Gourmet appetizer spread" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", alt: "Fine dining presentation" },
  { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80", alt: "Outdoor BBQ event" },
  { src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80", alt: "Dessert display" },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "Our wedding was perfection because of Pacific Plate. Every single guest commented on the food. The salmon was the best I have ever tasted. Truly unforgettable.",
    eventType: "Wedding",
    rating: 5,
  },
  {
    name: "David K.",
    text: "They catered our company gala for 400 people and it ran like clockwork. The executive team was blown away. Already booked them for next year.",
    eventType: "Corporate",
    rating: 5,
  },
  {
    name: "Lisa T.",
    text: "The BBQ spread for my husband's 50th was incredible. Brisket that melted in your mouth, sides that tasted homemade, and service that made me feel like a VIP.",
    eventType: "Private Party",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How far in advance should we book?",
    a: "We recommend booking at least 4 to 6 weeks ahead for most events. For weddings and large galas, 3 to 6 months is ideal to ensure your preferred date and menu customization.",
  },
  {
    q: "Can you accommodate dietary restrictions?",
    a: "Absolutely. We design menus for vegetarian, vegan, gluten-free, kosher, halal, and allergy-specific needs. Just let us know during your consultation and we will craft a perfect menu.",
  },
  {
    q: "Do you provide staff and rentals?",
    a: "Yes. We provide professional servers, bartenders, chefs, and can coordinate tables, linens, glassware, and all event rentals through our trusted partners.",
  },
  {
    q: "What is the minimum guest count?",
    a: "Our catering services start at 20 guests. For smaller intimate gatherings, we offer our private chef experience which covers groups of 6 to 20.",
  },
  {
    q: "Is there a tasting before the event?",
    a: "Yes. Every full-service catering package includes a complimentary tasting session where you can sample and refine your menu selections before the big day.",
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
        className="inline-block text-[#fb923c] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#fb923c]/20 bg-[#fb923c]/5"
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
        <span className="text-[#fb923c]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#fb923c] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function CateringTemplate() {
  return (
    <TemplateLayout
      businessName="Pacific Plate Catering"
      tagline="Flavor. Celebration. Unforgettable events. Seattle's premier catering for weddings, corporate galas, and private gatherings."
      accentColor="#fb923c"
      accentColorLight="#fdba74"
      heroGradient="linear-gradient(135deg, #1a1208 0%, #13100a 100%)"
      heroImage="https://images.unsplash.com/photo-1555244162-803834f70033?w=1400&q=80"
      phone="(206) 555-0138"
      address="312 Pike Place, Seattle, WA"
    >
      {/* ════════════════ Flavor Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#fb923c] via-[#f97316] to-[#fb923c] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <ChefHatIcon />
            <p className="text-sm font-bold tracking-wide">FLAVOR &mdash; CELEBRATION &mdash; UNFORGETTABLE EVENTS</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-200 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300" />
            </span>
            <span className="text-xs font-bold tracking-wider">BOOK YOUR TASTING: (206) 555-0138</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a08] border-b border-[#fb923c]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#fb923c]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,000+", label: "Events Catered", icon: <PlateIcon /> },
              { value: "15+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "50K+", label: "Guests Served", icon: <UtensilsIcon /> },
              { value: "99%", label: "Client Satisfaction", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#fb923c]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #110e08 50%, #0a0906 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#fb923c]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#fb923c]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Catering Services"
            highlightWord="Services"
            subtitle="From elegant plated dinners to smoky outdoor BBQ, every event is crafted with obsessive attention to flavor and flawless execution."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb923c15,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb923c]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center text-[#fb923c] group-hover:bg-[#fb923c]/20 group-hover:border-[#fb923c]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#fb923c]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#fb923c] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#fb923c]/70 bg-[#fb923c]/8 border border-[#fb923c]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Sample Menus ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #110e08 0%, #15110a 50%, #110e08 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <PlateDecoration />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#fb923c]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="TASTE THE DIFFERENCE"
            title="Sample Menus"
            highlightWord="Menus"
            subtitle="Three signature cuisine styles. Every dish crafted with locally sourced ingredients and served with Pacific Northwest soul."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {sampleMenus.map((menu, i) => (
              <motion.div
                key={menu.style}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb923c12,transparent_70%)]" />
                <div className="p-7">
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb923c]/70 bg-[#fb923c]/8 border border-[#fb923c]/10 px-2.5 py-1 rounded-full">
                      {menu.accent}
                    </span>
                    <h3 className="text-xl font-bold mt-4 mb-2 group-hover:text-[#fb923c] transition-colors duration-300">{menu.style}</h3>
                    <p className="text-muted text-sm leading-relaxed mb-6">{menu.desc}</p>
                    <div className="space-y-3">
                      {menu.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="w-5 h-5 shrink-0 rounded-full bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#fb923c]" />
                          </div>
                          <span className="text-sm text-white/80">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Bottom accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#fb923c]/20 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Event Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0b07 50%, #0a0906 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#fb923c]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR WORK"
            title="Event Gallery"
            highlightWord="Gallery"
            subtitle="A glimpse into the celebrations, flavors, and moments we have had the honor to create."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#fb923c]/30 transition-all duration-500"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white text-sm font-semibold">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Planning Process ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #110e08 0%, #15110a 50%, #110e08 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#fb923c]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HOW IT WORKS"
            title="Your Planning Process"
            highlightWord="Process"
            subtitle="From first call to final cleanup, we handle every detail so you can focus on celebrating."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planningSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02] text-center"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb923c12,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center text-[#fb923c] text-xl font-extrabold mb-5 group-hover:bg-[#fb923c]/20 group-hover:scale-110 transition-all duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#fb923c] transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
                {/* Connector line (visible on desktop) */}
                {i < planningSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-[#fb923c]/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#fb923c]/10 to-[#0a0906]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb923c]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb923c]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#fb923c" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#fb923c" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#fb923c" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#fb923c]">PACIFIC PLATE?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ChefHatIcon />, title: "Executive Chefs", desc: "Every event led by a classically trained chef with 15+ years of experience" },
              { icon: <PlateIcon />, title: "Farm-to-Table", desc: "Locally sourced, seasonal ingredients from Washington farms and fisheries" },
              { icon: <FireIcon />, title: "Bold Flavors", desc: "Pacific Northwest soul meets global technique for unforgettable taste" },
              { icon: <WineGlassIcon />, title: "Full Service", desc: "Staff, rentals, setup, and cleanup. We handle every last detail for you" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center text-[#fb923c] mb-4 group-hover:bg-[#fb923c]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0b07 50%, #0a0906 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#fb923c]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#fb923c" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#fb923c" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#fb923c" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Loved by Thousands"
            highlightWord="Thousands"
            subtitle="Real stories from real clients who trusted us with their most important celebrations."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#fb923c]/40 via-[#fb923c]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#fb923c10,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fb923c]/70 bg-[#fb923c]/8 border border-[#fb923c]/10 px-2.5 py-1 rounded-full">
                    {t.eventType}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#fb923c] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fb923c]/30 to-[#fb923c]/10 flex items-center justify-center text-sm font-bold text-[#fb923c]">
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

      {/* ════════════════ Quote Request CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #110e08 0%, #15110a 50%, #110e08 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#fb923c]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#fb923c]/20 relative overflow-hidden bg-gradient-to-b from-[#fb923c]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#fb923c15,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#fb923c]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#fb923c]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#fb923c]/10 text-[#fb923c] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#fb923c]/20">
                  <UtensilsIcon />
                  FREE TASTING INCLUDED
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Request a <span className="text-[#fb923c]">Custom Quote</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your event and we will create a personalized proposal with menu options, pricing, and a complimentary tasting invitation.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#fb923c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fb923c]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#fb923c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fb923c]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#fb923c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fb923c]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Event Date"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#fb923c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fb923c]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Tell us about your event (guest count, venue, cuisine preferences)..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#fb923c]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#fb923c]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white font-bold text-lg hover:from-[#fdba74] hover:to-[#fb923c] transition-all duration-300 shadow-lg shadow-[#fb923c]/20"
                >
                  Get Your Free Quote
                </button>
                <p className="text-center text-white/30 text-xs">
                  We respond within 24 hours with a customized proposal and tasting invitation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0906 0%, #0d0b07 50%, #0a0906 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#fb923c]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#fb923c]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#fb923c]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#fb923c10,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center text-[#fb923c] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#fb923c] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#fb923c]/10 via-[#fb923c]/5 to-[#0a0906]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fb923c]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#fb923c]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#fb923c] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#fb923c]/20 bg-[#fb923c]/5">
              BOOK NOW
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Make Your Next Event <span className="text-[#fb923c]">Unforgettable</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Dates fill up fast, especially during wedding and holiday season. Secure your date now and let us create something extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white font-bold items-center justify-center text-lg hover:from-[#fdba74] hover:to-[#fb923c] transition-all duration-300 shadow-lg shadow-[#fb923c]/25 gap-2"
              >
                <span>Request a Quote</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550138"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#fb923c]/30 text-[#fb923c] font-bold items-center justify-center text-lg hover:bg-[#fb923c]/10 hover:border-[#fb923c]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (206) 555-0138</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
