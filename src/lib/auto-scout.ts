import fs from "fs";
import path from "path";
import { scout, ACTIVE_CATEGORIES } from "./scout";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Category } from "./types";

// Washington state counties sorted by population (largest first)
const WA_COUNTIES = [
  "King", "Pierce", "Snohomish", "Spokane", "Clark", "Thurston", "Kitsap",
  "Yakima", "Whatcom", "Benton", "Skagit", "Cowlitz", "Grant", "Franklin",
  "Island", "Chelan", "Lewis", "Grays Harbor", "Mason", "Walla Walla",
  "Clallam", "Whitman", "Douglas", "San Juan", "Jefferson", "Okanogan",
  "Stevens", "Pacific", "Asotin", "Klickitat", "Kittitas", "Adams",
  "Skamania", "Lincoln", "Pend Oreille", "Ferry", "Columbia", "Wahkiakum", "Garfield",
];

// ---------- Types ----------

export interface AutoScoutConfig {
  enabled: boolean;
  state: string;
  dailyLimit: number;
  categoriesPerCounty: number;
  prospectsPerCategory: number;
}

export interface AutoScoutProgress {
  countyName: string;
  state: string;
  category: string;
  scoutedAt: string;
  prospectCount: number;
}

export interface AutoScoutRunResult {
  leadsFound: number;
  countiesProcessed: string[];
  categoriesProcessed: number;
  costUsd: number;
  stoppedReason: "daily_limit" | "all_done" | "disabled" | "error";
  errors: string[];
  duration: number;
}

// ---------- Local file fallback paths ----------

const AUTO_SCOUT_DIR = path.join(process.cwd(), "data", "auto-scout");
const CONFIG_FILE = path.join(AUTO_SCOUT_DIR, "config.json");
const PROGRESS_FILE = path.join(AUTO_SCOUT_DIR, "progress.json");
const LAST_RUN_FILE = path.join(AUTO_SCOUT_DIR, "last-run.json");

function ensureAutoScoutDir(): void {
  if (!fs.existsSync(AUTO_SCOUT_DIR)) {
    fs.mkdirSync(AUTO_SCOUT_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    }
  } catch {
    // corrupted file — return fallback
  }
  return fallback;
}

function writeJsonFile(filePath: string, data: unknown): void {
  ensureAutoScoutDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- Default config ----------

const DEFAULT_CONFIG: AutoScoutConfig = {
  enabled: false,
  state: "WA",
  dailyLimit: 100,
  categoriesPerCounty: ACTIVE_CATEGORIES.length,
  prospectsPerCategory: 5,
};

// ---------- Config helpers ----------

export async function getAutoScoutConfig(): Promise<AutoScoutConfig> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("auto_scout_config")
        .select("*")
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0] as Record<string, unknown>;
        return {
          enabled: row.enabled as boolean ?? DEFAULT_CONFIG.enabled,
          state: (row.state as string) || DEFAULT_CONFIG.state,
          dailyLimit: (row.daily_limit as number) ?? DEFAULT_CONFIG.dailyLimit,
          categoriesPerCounty: (row.categories_per_county as number) ?? DEFAULT_CONFIG.categoriesPerCounty,
          prospectsPerCategory: (row.prospects_per_category as number) ?? DEFAULT_CONFIG.prospectsPerCategory,
        };
      }
    } catch {
      // Supabase fetch failed — fall through to local
    }
  }

  return readJsonFile<AutoScoutConfig>(CONFIG_FILE, { ...DEFAULT_CONFIG });
}

export async function updateAutoScoutConfig(
  updates: Partial<AutoScoutConfig>,
): Promise<AutoScoutConfig> {
  const current = await getAutoScoutConfig();
  const merged: AutoScoutConfig = { ...current, ...updates };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("auto_scout_config").upsert(
        {
          id: 1,
          enabled: merged.enabled,
          state: merged.state,
          daily_limit: merged.dailyLimit,
          categories_per_county: merged.categoriesPerCounty,
          prospects_per_category: merged.prospectsPerCategory,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("[auto-scout] Failed to save config to Supabase:", error.message);
      }
    } catch {
      // fall through to local
    }
  }

  // Always write locally too as fallback
  writeJsonFile(CONFIG_FILE, merged);
  return merged;
}

// ---------- Progress tracking ----------

