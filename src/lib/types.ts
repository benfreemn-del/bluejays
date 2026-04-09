export type Category =
  | "real-estate"
  | "dental"
  | "law-firm"
  | "landscaping"
  | "salon"
  | "electrician"
  | "plumber"
  | "hvac"
  | "roofing"
  | "general-contractor"
  | "auto-repair"
  | "chiropractic"
  | "accounting"
  | "insurance"
  | "photography"
  | "interior-design"
  | "cleaning"
  | "pest-control"
  | "moving"
  | "veterinary"
  | "fitness"
  | "tattoo"
  | "florist"
  | "catering"
  | "daycare"
  | "pet-services"
  | "martial-arts"
  | "physical-therapy"
  | "tutoring"
  | "pool-spa"
  | "church"
  | "restaurant"
  | "medical"
  | "painting"
  | "fencing"
  | "tree-service"
  | "pressure-washing"
  | "garage-door"
  | "locksmith"
  | "towing"
  | "construction"
  | "med-spa"
  | "appliance-repair"
  | "junk-removal"
  | "carpet-cleaning"
  | "event-planning";

export type ProspectStatus =
  | "scouted"
  | "scraped"
  | "generated"
  | "pending-review"
  | "ready_to_review"   // passed QC gate — ready for Ben's manual approval
  | "qc_failed"         // failed QC gate — needs fixes before approval
  | "approved"
  | "changes_pending"
  | "ready_to_finalize"
  | "deployed"
  | "contacted"
  | "engaged"
  | "link_clicked"
  | "responded"
  | "interested"
  | "claimed"
  | "paid"
  | "dismissed"
  | "unsubscribed"
  | "pro-bono";

export interface Prospect {
  id: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  category: Category;
  currentWebsite?: string;
  googleRating?: number;
  reviewCount?: number;
  estimatedRevenueTier: "low" | "medium" | "high";
  status: ProspectStatus;
  scrapedData?: ScrapedData;
  generatedSiteUrl?: string;
  stripeCustomerId?: string;
  paidAt?: string;
  selectedTheme?: "light" | "dark";
  aiThemeRecommendation?: "light" | "dark";
  subscriptionStatus?: "none" | "active" | "past_due" | "cancelled";
  /** Stripe subscription ID for the $100/year management fee (deferred 1 year) */
  mgmtSubscriptionId?: string;
  instagramHandle?: string;
  funnelPaused?: boolean;
  /** Lead source: "inbound" for self-submitted, "scouted" for automated pipeline */
  source?: "inbound" | "scouted";
  /** Pricing tier: "standard" ($997) or "free" ($30 for friends/family) */
  pricingTier?: "standard" | "free";
  /** QC gate results — populated by /api/qc/review/[id] */
  qualityScore?: number;       // 0-100
  qualityNotes?: string;       // formatted text summary of issues
  qcReviewedAt?: string;       // ISO timestamp of last QC run
  /** Persisted admin instructions for future site revisions */
  adminNotes?: string;
  adminNotesUpdatedAt?: string;
  adminNotesSubmittedAt?: string;
  lastSubmittedAdminNotes?: string;
  lastSubmittedTheme?: "light" | "dark";
  createdAt: string;
  updatedAt: string;
}

export interface ScrapedData {
  businessName: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  services: ServiceItem[];
  testimonials: Testimonial[];
  photos: string[];
  hours?: string;
  socialLinks?: Record<string, string>;
  about?: string;
  brandColor?: string;
  logoUrl?: string;
}

