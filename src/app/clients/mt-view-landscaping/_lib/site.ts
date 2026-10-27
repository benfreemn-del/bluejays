/**
 * Mountain View Landscape & Design: single source of truth for the site.
 *
 * Pure data (no React) so middleware.ts can import the route lists too.
 *
 * FACT RULE: only state what the Hunsakers have published themselves
 * (their Squarespace site, Google Business Profile) or what Ben confirmed.
 * Confirmed 2026-10-26: hours start 8 AM. NOT confirmed, so NOT on the
 * site: pricing, maintenance-plan tiers, warranties, license numbers.
 */

export const SITE_URL = "https://mtviewlandscaping.com";
export const BASE_PATH = "/clients/mt-view-landscaping";
export const PHOTO_PATH = `${BASE_PATH}/work`;
export const FOUNDED = 1976;

export const BIZ = {
  name: "Mountain View Landscape & Design",
  legalName: "Mountain View Landscape & Design Inc.",
  phone: "(253) 638-0500",
  phoneHref: "tel:+12536380500",
  phoneE164: "+1-253-638-0500",
  email: "mtviewlandscapeonline@gmail.com",
  street: "18225 SE 313th St",
  city: "Auburn",
  region: "WA",
  zip: "98092",
  address: "18225 SE 313th St, Auburn, WA 98092",
  lat: 47.3207062,
  lng: -122.0984311,
  mapHref: "https://www.google.com/maps/place/Mountain+View+Landscape+%26+Design/@47.3207062,-122.0984311,17z/data=!4m6!3m5!1s0x5490f596db529cf5:0x8182c072f204747f!8m2!3d47.3207062!4d-122.0984311",
  // Opens the Google profile (cid = the Maps feature id 0x8182c072f204747f in decimal).
  // TODO once the GBP is claimed: swap for the "Ask for reviews" short link
  // (g.page/r/...) from the GBP dashboard, which opens the review box directly.
  reviewHref: "https://www.google.com/maps?cid=9332232977784271999",
  counties: ["King", "Pierce", "Snohomish", "Kittitas"],
  hours: "Mon to Fri, 8 AM to 5 PM",
  // Verified on the WA L&I contractor lookup 2026-10-26. Insurance renews yearly (policy
  // on file ran to 10/30/2026): re-check the L&I page if the site ever shows "insured".
  license: "MTVIEVL973QP",
  licenseHref: "https://secure.lni.wa.gov/verify/Detail.aspx?UBI=602332722&LIC=MTVIEVL973QP&SAW=",
  ubi: "602 332 722",
  incorporated: 2003,
  googleRating: 5.0,
  googleReviewCount: 14, // update as reviews grow (Google Maps, 2026-10-26)
};

