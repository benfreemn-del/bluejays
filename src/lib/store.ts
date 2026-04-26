import fs from "fs";
import path from "path";
import type { Prospect, ScrapedData } from "./types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { canonicalizeCity, normalizeAddress } from "./address-normalizer";

const DATA_DIR = path.join(process.cwd(), "data");
const PROSPECTS_FILE = path.join(DATA_DIR, "prospects.json");
const GENERATED_SITE_FETCH_RETRIES = 3;
const GENERATED_SITE_BACKOFF_MS = 250;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logGeneratedSiteFetchError(id: string, attempt: number, error: unknown) {
  console.error("[store] Failed to load generated site data", {
    prospectId: id,
    attempt,
    error,
  });
}

function logGeneratedSiteMissing(id: string) {
  console.warn("[store] No generated site data found for prospect", {
    prospectId: id,
  });
}

interface GeneratedSiteRow {
  site_data: object | null;
}

async function fetchGeneratedSiteRow(id: string): Promise<GeneratedSiteRow | null> {
  const { data, error } = await supabase
    .from("generated_sites")
    .select("site_data")
    .eq("prospect_id", id)
    .limit(1);

  if (error) {
    throw error;
  }

  return Array.isArray(data) && data.length > 0 ? (data[0] as GeneratedSiteRow) : null;
}

async function getGeneratedSiteRowWithRetry(id: string): Promise<GeneratedSiteRow | null> {
  for (let attempt = 1; attempt <= GENERATED_SITE_FETCH_RETRIES; attempt += 1) {
    try {
      return await fetchGeneratedSiteRow(id);
    } catch (error) {
      logGeneratedSiteFetchError(id, attempt, error);

      if (attempt === GENERATED_SITE_FETCH_RETRIES) {
        return null;
      }

      await wait(GENERATED_SITE_BACKOFF_MS * attempt);
    }
  }

  return null;
}


function sanitizePhotoUrls(photos: unknown): string[] {
  if (!Array.isArray(photos)) return [];

  return photos
    .filter((photo): photo is string => typeof photo === "string")
    .map((photo) => photo.trim())
    .filter(Boolean);
}

function sanitizeScrapedData(scrapedData: ScrapedData | undefined): ScrapedData | undefined {
  if (!scrapedData) return scrapedData;

  const normalizedAddress = normalizeAddress(scrapedData.address);

  return {
    ...scrapedData,
    address: normalizedAddress,
    city: canonicalizeCity(scrapedData.city, normalizedAddress),
    photos: sanitizePhotoUrls(scrapedData.photos),
    logoUrl: scrapedData.logoUrl?.trim() || undefined,
  };
}

function sanitizeGeneratedSiteData(data: object | null): object | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const record = data as Record<string, unknown>;
  return {
    ...record,
    address: normalizeAddress(typeof record.address === "string" ? record.address : undefined),
    photos: sanitizePhotoUrls(record.photos),
  };
}

function sanitizeProspect(prospect: Prospect): Prospect {
  const normalizedAddress = normalizeAddress(prospect.address) || "";
  const normalizedScrapedData = sanitizeScrapedData(prospect.scrapedData);

  return {
    ...prospect,
    address: normalizedAddress,
    city: canonicalizeCity(prospect.city, normalizedAddress || normalizedScrapedData?.address) || prospect.city,
    adminNotes: prospect.adminNotes ?? undefined,
    lastSubmittedAdminNotes: prospect.lastSubmittedAdminNotes ?? undefined,
    scrapedData: normalizedScrapedData,
  };
}

// ==================== FILE-BASED (LOCAL DEV) ====================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readProspectsFile(): Prospect[] {
  ensureDataDir();
  if (!fs.existsSync(PROSPECTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(PROSPECTS_FILE, "utf-8")).map((prospect: Prospect) => sanitizeProspect(prospect));
}

function writeProspectsFile(prospects: Prospect[]) {
  ensureDataDir();
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects.map(sanitizeProspect), null, 2));
}

// ==================== SUPABASE (PRODUCTION) ====================

