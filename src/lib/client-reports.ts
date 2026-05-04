/**
 * client-reports — generate weekly performance digests for AI-package clients.
 *
 * Sprint 4.3 of the buildout. Aggregates last-7-days metrics across:
 *   - client_leads (volume by audience, conversion rate)
 *   - client_lead_messages (sends by channel, reply rate, skip rate)
 *   - client_ad_creatives (live ad count, impressions/clicks if synced)
 *   - client_affiliates (pipeline movement)
 *
 * Output is plain JSON consumed by:
 *   - /dashboard/clients/[slug]/reports — live weekly digest UI
 *   - The cron job that emails Ben + the client a PDF/HTML version
 */

import { getSupabase } from "./supabase";

export type WeeklyReport = {
  client_slug: string;
  period: { start: string; end: string };

  leads: {
    total: number;
    byAudience: Record<string, number>;
    bySource: Record<string, number>;     // where leads came from
    byIntent: Record<string, number>;     // what they wanted
    new_this_week: number;
    delta_vs_prior_week: number;
    /** Estimated $ pipeline value: leads × est conv % × est AOV. */
    pipeline_value_usd: number;
    /** Last-90-day weekly trend (oldest first). */
    weekly_trend: { week: string; count: number }[];
  };

  /** When in the day/week leads come in. */
  patterns: {
    by_hour: number[];                    // 24-element array (UTC hour)
    by_day_of_week: number[];             // 7-element array (Sun-Sat)
    busiest_hour: number;
    busiest_day: number;
  };

  funnel: {
    enrolled: number;
    responded: number;
    converted: number;
    completed: number;
    response_rate_pct: number;
    conversion_rate_pct: number;
    /** Avg hours from lead-in to first response. */
    avg_response_time_hours: number | null;
    /** Top performing template_id by reply rate. */
    top_template: { id: string; sends: number; replies: number; rate_pct: number } | null;
  };

  messages: {
    sent: number;
    failed: number;
    skipped: number;
    by_channel: Record<string, number>;
  };

  ads: {
    live: number;
    draft: number;
    impressions: number;
    clicks: number;
    spend_cents: number;
    ctr_pct: number;
  } | null;

  affiliates: {
    total: number;
    contacted_this_week: number;
    onboarded_this_week: number;
    by_status: Record<string, number>;
  } | null;

  /** Leads that need owner attention (responded but not converted/handled). */
  action_required: {
    id: string;
    name: string | null;
    audience: string | null;
    intent: string | null;
    days_since_response: number;
  }[];

  highlights: string[];                   // human-friendly bullets
  next_actions: string[];                 // suggested optimizations
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function generateWeeklyReport(
  clientSlug: string,
  opts: { endDate?: Date } = {},
): Promise<WeeklyReport> {
  const end = opts.endDate ?? new Date();
  const start = new Date(end.getTime() - WEEK_MS);
  const priorStart = new Date(start.getTime() - WEEK_MS);

  const sb = getSupabase();

  /* Leads — full set including source/intent/responded_at for the new
     business-owner metrics. */
  const { data: leadsAll } = await sb
    .from("client_leads")
    .select("id, name, audience_segment, funnel_status, created_at, source, intent, responded_at")
    .eq("client_slug", clientSlug);
  const leads = (leadsAll ?? []) as {
    id: string;
    name: string | null;
    audience_segment: string | null;
    funnel_status: string;
    created_at: string;
    source: string | null;
    intent: string | null;
    responded_at: string | null;
  }[];

  const newThisWeek = leads.filter(
    (l) => new Date(l.created_at as string) >= start,
  );
  const newPriorWeek = leads.filter((l) => {
    const t = new Date(l.created_at as string);
    return t >= priorStart && t < start;
  });

  const byAudience: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  for (const l of leads) {
    const a = l.audience_segment ?? "untagged";
    byAudience[a] = (byAudience[a] ?? 0) + 1;
    if (l.source) bySource[l.source] = (bySource[l.source] ?? 0) + 1;
    if (l.intent) byIntent[l.intent] = (byIntent[l.intent] ?? 0) + 1;
  }

  // Pipeline value estimate. Tunable assumptions per audience.
  // Parents → ~$60 AOV (one ball), Coaches → ~$600 (bulk roster order),
  // Players → ~$75 (ball + grip socks). Assumed conv rates baked in.
  const PIPELINE_PER_AUDIENCE: Record<string, number> = {
    parent: 60 * 0.08,    // $4.80 expected per parent lead
    coach: 600 * 0.05,    // $30 expected per coach lead
    player: 75 * 0.06,    // $4.50 expected per player lead
    club: 1500 * 0.04,    // $60 expected per club lead
    unknown: 50 * 0.05,
  };
  const pipeline_value_usd = leads.reduce((sum, l) => {
    const k = l.audience_segment ?? "unknown";
    return sum + (PIPELINE_PER_AUDIENCE[k] ?? PIPELINE_PER_AUDIENCE.unknown);
  }, 0);

  // Weekly trend — last 13 weeks (90 days) of lead counts
  const trendStart = new Date(end.getTime() - 13 * WEEK_MS);
  const weekly_trend: { week: string; count: number }[] = [];
  for (let i = 0; i < 13; i++) {
    const wStart = new Date(trendStart.getTime() + i * WEEK_MS);
    const wEnd = new Date(wStart.getTime() + WEEK_MS);
    const count = leads.filter((l) => {
      const t = new Date(l.created_at);
      return t >= wStart && t < wEnd;
    }).length;
    weekly_trend.push({
      week: wStart.toISOString().slice(0, 10),
      count,
    });
  }

  // Time-of-day + day-of-week patterns (across all leads, not just this week
  // — gives a stable signal even for early-stage clients).
  const by_hour = Array(24).fill(0) as number[];
  const by_day_of_week = Array(7).fill(0) as number[];
  for (const l of leads) {
    const d = new Date(l.created_at);
    by_hour[d.getUTCHours()] += 1;
    by_day_of_week[d.getUTCDay()] += 1;
  }
  const busiest_hour = by_hour.indexOf(Math.max(...by_hour));
  const busiest_day = by_day_of_week.indexOf(Math.max(...by_day_of_week));

  // Action-required: leads that responded but haven't been converted/handled.
  // Sorted by oldest response first (most-stale first).
  const now = end.getTime();
  const action_required = leads
    .filter((l) => l.funnel_status === "responded" && l.responded_at)
    .map((l) => ({
      id: l.id,
      name: l.name,
      audience: l.audience_segment,
      intent: l.intent,
      days_since_response: Math.max(
        0,
        Math.floor((now - new Date(l.responded_at!).getTime()) / (24 * 60 * 60 * 1000)),
      ),
    }))
    .sort((a, b) => b.days_since_response - a.days_since_response)
    .slice(0, 10);

  const fStatus: Record<string, number> = {};
  for (const l of leads) {
    const s = (l.funnel_status as string) ?? "not_enrolled";
    fStatus[s] = (fStatus[s] ?? 0) + 1;
  }
  const totalLeads = leads.length || 1;
  const enrolled = (fStatus["enrolled"] ?? 0) + (fStatus["responded"] ?? 0) + (fStatus["converted"] ?? 0) + (fStatus["completed"] ?? 0);
  const responded = (fStatus["responded"] ?? 0) + (fStatus["converted"] ?? 0);
  const converted = fStatus["converted"] ?? 0;
  const completed = fStatus["completed"] ?? 0;

  /* Messages this week */
  const { data: msgs } = await sb
    .from("client_lead_messages")
    .select("channel, direction, status, sent_at")
    .eq("client_slug", clientSlug)
    .gte("sent_at", start.toISOString());
  const messages = (msgs ?? []) as {
    channel: string;
    direction: string;
    status: string;
  }[];
  const sent = messages.filter(
    (m) => m.direction === "outbound" && m.status === "sent",
  ).length;
  const failed = messages.filter((m) => m.status === "failed").length;
  const skipped = messages.filter((m) => m.status === "skipped").length;
  const byChannel: Record<string, number> = {};
  for (const m of messages) {
    if (m.direction !== "outbound") continue;
    byChannel[m.channel] = (byChannel[m.channel] ?? 0) + 1;
  }

  /* Avg response time + top template — needs the full message history,
     not just this week. */
  const { data: allMsgs } = await sb
    .from("client_lead_messages")
    .select("lead_id, template_id, direction, status, sent_at")
    .eq("client_slug", clientSlug);
  const allMessages = (allMsgs ?? []) as {
    lead_id: string;
    template_id: string | null;
    direction: string;
    status: string;
    sent_at: string;
  }[];

  // Avg hours from FIRST outbound to FIRST inbound per lead.
  const responseTimes: number[] = [];
  const leadFirstOut = new Map<string, string>();
  for (const m of allMessages) {
    if (m.direction !== "outbound") continue;
    if (m.status !== "sent" && m.status !== "delivered") continue;
    const cur = leadFirstOut.get(m.lead_id);
    if (!cur || m.sent_at < cur) leadFirstOut.set(m.lead_id, m.sent_at);
  }
  for (const m of allMessages) {
    if (m.direction !== "inbound") continue;
    const out = leadFirstOut.get(m.lead_id);
    if (!out) continue;
    const hours =
      (new Date(m.sent_at).getTime() - new Date(out).getTime()) /
      (60 * 60 * 1000);
    if (hours >= 0) responseTimes.push(hours);
  }
  const avg_response_time_hours =
    responseTimes.length > 0
      ? responseTimes.reduce((s, h) => s + h, 0) / responseTimes.length
      : null;

  // Top template — sends per template_id + reply rate.
  type TplStat = { sends: number; replies: number };
  const tplStats = new Map<string, TplStat>();
  const tplLeads = new Map<string, Set<string>>();
  for (const m of allMessages) {
    if (m.direction !== "outbound" || !m.template_id) continue;
    if (m.status !== "sent" && m.status !== "delivered") continue;
    if (!tplStats.has(m.template_id)) tplStats.set(m.template_id, { sends: 0, replies: 0 });
    tplStats.get(m.template_id)!.sends += 1;
    if (!tplLeads.has(m.template_id)) tplLeads.set(m.template_id, new Set());
    tplLeads.get(m.template_id)!.add(m.lead_id);
  }
  const repliedLeadIds = new Set(
    allMessages.filter((m) => m.direction === "inbound").map((m) => m.lead_id),
  );
  for (const [tplId, leadSet] of tplLeads) {
    tplStats.get(tplId)!.replies = Array.from(leadSet).filter((id) =>
      repliedLeadIds.has(id),
    ).length;
  }
  let top_template: WeeklyReport["funnel"]["top_template"] = null;
  for (const [id, s] of tplStats) {
    if (s.sends < 3) continue; // need minimum sample
    const rate = (s.replies / s.sends) * 100;
    if (!top_template || rate > top_template.rate_pct) {
      top_template = { id, sends: s.sends, replies: s.replies, rate_pct: rate };
    }
  }

  /* Ads (optional — table may not exist if migration not run yet) */
  let ads: WeeklyReport["ads"] = null;
  try {
    const { data: adRows } = await sb
      .from("client_ad_creatives")
      .select("status, impressions, clicks, spend_cents")
      .eq("client_slug", clientSlug);
    if (adRows) {
      const live = adRows.filter((r) => r.status === "live").length;
      const draft = adRows.filter((r) => r.status === "draft").length;
      const impressions = adRows.reduce(
        (s, r) => s + ((r.impressions as number) ?? 0),
        0,
      );
      const clicks = adRows.reduce(
        (s, r) => s + ((r.clicks as number) ?? 0),
        0,
      );
      const spend_cents = adRows.reduce(
        (s, r) => s + ((r.spend_cents as number) ?? 0),
        0,
      );
      ads = {
        live,
        draft,
        impressions,
        clicks,
        spend_cents,
        ctr_pct: impressions > 0 ? (clicks / impressions) * 100 : 0,
      };
    }
  } catch {
    // ads table missing is fine — report just omits the section.
  }

  /* Affiliates (optional — same pattern) */
  let affiliates: WeeklyReport["affiliates"] = null;
  try {
    const { data: aff } = await sb
      .from("client_affiliates")
      .select("status, last_contacted_at, onboarded_at")
      .eq("client_slug", clientSlug);
    if (aff) {
      const byStatus: Record<string, number> = {};
      for (const a of aff) {
        byStatus[a.status as string] = (byStatus[a.status as string] ?? 0) + 1;
      }
      const contacted_this_week = aff.filter((a) => {
        const t = a.last_contacted_at as string | null;
        return t && new Date(t) >= start;
      }).length;
      const onboarded_this_week = aff.filter((a) => {
        const t = a.onboarded_at as string | null;
        return t && new Date(t) >= start;
      }).length;
      affiliates = {
        total: aff.length,
        contacted_this_week,
        onboarded_this_week,
        by_status: byStatus,
      };
    }
  } catch {
    // affiliates table missing is fine.
  }

  /* Highlights + suggested actions */
  const highlights: string[] = [];
  const next_actions: string[] = [];

  if (newThisWeek.length > 0) {
    const wk = newThisWeek.length;
    const prev = newPriorWeek.length;
    const delta = wk - prev;
    highlights.push(
      `${wk} new lead${wk === 1 ? "" : "s"} this week (${prev} prior — Δ ${delta >= 0 ? "+" : ""}${delta}).`,
    );
  } else {
    highlights.push(`No new leads this week.`);
    next_actions.push(
      `Lead volume is dry. Audit the homepage CTA placement + check whether any Meta/Google ads are paused.`,
    );
  }

  if (responded > 0) {
    const rate = (responded / Math.max(enrolled, 1)) * 100;
    highlights.push(
      `${responded} leads responded (${rate.toFixed(1)}% of enrolled).`,
    );
  }

  if (skipped > 0) {
    highlights.push(`${skipped} sends skipped (likely missing phone for SMS or Twilio not provisioned).`);
    next_actions.push(`Check the skip log — most skips during launch = waiting on Twilio number.`);
  }

  if (ads && ads.live === 0 && ads.draft > 0) {
    next_actions.push(
      `${ads.draft} ad drafts ready but none live. Push the highest-fit-score variants to Meta/Google.`,
    );
  }

  if (affiliates && affiliates.contacted_this_week === 0 && affiliates.total > 0) {
    next_actions.push(
      `Affiliate pipeline has ${affiliates.total} prospects but zero outreach this week. Pick the top 5 by fit_score.`,
    );
  }

  // Add a few highlight sentences using the new metrics so owners see
  // the story even if they don't dig into the data themselves.
  if (top_template) {
    highlights.push(
      `Best-performing template: ${top_template.id} (${top_template.rate_pct.toFixed(1)}% reply rate over ${top_template.sends} sends).`,
    );
  }
  if (action_required.length > 0) {
    highlights.push(
      `${action_required.length} lead${action_required.length === 1 ? "" : "s"} responded but ${action_required.length === 1 ? "is" : "are"} awaiting follow-up.`,
    );
  }
  if (Object.keys(bySource).length > 0) {
    // Friendly source labels — matches SOURCE_LABEL in the portal page
    // so highlights read like a human wrote them.
    const sourceLabel: Record<string, string> = {
      "main-inquiry-form": "Contact form",
      "email-capture": "Email capture",
      "lead-gen-builder": "Build Your Player",
      "missed-call-text": "Missed call",
    };
    const topSrc = Object.entries(bySource).sort((a, b) => b[1] - a[1])[0];
    const label = sourceLabel[topSrc[0]] ?? topSrc[0];
    highlights.push(
      `Top lead source: ${label} (${topSrc[1]} of ${leads.length} leads).`,
    );
  }
  if (avg_response_time_hours !== null) {
    const h = avg_response_time_hours;
    const display = h < 1 ? `${Math.round(h * 60)} min` : `${h.toFixed(1)} hrs`;
    highlights.push(`Average response time: ${display}.`);
  }
  if (action_required.length > 0) {
    next_actions.push(
      `Follow up on ${action_required.length} responded lead${action_required.length === 1 ? "" : "s"} (oldest: ${action_required[0].days_since_response} days). Open the Leads tab to action.`,
    );
  }

  return {
    client_slug: clientSlug,
    period: { start: start.toISOString(), end: end.toISOString() },
    leads: {
      total: leads.length,
      byAudience,
      bySource,
      byIntent,
      new_this_week: newThisWeek.length,
      delta_vs_prior_week: newThisWeek.length - newPriorWeek.length,
      pipeline_value_usd,
      weekly_trend,
    },
    patterns: {
      by_hour,
      by_day_of_week,
      busiest_hour,
      busiest_day,
    },
    funnel: {
      enrolled,
      responded,
      converted,
      completed,
      response_rate_pct: (responded / totalLeads) * 100,
      conversion_rate_pct: (converted / totalLeads) * 100,
      avg_response_time_hours,
      top_template,
    },
    messages: {
      sent,
      failed,
      skipped,
      by_channel: byChannel,
    },
    ads,
    affiliates,
    action_required,
    highlights,
    next_actions,
  };
}
