# Mock Backend Config — Nonprofit / Community Coalition

> **When to use:** Community-serving nonprofit (501c3), neurodiversity advocacy, family support, recovery coalition, disability-services org. ICP unique: "leads" are supporters / volunteers / donors, "deals" are recurring giving + sustained volunteering + community-partner referrals.
>
> **Reference build:** Lewis County Autism Coalition (2026-05-18).
>
> **Critical framing rule:** Nonprofits do NOT have "sales" or "deals." Reframe everywhere:
> - leads → supporters
> - funnel → engagement pipeline (or donor / volunteer journey)
> - close → recurring commitment (monthly giver, sustained volunteer)
> - deal value → annual giving (recurring × 12) or volunteer-hours-equivalent
> - affiliates → community partners
> - customers → recurring donors / sustained volunteers
>
> Demo copy that says "$" should always pair with the impact equivalent: "$50/mo = 2 families served" not "$50/mo = $600 ARR".

## Audience category mix (supporter-to-sustainer pipeline)

| Type | % | Engagement signal | Notes |
|---|---|---|---|
| First-time supporter | 28% | Newsletter signup / event attendance | Acquisition |
| Repeat event attendee | 16% | 2+ events | Conversion window |
| One-time donor | 14% | Single gift, no recurrence | Reactivation target |
| Volunteer (occasional) | 10% | Single shift or seasonal | Pipeline to sustainer |
| Recurring donor | 8% | Monthly auto-give | Highest financial LTV |
| Sustained volunteer | 8% | Multi-month, multi-program | Highest mission LTV |
| Caregiver / family receiving services | 8% | Active program participant | Lived-experience cohort |
| Community partner referrer | 4% | Multi-referral relationship | Internal multiplier |
| Major gift / grant prospect | 2% | $1K+ history or LOI | Hand-managed by ED |
| Lapsed donor (year+ gap) | 2% | No activity 12mo | Reactivation cohort |

## Lead-quality signals (supporter scoring)

- **`event_attendance_count`** = 1 / 2-3 / 4+ (4+ = ready for monthly giving ask)
- **`life_event`** = recent diagnosis in family / aging-out of pediatric services / family member in crisis = HIGH receptivity to community support
- **`affiliate_source`** = existing supporter referral / school partnership / healthcare provider / community partner
- **`giving_history`** = one-time / annual / monthly recurring
- **`volunteer_hours_ytd`** = engagement intensity, sustained-volunteer indicator
- **`is_caregiver`** = lived-experience cohort, strongest long-term advocates
- **`grant_window_open`** = active LOI / RFP cycle for major-gift prospects
- **`service_recipient_alum`** = received LCAC services in past, prime sustainer
- **`local_zip_match`** = lives in core service area (Lewis County + adjacent)

### Supporter score formula

```
score = 30 + 22 if event_attendance_count >= 4 + 20 if monthly_donor
  + 18 if affiliate_source='existing supporter' + 16 if volunteer_hours_ytd >= 20
  + 14 if is_caregiver + 12 if service_recipient_alum + 10 if local_zip_match
  + 8 if life_event_in_last_90d
clamp 0-100
```

## Community-partner categories (8 types — "affiliates" reframed)

| Category | Why they refer | Example local-WA partner |
|---|---|---|
| Existing supporter (friend referral) | Highest-trust referral source | Word-of-mouth in coalition |
| School district / special education | Family-pipeline + service coordination | Centralia SD, Toledo SD, Chehalis SD |
| Healthcare providers (pediatric, family practice) | Diagnosis → service-referral pipeline | Providence, Valley View Health |
| County / state agencies | DDA / DDCS referrals | WA DSHS, Lewis County Public Health |
| Therapy clinics (ABA, OT, ST, PT) | Wraparound-services partners | Local ABA providers |
| Faith communities | Community-trust amplifier | Local churches, community-of-Christ orgs |
| Other family-serving nonprofits | Cross-mission referral | Big Brothers Big Sisters, food banks |
| Law-enforcement / first responders | Court / crisis referrals | Lewis County Sheriff, courts |

## 4 standard pipelines (funnels reframed)

1. **New supporter onboarding** — "welcome to the community" 14-day nurture: thank-you, story share, event invite, monthly-giving ask
2. **One-time donor → recurring** — 60-day cadence reframing the single gift as the start of a sustained commitment ("you've already given once — what if it became monthly?")
3. **Volunteer pipeline** — interest form → orientation → first shift → buddy match → sustained-volunteer (4+ shifts)
4. **Community-partner referral** — partner-org outreach → MOU / handshake agreement → first referral → repeat referrals → cross-event collaboration

## Industry calculator spec

**Donation Impact Calculator** — slider for monthly amount ($10 / $25 / $50 / $100 / custom). Returns concrete impact:
- $25/mo = 1 family receives a year of resource navigation
- $50/mo = 1 caregiver attends quarterly support group + materials
- $100/mo = 2 kids attend a week of summer sensory camp
- $250/mo = 1 court-support advocate retainer (sustains one family through 6-month case)

The translation table is bespoke per-nonprofit — LCAC's impact economics differ from a food bank's.

## Sizing/recommendation tool spec

**Ways to Get Involved** — visitor answers 4 questions about life stage + capacity (time vs money vs voice). Returns top 3 ways to plug in:
- Time-rich, money-light → Volunteer (with matched program)
- Money-rich, time-light → Recurring monthly giver (with impact tier)
- Voice-rich (lived experience) → Leadership / advocacy / board interest
- Connection-rich (community network) → Community partner referrer

## Service-area heatmap spec

Overlay: families served (zip-level density) + service-recipient locations + volunteer locations + community-partner locations. Visual answer to "where is our reach concentrated and where are we missing families." For LCAC specifically: Lewis + Thurston + Pierce + Cowlitz counties as the core, with WA-state outline for Vision-2030 statewide reach.

## Real-world data anchors

- **Audience mix**: first-time 28% / repeat-event 16% / one-time-donor 14% / volunteer 10% / recurring-donor 8% / sustained-volunteer 8% / caregiver 8% / partner-referrer 4% / major-gift 2% / lapsed 2%
- **Sample community partners (LCAC-flavor)**: Lewis County Sheriff, Centralia School District, Providence Health, WA DSHS DDA, Big Brothers Big Sisters, Toledo SD, Salvation Army, food banks
- **Avg LTV (per supporter)**: $360/yr (one-time donor avg), $720/yr (recurring monthly avg), $4K-12K (sustained donor 5yr), $48K-180K (major gift relationship 10yr), volunteer hours uncountable
- **NOTE on the AI System for a nonprofit:** reframes everything. The "ad library" → "supporter outreach library." "Hyperloop" → "donor-journey optimizer." "Affiliate pipeline" → "community-partner stewardship." The MOCK BACKEND demo for nonprofit prospects MUST avoid commercial language — talk about reach, impact, families served, sustained relationships. Never "leads" or "deals" in copy facing the ED.

## Productization note

The nonprofit mock-backend pattern is the foundation for a future "BlueJays Nonprofit Tier" — middle ground between $997 static site and $10k AI System. ~$2,500-$5,000 setup + $250-500/mo for managed donor-journey + community-partner stewardship. Captured separately in `aios/PRO_SYNTHESIS.md`.
