/* eslint-disable @next/next/no-img-element */
import { Phone, EnvelopeSimple, MapPin, Star, ArrowRight, Clock, LockKey, Mountains, CaretRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import MtViewContactForm from "../contact-form";
import { BIZ, SERVICES, CITIES, REVIEWS, BASE_PATH, type Faq } from "../_lib/site";
import { Photo, Eyebrow, H2, GreenBtn, GhostBtn, head, body } from "./ui";

/* ───────── reviews ───────── */
export function Reviews({ limit = 6 }: { limit?: number }) {
  return (
    <section id="reviews" className="bg-[#234E36] py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow light>What neighbors say</Eyebrow>
            <h2 className={`${head} font-semibold text-[32px] sm:text-[42px] leading-[1.08] text-[#F5F1E8] mt-3`}>
              Five stars on Google.
            </h2>
          </div>
          <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-3 bg-[#F5F1E8] rounded-2xl px-5 py-3 ${body}`}>
            <span className={`${head} text-[34px] font-semibold text-[#20241C] leading-none`}>{BIZ.googleRating.toFixed(1)}</span>
            <span>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} weight="fill" className="text-[#E0A100]" />)}
              </span>
              <span className="block text-[14px] font-semibold text-[#3E4435] mt-0.5">{BIZ.googleReviewCount} Google reviews</span>
            </span>
          </a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
          {REVIEWS.slice(0, limit).map((r) => (
            <figure key={r.name} className="bg-[#F5F1E8] rounded-2xl p-6 flex flex-col">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} weight="fill" className="text-[#E0A100]" />)}
              </div>
              <blockquote className={`${body} text-[16px] leading-[1.6] text-[#20241C] mt-3 flex-1`}>&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className={`${body} text-[15px] font-bold text-[#3E4435] mt-4`}>{r.name} <span className="font-medium text-[#5C6152]">· Google review</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${body} text-[16px] font-semibold text-[#F5F1E8] underline underline-offset-4 decoration-[#F5F1E8]/40 hover:decoration-[#F5F1E8]`}>
            Read all reviews on Google <ArrowRight size={16} weight="bold" />
          </a>
          <span className="text-[#F5F1E8]/40">·</span>
          <a href={BIZ.reviewHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${body} text-[16px] font-semibold text-[#F5F1E8] underline underline-offset-4 decoration-[#F5F1E8]/40 hover:decoration-[#F5F1E8]`}>
            Worked with us? Leave a review
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── contact ───────── */
export function Contact({ heading = "Tell us about your yard." }: { heading?: string }) {
  return (
    <section id="contact" className="bg-[#F5F1E8] py-14 sm:py-20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1fr_1.25fr] gap-9 lg:gap-14">
        <div>
          <Eyebrow>Free quote</Eyebrow>
          <H2 className="mt-3 !text-[31px] sm:!text-[40px]">{heading}</H2>
          <p className={`${body} text-[18px] leading-[1.65] text-[#3E4435] mt-4`}>
            A quote is always free, and there is no pressure. Call, email, or fill out the form, whatever is easiest
            for you. Photos of your yard help, so feel free to mention them and we will ask for them.
          </p>
          <div className="mt-8 space-y-4">
            <a href={BIZ.phoneHref} className={`flex items-center gap-3 ${body} text-[20px] font-bold text-[#20241C]`}>
              <Phone size={22} weight="fill" className="text-[#2F7D4F]" /> {BIZ.phone}
            </a>
            <a href={`mailto:${BIZ.email}`} className={`flex items-center gap-3 ${body} text-[16px] text-[#20241C] break-all`}>
              <EnvelopeSimple size={21} weight="fill" className="text-[#2F7D4F]" /> {BIZ.email}
            </a>
            <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${body} text-[16px] text-[#20241C]`}>
              <MapPin size={21} weight="fill" className="text-[#2F7D4F]" /> {BIZ.address}
            </a>
            <p className={`flex items-center gap-3 ${body} text-[16px] text-[#20241C]`}>
              <Clock size={21} weight="fill" className="text-[#2F7D4F]" /> {BIZ.hours}
            </p>
          </div>
          <p className={`${body} text-[14px] font-medium text-[#5C6152] mt-6`}>
            {`Serving ${BIZ.counties.join(", ")} counties.`}
          </p>
          <a href={BIZ.licenseHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 mt-2 ${body} text-[14px] font-medium text-[#234E36] underline underline-offset-4 decoration-[#234E36]/30 hover:decoration-[#234E36]`}>
            <ShieldCheck size={16} weight="fill" /> {`Licensed, bonded & insured · WA Lic. ${BIZ.license}`}
          </a>
          <iframe
            title={`Map to ${BIZ.name}, ${BIZ.address}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${BIZ.name}, ${BIZ.address}`)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-6 w-full h-[220px] rounded-xl border border-[#A8A294]/30"
          />
        </div>
        <div className="bg-[#FBF8F1] border border-[#A8A294]/30 rounded-2xl p-7 sm:p-9 shadow-[0_18px_40px_rgba(32,36,28,0.06)]">
          <MtViewContactForm services={SERVICES.map((s) => s.name)} />
        </div>
      </div>
    </section>
  );
}

/* ───────── call-to-action band over a photo ───────── */
export function CtaBand({ base, photoId = "p052", line }: { base: string; photoId?: string; line: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Photo id={photoId} sizes="100vw" alt="" className="absolute inset-0 -z-10 w-full h-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#141810]/85 via-[#141810]/60 to-[#141810]/25" />
      <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
        <p className={`${head} font-semibold text-[28px] sm:text-[40px] leading-[1.12] text-[#F5F1E8] max-w-2xl`}>{line}</p>
        <div className="flex flex-wrap gap-3 mt-7">
          <GreenBtn href={BIZ.phoneHref}><Phone size={18} weight="fill" /> Call {BIZ.phone}</GreenBtn>
          <GhostBtn href={`${base || "/"}#contact`} light>Get a free quote <ArrowRight size={17} weight="bold" /></GhostBtn>
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ (no JS, native details) ───────── */
export function FaqList({ faqs, title = "Common questions" }: { faqs: Faq[]; title?: string }) {
  return (
    <section className="bg-[#FBF8F1] py-14 sm:py-18">
      <div className="max-w-3xl mx-auto px-5">
        <Eyebrow>FAQ</Eyebrow>
        <H2 className="mt-3 !text-[30px] sm:!text-[38px]">{title}</H2>
        <div className="mt-8 divide-y divide-[#A8A294]/30 border-y border-[#A8A294]/30">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 ${body} text-[18px] font-semibold text-[#20241C]`}>
                {f.q}
                <CaretRight size={18} weight="bold" className="shrink-0 text-[#2F7D4F] transition-transform group-open:rotate-90" />
              </summary>
              <p className={`${body} text-[17px] leading-[1.65] text-[#3E4435] mt-3`}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export const faqSchema = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

/* ───────── service cards ───────── */
export function ServiceCards({ base, slugs }: { base: string; slugs?: string[] }) {
  const list = slugs ? SERVICES.filter((s) => slugs.includes(s.slug)) : SERVICES;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((s) => (
        <a key={s.slug} href={`${base}/${s.slug}`} className="group bg-[#F5F1E8] border border-[#A8A294]/30 rounded-2xl overflow-hidden hover:shadow-[0_14px_34px_rgba(32,36,28,0.14)] hover:-translate-y-0.5 transition-all">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Photo id={s.hero} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          </div>
          <div className="p-5">
            <h3 className={`${head} font-semibold text-[22px] text-[#20241C] flex items-center justify-between gap-2`}>
              {s.name}
              <ArrowRight size={18} weight="bold" className="text-[#2F7D4F] shrink-0 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className={`${body} text-[15px] leading-[1.55] text-[#3E4435] mt-1.5 line-clamp-2`}>{s.lede}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ───────── areas served ───────── */
export function AreasServed({ base, current }: { base: string; current?: string }) {
  return (
    <section className="bg-[#EDF3EC] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-5">
        <Eyebrow>Where we work</Eyebrow>
        <H2 className="mt-3 !text-[28px] sm:!text-[36px]">Based in Auburn. Serving four counties.</H2>
        <p className={`${body} text-[17px] leading-[1.6] text-[#3E4435] mt-3 max-w-2xl`}>
          Our shop is in southeast Auburn. We work across {BIZ.counties.join(", ")} counties, most often in these communities:
        </p>
        <div className="flex flex-wrap gap-2.5 mt-6">
          {CITIES.map((c) => (
            <a
              key={c.slug}
              href={`${base}/${c.slug}`}
              aria-current={current === c.slug ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 ${body} text-[15px] font-semibold border transition-colors ${
                current === c.slug ? "bg-[#234E36] text-white border-[#234E36]" : "bg-[#FBF8F1] text-[#234E36] border-[#A8A294]/40 hover:border-[#2F7D4F]"
              }`}
            >
              <MapPin size={15} weight="fill" /> Landscaping in {c.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── breadcrumbs ───────── */
export function Breadcrumbs({ base, items }: { base: string; items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className={`${body} text-[14px] text-[#5C6152]`}>
      <a href={base || "/"} className="hover:text-[#2F7D4F]">Home</a>
      {items.map((it) => (
        <span key={it.name}>
          <span className="mx-2 opacity-50">/</span>
          {it.href ? <a href={it.href} className="hover:text-[#2F7D4F]">{it.name}</a> : <span aria-current="page" className="text-[#20241C] font-medium">{it.name}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ───────── footer ───────── */
export function Footer({ base }: { base: string }) {
  const home = base || "/";
  return (
    <footer className="bg-[#20241C] text-[#F5F1E8]/80">
      <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={`${BASE_PATH}/logo-128.webp`} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
            <span className={`${head} font-semibold text-[19px] text-[#F5F1E8]`}>Mountain View</span>
          </div>
          <p className={`${body} text-[15px] leading-[1.6] mt-3 max-w-xs`}>
            Family-run landscape design, building, and care around Puget Sound.
          </p>
          <a href={BIZ.licenseHref} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 mt-3 ${body} text-[14px] text-[#F5F1E8]/80 hover:text-[#F5F1E8] underline underline-offset-4 decoration-[#F5F1E8]/30`}>
            <ShieldCheck size={16} weight="fill" className="text-[#8FCB9B]" /> Licensed, bonded &amp; insured · WA Lic. {BIZ.license}
          </a>
        </div>
        <div className={`${body} text-[15px] space-y-2`}>
          <p className="text-[#F5F1E8] font-bold mb-1">Reach us</p>
          <a href={BIZ.phoneHref} className="block hover:text-[#F5F1E8]">{BIZ.phone}</a>
          <a href={`mailto:${BIZ.email}`} className="block hover:text-[#F5F1E8] break-all">{BIZ.email}</a>
          <a href={BIZ.mapHref} target="_blank" rel="noopener noreferrer" className="block hover:text-[#F5F1E8]">{BIZ.address}</a>
          <p>{BIZ.hours}</p>
        </div>
        <div className={`${body} text-[15px] space-y-2`}>
          <p className="text-[#F5F1E8] font-bold mb-1">Services</p>
          {SERVICES.map((s) => (
            <a key={s.slug} href={`${base}/${s.slug}`} className="block hover:text-[#F5F1E8]">{s.name}</a>
          ))}
        </div>
        <div className={`${body} text-[15px] space-y-2`}>
          <p className="text-[#F5F1E8] font-bold mb-1">Areas</p>
          {CITIES.map((c) => (
            <a key={c.slug} href={`${base}/${c.slug}`} className="block hover:text-[#F5F1E8]">{c.name}, WA</a>
          ))}
          <a href={`${base}/gallery`} className="block hover:text-[#F5F1E8] pt-2">Photo gallery</a>
          <a href={`${home}#contact`} className="block hover:text-[#F5F1E8]">Free quote</a>
        </div>
      </div>
      <div className="border-t border-[#F5F1E8]/12">
        <div className={`max-w-6xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-3 ${body} text-[14px]`}>
          <span>© {new Date().getFullYear()} {BIZ.legalName}</span>
          <span className="inline-flex items-center gap-1.5">
            <Mountains size={16} weight="fill" className="text-[#2F7D4F]" />
            Site by <a href="https://bluejayportfolio.com" className="underline hover:text-[#F5F1E8]">BlueJays</a>
          </span>
        </div>
      </div>
      <div className="border-t border-[#F5F1E8]/12 bg-[#171a14]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-center">
          <a href={`${BASE_PATH}/ops`} rel="nofollow" className={`inline-flex items-center gap-2 border border-[#F5F1E8]/25 hover:border-[#2F7D4F] rounded-full px-5 py-2 ${body} text-[14px] font-semibold text-[#F5F1E8]/75 hover:text-[#F5F1E8] transition-colors`}>
            <LockKey size={16} weight="fill" className="text-[#2F7D4F]" /> Mt View Team Login
          </a>
        </div>
      </div>
    </footer>
  );
}
