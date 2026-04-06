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
      phone="(555) 567-8901"
      address="321 Beauty Lane, Your City"
    >
      {/* Booking Bar */}
      <section className="py-4 bg-[#ec4899] text-white text-center">
        <p className="text-sm font-semibold">Now Booking — New Clients Get 15% Off First Visit</p>
      </section>

      {/* Service Menu */}
      <section id="services" className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-6">
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
                className="p-6 rounded-xl bg-surface border border-border"
              >
                <h3 className="text-xl font-bold text-[#ec4899] mb-6 text-center">{section.category}</h3>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-[#ec4899] font-semibold">{item.price}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stylists */}
      <section id="about" className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
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
                <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-[#2e1a2a] to-[#3e2a3a] mb-4 flex items-center justify-center">
                  <div className="text-4xl opacity-30">✂️</div>
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
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-6">
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
                className="aspect-square rounded-lg bg-gradient-to-br from-[#2e1a2a] to-[#3e2a3a]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
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
                className="p-6 rounded-xl bg-surface-light border border-border"
              >
                <div className="flex items-center gap-1 text-[#ec4899] mb-4">
                  {"★★★★★".split("").map((s, j) => <span key={j}>{s}</span>)}
                </div>
                <p className="text-muted leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-sm">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </TemplateLayout>
  );
}
