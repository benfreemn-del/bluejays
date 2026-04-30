"use client";

import BluejayLogo from "./BluejayLogo";

/**
 * Homepage FAQ section.
 *
 * Hormozi-aligned: every answer subtly reinforces ONE of the core
 * value props (speed = 48hr, ease = 5-min onboarding, risk reversal,
 * real human, no lock-in) — without sounding like an ad. The "lowkey
 * sell" rule: lead with the honest answer, let the value prop ride
 * the back of the answer instead of being the answer.
 *
 * Native <details>/<summary> for full accessibility (keyboard,
 * screen readers, no-JS fallback). Tailwind group-state utilities
 * handle the open/close animations + chevron rotation. Multiple can
 * be open at once — better UX than enforcing one-at-a-time.
 */

const FAQS: { q: string; a: string }[] = [
  {
    q: "How fast can you actually build my site?",
    a: "48 hours from when you finish onboarding. Most owners get their preview link before they finish their second coffee. We've shipped sites Friday afternoon, gone live Sunday morning. Speed isn't a feature — it's the whole point. You shouldn't wait 8 weeks for an agency to send you a draft you might hate.",
  },
  {
    q: "What if I don't love what you build?",
    a: "You don't pay a cent. We send you the finished site, you click around, send it to your spouse, sleep on it — and ONLY if you say \"yes, ship it\" do we charge the $997. Don't love it? It disappears. No pitch. No follow-up. No card on file. The risk is on us, not you.",
  },
  {
    q: "How much work do I actually have to do?",
    a: "Five minutes of onboarding. You tell us your business name, what you do, your hours, and your phone number. We handle copywriting, photos, design, local SEO, domain registration, and hosting setup. You review when it's ready. That's the whole job — most clients spend more time picking a good photo for the homepage than they do filling out the form.",
  },
  {
    q: "Will it look like a generic template?",
    a: "No. Every site is built specifically for your industry — a plumber's site doesn't look like a salon's site. We use real photos that match your work (yours if you have them, otherwise we source quality stock that fits), industry-specific copywriting, and design choices that match your business. Not a Wix theme with your logo dropped on it.",
  },
  {
    q: "Who's actually building this?",
    a: "Me. Ben Freeman. I'm a Washington State Trooper who started BlueJays because I watched too many local business owners get burned by web designers who ghost after the invoice cleared. You have my direct phone, my email, and you're talking to a real person — not an \"account executive\" who hands you off to someone you'll never meet.",
  },
  {
    q: "What happens to my current website during the switch?",
    a: "Stays live until the new one's ready. You keep your existing domain (or we register a new one in your name if you want a fresh start). When the new site's approved, we switch the DNS over — zero downtime, zero downtime spike. Your customers never see a broken site. Your old site disappears the instant the new one goes live.",
  },
  {
    q: "What's the catch on the $100/year?",
    a: "There isn't one. Year 1 is included in the $997. Year 2 onward, $100/year covers domain renewal, hosting, security updates, and small content changes (new hours, new photo, new service line). Cancel anytime — you keep the site, the domain transfers to you, and you walk. No contracts, no \"early termination,\" no lock-in.",
  },
  {
    q: "Can I add things later — booking, payments, a blog?",
    a: "Yes. Tell me what you need and I'll quote it specifically. Most additions land between $150 and $500 and take a day or two. The $997 covers the core site that books calls and looks professional — bigger features get scoped separately so you only pay for what you actually use, not for stuff you'll never touch.",
  },
];

const ChevronDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 shrink-0 text-sky-400 transition-transform duration-300 group-open:rotate-180"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="faqGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#faqGrid)" />
  </svg>
);

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a1628 0%, #0c1a30 50%, #0a1628 100%)",
      }}
    >
      {/* Decorative bg */}
      <GridPattern opacity={0.025} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-sky-500/[0.05] blur-[160px]" />
        <div className="absolute bottom-[8%] right-[8%] w-[450px] h-[450px] rounded-full bg-blue-700/[0.07] blur-[140px]" />
        <BluejayLogo
          size={180}
          className="absolute top-[12%] right-[8%] opacity-[0.04] text-sky-500 rotate-12"
        />
        <BluejayLogo
          size={130}
          className="absolute bottom-[14%] left-[6%] opacity-[0.03] text-sky-400 -rotate-6"
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Questions every{" "}
            <span className="text-sky-400">smart owner</span> asks
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mt-4 mx-auto" />
          <p className="text-white/55 mt-4 max-w-xl text-base md:text-lg leading-relaxed mx-auto">
            Honest answers. No marketing fluff. If we&apos;re missing one,
            email{" "}
            <a
              href="mailto:ben@bluejayportfolio.com"
              className="text-sky-400 hover:text-sky-300 underline underline-offset-4 decoration-sky-500/30"
            >
              ben@bluejayportfolio.com
            </a>{" "}
            and I&apos;ll add it.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-sky-500/25 hover:bg-white/[0.035] open:border-sky-500/40 open:bg-sky-500/[0.04] open:shadow-[0_0_40px_rgba(14,165,233,0.08)] transition-all duration-300 overflow-hidden"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 px-6 py-5 md:px-7 md:py-6 select-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start gap-4 flex-1">
                  {/* Number badge */}
                  <span className="shrink-0 w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[11px] font-bold text-sky-400 tabular-nums mt-0.5 group-open:bg-sky-500/20 group-open:border-sky-500/50 group-open:text-sky-300 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base md:text-lg font-semibold text-white leading-snug pr-2 group-open:text-sky-100 transition-colors duration-300">
                    {faq.q}
                  </span>
                </span>
                <ChevronDown />
              </summary>
              <div className="px-6 md:px-7 pb-5 md:pb-7">
                <div className="pl-11">
                  <div className="h-px w-full bg-gradient-to-r from-sky-500/30 to-transparent mb-4" />
                  <p className="text-white/70 text-base leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* Bottom CTA — soft, non-pushy */}
        <div className="mt-14 text-center">
          <p className="text-white/50 text-base mb-5">
            Still have questions? The fastest way to get answers is to{" "}
            <span className="text-white font-semibold">see your site</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.55)] active:scale-[0.97] transition-all duration-300"
            >
              Build my full preview
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="/audit"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-sky-500/40 bg-sky-500/[0.04] text-sky-200 hover:bg-sky-500/10 hover:border-sky-400/70 hover:text-white text-base font-semibold transition-all duration-300"
            >
              Run a free 60-second audit
            </a>
          </div>
          <p className="mt-5 text-sm text-white/45">
            <span className="text-white/70 font-medium">
              Don&apos;t love what we build?
            </span>{" "}
            You don&apos;t pay a cent.
          </p>
        </div>
      </div>
    </section>
  );
}
