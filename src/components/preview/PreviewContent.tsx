import type { GeneratedSiteData } from "@/lib/generator";
import { getFontPairing } from "@/lib/typography";
import PreviewRenderer from "@/components/templates/PreviewRenderer";
import V2ElectricianPreview from "@/components/templates/V2ElectricianPreview";
import V2DentalPreview from "@/components/templates/V2DentalPreview";
import V2LawFirmPreview from "@/components/templates/V2LawFirmPreview";
import V2SalonPreview from "@/components/templates/V2SalonPreview";
import V2FitnessPreview from "@/components/templates/V2FitnessPreview";
import V2RealEstatePreview from "@/components/templates/V2RealEstatePreview";
import V2ChurchPreview from "@/components/templates/V2ChurchPreview";
import V2PlumberPreview from "@/components/templates/V2PlumberPreview";
import V2HvacPreview from "@/components/templates/V2HvacPreview";
import V2RoofingPreview from "@/components/templates/V2RoofingPreview";
import V2AutoRepairPreview from "@/components/templates/V2AutoRepairPreview";
import V2ChiropracticPreview from "@/components/templates/V2ChiropracticPreview";
import V2VeterinaryPreview from "@/components/templates/V2VeterinaryPreview";
import V2PhotographyPreview from "@/components/templates/V2PhotographyPreview";
import V2InteriorDesignPreview from "@/components/templates/V2InteriorDesignPreview";
import V2LandscapingPreview from "@/components/templates/V2LandscapingPreview";
import V2CleaningPreview from "@/components/templates/V2CleaningPreview";
import V2PestControlPreview from "@/components/templates/V2PestControlPreview";
import V2AccountingPreview from "@/components/templates/V2AccountingPreview";
import V2TattooPreview from "@/components/templates/V2TattooPreview";
import V2FloristPreview from "@/components/templates/V2FloristPreview";
import V2MovingPreview from "@/components/templates/V2MovingPreview";
import V2DaycarePreview from "@/components/templates/V2DaycarePreview";
import V2InsurancePreview from "@/components/templates/V2InsurancePreview";
import V2MartialArtsPreview from "@/components/templates/V2MartialArtsPreview";
import V2PoolSpaPreview from "@/components/templates/V2PoolSpaPreview";
import V2GeneralContractorPreview from "@/components/templates/V2GeneralContractorPreview";
import V2CateringPreview from "@/components/templates/V2CateringPreview";
import V2PetServicesPreview from "@/components/templates/V2PetServicesPreview";
import V2PhysicalTherapyPreview from "@/components/templates/V2PhysicalTherapyPreview";
import V2TutoringPreview from "@/components/templates/V2TutoringPreview";
import V2RestaurantPreview from "@/components/templates/V2RestaurantPreview";
import V2MedicalPreview from "@/components/templates/V2MedicalPreview";
import V2PaintingPreview from "@/components/templates/V2PaintingPreview";
import V2FencingPreview from "@/components/templates/V2FencingPreview";
import V2TreeServicePreview from "@/components/templates/V2TreeServicePreview";
import V2PressureWashingPreview from "@/components/templates/V2PressureWashingPreview";
import V2GarageDoorPreview from "@/components/templates/V2GarageDoorPreview";
import V2LocksmithPreview from "@/components/templates/V2LocksmithPreview";
import V2TowingPreview from "@/components/templates/V2TowingPreview";
import V2ConstructionPreview from "@/components/templates/V2ConstructionPreview";
import V2MedSpaPreview from "@/components/templates/V2MedSpaPreview";
import V2ApplianceRepairPreview from "@/components/templates/V2ApplianceRepairPreview";
import V2JunkRemovalPreview from "@/components/templates/V2JunkRemovalPreview";
import V2CarpetCleaningPreview from "@/components/templates/V2CarpetCleaningPreview";
import V2EventPlanningPreview from "@/components/templates/V2EventPlanningPreview";
import PreviewImageGuard from "@/components/preview/PreviewImageGuard";
import { proxyPhotos } from "@/lib/image-proxy";
import { sanitizeImageUrls, validateImageUrl } from "@/lib/image-validator";
import {
  getCategoryFallbackImage,
  getCompleteCategoryFallbackSet,
} from "@/lib/stock-image-picker";
import {
  getHeroHeading,
  getHeroImage,
  getHeroSubtitle,
  getNavName,
} from "@/lib/preview-utils";

