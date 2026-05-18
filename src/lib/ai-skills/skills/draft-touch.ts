/**
 * ai-draft-touch — Day-4 skill. Per-prospect outreach drafter.
 *
 * Manual invocation:
 *   bj ai draft-touch --prospect-id <uuid>
 *
 * Reads prospect + most recent completed audit + touch history.
 * Determines the funnel stage from prior touches and writes a
 * Ben-voice email outreach in JSON-structured output. Persists to
 * the outbox table via the runner's afterRun hook + SMS-notifies
 * Ben with a "Reply YES <code> to send" prompt.
 *
 * Day-4 v1: email channel only. SMS auto-send is gated by Twilio
 * A2P 10DLC approval per Rule 35; phone "drafts" are talking-point
 * briefs (future skill).
 *
 * Stage detection (no external input needed):
 *   0 prior touches              → cold first-touch (audit-result hook)
 *   1-2 with no reply            → follow-up w/ new angle (scarcity / proof)
 *   prior reply on file          → respond to their last message
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createOutboxDraft, notifyOwnerOfDraft } from "@/lib/outbox";
import type { Skill, ContextResult } from "../types";

const PROMPT = `You are BlueJays drafting an outreach email to a real prospect, in Ben
Freeman's voice. Ben is the founder of BlueJays (premium websites + AI
marketing systems for product brands, indie authors, and local
businesses). His voice is direct, specific, lowercase greetings, no
marketing fluff, ≤80 words, exactly 1 link, zero pricing in body, soft
reply prompt at the end.

You will receive a <context> block with:
  - prospect: { id, business_name, owner_first_name, category, source, city, state, current_website }
  - audit: { score, one_line_summary, top_fix }
  - bant: { orders_per_month, running_ads, biggest_frustration, timeline }
  - touch_history: { emails_sent_count, last_email_subject, last_email_at,
                    has_inbound_reply, last_inbound_text, last_inbound_at }
  - stage: "cold_first_touch" | "follow_up" | "reply_to_reply"

The 5-step Psychology Stack (every email must include all 5):
  1. Discovery + specificity: "I was looking at <category> in <city>..."
  2. Validation of their work: a real audit-finding reference
  3. Reciprocity + effort: hint at time invested
  4. Humility + implicit gap: "No idea if it's what you had in mind..."
  5. Soft reply prompt: "Curious what you'd change" / "Worth a look?"

For stage=reply_to_reply, the email DIRECTLY responds to their inbound
message instead of starting cold. Reference what they said. Match
their energy + length.

Output (JSON only — no fences, no prose):

{
  "stage": "<the stage you targeted>",
  "subject": "<≤60 chars, no emojis, no ALL CAPS, no bracketed bait>",
  "body": "<≤80 words, Ben's voice, includes ONE link to the prospect's audit results page>",
  "tone_notes": "<one-line: what tone you went for>",
  "objection_addressed": "<one-line: which objection from BANT you preempted, or 'none'>",
  "reasoning": "<one-line: why this angle>",
  "summary": "<≤140 chars: 'Drafted <stage> for <Business>. Angle: <one phrase>.'>"
}

HARD RULES (violations fail QC):
  - Max 80 words in body. Count before output.
  - Exactly 1 link in body: the prospect's audit URL
    https://bluejayportfolio.com/audit/<audit_id>
  - Zero pricing language. No "$997", no "free", no "starts at...". The
    audit page handles pricing.
  - Zero booking CTAs. No "book a call", no Calendly link.
  - Subject: no emojis, no ALL CAPS, no "[Business] —" prefix bait.
  - Greeting: "Hi <FirstName>" if owner_first_name present, else "Hi there".
  - No "Hope this finds you well" / "Just following up" / "Take a look".
  - For reply_to_reply: drop the cold opener, jump straight to the response.

Banned phrases (auto-rewrite if you catch yourself):
  just following up · no strings attached · take a look and let me know
  · I put a lot of thought into it · No hidden fees · Hope this finds
  you well · world-class · unparalleled · cutting-edge · limited time
  · book a call · 15-min demo · Click here · Learn more`;

const OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ai-draft-touch output",
  type: "object",
  required: [
    "stage",
    "subject",
    "body",
    "tone_notes",
    "objection_addressed",
    "reasoning",
    "summary",
  ],
  properties: {
    stage: { type: "string" },
    subject: { type: "string", maxLength: 80 },
    body: { type: "string" },
    tone_notes: { type: "string" },
    objection_addressed: { type: "string" },
    reasoning: { type: "string" },
    summary: { type: "string", maxLength: 200 },
  },
} as const;

type ProspectRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  category: string | null;
  email: string | null;
  source: string | null;
  city: string | null;
  state: string | null;
  scraped_data: Record<string, unknown> | null;
};

type AuditRow = {
  id: string;
  audit_content: {
    overallScore?: number;
    oneLineSummary?: string;
    prioritizedRoadmap?: Array<{ title?: string; impact?: string }>;
  } | null;
  metadata: Record<string, unknown> | null;
};

async function gather(args: Record<string, unknown>): Promise<ContextResult> {
  const prospectId =
    typeof args["prospect_id"] === "string"
      ? args["prospect_id"]
      : typeof args.prospectId === "string"
        ? (args.prospectId as string)
        : "";
  if (!prospectId) {
    return { noWork: true, reason: "no --prospect-id provided" };
  }
  if (!isSupabaseConfigured()) {
    return { noWork: true, reason: "Supabase not configured" };
  }

  const { data: prospectRow } = await supabase
    .from("prospects")
    .select(
      "id, business_name, owner_name, category, email, source, city, state, scraped_data",
    )
    .eq("id", prospectId)
    .maybeSingle();
  if (!prospectRow) {
    return { noWork: true, reason: `prospect ${prospectId.slice(0, 8)} not found` };
  }
  const prospect = prospectRow as unknown as ProspectRow;
  if (!prospect.email) {
    return { noWork: true, reason: `prospect ${prospect.business_name} has no email` };
  }

  // Most recent ready audit (no audit = no draft — drafts always cite
  // audit findings; skip the run rather than write a generic touch).
  const { data: auditRow } = await supabase
    .from("site_audits")
    .select("id, audit_content, metadata")
    .eq("prospect_id", prospectId)
    .eq("status", "ready")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!auditRow) {
    return {
      noWork: true,
      reason: `prospect ${prospect.business_name} has no completed audit yet`,
    };
  }
  const audit = auditRow as unknown as AuditRow;
  const audit_content = audit.audit_content || {};
  const meta = (audit.metadata || {}) as {
    ordersPerMonth?: string;
    runningAds?: string;
    biggestFrustration?: string;
    timeline?: string;
  };

  // Touch history: count of sent emails + check for any inbound replies.
  const [emailsRes, repliesRes] = await Promise.all([
    supabase
      .from("emails")
      .select("subject, sent_at")
      .eq("prospect_id", prospectId)
      .order("sent_at", { ascending: false })
      .limit(3),
    supabase
      .from("prospect_status_changes")
      .select("source, created_at, to_status")
      .eq("prospect_id", prospectId)
      .in("to_status", ["responded", "replied"])
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  type EmailRow = { subject: string | null; sent_at: string | null };
  type ReplyRow = { source: string | null; created_at: string };
  const emailsSent = (emailsRes.data || []) as EmailRow[];
  const replies = (repliesRes.data || []) as ReplyRow[];
  const hasInboundReply = replies.length > 0;

  // Stage detection
  let stage: "cold_first_touch" | "follow_up" | "reply_to_reply";
  if (hasInboundReply) {
    stage = "reply_to_reply";
  } else if (emailsSent.length === 0) {
    stage = "cold_first_touch";
  } else {
    stage = "follow_up";
  }

  // Owner first name from prospect.owner_name
  const firstName = (prospect.owner_name || "").trim().split(/\s+/)[0] || null;

  return {
    noWork: false,
    context: {
      prospect: {
        id: prospect.id,
        business_name: prospect.business_name,
        owner_first_name: firstName,
        category: prospect.category,
        source: prospect.source,
        city: prospect.city,
        state: prospect.state,
        current_website: (prospect.scraped_data as { currentWebsite?: string } | null)
          ?.currentWebsite,
      },
      audit: {
        id: audit.id,
        score: audit_content.overallScore ?? null,
        one_line_summary: audit_content.oneLineSummary || "",
        top_fix: (audit_content.prioritizedRoadmap || [])[0]?.title || null,
      },
      bant: {
        orders_per_month: meta.ordersPerMonth || null,
        running_ads: meta.runningAds || null,
        biggest_frustration: meta.biggestFrustration || null,
        timeline: meta.timeline || null,
      },
      touch_history: {
        emails_sent_count: emailsSent.length,
        last_email_subject: emailsSent[0]?.subject || null,
        last_email_at: emailsSent[0]?.sent_at || null,
        has_inbound_reply: hasInboundReply,
      },
      stage,
    },
  };
}

/** afterRun hook — persist the draft into the outbox + SMS Ben.
 *  Errors are logged but don't fail the skill run; the
 *  ai_skill_runs row is source of truth either way. */
