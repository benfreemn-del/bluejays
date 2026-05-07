# Mock Backend Config — Electrician

> **Reference build:** Meyer Electric (Sequim WA · Tesla Powerwall +
> Generac · Olympic Peninsula service area). Live at
> `/clients/meyer-electric/portal-demo` (password 1212).
>
> **When to use:** any electrician prospect — residential service,
> commercial, Powerwall installer, generator dealer, panel-upgrade
> specialist. Adjust per the prospect's specific service mix.

---

## Customer category mix (lead generation distribution)

Industry-research-backed split — what an electrician's actual lead
intake looks like:

| Type | % of leads | Avg job value | Notes |
|---|---|---|---|
| Residential | 55% | $800-$20,000 | Includes Powerwall ($11.5K-$20K), generators ($5.5K-$13K), service work |
| Commercial | 23% | $4K-$22K | Office/restaurant/retail repeat-revenue base |
| Property mgmt | 10% | $4K-$22K | Multi-property recurring — highest LTV per contact |
| General contractor | 8% | $4K-$22K | Subcontracting partner — referral pipeline |
| Industrial | 4% | $25K-$100K | Lowest volume, highest single-job value |

---

## Lead-quality signals (what makes a hot electrician lead)

### Residential signals (encoded in `signals.*`)
- **`powerwall_eligible`** = property value > $600K AND monthly bill > $250
- **`generator_eligible`** = rural county OR (any property × 30% probability)
- **`has_solar`** = ~18% of residential (Powerwall pairing candidate)
- **`property_value`** = $350K-$2.2M range (Pacific Northwest typical)
- **`home_age_yrs`** = 5-70 yrs (older = panel upgrade due)
- **`monthly_electric_bill`** = $120-$600 (high bill = Powerwall ROI candidate)

### Commercial signals
- **`sq_ft`** = 1500-30000 (bigger = bigger jobs)
- **`multi_property`** = ~32% of commercial (recurring contract candidate)
- **Industry mix** = medical / hospitality / restaurant / retail / industrial / municipal / casino / winery

### Cross-cutting signals (any lead type)
- **`repeat_customer`** = ~18% of commercial leads (already in book of business)
- **`affiliate_source`** = ~32% of leads (referred by partner — boosts score)
- **`urgency`** = `high` if county had storms in last 30 days, else medium/low/null
- **`seasonal_peak`** = November-February (PNW storm season)

### Lead score formula (0-100)
```
score = 30 (base)
  + 15 if powerwall_eligible
  + 12 if generator_eligible
  + 18 if repeat_customer
  + 12 if affiliate_source
  + 18 if urgency=high (or +8 if medium)
  + 6  if seasonal_peak
  + 10 if multi_property
  + 8  if residential AND property_value > $1.2M
  + 10 if has_solar
  + 7  if commercial AND sq_ft > 10,000
clamp 0-100
```

Color coding:
- Score ≥ 80 = emerald (hot)
- 60-79 = yellow (warm)
- 40-59 = orange (tepid)
- < 40 = slate (cold)

---

## Affiliate categories (8 types — what partners refer to electricians)

| Category | Why they refer | Typical jobs |
|---|---|---|
| **Solar installer** | Powerwall pairs with their installs | Powerwall, panel upgrades, EV chargers |
| **Tesla dealer / showroom** | Powerwall is their product | Powerwall installs |
| **HVAC contractor** | Mutual referrals — they install AC, you wire it | Service upgrades, panel work |
| **General contractor** | Need an electrician for every build | New construction, full rewires |
| **Real estate agent** | Pre-sale inspections + post-sale upgrades | Service upgrades, code-compliance |
| **Insurance adjuster** | Storm claim work | Emergency repairs, panel replacement |
| **Property manager** | Multi-property book of business | Maintenance contracts, emergency repairs |
| **Home inspector** | Pre-sale upgrade recommendations | Service work, panel upgrades |

Mock dataset: 30 affiliates, weighted toward Solar / GC / HVAC / Real
Estate (the highest-volume categories).

---

## Repeat customer types (15 commercial accounts)

Pacific-Northwest-flavored commercial customer mix:
- **Medical** (Olympic Medical Center) — critical-circuit + UPS work
- **Casino** (7 Cedars Casino) — quarterly maintenance + generator load tests
- **Hospitality** (Olympic Lodge, Sequim Bay Resort) — annual contracts
- **Restaurant** (Alder Wood Bistro, Dockside Grill, Three Crabs) — kitchen circuit + sign work
- **Winery** (Olympic Cellars, Wind Rose Cellars) — production + tasting room
- **Property mgmt** (Wave Property Mgmt) — multi-site contracts
- **Municipal** (City of Sequim, Clallam County) — government work
- **Retail** (Olympic Outfitters) — storefront work
- **Industrial** (Discovery Bay Marina, Olympic Foods Distributing) — heavy-equipment circuits

Adjust the seed list for each prospect's actual local market —
substitute their region's real businesses.

---

## 4 funnel examples (the standard electrician funnel set)

### 1. Powerwall Homeowner Funnel
- **Audience:** affluent residents · Tesla curious · $250+/mo electric bill
- **Trigger:** Powerwall ROI calc submission (the AI Skills tab tool)
- **Sequence:** email → site visit → on-site quote → financing follow-up → phone close
- **Conversion:** ~25% (high-intent calculator submit → close)
- **Avg job:** $13,850