function dbToProspect(row: Record<string, unknown>): Prospect {
  return sanitizeProspect({
    id: row.id as string,
    businessName: row.business_name as string,
    ownerName: row.owner_name as string | undefined,
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    category: row.category as Prospect["category"],
    currentWebsite: row.current_website as string | undefined,
    googleRating: row.google_rating as number | undefined,
    reviewCount: row.review_count as number | undefined,
    estimatedRevenueTier: (row.estimated_revenue_tier as string) as Prospect["estimatedRevenueTier"],
    status: (row.status as string) as Prospect["status"],
    scrapedData: row.scraped_data as ScrapedData | undefined,
    generatedSiteUrl: row.generated_site_url as string | undefined,
    stripeCustomerId: row.stripe_customer_id as string | undefined,
    paidAt: row.paid_at as string | undefined,
    subscriptionStatus: row.subscription_status as Prospect["subscriptionStatus"],
    mgmtSubscriptionId: row.mgmt_subscription_id as string | undefined,
    instagramHandle: row.instagram_handle as string | undefined,
    funnelPaused: row.funnel_paused as boolean | undefined,
    source: (row.source as "inbound" | "scouted" | undefined) || undefined,
    pricingTier: (row.pricing_tier as "standard" | "free" | "custom" | undefined) || "standard",
    customSiteUrl: (row.custom_site_url as string | null) || undefined,
    selectedTheme: (row.selected_theme as "light" | "dark" | undefined) || undefined,
    selectedVersion: (row.selected_version as "v1" | "v2" | undefined) || undefined,
    aiThemeRecommendation: (row.ai_theme_recommendation as "light" | "dark" | undefined) || undefined,
    qualityScore: row.quality_score as number | undefined,
    qualityNotes: row.quality_notes as string | undefined,
    qcReviewedAt: row.qc_reviewed_at as string | undefined,
    adminNotes: (row.admin_notes as string | null) || undefined,
    adminNotesUpdatedAt: row.admin_notes_updated_at as string | undefined,
    adminNotesSubmittedAt: row.admin_notes_submitted_at as string | undefined,
    lastSubmittedAdminNotes: (row.last_submitted_admin_notes as string | null) || undefined,
    lastSubmittedTheme: (row.last_submitted_theme as "light" | "dark" | null) || undefined,
    welcomeEmailSentAt: row.welcome_email_sent_at as string | undefined,
    onboardingReminderSentAt: row.onboarding_reminder_sent_at as string | undefined,
    paymentFailureCount: (row.payment_failure_count as number | null) ?? undefined,
    lastPaymentFailureAt: (row.last_payment_failure_at as string | null) || undefined,
    softBounceCount: (row.soft_bounce_count as number | null) ?? undefined,
    lastSoftBounceAt: (row.last_soft_bounce_at as string | null) || undefined,
    npsSentAt: (row.nps_sent_at as string | null) || undefined,
    lossProbeSentAt: (row.loss_probe_sent_at as string | null) || undefined,
    short_code: (row.short_code as string | null) || undefined,
    assignedDomain: (row.assigned_domain as string | null) || undefined,
    domainCostUsd:
      row.domain_cost_usd == null
        ? undefined
        : Number(row.domain_cost_usd),
    domainRegistrar: (row.domain_registrar as string | null) || undefined,
    domainRegisteredAt: (row.domain_registered_at as string | null) || undefined,
    siteLiveAt: (row.site_live_at as string | null) || undefined,
    manuallyManaged: (row.manually_managed as boolean | null) ?? false,
    testCohortId: (row.test_cohort_id as string | null) || undefined,
    cohortPostcardSentAt: (row.cohort_postcard_sent_at as string | null) || undefined,
    loomVideoUrl: (row.loom_video_url as string | null) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  });
}

