/**
 * POST /api/domains/check
 * Body: { domain: string }
 * Response: { available: boolean, price: number, registrar: string }
 *
 * Auth-gated via middleware (admin-only). Uses the configured registrar
 * (mock unless NAMECHEAP_API_KEY env vars present).
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegistrar, normalizeDomain, RegistrarError } from "@/lib/domain-registrar";

export async function POST(request: NextRequest) {
  let body: { domain?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const raw = body?.domain || "";
  const domain = normalizeDomain(raw);
  if (!domain || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
    return NextResponse.json(
      { error: "Invalid or missing 'domain' (must be a valid domain name)." },
      { status: 400 }
    );
  }

  const registrar = getRegistrar();
  try {
    const result = await registrar.checkAvailability(domain);
    return NextResponse.json({
      domain,
      available: result.available,
      price: result.price ?? null,
      registrar: registrar.name,
    });
  } catch (err) {
    if (err instanceof RegistrarError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.code === "not_configured" ? 503 : 502 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Unknown registrar error" },
      { status: 500 }
    );
  }
}
