"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const PawIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <ellipse cx="7" cy="8" rx="2" ry="2.5" />
    <ellipse cx="17" cy="8" rx="2" ry="2.5" />
    <ellipse cx="4" cy="13" rx="1.5" ry="2" />
    <ellipse cx="20" cy="13" rx="1.5" ry="2" />
    <path d="M8 17c0-2 1.5-4 4-4s4 2 4 4c0 2.5-2 4-4 4s-4-1.5-4-4z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const StethoscopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M4 4v6a6 6 0 0012 0V4" />
    <circle cx="16" cy="16" r="2" />
    <path d="M18 16v2a4 4 0 01-4 4h-2a4 4 0 01-4-4v-1" />
    <path d="M2 4h4M14 4h4" />
  </svg>
);

const BoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M18.3 5.7a2.5 2.5 0 013.5 3.5l-.9.9-10.7 10.7-.9.9a2.5 2.5 0 01-3.5-3.5l.9-.9L17.4 6.6l.9-.9z" />
    <path d="M5.7 5.7a2.5 2.5 0 00-3.5 3.5l.9.9M18.3 18.3a2.5 2.5 0 003.5-3.5l-.9-.9" />
  </svg>
);

const CatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 22c4.418 0 8-2.686 8-6V6l-3 2-2.5-4L12 6 9.5 4 7 8 4 6v10c0 3.314 3.582 6 8 6z" />
    <circle cx="9" cy="13" r="1" fill="currentColor" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <path d="M10 16h4" />
  </svg>
);

const DogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .333-3.5 2-3.5 4v2l3 3v6a2 2 0 002 2h8a2 2 0 002-2v-6l3-3V7c0-2-1.5-3.667-3.5-4-1.923-.321-3.5.782-3.5 2.172" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <path d="M9 15h6" />
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

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="vetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#34d399" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#vetGrid)" />
  </svg>
);

/* ───────────────────────── Paw Pattern ───────────────────────── */

const PawPattern = ({ opacity = 0.02 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} viewBox="0 0 400 400">
    <g fill="#34d399">
      <ellipse cx="50" cy="60" rx="6" ry="8" />
      <ellipse cx="70" cy="55" rx="6" ry="8" />
      <ellipse cx="38" cy="75" rx="5" ry="7" />
      <ellipse cx="82" cy="75" rx="5" ry="7" />
      <ellipse cx="60" cy="88" rx="12" ry="10" />
    </g>
    <g fill="#34d399" transform="translate(200, 180) scale(0.8)">
      <ellipse cx="50" cy="60" rx="6" ry="8" />
      <ellipse cx="70" cy="55" rx="6" ry="8" />
      <ellipse cx="38" cy="75" rx="5" ry="7" />
      <ellipse cx="82" cy="75" rx="5" ry="7" />
      <ellipse cx="60" cy="88" rx="12" ry="10" />
    </g>
    <g fill="#34d399" transform="translate(320, 40) scale(0.6)">
      <ellipse cx="50" cy="60" rx="6" ry="8" />
      <ellipse cx="70" cy="55" rx="6" ry="8" />
      <ellipse cx="38" cy="75" rx="5" ry="7" />
      <ellipse cx="82" cy="75" rx="5" ry="7" />
      <ellipse cx="60" cy="88" rx="12" ry="10" />
    </g>
    <g fill="#34d399" transform="translate(100, 300) scale(0.7)">
      <ellipse cx="50" cy="60" rx="6" ry="8" />
      <ellipse cx="70" cy="55" rx="6" ry="8" />
      <ellipse cx="38" cy="75" rx="5" ry="7" />
      <ellipse cx="82" cy="75" rx="5" ry="7" />
      <ellipse cx="60" cy="88" rx="12" ry="10" />
    </g>
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Wellness Exams",
    desc: "Comprehensive annual and biannual check-ups to keep your pet in peak health, including bloodwork, dental assessment, and nutrition counseling.",
    icon: <StethoscopeIcon />,
    tags: ["Annual Checkup", "Bloodwork", "Nutrition"],
  },
  {
    name: "Vaccinations",
    desc: "Core and lifestyle-based vaccination protocols tailored to your pet's age, breed, and risk factors for lifelong immunity.",
    icon: <ShieldIcon />,
    tags: ["Core Vaccines", "Puppy/Kitten", "Boosters"],
  },
  {
    name: "Surgery & Recovery",
    desc: "State-of-the-art surgical suites for spay/neuter, orthopedic, soft tissue, and emergency procedures with dedicated post-op care.",
    icon: <HeartIcon />,
    tags: ["Spay/Neuter", "Orthopedic", "Soft Tissue"],
  },
  {
    name: "Dental Care",
    desc: "Professional cleanings, digital dental X-rays, extractions, and at-home care plans to prevent periodontal disease.",
    icon: <BoneIcon />,
    tags: ["Cleanings", "X-Rays", "Extractions"],
  },
  {
    name: "Cat Care",
    desc: "Fear-free feline exams in our dedicated cat suite. Separate waiting area and handling techniques designed for low-stress visits.",
    icon: <CatIcon />,
    tags: ["Feline Suite", "Fear-Free", "Senior Cat"],
  },
  {
    name: "Dog Care",
    desc: "From playful puppies to senior companions, breed-specific wellness plans, behavioral consultations, and preventative health screenings.",
    icon: <DogIcon />,
    tags: ["Puppy Care", "Senior Dog", "Behavior"],
  },
];

