"use client";

import BluejayLogo from "./BluejayLogo";

const services = [
  {
    title: "Custom Website Design",
    description:
      "A premium, modern website built specifically for your business and industry. Mobile-responsive, fast-loading, and designed to convert visitors into customers.",
    price: "$997",
    tag: "One-Time",
    icon: "🎨",
  },
  {
    title: "Site Management",
    description:
      "We keep your site updated, secure, and running smoothly. Includes hosting, SSL, updates, and minor content changes whenever you need them.",
    price: "$100",
    tag: "/year",
    icon: "🛡️",
  },
  {
    title: "Content & SEO",
    description:
      "Professional copywriting tailored to your business, optimized for search engines so local customers can find you on Google.",
    price: "Included",
    tag: "With Design",
    icon: "🔍",
  },
];

export default function Services() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a1628 0%, #0c1a30 50%, #0a1628 100%)" }}>
      {/* Background art */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-electric/8 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-deep/10 blur-[120px]" />
        <BluejayLogo size={180} className="absolute top-[10%] right-[8%] opacity-[0.03] text-blue-electric rotate-12" />
        <BluejayLogo size={120} className="absolute bottom-[15%] left-[5%] opacity-[0.025] text-blue-glow -rotate-6" />
        {/* Decorative lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
          <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#0ea5e9" strokeWidth="1" fill="none" />
          <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-electric text-sm font-semibold uppercase tracking-wider mb-4">
            What You Get
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple pricing. Premium results.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="relative p-8 rounded-2xl bg-[#0d1f3c]/80 backdrop-blur-sm border border-blue-electric/10 hover:border-blue-electric/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]"
            >
              <div className="text-2xl mb-4">{service.icon}</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-blue-electric">
                  {service.price}
                </span>
                <span className="text-muted text-sm">{service.tag}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted text-sm leading-relaxed">
                {service.description}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-electric/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
