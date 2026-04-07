"use client";

import { useEffect } from "react";
import type { GeneratedSiteData } from "@/lib/generator";
import TemplateLayout from "./TemplateLayout";

export default function PreviewRenderer({ data }: { data: GeneratedSiteData }) {
  // Track visit
  useEffect(() => {
    if (data.id) {
      const start = Date.now();
      fetch(`/api/track/${data.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
      // Log duration on leave
      return () => {
        const duration = Math.round((Date.now() - start) / 1000);
        navigator.sendBeacon?.(`/api/track/${data.id}`, JSON.stringify({ duration }));
      };
    }
  }, [data.id]);
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

  // Stock fallbacks by category — only used when no real photos exist
  const heroStockMap: Record<string, string> = {
    "real-estate": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80",
    "dental": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80",
    "law-firm": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80",
    "landscaping": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1400&q=80",
    "salon": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80",
  };

  const aboutStockMap: Record<string, string> = {
    "real-estate": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    "dental": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80",
    "law-firm": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "landscaping": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    "salon": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80",
  };

  // CUSTOMIZATION: Use scraped photos first, stock only as last resort
  const photos = data.photos || [];
  const heroImage = photos[0] || heroStockMap[category] || "";
  const aboutImage = photos[1] || aboutStockMap[category] || "";

  // Lighter version of accent color for glows
  const glowColor = accentColor;

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
      prospectId={data.id}
      socialLinks={data.socialLinks}
    >
      {/* Stats Bar */}
      {stats.length > 0 && (
        <section
          className="py-12 border-y border-border relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 50%, transparent 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: `${glowColor}10` }} />
          </div>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold" style={{ color: accentColor }}>
                  {stat.value}
                </p>
                <p className="text-muted text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, #0a0a0a 0%, ${accentColor}06 50%, #0a0a0a 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ background: `${glowColor}0c` }} />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `${glowColor}08` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke={accentColor} strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke={accentColor} strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: accentColor }}>
              {category === "salon" ? "Our Menu" : category === "law-firm" ? "Practice Areas" : "Our Services"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              {category === "salon" ? "Services & Pricing" : category === "law-firm" ? "Legal Expertise You Can Trust" : category === "dental" ? "Complete Care Under One Roof" : "What We Offer"}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-6 rounded-xl border border-border/50 hover:border-opacity-60 transition-all duration-300 relative overflow-hidden group"
                style={{ background: `${accentColor}08` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 70%)` }} />
                <div className="relative z-10">
                  {service.icon && <div className="text-3xl mb-4">{service.icon}</div>}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    {service.price && (
                      <span className="text-sm font-semibold shrink-0 ml-4" style={{ color: accentColor }}>{service.price}</span>
                    )}
                  </div>
                  {service.description && <p className="text-muted text-sm leading-relaxed">{service.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${accentColor}06 0%, ${accentColor}0a 50%, ${accentColor}06 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `${glowColor}0a` }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill={accentColor} />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: accentColor }}>
                About {businessName}
              </p>
              <h2 className="text-3xl font-bold mb-6">
                {category === "law-firm" ? "Relentless Advocacy. Personal Attention."
                  : category === "dental" ? "A Dental Experience You'll Actually Enjoy"
                  : `Why Choose ${businessName}`}
              </h2>
              <p className="text-muted leading-relaxed mb-6">{about}</p>
              {hours && (
                <p className="text-muted text-sm">
                  <span className="font-semibold text-foreground">Hours:</span> {hours}
                </p>
              )}
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden relative" style={{ background: heroGradient }}>
              {aboutImage ? (
                <img src={aboutImage} alt={`About ${businessName}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-20" fill="none" stroke={accentColor} strokeWidth="1.5">
                    {category === "electrician" && <><path d="M50 10 L60 40 H52 L58 90 L40 50 H48 Z" fill={accentColor} stroke="none" opacity="0.3" /><circle cx="50" cy="50" r="40" /></>}
                    {category === "plumber" && <><path d="M30 30 H50 V50 H70 V70 H50 V50 H30 Z" /><circle cx="50" cy="50" r="40" /></>}
                    {category === "hvac" && <><path d="M50 20 Q70 35 50 50 Q30 65 50 80" /><circle cx="50" cy="50" r="35" /></>}
                    {category === "roofing" && <><path d="M15 60 L50 25 L85 60" strokeWidth="2" /><path d="M25 58 V80 H75 V58" /></>}
                    {category === "auto-repair" && <><circle cx="50" cy="50" r="30" /><circle cx="50" cy="50" r="15" /><path d="M20 50 H80 M50 20 V80" /></>}
                    {(category === "real-estate") && <><rect x="25" y="35" width="50" height="45" rx="2" /><path d="M15 40 L50 15 L85 40" strokeWidth="2" /><rect x="42" y="55" width="16" height="25" /></>}
                    {category === "dental" && <><path d="M35 30 Q50 20 65 30 Q70 45 65 60 Q58 80 50 70 Q42 80 35 60 Q30 45 35 30Z" /></>}
                    {category === "law-firm" && <><rect x="30" y="25" width="40" height="55" rx="2" /><line x1="38" y1="38" x2="62" y2="38" /><line x1="38" y1="48" x2="62" y2="48" /><line x1="38" y1="58" x2="55" y2="58" /></>}
                    {category === "landscaping" && <><path d="M50 15 Q65 25 60 40 Q70 35 65 50 Q75 50 65 60 Q55 70 50 70 Q45 70 35 60 Q25 50 35 50 Q30 35 40 40 Q35 25 50 15Z" /></>}
                    {category === "salon" && <><circle cx="50" cy="35" r="18" /><path d="M32 50 Q50 75 68 50" /></>}
                    {!["electrician","plumber","hvac","roofing","auto-repair","real-estate","dental","law-firm","landscaping","salon"].includes(category) && <><circle cx="50" cy="50" r="35" /><path d="M35 50 L45 60 L65 40" strokeWidth="2.5" /></>}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, #0a0a0a 0%, ${accentColor}05 50%, #0a0a0a 100%)` }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `${glowColor}08` }} />
            <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
              <circle cx="400" cy="200" r="100" stroke={accentColor} strokeWidth="0.5" fill="none" />
              <circle cx="400" cy="200" r="180" stroke={accentColor} strokeWidth="0.3" fill="none" />
              <circle cx="400" cy="200" r="260" stroke={accentColor} strokeWidth="0.2" fill="none" />
            </svg>
          </div>
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: accentColor }}>
                {category === "dental" ? "Patient Reviews" : "What People Say"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                {category === "dental" ? "Smiles Speak Louder Than Words" : "Trusted by Our Community"}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl border border-border/50 relative overflow-hidden"
                  style={{ background: `${accentColor}08` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${accentColor}40, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-4" style={{ color: accentColor }}>
                      {"★★★★★".split("").map((s, j) => <span key={j}>{s}</span>)}
                    </div>
                    <p className="text-muted leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                    <p className="font-semibold text-sm">{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </TemplateLayout>
  );
}
