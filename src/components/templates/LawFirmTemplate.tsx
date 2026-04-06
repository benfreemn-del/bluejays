"use client";

import { motion } from "framer-motion";
import TemplateLayout from "./TemplateLayout";

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
      <section
        id="services"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #8b5cf606 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ background: `#8b5cf60c` }} />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[120px]" style={{ background: `#8b5cf608` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 600">
            <path d="M0 300 Q250 200 500 300 Q750 400 1000 300" stroke="#8b5cf6" strokeWidth="1" fill="none" />
            <path d="M0 350 Q250 250 500 350 Q750 450 1000 350" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
            <line x1="500" y1="100" x2="500" y2="500" stroke="#8b5cf6" strokeWidth="0.3" />
            <circle cx="500" cy="300" r="30" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
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
                className="p-6 rounded-xl border border-border/50 hover:border-opacity-60 transition-all duration-300 relative overflow-hidden group"
                style={{ background: `#8b5cf608` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, #8b5cf615, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="text-3xl mb-4">{area.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{area.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{area.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Results */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #8b5cf606 0%, #8b5cf60a 50%, #8b5cf606 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[40%] right-[15%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#8b5cf60a` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 1000 400">
            <path d="M0 200 Q250 100 500 200 Q750 300 1000 200" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
            <path d="M0 250 Q250 150 500 250 Q750 350 1000 250" stroke="#8b5cf6" strokeWidth="0.3" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
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
                className="text-center p-6 rounded-xl border border-border/50 relative overflow-hidden group"
                style={{ background: `#8b5cf608` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, #8b5cf610, transparent 70%)` }} />
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-[#8b5cf6] mb-2">{result.amount}</p>
                  <p className="text-muted text-sm">{result.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #8b5cf606 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ background: `#8b5cf60a` }} />
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.04]" viewBox="0 0 1440 200" fill="none">
            <path d="M0 100 C360 0 720 200 1080 100 C1260 50 1440 100 1440 100 V200 H0Z" fill="#8b5cf6" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
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
      <section
        id="testimonials"
        className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, #0a0a0a 0%, #8b5cf605 50%, #0a0a0a 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: `#8b5cf608` }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" viewBox="0 0 800 400">
            <circle cx="400" cy="200" r="100" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
            <circle cx="400" cy="200" r="180" stroke="#8b5cf6" strokeWidth="0.3" fill="none" />
            <circle cx="400" cy="200" r="260" stroke="#8b5cf6" strokeWidth="0.2" fill="none" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
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
                className="p-6 rounded-xl border border-border/50 relative overflow-hidden"
                style={{ background: `#8b5cf608` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, #8b5cf640, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 text-[#8b5cf6] mb-4">
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
