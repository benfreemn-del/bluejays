# Scripts

Standalone Node scripts that aren't part of the deployed app — one-off
data scrapers, migrations, manual-fix utilities. Run from the repo root.

## scrape-ecnl-clubs.ts

Headless-browser scraper for the full ECNL (Elite Clubs National League)
member-club roster. Replaces the partial Wikipedia subset in
`src/data/us-ecnl-clubs.json` with the live ~205-club roster.

### Setup (one-time)

```bash
cd bluejays/
npm install puppeteer
```

This downloads a Chromium binary (~250MB) into `node_modules/`. If you
already have Chrome installed, you can swap to `puppeteer-core` and
point at your existing Chrome — see Puppeteer docs.

### Run · headless (after selectors are confirmed)

```bash
npx tsx scripts/scrape-ecnl-clubs.ts
```

Headless run dumps progress to console, writes to
`src/data/us-ecnl-clubs.json`. Re-run quarterly.

### Run · DEBUG mode (first time / when site changes)

```bash
DEBUG=1 npx tsx scripts/scrape-ecnl-clubs.ts
```

Opens a visible browser window. If selectors don't match the live site,
the script pauses 60s with the page open so you can:

1. Open DevTools (F12)
2. Right-click a club row → Inspect → note the CSS class / data-attr
3. Right-click the name / city / state nodes → Inspect → note their
   selectors relative to the row
4. Edit `CONFIGS` at the top of `scripts/scrape-ecnl-clubs.ts` with the
   correct selectors
5. Re-run without `DEBUG=1`

### What the output looks like

```json
{
  "_README": "ECNL ... full live scrape from theecnl.com.",
  "_LAST_UPDATED": "2026-05-05",
  "_SOURCE": "theecnl.com girls + boys directory · scraped via Puppeteer",
  "clubs": [
    {
      "name": "Slammers FC",
      "city": "Newport Beach",
      "state": "CA",
      "lat": 33.6189,
      "lng": -117.9298,
      "division": "girls"
    },
    ...
  ]
}
```

The map (`src/app/dashboard/tekky-map/map.client.tsx`) imports this
file directly — re-run the scraper, redeploy, and the map updates.

### Reusing the pattern for other dynamic-JS scrapes

Same shape works for:

- TYM tractor dealer locator → `tym.world` (queued in
  `src/data/itc-verified-pins.json._TODO_DATA_SOURCES`)
- Kioti, Mahindra, Branson dealer locators (same dynamic-JS pattern)
- NCAA D1/D2/D3 soccer programs
- Full MLS NEXT directory (currently sourced from mlssoccer.com but
  could be re-pulled live)

To create a new scraper: copy `scrape-ecnl-clubs.ts`, swap the
`CONFIGS` block (URLs + selectors + output path), rename the output
file. Reuse the city-lookup geocoder.

### Geocoding fallback

The scraper geocodes scraped city/state pairs against
`us-major-cities.json` + `us-soccer-towns.json`. Cities not in those
files are skipped with a `[no-geo]` log line in DEBUG mode. To add a
missing city, append it to `src/data/us-major-cities.json` and re-run.
