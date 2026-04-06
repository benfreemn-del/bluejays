import type { Category } from "./types";

export interface PortfolioSite {
  name: string;
  category: Category;
  tagline: string;
  phone: string;
  address: string;
  about: string;
  services: { name: string; description: string; price?: string }[];
  testimonials: { name: string; text: string }[];
}

export const portfolioSites: PortfolioSite[] = [
  {
    name: "Sentinel Security Group",
    category: "general-contractor",
    tagline: "Professional security services. Off-duty officers and trained personnel protecting what matters most.",
    phone: "(206) 555-0101",
    address: "1200 5th Ave, Seattle, WA",
    about: "Sentinel Security Group provides elite protective services staffed by off-duty law enforcement and military veterans. We serve corporate events, residential communities, and high-profile clients with discretion and professionalism.",
    services: [
      { name: "Event Security", description: "Uniformed and plainclothes officers for events of any size." },
      { name: "Executive Protection", description: "Personal security details for executives and VIPs." },
      { name: "Patrol Services", description: "Regular mobile and foot patrols for your property." },
      { name: "Surveillance Systems", description: "CCTV installation, monitoring, and alarm response." },
    ],
    testimonials: [
      { name: "Richard K.", text: "Sentinel handled security for our corporate gala flawlessly. Professional, discreet, and sharp." },
      { name: "Marina L.", text: "We've used them for our condo complex for 2 years. Crime dropped to zero. Worth every penny." },
      { name: "David P.", text: "The off-duty officers they provide are top-notch. You can tell they take this seriously." },
    ],
  },
  {
    name: "Emerald City Plumbing",
    category: "plumber",
    tagline: "Fast, reliable plumbing for Seattle homes and businesses. Available 24/7 for emergencies.",
    phone: "(206) 555-0102",
    address: "3400 Rainier Ave S, Seattle, WA",
    about: "Family-owned since 2009, Emerald City Plumbing has been the go-to plumber for the greater Seattle area. We specialize in residential repairs, remodels, and emergency service with upfront pricing and no surprises.",
    services: [
      { name: "Emergency Plumbing", description: "24/7 emergency repairs — we're there in 60 minutes or less.", price: "From $99" },
      { name: "Drain Cleaning", description: "Professional drain clearing with camera inspection." },
      { name: "Water Heater Service", description: "Tankless and traditional water heater install and repair." },
      { name: "Bathroom Remodeling", description: "Full bathroom renovations from design to finish." },
      { name: "Sewer Line Repair", description: "Trenchless sewer repair and replacement." },
    ],
    testimonials: [
      { name: "Jake M.", text: "Pipe burst at midnight. They were here in 40 minutes. Saved our kitchen. Lifesavers." },
      { name: "Priya S.", text: "Honest pricing and great work on our bathroom remodel. Highly recommend." },
      { name: "Tom R.", text: "Best plumber in Seattle. They've handled everything for our rental properties for years." },
    ],
  },
  {
    name: "Cascade Electric Co.",
    category: "electrician",
    tagline: "Licensed electricians serving the Pacific Northwest. Residential, commercial, and industrial.",
    phone: "(206) 555-0103",
    address: "7800 Aurora Ave N, Seattle, WA",
    about: "Cascade Electric has been powering the Pacific Northwest for over 15 years. Our master electricians handle everything from panel upgrades to full commercial buildouts, always up to code and on schedule.",
    services: [
      { name: "Panel Upgrades", description: "200-amp service upgrades for modern homes." },
      { name: "EV Charger Install", description: "Level 2 charging station installation for your garage.", price: "From $899" },
      { name: "Commercial Wiring", description: "New construction and tenant improvement electrical." },
      { name: "Landscape Lighting", description: "Custom outdoor lighting design and installation." },
    ],
    testimonials: [
      { name: "Brian W.", text: "Installed our EV charger and upgraded our panel. Clean work, fair price, done in a day." },
      { name: "Sandra K.", text: "They rewired our entire 1940s home. Meticulous and professional throughout." },
      { name: "Alex T.", text: "Use them for all our commercial properties. Reliable and always on time." },
    ],
  },
  {
    name: "Alpine HVAC Solutions",
    category: "hvac",
    tagline: "Keep your home comfortable year-round. Expert heating and cooling for the Pacific Northwest.",
    phone: "(425) 555-0104",
    address: "2200 Bellevue Way NE, Bellevue, WA",
    about: "Alpine HVAC Solutions specializes in high-efficiency heating and cooling systems designed for the Pacific Northwest climate. We're Carrier and Lennox certified with thousands of installs across the Eastside.",
    services: [
      { name: "AC Installation", description: "Central air and ductless mini-split systems." },
      { name: "Furnace Repair", description: "Same-day furnace diagnostics and repair." },
      { name: "Heat Pump Systems", description: "Energy-efficient heat pump installation and service." },
      { name: "Duct Cleaning", description: "Professional air duct cleaning and sealing." },
    ],
    testimonials: [
      { name: "Michelle G.", text: "New heat pump cut our energy bill in half. Alpine made the whole process painless." },
      { name: "Robert C.", text: "Furnace died on the coldest night of the year. They had it fixed by morning." },
      { name: "Lisa H.", text: "Professional from start to finish. Best HVAC company on the Eastside." },
    ],
  },
  {
    name: "Summit Roofing & Exteriors",
    category: "roofing",
    tagline: "Protecting homes from the top down. Expert roofing for the rainy Pacific Northwest.",
    phone: "(253) 555-0105",
    address: "4500 Pacific Ave, Tacoma, WA",
    about: "Summit Roofing knows Pacific Northwest weather. With 20+ years of experience, we specialize in composition, metal, and flat roofing systems built to withstand rain, wind, and everything the seasons throw at them.",
    services: [
      { name: "Roof Replacement", description: "Complete tear-off and replacement with premium materials." },
      { name: "Roof Repair", description: "Leak repair, shingle replacement, and storm damage." },
      { name: "Metal Roofing", description: "Standing seam and corrugated metal roof installation." },
      { name: "Gutter Systems", description: "Seamless gutter installation with leaf guards." },
    ],
    testimonials: [
      { name: "Greg P.", text: "New roof in 2 days. No leaks through 3 winters. Summit is the real deal." },
      { name: "Karen D.", text: "They found damage our insurance covered that we didn't even know about. Honest and thorough." },
      { name: "Jim & Patty W.", text: "Metal roof looks incredible and we'll never worry about leaks again." },
    ],
  },
  {
    name: "Pacific Auto Works",
    category: "auto-repair",
    tagline: "Honest auto repair you can trust. ASE certified mechanics, fair prices, quality parts.",
    phone: "(206) 555-0106",
    address: "5100 MLK Jr Way S, Seattle, WA",
    about: "Pacific Auto Works has been Seattle's trusted independent auto shop since 2005. Our ASE-certified mechanics work on all makes and models with dealer-quality service at independent shop prices.",
    services: [
      { name: "Engine Diagnostics", description: "Computer diagnostics and check engine light repairs." },
      { name: "Brake Service", description: "Pads, rotors, calipers, and fluid flush." },
      { name: "Timing Belt/Chain", description: "Preventive timing component replacement." },
      { name: "Pre-Purchase Inspection", description: "Thorough vehicle inspection before you buy.", price: "$149" },
    ],
    testimonials: [
      { name: "Carlos R.", text: "Finally found a mechanic I trust. Fair prices and they explain everything clearly." },
      { name: "Jen T.", text: "Saved me $2,000 vs the dealer for the same repair. Going here forever." },
      { name: "Mike S.", text: "Pre-purchase inspection saved me from buying a lemon. Worth every penny." },
    ],
  },
  {
    name: "Evergreen Chiropractic",
    category: "chiropractic",
    tagline: "Natural pain relief and wellness care. Get back to living without limits.",
    phone: "(425) 555-0107",
    address: "1500 NW Gilman Blvd, Issaquah, WA",
    about: "Dr. Sarah Chen and the Evergreen Chiropractic team use evidence-based techniques to treat back pain, neck pain, headaches, and sports injuries. We believe in treating the whole person, not just the symptom.",
    services: [
      { name: "Spinal Adjustments", description: "Gentle, precise adjustments for pain relief and alignment." },
      { name: "Sports Rehabilitation", description: "Recovery programs for athletes and active individuals." },
      { name: "Massage Therapy", description: "Therapeutic massage integrated with chiropractic care." },
      { name: "Posture Correction", description: "Ergonomic assessment and corrective exercise programs." },
    ],
    testimonials: [
      { name: "Amy L.", text: "10 years of back pain and Dr. Chen had me feeling better in 3 visits. Life-changing." },
      { name: "Derek N.", text: "Helped me recover from a running injury when PT alone wasn't cutting it." },
      { name: "Susan M.", text: "The whole team is warm and professional. I actually look forward to my appointments." },
    ],
  },
  {
    name: "Puget Sound Pest Control",
    category: "pest-control",
    tagline: "Keep your home pest-free. Eco-friendly solutions for the Pacific Northwest.",
    phone: "(360) 555-0108",
    address: "800 Market St, Olympia, WA",
    about: "Puget Sound Pest Control uses integrated pest management — combining targeted treatments with prevention to keep pests out for good. We're locally owned and committed to eco-friendly solutions that are safe for your family and pets.",
    services: [
      { name: "General Pest Control", description: "Ants, spiders, beetles, and common household pests." },
      { name: "Rodent Exclusion", description: "Mice and rat removal with entry point sealing." },
      { name: "Termite Treatment", description: "Inspection, treatment, and prevention plans." },
      { name: "Wildlife Removal", description: "Humane removal of raccoons, squirrels, and birds." },
    ],
    testimonials: [
      { name: "Linda R.", text: "Ant problem gone after one visit. They sealed up the entry points too. Haven't seen one since." },
      { name: "Paul K.", text: "Eco-friendly approach was important to us with young kids. Great results, no harsh chemicals." },
      { name: "Maria G.", text: "They removed a raccoon family from our attic humanely and sealed everything up. Amazing service." },
    ],
  },
  {
    name: "Iron & Oak Fitness",
    category: "fitness",
    tagline: "Strength. Community. Results. Boutique fitness for every level.",
    phone: "(206) 555-0109",
    address: "2800 E Madison St, Seattle, WA",
    about: "Iron & Oak is a boutique gym focused on strength training, functional fitness, and community. Our certified coaches build custom programs for every level — from first-timer to competitive athlete.",
    services: [
      { name: "Personal Training", description: "1-on-1 custom programs with certified coaches.", price: "$85/session" },
      { name: "Group Classes", description: "Small-group HIIT, strength, and mobility classes.", price: "$150/month" },
      { name: "Nutrition Coaching", description: "Meal planning and macro coaching." },
      { name: "Online Training", description: "Remote programming with weekly check-ins.", price: "$199/month" },
    ],
    testimonials: [
      { name: "Jason K.", text: "Lost 30 lbs in 4 months. The coaches here actually care about your progress." },
      { name: "Tina W.", text: "Best gym community in Seattle. I've made real friends here while getting in the best shape of my life." },
      { name: "Dan M.", text: "Went from never lifting to deadlifting 400lbs. The programming here is legit." },
    ],
  },
  {
    name: "Northshore Veterinary Clinic",
    category: "veterinary",
    tagline: "Compassionate care for your furry family members. Serving pets since 2008.",
    phone: "(425) 555-0110",
    address: "6800 NE Bothell Way, Kenmore, WA",
    about: "Northshore Veterinary Clinic provides comprehensive care for dogs, cats, and exotic pets. Dr. Williams and our team treat every animal like our own, with state-of-the-art diagnostics and a gentle touch.",
    services: [
      { name: "Wellness Exams", description: "Annual checkups, vaccinations, and preventive care." },
      { name: "Surgery", description: "Spay/neuter, soft tissue, and orthopedic surgery." },
      { name: "Dental Care", description: "Professional cleanings, extractions, and oral health." },
      { name: "Emergency Services", description: "Urgent care for sudden illness or injury." },
    ],
    testimonials: [
      { name: "Hannah S.", text: "Dr. Williams saved our golden retriever's life. We can't thank this team enough." },
      { name: "Chris & Meg R.", text: "They treat our cats like royalty. Gentle, patient, and incredibly knowledgeable." },
      { name: "Ben T.", text: "Only vet our anxious rescue dog doesn't freak out at. They really know how to handle nervous pets." },
    ],
  },
  {
    name: "Emerald Accounting Group",
    category: "accounting",
    tagline: "Small business tax experts. Maximize deductions, minimize stress.",
    phone: "(206) 555-0111",
    address: "900 4th Ave, Suite 800, Seattle, WA",
    about: "Emerald Accounting Group specializes in small business tax preparation, bookkeeping, and financial planning. We save our clients an average of $8,000 per year in taxes through strategic planning and proactive advice.",
    services: [
      { name: "Tax Preparation", description: "Business and personal tax returns with maximum deductions." },
      { name: "Bookkeeping", description: "Monthly bookkeeping and financial statement preparation." },
      { name: "Payroll Services", description: "Full-service payroll processing and tax filing." },
      { name: "Tax Planning", description: "Year-round strategy to minimize your tax burden." },
    ],
    testimonials: [
      { name: "Steve L.", text: "Saved us $12K on taxes last year. Paid for themselves 10x over." },
      { name: "Angela D.", text: "Finally understand my business finances. They explain everything in plain English." },
      { name: "Kevin R.", text: "Switched from TurboTax and saved more in their first year than the previous 3 combined." },
    ],
  },
  {
    name: "Cascadia Moving Co.",
    category: "moving",
    tagline: "Stress-free moves across Washington. Licensed, insured, and on time.",
    phone: "(253) 555-0112",
    address: "3200 S Pine St, Tacoma, WA",
    about: "Cascadia Moving has completed over 5,000 moves across Washington state. We handle local, long-distance, and commercial moves with care, speed, and transparent pricing. No hidden fees, no surprises.",
    services: [
      { name: "Local Moving", description: "Same-day and next-day local moves within the metro area." },
      { name: "Long-Distance", description: "Moves anywhere in Washington, Oregon, and beyond." },
      { name: "Packing Services", description: "Full packing, unpacking, and materials supplied." },
      { name: "Commercial Moving", description: "Office and commercial relocations with minimal downtime." },
    ],
    testimonials: [
      { name: "Amber J.", text: "Moved our entire 4-bedroom house in 5 hours. Not a single scratch. Incredible crew." },
      { name: "Dave & Laura M.", text: "The packing service alone was worth it. They were so careful with our antiques." },
      { name: "Ryan P.", text: "Office move happened over a weekend. Monday morning everything was set up perfectly." },
    ],
  },
  {
    name: "Bloom & Vine Florist",
    category: "florist",
    tagline: "Artisan floral design for weddings, events, and everyday beauty.",
    phone: "(206) 555-0113",
    address: "1100 Pike St, Seattle, WA",
    about: "Bloom & Vine creates stunning floral arrangements using locally sourced, seasonal flowers. From intimate bouquets to grand wedding installations, every design is crafted with artistry and intention.",
    services: [
      { name: "Wedding Florals", description: "Bouquets, centerpieces, arches, and full venue design." },
      { name: "Event Design", description: "Corporate events, galas, and party floral decor." },
      { name: "Weekly Subscriptions", description: "Fresh arrangements delivered to your home or office.", price: "From $45/week" },
      { name: "Sympathy Flowers", description: "Thoughtful arrangements for memorial services." },
    ],
    testimonials: [
      { name: "Jessica & Matt K.", text: "Our wedding flowers were beyond anything we imagined. Everyone asked who did them." },
      { name: "Sarah L.", text: "The weekly subscription brightens our whole office. Clients always comment on the flowers." },
      { name: "Diana R.", text: "They handled the flowers for my mother's memorial with such care and beauty. Grateful." },
    ],
  },
  {
    name: "Little Explorers Daycare",
    category: "daycare",
    tagline: "Nurturing, play-based early learning for ages 6 months to 5 years.",
    phone: "(425) 555-0114",
    address: "4400 148th Ave NE, Redmond, WA",
    about: "Little Explorers Daycare provides a warm, stimulating environment where children learn through play. Our certified teachers follow a curriculum that builds social skills, creativity, and kindergarten readiness.",
    services: [
      { name: "Infant Care", description: "Nurturing care for babies 6-18 months in small groups." },
      { name: "Toddler Program", description: "Active learning and socialization for ages 18 months-3 years." },
      { name: "Preschool", description: "Kindergarten prep with literacy, math, and science basics." },
      { name: "Before & After School", description: "Care for school-age children with homework help and activities." },
    ],
    testimonials: [
      { name: "Emily & Josh T.", text: "Our daughter thrives here. The teachers genuinely love what they do." },
      { name: "Aisha M.", text: "After trying 3 other daycares, this is the one where our son finally stopped crying at drop-off." },
      { name: "Rachel S.", text: "The curriculum is impressive. Our 4-year-old is reading and doing basic math already." },
    ],
  },
  {
    name: "Blue Ridge Photography",
    category: "photography",
    tagline: "Capturing your story in stunning detail. Weddings, portraits, and commercial photography.",
    phone: "(360) 555-0115",
    address: "500 State Ave, Olympia, WA",
    about: "Blue Ridge Photography specializes in natural-light portraiture and documentary-style wedding photography. We believe the best photos happen when people are relaxed and genuine — our job is to create that space.",
    services: [
      { name: "Wedding Photography", description: "Full-day coverage with a second shooter and edited gallery.", price: "From $3,500" },
      { name: "Family Portraits", description: "Outdoor and studio sessions for families of all sizes.", price: "From $350" },
      { name: "Headshots", description: "Professional headshots for LinkedIn and business use.", price: "$250" },
      { name: "Commercial", description: "Product, food, and architectural photography for businesses." },
    ],
    testimonials: [
      { name: "Lauren & Tyler M.", text: "Our wedding photos make us cry every time we look at them. Pure magic." },
      { name: "Nathan C.", text: "Best headshot I've ever had. Landed 3 interviews the week I updated LinkedIn." },
      { name: "Kim P.", text: "The family session was so relaxed. We were worried about our toddler but they captured perfect moments." },
    ],
  },
];
