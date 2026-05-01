-- One-shot rebuild of 6 inbound leads.
-- Mirror of scripts/build-inbound-batch.ts in pure SQL so Ben can run
-- it from Supabase SQL Editor without needing a local terminal.
--
-- Each lead: (1) updates the prospects row (business_name, category,
-- contact, status='ready_to_review', generated_site_url) and (2)
-- replaces the generated_sites.site_data JSONB row that /preview/[id]
-- reads.

-- ─── 1) ROLLFAST COACHING — fitness ─────────────────────────────────
update prospects set
  business_name = 'Rollfast Coaching',
  category = 'fitness',
  city = 'Tucson',
  state = 'AZ',
  address = 'Tucson, AZ',
  phone = '(317) 281-8479',
  email = 'mtanner@rollfast.us',
  current_website = 'https://coaching.rollfast.us',
  status = 'ready_to_review',
  generated_site_url = '/preview/49a18115-970d-4a32-9d2b-e050ee268285'
where id = '49a18115-970d-4a32-9d2b-e050ee268285';

delete from generated_sites where prospect_id = '49a18115-970d-4a32-9d2b-e050ee268285';
insert into generated_sites (prospect_id, site_data) values (
  '49a18115-970d-4a32-9d2b-e050ee268285',
  jsonb_build_object(
    'id', '49a18115-970d-4a32-9d2b-e050ee268285',
    'category', 'fitness',
    'businessName', 'Rollfast Coaching',
    'tagline', 'Ride faster. Be stronger. Live longer.',
    'heroTagline', 'Cycling coaching that goes beyond watts and race results.',
    'accentColor', '#dc2626',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #dc2626 0%, #0f172a 100%)',
    'phone', '(317) 281-8479',
    'address', 'Tucson, AZ',
    'city', 'Tucson, AZ',
    'about', 'Rollfast Coaching builds complete cyclists — combining structured training plans, longevity science, and holistic health. Founded by Coach Matt Tanner, we work with masters and competitive amateurs who want results that last beyond a single season. Bloodwork-informed planning. AI-assisted data interpretation. Real coaching from a human who''s been in the saddle.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
      'https://images.unsplash.com/photo-1520003306828-faf09acd6018?w=1200&q=80',
      'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=1200&q=80',
      'https://images.unsplash.com/photo-1605459405316-3a89c1b9aa01?w=1200&q=80',
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80',
      'https://images.unsplash.com/photo-1587684149636-b3eb20ee3a5e?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Personalized Coaching Plans','description','Custom training plans that adapt to your work, travel, and life — not generic templates.'),
      jsonb_build_object('name','Longevity Audit','description','Bloodwork-informed performance analysis. Hormones, inflammation, recovery — the metrics that determine how you feel on the bike.'),
      jsonb_build_object('name','DOM AI Data Interpretation','description','Pull your data from every platform you use. We turn the noise into signal so you train on what matters.'),
      jsonb_build_object('name','Tucson Training Camps','description','Multi-day group rides in cycling''s best winter destination — open to riders of all levels.'),
      jsonb_build_object('name','Weekly Group Coaching (Zoom)','description','Live community calls where you bring real questions, real victories, and real challenges.'),
      jsonb_build_object('name','Strength + Mobility Programming','description','Structured strength integration that complements your bike work instead of stealing from it.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Morgan C.','text','Matt''s coaching gave me valuable skills on the bike — from reading terrain to refining race tactics. Bella Vista, AR.','rating',5),
      jsonb_build_object('name','Mike G.','text','My whole life feels rejuvenated. The wholistic coaching approach has made me better both on and off the bike. Saskatoon, SK.','rating',5),
      jsonb_build_object('name','Carl H.','text','His expertise in nutrition, fueling, and race strategy is top-notch. Lafayette, CO.','rating',5),
      jsonb_build_object('name','Mike C.','text','I finished every event significantly faster, with better results. Chicago, IL.','rating',5),
      jsonb_build_object('name','Paul V.','text','Significant improvement in climbing abilities and overall power. Montgomery, TX.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','500+','label','Athletes Coached'),
      jsonb_build_object('value','15+','label','Years Coaching'),
      jsonb_build_object('value','Tucson','label','Training Camp'),
      jsonb_build_object('value','5.0★','label','Athlete Rating')
    ),
    'hours', 'Coaching available year-round',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- ─── 2) WAYS EXECUTIVE SEDAN — event-planning ───────────────────────
