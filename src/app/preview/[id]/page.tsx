import { notFound } from "next/navigation";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewRenderer from "@/components/templates/PreviewRenderer";
import { getScrapedData } from "@/lib/store";

export const dynamic = "force-dynamic";

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

  return <PreviewRenderer data={siteData} />;
}
