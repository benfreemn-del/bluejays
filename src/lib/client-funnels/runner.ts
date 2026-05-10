/**
 * Client funnel runner — enrolls new leads + sends due steps.
 *
 * Idempotent: safe to run multiple times. The per-(lead, step, channel)
 * unique index on client_lead_messages prevents double-sends if the cron
 * fires while a previous run is still in flight.
 *
 * Run from /api/client-funnels/run (cron) or manually from the dashboard.
 *
 * Lifecycle:
 *   not_enrolled  → runner picks it up, fires day=0 step → enrolled
 *   enrolled      → runner sends each step on/after its day_offset
 *   responded     → runner skips (set by inbound reply handlers)
 *   paused        → runner skips (set manually by Ben in dashboard)
 *   completed     → runner skips (last step has been sent)
 *   converted     → runner skips (lead converted to a sale)
 */

import { getSupabase } from "../supabase";
import {
  type ClientLead,
  type ClientLeadAudience,
} from "../client-leads";
import {
  getClientFunnelConfig,
  type ClientFunnelConfig,
} from "./registry";
import type {
  AudienceFunnel,
  FunnelChannelTouch,
  FunnelStep,
} from "./zenith-sports";
import {
  sendClientLeadEmail,
  sendClientLeadSms,
  logVoicemailDrop,
} from "./sender";

/** Per-run summary returned to the caller (cron or dashboard). */
export type RunSummary = {
  client_slug: string;
  enrolled: number;
  steps_sent: number;
  steps_skipped: number;
  errors: { lead_id: string; step: number; channel: string; error: string }[];
};

/** Variable substitution map applied to subjects + bodies before sending. */
function substitutions(lead: ClientLead): Record<string, string> {
  const firstName =
    (lead.name?.trim().split(/\s+/)[0] || "there").replace(/[<>]/g, "");
  const phone = (lead.phone || "").trim();
  const base: Record<string, string> = {
    name: lead.name ?? firstName,
    firstName,
    phone,
  };

  // Per-slug merge tags — funnel templates reference {{bookingUrl}} /
  // {{partnersUrl}} / {{calculatorUrl}} / etc. and the right URL
  // resolves based on which client_slug the lead belongs to.
  if (lead.client_slug === "olympic-inspections") {
    base.bookingUrl = "https://www.olympicinspect.com/#book";
    base.calculatorUrl = "https://www.olympicinspect.com/#calculator";
    base.partnersUrl = "https://www.olympicinspect.com/#partners";
    base.contactUrl = "https://www.olympicinspect.com/#contact";
    // Old quizUrl alias — funnel copy migrated 2026-05-09 but keep
    // backward compatibility so historical templates still resolve.
    base.quizUrl = base.calculatorUrl;
    return base;
  }

  // Zenith default (legacy — keeps the existing funnel resolving
  // unchanged for the soccer tenant).
  base.shopUrl = "https://bluejayportfolio.com/clients/zenith-sports/shop";
  base.trainingUrl = "https://bluejayportfolio.com/clients/zenith-sports#training";
  base.contactUrl = "https://bluejayportfolio.com/clients/zenith-sports#contact";
  base.campsUrl = "https://bluejayportfolio.com/clients/zenith-sports/camps";
  base.coachGuideUrl =
    "https://bluejayportfolio.com/clients/zenith-sports/training-guide";
  base.builderUrl =
    "https://bluejayportfolio.com/clients/zenith-sports/build-your-player";
  return base;
}

/** Stable per-lead variant assignment. Same lead.id always maps to the
 *  same index — critical for analytics integrity (a lead retried after
 *  a transient error must land on the same variant they would have
 *  originally received). djb2-style hash → modulo. */
function hashIndex(input: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return Math.abs(h) % mod;
}

