#!/usr/bin/env python3
"""
Olympic Inspections & Testing — local-SEO page engine.

Generates city x service landing pages for the Olympic Peninsula + surrounding
areas (Clallam, Jefferson, Kitsap counties). Each page mirrors the approved
hand-built template (mold-inspection-sequim-wa.html) exactly — same CSS/JS,
same section structure — but with genuinely localized copy per city so Google
never sees a doorway/thin-content pattern.

Run:  python scripts/generate-oit-seo-pages.py
Out:  public/sites/olympic-inspections/<slug>.html  (one file per page)
      + prints the next.config.ts regex alternation + sitemap entries to paste.

The 5 existing hand-built pages are SKIPPED (kept as-is, they're indexed):
  mold-inspection-sequim-wa, ermi-testing-olympic-peninsula,
  well-water-testing-sequim, radon-testing-port-angeles,
  septic-inspection-clallam-county
"""

import json
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "sites", "olympic-inspections")
ASSET = "/sites/olympic-inspections"
CANON = "https://www.olympicinspect.com"
PHONE = "(360) 670-3367"
TEL = "3606703367"
EMAIL = "info@olympicinspect.com"

# ---------------------------------------------------------------------------
# CITY DATA — coords for geo meta, county, nearby towns folded in, and a
# genuinely-unique local-risk paragraph per city (the anti-doorway content).
# ---------------------------------------------------------------------------
CITIES = {
    "sequim": {
        "name": "Sequim", "county": "Clallam", "lat": 48.0794, "lng": -123.1006,
        "nearby": ["Carlsborg", "Blyn", "Diamond Point", "Gardiner"],
        "blurb": "in Sequim and the Dungeness Valley",
        "mold": "Sequim sits in the Olympic rain shadow, so homeowners often assume the dry climate rules out mold — but irrigation ditches, the high water table in the Dungeness Valley, and a large stock of older single-level and manufactured homes mean crawlspace moisture and condensation problems are common. Retiree-owned homes that sit empty part of the year are especially prone to undetected growth.",
        "radon": "Clallam County has documented pockets of elevated radon, and Sequim's gravelly glacial soils can channel soil gas into crawlspaces and slab foundations.",
        "water": "Many homes outside Sequim city limits and across the Dungeness Valley run on private wells drawing from the shallow aquifer — making coliform, nitrate, and arsenic testing important before a sale or after a dry summer.",
        "septic": "Properties throughout the Dungeness Valley and rural Sequim run on private septic systems that Washington State requires inspected every two to three years.",
    },
    "port-angeles": {
        "name": "Port Angeles", "county": "Clallam", "lat": 48.1181, "lng": -123.4307,
        "nearby": ["Joyce", "Agnew", "Dry Creek", "Elwha"],
        "blurb": "in Port Angeles and along the Strait",
        "mold": "As the largest city on the north Olympic Peninsula, Port Angeles has a deep stock of early-1900s waterfront and hillside homes that take the full brunt of marine air off the Strait of Juan de Fuca. Persistent humidity, aging single-pane windows, and unvented crawlspaces make hidden moisture and mold a recurring issue in the older neighborhoods near the harbor and downtown.",
        "radon": "Port Angeles homes built into the hillside, and any with finished basements or daylight crawlspaces, can trap radon gas migrating up through the foundation.",
        "water": "Homes in Joyce, Agnew, and the rural stretches west and east of Port Angeles frequently rely on private wells — coliform, nitrate, lead, and arsenic panels are routinely needed for real-estate and peace-of-mind testing.",
        "septic": "Rural parcels around Port Angeles, Agnew, and Joyce run on septic systems that lenders require inspected for any real-estate transaction on a private system.",
    },
    "forks": {
        "name": "Forks", "county": "Clallam", "lat": 47.9504, "lng": -124.3855,
        "nearby": ["Beaver", "Sappho", "La Push", "Quillayute"],
        "blurb": "in Forks and the West End",
        "mold": "Forks is one of the wettest towns in the continental United States, routinely topping 100 inches of rain a year. That relentless moisture load — combined with a timber-town housing stock, abundant crawlspaces, and homes tucked into the rainforest canopy with little sun — makes the West End the single highest mold-risk area we serve. If there's a damp-building problem anywhere on the Peninsula, it's usually here.",
        "water": "Nearly every home outside the Forks city core runs on a private well, and the high rainfall raises the odds of surface-water intrusion and coliform — making water testing a near-default for West End real-estate deals.",
    },
    "port-townsend": {
        "name": "Port Townsend", "county": "Jefferson", "lat": 48.1170, "lng": -122.7604,
        "nearby": ["Cape George", "Glen Cove", "Kala Point", "Marrowstone"],
        "blurb": "in Port Townsend and East Jefferson County",
        "mold": "Port Townsend's celebrated Victorian seaport means an unusually old housing stock — many homes date to the 1880s and 1890s. Original lath-and-plaster walls, balloon framing, stone foundations, and a century of marine humidity off the bay create exactly the conditions hidden mold thrives in. Historic-district homes need an inspector who understands old buildings, not just new construction.",
        "radon": "Jefferson County's varied glacial soils produce localized radon pockets, and Port Townsend's older homes with basements and root cellars can accumulate it.",
        "water": "Outlying areas like Cape George, Marrowstone Island, and the Quimper Peninsula rely heavily on private wells where coliform, nitrate, and saltwater-intrusion testing matters.",
        "septic": "Most properties outside Port Townsend's city sewer — Cape George, Kala Point, Marrowstone — run on septic systems requiring periodic inspection under Washington State rules.",
    },
    "port-hadlock": {
        "name": "Port Hadlock", "county": "Jefferson", "lat": 48.0335, "lng": -122.7693,
        "nearby": ["Irondale", "Chimacum", "Marrowstone"],
        "blurb": "in Port Hadlock and the Tri-Area",
        "mold": "Port Hadlock and the surrounding Tri-Area sit low along Port Townsend Bay, where marine humidity, a mix of older waterfront cottages and newer rural builds, and widespread crawlspace foundations combine to make moisture intrusion common. Homes on shaded or wooded lots that get little drying sun are especially prone to undetected growth.",
        "septic": "The Tri-Area is overwhelmingly septic-served, and Washington State requires those systems inspected every two to three years and before any property sale.",
    },
    "chimacum": {
        "name": "Chimacum", "county": "Jefferson", "lat": 48.0085, "lng": -122.7768,
        "nearby": ["Center", "Port Hadlock", "Beaver Valley"],
        "blurb": "in Chimacum and the Beaver Valley",
        "mold": "Chimacum's rural farming valley is dotted with older farmhouses, barns converted to living space, and homes on damp valley-bottom lots. Agricultural moisture, well-water humidity, and aging foundations make crawlspace and basement mold a frequent finding in this part of Jefferson County.",
        "septic": "Chimacum and the Beaver Valley are almost entirely on private septic and wells — inspections are routinely needed for sales, refinances, and the state's biennial requirement.",
    },
    "quilcene": {
        "name": "Quilcene", "county": "Jefferson", "lat": 47.8226, "lng": -122.8771,
        "nearby": ["Brinnon", "Dabob", "Coyle"],
        "blurb": "in Quilcene and along Hood Canal",
        "mold": "Quilcene and the Hood Canal shoreline are heavily wooded, shaded, and damp — cabins, vacation homes, and year-round residences here sit under dense tree cover that keeps roofs and crawlspaces from ever fully drying out. Seasonal homes that sit closed up for months are a classic setup for the hidden mold we find most often along the canal.",
        "septic": "Shoreline and rural Hood Canal properties around Quilcene and Brinnon are septic-served, with state inspection requirements that matter especially for the area's many vacation-home sales.",
    },
    "port-ludlow": {
        "name": "Port Ludlow", "county": "Jefferson", "lat": 47.9223, "lng": -122.6857,
        "nearby": ["Mats Mats", "Paradise Bay", "Shine"],
        "blurb": "in Port Ludlow and North Jefferson County",
        "mold": "Port Ludlow's resort and retirement community is built into a forested hillside above the bay, with wooded lots, crawlspace foundations, and many homes owned by part-time residents. Shaded exposures, decks and additions over crawlspaces, and homes that sit empty seasonally all raise the odds of moisture problems that go unnoticed until an inspection finds them.",
        "septic": "Many Port Ludlow and North Jefferson properties run on private septic systems subject to Washington's periodic-inspection and point-of-sale requirements.",
    },
    "bremerton": {
        "name": "Bremerton", "county": "Kitsap", "lat": 47.5673, "lng": -122.6329,
        "nearby": ["East Bremerton", "Tracyton", "Gorst", "Chico"],
        "blurb": "in Bremerton and central Kitsap",
        "mold": "Bremerton's dense, older housing stock — much of it built for shipyard workers during and after the World War II era — combines aging construction, basements, and Puget Sound humidity in a way that makes mold a frequent finding. Naval-era homes near the waterfront and in the older neighborhoods often have decades of accumulated moisture issues behind the walls.",
        "radon": "Kitsap County sits on glacial till that can carry elevated radon, and Bremerton's many basement and daylight-basement homes are exactly the construction style that traps it.",
        "water": "While much of Bremerton is on city water, surrounding central-Kitsap areas like Tracyton and Chico include well-served homes where coliform and nitrate testing is needed.",
    },
    "silverdale": {
        "name": "Silverdale", "county": "Kitsap", "lat": 47.6448, "lng": -122.6951,
        "nearby": ["Chico", "Tracyton", "Seabeck", "Bangor"],
        "blurb": "in Silverdale and around Dyes Inlet",
        "mold": "Silverdale's mix of newer subdivisions and older homes around Dyes Inlet means moisture problems show up across the board — from condensation and ventilation issues in tightly-sealed newer builds to crawlspace and roof-leak mold in the older waterfront homes. The Puget Sound marine climate keeps the baseline humidity high year-round.",
        "radon": "Central Kitsap's glacial soils produce localized radon, and Silverdale-area homes with daylight basements or slab foundations can accumulate it.",
        "water": "Outlying Silverdale, Seabeck, and Bangor-area homes frequently rely on private wells where a full coliform, nitrate, and metals panel is worth running before a sale.",
    },
    "poulsbo": {
        "name": "Poulsbo", "county": "Kitsap", "lat": 47.7362, "lng": -122.6468,
        "nearby": ["Keyport", "Lemolo", "Suquamish", "Bangor"],
        "blurb": "in Poulsbo and North Kitsap",
        "mold": "Poulsbo's waterfront homes along Liberty Bay take constant marine humidity off the water, and the area's wooded north-Kitsap lots keep many properties shaded and slow to dry. The mix of historic 'Little Norway' downtown buildings and newer forested subdivisions both produce the hidden-moisture conditions that lead to mold.",
        "radon": "North Kitsap's glacial till can carry radon into basement and crawlspace homes around Poulsbo.",
        "water": "Rural North Kitsap — Lemolo, Keyport, and the wooded acreage outside town — includes many well-served homes where water testing is a standard part of due diligence.",
    },
    "port-orchard": {
        "name": "Port Orchard", "county": "Kitsap", "lat": 47.5404, "lng": -122.6362,
        "nearby": ["Manchester", "Retsil", "South Kitsap", "Olalla"],
        "blurb": "in Port Orchard and South Kitsap",
        "mold": "Port Orchard's older waterfront homes along Sinclair Inlet, combined with South Kitsap's many crawlspace-foundation rural builds, create persistent moisture conditions. Marine air, shaded lots, and aging foundations mean hidden mold is a regular finding from the downtown waterfront out to Olalla and Manchester.",
    },
    "bainbridge-island": {
        "name": "Bainbridge Island", "county": "Kitsap", "lat": 47.6262, "lng": -122.5212,
        "nearby": ["Winslow", "Rolling Bay", "Lynwood Center", "Eagledale"],
        "blurb": "on Bainbridge Island",
        "mold": "Bainbridge Island's high-value, heavily-wooded properties are surrounded by tree cover that keeps roofs, decks, and crawlspaces damp and slow-drying. The island's mix of historic homes and architect-built moderns both develop moisture problems — and on homes at this value, an independent, no-upsell mold report protects a significant investment during a sale.",
        "water": "Parts of Bainbridge outside the Winslow core rely on private wells and shared water systems where coliform and nitrate testing is an important due-diligence step.",
    },
}

