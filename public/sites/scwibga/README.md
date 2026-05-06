# SCWIBGA · custom site

Static marketing site for Southern Crescent Women In Business.

**Live URL:** `https://bluejayportfolio.com/sites/scwibga/index.html`

---

## Real photos · already wired

Three real SCWIBGA photos are wired into `assets/images/`:

| File | Section | Source |
|---|---|---|
| `hero.jpg` | Hero (right side card) | Real SCWIBGA event photo · audience under chandeliers |
| `cohort.jpg` | Women's Business Center section | Entrepreneur Cohort graduation photo · 7 women with certs |
| `founder.jpg` | Founder section | Ariel Shaw, MBA professional headshot |

Magazine cover is type-only (no photo) — when a real cover image lands,
add the `cover-photo` class back into `index.html` and drop the file into
`assets/images/magazine.jpg`.

### To swap a photo later

Replace the file in `assets/images/` keeping the same filename.
Vercel redeploys in ~90 seconds. No HTML edit needed.

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
