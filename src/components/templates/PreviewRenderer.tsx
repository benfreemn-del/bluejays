"use client";

import { motion } from "framer-motion";
import type { GeneratedSiteData } from "@/lib/generator";
import TemplateLayout from "./TemplateLayout";

export default function PreviewRenderer({ data }: { data: GeneratedSiteData }) {
  const {
    category,
    businessName,
    tagline,
    accentColor,
    heroGradient,
    phone,
    address,
    about,
    services,
    testimonials,
    stats,
    hours,
  } = data;

  return (
    <TemplateLayout
      businessName={businessName}
      tagline={tagline}
      accentColor={accentColor}
      accentColorLight={accentColor}
      heroGradient={heroGradient}
      phone={phone}
      address={address}
    >
      {/* Stats Bar */}
      {stats.length > 0 && (
        <section
          className="py-12 border-y border-border"
          style={{ backgroundColor: `${accentColor}10` }}
        >
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: accentColor }}
                >
                  {stat.value}
                </p>
                <p className="text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: accentColor }}
            >
              {category === "salon" ? "Our Menu" : category === "law-firm" ? "Practice Areas" : "Our Services"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              {category === "salon"
                ? "Services & Pricing"
                : category === "law-firm"
                  ? "Legal Expertise You Can Trust"
                  : category === "dental"
                    ? "Complete Care Under One Roof"
                    : "What We Offer"}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface border border-border hover:border-opacity-40 transition-colors"
                style={
                  {
                    "--hover-border": accentColor,
                  } as React.CSSProperties
                }
              >
                {service.icon && (
                  <div className="text-3xl mb-4">{service.icon}</div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  {service.price && (
                    <span
                      className="text-sm font-semibold shrink-0 ml-4"
                      style={{ color: accentColor }}
                    >
                      {service.price}
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-muted text-sm leading-relaxed">
                    {service.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: accentColor }}
              >
                About {businessName}
              </p>
              <h2 className="text-3xl font-bold mb-6">
                {category === "law-firm"
                  ? "Relentless Advocacy. Personal Attention."
                  : category === "dental"
                    ? "A Dental Experience You'll Actually Enjoy"
                    : `Why Choose ${businessName}`}
              </h2>
              <p className="text-muted leading-relaxed mb-6">{about}</p>
              {hours && (
                <p className="text-muted text-sm">
                  <span className="font-semibold text-foreground">Hours:</span>{" "}
                  {hours}
                </p>
              )}
            </div>
            <div
              className="aspect-square rounded-2xl flex items-center justify-center"
              style={{
                background: heroGradient,
              }}
            >
              <div className="text-6xl opacity-30">
                {category === "real-estate"
                  ? "🏠"
                  : category === "dental"
                    ? "🦷"
                    : category === "law-firm"
                      ? "⚖️"
                      : category === "landscaping"
                        ? "🌳"
                        : "✂️"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 bg-background">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: accentColor }}
              >
                {category === "dental" ? "Patient Reviews" : "What People Say"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                {category === "dental"
                  ? "Smiles Speak Louder Than Words"
                  : "Trusted by Our Community"}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-surface border border-border"
                >
                  <div
                    className="flex items-center gap-1 mb-4"
                    style={{ color: accentColor }}
                  >
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j}>{s}</span>
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-4">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="font-semibold text-sm">{t.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </TemplateLayout>
  );
}