function prospectToDb(p: Prospect) {
  const sanitized = sanitizeProspect(p);

  return {
    id: sanitized.id,
    business_name: sanitized.businessName,
    owner_name: sanitized.ownerName || null,
    phone: sanitized.phone || null,
    email: sanitized.email || null,
    address: sanitized.address,
    city: sanitized.city,
    state: sanitized.state,
    category: sanitized.category,
    current_website: sanitized.currentWebsite || null,
    google_rating: sanitized.googleRating || null,
    review_count: sanitized.reviewCount || null,
    estimated_revenue_tier: sanitized.estimatedRevenueTier,
    status: sanitized.status,
    scraped_data: sanitized.scrapedData || {},
    generated_site_url: sanitized.generatedSiteUrl || null,
    stripe_customer_id: sanitized.stripeCustomerId || null,
    paid_at: sanitized.paidAt || null,
    subscription_status: sanitized.subscriptionStatus || "none",
    mgmt_subscription_id: sanitized.mgmtSubscriptionId || null,
    instagram_handle: sanitized.instagramHandle || null,
    funnel_paused: sanitized.funnelPaused || false,
    source: sanitized.source || "scouted",
    pricing_tier: sanitized.pricingTier || "standard",
    custom_site_url: sanitized.customSiteUrl || null,
    selected_theme: sanitized.selectedTheme || null,
    selected_version: sanitized.selectedVersion || null,
    ai_theme_recommendation: sanitized.aiThemeRecommendation || null,
    quality_score: sanitized.qualityScore || null,
    quality_notes: sanitized.qualityNotes || null,
    qc_reviewed_at: sanitized.qcReviewedAt || null,
    admin_notes: sanitized.adminNotes || null,
    admin_notes_updated_at: sanitized.adminNotesUpdatedAt || null,
    admin_notes_submitted_at: sanitized.adminNotesSubmittedAt || null,
    last_submitted_admin_notes: sanitized.lastSubmittedAdminNotes || null,
    last_submitted_theme: sanitized.lastSubmittedTheme || null,
    assigned_domain: sanitized.assignedDomain || null,
    domain_cost_usd: sanitized.domainCostUsd ?? null,
    domain_registrar: sanitized.domainRegistrar || null,
    domain_registered_at: sanitized.domainRegisteredAt || null,
    site_live_at: sanitized.siteLiveAt || null,
    manually_managed: sanitized.manuallyManaged ?? false,
    test_cohort_id: sanitized.testCohortId || null,
    cohort_postcard_sent_at: sanitized.cohortPostcardSentAt || null,
    loom_video_url: sanitized.loomVideoUrl || null,
  };
}

// ==================== UNIFIED API ====================

export async function getAllProspects(): Promise<Prospect[]> {
  if (isSupabaseConfigured()) {
    // Supabase/PostgREST caps a plain .select() at 1000 rows by default.
    // Past 1000 prospects, older rows silently drop off — the dashboard's
    // Contacted/Approved tiles started shrinking after 24h because new
    // scouted rows were pushing older contacted/approved ones out of the
    // returned window. Page through all rows in 1000-row chunks instead
    // so every tile counts the real total.
    const PAGE = 1000;
    const all: Prospect[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      const rows = (data || []).map(dbToProspect);
      all.push(...rows);
      if (rows.length < PAGE) break;
      from += PAGE;
      if (from > 50000) break; // safety rail: 50k prospects is a different conversation
    }
    return all;
  }
  return readProspectsFile();
}

export function getAllProspectsSync(): Prospect[] {
  if (isSupabaseConfigured()) {
    // For sync contexts, fall back to file
    return readProspectsFile();
  }
  return readProspectsFile();
}

export async function getProspect(id: string): Promise<Prospect | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return dbToProspect(data);
  }
  return readProspectsFile().find((p) => p.id === id);
}

/**
 * Look up a prospect by email address.
 */
export async function getProspectByEmail(email: string): Promise<Prospect | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();
    if (error || !data) return undefined;
    return dbToProspect(data);
  }
  return readProspectsFile().find((p) => p.email === email);
}

/**
 * Look up a prospect by phone number.
 * Normalizes the phone number by stripping non-digit characters for matching.
 */