export const yearsInBusiness = () => new Date().getFullYear() - FOUNDED;

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  name: string; // short nav label
  title: string; // <title>
  h1: string;
  description: string; // meta description
  hero: string; // photo id
  lede: string;
  includes: string[];
  body: { h: string; p: string }[];
  photos: string[]; // curated, best first
  faqs: Faq[];
  related: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "landscape-design",
    name: "Landscape Design",
    title: "Landscape Design in Auburn, WA | Mountain View Landscape",
    h1: "Landscape Design in Auburn, WA",
    description:
      "Custom landscape design in Auburn, WA. Tim draws every plan by hand and our own crew builds it. Licensed & insured. Free quotes: (253) 638-0500.",
    hero: "p009",
    lede:
      "Every yard we build starts on paper. Tim walks your property, listens to how you want to use it, and draws the plan by hand before anyone picks up a shovel.",
    includes: [
      "A site visit and conversation about how you live outside",
      "A hand-drawn plan you can mark up and change",
      "Plant choices that fit Northwest rain, shade, and soil",
      "Patios, walls, water, lighting, and lawn planned together",
      "One crew to build it, so the plan is what gets built",
    ],
    body: [
      {
        h: "Designed by the person who builds it",
        p: "A lot of design work gets handed off to a different crew that never met you. Ours does not. The same family that draws your plan is on site building it, so the details you cared about at the kitchen table make it into the ground.",
      },
      {
        h: "Made for how the Northwest really behaves",
        p: "Our yards deal with long wet winters, dry summers, heavy glacial soils, and slopes. A good plan handles drainage first, puts the right plant in the right light, and leaves room for trees to grow. That is what keeps a landscape looking good years later instead of just on install day.",
      },
      {
        h: "Whole yard or one corner",
        p: "Some clients want a full front-to-back redo. Others want one problem area fixed, like a soggy side yard or a bare slope. Either way we start with the same plan so the new piece fits with the rest of your property.",
      },
    ],
    photos: ["p009", "p124", "p095", "p003", "p002", "p013", "p040", "p001", "p118", "p128", "p125", "p048", "p122", "p014"],
    faqs: [
      { q: "Do you charge for the design?", a: "Quotes are always free. Call (253) 638-0500 and we will talk through your project and what the design step looks like for it." },
      { q: "Can I change the plan once I see it?", a: "Yes. That is the point of drawing it first. We adjust the plan until it feels right, then we build it." },
      { q: "Do you also build what you design?", a: "Yes. Design, installation, and ongoing care are all done by our own crew." },
    ],
    related: ["hardscapes", "water-features", "native-planting"],
  },
  {
    slug: "hardscapes",
    name: "Patios & Hardscapes",
    title: "Patios & Hardscapes in Auburn, WA | Mountain View Landscape",
    h1: "Patios, Walkways & Hardscapes in Auburn, WA",
    description:
      "Flagstone and bluestone patios, paver driveways, stone steps, and fire pits in Auburn, WA. Licensed & insured. Free quotes: (253) 638-0500.",
    hero: "p033",
    lede:
      "Stone patios, paths, steps, and driveways are the bones of a good yard. We set them to last through Northwest winters and to look like they always belonged there.",
    includes: [
      "Flagstone and bluestone patios",
      "Paver driveways, courtyards, and walkways",
      "Natural stone slab steps and stepping-stone paths",
      "Fire pit gathering areas",
      "Pool decks and garden terraces",
    ],
    body: [
      {
        h: "Built on a base that does not move",
        p: "Most patio problems start underground. Heaving, sinking, and puddles come from a thin or poorly drained base. We dig out, build a compacted base, and slope everything so water leaves the surface. The stone on top is what you see. The base is why it still looks right in ten years.",
      },
      {
        h: "Natural stone, laid by hand",
        p: "A lot of our favorite work is irregular flagstone: every piece fitted by eye so the joints run tight and the color moves across the patio. We also lay cut bluestone for a cleaner look, brick and concrete pavers for driveways and courtyards, and big slab steps set into hillsides.",
      },
      {
        h: "Part of the whole yard",
        p: "A patio works best when it is tied to planting, lighting, and the way you walk through the yard. We plan the stone with the beds around it, so it feels finished on day one.",
      },
    ],
    photos: ["p033", "p031", "p036", "p037", "p034", "p030", "p027", "p004", "p007", "p023", "p024", "p019", "p020", "p028", "p029", "p032", "p016", "p018", "p021", "p026", "p017", "p025", "p132", "p129", "p116", "p015", "p022", "p035", "p038", "p070", "p039"],
    faqs: [
      { q: "What is the best patio material for the Pacific Northwest?", a: "Natural flagstone, bluestone, and quality pavers all do well here when they sit on a properly drained base. We will show you options and talk through the look and upkeep of each." },
      { q: "Do you build fire pit areas?", a: "Yes. Several of the flagstone patios in our gallery are built around a fire pit with boulder seating." },
      { q: "Can you add a walkway to an existing yard?", a: "Yes. Paths and stepping stones are a common smaller project, and we tie them into your existing beds and lawn." },
    ],
    related: ["retaining-walls", "night-lights", "landscape-design"],
  },
  {
    slug: "retaining-walls",
    name: "Retaining Walls",
    title: "Retaining Walls in Auburn, WA | Mountain View Landscape",
    h1: "Retaining Walls in Auburn, WA",
    description:
      "Block retaining walls, terraced hillsides, and rockeries built with proper drainage in Auburn, WA. Licensed & insured. Call (253) 638-0500.",
    hero: "p131",
    lede:
      "Hillside lots are everywhere around here. A well-built wall turns a slope you cannot use into level lawn, garden terraces, and steps that are a pleasure to walk.",
    includes: [
      "Segmental block retaining walls",
      "Terraced walls with built-in stairs",
      "Boulder rockeries",
      "Raised beds and seat walls",
      "Drainage behind every wall",
    ],
    body: [
      {
        h: "Drainage is the whole game",
        p: "Walls fail when water builds up behind them. Every wall we build gets proper drainage rock and a way for water to get out, plus a compacted base below the first course. It is the part nobody sees, and it is why our walls stay straight.",
      },
      {
        h: "Terraces, not just walls",
        p: "On steep lots we often step the hill into two or three terraces with stairs between them. That gives you more usable flat space, room for planting on each level, and a much better look than one tall wall.",
      },
      {
        h: "Block or boulder",
        p: "Segmental block gives clean lines and comes in a range of colors and faces. Boulder rockeries feel more natural and suit wooded lots. We will help you pick what fits your house and the slope.",
      },
    ],
    photos: ["p131", "p044", "p008", "p060", "p062", "p123", "p049", "p030", "p034", "p029"],
    faqs: [
      { q: "How tall can a retaining wall be?", a: "It depends on the site, the wall system, and local permit rules. Taller walls usually need engineering and a permit. We will tell you what your slope needs when we visit." },
      { q: "Why do retaining walls lean or fail?", a: "Usually water pressure from poor drainage or a weak base. We build both into every wall." },
      { q: "Can you add stairs to a wall?", a: "Yes. Built-in stairs and lit steps are common on our terraced projects." },
    ],
    related: ["hardscapes", "landscape-design", "night-lights"],
  },
  {
    slug: "water-features",
    name: "Water Features",
    title: "Ponds & Waterfalls in Auburn, WA | Mountain View Landscape",
    h1: "Ponds, Waterfalls & Water Features in Auburn, WA",
    description:
      "Backyard ponds, streams, waterfalls, and basalt fountains in Auburn, WA, built by a licensed family firm. See 50+ projects. (253) 638-0500.",
    hero: "p091",
    lede:
      "Water is our favorite thing to build. Ponds, streams that wander across a yard, hillside waterfalls, and bubbling basalt columns by the front door: we have built them all, and they look good in every season, even under snow.",
    includes: [
      "Backyard ponds with spillway waterfalls",
      "Streams and multi-tier waterfalls",
      "Pondless waterfalls and streams",
      "Basalt column and boulder bubbling fountains",
      "Stacked slate fountains and formal fountains",
    ],
    body: [
      {
        h: "Built to look natural",
        p: "A water feature should look like the stone was always there. We set boulders, river rock, and slab stone by hand, hide the liner and plumbing, and plant around the edges so the water sits in the landscape instead of on top of it.",
      },
      {
        h: "Big statement or small corner",
        p: "Some of our projects are full estate waterfalls that run down a hillside beside the stairs. Others are a single basalt column bubbling into river rock by the entry. Both bring the sound of water to your yard. Scroll the photos below to see the range.",
      },
      {
        h: "Beautiful all year",
        p: "Northwest water features earn their keep in winter too. Some of our favorite photos are of these ponds and streams under fresh snow.",
      },
    ],
    photos: [
      "p091", "p052", "p086", "p053", "p054", "p063", "p002", "p087", "p088", "p090", "p084", "p085", "p089", "p057", "p059", "p058",
      "p070", "p124", "p001", "p055", "p056", "p064", "p066", "p067", "p068", "p050", "p051", "p039", "p069", "p072", "p126", "p092",
      "p093", "p061", "p049", "p062", "p065", "p016", "p032", "p079", "p080", "p073", "p074", "p077", "p078", "p075", "p076",
      "p081", "p082", "p083", "p071",
    ],
    faqs: [
      { q: "What is a pondless waterfall?", a: "A waterfall or stream that drains into a hidden underground reservoir instead of an open pond. You get the sound and movement of water with less upkeep and no standing water." },
      { q: "Do water features work in winter here?", a: "Yes. Several in our gallery are shown running under snow. We will talk through winter care for your feature when we build it." },
      { q: "Can you build a small fountain instead of a pond?", a: "Absolutely. Basalt column and boulder fountains bubble into river rock and fit in an entry bed or a corner of the patio." },
    ],
    related: ["landscape-design", "hardscapes", "night-lights"],
  },
  {
    slug: "irrigation",
    name: "Irrigation",
    title: "Sprinkler Systems in Auburn, WA | Mountain View Landscape",
    h1: "Sprinkler & Irrigation Systems in Auburn, WA",
    description:
      "Sprinkler system installation, drip irrigation, and sprinkler repair in Auburn, WA. Licensed, bonded & insured. Call (253) 638-0500.",
    hero: "p045",
    lede:
      "Northwest summers are drier than people expect. A good sprinkler system puts the right amount of water in the right places, so lawns stay green and new plants make it through July and August.",
    includes: [
      "New sprinkler systems for lawns and beds",
      "Drip lines for shrubs, trees, and planters",
      "Repairs to broken heads, lines, and valves",
      "Adjusting coverage so water stays off walks and walls",
      "Irrigation planned in with new landscapes",
    ],
    body: [
      {
        h: "Water where the roots are",
        p: "Spray heads suit lawns. Drip suits beds, shrubs, and trees. Mixing them by zone means each area gets what it needs and nothing gets drowned. That saves water and keeps plants healthier.",
      },
      {
        h: "Repairs too",
        p: "If your existing system has dry spots, broken heads, or a zone that will not shut off, we can fix it. Our customers call us for sprinkler repairs as often as for new systems.",
      },
      {
        h: "Planned with the landscape",
        p: "When we install a new yard, irrigation goes in before the sod and plants, laid out from the design so every bed is covered.",
      },
    ],
    photos: ["p045", "p046", "p127", "p118", "p121", "p047", "p015", "p122", "p006", "p044", "p029"],
    faqs: [
      { q: "Do you repair existing sprinkler systems?", a: "Yes. Broken heads, leaks, dry spots, and coverage problems are all things we fix." },
      { q: "Is drip irrigation worth it for beds?", a: "Usually. Drip delivers water slowly at the roots, wastes less to evaporation and runoff, and keeps foliage dry." },
      { q: "When should irrigation go in on a new landscape?", a: "Before sod and planting, so lines can be run cleanly and every area is covered from the start." },
    ],
    related: ["sod-installation", "yard-maintenance", "native-planting"],
  },
  {
    slug: "sod-installation",
    name: "Sod & Lawns",
    title: "Sod Installation in Auburn, WA | Mountain View Landscape",
    h1: "Sod Installation & New Lawns in Auburn, WA",
    description:
      "Sod installation in Auburn, WA with real grading, soil prep, and drainage so your new lawn roots in fast. Licensed & insured. (253) 638-0500.",
    hero: "p127",
    lede:
      "Sod gives you a finished lawn the day we leave. Done right, with real soil prep and grading, it roots in fast and stays thick for years.",
    includes: [
      "Removing old turf, weeds, and debris",
      "Grading so water drains away from the house",
      "Soil amendment for strong rooting",
      "Fresh sod laid tight with clean edges",
      "Curved bed lines and lawn shapes that fit the yard",
    ],
    body: [
      {
        h: "The prep is the lawn",
        p: "Laying sod on hard, poorly graded ground is the most common reason a new lawn struggles. We clear the area, fix the grade, and improve the soil first. Then the sod has somewhere to put its roots.",
      },
      {
        h: "Shaped to the yard",
        p: "A lawn looks best with a confident shape: sweeping curves against planting beds, clean edges along walks. We lay out the lawn as part of the design, not as whatever is left over.",
      },
      {
        h: "Ready faster than seed",
        p: "Seed takes weeks to fill in and months to thicken. Sod is green the day it goes down and usually ready for light use within a few weeks with proper watering.",
      },
    ],
    photos: ["p127", "p045", "p046", "p118", "p121", "p047", "p006", "p122", "p044", "p008", "p130", "p015"],
    faqs: [
      { q: "When is the best time to lay sod in Western Washington?", a: "Spring and early fall are ideal because of the mild temperatures and rain. Summer works with steady watering." },
      { q: "How soon can we walk on new sod?", a: "Light foot traffic is usually fine after a couple of weeks once the roots have taken. We will give you watering and care instructions." },
      { q: "Do you fix drainage before laying sod?", a: "Yes. Grading and drainage are part of our prep." },
    ],
    related: ["irrigation", "yard-maintenance", "landscape-design"],
  },
  {
    slug: "native-planting",
    name: "Planting & Trees",
    title: "Trees & Planting in Auburn, WA | Mountain View Landscape",
    h1: "Native Plants, Trees & Garden Planting in Auburn, WA",
    description:
      "Northwest native planting, shade gardens, Japanese maples, and specimen trees installed in Auburn, WA. Licensed & insured. (253) 638-0500.",
    hero: "p128",
    lede:
      "The right plant in the right spot grows into itself instead of fighting the site. We plant gardens built around Northwest natives and proven performers, plus specimen trees that become the centerpiece of a yard.",
    includes: [
      "Northwest native and low-water planting",
      "Shade gardens for wooded lots",
      "Specimen trees: Japanese maples, weeping conifers, and more",
      "Boulder gardens and entry beds",
      "Large tree installation",
    ],
    body: [
      {
        h: "Plants that like it here",
        p: "Natives and well-adapted plants handle our wet winters and dry summers with less water and less fuss once established. They also bring in birds and pollinators. We mix them with ornamentals for color through the year.",
      },
      {
        h: "Specimen trees, hand-picked",
        p: "A weeping cedar, a coral bark maple, or a big Japanese maple gives a garden its character. We source and set larger specimen trees so a new landscape looks established from the start.",
      },
      {
        h: "Room to grow",
        p: "We space plants for their size in five and ten years, not just on install day. That means less pruning and crowding later, and a garden that keeps getting better.",
      },
    ],
    photos: [
      "p128", "p040", "p013", "p009", "p125", "p117", "p095", "p014", "p115", "p119", "p048", "p010", "p130", "p113", "p112", "p114",
      "p120", "p104", "p103", "p106", "p109", "p101", "p105", "p096", "p098", "p099", "p100", "p102", "p107", "p108", "p110", "p111", "p097",
    ],
    faqs: [
      { q: "Are native plants really lower maintenance?", a: "Once established they generally need less water and fewer treatments, because they are adapted to our soil and climate." },
      { q: "Do you plant large trees?", a: "Yes. We install specimen and larger trees, using equipment when the size calls for it." },
      { q: "What grows well in shady wooded yards?", a: "Ferns, many native shrubs, Japanese maples, and shade perennials do well. We design shade gardens regularly for lots under big firs." },
    ],
    related: ["landscape-design", "irrigation", "yard-maintenance"],
  },
  {
    slug: "night-lights",
    name: "Landscape Lighting",
    title: "Landscape Lighting in Auburn, WA | Mountain View Landscape",
    h1: "Landscape Lighting in Auburn, WA",
    description:
      "Low-voltage landscape lighting for paths, steps, driveways, patios, and ponds in Auburn, WA. Licensed & insured. Call (253) 638-0500.",
    hero: "p007",
    lede:
      "Good lighting lets you enjoy the yard after dark, makes steps and paths safe, and shows off the stone and trees you invested in. Our long winter evenings are when it matters most.",
    includes: [
      "Path and walkway lights",
      "Step and stair lighting",
      "Driveway and entry lighting",
      "Uplighting for trees and stone",
      "Lighting for patios and water features",
    ],
    body: [
      {
        h: "Safety first, then beauty",
        p: "We start by lighting the places people walk: paths, steps, and the drive. Then we add accent light on trees, walls, and water so the yard has depth at night.",
      },
      {
        h: "Planned with the stone work",
        p: "When lighting goes in with a new patio or wall, wiring is hidden and fixtures land exactly where they should. We can also add lighting to an existing yard.",
      },
    ],
    photos: ["p007", "p031", "p024", "p028", "p129", "p131", "p054", "p127", "p036", "p033"],
    faqs: [
      { q: "Can you add lights to my existing landscape?", a: "Yes. We can light an existing yard as well as include lighting in new projects." },
      { q: "What kind of lighting do you install?", a: "Low-voltage landscape lighting for paths, steps, driveways, patios, trees, and water features." },
    ],
    related: ["hardscapes", "water-features", "retaining-walls"],
  },
  {
    slug: "yard-maintenance",
    name: "Yard Maintenance",
    title: "Yard Maintenance in Auburn, WA | Mountain View Landscape",
    h1: "Yard Maintenance & Landscape Care in Auburn, WA",
    description:
      "Year-round yard maintenance in Auburn, WA from the family that builds it: mowing, pruning, bark, cleanups, sprinklers. Call (253) 638-0500.",
    hero: "p046",
    lede:
      "A landscape is never done. Bonnie runs the crew that keeps our customers' yards looking the way they did on install day, season after season.",
    includes: [
      "Lawn mowing and edging",
      "Pruning shrubs and small trees",
      "Weeding and fresh bark",
      "Spring and fall cleanups",
      "Sprinkler checks and adjustments",
    ],
    body: [
      {
        h: "Cared for by people who know landscapes",
        p: "Our maintenance crew are landscapers, not just mowers. They know how a Japanese maple should be pruned, when to cut back perennials, and when a dry spot means a sprinkler problem.",
      },
      {
        h: "The same faces",
        p: "Most of our team has been with us for years. When you call, you talk to the family that runs the company, and the same crew keeps coming back to your yard.",
      },
    ],
    photos: ["p046", "p045", "p015", "p121", "p122", "p118", "p117", "p013", "p009", "p127", "p124"],
    faqs: [
      { q: "Do you maintain yards you did not build?", a: "Call us at (253) 638-0500 and tell us about your yard. We will let you know what we can take on." },
      { q: "What does maintenance include?", a: "Typically mowing, edging, pruning, weeding, bark, seasonal cleanups, and sprinkler checks, set up around what your yard needs." },
    ],
    related: ["irrigation", "sod-installation", "native-planting"],
  },
  {
    slug: "custom-projects",
    name: "Custom Projects",
    title: "Custom Landscaping in Auburn, WA | Mountain View Landscape",
    h1: "Custom Landscape Projects",
    description:
      "Estate landscapes, hillside waterfalls, and lakeside patios from Mountain View Landscape & Design, Auburn, WA. Licensed & insured. (253) 638-0500.",
    hero: "p002",
    lede:
      "Some yards do not fit a category. Estate front yards with waterfalls, lakeside patios, hillside cascades beside the stairs: if you can picture it, we have probably built something like it.",
    includes: [
      "Full estate landscapes",
      "Hillside waterfalls and cascades",
      "Lakeside and waterfront gardens",
      "Motor courts and formal fountains",
      "Projects that combine stone, water, planting, and light",
    ],
    body: [
      {
        h: "Everything under one roof",
        p: "Big projects go wrong when five companies hand work back and forth. We design, build stone and water, plant, irrigate, and light it ourselves, so one team owns the whole result.",
      },
      {
        h: "Bring us the idea",
        p: "Start with a photo, a sketch, or just a problem you want solved. Tim will walk the site with you and draw a plan from there.",
      },
    ],
    photos: ["p002", "p052", "p037", "p124", "p063", "p033", "p070", "p027", "p053", "p007", "p079", "p080", "p094", "p073", "p116"],
    faqs: [
      { q: "Do you take on large estate projects?", a: "Yes. Several projects in our gallery are full estate landscapes with water features, stone work, and planting." },
      { q: "How do custom projects start?", a: "With a free conversation and a site visit. Call (253) 638-0500 or send the form below." },
    ],
    related: ["water-features", "landscape-design", "hardscapes"],
  },
];

