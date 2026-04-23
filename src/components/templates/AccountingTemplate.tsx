"use client";

/* eslint-disable @next/next/no-img-element -- These static marketing and preview components intentionally use plain img tags to preserve existing markup and visual behavior during lint-only cleanup. */

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CalculatorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h2m4 0h2M8 14h2m4 0h2M8 18h2m4 0h2" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-6 4 4 5-8" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M12 2v20m5-17H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m6 5v2" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
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

const SmallClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const LedgerPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="accountingLedger" width="80" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 40 L 80 40" fill="none" stroke="#6366f1" strokeWidth="0.4" />
        <path d="M 80 0 L 80 40" fill="none" stroke="#6366f1" strokeWidth="0.2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#accountingLedger)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    name: "Tax Preparation",
    desc: "Individual and business tax returns prepared with precision. We maximize every deduction and credit while keeping you fully compliant.",
    icon: <CalculatorIcon />,
    tags: ["Individual", "Business", "Multi-State"],
  },
  {
    name: "Bookkeeping",
    desc: "Clean, accurate financial records every month. We reconcile accounts, categorize transactions, and deliver reports you can actually understand.",
    icon: <DocumentIcon />,
    tags: ["Monthly Close", "Reconciliation", "Reporting"],
  },
  {
    name: "Payroll Services",
    desc: "On-time payroll processing with tax withholding, direct deposit, and full compliance with federal and state regulations. Zero headaches.",
    icon: <ClockIcon />,
    tags: ["Processing", "Tax Filing", "Direct Deposit"],
  },
  {
    name: "Tax Planning",
    desc: "Proactive year-round strategies that reduce your tax liability before April. We find opportunities others miss and save you thousands.",
    icon: <ChartIcon />,
    tags: ["Strategy", "Projections", "Entity Structure"],
  },
  {
    name: "Audit & Assurance",
    desc: "Thorough financial audits, reviews, and compilations that satisfy investors, lenders, and regulators with bulletproof accuracy.",
    icon: <BriefcaseIcon />,
    tags: ["Financial Audits", "Reviews", "Compilations"],
  },
  {
    name: "Advisory Services",
    desc: "Strategic financial counsel for growth, acquisitions, and exit planning. We act as your outsourced CFO so you can focus on running the business.",
    icon: <DollarIcon />,
    tags: ["CFO Services", "Growth", "Exit Planning"],
  },
];

const teamMembers = [
  {
    name: "Katherine R. Nguyen",
    title: "Managing Partner, CPA",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
    specialties: ["Tax Strategy", "Business Advisory"],
    yearsExp: 22,
  },
  {
    name: "David J. Emerson",
    title: "Senior Partner, CPA",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    specialties: ["Audit & Assurance", "Compliance"],
    yearsExp: 18,
  },
  {
    name: "Samantha L. Park",
    title: "Partner, CPA, EA",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
    specialties: ["Payroll", "Small Business"],
    yearsExp: 14,
  },
];

const industries = [
  { name: "Healthcare", icon: <ShieldIcon /> },
  { name: "Real Estate", icon: <BriefcaseIcon /> },
  { name: "Technology", icon: <ChartIcon /> },
  { name: "Construction", icon: <DocumentIcon /> },
  { name: "Retail & E-Commerce", icon: <DollarIcon /> },
  { name: "Restaurants", icon: <CalculatorIcon /> },
  { name: "Professional Services", icon: <BriefcaseIcon /> },
  { name: "Nonprofits", icon: <ShieldIcon /> },
];

