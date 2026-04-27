import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getProspect } from "@/lib/store";
import { getRegistrar } from "@/lib/domain-registrar";
import { generateDomainVariants } from "@/lib/domain-suggestions";

/**
 * GET /api/domain-suggestions/[id]
 *
 * Auto-domain-suggest endpoint for the onboarding form. Generates up
 * to 6 candidate domains from the prospect's business name (Q7C),
 * checks Namecheap availability for each, and returns the first 3
 * AVAILABLE picks ordered most-natural-first.
 *
 * Public via PUBLIC_API_PATHS using the URL-as-secret pattern — the
 * prospect's UUID in the URL IS the credential, same as
 * /api/claim/[id], /preview/[id], etc.
 *
 * Mock-mode safe: when NAMECHEAP_API_KEY is absent, getRegistrar()
 * returns the deterministic mock client which marks ~70% of variants
 * as available, so dev/CI continues to work without burning real
 * Namecheap calls.
 *
 * Rate-limited 10 calls/hour/IP — generous because the onboarding
 * page may auto-fire once on load + retry on user "refresh suggestions".
 *
 * Cost: each registrar.checkAvailability() call logs $0 via the cost
 * logger (Namecheap doesn't charge for availability checks).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: prospectId } = await params;

  // Rate-limit before any DB or registrar work
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`domain-suggestions:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again in an hour." },
      { status: 429 },
    );
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const businessName = prospect.businessName?.trim();
  if (!businessName) {
    return NextResponse.json(
      {
        suggestions: [],
        checked: [],
        message: "No business name on record yet — fill it in and we'll suggest domains.",
      },
      { status: 200 },
    );
  }

  const variants = generateDomainVariants(businessName);
  if (variants.length === 0) {
    return NextResponse.json({ suggestions: [], checked: [] });
  }

  const registrar = getRegistrar();
  const checked: Array<{ domain: string; available: boolean; price?: number }> = [];

  // Check each variant sequentially. Stop early once we have 3
  // available so we don't waste Namecheap calls (Q7C: 6 variants,
  // return first 3 available).
  for (const variant of variants) {
    if (checked.filter((c) => c.available).length >= 3) break;
    try {
      const result = await registrar.checkAvailability(variant);
      checked.push({ domain: variant, available: result.available, price: result.price });
    } catch (err) {
      // Don't fail the whole request on a single registrar hiccup —
      // mark this variant unavailable and move on.
      console.error(`[domain-suggestions] checkAvailability failed for ${variant}:`, err);
      checked.push({ domain: variant, available: false });
    }
  }

  const suggestions = checked.filter((c) => c.available).slice(0, 3);

  return NextResponse.json({
    suggestions,
    checked, // full list for debugging — operator can see what was tried
    businessName,
  });
}