export type City = {
  slug: string;
  name: string;
  county: string;
  title: string;
  description: string;
  hero: string;
  intro: string;
  local: { h: string; p: string }[];
  neighborhoods: string[];
  photos: string[];
};

const cityTitle = (c: string) => `Landscaping in ${c}, WA | Mountain View Landscape`;

export const CITIES: City[] = [
  {
    slug: "landscaping-auburn-wa",
    name: "Auburn",
    county: "King",
    title: "Landscaping in Auburn, WA | Mountain View Landscape",
    description:
      "Auburn's family landscape company, licensed & insured: design, patios, walls, ponds, sod, and yard care from our shop on SE 313th St. Call (253) 638-0500.",
    hero: "p031",
    intro:
      "Auburn is home. Our shop is on SE 313th Street, and we have been building and caring for Auburn yards since Tim started in 1976.",
    local: [
      {
        h: "Valley floor and hillside lots",
        p: "Auburn has two kinds of yards: flat Green River valley lots where drainage is the challenge, and plateau neighborhoods with real slopes. We handle both, from grading and drainage on the valley floor to retaining walls and terraces up the hill.",
      },
      {
        h: "Close to home means quick response",
        p: "Being local means we can get out for a site visit fast and get back quickly if anything needs attention after the job is done.",
      },
    ],
    neighborhoods: ["Lea Hill", "Lakeland Hills", "Lake Tapps area", "West Hill", "Downtown Auburn", "Green River valley"],
    photos: ["p031", "p037", "p091", "p131", "p124", "p063"],
  },
  {
    slug: "landscaping-kent-wa",
    name: "Kent",
    county: "King",
    title: cityTitle("Kent"),
    description:
      "Landscaping in Kent, WA: patios, retaining walls, water features, and sod from a licensed family firm next door in Auburn. (253) 638-0500.",
    hero: "p036",
    intro:
      "Kent is right next door to our Auburn shop. We build patios, walls, water features, and full landscapes for homes on the East Hill, around Lake Meridian, and down in the valley.",
    local: [
      {
        h: "Hillside lots on the East Hill",
        p: "Much of Kent sits on slopes. Retaining walls, terraces, and stone steps turn those grades into usable yard, and good drainage keeps them there.",
      },
      {
        h: "Outdoor rooms for smaller lots",
        p: "On tighter suburban lots, a well-planned patio, a small fountain, and lighting can make the backyard feel twice as big.",
      },
    ],
    neighborhoods: ["East Hill", "Lake Meridian", "Panther Lake", "Kent valley"],
    photos: ["p036", "p044", "p039", "p027", "p118", "p050"],
  },
  {
    slug: "landscaping-covington-wa",
    name: "Covington",
    county: "King",
    title: cityTitle("Covington"),
    description:
      "Landscaping in Covington, WA: shade gardens for wooded lots, patios, walls, ponds, and lawns. Licensed family firm in Auburn. (253) 638-0500.",
    hero: "p128",
    intro:
      "Covington is minutes from our shop. Many homes here back onto tall firs and green belts, and we love building yards that fit that wooded setting.",
    local: [
      {
        h: "Gardens that work under big trees",
        p: "Shade, roots, and needles change what will grow. We plan shade gardens with ferns, natives, and maples that thrive under a canopy instead of struggling for sun.",
      },
      {
        h: "Glacial soils and drainage",
        p: "The ground here is often dense glacial till that holds water. We grade and amend before lawns and beds go in so everything drains and roots properly.",
      },
    ],
    neighborhoods: ["Lake Meridian east", "Soos Creek area", "Covington town center", "Timberlane"],
    photos: ["p128", "p001", "p017", "p057", "p127", "p040"],
  },
  {
    slug: "landscaping-maple-valley-wa",
    name: "Maple Valley",
    county: "King",
    title: cityTitle("Maple Valley"),
    description:
      "Landscaping in Maple Valley, WA: ponds, streams, flagstone patios, walls, and woodland planting. Licensed & insured. (253) 638-0500.",
    hero: "p052",
    intro:
      "Maple Valley's big lots and tall evergreens are some of our favorite places to work. There is room here for streams, ponds, and patios that feel tucked into the woods.",
    local: [
      {
        h: "Room for water",
        p: "Larger lots make space for the features we love building most: ponds, streams, and waterfalls that look like they came with the property.",
      },
      {
        h: "Woodland edges",
        p: "We blend new yards into the surrounding forest with native planting, boulders, and natural stone paths, so the landscape steps down gently into the trees.",
      },
    ],
    neighborhoods: ["Lake Wilderness", "Rock Creek", "Elk Run", "Four Corners"],
    photos: ["p052", "p086", "p030", "p038", "p053", "p132"],
  },
  {
    slug: "landscaping-black-diamond-wa",
    name: "Black Diamond",
    county: "King",
    title: cityTitle("Black Diamond"),
    description:
      "Landscaping in Black Diamond, WA: acreage and lakefront landscapes, ponds, and patios. Family-run, just down the road. (253) 638-0500.",
    hero: "p084",
    intro:
      "Black Diamond is just down the road from our shop. Acreage, lakefront around Lake Sawyer, and rural lots call for landscapes on a bigger scale.",
    local: [
      {
        h: "Landscapes for acreage",
        p: "On bigger properties we focus on the areas you actually use: the entry, the patio, and the views from the house, and let them transition naturally into the open land around them.",
      },
      {
        h: "Waterfront gardens",
        p: "Lakeside yards need stone that handles wet ground and planting that frames the view instead of blocking it. Several of our favorite patios sit right on the water.",
      },
    ],
    neighborhoods: ["Lake Sawyer", "Morganville", "Lake Morton area"],
    photos: ["p084", "p037", "p033", "p085", "p128", "p001"],
  },
  {
    slug: "landscaping-enumclaw-wa",
    name: "Enumclaw",
    county: "King",
    title: cityTitle("Enumclaw"),
    description:
      "Landscaping in Enumclaw, WA: waterfalls, stone patios, retaining walls, and hardy planting for the plateau. Licensed & insured. (253) 638-0500.",
    hero: "p054",
    intro:
      "Out on the Enumclaw plateau, with Mount Rainier on the horizon, yards deal with open wind, colder winters, and big views. We build landscapes that frame those views and stand up to the weather.",
    local: [
      {
        h: "Built for the plateau",
        p: "Wind and colder snaps mean choosing hardy plants and setting stone and walls on solid, well-drained bases. We plan for winter from the start.",
      },
      {
        h: "Frame the mountain",
        p: "On open lots we keep sight lines clear toward the view and use planting to give the house a sense of shelter without hiding what makes the property special.",
      },
    ],
    neighborhoods: ["Enumclaw plateau", "Downtown Enumclaw", "Mud Mountain Road area"],
    photos: ["p054", "p053", "p045", "p131", "p009", "p076"],
  },
];

