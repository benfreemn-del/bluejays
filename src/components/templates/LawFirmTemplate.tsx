"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";
import SectionBackground from "./SectionBackground";

const practiceAreas = [
  { name: "Personal Injury", desc: "Car accidents, slip & fall, medical malpractice. We fight for maximum compensation.", icon: "⚖️" },
  { name: "Family Law", desc: "Divorce, custody, adoption, and prenuptial agreements handled with care.", icon: "👨‍👩‍👧" },
  { name: "Criminal Defense", desc: "DUI, misdemeanors, felonies. Aggressive defense to protect your rights.", icon: "🛡️" },
  { name: "Estate Planning", desc: "Wills, trusts, and power of attorney. Secure your family's future today.", icon: "📋" },
  { name: "Business Law", desc: "Formation, contracts, disputes, and compliance for businesses of all sizes.", icon: "🏢" },
  { name: "Real Estate Law", desc: "Closings, disputes, landlord-tenant issues, and title review services.", icon: "🏠" },
];

const caseResults = [
  { amount: "$2.4M", type: "Auto Accident Settlement" },
  { amount: "$1.8M", type: "Medical Malpractice Verdict" },
  { amount: "$950K", type: "Workplace Injury Settlement" },
  { amount: "$750K", type: "Slip & Fall Recovery" },
];

export default function LawFirmTemplate() {
  return (
    <TemplateLayout
      businessName="Carter & Associates"
      tagline="Experienced attorneys fighting for your rights. Over 20 years of proven results."
      accentColor="#8b5cf6"
      accentColorLight="#a78bfa"
      heroGradient="linear-gradient(135deg, #1f1a2e 0%, #13101f 100%)"
      heroImage="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80"
      phone="(555) 345-6789"
      address="456 Justice Blvd, Your City"
    >
      {/* Free Consultation Bar */}
      <section className="py-4 bg-[#8b5cf6] text-white text-center">
        <p className="text-sm font-semibold">Free Initial Consultation — No Fee Unless We Win</p>
      </section>

      {/* Practice Areas */}
      <section id="services" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category="law-firm" variant="services" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4">Practice Areas</p>
            <h2 className="text-3xl md:text-4xl font-bold">Legal Expertise You Can Trust</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceAreas.map((area, i) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface border border-border hover:border-[#8b5cf6]/40 transition-colors"
              >
                <div className="text-3xl mb-4">{area.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{area.name}</h3>
                <p className="text-muted text-sm leading-relaxed">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Results */}
      <section className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4">Proven Results</p>
            <h2 className="text-3xl md:text-4xl font-bold">Millions Recovered for Our Clients</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {caseResults.map((result, i) => (
              <motion.div
                key={result.type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-surface-light border border-border"
              >
                <p className="text-3xl font-bold text-[#8b5cf6] mb-2">{result.amount}</p>
                <p className="text-muted text-sm">{result.type}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-background relative overflow-hidden">
        <SectionBackground category="law-firm" variant="about" />
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#1f1a2e] to-[#2f2a3e] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
              alt="Attorney portrait"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4">Why Choose Us</p>
            <h2 className="text-3xl font-bold mb-6">Relentless Advocacy. Personal Attention.</h2>
            <p className="text-muted leading-relaxed mb-6">
              At Carter & Associates, every case gets the senior partner&apos;s attention. We limit our caseload so we can give your matter the focus it deserves. When you hire us, you get a team that fights as if the outcome were our own.
            </p>
            <ul className="space-y-3">
              {["20+ years of trial experience", "No fee unless we win your case", "24/7 availability for emergencies", "Millions recovered for clients"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="text-[#8b5cf6]">✓</span>
                  <span className="text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-surface relative overflow-hidden">
        <SectionBackground category="law-firm" variant="testimonials" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-[#8b5cf6] text-sm font-semibold uppercase tracking-wider mb-4">Client Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by Hundreds of Clients</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Thomas W.", text: "After my accident, they took care of everything. I got a settlement far beyond what I expected." },
              { name: "Jennifer L.", text: "Going through a divorce was hard, but they made the legal side painless. Compassionate and professional." },
              { name: "Robert M.", text: "They took my case when others wouldn't. Fought hard and won. I can't recommend them enough." },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-surface-light border border-border"
              >
                <div className="flex items-center gap-1 text-[#8b5cf6] mb-4">
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
