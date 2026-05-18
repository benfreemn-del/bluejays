export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Peninsula Paving & Excavating — Asphalt Paving, Driveways & Site Work · Sequim WA

> Family-owned asphalt paving and excavation contractor serving the Olympic Peninsula since 1985. Driveways, parking lots, private roads, seal coating, line striping, excavation, grading, and demolition. 41 years on the Peninsula. One in-house crew handles excavation through finish striping — no subcontractor handoffs.

## Services

- **Asphalt Paving** — Residential driveways, commercial parking lots, private roads, HOA shared access. Hot-mix asphalt installed and compacted to spec. Sub-grade work done in-house. ([Service detail](https://bluejayportfolio.com/clients/peninsula-paving#services))
- **Seal Coating** — Asphalt seal coating to protect against UV, water intrusion, oil, and Pacific Northwest winters. 3-5 year cycle. Doubles surface life when done on schedule.
- **Line Striping & Pavement Marking** — Parking lot striping, ADA stalls, fire lanes, directional arrows, custom curb painting.
- **Excavation & Grading** — Site prep, sub-grade compaction, drainage, French drains, final grade for paving or building pads.
- **Demolition & Removal** — Asphalt removal, concrete demolition, hauling, site cleanup before a fresh install.
- **Crack Filling & Pothole Repair** — Sealant on cracks before they spider. Hot patch on potholes before they swallow tires.

## Why Peninsula Paving

- Family-owned since 1985 — founded by Cyril & Ella Frick
- 41 years on the Olympic Peninsula — Pacific Northwest weather built-in
- One in-house crew handles excavation through finish work (no subcontractors)
- Plain-language estimates — real square footage, real ton counts, real labor
- Drainage assessed BEFORE paving (most crews skip this)
- Honest weather windows — we tell you the truth if the forecast shifts

## Service Area

Sequim · Port Angeles · Port Townsend · Carlsborg · Diamond Point · Blyn · Dungeness · Gardiner · Joyce · Quilcene · Chimacum · Forks (Clallam, Jefferson, and northern Mason counties)

## Contact

- **Phone:** (360) 477-7015
- **Address:** P.O. Box 667, Sequim, WA 98382
- **Hours:** Mon–Fri 7a–5p
- **Website:** https://bluejayportfolio.com/clients/peninsula-paving

## Key Pages

- [Home / Services](https://bluejayportfolio.com/clients/peninsula-paving)
- [Services](https://bluejayportfolio.com/clients/peninsula-paving#services)
- [Our Process](https://bluejayportfolio.com/clients/peninsula-paving#process)
- [Why Peninsula](https://bluejayportfolio.com/clients/peninsula-paving#why-us)
- [Service Area](https://bluejayportfolio.com/clients/peninsula-paving#service-area)
- [Free Estimate / Contact](https://bluejayportfolio.com/clients/peninsula-paving#contact)

---

Built by [BlueJays](https://bluejayportfolio.com/audit) — get your free site audit.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