# County hub metadata (county-level overview pages)
COUNTIES = {
    "clallam": {"name": "Clallam County", "lat": 48.1181, "lng": -123.4307,
                "seat": "Port Angeles",
                "cities": ["Sequim", "Port Angeles", "Forks"],
                "blurb": "the north Olympic Peninsula"},
    "jefferson": {"name": "Jefferson County", "lat": 48.1170, "lng": -122.7604,
                  "seat": "Port Townsend",
                  "cities": ["Port Townsend", "Port Hadlock", "Chimacum", "Quilcene", "Port Ludlow"],
                  "blurb": "the eastern Olympic Peninsula and Hood Canal"},
    "kitsap": {"name": "Kitsap County", "lat": 47.5673, "lng": -122.6329,
               "seat": "Port Orchard",
               "cities": ["Bremerton", "Silverdale", "Poulsbo", "Port Orchard", "Bainbridge Island"],
               "blurb": "the Kitsap Peninsula across Hood Canal"},
}

# Existing hand-built pages — never overwrite, but DO cross-link to them.
EXISTING = {
    "mold-inspection-sequim-wa", "ermi-testing-olympic-peninsula",
    "well-water-testing-sequim", "radon-testing-port-angeles",
    "septic-inspection-clallam-county",
}

# ---------------------------------------------------------------------------
# Which pages to generate. Each entry: (service_key, city_key)
# ---------------------------------------------------------------------------
MOLD_CITIES = ["port-angeles", "forks", "port-townsend", "port-hadlock", "chimacum",
               "quilcene", "port-ludlow", "bremerton", "silverdale", "poulsbo",
               "port-orchard", "bainbridge-island"]              # sequim exists
RADON_CITIES = ["sequim", "port-townsend", "bremerton", "silverdale", "poulsbo"]  # PA exists
WATER_CITIES = ["port-angeles", "port-townsend", "bremerton", "silverdale", "poulsbo"]  # sequim exists
SEPTIC_CITIES = ["sequim", "port-angeles", "port-townsend"]      # Clallam+Jefferson only; clallam-county hub exists

# ---------------------------------------------------------------------------
# Shared chunks
# ---------------------------------------------------------------------------
def head(title, desc, slug, city_meta):
    geo = ""
    if city_meta:
        geo = f"""
    <meta name="geo.region" content="US-WA">
    <meta name="geo.placename" content="{city_meta['name']}">
    <meta name="geo.position" content="{city_meta['lat']};{city_meta['lng']}">
    <meta name="ICBM" content="{city_meta['lat']}, {city_meta['lng']}">"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">

    <link rel="canonical" href="{CANON}/{slug}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">{geo}

    <meta property="og:type" content="website">
    <meta property="og:url" content="{CANON}/{slug}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="{CANON}{ASSET}/logo.png">
    <meta property="og:site_name" content="Olympic Inspections &amp; Testing">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{CANON}{ASSET}/logo.png">

    <meta name="theme-color" content="#1f4d2c">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{ASSET}/css/styles.css">
    <link rel="icon" type="image/png" href="{ASSET}/logo.png">
    <link rel="apple-touch-icon" href="{ASSET}/logo.png">
"""

def jsonld_block(obj):
    return '    <script type="application/ld+json">\n' + json.dumps(obj, indent=2, ensure_ascii=False) + "\n    </script>\n"

NAV = f"""</head>
<body>

    <nav id="navbar">
        <div class="container nav-inner">
            <a href="/" class="nav-logo" aria-label="Olympic Inspections & Testing home">
                <img src="{ASSET}/logo.png" alt="Olympic Inspections &amp; Testing" class="nav-brand-img" width="240" height="240" />
            </a>
            <div class="nav-links">
                <a href="/#services">Services</a>
                <a href="/#markets">Markets</a>
                <a href="/#locations">Locations</a>
                <a href="/#about">About</a>
                <a href="/#calculator">Pricing</a>
                <a href="/#faq">FAQ</a>
                <a href="/#book" class="nav-cta">Book Inspection</a>
            </div>
            <button class="hamburger" aria-label="Open menu" id="hamburgerBtn"><span></span><span></span><span></span></button>
        </div>
    </nav>

    <div class="mobile-drawer" id="mobileDrawer">
        <button class="mobile-close" id="mobileClose" aria-label="Close menu">&times;</button>
        <a href="/#services">Services</a>
        <a href="/#markets">Markets</a>
        <a href="/#locations">Locations</a>
        <a href="/#about">About</a>
        <a href="/#process">How It Works</a>
        <a href="/#calculator">Pricing</a>
        <a href="/#faq">FAQ</a>
        <a href="/#book">Book Inspection</a>
    </div>
"""

