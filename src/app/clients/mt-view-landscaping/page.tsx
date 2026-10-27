/**
 * /clients/mt-view-landscaping: Mountain View Landscape & Design home.
 * Served at the root of mtviewlandscaping.com via CLIENT_DOMAIN_MAP.
 *
 * v7 (2026-10-26): multi-page local-SEO rebuild. Photos lead: every image
 * is the Hunsakers' own work (128 photos, see _lib/photos.ts). Service and
 * city pages live in [slug]/, the full portfolio in gallery/.
 */
import { Phone, ArrowRight, Tree, ShieldCheck, Handshake, Star } from "@phosphor-icons/react/dist/ssr";
import Header from "./_components/header";
import GalleryGrid from "./_components/gallery-grid";
import { Photo, Eyebrow, H2, GreenBtn, GhostBtn, JsonLd, head, body } from "./_components/ui";
import { Reviews, Contact, CtaBand, FaqList, faqSchema, ServiceCards, AreasServed, Footer } from "./_components/sections";
import { getBase } from "./_lib/base";
import { BIZ, HOME_FAQS, yearsInBusiness } from "./_lib/site";
import { PHOTOS } from "./_lib/photos";

const SIGNATURE = [
  { id: "p052", label: "Ponds & waterfalls", slug: "water-features", cls: "col-span-2 row-span-2" },
  { id: "p033", label: "Flagstone patios", slug: "hardscapes", cls: "" },
  { id: "p131", label: "Retaining walls", slug: "retaining-walls", cls: "" },
  { id: "p124", label: "Complete landscapes", slug: "landscape-design", cls: "" },
  { id: "p045", label: "Lawns & irrigation", slug: "irrigation", cls: "" },
];

// Best work, no repeats of the hero/mosaic above, no in-progress or fenced shots.
const PREVIEW = ["p091", "p053", "p031", "p063", "p002", "p086", "p036", "p009", "p128", "p054", "p070", "p095", "p044", "p057", "p027", "p030"];

const STEPS = [
  { n: "1", t: "You reach out", d: "Call or send the short form. Tell us a little about your yard." },
  { n: "2", t: "We come look", d: "We visit, walk the property, and talk about what you want. Free." },
  { n: "3", t: "Tim draws it", d: "You see your new yard on paper and change it until it feels right." },
  { n: "4", t: "We build it", d: "Our own crew builds it, and we can keep it looking great all year." },
];

