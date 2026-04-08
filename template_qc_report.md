# BlueJays V2 Template Quality Control Report

**Date:** April 8, 2026  
**Scope:** All 41 V2 templates in `src/components/templates/`  
**Previously fixed:** Catering, Daycare, Florist, Interior Design, Photography, Veterinary

---

## Executive Summary

A full code-level audit was conducted across all 41 V2 template files. The review covered dark themes, missing sections, duplicate fallback images, layout completeness, and overall professional quality. Of the 41 templates, **8 are incomplete stubs** (minified into 88–200 lines with missing sections), **7 have dark backgrounds** that need brightening, and **9 Unsplash images** are shared across 3 or more unrelated categories as fallback imagery.

The majority of the remaining templates (26 out of 41) are fully built, polished, and production-ready. Issues below are ranked by severity.

---

## Issue Category 1 — Incomplete Stub Templates (Priority: Critical)

Eight templates are significantly under-built compared to the standard V2 template structure (600–1100 lines). They are minified into 88–200 lines and are missing critical trust-building sections. While they have a hero, a projects/gallery section, testimonials, and a contact form, they are missing a **stats bar**, a **dedicated about section with image**, a **process/how-it-works section**, and a **FAQ section**. A local business owner who sees one of these compared to a full template like Dental or Electrician will immediately notice the difference in depth.

| Template | Lines | Missing vs. Full Template |
| :--- | :---: | :--- |
| `V2ConstructionPreview.tsx` | 88 | Stats bar, About with image, Process steps, FAQ |
| `V2GarageDoorPreview.tsx` | 88 | Stats bar, About with image, Process steps, FAQ |
| `V2LocksmithPreview.tsx` | 88 | Stats bar, About with image, Process steps, FAQ |
| `V2PressureWashingPreview.tsx` | 88 | Stats bar, About with image, Process steps, FAQ |
| `V2TowingPreview.tsx` | 88 | Stats bar, About with image, Process steps, FAQ |
| `V2TreeServicePreview.tsx` | 183 | Stats bar, dedicated About section with image |
| `V2PhysicalTherapyPreview.tsx` | 192 | Stats bar, Gallery/Clinic photos, Process steps |
| `V2TutoringPreview.tsx` | 198 | Stats bar, Gallery/Results section, Process steps |

**Recommendation:** Expand all 8 templates to match the full V2 structure. The five 88-line stubs are clearly copy-paste scaffolds that were never fleshed out. The TreeService, PhysicalTherapy, and Tutoring templates are partially built but need the missing sections added. Reference `V2HvacPreview.tsx` (695 lines) or `V2PlumberPreview.tsx` (715 lines) as the gold standard for the service-business layout.

---

## Issue Category 2 — Dark Themes Requiring Brightening (Priority: High)

Seven templates use very dark background constants (average RGB brightness below 20/255), making them feel heavy and uninviting for local business owners. The six previously fixed templates (Catering, Daycare, Florist, Interior Design, Photography, Veterinary) demonstrate the correct approach — using light backgrounds like `#faf8f6` or white for lifestyle/service categories.

| Template | Dark Constant | Hex Value | Industry Fit Issue |
| :--- | :--- | :--- | :--- |
| `V2SalonPreview.tsx` | `DARK` | `#1a0a10` | Salons should feel luxurious and bright, not nightclub-dark |
| `V2PetServicesPreview.tsx` | `BG` | `#0a1015` | Pet businesses need a warm, friendly, approachable feel |
| `V2AutoRepairPreview.tsx` | `DARK` | `#111111` | Acceptable for auto repair, but very harsh — could use a softer dark |
| `V2GeneralContractorPreview.tsx` | `BG` | `#0f1215` | General contractors benefit from a clean, professional light theme |
| `V2PhysicalTherapyPreview.tsx` | `BG` | `#0a0f1a` | Medical/clinical services should use clean whites and light blues |
| `V2TutoringPreview.tsx` | `BG` | `#0a0f1a` | Educational services should feel welcoming and bright |
| `V2LawFirmPreview.tsx` | `DARK` | `#0f172a` | Law firms can use dark themes, but this is very heavy — navy blue would be more professional |

**Note on AutoRepair and LawFirm:** These two categories are more acceptable with a dark theme than the others. AutoRepair (`#111111`) has industry precedent for dark/industrial aesthetics. LawFirm (`#0f172a`) is a very dark navy that could be lightened to a mid-navy (`#1e3a5f`) rather than converted to a full light theme. The other five (Salon, PetServices, GeneralContractor, PhysicalTherapy, Tutoring) should be converted to light backgrounds.

**Recommended fix:** Follow the Catering/Daycare pattern — set `BG = "#faf8f6"` or `BG = "#ffffff"`, change all text from `text-white` to `text-slate-900`, and update section gradient backgrounds from dark hex values to light equivalents.

