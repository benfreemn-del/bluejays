/**
 * calendar.ts — central library for the calendar-availability skill.
 *
 * Owns:
 *   · OAuth helpers for Google Calendar / Calendly / Cal.com (token
 *     storage + refresh — same encrypted pattern as ad-oauth.ts)
 *   · Slot helpers (list / create / claim / release)
 *   · Working-hours config (CRUD + derivation of available slots
 *     from a free/busy window)
 *   · Onboarding-state check (does this tenant need the
 *     CalendarSetupBanner?)
 *
 * See `.claude/skills/calendar-availability/SKILL.md` for the full
 * design + when to use this skill.
 */

import { createHmac, randomBytes } from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

export type CalendarProvider = "google_calendar" | "calendly" | "cal_com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

const STATE_SECRET =
  process.env.AD_OAUTH_KEY ||
  process.env.NEXTAUTH_SECRET ||
  "bluejays-oauth-default-secret-rotate-me";

const ENCRYPTION_KEY = process.env.AD_OAUTH_KEY || "";

/* ─────────── PROVISIONING ─────────── */

export type ProviderProvisioningStatus = {
  provider: CalendarProvider;
  configured: boolean;
  missingEnvVars: string[];
  setupSteps: string[];
};

export function getCalendarProvisioning(
  provider: CalendarProvider,
): ProviderProvisioningStatus {
  switch (provider) {
    case "google_calendar": {
      const missing: string[] = [];
      // Reuses the Google Ads OAuth client — same Cloud project,
      // different scopes. If you split them later, swap to dedicated
      // GOOGLE_CALENDAR_CLIENT_ID / SECRET vars.
      if (!process.env.GOOGLE_ADS_CLIENT_ID) missing.push("GOOGLE_ADS_CLIENT_ID");
      if (!process.env.GOOGLE_ADS_CLIENT_SECRET)
        missing.push("GOOGLE_ADS_CLIENT_SECRET");
      return {
        provider,
        configured: missing.length === 0,
        missingEnvVars: missing,
        setupSteps: [
          "Reuses the Google Cloud OAuth client from the Ads setup",
          "Enable the Google Calendar API in the same Cloud project",
          `Add OAuth redirect: ${SITE_URL}/api/oauth/google_calendar/callback`,
          "Add scope: https://www.googleapis.com/auth/calendar.events",
          "No new env vars needed — shares GOOGLE_ADS_CLIENT_ID + SECRET",
        ],
      };
    }
    case "calendly": {
      const missing: string[] = [];
      if (!process.env.CALENDLY_CLIENT_ID) missing.push("CALENDLY_CLIENT_ID");
      if (!process.env.CALENDLY_CLIENT_SECRET)
        missing.push("CALENDLY_CLIENT_SECRET");
      return {
        provider,
        configured: missing.length === 0,
        missingEnvVars: missing,
        setupSteps: [
          "dev.calendly.com → Create OAuth app",
          `Add redirect: ${SITE_URL}/api/oauth/calendly/callback`,
          "Set Vercel env: CALENDLY_CLIENT_ID + CALENDLY_CLIENT_SECRET",
        ],
      };
    }
    case "cal_com":
      return {
        provider,
        configured: !!process.env.CAL_COM_API_KEY,
        missingEnvVars: process.env.CAL_COM_API_KEY ? [] : ["CAL_COM_API_KEY"],
        setupSteps: [
          "cal.com → Settings → Developer → API Keys → Create",
          "Set Vercel env: CAL_COM_API_KEY",
          "Single API key for all tenants — no per-tenant OAuth needed",
        ],
      };
  }
}

/* ─────────── OAUTH STATE SIGNING ─────────── */

function signState(slug: string, nonce: string): string {
  const sig = createHmac("sha256", STATE_SECRET)
    .update(`cal:${slug}:${nonce}`)
    .digest("hex")
    .slice(0, 16);
  return `cal.${slug}.${nonce}.${sig}`;
}

export function verifyCalendarState(
  state: string,
): { ok: true; slug: string } | { ok: false; error: string } {
  const parts = state.split(".");
  if (parts.length !== 4 || parts[0] !== "cal")
    return { ok: false, error: "malformed state" };
  const [, slug, nonce, sig] = parts;
  const expected = createHmac("sha256", STATE_SECRET)
    .update(`cal:${slug}:${nonce}`)
    .digest("hex")
    .slice(0, 16);
  if (sig !== expected) return { ok: false, error: "state signature mismatch" };
  if (!/^[a-z0-9-]{1,60}$/i.test(slug))
    return { ok: false, error: "invalid slug in state" };
  return { ok: true, slug };
}

export function getCalendarAuthUrl(
  slug: string,
  provider: CalendarProvider,
): { ok: true; url: string } | { ok: false; error: string } {
  const status = getCalendarProvisioning(provider);
  if (!status.configured) {
    return {
      ok: false,
      error: `${provider} not provisioned. Missing: ${status.missingEnvVars.join(", ")}`,
    };
  }
  const state = signState(slug, randomBytes(16).toString("hex"));
  const callback = `${SITE_URL}/api/oauth/${provider}/callback`;

  if (provider === "google_calendar") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", process.env.GOOGLE_ADS_CLIENT_ID!);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set(
      "scope",
      [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/calendar.readonly",
      ].join(" "),
    );
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    return { ok: true, url: url.toString() };
  }
  if (provider === "calendly") {
    const url = new URL("https://auth.calendly.com/oauth/authorize");
    url.searchParams.set("client_id", process.env.CALENDLY_CLIENT_ID!);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    return { ok: true, url: url.toString() };
  }
  if (provider === "cal_com") {
    return {
      ok: false,
      error:
        "Cal.com uses a single API key, not per-user OAuth. Set CAL_COM_API_KEY in Vercel env.",
    };
  }
  return { ok: false, error: `unknown provider: ${provider}` };
}

