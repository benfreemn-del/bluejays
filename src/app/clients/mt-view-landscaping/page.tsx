"use client";

/**
 * /clients/mt-view-landscaping — Mountain View Landscape & Design.
 *
 * v5 rebuild (2026-06-16): warmer, simpler, more human. The prior v4 was an
 * "editorial monograph" (Olson Kundig / Aman reference) — beautiful but cold,
 * photo-thin, and fancy-worded. This version follows the Hector model: a clean
 * human hero, the owners up front, scannable plain-language sections, and the
 * Hunsakers' OWN real photos (downloaded from their Squarespace into
 * /real/*.webp) + logo. Reading level kept simple on purpose. Same facts,
 * same services, same contact wiring — just clearer and friendlier.
 */

import { useState } from "react";
import {
  Phone,
  ArrowRight,
  List,
  X,
  PencilSimpleLine,
  Mountains,
  Wall,
  Drop,
  Sun,
  Plant,
  Lightbulb,
  Leaf,
  Hammer,
  Star,
  MapPin,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import MtViewContactForm from "./contact-form";

/* ───────── business facts (unchanged) ───────── */
const BIZ = {
  name: "Mountain View Landscape & Design",
  short: "Mountain View",
  phone: "(253) 638-0500",
  phoneHref: "tel:+12536380500",
  email: "mtviewlandscapeonline@gmail.com",
  address: "18225 SE 313th St, Auburn, WA 98092",
  mapHref:
    "https://maps.google.com/?q=18225+Southeast+313th+Street+Auburn+WA+98092",
  counties: "King · Pierce · Snohomish · Kittitas",
};

const P = "/clients/mt-view-landscaping/real"; // photo folder

/* Colors are inlined as literal Tailwind arbitrary values (e.g. bg-[#2F7D4F])
 * so the JIT compiler picks them up — interpolated classes never compile.
 * Palette: paper #F5F1E8 · bone #FBF8F1 · sage #E7EADF · ink #23271F ·
 * soft #5C6152 · green #2F7D4F · greenDeep #245C3B · stone #A8A294 · star #E0A100. */

const head = "font-[family-name:var(--font-playfair)]";
const body = "font-[family-name:var(--font-inter)]";

/* ───────── content ───────── */
const SERVICES = [
  { icon: PencilSimpleLine, name: "Landscape Design", desc: "We plan your whole yard. You see the drawing before we start." },
  { icon: Mountains, name: "Hardscapes", desc: "Patios, walkways, and stone work you can enjoy for years." },
  { icon: Wall, name: "Retaining Walls", desc: "Strong walls that hold back hills — and look good doing it." },
  { icon: Drop, name: "Water Features", desc: "Ponds and waterfalls that sound nice and fit right in." },
  { icon: Sun, name: "Irrigation", desc: "Sprinklers that water the right spots at the right time." },
  { icon: Plant, name: "Sod & Lawns", desc: "Fresh green grass, rolled out and ready to enjoy." },
  { icon: Leaf, name: "Native Planting", desc: "Plants that grow well here and don't need much fuss." },
  { icon: Lightbulb, name: "Night Lights", desc: "Soft lights that make your yard pretty after dark." },
  { icon: Hammer, name: "Yard Care", desc: "We come back and keep your yard looking great all year." },
  { icon: Star, name: "Custom Projects", desc: "Got something special in mind? We can build it." },
];

const WORK = [
  { src: `${P}/proj-kirse.webp`, cap: "Brick patio with a clean stone border" },
  { src: `${P}/proj-stone.webp`, cap: "Block retaining walls and a fresh lawn" },
  { src: `${P}/proj-aqua.webp`, cap: "Front-yard beds with maples and boulders" },
  { src: `${P}/proj-climate.webp`, cap: "A paver path down to the water" },
  { src: `${P}/proj-night.webp`, cap: "Driveway and lights at dusk" },
  { src: `${P}/work-2.webp`, cap: "Stacked stone wall and gravel path" },
];

const STEPS = [
  { n: "1", t: "You reach out", d: "Call us or fill out the short form. Tell us a little about your yard." },
  { n: "2", t: "We come look", d: "We visit and talk about what you want. This part is free." },
  { n: "3", t: "You get a price", d: "We give you a clear price in plain words. No surprises." },
  { n: "4", t: "We get to work", d: "We build it — and we can keep it looking great all year." },
];

// Real 5-star Google reviews (kept word-for-word).
const REVIEWS = [
  { name: "Karen W.", text: "We've used Mountain View for over a decade. Bonnie's crew is reliable, the design work is thoughtful, and they actually answer the phone." },
  { name: "Michael B.", text: "Tim designed our backyard from scratch. Five years later it looks better than the day it was installed." },
  { name: "Jennifer C.", text: "Always amazing — helped us fix our sprinkler system. Tim & Bonnie are the best!" },
];

/* ───────── small bits ───────── */
function GreenBtn({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const cls = `inline-flex items-center justify-center gap-2 bg-[#2F7D4F] hover:bg-[#245C3B] text-white px-7 py-3.5 ${body} text-[15px] font-semibold rounded-full transition-colors`;
  return href ? <a href={href} className={cls}>{children}</a> : <button onClick={onClick} className={cls}>{children}</button>;
}
function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 border border-[#2F7D4F]/40 hover:border-[#2F7D4F] text-[#245C3B] px-7 py-3.5 ${body} text-[15px] font-semibold rounded-full transition-colors`}>
      {children}
    </a>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className={`${body} text-[12px] tracking-[0.18em] uppercase font-semibold text-[#2F7D4F]`}>{children}</p>;
}

/* ───────── header ───────── */
function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#services", label: "What We Do" },
    { href: "#work", label: "Our Work" },
    { href: "#about", label: "About Us" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className={`sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur border-b border-[#A8A294]/25`}>
      <div className="max-w-6xl mx-auto px-5 h-[68px] flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img src={`${P}/logo.webp`} alt="Mountain View Landscape & Design logo" className="h-10 w-10 object-contain shrink-0" />
          <span className={`${head} text-[18px] sm:text-[20px] text-[#23271F] leading-none truncate`}>Mountain&nbsp;View</span>
        </a>
        <nav className={`hidden md:flex items-center gap-7 ${body} text-[15px] text-[#5C6152]`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`hover:text-[#23271F] transition-colors`}>{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={BIZ.phoneHref} className={`hidden sm:inline-flex items-center gap-1.5 ${body} text-[15px] font-semibold text-[#23271F]`}>
            <Phone size={17} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.phone}
          </a>
          <a href="#contact" className={`hidden sm:inline-flex bg-[#2F7D4F] hover:bg-[#245C3B] text-white px-5 py-2.5 rounded-full ${body} text-[14px] font-semibold transition-colors`}>
            Free Quote
          </a>
          <button onClick={() => setOpen(!open)} className="md:hidden p-1" aria-label="Menu">
            {open ? <X size={26} /> : <List size={26} />}
          </button>
        </div>
      </div>
      {open && (
        <div className={`md:hidden border-t border-[#A8A294]/25 bg-[#F5F1E8] px-5 py-4 ${body}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block py-2.5 text-[16px] text-[#23271F]`}>{l.label}</a>
          ))}
          <a href={BIZ.phoneHref} className={`mt-2 inline-flex items-center gap-2 ${body} text-[16px] font-semibold text-[#2F7D4F]`}>
            <Phone size={18} weight="fill" /> {BIZ.phone}
          </a>
        </div>
      )}
    </header>
  );
}

