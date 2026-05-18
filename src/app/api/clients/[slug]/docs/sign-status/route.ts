import { NextResponse } from "next/server";

import { listOnboardDocs } from "@/lib/onboard-docs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/[slug]/docs/sign-status
 *
 * Returns sign status for every registered onboarding doc for this slug.
 * Used by the per-client portal Docs tab so the owner can see which docs
 * they've already acknowledged and which still need signing.
 *
 * Public-ish: relies on the portal-cookie scope to limit who sees what.
 * The data returned is non-sensitive (signer first name + signed_at date)
 * — never includes notes, replies, IP hash, or email body.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     status: [
 *       {
 *         doc: "handoff",
 *         title: "Owner Onboarding Packet",
 *         signed: true,
 *         signedBy: "Paul Hanson",
 *         signedAt: "2026-05-18T18:33:56Z",
 *         totalSignatures: 2,  // both Paul AND Philip signed it
 *       },
 *       { doc: "agreement", signed: false, ... }
 *     ]
 *   }
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const docs = listOnboardDocs(slug);

  if (!isSupabaseConfigured()) {
    // No Supabase = no sign history. Return everything as unsigned so
    // the UI still renders cleanly in dev / mock mode.
    return NextResponse.json({
      ok: true,
      status: docs.map((d) => ({
        doc: d.doc,
        title: d.title,
        signed: false,
        signedBy: null,
        signedAt: null,
        totalSignatures: 0,
      })),
    });
  }

  // Pull every ack for this slug, newest first. One query covers every doc.
  const { data, error } = await supabase
    .from("onboarding_acks")
    .select("doc_key, signer_name, signed_at")
    .eq("client_slug", slug)
    .order("signed_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, status: [] },
      { status: 500 },
    );
  }

  // Group acks by doc_key — latest signer wins for the headline, but we
  // keep a count of total signatures so the UI can say "Both Paul + Philip
  // signed" when there are multiple.
  type Ack = { doc_key: string; signer_name: string; signed_at: string };
  const acksByDoc = new Map<string, Ack[]>();
  for (const row of (data ?? []) as Ack[]) {
    const list = acksByDoc.get(row.doc_key) ?? [];
    list.push(row);
    acksByDoc.set(row.doc_key, list);
  }

  const status = docs.map((d) => {
    const acks = acksByDoc.get(d.doc) ?? [];
    const latest = acks[0]; // already sorted newest-first
    return {
      doc: d.doc,
      title: d.title,
      signed: acks.length > 0,
      signedBy: latest?.signer_name ?? null,
      signedAt: latest?.signed_at ?? null,
      totalSignatures: acks.length,
    };
  });

  return NextResponse.json({ ok: true, status });
}
