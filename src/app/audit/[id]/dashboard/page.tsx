import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateMockBackend } from "@/lib/mock-backend/generator";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  status: string;
  prospect_id: string;
  target_url: string;
  business_category: string | null;
}

interface ProspectRow {
  business_name: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
}

export default async function AuditDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return <FallbackUnavailable reason="Supabase not configured." />;
  }

  const { data: auditData } = await supabase
    .from("site_audits")
    .select("id, status, prospect_id, target_url, business_category")
    .eq("id", id)
    .maybeSingle();

  if (!auditData) notFound();
  const audit = auditData as unknown as AuditRow;

  let prospect: ProspectRow | null = null;
  if (audit.prospect_id) {
    const { data: p } = await supabase
      .from("prospects")
      .select("business_name, city, state, category")
      .eq("id", audit.prospect_id)
      .maybeSingle();
    prospect = (p as unknown as ProspectRow | null) ?? null;
  }

  const businessName = cleanName(prospect?.business_name) || hostFromUrl(audit.target_url) || "Your Business";
  const category = audit.business_category || prospect?.category || "service";
  const city = realOrFallback(prospect?.city, "Sequim");
  const state = realOrFallback(prospect?.state, "WA");

  const data = generateMockBackend({
    auditId: audit.id,
    businessName,
    category,
    city,
    state,
  });

  return <DashboardClient data={data} auditId={audit.id} prospectId={audit.prospect_id} />;
}

function realOrFallback(value: string | null | undefined, fallback: string): string {
  const v = (value || "").trim();
  if (!v || v.toLowerCase() === "unknown" || v.toLowerCase() === "n/a") return fallback;
  return v;
}

function cleanName(name: string | null | undefined): string | null {
  const n = (name || "").trim();
  if (!n) return null;
  if (n.includes(" ") || n.includes(".")) return n;
  return n.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function hostFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").split(".")[0]?.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || null;
  } catch {
    return null;
  }
}

function FallbackUnavailable({ reason }: { reason: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard unavailable</h1>
        <p className="text-sm text-slate-400">{reason}</p>
      </div>
    </main>
  );
}
