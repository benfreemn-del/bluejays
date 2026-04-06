"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

const services = [
  { name: "Lawn Maintenance", desc: "Weekly mowing, edging, fertilization, and weed control to keep your lawn pristine.", icon: "🌿" },
  { name: "Landscape Design", desc: "Custom garden design, plant selection, and installation by certified landscapers.", icon: "🎨" },
  { name: "Hardscaping", desc: "Patios, walkways, retaining walls, and outdoor kitchens built to last.", icon: "🧱" },
  { name: "Tree Services", desc: "Trimming, removal, stump grinding, and health assessments for all tree types.", icon: "🌳" },
  { name: "Irrigation Systems", desc: "Sprinkler installation, repair, and smart water management systems.", icon: "💧" },
  { name: "Seasonal Cleanup", desc: "Spring prep, fall leaf removal, snow clearing, and holiday light installation.", icon: "🍂" },
];

const projects = [
  { name: "Backyard Oasis", type: "Full Redesign", detail: "Complete backyard transformation with custom water feature, native plantings, and outdoor living space." },
  { name: "Modern Patio Build", type: "Hardscaping", detail: "600 sq ft travertine patio with built-in fire pit and integrated LED lighting." },
  { name: "Cottage Garden", type: "Planting Design", detail: "English cottage-style garden with perennial beds, winding stone paths, and a charming arbor." },
  { name: "Commercial Property", type: "Maintenance", detail: "Year-round maintenance for a 5-acre commercial campus including irrigation management." },
  { name: "Poolside Landscape", type: "Full Redesign", detail: "Tropical poolside paradise with palm trees, ornamental grasses, and natural stone edging." },
  { name: "Front Yard Makeover", type: "Curb Appeal", detail: "Drought-tolerant front yard redesign with decorative rock, succulents, and pathway lighting." },
];

