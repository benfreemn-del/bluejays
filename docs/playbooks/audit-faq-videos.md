# Audit FAQ Videos — Recording Playbook

**The asset:** 5 × ~60-second videos answering the top 5 objections that
surface on Madie's $10k AI System discovery calls. Embedded on the
`/audit/[id]` results page below the pitch video, BEFORE the prospect
hits the Calendly / scarcity footer.

**Why this exists:** 116-Funnels chunk 13a — "up to 40% show-rate lift"
when the confirmation/thank-you page pre-handles top objections in
60-second videos before the prospect ever speaks to a closer. Pulls the
prospect from "skeptical" → "gray-zone" before any 1:1 contact.
Compounds on every audit submitter forever (one record, infinite reuse).

**Framework basis (cite-able in the videos themselves if natural):**
- Brunson HSO at video altitude (`reference_brunson_funnels_frameworks.md`
  chunk 9+10) — Hook stops the scroll, Story rewrites belief, Offer is
  the click
- Brunson chunk 17 — belief-rewrite via TRUMP story
- 116-Funnels chunk 13a — confirmation-page FAQ video methodology

---

## Recording protocol

**Format per video:** ~60 seconds. Brunson HSO arc:
- 0:00–0:05 — **Hook** (stop the scroll, pattern-interrupt the objection
  statement)
- 0:05–0:45 — **Story** (TRUMP story that rewrites the belief — concrete,
  specific, named case studies allowed since this is POST-click)
- 0:45–0:60 — **Offer** (specific next step CTA)

**Where to record:** Loom is the default (one-click record + auto-hosted
URL + cookie-based view tracking). Self-hosted MP4 works too if you
want longer retention control. Either way, the embed slot in
`audit-faq-data.ts` accepts a URL — drop it in once recorded.

