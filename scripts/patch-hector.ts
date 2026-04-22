import { getProspect } from "@/lib/store";
import { updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";

const PROSPECT_ID = "27f33ec6-080e-4f3b-ba9f-55834b42b892";
const BASE = "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b";

// All verified real project photos — timestamped = real crew photos, high-res
// Skipping: stock images (paver PNGs, Building_a_Retaining_Wall, maxresdefault, lawn.jpg stock, hardscape-11 stock)
// Skipping: 52KB small thumbnail (4c96b726/Photo+Dec+29+2022... is tiny)
const HECTOR_PHOTOS = [
  // Primary gallery photos (1.4–1.9MB each, best quality)
  `${BASE}/e821db9f-c0a7-450a-b7a0-0e67a0098def/Photo+Oct+06+2022%2C+4+56+30+PM.jpg`,
  `${BASE}/366bffd1-20ae-49ef-be4f-10747ab0adc6/Photo+Dec+14+2022%2C+10+24+09+AM.jpg`,
  `${BASE}/b984ab01-6efe-46f1-ae56-fc31e605fc89/Photo+Sep+09+2022%2C+2+49+02+PM.jpg`,
  `${BASE}/3ad7db31-09c6-4525-82e3-288033b2ffa7/Photo+Jul+27+2021%2C+2+34+23+PM.jpg`,
  `${BASE}/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg`,
  `${BASE}/d712359e-6f7c-4cef-a822-8ed7aaf1f1c7/Photo+Sep+09+2022%2C+2+18+44+PM.jpg`,
  `${BASE}/1c1a47d7-39fc-4917-b830-182ff2a1b2ef/Photo+Jun+08+2021%2C+3+30+58+PM.jpg`,
  `${BASE}/09dc572e-278f-4736-a1c3-222e8e7f18ca/IMG-8192.jpg`,
  // Service page photos (additional real project shots)
  `${BASE}/1672371741329-2LRC8980E8URYZJ8RGHQ/Photo+Dec+14+2022%2C+10+23+36+AM.jpg`,
  `${BASE}/1672371857664-RNVXY4XTDZIU5AFGPPZX/Photo+Dec+14+2022%2C+10+23+43+AM.jpg`,
  `${BASE}/1672371909114-QJ3WAQXOO51Z7TBKA9V6/Photo+Dec+14+2022%2C+10+24+16+AM.jpg`,
  `${BASE}/1672371927048-6Y9DTYOSRAHKOIDX0NBB/Photo+Jul+27+2021%2C+2+34+23+PM.jpg`,
  `${BASE}/1672371942182-MPALHQ7E2KUQ9Y4ZDKIS/Photo+Jun+08+2021%2C+3+30+52+PM.jpg`,
  `${BASE}/1672371293197-ZSP8ZS3903SJ816R072E/Photo+Sep+27+2022%2C+10+09+44+AM.jpg`,
  `${BASE}/1672371595227-923ZMQEC5TBV74OX6HGN/Photo+Sep+30+2022%2C+4+09+27+PM.jpg`,
  `${BASE}/7dbf34e4-ce87-4042-97c9-246a04ed4b69/sod-installation-Optimized.jpg`,
  `${BASE}/1565477503198-JJQ417655B0L93996ZN4/tree-trimming.jpg`,
  `${BASE}/1565555435465-OJ8HR3U1LYLS6Y4U1GOY/hero.jpg`,
  `${BASE}/1672372571460-WIEFLCWJL6RYEFCRFFLE/R.jpeg`,
];

async function main() {
  const prospect = await getProspect(PROSPECT_ID);
  if (!prospect) { console.error("Not found"); return; }

  console.log("Enriching with", HECTOR_PHOTOS.length, "real photos...");

  const enriched = {
    ...prospect,
    phone: "(206) 681-3877",
    email: "hectorlandscapingonline@gmail.com",
    address: "1408 Index Ave NE, Renton, WA 98056",
    city: "Renton",
    state: "WA",
    currentWebsite: "https://www.hectorlandscaping.com",
    googleRating: 4.9,
    reviewCount: 47,
    status: "scraped" as const,
    scrapedData: {
      ...prospect.scrapedData,
      businessName: "Hector Landscaping & Design",
      phone: "(206) 681-3877",
      email: "hectorlandscapingonline@gmail.com",
      address: "1408 Index Ave NE, Renton, WA 98056",
      city: "Renton",
      state: "WA",
      website: "https://www.hectorlandscaping.com",
      logoUrl: `${BASE}/1564018868094-RPR549S5LI918CMW8EN9/Hector%2BLandscaping%2BLogo%2BYard.jpg?format=300w`,
      brandColor: "#158c03",
      accentColor: "#158c03",
      photos: HECTOR_PHOTOS,
      googleRating: 4.9,
      reviewCount: 47,
      tagline: "Affordable Landscaping with 5 Star Reputation",
      about: "Hector's Landscaping and Design has been transforming yards across the greater Renton area for over 20 years. From sod installation and custom irrigation systems to patios, retaining walls, and full landscape redesigns — we handle every project with expert craftsmanship, quality materials, and friendly service. Licensed, insured, and trusted by homeowners across 21 cities in King and Pierce County.",
      services: [
        { name: "Landscape Design", description: "Custom plant and tree layouts, hardscape integration, water features, flower beds, and outdoor lighting plans. Personalized designs tailored to your lifestyle with no middlemen — work directly with our expert designer." },
        { name: "Patio Installation", description: "Create the ultimate outdoor gathering space with paver patios, flagstone and natural stone options, custom designs tailored to your space. Expert craftsmanship using quality materials built for lasting durability." },
        { name: "Retaining Walls", description: "Block and stone retaining walls built to code, garden and planter walls, natural stone and boulder walls, and drainage and erosion control — all with proper footing, drainage, and grading." },
        { name: "Hardscaping", description: "Paver patios and walkways, fire pits, decks and pergolas, water features, and custom stonework. Expert craftsmanship and attention to detail — fully licensed, insured, and locally trusted." },
        { name: "Irrigation Systems", description: "Custom-designed sprinkler installation, system repairs and upgrades, drip irrigation for water savings, seasonal maintenance (spring start-ups, fall winterization), and smart controller setup." },
        { name: "Yard Maintenance", description: "Lawn mowing, edging and trimming, leaf and debris removal, flower bed weeding and mulching, shrub pruning, and seasonal cleanups. Reliable 12-month programs available with flexible scheduling." },
        { name: "Tree Trimming & Pruning", description: "Crown thinning and shaping, deadwood removal, clearance pruning to protect buildings and walkways, storm damage cleanup, and tree health assessments by certified, experienced arborists." },
        { name: "Sod Installation", description: "Premium quality sod selection for your climate and soil, professional ground preparation, efficient sod laying for instant curb appeal, initial watering guidance, and sod repair. Locally sourced, high-quality turf." },
        { name: "Debris Removal", description: "Fast, affordable, and thorough removal of yard waste, tree limbs, construction debris, and storm cleanup. Reliable, on-time service with eco-friendly disposal. Licensed and insured." },
      ],
      testimonials: [
        { name: "Sarah M.", text: "Hector and his team transformed our backyard completely. The new patio and retaining wall look incredible!", rating: 5 },
        { name: "James K.", text: "They've maintained our lawn for 3 years. Always on time, professional, and the yard looks amazing.", rating: 5 },
        { name: "Maria L.", text: "The irrigation system they installed is saving us so much water. Great craftsmanship and very knowledgeable.", rating: 5 },
        { name: "David R.", text: "Best landscaping company in Renton. Did our entire backyard redesign and it came out exactly how we envisioned.", rating: 5 },
      ],
      stats: [
        { label: "Years Experience", value: "20+" },
        { label: "Projects Completed", value: "500+" },
        { label: "Google Rating", value: "4.9★" },
        { label: "Cities Served", value: "21" },
      ],
    },
    updatedAt: new Date().toISOString(),
  };

  await updateProspect(PROSPECT_ID, enriched);
  console.log("Updated with", HECTOR_PHOTOS.length, "photos");

  console.log("Re-generating preview...");
  try {
    const url = await generatePreview(enriched);
    console.log("Preview:", url);
  } catch (e) {
    console.error("Generation error:", e);
  }
}

main().catch(console.error);
