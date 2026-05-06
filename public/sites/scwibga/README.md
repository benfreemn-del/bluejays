# SCWIBGA · custom site

Static marketing site for Southern Crescent Women In Business.

**Live URL:** `https://bluejayportfolio.com/sites/scwibga/index.html`

---

## When Ariel sends real photos · 4 swap points

All 4 placeholder images use Unsplash CDN URLs. To swap, find each
`SWAP-ME-LATER` HTML comment in `index.html` and replace the `src=` URL
with the real photo. Aspect ratios are baked in — match them to avoid
layout shifts.

| # | Section | Aspect ratio | What it should be |
|---|---|---|---|
| 1 | Hero (right side, vertical card) | **4:5** portrait · 900×1125 | Photo of an SCWIBGA event with members visible. Real candid > posed. |
| 2 | Women's Business Center (interior shot) | **5:4** landscape · 900×720 | Photo of the actual WBC space — workshop in session, co-working area, signage. |
| 3 | Founder (vertical portrait) | **4:5** portrait · 900×1125 | Real Ariel Shaw headshot · pull from LinkedIn or press kit. **Highest-impact swap.** |
| 4 | Magazine cover (vertical) | **3:4** portrait · 600×800 | Real recent magazine cover photo or member-feature portrait. |

### Quick swap workflow

1. Drop new photos into `public/sites/scwibga/assets/images/` — name them `hero.jpg`, `wbc.jpg`, `founder.jpg`, `magazine.jpg`
2. In `index.html`, replace each Unsplash URL with the local path:
   ```html
   src="/sites/scwibga/assets/images/hero.jpg"
   ```
3. Match the `width=` / `height=` attributes to your photo's actual dimensions
4. Commit + push — Vercel rebuilds in 90 seconds

---

## Sections + content edit points

| Section | Where it lives in `index.html` | Edit when |
|---|---|---|
| Announcement bar | top of `<body>` | Quarterly enrollment opens/closes |
| Hero headline | `.hero-content h1` | Annual brand-line refresh |
| Mission copy | `.mission-body` | Major mission update |
| Stats band | `.stats-grid` | Quarterly when chapter counts shift |
| 4 programs | `.programs-grid` | When new program launches |
| WBC bullet list | `.wbc-list` | When WBC adds/removes services |
| Chapter cards | `.chapters-grid` | New chapter launch |
| Founder block | `.founder-content` | Updates to Ariel's bio |
| Testimonials | `.testimonials-grid` | Each new feature-quality testimonial |
| Magazine cover details | `.magazine-cover` text | Each new issue |
| Events list | `.events-grid` | Monthly · 3 upcoming visible |
| Membership tiers/prices | `.tier-card` | When pricing changes |

---

## Contact form behavior (current = mailto)

The "Get the digest" footer form and all "Apply" tier buttons currently
use `mailto:` actions pointing at `hello@scwibga.org` and tier-specific
subjects. To wire up real form handling later, replace the `<form>`
action with a POST endpoint and add a small JS handler.

---

## Design tokens

Colors live in `css/styles.css` `:root` — change once, propagates everywhere:

```
--navy: #0e1729;
--navy-deep: #060c19;
--gold: #d4a559;
--gold-deep: #a37e2c;
--plum: #5b1d54;
--cream: #f5efe5;
```

Typography:
- Headlines: **Playfair Display** (serif)
- Body: **Inter** (sans)

Both loaded from Google Fonts; no local files.

---

## Future enhancements (queued, not built)

- [ ] Real magazine archive page with PDF downloads
- [ ] Individual chapter pages with leader bios + meeting RSVPs
- [ ] Member directory (login-gated)
- [ ] Blog / news section pulling from RSS or markdown
- [ ] Donation flow (Stripe → 501c3 receipt)
- [ ] Real backend for "Get the digest" form (currently mailto)
