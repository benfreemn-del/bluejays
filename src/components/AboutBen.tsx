"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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

/* ───────────────────────── Component ───────────────────────── */

export default function AboutBen() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#030712]">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[420px] h-[420px] rounded-full bg-sky-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[360px] h-[360px] rounded-full bg-blue-600/[0.06] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-[5fr_6fr] gap-12 md:gap-16 items-center">
          {/* Left — photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-5 left-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white px-5 py-3 rounded-xl shadow-xl shadow-sky-500/30 backdrop-blur-sm"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Founder</div>
              <div className="text-base font-bold">Ben Freeman</div>
            </motion.div>
          </motion.div>

          {/* Right — story */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-4 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5"
            >
              Meet Ben
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
            >
              When you hire BlueJays, <span className="text-sky-400">you hire me.</span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="h-0.5 w-16 bg-gradient-to-r from-sky-500 to-transparent mb-7 origin-left"
            />

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4 text-white/70 text-base md:text-lg leading-relaxed"
            >
              <p>
                Hi, I&apos;m Ben. I live in Quilcene, Washington with my wife &mdash; that&apos;s us in the photo.
              </p>
              <p>
                I&apos;ve spent most of my career in public service. That work taught me one thing every single day: people remember when someone shows up, and they remember when someone disappears.
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
            </motion.div>

            {/* Trust pillars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10"
            >
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
