"use client";

const services = [
  {
    title: "Custom Website Design",
    description:
      "A premium, modern website built specifically for your business and industry. Mobile-responsive, fast-loading, and designed to convert visitors into customers.",
    price: "$1,000",
    tag: "One-Time",
  },
  {
    title: "Site Management",
    description:
      "We keep your site updated, secure, and running smoothly. Includes hosting, SSL, updates, and minor content changes whenever you need them.",
    price: "$100",
    tag: "/year",
  },
  {
    title: "Content & SEO",
    description:
      "Professional copywriting tailored to your business, optimized for search engines so local customers can find you on Google.",
    price: "Included",
    tag: "With Design",
  },
];

export default function Services() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
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
              className="relative p-8 rounded-2xl bg-surface-light border border-border hover:border-blue-electric/40 transition-colors duration-300 group"
            >
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
