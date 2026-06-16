"use client";

/**
 * /clients/mt-view-landscaping — Mountain View Landscape & Design.
 *
 * v6 (2026-06-16): world-class quality pass on the v5 rebuild.
 * - Real photos injected everywhere: a photo on every service card, a full
 *   gallery of their actual project library (downloaded from Squarespace into
 *   /real/gallery/*.webp), and a full-bleed photo band.
 * - Color: per-service colored icon tiles, green/blue bands, tinted sections.
 * - Readability: heavier headings (no thin Playfair), darker body text,
 *   larger minimum sizes — legible for an older audience, still professional.
 * - Tighter spacing, less empty padding. Same facts/logo/voice as v5.
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
  LockKey,
} from "@phosphor-icons/react";
import MtViewContactForm from "./contact-form";

/* ───────── business facts ───────── */
const BIZ = {
  name: "Mountain View Landscape & Design",
  phone: "(253) 638-0500",
  phoneHref: "tel:+12536380500",
  email: "mtviewlandscapeonline@gmail.com",
  address: "18225 SE 313th St, Auburn, WA 98092",
  mapHref: "https://maps.google.com/?q=18225+Southeast+313th+Street+Auburn+WA+98092",
  counties: "King · Pierce · Snohomish · Kittitas",
};

const P = "/clients/mt-view-landscaping/real";
const G = `${P}/gallery`;

/* Colors inlined as literal Tailwind values (JIT can't read interpolation).
 * paper #F5F1E8 · bone #FBF8F1 · sage #E7EADF · mint #EDF3EC · ink #20241C ·
 * body #3E4435 · green #2F7D4F · greenDeep #234E36 · blue #2D6E9E · star #E0A100 */

const head = "font-[family-name:var(--font-playfair)]";
const body = "font-[family-name:var(--font-inter)]";

/* ───────── content ───────── */
const SERVICES = [
  { icon: PencilSimpleLine, color: "#2F7D4F", photo: `${P}/proj-aqua.webp`, name: "Landscape Design", desc: "We plan your whole yard. You see the drawing before we start." },
  { icon: Mountains, color: "#B5683C", photo: `${P}/proj-kirse.webp`, name: "Hardscapes", desc: "Patios, walkways, and stone work you can enjoy for years." },
  { icon: Wall, color: "#4F6D7A", photo: `${P}/work-2.webp`, name: "Retaining Walls", desc: "Strong walls that hold back hills — and look good doing it." },
  { icon: Drop, color: "#2D6E9E", photo: `${G}/g40.webp`, name: "Water Features", desc: "Ponds and waterfalls that sound nice and fit right in." },
  { icon: Sun, color: "#2D6E9E", photo: `${P}/hero.webp`, name: "Irrigation", desc: "Sprinklers that water the right spots at the right time." },
  { icon: Plant, color: "#2F7D4F", photo: `${P}/proj-stone.webp`, name: "Sod & Lawns", desc: "Fresh green grass, rolled out and ready to enjoy." },
  { icon: Leaf, color: "#2E8B82", photo: `${P}/proj-climate.webp`, name: "Native Planting", desc: "Plants that grow well here and don't need much fuss." },
  { icon: Lightbulb, color: "#C7821A", photo: `${P}/proj-night.webp`, name: "Night Lights", desc: "Soft lights that make your yard pretty after dark." },
  { icon: Hammer, color: "#2F7D4F", photo: `${G}/g20.webp`, name: "Yard Care", desc: "We come back and keep your yard looking great all year." },
  { icon: Star, color: "#C7821A", photo: `${G}/g30.webp`, name: "Custom Projects", desc: "Got something special in mind? We can build it." },
];

// Full gallery — their real project photos (skips the ones used elsewhere:
// g03 in "draw it first", g12 in the photo band, g20/g30/g40 on service cards).
const GALLERY = Array.from({ length: 44 }, (_, i) => i + 1)
  .filter((n) => ![3, 12, 20, 30, 40].includes(n))
  .map((n) => `${G}/g${String(n).padStart(2, "0")}.webp`);

