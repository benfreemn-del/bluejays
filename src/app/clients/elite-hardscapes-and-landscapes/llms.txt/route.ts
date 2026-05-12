export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Elite Hardscapes & Landscapes — Hardscape, Landscape & Property Maintenance · Port Angeles WA

> Locally owned hardscape, landscape, and property-maintenance crew working the Olympic Peninsula. Retaining walls, paver patios, fences, hydroseed lawns, plantings, and weekly mowing routes from Forks to Port Townsend. Owner-operated by Tyler Fritz since 2023.

## Services

- **Hardscape** — Stack-block & natural-stone retaining walls, paver patios and walkways, cedar fencing, fire pits, custom steps. ([Services](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#services))
- **Landscape Design & Install** — Bed design, native + climate-resilient plant installs, hydroseed and sod lawns, mulch refresh, drainage cleanup.
- **Property Maintenance** — Weekly and bi-weekly mowing, edging, blowing. Seasonal cleanups, brush clearing, storm prep.

## Service Area

Port Angeles · Sequim · Carlsborg · Port Townsend · Joyce · Diamond Point · Forks · Clallam County

## Contact

- **Owner:** Tyler Fritz
- **Phone / Text:** (360) 797-4448
- **Address:** 9321 Old Olympic Hwy, Port Angeles, WA
- **Hours:** Mon–Sat 7a–6p · Sun closed
- **Website:** https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes

## Key Pages

- [Home / Services](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes)
- [Selected Work](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#work)
- [About Tyler](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#about)
- [Free Estimate Request](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#contact)

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
