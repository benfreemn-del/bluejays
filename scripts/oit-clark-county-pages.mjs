/* ============================================================
   OIT — Clark County town pages (2026-08-19).

   Follow-up to scripts/oit-2026-08-18-update.mjs: Luke's FAQ has
   claimed Camas, Battle Ground, Washougal, Ridgefield, and La Center
   since launch, but none had a landing page. Generates the five from
   the Poulsbo template with the same transformations that built the
   Longview/Kelso/Vancouver pages, then updates sitemap + llms.txt.

   Run from the pages dir:
     cd public/sites/olympic-inspections && node ../../../scripts/oit-clark-county-pages.mjs

   REMEMBER: new slugs must ALSO be added to the rewrite alternation
   in next.config.ts (both host blocks) or they 404 on the domain.
   ============================================================ */

import { readFileSync, writeFileSync } from 'node:fs';

const CITIES = [
  {
    slug: 'camas', name: 'Camas', county: 'Clark County', region: 'Southwest Washington',
    zip: '98607', lat: 45.5871, lng: -122.3995,
    whyLocal: `Camas grew up around its paper mill, and the neighbourhoods near downtown still carry mill-era housing &mdash; small pre-war homes with original crawlspaces and decades of remodels layered on top. Up on Prune Hill and around Lacamas Lake the housing is newer but sits on steep, wooded, north-facing lots that stay shaded and damp for much of the year. Lake humidity, tree cover, and tight modern envelopes are a reliable combination for condensation problems that never quite announce themselves.`,
    nearby: `Dispatched from our Longview office, we serve Camas and the surrounding Clark County communities &mdash; including Washougal, Vancouver, Battle Ground, Ridgefield, and La Center. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.`,
  },
  {
    slug: 'battle-ground', name: 'Battle Ground', county: 'Clark County', region: 'Southwest Washington',
    zip: '98604', lat: 45.7809, lng: -122.5334,
    whyLocal: `Battle Ground is acreage country &mdash; homes on a few open acres, often with a shop, a barn, or a manufactured home on the parcel. Much of the area sits on ground with a seasonally high water table, so crawlspaces that are bone dry in August can hold standing water by February without the owner ever seeing it. Manufactured and modular homes bring their own pattern: tight floors over a vented crawl, plastic ground cover that gets displaced, and ductwork running through the dampest air on the property.`,
    nearby: `Dispatched from our Longview office, we serve Battle Ground and the surrounding Clark County communities &mdash; including Ridgefield, La Center, Vancouver, Camas, and Washougal. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.`,
  },
  {
    slug: 'washougal', name: 'Washougal', county: 'Clark County', region: 'Southwest Washington',
    zip: '98671', lat: 45.5826, lng: -122.3534,
    whyLocal: `Washougal sits at the mouth of the Columbia River Gorge, and the Gorge changes everything about moisture here. East wind drives rain horizontally into siding and window flashing in ways ordinary Northwest rain never does, so wall assemblies that survive fine in Vancouver leak in Washougal. Riverfront and older downtown housing adds original construction close to the water table, while hillside homes above town take wind-driven rain on their weather side year after year.`,
    nearby: `Dispatched from our Longview office, we serve Washougal and the surrounding Clark County communities &mdash; including Camas, Vancouver, Battle Ground, Ridgefield, and La Center. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.`,
  },
  {
    slug: 'ridgefield', name: 'Ridgefield', county: 'Clark County', region: 'Southwest Washington',
    zip: '98642', lat: 45.8151, lng: -122.7426,
    whyLocal: `Ridgefield has spent the last decade as one of the fastest-growing cities in Washington, and rapid construction leaves a specific fingerprint: houses closed in during the wet season with framing that never fully dried, tight modern envelopes that trap whatever moisture got built in, and bath fans or dryer vents that were never properly terminated outside. Near the wildlife refuge and the lake bottoms, older farmhouses sit on low ground that holds water most of the winter.`,
    nearby: `Dispatched from our Longview office, we serve Ridgefield and the surrounding Clark County communities &mdash; including La Center, Battle Ground, Vancouver, Camas, and Washougal. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.`,
  },
  {
    slug: 'la-center', name: 'La Center', county: 'Clark County', region: 'Southwest Washington',
    zip: '98629', lat: 45.8623, lng: -122.6704,
    whyLocal: `La Center sits above the East Fork of the Lewis River, and the properties that ring the town run down toward river-bottom ground that stays damp well into summer. This is small-acreage country &mdash; older farmhouses, newer homes on rural parcels, and plenty of outbuildings &mdash; much of it on well water with vented crawlspaces. A crawlspace over river-valley ground can feed moisture into a house for years before anything visible shows up in the living space.`,
    nearby: `Dispatched from our Longview office, we serve La Center and the surrounding Clark County communities &mdash; including Ridgefield, Battle Ground, Vancouver, Camas, and Washougal. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.`,
  },
];

