# Mandatory Premium Features Per V2 Template (NON-NEGOTIABLE)

Moved out of CLAUDE.md on 2026-05-07 to keep the always-loaded surface lean. Read this file on demand when the topic comes up.

---

<!-- moved from CLAUDE.md: ## Mandatory Premium Features Per V2 Template (NON-NEGOTIABLE) -->

## Mandatory Premium Features Per V2 Template (NON-NEGOTIABLE)
Every V2 preview template MUST include ALL of the following conversion-focused sections. These are not optional — they are the minimum bar for a $997 website. Templates missing these features fail QC.

### Universal Features (required on EVERY category)
1. **Trust Badges on Hero** — 3+ pill badges below CTA buttons (Licensed, X-Star Rated, Free Estimates/Consult). Never ship a hero without social proof.
2. **Google Reviews Header** — Star rating + review count summary displayed above the testimonials section. Pull from `data.googleRating` and `data.reviewCount`.
3. **Enhanced Testimonials** — Decorative quote marks, verified badge with CheckCircle icon, star ratings at 18px. Not just plain text in a card.
4. **Competitor Comparison Table** — "[Business Name] vs. The Competition" with 5-7 rows. Us column = green checkmarks, them column = "Sometimes"/"Varies"/"No". Uses GlassCard wrapper.
5. **Financing/Payment Section** — 3 pricing tiers showing affordability. Adapt to category (monthly payments for trades, service pricing for professional services).
6. **Video Testimonial Placeholder** — Play button overlay on a project/office photo. "Watch Our Work" or "Take a Virtual Tour". Even without real video, it signals professionalism.
7. **Interactive Quiz/Calculator CTA** — Category-specific engagement tool (roof age quiz, last checkup quiz, "what type of service do you need?" selector). 3 options with color-coded recommendations leading to phone CTA.
8. **Emergency/Urgency Element** — Pulsing indicator with response time or availability. "Crews Available Now", "Same-Day Appointments", "24/7 Emergency Service".
9. **Certifications/Partners Badge Row** — Industry-specific trust signals (GAF for roofing, ADA for dental, BBB, NRCA, state licenses). Horizontal row of pill badges.
10. **Enhanced Service Area** — Not just a text address. Show coverage radius, response time, and availability status with pulsing indicator.

### How Premium Features Work (IMPORTANT — NO API CALLS)
All 10 premium features per category are **hardcoded directly into each V2 template component** as static React JSX. They render instantly with zero external API calls. The pricing cards, comparison tables, quizzes, before/after sections, Google review headers, etc. are all pre-built into the template and simply render with the business's dynamic data (`data.businessName`, `data.phone`, `data.googleRating`, etc.).

**When a new site is generated:**
1. The pipeline scrapes the business website + Google Places (this is the only slow step)
2. The generator creates a `GeneratedSiteData` object with the scraped info
3. The V2 template renders instantly with all 10 premium features — no API, no AI, no waiting
4. The preview is immediately available

**When building a NEW V2 template for a category**, include all 10 universal features + the category-specific features listed below. They go directly into the `.tsx` file as JSX — not as API calls or external data.

### Category-Specific Premium Features (BUILT — reference when building/upgrading any category)

**DENTAL** (warm light theme `#faf9f6`)
1. New Patient Special Banner — "$99 Exam, X-Rays & Cleaning" urgency CTA
2. Insurance Accepted Badges — "Most Insurance", "CareCredit", "Payment Plans", "In-House Savings"
3. Financing/Payment Plans — 3 pricing tiers ($99/$Free/$49mo)
4. Smile Before/After — real photo at `/images/dental-before-after.png`
5. Patient Comfort Section — sedation, gentle techniques, warm blankets, no-rush
6. Dental Technology — Digital X-Rays, Intraoral Cameras, Laser, 3D Imaging
7. Competitor Comparison — vs average dental office, 7 rows
8. Video Tour Placeholder — office tour with play button
9. "When Was Your Last Checkup?" Quiz — green/amber/red with CTA
10. Google Reviews Header — stars + count above testimonials

**ROOFING** (dark theme `#111827`)
1. Before/After Image — real photo at `/images/roofing-before-after.jpg`
2. Insurance Claims Timeline — 4-step: inspect → file → meet adjuster → install ($0 out of pocket)
3. Premium Materials Section — Architectural Shingles, Standing Seam Metal, Cedar Shake, Composite Tile
4. Financing Section — $89/$149/$199 monthly payment tiers
5. Certifications Badge Row — GAF, BBB, Licensed, Manufacturer Warranty, NRCA
6. Competitor Comparison — vs average movers, 7 rows
7. Video Placeholder — crew in action
8. Roof Age Quiz — under 10/10-20/20+ years with recommendations
9. Emergency Response Card — pulsing "Crews Available Now", under 2 hours
10. Moving Day Guarantee — on-time, no hidden fees, no damage

**VETERINARY** (warm light theme `#f7faf8`)
1. Pet Insurance & Payment Badges — pet insurance, payment plans, CareCredit, wellness plans
2. Wellness Pricing Plans — $65 exam, $149 vaccines, $299 dental
3. Pet Type Cards — Dogs, Cats, Exotic Pets, Senior Pets with icons
4. Before/After Pet Grooming — real photo at `/images/vet-before-after.png`
5. Comfort & Fear-Free Section — gentle handling, calming environment, treat rewards
6. Competitor Comparison — vs average vet clinic, 7 rows
7. Video Tour Placeholder — hospital tour
8. "When Was Your Pet's Last Checkup?" Quiz — green/amber/red
9. Google Reviews Header — stars + count
10. New Client Special — $49 First Exam with urgency CTA
- Hero stock: Australian Shepherd at `/images/vet-hero-dog.png`

**MOVING** (dark theme `#1a1a1a`)
1. Licensed & Insured Badges — licensed, bonded, BBB, background-checked
2. Moving Pricing Estimates — $349/$599/$999 tier cards
3. Truck Size Calculator — Studio/1BR/2BR/3BR/4BR+ to truck size mapping
4. What We Move Grid — 8 item types (furniture, pianos, antiques, etc.)
5. Moving Day Checklist — 6-item prep list with ShimmerBorder
6. Competitor Comparison — vs average movers, 7 rows
7. Video Placeholder — crew in action
8. "When Are You Moving?" Quiz — this week/this month/just planning
9. Google Reviews Header — stars + count
10. Moving Day Guarantee — on-time, no hidden fees, no damage

**PEST CONTROL** (dark theme `#1a1a1a`)
1. Licensed & Safe Badges — EPA-approved, pet & child safe, satisfaction guaranteed
2. Pest Control Pricing — $149 one-time, $99/quarter, $79/month
3. Common Pests Grid — 8 pest types with icons and descriptions
4. Treatment Process — 4-step: inspect → plan → treat → guarantee
5. Eco-Friendly Section — green products, targeted, safe for family
6. Competitor Comparison — vs average exterminators, 7 rows
7. Video Placeholder — process showcase
8. "What Pest?" Quiz — ants/rodents/bed bugs/not sure with urgency levels
9. Google Reviews Header — stars + count
10. Pest-Free Guarantee — satisfaction guarantee with ShimmerBorder

**CLEANING** (dark theme `#1a1a1a`)
1. Trust & Safety Badges — background-checked, bonded, eco-friendly, guaranteed
2. Cleaning Pricing Plans — $149/$249/$349 tiers
3. What We Clean Grid — 8 room types with icons
4. Cleaning Checklist — 10 items included in every clean
5. Eco-Friendly Section — non-toxic, allergen reduction, green seal
6. Before/After Transformation — clean kitchen/bathroom showcase
7. Competitor Comparison — vs average cleaning services, 7 rows
8. "How Often?" Quiz — weekly/bi-weekly/monthly recommendations
9. Google Reviews Header — stars + count
10. Spotless Guarantee — re-clean for free promise

