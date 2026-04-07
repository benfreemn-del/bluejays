"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const PawIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <ellipse cx="8" cy="7" rx="2.5" ry="3" />
    <ellipse cx="16" cy="7" rx="2.5" ry="3" />
    <ellipse cx="5" cy="14" rx="2" ry="2.5" />
    <ellipse cx="19" cy="14" rx="2" ry="2.5" />
    <path d="M12 20c3 0 5-2.5 5-5s-2-4-5-4-5 1.5-5 4 2 5 5 5z" />
  </svg>
);

const BoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M5.5 5.5a2.5 2.5 0 013.536 0L12 8.464l2.964-2.964a2.5 2.5 0 113.536 3.536L15.536 12l2.964 2.964a2.5 2.5 0 11-3.536 3.536L12 15.536 9.036 18.5a2.5 2.5 0 11-3.536-3.536L8.464 12 5.5 9.036a2.5 2.5 0 010-3.536z" />
  </svg>
);

const BathIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
    <path d="M6 12V5a2 2 0 012-2h1" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
    <circle cx="9" cy="9" r="0.75" fill="currentColor" />
    <circle cx="15" cy="9" r="0.75" fill="currentColor" />
    <path d="M7 20v2M17 20v2" />
  </svg>
);

const ScissorsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
  </svg>
);

const LeashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M12 11c-3 0-5 2-5 5v4h10v-4c0-3-2-5-5-5z" />
    <path d="M9 16h6M8 20h8" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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
      <pattern id="petGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4ade80" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#petGrid)" />
  </svg>
);

/* ───────────────────────── Paw Print SVG Decoration ───────────────────────── */

const PawDecoration = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 400">
    {/* Scattered paw prints */}
    <g transform="translate(100, 80) scale(1.5)" stroke="#4ade80" strokeWidth="0.8" fill="none">
      <ellipse cx="4" cy="3" rx="2" ry="2.5" />
      <ellipse cx="12" cy="3" rx="2" ry="2.5" />
      <ellipse cx="1" cy="10" rx="1.5" ry="2" />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" />
      <path d="M8 16c2.5 0 4-2 4-4s-1.5-3-4-3-4 1-4 3 1.5 4 4 4z" />
    </g>
    <g transform="translate(600, 250) scale(2) rotate(20)" stroke="#4ade80" strokeWidth="0.6" fill="none">
      <ellipse cx="4" cy="3" rx="2" ry="2.5" />
      <ellipse cx="12" cy="3" rx="2" ry="2.5" />
      <ellipse cx="1" cy="10" rx="1.5" ry="2" />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" />
      <path d="M8 16c2.5 0 4-2 4-4s-1.5-3-4-3-4 1-4 3 1.5 4 4 4z" />
    </g>
    <g transform="translate(350, 300) scale(1.2) rotate(-15)" stroke="#4ade80" strokeWidth="0.5" fill="none">
      <ellipse cx="4" cy="3" rx="2" ry="2.5" />
      <ellipse cx="12" cy="3" rx="2" ry="2.5" />
      <ellipse cx="1" cy="10" rx="1.5" ry="2" />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" />
      <path d="M8 16c2.5 0 4-2 4-4s-1.5-3-4-3-4 1-4 3 1.5 4 4 4z" />
    </g>
    <circle cx="200" cy="200" r="120" stroke="#4ade80" strokeWidth="0.3" fill="none" />
    <circle cx="600" cy="150" r="80" stroke="#4ade80" strokeWidth="0.2" fill="none" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Professional Grooming",
    desc: "Full-service grooming with breed-specific cuts, hypoallergenic shampoos, nail trimming, and ear cleaning. Your pet leaves looking and feeling their absolute best.",
    icon: <ScissorsIcon />,
    tags: ["Breed Cuts", "De-Shedding", "Nail Trim"],
  },
  {
    name: "Doggy Daycare",
    desc: "Supervised indoor and outdoor play in climate-controlled facilities. Socialization groups matched by size and temperament. Real-time webcam access for peace of mind.",
    icon: <PawIcon />,
    tags: ["Supervised Play", "Webcam Access", "Size Groups"],
  },
  {
    name: "Overnight Boarding",
    desc: "Luxury suites with plush bedding, bedtime snacks, and overnight attendants. Your pet gets belly rubs, not kennel stress. It feels like a sleepover, not a stay.",
    icon: <HeartIcon />,
    tags: ["Luxury Suites", "Overnight Staff", "Daily Reports"],
  },
  {
    name: "Dog Walking",
    desc: "GPS-tracked walks with certified handlers. Solo and small-group options. Photo updates after every walk so you can see the tail-wagging proof.",
    icon: <LeashIcon />,
    tags: ["GPS Tracked", "Photo Updates", "Flexible Schedule"],
  },
  {
    name: "Obedience Training",
    desc: "Positive reinforcement training from certified behaviorists. Puppy basics through advanced obedience. Private and group sessions available.",
    icon: <BoneIcon />,
    tags: ["Puppy Basics", "Advanced", "Behavior Mod"],
  },
  {
    name: "Pet Taxi",
    desc: "Safe, climate-controlled transport to vet appointments, groomers, daycare, or anywhere your pet needs to go. Fully insured and GPS-tracked.",
    icon: <BathIcon />,
    tags: ["Vet Trips", "Airport", "Fully Insured"],
  },
];

