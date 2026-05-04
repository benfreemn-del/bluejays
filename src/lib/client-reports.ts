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
    new_this_week: number;
    delta_vs_prior_week: number;          // simple int delta
  };

  funnel: {
    enrolled: number;
    responded: number;
    converted: number;
    completed: number;
    response_rate_pct: number;            // responded / total leads
    conversion_rate_pct: number;          // converted / total leads
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

  /* Leads */
  const { data: leadsAll } = await sb
    .from("client_leads")
    .select("audience_segment, funnel_status, created_at")
    .eq("client_slug", clientSlug);
  const leads = leadsAll ?? [];

  const newThisWeek = leads.filter(
    (l) => new Date(l.created_at as string) >= start,
  );
  const newPriorWeek = leads.filter((l) => {
    const t = new Date(l.created_at as string);
    return t >= priorStart && t < start;
  });

  const byAudience: Record<string, number> = {};
  for (const l of leads) {
    const a = (l.audience_segment as string) ?? "untagged";
    byAudience[a] = (byAudience[a] ?? 0) + 1;
  }

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
    highlights.push(
      `${newThisWeek.length} new leads this week (${newPriorWeek.length} prior week — Δ ${newThisWeek.length - newPriorWeek.length}).`,
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

  return {
    client_slug: clientSlug,
    period: { start: start.toISOString(), end: end.toISOString() },
    leads: {
      total: leads.length,
      byAudience,
      new_this_week: newThisWeek.length,
      delta_vs_prior_week: newThisWeek.length - newPriorWeek.length,
    },
    funnel: {
      enrolled,
      responded,
      converted,
      completed,
      response_rate_pct: (responded / totalLeads) * 100,
      conversion_rate_pct: (converted / totalLeads) * 100,
    },
    messages: {
      sent,
      failed,
      skipped,
      by_channel: byChannel,
    },
    ads,
    affiliates,
    highlights,
    next_actions,
  };
}
