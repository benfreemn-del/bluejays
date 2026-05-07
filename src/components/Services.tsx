"use client";

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
      "A modern website built just for your business — your industry, your customers, your brand. Comes with the domain name and hosting set up so you don't have to chase down extra stuff.",
    price: "$997",
    tag: "One-Time",
    icon: <CodeBracketIcon />,
    popular: true,
    features: [
      "Custom design for your industry — not a template",
      "Domain name included (the .com)",
      "Hosting set up for you",
      "Looks great on phones",
      "Built so Google can find you",
      "Loads in under 2 seconds",
      "See it live before you pay",
      "Free changes until you love it",
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
      "We write the words on your site so they sound like a real human, and we set it up so people in your area can find you on Google.",
    price: "Included",
    tag: "With Design",
    icon: <MagnifyingGlassIcon />,
    popular: false,
    features: [
      "Real-human copywriting",
      "Set up to rank in your town",
      "Connected to your Google Business listing",
      "Tagged so Google knows what's on the page",
      "Photos sized so the page loads fast",
      "Analytics so you can see your visitors",
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
          <span
            className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
          >
            What You Get
          </span>
          <h2
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Simple pricing.{" "}
            <span className="text-sky-400">Premium</span> results.
          </h2>
          <div
            className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto"
          />
          <p
            className="text-white/50 mt-4 max-w-2xl text-lg leading-relaxed mx-auto"
          >
            No hidden fees. No monthly subscriptions you don&apos;t need. Just a
            stunning website for $997 one-time, then $100/year starting year 2 for domain, hosting, and support. Cancel anytime.
          </p>
        </div>

        {/* ───────── Value Stack — what an agency would charge ─────────
            Hormozi value-equation move: anchor the offer against
            agency-equivalent line items so $997 reads as a no-brainer
            against $7,820+ of bundled work. Conservative middle of
            agency quotes for a local-business site (verified against
            current Wix Studio + Squarespace agency partner pricing). */}
        <div className="mb-16 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] via-slate-900/40 to-blue-700/[0.04] overflow-hidden">
          <div className="px-6 md:px-10 pt-8 md:pt-10 pb-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400 font-bold mb-3">
              What an agency would charge
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
              Same site, $7,820+ at any other shop.
            </h3>
            <p className="text-white/55 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Here&apos;s what each piece of your $997 build costs everywhere
              else. Numbers are the conservative middle of agency
              quotes for local businesses.
            </p>
          </div>

          <div className="px-6 md:px-10 pb-2">
            <ul className="divide-y divide-white/5">
              {[
                { label: "Custom website design (industry-specific)", value: "$3,500" },
                { label: "Mobile-first responsive build", value: "$800" },
                { label: "Professional copywriting", value: "$1,500" },
                { label: "Local SEO + Google Business integration", value: "$1,200" },
                { label: "90+ PageSpeed performance engineering", value: "$600" },
                { label: "Domain registration", value: "$20" },
                { label: "Hosting setup (year 1)", value: "$200" },
                { label: "Live preview before you pay", value: "Most agencies don't offer this" },
                { label: "Free revisions until you love it", value: "Most agencies don't offer this" },
              ].map((item) => {
                const isUnoffered = item.value.startsWith("Most agencies");
                return (
                  <li
                    key={item.label}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <CheckIcon />
                      </span>
                      <span className="text-white/75 text-sm md:text-base leading-snug">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-sm md:text-base font-mono tabular-nums ${
                        isUnoffered
                          ? "text-amber-300/80 italic font-normal text-right text-xs md:text-sm max-w-[200px] leading-tight"
                          : "text-white/50 line-through"
                      }`}
                    >
                      {item.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-white/10 bg-slate-950/40 px-6 md:px-10 py-6 md:py-8 text-center">
            <div className="flex flex-col sm:flex-row items-baseline justify-center gap-x-3 gap-y-1 mb-3">
              <span className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                Agency total
              </span>
              <span className="text-2xl md:text-3xl text-white/40 line-through font-bold tabular-nums">
                $7,820+
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-baseline justify-center gap-x-3 gap-y-1">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
                Your price
              </span>
              <span className="text-4xl md:text-5xl font-extrabold text-white tabular-nums">
                $997
              </span>
              <span className="text-sm text-white/55">one-time</span>
            </div>
            <p className="text-white/50 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Then $100/yr for hosting + support starting year 2. Cancel anytime.
            </p>
            <p className="mt-5 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm md:text-base font-semibold text-emerald-200">
              And you don&apos;t pay a cent until you see it and love it.
            </p>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={service.title}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
