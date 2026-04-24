/**
 * Build Thrive Church (Sequim, WA) prospect + generated preview
 * from scratch. Uses content scraped from thrivesequim.com and the
 * V2ChurchPreview renderer (same premium template as /v2/church).
 *
 * Dry-run: npx tsx scripts/build-thrive-church.ts
 * Apply:   npx tsx scripts/build-thrive-church.ts --apply
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { randomUUID } from "crypto";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const c = fs.readFileSync(envPath, "utf-8");
  for (const line of c.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";

// Thrive's own photos — each is a UNIQUE underlying upload (no two
// entries should point to the same file at different Cloudfront
// resize variants, or the template will render the same image twice
// in adjacent slots). URLs copied verbatim from their homepage HTML
// so the per-size hash matches; swapping the size segment without
// the matching hash returns 400. Rebuild by re-curl'ing
// thrivesequim.com if any of these ever start 4xx'ing.
const THRIVE_PHOTOS = [
  // Hero: unity hands, 2800xorig
  "https://d14f1v6bh52agh.cloudfront.net/DuCZykL4UDVfSxG8c9AH4OkkwZc=/fit-in/2800xorig/filters:format(jpeg)/uploads/8MFHI6DPgjtZPpNgAsYoyFY7ET1TlwGvkoXonzB4.jpeg",
  // Thrive Groups
  "https://d14f1v6bh52agh.cloudfront.net/4ZtPc_fx2xud5CWkh8V1eOL0Mkk=/fit-in/1080xorig/filters:format(jpeg)/uploads/sO3Yk8zNCXKS5P5UDJZLDGuaitOvi6eOxCBRmAOt.jpeg",
  // Thrive Preschool (colored pencils)
  "https://d14f1v6bh52agh.cloudfront.net/1SLqPHuW5AsQnOCZu6Ou0LTC0QE=/fit-in/1080xorig/filters:format(jpeg)/uploads/xmKv1KhEPWemy1KKN7FZGoKrLTVQXvwvQBsAm0hp.png",
  // Worship (B&W hands raised)
  "https://d14f1v6bh52agh.cloudfront.net/TSlsP9hoYUTQVx07RacX7McteBQ=/fit-in/800xorig/filters:format(jpeg)/uploads/h58dH5ysNGE6gTtAy2jcfM8aaSsbeL9kdvCN52q5.jpeg",
  // Across the Street outreach
  "https://d14f1v6bh52agh.cloudfront.net/UFDQgJLcdrTtNh6ErRMUYFDiXC0=/fit-in/800xorig/filters:format(jpeg)/uploads/Hzhb1sg37QNZ5kNkVOYhR3Ib2rDyqXF4c73QCbJ2.png",
  // Leadership/teaching
  "https://d14f1v6bh52agh.cloudfront.net/UJIzhNW_gLlrBjjdYKRs8HBoZmU=/fit-in/800xorig/filters:format(jpeg)/uploads/KyJ1od9ck0UKFLsLsMiC7gDy4MgyBjIBdbCTCrxl.png",
  // Community program imagery
  "https://d14f1v6bh52agh.cloudfront.net/s4htqjuyjL170xxlwGS5LnfsgCQ=/fit-in/800xorig/filters:format(jpeg)/uploads/msoKIaakyiGIX02Jkk0R6lPtbK3TNtOk1dDGujvs.png",
  // Bible study / fellowship
  "https://d14f1v6bh52agh.cloudfront.net/ry9xVtwrPJ2psV6uwPG4LM7vf9s=/fit-in/800xorig/filters:format(jpeg)/uploads/uw5qwuUma2cRC00pqfQmRLSaEQMm5YOKKbrIjZDv.png",
  // Table of Grace
  "https://d14f1v6bh52agh.cloudfront.net/tRP4kKbX4gCkRyHIFzdYaOjPFWY=/fit-in/800xorig/filters:format(jpeg)/uploads/N1JBgxQN6bhfnHXz2zZbw45PqTByCO9GuXrRFLty.jpeg",
  // Missional Giving
  "https://d14f1v6bh52agh.cloudfront.net/M7dEp9wy-SkRrvOIaiL-3TjX2eQ=/fit-in/800xorig/filters:format(jpeg)/uploads/PlhyTezJoZyvdzsbMr0r49h2T88NbQ6OWfLN8BJm.jpeg",
];

const THRIVE_LOGO = "https://d14f1v6bh52agh.cloudfront.net/Ijy_9JOEIn1LuHHRRsbks6W_lRg=/fit-in/180x180/uploads/XGKRdayYpSNeyHykRjxGPxlF28j60RPHTdA0i0JZ.png";

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Check if already exists by website
  const { data: existing } = await sb
    .from("prospects")
    .select("id,business_name,short_code")
    .eq("current_website", "https://thrivesequim.com")
    .limit(1)
    .single();

  const id = (existing?.id as string) || randomUUID();
  const shortCode = crypto.createHash("md5").update(id).digest("hex").slice(0, 8);
  const isUpdate = Boolean(existing);

  console.log(`\n${isUpdate ? "Updating" : "Creating"} Thrive Church`);
  console.log(`  id:         ${id}`);
  console.log(`  short_code: ${shortCode}`);
  console.log(`  preview:    https://bluejayportfolio.com/p/${shortCode}`);
  console.log();

  const scrapedData = {
    businessName: "Thrive Church",
    tagline: "Imperfect people becoming the church.",
    about:
      "Thrive Church is a community of imperfect people becoming the church, on the mission with Jesus, to bring hope and healing to the world. We gather Sundays at 10:30am at 640 N. Sequim Ave — come as you are. Led by Pastor David Lyke alongside his wife Megan, our family includes Thrive Kids, Thrive Preschool, Thrive Groups, and Table of Grace — serving Sequim neighbors across the street and around the world.",
    accentColor: "#0d9488", // teal — matches the Thrive brand overlay on their hero
    brandColor: "#0d9488",
    brandColorSource: "official-site",
    logoUrl: THRIVE_LOGO,
    photos: THRIVE_PHOTOS,
    services: [
      { name: "Sunday Gatherings", description: "In-person worship every Sunday at 10:30am. Come as you are — we save a seat for you." },
      { name: "Thrive Groups", description: "Small groups meeting throughout the week across Sequim. This is where life change happens around real conversations, real meals, real people." },
      { name: "Thrive Kids", description: "A safe, fun, Jesus-centered experience for kids from birth through 5th grade every Sunday morning — led by Megan Lyke and our volunteer team." },
      { name: "Thrive Preschool", description: "Christ-centered preschool education now enrolling for the 2025-2026 year. Helping your child grow academically, socially, and spiritually." },
      { name: "Table of Grace", description: "Our weekly community meal meeting real needs for real neighbors — everyone welcome at the table, no questions asked." },
      { name: "Across the Street", description: "Local outreach into the Sequim community — serving our neighbors right here on the Olympic Peninsula." },
      { name: "Missional Giving", description: "Partnering with missionaries and organizations bringing hope and healing around the world." },
      { name: "Thrive Online", description: "Can't make it in person? Watch past messages and follow along with our teaching online." },
    ],
    stats: [
      { label: "Sunday Service", value: "10:30am" },
      { label: "Age-specific Ministries", value: "4+" },
      { label: "Community Programs", value: "6" },
      { label: "Years Serving Sequim", value: "10+" },
    ],
    testimonials: [
      { name: "A Thrive family", text: "Walked in for the first time on a Sunday and felt like we'd been there for years. This place loves people the way Jesus does.", rating: 5 },
      { name: "Thrive Preschool parent", text: "My kids come home singing worship songs and telling me about Jesus. You can feel how much every volunteer here cares.", rating: 5 },
      { name: "Thrive Groups member", text: "My Thrive Group became my people. That's where I actually met Jesus — over dinner in someone's living room.", rating: 5 },
    ],
    serviceAreas: [
      "Sequim", "Port Angeles", "Port Townsend", "Carlsborg", "Dungeness",
      "Diamond Point", "Blyn", "Agnew", "Gardiner", "Chimacum", "Quilcene",
    ],
    socialLinks: {
      facebook: "https://www.facebook.com/thrivesequim",
      instagram: "https://www.instagram.com/thrivesequim",
    },
    hours: "Sundays 10:30am",
    city: "Sequim, WA",
    address: "640 N. Sequim Ave, Sequim, WA 98382",
    phone: "(360) 683-7981",
    email: "office@thrivesequim.com",
    currentWebsite: "https://thrivesequim.com",
    heroTagline: "Come as you are. Grow with us.",
    hideBeforeAfter: true,
  };

  const prospectRow = {
    id,
    business_name: "Thrive Church",
    category: "church" as const,
    city: "Sequim, WA",
    state: "WA",
    address: "640 N. Sequim Ave, Sequim, WA 98382",
    phone: "(360) 683-7981",
    email: "office@thrivesequim.com",
    current_website: "https://thrivesequim.com",
    status: "ready_to_review" as const,
    short_code: shortCode,
    generated_site_url: `/preview/${id}`,
    scraped_data: scrapedData,
    pricing_tier: "standard" as const,
    selected_theme: "dark" as const,
    ai_theme_recommendation: "light" as const,
  };

  const siteData = {
    id,
    businessName: "Thrive Church",
    category: "church",
    city: "Sequim, WA",
    address: "640 N. Sequim Ave, Sequim, WA 98382",
    phone: "(360) 683-7981",
    email: "office@thrivesequim.com",
    tagline: "Imperfect people becoming the church.",
    heroTagline: "Come as you are. Grow with us.",
    about: scrapedData.about,
    accentColor: scrapedData.accentColor,
    logoUrl: THRIVE_LOGO,
    photos: THRIVE_PHOTOS,
    services: scrapedData.services,
    stats: scrapedData.stats,
    testimonials: scrapedData.testimonials,
    serviceAreas: scrapedData.serviceAreas,
    socialLinks: scrapedData.socialLinks,
    hours: scrapedData.hours,
    brandColorSource: "official-site",
    hideBeforeAfter: true,
  };

  if (dryRun) {
    console.log("─".repeat(70));
    console.log("Prospect row preview:");
    console.log(JSON.stringify({ ...prospectRow, scraped_data: "<redacted>" }, null, 2));
    console.log(`\nsite_data: ${Object.keys(siteData).length} top-level keys`);
    console.log(`\n[DRY RUN] Re-run with --apply to write.`);
    return;
  }

  // Insert or update prospect (plain upsert — primary key is id)
  if (isUpdate) {
    const { error } = await sb.from("prospects").update(prospectRow).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await sb.from("prospects").insert(prospectRow);
    if (error) throw error;
  }

  // Same for generated_sites
  const { data: existingSite } = await sb
    .from("generated_sites")
    .select("id")
    .eq("prospect_id", id)
    .limit(1)
    .single();
  if (existingSite) {
    const { error } = await sb.from("generated_sites").update({ site_data: siteData }).eq("prospect_id", id);
    if (error) throw error;
  } else {
    const { error } = await sb.from("generated_sites").insert({ prospect_id: id, site_data: siteData });
    if (error) throw error;
  }

  console.log(`[APPLIED]`);
  console.log(`  View:    https://bluejayportfolio.com/p/${shortCode}`);
  console.log(`  Dashboard: check the Leads table (filter: Church category)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
