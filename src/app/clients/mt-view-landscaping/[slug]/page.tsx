/**
 * Service pages (/hardscapes, /water-features, ...) and city pages
 * (/landscaping-kent-wa, ...). Service slugs match the old Squarespace
 * URLs exactly so the rankings those pages earned carry over.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, ArrowRight, CheckCircle, MapPin } from "@phosphor-icons/react/dist/ssr";
import Header from "../_components/header";
import GalleryGrid from "../_components/gallery-grid";
import { Photo, Eyebrow, H2, GreenBtn, GhostBtn, JsonLd, head, body } from "../_components/ui";
import { Reviews, Contact, CtaBand, FaqList, faqSchema, ServiceCards, AreasServed, Breadcrumbs, Footer } from "../_components/sections";
import { getBase } from "../_lib/base";
import { BIZ, SITE_URL, PHOTO_PATH, PAGE_SLUGS, SERVICES, serviceBySlug, cityBySlug, HOME_FAQS, yearsInBusiness } from "../_lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return PAGE_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = serviceBySlug(slug) ?? cityBySlug(slug);
  if (!page) return {};
  const url = `${SITE_URL}/${slug}`;
  const image = `${SITE_URL}${PHOTO_PATH}/${page.hero}-1600.webp`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description, url, siteName: BIZ.name, type: "website", locale: "en_US", images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [image] },
  };
}

const business = { "@type": "HomeAndConstructionBusiness", "@id": `${SITE_URL}/#business`, name: BIZ.name };
const crumbs = (name: string, slug: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name, item: `${SITE_URL}/${slug}` },
  ],
});

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const base = await getBase();
  const service = serviceBySlug(slug);
  const city = cityBySlug(slug);
  if (!service && !city) notFound();

  if (service) {
    return (
      <main className={`${body} bg-[#F5F1E8]`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.name,
            serviceType: service.name,
            description: service.description,
            url: `${SITE_URL}/${service.slug}`,
            image: `${SITE_URL}${PHOTO_PATH}/${service.hero}-1600.webp`,
            provider: business,
            areaServed: BIZ.counties.map((c) => ({ "@type": "AdministrativeArea", name: `${c} County, WA` })),
          }}
        />
        <JsonLd data={crumbs(service.name, service.slug)} />
        <JsonLd data={faqSchema(service.faqs)} />
        <Header base={base} />

        <section className="relative isolate overflow-hidden min-h-[440px] sm:min-h-[520px] flex items-end">
          <Photo id={service.hero} priority sizes="100vw" className="absolute inset-0 -z-10 w-full h-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#11140f]/90 via-[#11140f]/45 to-[#11140f]/5" />
          <div className="max-w-6xl mx-auto px-5 pb-12 pt-28 w-full">
            <Eyebrow light>{service.name} · Family-run since 1976</Eyebrow>
            <h1 className={`${head} font-semibold text-[38px] sm:text-[52px] lg:text-[60px] leading-[1.05] text-white mt-3 max-w-4xl`}>{service.h1}</h1>
            <p className={`${body} text-[18px] sm:text-[19px] leading-[1.55] text-[#F5F1E8]/90 mt-4 max-w-2xl`}>{service.lede}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <GreenBtn href={BIZ.phoneHref}><Phone size={18} weight="fill" /> Call {BIZ.phone}</GreenBtn>
              <GhostBtn href="#contact" light>Get a free quote <ArrowRight size={17} weight="bold" /></GhostBtn>
            </div>
          </div>
        </section>

        <section className="bg-[#FBF8F1] py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-5">
            <Breadcrumbs base={base} items={[{ name: service.name }]} />
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 mt-6">
              <div className="space-y-8">
                {service.body.map((b) => (
                  <div key={b.h}>
                    <h2 className={`${head} font-semibold text-[26px] sm:text-[30px] text-[#20241C] leading-[1.15]`}>{b.h}</h2>
                    <p className={`${body} text-[18px] leading-[1.7] text-[#3E4435] mt-3`}>{b.p}</p>
                  </div>
                ))}
              </div>
              <aside className="lg:sticky lg:top-24 self-start bg-[#EDF3EC] border border-[#A8A294]/30 rounded-2xl p-6 sm:p-7">
                <p className={`${head} font-semibold text-[22px] text-[#20241C]`}>What we do</p>
                <ul className="mt-4 space-y-3">
                  {service.includes.map((i) => (
                    <li key={i} className={`flex gap-2.5 ${body} text-[16px] leading-[1.5] text-[#20241C]`}>
                      <CheckCircle size={21} weight="fill" className="text-[#2F7D4F] shrink-0 mt-0.5" /> {i}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[#A8A294]/30 mt-6 pt-5">
                  <p className={`${body} text-[15px] text-[#3E4435]`}>Free quotes, no pressure.</p>
                  <a href={BIZ.phoneHref} className={`inline-flex items-center gap-2 mt-1 ${body} text-[20px] font-bold text-[#234E36]`}>
                    <Phone size={20} weight="fill" /> {BIZ.phone}
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-[#E7EADF] py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5">
            <Eyebrow>Our {service.name.toLowerCase()} work</Eyebrow>
            <H2 className="mt-3">Real projects, real yards.</H2>
            <p className={`${body} text-[17px] leading-[1.6] text-[#3E4435] mt-3 max-w-2xl`}>
              {service.photos.length} photos of {service.name.toLowerCase()} we&apos;ve built. Tap any photo to see it big.
            </p>
            <div className="mt-8">
              <GalleryGrid ids={service.photos} />
            </div>
          </div>
        </section>

        <Reviews limit={3} />
        <FaqList faqs={service.faqs} title={`${service.name} questions`} />

        <section className="bg-[#F5F1E8] py-14 sm:py-18">
          <div className="max-w-6xl mx-auto px-5">
            <Eyebrow>Often paired with</Eyebrow>
            <H2 className="mt-3 !text-[28px] sm:!text-[36px]">More of what we do</H2>
            <div className="mt-8">
              <ServiceCards base={base} slugs={service.related} />
            </div>
          </div>
        </section>

        <AreasServed base={base} />
        <Contact heading={`Let's talk about your ${service.name.toLowerCase()}.`} />
        <Footer base={base} />
      </main>
    );
  }

  const c = city!;
  const years = yearsInBusiness();
  return (
    <main className={`${body} bg-[#F5F1E8]`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Landscaping in ${c.name}, WA`,
          serviceType: "Landscaping",
          url: `${SITE_URL}/${c.slug}`,
          provider: business,
          areaServed: { "@type": "City", name: `${c.name}, WA`, containedInPlace: { "@type": "AdministrativeArea", name: `${c.county} County, WA` } },
        }}
      />
      <JsonLd data={crumbs(`Landscaping in ${c.name}`, c.slug)} />
      <Header base={base} />

      <section className="relative isolate overflow-hidden min-h-[440px] sm:min-h-[520px] flex items-end">
        <Photo id={c.hero} priority sizes="100vw" className="absolute inset-0 -z-10 w-full h-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#11140f]/90 via-[#11140f]/45 to-[#11140f]/5" />
        <div className="max-w-6xl mx-auto px-5 pb-12 pt-28 w-full">
          <Eyebrow light><MapPin size={14} weight="fill" className="inline -mt-0.5" /> {c.name} · {c.county} County</Eyebrow>
          <h1 className={`${head} font-semibold text-[38px] sm:text-[52px] lg:text-[60px] leading-[1.05] text-white mt-3 max-w-4xl`}>
            Landscaping &amp; Landscape Design in {c.name}, WA
          </h1>
          <p className={`${body} text-[18px] sm:text-[19px] leading-[1.55] text-[#F5F1E8]/90 mt-4 max-w-2xl`}>{c.intro}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <GreenBtn href={BIZ.phoneHref}><Phone size={18} weight="fill" /> Call {BIZ.phone}</GreenBtn>
            <GhostBtn href="#contact" light>Get a free quote <ArrowRight size={17} weight="bold" /></GhostBtn>
          </div>
        </div>
      </section>

      <section className="bg-[#FBF8F1] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <Breadcrumbs base={base} items={[{ name: `Landscaping in ${c.name}` }]} />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14 mt-6">
            <div className="space-y-8">
              {c.local.map((b) => (
                <div key={b.h}>
                  <h2 className={`${head} font-semibold text-[26px] sm:text-[30px] text-[#20241C] leading-[1.15]`}>{b.h}</h2>
                  <p className={`${body} text-[18px] leading-[1.7] text-[#3E4435] mt-3`}>{b.p}</p>
                </div>
              ))}
              <div>
                <h2 className={`${head} font-semibold text-[26px] sm:text-[30px] text-[#20241C] leading-[1.15]`}>One family, {years} years</h2>
                <p className={`${body} text-[18px] leading-[1.7] text-[#3E4435] mt-3`}>
                  Tim Hunsaker has been building yards in this part of Washington since 1976. He draws every plan by hand,
                  and our own crew builds it and can keep it looking great afterward. {c.name} homeowners get the same
                  people from first visit to final walk-through.
                </p>
              </div>
            </div>
            <aside className="lg:sticky lg:top-24 self-start bg-[#EDF3EC] border border-[#A8A294]/30 rounded-2xl p-6 sm:p-7">
              <p className={`${head} font-semibold text-[22px] text-[#20241C]`}>Serving {c.name}</p>
              <ul className="mt-4 space-y-2.5">
                {c.neighborhoods.map((n) => (
                  <li key={n} className={`flex gap-2.5 ${body} text-[16px] text-[#20241C]`}>
                    <MapPin size={19} weight="fill" className="text-[#2F7D4F] shrink-0 mt-0.5" /> {n}
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#A8A294]/30 mt-6 pt-5">
                <p className={`${body} text-[15px] text-[#3E4435]`}>From our shop at {BIZ.address}</p>
                <a href={BIZ.phoneHref} className={`inline-flex items-center gap-2 mt-2 ${body} text-[20px] font-bold text-[#234E36]`}>
                  <Phone size={20} weight="fill" /> {BIZ.phone}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F1E8] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <Eyebrow>Services for {c.name} homes</Eyebrow>
          <H2 className="mt-3">Everything your yard needs.</H2>
          <div className="mt-9">
            <ServiceCards base={base} slugs={SERVICES.map((s) => s.slug)} />
          </div>
        </div>
      </section>

      <section className="bg-[#E7EADF] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <Eyebrow>A few of our projects</Eyebrow>
          <H2 className="mt-3">The kind of work we do.</H2>
          <div className="mt-8">
            <GalleryGrid ids={c.photos} />
          </div>
          <div className="mt-8 text-center">
            <GhostBtn href={`${base}/gallery`}>See the full gallery <ArrowRight size={17} weight="bold" /></GhostBtn>
          </div>
        </div>
      </section>

      <CtaBand base={base} photoId={c.photos[1]} line={`Planning a project in ${c.name}? Let's walk your yard together.`} />
      <Reviews limit={3} />
      <FaqList faqs={HOME_FAQS} />
      <AreasServed base={base} current={c.slug} />
      <Contact heading={`Tell us about your ${c.name} yard.`} />
      <Footer base={base} />
    </main>
  );
}
