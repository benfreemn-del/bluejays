import { notFound } from "next/navigation";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewRenderer from "@/components/templates/PreviewRenderer";
import V2ElectricianPreview from "@/components/templates/V2ElectricianPreview";
import V2DentalPreview from "@/components/templates/V2DentalPreview";
import V2LawFirmPreview from "@/components/templates/V2LawFirmPreview";
import V2SalonPreview from "@/components/templates/V2SalonPreview";
import V2FitnessPreview from "@/components/templates/V2FitnessPreview";
import V2RealEstatePreview from "@/components/templates/V2RealEstatePreview";
import V2ChurchPreview from "@/components/templates/V2ChurchPreview";
import V2PlumberPreview from "@/components/templates/V2PlumberPreview";
import V2HvacPreview from "@/components/templates/V2HvacPreview";
import V2RoofingPreview from "@/components/templates/V2RoofingPreview";
import V2AutoRepairPreview from "@/components/templates/V2AutoRepairPreview";
import V2ChiropracticPreview from "@/components/templates/V2ChiropracticPreview";
import V2VeterinaryPreview from "@/components/templates/V2VeterinaryPreview";
import V2PhotographyPreview from "@/components/templates/V2PhotographyPreview";
import V2InteriorDesignPreview from "@/components/templates/V2InteriorDesignPreview";
import V2LandscapingPreview from "@/components/templates/V2LandscapingPreview";
import V2CleaningPreview from "@/components/templates/V2CleaningPreview";
import V2PestControlPreview from "@/components/templates/V2PestControlPreview";
import V2AccountingPreview from "@/components/templates/V2AccountingPreview";
import V2TattooPreview from "@/components/templates/V2TattooPreview";
import V2FloristPreview from "@/components/templates/V2FloristPreview";
import V2MovingPreview from "@/components/templates/V2MovingPreview";
import V2DaycarePreview from "@/components/templates/V2DaycarePreview";
import V2InsurancePreview from "@/components/templates/V2InsurancePreview";
import V2MartialArtsPreview from "@/components/templates/V2MartialArtsPreview";
import V2PoolSpaPreview from "@/components/templates/V2PoolSpaPreview";
import { getScrapedData } from "@/lib/store";
import { proxyPhotos } from "@/lib/image-proxy";
import { getHeroHeading, getHeroSubtitle, getHeroImage, getAboutImage, getNavName } from "@/lib/preview-utils";

export const dynamic = "force-dynamic";

// V2 preview renderers by category — ALL 26 V2 categories have dynamic renderers
const V2_RENDERERS: Partial<Record<string, React.ComponentType<{ data: GeneratedSiteData }>>> = {
  electrician: V2ElectricianPreview,
  dental: V2DentalPreview,
  "law-firm": V2LawFirmPreview,
  salon: V2SalonPreview,
  fitness: V2FitnessPreview,
  "real-estate": V2RealEstatePreview,
  church: V2ChurchPreview,
  plumber: V2PlumberPreview,
  hvac: V2HvacPreview,
  roofing: V2RoofingPreview,
  "auto-repair": V2AutoRepairPreview,
  chiropractic: V2ChiropracticPreview,
  veterinary: V2VeterinaryPreview,
  photography: V2PhotographyPreview,
  "interior-design": V2InteriorDesignPreview,
  landscaping: V2LandscapingPreview,
  cleaning: V2CleaningPreview,
  "pest-control": V2PestControlPreview,
  accounting: V2AccountingPreview,
  tattoo: V2TattooPreview,
  florist: V2FloristPreview,
  moving: V2MovingPreview,
  daycare: V2DaycarePreview,
  insurance: V2InsurancePreview,
  "martial-arts": V2MartialArtsPreview,
  "pool-spa": V2PoolSpaPreview,
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Read generated site data from store
  const siteData = await getScrapedData(id) as GeneratedSiteData | null;
  if (!siteData) {
    notFound();
  }

  // Clean data: proxy images, fix long taglines, detect logos, clean business names
  const heroImg = getHeroImage(siteData);
  const aboutImg = getAboutImage(siteData);
  const cleanPhotos = proxyPhotos(siteData.photos);

  // Reorder photos: hero image first, about image second, rest after
  const orderedPhotos = [
    heroImg ? cleanPhotos.find(p => p.includes(encodeURIComponent(heroImg.split("?")[0]))) || cleanPhotos[0] : cleanPhotos[0],
    aboutImg ? cleanPhotos.find(p => p.includes(encodeURIComponent(aboutImg.split("?")[0]))) || cleanPhotos[1] : cleanPhotos[1],
    ...cleanPhotos.slice(2),
  ].filter(Boolean) as string[];

  const proxiedData: GeneratedSiteData = {
    ...siteData,
    businessName: getNavName(siteData),
    tagline: getHeroHeading(siteData),
    about: getHeroSubtitle(siteData) !== siteData.about ? (siteData.about || getHeroSubtitle(siteData)) : siteData.about,
    photos: orderedPhotos.length > 0 ? orderedPhotos : cleanPhotos,
  };

  // Use V2 renderer if available for this category, otherwise fall back to generic
  const V2Renderer = V2_RENDERERS[proxiedData.category];
  if (V2Renderer) {
    return <V2Renderer data={proxiedData} />;
  }

  return <PreviewRenderer data={proxiedData} />;
}
