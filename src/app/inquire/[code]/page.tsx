import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import InquireClientForm from "./InquireClientForm";

/**
 * Public inquiry form — /inquire/[code]?program=thrive-kids
 *
 * Visitors from a preview site click a program (e.g. Thrive Kids on the
 * Thrive Church preview) and land here. The form captures their name,
 * email, phone, and message, then POSTs to /api/inquire/[code]. That
 * handler emails the prospect's office on their behalf.
 *
 * Public route — no auth. Resolves the prospect by the same 8-char
 * short_code used by /p/[code].
 */

export const dynamic = "force-dynamic";

async function resolveShortCode(code: string): Promise<{
  id: string;
  businessName: string;
  category: string;
  logoUrl: string | null;
  accentColor: string | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, business_name, category, scraped_data")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  if (!prospect) return null;
  const sd = (prospect.scraped_data as Record<string, unknown>) || {};
  return {
    id: prospect.id as string,
    businessName: prospect.business_name as string,
    category: prospect.category as string,
    logoUrl: (sd.logoUrl as string | null) || null,
    accentColor: (sd.accentColor as string | null) || "#0d9488",
  };
}

export default async function InquirePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ program?: string; label?: string }>;
}) {
  const { code } = await params;
  const { program, label } = await searchParams;
  const resolved = await resolveShortCode(code);
  if (!resolved) notFound();

  return (
    <InquireClientForm
      code={code}
      businessName={resolved.businessName}
      logoUrl={resolved.logoUrl}
      accentColor={resolved.accentColor || "#0d9488"}
      programSlug={program || ""}
      programLabel={label || ""}
    />
  );
}
