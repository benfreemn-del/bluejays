/**
 * Per-category pain points for the audit prompt.
 *
 * Pre-fix the audit prompt was a single generic template with `{category}`
 * substitution — the AI saw the vertical name but no industry-specific
 * instincts, so dental and plumber audits read interchangeably.
 *
 * This file flips that. Each category gets:
 *   - 5 Hormozi-tone hero pain points (money-leak forward, "you" voice,
 *     3rd-grade reading level per Rule 61)
 *   - 1-2 category-specific tech-side findings (optional)
 *
 * Lookup is pure — no DB call. The pain points are SUGGESTIONS, not a
 * forced checklist (Q3B locked design): the AI picks the 2-3 most
 * relevant to what it actually sees on the prospect's site, and falls
 * back to its general instincts when none apply.
 *
 * "general" catch-all (Q5B locked design) reuses plumber pain points —
 * trades/service-business pain (urgency, transparency, after-hours) is
 * the broadest universal-SMB pattern. When scout volume data emerges
 * showing a different most-scouted vertical, swap the alias.
 */

export interface CategoryPainPoints {
  /** 5 Hormozi-tone hero pain points. AI picks 2-3 most relevant per audit. */
  heroPainPoints: string[];
  /** 1-2 category-specific tech-side findings to check. Optional. */
  techPainPoints?: string[];
}

// ─── Per-category pain points (5 verticals shipped in this commit) ───
// Remaining 41 categories filled in the follow-up commit.

const PLUMBER_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No after-hours / 24-7 number on the hero. The 2am burst pipe is your highest-margin job. Whoever shows up first wins it. You don't.",
    "No service-area map or city list. Caller asks 'do you come to Tacoma?' Site doesn't say. They hang up and try the next plumber.",
    "No upfront pricing — not even a 'service call $99'. Homeowners hate 'we'll give you a quote'. They bounce to whoever shows the number.",
    "License + bond number not visible anywhere. Every plumber claims 'licensed and insured'. Show the actual number — it closes the trust.",
    "Hero photo is a stock wrench. Your truck, your guy in a uniform, the actual job site = real. Stock = fake. Fake loses the call.",
  ],
  techPainPoints: [
    "No LocalBusiness or Plumber schema markup. Google's local pack picks the plumber it can parse first. You're invisible.",
    "Phone number isn't a tap-to-call link. On mobile that's an extra 3 taps. Most people don't bother.",
  ],
};

const DENTAL_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Accepting New Patients' badge on the hero. Phone rings but the chair sits empty because nobody knows you have room.",
    "Insurance carriers not visible. Every visitor's first question is 'do you take my plan?' If they have to call to ask, half hang up.",
    "No emergency / same-day callout. The broken tooth at 8am goes to whoever shows it on the homepage. Right now that's not you.",
    "Google reviews + star count buried below the fold. 4.9 stars across 240 reviews is your closer. Hide it, lose half the new patients.",
    "No before/after smile gallery. Your work IS the proof. People scroll Instagram before they call. Give them something to land on first.",
  ],
  techPainPoints: [
    "No Dentist or LocalBusiness schema. Google can't tell you're a dentist; you don't show in 'dentist near me'.",
    "No HIPAA-compliant contact form. If you're collecting patient info via a generic form, you're one OCR audit away from a fine.",
  ],
};

const SALON_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Book Now' button on the hero. Phone tag kills bookings. Every chain salon has a calendar. You don't.",
    "No stylist profiles. Clients pick a stylist before a salon. Without faces + specialties, every visitor is a coin flip.",
    "No price menu. 'Call for pricing' makes them call. Calling makes them not. Most don't.",
    "Hair gallery is stock photos, not your actual work. They Instagram-check you in 3 seconds. They find nothing. They scroll past.",
    "No new-client special. The wavering shopper needs a hook. '20% off your first visit' closes the deal before they second-guess.",
  ],
  techPainPoints: [
    "Instagram embed loading at top kills mobile speed. Push it down or lazy-load — every second past 2 = 20% bounce.",
    "No HairSalon schema markup. You're a beauty salon to Google's eyes only if the markup says so.",
  ],
};

