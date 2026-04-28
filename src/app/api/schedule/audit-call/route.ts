import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendOwnerAlert } from "@/lib/alerts";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/schedule/audit-call
 *
 * Public endpoint — called from /schedule (the standalone "book a call
 * with Ben" page linked in audit Email 1 for sub-60 scorers).
 *
 * No prospect ID required. This is for audit leads who want Ben to call
 * them, not for a client's customers booking with that client's business.
 *
 * On submit: SMS Ben immediately + persist to audit_call_requests table.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`audit-call-req:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again in an hour." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, preferredTime } = body as {
    name?: string;
    email?: string;
    phone?: string;
    preferredTime?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 },
    );
  }

  const timeLabel =
    preferredTime === "morning" ? "Morning (8am–12pm PT)" :
    preferredTime === "afternoon" ? "Afternoon (12pm–5pm PT)" :
    preferredTime === "evening" ? "Evening (5pm–8pm PT)" :
    "Anytime";

  // Persist before alerting (Rule 43)
  if (isSupabaseConfigured()) {
    await supabase
      .from("audit_call_requests")
      .insert({
        id: uuidv4(),
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        preferred_time: preferredTime || "anytime",
        created_at: new Date().toISOString(),
      })
      .then(() => null)
      .catch(() => null); // Table may not exist yet — best effort
  }

  // Alert Ben
  const lines = [
    `📞 CALL REQUEST from /schedule`,
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    phone?.trim() ? `Phone: ${phone.trim()}` : null,
    `Best time: ${timeLabel}`,
  ].filter(Boolean).join("\n");

  void sendOwnerAlert(lines).catch((err) => {
    console.error("[schedule/audit-call] Owner alert failed:", err);
  });

  return NextResponse.json({ ok: true });
}
