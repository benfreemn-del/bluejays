"use client";

import BluejayLogo from "./BluejayLogo";

export default function Contact() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #050a14 0%, #0a1830 50%, #050a14 100%)" }}>
      {/* Background art */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-electric/10 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-blue-glow/8 blur-[100px]" />
        <BluejayLogo size={160} className="absolute top-[15%] left-[5%] opacity-[0.03] text-blue-electric rotate-6" />
        <BluejayLogo size={100} className="absolute bottom-[20%] right-[8%] opacity-[0.025] text-blue-glow -rotate-12" />
        {/* Radial rings */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 800 400">
          <circle cx="400" cy="200" r="100" stroke="#0ea5e9" strokeWidth="0.5" fill="none" />
          <circle cx="400" cy="200" r="180" stroke="#0ea5e9" strokeWidth="0.3" fill="none" />
          <circle cx="400" cy="200" r="260" stroke="#0ea5e9" strokeWidth="0.2" fill="none" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <div>
          <p className="text-blue-electric text-sm font-semibold uppercase tracking-wider mb-4">
            Get Started
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to see your new website?
          </h2>
          <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
            We&apos;ll build it first and show you a live preview — completely
            free. No commitment, no credit card required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:bluejaycontactme@gmail.com"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] transition-shadow duration-300"
          >
            Claim Your Free Preview
          </a>
        </div>

        <p className="text-muted text-sm mt-6">
          Typically delivered within 48 hours
        </p>
      </div>
    </section>
  );
}
