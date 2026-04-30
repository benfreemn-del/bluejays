/**
 * Curated city registry for /web-design/[city] local landing pages.
 *
 * Honest scope: WA-only for now (Ben is in WA, prospects are WA).
 * Adding "Phoenix AZ" or "Denver CO" landing pages without real local
 * coverage is fake SEO that gets bounce-rated and de-ranked. Expand
 * the list deliberately as BlueJays opens new markets.
 *
 * Each city has:
 *   - slug:       URL key (kebab)
 *   - name:       Display name
 *   - state:      For breadcrumbs + local schema
 *   - region:     Sub-region grouping for sister-city sections
 *   - intro:      One-paragraph intro that's GENUINELY DIFFERENT
 *                 per city (Google penalizes thin programmatic SEO)
 *   - whyItMatters: 2-3 bullet points for why a local biz needs a
 *                   great site here (varies by city demographics)
 *   - bestCategories: 4-5 categories most active in this city
 */

export type City = {
  slug: string;
  name: string;
  state: string;
  region: string;
  intro: string;
  whyItMatters: string[];
  bestCategories: string[];
};

export const CITIES: City[] = [
  {
    slug: "quilcene",
    name: "Quilcene",
    state: "WA",
    region: "Olympic Peninsula",
    intro:
      "Quilcene is a small Olympic Peninsula community where word-of-mouth still drives most business — but that doesn't mean your website doesn't matter. When somebody hears about your shop and pulls out their phone to check you're real, your site has about 8 seconds to confirm it. We build sites in Quilcene that earn those 8 seconds.",
    whyItMatters: [
      "Tourist traffic from Hood Canal + Olympic National Park looks you up before they pull off the road.",
      "Locals Google you to find your hours and phone number — if either is missing, they call somebody else.",
      "Your competitors in Port Townsend and Sequim are already on Google Maps with reviews. You should be too.",
    ],
    bestCategories: ["landscaping", "general-contractor", "auto-repair", "construction", "tree-service"],
  },
  {
    slug: "sequim",
    name: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    intro:
      "Sequim's mix of retirees, lavender-festival tourism, and Olympic Peninsula service businesses means your audience changes by season. A great local site needs to load fast on cell signal at a viewpoint, look professional to a snowbird researching contractors, and rank for both 'sequim landscaper' and 'lavender farm tour'.",
    whyItMatters: [
      "Retiree market researches every contractor twice — once on Google reviews, once on the actual website.",
      "Tourist season triples the search traffic from May to September — you need to be ready.",
      "Most Sequim service businesses still run Wix sites from 2018. The bar is low; the upside is high.",
    ],
    bestCategories: ["landscaping", "real-estate", "med-spa", "florist", "construction"],
  },
  {
    slug: "port-angeles",
    name: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    intro:
      "Port Angeles is the Olympic Peninsula's commercial hub — ferry traffic from Victoria, Olympic National Park gateway tourism, and a working-port economy that rewards businesses that look professional. Your site competes with national chains for visitor spend AND with neighbor businesses for locals' loyalty.",
    whyItMatters: [
      "Ferry traffic from BC = international visitors who'll only call if your site reads as legitimate.",
      "Olympic National Park brings 3.4M+ visitors a year through Port Angeles — capture even 0.1% and that's revenue.",
      "Local-business-of-the-year competition is real here; a great site reinforces credibility.",
    ],
    bestCategories: ["auto-repair", "restaurant", "hotel", "fishing", "construction"],
  },
  {
    slug: "port-townsend",
    name: "Port Townsend",
    state: "WA",
    region: "Olympic Peninsula",
    intro:
      "Port Townsend's Victorian architecture, maritime heritage, and arts-festival tourism create a genuinely premium audience — they expect a website that matches the town's craftsmanship. We build sites for Port Townsend businesses that read like the town itself: thoughtful, local, well-made.",
    whyItMatters: [
      "Tourists come ready to spend — but they research before they buy. Your site is the conversion.",
      "Wooden Boat Festival and other major events drive predictable spikes — your site needs to scale.",
      "PT visitors are largely Seattle/Tacoma — they expect the same web quality they get in the city.",
    ],
    bestCategories: ["restaurant", "real-estate", "salon", "interior-design", "boat-services"],
  },
  {
    slug: "bremerton",
    name: "Bremerton",
    state: "WA",
    region: "Kitsap",
    intro:
      "Bremerton is shipyard, ferry, and a growing residential corridor for Seattle commuters. Service businesses here serve both deep-rooted locals and younger families who moved over from the city — your site needs to feel familiar to both audiences.",
    whyItMatters: [
      "Seattle-side commuters research everything online before they call — they'll skip you if your site looks dated.",
      "Naval shipyard families relocate frequently — capturing them in their first month determines a year of business.",
      "Bremerton is one of WA's most-searched 'web design [city]' queries — ranking here is real volume.",
    ],
    bestCategories: ["auto-repair", "real-estate", "moving", "fitness", "restaurant"],
  },
  {
    slug: "tacoma",
    name: "Tacoma",
    state: "WA",
    region: "Puget Sound",
    intro:
      "Tacoma's working-class roots and creative-economy boom mean your site has to land for both — a Hilltop barber shop and a downtown design firm should both feel right at home with us. We build Tacoma sites that don't try to look like Seattle.",
    whyItMatters: [
      "Tacoma's small-business scene grew 18% in the last 5 years — competition for local search is intensifying.",
      "Tacoma residents Google before walking in 73% of the time (industry avg) — your site is the gatekeeper.",
      "Most agencies pitching Tacoma businesses charge Seattle prices for Seattle-quality work. We don't.",
    ],
    bestCategories: ["restaurant", "auto-repair", "salon", "fitness", "tattoo"],
  },
  {
    slug: "olympia",
    name: "Olympia",
    state: "WA",
    region: "South Sound",
    intro:
      "Olympia's mix of state-government workers, Evergreen alumni, and small-batch local businesses creates an audience that values authentic local voice. Cookie-cutter sites get ignored here — yours should read like your business, not like a template.",
    whyItMatters: [
      "State-worker audience has predictable lunch + after-work patterns — local SEO captures that traffic.",
      "Olympia's farmers' market culture rewards businesses that signal local pride on their site.",
      "Search volume for 'olympia [service]' is up 22% YoY — the demand is there if you can rank.",
    ],
    bestCategories: ["restaurant", "salon", "fitness", "florist", "tattoo"],
  },
  {
    slug: "seattle",
    name: "Seattle",
    state: "WA",
    region: "Puget Sound",
    intro:
      "Seattle is the most expensive web-design market in WA — agencies routinely charge $5–15K for a site we'd build for $997. The quality is real; the markup isn't. We've built sites for Seattle businesses that compete head-to-head with downtown agency work, at a tenth of the price.",
    whyItMatters: [
      "Seattle small businesses are competing against tech-company-backed shops — your site has to look the part.",
      "Local SEO in Seattle is brutal — rankings move slowly, but a good site compounds over years.",
      "Tourist + commuter + resident traffic mean your site sees three audiences a day. It needs to handle all three.",
    ],
    bestCategories: ["restaurant", "salon", "fitness", "med-spa", "law-firm"],
  },
  {
    slug: "bellevue",
    name: "Bellevue",
    state: "WA",
    region: "Eastside",
    intro:
      "Bellevue clients expect Microsoft-grade polish at every touchpoint — your website is part of how they decide whether you can hold your own. We build Bellevue sites that look like they belong on the same screen as the rest of their day.",
    whyItMatters: [
      "Eastside tech audience has zero patience for slow-loading or visually dated sites — they'll bounce in seconds.",
      "Bellevue average household income is 2x state median — the willingness-to-pay is there if you earn the trust.",
      "International audience (Chinese, South Asian) — image-heavy + clean structure outperforms text-heavy.",
    ],
    bestCategories: ["med-spa", "real-estate", "fitness", "tutoring", "salon"],
  },
  {
    slug: "spokane",
    name: "Spokane",
    state: "WA",
    region: "Eastern WA",
    intro:
      "Spokane operates differently from Puget Sound — slower seasonal cycles, more service-oriented economy, deeper community ties. Your website needs to feel local-Spokane, not transplanted-from-Seattle. We build sites that respect that distinction.",
    whyItMatters: [
      "Spokane's snow-belt seasons create predictable demand swings — your site can capitalize on each.",
      "Cross-border traffic from Idaho adds 15% to most Spokane service-business search — ranking captures it.",
      "Local pride is real here — sites that feel imported from out-of-state lose to ones that feel built locally.",
    ],
    bestCategories: ["construction", "auto-repair", "landscaping", "hvac", "restaurant"],
  },
  {
    slug: "vancouver-wa",
    name: "Vancouver",
    state: "WA",
    region: "SW Washington",
    intro:
      "Vancouver WA sits across the Columbia from Portland but operates in its own market — Washington-state taxes, no income tax, and a residential-spillover economy from Oregon. Your site needs to clearly signal you're WA-based to win the local-tax-haven crowd.",
    whyItMatters: [
      "Oregon-side residents cross over for tax-free shopping — your site should make them feel welcome too.",
      "Population growth here is among the fastest in WA — new residents Google-research everything.",
      "The 'web design vancouver wa' query has surprisingly low competition — ranking is achievable.",
    ],
    bestCategories: ["restaurant", "auto-repair", "construction", "salon", "fitness"],
  },
  {
    slug: "everett",
    name: "Everett",
    state: "WA",
    region: "North Sound",
    intro:
      "Everett's Boeing-driven economy and growing residential-commuter base mean your site serves both blue-collar manufacturing families and Snohomish County professionals. We build Everett sites that don't feel like Seattle copies — Everett has its own identity.",
    whyItMatters: [
      "Boeing layoffs and rehires create cyclical local-business swings — your site can be ready for both.",
      "Snohomish County residents commute south for work but spend locally — capture their evenings + weekends.",
      "Everett 'web design' search volume is competitive but winnable with a real, well-built site.",
    ],
    bestCategories: ["auto-repair", "restaurant", "fitness", "construction", "salon"],
  },
];

export function getCityBySlug(slug: string): City | null {
  const cleaned = (slug || "").toLowerCase().trim();
  return CITIES.find((c) => c.slug === cleaned) || null;
}