const REAL_ESTATE_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No featured listings on the hero. Visitor wants houses. You're showing 'About Us'. They go to Zillow.",
    "Phone number not pinned in the nav. Every other agent on the SERP has it pinned. They tap that, not yours.",
    "No 'What's my home worth?' tool. The seller capture hook of the decade. You don't have it. Sellers go to Redfin.",
    "Agent bio reads like a brokerage page. Buyers pick a person, not a brokerage. Show the human or lose to whoever does.",
    "No neighborhood pages. Local SEO dies without them. Buyer trust dies without them. Both at the same time.",
  ],
  techPainPoints: [
    "IDX feed not loading or slow. No listings = no SEO. No SEO = no organic buyer traffic.",
    "No RealEstateAgent schema. Google's knowledge panel can't show your specialty + service area without it.",
  ],
};

const RESTAURANT_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "Menu is hidden behind a PDF. Google can't read PDFs. Phone users don't click them. You lose both.",
    "No reservation button. 'Call to book' loses every visitor under 35. They go to the place with the OpenTable button.",
    "Hours of operation not on the hero. 'Are you open right now?' is the #1 question. No answer = they pick somewhere else.",
    "No food photography — your dishes look like stock soup. The menu is your sales pitch. Make it real, make it yours.",
    "No address + map link. They pick the next restaurant whose address is one tap from a Google Maps direction.",
  ],
  techPainPoints: [
    "No Restaurant schema with cuisine type + price range. Google's restaurant knowledge panel skips you entirely.",
    "Menu PDF kills SEO. Convert to HTML — every dish becomes a search-able page that ranks for '{dish} near me'.",
  ],
};

// ─── Trades ──────────────────────────────────────────────────────────

const ELECTRICIAN_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 24-7 emergency callout. The 11pm 'no power' call goes to whoever answers first. You're not the first.",
    "License + bond number not visible. Anyone can claim 'licensed'. Show the actual number — it closes the trust.",
    "No upfront pricing — not even 'service call $99'. Homeowners hate quotes by phone. They bounce.",
    "Generic stock photo of wires. Your truck, your guy on a ladder = real. Stock = fake. Fake loses the call.",
    "No before/after of panel upgrades or new builds. Your work is the proof. Hide it, lose the close.",
  ],
  techPainPoints: [
    "No ElectricalContractor or LocalBusiness schema. Google's local pack picks the electrician it can parse first.",
    "Phone number isn't tap-to-call on mobile. Extra 3 taps = most people don't bother.",
  ],
};

const HVAC_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No '24/7 emergency' callout. The 95-degree day broken AC call is your highest-margin job.",
    "No financing options shown. A new system is $5K-$15K. Visitors leave when they don't see a payment plan.",
    "License + EPA refrigerant cert not visible. Trust signals trade owners actually care about.",
    "No service area or city list. 'Do you serve Renton?' makes them call to ask. They don't.",
    "Stock photo of a thermostat. Your van, your tech, your install = real.",
  ],
  techPainPoints: [
    "No HVACBusiness schema markup. Google can't tell you do HVAC vs general repair.",
    "No LocalBusiness with serviceArea. Mobile 'near me' search ignores you.",
  ],
};

const ROOFING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free estimate' CTA on the hero. Roofing is a quote-driven sale. No quote button = no leads.",
    "No insurance claims callout. Storm damage = whoever answers first wins. You're silent.",
    "License + GAF or Owens Corning cert badges missing. Manufacturer credentials close the deal.",
    "No before/after photos of recent jobs. Your work is the closer. Stock is the killer.",
    "Service area buried. 'Do you cover Tacoma?' too hard to find = next roofer.",
  ],
  techPainPoints: [
    "No RoofingContractor schema. Local pack misses you.",
    "Big before/after images not lazy-loaded. Mobile load times tank, bounce rate spikes.",
  ],
};

const AUTO_REPAIR_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'we honor your warranty' callout. Half the buyers think dealer-only is required. Tell them otherwise.",
    "No price ranges per service. 'Call for quote' loses every visitor under 40.",
    "No ASE-certified or AAA badges. Trade certs close trade work.",
    "Stock photo of a wrench. Your bay, your team, your shop = real.",
    "No service area + parking note. They want directions, not 'Contact Us'.",
  ],
  techPainPoints: [
    "No AutoRepair schema. Google can't surface your specialties.",
    "No AggregateRating schema for the star pull on the SERP.",
  ],
};

