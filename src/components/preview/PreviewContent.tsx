import type { GeneratedSiteData } from "@/lib/generator";
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
import { proxyPhotos } from "@/lib/image-proxy";
import { sanitizeImageUrl, sanitizeImageUrls } from "@/lib/image-validator";
import {
  getAboutImage,
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

export default function PreviewContent({
  id,
  siteData,
  selectedTheme,
  version = "v2",
}: PreviewContentProps) {
  const forceV1 = version === "v1";
  const sanitizedPhotos = sanitizeImageUrls(siteData.photos);
  const safeSiteData = { ...siteData, photos: sanitizedPhotos };
  const heroImg = sanitizeImageUrl(getHeroImage(safeSiteData));
  const aboutImg = sanitizeImageUrl(getAboutImage(safeSiteData));
  const cleanPhotos = proxyPhotos(sanitizedPhotos);

  const findMatchingProxyPhoto = (targetUrl: string | undefined, fallback: string | undefined) => {
    if (!targetUrl) return fallback;

    const baseTarget = encodeURIComponent(sanitizeImageUrl(targetUrl).split("?")[0]);
    return cleanPhotos.find((photo) => photo.includes(baseTarget)) || fallback;
  };

  const orderedPhotos = [
    findMatchingProxyPhoto(heroImg, cleanPhotos[0]),
    findMatchingProxyPhoto(aboutImg, cleanPhotos[1]),
    ...cleanPhotos.slice(2),
  ].filter(Boolean) as string[];

  const proxiedData: GeneratedSiteData & { themeMode?: "light" | "dark" } = {
    ...siteData,
    id,
    businessName: getNavName(siteData),
    tagline: getHeroHeading(siteData),
    about:
      getHeroSubtitle(siteData) !== siteData.about
        ? siteData.about || getHeroSubtitle(siteData)
        : siteData.about,
    photos: orderedPhotos.length > 0 ? orderedPhotos : cleanPhotos,
    themeMode: selectedTheme,
  };

  if (!forceV1) {
    const V2Renderer = V2_RENDERERS[proxiedData.category];
    if (V2Renderer) {
      const isLightV2Theme = selectedTheme === "light";

      return (
        <div
          data-theme={selectedTheme}
          className={isLightV2Theme ? "v2-preview-theme v2-preview-theme--light" : "v2-preview-theme"}
        >
          <div className="v2-preview-root">
            <V2Renderer data={proxiedData} />
          </div>
        </div>
      );
    }
  }

  return (
    <div data-theme={selectedTheme}>
      <PreviewRenderer data={proxiedData} />
    </div>
  );
}