const tpl = readFileSync('mold-inspection-poulsbo.html', 'utf8');

for (const c of CITIES) {
  let h = tpl;
  h = h.split('Poulsbo').join(c.name);
  h = h.split('poulsbo').join(c.slug);
  h = h.split('Kitsap County, WA').join(`${c.county}, WA`);
  h = h.split('Kitsap County').join(c.county);
  h = h.split('Kitsap').join(c.county.replace(' County', ''));
  h = h.split('Olympic Peninsula').join(c.region);
  h = h.replace(/(Why [^<]*? Homes Are Prone to Mold<\/h2><\/div>\s*\r?\n\s*<p class="section-sub reveal">)[\s\S]*?(<\/p>)/, `$1${c.whyLocal}$2`);
  h = h.replace(/(Serving [^<]*? &amp; Nearby Communities<\/h2><\/div>\s*\r?\n\s*<p class="section-sub reveal">)[\s\S]*?(<\/p>)/, `$1${c.nearby}$2`);
  /* restore site-wide footer nav clobbered by the county swap */
  h = h.replace(/(<a href="\/inspections-kitsap-county">)[^<]*(<\/a>)/g, '$1Kitsap County$2');
  /* SW WA is mold-only — no well-water card */
  h = h.replace(/\s*<a href="\/well-water-testing-[a-z-]+" class="service-card reveal"[^>]*>[\s\S]*?<\/a>/, '');
  h = h.replace(/"latitude":\s*[-\d.]+/g, `"latitude": ${c.lat}`);
  h = h.replace(/"longitude":\s*[-\d.]+/g, `"longitude": ${c.lng}`);
  h = h.replace(/"postalCode":\s*"\d{5}"/g, `"postalCode": "${c.zip}"`);
  writeFileSync(`mold-inspection-${c.slug}.html`, h);

  let bad = 0;
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { bad++; }
  }
  const leftovers = (h.match(/Poulsbo|Kitsap(?! County<\/a>)|Olympic Peninsula/g) || []).length;
  console.log(`mold-inspection-${c.slug}.html`.padEnd(40) + `invalid-JSONLD:${bad} leftovers:${leftovers}`);
}

/* ---- sitemap ---- */
let m = readFileSync('sitemap.xml', 'utf8');
if (!m.includes('mold-inspection-camas')) {
  const add = CITIES.map((c) =>
    `  <url><loc>https://www.olympicinspect.com/mold-inspection-${c.slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
  m = m.replace('</urlset>', `\n  <!-- Mold inspection — Clark County towns (added 2026-08-19) -->\n${add}\n\n</urlset>`);
  writeFileSync('sitemap.xml', m);
  console.log('sitemap: 5 URLs added, total ' + (m.match(/<loc>/g) || []).length);
}

/* ---- llms.txt ---- */
let l = readFileSync('llms.txt', 'utf8');
if (!l.includes('mold-inspection-camas')) {
  l = l.replace('- Vancouver: https://www.olympicinspect.com/mold-inspection-vancouver-wa',
    `- Vancouver: https://www.olympicinspect.com/mold-inspection-vancouver-wa
- Camas: https://www.olympicinspect.com/mold-inspection-camas
- Battle Ground: https://www.olympicinspect.com/mold-inspection-battle-ground
- Washougal: https://www.olympicinspect.com/mold-inspection-washougal
- Ridgefield: https://www.olympicinspect.com/mold-inspection-ridgefield
- La Center: https://www.olympicinspect.com/mold-inspection-la-center`);
  l = l.replace('- Southwest Washington (Longview, Kelso, Vancouver) is currently mold inspection only.',
    '- Southwest Washington (Longview, Kelso, Vancouver, Camas, Battle Ground, Washougal, Ridgefield, La Center) is currently mold inspection only.');
  writeFileSync('llms.txt', l);
  console.log('llms.txt: 5 pages listed');
}

console.log('\nDONE. Now register the 5 slugs in next.config.ts (both host blocks).');
