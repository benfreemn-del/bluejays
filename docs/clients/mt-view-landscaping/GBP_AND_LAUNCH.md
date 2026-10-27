# Mountain View Landscape & Design: Google profile + launch checklist

Prepared 2026-10-26. The site code is on branch `mt-view-rebuild-seo`.

## 1. Google Business Profile (signed in as the Hunsakers' Google account)

Profile today: 5.0 stars from 14 reviews, 125 photos, category "Landscaper",
website = mtviewlandscaping.com. Google shows hours opening at **9 AM**; real
opening time is **8 AM** (confirmed by Ben).

- [ ] **Verify / confirm ownership.** business.google.com → the profile shows
      "Verified" or asks to verify (phone, text, email, or a short video of the
      shop, trucks and tools).
- [ ] **Hours:** Mon to Fri, 8:00 AM to 5:00 PM. (Confirm closing time with Tim.)
- [ ] **Categories.** Primary: *Landscaper*. Add secondaries:
      *Landscape designer*, *Lawn sprinkler system contractor*, *Gardener*,
      *Lawn care service*.
- [ ] **Website:** `https://mtviewlandscaping.com/` (keep as is).
- [ ] **Appointment / quote link:** `https://mtviewlandscaping.com/#contact`
- [ ] **Service area:** Auburn, Kent, Covington, Maple Valley, Black Diamond,
      Enumclaw, Federal Way, Bonney Lake, plus King / Pierce counties.
- [ ] **Services** (one entry each, paste the description):
  - Landscape Design: Hand-drawn landscape plans by Tim, built by our own crew.
  - Patios & Hardscapes: Flagstone and bluestone patios, paver driveways, stone steps, fire pit areas.
  - Retaining Walls: Block walls, terraced hillsides, rockeries, built with proper drainage.
  - Ponds & Water Features: Ponds, streams, waterfalls, pondless waterfalls, basalt fountains.
  - Sprinkler & Irrigation: New systems, drip lines, and repairs.
  - Sod Installation: Grading, soil prep, and new sod lawns.
  - Planting & Trees: Northwest native planting, shade gardens, specimen trees.
  - Landscape Lighting: Path, step, driveway, and accent lighting.
  - Yard Maintenance: Mowing, pruning, weeding, bark, seasonal cleanups.
- [ ] **Business description** (under 750 characters):

> Family-owned landscape company in Auburn, WA. Tim Hunsaker has been
> landscaping since 1976, first with his brothers as Shamrock Landscaping,
> then with Bonnie as Mountain View. Tim draws every plan by hand, and our own
> crew builds it: flagstone patios, retaining walls, ponds and waterfalls,
> sprinklers, sod, planting, and landscape lighting. Bonnie runs the crew that
> keeps our customers' yards looking great all year. We serve King, Pierce,
> Snohomish, and Kittitas counties. Free quotes, no pressure:
> (253) 638-0500.

- [ ] **Photos:** upload 10 to 20 of the best from the new site
      (`public/clients/mt-view-landscaping/work/*-1600.webp`, convert to JPG if
      Google rejects webp). Best set: p037, p091, p052, p033, p131, p124,
      p007, p073, p086, p031, p128, p127.
- [ ] **Review link:** Home → "Ask for reviews" → copy the g.page short link.
      Paste it into `BIZ.reviewHref` in `src/app/clients/mt-view-landscaping/_lib/site.ts`.

## 2. Review drive (the single biggest ranking lever)

14 reviews in 50 years, newest about a year old. Competitors win on volume and
recency. Ask Tim and Bonnie for the last two to three years of customers and
send each a short text with the review link. Goal: 30+ reviews this season,
then 1 to 2 a month after every job.

## 3. Domain flip (after Ben approves the preview)

The domain is registered at Squarespace (Ben's account).

1. Vercel → bluejays project → Domains → add `mtviewlandscaping.com` and
   `www.mtviewlandscaping.com` (www redirects to the apex, which is the canonical).
2. Squarespace → Domains → mtviewlandscaping.com → DNS: replace the Squarespace
   records with the A / CNAME values Vercel shows.
3. Check: `/`, `/hardscapes`, `/yard-maitenance` (should 301), `/sitemap.xml`.
4. Send a test quote through the form; confirm it lands in
   mtviewlandscapeonline@gmail.com.
5. Cancel the Squarespace website plan (keep the domain registration, or move
   it to Vercel/Cloudflare).

## 4. Search Console

Add a Domain property `mtviewlandscaping.com` (DNS TXT record in Squarespace or
Vercel DNS), submit `https://mtviewlandscaping.com/sitemap.xml`, request
indexing of the homepage and the 10 service pages.

## Not done on purpose

- `mountainviewlandscape.com` (lapsed, for sale at $3,195): not used by the
  Hunsakers, not buying it. Nothing on the site references it.
- No pricing, warranty, license, or "years/customers" claims beyond what the
  Hunsakers have published. Add them only once Tim confirms.