export interface ServiceItem {
  name: string;
  description?: string;
  price?: string;
  icon?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

export interface ScoutOptions {
  city: string;
  state?: string;
  category: Category;
  limit?: number;
}

export interface PipelineResult {
  prospect: Prospect;
  previewUrl: string;
}

export const PRICING = {
  basePrice: 997,
  freePrice: 30,
  remarketingPrice: 497,
  yearlyManagement: 100,
};

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; accentColor: string; heroGradient: string }
> = {
  "real-estate": { label: "Real Estate", accentColor: "#d4a843", heroGradient: "linear-gradient(135deg, #1e3050 0%, #162640 100%)" },
  dental: { label: "Dental", accentColor: "#10b981", heroGradient: "linear-gradient(135deg, #0f2a2a 0%, #0a1f1f 100%)" },
  "law-firm": { label: "Law Firm", accentColor: "#8b5cf6", heroGradient: "linear-gradient(135deg, #1f1a2e 0%, #13101f 100%)" },
  landscaping: { label: "Landscaping", accentColor: "#22c55e", heroGradient: "linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 100%)" },
  salon: { label: "Salon", accentColor: "#ec4899", heroGradient: "linear-gradient(135deg, #2e1a2a 0%, #1f101a 100%)" },
  electrician: { label: "Electrician", accentColor: "#f59e0b", heroGradient: "linear-gradient(135deg, #2a2210 0%, #1f1a0a 100%)" },
  plumber: { label: "Plumber", accentColor: "#3b82f6", heroGradient: "linear-gradient(135deg, #0f1a2e 0%, #0a1322 100%)" },
  hvac: { label: "HVAC", accentColor: "#06b6d4", heroGradient: "linear-gradient(135deg, #0a2630 0%, #071c24 100%)" },
  roofing: { label: "Roofing", accentColor: "#d97706", heroGradient: "linear-gradient(135deg, #2e1f0a 0%, #1f1508 100%)" },
  "general-contractor": { label: "General Contractor", accentColor: "#78716c", heroGradient: "linear-gradient(135deg, #1f1e1c 0%, #141312 100%)" },
  "auto-repair": { label: "Auto Repair", accentColor: "#ef4444", heroGradient: "linear-gradient(135deg, #2e1414 0%, #1f0e0e 100%)" },
  chiropractic: { label: "Chiropractic", accentColor: "#14b8a6", heroGradient: "linear-gradient(135deg, #0a2e2a 0%, #071f1c 100%)" },
  accounting: { label: "Accounting", accentColor: "#6366f1", heroGradient: "linear-gradient(135deg, #1a1a2e 0%, #12121f 100%)" },
  insurance: { label: "Insurance", accentColor: "#0ea5e9", heroGradient: "linear-gradient(135deg, #0a2040 0%, #071830 100%)" },
  photography: { label: "Photography", accentColor: "#a855f7", heroGradient: "linear-gradient(135deg, #201030 0%, #180a24 100%)" },
  "interior-design": { label: "Interior Design", accentColor: "#e879f9", heroGradient: "linear-gradient(135deg, #2a1430 0%, #1f0e24 100%)" },
  cleaning: { label: "Cleaning", accentColor: "#38bdf8", heroGradient: "linear-gradient(135deg, #0a2030 0%, #071824 100%)" },
  "pest-control": { label: "Pest Control", accentColor: "#84cc16", heroGradient: "linear-gradient(135deg, #1a2a10 0%, #121f0a 100%)" },
  moving: { label: "Moving", accentColor: "#f97316", heroGradient: "linear-gradient(135deg, #2e1a0a 0%, #1f1208 100%)" },
  veterinary: { label: "Veterinary", accentColor: "#34d399", heroGradient: "linear-gradient(135deg, #0a2e1a 0%, #071f12 100%)" },
  fitness: { label: "Fitness", accentColor: "#f43f5e", heroGradient: "linear-gradient(135deg, #2e0a14 0%, #1f080e 100%)" },
  tattoo: { label: "Tattoo Studio", accentColor: "#a3a3a3", heroGradient: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)" },
  florist: { label: "Florist", accentColor: "#fb7185", heroGradient: "linear-gradient(135deg, #2e1a20 0%, #1f1218 100%)" },
  catering: { label: "Catering", accentColor: "#fb923c", heroGradient: "linear-gradient(135deg, #2e2010 0%, #1f180a 100%)" },
  daycare: { label: "Daycare", accentColor: "#60a5fa", heroGradient: "linear-gradient(135deg, #101a2e 0%, #0a121f 100%)" },
  "pet-services": { label: "Pet Services", accentColor: "#4ade80", heroGradient: "linear-gradient(135deg, #102e14 0%, #0a1f0e 100%)" },
  "martial-arts": { label: "Martial Arts", accentColor: "#dc2626", heroGradient: "linear-gradient(135deg, #2e0a0a 0%, #1f0808 100%)" },
  "physical-therapy": { label: "Physical Therapy", accentColor: "#2dd4bf", heroGradient: "linear-gradient(135deg, #0a2e28 0%, #071f1c 100%)" },
  tutoring: { label: "Tutoring", accentColor: "#818cf8", heroGradient: "linear-gradient(135deg, #14142e 0%, #0e0e1f 100%)" },
  "pool-spa": { label: "Pool & Spa", accentColor: "#22d3ee", heroGradient: "linear-gradient(135deg, #0a2630 0%, #071c24 100%)" },
  "church": { label: "Church / Ministry", accentColor: "#e2b857", heroGradient: "linear-gradient(135deg, #1a1510 0%, #2a2018 50%, #1a1510 100%)" },
  restaurant: { label: "Restaurant", accentColor: "#dc2626", heroGradient: "linear-gradient(135deg, #1a0a0a 0%, #2a1010 100%)" },
  medical: { label: "Medical / Doctor", accentColor: "#0891b2", heroGradient: "linear-gradient(135deg, #0a1a20 0%, #071520 100%)" },
  painting: { label: "House Painting", accentColor: "#8b5cf6", heroGradient: "linear-gradient(135deg, #0f0a1e 0%, #1a1030 100%)" },
  fencing: { label: "Fencing", accentColor: "#78716c", heroGradient: "linear-gradient(135deg, #1a1816 0%, #121010 100%)" },
  "tree-service": { label: "Tree Service", accentColor: "#15803d", heroGradient: "linear-gradient(135deg, #0a1a0f 0%, #071510 100%)" },
  "pressure-washing": { label: "Pressure Washing", accentColor: "#0284c7", heroGradient: "linear-gradient(135deg, #0a1520 0%, #071018 100%)" },
  "garage-door": { label: "Garage Door", accentColor: "#d97706", heroGradient: "linear-gradient(135deg, #1a1508 0%, #121008 100%)" },
  locksmith: { label: "Locksmith", accentColor: "#eab308", heroGradient: "linear-gradient(135deg, #1a1a0a 0%, #121208 100%)" },
  towing: { label: "Towing", accentColor: "#ef4444", heroGradient: "linear-gradient(135deg, #1a0f0f 0%, #120a0a 100%)" },
  construction: { label: "Construction", accentColor: "#ea580c", heroGradient: "linear-gradient(135deg, #1a1208 0%, #120e06 100%)" },
  "med-spa": { label: "Med Spa", accentColor: "#c084fc", heroGradient: "linear-gradient(135deg, #1a0f1e 0%, #120a16 100%)" },
  "appliance-repair": { label: "Appliance Repair", accentColor: "#3b82f6", heroGradient: "linear-gradient(135deg, #0f1720 0%, #0a1018 100%)" },
  "junk-removal": { label: "Junk Removal", accentColor: "#22c55e", heroGradient: "linear-gradient(135deg, #0f1a12 0%, #0a120e 100%)" },
  "carpet-cleaning": { label: "Carpet Cleaning", accentColor: "#06b6d4", heroGradient: "linear-gradient(135deg, #0f1520 0%, #0a1018 100%)" },
  "event-planning": { label: "Event Planning", accentColor: "#f59e0b", heroGradient: "linear-gradient(135deg, #1a1520 0%, #120e18 100%)" },
};
