import { NextResponse } from "next/server";

/**
 * GET /llms.txt
 *
 * Markdown-mirror summary of bluejayportfolio.com for AI crawlers
 * (ChatGPT, Claude, Perplexity, Gemini) and SEO indexers. Follows the
 * emerging llmstxt.org spec: H1 title, blockquote summary, then
 * markdown-link sections grouping the most important pages.
 *
 * The companion /llms-full.txt is the fuller content dump.
 *
 * Why this matters:
 *  - AI agents pulling your business into ChatGPT answers parse this
 *    without choking on JS / Next.js bundles
 *  - SEO crawlers can index it as a clean topic map
 *  - It's tiny, fast, and zero-maintenance — single source of truth
 *    that a future Ben edits in one file.
 */

export const dynamic = "force-static";
export const revalidate = 3600; // 1hr — fresh enough, cheap enough

const BASE_URL = "https://bluejayportfolio.com";

const CONTENT = `# BlueJays — Premium Web Design for Local Businesses

> BlueJays builds premium custom websites for local businesses across the United States. We design and ship the site BEFORE the customer pays — the customer sees their finished site at a private preview URL and decides if they want it. $997 one-time, no monthly fees, $100/year for ongoing domain renewal + hosting + maintenance + support after the first year. Based in Washington State, serving the entire US.

## What we do

- [Premium $997 websites](${BASE_URL}/) — full custom site, domain registration, hosting setup, mobile-responsive, lab-quality SEO
- [Free site audit](${BASE_URL}/audit) — instant PDF audit of any business site with money-leak math + recovery projections
- [Portfolio examples](${BASE_URL}/) — 46 industries with V2 templates: dental, plumber, roofing, electrician, salon, real estate, law firm, vet, landscaping, contractor, and more
- [The Full System](${BASE_URL}/agency) — $9,700 + monthly retainer custom AI marketing system replacing traditional agencies (Google Ads + Meta Ads + email + SMS + SEO)
- [Schedule a call](${BASE_URL}/schedule) — 15-minute walkthrough with founder Ben

## Pricing

- Standard tier — **$997 one-time** for custom website + domain registration + hosting setup. After year 1, **$100/year** covers domain renewal, hosting, ongoing maintenance, and support.
- Installment plan — 3 × **$349** monthly (same total).
- Custom tier — **$100/year** flat for hand-built bespoke sites (LCAC, Hector Landscaping, Olympic Inspections, etc).
- Full System tier — **$9,700 setup** + $500–$1,000/month for the complete AI marketing system.
- 100% money-back satisfaction guarantee.

## How the buying flow works

1. We find you (cold scout) or you find us (audit / referral).
2. We design and ship a complete preview website at a private URL — yours to look at, no obligation.
3. You decide. If you want it, claim and pay $997 (or 3 × $349). If not, no charge, ever.
4. We register your domain, set up hosting, customize with your real photos and content, and deliver in 48 hours.
5. After year 1, the $100/year sub kicks in for renewal + hosting + support.

## Add-on services for paid customers

- Review Request Blast — **$99** to send 50 review-request texts to past customers
- 5 Extra Pages — **$400**
- Google Business Profile Setup — **$150**
- Monthly Content Updates — **$50/month** subscription

## Contact

- Email: [bluejaycontactme@gmail.com](mailto:bluejaycontactme@gmail.com)
- Founder: Ben (Washington State)
- Reply within 1 business day

## Key URLs

- Home: ${BASE_URL}/
- Free audit: ${BASE_URL}/audit
- Portfolio (46 industries): ${BASE_URL}/
- Full System / agency replacement: ${BASE_URL}/agency
- Schedule call: ${BASE_URL}/schedule
- Privacy: ${BASE_URL}/privacy
- Terms: ${BASE_URL}/terms
- Fuller AI-readable index: ${BASE_URL}/llms-full.txt
`;

export async function GET() {
  return new NextResponse(CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "all",
    },
  });
}