/* ─────────── TOKEN STORAGE ─────────── */

export async function storeCalendarRefreshToken(args: {
  clientSlug: string;
  provider: CalendarProvider;
  refreshToken: string;
  externalAccountId: string;
  externalAccountEmail?: string;
  scopes: string[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "supabase not configured" };
  }
  if (!ENCRYPTION_KEY) {
    return { ok: false, error: "AD_OAUTH_KEY env var not set" };
  }
  const { error } = await supabase.rpc("calendar_account_upsert_token", {
    p_client_slug: args.clientSlug,
    p_provider: args.provider,
    p_refresh_token: args.refreshToken,
    p_external_account_id: args.externalAccountId,
    p_external_account_email: args.externalAccountEmail ?? null,
    p_scopes: args.scopes,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getCalendarRefreshToken(
  clientSlug: string,
  provider: CalendarProvider,
): Promise<string | null> {
  if (!isSupabaseConfigured() || !ENCRYPTION_KEY) return null;
  const { data, error } = await supabase.rpc("calendar_account_get_token", {
    p_client_slug: clientSlug,
    p_provider: provider,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error || !data) return null;
  return data as string;
}

export type ClientCalendarAccount = {
  id: string;
  provider: CalendarProvider;
  external_account_id: string;
  external_account_email: string | null;
  status: string;
  last_synced_at: string | null;
  last_refreshed_at: string | null;
  consecutive_failures: number;
  last_error: string | null;
};

export async function listCalendarAccounts(
  clientSlug: string,
): Promise<ClientCalendarAccount[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("client_calendar_accounts")
    .select(
      "id, provider, external_account_id, external_account_email, status, last_synced_at, last_refreshed_at, consecutive_failures, last_error",
    )
    .eq("client_slug", clientSlug);
  return (data ?? []) as ClientCalendarAccount[];
}

/* ─────────── ONBOARDING STATE ─────────── */

export type CalendarOnboardingState = {
  needsSetup: boolean;
  hasManualSlots: boolean;
  hasConnectedCalendar: boolean;
  manualSlotCount: number;
  connectedProviders: CalendarProvider[];
};

/**
 * Drives the CalendarSetupBanner. Returns needsSetup=true when the
 * tenant has BOTH:
 *   · Fewer than 3 future-available manual slots, AND
 *   · No active calendar account
 *
 * Once either threshold is crossed, banner hides forever.
 */
export async function getCalendarOnboardingState(
  clientSlug: string,
): Promise<CalendarOnboardingState> {
  if (!isSupabaseConfigured()) {
    return {
      needsSetup: true,
      hasManualSlots: false,
      hasConnectedCalendar: false,
      manualSlotCount: 0,
      connectedProviders: [],
    };
  }
  const [{ data: slots }, accounts] = await Promise.all([
    supabase
      .from("client_booking_slots")
      .select("id", { count: "exact" })
      .eq("client_slug", clientSlug)
      .eq("status", "available")
      .gt("start_at", new Date().toISOString())
      .limit(10),
    listCalendarAccounts(clientSlug),
  ]);
  const manualSlotCount = (slots ?? []).length;
  const activeAccounts = accounts.filter((a) => a.status === "active");
  const hasManualSlots = manualSlotCount >= 3;
  const hasConnectedCalendar = activeAccounts.length > 0;
  return {
    needsSetup: !hasManualSlots && !hasConnectedCalendar,
    hasManualSlots,
    hasConnectedCalendar,
    manualSlotCount,
    connectedProviders: activeAccounts.map((a) => a.provider),
  };
}

/* ─────────── WORKING HOURS ─────────── */

export type WorkingHoursWindow = { start: string; end: string };

export type WorkingHoursWeekly = Partial<
  Record<
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday",
    WorkingHoursWindow[]
  >
>;

export type ClientWorkingHours = {
  client_slug: string;
  timezone: string;
  weekly: WorkingHoursWeekly;
  buffer_minutes: number;
  slot_duration_minutes: number;
  blackouts: Array<{ from: string; to: string; reason?: string }>;
};

const DEFAULT_WORKING_HOURS: WorkingHoursWeekly = {
  monday: [{ start: "09:00", end: "17:00" }],
  tuesday: [{ start: "09:00", end: "17:00" }],
  wednesday: [{ start: "09:00", end: "17:00" }],
  thursday: [{ start: "09:00", end: "17:00" }],
  friday: [{ start: "09:00", end: "17:00" }],
  saturday: [],
  sunday: [],
};

export async function getWorkingHours(
  clientSlug: string,
): Promise<ClientWorkingHours | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase
    .from("client_calendar_working_hours")
    .select("*")
    .eq("client_slug", clientSlug)
    .maybeSingle();
  if (!data) return null;
  return data as ClientWorkingHours;
}

export async function upsertWorkingHours(
  args: Partial<ClientWorkingHours> & { client_slug: string },
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured())
    return { ok: false, error: "supabase not configured" };
  const { error } = await supabase
    .from("client_calendar_working_hours")
    .upsert(
      {
        client_slug: args.client_slug,
        timezone: args.timezone ?? "America/Los_Angeles",
        weekly: args.weekly ?? DEFAULT_WORKING_HOURS,
        buffer_minutes: args.buffer_minutes ?? 15,
        slot_duration_minutes: args.slot_duration_minutes ?? 90,
        blackouts: args.blackouts ?? [],
      },
      { onConflict: "client_slug" },
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