TRUST_BAR = """
    <section class="trust-bar" aria-label="Why customers trust us">
        <div class="container">
            <div class="trust-bar-inner">
                <div class="trust-bar-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><polyline points="9 12 11 14 15 10"/></svg><span>Certified inspectors</span></div>
                <div class="trust-bar-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 5-4 9-9 9s-9-4-9-9 4-9 9-9c2 0 4 .5 6 2"/></svg><span>ISO/IEC 17025 lab</span></div>
                <div class="trust-bar-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Fast turnaround</span></div>
                <div class="trust-bar-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg><span>No upselling, ever</span></div>
            </div>
        </div>
    </section>
"""

def footer():
    return f"""
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div>
                    <div class="footer-mark">
                        <div class="footer-brand-coin"><img src="{ASSET}/logo.png" alt="Olympic Inspections &amp; Testing" class="footer-brand-img" width="240" height="240" /></div>
                        <div><strong>Olympic Inspections &amp; Testing</strong><small>Mold &middot; Radon &middot; Water</small></div>
                    </div>
                    <p style="font-size: 0.9rem; color: rgba(250,246,238,0.65); line-height: 1.6; max-width: 320px;">Independent mold inspection &amp; air quality testing across the Olympic Peninsula. Lab-backed reports in 3-5 days.</p>
                </div>
                <div>
                    <h4>Get in touch</h4>
                    <ul>
                        <li><a href="tel:{TEL}">{PHONE}</a></li>
                        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
                        <li>Sequim, WA 98382</li>
                    </ul>
                </div>
                <div>
                    <h4>Service areas</h4>
                    <ul>
                        <li><a href="/inspections-clallam-county">Clallam County</a></li>
                        <li><a href="/inspections-jefferson-county">Jefferson County</a></li>
                        <li><a href="/inspections-kitsap-county">Kitsap County</a></li>
                        <li><a href="/mold-inspection-sequim-wa">Mold Inspection</a></li>
                        <li><a href="/ermi-testing-olympic-peninsula">ERMI Testing</a></li>
                    </ul>
                </div>
            </div>
            <p class="footer-coverage">Serving the Olympic Peninsula &amp; Kitsap &mdash; if mold is hiding in your cabin in the woods, we&rsquo;re not afraid to go find it.</p>
            <div class="footer-bottom">
                <span>&copy; <span id="year">2026</span> Olympic Inspections &amp; Testing. All rights reserved.</span>
                <span class="footer-credit">
                    <a href="/clients/olympic-inspections/portal" class="oit-owner-key" aria-label="Owner sign-in" title="Owner sign-in"><svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26 6C22 4 17 5 14 8L8 14C6 16 6 19 8 21L10 23C8 25 6 27 4 28C7 28 10 27 12 25L14 27C16 29 19 29 21 27L27 21C30 18 31 13 29 9L26 6Z" fill="currentColor" opacity="0.85"/></svg></a>
                    Built by <a href="https://bluejayportfolio.com" target="_blank" rel="noopener">BlueJays</a> &mdash; get your free site audit
                </span>
            </div>
        </div>
    </footer>

    <button id="back-to-top" type="button" aria-label="Back to top" title="Back to top">
      <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/></svg>
    </button>

    <script src="{ASSET}/js/main.js"></script>
</body>
</html>
"""

def faq_html(faqs):
    items = []
    for q, a in faqs:
        items.append(f"""                <div class="faq-item">
                    <button class="faq-question"><span>{q}</span><span class="faq-arrow">&#9660;</span></button>
                    <div class="faq-answer"><p>{a}</p></div>
                </div>""")
    return ("\n").join(items)

def faq_jsonld(faqs):
    return {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a_plain}}
            for (q, _a_html, a_plain) in faqs
        ],
    }

def breadcrumb(name, slug):
    return {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{CANON}/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": f"{CANON}/{slug}"},
        ],
    }

def service_jsonld(service_type, name, desc, slug, area_names, offer=None):
    obj = {
        "@context": "https://schema.org", "@type": "Service",
        "@id": f"{CANON}/{slug}#service",
        "serviceType": service_type, "name": name,
        "provider": {"@type": "LocalBusiness", "name": "Olympic Inspections & Testing",
                     "@id": f"{CANON}/#business", "telephone": "+1-360-670-3367", "url": f"{CANON}/"},
        "areaServed": [{"@type": "City", "name": a} for a in area_names],
        "description": desc, "category": "Indoor Environmental Inspection",
    }
    if offer:
        obj["offers"] = offer
    return obj

def nearby_line(city):
    n = city.get("nearby", [])
    if not n:
        return ""
    return f"""
    <section class="markets">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Serving {city['name']} &amp; Nearby Communities</h2></div>
            <p class="section-sub reveal">Based on the Olympic Peninsula, we routinely serve {city['name']} and the surrounding {city['county']} County communities &mdash; including {', '.join(n[:-1])}, and {n[-1]}. Very rural or remote properties may include a small travel fee, always quoted in writing before we book.</p>
        </div>
    </section>
"""

# ---------------------------------------------------------------------------
# SERVICE PAGE BUILDERS
# ---------------------------------------------------------------------------
# Septic is fulfilled ONLY in these counties (per Ben, 2026-06-03). Never
# surface septic cross-links / service cards for cities outside them — we
# don't want to generate leads OIT can't fulfill.
SEPTIC_COUNTIES = {"Clallam", "Jefferson"}


def other_services_section(city_slug, exclude, city_name):
    """Cross-links to sibling service pages (city-specific when they exist, else canonical)."""
    links = []
    county = CITIES[city_slug]["county"] if city_slug in CITIES else None
    catalog = [
        ("mold", "🔬", "Mold Inspection", f"mold-inspection-{city_slug}", "mold-inspection-sequim-wa",
         "Thermal imaging, ISO 17025 lab, no-upsell reports from $150."),
        ("radon", "☢️", "Radon Testing", f"radon-testing-{city_slug}", "radon-testing-port-angeles",
         "Radon is the #2 cause of lung cancer. The Peninsula runs higher than average."),
        ("water", "💧", "Well Water Testing", f"well-water-testing-{city_slug}", "well-water-testing-sequim",
         "Coliform, nitrates, lead, arsenic, hardness, pH. Real-estate-ready results."),
        ("septic", "🚽", "Septic Inspection", f"septic-inspection-{city_slug}", "septic-inspection-clallam-county",
         "Inspection-only. WA requires inspection every 2 years on most systems."),
        ("ermi", "🧪", "ERMI Testing", "ermi-testing-olympic-peninsula", "ermi-testing-olympic-peninsula",
         "Environmental Relative Moldiness Index for documented exposure history."),
    ]
    for key, icon, title, city_page, canonical_page, blurb in catalog:
        if key == exclude:
            continue
        # Septic is geographically constrained — skip it for cities we don't serve.
        if key == "septic" and county not in SEPTIC_COUNTIES:
            continue
        href = f"/{city_page}" if (city_page in GENERATED_SLUGS or city_page in EXISTING) else f"/{canonical_page}"
        links.append(f"""                <a href="{href}" class="service-card reveal" style="text-decoration: none; color: inherit;">
                    <div class="service-icon" aria-hidden="true">{icon}</div>
                    <h3>{title} &rarr;</h3>
                    <p>{blurb}</p>
                </a>""")
    return f"""
    <section id="other-services" class="services">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Other Inspections We Offer in {city_name}</h2></div>
            <p class="section-sub reveal">Mold isn&rsquo;t the only thing that affects indoor air or property value. Same independent, lab-backed approach across every test we do.</p>
            <div class="services-grid">
{chr(10).join(links)}
            </div>
        </div>
    </section>
"""

