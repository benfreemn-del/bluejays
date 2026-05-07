# MOCK BACKEND — Master Playbook

> **Use case:** drop a password-gated demo backend onto any prospect's
> bespoke client showcase. Built for the live sales call: Ben opens the
> public site, taps the small secondary feather in the footer, types
> the password, and shows the prospect what their AI System backend
> would look like — full of plausible mock data they recognize as
> "leads I would actually want."
>
> **Reference impl:** `/clients/meyer-electric/portal-demo` (electrician
> category — see `docs/mock-backends/electrician.md` for the per-industry
> config that customizes the leads / affiliates / customers / funnels).
>
> **When Ben says "install MOCK BACKEND on [prospect]"** — follow this
> playbook end-to-end.

---

## Locked defaults — DO NOT re-ask (per Rule 73)

These are Ben's locked answers from the FIRST install (Meyer Electric,
2026-05-06). Per CLAUDE.md Rule 73 ("Locked Decisions Cascade Forward"),
every future MOCK BACKEND install applies these as DEFAULTS without
re-asking. Don't burn Ben's time re-asking what's already locked. Only
ask NEW questions about what's unique to THIS instance.

| # | Decision | LOCKED DEFAULT |
|---|---|---|
| 1 | URL pattern | `/clients/[slug]/portal-demo` |
| 2 | Password gate | Client-side, sessionStorage on success, password "1212" |
| 3 | Entry point | Small secondary feather in public-site footer (opacity-30 hover-100, no visible label, next to "Built by BlueJays" link) |
| 4 | Mock data scale | Medium — ~200 leads, ~30 affiliates, ~15 repeat customers |
| 5 | Tab list | Overview · Leads · Map · Funnels · Customers · Affiliates · AI Skills · Settings (8 tabs, horizontal scroll on mobile) |
| 6 | Interactive features | ALL FOUR — industry calculator + sizing/recommendation tool + service-area heatmap + animated narrative simulator |
| 7 | Lead scoring | Full 3-tier signals (property/business + product fit + affiliate-source + urgency + seasonal) |
| 8 | Persistence | Pure mock — page reload resets state cleanly. NO localStorage. **Sub-override (locked 2026-05-06):** within-session sessionStorage is OK for save/star-style UX features (e.g. saved customer list). Survives reload within the demo session, resets on tab close. NEVER localStorage. |
| 9 | Branding | BlueJays dashboard frame (slate-950 bg + horizontal tab bar with border-yellow-400 active state) + the prospect's public-site accent color inside |
| 10 | Reuse storage | Master playbook (this doc) + per-industry config in `docs/mock-backends/` + AIOS skill |

**If Ben overrides any of these for a specific instance**, he says so
explicitly. Update the locked-defaults table in this doc + the AIOS
skill in the SAME commit so future installs learn.

## Future-install question template (for Rule 48 gate)

Instead of re-asking the 10 locked questions, future MOCK BACKEND
installs should ask these (skip any already locked at the prospect /
industry level):

1. Which industry config does this client fit?
   - A) Existing config — pick from `docs/mock-backends/`
   - B) New industry — write a new config alongside the install (~2-3
     extra hours)
2. What's their service area / geographic data? Need: counties or
   metros + lead-density score per area + recent local-event signals
   (storms, fires, etc. depending on industry)
3. What real local business names go in the repeat-customer list?
   Need 15 actual businesses from their region's commercial market
   that fit the industry's recurring-customer profile.
4. What real local cities + neighborhoods go in the lead pool? (Avoid
   "Springfield" / generic names — kills the wow factor.)
5. Any industry-specific lead-quality signals NOT in the existing
   config that matter for THIS prospect's specific service mix?
