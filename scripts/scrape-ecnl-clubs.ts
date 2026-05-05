#!/usr/bin/env -S npx tsx
/**
 * scrape-ecnl-clubs.ts
 *
 * Headless-browser scraper for the full ECNL (Elite Clubs National League)
 * member-club roster. Replaces the partial 56-club Wikipedia subset in
 * src/data/us-ecnl-clubs.json with the actual ~205-club official roster.
 *
 * Why Puppeteer: theecnl.com is a JS-rendered SPA. Plain WebFetch returns
 * 404s on club-locator paths because the data loads after the initial HTML.
 *
 * Run:
 *   cd bluejays/
 *   npm install puppeteer        # one-time, ~250MB chromium download
 *   npx tsx scripts/scrape-ecnl-clubs.ts
 *
 * Output:
 *   src/data/us-ecnl-clubs.json (replaces the existing partial subset)
 *
 * Two-phase usage:
 *   1. DISCOVERY MODE — first run with DEBUG=1, opens visible browser so
 *      Ben can find the right URL + click through to the club list,
 *      identify selectors via DevTools, then update CONFIG below.
 *   2. SCRAPE MODE — once selectors are right, headless run dumps JSON.
 *
 * The same pattern works for TYM / Kioti / Mahindra / Branson dealer
 * scrapers — just swap the CONFIG block.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// We import puppeteer lazily so the script can fail with a clean error
// message if it's not installed yet, instead of a cryptic stack trace.
async function loadPuppeteer() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = (await import("puppeteer")) as unknown as {
      default: typeof import("puppeteer");
    };
    return mod.default;
  } catch {
    console.error(
      "\n❌ puppeteer is not installed. Run:\n   npm install puppeteer\n",
    );
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — edit when site structure changes or for a new scrape target
// ─────────────────────────────────────────────────────────────────────────────

type ScrapeConfig = {
  /** URL to navigate to. The club list / locator must render here. */
  url: string;
  /** CSS selector that resolves once the club list has rendered. */
  waitForSelector: string;
  /** CSS selector that returns one element per club. */
  rowSelector: string;
  /**
   * Per-row extraction. Uses Puppeteer's element-handle accessor to
   * grab text from inner selectors. Adjust to match the actual DOM
   * after running once in DEBUG mode.
   */
  extractName: string; // CSS selector relative to row → club name text
  extractCity?: string; // optional — falls back to parsing from name
  extractState?: string; // optional — falls back to parsing from name
  /** Division switcher. ECNL has Boys / Girls split URLs. */
  division: "boys" | "girls" | "both";
};

// Best-guess starting config for ECNL Girls.
// CONFIRM in DEBUG mode and update if the site uses different paths/classes.
const CONFIGS: ScrapeConfig[] = [
  {
    url: "https://www.theecnl.com/girls",
    waitForSelector:
      ".club-card, [data-club-name], .club-list-item, .clubs-list, .member-clubs",
    rowSelector:
      ".club-card, [data-club-name], .club-list-item, .member-clubs > *",
    extractName: ".club-name, [data-club-name], h3, h4, .name",
    extractCity: ".club-city, [data-club-city], .city",
    extractState: ".club-state, [data-club-state], .state",
    division: "girls",
  },
  {
    url: "https://www.theecnl.com/boys",
    waitForSelector:
      ".club-card, [data-club-name], .club-list-item, .clubs-list, .member-clubs",
    rowSelector:
      ".club-card, [data-club-name], .club-list-item, .member-clubs > *",
    extractName: ".club-name, [data-club-name], h3, h4, .name",
    extractCity: ".club-city, [data-club-city], .city",
    extractState: ".club-state, [data-club-state], .state",
    division: "boys",
  },
];

// City → lat/lng lookup for geocoding scraped club locations.
// Falls back to our existing us-major-cities.json + us-soccer-towns.json.
type CityLookup = Record<string, { lat: number; lng: number }>;