export async function getScoutedCombos(state: string): Promise<Set<string>> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("auto_scout_progress")
        .select("county_name, category")
        .eq("state", state);

      if (!error && data) {
        return new Set(
          (data as { county_name: string; category: string }[]).map(
            (r) => `${r.county_name}-${r.category}`,
          ),
        );
      }
    } catch {
      // fall through to local
    }
  }

  const progress = readJsonFile<AutoScoutProgress[]>(PROGRESS_FILE, []);
  return new Set(
    progress
      .filter((p) => p.state === state)
      .map((p) => `${p.countyName}-${p.category}`),
  );
}

export async function logScoutCombo(
  county: string,
  state: string,
  category: string,
  count: number,
): Promise<void> {
  const entry: AutoScoutProgress = {
    countyName: county,
    state,
    category,
    scoutedAt: new Date().toISOString(),
    prospectCount: count,
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("auto_scout_progress").upsert(
        {
          county_name: county,
          state,
          category,
          scouted_at: entry.scoutedAt,
          prospect_count: count,
        },
        { onConflict: "county_name,state,category" },
      );

      if (error) {
        console.error("[auto-scout] Failed to log combo to Supabase:", error.message);
      }
    } catch {
      // fall through to local
    }
  }

  // Also persist locally
  const progress = readJsonFile<AutoScoutProgress[]>(PROGRESS_FILE, []);
  const idx = progress.findIndex(
    (p) => p.countyName === county && p.state === state && p.category === category,
  );
  if (idx >= 0) {
    progress[idx] = entry;
  } else {
    progress.push(entry);
  }
  writeJsonFile(PROGRESS_FILE, progress);
}

// ---------- Daily lead count ----------

export async function getTodayLeadCount(): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (isSupabaseConfigured()) {
    try {
      const { count, error } = await supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      if (!error && count !== null) {
        return count;
      }
    } catch {
      // fall through
    }
  }

  // Local fallback — read prospects.json and filter by date
  try {
    const prospectsPath = path.join(process.cwd(), "data", "prospects.json");
    if (fs.existsSync(prospectsPath)) {
      const prospects = JSON.parse(fs.readFileSync(prospectsPath, "utf-8")) as {
        createdAt?: string;
      }[];
      return prospects.filter(
        (p) => p.createdAt && new Date(p.createdAt) >= todayStart,
      ).length;
    }
  } catch {
    // ignore
  }

  return 0;
}

// ---------- Total lead count ----------

export async function getTotalLeadCount(): Promise<number> {
  if (isSupabaseConfigured()) {
    try {
      const { count, error } = await supabase
        .from("prospects")
        .select("id", { count: "exact", head: true });

      if (!error && count !== null) {
        return count;
      }
    } catch {
      // fall through
    }
  }

  try {
    const prospectsPath = path.join(process.cwd(), "data", "prospects.json");
    if (fs.existsSync(prospectsPath)) {
      const prospects = JSON.parse(fs.readFileSync(prospectsPath, "utf-8")) as unknown[];
      return prospects.length;
    }
  } catch {
    // ignore
  }

  return 0;
}

// ---------- County lookup ----------

export function getCountiesForState(state: string): string[] {
  // Currently only WA is supported — expand with other state arrays later
  if (state === "WA") return WA_COUNTIES;
  return [];
}

// ---------- Last run result ----------

export async function getLastRunResult(): Promise<AutoScoutRunResult | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("auto_scout_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0] as Record<string, unknown>;
        return {
          leadsFound: row.leads_found as number,
          countiesProcessed: row.counties_processed as string[],
          categoriesProcessed: row.categories_processed as number,
          costUsd: row.cost_usd as number,
          stoppedReason: row.stopped_reason as AutoScoutRunResult["stoppedReason"],
          errors: row.errors as string[],
          duration: row.duration as number,
        };
      }
    } catch {
      // fall through
    }
  }

  return readJsonFile<AutoScoutRunResult | null>(LAST_RUN_FILE, null);
}

async function saveRunResult(result: AutoScoutRunResult): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("auto_scout_runs").insert({
        leads_found: result.leadsFound,
        counties_processed: result.countiesProcessed,
        categories_processed: result.categoriesProcessed,
        cost_usd: result.costUsd,
        stopped_reason: result.stoppedReason,
        errors: result.errors,
        duration: result.duration,
        created_at: new Date().toISOString(),
      });
    } catch {
      // fall through to local
    }
  }

  writeJsonFile(LAST_RUN_FILE, result);
}

