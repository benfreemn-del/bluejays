import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/dashboard/qbo/export?from=YYYY-MM-DD&to=YYYY-MM-DD&client=slug
 *
 * One-way QuickBooks journal-entry CSV export. The bookkeeper imports
 * this monthly via QBO's "Import data → Journal entries" tool. Skip
 * the full OAuth dance — Intuit's API rate limits make event-driven
 * sync brittle below ~$50k/mo volume.
 *
 * Columns match QBO's import template:
 *   Date, Journal No., Account, Debits, Credits, Description,
 *   Name (Vendor/Customer), Class
 *
 * Each system_costs row becomes one balanced journal entry:
 *   Debit  → an expense account (mapped per-service below)
 *   Credit → "Stripe Clearing" or "Master Lob Pass-through"
 *
 * Owner-only via /api/dashboard middleware gate.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE_TO_QBO_ACCOUNT: Record<string, string> = {
  twilio_sms: "Telecom — SMS",
  twilio_voice: "Telecom — Voice",
  sendgrid_email: "Software — SendGrid",
  google_places: "Software — Google APIs",
  google_places_detail: "Software — Google APIs",
  google_places_photo: "Software — Google APIs",
  google_places_search: "Software — Google APIs",
  anthropic: "Software — Anthropic Claude",
  openai: "Software — OpenAI",
  claude: "Software — Anthropic Claude",
  manus: "Software — Manus / Site Gen",
  perplexity: "Software — Perplexity",
  lob_postcard: "Marketing — Direct Mail",
  image_proxy: "Software — Bandwidth",
  domain_registrar: "Software — Domains",
  domain_renewal: "Software — Domains",
  perplexity_research: "Software — Perplexity",
  perplexity_pitch: "Software — Perplexity",
};

function qboAccountFor(service: string): string {
  if (SERVICE_TO_QBO_ACCOUNT[service]) return SERVICE_TO_QBO_ACCOUNT[service];
  // Fallback bucket: log it as "Software — Other" so the bookkeeper
  // can re-categorize once. New services should be added above.
  return "Software — Other";
}

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from"); // YYYY-MM-DD
  const to = url.searchParams.get("to");
  const client = url.searchParams.get("client"); // optional slug filter

  if (!from || !to) {
    return NextResponse.json(
      { ok: false, error: "from and to query params required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const sb = getSupabase();
  let q = sb
    .from("system_costs")
    .select("id, service, action, cost_usd, client_slug, prospect_id, created_at, metadata")
    .gte("created_at", `${from}T00:00:00Z`)
    .lte("created_at", `${to}T23:59:59Z`)
    .order("created_at", { ascending: true });
  if (client) q = q.eq("client_slug", client);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  const rows = (data ?? []) as Array<{
    id: string;
    service: string;
    action: string | null;
    cost_usd: number | string;
    client_slug: string | null;
    prospect_id: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
  }>;

  const lines: string[] = [
    [
      "Date",
      "Journal No.",
      "Account",
      "Debits",
      "Credits",
      "Description",
      "Name",
      "Class",
    ].join(","),
  ];

  let journalNo = 1;
  for (const r of rows) {
    const amount = Number(r.cost_usd ?? 0);
    if (!isFinite(amount) || amount <= 0) continue;
    const date = r.created_at.slice(0, 10);
    const account = qboAccountFor(r.service);
    const desc = `${r.service}/${r.action ?? "n/a"}${r.prospect_id ? ` · prospect ${r.prospect_id.slice(0, 8)}` : ""}`;
    const klass = r.client_slug ?? "BlueJays — Internal";
    const name = r.client_slug ?? "BlueJays Internal";

    // Debit line: expense account
    lines.push(
      [
        date,
        `JE-${journalNo}`,
        csvEscape(account),
        amount.toFixed(2),
        "",
        csvEscape(desc),
        csvEscape(name),
        csvEscape(klass),
      ].join(","),
    );
    // Credit line: cash/clearing account
    lines.push(
      [
        date,
        `JE-${journalNo}`,
        csvEscape("Stripe Clearing"),
        "",
        amount.toFixed(2),
        csvEscape(desc),
        csvEscape(name),
        csvEscape(klass),
      ].join(","),
    );
    journalNo++;
  }

  const filename = `qbo-export-${from}-to-${to}${client ? `-${client}` : ""}.csv`;
  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
