import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FunnelPreviewClient from "./FunnelPreviewClient";

export const metadata = {
  title: "Your AI Funnel Preview — BlueJays",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /audit-classic/[id]/funnel-preview
 *
 * Pre-purchase preview of the 3-audience AI Marketing System a prospect
 * would get if they bought the $10,000 package. Mirrors the website
 * tier's "see the site before you pay" magic — for the AI Package.
 *
 * Renders 3 audience cards customized to the prospect's business
 * category. Each card shows the realistic email subject + SMS + ad
 * headline that would run on that audience track. No LLM call required
 * for v1 — heuristic per-category templates resolved at request time
 * (LLM personalization is a v2 upgrade).
 *
 * CTA at the bottom: book Ben for the 15-min walkthrough where the
 * full per-prospect mock gets handed over.
 */

type Audit = {
  id: string;
  prospect_id: string | null;
  business_category: string | null;
};

type Prospect = {
  business_name: string | null;
  owner_name: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
};

export default async function FunnelPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: audit } = await supabase
    .from("site_audits")
    .select("id, prospect_id, business_category")
    .eq("id", id)
    .maybeSingle();
  if (!audit) notFound();
  const a = audit as unknown as Audit;

  let prospect: Prospect | null = null;
  if (a.prospect_id) {
    const { data: p } = await supabase
      .from("prospects")
      .select("business_name, owner_name, category, city, state")
      .eq("id", a.prospect_id)
      .maybeSingle();
    prospect = (p as unknown as Prospect | null) ?? null;
  }

  const businessName = prospect?.business_name || "Your Business";
  const category = (a.business_category || prospect?.category || "service")
    .replace(/-/g, " ");
  const city = prospect?.city || "your area";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href={`/audit-classic/${id}`}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to audit
          </Link>
          <span className="text-[11px] uppercase tracking-widest text-violet-300 font-bold">
            AI Marketing System · Preview
          </span>
        </div>
      </header>

      <FunnelPreviewClient
        auditId={id}
        businessName={businessName}
        category={category}
        city={city}
      />
    </main>
  );
}
