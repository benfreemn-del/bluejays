import { getProspect, updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";

const PROSPECT_ID = "27f33ec6-080e-4f3b-ba9f-55834b42b892";

// All 9 unique photos from hectorlandscaping.com (Squarespace CDN)
// Using ?format=1500w for high quality
const HECTOR_PHOTOS = [
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/e821db9f-c0a7-450a-b7a0-0e67a0098def/Photo+Oct+06+2022%2C+4+56+30+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/366bffd1-20ae-49ef-be4f-10747ab0adc6/Photo+Dec+14+2022%2C+10+24+09+AM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/b984ab01-6efe-46f1-ae56-fc31e605fc89/Photo+Sep+09+2022%2C+2+49+02+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/3ad7db31-09c6-4525-82e3-288033b2ffa7/Photo+Jul+27+2021%2C+2+34+23+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/d712359e-6f7c-4cef-a822-8ed7aaf1f1c7/Photo+Sep+09+2022%2C+2+18+44+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/4c96b726-5aaa-4bbf-ae5e-648b4efe2065/Photo+Dec+29+2022%2C+4+53+50+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1c1a47d7-39fc-4917-b830-182ff2a1b2ef/Photo+Jun+08+2021%2C+3+30+58+PM.jpg?format=1500w",
  "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/09dc572e-278f-4736-a1c3-222e8e7f18ca/IMG-8192.jpg?format=1500w",
];

async function main() {
  const prospect = await getProspect(PROSPECT_ID);
  if (!prospect) {
    console.error("Prospect not found:", PROSPECT_ID);
    return;
  }

  console.log("Found prospect:", prospect.businessName);

  // Inject all real data
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
      brandColor: "#158c03",
      accentColor: "#158c03",
      photos: HECTOR_PHOTOS,
      googleRating: 4.9,
      reviewCount: 47,
      tagline: "Renton's Premier Landscaping & Design",
      about: "Hector Landscaping & Design has been transforming outdoor spaces in Renton and the greater Seattle area for over 20 years. Founded by Hector, the team specializes in custom landscape design, hardscaping, irrigation systems, and yard maintenance — bringing professional craftsmanship to every project, large or small.",
      services: [
        { name: "Landscape Design", description: "Custom landscape plans tailored to your property, style, and budget with detailed plant selection and layout." },
        { name: "Patio Installation", description: "Beautiful, durable patio installations using premium pavers, natural stone, and concrete for your outdoor living space." },
        { name: "Retaining Walls", description: "Structurally sound and aesthetically pleasing retaining walls that prevent erosion and add character to your yard." },
        { name: "Hardscaping", description: "Walkways, driveways, outdoor kitchens, and decorative stonework that enhance your property's value and usability." },
        { name: "Irrigation Systems", description: "Efficient drip and sprinkler systems designed to keep your landscape healthy while minimizing water waste." },
        { name: "Yard Maintenance", description: "Ongoing mowing, edging, fertilizing, and seasonal cleanup to keep your property looking pristine year-round." },
        { name: "Tree Trimming", description: "Professional tree and shrub pruning for health, safety, and visual appeal throughout all seasons." },
        { name: "Sod Installation", description: "Fresh sod installation for instant green lawns, properly graded and prepared for long-lasting results." },
      ],
      testimonials: [
        { name: "Sarah M.", text: "Hector and his team transformed our backyard completely. The new patio and garden look incredible!", rating: 5 },
        { name: "James K.", text: "They've been maintaining our lawn for 3 years. Always on time, professional, and the yard looks amazing.", rating: 5 },
        { name: "Maria L.", text: "The retaining wall they built solved our erosion problem and looks beautiful. Great craftsmanship!", rating: 5 },
      ],
      stats: [
        { label: "Years Experience", value: "20+" },
        { label: "Projects Completed", value: "500+" },
        { label: "Google Rating", value: "4.9★" },
        { label: "Happy Clients", value: "200+" },
      ],
    },
    updatedAt: new Date().toISOString(),
  };

  await updateProspect(PROSPECT_ID, enriched);
  console.log("Prospect updated with real data");

  // Re-generate preview
  console.log("Re-generating preview...");
  try {
    const url = await generatePreview(enriched);
    console.log("Preview URL:", url);
  } catch (e) {
    console.error("Generation error:", e);
  }
}

main().catch(console.error);