const V2_RENDERERS: Partial<Record<string, React.ComponentType<{ data: GeneratedSiteData }>>> = {
  electrician: V2ElectricianPreview,
  dental: V2DentalPreview,
  "law-firm": V2LawFirmPreview,
  salon: V2SalonPreview,
  fitness: V2FitnessPreview,
  "real-estate": V2RealEstatePreview,
  church: V2ChurchPreview,
  plumber: V2PlumberPreview,
  hvac: V2HvacPreview,
  roofing: V2RoofingPreview,
  "auto-repair": V2AutoRepairPreview,
  chiropractic: V2ChiropracticPreview,
  veterinary: V2VeterinaryPreview,
  photography: V2PhotographyPreview,
  "interior-design": V2InteriorDesignPreview,
  landscaping: V2LandscapingPreview,
  cleaning: V2CleaningPreview,
  "pest-control": V2PestControlPreview,
  accounting: V2AccountingPreview,
  tattoo: V2TattooPreview,
  florist: V2FloristPreview,
  moving: V2MovingPreview,
  daycare: V2DaycarePreview,
  insurance: V2InsurancePreview,
  "martial-arts": V2MartialArtsPreview,
  "pool-spa": V2PoolSpaPreview,
  "general-contractor": V2GeneralContractorPreview,
  catering: V2CateringPreview,
  "pet-services": V2PetServicesPreview,
  "physical-therapy": V2PhysicalTherapyPreview,
  tutoring: V2TutoringPreview,
  restaurant: V2RestaurantPreview,
  medical: V2MedicalPreview,
  painting: V2PaintingPreview,
  fencing: V2FencingPreview,
  "tree-service": V2TreeServicePreview,
  "pressure-washing": V2PressureWashingPreview,
  "garage-door": V2GarageDoorPreview,
  locksmith: V2LocksmithPreview,
  towing: V2TowingPreview,
  construction: V2ConstructionPreview,
  "med-spa": V2MedSpaPreview,
  "appliance-repair": V2ApplianceRepairPreview,
  "junk-removal": V2JunkRemovalPreview,
  "carpet-cleaning": V2CarpetCleaningPreview,
  "event-planning": V2EventPlanningPreview,
};

interface PreviewContentProps {
  id: string;
  siteData: GeneratedSiteData;
  selectedTheme: "light" | "dark";
  version?: "v1" | "v2";
}

function unwrapApprovedProxyUrl(url: string | undefined | null): string {
  const value = url?.trim();
  if (!value || !value.includes("/api/image-proxy")) {
    return value || "";
  }

  try {
    const parsed = new URL(value, "https://bluejayportfolio.com");
    if (parsed.pathname !== "/api/image-proxy") {
      return value;
    }

    const target = parsed.searchParams.get("url");
    if (!target) {
      return value;
    }

    const decoded = decodeURIComponent(target).trim();
    const host = new URL(decoded).hostname;
    if (host === "images.unsplash.com") {
      return decoded;
    }

    return value;
  } catch {
    return value;
  }
}

function normalizePreviewPhotoUrl(url: string | undefined | null): string {
  return unwrapApprovedProxyUrl(url);
}

function getValidatedPreviewPhotos(id: string, siteData: GeneratedSiteData, businessName: string): string[] {
  const sanitizedPhotos = sanitizeImageUrls(siteData.photos).map(normalizePreviewPhotoUrl);
  const { category } = siteData;
  const uniquePhotos: string[] = [];

  const pushUnique = (url: string | undefined) => {
    const normalizedUrl = normalizePreviewPhotoUrl(url);
    if (!normalizedUrl || uniquePhotos.includes(normalizedUrl)) return;
    uniquePhotos.push(normalizedUrl);
  };

  // PRIORITY ORDER — scraped photos first, category fallbacks only to fill gaps.
  //
  // Every V2 template consumes this list as: [0]=hero-bg, [1]=hero-card,
  // [2]=about, [3+]=gallery. Previous logic put the hero/about category
  // fallbacks at slots [0] and [1] via getHeroImage + validateImageUrl's
  // strict "hero"/"about" variant rules, which rejected legitimate business
  // photos (e.g. Titan Builders' DJI aerial drone shots of finished homes)
  // in favor of generic Unsplash stock. For a prospect with 14 real photos
  // on their own website, rendering a stock contractor-on-ladder as the
  // hero card was a massive downgrade.
  //
  // New rule: if a prospect has ANY scraped photos that pass gallery-variant
  // validation, they fill [0]/[1]/[2] before any fallback runs. Only when
  // we run out of real photos do we reach for category pools — and only for
  // the slots we couldn't fill with real imagery.

  // Prefer the explicitly-chosen heroImage first (the generator already
  // picked the best candidate). Falls through to scraped photos if missing.
  const heroCandidate = normalizePreviewPhotoUrl(getHeroImage({ ...siteData, photos: sanitizedPhotos }));
  if (heroCandidate) {
    const heroResult = validateImageUrl(heroCandidate, category, "gallery");
    if (!heroResult.shouldUseFallback && heroResult.sanitizedUrl) {
      pushUnique(heroResult.sanitizedUrl);
    }
  }

  // Now push every remaining scraped photo that passes gallery validation.
  // pushUnique skips the heroCandidate we already added.
  for (const photo of sanitizedPhotos) {
    const result = validateImageUrl(photo, category, "gallery");
    if (!result.shouldUseFallback && result.sanitizedUrl) {
      pushUnique(result.sanitizedUrl);
    }
  }

  // Backfill slots [0], [1], [2] with category-pool fallbacks ONLY if we
  // don't have 3 scraped photos. These three slots are the above-the-fold
  // images — they MUST be populated or the preview looks broken.
  if (uniquePhotos.length < 1) {
    pushUnique(getCategoryFallbackImage(category, "hero", businessName, 0, uniquePhotos));
  }
  if (uniquePhotos.length < 2) {
    pushUnique(getCategoryFallbackImage(category, "about", businessName, 1, uniquePhotos));
  }
  if (uniquePhotos.length < 3) {
    pushUnique(getCategoryFallbackImage(category, "hero-card", businessName, 2, uniquePhotos));
  }

  // Remaining category fallbacks for services/team/testimonials slots.
  pushUnique(getCategoryFallbackImage(category, "services", businessName, 3, uniquePhotos));
  pushUnique(getCategoryFallbackImage(category, "team", businessName, 4, uniquePhotos));
  pushUnique(getCategoryFallbackImage(category, "testimonials", businessName, 5, uniquePhotos));

  for (const fallbackUrl of getCompleteCategoryFallbackSet(category, businessName)) {
    pushUnique(fallbackUrl);
    if (uniquePhotos.length >= 36) break;
  }

  return proxyPhotos(uniquePhotos, id);
}

