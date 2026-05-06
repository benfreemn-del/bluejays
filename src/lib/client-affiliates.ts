/**
 * client-affiliates — DB helpers + scoring + cold-email templates for the
 * per-client affiliate pipeline. Sprint 4 of the AI-package.
 */

import { getSupabase } from "./supabase";

export type AffiliateStatus =
  | "cold"
  | "queued"
  | "contacted"
  | "replied"
  | "onboarded"
  | "declined"
  | "do-not-contact";

export type AffiliateChannel =
  // Zenith Sports / soccer channels
  | "club"
  | "coach"
  | "influencer"
  | "podcast"
  | "media"
  | "parent-group"
  // Olympic Inspections / inspector-business channels
  | "realtor"
  | "insurance"
  | "remediation"
  | "restoration";

export type ClientAffiliate = {
  id: string;
  client_slug: string;
  contact_name: string | null;
  org_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  channel: AffiliateChannel | null;
  fit_score: number;
  status: AffiliateStatus;
  last_contacted_at: string | null;
  contact_count: number;
  responded_at: string | null;
  onboarded_at: string | null;
  notes: string | null;
  source: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/* ─────────────────────── SCORING ───────────────────────
 * Quick fit score for prioritization. 0–100. Higher = better.
 * Per-client logic since the right affiliate looks different by industry.
 */

export function scoreAffiliate(
  clientSlug: string,
  candidate: Partial<ClientAffiliate>,
): number {
  if (clientSlug !== "zenith-sports") return 50;

  let score = 50;

  // Channel-based weighting
  if (candidate.channel === "coach") score += 25;
  if (candidate.channel === "club") score += 20;
  if (candidate.channel === "podcast") score += 15;
  if (candidate.channel === "influencer") score += 10;
  if (candidate.channel === "parent-group") score += 5;

  // Role context — tier ladder from brand voice doc
  const role = (candidate.role ?? "").toLowerCase();
  if (/director of coaching|doc|technical director/.test(role)) score += 15;
  if (/head coach/.test(role)) score += 10;
  if (/assistant coach/.test(role)) score += 3;

  // Geo proximity to Zenith HQ (Pacific NW = warm intro territory)
  if (candidate.region === "Pacific NW") score += 10;
  if (candidate.state === "WA" || candidate.state === "OR") score += 5;

  // Org name signals
  const org = (candidate.org_name ?? "").toLowerCase();
  if (/ecnl|mls next|academy/.test(org)) score += 10;
  if (/youth|select|premier/.test(org)) score += 3;

  // Contact info available bumps reach-ability
  if (candidate.email) score += 3;
  if (candidate.phone) score += 2;

  return Math.max(0, Math.min(100, score));
}

/* ─────────────────────── COLD-EMAIL TEMPLATES ───────────────────────
 * Per-channel pitch. Variables substituted at send time.
 */

export type ColdEmailTemplate = {
  channel: AffiliateChannel;
  subject: string;
  body: string;
};

const ZENITH_TEMPLATES: ColdEmailTemplate[] = [
  {
    channel: "club",
    subject:
      "{{firstName}} — TEKKY® demo for {{org}}? (Coach-credible, not influencer-first)",
    body: `Hi {{firstName}},

I'm Philip — co-founder of Zenith Sports. We make TEKKY®, a patent-pending technical training ball used by ECNL and MLS Next clubs to fix the touch gap U.S. youth soccer keeps producing.

Quick ask: would you be open to a 30-min club demo? Free, no pitch — I'll walk you through the methodology, leave you with the coaching guide PDF, and ship you 3 balls to try with your roster on us.

If TEKKY makes sense for {{org}}, we run a club affiliate program — your roster orders direct, you get a kickback per ball + bulk discount.

Reply if you're game. If not, no worries — I'll ship you the guide regardless: {{coachGuideUrl}}

— Philip
Zenith Sports / TEKKY®`,
  },
  {
    channel: "coach",
    subject: "{{firstName}} — quick ask from a fellow coach",
    body: `Hi {{firstName}},

Coach to coach. I built TEKKY® (patent-pending youth training ball) because I got tired of watching U.S. youth players lose technical ground to European peers.

If you'd take a look at the drill library + coaching guide, I'd be honored: {{coachGuideUrl}}

If it resonates, I'd love to send you a couple balls to try with your players, on us. We have an affiliate kickback for coaches whose players order direct.

— Philip
Zenith Sports / TEKKY®`,
  },
  {
    channel: "influencer",
    subject: "{{firstName}} — TEKKY® collab idea",
    body: `Hey {{firstName}},

Saw your work — quality content. I run Zenith Sports / TEKKY® (patent-pending training ball, growing fast in ECNL + MLS Next club ecosystems).

We're doing one collab a week with credible voices in the youth space. Format: you train with the ball for 2 weeks (we ship it free), then post the BAE moment (Before/After switching to a regulation ball). Affiliate code earns you per-sale revenue + we feature you on @ZenithSports.

Worth a chat?

— Philip`,
  },
  {
    channel: "podcast",
    subject: "Guest pitch — building a youth-soccer training tool",
    body: `Hi {{firstName}},

Long-time listener. I'm Philip — co-founder of Zenith Sports, makers of the TEKKY® ball (patent-pending technical training tool, ECNL + MLS Next traction).

Pitch: 30-min episode on the U.S. youth-soccer development gap, the European methodology, and how a tweaked piece of equipment changes player outcomes. I bring the methodology + data + a free TEKKY ball for the show host's player.

Worth exploring?

— Philip`,
  },
  {
    channel: "media",
    subject: "Story idea: U.S. youth soccer's missing technical layer",
    body: `Hi {{firstName}},

Story angle for {{org}}: why U.S. youth soccer keeps producing physical, athletic players who can't compete at the European technical level — and a Tokyo-via-Pacific-NW startup tackling it with a smaller, weighted training ball.

I'm Philip Lund, co-founder of Zenith Sports / TEKKY® (patent-pending). Ex-academy coach, 12 years in U.S. youth dev. Happy to share data, founder story, on-pitch demo footage.

Available this week or next.

— Philip`,
  },
  {
    channel: "parent-group",
    subject: "{{firstName}} — TEKKY® discount for {{org}}",
    body: `Hi {{firstName}},

I'm Philip @ TEKKY® — patent-pending youth training ball. We work with parent groups + booster clubs by offering a flat 15% group discount on roster orders.

If {{org}} would put us in front of your community, I'm happy to set up a code, ship a sample to your team rep, and donate $1 per order to your booster fund.

Worth a chat?

— Philip
Zenith Sports`,
  },
];

export function getColdEmailTemplate(
  clientSlug: string,
  channel: AffiliateChannel,
): ColdEmailTemplate | null {
  if (clientSlug !== "zenith-sports") return null;
  return ZENITH_TEMPLATES.find((t) => t.channel === channel) ?? null;
}

/* ─────────────────────── DB OPS ─────────────────────── */

export async function listAffiliates(
  clientSlug: string,
  opts: { status?: AffiliateStatus; channel?: AffiliateChannel } = {},
): Promise<ClientAffiliate[]> {
  let q = getSupabase()
    .from("client_affiliates")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("fit_score", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.channel) q = q.eq("channel", opts.channel);
  const { data, error } = await q;
  if (error) throw new Error(`listAffiliates: ${error.message}`);
  return (data ?? []) as ClientAffiliate[];
}

export async function createAffiliate(
  clientSlug: string,
  affiliate: Partial<ClientAffiliate> & { org_name: string },
): Promise<ClientAffiliate> {
  const fit_score = scoreAffiliate(clientSlug, affiliate);
  const { data, error } = await getSupabase()
    .from("client_affiliates")
    .insert([
      {
        client_slug: clientSlug,
        ...affiliate,
        fit_score,
      },
    ])
    .select("*")
    .single();
  if (error) throw new Error(`createAffiliate: ${error.message}`);
  return data as ClientAffiliate;
}

export async function updateAffiliate(
  id: string,
  patch: Partial<
    Pick<
      ClientAffiliate,
      "status" | "notes" | "fit_score" | "channel" | "contact_name" | "role"
    >
  >,
): Promise<ClientAffiliate> {
  const { data, error } = await getSupabase()
    .from("client_affiliates")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateAffiliate: ${error.message}`);
  return data as ClientAffiliate;
}

export async function affiliateCounts(
  clientSlug: string,
): Promise<Record<string, number>> {
  const { data, error } = await getSupabase()
    .from("client_affiliates")
    .select("status")
    .eq("client_slug", clientSlug);
  if (error) throw new Error(`affiliateCounts: ${error.message}`);
  const counts: Record<string, number> = {};
  for (const r of (data ?? []) as { status: string }[]) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return counts;
}