def build_mold(city_slug):
    c = CITIES[city_slug]
    name, county = c["name"], c["county"]
    slug = f"mold-inspection-{city_slug}"
    title = f"Mold Inspection {name} WA &middot; From $150 | Olympic Inspections &amp; Testing"
    desc = f"Independent mold inspection in {name}, WA &amp; the Olympic Peninsula. Thermal imaging, ISO 17025 lab testing for 100+ mold types. Honest, no-upsell reports from $150."
    area = [c2["name"] for k2, c2 in CITIES.items() if c2["county"] == county] + [f"{county} County, WA", "Olympic Peninsula"]

    faqs = [
        (f"How much does a mold inspection cost in {name}, WA?",
         f"A complete mold inspection in {name} starts at <strong>$150</strong> &mdash; the most affordable certified option on the Olympic Peninsula. Thermal imaging is included. Lab samples are $85 (air) or $55 (surface) and only added if you want them. Most local competitors charge $1,500&ndash;$2,500 for the same scope.",
         f"A complete mold inspection in {name} starts at $150 — the most affordable certified option on the Olympic Peninsula. Thermal imaging is included. Lab samples are $85 (air) or $55 (surface) and only added if you want them. Most local competitors charge $1,500 to $2,500 for the same scope."),
        ("What does a mold inspection include?",
         "A non-invasive walkthrough of every accessible area, thermal imaging to find hidden moisture, humidity and moisture readings, and a written photo-documented report with sampling recommendations. If you opt in to lab samples, the lab tests for 100+ mold species and other particles.",
         "A non-invasive walkthrough of every accessible area, thermal imaging to find hidden moisture, humidity and moisture readings, and a written photo-documented report with sampling recommendations. If you opt in to lab samples, the lab tests for 100+ mold species and other particles."),
        (f"How do I know if I have mold in my {name} home?",
         "Common signs: persistent musty smell, visible discoloration, peeling paint, warped baseboards, ongoing respiratory symptoms after moving in, recent water damage. On the Peninsula, marine air, older homes, well water, and crawlspaces all raise the baseline risk.",
         "Common signs: persistent musty smell, visible discoloration, peeling paint, warped baseboards, ongoing respiratory symptoms after moving in, recent water damage. On the Peninsula, marine air, older homes, well water, and crawlspaces all raise the baseline risk."),
        ("Do you do mold inspections for real estate transactions?",
         "Yes. Reports are formatted for buyer/seller use and routinely shared with realtors, escrow officers, and insurance adjusters. We&rsquo;re independent &mdash; we don&rsquo;t perform remediation &mdash; so the report is unbiased. We work around tight closing timelines.",
         "Yes. Reports are formatted for buyer/seller use and routinely shared with realtors, escrow officers, and insurance adjusters. We're independent — we don't perform remediation — so the report is unbiased. We work around tight closing timelines."),
        (f"Do you serve {name} and the rest of {county} County?",
         f"Yes &mdash; {name} and the surrounding {county} County communities are part of our regular service area, dispatched from our Sequim headquarters. Very rural properties may include a small travel fee, always quoted in writing before booking.",
         f"Yes — {name} and the surrounding {county} County communities are part of our regular service area, dispatched from our Sequim headquarters. Very rural properties may include a small travel fee, always quoted in writing before booking."),
        ("What is black mold and is it dangerous?",
         "&ldquo;Black mold&rdquo; usually refers to <em>Stachybotrys chartarum</em>, which produces mycotoxins linked to respiratory and other health symptoms when growth is significant. Several other dark molds look similar but are less concerning. Lab analysis is the only reliable way to identify the species.",
         "\"Black mold\" usually refers to Stachybotrys chartarum, which produces mycotoxins linked to respiratory and other health symptoms when growth is significant. Several other dark molds look similar but are less concerning. Lab analysis is the only reliable way to identify the species."),
        ("Will you tell me to do remediation?",
         "Only if the data says so. We don&rsquo;t perform remediation &mdash; that&rsquo;s a deliberate separation. Many of our reports conclude no remediation is needed, which is the answer customers most often want and rarely get from inspectors who also sell the cleanup.",
         "Only if the data says so. We don't perform remediation — that's a deliberate separation. Many of our reports conclude no remediation is needed, which is the answer customers most often want and rarely get from inspectors who also sell the cleanup."),
    ]

    offer = {"@type": "Offer", "price": "150", "priceCurrency": "USD",
             "availability": "https://schema.org/InStock", "url": f"{CANON}/#book", "priceValidUntil": "2027-12-31"}
    ld = [
        service_jsonld("Mold Inspection", f"Complete Mold Inspection — {name}, WA & Olympic Peninsula",
                       f"Non-invasive mold inspection in {name}, WA using thermal imaging to detect hidden moisture, humidity readings, and lab-backed sampling for 100+ mold species including Stachybotrys (black mold), Aspergillus, and Penicillium. Photo-documented report formatted for insurance, real estate, or remediation contractors.",
                       slug, area, offer),
        breadcrumb(f"Mold Inspection {name} WA", slug),
        faq_jsonld(faqs),
    ]

    body = f"""
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-grid">
                <div class="hero-content reveal">
                    <span class="hero-eyebrow hero-eyebrow--glow">{name} &middot; {county} County &middot; Olympic Peninsula</span>
                    <h1><span class="accent">Mold Inspection</span> in {name}, WA.</h1>
                    <p class="lead">Independent mold inspection {c['blurb']}, backed by an ISO/IEC 17025-accredited lab. Thermal imaging, plain-English reports, and zero remediation upsell &mdash; we don&rsquo;t fix mold, we just tell you what&rsquo;s there. Inspections start at $150.</p>
                    <div class="hero-ctas">
                        <a href="/#book" class="btn-primary">Book a Mold Inspection</a>
                        <a href="/#calculator" class="btn-outline">Get an Estimate</a>
                    </div>
                    <div class="hero-trust">
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>ISO/IEC 17025 lab</span>
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>Thermal imaging included</span>
                        <span class="hero-trust-item insured"><span class="hero-trust-shield" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg></span>No remediation upsell</span>
                    </div>
                </div>
                <div class="hero-card reveal">
                    <div class="hero-image">
                        <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop" alt="Pacific Northwest home — {name}, Olympic Peninsula" loading="eager" />
                        <div class="hero-image-overlay"></div>
                        <div class="hero-image-badge"><span class="num">$150</span><span class="label">Mold inspections start at</span></div>
                    </div>
                    <div class="hero-card-stats">
                        <div class="hero-card-stat"><span class="num">100+</span><span class="label">Mold types tested</span></div>
                        <div class="hero-card-stat"><span class="num">ISO 17025</span><span class="label">Accredited lab</span></div>
                        <div class="hero-card-stat"><span class="num">2-3 day</span><span class="label">Lab turnaround</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
{TRUST_BAR}
    <section id="why-local" class="markets">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Why {name} Homes Are Prone to Mold</h2></div>
            <p class="section-sub reveal">{c['mold']}</p>
        </div>
    </section>

    <section id="included" class="services">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">What&rsquo;s Included in a Complete Mold Inspection</h2></div>
            <p class="section-sub reveal">A thorough walkthrough, the right tools, lab-backed sampling on request, and a written report you can hand to insurance, your buyer, or your remediation contractor. No corners cut, no padding the bill.</p>
            <div class="services-grid">
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🔍</div><h3>Visual &amp; moisture walkthrough</h3><p>Every accessible area inspected &mdash; living spaces, bathrooms, kitchens, basements, crawlspaces, attics, utility rooms. We document moisture readings, humidity levels, and any visible signs of growth or water intrusion.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🌡</div><h3>Thermal &amp; infrared imaging</h3><p>Thermal imaging reveals temperature anomalies behind walls and ceilings &mdash; the cold spots that indicate hidden moisture from leaks, condensation, or vapor intrusion. Included on every Complete Mold Inspection at no extra charge.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">💨</div><h3>Optional air sampling</h3><p>Air samples capture mold spores from the indoor environment and ship to the lab for species identification and concentration measurement. Most useful when there are health symptoms but no visible growth, or for real estate documentation.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🧪</div><h3>Optional surface sampling</h3><p>Tape-lift or swab samples from suspected growth, sent to the lab for confirmation and species ID. Especially useful when you can see something but don&rsquo;t know if it&rsquo;s mold &mdash; or which kind.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">📄</div><h3>Written photo-documented report</h3><p>A PDF report with every area inspected documented, photo evidence, moisture readings, lab results (when sampled), and clear plain-English recommendations. Formatted to share with insurance, realtors, or remediation contractors.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">📞</div><h3>Honest pre-call</h3><p>If your situation doesn&rsquo;t actually need an inspection, we&rsquo;ll tell you on the phone before booking. We make zero money turning away non-jobs &mdash; we just don&rsquo;t want to charge you $150 for a problem that didn&rsquo;t exist.</p></div>
            </div>
        </div>
    </section>

    <section id="pricing-pitch" class="pricing-pitch">
        <div class="container">
            <div class="pricing-pitch-card reveal">
                <h2>Don&rsquo;t get <em>spored</em> into spending $2,500 on a mold inspector.</h2>
                <p>Full mold inspections in {name} start at just <strong>$150</strong> &mdash; the most affordable, certified, quality-driven option on the Olympic Peninsula. Air samples $85 each, surface samples $55 each, thermal scan included.</p>
                <p class="pricing-pitch-sub">Use the calculator to estimate your total before you book.</p>
                <div class="pricing-pitch-ctas">
                    <a href="/#book" class="btn-primary">Book a Mold Inspection</a>
                    <a href="/#calculator" class="btn-outline">Estimate My Price</a>
                </div>
            </div>
        </div>
    </section>

    <section id="process" class="process">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">How a Mold Inspection Works</h2></div>
            <p class="section-sub reveal">Four steps from first call to a written, lab-backed report you can hand to insurance, your buyer, or your remediation contractor.</p>
            <div class="process-grid">
                <div class="process-step reveal"><div class="process-num">1</div><h3>Book online or call</h3><p>Same-day reply. We confirm the scope, the address, and your timeline before locking the slot. No surprise fees.</p></div>
                <div class="process-step reveal"><div class="process-num">2</div><h3>On-site inspection</h3><p>1.5 to 2 hours for a typical home. Visual walkthrough, moisture readings, thermal imaging, and any optional sampling you opted in to.</p></div>
                <div class="process-step reveal"><div class="process-num">3</div><h3>Lab analysis</h3><p>Samples ship to our ISO/IEC 17025-accredited lab. Results come back in 2 to 3 days &mdash; full species identification and concentration data.</p></div>
                <div class="process-step reveal"><div class="process-num">4</div><h3>Written report delivered</h3><p>Photo-supported PDF with findings, lab results, and recommendations. Ready to share with insurance, realtors, or remediation contractors.</p></div>
            </div>
        </div>
    </section>

    <section id="faq" class="faq-section">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Mold Inspection FAQ &mdash; {name}, WA</h2></div>
            <p class="section-sub reveal">The questions we get most often when homeowners in {name} are deciding whether to book.</p>
            <div class="faq-list reveal">
{faq_html([(q, a) for (q, a, _p) in faqs])}
            </div>
        </div>
    </section>
{other_services_section(city_slug, "mold", name)}{nearby_line(c)}
    <section id="cta" class="pricing-pitch">
        <div class="container">
            <div class="pricing-pitch-card reveal">
                <h2>Book a Mold Inspection in {name}.</h2>
                <p>Same-day reply. Written quote before we book. ISO 17025 lab. Inspections from $150.</p>
                <div class="pricing-pitch-ctas">
                    <a href="/#book" class="btn-primary">Book Now &rarr;</a>
                    <a href="tel:{TEL}" class="btn-outline">Or call {PHONE}</a>
                </div>
            </div>
        </div>
    </section>
"""
    return slug, title, desc, c, ld, body