export async function getProspectByPhone(phone: string): Promise<Prospect | undefined> {
  const normalized = phone.replace(/\D/g, "");
  if (isSupabaseConfigured()) {
    // Try exact match first, then normalized
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .or(`phone.eq.${phone},phone.eq.+${normalized},phone.eq.+1${normalized}`)
      .limit(1);
    if (error || !data || data.length === 0) return undefined;
    return dbToProspect(data[0]);
  }
  return readProspectsFile().find((p) => {
    if (!p.phone) return false;
    const pNorm = p.phone.replace(/\D/g, "");
    return pNorm === normalized || pNorm.endsWith(normalized) || normalized.endsWith(pNorm);
  });
}

export async function addProspect(prospect: Prospect): Promise<Prospect> {
  const sanitizedProspect = sanitizeProspect(prospect);

  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("prospects")
      .upsert(prospectToDb(sanitizedProspect));
    if (error) throw error;
    return sanitizedProspect;
  }
  const prospects = readProspectsFile();
  const existing = prospects.findIndex((p) => p.id === sanitizedProspect.id);
  if (existing >= 0) prospects[existing] = sanitizedProspect;
  else prospects.push(sanitizedProspect);
  writeProspectsFile(prospects);
  return sanitizedProspect;
}

async function logStatusChange(
  prospectId: string,
  businessName: string | null | undefined,
  fromStatus: string | null | undefined,
  toStatus: string,
  source: string | undefined,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (fromStatus === toStatus) return;
  try {
    await supabase.from("prospect_status_changes").insert({
      prospect_id: prospectId,
      business_name: businessName ?? null,
      from_status: fromStatus ?? null,
      to_status: toStatus,
      source: source ?? null,
    });
  } catch (error) {
    console.error("[store] Failed to log status change", {
      prospectId,
      fromStatus,
      toStatus,
      error,
    });
  }
}