export default async function MtViewHome() {
  const base = await getBase();
  const years = yearsInBusiness();
  return (
    <main className={`${body} bg-[#F5F1E8]`}>
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <Header base={base} />

      {/* ───── hero: their work, full bleed ───── */}
      <section className="relative isolate overflow-hidden min-h-[560px] sm:min-h-[640px] lg:min-h-[78vh] flex items-end">
        {/* Hero = the photo from their Squarespace homepage (Ben chose it 2026-10-26). */}
        <Photo id="p001" priority hero sizes="100vw" className="absolute inset-0 -z-10 w-full h-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#11140f]/85 via-[#11140f]/35 to-[#11140f]/5" />
        {/* Left shade keeps the headline readable over the bright fountain; the house and garden stay bright on the right. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#11140f]/75 via-[#11140f]/35 to-transparent" />
        <div className="max-w-6xl mx-auto px-5 pb-12 sm:pb-16 pt-32 w-full">
          <Eyebrow light>Landscaping since 1976 · Auburn, WA</Eyebrow>
          <h1 className="mt-4">
            <span className={`block ${body} text-[17px] sm:text-[19px] font-semibold text-[#F5F1E8]/90`}>
              Landscape design, stone, water features &amp; yard care
            </span>
            <span className={`block ${head} font-semibold text-[44px] sm:text-[62px] lg:text-[74px] leading-[1.02] text-white mt-2`}>
              A yard you&apos;ll love.<br />Built to last.
            </span>
          </h1>
          <p className={`${body} text-[18px] sm:text-[20px] leading-[1.55] text-[#F5F1E8]/90 mt-5 max-w-xl`}>
            We&apos;re Tim and Bonnie Hunsaker. For {years} years our family has designed, built, and cared for yards
            around Auburn and the Puget Sound.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <GreenBtn href={BIZ.phoneHref}><Phone size={18} weight="fill" /> Call {BIZ.phone}</GreenBtn>
            <GhostBtn href="#contact" light>Get a free quote <ArrowRight size={17} weight="bold" /></GhostBtn>
          </div>
        </div>
      </section>

      {/* ───── trust strip ───── */}
      <section className="bg-[#234E36] text-[#F5F1E8]">
        <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
          {[
            { icon: Tree, label: `${years} years of experience` },
            { icon: Star, label: `5.0 stars on Google` },
            { icon: ShieldCheck, label: "Licensed, bonded & insured" },
            { icon: Handshake, label: "Free quotes, no pressure" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-2.5">
              <Icon size={24} weight="duotone" className="text-[#8FCB9B] shrink-0" />
              <span className={`${body} text-[15px] sm:text-[16px] font-semibold`}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ───── signature work mosaic ───── */}
      <section className="bg-[#FBF8F1] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <Eyebrow>Our work</Eyebrow>
              <H2 className="mt-3">Let the yards do the talking.</H2>
            </div>
            <a href={`${base}/gallery`} className={`inline-flex items-center gap-2 ${body} text-[16px] font-semibold text-[#234E36] hover:text-[#2F7D4F]`}>
              See all {PHOTOS.length} photos <ArrowRight size={17} weight="bold" />
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] sm:auto-rows-[240px] gap-3 sm:gap-4 mt-9">
            {SIGNATURE.map((s) => (
              <a key={s.id} href={`${base}/${s.slug}`} className={`group relative overflow-hidden rounded-2xl ${s.cls}`}>
                <Photo id={s.id} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" sizes={s.cls ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0" />
                <span className={`absolute left-4 bottom-4 right-4 flex items-center justify-between ${body} text-[16px] sm:text-[18px] font-semibold text-white`}>
                  {s.label} <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───── services ───── */}
      <section id="services" className="bg-[#F5F1E8] py-14 sm:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-xl">
            <Eyebrow>What we do</Eyebrow>
            <H2 className="mt-3">One crew for the whole yard.</H2>
            <p className={`${body} text-[18px] leading-[1.6] text-[#3E4435] mt-4`}>
              From the first drawing to the last plant, we do it all ourselves. You only have one team to call.
            </p>
          </div>
          <div className="mt-9">
            <ServiceCards base={base} />
          </div>
        </div>
      </section>

      {/* ───── we draw it first ───── */}
      <section className="bg-[#FBF8F1] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-9 lg:gap-14 items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>How it starts</Eyebrow>
            <H2 className="mt-3 !text-[30px] sm:!text-[40px]">We draw your yard by hand first.</H2>
            <p className={`${body} text-[18px] leading-[1.65] text-[#3E4435] mt-4`}>
              Before we dig, Tim draws a plan. You see your new yard on paper and tell us what you like. We change it
              until it feels right. Then the same family that drew it builds it. No surprises.
            </p>
            <div className="mt-7">
              <GhostBtn href={`${base}/landscape-design`}>About our design process <ArrowRight size={17} weight="bold" /></GhostBtn>
            </div>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <figure>
              <Photo id="p003" className="w-full aspect-[3/4] object-cover rounded-xl border border-[#A8A294]/30 bg-white" sizes="(min-width: 1024px) 25vw, 50vw" />
              <figcaption className={`${body} text-[13px] font-medium text-[#5C6152] mt-2`}>The plan, drawn by hand</figcaption>
            </figure>
            <figure className="mt-8">
              <Photo id="p002" className="w-full aspect-[3/4] object-cover rounded-xl" sizes="(min-width: 1024px) 25vw, 50vw" />
              <figcaption className={`${body} text-[13px] font-medium text-[#5C6152] mt-2`}>A finished yard</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <CtaBand base={base} photoId="p053" line={`${years} years of yards across the Puget Sound, beautiful in every season.`} />

      {/* ───── gallery preview ───── */}
      <section id="gallery" className="bg-[#E7EADF] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-xl">
            <Eyebrow>Recent and favorite projects</Eyebrow>
            <H2 className="mt-3">Yards we&apos;ve built.</H2>
            <p className={`${body} text-[18px] leading-[1.6] text-[#3E4435] mt-4`}>
              Real yards around Puget Sound: ponds, patios, walls, gardens, and lights. Tap any photo to see it big.
            </p>
          </div>
          <div className="mt-9">
            <GalleryGrid ids={PREVIEW} />
          </div>
          <div className="mt-8 text-center">
            <GreenBtn href={`${base}/gallery`}>See the full gallery ({PHOTOS.length} photos) <ArrowRight size={17} weight="bold" /></GreenBtn>
          </div>
        </div>
      </section>

      {/* ───── about ───── */}
      <section id="about" className="bg-[#FBF8F1] py-14 sm:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-9 lg:gap-14 items-center">
          <div className="grid grid-cols-2 gap-4">
            <Photo id="p011" className="w-full aspect-[3/4] object-cover object-top rounded-xl" sizes="(min-width: 1024px) 25vw, 50vw" alt="Tim Hunsaker, founder of Mountain View Landscape & Design" />
            <Photo id="p012" className="w-full aspect-[3/4] object-cover object-top rounded-xl mt-8" sizes="(min-width: 1024px) 25vw, 50vw" alt="Bonnie Hunsaker, co-owner of Mountain View Landscape & Design" />
          </div>
          <div>
            <Eyebrow>About us</Eyebrow>
            <H2 className="mt-3 !text-[31px] sm:!text-[40px]">Meet Tim &amp; Bonnie.</H2>
            <div className={`${body} text-[18px] leading-[1.7] text-[#3E4435] mt-4 space-y-4`}>
              <p>
                Tim has been landscaping since 1976. He started out with his brothers as Shamrock Landscaping, then he
                and Bonnie built Mountain View into its own company in 2003. That is {years} years of learning what grows, drains, and
                lasts in the Northwest.
              </p>
              <p>
                Bonnie runs the crew that keeps our customers&apos; yards looking great all year. Most of our team has
                been with us for years, not just a season. When you call, you talk to the same family that does the work.
              </p>
              <p className="text-[#20241C] font-semibold">Same family. Same care. From your first drawing to your last mow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── how it works ───── */}
      <section className="bg-[#EDF3EC] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="max-w-xl">
            <Eyebrow>How it works</Eyebrow>
            <H2 className="mt-3">Four easy steps.</H2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#FBF8F1] border border-[#A8A294]/30 rounded-2xl p-6">
                <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#2F7D4F] text-white ${head} font-semibold text-[19px]`}>{s.n}</span>
                <h3 className={`${head} font-semibold text-[21px] text-[#20241C] mt-4`}>{s.t}</h3>
                <p className={`${body} text-[15px] leading-[1.55] text-[#3E4435] mt-1.5`}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reviews />
      <AreasServed base={base} />
      <FaqList faqs={HOME_FAQS} />
      <Contact />
      <Footer base={base} />
    </main>
  );
}
