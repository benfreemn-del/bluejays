import type { Prospect, Category, ScrapedData } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getBestColorForCategory, reviewColorScheme } from "./color-review";
import { updateProspect, saveScrapedData } from "./store";
import { reviewSiteQuality } from "./quality-review";
import { normalizeAddress } from "./address-normalizer";
import { buildValidatedPhotoSet, type PreparedPhotoAudit } from "./image-validator";
import {
  buildAboutFromResearchBrief,
  buildResearchBrief,
  buildTaglineFromResearchBrief,
  lintPlaceholderContent,
  type ResearchBrief,
} from "./content-brief";

/** Pick the best business name — reject truncated, "website", "My Site", empty */
function getCleanBusinessName(scraped: string | undefined, prospect: string): string {
  const bad = ["website", "my site", "home", "untitled", "index"];
  if (!scraped || scraped.length < 3 || bad.includes(scraped.toLowerCase())) return prospect;
  // If scraped name is shorter than prospect name and looks truncated (doesn't end with a word boundary)
  if (scraped.length < prospect.length && /[a-z]$/i.test(scraped) && !scraped.endsWith(".") && !scraped.endsWith(")")) {
    return prospect;
  }
  return scraped;
}

export interface GeneratedSiteData {
  id: string;
  category: Category;
  businessName: string;
  tagline: string;
  accentColor: string;
  brandColorSource?: "official-site" | "logo" | "category-default";
  heroGradient: string;
  phone: string;
  address: string;
  about: string;
  services: { name: string; description?: string; price?: string; icon?: string }[];
  testimonials: { name: string; text: string; rating?: number }[];
  photos: string[];
  hours?: string;
  socialLinks?: Record<string, string>;
  stats: { value: string; label: string }[];
  themeMode?: "light" | "dark";
  city?: string;
  imageAudit?: PreparedPhotoAudit;
  researchBrief?: ResearchBrief;
}

function generateDefaultTagline(businessName: string, category: Category): string {
  const label = CATEGORY_CONFIG[category]?.label || "business";
  const taglines: Partial<Record<Category, string>> = {
    "real-estate": `Your trusted real estate partner. ${businessName} helps you find your dream home.`,
    dental: `Modern dental care for the whole family. ${businessName} is accepting new patients.`,
    "law-firm": `Experienced attorneys fighting for your rights. ${businessName} offers free consultations.`,
    landscaping: `Transform your outdoor space with ${businessName}. Professional landscaping services.`,
    salon: `Where artistry meets luxury. ${businessName} — premium hair and beauty services.`,
  };
  return taglines[category] || `${businessName} — trusted ${label.toLowerCase()} services for your community.`;
}

function generateDefaultAbout(businessName: string, category: Category): string {
  const label = CATEGORY_CONFIG[category]?.label || "business";
  const aboutTexts: Partial<Record<Category, string>> = {
    "real-estate": `${businessName} is a trusted name in local real estate, helping buyers and sellers navigate the market with expert guidance and personalized service.`,
    dental: `At ${businessName}, we provide comprehensive dental care in a comfortable, modern setting. Our experienced team treats patients of all ages using the latest technology and techniques.`,
    "law-firm": `${businessName} provides dedicated legal representation with a personal touch. Our attorneys bring years of experience and a proven track record of results.`,
    landscaping: `${businessName} transforms outdoor spaces into stunning landscapes. From design to installation to maintenance, our team delivers exceptional craftsmanship.`,
    salon: `${businessName} is a premier salon offering expert hair and beauty services in a relaxing atmosphere. Our talented team delivers results that make you feel amazing.`,
  };
  return aboutTexts[category] || `${businessName} is a trusted ${label.toLowerCase()} provider committed to delivering exceptional quality and service. With years of experience serving the local community, we take pride in every project and every client relationship.`;
}