export async function updateProspect(
  id: string,
  updates: Partial<Prospect>,
  options: { source?: string } = {},
): Promise<Prospect | undefined> {
  const sanitizedUpdates: Partial<Prospect> = {
    ...updates,
    scrapedData: sanitizeScrapedData(updates.scrapedData),
  };
  if (isSupabaseConfigured()) {
    const dbUpdates: Record<string, unknown> = {};
    if (sanitizedUpdates.status) dbUpdates.status = sanitizedUpdates.status;
    if (sanitizedUpdates.scrapedData) dbUpdates.scraped_data = sanitizedUpdates.scrapedData;
    if (sanitizedUpdates.generatedSiteUrl) dbUpdates.generated_site_url = sanitizedUpdates.generatedSiteUrl;
    if (sanitizedUpdates.businessName) dbUpdates.business_name = sanitizedUpdates.businessName;
    if (sanitizedUpdates.currentWebsite) dbUpdates.current_website = sanitizedUpdates.currentWebsite;
    if (sanitizedUpdates.phone) dbUpdates.phone = sanitizedUpdates.phone;
    if (sanitizedUpdates.email) dbUpdates.email = sanitizedUpdates.email;
    if (sanitizedUpdates.ownerName) dbUpdates.owner_name = sanitizedUpdates.ownerName;
    if (sanitizedUpdates.address !== undefined) dbUpdates.address = normalizeAddress(sanitizedUpdates.address) || "";
    if (sanitizedUpdates.city !== undefined) dbUpdates.city = canonicalizeCity(sanitizedUpdates.city, sanitizedUpdates.address) || sanitizedUpdates.city;
    if (sanitizedUpdates.stripeCustomerId) dbUpdates.stripe_customer_id = sanitizedUpdates.stripeCustomerId;
    if (sanitizedUpdates.paidAt) dbUpdates.paid_at = sanitizedUpdates.paidAt;
    if (sanitizedUpdates.subscriptionStatus) dbUpdates.subscription_status = sanitizedUpdates.subscriptionStatus;
    if (sanitizedUpdates.mgmtSubscriptionId) dbUpdates.mgmt_subscription_id = sanitizedUpdates.mgmtSubscriptionId;
    if (sanitizedUpdates.instagramHandle !== undefined) dbUpdates.instagram_handle = sanitizedUpdates.instagramHandle;
    if (sanitizedUpdates.funnelPaused !== undefined) dbUpdates.funnel_paused = sanitizedUpdates.funnelPaused;
    if (sanitizedUpdates.selectedTheme !== undefined) dbUpdates.selected_theme = sanitizedUpdates.selectedTheme || null;
    if (sanitizedUpdates.selectedVersion !== undefined) dbUpdates.selected_version = sanitizedUpdates.selectedVersion || null;
    if (sanitizedUpdates.aiThemeRecommendation) dbUpdates.ai_theme_recommendation = sanitizedUpdates.aiThemeRecommendation;
    if (sanitizedUpdates.qualityScore !== undefined) dbUpdates.quality_score = sanitizedUpdates.qualityScore;
    if (sanitizedUpdates.qualityNotes !== undefined) dbUpdates.quality_notes = sanitizedUpdates.qualityNotes;
    if (sanitizedUpdates.qcReviewedAt !== undefined) dbUpdates.qc_reviewed_at = sanitizedUpdates.qcReviewedAt;
    if (sanitizedUpdates.pricingTier !== undefined) dbUpdates.pricing_tier = sanitizedUpdates.pricingTier;
    if (sanitizedUpdates.customSiteUrl !== undefined) dbUpdates.custom_site_url = sanitizedUpdates.customSiteUrl || null;
    if (sanitizedUpdates.adminNotes !== undefined) dbUpdates.admin_notes = sanitizedUpdates.adminNotes || null;
    if (sanitizedUpdates.adminNotesUpdatedAt !== undefined) dbUpdates.admin_notes_updated_at = sanitizedUpdates.adminNotesUpdatedAt || null;
    if (sanitizedUpdates.adminNotesSubmittedAt !== undefined) dbUpdates.admin_notes_submitted_at = sanitizedUpdates.adminNotesSubmittedAt || null;
    if (sanitizedUpdates.lastSubmittedAdminNotes !== undefined) dbUpdates.last_submitted_admin_notes = sanitizedUpdates.lastSubmittedAdminNotes || null;
    if (sanitizedUpdates.lastSubmittedTheme !== undefined) dbUpdates.last_submitted_theme = sanitizedUpdates.lastSubmittedTheme || null;
    if (sanitizedUpdates.welcomeEmailSentAt !== undefined) dbUpdates.welcome_email_sent_at = sanitizedUpdates.welcomeEmailSentAt || null;
    if (sanitizedUpdates.onboardingReminderSentAt !== undefined) dbUpdates.onboarding_reminder_sent_at = sanitizedUpdates.onboardingReminderSentAt || null;
    if (sanitizedUpdates.paymentFailureCount !== undefined) dbUpdates.payment_failure_count = sanitizedUpdates.paymentFailureCount ?? 0;
    if (sanitizedUpdates.lastPaymentFailureAt !== undefined) dbUpdates.last_payment_failure_at = sanitizedUpdates.lastPaymentFailureAt || null;
    if (sanitizedUpdates.softBounceCount !== undefined) dbUpdates.soft_bounce_count = sanitizedUpdates.softBounceCount ?? 0;
    if (sanitizedUpdates.lastSoftBounceAt !== undefined) dbUpdates.last_soft_bounce_at = sanitizedUpdates.lastSoftBounceAt || null;
    if (sanitizedUpdates.npsSentAt !== undefined) dbUpdates.nps_sent_at = sanitizedUpdates.npsSentAt || null;
    if (sanitizedUpdates.lossProbeSentAt !== undefined) dbUpdates.loss_probe_sent_at = sanitizedUpdates.lossProbeSentAt || null;
    if (sanitizedUpdates.assignedDomain !== undefined) dbUpdates.assigned_domain = sanitizedUpdates.assignedDomain || null;
    if (sanitizedUpdates.domainCostUsd !== undefined) dbUpdates.domain_cost_usd = sanitizedUpdates.domainCostUsd ?? null;
    if (sanitizedUpdates.domainRegistrar !== undefined) dbUpdates.domain_registrar = sanitizedUpdates.domainRegistrar || null;
    if (sanitizedUpdates.domainRegisteredAt !== undefined) dbUpdates.domain_registered_at = sanitizedUpdates.domainRegisteredAt || null;
    if (sanitizedUpdates.siteLiveAt !== undefined) dbUpdates.site_live_at = sanitizedUpdates.siteLiveAt || null;
    if (sanitizedUpdates.manuallyManaged !== undefined) dbUpdates.manually_managed = sanitizedUpdates.manuallyManaged ?? false;
    if (sanitizedUpdates.testCohortId !== undefined) dbUpdates.test_cohort_id = sanitizedUpdates.testCohortId || null;
    if (sanitizedUpdates.cohortPostcardSentAt !== undefined) dbUpdates.cohort_postcard_sent_at = sanitizedUpdates.cohortPostcardSentAt || null;
    if (sanitizedUpdates.loomVideoUrl !== undefined) dbUpdates.loom_video_url = sanitizedUpdates.loomVideoUrl || null;

    let previousStatus: string | null = null;
    if (sanitizedUpdates.status) {
      const { data: currentRow } = await supabase
        .from("prospects")
        .select("status")
        .eq("id", id)
        .single();
      previousStatus = (currentRow?.status as string | null) ?? null;
    }

    const { data, error } = await supabase
      .from("prospects")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    const updated = dbToProspect(data);
    if (sanitizedUpdates.status && previousStatus !== sanitizedUpdates.status) {
      await logStatusChange(
        id,
        updated.businessName,
        previousStatus,
        sanitizedUpdates.status,
        options.source,
      );
    }
    return updated;
  }
  const prospects = readProspectsFile();
  const index = prospects.findIndex((p) => p.id === id);
  if (index < 0) return undefined;
  const previousStatus = prospects[index].status;
  prospects[index] = sanitizeProspect({ ...prospects[index], ...sanitizedUpdates, updatedAt: new Date().toISOString() });
  writeProspectsFile(prospects);
  if (sanitizedUpdates.status && previousStatus !== sanitizedUpdates.status) {
    await logStatusChange(
      id,
      prospects[index].businessName,
      previousStatus,
      sanitizedUpdates.status,
      options.source,
    );
  }
  return prospects[index];
}