const vets = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Lead Veterinarian",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    specialties: ["Internal Medicine", "Surgery"],
    yearsExp: 16,
  },
  {
    name: "Dr. James Park",
    title: "Associate Veterinarian",
    image: "https://images.unsplash.com/photo-1622253694242-abeb37a33e97?w=400&q=80",
    specialties: ["Feline Medicine", "Dentistry"],
    yearsExp: 11,
  },
  {
    name: "Dr. Emily Torres",
    title: "Associate Veterinarian",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80",
    specialties: ["Emergency Care", "Exotic Pets"],
    yearsExp: 8,
  },
];

const patientGallery = [
  { name: "Cooper", breed: "Golden Retriever", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80" },
  { name: "Luna", breed: "Siamese Cat", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80" },
  { name: "Max", breed: "German Shepherd", image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&q=80" },
  { name: "Bella", breed: "Tabby Cat", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80" },
  { name: "Charlie", breed: "Labrador", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" },
  { name: "Milo", breed: "Beagle", image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80" },
];

const testimonials = [
  {
    name: "Karen T.",
    text: "Dr. Mitchell saved our dog's life after a late-night emergency. The whole staff was so calm, compassionate, and professional. We will never go anywhere else.",
    petType: "Dog Owner",
    rating: 5,
  },
  {
    name: "Michael R.",
    text: "Our cats are terrified of the vet, but the fear-free approach here changed everything. They are calm and the visits are actually stress-free now.",
    petType: "Cat Owner",
    rating: 5,
  },
  {
    name: "Lisa M.",
    text: "Transparent pricing, thorough explanations, and genuine love for animals. They treat every pet like their own family member. Highly recommended.",
    petType: "Multi-Pet Household",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Do you accept walk-in appointments?",
    a: "We welcome walk-ins for urgent matters. For routine care, we recommend scheduling an appointment to minimize wait times. You can book online or call us directly.",
  },
  {
    q: "What should I bring to my pet's first visit?",
    a: "Please bring any previous medical records, vaccination history, a list of current medications, and your pet on a leash or in a secure carrier.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes. We partner with CareCredit and Scratchpay to offer flexible financing options. We also accept all major credit cards and pet insurance.",
  },
  {
    q: "What are your emergency hours?",
    a: "Our emergency line is available 24/7. During regular hours, walk in or call immediately. After hours, our on-call veterinarian will guide you through next steps.",
  },
  {
    q: "How often should my pet have a wellness exam?",
    a: "We recommend annual exams for adult pets and biannual exams for senior pets (7+ years). Puppies and kittens need more frequent visits during their first year.",
  },
];

const welcomeSteps = [
  { step: "01", title: "Schedule Your Visit", desc: "Book online or call us to find a time that works. New clients receive a welcome packet via email." },
  { step: "02", title: "Meet Your Vet Team", desc: "Tour our facility, meet the doctors and staff, and let your pet get comfortable in a calm environment." },
  { step: "03", title: "Comprehensive Exam", desc: "A nose-to-tail physical, health history review, and personalized wellness plan for your pet." },
  { step: "04", title: "Ongoing Partnership", desc: "We become your pet's lifetime health partner with reminders, follow-ups, and 24/7 emergency access." },
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
        className="inline-block text-[#34d399] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#34d399]/20 bg-[#34d399]/5"
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
        <span className="text-[#34d399]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#34d399] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function VeterinaryTemplate() {
  return (
    <TemplateLayout
      businessName="Northshore Veterinary Clinic"
      tagline="Compassionate, trusted veterinary care for your whole family. Where every pet is treated like our own."
      accentColor="#34d399"
      accentColorLight="#6ee7b7"
      heroGradient="linear-gradient(135deg, #ecfdf5 0%, #e6f7ed 100%)"
      themeMode="light"
      heroImage="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1400&q=80"
      phone="(425) 555-0110"
      address="Kenmore, WA"
    >
      {/* ════════════════ Emergency Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#34d399] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <PawIcon />
            <p className="text-sm font-bold tracking-wide">COMPASSIONATE CARE FOR EVERY MEMBER OF YOUR FAMILY</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wider">24/7 EMERGENCY: (425) 555-0110</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#f7faf8] border-b border-[#34d399]/10">
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#34d399]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15K+", label: "Patients Treated", icon: <PawIcon /> },
              { value: "20+", label: "Years Serving Kenmore", icon: <ClockIcon /> },
              { value: "3", label: "Dedicated Veterinarians", icon: <StethoscopeIcon /> },
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
                  <span className="text-[#34d399]">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-[#1c1917]">{stat.value}</span>
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
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf8 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <PawPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#34d399]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#34d399]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR SERVICES"
            title="Comprehensive Pet Care"
            highlightWord="Pet Care"
            subtitle="From routine wellness exams to advanced surgery, our team provides compassionate, trusted care for every stage of your pet's life."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#34d399]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#34d39915,transparent_70%)]" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  {/* Number + Icon row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center text-[#34d399] group-hover:bg-[#34d399]/20 group-hover:border-[#34d399]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-gray-100 group-hover:text-[#34d399]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#34d399] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#34d399]/70 bg-[#34d399]/8 border border-[#34d399]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Meet the Vets ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f7faf8 0%, #ecfdf5 50%, #f7faf8 100%)" }}
      >
        <GridPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#34d399]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your Veterinarians"
            highlightWord="Veterinarians"
            subtitle="Compassionate professionals dedicated to providing the highest standard of veterinary medicine for your beloved companions."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {vets.map((vet, i) => (
              <motion.div
                key={vet.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-gray-200 hover:border-[#34d399]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={vet.image}
                    alt={vet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f7faf8] via-[#f7faf8]/60 to-transparent" />
                  {/* Years badge */}
                  <div className="absolute top-4 right-4 bg-[#34d399]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#6ee7b7]/30">
                    {vet.yearsExp}+ YRS
                  </div>
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{vet.name}</h3>
                    <p className="text-[#34d399] text-sm font-semibold mb-3">{vet.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {vet.specialties.map((s) => (
                        <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
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

      {/* ════════════════ Patient Gallery ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf8 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <PawPattern opacity={0.015} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#34d399]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR PATIENTS"
            title="Happy & Healthy Pets"
            highlightWord="Healthy Pets"
            subtitle="Meet some of the beloved companions we are proud to care for at Northshore Veterinary Clinic."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {patientGallery.map((pet, i) => (
              <motion.div
                key={pet.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-[#34d399]/30 transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-bold text-[#1c1917]">{pet.name}</p>
                  <p className="text-[#34d399] text-sm">{pet.breed}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Emergency Info ════════════════ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#34d399]/5 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#34d399" strokeWidth="1" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#34d399" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="80" stroke="#34d399" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#ef4444]/20 relative overflow-hidden bg-gradient-to-b from-[#ef4444]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#ef444415,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#ef4444]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#ef4444]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#ef4444]/10 text-[#f87171] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#ef4444]/20">
                  <AlertIcon />
                  PET EMERGENCY
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Emergency <span className="text-[#f87171]">Veterinary Care</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  If your pet is experiencing a medical emergency, do not wait. Call our 24/7 emergency line immediately.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-gray-200">
                  <h4 className="font-bold text-sm mb-3 text-[#f87171]">When to Call</h4>
                  <ul className="space-y-2 text-muted text-sm">
                    {["Difficulty breathing or choking", "Severe bleeding or trauma", "Ingestion of toxic substances", "Seizures or collapse", "Unable to urinate or defecate"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-[#f87171] mt-0.5"><AlertIcon /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.03] border border-gray-200 flex flex-col items-center justify-center text-center">
                  <p className="text-muted text-sm mb-4">24/7 Emergency Hotline</p>
                  <a href="tel:4255550110" className="text-3xl md:text-4xl font-extrabold text-[#34d399] hover:text-[#6ee7b7] transition-colors mb-4">
                    (425) 555-0110
                  </a>
                  <p className="text-muted text-xs">Our on-call veterinarian responds within minutes.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ New Client Welcome ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f7faf8 0%, #ecfdf5 50%, #f7faf8 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#34d399]/5" />
          <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full blur-[140px] bg-[#34d399]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="GET STARTED"
            title="Welcome New Clients"
            highlightWord="New Clients"
            subtitle="Joining the Northshore family is easy. Here is what to expect at your first visit."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {welcomeSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative text-center p-7 rounded-2xl border border-gray-200 hover:border-[#34d399]/30 bg-white transition-all duration-500 shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#34d39912,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#34d399]/30 to-[#34d399]/5 block mb-4">{item.step}</span>
                  <h4 className="font-bold mb-2 group-hover:text-[#34d399] transition-colors duration-300">{item.title}</h4>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
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
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf8 50%, #ffffff 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#34d399]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#34d399" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#34d399" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#34d399" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="TESTIMONIALS"
            title="Trusted by Pet Families"
            highlightWord="Pet Families"
            subtitle="Hear from the families who trust Northshore Veterinary Clinic with their most beloved companions."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-gray-200 hover:border-[#34d399]/30 transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#34d399]/40 via-[#34d399]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#34d39910,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#34d399]/70 bg-[#34d399]/8 border border-[#34d399]/10 px-2.5 py-1 rounded-full">
                    {t.petType}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#34d399] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34d399]/30 to-[#34d399]/10 flex items-center justify-center text-sm font-bold text-[#34d399]">
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

      {/* ════════════════ FAQ ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f7faf8 0%, #ecfdf5 50%, #f7faf8 100%)" }}
      >
        <GridPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#34d399]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#34d399]/4" />
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
                className="group p-6 rounded-2xl border border-gray-200 hover:border-[#34d399]/20 transition-all duration-500 overflow-hidden relative bg-white shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#34d39910,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center text-[#34d399] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-[#1c1917] group-hover:text-[#34d399] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Book Appointment CTA ════════════════ */}
      <section
        id="contact"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf8 50%, #ffffff 100%)" }}
      >
        <GridPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#34d399]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#34d399]/20 relative overflow-hidden bg-gradient-to-b from-[#34d399]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#34d39915,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#34d399]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#34d399]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#34d399]/10 text-[#34d399] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#34d399]/20">
                  <PawIcon />
                  BOOK YOUR VISIT
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Schedule an <span className="text-[#34d399]">Appointment</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  New and returning clients can book online. We will confirm your appointment within one business hour.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Pet Name & Breed"
                    className="w-full h-13 px-5 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Reason for visit or any concerns..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-[#1c1917] placeholder-gray-400 text-sm focus:outline-none focus:border-[#34d399]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#34d399] to-[#10b981] text-white font-bold text-lg hover:from-[#6ee7b7] hover:to-[#34d399] transition-all duration-300 shadow-lg shadow-[#34d399]/20"
                >
                  Book Appointment
                </button>
                <p className="text-center text-gray-400 text-xs">
                  We respond within 1 business hour. Emergency cases call (425) 555-0110 directly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#34d399]/5 via-[#34d399]/[0.02] to-white" />
        <GridPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#34d399]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#34d399]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#34d399] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#34d399]/20 bg-[#34d399]/5">
              YOUR PET DESERVES THE BEST
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Compassionate Care, <span className="text-[#34d399]">Trusted Results</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              From routine checkups to life-saving emergencies, Northshore Veterinary Clinic is here for your family. Schedule your visit today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#34d399] to-[#10b981] text-white font-bold items-center justify-center text-lg hover:from-[#6ee7b7] hover:to-[#34d399] transition-all duration-300 shadow-lg shadow-[#34d399]/25 gap-2"
              >
                <span>Book Appointment</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:4255550110"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#34d399]/30 text-[#34d399] font-bold items-center justify-center text-lg hover:bg-[#34d399]/10 hover:border-[#34d399]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>Call (425) 555-0110</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
