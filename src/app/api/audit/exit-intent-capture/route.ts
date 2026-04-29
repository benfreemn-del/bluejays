import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/audit/exit-intent-capture
 * Stores email captured from the exit-intent popup on /audit.
 *
 * No personal info beyond email + UA. The user gave their email
 * voluntarily and gets a follow-up "5-minute video walkthrough" promise
 * that's manually fulfilled by Ben (or queued for AI walkthrough later).
 *
 * Stored in `exit_intent_captures` table:
 *   - id (uuid)
 *   - email (text)
 *   - source (text) — e.g. "exit_intent" / "scroll_back" / "idle"
 *   - referrer (text, nullable)
 *   - user_agent (text, nullable)
 *   - created_at (timestamptz, default now())
 *
 * If the table doesn't exist yet (pre-migration), the route returns 200
 * but logs a warning so the client-side popup doesn't break.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; source?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const source = (body.source || "exit_intent").slice(0, 50);

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    console.warn("[exit-intent] Supabase not configured — capture not persisted");
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const { error } = await supabase.from("exit_intent_captures").insert({
      email,
      source,
      referrer: request.headers.get("referer") || null,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
    });

    if (error) {
      // Table may not exist yet — degrade gracefully so client doesn't see error
      console.warn("[exit-intent] insert failed (table may be missing):", error.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[exit-intent] unexpected error:", err);
    return NextResponse.json({ ok: true, persisted: false });
  }
}
