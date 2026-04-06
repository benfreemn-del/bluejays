"use client";

import { motion } from "framer-motion";
import type { GeneratedSiteData } from "@/lib/generator";
import TemplateLayout from "./TemplateLayout";
import SectionBackground from "./SectionBackground";

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

  const heroImageMap: Record<string, string> = {
    "real-estate": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80",
    "dental": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80",
    "law-firm": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80",
    "landscaping": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1400&q=80",
    "salon": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80",
  };

  const aboutImageMap: Record<string, string> = {
    "real-estate": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    "dental": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
    "law-firm": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "landscaping": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    "salon": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
  };

  const heroImage = heroImageMap[category] || "";
  const aboutImage = aboutImageMap[category] || "";

  return (
    <TemplateLayout
      businessName={businessName}
      tagline={tagline}
      accentColor={accentColor}
      accentColorLight={accentColor}
      heroGradient={heroGradient}
      heroImage={heroImage}
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
      <section id="services" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category={category} variant="services" />
        <div className="max-w-6xl mx-auto px-6 relative">
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
      <section id="about" className="py-24 bg-surface relative overflow-hidden">
        <SectionBackground category={category} variant="about" />
        <div className="max-w-5xl mx-auto px-6 relative">
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
              className="aspect-square rounded-2xl overflow-hidden"
              style={{
                background: heroGradient,
              }}
            >
              {aboutImage ? (
                <img
                  src={aboutImage}
                  alt={`About ${businessName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
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
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
          <SectionBackground category={category} variant="testimonials" />
          <div className="max-w-5xl mx-auto px-6 relative">
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
