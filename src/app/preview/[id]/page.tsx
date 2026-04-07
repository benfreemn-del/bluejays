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
import { getScrapedData } from "@/lib/store";

export const dynamic = "force-dynamic";

// V2 preview renderers by category — ALL 11 V2 categories have dynamic renderers
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

  // Use V2 renderer if available for this category, otherwise fall back to generic
  const V2Renderer = V2_RENDERERS[siteData.category];
  if (V2Renderer) {
    return <V2Renderer data={siteData} />;
  }

  return <PreviewRenderer data={siteData} />;
}