update prospects set
  business_name = 'Ways Executive Sedan',
  category = 'event-planning',
  city = 'Washington',
  state = 'DC',
  address = 'Serving Washington DC, Maryland, and Virginia',
  phone = '(571) 491-7351',
  email = 'reservation@wayscs.com',
  current_website = 'https://www.wayscs.com',
  status = 'ready_to_review',
  generated_site_url = '/preview/64bfbe30-e25b-4009-b991-219d744614d3'
where id = '64bfbe30-e25b-4009-b991-219d744614d3';

delete from generated_sites where prospect_id = '64bfbe30-e25b-4009-b991-219d744614d3';
insert into generated_sites (prospect_id, site_data) values (
  '64bfbe30-e25b-4009-b991-219d744614d3',
  jsonb_build_object(
    'id', '64bfbe30-e25b-4009-b991-219d744614d3',
    'category', 'event-planning',
    'businessName', 'Ways Executive Sedan',
    'tagline', 'Premium black car and limousine service for the DMV.',
    'heroTagline', 'Arrive in style. Every event. Every airport. Every time.',
    'accentColor', '#1e3a8a',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    'phone', '(571) 491-7351',
    'address', 'Serving Washington DC, Maryland, and Virginia',
    'city', 'Washington, DC',
    'about', 'Since 2017, Ways Executive Sedan has been the trusted black car and limousine service for the Washington DC metro area. Our chauffeured fleet of Cadillac Escalades, Mercedes S-Class sedans, and Sprinter vans delivers VIP-grade transportation for airport transfers, corporate travel, weddings, and special events. Government-cleared. Embassy-experienced. 24/7 dispatch.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80',
      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223523-499621ad28e8?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Airport Transfers','description','Seamless luxury pickups and drop-offs at DCA, IAD, and BWI. Flight tracked. Driver waiting.'),
      jsonb_build_object('name','Executive Chauffeur','description','Discreet, professional transportation for corporate meetings, deal closings, and roadshows.'),
      jsonb_build_object('name','Wedding Limo Service','description','Elegant rides for the bride, groom, and wedding party — choreographed to your timeline.'),
      jsonb_build_object('name','Corporate & Government','description','Embassy-cleared chauffeurs experienced with diplomatic protocol and security requirements.'),
      jsonb_build_object('name','Hourly Charters','description','By-the-hour vehicles for nights out, winery tours, and multi-stop business days.'),
      jsonb_build_object('name','Group Sprinter Vans','description','Mercedes Sprinter Vans seating up to 14 — perfect for corporate teams and event groups.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Corporate client','text','Ways has been our go-to for executive transport for three years. Always early, never an issue.','rating',5),
      jsonb_build_object('name','Wedding party','text','Driver was a pro — handled our chaotic timeline like he''d done our wedding ten times before.','rating',5),
      jsonb_build_object('name','Frequent traveler','text','When my flight got delayed two hours, the driver waited without complaint. That''s rare.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','9+','label','Years Serving DMV'),
      jsonb_build_object('value','24/7','label','Dispatch'),
      jsonb_build_object('value','DCA·IAD·BWI','label','All Airports'),
      jsonb_build_object('value','5.0★','label','Client Rating')
    ),
    'hours', '24/7 — by reservation',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- ─── 3) KV TILEWORKS — general-contractor ───────────────────────────
update prospects set
  business_name = 'KV Tileworks',
  category = 'general-contractor',
  city = 'Sanford',
  state = 'FL',
  address = 'Sanford, FL 32771',
  phone = '(407) 990-1000',
  email = 'JamesV@kvtileworks.com',
  current_website = 'https://www.kvtileworks.com',
  status = 'ready_to_review',
  generated_site_url = '/preview/7d4552f1-8c09-4d6d-8f26-3d645fb26ca3'
where id = '7d4552f1-8c09-4d6d-8f26-3d645fb26ca3';