async function afterRun(
  output: unknown,
  args: Record<string, unknown>,
): Promise<void> {
  const prospectId =
    typeof args["prospect_id"] === "string"
      ? args["prospect_id"]
      : typeof args.prospectId === "string"
        ? (args.prospectId as string)
        : null;
  if (!prospectId || !output || typeof output !== "object") return;
  const o = output as {
    subject?: string;
    body?: string;
    tone_notes?: string;
    reasoning?: string;
  };
  if (!o.body || !o.subject) return;

  const draft = await createOutboxDraft({
    prospectId,
    channel: "email",
    subject: o.subject,
    body: o.body,
    toneNotes: o.tone_notes,
    reasoning: o.reasoning,
  });
  if (!draft) return;

  // Pull business name for the SMS preview
  if (!isSupabaseConfigured()) return;
  const { data: p } = await supabase
    .from("prospects")
    .select("business_name")
    .eq("id", prospectId)
    .maybeSingle();
  const businessName = (p as { business_name?: string } | null)?.business_name || "prospect";
  await notifyOwnerOfDraft(draft, businessName);
}

export const draftTouchSkill: Skill = {
  manifest: {
    name: "draft-touch",
    description:
      "Per-prospect outreach drafter. Reads prospect + audit + touch history, picks the right funnel stage (cold / follow-up / reply-to-reply), writes a Ben-voice email draft, persists to outbox with a short-code, SMSes Ben 'Reply YES <code> to send'.",
    model: "claude-sonnet-4-6",
    maxTokensOut: 700,
    costCapPerRunUsd: 0.06,
    outputSchema: "embedded",
    visibility: "ben-only",
    // No emitSignal — notifyOwnerOfDraft (in afterRun) sends the SMS
    // with the preview + short code, which is richer than the generic
    // SMS_TARGETS pipe-through. Keeps the alert format tailored.
  },
  promptBody: PROMPT,
  outputSchema: OUTPUT_SCHEMA,
  gather,
  afterRun,
};