def build_radon(city_slug):
    c = CITIES[city_slug]
    name, county = c["name"], c["county"]
    slug = f"radon-testing-{city_slug}"
    title = f"Radon Testing {name} WA | Olympic Inspections &amp; Testing"
    desc = f"Professional radon testing in {name}, WA to Washington State standards. Independent, lab-backed results for homes, real estate transactions &amp; peace of mind across {county} County."
    area = [c2["name"] for k2, c2 in CITIES.items() if c2["county"] == county] + [f"{county} County, WA", "Olympic Peninsula"]
    radon_note = c.get("radon", f"{county} County sits on glacial soils that can carry elevated radon into homes with basements, crawlspaces, or slab foundations.")

    faqs = [
        (f"Should I test for radon in {name}, WA?",
         f"Yes &mdash; the EPA recommends every home be tested regardless of location. {radon_note} The only way to know your level is to test; you can&rsquo;t see, smell, or taste radon.",
         f"Yes — the EPA recommends every home be tested regardless of location. {county} County sits on soils that can carry elevated radon into homes. The only way to know your level is to test; you can't see, smell, or taste radon."),
        ("What is radon and why does it matter?",
         "Radon is a naturally-occurring radioactive gas from the breakdown of uranium in soil and rock. It&rsquo;s the second-leading cause of lung cancer after smoking. It seeps into homes through foundation cracks, crawlspaces, and gaps around pipes, and can accumulate to unsafe levels indoors.",
         "Radon is a naturally-occurring radioactive gas from the breakdown of uranium in soil and rock. It's the second-leading cause of lung cancer after smoking. It seeps into homes through foundation cracks, crawlspaces, and gaps around pipes, and can accumulate to unsafe levels indoors."),
        ("How does radon testing work?",
         "We place a calibrated continuous radon monitor or passive test kit in the lowest livable level of the home for a set measurement period, then deliver lab-grade results in pCi/L. The home should stay under closed-house conditions during the test for an accurate reading.",
         "We place a calibrated continuous radon monitor or passive test kit in the lowest livable level of the home for a set measurement period, then deliver lab-grade results in pCi/L. The home should stay under closed-house conditions during the test for an accurate reading."),
        ("What radon level is too high?",
         "Above 4 pCi/L, the EPA recommends mitigation. The standard fix is sub-slab depressurization &mdash; a vent pipe and small fan that exhausts radon above the roofline, typically $1,200&ndash;$2,500 for a single-family home. We don&rsquo;t install mitigation ourselves but refer vetted local contractors and re-test post-install to verify it worked.",
         "Above 4 pCi/L, the EPA recommends mitigation. The standard fix is sub-slab depressurization — a vent pipe and small fan that exhausts radon above the roofline, typically $1,200-$2,500 for a single-family home. We don't install mitigation ourselves but refer vetted local contractors and re-test post-install to verify it worked."),
        ("Do you do radon testing for real estate transactions?",
         f"Yes. Radon tests are a common part of {name}-area real-estate inspections, and our results come with documentation buyers, sellers, lenders, and agents can rely on. We work around closing timelines.",
         f"Yes. Radon tests are a common part of {name}-area real-estate inspections, and our results come with documentation buyers, sellers, lenders, and agents can rely on. We work around closing timelines."),
    ]
    ld = [
        service_jsonld("Radon Testing", f"Radon Testing — {name}, WA",
                       f"Professional radon testing in {name}, WA to Washington State standards. Calibrated continuous monitoring and lab-grade pCi/L results for homes and real-estate transactions. Independent — we do not sell mitigation.",
                       slug, area),
        breadcrumb(f"Radon Testing {name} WA", slug),
        faq_jsonld(faqs),
    ]
    body = _simple_service_body(
        c, slug, "Radon Testing", "☢️",
        f"{name} &middot; {county} County &middot; Olympic Peninsula",
        f"<span class=\"accent\">Radon Testing</span> in {name}, WA.",
        f"Radon is the second-leading cause of lung cancer after smoking &mdash; and the Olympic Peninsula runs higher than the national average. We test {c['blurb']} with calibrated monitors and deliver clear, lab-grade results. Independent: we test, we don&rsquo;t sell mitigation.",
        f"Why Radon Testing Matters in {name}", radon_note,
        [
            ("🏠", "Lowest-level placement", "We place a calibrated radon monitor in the lowest livable level of the home and measure under proper closed-house conditions for an accurate reading."),
            ("📊", "Lab-grade pCi/L results", "You get a clear numeric result in picocuries per liter, the EPA&rsquo;s standard unit, with plain-English interpretation of what it means for your home."),
            ("⚖️", "Independent &mdash; no mitigation upsell", "We don&rsquo;t install radon mitigation systems. Our only job is to tell you your real level &mdash; then refer vetted local contractors if you need one."),
            ("🏡", "Real-estate ready", "Documentation formatted for buyers, sellers, lenders, and agents, delivered on timelines that work around your closing."),
            ("🔁", "Post-mitigation re-testing", "Already had a mitigation system installed? We re-test to verify it actually brought your levels below the EPA action threshold."),
            ("📞", "Honest guidance", "We&rsquo;ll walk you through whether you even need a test, what your number means, and what (if anything) to do about it &mdash; no pressure."),
        ],
        "How Radon Testing Works", [
            ("Book online or call", "Same-day reply. We confirm the property and the test window, and explain closed-house conditions so the reading is accurate."),
            ("Monitor placed", "We set a calibrated continuous monitor (or passive kit) in the lowest livable level for the measurement period."),
            ("Lab-grade analysis", "Results are read and reported in pCi/L against the EPA action level of 4 pCi/L."),
            ("Results &amp; next steps", "Clear written results with plain-English interpretation and, if needed, referrals to vetted mitigation contractors plus re-testing."),
        ],
        faqs, "radon",
    )
    return slug, title, desc, c, ld, body


