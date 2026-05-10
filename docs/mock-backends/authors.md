# Mock Backend Config — Indie Authors

> **Reference build:** Bloodlines / Preston Hunsaker (indie fantasy
> series, custom-tier showcase). Live at `/clients/bloodlines`.
>
> **When to use:** any indie author with a multi-book series, owner-
> operator (writer + seller), weak / nonexistent DTC funnel — selling
> primarily on Amazon KDP / IngramSpark / trad-pub backlist with no
> reader list, no series-fan pipeline, no patron tier.
>
> **Why this fits the manufacturer ICP:** "book series" = "hero product
> line." The author is owner-operator. Their distributor (Amazon) is
> the niche-product manufacturer's wholesale chain. Same anti-pattern,
> same sales motion. Funnel mechanics + audience taxonomy translate
> directly — only the surface vocabulary changes (readers, not
> customers; series, not product line; new release, not seasonal drop).

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Series fan (returning reader) | 38% | $5-$32 | Buys every release; LTV is what matters |
| First-time reader (discovery) | 22% | $5-$15 | Sample-chapter conversion → series fan in 60d |
| Patron / superfan (Patreon-tier) | 12% | $5-$15/mo | Highest LTV; drives word-of-mouth |
| Bookclub / library buyer | 10% | $40-$280 | Bulk + recurring institutional |
| Audiobook / format-switcher | 8% | $10-$45 | Cross-format upgrade (e.g. ebook → audio) |
| Box / subscription buyer (e.g. genre subscription box) | 5% | $30-$180 | Curator-driven discovery |
| Author-friend / podcast guest list | 3% | $5-$25 | Cross-promo network buyers |
| Trad-pub backlist activator | 2% | $5-$25 | Author owns rights, reactivating pre-indie titles |

---

## Lead-quality signals

### Reader signals
- **`series_progress`** = book 1 / 1-2 / 1-3 / completed-series. Further along = higher next-buy WTP.
- **`format_pref`** = ebook / paperback / audiobook / hardcover (drives format-fit upsell)
- **`subgenre`** = epic-fantasy / progression / LitRPG / cozy-mystery / paranormal / etc.
- **`reading_velocity`** = books/year (proxy for newsletter retention)
- **`platform_origin`** = Amazon / Goodreads / KU / Audible / direct-DTC / referral

### Patron / superfan signals
- **`engagement_score`** = newsletter open rate × review-leaving rate × ARC participation
- **`tenure_months`** = how long they've been on the list
- **`patreon_tier`** = if subscribed: tier level

### Cross-cutting signals
- **`affiliate_source`** = bookstagram / booktok / podcast / author-friend / direct
- **`urgency`** = `high` if pre-order window open OR launch-week special
- **`seasonal_peak`** = book launch (whenever) + holiday gifting (Nov-Dec) + summer reading (Jun-Aug)

### Lead score formula (0-100)
```
score = 30 (base)
  + 18 if series_progress in ['1-3','completed-series']
  + 16 if patreon_tier != null
  + 14 if engagement_score >= 70
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 10 if seasonal_peak
  + 12 if reading_velocity >= 25
  + 8  if format_pref='audiobook' (highest revenue/unit)
clamp 0-100
```

---

## Affiliate categories (8 types — what audiences indie authors recruit)

| Category | Why they refer | Typical sales |
|---|---|---|
| **Bookstagram / BookTok creator** | Aesthetic-first audience trusts visual reviewers | Series launches, ARC drops |
| **Podcast (book / genre-specific)** | Discoverability for new readers | Mid-list reactivation, audiobook |
| **Author-friend (peer)** | Cross-list newsletter swap | New release announcements |
| **Newsletter-list curator (e.g. BookBub-adjacent)** | Discovery list with their endorsement | Promo-week sales |
| **Genre subscription box** | Curator includes the book in monthly box | Bulk box-fee + reader discovery |
| **Bookstore / library buyer** | Institutional purchase + display | Bulk orders + reader exposure |
| **Goodreads librarian / mod** | Niche-genre advocate | Series page maintenance + recommendations |
| **Reader-group admin (FB / Discord)** | Trusted moderator vouch | Direct-to-fan launches |

---

## Funnel taxonomy (4 standard funnels)

1. **First-chapter discovery** — new reader, low-info, browsing.
   - Lead magnet: "Free Chapters 1-3 of [Book 1]" (read in browser or send to Kindle)
   - 5-step cadence: welcome → chapter-1 send → world-building deep-dive → social-proof testimonials → "if you liked it, here's where to buy" CTA
