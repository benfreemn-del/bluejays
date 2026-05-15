"use client";

import Image from "next/image";

/* ───────────────────────── Icons ───────────────────────── */

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.91.71 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.58 2.81.71A2 2 0 0122 16.92z" />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.52-.2-1-.54-1.36-.33-.37-.53-.86-.53-1.39 0-1.1.9-2 2-2h2.36c3.07 0 5.64-2.57 5.64-5.64C23.64 5.82 18.52 2 12 2z" />
    <circle cx="7.5" cy="11.5" r="1.5" />
    <circle cx="10.5" cy="7.5" r="1.5" />
    <circle cx="15.5" cy="7.5" r="1.5" />
    <circle cx="17.5" cy="11.5" r="1.5" />
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const HOW_IT_WORKS = [
  {
    icon: <BoltIcon />,
    title: "Built in Days, Not Months",
    description:
      "Streamlined process delivers a polished site faster than any agency. Most sites ready in under 48 hours.",
  },
  {
    icon: <PaletteIcon />,
    title: "Industry-Specific Design",
    description:
      "Every site is crafted for your specific business — sections that actually matter to your customers.",
  },
  {
    icon: <MobileIcon />,
    title: "Mobile-First & Lightning Fast",
    description:
      "Every site scores 90+ on Google PageSpeed. Your customers find you on phones — we make it look perfect there.",
  },
  {
    icon: <EyeIcon />,
    title: "See It Before You Pay",
    description:
      "We build the site first and show you a live preview. Only pay if you love it. Zero risk on you.",
  },
];

/* ───────────────────────── Component ───────────────────────── */

export default function AboutBen() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden bg-[#030712]">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[420px] h-[420px] rounded-full bg-sky-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[360px] h-[360px] rounded-full bg-blue-600/[0.06] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-[5fr_6fr] gap-12 md:gap-16 items-center">
          {/* Left — photo */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-sky-500/10">
              <Image
                src="/ben-and-wife.jpg"
                alt="Ben Freeman with his wife"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 left-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white px-5 py-3 rounded-xl shadow-xl shadow-sky-500/30 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Founder</div>
              <div className="text-base font-bold">Ben Freeman</div>
            </div>
          </div>

          {/* Right — story */}
          <div>
            <span className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5">
              Meet Ben
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              When you hire BlueJays, <span className="text-sky-400">you hire me.</span>
            </h2>
            <div className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mb-7" />

            <div className="space-y-4 text-white/70 text-base md:text-lg leading-relaxed">
              <p>
                Hi, I&apos;m Ben. I live in Quilcene, Washington with my wife &mdash; that&apos;s us in the photo.
              </p>
              <p>
                I&apos;ve spent most of my career in public service — Washington State Trooper. That work taught me one thing every single day: people remember when someone shows up, and they remember when someone disappears.
              </p>
              <p>
                I started BlueJays because I watched too many local owners get burned by web designers who sold slick promises, dropped a generic template on them, and vanished the moment the invoice cleared. The people I knew deserved better. So did the towns they served.
              </p>
              <p>
                That&apos;s why this exists. I build modern, premium websites for the small businesses and non-profits that actually hold communities together. Fair prices. I answer my phone. I don&apos;t disappear after launch.
              </p>
              <p className="text-white/85 font-medium">
                When you work with BlueJays, you&apos;re working with me. Not a project manager. Not a chatbot. Not someone overseas who&apos;ll never meet you. That&apos;s the deal.
              </p>
            </div>

            {/* Trust pillars */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-col items-start">
                <div className="text-sky-400 mb-2"><PinIcon /></div>
                <div className="text-white font-semibold text-sm">Local</div>
                <div className="text-white/50 text-xs mt-1">Quilcene, WA</div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-sky-400 mb-2"><ShieldIcon /></div>
                <div className="text-white font-semibold text-sm">Accountable</div>
                <div className="text-white/50 text-xs mt-1">One promise, one person</div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-sky-400 mb-2"><PhoneIcon /></div>
                <div className="text-white font-semibold text-sm">Personal</div>
                <div className="text-white/50 text-xs mt-1">Direct line, real human</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works — 4-card strip absorbed from the deleted About.tsx
            section 2026-05-14. Lives below the founder narrative so the
            "you hire me" promise lands first, then the 4 concrete claims
            back it up. */}
        <div className="mt-16 md:mt-20 pt-10 md:pt-14 border-t border-white/10">
          <div className="text-center mb-8 md:mb-10">
            <span className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-3 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5">
              How it works
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Four promises behind every site I ship
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-sky-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-extrabold text-white/[0.06] group-hover:text-sky-500/15 transition-colors duration-300 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="font-bold text-base mb-1.5 group-hover:text-sky-300 transition-colors duration-300">
                    {item.title}
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