def build_water(city_slug):
    c = CITIES[city_slug]
    name, county = c["name"], c["county"]
    slug = f"well-water-testing-{city_slug}"
    title = f"Well Water Testing {name} WA | Olympic Inspections &amp; Testing"
    desc = f"Accredited well &amp; drinking water testing in {name}, WA. Coliform, E. coli, nitrates, lead, arsenic, hardness &amp; pH with real-estate-ready chain-of-custody across {county} County."
    area = [c2["name"] for k2, c2 in CITIES.items() if c2["county"] == county] + [f"{county} County, WA", "Olympic Peninsula"]
    water_note = c.get("water", f"Many homes outside the {name} core run on private wells, making coliform, nitrate, and metals testing important before a sale or after a dry season.")
    faqs = [
        (f"Why should I test my well water in {name}?",
         f"{water_note} Private wells aren&rsquo;t regulated like city water, so testing is the only way to confirm your water is safe &mdash; especially before buying, after flooding or a dry summer, or if anyone in the home has health concerns.",
         f"Many homes around {name} run on private wells. Private wells aren't regulated like city water, so testing is the only way to confirm your water is safe — especially before buying, after flooding or a dry summer, or if anyone in the home has health concerns."),
        ("What does the water test check for?",
         "Our standard panels cover total coliform and E. coli (bacteria), nitrates and nitrites, lead, arsenic, hardness, and pH. We can add additional analytes depending on your situation &mdash; every sample is processed at an accredited laboratory.",
         "Our standard panels cover total coliform and E. coli (bacteria), nitrates and nitrites, lead, arsenic, hardness, and pH. We can add additional analytes depending on your situation — every sample is processed at an accredited laboratory."),
        ("Do you do water testing for real estate transactions?",
         f"Yes. Many {name}-area lenders and buyers require a satisfactory water test on private-well properties before closing. We collect with proper chain-of-custody and deliver lab results formatted for the transaction.",
         f"Yes. Many {name}-area lenders and buyers require a satisfactory water test on private-well properties before closing. We collect with proper chain-of-custody and deliver lab results formatted for the transaction."),
        ("How long does it take to get results?",
         "Bacteria results (coliform/E. coli) typically come back within a couple of business days; full chemistry panels take a few days longer. We deliver a plain-English report with your numbers compared against EPA and Washington State drinking-water standards.",
         "Bacteria results (coliform/E. coli) typically come back within a couple of business days; full chemistry panels take a few days longer. We deliver a plain-English report with your numbers compared against EPA and Washington State drinking-water standards."),
    ]
    ld = [
        service_jsonld("Water Testing", f"Well &amp; Drinking Water Testing — {name}, WA",
                       f"Accredited well and drinking water testing in {name}, WA. Coliform, E. coli, nitrate, lead, arsenic, hardness, and pH panels with real-estate-ready chain-of-custody and plain-English results.",
                       slug, area),
        breadcrumb(f"Well Water Testing {name} WA", slug),
        faq_jsonld(faqs),
    ]
    body = _simple_service_body(
        c, slug, "Well Water Testing", "💧",
        f"{name} &middot; {county} County &middot; Olympic Peninsula",
        f"<span class=\"accent\">Well Water Testing</span> in {name}, WA.",
        f"Accredited drinking-water testing {c['blurb']} &mdash; coliform, E. coli, nitrates, lead, arsenic, hardness, and pH. Real-estate-ready chain-of-custody and plain-English results compared against EPA and Washington State standards.",
        f"Why Test Your Water in {name}", water_note,
        [
            ("🦠", "Bacteria &mdash; coliform &amp; E. coli", "The first thing to rule out on any private well. Indicates whether surface contamination or a compromised well casing is letting bacteria into your drinking water."),
            ("🧪", "Nitrates &amp; nitrites", "Common near agricultural and septic-served areas. High nitrate is especially dangerous for infants and during pregnancy."),
            ("🔩", "Lead &amp; arsenic", "Heavy metals that can leach from geology or older plumbing. Arsenic occurs naturally in some Washington groundwater and has no taste or smell."),
            ("💎", "Hardness &amp; pH", "Affects plumbing, appliances, and water taste. Useful for sizing treatment and softening systems correctly."),
            ("📋", "Real-estate chain-of-custody", "Proper collection and documentation that lenders, buyers, and sellers accept for closing on private-well properties."),
            ("📞", "Plain-English results", "We translate the lab numbers into what they actually mean for your household &mdash; and what, if anything, to do about them."),
        ],
        "How Water Testing Works", [
            ("Book online or call", "Same-day reply. We confirm your well type, your concern, and which panel fits &mdash; real-estate, new-well, or peace-of-mind."),
            ("Sample collection", "We collect with proper sterile technique and chain-of-custody, or guide you through an approved self-collection where appropriate."),
            ("Accredited lab analysis", "Samples are processed at an accredited laboratory against EPA and Washington State drinking-water standards."),
            ("Results &amp; recommendations", "A clear written report with your numbers, what they mean, and any treatment or re-testing recommendations."),
        ],
        faqs, "water",
    )
    return slug, title, desc, c, ld, body


def build_septic(city_slug):
    c = CITIES[city_slug]
    name, county = c["name"], c["county"]
    slug = f"septic-inspection-{city_slug}"
    title = f"Septic Inspection {name} WA | Olympic Inspections &amp; Testing"
    desc = f"Independent septic system inspection in {name}, WA. Inspection-only (we don&rsquo;t pump or repair) for real-estate transactions &amp; Washington State&rsquo;s biennial requirement across {county} County."
    area = [c2["name"] for k2, c2 in CITIES.items() if c2["county"] == county] + [f"{county} County, WA", "Olympic Peninsula"]
    septic_note = c.get("septic", f"Most rural {name} properties run on private septic systems that Washington State requires inspected periodically and at point of sale.")
    faqs = [
        (f"Is a septic inspection required in {name}?",
         f"Washington State requires most permitted on-site septic systems to be inspected every two to three years (gravity systems every three, more complex systems annually). {septic_note} An inspection is also required for nearly every real-estate transaction on a septic-served property.",
         f"Washington State requires most permitted on-site septic systems to be inspected every two to three years (gravity systems every three, more complex systems annually). Most rural {name} properties run on septic. An inspection is also required for nearly every real-estate transaction on a septic-served property."),
        ("What does a septic inspection include?",
         "A full functional inspection: locating and opening the tank, checking liquid levels and baffles, assessing sludge and scum layers, inspecting the drainfield for surfacing or saturation, and verifying flow. You get a written, photo-documented report on the system&rsquo;s condition.",
         "A full functional inspection: locating and opening the tank, checking liquid levels and baffles, assessing sludge and scum layers, inspecting the drainfield for surfacing or saturation, and verifying flow. You get a written, photo-documented report on the system's condition."),
        ("Do you pump or repair the septic system?",
         "No &mdash; we&rsquo;re inspection-only, and that&rsquo;s deliberate. Because we don&rsquo;t sell pumping or repairs, our report is unbiased. If work is needed we refer reputable local pumpers and installers, but you&rsquo;re never being upsold by the person assessing the system.",
         "No — we're inspection-only, and that's deliberate. Because we don't sell pumping or repairs, our report is unbiased. If work is needed we refer reputable local pumpers and installers, but you're never being upsold by the person assessing the system."),
        ("Do you do septic inspections for real estate?",
         f"Yes. Septic inspection is a standard part of buying or selling a {name}-area property on a private system, and our reports are formatted for the transaction and the county&rsquo;s records. We work around closing timelines.",
         f"Yes. Septic inspection is a standard part of buying or selling a {name}-area property on a private system, and our reports are formatted for the transaction and the county's records. We work around closing timelines."),
    ]
    ld = [
        service_jsonld("Septic Inspection", f"Septic System Inspection — {name}, WA",
                       f"Independent, inspection-only septic system inspection in {name}, WA for real-estate transactions and Washington State's periodic-inspection requirement. We do not pump or repair — the report stays unbiased.",
                       slug, area),
        breadcrumb(f"Septic Inspection {name} WA", slug),
        faq_jsonld(faqs),
    ]
    body = _simple_service_body(
        c, slug, "Septic Inspection", "🚽",
        f"{name} &middot; {county} County &middot; Olympic Peninsula",
        f"<span class=\"accent\">Septic Inspection</span> in {name}, WA.",
        f"Independent, inspection-only septic assessment {c['blurb']}. Washington State requires most systems inspected every 2&ndash;3 years, and lenders require one for any sale on a private system. We inspect &mdash; we don&rsquo;t pump or repair &mdash; so the report stays honest.",
        f"Septic Inspections in {name}", septic_note,
        [
            ("🔎", "Tank location &amp; access", "We locate and open the tank, then assess liquid levels, inlet and outlet baffles, and overall structural condition."),
            ("📏", "Sludge &amp; scum measurement", "Measuring the sludge and scum layers tells us whether the tank is functioning and when it&rsquo;s due for pumping."),
            ("🌱", "Drainfield assessment", "We inspect the drainfield for surfacing effluent, saturation, and odor &mdash; the most expensive part of any system to replace if it fails."),
            ("💧", "Flow verification", "We confirm the system accepts and moves flow correctly from the house through the tank to the drainfield."),
            ("📄", "Photo-documented report", "A written report on the system&rsquo;s condition, formatted for the county&rsquo;s records and for real-estate transactions."),
            ("⚖️", "Inspection-only &mdash; no upsell", "Because we don&rsquo;t pump or repair, our assessment is unbiased. Need work done? We refer reputable local pumpers and installers."),
        ],
        "How a Septic Inspection Works", [
            ("Book online or call", "Same-day reply. We confirm the system type and whether it&rsquo;s for a sale, a refinance, or the state&rsquo;s periodic requirement."),
            ("On-site inspection", "We locate and open the tank, measure sludge and scum, check baffles, and assess the drainfield and flow."),
            ("Condition assessment", "We evaluate everything against Washington State on-site sewage standards and the county&rsquo;s requirements."),
            ("Written report delivered", "A photo-documented report on the system&rsquo;s condition, ready for the county, your lender, or your buyer."),
        ],
        faqs, "septic",
    )
    return slug, title, desc, c, ld, body


