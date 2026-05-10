# Mock Backend Config — Specialty Sports Equipment

> **Reference build:** Zenith Sports / TEKKY (training-ball maker, MLS
> markets). Showcase live at `/clients/zenith-sports`.
>
> **When to use:** any niche-product manufacturer making sport-specific
> training gear, performance equipment, or competition-grade product
> for a focused athletic audience. Owner-coach typical, sells via
> coaches + clubs + parent word-of-mouth.

---

## Customer category mix (lead generation distribution)

| Type | % of leads | Avg deal value | Notes |
|---|---|---|---|
| Family / parent (DTC) | 42% | $35-$280 | Single-product orders for their kid |
| Coach / pro trainer | 22% | $200-$2,400 | Buys for multiple athletes; repeat-purchaser |
| Competitive club / academy | 14% | $1,200-$8,500 | Bulk team orders, recurring season-cycle |
| Elite player / academy parent | 12% | $80-$650 | High-LTV individual; brand evangelist |
| Rec league organizer | 6% | $400-$3,200 | Bulk league orders, less frequent |
| Affiliate / influencer (creator) | 4% | varies | Promotes for revenue share |

---

## Lead-quality signals (what makes a hot sports-equipment lead)

### Consumer (parent / player) signals
- **`age_band`** = U8 / U10 / U12 / U14 / HS / college / adult-rec
- **`competition_tier`** = rec / select / ECNL / DA / college-bound / pro-track
- **`primary_sport`** = soccer / lacrosse / pickleball / baseball / etc. (drives relevant funnel)
- **`years_playing`** = 0-2 / 3-5 / 6+. Longer = higher willingness-to-pay.

### Coach / club signals
- **`team_count`** = how many teams the coach/club runs
- **`athletes_per_team`** = avg roster size
- **`certification_tier`** = certified pro / volunteer / parent-coach
- **`bulk_history`** = # past orders × avg ticket

### Cross-cutting signals
- **`affiliate_source`** = club coach / influencer / club partnership / TopSoccer chapter / direct
- **`urgency`** = `high` if pre-season window (4-week run-up) or post-tournament cycle
- **`seasonal_peak`** = late summer (fall season prep), late winter (spring prep)

### Lead score formula (0-100)
```
score = 30 (base)
  + 18 if competition_tier in ['ECNL','DA','college-bound','pro-track']
  + 16 if team_count >= 3 (club scale)
  + 14 if certification_tier='certified pro'
  + 12 if affiliate_source != null
  + 18 if urgency=high
  + 8  if seasonal_peak
  + 8  if years_playing >= 6
  + 10 if bulk_history >= 2
clamp 0-100
```

---

## Affiliate categories (8 types)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Club coach (paid commission)** | Trusted gatekeeper — parents buy what coach picks | Team gear orders |
| **Club academy / DOC** | Director-of-coaching mandates equipment standards | Bulk season orders |
| **TopSoccer / inclusive-sport chapter** | Niche-audience advocate | Specialty-needs gear |
| **Coaching certification org** | Endorsement during certification courses | Pro-coach personal kit |
| **Parents-group leader (HOA / school)** | Word-of-mouth multiplier | DTC family orders |
| **Sports content creator (YT / IG / TikTok)** | Audience-trust influencer model | Cross-promo + revenue share |
| **Rec league organizer** | Bulk orders for league participants | Mass orders + sponsorship |
| **College / academy program** | Pipeline-development evangelism | Top-tier player gear |

---

## Funnel taxonomy (4 standard funnels)

1. **Family rec** — parent of new player, low-info shopper.
   - Lead magnet: "Beginner Player Gear Checklist (by age)"
   - 5-step cadence: welcome → "what to look for" → social proof → bundle offer → reactivation
2. **Coach / pro** — buying for multiple athletes.
   - Lead magnet: "Training Drill Library (paired w/ gear)"
   - 6-step cadence: welcome → drill 1 → drill 2 → testimonial from peer coach → bulk-order CTA → consult call
3. **Elite / academy** — pro-track player, high WTP.
   - Lead magnet: "Pro-Level Training Spec Sheet"
   - 4-step cadence: pro endorsement → spec deep-dive → academy testimonial → academy bundle CTA
4. **Competitive club** — DOC / club director, B2B order.
   - Lead magnet: "Club Equipment Standards Pack"
   - 4-step cadence: standards doc → MAP pricing tier → DOC testimonial → first-order incentive

---

## Industry calculator spec (interactive feature 1)

**Build Your Player** — parent picks age + sport + competition tier. Calculator returns:
- Top 3 recommended products for this profile
- Bundle savings if all 3 picked
- "Why this fits" 1-liner per pick
- Pre-segmented funnel auto-tag

Drives parent-funnel conversion + reduces decision fatigue.

---

## Sizing/recommendation tool spec (interactive feature 2)

**Coach's Drill-to-Gear Mapper** — coach picks the drill they're running this week (from a 12-drill library). Tool returns:
- Required gear list with exact quantities for their team size
- Add-to-cart bundle button
- "How to run this drill" video link

Drives coach-funnel conversions + builds the drill library as content moat.

---

## Service-area heatmap spec (interactive feature 3)

**Geographic club-density map** — overlay shows:
- US Soccer Federation member-club concentrations
- ECNL / DA league hosting cities
- TopSoccer chapter density
- Recent club-purchase clusters (sales heatmap)

Drives "where to recruit a coach-affiliate next" recommendations.

---

## Narrative simulator script (interactive feature 4)

**"A coach refers, a family buys"** 60-second timeline:
1. **0:00** — Coach in Cleveland clicks affiliate link in his post-practice email to parents.
2. **0:08** — Parent lands on Build-Your-Player page tagged `coach-referral`.
3. **0:20** — Calculator runs: U10 select-tier player → 3-product bundle ($165, save $20).
4. **0:35** — Welcome email fires + auto-segments to Family-Rec funnel.
5. **0:50** — Order placed via bundle CTA. Coach commission auto-tracks.
6. **0:60** — Affiliate dashboard shows the coach: "+1 sale, $33 commission this week."

Demonstrates the entire 2-sided value loop in one minute.

---

## Real-world data anchors

- **Cities for mock leads:** Charlotte / Chicago / Dallas / Atlanta / Seattle / Portland / Phoenix / Tampa / Cincinnati / Boston (MLS markets + soccer-strong metros).
- **Sport mix in mock pool:** soccer 60% / lacrosse 12% / pickleball 10% / baseball 8% / other 10%.
- **Real club / federation names:** US Club Soccer, ECNL, DA, USYS, AYSO, TopSoccer.
- **Real product types to seed:** TEKKY ball (size 3/4/5), agility ladder, plyo box, training cones, recovery foam roller.
- **Sample affiliate names:** Coach Erik (YouTube) · TheCoachingFamily (IG) · YouthSoccerNation (blog) · USYS regional rep.
- **Avg deal size for ROI calc:** $112 (DTC family), $640 (coach individual), $4,200 (club bulk).