**Recording defaults (lock once + don't re-decide every video):**
- **Background:** plain wall or your studio — keep it consistent across
  all 5 so they read as a series, not 5 random clips
- **Framing:** medium close-up, you centered, eye-level camera
- **Audio:** lavalier or USB mic — never laptop built-in. Background
  noise kills credibility on a $10k pitch.
- **No editing required** — Loom one-take is fine (William Brown
  $500-600k/mo pattern per 116-Funnels chunk 2 — production polish is
  not the lever; idea quality is)
- **Energy:** match the audit results page voice — direct, confident,
  no hedging. Per `feedback_l7_reels_follow_stories_sell.md`, this is
  the post-click surface where conviction reads as competence.

**After recording:** edit `src/lib/audit-faq-data.ts` and replace the
`videoUrl: null` slot for each FAQ entry with the Loom URL (or whatever
hosted URL). Component auto-flips from script-fallback to embedded
video the moment a URL lands.

---

## The 5 scripts

These are the canonical $10k AI System objections derived from the
Hormozi + Brunson + 116-Funnels corpus + the recent diagnostic memory.
When Madie's actual call recordings accumulate (≥10 calls), re-derive
top 5 from real data and replace these — but ship these first to
unblock the surface.

---

### FAQ 1 — "$10k for a website? That's insane."

**Hook (0:00–0:05):** "Yeah — $10k for a website would be insane. But
that's not what this is."

**Story (0:05–0:45):**

"This is an AI System. The website is one of 21 modules. Let me show
you the math really quick: 17 universal modules — your custom site
plus an AI inbound responder, customer-portal backend, missed-call
auto-texter, review funnel, lead-scoring, content engine, the whole
thing — those are each $2k-$5k standalone. Then if you're a manufacturer
like Jake at ITC Quick Attach or Philip at Tekky, you get 4 more bonus
modules: distributor portal, B2B quote system, custom-order intake,
inventory sync. That's about $50k of value, $10k price. The website is
the wrapper; the AI System is the engine.

Most agencies sell you a $10k brochure. We sell you a $10k machine that
keeps making your money back."

**Offer (0:45–0:60):**

"Click 'Schedule a call' below and I'll walk you through what your
specific 21-module stack would look like. 15 minutes, no pitch — just
the math."

---

### FAQ 2 — "I already have a website."

**Hook (0:00–0:05):** "If you already have a website, perfect — keep
it. This isn't a website replacement."

**Story (0:05–0:45):**

"Your website is the brochure. The AI System is everything that should
be happening AROUND your website that probably isn't right now. When a
visitor lands and doesn't convert, where do they go? Nowhere. When
they call after hours, what happens? Voicemail nobody checks. When
they fill out your contact form, who follows up in 2 minutes? Nobody.
When a five-star customer wants to leave a review, where do you send
them? You don't.

The AI System is the layer that catches everyone your current website
already touched but couldn't capitalize on. It plugs into your existing
site — we don't replace it. If your current site is doing its job as a
brochure, fantastic. We'll point the AI System at it and you'll see
inbound conversion go up the same week."

**Offer (0:45–0:60):**

"Schedule a call. I'll show you the backend tour — what the AI System
looks like pointed at your existing site, before you commit to anything."

---

### FAQ 3 — "How fast can I expect to make my money back?"

**Hook (0:00–0:05):** "Fastest case I can point you at — Optimum Works
went from $2.5M to $3.6M in 12 months. So that's 44% revenue growth
year-over-year, +41% profit."

**Story (0:05–0:45):**

"That's not me promising you 44%. That's a public case study where
Hormozi and the team measured the actual outcomes for a similar-shape
business after they restructured the funnel + pricing + ad spend.
Different industry, same mechanics.

For BlueJays specifically: Tekky paid $10,000 in February. Their first
month with the AI System running, their inbound inquiries doubled.
That's not a guarantee — guarantees are dead. That's a documented
result. The system either pays for itself in the first quarter, or
it doesn't, and you'd know that within 90 days.

If your business does $300k a year, a 30% inbound lift is $90k. The
system pays for itself many times over. If you do $1M a year, the
math gets stupid fast."

**Offer (0:45–0:60):**

"Click 'Schedule a call' and the first thing I'll do is run YOUR
numbers — current revenue, current inbound, current close rate. Then
we'll math out what 30% looks like in your bank account."

---

### FAQ 4 — "Will this even work in my industry?"

**Hook (0:00–0:05):** "If you're a product manufacturer — yes. If
you're a service business — maybe not, and I'll tell you that on the
call."

**Story (0:05–0:45):**

"The AI System has a 3-anchor ICP: niche manufacturers, indie authors,
and B2B product companies. ITC Quick Attach builds tractor accessories
— it works there. Tekky / Zenith Sports does soccer training equipment
— it works there. Bloodlines is a fantasy series by an indie author —
it works there. Three radically different industries, same mechanics.

What it DOESN'T work for: pure local service businesses — landscaping,
HVAC, electricians. Those need a $997 site instead. Different product,
different price point, totally fine. If you fill out the audit and
you're in a service vertical, we'll route you to the $997 tier on the
call — no upsell pressure.

The AI System assumes you have a product or program to sell at scale.
If that's you, every module applies. If you're a 1:1 service business,
the leverage isn't the same."

**Offer (0:45–0:60):**

"Schedule a call. First thing I'll ask is 'what do you sell?' If it's
a product, we go deep on the AI System. If it's a service, I'll route
you to $997 in 90 seconds. Either way you leave with a clear next step."

---

### FAQ 5 — "Why should I trust you over an established agency?"

**Hook (0:00–0:05):** "Honestly? You probably shouldn't, if you can
afford to wait 6 months and pay $40k."

**Story (0:05–0:45):**

"Established agencies will charge you $25k-$50k, take 4-6 months to
deliver, and hand you a brochure site. I know because I priced
quotes from 4 of them before I started BlueJays.

What you get with me instead: $10k, live in 30-60 days, with a working
AI System backend you can actually see on a demo call BEFORE you pay.
Not slides — the actual backend, live, with real mock data, that
becomes yours after purchase.

12 months ago I was a beginner dev who could see the pattern: small
businesses were getting overcharged for underbuilt websites by agencies
that treated them as side-clients. I built BlueJays specifically to
serve the businesses agencies don't actually care about. You can see
the work — Tekky's running it, ITC signed for it, Hector's site is
live, the work speaks. If you want a 50-person agency, go get one. If
you want it built right by someone who'll actually answer the phone,
schedule a call."

**Offer (0:45–0:60):**

"Click 'Schedule a call.' Worst case you waste 15 minutes. Best case
you save $30k and 5 months of agency-onboarding hell."

---

## Once recorded — wiring URLs in

1. Record video on Loom (or wherever)
2. Open `src/lib/audit-faq-data.ts`
3. Replace `videoUrl: null` with the Loom URL for each entry
4. The component auto-renders the embed instead of the script fallback
5. Verify in browser at `/audit/<any-existing-audit-id>` — FAQ section
   should swap script → video the moment the URL lands

If you record only 1 or 2 videos before launch, the rest stay in
script-fallback mode. Component handles partial-recording gracefully —
no UX cliff if some are video and some are script.

## Maintenance

- After Madie has 10+ recorded discovery calls, re-derive top 5
  objections from REAL call recordings (per 116-Funnels chunk 13a) and
  re-record. The current 5 are reasoned-from-corpus; real call data
  will surface different priorities.
- Don't bloat past 5 — the whole point of the asset is 60 seconds × 5
  = 5 minutes of objection-handling. Adding a 6th dilutes the strip
  and adds friction (Hormozi 5 friction variables — effort).
- Ship gate row: "Top-5 FAQ videos recorded + URLs wired" tracked in
  `aios/references/ship_gate_checklist.md`. Currently 0/5 recorded.