delete from generated_sites where prospect_id = '7d4552f1-8c09-4d6d-8f26-3d645fb26ca3';
insert into generated_sites (prospect_id, site_data) values (
  '7d4552f1-8c09-4d6d-8f26-3d645fb26ca3',
  jsonb_build_object(
    'id', '7d4552f1-8c09-4d6d-8f26-3d645fb26ca3',
    'category', 'general-contractor',
    'businessName', 'KV Tileworks',
    'tagline', 'Central Florida''s premier tile contractor.',
    'heroTagline', 'Precision work. Every surface. Every job.',
    'accentColor', '#0891b2',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #0891b2 0%, #0f172a 100%)',
    'phone', '(407) 990-1000',
    'address', 'Sanford, FL 32771',
    'city', 'Sanford, FL',
    'about', 'KV Tileworks is an owner-operated tile contractor serving Central Florida — from luxury home builders to homeowners doing one bathroom they''ll love forever. James and Andrew bring 15+ years combined experience to every job. Custom shower designs, frameless glass, large-format tile, waterproof membrane done right. Written estimates with no surprises. Fully insured.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1601084881623-cdf9a8ea242c?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Bathroom Tile & Remodels','description','Floors, walls, custom showers — designed and installed for the home you actually want to live in.'),
      jsonb_build_object('name','Tub-to-Shower Conversions','description','Convert that unused tub to a custom walk-in shower. Waterproofing done right the first time.'),
      jsonb_build_object('name','Custom Shower Features','description','Niches, benches, frameless glass — the details that make a bathroom feel custom-built.'),
      jsonb_build_object('name','New Construction','description','Tile subcontracting for luxury home builders across Seminole, Volusia, Orange, Lake, and Osceola counties.'),
      jsonb_build_object('name','Backsplashes & Accent Walls','description','Kitchen backsplashes, fireplace surrounds, and statement walls in porcelain, ceramic, natural stone, glass.'),
      jsonb_build_object('name','Material Selection Help','description','Bring photos and inspiration — we help you pick tile that fits your home, your budget, and your timeline.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Jenny Farrell','text','Provided an exceptional experience from start to finish. Attention to detail was second to none.','rating',5),
      jsonb_build_object('name','Ja Ly','text','Had them out to give an estimate and the owner was very thorough. Couldn''t be happier with the work.','rating',5),
      jsonb_build_object('name','Central FL homeowner','text','James walked us through every option without pushing the most expensive one. The shower turned out perfect.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','15+','label','Years Combined Experience'),
      jsonb_build_object('value','Owner','label','On Every Job'),
      jsonb_build_object('value','5','label','Counties Served'),
      jsonb_build_object('value','5.0★','label','Google Rating')
    ),
    'hours', 'Mon–Fri 8am–6pm · Sat by appointment',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- ─── 5) DANIEL CONSULTING GROUP — law-firm ──────────────────────────
update prospects set
  business_name = 'Daniel Consulting Group',
  category = 'law-firm',
  city = 'Somerville',
  state = 'MA',
  address = '444 Somerville Ave, Somerville, MA 02143',
  phone = '(617) 997-3235',
  email = 'reece@danielconsultinggroup.com',
  current_website = 'https://www.danielconsultinggroup.com',
  status = 'ready_to_review',
  generated_site_url = '/preview/37281f0b-a619-4938-9b16-1fb3e4563c09'
where id = '37281f0b-a619-4938-9b16-1fb3e4563c09';

delete from generated_sites where prospect_id = '37281f0b-a619-4938-9b16-1fb3e4563c09';
insert into generated_sites (prospect_id, site_data) values (
  '37281f0b-a619-4938-9b16-1fb3e4563c09',
  jsonb_build_object(
    'id', '37281f0b-a619-4938-9b16-1fb3e4563c09',
    'category', 'law-firm',
    'businessName', 'Daniel Consulting Group',
    'tagline', 'Battery technology consulting that powers success.',
    'heroTagline', 'From benchtop to manufacturing — the consulting partner serious battery teams trust.',
    'accentColor', '#1e40af',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
    'phone', '(617) 997-3235',
    'address', '444 Somerville Ave, Somerville, MA 02143',
    'city', 'Somerville, MA',
    'about', 'Daniel Consulting Group is a battery-technology consulting firm based in Somerville, Massachusetts. With 18+ years of industry experience, we help academic labs, startups, and consumer-product companies move from early-stage chemistry to commercial-scale manufacturing. Contract testing. Equipment sourcing. Lab buildout. Custom hardware. The trusted advisor named by clients including Beta, Ambri, Form Energy, and MIT.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&q=80',
      'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=80',
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Contract Battery Testing','description','In-house cell cycling and characterization with calibrated cyclers — turnkey reports your engineers can act on.'),
      jsonb_build_object('name','Equipment Sourcing & Sales','description','Authorized Neware Battery Tester distributor. We size and spec the right cycler for your roadmap.'),
      jsonb_build_object('name','R&D Lab Setup','description','End-to-end lab planning — from electrical and HVAC requirements through equipment commissioning.'),
      jsonb_build_object('name','Custom Hardware Design','description','Specialized test chambers and fixtures for novel cell chemistries that don''t fit off-the-shelf hardware.'),
      jsonb_build_object('name','Pilot-to-Manufacturing Scaling','description','We''ve walked teams from coin-cell experiments through pilot to commercial scale. We know what breaks.'),
      jsonb_build_object('name','Investor Due Diligence','description','Independent technical due diligence on battery investments — what the pitch deck doesn''t tell you.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Battery startup CEO','text','Daniel Consulting saved us six months of trial and error. They knew exactly which cycler we needed and why.','rating',5),
      jsonb_build_object('name','Academic lab director','text','Set up our entire battery research lab in three months. Still our go-to when we have hardware questions.','rating',5),
      jsonb_build_object('name','Investor partner','text','Their technical due diligence flagged risks two other firms missed. Saved us from a bad deal.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','18+','label','Years Industry Experience'),
      jsonb_build_object('value','Beta·Ambri·MIT','label','Trusted Clients'),
      jsonb_build_object('value','Neware','label','Authorized Distributor'),
      jsonb_build_object('value','Boston','label','Greater Boston HQ')
    ),
    'hours', 'By appointment',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- ─── 7) HEALE — medical (mental health / clinical social work) ──────
