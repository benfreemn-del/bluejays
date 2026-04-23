import { redirect, notFound } from "next/navigation";
import { getAllProspects } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET /p/[code]
 *
 * Short-URL redirect for outreach emails and SMS.
 * [code] is the first 8 characters of the prospect UUID.
 * Redirects to /preview/[fullId] — keeps outreach links short and professional.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || code.length < 6) notFound();

  const prospects = await getAllProspects();
  const prospect = prospects.find((p) => p.id.startsWith(code.toLowerCase()));

  if (!prospect) notFound();

  redirect(`/preview/${prospect.id}`);
}
