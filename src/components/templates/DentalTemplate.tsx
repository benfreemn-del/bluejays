"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";
import SectionBackground from "./SectionBackground";

const services = [
  { name: "General Dentistry", desc: "Exams, cleanings, fillings, and preventive care for the whole family.", icon: "🦷" },
  { name: "Cosmetic Dentistry", desc: "Whitening, veneers, and smile makeovers to boost your confidence.", icon: "✨" },
  { name: "Orthodontics", desc: "Invisalign and traditional braces for a perfectly aligned smile.", icon: "😁" },
  { name: "Implants & Crowns", desc: "Permanent solutions for missing or damaged teeth. Natural-looking results.", icon: "🔧" },
  { name: "Emergency Care", desc: "Same-day appointments for dental emergencies. We're here when you need us.", icon: "🚨" },
  { name: "Pediatric Dentistry", desc: "Gentle, fun dental care designed specifically for kids of all ages.", icon: "👶" },
];

const insurances = ["Delta Dental", "Cigna", "Aetna", "MetLife", "United Healthcare", "Guardian", "BlueCross"];

export default function DentalTemplate() {
  return (
    <TemplateLayout
      businessName="Bright Smile Dental"
      tagline="Modern dental care for the whole family. Gentle, compassionate, and always accepting new patients."
      accentColor="#10b981"
      accentColorLight="#34d399"
      heroGradient="linear-gradient(135deg, #0f2a2a 0%, #0a1f1f 100%)"
      heroImage="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=80"
      phone="(555) 234-5678"
      address="123 Health Ave, Your City"
    >
      {/* Trust Bar */}
      <section className="py-6 bg-[#10b981]/10 border-y border-border">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-6 text-sm text-muted">
          <span>✓ Accepting New Patients</span>
          <span>✓ Most Insurance Accepted</span>
          <span>✓ Same-Day Emergencies</span>
          <span>✓ Sedation Options Available</span>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category="dental" variant="services" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#10b981] text-sm font-semibold uppercase tracking-wider mb-4">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold">Complete Dental Care Under One Roof</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface border border-border hover:border-[#10b981]/40 transition-colors"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Smile Gallery placeholder */}
      <section id="about" className="py-24 bg-surface relative overflow-hidden">
        <SectionBackground category="dental" variant="about" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#10b981] text-sm font-semibold uppercase tracking-wider mb-4">About Our Practice</p>
              <h2 className="text-3xl font-bold mb-6">A Dental Experience You&apos;ll Actually Enjoy</h2>
              <p className="text-muted leading-relaxed mb-4">
                At Bright Smile Dental, we believe visiting the dentist should be comfortable, not stressful. Our modern office features the latest technology, a warm and friendly team, and a commitment to gentle care.
              </p>
              <p className="text-muted leading-relaxed mb-6">
                From routine cleanings to complex restorations, every treatment is personalized to your unique needs and goals.
              </p>
              <a
                href="#contact"
                className="inline-flex h-12 px-6 rounded-full bg-[#10b981] text-white font-semibold items-center"
              >
                Book Your Appointment
              </a>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["Before & After 1", "Before & After 2", "Office Tour", "Our Team"].map((label) => (
                  <div key={label} className="aspect-square rounded-xl bg-gradient-to-br from-[#0f2a2a] to-[#1a3a3a] overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80"
                      alt={label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <p className="text-white text-xs text-center px-2 font-medium">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-muted text-sm uppercase tracking-wider mb-6">Insurance We Accept</p>
          <div className="flex flex-wrap justify-center gap-4">
            {insurances.map((ins) => (
              <span key={ins} className="px-5 py-2 rounded-full bg-surface border border-border text-sm text-muted">
                {ins}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-surface relative overflow-hidden">
        <SectionBackground category="dental" variant="testimonials" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#10b981] text-sm font-semibold uppercase tracking-wider mb-4">Patient Reviews</p>
            <h2 className="text-3xl md:text-4xl font-bold">Smiles Speak Louder Than Words</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Amanda T.", text: "Best dental experience I've ever had. The staff is so friendly and the office is beautiful." },
              { name: "Michael B.", text: "My kids actually look forward to their dental visits now. That says everything." },
              { name: "Rachel S.", text: "Got my Invisalign here and the results are amazing. Couldn't be happier with my smile." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface-light border border-border"
              >
                <div className="flex items-center gap-1 text-[#10b981] mb-4">
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