export default function LandscapingTemplate() {
  return (
    <TemplateLayout
      businessName="GreenScape Pro"
      tagline="Transform your outdoor space into something extraordinary. Professional landscaping for homes and businesses."
      accentColor="#22c55e"
      accentColorLight="#4ade80"
      heroGradient="linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)"
      heroImage="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1400&q=80"
      phone="(555) 456-7890"
      address="789 Garden Way, Your City"
    >
      {/* Quick CTA Bar */}
      <section className="py-4 bg-[#22c55e] text-white text-center">
        <p className="text-sm font-semibold">Free Estimates on All Projects — Call Today!</p>
      </section>

      {/* Trust Badges */}
      <section
        className="py-8 border-b border-border/30 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #22c55e10 0%, #22c55e06 50%, transparent 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[30%] w-[300px] h-[200px] rounded-full blur-[100px]" style={{ background: `#22c55e0a` }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { icon: "🛡️", label: "Licensed & Insured", sub: "Full Liability Coverage" },
              { icon: "✅", label: "Satisfaction Guaranteed", sub: "100% or Money Back" },
              { icon: "🏆", label: "Award Winning", sub: "Best of 2024 Landscaping" },
              { icon: "🌱", label: "Eco-Friendly", sub: "Sustainable Practices" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#22c55e]/20" style={{ background: `#22c55e08` }}>
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-muted">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #22c55e06 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ background: `#22c55e0c` }} />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#22c55e08` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#22c55e" strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M200 150 Q220 100 240 150 Q260 100 280 150" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M750 180 Q770 130 790 180 Q810 130 830 180" stroke="#22c55e" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold">Everything Your Yard Needs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 hover:border-opacity-60 transition-all duration-300 relative overflow-hidden group"
                style={{ background: `#22c55e08` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #22c55e15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #22c55e06 0%, #22c55e0a 50%, #22c55e06 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[25%] left-[8%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#22c55e0a` }} />
          <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#22c55e08` }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill="#22c55e" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Our Work</p>
            <h2 className="text-3xl md:text-4xl font-bold">Recent Projects</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#1a2e1a] to-[#2a3e2a] cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80"
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    <p className="text-white font-bold text-lg mb-1">{project.name}</p>
                    <span className="inline-block bg-[#22c55e]/80 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">{project.type}</span>
                    <p className="text-white/70 text-xs leading-relaxed">{project.detail}</p>
                    <span className="inline-block mt-3 text-[#22c55e] text-xs font-semibold border border-[#22c55e]/40 px-3 py-1 rounded-full">View Full Project</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #22c55e06 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#22c55e0a` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 600">
            <path d="M0 400 Q250 300 500 400 Q750 500 1000 400" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M100 200 Q120 150 140 200 Q160 150 180 200" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M850 250 Q870 200 890 250 Q910 200 930 250" stroke="#22c55e" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Why GreenScape Pro</p>
            <h2 className="text-3xl font-bold mb-6">Your Yard Deserves the Best</h2>
            <p className="text-muted leading-relaxed mb-6">
              We&apos;re not just lawn mowers — we&apos;re outdoor living experts. From design to installation to year-round maintenance, we handle every detail so you can enjoy your space without lifting a finger.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: "Projects Completed" },
                { value: "12+", label: "Years in Business" },
                { value: "100%", label: "Licensed & Insured" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl border border-border/50 text-center relative overflow-hidden group"
                  style={{ background: `#22c55e08` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, #22c55e10, transparent 70%)` }} />
                  <div className="relative z-10">
                    <p className="text-xl font-bold text-[#22c55e]">{stat.value}</p>
                    <p className="text-muted text-xs mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#1a2e1a] to-[#2a3e2a] flex items-center justify-center">
            <div className="text-6xl opacity-30">🌳</div>
          </div>
        </div>
      </section>

      {/* Seasonal Services */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #22c55e06 0%, #22c55e0c 50%, #22c55e06 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[15%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#22c55e0c` }} />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#22c55e08` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M100 150 Q120 100 140 150" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <path d="M860 250 Q880 200 900 250" stroke="#22c55e" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Year-Round Care</p>
            <h2 className="text-3xl md:text-4xl font-bold">Seasonal Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { season: "Spring", icon: "🌸", services: ["Spring cleanup & debris removal", "Mulching & bed prep", "Fertilization programs", "New plantings & sod"] },
              { season: "Summer", icon: "☀️", services: ["Weekly mowing & edging", "Irrigation monitoring", "Pest & weed control", "Hedge & shrub trimming"] },
              { season: "Fall", icon: "🍂", services: ["Leaf removal & cleanup", "Aeration & overseeding", "Fall fertilization", "Garden winterization"] },
              { season: "Winter", icon: "❄️", services: ["Snow removal & de-icing", "Holiday light installation", "Dormant pruning", "Winter landscape planning"] },
            ].map((s, i) => (
              <motion.div
                key={s.season}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden group"
                style={{ background: `#22c55e08` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #22c55e15, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="text-lg font-bold text-[#22c55e] mb-4">{s.season}</h3>
                  <ul className="space-y-2">
                    {s.services.map((svc) => (
                      <li key={svc} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-[#22c55e] mt-0.5 text-xs">&#9679;</span>
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #22c55e08 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#22c55e0a` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
            <circle cx="500" cy="200" r="100" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="160" stroke="#22c55e" strokeWidth="0.3" fill="none" />
            <circle cx="500" cy="200" r="220" stroke="#22c55e" strokeWidth="0.2" fill="none" />
            <circle cx="500" cy="200" r="5" fill="#22c55e" fillOpacity="0.3" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Where We Work</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Service Area</h2>
          <p className="text-muted mb-10 max-w-xl mx-auto">We proudly serve the following communities and surrounding areas. Don&apos;t see your neighborhood? Give us a call — we may still be able to help.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Downtown", "Westlake Hills", "Lakewood", "Maplewood", "Sunset Ridge",
              "Crestview", "Oak Park", "Riverside", "Cedar Heights", "Greenfield",
              "Willow Creek", "Summit Glen", "Brookside", "Heritage Hills", "Pine Valley",
            ].map((area) => (
              <span
                key={area}
                className="px-5 py-2.5 rounded-full border border-[#22c55e]/20 text-sm font-medium text-muted hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-colors cursor-default"
                style={{ background: `#22c55e08` }}
              >
                {area}
              </span>
            ))}
          </div>
          <p className="text-muted/60 text-xs mt-6">Serving a 30-mile radius from downtown. Commercial contracts available region-wide.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #22c55e05 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#22c55e08` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#22c55e" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#22c55e" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#22c55e" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-wider mb-4">Reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Karen P.", text: "Our backyard went from embarrassing to the envy of the neighborhood. Absolutely incredible work." },
              { name: "Steve & Maria D.", text: "They've maintained our property for 3 years now. Always reliable, always professional." },
              { name: "Chris L.", text: "The patio they built exceeded every expectation. We practically live outside now." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden"
                style={{ background: `#22c55e08` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, #22c55e40, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 text-[#22c55e] mb-4">
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
