import BluejayLogo, { BluejayLogoCircle } from "./BluejayLogo";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#050a14]">
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-sky-500/[0.04] blur-[120px]" />
        <BluejayLogo size={120} className="absolute bottom-[10%] right-[3%] opacity-[0.025] text-sky-500 rotate-6" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-6 md:gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <BluejayLogoCircle size={42} />
              <span className="text-xl font-bold text-white tracking-tight">BlueJays</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Premium web design for local businesses. We build stunning,
              high-converting websites tailored to your industry — delivered
              fast, priced fairly.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Portfolio", href: "/" },
                { label: "AI Marketing System", href: "/agency" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Contact", href: "mailto:bluejaycontactme@gmail.com" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 hover:text-sky-400 text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:bluejaycontactme@gmail.com"
                  className="text-white/40 hover:text-sky-400 text-sm transition-colors duration-300"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} BlueJays. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/partners/apply"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/8 text-amber-400/70 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/15 text-xs font-medium transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 flex-shrink-0">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Become an affiliate
            </a>
            <p className="flex items-center gap-2 text-white/30 text-sm">
              <BluejayLogo size={16} className="text-sky-500" />
              Built by{" "}
              <a
                href="https://bluejayportfolio.com/audit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors underline underline-offset-2"
              >
                BlueJays
              </a>{" "}
              — get your free site audit
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
