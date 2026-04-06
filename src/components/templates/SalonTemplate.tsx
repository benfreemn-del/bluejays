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
  { name: "Jessica M.", role: "Owner / Master Stylist", specialty: "Balayage & Color", quote: "Every client deserves to feel like they just walked off a magazine cover." },
  { name: "Alex R.", role: "Senior Stylist", specialty: "Precision Cuts", quote: "A great haircut is the foundation of effortless confidence." },
  { name: "Taylor K.", role: "Colorist", specialty: "Vivid & Fashion Colors", quote: "Color is my art and your hair is my canvas." },
  { name: "Morgan L.", role: "Stylist", specialty: "Bridal & Extensions", quote: "Your wedding day hair should be as unforgettable as the moment itself." },
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

      {/* New Client Special Section */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #ec48990a 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#ec489910` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 300">
            <circle cx="500" cy="150" r="80" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="150" r="120" stroke="#ec4899" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#ec4899]/30 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, #ec489912 0%, #ec489906 100%)` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #ec489918, transparent 60%)` }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#ec4899]/15 text-[#ec4899] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-[#ec4899]/20">
                <span>Welcome Offer</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">New Client Special</h2>
              <p className="text-5xl md:text-6xl font-bold text-[#ec4899] mb-3">15% OFF</p>
              <p className="text-muted leading-relaxed mb-2 max-w-lg mx-auto">
                Your first visit at Luxe Studio. Valid on any service — cuts, color, treatments, and more.
              </p>
              <p className="text-muted/60 text-sm mb-8">Mention this offer when booking. Cannot be combined with other promotions.</p>
              <a
                href="#contact"
                className="inline-flex h-14 px-10 rounded-full bg-[#ec4899] text-white font-bold items-center text-lg hover:bg-[#f472b6] transition-colors shadow-lg shadow-[#ec4899]/20"
              >
                Book Your First Visit
              </a>
            </div>
          </motion.div>
        </div>
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
                <p className="text-muted/70 text-xs mt-2 italic leading-relaxed">&ldquo;{stylist.quote}&rdquo;</p>
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
      {/* Instagram Section */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #ec489908 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: `#ec48990a` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 300">
            <rect x="380" y="80" width="240" height="140" rx="30" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="150" r="40" stroke="#ec4899" strokeWidth="0.5" fill="none" />
            <circle cx="580" cy="100" r="6" stroke="#ec4899" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#ec4899] text-sm font-semibold uppercase tracking-wider mb-4">Stay Connected</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Follow Us on Instagram</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">See our latest work, behind-the-scenes moments, and styling tips. Join our community of beauty lovers.</p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-[#ec4899]/40 text-[#ec4899] font-bold text-lg hover:bg-[#ec4899]/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              @luxestudio
            </a>
          </motion.div>
        </div>
      </section>

      {/* Floating Book Now Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="#contact"
          className="flex items-center gap-2 h-14 px-8 rounded-full bg-[#ec4899] text-white font-bold shadow-2xl shadow-[#ec4899]/30 hover:bg-[#f472b6] transition-colors hover:scale-105 transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Now
        </a>
      </div>
    </TemplateLayout>
  );
}
