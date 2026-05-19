export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Elite Hardscapes & Landscaping — Hardscape, Landscape & Property Maintenance · Port Angeles WA

> Locally owned hardscape, landscape, and property-maintenance crew working the Olympic Peninsula since 2022. Owner-operated by Tyler Fritz. Fully insured. Hardscape first — retaining walls, paver patios, walkways, cedar fencing, fire pits. Landscape design, install, hydroseed lawns. Weekly maintenance routes Sequim through Forks.

## About

Elite Hardscapes & Landscaping is a small, owner-operated outdoor contractor on the Olympic Peninsula. Founded in 2022 by Tyler Fritz. The company specializes in hardscape construction (retaining walls, paver work, fencing) and landscape design and install, with a year-round property-maintenance route covering Clallam County. Tyler is the single point of contact from quote through walk-off.

## Services

### Hardscape

Built level, built drained, built to outlast the rain. Specialties include:

- Stack-block retaining walls (Allan Block, Mutual Materials, etc.)
- Natural-stone retaining walls and accent walls
- Paver patios — concrete, flagstone, grass-joint
- Paver walkways and driveways
- Cedar privacy fencing and custom gates
- Fire pits and seat walls
- Custom steps (timber, stone, paver)
- Drainage solutions

### Landscape Design & Install

From a single front-yard refresh to a full property redesign:

- Bed design and layout
- Native and climate-resilient plant installs
- Hydroseed lawn installation (custom seed mixes)
- Sod lawn installation
- Mulch refresh
- Edging and bed cleanup
- Site-prep grading and drainage
- Greenhouse and shed pad prep

### Property Maintenance

Weekly and bi-weekly route service across the Peninsula:

- Mowing, edging, line trim, blowing
- Spring and fall cleanups
- Brush clearing
- Storm cleanup and property prep
- Seasonal pruning and bed care

## Process

1. **Call or text Tyler** at (360) 797-4448 with a brief description of your property and what you're picturing.
2. **Free walkthrough** scheduled within the same week. Tyler walks the site, measures, and talks through options.
3. **Written estimate** delivered within a few days — fixed-price for hardscape and design/install, route pricing for maintenance.
4. **Build / install** kicks off on the agreed date. You talk to the owner the whole way through, not a project manager.
5. **Walk-off** at completion. Maintenance starts on the next visit cycle if you've signed up for ongoing care.

## Service Area

Working the entire Olympic Peninsula. Most active in:

- Sequim
- Port Angeles
- Carlsborg
- Port Townsend
- Joyce
- Diamond Point
- Forks
- Surrounding Clallam County

## Pricing

Pricing varies by scope and material. Three rough buckets to set expectations:

- **Maintenance routes** — flat-rate per visit, billed monthly. Includes mow / edge / blow + seasonal extras.
- **Hardscape projects** — quoted fixed-price after a site walkthrough. Most projects fall between low four figures and mid five figures depending on materials and square footage.
- **Landscape design & install** — quoted fixed-price after a site walkthrough. Hydroseed lawns are sized per square foot. Plant installs scale with plant count and bed prep needed.

Free estimates always. No deposit pressure, no high-pressure sales.

## Contact

- **Owner:** Tyler Fritz (talk directly — no call center)
- **Phone / Text:** (360) 797-4448
- **Address:** 9321 Old Olympic Hwy, Port Angeles, WA
- **Hours:** Mon–Sat 7a–6p · Sun closed
- **Website:** https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes

## Key Pages

- [Home / Services overview](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes)
- [Selected work portfolio](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#work)
- [About Tyler Fritz](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#about)
- [Free estimate request](https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes#contact)

## Trust & Credentials

- Licensed and fully insured in Washington State
- Locally owned, owner-operator (Tyler Fritz)
- Owner is your single point of contact from quote through walk-off
- Established 2022, working the Olympic Peninsula full-time

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
