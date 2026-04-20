/**
 * One-time script to:
 * 1. Dismiss Meyer Electric LLC
 * 2. Patch contact emails found via web research for 7 prospects
 *
 * Run with:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/patch-prospect-emails.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}

const supabase = createClient(url, key);

const PATCHES: Array<{ id: string; name: string; changes: Record<string, unknown> }> = [
  {
    id: "063c4d4a-81e1-4cae-bbf1-3ce615e1c6f7",
    name: "Meyer Electric LLC",
    changes: { status: "generated" },
  },
  {
    id: "1e8366c9-c994-4cef-87c6-a7358feafd46",
    name: "Jamie Parrish Plumbing",
    changes: { email: "jamieparrishplumbing@gmail.com" },
  },
  {
    id: "54dd3b47-b933-40bd-b989-3a98d4c0fd6d",
    name: "Ediz Plumbing",
    changes: { email: "admin@edizplumbing.com" },
  },
  {
    id: "1761103f-2020-44a6-9156-b81d4ea4567c",
    name: "Mountain Pumps and Plumbing LLC",
    changes: { email: "mountainpumpsandplumbing@gmail.com" },
  },
  {
    id: "c6c1b3df-c3d7-4e68-92c8-e8a8098665a4",
    name: "Angeles Plumbing",
    changes: { email: "Admin.AngelesPlumbing@Olypen.com" },
  },
  {
    id: "282f4272-e8f7-420d-86d3-1495b7676021",
    name: "Johnson Electric Company",
    changes: { email: "admin@johnsonelectric360.com" },
  },
  {
    id: "15fd061c-6877-4ec8-be11-2d3eb535be2d",
    name: "Frederickson Electric Inc",
    changes: { email: "contact@fredelectric.com" },
  },
  {
    id: "69937191-e810-4366-88bd-c5b9e8b96beb",
    name: "Angeles Electric",
    changes: { email: "angelelec@olympus.net" },
  },
  {
    id: "87234b4a-fdfb-4bd3-af67-ee71ae708b33",
    name: "Sound Electrical Contractors",
    changes: { email: "soundelectricalwa@gmail.com" },
  },
  // Steadfast Plumbing (5ab910ac) — no email found publicly, phone only: (360) 797-2979
  // Sequim Valley Electric (47cae6e6) — no email found publicly, use contact form on site
];

async function run() {
  console.log(`Applying ${PATCHES.length} patches...\n`);

  for (const patch of PATCHES) {
    const { error } = await supabase
      .from("prospects")
      .update(patch.changes)
      .eq("id", patch.id);

    if (error) {
      console.error(`  ✗ ${patch.name}: ${error.message}`);
    } else {
      const action = patch.changes.status
        ? `status → ${patch.changes.status}`
        : `email → ${Object.values(patch.changes)[0]}`;
      console.log(`  ✓ ${patch.name}: ${action}`);
    }
  }

  console.log("\nDone. Prospects with no email found:");
  console.log("  - Steadfast Plumbing Services — call (360) 797-2979");
  console.log("  - Sequim Valley Electric — call (360) 681-3330 or use website contact form");
}

run();
