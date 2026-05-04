import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  createAffiliate,
  scoreAffiliate,
} from "@/lib/client-affiliates";
import { ZENITH_AFFILIATE_SEEDS } from "@/lib/client-affiliates-seeds/zenith-sports";

/**
 * POST /api/client-affiliates/seed?client=zenith-sports
 *
 * Bulk-insert the per-client starter seed list. Idempotent —
 * compares lower(org_name) per client to skip duplicates so it's
 * safe to re-run after editing the seed file.
 *
 * Returns counts: { inserted, skipped }.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SEED_REGISTRY: Record<string, typeof ZENITH_AFFILIATE_SEEDS> = {
  "zenith-sports": ZENITH_AFFILIATE_SEEDS,
};

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  const seeds = SEED_REGISTRY[client];
  if (!seeds) {
    return NextResponse.json(
      { ok: false, error: `No seed library for ${client}` },
      { status: 400 },
    );
  }

  const sb = getSupabase();

  // Pre-fetch existing org names for dedupe.
  const { data: existing } = await sb
    .from("client_affiliates")
    .select("org_name")
    .eq("client_slug", client);
  const existingNames = new Set(
    (existing ?? []).map((r) =>
      ((r as { org_name: string }).org_name ?? "").toLowerCase().trim(),
    ),
  );

  let inserted = 0;
  let skipped = 0;
  for (const s of seeds) {
    const key = s.org_name.toLowerCase().trim();
    if (existingNames.has(key)) {
      skipped += 1;
      continue;
    }
    try {
      // createAffiliate computes fit_score using scoreAffiliate; pass
      // through the seed fields. source defaults to "seed-list" for
      // dashboard observability.
      await createAffiliate(client, {
        org_name: s.org_name,
        contact_name: s.contact_name ?? null,
        role: s.role ?? null,
        email: s.email ?? null,
        website: s.website ?? null,
        city: s.city ?? null,
        state: s.state ?? null,
        region: s.region ?? null,
        channel: s.channel ?? null,
        source: "seed-list",
        notes: s.notes ?? null,
      });
      inserted += 1;
    } catch (err) {
      console.error("[affiliate-seed] insert failed:", err);
    }
  }

  // Sanity log so we have observability without scoring tests.
  void scoreAffiliate;

  return NextResponse.json({
    ok: true,
    seeded_count: seeds.length,
    inserted,
    skipped,
  });
}
