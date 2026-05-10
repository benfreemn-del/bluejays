# Mock Backend Config — Church / Faith Community

> **When to use:** Christian / Catholic / multi-denominational / niche-faith community. ICP unique: "leads" are visitors / new-attenders, "deals" are membership commitment + tithing relationships.

## Audience category mix (visitor-to-member pipeline)
| Type | % | Engagement signal | Notes |
|---|---|---|---|
| First-time visitor | 32% | Service attendance only | Acquisition |
| Returning visitor (2-3 visits) | 18% | Newsletter signup | Conversion window |
| Connection-class attendee | 12% | Pre-membership class | Ready to commit |
| Active member | 14% | Regular tithing + serving | Highest LTV (financial + community) |
| Family with kids in programs | 10% | Sunday school / youth signup | Stickiest cohort |
| Small-group participant | 6% | Mid-week group | High retention |
| Volunteer / lay-leader | 4% | Multi-team serving | Internal pipeline |
| Wedding / funeral / event | 4% | One-shot life event | Re-engagement door |

## Lead-quality signals
- **`visit_count`** = 1 / 2-3 / 4+ (4+ = ready for connection class)
- **`life_event`** = recent move / new baby / divorce / death = HIGH receptivity
- **`age_band_kids`** = parents w/ kids in programs = stickiest LTV
- **`affiliate_source`** = friend referral / event / online-find / google
- **`small_group_engaged`** = mid-week group attendance signal
- **`prior_church_lapse`** = re-entering after gap = re-engagement cohort

### Lead score formula
```
score = 30 + 22 if visit_count >= 4 + 20 if life_event
  + 18 if affiliate_source='friend referral' + 16 if small_group_engaged
  + 14 if age_band_kids + 12 if connection_class_attended
  + 10 if prior_church_lapse
clamp 0-100
```

## Connection categories (8 types — "affiliates" reframed)
| Category | Why they refer |
|---|---|
| Existing members (friend referral) | Highest-trust referral source |
| Other churches (peer / mover) | New-resident handoff |
| Community partner orgs (food bank / counseling) | Cross-ministry referrals |
| Wedding / funeral homes | Life-event re-engagement door |
| Schools / youth programs | Family-pipeline |
| Realtors | New-resident welcome |
| Faith-event organizers (mission / conference) | Event-cohort referrals |
| Counselors / therapists | Pastoral-care referrals |

## 4 standard funnels
1. **First-time visitor** — "what to expect on Sunday" PDF + auto-follow-up after first visit
2. **Returning visitor → connection** — "next steps" 14-day nurture inviting to connection class
3. **Family / kids welcome** — kid-program tour + parent-orientation
4. **Re-engaged / lapsed** — "we miss you" gentle nurture + life-event check-in

## Industry calculator spec
**Service-Time Finder** — visitor picks day + style preference. Returns: service-time recommendations + parking / family-area info.

## Sizing/recommendation tool spec
**Connection Match** — visitor answers 6 questions about life stage + interests. Returns: top 3 small groups + ministry teams to plug into.

## Service-area heatmap spec
Overlay: residential family density + new-resident move-in zones + competitor-church density (in faith landscape).

## Real-world data anchors
- **Audience mix**: first-time 32% / returning 18% / connection class 12% / member 14% / family 10% / small-group 6% / volunteer 4% / event 4%
- **Sample affiliates**: Existing-member referrals (highest signal) / regional church-network / family-counselor referrals / Realtor.com
- **Avg LTV (per family)**: $14K (5yr tithing) / $48K (lifetime giving) / community / volunteer hours uncountable
- **NOTE on framing:** the "AI System" for a church reframes funnel = pastoral-care pipeline, not a sales pipeline. Mock-backend demo should soften commercial language: "leads → seekers", "funnel → discipleship", "deal value → giving + serving".