function loadCityLookup(): CityLookup {
  const dataDir = path.join(__dirname, "..", "src", "data");
  const lookup: CityLookup = {};

  const sources = [
    "us-major-cities.json",
    "us-soccer-towns.json",
    "us-mls-next-clubs.json",
    "us-usl-clubs.json",
  ];

  for (const file of sources) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) continue;
    try {
      const json = JSON.parse(fs.readFileSync(p, "utf8")) as Record<
        string,
        unknown
      >;
      // Walk every array of objects looking for {city,state,lat,lng}.
      for (const value of Object.values(json)) {
        if (!Array.isArray(value)) continue;
        for (const row of value as Array<Record<string, unknown>>) {
          const city = row.city ?? row.name;
          const state = row.state;
          const lat = row.lat;
          const lng = row.lng;
          if (
            typeof city === "string" &&
            typeof state === "string" &&
            typeof lat === "number" &&
            typeof lng === "number"
          ) {
            const key = `${city.toLowerCase()}|${state.toUpperCase()}`;
            if (!lookup[key]) lookup[key] = { lat, lng };
          }
        }
      }
    } catch (err) {
      console.warn(`[scrape-ecnl] could not parse ${file}:`, err);
    }
  }
  return lookup;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scraper
// ─────────────────────────────────────────────────────────────────────────────

type ScrapedClub = {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  division: "boys" | "girls" | "both";
};

const DEBUG = process.env.DEBUG === "1";

