/**
 * Generates SEO-optimized layout.tsx files for all /v2/[category] portfolio showcase pages.
 * Targets business owners searching "[category] website design" queries.
 *
 * Run: npx tsx scripts/seo-layouts.ts
 */

import fs from "fs";
import path from "path";

interface CategorySeo {
  slug: string;
  displayName: string;
  title: string;
  description: string;
  keywords: string;
}

const SEO_DATA: CategorySeo[] = [
  {
    slug: "accounting",
    displayName: "Accounting & CPA",
    title: "Accounting & CPA Website Design | Live Example — BlueJays",
    description:
      "See a premium accounting and CPA firm website in action. BlueJays builds custom accounting websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "accounting website design, CPA website design, tax firm website, bookkeeping website",
  },
  {
    slug: "appliance-repair",
    displayName: "Appliance Repair",
    title: "Appliance Repair Website Design | Live Example — BlueJays",
    description:
      "See a premium appliance repair business website in action. BlueJays builds custom appliance repair websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "appliance repair website design, appliance service website, repair business website",
  },
  {
    slug: "auto-repair",
    displayName: "Auto Repair",
    title: "Auto Repair Website Design | Live Example — BlueJays",
    description:
      "See a premium auto repair and mechanic shop website in action. BlueJays builds custom auto repair websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    keywords:
      "auto repair website design, mechanic shop website, car repair website, automotive website",
  },
  {
    slug: "carpet-cleaning",
    displayName: "Carpet Cleaning",
    title: "Carpet Cleaning Website Design | Live Example — BlueJays",
    description:
      "See a premium carpet cleaning business website in action. BlueJays builds custom carpet cleaning websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "carpet cleaning website design, carpet cleaner website, floor cleaning website",
  },
  {
    slug: "catering",
    displayName: "Catering",
    title: "Catering Business Website Design | Live Example — BlueJays",
    description:
      "See a premium catering company website in action. BlueJays builds custom catering websites starting at $997 — full custom design, domain, and hosting. 48-hour turnaround.",
    keywords:
      "catering website design, catering company website, event catering website, food service website",
  },
  {
    slug: "chiropractic",
    displayName: "Chiropractic",
    title: "Chiropractic Website Design | Live Example — BlueJays",
    description:
      "See a premium chiropractic clinic website in action. BlueJays builds custom chiropractic websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "chiropractic website design, chiropractor website, spine clinic website, chiro practice website",
  },
  {
    slug: "church",
    displayName: "Church",
    title: "Church Website Design | Live Example — BlueJays",
    description:
      "See a premium church and ministry website in action. BlueJays builds custom church websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "church website design, ministry website, congregation website, faith community website",
  },
  {
    slug: "cleaning",
    displayName: "Cleaning Service",
    title: "Cleaning Service Website Design | Live Example — BlueJays",
    description:
      "See a premium house and office cleaning business website in action. BlueJays builds custom cleaning service websites starting at $997 — custom design, domain, and hosting.",
    keywords:
      "cleaning service website design, house cleaning website, maid service website, janitorial website",
  },
  {
    slug: "construction",
    displayName: "Construction",
    title: "Construction Company Website Design | Live Example — BlueJays",
    description:
      "See a premium construction company website in action. BlueJays builds custom construction websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "construction website design, construction company website, contractor website, builder website",
  },
  {
    slug: "daycare",
    displayName: "Daycare & Childcare",
    title: "Daycare & Childcare Website Design | Live Example — BlueJays",
    description:
      "See a premium daycare and childcare center website in action. BlueJays builds custom childcare websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "daycare website design, childcare website design, preschool website, child care center website",
  },
  {
    slug: "dental",
    displayName: "Dental Practice",
    title: "Dental Practice Website Design | Live Example — BlueJays",
    description:
      "See a premium dental practice website in action. BlueJays builds custom dental websites starting at $997 — custom design, domain, and hosting included. New patients, insurance sections, and more.",
    keywords:
      "dental website design, dentist website, dental practice website, dental office website design",
  },
  {
    slug: "electrician",
    displayName: "Electrician",
    title: "Electrician Website Design | Live Example — BlueJays",
    description:
      "See a premium licensed electrician website in action. BlueJays builds custom electrician websites starting at $997 — full custom design, domain, and hosting. 48-hour launch.",
    keywords:
      "electrician website design, electrical contractor website, licensed electrician website, electric company website",
  },
  {
    slug: "event-planning",
    displayName: "Event Planning",
    title: "Event Planning Website Design | Live Example — BlueJays",
    description:
      "See a premium event planning and coordination website in action. BlueJays builds custom event planner websites starting at $997 — custom design, domain, and hosting included.",
    keywords:
      "event planning website design, event planner website, wedding planner website, event coordinator website",
  },
  {
    slug: "fencing",
    displayName: "Fencing",
    title: "Fencing Company Website Design | Live Example — BlueJays",
    description:
      "See a premium fencing contractor website in action. BlueJays builds custom fencing company websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "fencing website design, fence contractor website, fencing company website, fence installation website",
  },
  {
    slug: "fitness",
    displayName: "Fitness & Gym",
    title: "Fitness & Gym Website Design | Live Example — BlueJays",
    description:
      "See a premium fitness studio and gym website in action. BlueJays builds custom fitness websites starting at $997 — custom design, domain, and hosting. Membership pages, class schedules, and more.",
    keywords:
      "fitness website design, gym website design, personal trainer website, fitness studio website",
  },
  {
    slug: "florist",
    displayName: "Florist",
    title: "Florist Website Design | Live Example — BlueJays",
    description:
      "See a premium floral design and flower shop website in action. BlueJays builds custom florist websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "florist website design, flower shop website, floral design website, flower delivery website",
  },
  {
    slug: "garage-door",
    displayName: "Garage Door",
    title: "Garage Door Company Website Design | Live Example — BlueJays",
    description:
      "See a premium garage door installation and repair website in action. BlueJays builds custom garage door websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "garage door website design, garage door company website, garage door repair website, garage door installation website",
  },
  {
    slug: "general-contractor",
    displayName: "General Contractor",
    title: "General Contractor Website Design | Live Example — BlueJays",
    description:
      "See a premium general contractor website in action. BlueJays builds custom GC websites starting at $997 — full custom design, domain, and hosting included. 48-hour turnaround.",
    keywords:
      "general contractor website design, GC website, contractor website design, remodeling company website",
  },
  {
    slug: "hvac",
    displayName: "HVAC",
    title: "HVAC Company Website Design | Live Example — BlueJays",
    description:
      "See a premium HVAC heating and cooling website in action. BlueJays builds custom HVAC websites starting at $997 — custom design, domain, and hosting. Financing and emergency sections included.",
    keywords:
      "HVAC website design, heating and cooling website, air conditioning website, furnace repair website",
  },
  {
    slug: "insurance",
    displayName: "Insurance Agency",
    title: "Insurance Agency Website Design | Live Example — BlueJays",
    description:
      "See a premium insurance agency website in action. BlueJays builds custom insurance websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "insurance agency website design, insurance broker website, independent agent website, insurance company website",
  },
  {
    slug: "interior-design",
    displayName: "Interior Design",
    title: "Interior Design Website Design | Live Example — BlueJays",
    description:
      "See a premium interior design studio website in action. BlueJays builds custom interior design websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and more.",
    keywords:
      "interior design website design, interior designer website, home design website, design studio website",
  },
  {
    slug: "junk-removal",
    displayName: "Junk Removal",
    title: "Junk Removal Website Design | Live Example — BlueJays",
    description:
      "See a premium junk removal and hauling website in action. BlueJays builds custom junk removal websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "junk removal website design, junk hauling website, trash removal website, debris removal website",
  },
  {
    slug: "landscaping",
    displayName: "Landscaping",
    title: "Landscaping Company Website Design | Live Example — BlueJays",
    description:
      "See a premium landscaping and lawn care website in action. BlueJays builds custom landscaping websites starting at $997 — custom design, domain, and hosting. Seasonal services and more.",
    keywords:
      "landscaping website design, lawn care website, landscape company website, yard service website",
  },
  {
    slug: "law-firm",
    displayName: "Law Firm",
    title: "Law Firm Website Design | Live Example — BlueJays",
    description:
      "See a premium law firm and attorney website in action. BlueJays builds custom legal websites starting at $997 — full custom design, domain, and hosting. Free consultation CTAs and more.",
    keywords:
      "law firm website design, attorney website design, lawyer website, legal services website",
  },
  {
    slug: "locksmith",
    displayName: "Locksmith",
    title: "Locksmith Website Design | Live Example — BlueJays",
    description:
      "See a premium locksmith and security service website in action. BlueJays builds custom locksmith websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "locksmith website design, locksmith company website, security service website, key service website",
  },
  {
    slug: "martial-arts",
    displayName: "Martial Arts",
    title: "Martial Arts School Website Design | Live Example — BlueJays",
    description:
      "See a premium martial arts and self-defense school website in action. BlueJays builds custom martial arts websites starting at $997 — custom design, domain, and hosting included.",
    keywords:
      "martial arts website design, karate school website, MMA gym website, self-defense school website",
  },
  {
    slug: "med-spa",
    displayName: "Med Spa",
    title: "Med Spa Website Design | Live Example — BlueJays",
    description:
      "See a premium medical spa and aesthetics website in action. BlueJays builds custom med spa websites starting at $997 — custom design, domain, and hosting. Treatment menus and booking.",
    keywords:
      "med spa website design, medical spa website, aesthetics clinic website, Botox website design",
  },
  {
    slug: "medical",
    displayName: "Medical Practice",
    title: "Medical Practice Website Design | Live Example — BlueJays",
    description:
      "See a premium medical practice and clinic website in action. BlueJays builds custom medical websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "medical website design, medical practice website, clinic website design, doctor website",
  },
  {
    slug: "moving",
    displayName: "Moving Company",
    title: "Moving Company Website Design | Live Example — BlueJays",
    description:
      "See a premium moving company website in action. BlueJays builds custom moving company websites starting at $997 — custom design, domain, and hosting. Quotes, process steps, and reviews.",
    keywords:
      "moving company website design, movers website, moving service website, relocation company website",
  },
  {
    slug: "painting",
    displayName: "Painting",
    title: "Painting Contractor Website Design | Live Example — BlueJays",
    description:
      "See a premium painting contractor website in action. BlueJays builds custom painting company websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "painting contractor website design, painter website, house painting website, commercial painting website",
  },
  {
    slug: "pest-control",
    displayName: "Pest Control",
    title: "Pest Control Website Design | Live Example — BlueJays",
    description:
      "See a premium pest control and exterminator website in action. BlueJays builds custom pest control websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    keywords:
      "pest control website design, exterminator website, pest management website, termite control website",
  },
  {
    slug: "pet-services",
    displayName: "Pet Services",
    title: "Pet Services Website Design | Live Example — BlueJays",
    description:
      "See a premium pet care and grooming website in action. BlueJays builds custom pet services websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "pet services website design, pet grooming website, dog boarding website, pet care website",
  },
  {
    slug: "photography",
    displayName: "Photography",
    title: "Photography Business Website Design | Live Example — BlueJays",
    description:
      "See a premium photography studio website in action. BlueJays builds custom photographer websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and booking.",
    keywords:
      "photography website design, photographer website, photo studio website, wedding photographer website",
  },
  {
    slug: "physical-therapy",
    displayName: "Physical Therapy",
    title: "Physical Therapy Website Design | Live Example — BlueJays",
    description:
      "See a premium physical therapy and rehab clinic website in action. BlueJays builds custom PT websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "physical therapy website design, PT clinic website, rehab center website, sports therapy website",
  },
  {
    slug: "plumber",
    displayName: "Plumbing",
    title: "Plumbing Company Website Design | Live Example — BlueJays",
    description:
      "See a premium licensed plumber website in action. BlueJays builds custom plumbing websites starting at $997 — custom design, domain, and hosting. 24/7 emergency, pricing, and trust sections.",
    keywords:
      "plumber website design, plumbing company website, plumbing contractor website, pipe repair website",
  },
  {
    slug: "pool-spa",
    displayName: "Pool & Spa",
    title: "Pool & Spa Website Design | Live Example — BlueJays",
    description:
      "See a premium pool and spa service website in action. BlueJays builds custom pool and spa websites starting at $997 — full custom design, domain, and hosting included.",
    keywords:
      "pool spa website design, pool service website, spa company website, pool installation website",
  },
  {
    slug: "pressure-washing",
    displayName: "Pressure Washing",
    title: "Pressure Washing Website Design | Live Example — BlueJays",
    description:
      "See a premium pressure washing and power washing website in action. BlueJays builds custom pressure washing websites starting at $997 — custom design, domain, and hosting included.",
    keywords:
      "pressure washing website design, power washing website, soft washing website, exterior cleaning website",
  },
  {
    slug: "real-estate",
    displayName: "Real Estate",
    title: "Real Estate Agent Website Design | Live Example — BlueJays",
    description:
      "See a premium real estate agent website in action. BlueJays builds custom real estate websites starting at $997 — custom design, domain, and hosting. Mortgage calculator, listings, and more.",
    keywords:
      "real estate website design, realtor website, real estate agent website, property website design",
  },
  {
    slug: "restaurant",
    displayName: "Restaurant",
    title: "Restaurant Website Design | Live Example — BlueJays",
    description:
      "See a premium restaurant and dining website in action. BlueJays builds custom restaurant websites starting at $997 — full custom design, domain, and hosting. Menu, reservations, and more.",
    keywords:
      "restaurant website design, food business website, dining website, cafe website design",
  },
  {
    slug: "roofing",
    displayName: "Roofing",
    title: "Roofing Company Website Design | Live Example — BlueJays",
    description:
      "See a premium roofing contractor website in action. BlueJays builds custom roofing websites starting at $997 — custom design, domain, and hosting. Insurance claims, financing, and more.",
    keywords:
      "roofing website design, roofing contractor website, roof repair website, roofer website",
  },
  {
    slug: "salon",
    displayName: "Hair Salon",
    title: "Hair Salon Website Design | Live Example — BlueJays",
    description:
      "See a premium hair salon and beauty studio website in action. BlueJays builds custom salon websites starting at $997 — custom design, domain, and hosting. Service menu, stylists, and booking.",
    keywords:
      "hair salon website design, beauty salon website, salon website, barbershop website design",
  },
  {
    slug: "tattoo",
    displayName: "Tattoo Shop",
    title: "Tattoo Shop Website Design | Live Example — BlueJays",
    description:
      "See a premium tattoo studio and parlor website in action. BlueJays builds custom tattoo websites starting at $997 — full custom design, domain, and hosting. Artist portfolios and booking.",
    keywords:
      "tattoo shop website design, tattoo studio website, tattoo parlor website, tattoo artist website",
  },
  {
    slug: "towing",
    displayName: "Towing",
    title: "Towing Company Website Design | Live Example — BlueJays",
    description:
      "See a premium towing and roadside assistance website in action. BlueJays builds custom towing company websites starting at $997 — custom design, domain, and hosting included.",
    keywords:
      "towing company website design, tow truck website, roadside assistance website, towing service website",
  },
  {
    slug: "tree-service",
    displayName: "Tree Service",
    title: "Tree Service Website Design | Live Example — BlueJays",
    description:
      "See a premium tree care and arborist website in action. BlueJays builds custom tree service websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    keywords:
      "tree service website design, arborist website, tree trimming website, tree removal website",
  },
  {
    slug: "tutoring",
    displayName: "Tutoring",
    title: "Tutoring Business Website Design | Live Example — BlueJays",
    description:
      "See a premium tutoring and academic coaching website in action. BlueJays builds custom tutoring websites starting at $997 — custom design, domain, and hosting. Subject pages and more.",
    keywords:
      "tutoring website design, tutor website, academic coaching website, education business website",
  },
  {
    slug: "veterinary",
    displayName: "Veterinary Clinic",
    title: "Veterinary Clinic Website Design | Live Example — BlueJays",
    description:
      "See a premium veterinary clinic and animal hospital website in action. BlueJays builds custom vet websites starting at $997 — custom design, domain, and hosting. New patient forms and more.",
    keywords:
      "veterinary website design, vet clinic website, animal hospital website, pet clinic website design",
  },
];

const BASE_URL = "https://bluejayportfolio.com";

function generateLayout(cat: CategorySeo): string {
  const componentName =
    cat.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") + "V2Layout";

  return `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${cat.title}",
  description:
    "${cat.description}",
  keywords: "${cat.keywords}",
  openGraph: {
    title: "${cat.title}",
    description: "${cat.description}",
    url: "${BASE_URL}/v2/${cat.slug}",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "${BASE_URL}/v2/${cat.slug}",
  },
};

export default function ${componentName}({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;
}

let updated = 0;
let skipped = 0;

for (const cat of SEO_DATA) {
  const layoutPath = path.join(
    process.cwd(),
    "src",
    "app",
    "v2",
    cat.slug,
    "layout.tsx"
  );

  if (!fs.existsSync(layoutPath)) {
    console.log(`⚠️  Skipping ${cat.slug} — no layout.tsx found`);
    skipped++;
    continue;
  }

  const content = generateLayout(cat);
  fs.writeFileSync(layoutPath, content, "utf-8");
  console.log(`✅  ${cat.slug}`);
  updated++;
}

console.log(`\nDone — ${updated} updated, ${skipped} skipped.`);
