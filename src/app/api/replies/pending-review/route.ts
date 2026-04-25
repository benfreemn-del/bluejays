import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/replies/pending-review
 *
 * Returns every queued_replies row with status='pending_review' joined with
 * its parent prospect's display data. Sorted by created_at desc so the
 * newest drafts appear first.
 *
 * The dashboard's PendingRepliesPanel polls this every 30s.
 *
 * Mock-mode safe: returns an empty list when Supabase isn't configured so
 * the dashboard tile still renders during local dev.
 */

interface ProspectShape {
  id: string;
  business_name: string | null;
  category: string | null;
  city: string | null;
  current_website: string | null;
  google_rating: number | null;
  review_count: number | null;
  email: string | null;
  phone: string | null;
}

interface PendingReplyRow {
  id: string;
  prospect_id: string;
  channel: "sms" | "email";
  recipient: string;
  reply_body: string;
  reply_subject: string | null;
  intent: string | null;
  status: string;
  created_at: string;
  send_after: string;
  prospect?: ProspectShape | ProspectShape[] | null;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ replies: [], total: 0 });
  }

  // First fetch the pending_review rows. We can't reliably PostgREST-join
  // queued_replies → prospects without a configured FK, so do two queries.
  const { data: rawReplies, error: replyErr } = await supabase
    .from("queued_replies")
    .select(
      "id, prospect_id, channel, recipient, reply_body, reply_subject, intent, status, created_at, send_after"
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (replyErr) {
    return NextResponse.json({ error: replyErr.message }, { status: 500 });
  }

  const replies = (rawReplies as PendingReplyRow[] | null) ?? [];

  if (replies.length === 0) {
    return NextResponse.json({ replies: [], total: 0 });
  }

  const prospectIds = Array.from(new Set(replies.map((r) => r.prospect_id)));

  const { data: prospects, error: prospErr } = await supabase
    .from("prospects")
    .select(
      "id, business_name, category, city, current_website, google_rating, review_count, email, phone"
    )
    .in("id", prospectIds);

  if (prospErr) {
    return NextResponse.json({ error: prospErr.message }, { status: 500 });
  }

  const byId = new Map<string, ProspectShape>();
  for (const p of (prospects as ProspectShape[] | null) ?? []) {
    byId.set(p.id, p);
  }

  // Try to also pull the most recent inbound message body so the reviewer
  // sees what the AI is responding to. Best-effort — silently skip on error.
  let inboundByProspect: Map<string, string> = new Map();
  try {
    const { data: inboundRows } = await supabase
      .from("inbound_messages")
      .select("prospect_id, body, received_at")
      .in("prospect_id", prospectIds)
      .order("received_at", { ascending: false });
    if (inboundRows) {
      for (const row of inboundRows as Array<{
        prospect_id: string;
        body: string | null;
      }>) {
        if (!inboundByProspect.has(row.prospect_id) && row.body) {
          inboundByProspect.set(row.prospect_id, row.body);
        }
      }
    }
  } catch {
    // inbound_messages table may not exist in older deployments — non-fatal.
    inboundByProspect = new Map();
  }

  const enriched = replies.map((r) => {
    const p = byId.get(r.prospect_id);
    return {
      id: r.id,
      prospectId: r.prospect_id,
      channel: r.channel,
      recipient: r.recipient,
      replyBody: r.reply_body,
      replySubject: r.reply_subject,
      intent: r.intent,
      status: r.status,
      createdAt: r.created_at,
      sendAfter: r.send_after,
      inboundExcerpt: inboundByProspect.get(r.prospect_id) ?? null,
      prospect: p
        ? {
            id: p.id,
            businessName: p.business_name,
            category: p.category,
            city: p.city,
            currentWebsite: p.current_website,
            googleRating: p.google_rating,
            reviewCount: p.review_count,
          }
        : null,
    };
  });

  return NextResponse.json({ replies: enriched, total: enriched.length });
}