async function scrapeOne(
  cfg: ScrapeConfig,
  cityLookup: CityLookup,
): Promise<ScrapedClub[]> {
  const puppeteer = await loadPuppeteer();
  console.log(
    `[scrape-ecnl] launching ${DEBUG ? "headed" : "headless"} chromium for ${cfg.division}…`,
  );
  const browser = await puppeteer.launch({
    headless: !DEBUG,
    defaultViewport: DEBUG ? null : { width: 1280, height: 1024 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(45000);

  try {
    console.log(`[scrape-ecnl] → ${cfg.url}`);
    await page.goto(cfg.url, { waitUntil: "networkidle0" });

    // Wait for the club content to render.
    try {
      await page.waitForSelector(cfg.waitForSelector, { timeout: 20000 });
    } catch {
      console.warn(
        `[scrape-ecnl] selector "${cfg.waitForSelector}" not found within 20s.`,
      );
      if (DEBUG) {
        console.log(
          "[scrape-ecnl] DEBUG mode — pausing 60s so you can inspect DOM in the open browser.",
        );
        await new Promise((r) => setTimeout(r, 60_000));
      }
      await browser.close();
      return [];
    }

    // Extract via in-page evaluation.
    const rows = await page.evaluate(
      (sel: { row: string; name: string; city?: string; state?: string }) => {
        const out: Array<{ name: string; city: string; state: string }> = [];
        const elements = document.querySelectorAll<HTMLElement>(sel.row);
        elements.forEach((el) => {
          const nameEl = el.querySelector(sel.name);
          const cityEl = sel.city ? el.querySelector(sel.city) : null;
          const stateEl = sel.state ? el.querySelector(sel.state) : null;
          const name = (nameEl?.textContent ?? el.textContent ?? "").trim();
          let city = (cityEl?.textContent ?? "").trim();
          let state = (stateEl?.textContent ?? "").trim();

          // Fallback parsing — many ECNL clubs are listed as
          // "Crossfire Premier — Redmond, WA" so try splitting on common
          // separators if dedicated city/state nodes don't exist.
          if (!city && !state && name.includes(",")) {
            const m = name.match(/(.*?)[,\s]+([A-Z]{2})\s*$/);
            if (m) {
              const beforeState = m[1] ?? "";
              const lastSeparator = beforeState.lastIndexOf("·") >= 0
                ? "·"
                : beforeState.lastIndexOf("—") >= 0
                  ? "—"
                  : beforeState.lastIndexOf("-") >= 0
                    ? "-"
                    : ",";
              const idx = beforeState.lastIndexOf(lastSeparator);
              if (idx > 0) {
                city = beforeState.slice(idx + 1).trim();
              }
              state = m[2] ?? "";
            }
          }

          if (name) out.push({ name, city, state });
        });
        return out;
      },
      {
        row: cfg.rowSelector,
        name: cfg.extractName,
        city: cfg.extractCity,
        state: cfg.extractState,
      },
    );

    console.log(`[scrape-ecnl] extracted ${rows.length} ${cfg.division} rows`);

    // Geocode using the city/state lookup. Skip rows without a lat/lng hit.
    const clubs: ScrapedClub[] = [];
    let geocoded = 0;
    let missing = 0;
    for (const row of rows) {
      const key = `${(row.city ?? "").toLowerCase()}|${(row.state ?? "").toUpperCase()}`;
      const coords = cityLookup[key];
      if (!coords) {
        if (DEBUG) {
          console.log(
            `   [no-geo] ${row.name} · ${row.city}, ${row.state} — add to lookup`,
          );
        }
        missing++;
        continue;
      }
      clubs.push({
        name: row.name,
        city: row.city,
        state: row.state.toUpperCase(),
        lat: coords.lat,
        lng: coords.lng,
        division: cfg.division,
      });
      geocoded++;
    }
    console.log(
      `[scrape-ecnl] geocoded ${geocoded}/${rows.length} ${cfg.division} clubs (${missing} unmatched cities)`,
    );

    return clubs;
  } finally {
    await browser.close();
  }
}

async function main() {
  const cityLookup = loadCityLookup();
  console.log(
    `[scrape-ecnl] loaded ${Object.keys(cityLookup).length} cities for geocoding`,
  );

  const all: ScrapedClub[] = [];
  for (const cfg of CONFIGS) {
    try {
      const rows = await scrapeOne(cfg, cityLookup);
      all.push(...rows);
    } catch (err) {
      console.error(`[scrape-ecnl] ${cfg.division} scrape failed:`, err);
    }
  }

  if (all.length === 0) {
    console.error(
      "\n⚠️  Zero clubs scraped. Likely cause: the CONFIG selectors don't match the live site.",
    );
    console.error("   Re-run with DEBUG=1 to open a visible browser:\n");
    console.error("     DEBUG=1 npx tsx scripts/scrape-ecnl-clubs.ts\n");
    console.error(
      "   Then in DevTools find: (a) the URL the club locator lives on, (b) the CSS selector for one club row, (c) selectors for name/city/state. Update the CONFIGS constant in this file and re-run without DEBUG.\n",
    );
    process.exit(2);
  }

  // De-dupe across boys/girls when the same club name is in both — flip
  // the division to "both" so the map renders one fuchsia pin instead of
  // two stacked.
  const merged = new Map<string, ScrapedClub>();
  for (const c of all) {
    const k = `${c.name.toLowerCase()}|${c.state.toUpperCase()}`;
    const existing = merged.get(k);
    if (!existing) {
      merged.set(k, c);
    } else if (existing.division !== c.division) {
      merged.set(k, { ...existing, division: "both" });
    }
  }
  const final = Array.from(merged.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const outPath = path.join(
    __dirname,
    "..",
    "src",
    "data",
    "us-ecnl-clubs.json",
  );
  const outJson = {
    _README:
      "ECNL (Elite Clubs National League) member-club roster — full live scrape from theecnl.com.",
    _LAST_UPDATED: new Date().toISOString().slice(0, 10),
    _SOURCE: "theecnl.com girls + boys directory · scraped via Puppeteer",
    _DIVISION_KEY:
      "boys = ECNL Boys, girls = ECNL Girls, both = same-named club competes in both divisions",
    _LAT_LNG_NOTE:
      "Coordinates are city/metro-center approximations from us-major-cities.json + us-soccer-towns.json. Stadium-precise coords require a separate geocode pass.",
    _SCRAPE_NOTE:
      "Re-run quarterly via `npx tsx scripts/scrape-ecnl-clubs.ts`. ECNL roster changes ~10-15 clubs per season.",
    clubs: final,
  };

  fs.writeFileSync(outPath, JSON.stringify(outJson, null, 2) + "\n");
  console.log(`\n✅ wrote ${final.length} clubs to ${outPath}`);
  console.log(
    `   girls: ${final.filter((c) => c.division === "girls").length}`,
  );
  console.log(
    `   boys:  ${final.filter((c) => c.division === "boys").length}`,
  );
  console.log(
    `   both:  ${final.filter((c) => c.division === "both").length}`,
  );
}

main().catch((err) => {
  console.error("[scrape-ecnl] fatal:", err);
  process.exit(1);
});
