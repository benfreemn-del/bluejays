/**
 * client-subscriptions — pricing tiers + capability gates for AI Package
 * add-ons per client.
 *
 * Two principles:
 *
 * 1. The system DEGRADES GRACEFULLY when a subscription lapses. Without
 *    Hyperloop the funnel still runs as-coded, just no auto-optimization.
 *    Without Claude there's no AI variant generation but every other
 *    feature works. We never hard-fail because of a missing subscription.
 *
 * 2. Subscriptions can be MANAGED BY US (BlueJays) during the trial /
 *    handoff phase, then MANAGED BY THE CLIENT directly after they
 *    establish their own accounts. The frictionless-onboarding promise:
 *    "we set it up, you transition when you're ready, system stays live
 *    the whole time."
 */

import { getSupabase } from "./supabase";

export type SubscriptionService =
  | "hyperloop"
  | "claude"
  | "twilio"
  | "sendgrid"
  | "meta-ads"
  | "google-ads";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "paused"
  | "cancelled";

export type ManagedBy = "bluejays" | "client";

export type ClientSubscription = {
  id: string;
  client_slug: string;
  service: SubscriptionService;
  tier: string;
  status: SubscriptionStatus;
  monthly_price_usd: number | null;
  started_at: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  managed_by: ManagedBy;
  external_account_ref: string | null;
  credential_status: "not-set" | "pending" | "verified" | "expired";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/* ──────────────────────────── PRICING TIERS ────────────────────────────
 *
 * The complete subscription menu Ben quotes on the closeout call. Each
 * tier has a price + a capabilities array used by `tierCapabilities()`
 * + a customer-facing pitch.
 */

export type Tier = {
  id: string;
  label: string;
  monthlyPriceUsd: number;
  pitch: string;
  features: string[];
  capabilities: Capability[];
};

export type Capability =
  | "hyperloop.manual"      // Run analysis on-demand from dashboard
  | "hyperloop.weekly"      // Auto-run once/week
  | "hyperloop.daily"       // Auto-run daily
  | "hyperloop.realtime"    // Per-event optimization
  | "hyperloop.variant-gen" // Auto-generate new variants from winners
  | "hyperloop.budget-rebal" // Auto-reallocate ad spend
  | "claude.reply-draft"    // AI drafts reply suggestions for inbound msgs
  | "claude.variant-gen"    // AI generates new email/SMS copy
  | "claude.weekly-summary" // AI writes the weekly report narrative
  | "claude.audience-detect" // AI improves audience-tagging accuracy
  | "twilio.sms"
  | "twilio.voice"
  | "twilio.voicemail-drop"
  | "sendgrid.dedicated-domain";

export const TIERS: Record<SubscriptionService, Tier[]> = {
  hyperloop: [
    {
      id: "none",
      label: "Off",
      monthlyPriceUsd: 0,
      pitch:
        "Funnel runs as-coded. No auto-optimization. Manual edits only.",
      features: ["Static funnel content", "Manual variant edits via code"],
      capabilities: [],
    },
    {
      id: "starter",
      label: "Hyperloop · Starter",
      monthlyPriceUsd: 99,
      pitch:
        "On-demand variant analysis. Click 'Analyze' to see winners + losers — implement manually.",
      features: [
        "Manual analysis from dashboard",
        "Wilson-confidence-interval scoring",
        "Winner/loser flagging",
      ],
      capabilities: ["hyperloop.manual"],
    },
    {
      id: "pro",
      label: "Hyperloop · Pro",
      monthlyPriceUsd: 249,
      pitch:
        "Weekly auto-optimization. System retires losers, promotes winners, surfaces new variants for review.",
      features: [
        "Weekly auto-analysis on funnel + ad data",
        "Auto-pause losing variants (with notification)",
        "AI-generated new variants from winners (requires Claude tier)",
        "Includes Starter capabilities",
      ],
      capabilities: [
        "hyperloop.manual",
        "hyperloop.weekly",
        "hyperloop.variant-gen",
      ],
    },
    {
      id: "elite",
      label: "Hyperloop · Elite",
      monthlyPriceUsd: 499,
      pitch:
        "Daily optimization + budget reallocation across ad platforms. The full self-tuning system.",
      features: [
        "Daily auto-analysis",
        "Auto budget rebalancing across audiences/platforms",
        "Real-time event-driven micro-optimizations",
        "Includes Pro capabilities",
      ],
      capabilities: [
        "hyperloop.manual",
        "hyperloop.weekly",
        "hyperloop.daily",
        "hyperloop.realtime",
        "hyperloop.variant-gen",
        "hyperloop.budget-rebal",
      ],
    },
  ],
  claude: [
    {
      id: "none",
      label: "Off",
      monthlyPriceUsd: 0,
      pitch: "No AI features. Funnels run static.",
      features: ["Static templates", "Manual reply drafting"],
      capabilities: [],
    },
    {
      id: "starter",
      label: "Claude · Starter",
      monthlyPriceUsd: 49,
      pitch:
        "AI drafts reply suggestions for inbound leads. ~100 AI requests / mo.",
      features: [
        "AI reply suggestions in lead detail drawer",
        "Improved audience auto-detection",
        "100 requests/mo soft cap",
      ],
      capabilities: ["claude.reply-draft", "claude.audience-detect"],
    },
    {
      id: "pro",
      label: "Claude · Pro",
      monthlyPriceUsd: 149,
      pitch:
        "AI variant generation + weekly report narrative. ~500 requests / mo.",
      features: [
        "On-demand new email/SMS variants from prompts",
        "AI-written weekly report narrative",
        "Includes Starter capabilities",
      ],
      capabilities: [
        "claude.reply-draft",
        "claude.audience-detect",
        "claude.variant-gen",
        "claude.weekly-summary",
      ],
    },
    {
      id: "unlimited",
      label: "Claude · Unlimited",
      monthlyPriceUsd: 399,
      pitch: "Soft-cap unlimited usage. For high-volume clients.",
      features: ["No request cap", "Priority API access", "Includes Pro capabilities"],
      capabilities: [
        "claude.reply-draft",
        "claude.audience-detect",
        "claude.variant-gen",
        "claude.weekly-summary",
      ],
    },
  ],
  twilio: [
    {
      id: "none",
      label: "Off (BlueJays-managed)",
      monthlyPriceUsd: 0,
      pitch: "We use our Twilio. SMS/voicemail logged but skipped.",
      features: [],
      capabilities: [],
    },
    {
      id: "client-owned",
      label: "Client-owned Twilio",
      monthlyPriceUsd: 0, // pass-through, billed direct
      pitch:
        "Client provisions own Twilio account. Pay-per-use direct to Twilio (~$0.0083/SMS, $1/mo per number).",
      features: [
        "Outbound SMS from client's number",
        "Missed-call → text-back",
        "Voicemail drops",
      ],
      capabilities: ["twilio.sms", "twilio.voice", "twilio.voicemail-drop"],
    },
  ],
  sendgrid: [
    {
      id: "shared",
      label: "Shared (BlueJays SendGrid)",
      monthlyPriceUsd: 0,
      pitch:
        "Send through ben@bluejayportfolio.com with client display name + reply-to. Default for new clients.",
      features: ["DKIM-aligned", "Quick to launch"],
      capabilities: [],
    },
    {
      id: "dedicated",
      label: "Dedicated client domain",
      monthlyPriceUsd: 0, // SendGrid free tier sufficient at this volume
      pitch:
        "Send From client's actual domain (e.g. info@zenithsports.org). Requires client DNS access.",
      features: [
        "From their actual domain",
        "Higher trust + open rates",
        "Requires DKIM/SPF/DMARC setup on their DNS",
      ],
      capabilities: ["sendgrid.dedicated-domain"],
    },
  ],
  "meta-ads": [
    {
      id: "client-owned",
      label: "Client-owned Meta Ads",
      monthlyPriceUsd: 0, // pass-through ad spend
      pitch: "Client funds own Meta Ads. Ben has Admin access to manage.",
      features: ["Ad spend billed direct to client", "Pixel + CAPI configured"],
      capabilities: [],
    },
  ],
  "google-ads": [
    {
      id: "client-owned",
      label: "Client-owned Google Ads",
      monthlyPriceUsd: 0,
      pitch: "Client funds own Google Ads. Ben has Standard/Admin access.",
      features: ["Ad spend billed direct", "GA4 + conversion tags configured"],
      capabilities: [],
    },
  ],
};

/* ──────────────────────────── DB OPS ──────────────────────────── */

export async function listClientSubscriptions(
  clientSlug: string,
): Promise<ClientSubscription[]> {
  const { data, error } = await getSupabase()
    .from("client_subscriptions")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("service", { ascending: true });
  if (error) throw new Error(`listClientSubscriptions: ${error.message}`);
  return (data ?? []) as ClientSubscription[];
}

export async function getActiveSubscription(
  clientSlug: string,
  service: SubscriptionService,
): Promise<ClientSubscription | null> {
  const { data, error } = await getSupabase()
    .from("client_subscriptions")
    .select("*")
    .eq("client_slug", clientSlug)
    .eq("service", service)
    .in("status", ["trialing", "active", "past_due"])
    .maybeSingle();
  if (error) throw new Error(`getActiveSubscription: ${error.message}`);
  return (data as ClientSubscription | null) ?? null;
}

/** Capability check — single source of truth for "can this client use X?" */
export async function hasCapability(
  clientSlug: string,
  capability: Capability,
): Promise<boolean> {
  const subs = await listClientSubscriptions(clientSlug);
  for (const s of subs) {
    if (s.status !== "trialing" && s.status !== "active") continue;
    const tiers = TIERS[s.service];
    const tier = tiers?.find((t) => t.id === s.tier);
    if (tier?.capabilities.includes(capability)) return true;
  }
  return false;
}

/** Bulk capability check — returns set of granted capabilities. */
export async function getClientCapabilities(
  clientSlug: string,
): Promise<Set<Capability>> {
  const subs = await listClientSubscriptions(clientSlug);
  const granted = new Set<Capability>();
  for (const s of subs) {
    if (s.status !== "trialing" && s.status !== "active") continue;
    const tiers = TIERS[s.service];
    const tier = tiers?.find((t) => t.id === s.tier);
    tier?.capabilities.forEach((c) => granted.add(c));
  }
  return granted;
}

export async function upsertSubscription(
  sub: Pick<ClientSubscription, "client_slug" | "service" | "tier"> &
    Partial<
      Pick<
        ClientSubscription,
        | "status"
        | "monthly_price_usd"
        | "managed_by"
        | "external_account_ref"
        | "credential_status"
        | "notes"
        | "trial_ends_at"
        | "current_period_end"
      >
    >,
): Promise<ClientSubscription> {
  const sb = getSupabase();
  // Cancel any existing active sub for this (client, service) before
  // inserting the new one — the unique partial index requires it.
  await sb
    .from("client_subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("client_slug", sub.client_slug)
    .eq("service", sub.service)
    .in("status", ["trialing", "active", "past_due"]);

  const tier = TIERS[sub.service]?.find((t) => t.id === sub.tier);
  const { data, error } = await sb
    .from("client_subscriptions")
    .insert([
      {
        ...sub,
        status: sub.status ?? "active",
        monthly_price_usd: sub.monthly_price_usd ?? tier?.monthlyPriceUsd ?? 0,
        managed_by: sub.managed_by ?? "bluejays",
      },
    ])
    .select("*")
    .single();
  if (error) throw new Error(`upsertSubscription: ${error.message}`);
  return data as ClientSubscription;
}

/** Total monthly recurring revenue from subscriptions for a client. */
export async function clientMRR(clientSlug: string): Promise<number> {
  const subs = await listClientSubscriptions(clientSlug);
  return subs
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((sum, s) => sum + (s.monthly_price_usd ?? 0), 0);
}