const GENERAL_CONTRACTOR_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free estimate' CTA. GC work = quote-driven; without it = lost lead.",
    "License + bond + insurance numbers missing. Whole-home work = trust signals matter.",
    "Specialties not split (kitchens, baths, additions, new builds). Each = different keyword.",
    "No before/after of recent projects. Visual proof closes the close.",
    "No client testimonial videos. GC work is high-trust; written quotes feel fake.",
  ],
  techPainPoints: [
    "No GeneralContractor schema. Local pack misses high-ticket searches.",
    "Project gallery not lazy-loaded. Mobile speed score tanks.",
  ],
};

const PAINTING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free color consultation' hook. Painting = decision-laden; consult closes.",
    "License + insurance not visible. Strangers-on-my-property trust signal.",
    "No before/after photos. Painting = pure visual sale; without photos, lose.",
    "Specific services not split (interior, exterior, cabinet, deck). Each = different search.",
    "Generic stock paint photos. Your actual jobs close — stock kills.",
  ],
  techPainPoints: ["No PaintingContractor schema. Image-heavy site needs lazy-loading."],
};

const FENCING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free estimate' hook. Fencing = quote-driven sale.",
    "License + insurance not visible. Property work needs bonded contractor.",
    "No material/style split (wood, vinyl, chain-link, privacy, decorative). Each = search.",
    "No before/after of installs. Visual proof closes.",
    "Service area + city list missing. 'Do you cover Renton?' buried = lost lead.",
  ],
  techPainPoints: ["No FencingContractor schema. Image-heavy needs lazy-loading."],
};

const TREE_SERVICE_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'emergency 24-7' callout. Tree-on-my-house storm work = whoever answers first wins.",
    "License + insurance + ISA-certified arborist not visible. Trust signal critical for property work.",
    "No specific services (removal, pruning, stump grinding, emergency). Each = search.",
    "No before/after of large removals. Visual proof closes.",
    "Generic stock tree photo. Your truck, your team, your equipment = real.",
  ],
  techPainPoints: ["No TreeService schema. No phone tap-to-call kills mobile leads."],
};

const PRESSURE_WASHING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No before/after photos. Pressure washing = pure visual sale; without them, dead.",
    "Service split missing (driveway, deck, house, roof, fleet). Each = different search.",
    "License + insurance not visible. Property work trust signal.",
    "No 'free quote' hook. Quote-driven sale loses leads without the form.",
    "Generic stock pressure photos. Your actual jobs close.",
  ],
  techPainPoints: ["No CleaningService schema. Image-heavy needs lazy-loading."],
};

const GARAGE_DOOR_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'same-day repair' callout. Stuck garage door = whoever answers first wins the call.",
    "License + insurance not visible. Property work trust signal.",
    "Brand list (Liftmaster, Genie, Chamberlain) missing. Each = different searcher.",
    "No upfront pricing. Most homeowners want a number before calling.",
    "Generic stock garage photo. Your truck, your tech = real.",
  ],
  techPainPoints: ["No GarageDoor / RepairService schema. Phone not tap-to-call."],
};

const LOCKSMITH_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 24-7 emergency callout. Lock-out = whoever answers first wins.",
    "License + bond + insurance not visible. Stranger-with-key trust signal critical.",
    "Service split missing (residential, automotive, commercial, safe). Each = search.",
    "No upfront pricing. Locksmith scams are common — transparency closes trust.",
    "Generic stock lock photo. Your truck, your tech, your van = real.",
  ],
  techPainPoints: ["No Locksmith schema. Phone not tap-to-call kills emergency leads."],
};

const TOWING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 24-7 hotline + dispatch hero. Towing = pure urgency; phone tag kills.",
    "Service area + response time missing. '30-min response' is the close.",
    "No specialty split (light-duty, heavy-duty, roadside, transport). Each = search.",
    "License + DOT + insurance not visible. Required for tow operators — show it.",
    "Generic stock truck. Your truck, your driver = real and reachable.",
  ],
  techPainPoints: [
    "No AutomotiveBusiness / TowingService schema. Phone not tap-to-call.",
    "No serviceArea markup — local pack ignores 'tow truck near me'.",
  ],
};