2. **Series fan (returning reader)** — already loyal, primed for next.
   - Lead magnet: "Pre-order [Next Book] + bonus epilogue PDF"
   - 4-step cadence: pre-order CTA → lore-bonus PDF → release-day bump → review-ask
3. **Patron / superfan (Patreon-tier)** — highest LTV.
   - Lead magnet: "Behind-the-Scenes + Patron-Only Story"
   - 4-step cadence: tier explanation → patron exclusive content → live-Q&A invite → tier-upgrade CTA
4. **Audiobook / format-switcher** — converting ebook readers to audio.
   - Lead magnet: "Free Audio Sample (Audible / direct download)"
   - 4-step cadence: audio sample → narrator interview → format-bundle deal → cross-format-upsell
5. **(Optional) Bookclub / library wholesale** — institutional buyers.
   - Lead magnet: "Bookclub Discussion Guide PDF"
   - 4-step cadence: discussion guide → author-Zoom-with-bookclub offer → bulk-discount tier → ongoing booklist add

---

## Industry calculator spec (interactive feature 1)

**Reading-Order Builder** — reader picks "I've read X / I want to know what's next." Calculator returns:
- The exact next-book recommendation
- Why this order (1-line on continuity)
- Bundle savings if buying 3+ ahead
- Pre-segmented funnel auto-tag

Replaces the typical author-site's confusing "what should I read" page.

---

## Sizing/recommendation tool spec (interactive feature 2)

**"What to Read Next" by mood/sub-genre matcher** — reader picks: pacing (slow-burn / page-turner) + tone (dark / hopeful) + length-pref (novella / standard / doorstop) + similar-author. Tool returns:
- Top 3 of THIS author's books that match
- Why each one
- Reader-testimonial pairing per pick
- Pre-filled "Start with this one" CTA

Drives discovery for first-time readers AND reactivation for lapsed series fans.

---

## Service-area heatmap spec (interactive feature 3)

**Reader-cluster + bookclub density map** — overlay shows:
- Newsletter-subscriber concentrations by region
- Active bookclub partnerships
- Bookstore relationships (where indie stores stock the books)
- Audiobook listener clusters (Audible / Libro.fm regions)

For an author this is more "where to schedule a virtual bookclub Q&A" than service-area, but same UI pattern.

---

## Narrative simulator script (interactive feature 4)

**"Bookstagram post → series fan → patron"** 60-second timeline:
1. **0:00** — Bookstagram creator posts an aesthetic shot with affiliate link.
2. **0:08** — Lead lands tagged `bookstagram-affiliate`, `epic-fantasy`.
3. **0:20** — "What to Read Next" matcher runs → recommends Book 1.
4. **0:35** — Free-chapters magnet delivered. Reader finishes chapter 3, hooked.
5. **0:50** — Buys Book 1, joins series-fan funnel. Pre-orders Book 2.
6. **0:60** — 60 days later: signs up for Patreon. LTV = $14/mo × 18 months avg.

Demonstrates the entire reader-to-patron journey + measurable affiliate ROI.

---

## Real-world data anchors

- **Subgenre mix in mock pool:** epic-fantasy 24% / progression-fantasy 14% / LitRPG 12% / cozy-mystery 14% / paranormal-romance 12% / sci-fi 10% / thriller 8% / niche (memoir/non-fic) 6%.
- **Real platform names to seed:** Amazon KDP · Audible · Kobo · Apple Books · Goodreads · BookBub · Bookfunnel · StoryOrigin · Patreon.
- **Real reader-platforms:** Bookstagram (IG) · BookTok (TikTok) · Goodreads groups · Reddit /r/Fantasy · Reddit /r/ProgressionFantasy.
- **Real podcast / curator names:** WHB Sword & Laser · Plot Trysts · Booked Solid · Currently Reading · genre-specific podcasts.
- **Sample affiliate names:** @bookishfeyre · @paigesofglass · @bookbub-curator · ProgressionFantasyPodcast · Goodreads-fantasy-mod.
- **Avg LTV anchors for ROI calc:** $48 (avg series-fan total spend over series) · $168 (avg patron LTV @ $14×12) · $720 (avg author-friend cross-promo lift).
- **Critical metric NOT in manufacturer configs:** **Newsletter open rate** — for an indie author, this is the LEADING indicator. <30% = list dying, 50%+ = healthy. Show on Overview tab as a primary stat.
