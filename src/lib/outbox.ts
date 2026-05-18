/**
 * Outbox — drafted outreach touches waiting on Ben's approval.
 *
 * Written by `ai_skill:draft-touch`. Approved either via the dashboard
 * one-tap button (`/dashboard/outbox`) OR via SMS reply
 * `YES <short_code>` from `OWNER_PHONE_NUMBER` (extended
 * `/api/inbound/sms` handler).
 *
 * State machine:
 *   pending → approved → sent     (happy path)
 *   pending → approved → failed   (send error — preserve for retry)
 *   pending → rejected            (Ben said no)
 *
 * Day-4 v1 supports only `channel = "email"` for actual sends. SMS
 * drafts can be persisted (channel = "sms") but won't auto-send until
 * Twilio A2P 10DLC approves the campaign — surfaced as a soft-fail
 * with a clear error message so Ben can still copy-paste to send.
 */

import { randomBytes } from "node:crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────

export type OutboxChannel = "email" | "sms" | "phone";
export type OutboxStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "sent"
  | "failed";

export type OutboxRow = {
  id: string;
  short_code: string;
  prospect_id: string;
  channel: OutboxChannel;
  subject: string | null;
  body: string;
  tone_notes: string | null;
  reasoning: string | null;
  status: OutboxStatus;
  ai_skill_run_id: string | null;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  sent_at: string | null;
  sent_via: string | null;
  sent_result: Record<string, unknown> | null;
  error: string | null;
};

export type OutboxDraftInput = {
  prospectId: string;
  channel: OutboxChannel;
  subject?: string;
  body: string;
  toneNotes?: string;
  reasoning?: string;
  aiSkillRunId?: string;
};

// ── Short code generation ──────────────────────────────────────────

/** 8-char alphanumeric (lowercase + digits, no ambiguous chars like 0/o,
 *  1/i/l). Designed to type back on a phone after "Reply YES ". */
const SHORT_CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateShortCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += SHORT_CODE_ALPHABET[bytes[i] % SHORT_CODE_ALPHABET.length];
  }
  return out;
}

// ── CRUD ───────────────────────────────────────────────────────────

/** Insert a new pending draft. Caller (the draft-touch skill) is
 *  responsible for SMS-notifying Ben after this returns. */
export async function createOutboxDraft(
  input: OutboxDraftInput,
): Promise<OutboxRow | null> {
  if (!isSupabaseConfigured()) return null;
  // Loop on short_code collision (vanishingly rare at our volume but
  // worth handling — table has a UNIQUE constraint).
  for (let attempt = 0; attempt < 5; attempt++) {
    const short_code = generateShortCode();
    const { data, error } = await supabase
      .from("outbox")
      .insert({
        short_code,
        prospect_id: input.prospectId,
        channel: input.channel,
        subject: input.subject || null,
        body: input.body,
        tone_notes: input.toneNotes || null,
        reasoning: input.reasoning || null,
        ai_skill_run_id: input.aiSkillRunId || null,
        status: "pending",
      })
      .select("*")
      .single();
    if (!error && data) return data as OutboxRow;
    // 23505 = unique_violation
    if (error && (error as { code?: string }).code !== "23505") {
      console.error("[outbox] insert failed:", error);
      return null;
    }
  }
  return null;
}

export async function getOutboxDraft(
  idOrCode: string,
): Promise<OutboxRow | null> {
  if (!isSupabaseConfigured()) return null;
  // Treat as UUID if length 36 with hyphens, else short_code.
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrCode);
  const filter = isUuid
    ? supabase.from("outbox").select("*").eq("id", idOrCode)
    : supabase.from("outbox").select("*").eq("short_code", idOrCode);
  const { data, error } = await filter.maybeSingle();
  if (error || !data) return null;
  return data as OutboxRow;
}

export async function listPendingDrafts(limit = 50): Promise<OutboxRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("outbox")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as OutboxRow[];
}

// ── Approve / reject ──────────────────────────────────────────────

export type ApprovalSource = "dashboard" | "sms" | "cli" | "auto";

export type ApproveResult =
  | { ok: true; status: "sent"; row: OutboxRow }
  | { ok: false; status: "failed"; row: OutboxRow; error: string }
  | { ok: false; status: "not_pending"; row: OutboxRow };

/**
 * Approve a pending draft + trigger send.
 *
 * On send success: row.status = "sent". On send failure: row.status
 * = "failed" with the error captured — caller can retry by hitting
 * this function again.
 *
 * Idempotency: re-approving an already-approved (but not-yet-sent)
 * draft is a no-op for the status flip, but DOES retry the send.
 * Re-approving a sent draft returns { ok: false, status: "not_pending" }.
 */