export async function filterProspects(filters: {
  category?: string;
  status?: string;
  city?: string;
}): Promise<Prospect[]> {
  if (isSupabaseConfigured()) {
    let query = supabase.from("prospects").select("*");
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.city) query = query.ilike("city", `%${filters.city}%`);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToProspect);
  }
  let prospects = readProspectsFile();
  if (filters.category) prospects = prospects.filter((p) => p.category === filters.category);
  if (filters.status) prospects = prospects.filter((p) => p.status === filters.status);
  if (filters.city) prospects = prospects.filter((p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
  return prospects;
}

export async function saveScrapedData(id: string, data: object): Promise<void> {
  const sanitizedData = sanitizeGeneratedSiteData(data);

  if (isSupabaseConfigured()) {
    // Delete existing then insert (no unique constraint needed)
    await supabase.from("generated_sites").delete().eq("prospect_id", id);
    await supabase.from("generated_sites").insert({
      prospect_id: id,
      site_data: sanitizedData,
    });
    return;
  }
  const scrapedDir = path.join(DATA_DIR, "scraped");
  if (!fs.existsSync(scrapedDir)) fs.mkdirSync(scrapedDir, { recursive: true });
  fs.writeFileSync(path.join(scrapedDir, `${id}.json`), JSON.stringify(sanitizedData, null, 2));
}

export async function getScrapedData(id: string): Promise<object | null> {
  if (isSupabaseConfigured()) {
    const row = await getGeneratedSiteRowWithRetry(id);

    if (!row?.site_data) {
      logGeneratedSiteMissing(id);
      return null;
    }

    return sanitizeGeneratedSiteData(row.site_data);
  }
  const filePath = path.join(DATA_DIR, "scraped", `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return sanitizeGeneratedSiteData(JSON.parse(fs.readFileSync(filePath, "utf-8")));
}