def _simple_service_body(c, slug, service_name, icon, eyebrow, h1_html, lead, why_h2, why_p,
                         included, process_title, process_steps, faqs, exclude_key):
    name = c["name"]
    inc = "\n".join(
        f"""                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">{i}</div><h3>{t}</h3><p>{p}</p></div>"""
        for (i, t, p) in included)
    steps = "\n".join(
        f"""                <div class="process-step reveal"><div class="process-num">{n+1}</div><h3>{t}</h3><p>{p}</p></div>"""
        for n, (t, p) in enumerate(process_steps))
    return f"""
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-grid">
                <div class="hero-content reveal">
                    <span class="hero-eyebrow hero-eyebrow--glow">{eyebrow}</span>
                    <h1>{h1_html}</h1>
                    <p class="lead">{lead}</p>
                    <div class="hero-ctas">
                        <a href="/#book" class="btn-primary">Book {service_name}</a>
                        <a href="tel:{TEL}" class="btn-outline">Call {PHONE}</a>
                    </div>
                    <div class="hero-trust">
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>Accredited lab</span>
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>Real-estate ready</span>
                        <span class="hero-trust-item insured"><span class="hero-trust-shield" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg></span>Independent &mdash; no upsell</span>
                    </div>
                </div>
                <div class="hero-card reveal">
                    <div class="hero-image">
                        <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop" alt="Pacific Northwest home — {name}, Olympic Peninsula" loading="eager" />
                        <div class="hero-image-overlay"></div>
                        <div class="hero-image-badge"><span class="num">{icon}</span><span class="label">{service_name}</span></div>
                    </div>
                    <div class="hero-card-stats">
                        <div class="hero-card-stat"><span class="num">ISO 17025</span><span class="label">Accredited lab</span></div>
                        <div class="hero-card-stat"><span class="num">Local</span><span class="label">Sequim HQ</span></div>
                        <div class="hero-card-stat"><span class="num">No upsell</span><span class="label">Inspection-only</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
{TRUST_BAR}
    <section id="why-local" class="markets">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">{why_h2}</h2></div>
            <p class="section-sub reveal">{why_p}</p>
        </div>
    </section>

    <section id="included" class="services">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">What&rsquo;s Included</h2></div>
            <p class="section-sub reveal">A thorough, lab-backed assessment and a written report you can hand to insurance, your buyer, your lender, or the county. Independent and unbiased &mdash; we don&rsquo;t sell the fix.</p>
            <div class="services-grid">
{inc}
            </div>
        </div>
    </section>

    <section id="process" class="process">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">{process_title}</h2></div>
            <p class="section-sub reveal">From first call to a written, lab-backed report &mdash; clear steps, no surprises.</p>
            <div class="process-grid">
{steps}
            </div>
        </div>
    </section>

    <section id="faq" class="faq-section">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">{service_name} FAQ &mdash; {name}, WA</h2></div>
            <p class="section-sub reveal">The questions we hear most from {name}-area homeowners.</p>
            <div class="faq-list reveal">
{faq_html([(q, a) for (q, a, _p) in faqs])}
            </div>
        </div>
    </section>
{other_services_section(slug.split('-')[-1] if False else _city_slug_of(c), exclude_key, name)}{nearby_line(c)}
    <section id="cta" class="pricing-pitch">
        <div class="container">
            <div class="pricing-pitch-card reveal">
                <h2>Book {service_name} in {name}.</h2>
                <p>Same-day reply. Written quote before we book. Accredited lab. Independent &mdash; we don&rsquo;t sell the fix.</p>
                <div class="pricing-pitch-ctas">
                    <a href="/#book" class="btn-primary">Book Now &rarr;</a>
                    <a href="tel:{TEL}" class="btn-outline">Or call {PHONE}</a>
                </div>
            </div>
        </div>
    </section>
"""

def _city_slug_of(c):
    for k, v in CITIES.items():
        if v is c:
            return k
    return ""