export async function approveOutboxDraft(
  idOrCode: string,
  source: ApprovalSource,
): Promise<ApproveResult | null> {
  const draft = await getOutboxDraft(idOrCode);
  if (!draft) return null;

  // If already sent / rejected — no-op, don't re-send.
  if (draft.status === "sent" || draft.status === "rejected") {
    return { ok: false, status: "not_pending", row: draft };
  }

  // Flip to "approved" if still pending
  if (draft.status === "pending" && isSupabaseConfigured()) {
    await supabase
      .from("outbox")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", draft.id);
  }

  // Trigger the send based on channel
  let sendOk = false;
  let sendVia = "";
  let sendResult: Record<string, unknown> = {};
  let sendError = "";

  if (draft.channel === "email") {
    const result = await sendEmailFromOutbox(draft);
    sendOk = result.ok;
    sendVia = "sendgrid";
    sendResult = result.payload;
    sendError = result.error;
  } else if (draft.channel === "sms") {
    sendOk = false;
    sendError =
      "SMS auto-send is gated by Twilio A2P 10DLC approval (Rule 35). Copy-paste from dashboard for now.";
  } else if (draft.channel === "phone") {
    // Phone "drafts" are talking-point briefs — there's no auto-send.
    // Treat approval as "Ben confirmed he's about to call" and mark sent.
    sendOk = true;
    sendVia = "manual-phone-call";
  } else {
    sendError = `unsupported channel: ${draft.channel}`;
  }

  // Persist the send outcome
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    await supabase
      .from("outbox")
      .update({
        status: sendOk ? "sent" : "failed",
        sent_at: sendOk ? now : null,
        sent_via: sendVia || null,
        sent_result: sendResult,
        error: sendOk ? null : sendError,
      })
      .eq("id", draft.id);
  }

  // Re-fetch for the caller (so timestamps are accurate)
  const refreshed = (await getOutboxDraft(draft.id)) || draft;

  // Audit signal — emit to agent_signals so /signals tail surfaces approvals
  try {
    if (isSupabaseConfigured()) {
      await supabase.from("agent_signals").insert({
        source: "outbox",
        kind: sendOk ? "approved_sent" : "approved_failed",
        title: `${source}: ${draft.short_code} → ${draft.channel} → ${sendOk ? "sent" : "failed"}`,
        severity: sendOk ? "info" : "warning",
        target: "outbox",
      });
    }
  } catch {
    /* signal-emit failure shouldn't block approval */
  }

  return sendOk
    ? { ok: true, status: "sent", row: refreshed }
    : { ok: false, status: "failed", row: refreshed, error: sendError };
}

export async function rejectOutboxDraft(
  idOrCode: string,
): Promise<OutboxRow | null> {
  const draft = await getOutboxDraft(idOrCode);
  if (!draft) return null;
  if (!isSupabaseConfigured()) return draft;
  if (draft.status !== "pending") return draft;
  await supabase
    .from("outbox")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
    })
    .eq("id", draft.id);
  return (await getOutboxDraft(draft.id)) || draft;
}

// ── Send helpers (channel-specific) ────────────────────────────────

async function sendEmailFromOutbox(draft: OutboxRow): Promise<{
  ok: boolean;
  payload: Record<string, unknown>;
  error: string;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, payload: {}, error: "Supabase not configured" };
  }
  // Pull the prospect for the email address.
  const { data: prospectRow } = await supabase
    .from("prospects")
    .select("email, business_name")
    .eq("id", draft.prospect_id)
    .maybeSingle();
  const prospect = prospectRow as
    | { email: string | null; business_name: string | null }
    | null;
  if (!prospect || !prospect.email) {
    return {
      ok: false,
      payload: {},
      error: "prospect has no email on file",
    };
  }
  const subject = draft.subject || "Quick note";

  try {
    // Lazy-import — keeps the cold-path bundle clean for callers that
    // never approve email drafts (e.g., the dashboard list view).
    const { sendEmail } = await import("@/lib/email-sender");
    // Sequence 900 reserved for ad-hoc drafted touches via outbox.
    // Higher than the 100/200 ranges used by funnel + lifecycle to
    // avoid any clash in email-history queries.
    const sent = await sendEmail(
      draft.prospect_id,
      prospect.email,
      subject,
      draft.body,
      900,
    );
    return {
      ok: true,
      payload: { sentEmailId: sent.id, sentAt: sent.sentAt },
      error: "",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, payload: {}, error: msg };
  }
}

// ── SMS notification for new drafts ────────────────────────────────

/**
 * Notify Ben that a new draft is ready for approval. Called by
 * draft-touch's afterRun hook. SMS format:
 *
 *   📝 New draft for <Business>:
 *   <body first ~120 chars>...
 *   Reply YES <short_code> to send · NO <short_code> to skip
 *
 * Uses sendOwnerAlert which already handles SMS+email parallel send
 * + falls back to console.log when Twilio creds are missing.
 */
export async function notifyOwnerOfDraft(
  draft: OutboxRow,
  businessName: string,
): Promise<void> {
  const preview = draft.body.slice(0, 120).replace(/\s+/g, " ").trim();
  const msg = [
    `📝 New draft for ${businessName}:`,
    "",
    `${preview}${draft.body.length > 120 ? "…" : ""}`,
    "",
    `Reply YES ${draft.short_code} to send · NO ${draft.short_code} to skip`,
    `Or review: bluejayportfolio.com/dashboard/outbox`,
  ].join("\n");
  try {
    const { sendOwnerAlert } = await import("@/lib/alerts");
    await sendOwnerAlert(msg);
  } catch {
    /* alert delivery failure shouldn't fail the draft creation */
  }
}