**INTERIOR DESIGN** (warm light theme `#faf9f7`)
1. Design Style Badges — residential, commercial, full-service, award-winning
2. Design Packages — $250 consult, $2500 room, $10K+ full home
3. Design Process Timeline — 5-step vertical (discover → concept → develop → procure → reveal)
4. Room Types Grid — 8 spaces (living, kitchen, bedroom, bath, office, outdoor, commercial, restaurant)
5. Design Philosophy — personalized, craftsmanship, timeless, sustainable
6. Before/After Room Transformation — real photo at `/images/interior-design-before-after.jpg`
7. Competitor Comparison — vs DIY/big box, 7 rows
8. "What's Your Style?" Quiz — modern/traditional/boho/contemporary
9. Google Reviews Header — stars + count
10. Free Consultation CTA — ShimmerBorder with dual CTAs

**PHOTOGRAPHY** (warm light/gold theme)
1. Photography Styles Showcase — 6 style badges (portraits, weddings, events, etc.)
2. Session Pricing Packages — $199/$499/$1500+ with "investment" language
3. The Experience Timeline — 5-step (consult → scout → shoot → edit → deliver)
4. Portfolio Highlight Enhancement — session type overlays on gallery images
5. What Makes Us Different — artistic eye, natural light, fast turnaround, print rights
6. Investment Guide — 6 deliverables (edited images, gallery, print release, etc.)
7. Competitor Comparison — vs average photographers, 7 rows
8. Session Type Quiz — portraits/family/wedding/commercial
9. Google Reviews Header — stars + count
10. Limited Availability CTA — seasonal booking with FOMO pulsing indicator

**INSURANCE** (dark navy theme)
1. Coverage Type Badges — auto, home, business, life, health, umbrella
2. Insurance Savings — save $500/$800/25% bundle cards
3. Insurance Process — 4-step reassuring flow
4. Why Independent Agents Win — shop carriers, personal service, claims advocacy
5. Carrier Partners Row — Progressive, Safeco, Travelers, Hartford, Nationwide, Liberty Mutual
6. Competitor Comparison — vs direct/online insurance, 7 rows
7. Video Placeholder — "Meet Your Agent"
8. "What Insurance?" Quiz — auto/home/business/life with quote CTA
9. Google Reviews Header — stars + count
10. Free Quote CTA — $427 avg savings, ShimmerBorder

**ACCOUNTING** (dark navy/gold theme)
1. Service Type Badges — tax prep, bookkeeping, payroll, advisory, IRS, planning
2. Tax Savings — $199/$499/$299mo pricing cards
3. Tax Process — 4-step with icons
4. Why Choose a CPA — licensed, IRS rep, year-round, audit protection
5. Industries We Serve — 8 industry cards
6. Competitor Comparison — vs DIY tax software, 7 rows
7. Video Placeholder — "Meet Your CPA"
8. "What Tax Help?" Quiz — personal/business/bookkeeping/IRS problem
9. Google Reviews Header — stars + count
10. Free Consultation CTA — $3,200 avg savings

**CHIROPRACTIC** (warm dark theme)
1. Treatment Type Badges — adjustments, sports, auto accident, prenatal, pediatric, wellness
2. New Patient Special — $49 exam/x-rays/first adjustment
3. Conditions We Treat — 8 conditions (back, neck, headaches, sciatica, sports, auto, posture, joint)
4. Chiropractic Process — 4-step path to relief
5. Patient Comfort — gentle techniques, no cracking, same-day relief, family-friendly
6. Competitor Comparison — vs pain medication, 7 rows
7. Video Placeholder — "See What a Visit Looks Like"
8. "Where Does It Hurt?" Quiz — back/neck/headaches/other
9. Google Reviews Header — stars + count
10. Pain-Free Guarantee — $49 first visit CTA

**AUTO REPAIR** (dark professional theme)
1. Service Type Badges — oil, brakes, engine, transmission, diagnostics, A/C
2. Transparent Pricing — $39.99/$149/$89 cards
3. What We Service — 8 vehicle types/systems grid
4. Repair Process — 4-step no-surprises flow
5. Honesty Guarantee — no unnecessary repairs, free estimates, warranty, show the problem
6. Competitor Comparison — vs dealership service, 7 rows
7. Video Placeholder — "See Our Shop"
8. "What Does Your Car Need?" Quiz — maintenance/sounds wrong/brakes/check engine
9. Google Reviews Header — stars + count
10. Warranty CTA — every repair backed

**GENERAL CONTRACTOR** (dark professional theme)
1. Project Type Badges — kitchen, bathroom, additions, new construction, commercial, outdoor
2. Project Investment Guide — $15K/$35K/$75K+ project tiers
3. Build Process — 5-step: consult → design → permits → build → walkthrough
4. Why Choose Licensed GC — licensed/bonded, permits, subcontractor coordination, warranty
5. Project Types Grid — 8 project types
6. Competitor Comparison — vs handyman/unlicensed, 7 rows
7. Video Placeholder — "Tour Our Projects"
8. "What's Your Project?" Quiz — kitchen-bath/addition/whole-home/commercial
9. Google Reviews Header — stars + count
10. Project Guarantee CTA — on time, on budget, with license number

**HVAC** (dark professional theme, uses `BLUE` variable — NOT ACCENT)
1. Service Type Badges — heating, AC, heat pumps, furnaces, ductwork, 24/7
2. Seasonal Savings — $89/$79/$4999 pricing cards
3. What We Service — 8 equipment types grid
4. HVAC Process — 4-step comfort flow
5. Energy Savings — save 40%, smart thermostats, $2K tax credits
6. Competitor Comparison — vs big box HVAC, 7 rows
7. Video Placeholder — "Meet Our Team"
8. HVAC Need Quiz — no heat/maintenance/new system/air quality
9. Google Reviews Header — stars + count
10. Comfort Guarantee — satisfaction guaranteed, financing available

**ELECTRICIAN** (dark professional theme)
1. Service Type Badges — residential, commercial, panels, EV, generators, 24/7
2. Upfront Pricing — $99/$1800/$799 cards
3. What We Handle — 8 capabilities grid
4. Electrical Process — 4-step safety flow
5. Safety First — licensed, code-compliant, background-checked, warranty
6. Competitor Comparison — vs handyman electrical, 7 rows
7. Video Placeholder — "See Our Work"
8. Electrical Quiz — outlet/panel/new install/emergency
9. Google Reviews Header — stars + count
10. Safety Guarantee — free inspection, license number

**PLUMBER** (dark professional theme, uses `TEAL` variable)
1. Service Type Badges — emergency, drain, water heaters, sewer, repiping, leak
2. Upfront Pricing — $99/$1200/$149 cards
3. What We Fix — 8 items grid
4. Plumbing Process — 4-step no-surprises
5. Why Choose Us — licensed, 24/7, upfront, guaranteed
6. Competitor Comparison — vs handyman/DIY, 7 rows
7. Video Placeholder — "See Our Work"
8. Plumbing Issue Quiz — drain/leak/water heater/sewer
9. Google Reviews Header — stars + count
10. Guarantee CTA — licensed, insured, guaranteed

**SALON** (elegant theme, uses `ROSE` variable — NOT ACCENT)
1. Service Category Badges — haircuts, color, balayage, extensions, bridal, treatments
2. Service Menu — $55/$120/$200+ pricing cards
3. Stylist Profiles — 4 specialty cards
4. Salon Experience — 4-step elegant journey
5. Why Choose Us — award-winning, premium products, relaxing, consultation
6. Competitor Comparison — vs chain salons, 7 rows
7. Video Placeholder — "Tour Our Salon"
8. Service Quiz — haircut/color/occasion/repair
9. Google Reviews Header — stars + count
10. New Client Special — 20% off first visit

**LANDSCAPING** (earthy theme, uses `PRIMARY` variable)
1. Service Type Badges — lawn care, design, hardscaping, irrigation, tree, cleanup
2. Service Pricing — $45/visit, $2500+, $8000+ cards
3. What We Do — 8 services grid
4. Process — 4-step with icons
5. Why Choose Us — licensed, custom, sustainable, guaranteed
6. Competitor Comparison — vs mow-and-go, 7 rows
7. Video Placeholder — "See Our Transformations"
8. Yard Need Quiz — lawn care/makeover/hardscaping/cleanup
9. Google Reviews Header — stars + count
10. Free Consultation CTA — transform your outdoor space