const CONSTRUCTION_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free estimate' or 'schedule a consult' hook. High-ticket work needs a lead magnet.",
    "License + bond + insurance numbers missing. Big-ticket trust signals critical.",
    "Project-type split missing (commercial, residential, addition, remodel). Each = search.",
    "No before/after of past projects. Visual proof closes whole-home work.",
    "No client testimonials with project specifics ('$80K kitchen, on-time, $500 under budget').",
  ],
  techPainPoints: ["No HomeAndConstructionBusiness schema. Image-heavy needs lazy-loading."],
};

const APPLIANCE_REPAIR_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'same-day service' callout. Broken fridge with $400 of food = whoever shows up today wins.",
    "Brand list (Whirlpool, GE, Samsung, LG, Sub-Zero) missing. Each = different searcher.",
    "License + insurance not visible. Trust signal for home-service work.",
    "No upfront pricing or service-call fee. 'Call for quote' loses every comparison shopper.",
    "Generic stock appliance photo. Your truck, your tech, your van = real.",
  ],
  techPainPoints: ["No HomeAndConstructionBusiness / ApplianceRepair schema."],
};

const POOL_SPA_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free pool inspection' or quote hook. Pool work = high-ticket; lead magnets close.",
    "License + insurance + service area not visible. Pool owners want bonded contractors.",
    "Specific services missing (cleaning, repair, install, equipment). Each = different search.",
    "No before/after photos of installs. Visual proof closes high-ticket sales.",
    "Generic stock pool photos. Your actual installs sell — stock kills.",
  ],
  techPainPoints: ["No PoolService schema. Image-heavy needs lazy-loading."],
};

// ─── Healthcare / wellness ───────────────────────────────────────────

const VETERINARY_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Accepting New Patients' or 'Same-Day Appointments' badge. Phone rings, schedule stays empty.",
    "Pet emergency hook missing. The 11pm dog-ate-something call goes to the vet who shows urgency.",
    "No 'Fear-Free' or low-stress callout. Pet owners hate vet trauma. Show you handle it differently.",
    "No team photos with the actual vets. Pet owners pick a vet, not a clinic.",
    "Pricing for spay/neuter not shown. 'Call for quote' loses budget-conscious pet parents.",
  ],
  techPainPoints: [
    "No VeterinaryCare schema. Local pack misses 'vet near me' searches.",
    "No appointment booking widget. Modern pet owners book online, not by phone.",
  ],
};

const CHIROPRACTIC_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'new patient special' — usually $49 or $99 first visit. Without it, you lose price-sensitive leads.",
    "Insurance carriers not visible. 'Do you take Aetna?' → has to call → bounces.",
    "No specific conditions treated. Back, neck, sciatica, headaches — each one a search term.",
    "Doctor bio reads corporate. Patients pick a person.",
    "No before/after pain-relief stories. Concrete pain-scale results close skeptics.",
  ],
  techPainPoints: ["No Chiropractor schema. No Patient testimonial markup for star pulls."],
};

const PHYSICAL_THERAPY_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'in-network insurance' carrier list. PT is insurance-driven — no it = no lead.",
    "No conditions treated (sports injury, post-surgery, sciatica, balance). Each = different search.",
    "Therapist bios with credentials (DPT, OCS, FAAOMPT) missing. Trust signal medical-adjacent.",
    "No 'first appointment' walkthrough. Patients fear PT pain — address it.",
    "No success stories with measurements ('knee 80% range → 100% in 6 weeks').",
  ],
  techPainPoints: ["No PhysicalTherapy schema. No Patient review markup."],
};

const MEDICAL_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Accepting New Patients' or 'Same-Day' callout. Phone-rings-empty-chairs.",
    "Insurance carriers not visible. Same as dental — first question every visitor has.",
    "No specific specialties or conditions treated. Generic 'medical care' doesn't rank.",
    "Doctor bios missing or generic. Patients pick a doctor, not a clinic.",
    "No patient testimonials with conditions. 'Treated my chronic pain' closes hesitant.",
  ],
  techPainPoints: ["No MedicalBusiness or Physician schema. No Patient review markup."],
};

const MED_SPA_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No specific treatments listed (Botox, fillers, laser, peels, microneedling). Each = different search.",
    "Pricing per treatment hidden. Med spa visitors comparison-shop hard. Show the number.",
    "Provider bios with medical credentials missing (RN, NP, MD on hero). Trust signal critical.",
    "No before/after gallery. Visual proof closes hesitant buyers.",
    "No first-visit special. '$100 off Botox' closes the wavering shopper.",
  ],
  techPainPoints: ["No MedicalSpa schema. No MedicalProcedure markup for treatment pages."],
};

