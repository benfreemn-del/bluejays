import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/leads/text-me-back
 *
 * Prospect-facing opt-in path used by the "Text me back" widget on
 * /preview/[id]. Creates a second TCPA-compliant SMS consent pathway
 * (in addition to /get-started form):
 *
 *   1. Prospect opens preview from cold email
 *   2. Prospect enters their phone + ticks consent checkbox
 *   3. POST here captures consent + flips prospect.source to "inbound"
 *   4. Next funnel cycle, the inbound gate in funnel-manager.ts
 *      allows SMS sends to this number
 *
 * This is a consented path — the same checkbox language used on
 * /get-started is required in the UI before submit is enabled.
 *
 * Body: { prospectId: string, phone: string, consentText: string }
 *   consentText echoes back the exact checkbox wording so we can
 *   log it in adminNotes as proof-of-consent for later TCR audits.
 */

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prospectId = String(body.prospectId || "").trim();
    const phoneRaw = String(body.phone || "").trim();
    const consentText = String(body.consentText || "").trim();

    if (!prospectId || !phoneRaw) {
      return NextResponse.json(
        { error: "prospectId and phone are required" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return NextResponse.json(
        { error: "Invalid US phone number. Use a 10-digit US mobile number." },
        { status: 400 }
      );
    }

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    // Build a clear consent-capture note for later TCR audit. Includes
    // timestamp, phone, the exact consent text the prospect saw, and
    // the path (widget vs form).
    const nowIso = new Date().toISOString();
    const consentNote = [
      `[SMS consent via preview widget — ${nowIso}]`,
      `Phone: ${phone}`,
      `Source: /preview/${prospect.short_code || prospect.id}`,
      `Consent text shown to user:`,
      consentText || "(consent text not captured)",
    ].join("\n");

    const prevNotes = prospect.adminNotes || "";
    const newNotes = prevNotes
      ? `${prevNotes}\n\n${consentNote}`
      : consentNote;

    await updateProspect(prospect.id, {
      phone,
      source: "inbound",
      adminNotes: newNotes,
      adminNotesUpdatedAt: nowIso,
    });

    return NextResponse.json({
      success: true,
      message: "Got it — we'll text you when there's news on your site.",
    });
  } catch (err) {
    console.error("[text-me-back] error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