update prospects set
  business_name = 'Heale',
  category = 'medical',
  city = 'Modesto',
  state = 'CA',
  address = '3425 Coffee Road, Suite 1A, Modesto, CA 95355',
  phone = '(209) 567-2599',
  email = 'connect@heale.me',
  current_website = 'https://heale.me',
  status = 'ready_to_review',
  generated_site_url = '/preview/b44112dd-5851-4153-9f81-68aaca29b1d4'
where id = 'b44112dd-5851-4153-9f81-68aaca29b1d4';

delete from generated_sites where prospect_id = 'b44112dd-5851-4153-9f81-68aaca29b1d4';
insert into generated_sites (prospect_id, site_data) values (
  'b44112dd-5851-4153-9f81-68aaca29b1d4',
  jsonb_build_object(
    'id', 'b44112dd-5851-4153-9f81-68aaca29b1d4',
    'category', 'medical',
    'businessName', 'Heale',
    'tagline', 'Where the legal system meets the human need for healing.',
    'heroTagline', 'Court-ready. Clinically sound. Genuinely human.',
    'accentColor', '#0d9488',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)',
    'phone', '(209) 567-2599',
    'address', '3425 Coffee Road, Suite 1A, Modesto, CA 95355',
    'city', 'Modesto, CA',
    'about', 'Heale is a Professional Licensed Clinical Social Work Corporation based in Modesto, CA. Founded by Melissa Hale, LCSW, our team supports families and individuals navigating both mental health challenges and the legal system — therapy, supervised visitation, parenting evaluations, and structured curriculum-based programs. We bridge clinical care and forensic precision so courts get what they need and clients feel genuinely supported.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1559548331-f9cb98280344?w=1600&q=80',
      'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=1200&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Mental Health Therapy','description','Confidential individual and family therapy with licensed clinical social workers. By appointment.'),
      jsonb_build_object('name','Court-Connected Services','description','Specialized clinical services for clients navigating family court, dependency court, or criminal proceedings.'),
      jsonb_build_object('name','Forensic Support','description','Supervised visitation, parenting assessments, and clinical evaluations admissible in court.'),
      jsonb_build_object('name','Structured Programs','description','Curriculum-based programs (anger management, parenting, co-parenting) with court-recognized completion certificates.'),
      jsonb_build_object('name','Court-Ordered Services','description','Compliant, documented, and timely. We coordinate directly with attorneys and courts when authorized.'),
      jsonb_build_object('name','Voluntary Support Services','description','Not court-involved? Walk-in mental health support without the legal complexity.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Family law attorney','text','Reports are timely, thorough, and ready for court. Heale is one of the few providers I trust without question.','rating',5),
      jsonb_build_object('name','Client (anonymous)','text','Walked in scared of the system. Walked out feeling like an actual human being heard me.','rating',5),
      jsonb_build_object('name','Co-parenting program participant','text','The curriculum was structured but never felt like a lecture. I actually use what I learned.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','LCSW','label','Licensed Team'),
      jsonb_build_object('value','Court-Ready','label','Forensic Reports'),
      jsonb_build_object('value','By Appt.','label','Confidential'),
      jsonb_build_object('value','Modesto','label','Central Valley')
    ),
    'hours', 'By appointment only',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- ─── 8) TACOS YUM — restaurant ──────────────────────────────────────
