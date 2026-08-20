/* ============================================================
   Olympic Inspections — 2026-08-18 update, applied to the LIVE source.

   THIS directory (bluejays/public/sites/olympic-inspections/) is what
   actually serves olympicinspect.com, via the bluejays Next.js repo on
   Vercel. Verified byte-identical to live. The copy at
   Desktop/Bluejay Business/olympic-inspections-site/ is STALE — its
   README wrongly claims to be the live source.

   Two changes, both requested by Luke:
   1. Remove every RV / boat / vehicle inspection claim — insurance
      does not cover that work, so the site must not advertise it.
   2. Add Southwest Washington mold pages (Longview, Kelso, Vancouver)
      — there is a Longview office but zero SW WA landing pages.

   Run: node _build-oit-update.mjs
   ============================================================ */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const report = [];
const ok = (m) => report.push('  ok   ' + m);
const miss = (m) => report.push('  MISS ' + m);

/* ============================================================
   PART 1 — scrub vehicle / boat / RV claims
   ============================================================ */
let s = readFileSync('index.html', 'utf8');

const swaps = [
  ['for residential, commercial, automotive, marine, and RV environments across Washington',
   'for residential and commercial properties across Washington'],
  ['"No — we inspect residential, commercial, automotive, marine (boats), and RV/trailer environments. If it has air, we can test it. Our affordable base pricing applies across all five markets."',
   '"We inspect residential and commercial properties — houses, rentals, offices, retail, and other buildings. Our affordable base pricing applies across both."'],
  ['"name": "Do you only inspect homes?"', '"name": "Do you inspect commercial buildings too?"'],
  ['<p>No &mdash; we inspect residential, commercial, automotive, marine (boats), and RV/trailer environments. If it has air, we can test it. Our affordable base pricing applies across all five markets.</p>',
   '<p>Yes &mdash; we inspect residential and commercial properties alike: houses, rentals, offices, retail, and other buildings. Our affordable base pricing applies across both.</p>'],
  ['Family-owned mold and air quality testing for homes, businesses, RVs, boats, and vehicles across Washington.',
   'Family-owned mold and air quality testing for homes and businesses across Washington.'],
  ['From the home you live in to the truck you drive to the boat at the slip &mdash; if it has air, we can test it.',
   'From the house you live in to the building you work in &mdash; lab-backed answers about the air inside it.'],
  ['Do you only inspect homes?', 'Do you inspect commercial buildings too?'],
];
for (const [a, b] of swaps) {
  if (s.includes(a)) { s = s.split(a).join(b); ok('swapped: ' + a.slice(0, 52)); }
  else miss('not found: ' + a.slice(0, 52));
}

/* schema service list — drop the three vehicle services */
const beforeLen = s.length;
s = s.replace(/,\s*\r?\n\s*"Marine Mold Testing",\s*\r?\n\s*"RV Mold Testing",\s*\r?\n\s*"Automotive Air Quality Testing"/, '');
if (s.length < beforeLen) ok('removed 3 vehicle services from schema'); else miss('schema service list');

/* the three market cards */
const cardRe = /\s*<div class="market-card reveal">\s*\r?\n\s*<div class="market-icon" aria-hidden="true">[^<]*<\/div>\s*\r?\n\s*<h3>(Automotive|Marine|RV &amp; Trailer)<\/h3>\s*\r?\n\s*<p>[\s\S]*?<\/p>\s*\r?\n\s*<\/div>/g;
const removedCards = (s.match(cardRe) || []).length;
s = s.replace(cardRe, '');
removedCards === 3 ? ok('removed 3 vehicle market cards') : miss(`market cards (removed ${removedCards}/3)`);

/* replacement cards — categories actually covered */
if (!s.includes('Real Estate Transactions')) {
  const newCards = `
                <div class="market-card reveal">
                    <div class="market-icon" aria-hidden="true">🏡</div>
                    <h3>Real Estate Transactions</h3>
                    <p>Pre-purchase and pre-listing inspections with chain-of-custody lab reports. Buyers get an independent answer before closing; sellers get documentation that a concern was tested rather than argued about.</p>
                </div>
                <div class="market-card reveal">
                    <div class="market-icon" aria-hidden="true">🔑</div>
                    <h3>Landlords &amp; Property Managers</h3>
                    <p>Independent testing for tenant complaints, turnovers, and disputes. Because we do not perform remediation, the report carries weight with tenants, owners, and insurers alike.</p>
                </div>
                <div class="market-card reveal">
                    <div class="market-icon" aria-hidden="true">💧</div>
                    <h3>After Water Damage</h3>
                    <p>Post-leak, post-flood, and post-repair verification. We test whether the problem is actually resolved &mdash; the step most often skipped between the repair and the insurance claim.</p>
                </div>`;
  const before = s.length;
  s = s.replace(/(<h3>Commercial<\/h3>[\s\S]*?<\/div>)/, '$1' + newCards);
  s.length > before ? ok('added 3 replacement market cards') : miss('replacement cards anchor');
}

