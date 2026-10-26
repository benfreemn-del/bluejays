/**
 * /gallery: the full portfolio (old Squarespace URL kept). Every photo is
 * the Hunsakers' own work, filterable by type, with a lightbox.
 */
import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Header from "../_components/header";
import GalleryGrid from "../_components/gallery-grid";
import { Eyebrow, GreenBtn, JsonLd, head, body } from "../_components/ui";
import { Contact, CtaBand, Breadcrumbs, Footer } from "../_components/sections";
import { getBase } from "../_lib/base";
import { BIZ, SITE_URL, PHOTO_PATH } from "../_lib/site";
import { PHOTOS } from "../_lib/photos";

const TITLE = "Landscaping Photo Gallery | Mountain View Landscape & Design, Auburn WA";
const DESCRIPTION = `${PHOTOS.length} photos of ponds, waterfalls, flagstone patios, retaining walls, gardens, lawns, and lighting built by Mountain View Landscape & Design around Auburn and the Puget Sound.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/gallery`, siteName: BIZ.name, type: "website", images: [{ url: `${SITE_URL}${PHOTO_PATH}/p091-1600.webp` }] },
};

// Best work first; the specimen-tree staging shots go last.
const ORDER = [...PHOTOS].sort((a, b) => Number(a.cats.includes("trees")) - Number(b.cats.includes("trees")) || Number(b.big) - Number(a.big));
const IDS = ORDER.filter((p) => !p.cats.includes("people")).map((p) => p.id);

export default async function GalleryPage() {
  const base = await getBase();
  return (
    <main className={`${body} bg-[#F5F1E8]`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: TITLE,
          url: `${SITE_URL}/gallery`,
          author: { "@type": "HomeAndConstructionBusiness", "@id": `${SITE_URL}/#business`, name: BIZ.name },
          image: IDS.slice(0, 40).map((id) => {
            const p = PHOTOS.find((x) => x.id === id)!;
            return { "@type": "ImageObject", contentUrl: `${SITE_URL}${PHOTO_PATH}/${id}-1600.webp`, caption: p.alt };
          }),
        }}
      />
      <Header base={base} />
      <section className="bg-[#E7EADF] pt-10 sm:pt-14 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <Breadcrumbs base={base} items={[{ name: "Gallery" }]} />
          <div className="max-w-2xl mt-6">
            <Eyebrow>Our work</Eyebrow>
            <h1 className={`${head} font-semibold text-[38px] sm:text-[52px] leading-[1.05] text-[#20241C] mt-3`}>Landscaping photo gallery</h1>
            <p className={`${body} text-[18px] leading-[1.6] text-[#3E4435] mt-4`}>
              {IDS.length} photos from yards we&apos;ve designed and built around Auburn and the Puget Sound. Pick a
              category, then tap any photo to see it full size.
            </p>
          </div>
          <div className="mt-9">
            <GalleryGrid ids={IDS} filters />
          </div>
          <div className="mt-10 text-center">
            <GreenBtn href="#contact">Want a yard like these? Get a free quote <ArrowRight size={17} weight="bold" /></GreenBtn>
          </div>
        </div>
      </section>
      <CtaBand base={base} photoId="p091" line="Like what you see? Let's talk about your yard." />
      <Contact />
      <Footer base={base} />
    </main>
  );
}