---

## Issue Category 3 — Duplicate Fallback Images (Priority: High)

When prospect photo scraping fails, templates fall back to hardcoded Unsplash URLs. A sweep of all 41 templates found 9 images shared across 3 or more completely unrelated categories. If a prospect's data extraction fails, they will see the same generic house/construction photo on their Locksmith site as a Real Estate prospect sees on theirs.

**Images used in 3+ unrelated templates:**

| Unsplash Image ID | Used In (Categories) | Issue |
| :--- | :--- | :--- |
| `photo-1600585154340-be6161a56a0c` | Construction, Garage Door, General Contractor, HVAC, Locksmith, Painting, Pressure Washing, Real Estate | Generic house exterior used in 8 different categories |
| `photo-1600596542815-ffad4c1539a9` | Construction, Garage Door, Locksmith, Pool & Spa, Pressure Washing, Real Estate, Roofing | Another generic house used in 7 categories |
| `photo-1504307651254-35680f356dfd` | Construction, Garage Door, General Contractor, Roofing, Towing | Shared across 5 categories |
| `photo-1558618666-fcd25c85f82e` | Fencing, Locksmith, Painting, Pressure Washing, Towing | Shared across 5 categories |
| `photo-1581578731548-c64695cc6952` | Cleaning, Construction, Locksmith, Pressure Washing | Shared across 4 categories |
| `photo-1581092160562-40aa08e78837` | Cleaning, Electrician, HVAC, Pest Control | Shared across 4 categories |
| `photo-1564013799919-ab600027ffc6` | Construction, Garage Door, Locksmith, Pressure Washing | Shared across 4 categories |
| `photo-1556909114-f6e7ad7d3136` | Cleaning, Painting, Plumber | Shared across 3 categories |
| `photo-1507003211169-0a1dd7228f2d` | Insurance, Law Firm, Pool & Spa | Person photo used in 3 unrelated categories |

**Images shared between 2 related categories (acceptable):**

| Unsplash Image ID | Used In | Assessment |
| :--- | :--- | :--- |
| `photo-1414235077428-338989a2e8c0` | Catering, Restaurant | Related — acceptable |
| `photo-1571019613454-1cb2f99b2d8b` | Chiropractic, Physical Therapy | Related — acceptable |
| `photo-1548199973-03cce0bbc87b` | Pet Services, Veterinary | Related — acceptable |
| `photo-1600566753190-17f0baa2a6c3` | Interior Design, Painting | Related — acceptable |

**Recommendation:** Replace the 9 highly-duplicated fallback images with category-specific Unsplash URLs. Each template should have a unique set of 6–10 fallback images that are clearly relevant to that specific industry. This is especially important for the Locksmith, Towing, and Pressure Washing templates which currently share 3–4 images with completely unrelated categories.

---

## Issue Category 4 — Missing Gallery Sections in Visual-Heavy Categories (Priority: Medium)

Two templates that serve highly visual industries are missing a dedicated gallery or portfolio section.

| Template | Missing Section | Why It Matters |
| :--- | :--- | :--- |
| `V2PhysicalTherapyPreview.tsx` | Clinic/facility gallery | Patients want to see the treatment environment before booking |
| `V2TutoringPreview.tsx` | Results/success gallery or classroom photos | Parents want social proof of the learning environment |

**Note:** `V2AccountingPreview.tsx` and `V2PestControlPreview.tsx` use a "Results" section (`id="results"`) instead of a gallery, which is appropriate for their industries. This is not a bug.

---

## Issue Category 5 — Layout and Spacing Issues (Priority: Medium)

Several templates were identified with specific layout concerns:

**V2PaintingPreview.tsx (330 lines):** This template is significantly shorter than other trade templates (Plumber: 715 lines, HVAC: 695 lines). While it has all required sections, each section is very sparse. The gallery uses `aspect-square` images which may crop oddly on certain photo ratios. The "About" section lacks the trust badges grid that most other trade templates include.

**V2FencingPreview.tsx (240 lines):** The services section renders services as a flat list without descriptions or icons, unlike the card-based layout used in comparable templates. The stats section is missing entirely.

**V2FloristPreview.tsx (264 lines):** Gallery-first layout (gallery is the second section after hero) is unconventional and may confuse visitors who expect to see services first. Consider reordering to: Hero → Services → Gallery → About → Contact.

**V2PetServicesPreview.tsx (216 lines):** Missing a "Process" or "How It Works" section that would explain the grooming/boarding/care process — a key trust-builder for pet owners leaving their animals with a business.

---

## Issue Category 6 — Inconsistent Branding Elements (Priority: Low)

