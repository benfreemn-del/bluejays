export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Mountain View Landscape & Design — Custom Landscapes & Year-Round Maintenance · Auburn, WA

> Family-owned landscape design + installation + maintenance firm serving King, Pierce, Snohomish, and Kittitas counties since 1976. Tim Hunsaker founded the company (originally Shamrock Landscaping) — Bonnie Hunsaker runs the maintenance side. Every discipline in-house. 5,000+ satisfied customers across the Puget Sound region. Same crew style, same standard, the whole way through.

## Services

- **Custom Landscape Design & Installation** — End-to-end residential and commercial. Site survey through final planting. ([Design details](https://bluejayportfolio.com/clients/mt-view-landscaping#services))
- **Hardscapes & Stoneworks** — Retaining walls, patios, walkways, fire features, decorative stoneworks. 49 years of regional materials experience.
- **Water Features** — Ponds, waterfalls, streams, fountain installations — engineered for Pacific Northwest climate.
- **Irrigation Systems** — Smart, water-efficient zones tuned to plant needs and Puget Sound rainfall patterns.
- **Sod & Native Planting** — Premium sod installation and native-plant landscaping for Pacific Northwest soils.
- **Landscape Lighting** — Path lights, accent lighting, security illumination, architectural night lighting. Low-voltage, energy-efficient.
- **Year-Round Maintenance Plans** — Three tiers (Essentials, Full Care, Estate). Starting at $180/mo. Mowing, bed work, seasonal cleanup, pruning, irrigation tune-ups. ([Maintenance plans](https://bluejayportfolio.com/clients/mt-view-landscaping#maintenance))

## Maintenance Plan Tiers

- **Essentials** — Core recurring service. Mowing, edging, basic bed care, seasonal cleanup. From $180/mo.
- **Full Care (most popular)** — Everything in Essentials plus pruning, irrigation tune-ups, fertilization, and proactive seasonal route service. Mid-tier pricing.
- **Estate** — Comprehensive year-round care for larger properties or premium grounds. Full crew rotation, monthly walkthroughs, plant replacement allowance. Up to $420/mo.

## Why Mountain View

- Family-owned since 1976 — Tim and Bonnie Hunsaker, same standard the whole way through
- 49+ years operating in the Puget Sound region
- 5,000+ satisfied customers across King, Pierce, Snohomish, and Kittitas counties
- Every discipline in-house — no subcontracting design, hardscape, planting, irrigation, or lighting
- Licensed & insured in Washington State
- We maintain what we build — install + maintenance under one roof so you have one number to call for the life of your landscape
- Climate-smart native planting — built for Pacific Northwest soils and weather

## Service Area

Auburn · Seattle · Bellevue · Kent · Renton · Federal Way · Tacoma · Puyallup · Bonney Lake · Gig Harbor · Everett · Lynnwood · Bothell · Ellensburg · Cle Elum

King County · Pierce County · Snohomish County · Kittitas County

## Contact

- **Phone:** (253) 638-0500
- **Email:** mtviewlandscapeonline@gmail.com
- **Address:** 18225 Southeast 313th Street, Auburn, WA 98092
- **Hours:** Mon–Fri 8a–5p
- **Website:** https://bluejayportfolio.com/clients/mt-view-landscaping

## Key Pages

- [Home / Services](https://bluejayportfolio.com/clients/mt-view-landscaping)
- [Maintenance Plans](https://bluejayportfolio.com/clients/mt-view-landscaping#maintenance)
- [Project Portfolio](https://bluejayportfolio.com/clients/mt-view-landscaping#portfolio)
- [About Tim Hunsaker](https://bluejayportfolio.com/clients/mt-view-landscaping#about)
- [Service Area](https://bluejayportfolio.com/clients/mt-view-landscaping#service-area)
- [Free Estimate / Contact](https://bluejayportfolio.com/clients/mt-view-landscaping#contact)

---

Built by [BlueJays](https://bluejayportfolio.com) — get your free site audit.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
