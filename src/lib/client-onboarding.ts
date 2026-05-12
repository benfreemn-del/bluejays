import { getSupabase } from "./supabase";

/**
 * client-onboarding — post-deal wizard state lib.
 *
 * Six steps; status transitions through:
 *   not_started → in_progress → ready_to_launch → launched
 *
 * "ready_to_launch" = all six steps have a completion timestamp. The
 * status is recomputed on every save (in this lib, not the DB) so the
 * wizard UI knows when to enable the "Launch" button.
 */

export type OnboardingStep =
  | "business"
  | "phone"
  | "brand"
  | "accounts"
  | "payment"
  | "compliance";

export const STEP_ORDER: OnboardingStep[] = [
  "business",
  "phone",
  "brand",
  "accounts",
  "payment",
  "compliance",
];

export const STEP_LABELS: Record<OnboardingStep, string> = {
  business: "Business basics",
  phone: "Phone & area code",
  brand: "Brand assets",
  accounts: "Existing accounts",
  payment: "Card on file",
  compliance: "SMS compliance",
};

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "ready_to_launch"
  | "launched";

export interface BusinessStep {
  legal_name: string;
  doing_business_as?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  hours: string; // free-text, e.g. "Mon-Fri 8a-5p; Sat by appt"
  service_areas: string[]; // city names or zip codes
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
}

export interface PhoneStep {
  preferred_area_code: string; // e.g. "360"
  forward_to_number: string; // E.164, e.g. "+13601234567"
  voicemail_greeting?: string;
  notes?: string;
}

export interface BrandStep {
  logo_url?: string;
  primary_color?: string; // hex
  secondary_color?: string;
  hero_photo_urls: string[];
  tagline?: string;
  brand_voice?: string; // free-text
}

export interface AccountsStep {
  has_google_business: boolean;
  has_google_ads: boolean;
  has_meta_ads: boolean; // Facebook + Instagram
  has_lob_account: boolean;
  has_domain_already: boolean;
  domain_name?: string;
  domain_registrar?: string;
  notes?: string;
}

export interface PaymentStep {
  /** Stripe SetupIntent id once captured. We never store PAN. */
  stripe_setup_intent_id?: string;
  /** Stripe Customer id — reused across resumes so the same customer
   *  gets multiple payment_methods rather than a new customer per try. */
  stripe_customer_id?: string;
  /** Last 4 of card for operator-side display only. */
  card_last4?: string;
  card_brand?: string;
  /** Set when the prospect chose "I'll send my card via secure link". */
  pending_manual_capture?: boolean;
  notes?: string;
}

export interface ComplianceStep {
  sms_disclosure_approved: boolean;
  signature_typed_name: string; // legal first-and-last
  signature_timestamp: string; // ISO
  data_use_approved: boolean;
}

export type StepPayload =
  | { step: "business"; data: BusinessStep }
  | { step: "phone"; data: PhoneStep }
  | { step: "brand"; data: BrandStep }
  | { step: "accounts"; data: AccountsStep }
  | { step: "payment"; data: PaymentStep }
  | { step: "compliance"; data: ComplianceStep };

export interface OnboardingRow {
  id: string;
  client_slug: string;
  status: OnboardingStatus;
  step_business: BusinessStep | null;
  step_phone: PhoneStep | null;
  step_brand: BrandStep | null;
  step_accounts: AccountsStep | null;
  step_payment: PaymentStep | null;
  step_compliance: ComplianceStep | null;
  business_completed_at: string | null;
  phone_completed_at: string | null;
  brand_completed_at: string | null;
  accounts_completed_at: string | null;
  payment_completed_at: string | null;
  compliance_completed_at: string | null;
  launched_at: string | null;
  launched_by: string | null;
  created_at: string;
  updated_at: string;
}

const STEP_TO_COLUMN: Record<OnboardingStep, { data: keyof OnboardingRow; ts: keyof OnboardingRow }> = {
  business: { data: "step_business", ts: "business_completed_at" },
  phone: { data: "step_phone", ts: "phone_completed_at" },
  brand: { data: "step_brand", ts: "brand_completed_at" },
  accounts: { data: "step_accounts", ts: "accounts_completed_at" },
  payment: { data: "step_payment", ts: "payment_completed_at" },
  compliance: { data: "step_compliance", ts: "compliance_completed_at" },
};

/**
 * Fetch the row for a slug, lazily inserting if missing. Idempotent.
 */
export async function getOrCreateOnboarding(clientSlug: string): Promise<OnboardingRow> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("client_onboarding")
    .select("*")
    .eq("client_slug", clientSlug)
    .maybeSingle();
  if (error) throw new Error(`client_onboarding fetch: ${error.message}`);
  if (data) return data as OnboardingRow;

  const { data: inserted, error: insErr } = await sb
    .from("client_onboarding")
    .insert({ client_slug: clientSlug })
    .select("*")
    .single();
  if (insErr) throw new Error(`client_onboarding insert: ${insErr.message}`);
  return inserted as OnboardingRow;
}

/**
 * Save a single step. Recomputes status afterward so the UI sees the
 * latest "ready_to_launch" / "in_progress" state.
 */