/* ───────── hero ───────── */
function Hero() {
  return (
    <section id="top" className={`bg-[#F5F1E8]`}>
      <div className="max-w-6xl mx-auto px-5 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <Eyebrow>Good to grow · Family-run since 1976</Eyebrow>
          <h1 className={`${head} text-[40px] sm:text-[52px] lg:text-[58px] leading-[1.05] text-[#23271F] mt-4`}>
            A yard you&apos;ll love.<br />Built to last.
          </h1>
          <p className={`${body} text-[17px] sm:text-[18px] leading-[1.6] text-[#5C6152] mt-5 max-w-md`}>
            We&apos;re Tim and Bonnie Hunsaker. Our family has designed, built, and
            cared for yards around Puget Sound since 1976. We do the whole job,
            start to finish.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <GreenBtn href={BIZ.phoneHref}><Phone size={17} weight="fill" /> Call {BIZ.phone}</GreenBtn>
            <GhostBtn href="#contact">Get a free quote <ArrowRight size={16} weight="bold" /></GhostBtn>
          </div>
          <p className={`${body} text-[13px] text-[#A8A294] mt-6`}>{BIZ.counties} Counties</p>
        </div>
        <div className="relative">
          <img
            src={`${P}/proj-olano.webp`}
            alt="Natural stone steps winding up a planted garden hillside, built by Mountain View Landscape & Design"
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-[0_24px_60px_rgba(35,39,31,0.18)]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}

/* ───────── trust strip ───────── */
function Trust() {
  const items = ["Working since 1976", "Family-run", "Free quotes, no pressure", "4 counties served"];
  return (
    <section className={`bg-[#245C3B] text-[#F5F1E8]`}>
      <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-center">
        {items.map((t) => (
          <p key={t} className={`${body} text-[14px] sm:text-[15px] font-medium`}>{t}</p>
        ))}
      </div>
    </section>
  );
}

/* ───────── services ───────── */
function Services() {
  return (
    <section id="services" className={`bg-[#FBF8F1] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>What we do</Eyebrow>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.1] text-[#23271F] mt-3`}>
            One crew for the whole yard.
          </h2>
          <p className={`${body} text-[17px] leading-[1.6] text-[#5C6152] mt-4`}>
            From the first drawing to the last plant, we do it all. You only have
            one team to call.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name} className={`bg-[#F5F1E8] border border-[#A8A294]/25 rounded-xl p-6 hover:border-[#2F7D4F]/40 transition-colors`}>
                <Icon size={26} weight="duotone" className={`text-[#2F7D4F]`} />
                <h3 className={`${head} text-[20px] text-[#23271F] mt-3`}>{s.name}</h3>
                <p className={`${body} text-[15px] leading-[1.55] text-[#5C6152] mt-1.5`}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── we draw it first ───────── */
function DrawFirst() {
  return (
    <section className={`bg-[#F5F1E8] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="order-2 lg:order-1">
          <Eyebrow>How it starts</Eyebrow>
          <h2 className={`${head} text-[30px] sm:text-[38px] leading-[1.12] text-[#23271F] mt-3`}>
            We draw your yard by hand first.
          </h2>
          <p className={`${body} text-[17px] leading-[1.65] text-[#5C6152] mt-4`}>
            Before we dig, Tim draws a plan. You get to see your new yard on paper
            and say what you like. We change it until it feels right. Then we
            build it. No surprises.
          </p>
        </div>
        <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
          <img src={`${P}/work-3.webp`} alt="Tim hand-coloring a landscape design plan" className="w-full aspect-[3/4] object-cover rounded-xl" loading="lazy" />
          <img src={`${P}/work-1.webp`} alt="A hand-drawn landscape design plan for a home" className="w-full aspect-[3/4] object-cover rounded-xl mt-8" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

/* ───────── our work ───────── */
function OurWork() {
  return (
    <section id="work" className={`bg-[#E7EADF] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>Our work</Eyebrow>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.1] text-[#23271F] mt-3`}>
            Real yards we&apos;ve built.
          </h2>
          <p className={`${body} text-[17px] leading-[1.6] text-[#5C6152] mt-4`}>
            These are homes near you. Same crew, same care, every time.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
          {WORK.map((w) => (
            <figure key={w.src} className="group overflow-hidden rounded-xl">
              <img src={w.src} alt={w.cap} className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
              <figcaption className={`${body} text-[13px] text-[#5C6152] mt-2`}>{w.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── meet tim & bonnie ───────── */
function About() {
  return (
    <section id="about" className={`bg-[#FBF8F1] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="grid grid-cols-2 gap-4">
          <img src={`${P}/work-4.webp`} alt="Tim Hunsaker in the forest holding a large bigleaf maple leaf" className="w-full aspect-[3/4] object-cover object-top rounded-xl" loading="lazy" />
          <img src={`${P}/owners.webp`} alt="Bonnie Hunsaker at an outdoor event" className="w-full aspect-[3/4] object-cover object-top rounded-xl mt-8" loading="lazy" />
        </div>
        <div>
          <Eyebrow>About us</Eyebrow>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.12] text-[#23271F] mt-3`}>
            Meet Tim &amp; Bonnie.
          </h2>
          <div className={`${body} text-[17px] leading-[1.7] text-[#5C6152] mt-4 space-y-4`}>
            <p>
              Tim has worked on yards here since 1976 — first with his brothers as
              Shamrock Landscaping, then as Mountain View. That&apos;s nearly 50
              years of knowing what grows well in the Northwest.
            </p>
            <p>
              Bonnie runs the crew that keeps yards looking great all year. Most of
              our team has been with us for years, not just a season. When you call,
              you talk to the same people who do the work.
            </p>
            <p className={`text-[#23271F] font-medium`}>
              Same family. Same care. From your first drawing to your last mow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── how it works ───────── */
function HowItWorks() {
  return (
    <section className={`bg-[#F5F1E8] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.1] text-[#23271F] mt-3`}>
            Four easy steps.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
          {STEPS.map((s) => (
            <div key={s.n} className={`bg-[#FBF8F1] border border-[#A8A294]/25 rounded-xl p-6`}>
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#2F7D4F] text-white ${head} text-[18px]`}>{s.n}</span>
              <h3 className={`${head} text-[20px] text-[#23271F] mt-4`}>{s.t}</h3>
              <p className={`${body} text-[15px] leading-[1.55] text-[#5C6152] mt-1.5`}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── reviews ───────── */
function Reviews() {
  return (
    <section className={`bg-[#245C3B] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <p className={`${body} text-[12px] tracking-[0.18em] uppercase font-semibold text-[#F5F1E8]/70`}>What people say</p>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.1] text-[#F5F1E8] mt-3`}>
            Five stars. Real neighbors.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-9">
          {REVIEWS.map((r) => (
            <div key={r.name} className={`bg-[#F5F1E8] rounded-xl p-6`}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={17} weight="fill" className={`text-[#E0A100]`} />
                ))}
              </div>
              <p className={`${body} text-[16px] leading-[1.6] text-[#23271F] mt-3`}>&ldquo;{r.text}&rdquo;</p>
              <p className={`${body} text-[14px] font-semibold text-[#5C6152] mt-3`}>— {r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── contact ───────── */
function Contact() {
  return (
    <section id="contact" className={`bg-[#F5F1E8] py-16 sm:py-20`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_1.25fr] gap-10 lg:gap-16">
        <div>
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <h2 className={`${head} text-[32px] sm:text-[40px] leading-[1.12] text-[#23271F] mt-3`}>
            Tell us about your yard.
          </h2>
          <p className={`${body} text-[17px] leading-[1.65] text-[#5C6152] mt-4`}>
            We&apos;d love to hear from you. A quote is always free, and there&apos;s
            no pressure. Call, email, or fill out the form — whatever is easy for
            you.
          </p>
          <div className="mt-8 space-y-4">
            <a href={BIZ.phoneHref} className={`flex items-center gap-3 ${body} text-[17px] text-[#23271F]`}>
              <Phone size={20} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.phone}
            </a>
            <a href={`mailto:${BIZ.email}`} className={`flex items-center gap-3 ${body} text-[16px] text-[#23271F] break-all`}>
              <EnvelopeSimple size={20} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.email}
            </a>
            <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${body} text-[16px] text-[#23271F]`}>
              <MapPin size={20} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.address}
            </a>
          </div>
          <p className={`${body} text-[13px] text-[#A8A294] mt-6`}>
            We serve {BIZ.counties} Counties.
          </p>
        </div>
        <div className={`bg-[#FBF8F1] border border-[#A8A294]/25 rounded-2xl p-7 sm:p-9`}>
          <MtViewContactForm services={SERVICES.map((s) => s.name)} />
        </div>
      </div>
    </section>
  );
}

/* ───────── footer ───────── */
function Footer() {
  return (
    <footer className={`bg-[#23271F] text-[#F5F1E8]/75`}>
      <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={`${P}/logo.webp`} alt="" className="h-10 w-10 object-contain" />
            <span className={`${head} text-[18px] text-[#F5F1E8]`}>Mountain View</span>
          </div>
          <p className={`${body} text-[14px] leading-[1.6] mt-3 max-w-xs`}>
            Family-run landscape design, building, and care around Puget Sound
            since 1976.
          </p>
        </div>
        <div className={`${body} text-[14px] space-y-2`}>
          <p className={`text-[#F5F1E8] font-semibold mb-1`}>Reach us</p>
          <a href={BIZ.phoneHref} className={`block hover:text-[#F5F1E8]`}>{BIZ.phone}</a>
          <a href={`mailto:${BIZ.email}`} className={`block hover:text-[#F5F1E8] break-all`}>{BIZ.email}</a>
          <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`block hover:text-[#F5F1E8]`}>{BIZ.address}</a>
        </div>
        <div className={`${body} text-[14px] space-y-2`}>
          <p className={`text-[#F5F1E8] font-semibold mb-1`}>Go to</p>
          <a href="#services" className={`block hover:text-[#F5F1E8]`}>What We Do</a>
          <a href="#work" className={`block hover:text-[#F5F1E8]`}>Our Work</a>
          <a href="#about" className={`block hover:text-[#F5F1E8]`}>About Us</a>
          <a href="#contact" className={`block hover:text-[#F5F1E8]`}>Contact</a>
        </div>
      </div>
      <div className={`border-t border-[#F5F1E8]/12`}>
        <div className={`max-w-6xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 ${body} text-[13px]`}>
          <span>© {2026} {BIZ.name}</span>
          <span className="inline-flex items-center gap-1.5">
            <Mountains size={15} weight="fill" className={`text-[#2F7D4F]`} />
            Built by <a href="https://bluejayportfolio.com" className={`underline hover:text-[#F5F1E8]`}>BlueJays</a> — get your free site audit
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function MtViewPage() {
  return (
    <main className={`${body} bg-[#F5F1E8]`}>
      <Header />
      <Hero />
      <Trust />
      <Services />
      <DrawFirst />
      <OurWork />
      <About />
      <HowItWorks />
      <Reviews />
      <Contact />
      <Footer />
    </main>
  );
}
