"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

const menuItems = [
  { category: "Hair", items: [
    { name: "Women's Cut & Style", price: "$65+" },
    { name: "Men's Cut", price: "$35+" },
    { name: "Blowout & Styling", price: "$45+" },
    { name: "Kids Cut (12 & under)", price: "$25+" },
  ]},
  { category: "Color", items: [
    { name: "Full Color", price: "$120+" },
    { name: "Highlights / Balayage", price: "$150+" },
    { name: "Color Correction", price: "$200+" },
    { name: "Gloss Treatment", price: "$55+" },
  ]},
  { category: "Treatments", items: [
    { name: "Keratin Treatment", price: "$250+" },
    { name: "Deep Conditioning", price: "$40+" },
    { name: "Scalp Treatment", price: "$35+" },
    { name: "Bond Repair", price: "$50+" },
  ]},
];

const stylists = [
  { name: "Jessica M.", role: "Owner / Master Stylist", specialty: "Balayage & Color" },
  { name: "Alex R.", role: "Senior Stylist", specialty: "Precision Cuts" },
  { name: "Taylor K.", role: "Colorist", specialty: "Vivid & Fashion Colors" },
  { name: "Morgan L.", role: "Stylist", specialty: "Bridal & Extensions" },
];

export default function SalonTemplate() {
  return (
    <TemplateLayout
      businessName="Luxe Studio"
      tagline="Where artistry meets luxury. Premium hair and beauty services in a relaxing atmosphere."
      accentColor="#ec4899"
      accentColorLight="#f472b6"
      heroGradient="linear-gradient(135deg, #2e1a2a 0%, #1f101a 100%)"
      heroImage="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80"
      phone="(555) 567-8901"
      address="321 Beauty Lane, Your City"
    >
      {/* Booking Bar */}
      <section className="py-4 bg-[#ec4899] text-white text-center">
        <p className="text-sm font-semibold">Now Booking — New Clients Get 15% Off First Visit</p>
      </section>

      {/* Service Menu */}
      <section
        id="services"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #ec489906 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ background: `#ec48990c` }} />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#ec489908` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#ec4899" strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="200" cy="200" r="20" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="800" cy="250" r="15" stroke="#ec4899" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#ec4899] text-sm font-semibold uppercase tracking-wider mb-4">Our Menu</p>
            <h2 className="text-3xl md:text-4xl font-bold">Services & Pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((section, i) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden group"
                style={{ background: `#ec489908` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #ec489915, transparent 70%)` }} />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-[#ec4899] mb-6 text-center">{section.category}</h3>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-[#ec4899] font-semibold">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stylists */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #ec489906 0%, #ec48990a 50%, #ec489906 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#ec48990a` }} />
          <div className="absolute bottom-[20%] right-[8%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#ec489908` }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill="#ec4899" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#ec4899] text-sm font-semibold uppercase tracking-wider mb-4">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold">Meet Your Stylists</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stylists.map((stylist, i) => (
              <motion.div
                key={stylist.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#2e1a2a] to-[#3e2a3a] mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80"
                    alt={stylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold">{stylist.name}</p>
                <p className="text-[#ec4899] text-sm">{stylist.role}</p>
                <p className="text-muted text-xs mt-1">{stylist.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #ec489906 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: `#ec489908` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="150" cy="150" r="25" stroke="#ec4899" strokeWidth="0.3" fill="none" />
            <circle cx="850" cy="450" r="20" stroke="#ec4899" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#ec4899] text-sm font-semibold uppercase tracking-wider mb-4">Gallery</p>
            <h2 className="text-3xl md:text-4xl font-bold">Our Work</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-lg bg-gradient-to-br from-[#2e1a2a] to-[#3e2a3a] overflow-hidden"
              >
                <img
                  src={`https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80`}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #ec489905 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#ec489908` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#ec4899" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#ec4899" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#ec4899] text-sm font-semibold uppercase tracking-wider mb-4">Reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Emily H.", text: "Jessica is a magician with color. My balayage looks exactly like the Pinterest inspo I showed her." },
              { name: "Priya S.", text: "The vibe here is so relaxing. I leave feeling like a completely new person every time." },
              { name: "Lauren W.", text: "Finally found my forever salon. The whole team is talented and the space is gorgeous." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden"
                style={{ background: `#ec489908` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, #ec489940, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 text-[#ec4899] mb-4">
                    {"★★★★★".split("").map((s, j) => <span key={j}>{s}</span>)}
                  </div>
                  <p className="text-muted leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="font-semibold text-sm">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </TemplateLayout>
  );
}