/* ============================================================
   PART 2 — Southwest Washington card in "Areas We Serve"
   ============================================================ */
if (!s.includes('mold-inspection-longview')) {
  const swCard = `
                <div class="market-card reveal">
                    <div class="market-icon" aria-hidden="true">🌊</div>
                    <h3>Southwest Washington &rarr;</h3>
                    <p>
                        <a href="/mold-inspection-longview" style="color: var(--forest); font-weight: 600;">Longview</a> &middot;
                        <a href="/mold-inspection-kelso" style="color: var(--forest); font-weight: 600;">Kelso</a> &middot;
                        <a href="/mold-inspection-vancouver-wa" style="color: var(--forest); font-weight: 600;">Vancouver</a><br>
                        Mold inspection across Cowlitz and Clark County, dispatched from our Longview office.
                    </p>
                </div>`;
  const before = s.length;
  s = s.replace(/(<a href="\/mold-inspection-bainbridge-island"[\s\S]*?<\/p>\s*\r?\n\s*<\/div>)/, '$1' + swCard);
  s.length > before ? ok('added Southwest Washington area card') : miss('SW WA card anchor');
}
s = s.replace(
  'Independent mold and water inspections across the Olympic Peninsula and Kitsap. Tap your town for local details, or browse by county.',
  'Independent mold and water inspections across the Olympic Peninsula, Kitsap, and Southwest Washington. Tap your town for local details, or browse by county.');

writeFileSync('index.html', s);

/* ============================================================
   PART 3 — llms.txt
   ============================================================ */
let l = readFileSync('llms.txt', 'utf8');
l = l.replace('serving residential, commercial, automotive, marine, and RV environments across Washington State',
  'serving residential and commercial properties across Washington State');
l = l.replace(/- \*\*Automotive\*\* — personal vehicles, work trucks, vans, fleet cars\r?\n/, '');
l = l.replace(/- \*\*Marine\*\* — sailboats, yachts, fishing boats, houseboats\r?\n/, '');
l = l.replace(/- \*\*RV & Trailer\*\* — motorhomes, travel trailers, campers, fifth wheels\r?\n/, '');
l = l.replace('- **Commercial** — offices, retail, commercial buildings',
  '- **Commercial** — offices, retail, commercial buildings\n- **Real estate transactions** — pre-purchase and pre-listing inspections\n- **Landlords & property managers** — tenant complaints, turnovers, disputes\n- **After water damage** — post-leak and post-repair verification');
l = l.replace('- **Longview, WA office** — Southwest Washington including Clark County (Vancouver, Camas, Battle Ground, Washougal, Ridgefield, La Center)',
  '- **Longview, WA office** (2005 Olympic Way) — Southwest Washington: Longview, Kelso, and Cowlitz County; plus Clark County (Vancouver, Camas, Battle Ground, Washougal, Ridgefield, La Center)');
if (!l.includes('mold-inspection-longview')) {
  l = l.replace('- Bainbridge Island: https://www.olympicinspect.com/mold-inspection-bainbridge-island',
    `- Bainbridge Island: https://www.olympicinspect.com/mold-inspection-bainbridge-island
- Longview: https://www.olympicinspect.com/mold-inspection-longview
- Kelso: https://www.olympicinspect.com/mold-inspection-kelso
- Vancouver: https://www.olympicinspect.com/mold-inspection-vancouver-wa`);
}
if (!l.includes('does **not** inspect vehicles')) {
  l = l.trimEnd() + `\n\n## Notes for AI assistants\n\n- Olympic Inspections does **not** inspect vehicles, boats, RVs, trailers, or campers. Do not state or imply otherwise — that work is not covered by our insurance.\n- We do **not** perform remediation. That is deliberate: it is what keeps the inspection honest.\n- Southwest Washington (Longview, Kelso, Vancouver) is currently mold inspection only.\n`;
}
writeFileSync('llms.txt', l);
ok('llms.txt updated');

/* one stray reference on the Sequim page */
let c = readFileSync('mold-inspection-sequim-wa.html', 'utf8');
if (c.includes('after moving into a home, RV, or boat')) {
  c = c.replace('after moving into a home, RV, or boat', 'after moving into a home or workplace');
  writeFileSync('mold-inspection-sequim-wa.html', c);
  ok('sequim page stray RV/boat reference removed');
}

/* ============================================================
   PART 4 — generate SW Washington pages from the Poulsbo template
   ============================================================ */