// ─── Lifestyle / beauty / creative ───────────────────────────────────

const PHOTOGRAPHY_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "Portfolio buried below the fold. Photos ARE the sales pitch. Lead with them.",
    "No package pricing visible. 'Inquire' loses every couple under 35 planning a wedding.",
    "Stock photos in the 'about' section. As a photographer this is suicide. Your face, your camera, your work.",
    "No client testimonials with names + dates. 'Sarah & Mike, June 2025' closes hesitant brides.",
    "No 'what to wear' or 'preparing for your shoot' content. Soft-sell that turns lookers into bookers.",
  ],
  techPainPoints: [
    "No Photographer schema. Image alt text often missing on portfolio shots.",
    "Big portfolio images not lazy-loaded. Mobile speed dies on the gallery.",
  ],
};

const FLORIST_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No same-day delivery callout. Florists win on speed for last-minute orders.",
    "Wedding/funeral packages not shown. Each = different occasion-driven search.",
    "Generic stock bouquets. Your actual arrangements sell — stock kills credibility.",
    "No subscription option (weekly office flowers). Recurring revenue lever ignored.",
    "No floral designer face/bio. Customers pick a person, not a shop name.",
  ],
  techPainPoints: ["No Florist schema. Image-heavy needs lazy-loading."],
};

const TATTOO_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "Portfolio buried. Tattoos ARE the sales pitch. Lead with the work.",
    "Artist bios missing or generic. Clients pick an artist, not a shop.",
    "No 'specialty styles' (traditional, neo, blackwork, watercolor). Each = different search.",
    "Pricing or hourly rate hidden. Most clients budget before booking — give them the number.",
    "No booking deposit or process. Walk-ins vs appointments — say which.",
  ],
  techPainPoints: ["No TattooParlor schema. Image-heavy gallery needs lazy-loading."],
};

const INTERIOR_DESIGN_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "Portfolio buried below the fold. Designers ARE judged by their visuals.",
    "No 'design package' pricing tiers ($500 consult, $2500 room, $10K full home).",
    "Stock photos of generic rooms. Your actual projects close the upsell. Stock kills it.",
    "No process explanation (consult → concept → execute). High-ticket sale needs reassurance.",
    "No client testimonials with project photos. Faces + spaces sell better than copy.",
  ],
  techPainPoints: ["No InteriorDesigner schema. Image-heavy site needs lazy-loading."],
};

const EVENT_PLANNING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No portfolio gallery on the hero. Events = pure visual sale.",
    "Package pricing not shown. Couples + corporate need ranges.",
    "No event-type split (wedding, corporate, milestone, holiday). Each = different decision.",
    "Stock event photos. Your actual events sell — stock kills.",
    "No client testimonials with event details. 'Smith wedding, 250 guests, July 2025' closes.",
  ],
  techPainPoints: ["No EventService schema. No LocalBusiness with EventVenue markup."],
};

// ─── Service businesses ──────────────────────────────────────────────

const LANDSCAPING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free design consultation' hook. Landscaping is a high-ticket sale. Free design = leads.",
    "No before/after photos. Your work is the proof — stock kills credibility.",
    "Service list buried — mowing, hardscape, irrigation, snow removal. Each one a separate keyword.",
    "License + bond number missing. Landscaping clients want bonded crew on their property.",
    "No seasonal callout (spring cleanup, fall leaves, holiday lights). Each season = new lead.",
  ],
  techPainPoints: ["No LandscapingBusiness schema. Image-heavy site needs lazy-loading."],
};

const CLEANING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'instant quote' or pricing widget. Visitors want a number, not 'Call for quote'.",
    "No bonded/insured callout. Clients want strangers in their home only with insurance.",
    "Background-checked staff not mentioned. Trust signal that closes nervous buyers.",
    "No before/after photos of recent jobs. Sparkling kitchen photos sell faster than copy.",
    "No deep-clean + recurring options shown. 'How often?' → don't make them ask.",
  ],
  techPainPoints: ["No HouseCleaningService schema. No LocalBusiness markup."],
};