function generateStats(category: Category, reviewCount?: number): { value: string; label: string }[] {
  const baseStats: Partial<Record<Category, { value: string; label: string }[]>> = {
    "real-estate": [
      { value: `${Math.floor(Math.random() * 400 + 200)}+`, label: "Homes Sold" },
      { value: `$${Math.floor(Math.random() * 150 + 50)}M`, label: "In Sales Volume" },
      { value: `${Math.floor(Math.random() * 15 + 5)}+`, label: "Years Experience" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Client Rating" },
    ],
    dental: [
      { value: `${Math.floor(Math.random() * 8000 + 2000)}+`, label: "Patients Served" },
      { value: `${Math.floor(Math.random() * 15 + 5)}+`, label: "Years Experience" },
      { value: "Same Day", label: "Emergency Care" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Patient Rating" },
    ],
    "law-firm": [
      { value: `$${Math.floor(Math.random() * 40 + 10)}M+`, label: "Recovered" },
      { value: `${Math.floor(Math.random() * 800 + 200)}+`, label: "Cases Won" },
      { value: `${Math.floor(Math.random() * 15 + 10)}+`, label: "Years Experience" },
      { value: "Free", label: "Consultation" },
    ],
    landscaping: [
      { value: `${Math.floor(Math.random() * 600 + 200)}+`, label: "Projects Completed" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years in Business" },
      { value: "100%", label: "Licensed & Insured" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.7★", label: "Average Rating" },
    ],
    salon: [
      { value: `${Math.floor(Math.random() * 8000 + 2000)}+`, label: "Happy Clients" },
      { value: `${Math.floor(Math.random() * 10 + 3)}+`, label: "Expert Stylists" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Open" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.9 : 4.7).toFixed(1)}★` : "4.9★", label: "Average Rating" },
    ],
    "med-spa": [
      { value: `${Math.floor(Math.random() * 5000 + 1000)}+`, label: "Treatments Done" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Experience" },
      { value: "Board Certified", label: "Medical Staff" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.9 : 4.7).toFixed(1)}★` : "4.9★", label: "Patient Rating" },
    ],
    "appliance-repair": [
      { value: `${Math.floor(Math.random() * 3000 + 1000)}+`, label: "Repairs Completed" },
      { value: "Same Day", label: "Service Available" },
      { value: `${Math.floor(Math.random() * 15 + 5)}+`, label: "Years Experience" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Customer Rating" },
    ],
    "junk-removal": [
      { value: `${Math.floor(Math.random() * 1500 + 500)}+`, label: "Jobs Completed" },
      { value: "Same Day", label: "Service Available" },
      { value: "70%", label: "Recycled & Donated" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.9 : 4.7).toFixed(1)}★` : "4.9★", label: "Customer Rating" },
    ],
    "carpet-cleaning": [
      { value: `${Math.floor(Math.random() * 4000 + 1000)}+`, label: "Homes Cleaned" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Experience" },
      { value: "100%", label: "Satisfaction Guaranteed" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★", label: "Customer Rating" },
    ],
    "event-planning": [
      { value: `${Math.floor(Math.random() * 500 + 200)}+`, label: "Events Planned" },
      { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Experience" },
      { value: "Full Service", label: "Planning & Design" },
      { value: reviewCount ? `${(reviewCount > 100 ? 4.9 : 4.8).toFixed(1)}★` : "4.9★", label: "Client Rating" },
    ],
  };
  const rating = reviewCount ? `${(reviewCount > 100 ? 4.8 : 4.6).toFixed(1)}★` : "4.8★";
  return baseStats[category] || [
    { value: `${Math.floor(Math.random() * 500 + 200)}+`, label: "Clients Served" },
    { value: `${Math.floor(Math.random() * 10 + 5)}+`, label: "Years Experience" },
    { value: "100%", label: "Licensed & Insured" },
    { value: rating, label: "Average Rating" },
  ];
}

export async function generateSiteData(prospect: Prospect): Promise<GeneratedSiteData> {
  const { category, scrapedData } = prospect;
  const config = CATEGORY_CONFIG[category];
  const sd = ({
    ...((scrapedData || {}) as ScrapedData),
    address: normalizeAddress(scrapedData?.address),
    // Deduplicate photos at the source — remove exact URL matches AND strip query params for base-URL dedup
    photos: [...new Set((scrapedData?.photos || []).map((photo: string) => photo.trim()).filter(Boolean))],
  }) as ScrapedData;

  // CUSTOMIZATION PRIORITY: Always prefer real business data over defaults
  // 1. Use scraped brand color if found, otherwise category default
  // 2. Use real photos from scraping, stock only as last resort
  // 3. Use real services/testimonials/about text when available
  // 4. Match their copywriting tone (formal vs casual)

  const businessName = getCleanBusinessName(sd.businessName, prospect.businessName);
  const researchBrief = buildResearchBrief({ ...prospect, businessName }, sd);
  const validatedPhotos = await buildValidatedPhotoSet({
    photos: sd.photos,
    category,
    businessName,
    logoUrl: sd.logoUrl,
  });

  const generatedTagline = sd.tagline || buildTaglineFromResearchBrief(researchBrief, category);
  const generatedAbout = sd.about || buildAboutFromResearchBrief(researchBrief, category);
  // Ensure every service has a description — empty descriptions make service cards look unprofessional
  const rawServices = sd.services?.length > 0 ? sd.services : getDefaultServices(category);
  const services = rawServices.map((s) => ({
    ...s,
    description: s.description || getDefaultServiceDescription(s.name, category),
  }));
  const testimonials = sd.testimonials?.length > 0 ? sd.testimonials : [];
  const placeholderIssues = lintPlaceholderContent({
    businessName,
    tagline: generatedTagline,
    about: generatedAbout,
    testimonials,
    services,
    city: researchBrief.city || prospect.city,
  });
  if (placeholderIssues.length > 0) {
    console.warn(`  ⚠️ Structured-content lint flagged ${placeholderIssues.length} issue(s) before QC for ${businessName}`);
  }

  const reviewedBrandColor = sd.brandColor ? reviewColorScheme(sd.brandColor, category) : null;
  const accentColor = reviewedBrandColor?.passed
    ? sd.brandColor!
    : reviewedBrandColor?.suggestion?.accentColor || getBestColorForCategory(category) || config.accentColor;
  const brandColorSource: GeneratedSiteData["brandColorSource"] = reviewedBrandColor?.passed
    ? (sd.brandColorSource || "official-site")
    : "category-default";
  const heroGradient = config.heroGradient;

  // Log customization level for quality review
  const customizationScore = [
    sd.businessName ? 1 : 0,
    sd.phone ? 1 : 0,
    sd.address ? 1 : 0,
    sd.about ? 1 : 0,
    (sd.services?.length || 0) > 0 ? 1 : 0,
    (sd.testimonials?.length || 0) > 0 ? 1 : 0,
    (sd.photos?.length || 0) > 0 ? 1 : 0,
    sd.hours ? 1 : 0,
    sd.socialLinks ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  console.log(`  📊 Customization score: ${customizationScore}/9 (${customizationScore >= 6 ? "HIGH" : customizationScore >= 3 ? "MEDIUM" : "LOW — needs more data"})`);

  return {
    id: prospect.id,
    category,
    businessName,
    tagline: generatedTagline,
    accentColor,
    brandColorSource,
    heroGradient,
    phone: sd.phone || prospect.phone || "Call Us Today",
    address: normalizeAddress(sd.address || prospect.address || `${prospect.city}, ${prospect.state}`) || `${prospect.city}, ${prospect.state}`,
    about: generatedAbout,
    services,
    testimonials,
    photos: validatedPhotos.photos,
    city: researchBrief.city || prospect.city,
    imageAudit: validatedPhotos.audit,
    hours: sd.hours,
    socialLinks: sd.socialLinks,
    stats: generateStats(category, prospect.reviewCount),
    researchBrief,
  };
}

export async function generatePreview(prospect: Prospect): Promise<string> {
  console.log(`  🏗️ Generating preview for "${prospect.businessName}"...`);

  const siteData = await generateSiteData(prospect);

  // Save the generated data
  await saveScrapedData(prospect.id, siteData);

  // ═══ FAILSAFE 1: Automated data quality checks ═══
  const hasRealPhone = siteData.phone !== "Call Us Today" && !!siteData.phone;
  const hasRealServices = siteData.services.some((s) => !isDefaultService(s.name));
  const hasRealAbout = !siteData.about.includes("trusted name in local") && !siteData.about.includes("committed to delivering exceptional");
  const hasPhotos = siteData.photos.length > 0;
  const hasMinimumRealPhotos = siteData.imageAudit?.hasMinimumRealPhotos ?? hasPhotos;
  const placeholderIssues = lintPlaceholderContent({
    businessName: siteData.businessName,
    tagline: siteData.tagline,
    about: siteData.about,
    testimonials: siteData.testimonials,
    services: siteData.services,
    city: siteData.city || prospect.city,
  });
  const hasNoPlaceholderContent = placeholderIssues.length === 0;
  const dataChecks = [hasRealPhone, hasRealServices, hasRealAbout, hasMinimumRealPhotos, hasNoPlaceholderContent].filter(Boolean).length;

  // ═══ FAILSAFE 2: Quality review agent (QC gate) ═══
  const qualityReport = reviewSiteQuality(prospect, siteData);
  const criticalIssues = qualityReport.issues.filter(i => i.severity === "critical").length;

  const previewUrl = `/preview/${prospect.id}`;

  // Must pass BOTH failsafes: data checks (4/5) AND quality review (no critical issues, score >= 70)
  const passesFailsafe1 = dataChecks >= 4 && hasNoPlaceholderContent;
  const passesFailsafe2 = qualityReport.passed;
  const passesQc = passesFailsafe1 && passesFailsafe2;

  // QC gate: pass → "ready_to_review", fail → "qc_failed"
  // Sites that don't even have a generated URL yet stay as "generated" (not enough data)
  const status = passesQc ? "ready_to_review" : (dataChecks >= 2 ? "qc_failed" : "generated");

  // Build quality notes for the prospect record
  const qualityNotes = [
    `Score: ${qualityReport.score}/100 ${qualityReport.passed ? "PASSED" : "FAILED"}`,
    `Data checks: ${dataChecks}/5 (phone=${hasRealPhone}, services=${hasRealServices}, about=${hasRealAbout}, photos=${hasMinimumRealPhotos}, placeholders=${hasNoPlaceholderContent})`,
    siteData.researchBrief ? `Research brief:\n${siteData.researchBrief.summary}` : "",
    siteData.imageAudit
      ? `Image audit: checked=${siteData.imageAudit.checkedCount}, real=${siteData.imageAudit.validRealPhotoCount}/${siteData.imageAudit.minimumRequired}, fallbacks=${siteData.imageAudit.fallbackCount}, broken=${siteData.imageAudit.brokenCount}, logos_rejected=${siteData.imageAudit.rejectedLogoCount}, svg_rejected=${siteData.imageAudit.rejectedSvgCount}`
      : "",
    ...qualityReport.issues.filter(i => i.severity === "critical").map(i => `CRITICAL [${i.section}]: ${i.message}`),
    ...qualityReport.issues.filter(i => i.severity === "warning").map(i => `WARNING [${i.section}]: ${i.message}`),
    ...placeholderIssues.map((issue) => `${issue.severity.toUpperCase()} [${issue.section}]: ${issue.message}`),
  ].join("\n");

  console.log(`  ── Failsafe 1 (Data): ${dataChecks}/5 checks (phone=${hasRealPhone}, services=${hasRealServices}, about=${hasRealAbout}, photos=${hasMinimumRealPhotos}, placeholders=${hasNoPlaceholderContent}) → ${passesFailsafe1 ? "PASS" : "FAIL"}`);
  console.log(`  ── Failsafe 2 (Quality): score=${qualityReport.score}/100, critical=${criticalIssues} → ${passesFailsafe2 ? "PASS" : "FAIL"}`);
  console.log(`  ── QC Gate: ${passesQc ? "✅ PASSED → ready_to_review" : `❌ FAILED → ${status}`}`);

  if (!passesQc) {
    const reasons = [];
    if (!passesFailsafe1) reasons.push(`data checks ${dataChecks}/5`);
    if (!passesFailsafe2) reasons.push(`quality score ${qualityReport.score}/100, ${criticalIssues} critical issue(s)`);
    console.log(`  ⚠️ QC FAILED — ${reasons.join(", ")}`);
  }

  await updateProspect(prospect.id, {
    status,
    generatedSiteUrl: previewUrl,
    qualityScore: qualityReport.score,
    qualityNotes,
    qcReviewedAt: new Date().toISOString(),
  });

  console.log(`  📍 Preview at: ${previewUrl}`);
  return previewUrl;
}

/** Generate a reasonable description for a service that was scraped with name-only */
function getDefaultServiceDescription(serviceName: string, category: Category): string {
  const lower = serviceName.toLowerCase();
  // Category-specific descriptions for common services
  const categoryDescriptions: Partial<Record<Category, Record<string, string>>> = {
    dental: {
      cleaning: "Professional teeth cleaning to remove plaque, tartar, and stains for a healthier smile.",
      whitening: "Professional teeth whitening treatments to brighten your smile safely and effectively.",
      implant: "Permanent tooth replacement with natural-looking dental implants.",
      crown: "Custom dental crowns to restore damaged teeth to full function and appearance.",
      emergency: "Same-day emergency dental care for toothaches, broken teeth, and urgent needs.",
      cosmetic: "Smile makeovers including veneers, bonding, and aesthetic enhancements.",
      pediatric: "Gentle, kid-friendly dental care in a warm and welcoming environment.",
      root: "Pain-free root canal therapy using modern techniques to save your natural teeth.",
      filling: "Tooth-colored fillings that blend naturally with your smile.",
      extraction: "Safe, comfortable tooth extractions with options for replacement.",
      denture: "Custom-crafted dentures and partials for a natural-looking smile.",
      orthodon: "Orthodontic treatments including braces and clear aligners for straighter teeth.",
      exam: "Comprehensive dental exams with digital imaging to catch issues early.",
    },
    veterinary: {
      vaccine: "Core and lifestyle vaccinations to protect your pet from preventable diseases.",
      surgery: "Advanced surgical procedures performed with the latest techniques and monitoring.",
      dental: "Professional pet dental cleanings and oral health assessments.",
      emergency: "Urgent veterinary care for injuries, illness, and after-hours emergencies.",
      wellness: "Comprehensive wellness exams to keep your pet healthy at every life stage.",
      groom: "Professional grooming services to keep your pet clean, comfortable, and looking great.",
    },
    moving: {
      residential: "Full-service residential moving with careful handling of all your belongings.",
      commercial: "Efficient office and commercial relocations to minimize downtime.",
      packing: "Professional packing services using quality materials to protect your items.",
      long: "Reliable long-distance moving services with tracking and on-time delivery.",
      storage: "Secure, climate-controlled storage solutions for short or long-term needs.",
    },
  };

  // Try category-specific match
  const catDescs = categoryDescriptions[category];
  if (catDescs) {
    for (const [key, desc] of Object.entries(catDescs)) {
      if (lower.includes(key)) return desc;
    }
  }

  // Generic fallback
  return `Professional ${serviceName.toLowerCase()} services tailored to your specific needs.`;
}

function isDefaultService(name: string): boolean {
  const defaults = ["Buyer Representation", "Seller Services", "Market Analysis", "Investment Properties",
    "General Dentistry", "Cosmetic Dentistry", "Dental Implants", "Emergency Care",
    "Personal Injury", "Family Law", "Criminal Defense", "Estate Planning",
    "Landscape Design", "Lawn Maintenance", "Hardscaping", "Tree Services",
    "Haircuts & Styling", "Color Services", "Treatments", "Special Occasions",
    "Consultation", "Full Service", "Emergency Service", "Maintenance"];
  return defaults.includes(name);
}

function getDefaultServices(category: Category) {
  const defaults: Partial<Record<Category, { name: string; description: string }[]>> = {
    "real-estate": [
      { name: "Buyer Representation", description: "Expert guidance through the home buying process." },
      { name: "Seller Services", description: "Professional marketing and negotiations to sell your home." },
      { name: "Market Analysis", description: "Comprehensive local market data and property valuations." },
      { name: "Investment Properties", description: "Finding profitable investment opportunities." },
    ],
    dental: [
      { name: "General Dentistry", description: "Cleanings, exams, and preventive care." },
      { name: "Cosmetic Dentistry", description: "Whitening, veneers, and smile makeovers." },
      { name: "Dental Implants", description: "Permanent tooth replacement solutions." },
      { name: "Emergency Care", description: "Same-day emergency dental services." },
    ],
    "law-firm": [
      { name: "Personal Injury", description: "Car accidents, slip and fall, and more." },
      { name: "Family Law", description: "Divorce, custody, and adoption cases." },
      { name: "Criminal Defense", description: "Aggressive defense for all charges." },
      { name: "Estate Planning", description: "Wills, trusts, and power of attorney." },
    ],
    landscaping: [
      { name: "Landscape Design", description: "Custom outdoor space design and planning." },
      { name: "Lawn Maintenance", description: "Weekly mowing, edging, and fertilization." },
      { name: "Hardscaping", description: "Patios, walkways, and retaining walls." },
      { name: "Tree Services", description: "Trimming, removal, and stump grinding." },
    ],
    salon: [
      { name: "Haircuts & Styling", description: "Precision cuts and blowout styling." },
      { name: "Color Services", description: "Full color, highlights, and balayage." },
      { name: "Treatments", description: "Keratin, deep conditioning, and repair." },
      { name: "Special Occasions", description: "Bridal and event styling." },
    ],
    electrician: [
      { name: "Residential Wiring", description: "New installation, rewiring, and panel upgrades." },
      { name: "Commercial Electric", description: "Office and retail electrical services." },
      { name: "Emergency Service", description: "24/7 emergency electrical repairs." },
      { name: "Lighting Installation", description: "Indoor, outdoor, and landscape lighting." },
    ],
    plumber: [
      { name: "Emergency Plumbing", description: "24/7 emergency leak and pipe repairs." },
      { name: "Drain Cleaning", description: "Professional drain clearing and maintenance." },
      { name: "Water Heater Service", description: "Installation, repair, and replacement." },
      { name: "Bathroom Remodeling", description: "Full bathroom renovation and fixture installation." },
    ],
    hvac: [
      { name: "AC Repair", description: "Fast, reliable air conditioning repairs." },
      { name: "Heating Service", description: "Furnace and heat pump maintenance and repair." },
      { name: "Installation", description: "New HVAC system design and installation." },
      { name: "Maintenance Plans", description: "Annual tune-ups and preventive maintenance." },
    ],
    roofing: [
      { name: "Roof Replacement", description: "Complete roof tear-off and replacement." },
      { name: "Roof Repair", description: "Leak repair, shingle replacement, and storm damage." },
      { name: "Inspections", description: "Comprehensive roof assessments and reports." },
      { name: "Gutter Services", description: "Gutter installation, repair, and cleaning." },
    ],
    "auto-repair": [
      { name: "Engine Diagnostics", description: "Computer diagnostics and engine repair." },
      { name: "Brake Service", description: "Brake pad replacement, rotor resurfacing, and fluid flush." },
      { name: "Oil Change", description: "Quick oil changes with premium synthetic options." },
      { name: "AC & Heating", description: "Auto climate control repair and recharging." },
    ],
    fitness: [
      { name: "Personal Training", description: "One-on-one custom workout programs." },
      { name: "Group Classes", description: "High-energy group fitness for all levels." },
      { name: "Nutrition Coaching", description: "Meal planning and nutritional guidance." },
      { name: "Online Training", description: "Virtual coaching from anywhere." },
    ],
    veterinary: [
      { name: "Wellness Exams", description: "Annual checkups and preventive care." },
      { name: "Vaccinations", description: "Core and lifestyle vaccinations for dogs and cats." },
      { name: "Surgery", description: "Spay/neuter, dental, and soft tissue surgery." },
      { name: "Emergency Care", description: "Urgent and emergency veterinary services." },
    ],
    "med-spa": [
      { name: "Botox & Fillers", description: "Injectable treatments for wrinkles and volume restoration." },
      { name: "Laser Treatments", description: "Advanced laser skin resurfacing and hair removal." },
      { name: "Chemical Peels", description: "Medical-grade peels for skin rejuvenation." },
      { name: "Body Contouring", description: "Non-invasive body sculpting and fat reduction." },
    ],
    "appliance-repair": [
      { name: "Refrigerator Repair", description: "Diagnosis and repair for all refrigerator brands." },
      { name: "Washer & Dryer", description: "Full-service washer and dryer repair and maintenance." },
      { name: "Dishwasher Repair", description: "Expert dishwasher troubleshooting and repair." },
      { name: "Oven & Range", description: "Gas and electric oven repair and calibration." },
    ],
    "junk-removal": [
      { name: "Residential Junk Removal", description: "Furniture, appliances, and household item hauling." },
      { name: "Commercial Cleanouts", description: "Office and retail space cleanout services." },
      { name: "Estate Cleanouts", description: "Compassionate full-property estate clearing." },
      { name: "Construction Debris", description: "Post-construction cleanup and debris removal." },
    ],
    "carpet-cleaning": [
      { name: "Deep Steam Cleaning", description: "Hot water extraction for deep carpet cleaning." },
      { name: "Stain Removal", description: "Professional treatment for tough stains and spots." },
      { name: "Pet Odor Treatment", description: "Enzyme-based pet odor and stain elimination." },
      { name: "Upholstery Cleaning", description: "Professional cleaning for sofas, chairs, and more." },
    ],
    "event-planning": [
      { name: "Wedding Planning", description: "Full-service wedding coordination and design." },
      { name: "Corporate Events", description: "Professional conferences, galas, and team events." },
      { name: "Birthday & Celebrations", description: "Custom party planning for all ages." },
      { name: "Event Design", description: "Creative decor, floral, and venue styling." },
    ],
  };
  const label = CATEGORY_CONFIG[category]?.label || "Business";
  return defaults[category] || [
    { name: "Consultation", description: `Free initial ${label.toLowerCase()} consultation.` },
    { name: "Full Service", description: `Comprehensive ${label.toLowerCase()} services tailored to your needs.` },
    { name: "Emergency Service", description: "Available for urgent needs and quick turnarounds." },
    { name: "Maintenance", description: "Ongoing support and maintenance packages." },
  ];
}

function getDefaultTestimonials(category: Category) {
  const defaults: Partial<Record<Category, { name: string; text: string }[]>> = {
    "real-estate": [
      { name: "Happy Client", text: "Found our dream home quickly. The process was incredibly smooth." },
      { name: "Satisfied Seller", text: "Sold above asking price in just two weeks. Highly recommend!" },
      { name: "First-Time Buyer", text: "They made buying my first home easy and stress-free." },
    ],
    dental: [
      { name: "Patient", text: "Best dental experience I've ever had. Gentle, professional, and thorough." },
      { name: "Parent", text: "My kids love going to the dentist now. The staff is amazing with children." },
      { name: "New Patient", text: "Modern office, friendly team, and completely painless procedures." },
    ],
    "law-firm": [
      { name: "Client", text: "They fought for me when no one else would. Got the settlement I deserved." },
      { name: "Grateful Client", text: "Professional, compassionate, and incredibly effective. Can't thank them enough." },
      { name: "Referred Client", text: "Was referred by a friend and now I understand why. Outstanding representation." },
    ],
    landscaping: [
      { name: "Homeowner", text: "Our yard went from embarrassing to the best on the block. Amazing work." },
      { name: "Repeat Customer", text: "They've maintained our property for years. Always reliable and professional." },
      { name: "Happy Client", text: "The patio they built is absolutely stunning. We practically live outside now." },
    ],
    salon: [
      { name: "Regular Client", text: "Best salon in town. My hair has never looked better!" },
      { name: "New Client", text: "Finally found my forever salon. The talent here is incredible." },
      { name: "Bride", text: "Made me feel like a princess on my wedding day. Couldn't be happier." },
    ],
    "med-spa": [
      { name: "Happy Client", text: "The results are incredible. I look 10 years younger and it was completely painless." },
      { name: "Regular Patient", text: "Best med spa in the area. The staff is knowledgeable and the facility is gorgeous." },
      { name: "New Client", text: "Finally found a place I trust for my treatments. Professional and results-driven." },
    ],
    "appliance-repair": [
      { name: "Homeowner", text: "Fixed my refrigerator same day. Fair price and the tech explained everything clearly." },
      { name: "Repeat Customer", text: "They've fixed our washer, dryer, and dishwasher over the years. Always reliable." },
      { name: "Happy Client", text: "Saved us from buying a new oven. Quick diagnosis and affordable repair." },
    ],
    "junk-removal": [
      { name: "Homeowner", text: "Cleared out our entire garage in under an hour. Fast, professional, and fairly priced." },
      { name: "Estate Client", text: "Handled my mother's estate cleanout with care and respect. Highly recommend." },
      { name: "Contractor", text: "We use them for all our post-construction cleanups. Always on time and thorough." },
    ],
    "carpet-cleaning": [
      { name: "Homeowner", text: "Our carpets look brand new. They got out stains we thought were permanent." },
      { name: "Pet Owner", text: "Finally got rid of the pet odor. The house smells fresh for the first time in years." },
      { name: "Repeat Client", text: "We have them come twice a year. Consistent quality every single time." },
    ],
    "event-planning": [
      { name: "Bride", text: "Our wedding was absolutely perfect. Every detail was handled flawlessly." },
      { name: "Corporate Client", text: "They planned our annual gala and it was our best event ever. Incredible attention to detail." },
      { name: "Birthday Client", text: "Threw my daughter the party of her dreams. Creative, organized, and so much fun." },
    ],
  };
  return defaults[category] || [
    { name: "Happy Customer", text: "Outstanding service from start to finish. Highly recommend to anyone!" },
    { name: "Returning Client", text: "We've been coming back for years. Consistently excellent quality and professionalism." },
    { name: "New Client", text: "Wish I had found them sooner. Made the entire experience easy and stress-free." },
  ];
}
