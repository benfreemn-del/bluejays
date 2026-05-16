import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

import { getOnboardDoc } from "@/lib/onboard-docs";
import { sendOwnerAlert } from "@/lib/alerts";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/sign/[slug]/[doc]
 *
 * Public endpoint. Records a client acknowledgment of a shareable
 * onboarding doc and fires SMS + email to Ben in real time.
 *
 * Pattern: see CLAUDE.md "Shareable Client Doc Pattern".
 *
 * Body:
 *   {
 *     name: string,           // required
 *     email?: string,
 *     role?: string,          // optional - "founder", "owner", etc.
 *     notes?: string,         // free-form notes from signer
 *     replies?: Record<string, string>  // answers to extraQuestions
 *   }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; doc: string }> },
): Promise<NextResponse> {
  const { slug, doc } = await params;

  // Validate the doc exists in the registry
  const docConfig = getOnboardDoc(slug, doc);
  if (!docConfig) {
    return NextResponse.json(
      { ok: false, error: "Document not found" },
      { status: 404 },
    );
  }

  let body: {
    name?: unknown;
    email?: unknown;
    role?: unknown;
    notes?: unknown;
    replies?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim() || null : null;
  const role = typeof body.role === "string" ? body.role.trim() || null : null;
  const notes =
    typeof body.notes === "string" ? body.notes.trim() || null : null;
  const replies =
    body.replies && typeof body.replies === "object" ? body.replies : {};

  // Capture light client metadata for audit defense (no raw IPs stored)
  const userAgent = request.headers.get("user-agent") ?? null;
  const rawIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";
  const ipHash = rawIp
    ? createHash("sha256")
        .update(rawIp + "bluejays-ack-salt")
        .digest("hex")
        .slice(0, 16)
    : null;

  // ── 1. Persist FIRST (Rule 43) ──
  let insertOk = true;
  let insertErr: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("onboarding_acks").insert({
        client_slug: slug,
        doc_key: doc,
        signer_name: name,
        signer_email: email,
        signer_role: role,
        replies,
        notes,
        user_agent: userAgent,
        ip_hash: ipHash,
      });
      if (error) {
        insertOk = false;
        insertErr = error.message;
        console.error("[sign] insert failed:", error.message);
      }
    } catch (err) {
      insertOk = false;
      insertErr = err instanceof Error ? err.message : String(err);
      console.error("[sign] insert threw:", insertErr);
    }
  } else {
    console.warn("[sign] Supabase not configured — skipping persistence");
  }

  // ── 2. Notify Ben via SMS + email ──
  const lines = [
    `📋 ${docConfig.alertSubject}`,
    "",
    `Doc: ${docConfig.title}`,
    `Signer: ${name}${role ? ` (${role})` : ""}`,
    email ? `Email: ${email}` : null,
    "",
  ].filter(Boolean) as string[];

  // Render replies inline
  if (docConfig.extraQuestions?.length) {
    for (const q of docConfig.extraQuestions) {
      const answer =
        typeof (replies as Record<string, unknown>)[q.id] === "string"
          ? ((replies as Record<string, string>)[q.id] || "").trim()
          : "";
      lines.push(`${q.label}`);
      lines.push(`  → ${answer || "(no answer)"}`);
    }
  }

  if (notes) {
    lines.push("");
    lines.push("Notes:");
    lines.push(notes);
  }

  if (!insertOk) {
    lines.push("");
    lines.push(`⚠ DB persistence failed: ${insertErr ?? "unknown"}`);
    lines.push("(Manual review needed — submission NOT stored.)");
  }

  try {
    await sendOwnerAlert(lines.join("\n"), { clientSlug: slug });
  } catch (err) {
    console.error("[sign] sendOwnerAlert threw:", err);
    // Don't block the response — the signer's action succeeded even if
    // the notification failed. Ben can still find the row in Supabase.
  }

  return NextResponse.json({ ok: true });
}
