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
        <div className="grid md:grid-cols-4 gap-10 mb-10">
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
                { label: "Templates", href: "/#portfolio" },
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
            {/* Social placeholder icons */}
            <div className="flex items-center gap-3 mt-5">
              {/* Twitter/X */}
              <a href="#" className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-sky-400 hover:border-sky-500/30 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-sky-400 hover:border-sky-500/30 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-sky-400 hover:border-sky-500/30 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} BlueJays. All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-white/30 text-sm">
            <BluejayLogo size={16} className="text-sky-500" />
            Created by{" "}
            <a
              href="https://bluejayportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors underline underline-offset-2"
            >
              bluejayportfolio.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