export const REVIEWS = [
  // Verbatim Google reviews (Maps profile, captured 2026-05 and re-checked 2026-10-26).
  // Excluded on purpose: a review from a relative of the site builder (FTC endorsement
  // rule) and one from an obviously pseudonymous account.
  { name: "Jennifer Cline", text: "The team that showed up to do our yard was on time, kind and did an amazing job. Could not be happier with the outcome and customer service - from sales to install - restored my faith in contracting out work for sure!" },
  { name: "Cody H", text: "If you're considering any type of landscaping or lawn maintenance, I can't recommend Mountain View Landscape & Design enough. Their expert team makes the entire process seamless and stress-free." },
  { name: "Kylee Trombley", text: "This guy knows what he's doing!! I can't believe how good my yard looks. It's exactly how I wanted it." },
  { name: "Tierney Goaslind", text: "Great installation and everything came together quicker than expected!" },
  { name: "Cindy McNabb", text: "Super friendly and professional family oriented business. I highly recommend." },
  { name: "Brandi Whitehurst", text: "They did an amazing job, couldn't have turned out any better." },
  { name: "Monica Rein", text: "Really professional and friendly! Would recommend to anyone!" },
  { name: "Brad Baker", text: "Easy to work with. Great pricing." },
];

export const HOME_FAQS: Faq[] = [
  { q: "What areas do you serve?", a: "We are based in Auburn and work across King, Pierce, Snohomish, and Kittitas counties, including Auburn, Kent, Covington, Maple Valley, Black Diamond, and Enumclaw." },
  { q: "Are quotes free?", a: "Yes. Call (253) 638-0500 or send the form and we will set up a free visit. No pressure." },
  { q: "How long have you been in business?", a: `Tim Hunsaker has been landscaping since ${FOUNDED}. He started with his brothers as Shamrock Landscaping, and he and Bonnie have run Mountain View as its own company since 2003.` },
  { q: "Are you licensed and insured?", a: "Yes. Mountain View Landscaping & Design Inc. is a registered Washington contractor (license MTVIEVL973QP), bonded and insured, with no license violations on record. You can check it any time on the Washington L&I contractor lookup." },
  { q: "Do you do both design and installation?", a: "Yes. We design, build, and maintain. Tim draws every plan by hand, and our own crew builds it." },
  { q: "What are your hours?", a: "Monday to Friday starting at 8 AM. Leave a message or send the form any time and we will get back to you." },
];

