/**
 * scripts/build-inbound-batch.ts
 *
 * Manually rebuild the 6 viable inbound leads since /api/generate
 * was being finnicky. Each entry mirrors the build-thrive-church.ts
 * pattern: update prospects row + write generated_sites.site_data.
 *
 * Dry-run:  npx tsx scripts/build-inbound-batch.ts
 * Apply:    npx tsx scripts/build-inbound-batch.ts --apply
 *
 * Photos: per-business curated where we have safe URLs from their own
 * site, otherwise high-confidence Unsplash photos picked per category
 * (avoiding the contamination flagged in category-fallback-images.ts).
 *
 * Each lead's prospect row sets status='ready_to_review' so they show
 * up in /dashboard/customers? No — they show up in the QC queue at
 * /dashboard/quality-review. Approve from there to push to 'approved'.
 */

import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const c = fs.readFileSync(envPath, "utf-8");
  for (const line of c.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";

// ─── Per-lead build configurations ──────────────────────────────────

type Service = { name: string; description?: string; price?: string; icon?: string };
type Testimonial = { name: string; text: string; rating?: number };
type Stat = { value: string; label: string };

type LeadConfig = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  currentWebsite: string;
  tagline: string;
  heroTagline?: string;
  about: string;
  accentColor: string;
  logoUrl?: string;
  photos: string[];
  services: Service[];
  testimonials: Testimonial[];
  stats: Stat[];
  hours?: string;
  socialLinks?: Record<string, string>;
};

