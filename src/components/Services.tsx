"use client";

import { motion } from "framer-motion";
import BluejayLogo from "./BluejayLogo";

/* ───────────────────────── SVG Icons ───────────────────────── */

const CodeBracketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
    <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ───────────────────────── Grid Pattern ───────────────────────── */

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
    <defs>
      <pattern id="servicesGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#servicesGrid)" />
  </svg>
);

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    title: "Custom Website Design",
    description:
      "A premium, modern website built specifically for your business and industry. Includes custom design, domain registration, and hosting setup so you can launch without piecing together extra services.",
    price: "$997",
    tag: "One-Time",
    icon: <CodeBracketIcon />,
    popular: true,
    features: [
      "Fully custom design for your industry",
      "Domain registration included",
      "Hosting setup included",
      "Mobile-first responsive layout",
      "SEO-optimized content & structure",
      "Fast-loading (90+ PageSpeed score)",
      "Live preview before you pay",
      "Free revisions until you love it",
    ],
  },
  {
    title: "Site Management",
    description:
      "After year one, we keep your site updated, secure, and running smoothly for $100/year. Includes hosting, SSL, updates, and minor content changes whenever you need them.",
    price: "$100",
    tag: "/year",
    icon: <ShieldCheckIcon />,
    popular: false,
    features: [
      "Reliable hosting included",
      "SSL certificate & security",
      "Regular software updates",
      "Content changes on request",
      "Uptime monitoring",
      "Priority email support",
    ],
  },
  {
    title: "Content & SEO",
    description:
      "Professional copywriting tailored to your business, optimized for search engines so local customers can find you on Google.",
    price: "Included",
    tag: "With Design",
    icon: <MagnifyingGlassIcon />,
    popular: false,
    features: [
      "Professional copywriting",
      "Local SEO optimization",
      "Google Business integration",
      "Meta tags & structured data",
      "Image optimization",
      "Analytics setup",
    ],
  },
];

/* ───────────────────────── Main Component ───────────────────────── */

export default function Services() {
  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0c1a30 50%, #0a1628 100%)",
      }}
    >
      {/* Background */}
      <GridPattern opacity={0.025} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.06] blur-[160px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-700/[0.08] blur-[130px]" />
        <BluejayLogo size={200} className="absolute top-[8%] right-[6%] opacity-[0.035] text-sky-500 rotate-12" />
        <BluejayLogo size={140} className="absolute bottom-[12%] left-[4%] opacity-[0.025] text-sky-400 -rotate-6" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
          >
            What You Get
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Simple pricing.{" "}
            <span className="text-sky-400">Premium</span> results.
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-white/50 mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
          >
            No hidden fees. No monthly subscriptions you don&apos;t need. Just a
            stunning website for $997 one-time, then $100/year starting year 2 for domain, hosting, and support. Cancel anytime.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative p-8 rounded-2xl border transition-all duration-500 overflow-hidden ${
                service.popular
                  ? "border-sky-500/30 bg-white/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-sky-500/30"
              }`}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute top-0 right-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-b-lg">
                  Most Popular
                </div>
              )}

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.1),transparent_70%)]" />
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent ${service.popular ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-all duration-300">
                    {service.icon}
                  </div>
                  <span className="text-4xl font-extrabold text-white/[0.04] group-hover:text-sky-500/10 transition-colors duration-300 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {service.price}
                  </span>
                  <span className="text-sky-400 text-sm font-semibold px-2.5 py-0.5 rounded-full border border-sky-500/20 bg-sky-500/5">
                    {service.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-sky-300 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <CheckIcon />
                      </span>
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
