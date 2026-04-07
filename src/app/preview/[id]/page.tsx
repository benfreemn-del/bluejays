import { notFound } from "next/navigation";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewRenderer from "@/components/templates/PreviewRenderer";
import V2ElectricianPreview from "@/components/templates/V2ElectricianPreview";
import { getScrapedData } from "@/lib/store";

export const dynamic = "force-dynamic";

// V2 preview renderers by category — use premium templates when available
const V2_RENDERERS: Partial<Record<string, React.ComponentType<{ data: GeneratedSiteData }>>> = {
  electrician: V2ElectricianPreview,
  // Add more as V2 dynamic renderers are built:
  // plumber: V2PlumberPreview,
  // hvac: V2HvacPreview,
  // roofing: V2RoofingPreview,
  // "auto-repair": V2AutoRepairPreview,
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