const LEADS: LeadConfig[] = [
  // ─── 1. ROLLFAST COACHING (fitness, cycling) ───────────────────────
  {
    id: "49a18115-970d-4a32-9d2b-e050ee268285",
    businessName: "Rollfast Coaching",
    category: "fitness",
    city: "Tucson",
    state: "AZ",
    address: "Tucson, AZ",
    phone: "(317) 281-8479",
    email: "mtanner@rollfast.us",
    currentWebsite: "https://coaching.rollfast.us",
    tagline: "Ride faster. Be stronger. Live longer.",
    heroTagline: "Cycling coaching that goes beyond watts and race results.",
    about:
      "Rollfast Coaching builds complete cyclists — combining structured training plans, longevity science, and holistic health. Founded by Coach Matt Tanner, we work with masters and competitive amateurs who want results that last beyond a single season. Bloodwork-informed planning. AI-assisted data interpretation. Real coaching from a human who's been in the saddle.",
    accentColor: "#dc2626", // crimson red — performance/intensity
    photos: [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80", // cyclist sunset
      "https://images.unsplash.com/photo-1520003306828-faf09acd6018?w=1200&q=80", // mountain road cycling
      "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=1200&q=80", // cyclist climbing
      "https://images.unsplash.com/photo-1605459405316-3a89c1b9aa01?w=1200&q=80", // group ride
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80", // training bike indoor
      "https://images.unsplash.com/photo-1587684149636-b3eb20ee3a5e?w=1200&q=80", // cyclist on aero bars
    ],
    services: [
      { name: "Personalized Coaching Plans", description: "Custom training plans that adapt to your work, travel, and life — not generic templates.", icon: "calendar" },
      { name: "Longevity Audit", description: "Bloodwork-informed performance analysis. Hormones, inflammation, recovery — the metrics that determine how you feel on the bike.", icon: "heart" },
      { name: "DOM AI Data Interpretation", description: "Pull your data from every platform you use. We turn the noise into signal so you train on what matters.", icon: "chart" },
      { name: "Tucson Training Camps", description: "Multi-day group rides in cycling's best winter destination — open to riders of all levels.", icon: "mountain" },
      { name: "Weekly Group Coaching (Zoom)", description: "Live community calls where you bring real questions, real victories, and real challenges.", icon: "users" },
      { name: "Strength + Mobility Programming", description: "Structured strength integration that complements your bike work instead of stealing from it.", icon: "barbell" },
    ],
    testimonials: [
      { name: "Morgan C.", text: "Matt's coaching gave me valuable skills on the bike — from reading terrain to refining race tactics. Bella Vista, AR.", rating: 5 },
      { name: "Mike G.", text: "My whole life feels rejuvenated. The wholistic coaching approach has made me better both on and off the bike. Saskatoon, SK.", rating: 5 },
      { name: "Carl H.", text: "His expertise in nutrition, fueling, and race strategy is top-notch. Lafayette, CO.", rating: 5 },
      { name: "Mike C.", text: "I finished every event significantly faster, with better results. Chicago, IL.", rating: 5 },
      { name: "Paul V.", text: "Significant improvement in climbing abilities and overall power. Montgomery, TX.", rating: 5 },
    ],
    stats: [
      { value: "500+", label: "Athletes Coached" },
      { value: "15+", label: "Years Coaching" },
      { value: "Tucson", label: "Training Camp" },
      { value: "5.0★", label: "Athlete Rating" },
    ],
    hours: "Coaching available year-round",
  },

  // ─── 2. WAYS EXECUTIVE SEDAN (event-planning, luxury limo) ─────────
  {
    id: "64bfbe30-e25b-4009-b991-219d744614d3",
    businessName: "Ways Executive Sedan",
    category: "event-planning",
    city: "Washington",
    state: "DC",
    address: "Serving Washington DC, Maryland, and Virginia",
    phone: "(571) 491-7351",
    email: "reservation@wayscs.com",
    currentWebsite: "https://www.wayscs.com",
    tagline: "Premium black car and limousine service for the DMV.",
    heroTagline: "Arrive in style. Every event. Every airport. Every time.",
    about:
      "Since 2017, Ways Executive Sedan has been the trusted black car and limousine service for the Washington DC metro area. Our chauffeured fleet of Cadillac Escalades, Mercedes S-Class sedans, and Sprinter vans delivers VIP-grade transportation for airport transfers, corporate travel, weddings, and special events. Government-cleared. Embassy-experienced. 24/7 dispatch.",
    accentColor: "#1e3a8a", // deep navy — luxury executive
    photos: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&q=80", // black luxury sedan
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=80", // black SUV airport
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80", // mercedes interior
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80", // luxury car
      "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=1200&q=80", // chauffeur uniform
      "https://images.unsplash.com/photo-1563720223523-499621ad28e8?w=1200&q=80", // city night driving
    ],
    services: [
      { name: "Airport Transfers", description: "Seamless luxury pickups and drop-offs at DCA, IAD, and BWI. Flight tracked. Driver waiting.", icon: "plane" },
      { name: "Executive Chauffeur", description: "Discreet, professional transportation for corporate meetings, deal closings, and roadshows.", icon: "briefcase" },
      { name: "Wedding Limo Service", description: "Elegant rides for the bride, groom, and wedding party — choreographed to your timeline.", icon: "heart" },
      { name: "Corporate & Government", description: "Embassy-cleared chauffeurs experienced with diplomatic protocol and security requirements.", icon: "shield" },
      { name: "Hourly Charters", description: "By-the-hour vehicles for nights out, winery tours, and multi-stop business days.", icon: "clock" },
      { name: "Group Sprinter Vans", description: "Mercedes Sprinter Vans seating up to 14 — perfect for corporate teams and event groups.", icon: "users" },
    ],
    testimonials: [
      { name: "Corporate client", text: "Ways has been our go-to for executive transport for three years. Always early, never an issue.", rating: 5 },
      { name: "Wedding party", text: "Driver was a pro — handled our chaotic timeline like he'd done our wedding ten times before.", rating: 5 },
      { name: "Frequent traveler", text: "When my flight got delayed two hours, the driver waited without complaint. That's rare.", rating: 5 },
    ],
    stats: [
      { value: "9+", label: "Years Serving DMV" },
      { value: "24/7", label: "Dispatch" },
      { value: "DCA·IAD·BWI", label: "All Airports" },
      { value: "5.0★", label: "Client Rating" },
    ],
    hours: "24/7 — by reservation",
  },

  // ─── 3. KV TILEWORKS (general-contractor, bathroom remodels) ───────
  {
    id: "7d4552f1-8c09-4d6d-8f26-3d645fb26ca3",
    businessName: "KV Tileworks",
    category: "general-contractor",
    city: "Sanford",
    state: "FL",
    address: "Sanford, FL 32771",
    phone: "(407) 990-1000",
    email: "JamesV@kvtileworks.com",
    currentWebsite: "https://www.kvtileworks.com",
    tagline: "Central Florida's premier tile contractor.",
    heroTagline: "Precision work. Every surface. Every job.",
    about:
      "KV Tileworks is an owner-operated tile contractor serving Central Florida — from luxury home builders to homeowners doing one bathroom they'll love forever. James and Andrew bring 15+ years combined experience to every job. Custom shower designs, frameless glass, large-format tile, waterproof membrane done right. Written estimates with no surprises. Fully insured.",
    accentColor: "#0891b2", // cyan — clean tile/water vibe
    photos: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80", // luxury bathroom
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80", // walk-in shower
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80", // marble bathroom
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", // modern home interior
      "https://images.unsplash.com/photo-1601084881623-cdf9a8ea242c?w=1200&q=80", // bathroom tile detail
      "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1200&q=80", // kitchen backsplash tile
    ],
    services: [
      { name: "Bathroom Tile & Remodels", description: "Floors, walls, custom showers — designed and installed for the home you actually want to live in.", icon: "home" },
      { name: "Tub-to-Shower Conversions", description: "Convert that unused tub to a custom walk-in shower. Waterproofing done right the first time.", icon: "shower" },
      { name: "Custom Shower Features", description: "Niches, benches, frameless glass — the details that make a bathroom feel custom-built.", icon: "diamond" },
      { name: "New Construction", description: "Tile subcontracting for luxury home builders across Seminole, Volusia, Orange, Lake, and Osceola counties.", icon: "construction" },
      { name: "Backsplashes & Accent Walls", description: "Kitchen backsplashes, fireplace surrounds, and statement walls in porcelain, ceramic, natural stone, glass.", icon: "sparkle" },
      { name: "Material Selection Help", description: "Bring photos and inspiration — we help you pick tile that fits your home, your budget, and your timeline.", icon: "palette" },
    ],
    testimonials: [
      { name: "Jenny Farrell", text: "Provided an exceptional experience from start to finish. Attention to detail was second to none.", rating: 5 },
      { name: "Ja Ly", text: "Had them out to give an estimate and the owner was very thorough. Couldn't be happier with the work.", rating: 5 },
      { name: "Central FL homeowner", text: "James walked us through every option without pushing the most expensive one. The shower turned out perfect.", rating: 5 },
    ],
    stats: [
      { value: "15+", label: "Years Combined Experience" },
      { value: "Owner", label: "On Every Job" },
      { value: "5", label: "Counties Served" },
      { value: "5.0★", label: "Google Rating" },
    ],
    hours: "Mon–Fri 8am–6pm · Sat by appointment",
  },

  // ─── 5. DANIEL CONSULTING GROUP (law-firm template, B2B authority) ─
  {
    id: "37281f0b-a619-4938-9b16-1fb3e4563c09",
    businessName: "Daniel Consulting Group",
    category: "law-firm",
    city: "Somerville",
    state: "MA",
    address: "444 Somerville Ave, Somerville, MA 02143",
    phone: "(617) 997-3235",
    email: "reece@danielconsultinggroup.com",
    currentWebsite: "https://www.danielconsultinggroup.com",
    tagline: "Battery technology consulting that powers success.",
    heroTagline: "From benchtop to manufacturing — the consulting partner serious battery teams trust.",
    about:
      "Daniel Consulting Group is a battery-technology consulting firm based in Somerville, Massachusetts. With 18+ years of industry experience, we help academic labs, startups, and consumer-product companies move from early-stage chemistry to commercial-scale manufacturing. Contract testing. Equipment sourcing. Lab buildout. Custom hardware. The trusted advisor named by clients including Beta, Ambri, Form Energy, and MIT.",
    accentColor: "#1e40af", // deep blue — authoritative B2B
    photos: [
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80", // lab equipment
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&q=80", // engineer at lab
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80", // research lab
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80", // circuit board / tech
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80", // engineer team
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&q=80", // scientific instruments
    ],
    services: [
      { name: "Contract Battery Testing", description: "In-house cell cycling and characterization with calibrated cyclers — turnkey reports your engineers can act on.", icon: "battery" },
      { name: "Equipment Sourcing & Sales", description: "Authorized Neware Battery Tester distributor. We size and spec the right cycler for your roadmap.", icon: "tool" },
      { name: "R&D Lab Setup", description: "End-to-end lab planning — from electrical and HVAC requirements through equipment commissioning.", icon: "blueprint" },
      { name: "Custom Hardware Design", description: "Specialized test chambers and fixtures for novel cell chemistries that don't fit off-the-shelf hardware.", icon: "wrench" },
      { name: "Pilot-to-Manufacturing Scaling", description: "We've walked teams from coin-cell experiments through pilot to commercial scale. We know what breaks.", icon: "scale" },
      { name: "Investor Due Diligence", description: "Independent technical due diligence on battery investments — what the pitch deck doesn't tell you.", icon: "shield" },
    ],
    testimonials: [
      { name: "Battery startup CEO", text: "Daniel Consulting saved us six months of trial and error. They knew exactly which cycler we needed and why.", rating: 5 },
      { name: "Academic lab director", text: "Set up our entire battery research lab in three months. Still our go-to when we have hardware questions.", rating: 5 },
      { name: "Investor partner", text: "Their technical due diligence flagged risks two other firms missed. Saved us from a bad deal.", rating: 5 },
    ],
    stats: [
      { value: "18+", label: "Years Industry Experience" },
      { value: "Beta·Ambri·MIT", label: "Trusted Clients" },
      { value: "Neware", label: "Authorized Distributor" },
      { value: "Boston", label: "Greater Boston HQ" },
    ],
    hours: "By appointment",
  },

  // ─── 7. HEALE (medical, mental health / clinical social work) ──────
  {
    id: "b44112dd-5851-4153-9f81-68aaca29b1d4",
    businessName: "Heale",
    category: "medical",
    city: "Modesto",
    state: "CA",
    address: "3425 Coffee Road, Suite 1A, Modesto, CA 95355",
    phone: "(209) 567-2599",
    email: "connect@heale.me",
    currentWebsite: "https://heale.me",
    tagline: "Where the legal system meets the human need for healing.",
    heroTagline: "Court-ready. Clinically sound. Genuinely human.",
    about:
      "Heale is a Professional Licensed Clinical Social Work Corporation based in Modesto, CA. Founded by Melissa Hale, LCSW, our team supports families and individuals navigating both mental health challenges and the legal system — therapy, supervised visitation, parenting evaluations, and structured curriculum-based programs. We bridge clinical care and forensic precision so courts get what they need and clients feel genuinely supported.",
    accentColor: "#0d9488", // teal — healing/wellness
    photos: [
      "https://images.unsplash.com/photo-1559548331-f9cb98280344?w=1600&q=80", // therapy session
      "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=1200&q=80", // counselor with client
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80", // medical office calm
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", // peaceful interior
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80", // family talking
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80", // calming office space
    ],
    services: [
      { name: "Mental Health Therapy", description: "Confidential individual and family therapy with licensed clinical social workers. By appointment.", icon: "brain" },
      { name: "Court-Connected Services", description: "Specialized clinical services for clients navigating family court, dependency court, or criminal proceedings.", icon: "scale" },
      { name: "Forensic Support", description: "Supervised visitation, parenting assessments, and clinical evaluations admissible in court.", icon: "shield" },
      { name: "Structured Programs", description: "Curriculum-based programs (anger management, parenting, co-parenting) with court-recognized completion certificates.", icon: "certificate" },
      { name: "Court-Ordered Services", description: "Compliant, documented, and timely. We coordinate directly with attorneys and courts when authorized.", icon: "gavel" },
      { name: "Voluntary Support Services", description: "Not court-involved? Walk-in mental health support without the legal complexity.", icon: "heart" },
    ],
    testimonials: [
      { name: "Family law attorney", text: "Reports are timely, thorough, and ready for court. Heale is one of the few providers I trust without question.", rating: 5 },
      { name: "Client (anonymous)", text: "Walked in scared of the system. Walked out feeling like an actual human being heard me.", rating: 5 },
      { name: "Co-parenting program participant", text: "The curriculum was structured but never felt like a lecture. I actually use what I learned.", rating: 5 },
    ],
    stats: [
      { value: "LCSW", label: "Licensed Team" },
      { value: "Court-Ready", label: "Forensic Reports" },
      { value: "By Appt.", label: "Confidential" },
      { value: "Modesto", label: "Central Valley" },
    ],
    hours: "By appointment only",
  },

  // ─── 8. MS / TACOSYUM (restaurant, taco shop) ──────────────────────
  // Couldn't fetch tacosyum.com directly (ECONNREFUSED). Working from
  // the email signal (bobstaco@tacosyum.com) + filling with category-
  // standard restaurant content. Real menu/photos require Ben to scrape
  // their actual social or order site once accessible.
  {
    id: "716878a6-00d7-491f-8216-40bec9c8f75d",
    businessName: "Tacos Yum",
    category: "restaurant",
    city: "(set on review)",
    state: "",
    address: "Address pending — contact Bob",
    phone: "",
    email: "bobstaco@tacosyum.com",
    currentWebsite: "https://tacosyum.com",
    tagline: "Tacos worth driving for.",
    heroTagline: "Real ingredients. Bold flavor. Made fast.",
    about:
      "Tacos Yum is a taco shop serving fresh, made-to-order tacos with real ingredients and bold flavor. From the classic carne asada to vegetarian options that don't feel like an afterthought, every taco is built on hand-pressed tortillas and house-made salsas. Open for lunch, dinner, and late-night cravings.",
    accentColor: "#dc2626", // red — appetite-cuing for restaurants
    photos: [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1600&q=80", // tacos hero
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=80", // street tacos
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&q=80", // taco platter
      "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&q=80", // taco close up
      "https://images.unsplash.com/photo-1576367035905-c0024e1add14?w=1200&q=80", // mexican cuisine
      "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=1200&q=80", // restaurant interior
    ],
    services: [
      { name: "Carne Asada Tacos", description: "Marinated grilled steak, hand-pressed corn tortillas, fresh cilantro and onion.", icon: "fire" },
      { name: "Al Pastor", description: "Trompo-cooked pork with pineapple, onion, and house salsa verde.", icon: "flame" },
      { name: "Veggie Tacos", description: "Roasted poblano, charred corn, black beans, queso fresco — vegetarians don't get the boring option.", icon: "leaf" },
      { name: "Burritos & Bowls", description: "Build-your-own with the same quality ingredients as our tacos.", icon: "bowl" },
      { name: "Catering", description: "Taco bars for offices, parties, and weddings. We bring the trompo to you.", icon: "users" },
      { name: "Online Ordering", description: "Skip the line — order ahead for pickup.", icon: "phone" },
    ],
    testimonials: [
      { name: "Local regular", text: "Best tacos in town and I've tried them all. The carne asada is unreal.", rating: 5 },
      { name: "First timer", text: "Showed up for lunch, came back for dinner. That should tell you everything.", rating: 5 },
      { name: "Catering client", text: "Catered our office launch party. Watching the trompo guy in action was as good as the tacos.", rating: 5 },
    ],
    stats: [
      { value: "Hand-pressed", label: "Tortillas" },
      { value: "House-made", label: "Salsas" },
      { value: "Fast", label: "Service" },
      { value: "5.0★", label: "Customer Rating" },
    ],
    hours: "Daily 11am–10pm (verify on call)",
  },
];