export async function saveStep(
  clientSlug: string,
  payload: StepPayload,
): Promise<OnboardingRow> {
  await getOrCreateOnboarding(clientSlug); // ensure row exists
  const sb = getSupabase();
  const cols = STEP_TO_COLUMN[payload.step];
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    [cols.data]: payload.data,
    [cols.ts]: now,
  };

  // Fetch current to recompute status
  const { data: current } = await sb
    .from("client_onboarding")
    .select("*")
    .eq("client_slug", clientSlug)
    .single();
  const after: OnboardingRow = { ...(current as OnboardingRow), ...(update as Partial<OnboardingRow>) };
  update.status = computeStatus(after);

  const { data, error } = await sb
    .from("client_onboarding")
    .update(update)
    .eq("client_slug", clientSlug)
    .select("*")
    .single();
  if (error) throw new Error(`client_onboarding save: ${error.message}`);
  return data as OnboardingRow;
}

export function computeStatus(row: OnboardingRow): OnboardingStatus {
  if (row.launched_at) return "launched";
  const stamps = [
    row.business_completed_at,
    row.phone_completed_at,
    row.brand_completed_at,
    row.accounts_completed_at,
    row.payment_completed_at,
    row.compliance_completed_at,
  ];
  const done = stamps.filter(Boolean).length;
  if (done === 0) return "not_started";
  if (done >= STEP_ORDER.length) return "ready_to_launch";
  return "in_progress";
}

export function progressPct(row: OnboardingRow): number {
  const stamps = [
    row.business_completed_at,
    row.phone_completed_at,
    row.brand_completed_at,
    row.accounts_completed_at,
    row.payment_completed_at,
    row.compliance_completed_at,
  ];
  const done = stamps.filter(Boolean).length;
  return Math.round((done / STEP_ORDER.length) * 100);
}

export function nextStep(row: OnboardingRow): OnboardingStep | null {
  for (const s of STEP_ORDER) {
    const col = STEP_TO_COLUMN[s].ts as keyof OnboardingRow;
    if (!row[col]) return s;
  }
  return null;
}

/**
 * Flip status to "launched", seed BlueJays-side client_tasks so Ben
 * sees his per-client TODO list, and return the updated row.
 */
export async function launchOnboarding(
  clientSlug: string,
  launchedByOwnerId: string,
): Promise<OnboardingRow> {
  const sb = getSupabase();
  const current = await getOrCreateOnboarding(clientSlug);
  if (computeStatus(current) !== "ready_to_launch") {
    throw new Error("All six steps must be completed before launch");
  }

  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("client_onboarding")
    .update({
      status: "launched",
      launched_at: now,
      launched_by: launchedByOwnerId,
    })
    .eq("client_slug", clientSlug)
    .select("*")
    .single();
  if (error) throw new Error(`client_onboarding launch: ${error.message}`);

  // Auto-seed Ben's BlueJays-side TODO list for this client. These are
  // the manual steps Ben has to take to actually stand up the system.
  const phone = (data as OnboardingRow).step_phone;
  const business = (data as OnboardingRow).step_business;
  const accounts = (data as OnboardingRow).step_accounts;
  const tasks: Array<{ title: string; details?: string }> = [
    {
      title: `Buy Twilio number in area code ${phone?.preferred_area_code ?? "(unset)"} for ${clientSlug}`,
      details: phone?.forward_to_number
        ? `Forward to ${phone.forward_to_number}`
        : undefined,
    },
    {
      title: accounts?.has_google_business
        ? `Request GMB manager access from ${clientSlug}`
        : `Create Google Business Profile for ${clientSlug}`,
      details: business
        ? `${business.address_line1}, ${business.city}, ${business.state} ${business.postal_code}`
        : undefined,
    },
    {
      title: accounts?.has_google_ads
        ? `Connect Google Ads MCC to ${clientSlug}`
        : `Create Google Ads account for ${clientSlug}`,
    },
    {
      title: accounts?.has_meta_ads
        ? `Request Meta Business Manager access from ${clientSlug}`
        : `Create Meta Business / Page for ${clientSlug}`,
    },
    {
      title: accounts?.has_lob_account
        ? `Connect ${clientSlug} Lob account`
        : `Set up Lob direct-mail account for ${clientSlug}`,
    },
    {
      title: `Verify card on file works (run $1 auth)`,
      details: "Use the Stripe customer created during onboarding.",
    },
    {
      title: `Send launch confirmation + first-week roadmap email to ${clientSlug}`,
    },
  ];

  // Insert tasks tagged to the BlueJays internal slug so they appear
  // in /dashboard/all-tasks. The `notes` field carries the
  // `onboarding:<slug>` marker for per-tenant filtering, since
  // client_tasks doesn't have a tags array.
  const rows = tasks.map((t, i) => ({
    client_slug: "bluejays",
    title: t.title,
    description: t.details ?? null,
    status: "pending" as const,
    priority: "high" as const,
    owner: "ben" as const,
    notes: `onboarding:${clientSlug} · post-launch · auto-seeded ${now}`,
    display_order: i,
  }));
  const { error: tasksErr } = await sb.from("client_tasks").insert(rows);
  if (tasksErr) {
    console.error("[onboarding launch] task seed failed:", tasksErr.message);
  }

  return data as OnboardingRow;
}

/** Operator-facing summary for the dashboard list. */
export async function listOnboardingForOperator(): Promise<
  Array<{
    client_slug: string;
    status: OnboardingStatus;
    progress_pct: number;
    updated_at: string;
    launched_at: string | null;
  }>
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("client_onboarding")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as OnboardingRow[]).map((r) => ({
    client_slug: r.client_slug,
    status: r.status,
    progress_pct: progressPct(r),
    updated_at: r.updated_at,
    launched_at: r.launched_at,
  }));
}