const STEPS = [
  { n: "1", t: "You reach out", d: "Call us or fill out the short form. Tell us a little about your yard." },
  { n: "2", t: "We come look", d: "We visit and talk about what you want. This part is free." },
  { n: "3", t: "You get a price", d: "We give you a clear price in plain words. No surprises." },
  { n: "4", t: "We get to work", d: "We build it — and we can keep it looking great all year." },
];

const REVIEWS = [
  { name: "Karen W.", text: "We've used Mountain View for over a decade. Bonnie's crew is reliable, the design work is thoughtful, and they actually answer the phone." },
  { name: "Michael B.", text: "Tim designed our backyard from scratch. Five years later it looks better than the day it was installed." },
  { name: "Jennifer C.", text: "Always amazing — helped us fix our sprinkler system. Tim & Bonnie are the best!" },
];

/* ───────── small bits ───────── */
function GreenBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 bg-[#2F7D4F] hover:bg-[#234E36] text-white px-7 py-3.5 ${body} text-[16px] font-semibold rounded-full transition-colors`}>
      {children}
    </a>
  );
}
function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 border-2 border-[#2F7D4F]/40 hover:border-[#2F7D4F] text-[#234E36] px-7 py-3.5 ${body} text-[16px] font-semibold rounded-full transition-colors`}>
      {children}
    </a>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className={`${body} text-[13px] tracking-[0.16em] uppercase font-bold text-[#2F7D4F]`}>{children}</p>;
}
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`${head} font-semibold text-[33px] sm:text-[42px] leading-[1.08] text-[#20241C] ${className}`}>{children}</h2>;
}

/* ───────── header ───────── */
function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#services", label: "What We Do" },
    { href: "#gallery", label: "Gallery" },
    { href: "#about", label: "About Us" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className={`sticky top-0 z-40 bg-[#F5F1E8]/95 backdrop-blur border-b border-[#234E36]/15 shadow-sm`}>
      <div className="max-w-6xl mx-auto px-5 h-[70px] flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          <img src={`${P}/logo.webp`} alt="Mountain View Landscape & Design logo" className="h-11 w-11 object-contain shrink-0" />
          <span className={`${head} font-semibold text-[19px] sm:text-[21px] text-[#20241C] leading-none truncate`}>Mountain&nbsp;View</span>
        </a>
        <nav className={`hidden md:flex items-center gap-7 ${body} text-[16px] font-medium text-[#3E4435]`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`hover:text-[#2F7D4F] transition-colors`}>{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={BIZ.phoneHref} className={`hidden sm:inline-flex items-center gap-1.5 ${body} text-[16px] font-bold text-[#20241C]`}>
            <Phone size={18} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.phone}
          </a>
          <a href="#contact" className={`hidden sm:inline-flex bg-[#2F7D4F] hover:bg-[#234E36] text-white px-5 py-2.5 rounded-full ${body} text-[15px] font-semibold transition-colors`}>
            Free Quote
          </a>
          <button onClick={() => setOpen(!open)} className="md:hidden p-1 text-[#20241C]" aria-label="Menu">
            {open ? <X size={28} /> : <List size={28} />}
          </button>
        </div>
      </div>
      {open && (
        <div className={`md:hidden border-t border-[#234E36]/15 bg-[#F5F1E8] px-5 py-4 ${body}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block py-2.5 text-[17px] font-medium text-[#20241C]`}>{l.label}</a>
          ))}
          <a href={BIZ.phoneHref} className={`mt-2 inline-flex items-center gap-2 ${body} text-[17px] font-bold text-[#2F7D4F]`}>
            <Phone size={19} weight="fill" /> {BIZ.phone}
          </a>
        </div>
      )}
    </header>
  );
}