update prospects set
  business_name = 'Tacos Yum',
  category = 'restaurant',
  city = 'Unknown',
  state = '',
  address = 'Address pending — contact Bob',
  phone = '',
  email = 'bobstaco@tacosyum.com',
  current_website = 'https://tacosyum.com',
  status = 'ready_to_review',
  generated_site_url = '/preview/716878a6-00d7-491f-8216-40bec9c8f75d'
where id = '716878a6-00d7-491f-8216-40bec9c8f75d';

delete from generated_sites where prospect_id = '716878a6-00d7-491f-8216-40bec9c8f75d';
insert into generated_sites (prospect_id, site_data) values (
  '716878a6-00d7-491f-8216-40bec9c8f75d',
  jsonb_build_object(
    'id', '716878a6-00d7-491f-8216-40bec9c8f75d',
    'category', 'restaurant',
    'businessName', 'Tacos Yum',
    'tagline', 'Tacos worth driving for.',
    'heroTagline', 'Real ingredients. Bold flavor. Made fast.',
    'accentColor', '#dc2626',
    'brandColorSource', 'official-site',
    'heroGradient', 'linear-gradient(135deg, #dc2626 0%, #0f172a 100%)',
    'phone', '',
    'address', 'Address pending',
    'city', 'TBD',
    'about', 'Tacos Yum is a taco shop serving fresh, made-to-order tacos with real ingredients and bold flavor. From the classic carne asada to vegetarian options that don''t feel like an afterthought, every taco is built on hand-pressed tortillas and house-made salsas. Open for lunch, dinner, and late-night cravings.',
    'photos', jsonb_build_array(
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1600&q=80',
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=80',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&q=80',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&q=80',
      'https://images.unsplash.com/photo-1576367035905-c0024e1add14?w=1200&q=80',
      'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=1200&q=80'
    ),
    'services', jsonb_build_array(
      jsonb_build_object('name','Carne Asada Tacos','description','Marinated grilled steak, hand-pressed corn tortillas, fresh cilantro and onion.'),
      jsonb_build_object('name','Al Pastor','description','Trompo-cooked pork with pineapple, onion, and house salsa verde.'),
      jsonb_build_object('name','Veggie Tacos','description','Roasted poblano, charred corn, black beans, queso fresco — vegetarians don''t get the boring option.'),
      jsonb_build_object('name','Burritos & Bowls','description','Build-your-own with the same quality ingredients as our tacos.'),
      jsonb_build_object('name','Catering','description','Taco bars for offices, parties, and weddings. We bring the trompo to you.'),
      jsonb_build_object('name','Online Ordering','description','Skip the line — order ahead for pickup.')
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object('name','Local regular','text','Best tacos in town and I''ve tried them all. The carne asada is unreal.','rating',5),
      jsonb_build_object('name','First timer','text','Showed up for lunch, came back for dinner. That should tell you everything.','rating',5),
      jsonb_build_object('name','Catering client','text','Catered our office launch party. Watching the trompo guy in action was as good as the tacos.','rating',5)
    ),
    'stats', jsonb_build_array(
      jsonb_build_object('value','Hand-pressed','label','Tortillas'),
      jsonb_build_object('value','House-made','label','Salsas'),
      jsonb_build_object('value','Fast','label','Service'),
      jsonb_build_object('value','5.0★','label','Customer Rating')
    ),
    'hours', 'Daily 11am–10pm (verify on call)',
    'themeMode', 'dark',
    'hideBeforeAfter', true,
    'suppressClaimUi', false
  )
);

-- Reload PostgREST cache so the API sees fresh rows immediately
notify pgrst, 'reload schema';

-- Verify all 6 are now ready_to_review with right categories
select business_name, category, status,
  'https://bluejayportfolio.com/preview/' || id as preview_url
from prospects
where id in (
  '49a18115-970d-4a32-9d2b-e050ee268285',
  '64bfbe30-e25b-4009-b991-219d744614d3',
  '7d4552f1-8c09-4d6d-8f26-3d645fb26ca3',
  '37281f0b-a619-4938-9b16-1fb3e4563c09',
  'b44112dd-5851-4153-9f81-68aaca29b1d4',
  '716878a6-00d7-491f-8216-40bec9c8f75d'
)
order by business_name;