**LAW FIRM** (dark navy premium, uses `EMERALD` variable — NOT PRIMARY)
1. Practice Area Badges — PI, family, criminal, employment, immigration, business
2. Case Results — $2.5M recovered, custody won, charges dismissed
3. Legal Process — 4-step with icons
4. Why Choose Our Firm — no fee unless win, 24/7, track record, personal
5. Practice Areas Grid — 8 areas
6. Competitor Comparison — vs large corporate firms, 7 rows
7. Video Placeholder — "Meet Your Attorney"
8. Legal Help Quiz — accident/family/criminal/business
9. Google Reviews Header — stars + count
10. Free Consultation CTA — ShimmerBorder with trust badges
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Case Results Ticker** — animated counter showing "$X Million Recovered" with live counting animation (like mortgage calculator but for settlements). Specific dollar amounts in testimonials ("won $340K settlement") are 10x more convincing than generic praise.
  - **Practice Area Deep-Dive Accordions** — expandable cards for each practice area with detailed descriptions, common case types, and "Free Case Review" CTA per area. Interactive content keeps visitors on page longer.
  - **Consultation Scheduler** — interactive form with case type dropdown, urgency selector, preferred contact method. More sophisticated than a basic contact form.

**REAL ESTATE** (dark premium, uses `GOLD` variable — NOT PRIMARY)
1. Service Type Badges — buying, selling, investing, first-time, luxury, relocation
2. Market Stats — days on market, homes sold, avg price
3. Buying/Selling Process — 5-step journey
4. Why Choose This Agent — local expert, track record, full-service, negotiation
5. Areas We Serve — 8 neighborhoods grid
6. Competitor Comparison — vs online brokers, 7 rows
7. Video Placeholder — "See Our Featured Listings"
8. Buying or Selling Quiz — buy/sell/explore/invest
9. Google Reviews Header — stars + count
10. Free Home Valuation CTA — "What's Your Home Worth?"
- **BEAST MODE FEATURES (built in showcase, apply to generated sites too):**
  - **Property Search Bar** — interactive hero search with location/price/beds dropdowns. Centered hero layout (NOT left-aligned) breaks template pattern.
  - **Mortgage Calculator** — 3 range sliders (price/down payment/rate) with LIVE monthly payment calculation. Interactive features keep prospects engaged.
  - **Neighborhood Spotlight** — 4 cards with real local data (avg price, walk score, school rating). Shows local expertise.
  - **Auto-rotating Testimonial Carousel** — 5 reviews that rotate every 5 seconds with dot navigation. Specific dollar amounts in reviews ("negotiated $47K off") are more convincing than generic praise.
  - **Trust Bar** — horizontal stats strip immediately below hero. Numbers sell.

**FITNESS / MARTIAL ARTS** (high contrast dark theme)
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Class Schedule Grid** — interactive weekly schedule like the property search bar. Filter by class type (HIIT, Yoga, Strength, Boxing). Interactive engagement keeps visitors exploring.
  - **Membership Tier Comparison** — 3 pricing cards like mortgage calculator tiers. Basic/Premium/Unlimited with feature checkmarks and "Start Free Trial" CTAs.
  - **Transformation Gallery** — before/after carousel like the testimonial carousel. Auto-rotating success stories with specific results ("Lost 47 lbs in 6 months").
  - **BMI/Fitness Calculator** — interactive like the mortgage calculator. Enter height/weight, get result with recommended program. Interactive tools = longer time on page.

**MED SPA** (elegant dark/light theme)
- **BEAST MODE UPGRADE (learned from Real Estate):**
  - **Treatment Menu with Pricing** — interactive cards like property cards. Filter by category (Face, Body, Skin, Injectables). Each shows treatment name, duration, price range, and "Book Now".
  - **Before/After Slider** — interactive drag comparison for treatments (like smile slider for dental). Real results sell med spa services.
  - **Skin Quiz** — "What's Your Skin Concern?" interactive quiz like the buying/selling quiz. Acne/Aging/Pigmentation/Texture → recommended treatment → booking CTA.
  - **Provider Spotlight** — like Sarah Chen agent spotlight. Medical director with credentials, board certifications, years of experience. Trust is critical for medical procedures.

### Beast Mode Showcase Registry (built — reference for future category builds)

**#1 Real Estate — Puget Sound Realty** (1,432 lines)
- Theme: Dark luxury, gold `#b8860b` on `#09090b`
- Hero: Centered text + interactive property search bar (location/price/beds dropdowns)
- Unique: Mortgage calculator (3 sliders, live math), neighborhood spotlight with local data, draggable property gallery
- Testimonials: Auto-rotating carousel with dot navigation
- Layout lesson: Centered hero + interactive tool = modern premium

**#2 Dental — Emerald City Dental** (1,092 lines)
- Theme: Warm cream `#faf9f6`, teal `#0d9488`
- Hero: Split layout — text left, real smile photo right on light bg
- Unique: Before/after slider with real `/images/dental-before-after.png`, insurance carrier badges, "When was your last checkup?" quiz
- Testimonials: Staggered masonry grid (NOT carousel — different from RE)
- Layout lesson: Light theme proves range, insurance badges are huge for healthcare trust

**#3 Law Firm — Pacific Law Group** (1,151 lines)
- Theme: Dark navy `#0f172a`, emerald `#059669` + gold `#ca8a04`
- Hero: Full-width billboard — massive centered typography, Scale of Justice SVG watermark, case results ticker scrolling
- Unique: Case results ticker ($4.2M | $1.8M | Dismissed), practice area deep-dive accordions, 3 attorney profiles, "Arrested? Call Now" emergency banner
- Testimonials: Dark editorial, one-at-a-time with navigation
- Layout lesson: Bold typography + scrolling ticker = authority and power

**#4 Electrician — Cascade Electric Co.** (1,195 lines)
- Theme: Dark charcoal `#1a1a1a`, amber `#f59e0b` + blue `#3b82f6`
- Hero: Diagonal split with clip-path, lightning bolt SVG path-draw animation, pulsing 60-min emergency badge
- Unique: Emergency response pulsing strip, license number displayed 4 places, upfront transparent pricing, circuit board SVG background
- Testimonials: Alternating left/right layout
- Layout lesson: Diagonal clip-path hero feels industrial/modern, license numbers build trade credibility