// ---------- Counties-done count ----------

export async function getCountiesDone(state: string): Promise<number> {
  const scouted = await getScoutedCombos(state);
  const counties = getCountiesForState(state);
  const totalCategories = ACTIVE_CATEGORIES.length;

  let done = 0;
  for (const county of counties) {
    let allCategoriesDone = true;
    for (const cat of ACTIVE_CATEGORIES) {
      if (!scouted.has(`${county}-${cat}`)) {
        allCategoriesDone = false;
        break;
      }
    }
    if (allCategoriesDone) done++;
  }

  return done;
}

// ---------- Main auto-scout loop ----------

export async function runAutoScout(): Promise<AutoScoutRunResult> {
  const startTime = Date.now();
  const config = await getAutoScoutConfig();

  if (!config.enabled) {
    const result: AutoScoutRunResult = {
      leadsFound: 0,
      countiesProcessed: [],
      categoriesProcessed: 0,
      costUsd: 0,
      stoppedReason: "disabled",
      errors: [],
      duration: 0,
    };
    return result;
  }

  const scouted = await getScoutedCombos(config.state);
  const todayCount = await getTodayLeadCount();
  const counties = getCountiesForState(config.state);

  if (counties.length === 0) {
    const result: AutoScoutRunResult = {
      leadsFound: 0,
      countiesProcessed: [],
      categoriesProcessed: 0,
      costUsd: 0,
      stoppedReason: "error",
      errors: [`No counties found for state: ${config.state}`],
      duration: Date.now() - startTime,
    };
    await saveRunResult(result);
    return result;
  }

  let totalFound = 0;
  let categoriesProcessed = 0;
  let estimatedCost = 0;
  const countiesProcessed: string[] = [];
  const errors: string[] = [];

  // Determine which categories to run (respect categoriesPerCounty limit)
  const categoriesToRun = ACTIVE_CATEGORIES.slice(0, config.categoriesPerCounty);

  for (const county of counties) {
    // Check daily limit
    if (todayCount + totalFound >= config.dailyLimit) {
      const result: AutoScoutRunResult = {
        leadsFound: totalFound,
        countiesProcessed,
        categoriesProcessed,
        costUsd: estimatedCost,
        stoppedReason: "daily_limit",
        errors,
        duration: Date.now() - startTime,
      };
      await saveRunResult(result);
      return result;
    }

    let countyHadWork = false;

    for (const category of categoriesToRun) {
      const key = `${county}-${category}`;
      if (scouted.has(key)) continue; // already done

      countyHadWork = true;

      try {
        const result = await scout({
          city: `${county} County, ${config.state}`,
          category: category as Category,
          limit: config.prospectsPerCategory,
        });

        const prospectCount = result.prospects.length;

        // Generate preview sites for each scouted prospect
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        for (const p of result.prospects) {
          try {
            await fetch(`${baseUrl}/api/generate/${p.id}`, {
              method: "POST",
            });
          } catch (genErr) {
            errors.push(
              `generate ${p.businessName}: ${(genErr as Error).message}`,
            );
          }
        }

        totalFound += prospectCount;
        categoriesProcessed++;

        // Rough cost estimate per scout call (search + details per result)
        // ~$0.032 per search + $0.017 per detail * prospectCount
        estimatedCost += 0.032 + 0.017 * prospectCount;

        await logScoutCombo(county, config.state, category, prospectCount);

        // Check limit again after this batch
        if (todayCount + totalFound >= config.dailyLimit) {
          countiesProcessed.push(county);
          const result: AutoScoutRunResult = {
            leadsFound: totalFound,
            countiesProcessed,
            categoriesProcessed,
            costUsd: estimatedCost,
            stoppedReason: "daily_limit",
            errors,
            duration: Date.now() - startTime,
          };
          await saveRunResult(result);
          return result;
        }

        // Small delay between categories to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        errors.push(`${county}/${category}: ${(err as Error).message}`);
      }
    }

    if (countyHadWork) countiesProcessed.push(county);
  }

  const finalResult: AutoScoutRunResult = {
    leadsFound: totalFound,
    countiesProcessed,
    categoriesProcessed,
    costUsd: estimatedCost,
    stoppedReason: "all_done",
    errors,
    duration: Date.now() - startTime,
  };
  await saveRunResult(finalResult);
  return finalResult;
}
