"use client";

export default function Contact() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-electric/5 blur-[100px]" />

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
            className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-gradient-to-r from-blue-electric to-blue-deep text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow duration-300"
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