const groomingPackages = [
  {
    tier: "Fresh & Clean",
    price: "$45",
    desc: "The essentials for a happy, clean pet",
    features: [
      "Bath with premium shampoo",
      "Blow dry & brush out",
      "Nail trim & file",
      "Ear cleaning",
      "Bandana or bow",
    ],
    popular: false,
  },
  {
    tier: "Full Pamper",
    price: "$75",
    desc: "Our most popular package for total grooming",
    features: [
      "Everything in Fresh & Clean",
      "Breed-specific haircut",
      "Teeth brushing",
      "Paw pad trim",
      "De-shedding treatment",
      "Cologne spritz",
    ],
    popular: true,
  },
  {
    tier: "VIP Spa Day",
    price: "$110",
    desc: "The ultimate luxury experience for your best friend",
    features: [
      "Everything in Full Pamper",
      "Blueberry facial scrub",
      "Hot towel wrap",
      "Moisturizing paw balm",
      "Flea & tick treatment",
      "Plush robe & photo session",
    ],
    popular: false,
  },
];

const team = [
  {
    name: "Jessica Rivera",
    title: "Head Groomer",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&q=80",
    specialties: ["Breed Styling", "Show Cuts"],
    yearsExp: 12,
  },
  {
    name: "Marcus Chen",
    title: "Lead Trainer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    specialties: ["Behavior Mod", "Puppy Training"],
    yearsExp: 8,
  },
  {
    name: "Amy Larson",
    title: "Daycare Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    specialties: ["Socialization", "Special Needs"],
    yearsExp: 10,
  },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=600&q=80", alt: "Happy golden retriever after grooming" },
  { src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80", alt: "Dogs playing at daycare" },
  { src: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80", alt: "Puppy getting a bath" },
  { src: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=600&q=80", alt: "Dog walking in the park" },
  { src: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&q=80", alt: "Fluffy poodle after styling" },
  { src: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80", alt: "Cat grooming session" },
];

const testimonials = [
  {
    name: "Rachel P.",
    text: "My anxious rescue dog actually gets EXCITED to go to Happy Tails. The staff treats him like their own. Best daycare and grooming in Bellevue, no question.",
    serviceType: "Daycare",
    rating: 5,
  },
  {
    name: "James H.",
    text: "The VIP spa day transformed my poodle. She came back looking like a show dog and smelling incredible. The photo they sent me was frame-worthy.",
    serviceType: "Grooming",
    rating: 5,
  },
  {
    name: "Michelle K.",
    text: "Marcus worked miracles with our stubborn beagle. After six sessions of training, she walks on a leash perfectly and comes when called every time. Life-changing.",
    serviceType: "Training",
    rating: 5,
  },
];

const faqs = [
  {
    q: "What vaccinations are required?",
    a: "All dogs must be current on rabies, DHPP, and bordetella. Cats need rabies and FVRCP. We require proof of vaccination before the first visit to keep every pet safe and healthy.",
  },
  {
    q: "Do you accept cats and other pets?",
    a: "Yes. We offer grooming for cats, and our boarding facilities include a separate, quiet cat wing. We also accommodate rabbits and small animals for select services.",
  },
  {
    q: "What are your daycare hours?",
    a: "Daycare runs Monday through Friday, 6:30 AM to 7:00 PM, and Saturday 8:00 AM to 5:00 PM. Early drop-off and late pick-up can be arranged for an additional fee.",
  },
  {
    q: "How do I know my pet is safe?",
    a: "Our facility has 24/7 surveillance, trained overnight attendants for boarders, and a real-time webcam you can access from your phone. Every staff member is pet first-aid certified.",
  },
  {
    q: "Can I visit and tour the facility?",
    a: "Absolutely. We encourage tours before booking. Walk-in tours are available during business hours, or you can schedule a private tour to see our daycare, boarding suites, and grooming stations.",
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
        className="inline-block text-[#4ade80] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/5"
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
        <span className="text-[#4ade80]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#4ade80] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function PetServicesTemplate() {
  return (
    <TemplateLayout
      businessName="Happy Tails Pet Care"
      tagline="Love. Pampering. Trusted care. Bellevue's favorite destination for grooming, daycare, boarding, and training."
      accentColor="#4ade80"
      accentColorLight="#86efac"
      heroGradient="linear-gradient(135deg, #0a1a10 0%, #0d130f 100%)"
      heroImage="https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=1400&q=80"
      phone="(425) 555-0139"
      address="1024 Bellevue Way NE, Bellevue, WA"
    >
      {/* ════════════════ Love Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#4ade80] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <PawIcon />
            <p className="text-sm font-bold tracking-wide">LOVE &mdash; PAMPERING &mdash; TRUSTED CARE &mdash; HAPPY PETS</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
            </span>
            <span className="text-xs font-bold tracking-wider">BOOK TODAY: (425) 555-0139</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#080e0a] border-b border-[#4ade80]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#4ade80]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Pets Pampered", icon: <PawIcon /> },
              { value: "8+", label: "Years Experience", icon: <ClockIcon /> },
              { value: "15+", label: "Certified Staff", icon: <HeartIcon /> },
              { value: "4.9", label: "Google Rating", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#4ade80]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #060c08 0%, #0a120c 50%, #060c08 100%)" }}
      >
        <GridPattern />
        <PawDecoration />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#4ade80]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#4ade80]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Everything Your Pet Needs"
            highlightWord="Needs"
            subtitle="From spa-quality grooming to supervised daycare and expert training, we provide complete care your pet will love."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#4ade80]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#4ade8015,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] group-hover:bg-[#4ade80]/20 group-hover:border-[#4ade80]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#4ade80]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#4ade80] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#4ade80]/70 bg-[#4ade80]/8 border border-[#4ade80]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Grooming Packages ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a120c 0%, #0d160f 50%, #0a120c 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#4ade80]/6" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="GROOMING PACKAGES"
            title="Choose Your Pamper Level"
            highlightWord="Pamper Level"
            subtitle="Three tiers of grooming excellence. Every package includes love, patience, and a treat at the end."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {groomingPackages.map((pkg, i) => (
              <motion.div
                key={pkg.tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden ${
                  pkg.popular
                    ? "border-[#4ade80]/40 bg-[#4ade80]/[0.04] scale-[1.02]"
                    : "border-white/[0.06] hover:border-[#4ade80]/30 bg-white/[0.02]"
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#4ade80]" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#4ade8012,transparent_70%)]" />
                <div className="p-7">
                  <div className="relative z-10">
                    {pkg.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2.5 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    )}
                    <h3 className="text-xl font-bold mt-4 mb-1 group-hover:text-[#4ade80] transition-colors duration-300">{pkg.tier}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#4ade80]">{pkg.price}</span>
                      <span className="text-muted text-sm">/ session</span>
                    </div>
                    <p className="text-muted text-sm leading-relaxed mb-6">{pkg.desc}</p>
                    <div className="space-y-3">
                      {pkg.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 shrink-0 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-3 h-3">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={`w-full h-12 mt-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                        pkg.popular
                          ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white hover:from-[#86efac] hover:to-[#4ade80] shadow-lg shadow-[#4ade80]/20"
                          : "bg-white/5 border border-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80]/10 hover:border-[#4ade80]/40"
                      }`}
                    >
                      Book {pkg.tier}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Meet the Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060c08 0%, #0a100c 50%, #060c08 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#4ade80]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your Pet Experts"
            highlightWord="Pet Experts"
            subtitle="Certified, passionate, and genuinely in love with animals. Your pet is family to us."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.06] hover:border-[#4ade80]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060c08] via-[#060c08]/30 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#4ade80]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#86efac]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#4ade80] text-sm font-semibold mb-3">{member.title}</p>
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

      {/* ════════════════ Pet Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a120c 0%, #0d160f 50%, #0a120c 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#4ade80]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="HAPPY PETS"
            title="Our Pet Gallery"
            highlightWord="Gallery"
            subtitle="Tail wags, fresh cuts, and big smiles. A peek at the happy pets who visit us every day."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#4ade80]/30 transition-all duration-500"
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

      {/* ════════════════ Why Choose Us Banner ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#4ade80]/10 to-[#060c08]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#4ade80" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#4ade80" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#4ade80" strokeWidth="0.3" fill="none" />
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
              WHY CHOOSE <span className="text-[#4ade80]">HAPPY TAILS?</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <HeartIcon />, title: "Genuine Love", desc: "Every pet is treated like family. We are pet owners who built this for pet owners" },
              { icon: <ScissorsIcon />, title: "Certified Team", desc: "All groomers and trainers are professionally certified and first-aid trained" },
              { icon: <PawIcon />, title: "Safe & Clean", desc: "Hospital-grade sanitation, 24/7 cameras, and climate-controlled environments" },
              { icon: <BoneIcon />, title: "Tail-Wag Guarantee", desc: "If your pet is not happy, we make it right. No questions asked, ever" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.06] hover:border-[#4ade80]/30 bg-white/[0.02] transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] mb-4 group-hover:bg-[#4ade80]/20 group-hover:scale-110 transition-all duration-300">
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
        style={{ background: "linear-gradient(180deg, #060c08 0%, #0a100c 50%, #060c08 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#4ade80]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#4ade80" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#4ade80" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#4ade80" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="PET PARENT REVIEWS"
            title="Trusted by Thousands"
            highlightWord="Thousands"
            subtitle="Real reviews from real pet parents who trust us with their furry family members."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.06] hover:border-[#4ade80]/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#4ade80]/40 via-[#4ade80]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#4ade8010,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4ade80]/70 bg-[#4ade80]/8 border border-[#4ade80]/10 px-2.5 py-1 rounded-full">
                    {t.serviceType}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#4ade80] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ade80]/30 to-[#4ade80]/10 flex items-center justify-center text-sm font-bold text-[#4ade80]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">Verified Pet Parent</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Book Appointment CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a120c 0%, #0d160f 50%, #0a120c 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#4ade80]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#4ade80]/20 relative overflow-hidden bg-gradient-to-b from-[#4ade80]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#4ade8015,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#4ade80]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#4ade80]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#4ade80]/10 text-[#4ade80] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#4ade80]/20">
                  <PawIcon />
                  FIRST VISIT 15% OFF
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Book an <span className="text-[#4ade80]">Appointment</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your pet and the service you need. We will get back to you within a few hours to confirm your appointment.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#4ade80]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Pet's Name & Breed"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#4ade80]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#4ade80]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#4ade80]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="What service does your pet need? Any special requirements or concerns?"
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#4ade80]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4ade80]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white font-bold text-lg hover:from-[#86efac] hover:to-[#4ade80] transition-all duration-300 shadow-lg shadow-[#4ade80]/20"
                >
                  Book My Appointment
                </button>
                <p className="text-center text-white/30 text-xs">
                  New clients receive 15% off their first visit. We respond within 2 hours during business hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #060c08 0%, #0a100c 50%, #060c08 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#4ade80]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#4ade80]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-[#4ade80]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.02]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#4ade8010,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#4ade80] transition-colors duration-300">{faq.q}</h3>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#4ade80]/10 via-[#4ade80]/5 to-[#060c08]" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#4ade80]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#4ade80] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/5">
              BOOK TODAY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Give Your Pet the <span className="text-[#4ade80]">Love They Deserve</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Spots fill up fast, especially for weekend grooming and holiday boarding. Reserve your pet&apos;s spot today and join the Happy Tails family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white font-bold items-center justify-center text-lg hover:from-[#86efac] hover:to-[#4ade80] transition-all duration-300 shadow-lg shadow-[#4ade80]/25 gap-2"
              >
                <span>Book an Appointment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550139"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#4ade80]/30 text-[#4ade80] font-bold items-center justify-center text-lg hover:bg-[#4ade80]/10 hover:border-[#4ade80]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0139</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