const MOVING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free quote' or instant estimate widget. Movers compete on transparency.",
    "License + DOT number not visible. Federal-required and a trust signal.",
    "No 'long distance' vs 'local' service split. Different searchers, different services.",
    "Generic stock truck photo. Your truck, your crew, your branded uniforms = real.",
    "No reviews/testimonials with neighborhoods. 'Moved from Tacoma to Bellevue' closes the deal.",
  ],
  techPainPoints: ["No MovingCompany schema. Phone not tap-to-call."],
};

const PEST_CONTROL_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'same-day service' callout. Roach in the kitchen = whoever shows up today wins.",
    "No specific pests handled (ants, rodents, termites, bedbugs). Each = different search.",
    "No 'pet-safe' or 'kid-safe' treatments callout. Modern pest control sells safety.",
    "License number not visible. Pest treatment requires applicator license — show it.",
    "No service guarantee. 'If they come back, so do we — free' closes nervous homeowners.",
  ],
  techPainPoints: ["No PestControlService schema. No LocalBusiness markup."],
};

const JUNK_REMOVAL_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'same-day pickup' or 'we lift, you don't' hero. Speed + ease are the differentiators.",
    "Truck-size pricing not shown ($149 single load, $349 truckload). Most price this way.",
    "License + insurance not visible. Trust for stranger-on-my-property work.",
    "No before/after photos. Visual proof of cluttered → clean closes.",
    "Eco/donation callout missing ('60% donated, 30% recycled'). Modern junk-removal differentiates here.",
  ],
  techPainPoints: ["No WasteManagementService schema. Phone not tap-to-call."],
};

const CARPET_CLEANING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'instant quote' widget. Comparison-shoppers want a number first.",
    "No specific services (carpet, upholstery, tile, area rug, pet stains). Each = search.",
    "Bonded/insured + IICRC-certified missing. Trust signal for stranger-in-my-home.",
    "Pricing per room not shown. Most carpet cleaners price this way — say it.",
    "Generic stock vacuum photo. Your truck, your tech, your equipment = real.",
  ],
  techPainPoints: ["No CleaningService schema."],
};

const PET_SERVICES_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No pet-type split (dogs, cats, exotic). Each = different decision.",
    "No service split (boarding, grooming, daycare, training). Each = different search.",
    "Background-checked staff not mentioned. Trust = critical for stranger-with-my-pet decisions.",
    "Pricing hidden. Pet-parents budget — give them the number.",
    "No daily-photo or report-card system. Modern pet services do this; show you do too.",
  ],
  techPainPoints: ["No AnimalShelter / PetStore schema for the relevant subtype."],
};

const DAYCARE_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'Now Enrolling' + age groups. Parents need to know if you take 18-month-olds.",
    "Tuition not visible. 'Tour to learn pricing' loses every working parent comparing 5 places.",
    "Background-checked staff not mentioned. #1 parent fear. Address it on hero.",
    "No daily-routine description. Parents picture their kid's day before signing up.",
    "Director or owner photo missing. Parents trust a face, not a logo.",
  ],
  techPainPoints: ["No ChildCare schema. Local pack misses 'daycare near me' searches."],
};

// ─── Professional services ───────────────────────────────────────────

const LAW_FIRM_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free consultation' CTA. Every legal client expects this. No it = no lead.",
    "No specific practice areas pinned. 'Personal injury' and 'family law' handled differently — don't bury.",
    "Attorney bios missing or corporate. Clients pick a person, not a firm.",
    "No case results or settlements highlighted. 'We won $X for our clients' closes hesitant prospects.",
    "No client testimonial videos. Written quotes feel fake. Faces close the trust.",
  ],
  techPainPoints: [
    "No LegalService schema. AttorneyAtLaw schema also missing.",
    "No phone tap-to-call on mobile. Every other firm on the SERP has it.",
  ],
};

const ACCOUNTING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free 30-min consultation' hook. CPAs that don't offer this lose to ones that do.",
    "No specialty callouts (small biz, freelancer, e-commerce, restaurant). Each = different keyword.",
    "No fee structure visible — even ranges. 'Call for quote' loses every one-person business.",
    "No CPA license number shown. Trust signal financial-services need.",
    "No client testimonials with industries. 'ABC Roofing saved $40K in taxes' closes the deal.",
  ],
  techPainPoints: ["No AccountingService schema. No LocalBusiness markup."],
};

