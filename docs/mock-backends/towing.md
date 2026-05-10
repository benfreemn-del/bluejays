# Mock Backend Config — Towing

> **When to use:** roadside assistance, accident-tow, motor-club contractor, heavy-duty / commercial recovery, impound.

## Customer category mix
| Type | % | Avg ticket | Notes |
|---|---|---|---|
| Roadside (lockout / battery / flat) | 32% | $80-$200 | Highest urgency, lowest ticket |
| Accident tow | 22% | $200-$800 | Insurance-billed |
| Motor-club contracted (AAA / Allstate) | 20% | $80-$180 | Recurring contract |
| Long-distance tow | 8% | $400-$2,500 | Premium specialty |
| Heavy-duty / commercial | 8% | $1.5K-$8K | Highest-margin |
| Impound / private property | 6% | $200-$650 | Recurring B2B |
| Recovery (off-road / specialty) | 4% | $400-$2,500 | Specialty |

## Lead-quality signals
- **`emergency_signal`** = stranded / accident / overheated = HIGH urgency
- **`distance_miles`** = drives ticket
- **`vehicle_type`** = passenger / heavy-duty / specialty
- **`contracted_via_motor_club`** = AAA / Geico = motor-club bill
- **`insurance_claim_open`** = active claim = insurance-billed
- **`affiliate_source`** = motor-club / insurance / repair-shop / police-rotation

### Lead score formula
```
score = 30 + 24 if emergency_signal + 22 if accident_signal
  + 18 if heavy_duty + 16 if affiliate_source
  + 14 if motor_club_contracted + 10 if seasonal_peak (winter freeze)
clamp 0-100
```

## Affiliate categories (8 types)
| Category | Why |
|---|---|
| Motor clubs (AAA / Allstate / Geico) | Contracted-call recurring |
| Insurance adjusters | Accident referrals |
| Auto repair shops | Tow-to-shop partnerships |
| Body shops | Accident handoffs |
| Police rotation lists | Crash-scene assignments |
| Property managers | Impound / private-property |
| Trucking dispatchers | Heavy-duty referrals |
| Roadside-app aggregators (Honk / Urgent.ly) | Tech-platform referrals |

## 4 standard funnels
1. **24/7 emergency** — text-to-quote + ETA-counter, "we'll be there in 30 min" promise
2. **Motor-club contract** — quarterly ROI report + premium-tier service
3. **Body / repair shop partnership** — recurring referral fee program
4. **Heavy-duty B2B** — trucking-fleet contract recurring

## Industry calculator spec
**Tow Cost Estimator** — pick distance + vehicle type + extras (winch / dolly / wheel-lift). Returns: cost + ETA estimate.

## Sizing/recommendation tool spec
**Service Match** — caller picks scenario (lockout / dead battery / accident / breakdown). Returns: appropriate truck type + estimated arrival.

## Service-area heatmap spec
Overlay: highway density + accident-incidence zones + impound-lot proximity + motor-club coverage zones.

## Real-world data anchors
- **Service mix**: roadside 32% / accident 22% / motor-club 20% / long-distance 8% / heavy-duty 8% / impound 6% / recovery 4%
- **Sample affiliates**: AAA / Allstate Roadside / Geico ERS / regional body shops / police-rotation lists
- **Avg deal**: $140 roadside / $480 accident tow / $4,200 heavy-duty