/* ───────── hero ───────── */
function Hero() {
  return (
    <section id="top" className={`relative bg-[#F5F1E8] overflow-hidden`}>
      {/* soft color accents for depth */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[460px] h-[460px] rounded-full bg-[#2F7D4F]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-[360px] h-[360px] rounded-full bg-[#2D6E9E]/10 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-5 py-12 sm:py-14 lg:py-16 grid lg:grid-cols-2 gap-9 lg:gap-12 items-center">
        <div>
          <Eyebrow>Good to grow · Family-run since 1976</Eyebrow>
          <h1 className={`${head} font-semibold text-[42px] sm:text-[54px] lg:text-[60px] leading-[1.04] text-[#20241C] mt-4`}>
            A yard you&apos;ll love.<br />Built to last.
          </h1>
          <p className={`${body} text-[18px] sm:text-[19px] leading-[1.6] text-[#3E4435] mt-5 max-w-md`}>
            We&apos;re Tim and Bonnie Hunsaker. Our family has designed, built, and
            cared for yards around Puget Sound since 1976. We do the whole job,
            start to finish.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <GreenBtn href={BIZ.phoneHref}><Phone size={18} weight="fill" /> Call {BIZ.phone}</GreenBtn>
            <GhostBtn href="#contact">Get a free quote <ArrowRight size={17} weight="bold" /></GhostBtn>
          </div>
          <p className={`${body} text-[14px] font-medium text-[#5C6152] mt-6`}>{BIZ.counties} Counties</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rounded-[28px] bg-[#234E36]/10" />
          <img
            src={`${P}/proj-olano.webp`}
            alt="Natural stone steps winding up a planted garden hillside, built by Mountain View Landscape & Design"
            className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-[0_24px_60px_rgba(32,36,28,0.22)]"
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
    <section className={`bg-[#234E36] text-[#F5F1E8]`}>
      <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-center">
        {items.map((t) => (
          <p key={t} className={`${body} text-[15px] sm:text-[16px] font-semibold`}>{t}</p>
        ))}
      </div>
    </section>
  );
}

/* ───────── services ───────── */
function Services() {
  return (
    <section id="services" className={`bg-[#FBF8F1] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>What we do</Eyebrow>
          <H2 className="mt-3">One crew for the whole yard.</H2>
          <p className={`${body} text-[18px] leading-[1.6] text-[#3E4435] mt-4`}>
            From the first drawing to the last plant, we do it all. You only have
            one team to call.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-9">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name} className={`group bg-[#F5F1E8] border border-[#A8A294]/30 rounded-2xl overflow-hidden hover:shadow-[0_14px_34px_rgba(32,36,28,0.12)] hover:-translate-y-0.5 transition-all`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={s.photo} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" loading="lazy" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center justify-center w-11 h-11 rounded-xl shadow-md" style={{ backgroundColor: s.color, color: "#fff" }}>
                    <Icon size={24} weight="fill" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className={`${head} font-semibold text-[21px] text-[#20241C]`}>{s.name}</h3>
                  <p className={`${body} text-[15px] leading-[1.55] text-[#3E4435] mt-1.5`}>{s.desc}</p>
                </div>
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
    <section className={`bg-[#F5F1E8] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-9 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <Eyebrow>How it starts</Eyebrow>
          <H2 className="mt-3 !text-[30px] sm:!text-[38px]">We draw your yard by hand first.</H2>
          <p className={`${body} text-[18px] leading-[1.65] text-[#3E4435] mt-4`}>
            Before we dig, Tim draws a plan. You get to see your new yard on paper
            and say what you like. We change it until it feels right. Then we
            build it. No surprises.
          </p>
        </div>
        <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
          <figure>
            <img src={`${P}/work-1.webp`} alt="One of Tim's hand-drawn landscape plans" className="w-full aspect-[3/4] object-cover rounded-xl border border-[#A8A294]/30" loading="lazy" />
            <figcaption className={`${body} text-[13px] font-medium text-[#5C6152] mt-2`}>The plan, drawn by hand</figcaption>
          </figure>
          <figure className="mt-8">
            <img src={`${G}/g03.webp`} alt="A finished front yard with a fountain and full plantings" className="w-full aspect-[3/4] object-cover rounded-xl" loading="lazy" />
            <figcaption className={`${body} text-[13px] font-medium text-[#5C6152] mt-2`}>The finished yard</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ───────── full-bleed photo band ───────── */
function PhotoBand() {
  return (
    <section className="relative">
      <img src={`${G}/g12.webp`} alt="A Mountain View landscape under fresh snow" className="w-full h-[280px] sm:h-[360px] object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[#20241C]/55" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-6xl mx-auto px-5 w-full">
          <p className={`${head} font-semibold text-[26px] sm:text-[36px] leading-[1.15] text-[#F5F1E8] max-w-2xl`}>
            Nearly 50 years of yards across the Puget Sound — in every season.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── gallery ───────── */
function Gallery() {
  return (
    <section id="gallery" className={`bg-[#E7EADF] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>Our work</Eyebrow>
          <H2 className="mt-3">Yards we&apos;ve built.</H2>
          <p className={`${body} text-[18px] leading-[1.6] text-[#3E4435] mt-4`}>
            Real homes near you — patios, walls, ponds, gardens, and lights. Same
            crew, same care, for nearly 50 years.
          </p>
        </div>
        <div className="mt-9 [column-fill:_balance] columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
          {GALLERY.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Mountain View landscape project ${i + 1}`}
              className="mb-3 sm:mb-4 w-full rounded-xl break-inside-avoid hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── meet tim & bonnie ───────── */
function About() {
  return (
    <section id="about" className={`bg-[#FBF8F1] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-9 lg:gap-12 items-center">
        <div className="grid grid-cols-2 gap-4">
          <img src={`${P}/work-4.webp`} alt="Tim Hunsaker in the forest holding a large bigleaf maple leaf" className="w-full aspect-[3/4] object-cover object-top rounded-xl" loading="lazy" />
          <img src={`${P}/owners.webp`} alt="Bonnie Hunsaker at an outdoor event" className="w-full aspect-[3/4] object-cover object-top rounded-xl mt-8" loading="lazy" />
        </div>
        <div>
          <Eyebrow>About us</Eyebrow>
          <H2 className="mt-3 !text-[31px] sm:!text-[40px]">Meet Tim &amp; Bonnie.</H2>
          <div className={`${body} text-[18px] leading-[1.7] text-[#3E4435] mt-4 space-y-4`}>
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
            <p className={`text-[#20241C] font-semibold`}>
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
    <section className={`bg-[#EDF3EC] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <Eyebrow>How it works</Eyebrow>
          <H2 className="mt-3">Four easy steps.</H2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
          {STEPS.map((s) => (
            <div key={s.n} className={`bg-[#FBF8F1] border border-[#A8A294]/30 rounded-2xl p-6`}>
              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#2F7D4F] text-white ${head} font-semibold text-[19px]`}>{s.n}</span>
              <h3 className={`${head} font-semibold text-[21px] text-[#20241C] mt-4`}>{s.t}</h3>
              <p className={`${body} text-[15px] leading-[1.55] text-[#3E4435] mt-1.5`}>{s.d}</p>
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
    <section className={`bg-[#234E36] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-xl">
          <p className={`${body} text-[13px] tracking-[0.16em] uppercase font-bold text-[#F5F1E8]/75`}>What people say</p>
          <h2 className={`${head} font-semibold text-[33px] sm:text-[42px] leading-[1.08] text-[#F5F1E8] mt-3`}>
            Five stars. Real neighbors.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-9">
          {REVIEWS.map((r) => (
            <div key={r.name} className={`bg-[#F5F1E8] rounded-2xl p-6`}>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} weight="fill" className={`text-[#E0A100]`} />
                ))}
              </div>
              <p className={`${body} text-[16px] leading-[1.6] text-[#20241C] mt-3`}>&ldquo;{r.text}&rdquo;</p>
              <p className={`${body} text-[15px] font-bold text-[#3E4435] mt-3`}>— {r.name}</p>
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
    <section id="contact" className={`bg-[#F5F1E8] py-14 sm:py-18`}>
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_1.25fr] gap-9 lg:gap-14">
        <div>
          <Eyebrow>Let&apos;s talk</Eyebrow>
          <H2 className="mt-3 !text-[31px] sm:!text-[40px]">Tell us about your yard.</H2>
          <p className={`${body} text-[18px] leading-[1.65] text-[#3E4435] mt-4`}>
            We&apos;d love to hear from you. A quote is always free, and there&apos;s
            no pressure. Call, email, or fill out the form — whatever is easy for
            you.
          </p>
          <div className="mt-8 space-y-4">
            <a href={BIZ.phoneHref} className={`flex items-center gap-3 ${body} text-[18px] font-semibold text-[#20241C]`}>
              <Phone size={21} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.phone}
            </a>
            <a href={`mailto:${BIZ.email}`} className={`flex items-center gap-3 ${body} text-[16px] text-[#20241C] break-all`}>
              <EnvelopeSimple size={21} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.email}
            </a>
            <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${body} text-[16px] text-[#20241C]`}>
              <MapPin size={21} weight="fill" className={`text-[#2F7D4F]`} /> {BIZ.address}
            </a>
          </div>
          <p className={`${body} text-[14px] font-medium text-[#5C6152] mt-6`}>
            We serve {BIZ.counties} Counties.
          </p>
        </div>
        <div className={`bg-[#FBF8F1] border border-[#A8A294]/30 rounded-2xl p-7 sm:p-9`}>
          <MtViewContactForm services={SERVICES.map((s) => s.name)} />
        </div>
      </div>
    </section>
  );
}

/* ───────── footer ───────── */
function Footer() {
  return (
    <footer className={`bg-[#20241C] text-[#F5F1E8]/80`}>
      <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={`${P}/logo.webp`} alt="" className="h-11 w-11 object-contain" />
            <span className={`${head} font-semibold text-[19px] text-[#F5F1E8]`}>Mountain View</span>
          </div>
          <p className={`${body} text-[15px] leading-[1.6] mt-3 max-w-xs`}>
            Family-run landscape design, building, and care around Puget Sound
            since 1976.
          </p>
        </div>
        <div className={`${body} text-[15px] space-y-2`}>
          <p className={`text-[#F5F1E8] font-bold mb-1`}>Reach us</p>
          <a href={BIZ.phoneHref} className={`block hover:text-[#F5F1E8]`}>{BIZ.phone}</a>
          <a href={`mailto:${BIZ.email}`} className={`block hover:text-[#F5F1E8] break-all`}>{BIZ.email}</a>
          <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`block hover:text-[#F5F1E8]`}>{BIZ.address}</a>
        </div>
        <div className={`${body} text-[15px] space-y-2`}>
          <p className={`text-[#F5F1E8] font-bold mb-1`}>Go to</p>
          <a href="#services" className={`block hover:text-[#F5F1E8]`}>What We Do</a>
          <a href="#gallery" className={`block hover:text-[#F5F1E8]`}>Gallery</a>
          <a href="#about" className={`block hover:text-[#F5F1E8]`}>About Us</a>
          <a href="#contact" className={`block hover:text-[#F5F1E8]`}>Contact</a>
        </div>
      </div>
      <div className={`border-t border-[#F5F1E8]/12`}>
        <div className={`max-w-6xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 ${body} text-[14px]`}>
          <span>© {2026} {BIZ.name}</span>
          <span className="inline-flex items-center gap-1.5">
            <Mountains size={16} weight="fill" className={`text-[#2F7D4F]`} />
            Built by <a href="https://bluejayportfolio.com" className={`underline hover:text-[#F5F1E8]`}>BlueJays</a> — get your free site audit
          </span>
        </div>
      </div>
      {/* Owner/team backend entry — all the way at the very bottom */}
      <div className="border-t border-[#F5F1E8]/12 bg-[#171a14]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-center">
          <a href="/clients/mt-view-landscaping/ops" className={`inline-flex items-center gap-2 border border-[#F5F1E8]/25 hover:border-[#2F7D4F] rounded-full px-5 py-2 ${body} text-[14px] font-semibold text-[#F5F1E8]/75 hover:text-[#F5F1E8] transition-colors`}>
            <LockKey size={16} weight="fill" className="text-[#2F7D4F]" /> Mt View Team Login
          </a>
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
      <PhotoBand />
      <Gallery />
      <About />
      <HowItWorks />
      <Reviews />
      <Contact />
      <Footer />
    </main>
  );
}