const INSURANCE_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No 'free quote' form on the hero. Insurance is a quote-driven sale.",
    "No carrier list (State Farm, Allstate, Progressive). Independent agents win on choice.",
    "No bundle savings callout. Auto + home together = 20% off — sells itself.",
    "License + agent name not visible. Buyers want a person, not a chatbot.",
    "No claims testimonials. 'Got my $X claim paid in 5 days' closes hesitant buyers.",
  ],
  techPainPoints: ["No InsuranceAgency schema. No FinancialProduct schema for policies."],
};

// ─── Fitness / community / education ─────────────────────────────────

const FITNESS_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No class schedule on the hero. Visitor wants times. You show 'About Us'.",
    "No free-trial or first-week-free hook. Fitness is a try-before-buy decision.",
    "No before/after photos or member transformations. Real proof beats every marketing line.",
    "Pricing not visible — 'Call for membership info'. They call no one. They go to Planet Fitness.",
    "No trainer bios. Members pick a coach, not a brand.",
  ],
  techPainPoints: ["No HealthClub schema. No Schedule schema for class times."],
};

const MARTIAL_ARTS_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No free trial class. Every dojo offers this. Without it = lost lead to whoever offers it.",
    "No specific styles (BJJ, MMA, karate, kids). Different parents, different searches.",
    "Instructor bios + black-belt rank missing. Reputation = enrollment.",
    "No class schedule visible. Parents need times before signing up.",
    "No 'kids 5-12' + 'adults 18+' age splits. Each = different decision-maker.",
  ],
  techPainPoints: ["No SportsClub schema. No Schedule schema for class times."],
};

const TUTORING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No subject + grade level matrix. Parents need '10th-grade algebra' — show it.",
    "No tutor bios with credentials. Parents trust the resume, not the brand.",
    "No score improvement results ('avg SAT bump = 180 points'). Specific numbers close.",
    "Pricing hidden. 'Inquire for rates' loses every parent comparison-shopping.",
    "No free 30-min trial session. Education = try-before-buy decision.",
  ],
  techPainPoints: ["No EducationalOrganization schema. No Course or AggregateRating markup."],
};

const CHURCH_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No service times on the hero. #1 question. Don't make them dig.",
    "No 'I'm new here' landing path. First-timers feel awkward; address it.",
    "No senior pastor face/bio. Visitors trust a person.",
    "No recent sermon archive. Modern church marketing = sermon library.",
    "No community impact / ministry split. Each draws different people.",
  ],
  techPainPoints: ["No Church / PlaceOfWorship schema. No Event schema for service times."],
};

// ─── Food ────────────────────────────────────────────────────────────

const CATERING_PAIN_POINTS: CategoryPainPoints = {
  heroPainPoints: [
    "No menu PDF or catalog visible. Couples + corporate need to see what you do.",
    "No event-type split (wedding, corporate, birthday, holiday). Each = different decision.",
    "Pricing per-person not shown. Most caterers price this way — show the number.",
    "Stock food photos. Your actual plating sells — stock kills appetites.",
    "No testimonial videos with event names. 'We catered the Smith wedding' closes hesitant.",
  ],
  techPainPoints: ["No FoodService / CateringService schema. No Event markup for past events."],
};

// "general" catch-all — reuses plumber per Q5B locked design.
const GENERAL_PAIN_POINTS: CategoryPainPoints = PLUMBER_PAIN_POINTS;

// ─── The lookup table ────────────────────────────────────────────────

