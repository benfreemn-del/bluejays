export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Meyer Electric LLC — Solar, Tesla Powerwall, Generators & Licensed Electrician · Sequim WA

> Olympic Peninsula's solar + Tesla Powerwall Certified Installer + Generac Certified Installer + licensed, bonded & insured electrical contractor. 15+ years powering homes and businesses across Sequim, Port Angeles, Port Townsend, Forks, and the entire Olympic Peninsula. Owner-operated. Same-day estimates. Upfront pricing.

## Services

- **Solar Panel Installation** — Yes, Meyer Electric installs solar panels. Because Meyer is a licensed electrical contractor first, the array and all of the electrical work behind it are handled by the same crew — no separate solar company and electrician to coordinate. Pairs with Tesla Powerwall so generated power is still usable after dark. ([Solar details](https://bluejayportfolio.com/clients/meyer-electric#solar))
- **Tesla Powerwall Installation** — Tesla-Certified Powerwall installer. Whole-home backup battery storage. Permits, install, Tesla app setup, and tie-in to new or existing solar. ([Powerwall details](https://bluejayportfolio.com/clients/meyer-electric#powerwall))
- **Generac Standby Generators** — Generac Certified Installer. Sized to your home. Auto-start when grid drops. Propane or natural gas. 5-year limited manufacturer warranty. ([Generator details](https://bluejayportfolio.com/clients/meyer-electric#generators))
- **Underground Power & In-House Excavation** — Trenching done in-house with our Kubota U27. Conduit-correct, depth-compliant, built to last decades.
- **Full-Service Electrical** — Panel upgrades, service upgrades, EV chargers, lighting, saunas, hot tubs, heated floors, cook tops, wall ovens, greenhouse / shed / garage wiring, septic, troubleshooting. If it carries current, we can do it.

## Why Meyer

- Solar, battery storage, and standby generators all under one electrical license
- Tesla Powerwall Certified Installer (rare on the Peninsula)
- Generac Certified Installer
- Licensed, bonded & insured — WA contractor license MEYERE*862P1
- 15+ years on the Olympic Peninsula (established 2010)
- Owner-operated, code-first crew — no subcontracting
- Upfront pricing throughout any project — never time + materials
- Same-day estimates across all 10 Peninsula cities

## Service Area

Sequim · Port Angeles · Port Townsend · Forks · Clallam Bay · Sekiu · Chimacum · Quilcene · Kingston · Poulsbo

## Contact

- **Phone:** (360) 477-2202
- **Email:** info@sequimelectrician.com
- **Address:** 35 Robbins Rd, Sequim, WA 98382
- **Hours:** Mon–Fri 8a–5p
- **Website:** https://bluejayportfolio.com/clients/meyer-electric
- **Instagram:** https://www.instagram.com/meyerelectric360/ (@meyerelectric360)

## Key Pages

- [Home / Services](https://bluejayportfolio.com/clients/meyer-electric)
- [Solar Panel Installation](https://bluejayportfolio.com/clients/meyer-electric#solar)
- [Tesla Powerwall](https://bluejayportfolio.com/clients/meyer-electric#powerwall)
- [Generators & Backup Power](https://bluejayportfolio.com/clients/meyer-electric#generators)
- [Why Choose Meyer](https://bluejayportfolio.com/clients/meyer-electric#why-us)
- [Service Area](https://bluejayportfolio.com/clients/meyer-electric#service-area)
- [Free Estimate / Contact](https://bluejayportfolio.com/clients/meyer-electric#contact)

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