6. Brand-accent color override on the demo interior? (Default: match
   prospect's public-site accent.)
7. Any specific data the prospect explicitly DOESN'T want shown? (E.g.
   if they're paranoid about a specific competitor seeing pricing.)
8. Any specific funnel audience that's unique to their business model
   beyond the 4 standard industry funnels?
9. Any prospect-specific AI Skill / interactive feature beyond the 4
   standard ones? (E.g. for an HVAC: heat-loss calculator. For a vet:
   pet weight-by-breed lookup.)
10. Anything truly novel about this prospect that the existing config
    doesn't cover?

Most installs will only need 3-5 of these. The rest are "applying
defaults" — confirmed in a single line at the end.

**Hand-back format after questions:**

> Locked from defaults: URL pattern, password 1212, entry feather,
> 8-tab structure, ~200 leads + 30 affiliates + 15 customers,
> reload-resets persistence, BlueJays frame + your-yellow accent.
>
> Customizing for [prospect]: [list the 3-5 things that came back
> different from default].
>
> Building now.

---

## File structure (every install creates these)

```
src/app/clients/{slug}/portal-demo/
  layout.tsx          — metadata + robots:noindex + fonts
  page.tsx            — main demo (password gate + 8 tabs + interactive features)
  mock-data.ts        — generated leads/affiliates/customers/funnels/county-data

src/app/clients/{slug}/page.tsx
  ↳ MODIFIED: small secondary feather added to footer (linking to portal-demo)
```

**No new API routes, no DB migration, no env vars.** Everything is
client-side mock data with deterministic seeded RNG so it looks the
same every demo.

---

## Step-by-step install on a new prospect

### 1. Confirm prospect is custom-tier or fullsystem
Mock backend on a $997 standard-tier prospect doesn't make sense — they
don't have a bespoke `/clients/[slug]` page. Custom + fullsystem only.

### 2. Identify the industry category
Pick the matching config from `docs/mock-backends/`:
- `electrician.md` — Tesla Powerwall + Generac + electrical (Meyer Electric)
- `landscaping.md` — coming when first landscaper installs
- `dental.md` — coming when first dentist installs
- (etc.)

If the prospect's industry doesn't have a config yet, write a new one
following the electrician template + commit it alongside the install.

### 3. Copy the reference impl
Start from `src/app/clients/meyer-electric/portal-demo/`:
- Copy `layout.tsx` verbatim — only update the metadata title.
- Copy `page.tsx` — keep all the tab structure + interactive components.
  The four interactive features (calculator, sizing tool, heatmap,
  simulator) need to be RE-WRITTEN per industry. See the per-industry
  config for the right shape (e.g. for HVAC: heat-loss calculator,
  ductwork sizing, heat-map by climate zone, comfort simulator).
- Copy `mock-data.ts` — replace the data:
  - WA_COUNTIES → swap for the prospect's actual service area
  - LEADS, AFFILIATES, CUSTOMERS → regenerate per the industry config

### 4. Add the secondary feather to the public site footer

In `src/app/clients/{slug}/page.tsx`, find the existing
"Built by BlueJays" link in the footer and wrap it + a new feather
in a flex container:

```tsx
<div className="inline-flex items-center gap-3">
  <a href="https://bluejayportfolio.com/audit" target="_blank" rel="noopener noreferrer" ...>
    <BluejayLogo size={14} className="text-sky-500" />
    <span>Built by <span className="underline decoration-dotted underline-offset-2">BlueJays</span> — get your free site audit</span>
  </a>
  <Link
    href="/clients/{slug}/portal-demo"
    aria-label="Backend demo"
    className="inline-flex items-center justify-center w-6 h-6 rounded-full opacity-30 hover:opacity-100 transition-opacity"
    title="Backend demo"
  >
    <BluejayLogo size={12} className="text-sky-500" />
  </Link>
</div>
```

Don't forget `import Link from "next/link";` at the top.

### 5. Customize the branding accent

In the demo's `page.tsx`, the `ACCENT` + `ACCENT_ORANGE` constants
control the inside-the-demo accent color (BlueJays slate-950 frame
stays the same). Match the prospect's public-site palette so the demo
feels like one continuous product.

### 6. Build + commit

```bash
npm run build
git add src/app/clients/{slug}/portal-demo/ src/app/clients/{slug}/page.tsx
git commit -m "{Slug}: install MOCK BACKEND demo (password 1212, /portal-demo)"
git push origin master
```

Vercel auto-deploys (~60-90s). Verify by visiting
`https://bluejayportfolio.com/clients/{slug}/portal-demo` — the
password gate should appear.

---

## Demo flow on the sales call

This is the choreography Ben should rehearse:

1. **Open the public site** — show the prospect their bespoke build first
2. **Scroll to the footer** — point at the small feather, say "by the way…"
3. **Click the feather** — password gate appears
4. **Type 1212** — enter the demo
5. **Open the Overview tab** — "this is what you'd see Monday morning"
6. **Click Leads** — show the lead table sorted by score, hover a hot lead to open the detail drawer with all signals
7. **Click Map** — show the heatmap, hover counties to see why each one is hot or cold
8. **Click Funnels** — show the 4 audience-specific funnels with conversion rates
9. **Click AI Skills** — open the calculator/sizing tool/simulator (THE moment they go from "this looks nice" to "I need this")
10. **Close with Customers/Affiliates** — show the recurring revenue + partner network they could build
11. **Sign out / hand back** — leaves them wanting more

Ben's pitch line during the demo: *"This is mocked but it's exactly
how the real backend works. The leads are scored automatically by your
AI system. The funnels run themselves. You just open this in the morning
and see what's hot."*

---

## What the prospect should be saying by the end

**Sock-knocked signals:**
- "Wait, where do these leads come from?"
- "How does it know which ones are hot?"
- "Can it really run those funnels by itself?"
- "Can I see it on my phone?"
- "When can we start?"

**If they're saying "interesting" or "nice"** — the demo isn't
sock-knocking. Something in the per-industry config is generic. Go
back to `docs/mock-backends/{industry}.md`, check the data feels
hyper-local + hyper-relevant. Industry generics like "12 leads this
week" don't move them. "8 Powerwall-eligible leads in Sequim — 3
already have solar" DOES move them because that's exactly the lead
they want and they know it.

---

## Common pitfalls

- **Forgetting robots:noindex** — the demo is private. If Google indexes
  it, prospects can find each other's mock data. Always add
  `robots: { index: false, follow: false, nocache: true }` to layout
  metadata.
- **Mock data feels obviously fake** — names like "John Smith" or
  generic city names. Use real local first/last names + real local
  city names from the prospect's service area. The Meyer Electric data
  uses real Olympic Peninsula cities + plausible Pacific Northwest
  surnames.
- **Lead scoring doesn't match the industry** — for an electrician,
  Powerwall fit + Generac fit + storm urgency are the signals.
  For a dental practice it's insurance type + last cleaning + age.
  Each industry has its own quality-lead vocabulary. Match it.
- **Interactive feature doesn't pay off** — the whole point of the
  AI Skills tab is to give the prospect ONE interactive moment that
  shows the system "thinking." If your calculator/tool feels static or
  generic, scrap it and design something better. ROI calculators and
  fit-quizzes work; static "info" panels don't.
- **Demo state survives across sessions and looks weird** — Q8=A
  locked: pure mock, reload resets. Don't put state in localStorage.
- **Password too clever** — Q2=A locked: 1212 is the demo password.
  Don't change it without coordinating with Ben. The point is "easy
  to remember on the fly during a live call."

---

## Per-industry configs available

| Industry | Config | First reference build |
|---|---|---|
| Electrician | `docs/mock-backends/electrician.md` | Meyer Electric (2026-05-06) |
| (more added as they ship) | | |

When you ship a NEW industry config, create it as
`docs/mock-backends/{industry}.md` following the electrician template.
The config defines:
- Customer category mix (residential / commercial / industrial / etc.)
- Lead-quality signals (the industry's "what's a hot lead?")
- Affiliate categories (typical referral partners for that industry)
- Repeat customer types (recurring revenue accounts)
- 4 funnel examples (audience × pain-point combinations)
- 4 interactive features tuned to the industry's buying motion

---

## Reuse cycle — the compounding loop

1. **First install** = full build (~3-4 hours): write per-industry
   config + customize all 4 interactive features + generate fresh
   mock data
2. **Second install in same industry** = ~30 min (copy mock-data.ts
   from first install, swap business name + service area, deploy)
3. **Second install in NEW industry** = ~2-3 hours (write new
   industry config + customize 4 interactive features + generate
   fresh data)

The compounding payoff: every industry config makes the next install
in that industry cheap. Within 5-6 industries we have a library that
covers ~60% of BlueJays' bespoke clients.

---

## Save-to-AIOS

There's a parallel skill at `aios/.claude/skills/mock_backend/SKILL.md`
that wraps this playbook so Ben can invoke it from his AIOS chat with
"install MOCK BACKEND on [prospect]" and the skill walks the steps.