**#5 Plumber — Emerald City Plumbing** (1,449 lines)
- Theme: Dark teal `#0f172a` with teal `#0d9488` + deep blue `#1e40af`
- Hero: Overlapping card layout — glass card with animated ripple border overlaps hero photo. Water drop SVG drip animation on left edge. 24/7 emergency pulsing badge.
- Unique: Water ripple animated border (conic-gradient rotation), floating water drop particles, "Honest Plumber Promise" (show problem first, can't fix = free), horizontal drag-scroll testimonials
- Testimonials: Horizontal drag-scroll (unique from all previous — carousel, masonry, editorial, alternating)
- Layout lesson: Overlapping card hero creates depth. "Honest promise" sections directly address trade industry trust fears. Each showcase should use a DIFFERENT testimonial layout.

**#6 Fitness — Iron & Oak Fitness** (1,203 lines)
- Theme: Pure black `#0a0a0a` with neon lime `#84cc16`
- Hero: Full-bleed photo + outlined "STRONGER" text (photo shows through letters, Nike-style)
- Unique: Interactive class schedule grid, membership tier toggle (monthly/annual), BMI calculator with program recommendation, transformation gallery with specific results
- Layout lesson: Outlined text hero feels like a premium athletic brand. Monthly/annual toggle adds interactivity.

**#7 Roofing — Summit Roofing NW** (1,970 lines)
- Theme: Dark charcoal `#111827` with brick red `#dc2626` + gold `#ca8a04`
- Hero: 50/50 split-screen (text left, real before/after photo right)
- Unique: Insurance claims 4-step timeline, premium materials with warranty specs, roof age quiz, real `/images/roofing-hero.png`, rain particles
- Layout lesson: Card stack testimonials create visual interest. Real before/after photos 10x more convincing.

**#8 Auto Repair — Pacific Auto Works** (1,374 lines)
- Theme: Dark `#111111` with red `#dc2626` + silver `#94a3b8`
- Hero: Scroll-driven parallax reveal (car image reveals as you scroll, text stays sticky)
- Unique: Vehicle types grid (domestic/import/european/diesel/hybrid), "Honest Mechanic Guarantee", specific dollar savings in testimonials ("saved me $2,400"), racing flag checker service cards
- Layout lesson: Scroll-driven parallax feels cinematic/automotive. Specific dollar savings in reviews are 10x more convincing.

**#9 Salon — Velvet Hair Studio** (1,053 lines)
- Theme: Warm cream `#faf8f5` with rose gold `#b76e79`
- Hero: Asymmetric editorial photo grid (3 overlapping photos like a fashion magazine)
- Unique: Stylist profiles with individual specialties, "What's Your Hair Vibe?" quiz, Pinterest masonry gallery, products badge row (Olaplex, Kerastase), elegant serif typography
- Layout lesson: Editorial mood board hero feels like Vogue. Quote-only minimal testimonials feel more luxurious than cards.

**#10 Landscaping — Cascade Landscapes** (1,196 lines)
- Theme: Dark forest `#0f1a0f` with green `#16a34a` + earth brown `#a3845b`
- Hero: Floating 3D cards over gradient (hover tilt perspective)
- Unique: Seasonal services calendar (Spring/Summer/Fall/Winter), eco-friendly/sustainability section, project portfolio with PNW neighborhood names, leaf SVG patterns
- Layout lesson: 3D tilt cards create depth. Seasonal calendar shows year-round value.

**#11 Church — Grace Community Church** (992 lines)
- Theme: Warm cream `#faf9f6` with amber `#d97706`
- Hero: Warm full-bleed community photo + golden overlay (Hillsong-style)
- Unique: Service times cards, "I'm New Here" first-timer section, upcoming events calendar, sermon archive with play buttons, community impact counters, give/donate section
- Layout lesson: Golden overlay = warmth/welcome. "I'm New Here" section directly addresses first-timer anxiety.

**#12 Vet — Northshore Vet Clinic** (935 lines)
- Theme: Warm green-cream `#f7faf8` with forest green `#16a34a` + rose `#e11d48`
- Hero: Scroll-driven parallax pet photo collage (5 overlapping pets at different scroll speeds)
- Unique: Pet types grid, fear-free section, wellness plan pricing tiers, pet-named testimonials (Bailey, Mochi, Spike), real `/images/vet-hero-dog.png` + `/images/vet-before-after.png`
- Layout lesson: Pet photo collage = instant emotional connection. Mentioning pets BY NAME in testimonials adds authenticity.

**#13 GC — Summit Builders NW** (1,137 lines)
- Theme: Dark `#1a2030` with amber `#d97706`
- Hero: Isometric/3D perspective tilt on construction photo
- Unique: Project investment guide ($15K/$35K/$75K+), 5-step vertical alternating build timeline, blueprint SVG grid pattern, construction beam decorations
- Layout lesson: 3D perspective tilt adds depth. Blueprint patterns = construction DNA.

**#14 Catering — Ember & Oak Catering** (1,200 lines)
- Theme: Warm dark `#1c1917` with copper `#c2703e`
- Hero: Split-screen with food photography (photo left, dark text right, copper divider)
- Unique: Tabbed sample menu (Appetizers/Mains/Desserts), event type cards, dietary accommodation badges, seasonal ingredient highlights, package pricing per person, chef spotlight with culinary credentials
- Layout lesson: Tabbed menu = restaurant sophistication. Per-person pricing is how catering is actually sold.

**#15 Pet Services — Happy Tails Pet Care** (2,231 lines)
- Theme: Warm cream `#faf8f5` with teal `#0d9488` + coral `#f97066`
- Hero: Animated card stack (3 fanned pet cards with hover-rotate)
- Unique: Pet type selector with tabbed interface, daily report card mock, safety badges (background checked, bonded, first aid), pricing per visit type
- Layout lesson: Card stack hero is playful/fun. Daily report card shows transparency.

**#16 Physical Therapy — Summit PT & Rehab** (1,094 lines)
- Theme: Warm cream `#faf9f6` with deep blue `#1e40af` + orange `#ea580c`
- Hero: Kinetic typography — "MOVE" outlines + "BETTER" slides in with spring
- Unique: Recovery timeline (3 phases), body map quiz (6 areas), insurance checker with carrier badges, conditions treated grid
- Layout lesson: Kinetic typography hero = dynamic/health-forward. Body map quiz is highly engaging.

**#17 Tutoring — Bright Minds Tutoring** (1,181 lines)
- Theme: White `#ffffff` with purple `#7c3aed` + yellow `#eab308`
- Hero: Typewriter text reveal — "Understanding" types letter-by-letter, "Clicks." springs in
- Unique: Grade level selector (interactive tabs), subject grid, success stories with score improvements (SAT 1180→1420), parent resources section
- Layout lesson: Typewriter hero = smart/modern. Specific score improvements are hugely convincing for education.

**#18 Med Spa — Radiance Med Spa** (1,222 lines)
- Theme: Dark `#0a0a0a` with blush `#f9a8d4` + gold `#d4a853`
- Hero: Morphing SVG blob with blush-to-gold gradient behind centered text
- Unique: Treatment menu with 4 filterable categories, skin concern quiz, membership tiers (Gold/Platinum), products we use badges, before/after transformations
- Layout lesson: Morphing blob = luxury beauty brand. Filterable treatment menu shows sophistication.

**#19 Appliance Repair — ProFix Appliance Repair** (1,094 lines)
- Theme: Dark `#111111` with orange `#f97316` + steel blue `#64748b`
- Hero: Cycling counter stats (15,000+ / 98% / 4.9 / 15 Years) with dot indicators
- Unique: 8 appliance services, 8 brands we service grid, appliance lifespan guide, common issues education section
- Layout lesson: Cycling counter hero = impressive stats without being static. Brand logos build trust for appliance work.

**#20 Junk Removal — CleanSlate Junk Removal** (1,162 lines)
- Theme: Dark `#111827` with green `#22c55e` + amber `#f59e0b`
- Hero: Before/after split wipe — cluttered garage wipes to reveal clean space
- Unique: Eco commitment (60% donated/30% recycled/10% landfill visual bars), truck-size pricing ($149/$249/$399), "What Needs to Go?" quiz, Why Not DIY section
- Layout lesson: Before/after wipe is satisfying to watch. Eco stats differentiate from competitors.

**#21 Carpet Cleaning — FreshStart Carpet Cleaning** (1,107 lines)
- Theme: Dark `#0f172a` with cyan `#06b6d4` + white
- Hero: Gradient text reveal — "FRESH START" fills from clean-white to dirty-brown, clean side expands on scroll
- Unique: Per-room pricing ($99/1, $179/3, $349/house), 24-hour dry guarantee, eco products section, carpet health facts, how-often-to-clean guide
- Layout lesson: Gradient text reveal is visually clever. Room-based pricing is how carpet cleaning is sold.

**#22 Event Planning — Elevate Events** (1,189 lines)
- Theme: Dark elegant `#0a0a0a` with gold `#d4a853` — the most luxurious
- Hero: Animated CSS bokeh/gala lights (6 shifting gradients + floating blur circles)
- Unique: 6 event types, venue partnerships (6 Seattle venues), day-of timeline, 100+ vendor network, limited availability ("24 events/year"), per-event pricing ($5K/$15K/$30K+)
- Layout lesson: Bokeh hero = walking into a gala. Limited availability creates exclusivity.

**#23 Accounting — Evergreen Tax & Advisory** (1,163 lines)
- Theme: Dark navy `#0f172a` with emerald `#059669` + gold `#ca8a04`
- Hero: Dashboard layout with animated financial metric cards
- Unique: Tax savings calculator, filing deadline countdown, document checklist tracker
- Layout lesson: Dashboard hero = trust through data visualization

**#24 Chiropractic — Align Chiropractic** (1,253 lines)
- Theme: Dark teal `#0c1a1a` with teal `#0f766e` + amber `#d97706`
- Hero: Spine alignment reveal (vertebrae animate from misaligned to aligned, healing pulse)
- Unique: "Where Does It Hurt?" body map quiz, spinal health self-assessment, comparison table (chiro vs medication), pain journey testimonials
- Layout lesson: Body map quiz is highly engaging for healthcare. Pain scale bars in testimonials = proof.

**#25 Cleaning — Crystal Clean Co.** (1,070 lines)
- Theme: Dark blue `#0a1520` with sky blue `#0284c7` + mint `#34d399`
- Hero: Rotating room cards (Kitchen/Bath/Living/Bed auto-cycle with task checklists)
- Unique: Instant estimate calculator (sliders + add-ons), eco commitment progress bars, 200% satisfaction guarantee, 3-tier pricing
- Layout lesson: Room cards = tangible preview of service. Live calculator = instant engagement.

**#26 HVAC — Summit Heating & Air** (1,574 lines)
- Theme: Dark navy `#0c1222` with blue `#0ea5e9` + orange `#f97316`
- Hero: Comfort gauge (animated thermostat SVG, needle 50°F→72°F comfort zone)
- Unique: Diagnostic quiz (5 symptoms → urgency), energy savings calculator, seasonal maintenance calendar, 3 maintenance tiers
- Layout lesson: Thermostat gauge = immediate industry recognition. Season-tagged reviews build year-round trust.

**#27 Insurance — Puget Sound Insurance Group** (1,282 lines)
- Theme: Dark navy `#0f172a` with blue `#1d4ed8` + emerald `#059669` + gold `#ca8a04`
- Hero: Shield protection layers (concentric rings expand, each labeled with coverage type)
- Unique: Coverage quiz, bundle savings calculator, "Are You Covered?" gap checker, independent agent comparison
- Layout lesson: Shield rings = visual safety. Coverage-grouped testimonial tabs keep reviews relevant.

**#28 Interior Design — Cascadia Interiors** (1,595 lines)
- Theme: Warm light `#faf9f6` with gold `#b8860b` + sage `#6b7f5e` (LIGHT THEME)
- Hero: Mood board collage (6 floating design swatches with tilt hover)
- Unique: Style quiz (Modern/Traditional/Bohemian/etc), budget estimator per room, color palette explorer
- Layout lesson: Light theme proves range from dark. Mood board hero = designer DNA. Georgia serif = luxury.

**#29 Moving — Cascade Movers** (1,259 lines)
- Theme: Dark `#111111` with orange `#f97316` + brown `#92400e`
- Hero: Moving truck journey (animated SVG truck on winding road, progress dots)
- Unique: Cost estimator (size+distance+add-ons), moving countdown with milestone tasks, truck size quiz
- Layout lesson: Journey visualization = emotionally resonant. Milestone countdown = practical value.

**#30 Pest Control — Evergreen Pest Solutions** (1,228 lines)
- Theme: Dark `#111827` with orange `#ea580c` + red `#ef4444` + green `#22c55e`
- Hero: Pest threat radar (rotating SVG sweep, pest dots eliminated)
- Unique: Pest identifier (8 types with danger levels), treatment estimator, seasonal pest calendar
- Layout lesson: Radar hero = protection/security feeling. Emergency strip with pulsing dot = urgency.

**#31 Photography — Cascade Lens Photography** (1,201 lines)
- Theme: Warm light `#faf9f7` with gold `#ca8a04` + cool slate `#64748b` (LIGHT THEME)
- Hero: Camera shutter reveal (6 SVG blades retract iris-style)
- Unique: Session builder (type+duration+add-ons), photography style quiz, gallery filter with categories
- Layout lesson: Shutter hero = photographer DNA. Polaroid-framed testimonials = on-brand. Light theme balances dark ones.

### Testimonial Layout Registry (never repeat within portfolio)
1. Real Estate → auto-rotating carousel with dot navigation
2. Dental → staggered masonry grid
3. Law Firm → dark editorial, one-at-a-time with navigation
4. Electrician → alternating left/right cards
5. Plumber → horizontal drag-scroll
6. Fitness → vertical timeline
7. Roofing → card stack (overlapping/fanned)
8. Auto Repair → split-screen (photo left + quote right, alternating)
9. Salon → quote-only minimal (large italic serif, no cards)
10. Landscaping → photo cards (project photo + quote overlay)
11. Church → story cards with photo backgrounds, mobile carousel
12. Vet → pet-named cards with paw print icons
13. GC → neighborhood-tagged cards
14. Catering → event-type tagged testimonials
15. Pet Services → pet-named cards with daily report style
16. Physical Therapy → body-map tagged reviews with recovery timelines
17. Tutoring → staggered columns with score improvement badges
18. Med Spa → auto-rotating carousel with treatment tags
19. Appliance Repair → brand-tagged review cards
20. Junk Removal → masonry with eco-impact badges
21. Carpet Cleaning → masonry with room-type tags
22. Event Planning → auto-rotating carousel with gold accents (grand finale)
23. Accounting → metric cards with revenue/tax impact numbers
24. Chiropractic → pain journey cards (before/after pain scale bars with % improvement)
25. Cleaning → checklist-style reviews (rooms cleaned as tagged badges per review)
26. HVAC → season-tagged reviews (Summer AC/Winter Furnace with dollar savings badges)
27. Insurance → coverage-grouped tabs (Auto/Home/Life tabs with claim savings)
28. Interior Design → room transformation cards (mini color palettes + budget ranges)
29. Moving → move summary cards (origin→destination neighborhoods, move type, time)
30. Pest Control → pest type + urgency cards (pest icon, urgency badge, response time)
31. Photography → photo session recap cards (session type, photos delivered, turnaround, polaroid frame)
ALL 31 TESTIMONIAL LAYOUTS ARE NOW USED. For future showcases, invent new ones.

### Hero Layout Registry (never repeat within portfolio)
1. Real Estate → centered text + interactive search bar
2. Dental → warm light split (text left, photo right)
3. Law Firm → full-width billboard + case results ticker
4. Electrician → diagonal clip-path split + lightning SVG
5. Plumber → overlapping card with ripple border + water drop SVG
6. Fitness → full-bleed photo + outlined "STRONGER" text (photo through letters)
7. Roofing → 50/50 split-screen (text left, before/after photo right)
8. Auto Repair → scroll-driven parallax reveal (car image reveals as you scroll)
9. Salon → asymmetric editorial photo grid (3 overlapping photos like mood board)
10. Landscaping → floating 3D cards over gradient (hover tilt perspective)
11. Church → warm full-bleed community photo + golden overlay
12. Vet → scroll-driven parallax pet photo collage (5 overlapping pets)
13. GC → isometric/3D perspective tilt on construction photo
14. Catering → split-screen with food photography (photo left, dark text right, copper divider)
15. Pet Services → animated card stack (3 fanned cards with hover-rotate)
16. Physical Therapy → kinetic typography ("MOVE BETTER" spring animation)
17. Tutoring → typewriter text reveal (letter-by-letter typing)
18. Med Spa → morphing SVG blob with gradient fill
19. Appliance Repair → cycling counter stats (numbers rotate with indicators)
20. Junk Removal → before/after split wipe (CSS clip-path animation)
21. Carpet Cleaning → gradient text reveal (clean-to-dirty fill expands on scroll)
22. Event Planning → animated CSS bokeh/gala lights (THE GRAND FINALE)
23. Accounting → dashboard hero with animated financial charts
24. Chiropractic → spine alignment reveal (vertebrae animate from misaligned → aligned, healing pulse travels)
25. Cleaning → rotating room cards (Kitchen/Bath/Living/Bed auto-cycle with task checklists)
26. HVAC → comfort gauge (animated circular thermostat SVG, needle sweeps 50°F→95°F→settles at 72°F)
27. Insurance → shield protection layers (concentric rings expand, each labeled with coverage type)
28. Interior Design → mood board collage (6 floating design swatches with tilt hover effects)
29. Moving → moving truck journey (animated SVG truck on winding road, progress dots light up)
30. Pest Control → pest threat radar (rotating radar sweep, pest dots flash red + get eliminated)
31. Photography → camera shutter reveal (6 SVG shutter blades retract iris-style revealing text)
ALL 31 HERO PATTERNS ARE NOW USED. For future showcases, invent new ones.

### Lessons Learned — Speed & Quality Checklist (follow this every time)

**Before building ANY template or showcase:**
1. `grep` the file for its color variable name FIRST (TEAL/ACCENT/PRIMARY/BLUE/ROSE/EMERALD/GOLD). Using the wrong one = build crash = hours wasted.
2. Check for `ACCENT` references in the mid-page CTA section — this is where the bug appears in EVERY template. Many templates have a mid-page CTA that was copy-pasted with `ACCENT` even though the template uses a different variable.
3. Verify ALL phosphor icon imports exist by checking `node_modules/@phosphor-icons/react/dist/ssr/{IconName}.es.js`. Icons that DON'T exist: `Faucet`, `Spray`, `CircleWavyCheck`, `SprayBottle` (use `Bathtub`, `Drop`, `SealCheck` instead).

**During builds:**
4. After EVERY template edit, run a braces balance check: `node -e "const c=require('fs').readFileSync('FILE','utf8'); console.log('Braces:',(c.match(/\{/g)||[]).length,'/',(c.match(/\}/g)||[]).length)"`. Unbalanced braces = build crash.
5. Never use `initial={{ opacity: 0 }}` on preview templates (CLAUDE.md rule). Showcases CAN use it.
6. When making the row a drop target or adding event handlers to JSX, always close the opening tag with `>` before adding children. Missing `>` after `onDrop={...}` crashed the build twice.

**For image management:**
7. Scraped photos often include logos, SVG design files, button graphics, and data URIs. ALWAYS filter these out before using as gallery/hero images. Check for: `.svg`, `data:`, `Group-`, `logo`, dimensions < 100px.
8. When patching photos via the API, the generate endpoint will OVERWRITE them unless they contain `/images/` local paths (smart merge protects those).
9. Every real before/after photo from Ben goes in `/public/images/` with a descriptive name and gets referenced in CLAUDE.md.

**For data enrichment:**
10. Always PATCH enriched data THEN regenerate — not the other way around. The scraper can overwrite PATCHed services/about/tagline if you regenerate first (smart merge helps but isn't perfect).
11. About text MUST mention the owner by name + city. "Is a [category] business serving [address]" is unacceptable.
12. The generator's `content-brief.ts` auto-generates about text. It filters street addresses now, but always verify the output isn't robotic.

**For Vercel deploys:**
13. After pushing, check Vercel dashboard if previews don't update. A single JSX syntax error in ANY template blocks ALL deploys — not just that template.
14. Force redeploy from Vercel dashboard if the deploy ID hasn't changed after 3+ minutes.
15. The deploy ID is embedded in the page HTML (`dpl_XXXXX`). Compare before/after pushing to verify a new build went live.

**For the portfolio showcases:**
16. Each showcase MUST have a unique hero layout AND a unique testimonial layout. Check the registries above before building.
17. Showcase pages are at `/v2/[category]/page.tsx`. Preview templates are at `/components/templates/V2[Category]Preview.tsx`. They are DIFFERENT files with DIFFERENT purposes.
18. Showcases can use `initial={{ opacity: 0 }}` animations. Preview templates CANNOT.
19. Every showcase needs realistic PNW addresses, phone numbers starting with (206) or (425), and real Seattle neighborhood names.
20. Real photos from Ben (in `/public/images/`) should be used over Unsplash stock whenever available. They're 10x more convincing.

### Portfolio Showcase Design Principles (learned from Beast Mode builds)
- **NO two showcase sites should share the same hero layout.** If real estate has centered text + search bar, dental should have split layout, law firm should have full-bleed video bg, etc.
- **Every showcase needs 2-3 INTERACTIVE features** unique to that industry. Static content = template. Interactive content = custom build.
- **Specific numbers > generic praise.** "$47K negotiated off" beats "great negotiator". "Lost 47 lbs" beats "amazing results". "98% satisfaction" beats "highly rated".
- **Auto-rotating elements add life** without requiring user interaction. Testimonial carousels, stat counters, and subtle animations make the page feel alive.
- **Centered hero + search/calculator = modern.** Left-aligned hero + side image = 2020. The hero layout is the first thing prospects see — it must feel current.
- **Trust bar immediately below hero.** Don't make visitors scroll to find credibility signals. Numbers + badges right after the hero.
- **Light vs dark themes prove range.** Showing BOTH warm light (dental) and dark luxury (real estate) in the portfolio proves we don't just do one look. Alternate themes across showcases.
- **Staggered masonry testimonials feel organic** vs carousel feeling automated. Use masonry for warm/friendly categories, carousel for premium/luxury.
- **Every interactive feature should feel like a mini-app.** Calculators with live updating prices, quizzes with progress bars and scored results, and filtering galleries with smooth AnimatePresence — these differentiate from static templates.
- **Animated SVG heroes are the most memorable.** Spine alignment, radar sweeps, comfort gauges, camera shutters, moving trucks — SVG heroes that tell the industry's story visually outperform photo-based heroes.
- **Light themes (Interior Design, Photography) prove design range.** At least 2-3 light-themed showcases among the 31 shows prospects we don't just do "dark mode everything."
- **Industry-specific data in testimonials > generic star reviews.** Pain scales for chiro, rooms cleaned for cleaning, season tags for HVAC, pest types for pest control, move details for moving — these make reviews feel real and specific.
- **Comparison tables sell the decision.** Chiro vs medication, independent vs captive agent, professional vs DIY, our company vs competitors — these help visitors decide, not just browse.
- **Parallel agent builds at 5-10x speed.** Delegating showcase builds to sub-agents while tracking from main context cuts total time dramatically. Always verify braces balance after agent writes.
- **Pre-flight checklist before every showcase: (1) check template color variables, (2) check hero/testimonial registries for unused patterns, (3) plan 2-3 interactive features, (4) verify braces after write, (5) confirm no build errors.**
- **Insurance/carrier badges are HUGE trust signals** for healthcare categories. People's first question: "do you take my insurance?" Show this prominently.
- **Before/after with REAL photos** (not stock) are 10x more convincing. Use Ben's real before/after images where available (`/images/dental-before-after.png`, `/images/roofing-before-after.jpg`, `/images/vet-before-after.png`, `/images/interior-design-before-after.jpg`).
- **Comfort/anxiety sections sell healthcare categories.** "We know dental anxiety is real" / "fear-free veterinary" / "gentle physical therapy" directly addresses the #1 objection.

### Minimum Template Quality Standards (NON-NEGOTIABLE)
Every V2 preview template MUST meet these minimums before being considered production-ready:
- **800+ lines minimum** — anything under 800 lines is a stub, not a template
- **15+ sections minimum**: Nav, Hero, Stats, Services, About, Process, Pricing (3 tiers), Comparison Table, Testimonials (with Google Reviews header), FAQ, Contact Form, Service Area, CTA Banner, Video Placeholder, Footer
- **1+ interactive feature**: quiz, calculator, filter tabs, or accordion — static content only = template, not premium
- **Category-specific features**: every template must have 2-3 features unique to that industry (dental: insurance badges + smile quiz, electrician: emergency strip + license display, etc.)
- **All 10 universal premium features present**: trust badges, Google Reviews header, enhanced testimonials, comparison table, pricing tiers, video placeholder, interactive quiz/calculator, urgency element, certifications row, service area
- **bg-black/70 hero overlay** (or appropriate for light themes)
- **BluejayLogo in footer** — imported and rendered
- **No `initial={{ opacity: 0 }}`** on any element (banned on preview templates)
- **Stock image pools** using `pickFromPool()`/`pickGallery()` — no single hardcoded URLs
- **Template audit grades**: A = 1000+ lines, B = 800-999 lines. No Grade C (under 800) allowed in production.

### Continuous Improvement Rule (MANDATORY after every site build)
After working on ANY website (generating, enriching, reviewing, or fixing a prospect site), you MUST:
1. **Identify what made this site better or more premium** — new section layout, better copy pattern, improved image placement, stronger CTA, smarter service card design, etc.
2. **Apply that improvement to the V2 template** for that category if it's not already there — this ensures ALL future sites in that category automatically get the upgrade
3. **Check if the improvement applies to other categories too** — if a dental site got a great "comfort/anxiety" section, check if chiropractic, PT, and med-spa templates should get the same pattern
4. **Update CLAUDE.md** if it's a new design principle or pattern worth preserving
5. **Never improve a single site without improving the template** — one-off fixes are wasted work. Template improvements compound across every future prospect.

### Before/After Image Rules (NON-NEGOTIABLE)
**Before/after images are NEVER scraped.** They always use our own placeholder images from `/public/images/` until the client buys and provides real photos. This is a hard rule.

**Available before/after images (local, in `/public/images/`):**
- `dental-before-after.png` — smile transformation (broken → fixed)
- `roofing-before-after.jpg` — roof transformation (damaged → repaired)
- `vet-before-after.png` — pet grooming transformation
- `carpet-before-after.png` — carpet stain removal
- `interior-design-before-after.jpg` — kitchen renovation
- `landscaping-before-after.png` — yard transformation
- `medspa-before-after-1.png` — skin rejuvenation
- `medspa-before-after-2.png` — facial contouring
- `medspa-before-after-3.png` — anti-aging treatment

**Rules for before/after sections:**
1. **NEVER use scraped photos (data.photos) for before/after.** Scraped photos are random Google Places images — they're not before/after pairs. Only use `/images/` local files or curated Unsplash pairs.
2. **Combined images (single file with before+after side by side) are fine** — they render as one image with labels. This is the simplest approach.
3. **Slider effects need TWO separate image files** — one for the "before" state, one for the "after" state. Both must be contextually correct (e.g., dental: cracked teeth → perfect smile, NOT two random photos).
4. **Context must match the category exactly:**
   - Dental: damaged/stained smile → bright healthy smile
   - Roofing: damaged/old roof → new installed roof
   - Landscaping: overgrown/bare yard → manicured landscape
   - Carpet: stained/dirty carpet → clean fresh carpet
   - Painting: peeling/faded paint → fresh painted surface
   - Pressure washing: grimy driveway/deck → sparkling clean
   - Med spa: skin concerns → treated/rejuvenated skin
   - Junk removal: cluttered space → clean empty space
5. **If a category doesn't have a local before/after image yet, DON'T fake it.** Label the section "Our Results" or "Recent Transformations" instead of "Before & After". Only call it before/after when you have a real transformation pair.
6. **After a client buys, their real before/after photos replace our placeholders** via the image mapper tool. The template uses the same image slot — we just swap the file.
7. **Categories that SHOULD have before/after:** dental, roofing, veterinary, carpet-cleaning, med-spa, landscaping, interior-design, junk-removal, painting, pressure-washing, cleaning, auto-repair, salon (hair transformations)
8. **Categories that should NOT have before/after:** law-firm, accounting, insurance, real-estate, photography, church, daycare, tutoring, restaurant

### Hero Text Visibility Rules (NON-NEGOTIABLE)
- **Every hero with a background image MUST have bg-black/70 or stronger overlay.** The weak gradient `from-black/60 via-black/30 to-black/10` is BANNED — it leaves the right side of the hero nearly transparent on desktop and the entire hero unreadable on mobile.
- **NEVER use `from-white/80` gradient on a dark-text hero.** This fights the dark overlay and makes text invisible. Use `from-black/40 via-transparent to-black/20` instead.
- **Hero about/description text over images must be `text-white/80` with `textShadow: "0 1px 8px rgba(0,0,0,0.6)"`.** Never use `text-slate-400` over a photo — it's invisible on busy backgrounds.
- **Light-theme heroes (Dental, Vet, Interior Design, Photography) use dark text on white/cream backgrounds** — these don't need overlays, but verify contrast is adequate.
- **Test on mobile.** Hero images look different on mobile (portrait crop, different focal point). The overlay must be strong enough that text is readable regardless of what part of the image is visible.

### Image Context Rules (learned from full audit — NON-NEGOTIABLE)
- **Every stock image must match the business category.** A kitchen photo on a plumber template is wrong. A living room on a roofing template is wrong. A wheat field on a tree service is wrong. If you can't tell what industry the photo belongs to, it's wrong.
- **No generic "modern home interior/exterior" photos** unless the category is interior design, real estate, or general contractor. These luxury home shots are the #1 offender — they look great but say nothing about the business.
- **No recycled headshots across categories.** If a person photo appears in one showcase/template, it CANNOT appear in any other. Prospects browse multiple categories — seeing the same "founder" across 6 businesses kills trust instantly.
- **Dental office photos can ONLY be used on dental pages.** A dental chair appearing on a vet clinic, med spa, or PT page is an instant credibility killer.
- **Stock photo inline comments must match what the photo actually shows.** Several templates had comments like "// moving boxes" next to photos of bathrooms and kitchens. When updating stock pools, verify the photo matches the comment.
- **When components don't forward style props, the style is silently dropped.** Always check that custom components (SpringButton, MagneticButton, etc.) accept AND forward the `style` prop. The salon CTA was invisible because SpringButton ignored the `style={{ background: ROSE }}` prop.
- **Run image context audit after every bulk image replacement.** Unsplash photo IDs don't describe their content — always verify what the photo actually shows before using it.
- **Footer and nav links must point to real pages.** The `/templates` footer link was a 404 for months. Check all navigation links actually resolve.

### Theme Pairing Guide (for generated sites AND showcases)
When building sites, match theme to industry vibe:

| Theme | Background | When to use | Categories |
|-------|-----------|-------------|-----------|
| **Warm Light** | `#faf9f6` cream | Friendly, approachable, family | Dental, Vet, Daycare, Church, Tutoring, PT |
| **Dark Luxury** | `#09090b` near-black | Premium, high-end, aspirational | Real Estate, Law Firm, Med Spa, Photography |
| **Dark Professional** | `#111827`/`#1a1a1a` | Trades, reliability, trust | Roofing, HVAC, Electrician, Plumber, Auto, GC, Moving |
| **Soft Elegant** | `#fefefe` white | Creative, stylish, visual | Salon, Interior Design, Event Planning, Florist |
| **Bold Energy** | `#0a0a0a` pure black | Power, intensity, motivation | Fitness, Martial Arts, Tattoo |

### Typography Pairing Guide (NON-NEGOTIABLE for all generated sites + showcases)
Every site MUST use the correct Google Fonts pairing for its category. Heading font is for h1/h2/h3 tags + nav branding. Body font is for paragraphs, descriptions, and UI text.

**How to implement:** Add this to the template's `<head>` or layout:
```html
<link href="https://fonts.googleapis.com/css2?family={HeadingFont}:wght@400;600;700;800&family={BodyFont}:wght@300;400;500;600&display=swap" rel="stylesheet" />
```
Then set `font-family` via Tailwind or inline styles on headings and body.

| Category | Heading Font | Body Font | Why |
|----------|-------------|-----------|-----|
| **dental** | DM Serif Display | DM Sans | Warm serif says "we care" without being stuffy — modern enough for young families |
| **veterinary** | DM Serif Display | DM Sans | Same warmth as dental — pet owners respond to approachable, friendly type |
| **daycare** | Nunito | Lato | Rounded, soft, playful — feels safe and kid-friendly |
| **church** | Merriweather | Lato | Classic serif conveys tradition and trust without being cold |
| **tutoring** | Merriweather | Open Sans | Academic authority with clean readability for parents |
| **physical-therapy** | Merriweather | Lato | Medical credibility with warmth — not clinical, not casual |
| **law-firm** | EB Garamond | Source Sans Pro | Traditional serif = authority and gravitas, body stays clean |
| **accounting** | Crimson Pro | Inter | Professional serif for trust, modern sans for data-heavy content |
| **insurance** | Libre Baskerville | Open Sans | Established, trustworthy serif paired with friendly body text |
| **real-estate** | DM Serif Display | DM Sans | Luxury-adjacent but not pretentious — works for $300K and $3M listings |
| **med-spa** | Cormorant Garamond | Jost | Elegant thin serif = beauty/luxury, geometric body = clinical precision |
| **salon** | Cormorant Garamond | Raleway | Fashion-forward serif with airy geometric body — feels like Vogue |
| **interior-design** | Cormorant Garamond | Montserrat | Refined taste meets clean modern — editorial design magazine feel |
| **photography** | Playfair Display | Raleway | Editorial serif for portfolio gravitas, light body for image-first layouts |
| **florist** | Playfair Display | Raleway | Romantic serif pairs perfectly with floral/botanical aesthetics |
| **event-planning** | Cormorant Garamond | Raleway | High-end elegance for weddings and galas |
| **fitness** | Bebas Neue | Open Sans | Bold condensed impact for energy, clean body for readability |
| **martial-arts** | Oswald | Nunito Sans | Strong condensed heading with friendly body — discipline + approachability |
| **tattoo** | Archivo Black | Archivo | Heavy bold heading with matching body — industrial edge, no frills |
| **electrician** | Space Grotesk | Inter | Technical modern feel — smart, capable, current |
| **plumber** | Space Grotesk | Inter | Same tech-forward feel — trades should look modern, not dated |
| **hvac** | Space Grotesk | Inter | Consistent with electrical/plumbing — modern trades branding |
| **roofing** | Barlow Condensed | Barlow | Sturdy condensed heading = construction strength, clean body |
| **auto-repair** | Barlow Condensed | Barlow | Automotive industry standard — strong, mechanical, trustworthy |
| **general-contractor** | Barlow Condensed | Barlow | Construction authority — matches roofing/auto for trade consistency |
| **landscaping** | Raleway | Lato | Light, airy heading for outdoor/nature feel, friendly body |
| **cleaning** | Poppins | Poppins | Clean, rounded, modern — literally looks "clean" |
| **carpet-cleaning** | Poppins | Poppins | Same clean feel as general cleaning — brand consistency |
| **pressure-washing** | Barlow Condensed | Barlow | Power/industrial feel matching other trade categories |
| **pest-control** | Space Grotesk | Inter | Technical/scientific credibility for pest treatment |
| **moving** | Barlow Condensed | Barlow | Strong, capable heading for heavy-lifting industry |
| **junk-removal** | Barlow Condensed | Barlow | Same industrial strength as moving — consistent trades feel |
| **tree-service** | Barlow Condensed | Barlow | Outdoor trades — matches landscaping-adjacent categories |
| **painting** | Raleway | Lato | Creative/artistic heading for visual transformation business |
| **fencing** | Barlow Condensed | Barlow | Construction trade — matches GC, roofing |
| **garage-door** | Space Grotesk | Inter | Technical service — matches electrician/plumber |
| **locksmith** | Space Grotesk | Inter | Security/technical — modern and trustworthy |
| **towing** | Oswald | Nunito Sans | Bold urgency heading for emergency service |
| **construction** | Barlow Condensed | Barlow | Core construction trade font |
| **catering** | Playfair Display | Lato | Food industry elegance — upscale but readable for menus |
| **restaurant** | DM Serif Display | DM Sans | Warm, inviting serif for dining — not too formal |
| **pet-services** | Nunito | Nunito Sans | Soft, rounded, playful — pet owners love friendly type |
| **pool-spa** | Raleway | Lato | Resort/relaxation feel — light and breezy |
| **medical** | Libre Baskerville | Open Sans | Clinical authority with accessible body text |
| **appliance-repair** | Space Grotesk | Inter | Technical service matching other repair categories |

**Rules:**
- ALWAYS use the pairing from this table. No exceptions, no improvising.
- Both fonts must be loaded from Google Fonts in the template
- Heading font: h1, h2, h3, nav logo text, CTA buttons
- Body font: paragraphs, descriptions, form labels, footer text, stat labels
- Font weights: headings use 600-800, body uses 300-500
- It's fine if multiple categories use the same pairing — consistency within industry clusters is intentional
| **Warm Dark** | `#1c1917` charcoal | Inviting, cozy, appetite | Restaurant, Catering |

### Cross-Category Feature Patterns (apply learnings across similar industries)

**Healthcare family** (dental, vet, chiropractic, PT, med spa):
- Patient/pet comfort section addressing anxiety — MANDATORY
- Insurance/payment badges — show carrier names prominently
- Before/after with real photos when available
- Provider spotlight with credentials (DDS, DC, DVM, MD)
- "When was your last visit?" interactive quiz
- New patient/client special banner with pricing

**Trades family** (roofing, HVAC, electrician, plumber, auto, GC):
- Honesty/transparency guarantee section — MANDATORY (people fear getting ripped off)
- Upfront pricing cards — show actual price ranges
- License/bond/insurance display — show actual numbers
- "What do you need?" diagnostic quiz
- Emergency service pulsing indicator
- Competitor comparison vs DIY/handyman/dealership

**Professional services** (law, insurance, accounting, real estate):
- Case results/savings with specific dollar amounts
- Interactive calculators (mortgage, tax savings, settlement estimator)
- Credential badges and professional associations
- "What help do you need?" intake quiz
- Free consultation CTA with urgency
- Agent/attorney spotlight with full bio

**Lifestyle/beauty** (salon, med spa, photography, fitness, interior design):
- Style/type quiz ("What's your style?" / "What service?")
- Portfolio/gallery as the hero feature — visuals sell
- Stylist/trainer/designer profiles
- Pricing menu with tiers
- Before/after transformation showcase
- "Now Booking" limited availability CTA

**CATEGORIES NOT YET BUILT** (use the 10 universal features + adapt from similar):
- Restaurant → unique: menu section with categories, reservation CTA, food gallery, chef spotlight
- Catering → unique: event type cards, menu packages, dietary options filter
- Pet Services → unique: pet type cards, boarding calendar, grooming packages
- Physical Therapy → unique: condition cards, recovery timeline, insurance checker
- Tutoring → unique: subject grid, tutor profiles, scheduling calendar
- Church → unique: service times, sermon archive, community events calendar
- Tattoo → unique: style gallery, artist profiles, booking with deposit
- Towing → unique: coverage map, response time, vehicle type selector
- All others → use the 10 universal features as baseline

**CRITICAL BUILD NOTE — COLOR VARIABLE NAMES:**
Each template uses a DIFFERENT color variable name. Using the wrong one crashes the entire Vercel build. Always read the file first and check:
- Dental: `TEAL` | Roofing: `ACCENT` | Vet: `PRIMARY` | Moving: `ACCENT`
- Pest Control: `ACCENT` | Cleaning: `ACCENT` | Interior Design: `PRIMARY`
- Photography: `GOLD` | Insurance: `ACCENT` | Accounting: `ACCENT`
- Chiropractic: `PRIMARY` | Auto Repair: `ACCENT` | GC: `ACCENT`
- HVAC: `BLUE` | Electrician: `ACCENT` | Plumber: `TEAL`
- Salon: `ROSE` | Landscaping: `PRIMARY` | Law Firm: `EMERALD` | Real Estate: `GOLD`

### Copy Quality Rules (NON-NEGOTIABLE)
- **NEVER include street addresses in about/hero copy.** The about text should mention the CITY name only, never "123 Main St Suite 204". Street addresses belong in the contact section and footer only. Filter out any string containing 3+ digits, "suite", "unit", "#", or full addresses.
- **NEVER truncate text mid-word or mid-sentence.** All visible copy must end at a natural sentence boundary. "Th..." or "the K..." is unacceptable. Use sentence-boundary slicing: find the nearest period after 80 chars.
- **NEVER use generic filler copy.** "is a [category] business serving [city] and [full address]" is template garbage. Write copy that sounds human: mention the owner by name, their philosophy, years in business, or what makes them unique.
- **About text must read like a human wrote it.** First person ("we", "our") or warm third person ("Led by Dr. Smith"). Never robotic third person ("The business is a dental business serving...").
- **Hero subtitle must be a COMPLETE thought.** No trailing "...", no cut-off sentences. If the full about text is too long, write a shorter version — don't just slice it.

### Implementation Rules
- **Use existing shared components** — `GlassCard`, `MagneticButton`, `ShimmerBorder`, `SectionHeader` from within the template
- **Use `@phosphor-icons/react`** for all icons — never emoji, never Font Awesome
- **Data constants** (comparison rows, materials, insurance steps) go at the top of the file with other constants
- **Section backgrounds** must match the template theme (light cream for dental/vet, dark charcoal for trades)
- **Mobile responsive** — all grids collapse to 1-column on mobile, all text readable at 375px
- **No framer motion `initial={{ opacity: 0 }}`** on any premium feature — content renders immediately
- **NEVER truncate hero text with "..."** — The about text on the hero must be a COMPLETE sentence. Don't slice at 160 chars and add "...". A hero that says "We proudly serve Maple Valley a..." looks broken. Either show a full 1-2 sentence excerpt or write a dedicated hero subtitle. Use `.slice(0, text.indexOf('.', 80) + 1)` to cut at the nearest sentence boundary instead of a hard character limit.


---

