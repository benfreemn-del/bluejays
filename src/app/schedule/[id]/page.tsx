import { getProspect } from "@/lib/store";
import { notFound } from "next/navigation";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; phone?: string; email?: string; embed?: string; type?: string; source?: string }>;
}) {
  const { id } = await params;
  const { name, phone, email, embed, type, source } = await searchParams;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const accentColor = prospect.scrapedData?.accentColor || "#3b82f6";

  return (
    <ScheduleClient
      prospectId={id}
      businessName={prospect.businessName}
      ownerName={prospect.ownerName}
      category={prospect.category}
      accentColor={accentColor}
      prefillName={name || ""}
      prefillPhone={phone || ""}
      prefillEmail={email || ""}
      isEmbed={embed === "true"}
      bookingType={type || ""}
      source={source || ""}
    />
  );
}
