/**
 * Shared deliverables stacks for the $10k AI Marketing System.
 *
 * Single source of truth — imported by:
 *   · /agency page (renders all 3 stacks: Universal + Mfg + Author)
 *   · /manufacturers page (renders Universal + Mfg only)
 *   · /authors page (renders Universal + Author only)
 *
 * Each vertical's bonus stack auto-applies based on `prospect.category`
 * at intake — see `docs/AI_PACKAGE_PLAYBOOK.md` "Vertical split" section
 * + `memory/project_10k_package_vertical_split.md`.
 *
 * Three stacks split 2026-05-14 per ICP niche-down. Service businesses
 * are NOT eligible for the $10k tier — they get the $997 site tier
 * instead. The /agency FAQ explicitly states this (Damaging Admissions
 * frame).
 */

export interface IncludedItem {
  icon: string;
  title: string;
  detail: string;
}

export const INCLUDED_UNIVERSAL: IncludedItem[] = [
  { icon: "🌐", title: "Custom Website", detail: "Built for your business. Every click feeds the system so it gets smarter." },
  { icon: "📈", title: "Google Ads That Learn", detail: "Headlines that get clicks get more money. Headlines that flop get cut." },
  { icon: "🎯", title: "Facebook + Instagram Ads That Learn", detail: "Customer types that buy get more ads. The ones that don't buy get dropped." },
  { icon: "🧭", title: "Different Pitch For Each Customer Type", detail: "Up to 6 different sales tracks — one per customer type. Each one uses email, text, voicemail, and physical mail. Never the same blast to everyone." },
  { icon: "✉️", title: "Auto-Reply To Every Email", detail: "Sorts every reply into one of 6 buckets and writes a draft in your voice. You hit send." },
  { icon: "📅", title: "Set-It-And-Forget-It Campaigns", detail: "Pick a date. The system sends at the minute. You don't babysit it." },
  { icon: "📱", title: "Text Follow-Ups", detail: "Auto-texts that get smarter based on who replies." },
  { icon: "☎️", title: "Missed-Call Text-Back", detail: "Caller hangs up → auto-text in under 60 seconds. You stop losing the leads voicemail eats." },
  { icon: "📞", title: "Voicemail Drops", detail: "Drop a voicemail straight into every warm lead's inbox — phone never rings, no awkward call." },
  { icon: "🎁", title: "A Free Gift That Catches Leads", detail: "A short quiz built for your business that gives the visitor a custom answer — and routes them to the right sales track." },
  { icon: "📊", title: "Owner Dashboard", detail: "One screen for Leads · To-Do · Budget · Campaigns · Funnels · Map · Insights · Account. One login, everything in view." },
  { icon: "🔬", title: "Auto A/B Test Engine", detail: "Tests every email subject and every ad. Winners get more traffic — automatically." },
  { icon: "🔍", title: "Long-Term Google Rank Growth", detail: "Articles + backlinks that climb Google over months, while the ads do the heavy lifting now." },
  { icon: "🖼️", title: "Logo Refresh", detail: "We polish your logo so the system looks as sharp as it runs." },
  { icon: "📈", title: "Live Open/Click Tracking", detail: "See who opened, who clicked, who replied — in real time on your dashboard." },
  { icon: "🔥", title: "Heatmap Recordings", detail: "Watch real visitors click around your site so we know exactly where they get stuck — and fix it fast." },
  { icon: "📊", title: "Weekly + Monthly Reports", detail: "Auto-emailed. Real numbers showing the system getting better." },
];

export const INCLUDED_MFG: IncludedItem[] = [
  { icon: "🛒", title: "DTC Storefront + Dealer Locator", detail: "Direct-to-customer storefront for end-buyers PLUS a dealer locator that protects your existing dealer network. Both run on the same product catalog. Stop watching your distributor make more on your product than you do." },
  { icon: "📮", title: "Smart Postcards In The Mail", detail: "Real Lob-printed postcards tuned to your product audience — a tractor-brand catalog for dealers, a hunting-season checklist for end-buyers, a back-to-school sports kit for parents. Mail steps work 3-5× better than email alone, especially for B2B touch." },
  { icon: "🗺️", title: "Pick-Your-County Lead Finder", detail: "Click any US county on a map → fresh leads land in your inbox. Color-coded so you always know where you've already searched. Built for dealer territory expansion and B2B prospecting." },
  { icon: "🤝", title: "Dealer / Distributor Partner Program", detail: "A page where dealers sign up, plus a script library with the right pitch for each customer type (BUYER · PRO · SHOP). Built-in commission tracking — flat fee or split (like $50 retail / $250 dealer)." },
];

export const INCLUDED_AUTHOR: IncludedItem[] = [
  { icon: "📖", title: "Interactive Book-World Showcase", detail: "Animated world map, character roster, magic-system explorer, parchment-style chapter reader, faction quiz. Each interactive feature is a newsletter capture point. Built on the Bloodlines pattern — readers who play with these stay 3-5× longer than on a typical author site." },
  { icon: "📚", title: "Amazon + Retailer Direct CTAs", detail: "ASIN-aware buy buttons that route to Amazon, Apple Books, Kobo, IngramSpark — whatever you sell on. JSON-LD Book schema so each book gets Google's book carousel and your author Knowledge Panel populates correctly." },
  { icon: "🔖", title: "Series-Aware Newsletter Capture", detail: "Different capture sequences for first-time visitors, book #1 finishers, pre-order signups, and existing subscribers. The reader who finished book #1 doesn't see the same welcome email as someone who just landed — they get the book #2 pitch instead." },
  { icon: "📅", title: "Pre-Order + Launch Funnel", detail: "Book #2 (or book #3) pre-order capture with a countdown sequence. Email + text + retargeting until launch day, then conversion-tracked through Amazon. Drives the series-LTV math that makes one book-#1 reader worth 5-10× over their lifetime." },
  { icon: "⭐", title: "Reader Retargeting", detail: "Pixel-tracked readers who finished book #1 but didn't pre-order book #2 get a targeted ad sequence on Meta + Google. Lapsed-reader sequences run across multi-year horizons — when book #3 drops two years later, your book-#1 readers see it first." },
];
