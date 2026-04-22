import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import {
  generatePersonalizedProposal,
  getStoredProposal,
} from "@/lib/proposal-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/proposals/generate
 *
 * Bulk-generates personalized proposals for approved/contacted prospects
 * that don't have one yet.
 *
 * Body (all optional):
 *   { ids?: string[]; force?: boolean; limit?: number }
 *   - ids: generate for specific prospect IDs only
 *   - force: regenerate even if a proposal already exists
 *   - limit: max proposals to generate in this run (default 20)
 *
 * Proposals are stored in Supabase and served from /proposal/[id].
 * The cost is ~$0.004 per proposal (GPT-4.1-mini).
 */

export async function POST(request: Request) {
  let body: { ids?: string[]; force?: boolean; limit?: number } = {};
  try {
    body = await request.json();
  } catch {
    // all optional
  }

  const { ids, force = false, limit = 20 } = body;

  const prospects = await getAllProspects();

  const targets = prospects.filter((p) => {
    if (ids?.length) return ids.includes(p.id);
    // Default: only generate for prospects in active funnel/approved states
    const activeStatuses = [
      "approved", "ready_to_review", "pending-review",
      "contacted", "email_opened", "link_clicked",
      "interested", "responded",
    ];
    return activeStatuses.includes(p.status);
  });

  const toGenerate = targets.slice(0, limit);

  const results: {
    id: string;
    business: string;
    status: "generated" | "skipped" | "failed";
    reason?: string;
  }[] = [];

  for (const prospect of toGenerate) {
    // Skip if already exists and not forcing regeneration
    if (!force) {
      const existing = await getStoredProposal(prospect.id).catch(() => null);
      if (existing) {
        results.push({ id: prospect.id, business: prospect.businessName, status: "skipped", reason: "already exists" });
        continue;
      }
    }

    try {
      await generatePersonalizedProposal(prospect.id);
      results.push({ id: prospect.id, business: prospect.businessName, status: "generated" });
      console.log(`[Proposals] Generated for ${prospect.businessName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ id: prospect.id, business: prospect.businessName, status: "failed", reason: msg });
      console.error(`[Proposals] Failed for ${prospect.id}:`, msg);
    }
  }

  const generated = results.filter((r) => r.status === "generated").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({ generated, skipped, failed, total: toGenerate.length, results });
}

/**
 * GET /api/proposals/generate
 *
 * Returns a summary of which active prospects have proposals and which don't.
 */
export async function GET() {
  const prospects = await getAllProspects();
  const activeStatuses = [
    "approved", "ready_to_review", "pending-review",
    "contacted", "email_opened", "link_clicked",
    "interested", "responded",
  ];
  const active = prospects.filter((p) => activeStatuses.includes(p.status));

  const summary = await Promise.all(
    active.map(async (p) => {
      const proposal = await getStoredProposal(p.id).catch(() => null);
      return {
        id: p.id,
        business: p.businessName,
        status: p.status,
        hasProposal: !!proposal,
        proposalUrl: `/proposal/${p.id}`,
        generatedAt: proposal?.generatedAt || null,
      };
    })
  );

  const withProposal = summary.filter((s) => s.hasProposal).length;
  const withoutProposal = summary.filter((s) => !s.hasProposal).length;

  return NextResponse.json({ withProposal, withoutProposal, total: summary.length, prospects: summary });
}
