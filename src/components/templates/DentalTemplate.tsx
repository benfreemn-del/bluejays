"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

const services = [
  { name: "General Dentistry", desc: "Exams, cleanings, fillings, and preventive care for the whole family.", icon: "🦷" },
  { name: "Cosmetic Dentistry", desc: "Whitening, veneers, and smile makeovers to boost your confidence.", icon: "✨" },
  { name: "Orthodontics", desc: "Invisalign and traditional braces for a perfectly aligned smile.", icon: "😁" },
  { name: "Implants & Crowns", desc: "Permanent solutions for missing or damaged teeth. Natural-looking results.", icon: "🔧" },
  { name: "Emergency Care", desc: "Same-day appointments for dental emergencies. We're here when you need us.", icon: "🚨" },
  { name: "Pediatric Dentistry", desc: "Gentle, fun dental care designed specifically for kids of all ages.", icon: "👶" },
];

const insurances = ["Delta Dental", "Cigna", "Aetna", "MetLife", "United Healthcare", "Guardian", "BlueCross"];

const teamMembers = [
  { name: "Dr. Sarah Chen", role: "Lead Dentist, DDS", specialty: "Cosmetic & Restorative", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
  { name: "Dr. James Park", role: "Orthodontist, DMD", specialty: "Invisalign Certified", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
  { name: "Maria Lopez", role: "Dental Hygienist, RDH", specialty: "Preventive Care", image: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=400&q=80" },
];

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
      <section
        className="py-6 border-y border-border relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #10b98115 0%, #10b98108 50%, transparent 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[30%] w-[250px] h-[250px] rounded-full blur-[100px]" style={{ background: `#10b98110` }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-6 text-sm text-muted relative z-10">
          <span>✓ Accepting New Patients</span>
          <span>✓ Most Insurance Accepted</span>
          <span>✓ Same-Day Emergencies</span>
          <span>✓ Sedation Options Available</span>
        </div>
      </section>

      {/* New Patient Special */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #10b9810a 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#10b98110` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 300">
            <circle cx="500" cy="150" r="80" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="150" r="120" stroke="#10b981" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl border border-[#10b981]/30 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, #10b98112 0%, #10b98106 100%)` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #10b98118, transparent 60%)` }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#10b981]/15 text-[#10b981] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-[#10b981]/20">
                <span>Limited Time Offer</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">New Patient Special</h2>
              <p className="text-5xl md:text-6xl font-bold text-[#10b981] mb-4">$99</p>
              <p className="text-muted leading-relaxed mb-2 max-w-lg mx-auto">
                Comprehensive exam, full set of X-rays, and professional cleaning — a $350 value.
              </p>
              <p className="text-muted/60 text-sm mb-8">No insurance required. Valid for new patients only.</p>
              <a
                href="#contact"
                className="inline-flex h-14 px-10 rounded-full bg-[#10b981] text-white font-bold items-center text-lg hover:bg-[#34d399] transition-colors shadow-lg shadow-[#10b981]/20"
              >
                Claim Your $99 Visit
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #10b98106 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ background: `#10b9810c` }} />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#10b98108` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#10b981" strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="300" r="40" stroke="#10b981" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
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
                className="p-6 rounded-xl border border-border/50 hover:border-opacity-60 transition-all duration-300 relative overflow-hidden group"
                style={{ background: `#10b98108` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #10b98115, transparent 70%)` }} />
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

      {/* Patient Comfort */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #10b98106 0%, #10b9810c 50%, #10b98106 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#10b9810c` }} />
          <div className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#10b98108` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M200 200 Q300 100 400 200 Q500 300 600 200 Q700 100 800 200" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="500" cy="200" r="60" stroke="#10b981" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#10b981] text-sm font-semibold uppercase tracking-wider mb-4">Your Comfort Comes First</p>
            <h2 className="text-3xl md:text-4xl font-bold">A Stress-Free Dental Experience</h2>
            <p className="text-muted mt-4 max-w-2xl mx-auto">We understand dental anxiety is real. That&apos;s why we&apos;ve built our practice around your comfort — from the moment you walk in to the moment you leave with a brighter smile.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "💆", title: "Sedation Dentistry", desc: "Oral and nitrous oxide sedation options for anxiety-free treatment. Relax while we take care of everything." },
              { icon: "🏥", title: "Modern Equipment", desc: "Digital X-rays with 80% less radiation, intraoral cameras, and laser dentistry for precise, comfortable care." },
              { icon: "🤝", title: "Gentle Approach", desc: "Our team is trained in gentle techniques. We go at your pace and always explain what to expect before we begin." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 text-center relative overflow-hidden group"
                style={{ background: `#10b98108` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #10b98115, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="#contact"
              className="inline-flex h-14 px-10 rounded-full bg-[#10b981] text-white font-bold items-center text-lg hover:bg-[#34d399] transition-colors shadow-lg shadow-[#10b981]/20"
            >
              Book Your Appointment
            </a>
          </div>
        </div>
      </section>

      {/* About / Smile Gallery */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #10b98106 0%, #10b9810a 50%, #10b98106 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#10b9810a` }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill="#10b981" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
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
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #10b98105 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: `#10b98108` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" viewBox="0 0 800 200">
            <path d="M0 100 Q200 50 400 100 Q600 150 800 100" stroke="#10b981" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <p className="text-muted text-sm uppercase tracking-wider mb-6">Insurance We Accept</p>
          <div className="flex flex-wrap justify-center gap-4">
            {insurances.map((ins) => (
              <span key={ins} className="px-5 py-2 rounded-full border border-border/50 text-sm text-muted" style={{ background: `#10b98108` }}>
                {ins}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #10b9810a 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[10%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#10b9810a` }} />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#10b98108` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#10b981" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#10b981] text-sm font-semibold uppercase tracking-wider mb-4">Our Doctors & Staff</p>
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#0f2a2a] to-[#1a3a3a] mb-5 overflow-hidden border border-border/30">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-[#10b981] text-sm font-medium">{member.role}</p>
                <p className="text-muted text-xs mt-1">{member.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prominent CTA Repeat */}
      <section
        className="py-16 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #10b98108 0%, #10b98112 50%, #10b98108 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ background: `#10b98110` }} />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready for a Healthier Smile?</h2>
          <p className="text-muted mb-8">Schedule your visit today. New patients are always welcome and we offer flexible scheduling including evenings and weekends.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="inline-flex h-14 px-10 rounded-full bg-[#10b981] text-white font-bold items-center justify-center text-lg hover:bg-[#34d399] transition-colors shadow-lg shadow-[#10b981]/20"
            >
              Book Your Appointment
            </a>
            <a
              href="tel:5552345678"
              className="inline-flex h-14 px-10 rounded-full border-2 border-[#10b981]/40 text-[#10b981] font-bold items-center justify-center text-lg hover:bg-[#10b981]/10 transition-colors"
            >
              Call (555) 234-5678
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #10b98105 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#10b98108` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#10b981" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#10b981" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
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
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden"
                style={{ background: `#10b98108` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, #10b98140, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 text-[#10b981] mb-4">
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