const testimonials = [
  {
    name: "Michael T.",
    text: "Emerald saved our company over $12,000 in our first year. Their tax planning strategies are worth every penny. Absolute game-changer for our bottom line.",
    service: "Tax Planning",
    rating: 5,
  },
  {
    name: "Lisa R.",
    text: "After years of doing my own books, I finally handed it off. My only regret is not calling them sooner. Every report is clean, on time, and crystal clear.",
    service: "Bookkeeping",
    rating: 5,
  },
  {
    name: "James H.",
    text: "The IRS sent us a notice and I panicked. Katherine handled everything calmly and got it resolved in two weeks. Trustworthy does not begin to cover it.",
    service: "Tax Preparation",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How much does a consultation cost?",
    a: "Your initial consultation is completely free. We will review your financial situation, discuss your goals, and outline exactly how we can help before you commit to anything.",
  },
  {
    q: "Can you handle both personal and business taxes?",
    a: "Absolutely. We prepare individual returns, business returns (S-Corp, C-Corp, LLC, partnerships), multi-state filings, and everything in between. One firm, total coverage.",
  },
  {
    q: "How do you charge for bookkeeping?",
    a: "We offer flat monthly pricing based on your transaction volume and complexity. No surprise bills. You will know exactly what you pay every month before we start.",
  },
  {
    q: "What accounting software do you work with?",
    a: "We are proficient in QuickBooks Online, Xero, FreshBooks, and Wave. If you already use a platform, we will work within it. If you need a recommendation, we will set you up.",
  },
  {
    q: "Is my financial data secure?",
    a: "Completely. We use bank-level 256-bit encryption, secure client portals, and strict access controls. Your data privacy is non-negotiable and protected at every step.",
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
        className="inline-block text-[#6366f1] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5"
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
        <span className="text-[#6366f1]">{highlightWord}</span>
        {parts[1] || ""}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`h-0.5 w-16 bg-gradient-to-r from-[#6366f1] to-transparent mt-4 ${center ? "mx-auto" : ""}`}
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

export default function AccountingTemplate() {
  return (
    <TemplateLayout
      businessName="Emerald Accounting Group"
      tagline="Precision bookkeeping, proactive tax strategy, and trusted financial guidance for businesses and individuals in the Greater Seattle area."
      accentColor="#6366f1"
      accentColorLight="#818cf8"
      heroGradient="linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)"
      heroImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=80"
      phone="(206) 555-0111"
      address="Seattle, WA"
    >
      {/* ════════════════ Trust Bar ════════════════ */}
      <section className="py-3 bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#6366f1] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwTDQwIDQwTTQwIDBMMCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMyIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <CalculatorIcon />
            <p className="text-sm font-bold tracking-wide">FREE CONSULTATION &mdash; PRECISION YOU CAN TRUST</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20">
            <PhoneIcon />
            <span className="text-xs font-bold tracking-wider">(206) 555-0111</span>
          </div>
        </div>
      </section>

      {/* ════════════════ Stats Banner ════════════════ */}
      <section className="py-12 relative overflow-hidden bg-[#0c0a14] border-b border-[#6366f1]/10">
        <LedgerPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[180px] bg-[#6366f1]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2,400+", label: "Returns Filed", icon: <DocumentIcon /> },
              { value: "$8K", label: "Avg. Client Savings", icon: <DollarIcon /> },
              { value: "15+", label: "Years in Seattle", icon: <SmallClockIcon /> },
              { value: "99%", label: "Client Retention", icon: <CheckCircleIcon /> },
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
                  <span className="text-[#6366f1]">{stat.icon}</span>
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
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0f0b1a 50%, #0a0a12 100%)" }}
      >
        <LedgerPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[160px] bg-[#6366f1]/6" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#6366f1]/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="WHAT WE DO"
            title="Our Financial Services"
            highlightWord="Financial Services"
            subtitle="Comprehensive accounting and financial solutions built on precision, trust, and a relentless commitment to saving you money."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#6366f1]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#6366f115,transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] group-hover:bg-[#6366f1]/20 group-hover:border-[#6366f1]/40 transition-all duration-300">
                      {service.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-[#6366f1]/10 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-[#6366f1] transition-colors duration-300">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-5">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider text-[#6366f1]/70 bg-[#6366f1]/8 border border-[#6366f1]/10 px-2.5 py-1 rounded-full"
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

      {/* ════════════════ Savings Callout ════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#6366f1]/10 to-[#0a0a12]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/10 to-transparent" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1000 400">
            <path d="M0 300 Q200 200 400 250 Q600 300 800 150 Q900 80 1000 120" stroke="#6366f1" strokeWidth="1" fill="none" />
            <path d="M0 350 Q200 250 400 300 Q600 350 800 200 Q900 130 1000 170" stroke="#6366f1" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block text-[#6366f1] text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5">
              THE BOTTOM LINE
            </span>
            <p className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#6366f1] leading-none mb-4">
              $8,000
            </p>
            <p className="text-2xl md:text-3xl font-bold mb-4">
              Average Annual <span className="text-[#6366f1]">Client Savings</span>
            </p>
            <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Our proactive tax planning and meticulous bookkeeping consistently uncover savings our clients never knew they were missing. Precision pays for itself.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { value: "100%", label: "Deductions Captured" },
                { value: "3x", label: "ROI on Our Fees" },
                { value: "0", label: "Missed Deadlines" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/[0.10] bg-white/[0.07]"
                >
                  <p className="text-2xl font-extrabold text-[#6366f1] mb-1">{item.value}</p>
                  <p className="text-muted text-sm font-medium">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Team ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #110d1e 50%, #0f0b1a 100%)" }}
      >
        <LedgerPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px] bg-[#6366f1]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="OUR TEAM"
            title="Meet Your CPAs"
            highlightWord="CPAs"
            subtitle="Certified professionals with decades of combined experience dedicated to your financial success."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative rounded-2xl border border-white/[0.10] hover:border-[#6366f1]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/30 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#6366f1]/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#818cf8]/30">
                    {member.yearsExp}+ YRS
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#6366f1] text-sm font-semibold mb-3">{member.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((s) => (
                        <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
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

      {/* ════════════════ Industries Served ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0d0a18 50%, #0a0a12 100%)" }}
      >
        <LedgerPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[180px] bg-[#6366f1]/5" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="INDUSTRY EXPERTISE"
            title="Industries We Serve"
            highlightWord="We Serve"
            subtitle="Specialized accounting knowledge across diverse sectors. We understand your industry inside and out."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((industry, i) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group text-center p-6 rounded-2xl border border-white/[0.10] hover:border-[#6366f1]/30 bg-white/[0.07] transition-all duration-500"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] mb-3 group-hover:bg-[#6366f1]/20 group-hover:scale-110 transition-all duration-300">
                  {industry.icon}
                </div>
                <h4 className="font-bold text-sm group-hover:text-[#6366f1] transition-colors duration-300">{industry.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Testimonials ════════════════ */}
      <section
        id="testimonials"
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #130f22 50%, #0f0b1a 100%)" }}
      >
        <LedgerPattern opacity={0.025} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full blur-[180px] bg-[#6366f1]/5" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#6366f1" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#6366f1" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#6366f1" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <SectionHeader
            tag="CLIENT TESTIMONIALS"
            title="Trusted by Hundreds"
            highlightWord="Hundreds"
            subtitle="Real stories from businesses and individuals who trust Emerald with their financial well-being."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl border border-white/[0.10] hover:border-[#6366f1]/30 transition-all duration-500 overflow-hidden bg-white/[0.07]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#6366f1]/40 via-[#6366f1]/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#6366f110,transparent_70%)]" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6366f1]/70 bg-[#6366f1]/8 border border-[#6366f1]/10 px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                  <div className="flex items-center gap-0.5 text-[#6366f1] mt-4 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} />
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.10]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1]/30 to-[#6366f1]/10 flex items-center justify-center text-sm font-bold text-[#6366f1]">
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
        style={{ background: "linear-gradient(180deg, #0a0a12 0%, #0d0a18 50%, #0a0a12 100%)" }}
      >
        <LedgerPattern />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full blur-[140px] bg-[#6366f1]/5" />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px] bg-[#6366f1]/4" />
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
                className="group p-6 rounded-2xl border border-white/[0.10] hover:border-[#6366f1]/20 transition-all duration-500 overflow-hidden relative bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_50%,#6366f110,transparent_70%)]" />
                <div className="relative z-10 flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-xs font-bold mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white group-hover:text-[#6366f1] transition-colors duration-300">{faq.q}</h3>
                    <p className="text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Free Consultation CTA ════════════════ */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0f0b1a 0%, #130f22 50%, #0f0b1a 100%)" }}
      >
        <LedgerPattern opacity={0.02} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#6366f1]/6" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#6366f1]/20 relative overflow-hidden bg-gradient-to-b from-[#6366f1]/[0.06] to-transparent"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#6366f115,transparent_60%)]" />
            <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-[#6366f1]/30 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-[#6366f1]/30 rounded-br-2xl" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#6366f1]/10 text-[#6366f1] text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-[#6366f1]/20">
                  <DollarIcon />
                  FREE CONSULTATION
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                  Start <span className="text-[#6366f1]">Saving Today</span>
                </h2>
                <p className="text-muted max-w-lg mx-auto">
                  Tell us about your business. We will review your situation and show you exactly where you can save. No cost, no obligation.
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#6366f1]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#6366f1]/50 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#6366f1]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#6366f1]/50 transition-colors"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full h-13 px-5 rounded-xl bg-white/5 border border-[#6366f1]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#6366f1]/50 transition-colors"
                />
                <textarea
                  placeholder="Tell us about your business and financial goals..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-[#6366f1]/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#6366f1]/50 resize-none transition-colors"
                />
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white font-bold text-lg hover:from-[#818cf8] hover:to-[#6366f1] transition-all duration-300 shadow-lg shadow-[#6366f1]/20"
                >
                  Request Free Consultation
                </button>
                <p className="text-center text-white/30 text-xs">
                  Your financial information is encrypted and will never be shared with third parties.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ Final CTA ════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/10 via-[#6366f1]/5 to-[#0a0a12]" />
        <LedgerPattern opacity={0.03} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[180px] bg-[#6366f1]/8" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#6366f1] text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5">
              TAKE CONTROL
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Stop Overpaying &mdash; <span className="text-[#6366f1]">Start Saving</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Every day without a proactive CPA is money left on the table. Let Emerald Accounting Group put precision to work for your bottom line.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex h-14 px-10 rounded-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white font-bold items-center justify-center text-lg hover:from-[#818cf8] hover:to-[#6366f1] transition-all duration-300 shadow-lg shadow-[#6366f1]/25 gap-2"
              >
                <span>Free Consultation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="tel:2065550111"
                className="inline-flex h-14 px-10 rounded-full border-2 border-[#6366f1]/30 text-[#6366f1] font-bold items-center justify-center text-lg hover:bg-[#6366f1]/10 hover:border-[#6366f1]/50 transition-all duration-300 gap-2"
              >
                <PhoneIcon />
                <span>(206) 555-0111</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </TemplateLayout>
  );
}