function fillTemplate(s: string, vars: Record<string, string>): string {
  return s.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`);
}

/* ──────────────────────────── ENROLLMENT ──────────────────────────── */

/**
 * Find leads that should be enrolled and flip them to enrolled. Doesn't
 * actually send the day=0 step here — that runs in the next pass via
 * sendDueSteps. Splitting enrollment from sending makes the runner
 * crash-safe.
 *
 * Eligible:
 *   funnel_status = 'not_enrolled'
 *   audience_segment IS NOT NULL    (manual review handles unknowns)
 *   client has a registered funnel  (see registry.ts)
 *   audience has a defined funnel   (e.g. "club" has none for Zenith)
 */
async function enrollEligibleLeads(clientSlug: string): Promise<number> {
  const cfg = getClientFunnelConfig(clientSlug);
  if (!cfg) return 0;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("client_leads")
    .select("*")
    .eq("client_slug", clientSlug)
    .eq("funnel_status", "not_enrolled")
    .not("audience_segment", "is", null);
  if (error) throw new Error(`enrollEligibleLeads: ${error.message}`);

  const leads = (data ?? []) as ClientLead[];
  let enrolled = 0;
  for (const lead of leads) {
    const funnel = cfg.getFunnel(lead.audience_segment);
    if (!funnel) continue; // audience has no funnel (eg. club)
    const { error: upErr } = await sb
      .from("client_leads")
      .update({ funnel_status: "enrolled", funnel_step: 0 })
      .eq("id", lead.id);
    if (upErr) throw new Error(`enroll update: ${upErr.message}`);
    enrolled += 1;
  }
  return enrolled;
}

/* ────────────────────────── DUE-STEP DELIVERY ────────────────────────── */

/** Days elapsed between two ISO timestamps. Floors. */
function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

async function alreadySentStep(
  leadId: string,
  step: number,
  channel: "email" | "sms" | "voicemail",
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("client_lead_messages")
    .select("id")
    .eq("lead_id", leadId)
    .eq("funnel_step", step)
    .eq("channel", channel)
    .eq("direction", "outbound")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`alreadySentStep: ${error.message}`);
  return !!data;
}

/**
 * Process all enrolled leads for one client. For each, find the next
 * step they haven't sent yet whose day_offset is reached, and send it.
 */
async function sendDueSteps(
  clientSlug: string,
  summary: RunSummary,
): Promise<void> {
  const cfg = getClientFunnelConfig(clientSlug);
  if (!cfg) return;

  const sb = getSupabase();
  const { data, error } = await sb
    .from("client_leads")
    .select("*")
    .eq("client_slug", clientSlug)
    .eq("funnel_status", "enrolled");
  if (error) throw new Error(`sendDueSteps fetch: ${error.message}`);

  const leads = (data ?? []) as ClientLead[];
  const now = new Date().toISOString();

  for (const lead of leads) {
    const funnel = cfg.getFunnel(lead.audience_segment);
    if (!funnel) continue;

    const enrolledAt = lead.enrolled_at ?? lead.created_at;
    const daysSince = daysBetween(enrolledAt, now);

    // Find the first step whose day_offset <= daysSince that we haven't
    // fully delivered yet (every channel sent or skipped).
    let lastDeliveredStep = -1;
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      if (step.day > daysSince) break;
      // Has every channel for this step already been logged?
      const allSent = await Promise.all(
        step.channels.map((c) => alreadySentStep(lead.id, i, c.channel)),
      );
      if (allSent.every(Boolean)) {
        lastDeliveredStep = i;
        continue;
      }
      // We're going to (try to) send this step now.
      await deliverStep(cfg, lead, funnel, i, step, summary);
      lastDeliveredStep = i;
      break; // one step per lead per run — keeps cadence honest
    }

    // If we just delivered the final step, mark completed.
    if (
      lastDeliveredStep === funnel.steps.length - 1 &&
      lead.funnel_status !== "completed"
    ) {
      const { error: upErr } = await sb
        .from("client_leads")
        .update({ funnel_status: "completed", funnel_step: lastDeliveredStep })
        .eq("id", lead.id);
      if (upErr) throw new Error(`complete update: ${upErr.message}`);
    } else if (lastDeliveredStep > (lead.funnel_step ?? -1)) {
      const { error: upErr } = await sb
        .from("client_leads")
        .update({
          funnel_step: lastDeliveredStep,
          last_contact_at: now,
        })
        .eq("id", lead.id);
      if (upErr) throw new Error(`step update: ${upErr.message}`);
    }
  }
}

async function deliverStep(
  cfg: ClientFunnelConfig,
  lead: ClientLead,
  funnel: AudienceFunnel,
  stepIndex: number,
  step: FunnelStep,
  summary: RunSummary,
): Promise<void> {
  const vars = substitutions(lead);

  for (const touch of step.channels) {
    // Idempotency check (handles parallel runs colliding within the
    // tiny window between alreadySentStep and the actual send).
    if (await alreadySentStep(lead.id, stepIndex, touch.channel)) continue;

    try {
      await deliverTouch(cfg, lead, funnel, stepIndex, touch, vars);
      summary.steps_sent += 1;
    } catch (err) {
      summary.errors.push({
        lead_id: lead.id,
        step: stepIndex,
        channel: touch.channel,
        error: err instanceof Error ? err.message : "unknown",
      });
      // Log a failed message so the dashboard timeline shows it.
      await getSupabase()
        .from("client_lead_messages")
        .insert([
          {
            lead_id: lead.id,
            client_slug: cfg.label, // for dedupe + display
            funnel_step: stepIndex,
            channel: touch.channel,
            direction: "outbound",
            template_id: touch.templateId,
            status: "failed",
            error: err instanceof Error ? err.message : "unknown",
          },
        ]);
    }
  }
}

async function deliverTouch(
  cfg: ClientFunnelConfig,
  lead: ClientLead,
  funnel: AudienceFunnel,
  stepIndex: number,
  touch: FunnelChannelTouch,
  vars: Record<string, string>,
): Promise<void> {
  if (touch.channel === "email") {
    if (!lead.email) {
      await markSkipped(lead, stepIndex, "email", touch.templateId, "no email on file");
      return;
    }
    // Pick A/B variant deterministically per lead. Hash on lead.id so
    // every retry of the same step routes to the same variant — keeps
    // the per-variant analytics clean.
    const v =
      touch.variants && touch.variants.length > 0
        ? touch.variants[hashIndex(lead.id, touch.variants.length)]!
        : null;
    await sendClientLeadEmail({
      lead,
      stepIndex,
      templateId: touch.templateId,
      variantId: v?.id ?? null,
      subject: fillTemplate(v?.subject ?? touch.subject, vars),
      body: fillTemplate(v?.body ?? touch.body, vars),
      sender: cfg.sender,
    });
  } else if (touch.channel === "sms") {
    if (!lead.phone) {
      await markSkipped(lead, stepIndex, "sms", touch.templateId, "no phone on file");
      return;
    }
    if (!cfg.sms.from) {
      await markSkipped(
        lead,
        stepIndex,
        "sms",
        touch.templateId,
        "no Twilio number provisioned for client yet",
      );
      return;
    }
    const v =
      touch.variants && touch.variants.length > 0
        ? touch.variants[hashIndex(lead.id, touch.variants.length)]!
        : null;
    await sendClientLeadSms({
      lead,
      stepIndex,
      templateId: touch.templateId,
      variantId: v?.id ?? null,
      body: fillTemplate(v?.body ?? touch.body, vars),
      fromNumber: cfg.sms.from,
    });
  } else {
    // Voicemail — log only until Twilio + recordings exist.
    await logVoicemailDrop({
      lead,
      stepIndex,
      templateId: touch.templateId,
      scriptHint: touch.scriptHint,
      mediaUrl: touch.mediaUrl,
    });
    void funnel; // mark used (lint placeholder — funnel may inform clip selection later)
  }
}

async function markSkipped(
  lead: ClientLead,
  stepIndex: number,
  channel: "email" | "sms" | "voicemail",
  templateId: string,
  reason: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("client_lead_messages")
    .insert([
      {
        lead_id: lead.id,
        client_slug: lead.client_slug,
        funnel_step: stepIndex,
        channel,
        direction: "outbound",
        template_id: templateId,
        status: "skipped",
        error: reason,
      },
    ]);
  if (error)
    console.error(`[client-funnel] skipped-log insert failed:`, error.message);
}

/* ──────────────────────────── PUBLIC ──────────────────────────── */

export async function runClientFunnel(clientSlug: string): Promise<RunSummary> {
  const summary: RunSummary = {
    client_slug: clientSlug,
    enrolled: 0,
    steps_sent: 0,
    steps_skipped: 0,
    errors: [],
  };
  summary.enrolled = await enrollEligibleLeads(clientSlug);
  await sendDueSteps(clientSlug, summary);
  return summary;
}

/** Run for every client that has a funnel registered. Used by cron. */
export async function runAllClientFunnels(): Promise<RunSummary[]> {
  const summaries: RunSummary[] = [];
  // Delayed import to avoid a require-cycle if the registry grows.
  const { CLIENT_FUNNELS } = await import("./registry");
  for (const slug of Object.keys(CLIENT_FUNNELS)) {
    try {
      summaries.push(await runClientFunnel(slug));
    } catch (err) {
      summaries.push({
        client_slug: slug,
        enrolled: 0,
        steps_sent: 0,
        steps_skipped: 0,
        errors: [
          {
            lead_id: "(top-level)",
            step: -1,
            channel: "n/a",
            error: err instanceof Error ? err.message : "unknown",
          },
        ],
      });
    }
  }
  return summaries;
}

// Re-export for the audience type so tests don't need to import deeper.
export type { ClientLeadAudience };