**Church template (`V2ChurchPreview.tsx`):** Uses a "Services" section label for what are actually "Ministries" or "Programs." The nav link says "Services" but the section content is about church programs. This has been partially addressed with `id="ministries"` but the nav still reads "Services."

**Restaurant template (`V2RestaurantPreview.tsx`):** The nav uses "Menu" as the primary section label, but the section `id` is `menu` while the services array is used to populate menu items. This is a creative reuse of the `services` data field, but if a restaurant's scraped data has generic "services" names, the menu section will look wrong. Consider adding a menu-specific data field or a fallback set of menu categories.

**Insurance template (`V2InsurancePreview.tsx`):** The gallery section (`id="gallery"`) shows generic stock photos rather than anything insurance-specific. For an insurance agency, this section would be better used as a "Carriers We Work With" logo grid or a "Client Success Stories" section.

---

## Full Template Status Summary

| Template | Lines | Status | Issues |
| :--- | :---: | :--- | :--- |
| Accounting | 428 | ✅ Good | No gallery (appropriate for category) |
| AutoRepair | 697 | ⚠️ Dark Theme | Dark background (`#111111`) |
| Catering | 448 | ✅ Fixed | Previously brightened |
| Chiropractic | 1010 | ✅ Excellent | Fully built |
| Church | 901 | ✅ Good | Minor nav label inconsistency |
| Cleaning | 726 | ✅ Good | — |
| Construction | 88 | 🔴 Stub | Missing stats, about-with-image, process, FAQ |
| Daycare | 725 | ✅ Fixed | Previously brightened |
| Dental | 1077 | ✅ Excellent | Fully built |
| Electrician | 1146 | ✅ Excellent | Fully built |
| Fencing | 240 | ⚠️ Sparse | Missing stats bar, sparse services section |
| Fitness | 639 | ✅ Good | — |
| Florist | 264 | ✅ Fixed | Previously brightened; gallery-first layout |
| GarageDoor | 88 | 🔴 Stub | Missing stats, about-with-image, process, FAQ |
| GeneralContractor | 630 | ⚠️ Dark Theme | Dark background (`#0f1215`) |
| HVAC | 695 | ✅ Good | — |
| Insurance | 725 | ⚠️ Minor | Gallery section not industry-appropriate |
| InteriorDesign | 668 | ✅ Fixed | Previously brightened |
| Landscaping | 684 | ✅ Good | — |
| LawFirm | 760 | ⚠️ Dark Theme | Very dark navy (`#0f172a`) — lighten to mid-navy |
| Locksmith | 88 | 🔴 Stub | Missing stats, about-with-image, process, FAQ |
| MartialArts | 724 | ✅ Good | — |
| Medical | 505 | ✅ Good | — |
| Moving | 725 | ✅ Good | — |
| Painting | 330 | ⚠️ Sparse | Short for a trade template; sparse sections |
| PestControl | 529 | ✅ Good | No gallery (appropriate for category) |
| PetServices | 216 | ⚠️ Dark + Sparse | Dark background + missing process section |
| Photography | 833 | ✅ Fixed | Previously brightened |
| PhysicalTherapy | 192 | 🔴 Stub + Dark | Dark background + missing gallery, process, stats |
| Plumber | 715 | ✅ Good | — |
| PoolSpa | 724 | ✅ Good | — |
| PressureWashing | 88 | 🔴 Stub | Missing stats, about-with-image, process, FAQ |
| RealEstate | 609 | ✅ Good | — |
| Restaurant | 806 | ✅ Good | Menu data relies on services array |
| Roofing | 691 | ✅ Good | — |
| Salon | 673 | ⚠️ Dark Theme | Dark background (`#1a0a10`) — should be light |
| Tattoo | 430 | ✅ Good | — |
| Towing | 88 | 🔴 Stub | Missing stats, about-with-image, process, FAQ |
| TreeService | 183 | ⚠️ Sparse | Missing stats bar, about-with-image |
| Tutoring | 198 | 🔴 Stub + Dark | Dark background + missing gallery, stats, process |
| Veterinary | 935 | ✅ Fixed | Previously brightened |

**Legend:** ✅ Good/Fixed · ⚠️ Minor Issues · 🔴 Needs Significant Work

---

## Recommended Priority Order

1. **Build out the 5 fully-stubbed templates** (Construction, GarageDoor, Locksmith, PressureWashing, Towing) — these are the most likely to be pitched to prospects and currently look unfinished.
2. **Brighten the 5 light-theme-appropriate dark templates** (Salon, PetServices, GeneralContractor, PhysicalTherapy, Tutoring).
3. **Complete the semi-stub templates** (TreeService, Painting, Fencing) with missing sections.
4. **Replace the 9 highly-duplicated fallback images** with category-specific Unsplash URLs.
5. **Address the minor layout issues** (Insurance gallery, Church nav label, Restaurant menu data).
