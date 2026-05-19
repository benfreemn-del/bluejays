export const dynamic = "force-static";
export const revalidate = 3600;

const body = `# Mountain View Landscape & Design — The Full Story

> Family-owned, Auburn-WA-based landscape design + installation + maintenance firm serving King, Pierce, Snohomish, and Kittitas counties since 1976.

## About Mountain View

Mountain View Landscape & Design is a family-owned firm based in Auburn, Washington. **Tim Hunsaker** has been landscaping in the Pacific Northwest since 1976 — first under the Shamrock Landscaping name, then as Mountain View. **Bonnie Hunsaker** runs the maintenance side of the business — the year-round route, bed work, pruning, and the relationships with clients who call back every season.

Over 49 years they've built and maintained landscapes for **5,000+ satisfied customers** across the Puget Sound region. Most of their work today is repeat clients on their next phase — second yards, expanded patios, kids' first homes.

The whole reason Mt View can stand behind every install is simple: **every discipline lives in-house**. Design, hardscape, planting, irrigation, lighting, and maintenance are all run by the same family. Nothing is subcontracted out and forgotten about a year later.

## Services in Detail

### Custom Landscape Design & Installation

End-to-end residential and commercial design work — from initial site survey, soil and drainage analysis, climate-fit planting plan, and 3D rendering through final installation. Every project gets a personal walkthrough with Tim before any ground is broken.

### Hardscapes & Stoneworks

Retaining walls (including engineered tiered systems), patios, walkways, fire features, decorative stoneworks, and stairs. 49 years of regional materials sourcing means we know which suppliers hold up to Pacific Northwest rain cycles and which ones don't.

### Water Features

Ponds, waterfalls, streams, and fountain installations engineered for Pacific Northwest climate. Built with proper liner systems, pump sizing for the head pressure, and freeze-aware plumbing.

### Retaining Walls

From small garden walls to engineered tiered systems holding back hillsides. Permits handled, drainage built in correctly the first time, depth-rated to the loads.

### Irrigation Systems

Smart irrigation design — multi-zone drip + spray hybrids tuned to actual plant water needs and Puget Sound rainfall patterns. WaterSense-compliant controllers. Winterization included on maintenance plans.

### Sod & Native Planting

Premium sod installation and native-plant landscaping tuned to Pacific Northwest soils, climate, and ecology. We work with regional growers so the plants going into your yard were grown within 100 miles of where they'll live — better establishment, less shock, more drought tolerance after year one.

### Landscape Lighting

Path lights, accent uplighting on trees and architecture, security illumination, and architectural night lighting. Low-voltage LED systems — energy-efficient, long-life, and serviceable.

### Year-Round Maintenance

This is what makes Mt View different from one-and-done install crews. We **maintain what we build**.

## Maintenance Plan Tiers (Recurring Revenue Side)

### Essentials — From $180/mo

Core recurring service for residential properties. Mowing, edging, basic bed care, spring + fall cleanup. Best for clients who want professional baseline service without the full-bed pruning + fertilization rotation.

### Full Care — Mid-tier (Most Popular)

Everything in Essentials plus pruning, irrigation tune-ups, fertilization rotation, proactive seasonal route service, and one walkthrough per quarter with the crew lead. This is the tier most clients land on — it covers the long-tail tasks that get forgotten otherwise (gutter line cleanouts, irrigation winterization, deadheading the spent perennials before they go to seed).

### Estate — Up to $420/mo

Comprehensive year-round care for larger properties (1+ acre) or premium grounds. Full crew rotation, monthly walkthroughs, plant replacement allowance, snow + ice response on the priority routes (Auburn / Kent / Renton zones), and dedicated point-of-contact for the property manager or owner.

## Process (How a Project Works)

1. **Free Estimate** — Call (253) 638-0500 or fill out the contact form. Tim or Bonnie respond within 1 business day to schedule a walkthrough.
2. **Site Visit & Design Conversation** — Tim walks the property with you. Talks through what you want, what the soil and exposure allow, and where the budget should land for the highest-value impact.
3. **Proposal & Design Plan** — Itemized scope, design renderings for the bigger jobs, materials and plant list, timeline, and price. No surprises later.
4. **Installation** — Same Hunsaker-led crew that does every job. Daily progress, clean site at end of each day, weekly walkthrough with the homeowner.
5. **Long-term Maintenance** — Optional but recommended. Roll into one of the three maintenance tiers so what we built keeps looking new.

## Why Choose Mountain View

- **Same family since 1976** — Tim and Bonnie Hunsaker, same standard, the whole way through
- **49+ years in the region** — we know which microclimates kill which plants
- **5,000+ satisfied customers** across King, Pierce, Snohomish, and Kittitas counties
- **Every discipline in-house** — no subcontracting design, hardscape, planting, irrigation, or lighting
- **Licensed & insured** in Washington State
- **We maintain what we build** — install + maintenance under one roof
- **Climate-smart native planting** — built for Pacific Northwest soils and weather
- **Eco-conscious approach** — low-impact tools where it matters, water-efficient irrigation, native species priority

## Service Area Detail

**King County:** Auburn (HQ), Seattle, Bellevue, Kent, Renton, Federal Way, Bothell

**Pierce County:** Tacoma, Puyallup, Bonney Lake, Gig Harbor

**Snohomish County:** Everett, Lynnwood

**Kittitas County:** Ellensburg, Cle Elum (seasonal projects + estate maintenance only)

Estate-tier maintenance + larger installs travel further on request — call to discuss.

## Contact Information

- **Phone:** (253) 638-0500
- **Email:** mtviewlandscapeonline@gmail.com
- **Address:** 18225 Southeast 313th Street, Auburn, WA 98092
- **Hours:** Mon–Fri 8a–5p
- **Service area:** King, Pierce, Snohomish, and Kittitas counties · WA
- **Founded:** 1976 (originally Shamrock Landscaping)
- **Owners:** Tim Hunsaker (founder, lead designer) and Bonnie Hunsaker (maintenance director)
- **Website:** https://bluejayportfolio.com/clients/mt-view-landscaping
- **Google Maps:** https://www.google.com/maps/place/Mountain+View+Landscape+%26+Design/

## Key Pages

- [Home / Services](https://bluejayportfolio.com/clients/mt-view-landscaping)
- [Maintenance Plans](https://bluejayportfolio.com/clients/mt-view-landscaping#maintenance)
- [Project Portfolio](https://bluejayportfolio.com/clients/mt-view-landscaping#portfolio)
- [Seasonal Calendar](https://bluejayportfolio.com/clients/mt-view-landscaping#seasonal)
- [Yard Quiz — What Does Your Yard Need?](https://bluejayportfolio.com/clients/mt-view-landscaping#quiz)
- [About Tim Hunsaker](https://bluejayportfolio.com/clients/mt-view-landscaping#about)
- [Service Area](https://bluejayportfolio.com/clients/mt-view-landscaping#service-area)
- [Reviews](https://bluejayportfolio.com/clients/mt-view-landscaping#reviews)
- [FAQ](https://bluejayportfolio.com/clients/mt-view-landscaping#faq)
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
