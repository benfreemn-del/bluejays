# Zenith Sports / TEKKY — Shopify theme

Delta files that customize Shopify's free **Dawn** theme into the Zenith
Sports / TEKKY marketing site (replacing the Next.js site we built at
`/clients/zenith-sports`). When this theme is published, `zenithsports.org`
serves it as the storefront homepage + branded site, while Shopify continues
to handle products, cart, and checkout natively underneath.

Reference design + copy: `bluejays/src/app/clients/zenith-sports/` (the
Next.js site is the visual + copy spec — each section here ports a
section of that codebase).

## Workflow — upload + preview without breaking the live store

1. **Add Dawn to Paul's Shopify** (free, one click)
   Admin → **Online Store → Themes** → "Add theme" → search "Dawn" → Add.
   Don't publish it yet — it sits in the unpublished library.

2. **Duplicate Dawn → rename "Dawn — Zenith customization"**
   In the library, click `…` on Dawn → Duplicate. Rename so we never edit
   the pristine Dawn (clean baseline to compare against).

3. **Drop each file in this directory into the duplicate's matching path**
   On the duplicate, click `…` → **Edit code**. The left rail mirrors this
   directory. Create or replace each file by pasting the contents.

   ```
   sections/
     marquee-zenith.liquid              ← CREATE (top promo bar)
     header-zenith.liquid               ← CREATE (sticky nav)
     hero-zenith.liquid                 ← CREATE (Buy the TEKKY hero)
     stats-zenith.liquid                ← CREATE (3 outcome cards)
     ball-spotlight-zenith.liquid       ← CREATE (Meet the TEKKY)
     before-after-zenith.liquid         ← CREATE (BAE 4-step routine)
     drill-library-zenith.liquid        ← CREATE (26 drills, YouTube)
     shop-strip-zenith.liquid           ← CREATE (3-product strip)
     training-guide-cta-zenith.liquid   ← CREATE (email capture)
     build-your-player-cta-zenith.liquid← CREATE (BYP promo card)
     founders-zenith.liquid             ← CREATE (Philip + Paul)
     inquiry-form-zenith.liquid         ← CREATE (contact form)
     footer-zenith.liquid               ← CREATE (Zenith-branded footer)
   snippets/
     zenith-styles.liquid               ← CREATE (TEKKY brand CSS)
   templates/
     index.json                         ← REPLACE Dawn's default (homepage composition)
   ```

4. **Wire the brand styles into every page**
   Open `layout/theme.liquid` (Dawn ships with it) and add this line
   just before `</head>`:
   ```liquid
   {% render 'zenith-styles' %}
   ```

5. **Swap Dawn's header + footer for Zenith's**
   Still in `layout/theme.liquid` — find Dawn's header and footer lines
   (either `{% section 'header' %}` / `{% section 'footer' %}` in older
   Dawn, or `{% sections 'header-group' %}` / `{% sections 'footer-group' %}`
   in newer versions). Replace with:
   ```liquid
   {% section 'header-zenith' %}

   {{ content_for_layout }}

   {% section 'footer-zenith' %}
   ```
   This makes our header + footer apply to EVERY page (homepage, products,
   collections, cart, account) — consistent branding throughout.

6. **Preview the duplicate without touching the live store**
   Online Store → Themes → on the duplicate, click "Preview". You get a
   private preview URL (`?preview_theme_id=...`) that shows the customized
   theme rendered against the real store data. Paul's live theme stays
   untouched.

7. **Iterate**
   Share the preview URL with me. I add more sections (Build Your Player
   interactive, Camp Finder waitlist, 10K-hour meter, Training Guide page
   content, product page customization) one delivery at a time.

8. **Publish when ready** (this is the cutover)
   Themes → on the duplicate, click "Publish". The new theme becomes the
   live one at `zenithsports.org`. No DNS flip needed — Shopify already
   owns the domain.

## File layout (current)

```
shopify-theme/zenithsports-tekky/
├── README.md                                       ← this file
├── sections/
│   ├── marquee-zenith.liquid                       ✓ Top promo bar
│   ├── header-zenith.liquid                        ✓ Sticky nav + Buy CTA
│   ├── hero-zenith.liquid                          ✓ Main hero
│   ├── stats-zenith.liquid                         ✓ 3 outcome cards
│   ├── ball-spotlight-zenith.liquid                ✓ Meet the TEKKY
│   ├── before-after-zenith.liquid                  ✓ BAE 4-step routine
│   ├── drill-library-zenith.liquid                 ✓ 26 YouTube drills
│   ├── shop-strip-zenith.liquid                    ✓ 3-product strip
│   ├── training-guide-cta-zenith.liquid            ✓ Free-plan email capture
│   ├── build-your-player-cta-zenith.liquid         ✓ BYP promo card
│   ├── founders-zenith.liquid                      ✓ Philip + Paul
│   ├── inquiry-form-zenith.liquid                  ✓ Contact form (Shopify native)
│   └── footer-zenith.liquid                        ✓ Zenith footer + BlueJays credit
├── snippets/
│   └── zenith-styles.liquid                        ✓ Brand CSS (inject in theme.liquid)
└── templates/
    └── index.json                                  ✓ Homepage section composition
```

## Coming in follow-up sessions

- **Build Your Player interactive quiz** — rebuild the React state machine
  as a vanilla-JS Shopify section. Page template at `/pages/build-your-player`.
- **Camp Finder waitlist quiz** — same pattern; page template at
  `/pages/camps`.
- **10K-hour-rule meter** — animated bars responding to weekly-hours slider.
- **Training Guide page** — `/pages/training-guide` with the full
  curriculum content (intro + 4-week plan structure + drill methodology).
- **Product page customization** — Zenith-styled `templates/product.json` +
  `sections/main-product.liquid` override (vs Dawn's defaults).
- **JSON-LD structured data** — baked into `layout/theme.liquid` head.
- **llms.txt** — Shopify Page or app proxy (Shopify auto-generates
  sitemap.xml and robots.txt, but llms.txt needs a manual touch).

## Forms — where leads go

- **Training-guide CTA** (`training-guide-cta-zenith.liquid`) — uses Shopify's
  native `{% form 'customer' %}` action. Submissions land in Shopify Admin →
  Customers (tagged `training-guide-lead`) with `accepts_marketing` checked,
  so Paul can email them via Shopify Email / Klaviyo.
- **Inquiry form** (`inquiry-form-zenith.liquid`) — uses Shopify's native
  `{% form 'contact' %}`. Submissions email the store's "Sender email"
  (Admin → Settings → Notifications → Sender email, defaults to the store
  owner / info@zenithsports.org).

If you ever want leads to flow into the BlueJays `client_leads` table +
owner portal instead, replace the form `action` with a fetch to
`https://bluejayportfolio.com/api/clients/inquire` (requires CORS
allow-listing zenithsports.org on the inquire route).

## Brand reference (single source of truth)

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