export default function PreviewContent({
  id,
  siteData,
  selectedTheme,
  version = "v2",
}: PreviewContentProps) {
  const forceV1 = version === "v1";
  const businessName = getNavName(siteData);
  const orderedPhotos = getValidatedPreviewPhotos(id, siteData, businessName);

  const proxiedData: GeneratedSiteData & { themeMode?: "light" | "dark" } = {
    ...siteData,
    id,
    businessName,
    tagline: getHeroHeading(siteData),
    about:
      getHeroSubtitle(siteData) !== siteData.about
        ? siteData.about || getHeroSubtitle(siteData)
        : siteData.about,
    photos: orderedPhotos,
    themeMode: selectedTheme,
  };

  if (!forceV1) {
    const V2Renderer = V2_RENDERERS[proxiedData.category];
    if (V2Renderer) {
      const isLightV2Theme = selectedTheme === "light";

      // Check for font override in site data
      const fontOverride = (proxiedData as Record<string, unknown>).fontOverride as { heading: string; body: string } | undefined;
      const fonts = fontOverride
        ? {
            heading: fontOverride.heading,
            body: fontOverride.body,
            googleUrl: `https://fonts.googleapis.com/css2?family=${fontOverride.heading.replace(/ /g, "+")}:wght@400;600;700;800&family=${fontOverride.body.replace(/ /g, "+")}:wght@300;400;500;600&display=swap`,
          }
        : getFontPairing(proxiedData.category);

      return (
        <PreviewImageGuard
          category={proxiedData.category}
          businessName={businessName}
          prospectId={id}
          knownPhotos={orderedPhotos}
        >
          {/* Google Fonts for this category */}
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link href={fonts.googleUrl} rel="stylesheet" />
          <div
            data-theme={selectedTheme}
            className={isLightV2Theme ? "v2-preview-theme v2-preview-theme--light" : "v2-preview-theme"}
            style={{ fontFamily: `'${fonts.body}', sans-serif` }}
          >
            <style>{`
              .v2-preview-root h1, .v2-preview-root h2, .v2-preview-root h3,
              .v2-preview-root [class*="font-bold"], .v2-preview-root [class*="font-semibold"],
              .v2-preview-root [class*="font-black"] {
                font-family: '${fonts.heading}', serif !important;
              }
              .v2-preview-root {
                font-family: '${fonts.body}', sans-serif;
              }
            `}</style>
            <div className="v2-preview-root">
              <V2Renderer data={proxiedData} />
            </div>
          </div>
        </PreviewImageGuard>
      );
    }
  }

  return (
    <PreviewImageGuard
      category={proxiedData.category}
      businessName={businessName}
      prospectId={id}
      knownPhotos={orderedPhotos}
    >
      <div data-theme={selectedTheme}>
        <PreviewRenderer data={proxiedData} />
      </div>
    </PreviewImageGuard>
  );
}