def build_county_hub(county_key):
    co = COUNTIES[county_key]
    name = co["name"]
    slug = f"inspections-{county_key}-county"
    title = f"Mold, Radon &amp; Water Testing in {name}, WA | Olympic Inspections &amp; Testing"
    desc = f"Independent mold inspection, radon testing, and water testing across {name}, WA &mdash; {', '.join(co['cities'])}. ISO 17025 lab, no-upsell reports from $150."
    city_keys = [k for k, v in CITIES.items() if v["county"] == county_key.capitalize()]
    area = [CITIES[k]["name"] for k in city_keys] + [name + ", WA"]
    does_septic = county_key.capitalize() in SEPTIC_COUNTIES
    septic_phrase = ", and septic inspection" if does_septic else ""

    faqs = [
        (f"What areas of {name} do you serve?",
         f"We serve the entire county &mdash; {', '.join(co['cities'])}, and the surrounding communities &mdash; dispatched from our Sequim headquarters on the Olympic Peninsula. Very rural properties may include a small travel fee, always quoted in writing first.",
         f"We serve the entire county — {', '.join(co['cities'])}, and the surrounding communities — dispatched from our Sequim headquarters on the Olympic Peninsula. Very rural properties may include a small travel fee, always quoted in writing first."),
        (f"What inspections do you offer in {name}?",
         f"Mold inspection (from $150, thermal imaging included), radon testing, well and drinking water testing, ERMI testing{septic_phrase}. Every service is independent and lab-backed &mdash; we never sell the remediation, mitigation, or repair, so the report stays honest.",
         f"Mold inspection (from $150, thermal imaging included), radon testing, well and drinking water testing, ERMI testing{septic_phrase}. Every service is independent and lab-backed — we never sell the remediation, mitigation, or repair, so the report stays honest."),
        ("How much does a mold inspection cost?",
         "A complete mold inspection starts at $150 &mdash; the most affordable certified option on the Peninsula, with thermal imaging included. Lab samples are optional add-ons. Most competitors charge $1,500&ndash;$2,500 for the same scope.",
         "A complete mold inspection starts at $150 — the most affordable certified option on the Peninsula, with thermal imaging included. Lab samples are optional add-ons. Most competitors charge $1,500 to $2,500 for the same scope."),
    ]

    # city link cards
    city_cards = []
    for k in city_keys:
        cc = CITIES[k]
        mold_slug = "mold-inspection-sequim-wa" if k == "sequim" else f"mold-inspection-{k}"
        href = f"/{mold_slug}" if (mold_slug in GENERATED_SLUGS or mold_slug in EXISTING) else "/mold-inspection-sequim-wa"
        city_cards.append(f"""                <a href="{href}" class="market-card reveal" style="text-decoration: none; color: inherit;">
                    <div class="market-icon" aria-hidden="true">📍</div>
                    <h3>{cc['name']} &rarr;</h3>
                    <p>Mold inspection and indoor air quality testing {cc['blurb']}.</p>
                </a>""")

    ld = [
        service_jsonld("Indoor Environmental Inspection", f"Mold, Radon &amp; Water Testing — {name}, WA",
                       f"Independent mold inspection, radon testing, well water testing, ERMI testing{septic_phrase} across {name}, WA. ISO/IEC 17025 lab. No-upsell reports from $150.",
                       slug, area),
        breadcrumb(f"Inspections in {name}", slug),
        faq_jsonld(faqs),
    ]

    # Septic only shown for counties we actually serve it in (Clallam, Jefferson).
    septic_card = ('                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🚽</div><h3>Septic Inspection</h3><p>Inspection-only. WA requires inspection every 2&ndash;3 years and at point of sale on most systems.</p></div>\n'
                   if county_key.capitalize() in SEPTIC_COUNTIES else "")

    body = f"""
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-grid">
                <div class="hero-content reveal">
                    <span class="hero-eyebrow hero-eyebrow--glow">{name} &middot; {co['blurb']}</span>
                    <h1><span class="accent">Mold, Radon &amp; Water Testing</span> in {name}.</h1>
                    <p class="lead">Independent home inspections and indoor air quality testing across {name} and {co['blurb']}. ISO/IEC 17025 lab, plain-English reports, and zero upsell &mdash; we test, we don&rsquo;t sell the fix. Mold inspections start at $150.</p>
                    <div class="hero-ctas">
                        <a href="/#book" class="btn-primary">Book an Inspection</a>
                        <a href="/#calculator" class="btn-outline">Get an Estimate</a>
                    </div>
                    <div class="hero-trust">
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>ISO/IEC 17025 lab</span>
                        <span class="hero-trust-item check"><span class="hero-trust-emoji" aria-hidden="true">✅</span>From $150</span>
                        <span class="hero-trust-item insured"><span class="hero-trust-shield" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg></span>No upsell, ever</span>
                    </div>
                </div>
                <div class="hero-card reveal">
                    <div class="hero-image">
                        <img src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80&auto=format&fit=crop" alt="Pacific Northwest home — {name}" loading="eager" />
                        <div class="hero-image-overlay"></div>
                        <div class="hero-image-badge"><span class="num">$150</span><span class="label">Mold inspections start at</span></div>
                    </div>
                    <div class="hero-card-stats">
                        <div class="hero-card-stat"><span class="num">100+</span><span class="label">Mold types tested</span></div>
                        <div class="hero-card-stat"><span class="num">ISO 17025</span><span class="label">Accredited lab</span></div>
                        <div class="hero-card-stat"><span class="num">2-3 day</span><span class="label">Lab turnaround</span></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
{TRUST_BAR}
    <section id="services" class="services">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Inspections &amp; Testing in {name}</h2></div>
            <p class="section-sub reveal">Independent, lab-backed, and honest. Every service comes with a written report you can hand to insurance, a buyer, a lender, or the county.</p>
            <div class="services-grid">
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🔬</div><h3>Mold Inspection</h3><p>Non-invasive walkthrough with thermal imaging and ISO 17025 lab testing for 100+ mold types. From $150.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">☢️</div><h3>Radon Testing</h3><p>Calibrated monitoring to Washington State standards. The Peninsula runs higher than the national average.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">💧</div><h3>Well Water Testing</h3><p>Coliform, E. coli, nitrates, lead, arsenic, hardness, pH &mdash; real-estate-ready chain-of-custody.</p></div>
                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">🧪</div><h3>ERMI Testing</h3><p>Environmental Relative Moldiness Index for documented exposure history with healthcare providers.</p></div>
{septic_card}                <div class="service-card reveal"><div class="service-icon" aria-hidden="true">📄</div><h3>Written Lab Reports</h3><p>Photo-documented, plain-English, formatted for insurance, real estate, healthcare, or contractors.</p></div>
            </div>
        </div>
    </section>

    <section id="locations" class="markets">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">Cities We Serve in {name}</h2></div>
            <p class="section-sub reveal">Local, independent, and dispatched from our Sequim headquarters. Tap your town for mold inspection and indoor air quality testing details.</p>
            <div class="markets-grid">
{chr(10).join(city_cards)}
            </div>
        </div>
    </section>

    <section id="faq" class="faq-section">
        <div class="container">
            <div class="section-titlewrap"><h2 class="section-title reveal">{name} Inspections FAQ</h2></div>
            <p class="section-sub reveal">The questions we hear most from {name} homeowners, buyers, and agents.</p>
            <div class="faq-list reveal">
{faq_html([(q, a) for (q, a, _p) in faqs])}
            </div>
        </div>
    </section>

    <section id="cta" class="pricing-pitch">
        <div class="container">
            <div class="pricing-pitch-card reveal">
                <h2>Book an Inspection in {name}.</h2>
                <p>Same-day reply. Written quote before we book. ISO 17025 lab. Mold inspections from $150.</p>
                <div class="pricing-pitch-ctas">
                    <a href="/#book" class="btn-primary">Book Now &rarr;</a>
                    <a href="tel:{TEL}" class="btn-outline">Or call {PHONE}</a>
                </div>
            </div>
        </div>
    </section>
"""
    # county hub has its own geo meta via a pseudo-city dict
    pseudo = {"name": name, "lat": co["lat"], "lng": co["lng"]}
    return slug, title, desc, pseudo, ld, body


# ---------------------------------------------------------------------------
# DRIVER
# ---------------------------------------------------------------------------
# Pre-compute the full set of slugs we will generate so cross-link logic
# (other_services_section / county cards) can decide city-page vs canonical.
GENERATED_SLUGS = set()
for ck in MOLD_CITIES:
    GENERATED_SLUGS.add(f"mold-inspection-{ck}")
for ck in RADON_CITIES:
    GENERATED_SLUGS.add(f"radon-testing-{ck}")
for ck in WATER_CITIES:
    GENERATED_SLUGS.add(f"well-water-testing-{ck}")
for ck in SEPTIC_CITIES:
    GENERATED_SLUGS.add(f"septic-inspection-{ck}")
for cok in COUNTIES:
    GENERATED_SLUGS.add(f"inspections-{cok}-county")


def assemble(slug, title, desc, city_meta, ld_objs, body):
    html = head(title, desc, slug, city_meta)
    for obj in ld_objs:
        html += jsonld_block(obj)
    html += NAV
    html += body
    html += footer()
    return html


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    written = []

    jobs = []
    jobs += [(build_mold, ck) for ck in MOLD_CITIES]
    jobs += [(build_radon, ck) for ck in RADON_CITIES]
    jobs += [(build_water, ck) for ck in WATER_CITIES]
    jobs += [(build_septic, ck) for ck in SEPTIC_CITIES]
    jobs += [(build_county_hub, cok) for cok in COUNTIES]

    for fn, key in jobs:
        slug, title, desc, city_meta, ld, body = fn(key)
        if slug in EXISTING:
            print(f"SKIP (exists): {slug}")
            continue
        html = assemble(slug, title, desc, city_meta, ld, body)
        path = os.path.join(OUT_DIR, f"{slug}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        written.append(slug)
        print(f"WROTE: {slug}.html  ({len(html):,} bytes)")

    all_slugs = sorted(EXISTING | set(written))
    print("\n" + "=" * 70)
    print(f"GENERATED {len(written)} new pages. Total landing pages: {len(all_slugs)}")
    print("=" * 70)

    print("\n--- next.config.ts regex alternation (paste into BOTH host blocks) ---")
    print("|".join(all_slugs))

    print("\n--- sitemap.xml entries ---")
    for s in all_slugs:
        pr = "0.9" if s == "mold-inspection-sequim-wa" else ("0.7" if s.startswith("inspections-") else "0.8")
        print(f"  <url><loc>{CANON}/{s}</loc><changefreq>monthly</changefreq><priority>{pr}</priority></url>")


if __name__ == "__main__":
    main()