/* ───── routing (shared with middleware.ts) ───── */
export const PAGE_SLUGS = [...SERVICES.map((s) => s.slug), ...CITIES.map((c) => c.slug)];
export const ROOT_SUBPATHS = [
  ...PAGE_SLUGS.map((s) => `/${s}`),
  "/gallery",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
];
// Old Squarespace URLs -> new home. Everything else unknown 301s to "/".
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/yard-maitenance": "/yard-maintenance",
  "/take-action": "/#contact",
  "/contact": "/#contact",
  "/contact-us": "/#contact",
  "/about": "/#about",
  "/services": "/#services",
};

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);

/** Full-gallery order: showcase shots first, process / staging / low-res last. */
export const GALLERY_LEAD = [
  "p124", "p052", "p091", "p033", "p037", "p053", "p031", "p063", "p002", "p131", "p045", "p086", "p036", "p054", "p009", "p095",
  "p128", "p070", "p044", "p027", "p057", "p007", "p021", "p030", "p084", "p001", "p087", "p034", "p013", "p127", "p059", "p008",
];
export const GALLERY_LAST = [
  "p079", "p080", "p073", "p074", "p075", "p076", "p077", "p078", "p094", "p081", "p082", "p083", "p071", "p120", "p006", "p022",
  "p096", "p097", "p098", "p099", "p100", "p101", "p102", "p103", "p104", "p105", "p106", "p107", "p108", "p109", "p110", "p111",
];
