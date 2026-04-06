"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";
import SectionBackground from "./SectionBackground";

const listings = [
  { address: "142 Oak Ridge Drive", price: "$425,000", beds: 4, baths: 3, sqft: "2,400", tag: "New Listing" },
  { address: "89 Lakewood Blvd", price: "$675,000", beds: 5, baths: 4, sqft: "3,200", tag: "Featured" },
  { address: "301 Maple Court", price: "$299,000", beds: 3, baths: 2, sqft: "1,800", tag: "Open House" },
  { address: "55 Sunset Terrace", price: "$525,000", beds: 4, baths: 3, sqft: "2,800", tag: "Reduced" },
  { address: "712 Birch Lane", price: "$389,000", beds: 3, baths: 2, sqft: "2,100", tag: "New Listing" },
  { address: "28 Crestview Heights", price: "$850,000", beds: 6, baths: 5, sqft: "4,100", tag: "Luxury" },
];

const stats = [
  { value: "500+", label: "Homes Sold" },
  { value: "$180M", label: "In Sales Volume" },
  { value: "15+", label: "Years Experience" },
  { value: "4.9★", label: "Client Rating" },
];

export default function RealEstateTemplate() {
  return (
    <TemplateLayout
      businessName="Prestige Realty"
      tagline="Your dream home is closer than you think. Expert agents, exclusive listings, and personalized service."
      accentColor="#c8a45e"
      accentColorLight="#d4b76a"
      heroGradient="linear-gradient(135deg, #1a2744 0%, #0d1b33 100%)"
      heroImage="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"
      phone="(555) 123-4567"
      address="Downtown, Your City"
    >
      {/* Stats Bar */}
      <section className="py-12 bg-[#c8a45e]/10 border-y border-border">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#c8a45e]">{stat.value}</p>
              <p className="text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section id="services" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category="real-estate" variant="services" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#c8a45e] text-sm font-semibold uppercase tracking-wider mb-4">Featured Properties</p>
            <h2 className="text-3xl md:text-4xl font-bold">Find Your Perfect Home</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.address}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl overflow-hidden bg-surface border border-border group hover:border-[#c8a45e]/40 transition-colors"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-[#1a2744] to-[#2a3754] relative">
                  <img
                    src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80"
                    alt={listing.address}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-[#c8a45e] text-black text-xs font-bold px-3 py-1 rounded-full z-10">
                    {listing.tag}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-2xl font-bold text-[#c8a45e] mb-1">{listing.price}</p>
                  <p className="font-semibold mb-2">{listing.address}</p>
                  <div className="flex gap-4 text-muted text-sm">
                    <span>{listing.beds} Beds</span>
                    <span>{listing.baths} Baths</span>
                    <span>{listing.sqft} sqft</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Agent */}
      <section id="about" className="py-24 bg-surface relative overflow-hidden">
        <SectionBackground category="real-estate" variant="about" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#1a2744] to-[#2a3754] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
                alt="Real estate agent"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[#c8a45e] text-sm font-semibold uppercase tracking-wider mb-4">Meet Your Agent</p>
              <h2 className="text-3xl font-bold mb-6">Trusted Expertise in Every Transaction</h2>
              <p className="text-muted leading-relaxed mb-4">
                With over 15 years of experience in the local market, Prestige Realty has helped hundreds of families find their perfect home. We combine deep market knowledge with a personalized, client-first approach.
              </p>
              <p className="text-muted leading-relaxed mb-6">
                Whether you&apos;re a first-time buyer, upgrading, or investing, we guide you every step of the way — from search to closing.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Buyer Representation", "Seller Services", "Market Analysis", "Investment Properties"].map((item) => (
                  <span key={item} className="px-4 py-2 rounded-full bg-[#c8a45e]/10 text-[#c8a45e] text-sm font-medium border border-[#c8a45e]/20">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category="real-estate" variant="testimonials" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#c8a45e] text-sm font-semibold uppercase tracking-wider mb-4">Client Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah M.", text: "Found our dream home in just two weeks. The team was incredible throughout the entire process." },
              { name: "David & Lisa K.", text: "Sold our house above asking price. Their market expertise made all the difference." },
              { name: "James R.", text: "As a first-time buyer, I was nervous. They made everything simple and stress-free." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface border border-border"
              >
                <div className="flex items-center gap-1 text-[#c8a45e] mb-4">
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