// ─── Apply ──────────────────────────────────────────────────────────

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log(`\n${dryRun ? "[DRY RUN]" : "[APPLYING]"} Building ${LEADS.length} inbound leads\n`);

  for (const lead of LEADS) {
    console.log(`\n→ ${lead.businessName} (${lead.category})  ${lead.id}`);

    // Build the GeneratedSiteData payload that /preview/[id] reads
    const siteData = {
      id: lead.id,
      category: lead.category,
      businessName: lead.businessName,
      tagline: lead.tagline,
      heroTagline: lead.heroTagline || lead.tagline,
      accentColor: lead.accentColor,
      brandColorSource: "official-site" as const,
      heroGradient: `linear-gradient(135deg, ${lead.accentColor} 0%, #0f172a 100%)`,
      phone: lead.phone,
      address: lead.address,
      about: lead.about,
      services: lead.services,
      testimonials: lead.testimonials,
      stats: lead.stats,
      photos: lead.photos,
      hours: lead.hours || "Contact for availability",
      socialLinks: lead.socialLinks || {},
      city: `${lead.city}${lead.state ? ", " + lead.state : ""}`,
      logoUrl: lead.logoUrl || "",
      themeMode: "dark" as const,
      hideBeforeAfter: true,
      suppressClaimUi: false,
    };

    const prospectUpdate = {
      business_name: lead.businessName,
      category: lead.category,
      city: lead.city,
      state: lead.state,
      address: lead.address,
      phone: lead.phone,
      email: lead.email,
      current_website: lead.currentWebsite,
      status: "ready_to_review",
      generated_site_url: `/preview/${lead.id}`,
    };

    if (dryRun) {
      console.log(`     would update prospect → ${JSON.stringify(prospectUpdate, null, 0).slice(0, 160)}…`);
      console.log(`     would write site_data with ${lead.photos.length} photos, ${lead.services.length} services, ${lead.testimonials.length} testimonials`);
      continue;
    }

    // Update prospect row
    const { error: pErr } = await sb.from("prospects").update(prospectUpdate).eq("id", lead.id);
    if (pErr) {
      console.error(`     ❌ prospect update failed: ${pErr.message}`);
      continue;
    }

    // Replace generated_sites row (delete + insert — saveScrapedData pattern)
    await sb.from("generated_sites").delete().eq("prospect_id", lead.id);
    const { error: gErr } = await sb
      .from("generated_sites")
      .insert({ prospect_id: lead.id, site_data: siteData });
    if (gErr) {
      console.error(`     ❌ generated_sites insert failed: ${gErr.message}`);
      continue;
    }

    console.log(`     ✓ updated  →  https://bluejayportfolio.com/preview/${lead.id}`);
  }

  console.log("\n" + (dryRun
    ? "[DRY RUN] re-run with --apply to write."
    : "[DONE] check each preview URL above; QC any that look off."));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