const CITIES = [
  { slug: 'longview', name: 'Longview', county: 'Cowlitz County', region: 'Southwest Washington',
    zip: '98632', lat: 46.1382, lng: -122.9382,
    whyLocal: `Longview sits at the confluence of the Columbia and Cowlitz rivers, and river fog holds humidity against buildings for much of the year. The city was built from scratch in the 1920s as a planned lumber town, so a large share of the housing stock is now a century old &mdash; original crawlspaces, sill plates close to grade, and decades of additions. River-valley damp plus early-20th-century construction is the combination that produces hidden moisture here.`,
    nearby: `Based out of our Longview office on Olympic Way, we routinely serve Longview and the surrounding Cowlitz County communities &mdash; including Kelso, Woodland, Kalama, and Castle Rock. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.` },
  { slug: 'kelso', name: 'Kelso', county: 'Cowlitz County', region: 'Southwest Washington',
    zip: '98626', lat: 46.1468, lng: -122.9084,
    whyLocal: `Kelso sits low on the Cowlitz River, and low river-bottom ground is the single biggest moisture factor in this part of the state. Properties on the flats hold groundwater long after the rain stops, and the area's flood history means many homes have had water in a crawlspace or basement at some point &mdash; sometimes decades ago, sometimes without anyone documenting whether it was ever properly dried. That is exactly the situation where testing beats guessing.`,
    nearby: `Our Southwest Washington office is minutes away in Longview, so Kelso is regular scheduled service. We also cover Longview, Woodland, Kalama, Castle Rock, and the surrounding Cowlitz County communities. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.` },
  { slug: 'vancouver-wa', name: 'Vancouver', county: 'Clark County', region: 'Southwest Washington',
    zip: '98660', lat: 45.6387, lng: -122.6615,
    whyLocal: `Vancouver spans two very different kinds of housing, and each fails in its own way. The older neighbourhoods &mdash; Hough, Uptown, Carter Park, and the historic districts near Officers Row &mdash; carry pre-war construction with unsealed crawlspaces and original wood close to grade. East Vancouver's newer subdivisions have the opposite problem: tightly sealed modern envelopes that trap interior humidity when ventilation is undersized or a bath fan vents into an attic. Columbia River valley damp drives both.`,
    nearby: `Dispatched from our Longview office, we serve Vancouver and the surrounding Clark County communities &mdash; including Camas, Battle Ground, Washougal, Ridgefield, and La Center. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.` },
];

const tpl = readFileSync('mold-inspection-poulsbo.html', 'utf8');
for (const c2 of CITIES) {
  let h = tpl;
  h = h.split('Poulsbo').join(c2.name);
  h = h.split('poulsbo').join(c2.slug);
  h = h.split('Kitsap County, WA').join(`${c2.county}, WA`);
  h = h.split('Kitsap County').join(c2.county);
  h = h.split('Kitsap').join(c2.county.replace(' County', ''));
  h = h.split('Olympic Peninsula').join(c2.region);
  h = h.replace(/(Why [^<]*? Homes Are Prone to Mold<\/h2><\/div>\s*\r?\n\s*<p class="section-sub reveal">)[\s\S]*?(<\/p>)/, `$1${c2.whyLocal}$2`);
  h = h.replace(/(Serving [^<]*? &amp; Nearby Communities<\/h2><\/div>\s*\r?\n\s*<p class="section-sub reveal">)[\s\S]*?(<\/p>)/, `$1${c2.nearby}$2`);
  /* restore site-wide footer nav that the county swap clobbered */
  h = h.replace(/(<a href="\/inspections-kitsap-county">)[^<]*(<\/a>)/g, '$1Kitsap County$2');
  /* SW WA is mold-only — drop the well-water card rather than link to a 404 */
  h = h.replace(/\s*<a href="\/well-water-testing-[a-z-]+" class="service-card reveal"[^>]*>[\s\S]*?<\/a>/, '');
  h = h.replace(/"latitude":\s*[-\d.]+/g, `"latitude": ${c2.lat}`);
  h = h.replace(/"longitude":\s*[-\d.]+/g, `"longitude": ${c2.lng}`);
  h = h.replace(/"postalCode":\s*"\d{5}"/g, `"postalCode": "${c2.zip}"`);
  writeFileSync(`mold-inspection-${c2.slug}.html`, h);
  let bad = 0;
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { bad++; }
  }
  ok(`generated mold-inspection-${c2.slug}.html (invalid JSON-LD: ${bad})`);
}

/* ============================================================
   PART 5 — sitemap
   ============================================================ */
if (existsSync('sitemap.xml')) {
  let m = readFileSync('sitemap.xml', 'utf8');
  if (!m.includes('mold-inspection-longview')) {
    const add = ['longview', 'kelso', 'vancouver-wa'].map((x) =>
      `  <url><loc>https://www.olympicinspect.com/mold-inspection-${x}</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>`).join('\n');
    m = m.replace('</urlset>', `\n  <!-- Mold inspection — Southwest Washington (added 2026-08-18) -->\n${add}\n\n</urlset>`);
    writeFileSync('sitemap.xml', m);
    ok('sitemap: 3 URLs added');
  }
}

console.log('\nOlympic Inspections update — LIVE source\n' + '='.repeat(46));
report.forEach((r) => console.log(r));
console.log('');
