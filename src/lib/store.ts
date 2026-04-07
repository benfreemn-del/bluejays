import fs from "fs";
import path from "path";
import type { Prospect, ScrapedData } from "./types";
import { supabase, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const PROSPECTS_FILE = path.join(DATA_DIR, "prospects.json");

// ==================== FILE-BASED (LOCAL DEV) ====================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readProspectsFile(): Prospect[] {
  ensureDataDir();
  if (!fs.existsSync(PROSPECTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(PROSPECTS_FILE, "utf-8"));
}

function writeProspectsFile(prospects: Prospect[]) {
  ensureDataDir();
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));
}

// ==================== SUPABASE (PRODUCTION) ====================

function dbToProspect(row: Record<string, unknown>): Prospect {
  return {
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
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function prospectToDb(p: Prospect) {
  return {
    id: p.id,
    business_name: p.businessName,
    owner_name: p.ownerName || null,
    phone: p.phone || null,
    email: p.email || null,
    address: p.address,
    city: p.city,
    state: p.state,
    category: p.category,
    current_website: p.currentWebsite || null,
    google_rating: p.googleRating || null,
    review_count: p.reviewCount || null,
    estimated_revenue_tier: p.estimatedRevenueTier,
    status: p.status,
    scraped_data: p.scrapedData || {},
    generated_site_url: p.generatedSiteUrl || null,
  };
}

// ==================== UNIFIED API ====================

export async function getAllProspects(): Promise<Prospect[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToProspect);
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

export async function addProspect(prospect: Prospect): Promise<Prospect> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from("prospects")
      .upsert(prospectToDb(prospect));
    if (error) throw error;
    return prospect;
  }
  const prospects = readProspectsFile();
  const existing = prospects.findIndex((p) => p.id === prospect.id);
  if (existing >= 0) prospects[existing] = prospect;
  else prospects.push(prospect);
  writeProspectsFile(prospects);
  return prospect;
}

export async function updateProspect(
  id: string,
  updates: Partial<Prospect>
): Promise<Prospect | undefined> {
  if (isSupabaseConfigured()) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.scrapedData) dbUpdates.scraped_data = updates.scrapedData;
    if (updates.generatedSiteUrl) dbUpdates.generated_site_url = updates.generatedSiteUrl;
    if (updates.businessName) dbUpdates.business_name = updates.businessName;
    if (updates.currentWebsite) dbUpdates.current_website = updates.currentWebsite;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.ownerName) dbUpdates.owner_name = updates.ownerName;

    const { data, error } = await supabase
      .from("prospects")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    return dbToProspect(data);
  }
  const prospects = readProspectsFile();
  const index = prospects.findIndex((p) => p.id === id);
  if (index < 0) return undefined;
  prospects[index] = { ...prospects[index], ...updates, updatedAt: new Date().toISOString() };
  writeProspectsFile(prospects);
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
  if (isSupabaseConfigured()) {
    // Delete existing then insert (no unique constraint needed)
    await supabase.from("generated_sites").delete().eq("prospect_id", id);
    await supabase.from("generated_sites").insert({
      prospect_id: id,
      site_data: data,
    });
    return;
  }
  const scrapedDir = path.join(DATA_DIR, "scraped");
  if (!fs.existsSync(scrapedDir)) fs.mkdirSync(scrapedDir, { recursive: true });
  fs.writeFileSync(path.join(scrapedDir, `${id}.json`), JSON.stringify(data, null, 2));
}

export async function getScrapedData(id: string): Promise<object | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("generated_sites")
      .select("site_data")
      .eq("prospect_id", id)
      .single();
    if (error || !data) return null;
    return data.site_data;
  }
  const filePath = path.join(DATA_DIR, "scraped", `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
