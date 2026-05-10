# Mock Backend Config — Painting

> **When to use:** residential / commercial painting — interior, exterior, cabinet refinish, deck stain.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Residential interior | 38% | $1.8K-$8K | Room-by-room or whole-home |
| Residential exterior | 24% | $4K-$12K | Long-cycle (8-12yr) |
| Pre-listing prep | 14% | $1.2K-$4K | Realtor-driven, fast turnaround |
| Commercial / office | 10% | $4K-$28K | Repaint cycles, multi-room |
| Cabinet refinish / specialty | 8% | $2K-$5.5K | Higher margin |
| Property mgmt turnover | 6% | $400-$1.8K | Multi-unit recurring |

## Lead-quality signals
- **`scope_size`** = single-room / multi-room / whole-home / commercial
- **`property_value`** = drives finish-tier WTP
- **`recent_listing`** = pre-sale prep window (high urgency)
- **`color_vetted`** = customer has color picked vs. needs consult (drives close speed)
- **`affiliate_source`** = realtor / interior designer / property manager / GC
- **`weather_window`** = exterior season match (Apr-Oct in north, year-round south)

### Lead score formula
```
score = 30 + 18 if recent_listing + 16 if affiliate_source
  + 14 if scope_size in ['whole-home','commercial']
  + 14 if weather_window AND scope='exterior'
  + 12 if color_vetted (close-ready) + 10 if property_value >= $600K
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Real-estate agents | Pre-listing prep volume |
| Interior designers | Color-spec collaboration |
| Stagers | Pre-listing partnerships |
| Property managers | Turnover repaints |
| General contractors | Build-out partnerships |
| Hardware stores | Counter referrals (Sherwin / Benjamin Moore) |
| HOAs | Approved-vendor lists |
| Cabinet shops | Refinish handoff |

## 4 standard funnels
1. **Pre-listing prep** — realtor-aligned, "48hr quote + 5-day-start" guarantee magnet
2. **Whole-home interior** — 30-day nurture w/ color consult + virtual visualizer
3. **Exterior season-window** — annual spring kickoff, weather-aware reminder
4. **Cabinet refinish** — kitchen-remodel-curious lead w/ "refinish vs. replace" calculator

## Industry calculator spec
**Square-Footage Quote** — rooms + ceilings + trim + paint-tier → estimated cost range + timeline.

## Sizing/recommendation tool spec
**Color Visualizer** — upload room photo + pick palette → preview 3 color schemes. Drives consultation booking.

## Service-area heatmap spec
Overlay: real-estate listing density (pre-sale prep zones) + housing-age (exterior cycle candidates) + recent-permit zones.

## Real-world data anchors
- **Job mix**: interior 40% / exterior 26% / pre-listing 14% / commercial 10% / cabinet 6% / other 4%
- **Sample affiliates**: Sherwin-Williams pro reps / Benjamin Moore Designer rep / Realtor.com top agents
- **Avg deal**: $4,200 interior / $7,800 exterior / $3,400 cabinet refinish