const CATEGORY_PAIN_POINTS: Record<string, CategoryPainPoints> = {
  // Phase 1 prototypes
  plumber: PLUMBER_PAIN_POINTS,
  dental: DENTAL_PAIN_POINTS,
  salon: SALON_PAIN_POINTS,
  "real-estate": REAL_ESTATE_PAIN_POINTS,
  restaurant: RESTAURANT_PAIN_POINTS,
  general: GENERAL_PAIN_POINTS,
  // Phase 2 — trades
  electrician: ELECTRICIAN_PAIN_POINTS,
  hvac: HVAC_PAIN_POINTS,
  roofing: ROOFING_PAIN_POINTS,
  "auto-repair": AUTO_REPAIR_PAIN_POINTS,
  "general-contractor": GENERAL_CONTRACTOR_PAIN_POINTS,
  painting: PAINTING_PAIN_POINTS,
  fencing: FENCING_PAIN_POINTS,
  "tree-service": TREE_SERVICE_PAIN_POINTS,
  "pressure-washing": PRESSURE_WASHING_PAIN_POINTS,
  "garage-door": GARAGE_DOOR_PAIN_POINTS,
  locksmith: LOCKSMITH_PAIN_POINTS,
  towing: TOWING_PAIN_POINTS,
  construction: CONSTRUCTION_PAIN_POINTS,
  "appliance-repair": APPLIANCE_REPAIR_PAIN_POINTS,
  "pool-spa": POOL_SPA_PAIN_POINTS,
  // Phase 2 — healthcare / wellness
  veterinary: VETERINARY_PAIN_POINTS,
  chiropractic: CHIROPRACTIC_PAIN_POINTS,
  "physical-therapy": PHYSICAL_THERAPY_PAIN_POINTS,
  medical: MEDICAL_PAIN_POINTS,
  "med-spa": MED_SPA_PAIN_POINTS,
  // Phase 2 — lifestyle / beauty / creative
  photography: PHOTOGRAPHY_PAIN_POINTS,
  florist: FLORIST_PAIN_POINTS,
  tattoo: TATTOO_PAIN_POINTS,
  "interior-design": INTERIOR_DESIGN_PAIN_POINTS,
  "event-planning": EVENT_PLANNING_PAIN_POINTS,
  // Phase 2 — service businesses
  landscaping: LANDSCAPING_PAIN_POINTS,
  cleaning: CLEANING_PAIN_POINTS,
  moving: MOVING_PAIN_POINTS,
  "pest-control": PEST_CONTROL_PAIN_POINTS,
  "junk-removal": JUNK_REMOVAL_PAIN_POINTS,
  "carpet-cleaning": CARPET_CLEANING_PAIN_POINTS,
  "pet-services": PET_SERVICES_PAIN_POINTS,
  daycare: DAYCARE_PAIN_POINTS,
  // Phase 2 — professional services
  "law-firm": LAW_FIRM_PAIN_POINTS,
  accounting: ACCOUNTING_PAIN_POINTS,
  insurance: INSURANCE_PAIN_POINTS,
  // Phase 2 — fitness / community / education
  fitness: FITNESS_PAIN_POINTS,
  "martial-arts": MARTIAL_ARTS_PAIN_POINTS,
  tutoring: TUTORING_PAIN_POINTS,
  church: CHURCH_PAIN_POINTS,
  // Phase 2 — food
  catering: CATERING_PAIN_POINTS,
};

/**
 * Look up pain points for a category. Falls back to "general" (plumber-
 * pattern) when the category isn't filled in yet. Pure — no DB call.
 */
export function getCategoryPainPoints(category: string): CategoryPainPoints {
  return CATEGORY_PAIN_POINTS[category] || CATEGORY_PAIN_POINTS.general;
}

/**
 * Format the pain points as a prompt block for the hero AI prompt.
 * Returns "" if the category has no entry (lets the prompt skip the
 * section entirely instead of injecting empty bullets).
 */
export function formatHeroPainPointsBlock(category: string): string {
  const entry = getCategoryPainPoints(category);
  if (!entry.heroPainPoints.length) return "";
  const bullets = entry.heroPainPoints.map((p) => `- ${p}`).join("\n");
  return `CATEGORY-SPECIFIC PAIN POINTS — INSPIRATION (not a checklist):
The list below captures what tends to lose ${category.replace("-", " ")} businesses customers. Pick the 2-3 that actually match what you see on THIS prospect's site, lead with those, and add your own observations from the actual content. If none apply, fall back to your general instincts.

${bullets}`;
}

/**
 * Format the tech pain points as a prompt block for the technical AI
 * prompt. Returns "" if the category has no tech entries.
 */
export function formatTechPainPointsBlock(category: string): string {
  const entry = getCategoryPainPoints(category);
  if (!entry.techPainPoints?.length) return "";
  const bullets = entry.techPainPoints.map((p) => `- ${p}`).join("\n");
  return `CATEGORY-SPECIFIC TECH SIGNALS — check these if relevant:
${bullets}`;
}
