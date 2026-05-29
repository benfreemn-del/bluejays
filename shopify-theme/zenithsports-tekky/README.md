# Zenith Sports / TEKKY — Shopify theme

Delta files that customize Shopify's free **Dawn** theme into the Zenith
Sports / TEKKY marketing site (replacing the Next.js site we built at
`/clients/zenith-sports`). When this theme is published, `zenithsports.org`
serves it as the storefront homepage + branded site, while Shopify continues
to handle products, cart, and checkout natively underneath.

Reference design + copy: `bluejays/src/app/clients/zenith-sports/` (the
existing Next.js site is the visual + copy spec — port each section over).

## Workflow — upload + preview without breaking the live store

1. **Add Dawn to Paul's Shopify** (free, one click)
   Shopify admin → **Online Store → Themes** → "Add theme" → search "Dawn"
   → Add. Don't publish it yet — it sits in the unpublished theme library.

2. **Duplicate Dawn → rename "Dawn (Zenith customization)"**
   In the unpublished library, click the `…` menu on Dawn → Duplicate.
   Rename the duplicate so we never edit the pristine Dawn (always have a
   clean baseline to compare against).

3. **Drop each file in this directory into the duplicate's matching path**
   Theme admin → click `…` on the duplicate → "Edit code". The left rail
   mirrors this directory's structure (`sections/`, `snippets/`,
   `templates/`, `assets/`). Open or create each matching file and paste
   the contents from here.

   - `sections/hero-zenith.liquid` → create in Sections
   - `sections/founders-zenith.liquid` → create in Sections
   - `sections/footer-zenith.liquid` → create in Sections
   - `snippets/zenith-styles.liquid` → create in Snippets
   - `templates/index.json` → REPLACE the existing one (this is the
     homepage section composition — drops Dawn's default sections and uses
     ours)

4. **Wire the brand styles into the page**
   Open `layout/theme.liquid` in the duplicate (Dawn ships with it) and
   add this line just before `</head>`:
   ```liquid
   {% render 'zenith-styles' %}
   ```
   This injects the TEKKY brand CSS on every page.

5. **Preview the duplicate without touching the live store**
   Back at Online Store → Themes → on the duplicate, click "Preview". You
   get a private Shopify preview URL (`?preview_theme_id=...`) that shows
   the customized theme rendered against the real store data. Paul's live
   theme stays untouched.

6. **Iterate**
   Share the preview URL with me. I add more sections (drill library,
   training-guide page, BYP, Camp Finder, etc.) one delivery at a time.
   Each addition = a new section file you paste in.

7. **Publish when ready** (this is the cutover)
   Online Store → Themes → on the duplicate, click "Publish". The new
   theme becomes the live one at `zenithsports.org`. Done — no DNS flip
   needed (Shopify already owns the domain).

## File layout

```
shopify-theme/zenithsports-tekky/
├── README.md                          ← this file
├── sections/
│   ├── hero-zenith.liquid             ← homepage hero w/ Buy CTA
│   ├── founders-zenith.liquid         ← Philip + Paul cards
│   └── footer-zenith.liquid           ← branded footer + Built by BlueJays
├── snippets/
│   └── zenith-styles.liquid           ← TEKKY brand CSS injected globally
└── templates/
    └── index.json                     ← homepage section composition
```

## Why Dawn (not a custom-from-scratch theme)

- Already has accessible, mobile-tested product / cart / collection /
  checkout templates we'd otherwise have to rebuild.
- Officially supported by Shopify; receives security + i18n updates.
- We only need to override the marketing sections — much smaller scope.

## What's NOT in this delivery (planned for follow-up sessions)

- Drill library section (port from `training-drills.tsx`)
- 10K-hour-rule meter (interactive section — Liquid + vanilla JS)
- Before/after, founder spotlight, shop-product strip
- Training Guide page template (port from `/training-guide/page.tsx`)
- Build Your Player interactive section (multi-step quiz — Shopify section
  with Alpine.js or vanilla JS for state machine)
- Camp Finder waitlist quiz (same rebuild pattern as BYP)
- llms.txt + custom robots.txt (Shopify generates sitemap.xml natively;
  llms.txt needs a Shopify Page or a redirect)
- JSON-LD structured data baked into `theme.liquid`

## Brand reference (single source of truth — match these)

| Token | Hex | Use |
|---|---|---|
| `--zenith-navy` | `#0a1832` | Primary background, headers |
| `--zenith-navy-deep` | `#050d1f` | Page background, footer |
| `--zenith-lime` | `#a3e635` | Accent / CTA / energy pop |
| `--zenith-electric` | `#1d4ed8` | Link / secondary accent |
| `--zenith-amber` | `#f59e0b` | Highlight / discount badge |
| `--zenith-ivory` | `#f5f3ee` | Light section background |
| `--zenith-ink` | `#0f172a` | Dark body text |

Logo: `https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png`

TEKKY ball direct-checkout: `https://zenithsports.org/cart/45347164389551:1`
(single-variant — buy CTAs add this straight to cart)
