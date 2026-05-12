# LCAC Image Audit — 2026-05-12

Hard review of every image on the Lewis County Autism Coalition site
(`/sites/lcac/` → bluejayportfolio.com/sites/lcac).

## TL;DR

**The site has no images.** Every one of the 28 `<img>` tags points at
`assets/images/logo.png`, which does not exist. The `assets/` folder
has never been created. Every visitor sees a broken-image icon in the
navbar, footer, hero, and SDCC highlight on every page.

The pages also use a **second image pattern** — gradient background +
big SVG icon — which is intentional and works fine. That part is OK.

This is a blocker for a real launch. Two ways to fix: ship real
photos, or restyle the broken slots so they don't render `<img>`.

## Files audited

8 HTML pages: `index.html`, `pages/services.html`, `pages/smart.html`,
`pages/sdcc.html`, `pages/events.html`, `pages/sponsor.html`,
`pages/volunteer.html`, `pages/contact.html`.

(`pages/admin.html` is internal — skipped.)

## Inventory of broken image references

All resolve to **404 — file missing**.

| Page | Line | Position | Context | What this should be |
|---|---|---|---|---|
| `index.html` | 20 | `<link rel="icon">` | Browser tab favicon | LCAC logo, 32×32 / 64×64 PNG or ICO |
| `index.html` | 50 | navbar | Top-left of every page | LCAC wordmark + symbol, ~120×40 |
| `index.html` | 126 | hero | Big image on right of opening fold | Real photo — kids at the SDCC, or families at an LCAC event |
| `index.html` | 292 | SDCC highlight | "Spectrum & Development Community Center" feature card | Real photo of the Napavine building (exterior or interior) |
| `index.html` | 450 | footer | Bottom of page | Same logo as navbar |
| `pages/contact.html` | 12, 157, 363 | favicon + navbar + footer | Same as above × 3 | Same logo + favicon |
| `pages/events.html` | 12, 217, 324 | favicon + navbar + footer | Same as above × 3 | Same logo + favicon |
| `pages/sdcc.html` | 12, 42, 150, 327 | favicon + navbar + SDCC hero + footer | Hero specifically claims to show SDCC | Real exterior photo of the Napavine center |
| `pages/services.html` | 12, 42, 118, 317 | favicon + navbar + services hero + footer | Hero opens services page | Photo of staff or programs in action |
| `pages/smart.html` | 12, 42, 445 | favicon + navbar + footer | Standard | Logo |
| `pages/sponsor.html` | 12, 192, 419 | favicon + navbar + footer | Standard | Logo |
| `pages/volunteer.html` | 12, 42, 236 | favicon + navbar + footer | Standard | Logo |

**28 total `<img>` tags. 0 real image files.**

## The placeholder design pattern (this part is fine)

Most "feature" blocks use a styled placeholder instead of an `<img>`:

```html
<div class="feature__image">
  <div style="background: linear-gradient(...); aspect-ratio: 4/3; ...">
    <svg width="120" height="120">...</svg>     <!-- big icon -->
  </div>
</div>
```

Used on every service block (services.html), SMART program detail
(smart.html), SDCC features (sdcc.html), and the "What Is Autism?"
section on the homepage (which renders a 🧠 emoji at 6rem on a warm
gradient). These work — they're branded, consistent, and don't break.

**Recommendation: keep these.** They're a credible "we don't have a
photo here yet" treatment that doesn't look broken. Real photos can
replace them later one at a time without touching layout.

The places that DO need real images are the slots that currently use
`<img src="assets/images/logo.png">` — those are rendering broken.

## Priority fix order

### Priority 1: ship the logo file (unblocks 22 of 28 broken refs)

Filenames the HTML expects:
- `public/sites/lcac/assets/images/logo.png` — primary logo (navbar + footer + favicon)

One file lands here and every navbar / footer / favicon across all 8
pages stops being broken instantly. That alone takes the site from
"obviously not launched" to "real."

**Format suggestions:**
- Transparent PNG, 512×512 (scales down cleanly to 32×32 favicon and
  120×40 navbar)
- Either the existing LCAC mark or a simple wordmark — anything
  beats a broken image

### Priority 2: real photos for 3 hero / feature slots

Three places explicitly call for a photo, not a logo:

1. **`index.html` hero image** (line 126) — opens the entire site.
   Best fit: a candid photo from an LCAC event or the SDCC building.
2. **`index.html` SDCC highlight** (line 292) — section claims to
   show the "Spectrum & Development Community Center."
3. **`pages/sdcc.html` hero** (line 150) — main image on the SDCC
   sub-page.

Until real photos arrive, restyle these three slots to use the
gradient-+-icon placeholder treatment (so they stop looking broken
and start looking intentional).

### Priority 3: services-page hero (line 118 in services.html)

Same pattern — `<img src="…logo.png">` where the page expects a hero
photo of staff / programs. Same fix path.

## Recommended next moves

**For Ben (this week):**

1. Ask Michelle for: (a) logo file in PNG, (b) 3-5 photos from any
   recent LCAC event or the SDCC building. Even iPhone photos work
   for a non-profit site — authenticity > polish.
2. Drop the logo at `public/sites/lcac/assets/images/logo.png`. That
   one file fixes 22 of the 28 broken references.

**Want me to ship the placeholder restyle now?** I can edit the four
photo slots (hero + SDCC × 2 + services hero) to use the same
gradient + icon pattern the rest of the site uses, so the site stops
showing broken images today. Real photos can drop in later in five
minutes per slot.

**For LCAC (Michelle):**

Shooting list (iPhone is fine):
- Logo: send a PNG or AI/PDF file
- 1 wide exterior photo of the SDCC building in Napavine
- 1 interior photo of the sensory room or community space
- 2-3 candid photos from an event (faces optional but help)
- 1 photo of staff or the Coalition team (group shot)

Total: ~6 files. That's enough to bring the entire site to
"professional, photographed, real."

## Notes

- **No alt-text issues** — the existing tags all have reasonable alt
  attributes (`"Lewis County Autism Coalition logo"`, `"LCAC Logo"`,
  `"Spectrum & Development Community Center"`). When real images
  land, alts can stay as-is.
- **No size/dimension constraints** in the CSS that would prevent
  arbitrary photos — `feature__image img` uses `aspect-ratio: 4/3`
  and `object-fit: cover`, so any landscape photo works.
- **No CDN dependency** — all images are local file paths. Simpler
  than the OIT / KR-Ranches sites which have proper `assets/images/`
  folders for comparison.