### 2. Generator Backup Funnel — Storm Urgency
- **Audience:** rural residents · recent outage · no backup
- **Trigger:** county-level outage event (storm flag)
- **Sequence:** SMS quiz → quiz submit → voicemail drop → site visit → quote
- **Conversion:** ~32% (urgency drives action)
- **Avg job:** $8,400

### 3. Commercial Maintenance Funnel
- **Audience:** existing commercial customers · multi-property · aging building
- **Trigger:** quarterly contract review or warranty expiry
- **Sequence:** quarterly email → on-site walk-through → proposal → phone close
- **Conversion:** ~63% (high-trust existing relationships)
- **Avg job:** $12,400

### 4. Affiliate Partner Onboarding
- **Audience:** new solar/GC/HVAC/realtor referrers
- **Trigger:** affiliate signup
- **Sequence:** welcome email → walkthrough call → first-referral nudge → commission payout → quarterly review
- **Conversion:** ~73% (motivated partners)
- **Avg job:** $9,100

---

## 4 interactive features (the AI Skills tab content)

### 1. Tesla Powerwall ROI Calculator
- Sliders: monthly bill ($100-$800), utility rate ($0.08-$0.22/kWh), solar yes/no
- Output: payback timeline (years until Powerwall pays for itself)
- Math: `annual_savings = bill × 12 × (0.85 if solar else 0.45)`, `payback = $13,000 / annual_savings`

### 2. Generator Sizing Tool
- Inputs: home sq ft (800-6000), central A/C toggle (+4kW), well pump (+2kW), EV charger (+7kW)
- Output: recommended kW + matching Generac model + installed price
- Model mapping:
  - ≤14kW → Generac 14kW Guardian
  - ≤22kW → Generac 22kW Guardian
  - ≤26kW → Generac 26kW Guardian
  - >26kW → Generac 38kW Protector

### 3. Service-Area Heatmap
- WA state stylized map (county dots sized + colored by lead density)
- Hover/focus → county detail panel (active leads, YTD jobs, storms 30d, notes)
- Olympic Peninsula = hot (Clallam 100, Jefferson 86, Kitsap 72), faded outward to Seattle (King 18) and beyond

### 4. Outage Recovery Simulator
- 4 phases: Normal · Outage · Powerwall takes over · Generac kicks on
- Click each phase to see grid + home + Powerwall + Generac status tiles update
- Narrates: "Within 200ms... 8 seconds for Generac... home runs indefinitely..."

---

## WA county map data

Olympic Peninsula heaviest, fading outward by distance from Sequim:

| County | Score | Active leads | Closed YTD | Avg job | Notes |
|---|---|---|---|---|---|
| Clallam | 100 | 47 | 134 | $8,400 | Home — highest WA outage frequency drives Powerwall + Generac demand |
| Jefferson | 86 | 31 | 78 | $9,200 | Affluent retiree market, premium installs |
| Kitsap | 72 | 22 | 51 | $7,100 | Naval base contractors + ferry-served residential |
| Mason | 51 | 12 | 22 | $6,800 | Hood Canal cabins, generator demand from remoteness |
| Grays Harbor | 40 | 8 | 15 | $5,400 | High storm frequency = peak emergency calls |
| Pierce | 32 | 6 | 11 | $6,100 | Tacoma reach, mostly affiliate-sourced |
| King | 18 | 3 | 4 | $9,500 | Out of standard radius, affiliate-only |
| Snohomish | 14 | 2 | 3 | $7,800 | Tesla dealer affiliates only |
| Island | 22 | 4 | 7 | $7,600 | Whidbey ferry coverage |
| Skagit | 8 | 1 | 1 | $0 | Cold |
| Whatcom | 5 | 0 | 0 | $0 | Cold |

When installing on a different electrician (different region):
- Replace WA_COUNTIES with their state + actual service-area counties
- Score the home county at 100, fade outward
- Adjust storms_30d for their region's actual weather patterns

---

## Reuse on the next electrician install

1. Copy the entire `meyer-electric/portal-demo/` directory
2. Update branding constants (`ACCENT`, `ACCENT_ORANGE`) to match new
   prospect's public-site palette (or keep yellow/orange if they share
   the trade aesthetic)
3. Rewrite `mock-data.ts`:
   - Swap county data for their actual service area
   - Rename businesses + cities to match their region
   - Keep the lead-scoring formula + affiliate categories + funnel
     definitions — those are industry-universal for electricians
4. Update password (currently 1212 — keep unless Ben says otherwise)
5. Wire the secondary feather to their public-site footer
6. Build + commit

Time per reuse: ~30-45 min vs ~4 hours for the first one.

---

## Pacific Northwest specifics (Meyer Electric reference)

If installing on a non-PNW electrician, these need to be tuned:

- **Storm season:** PNW = November-February (wind + ice). Other regions
  shift this (FL = hurricane June-Nov, MW = derecho April-June).
- **Powerwall demand drivers:** PNW = grid reliability (rural Olympic
  Peninsula has frequent outages). Other regions: net-metering math
  (TX, AZ where solar payback is fast), urgency from wildfires (CA), etc.
- **Common appliances:** PNW = heat pumps (rare central A/C, common
  electric heat). Generator sizing should reflect actual load profile.
- **Property values:** Olympic Peninsula = $350K-$2.2M. Adjust to local market.
- **Affiliate density:** Tesla dealers cluster in metro areas (Seattle,
  Portland, Bay Area, etc.). Solar installers concentrate in sunny
  states. Adjust count + locations accordingly.

For non-electrician industries (HVAC, plumbing, dental, etc.) write a
new config file at `docs/mock-backends/{industry}.md` following this
template's structure.
