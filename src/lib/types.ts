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
  | "pool-spa";

export type ProspectStatus =
  | "scouted"
  | "scraped"
  | "generated"
  | "pending-review"
  | "approved"
  | "deployed"
  | "contacted"
  | "responded"
  | "paid"
  | "dismissed";

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
  createdAt: string;
  updatedAt: string;
}

export interface ScrapedData {
  businessName: string;
  tagline?: string;
  phone?: string;
  address?: string;
  services: ServiceItem[];
  testimonials: Testimonial[];
  photos: string[];
  hours?: string;
  socialLinks?: Record<string, string>;
  about?: string;
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
  remarketingPrice: 497,
  yearlyManagement: 100,
};

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; accentColor: string; heroGradient: string }
> = {
  "real-estate": { label: "Real Estate", accentColor: "#c8a45e", heroGradient: "linear-gradient(135deg, #1a2744 0%, #0d1b33 100%)" },
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
};
