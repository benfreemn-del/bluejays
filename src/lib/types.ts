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
  | "event-planning"
  | "non-profit";

export type SmsMethod = "twilio" | "vonage" | "mock";

export type SmsProvider = "vonage" | "twilio" | "auto";

export type ProspectStatus =
  | "scouted"
  | "scraped"
  | "generated"
  | "pending-review"
  | "ready_to_review"   // passed QC gate — ready for Ben's manual approval
  | "qc_failed"         // failed QC gate — needs fixes before approval
  | "approved"
  | "ready_to_send"    // Ben has manually polished and approved — ready for outreach
  | "changes_pending"
  | "ready_to_finalize"
  | "deployed"
  | "contacted"
  | "email_opened"
  | "engaged"
  | "link_clicked"
  | "responded"
  | "interested"
  | "claimed"
  | "paid"
  | "dismissed"
  | "unsubscribed"
  | "bounced"          // hard-bounce or 3-soft-in-7-days escalation — see Rule 42
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
  selectedVersion?: "v1" | "v2";
  aiThemeRecommendation?: "light" | "dark";
  /** Subscription health.
   *   - "none"      = no active sub
   *   - "active"    = current (or trialing — counts as active)
   *   - "past_due"  = first/second `invoice.payment_failed` — Stripe still retrying
   *   - "at_risk"   = 3+ consecutive failures, escalation tier — manual intervention
   *                   imminent (suspension if not resolved). See payment_failed
   *                   webhook handler in `/api/webhooks/stripe/route.ts`.
   *   - "cancelled" = sub deleted / fully unrecoverable
   */
  subscriptionStatus?: "none" | "active" | "past_due" | "at_risk" | "cancelled";
  /** Stripe subscription ID for the $100/year management fee (deferred 1 year) */
  mgmtSubscriptionId?: string;
  instagramHandle?: string;
  funnelPaused?: boolean;
  /** Lead source: "inbound" for self-submitted, "scouted" for automated pipeline */
  source?: "inbound" | "scouted";
  /** Pricing tier:
   *   "standard" = $997 one-time + $100/yr mgmt sub (1-year trial)
   *   "free"     = $30 one-time + $100/yr mgmt sub (1-year trial, friends/family)
   *   "custom"   = $100/yr subscription starting immediately (bespoke-built sites;
   *                the custom sub IS the mgmt sub — no separate setup fee, no trial).
   *                See src/app/p/[code]/page.tsx for the short-URL redirect behaviour
   *                and CLAUDE.md "Custom Pricing Tier Rules" for the full spec. */
  pricingTier?: "standard" | "free" | "custom";
  /** For pricing_tier=custom prospects only: absolute URL of the real live site
   *  (e.g. https://lcautism.org). /p/[short_code] redirects here instead of
   *  rendering the template preview. Ignored for non-custom tiers. */
  customSiteUrl?: string;
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
  /** Outreach channel: "email-only" for pre-SMS launch, "full" for email+sms+voicemail */
  outreachChannel?: "email-only" | "full";
  /** Needs SMS follow-up when phone number is verified */
  needsSmsFollowup?: boolean;
  /** Rule 49: when true, this prospect is manually managed by Ben (gifted
   *  site, custom build, friend/family, hand-picked close) and the daily
   *  auto-enroll cron MUST skip them. Default false for scouted prospects.
   *  See `/api/funnel/run/route.ts` Step 0 + CLAUDE.md Rule 49. */
  manuallyManaged?: boolean;
  /** 8-char deterministic short code used for customer-facing preview URLs
   *  (see /p/[code] route + src/lib/short-urls.ts). Derived from md5(id).
   *  Populated by migration 20260419_prospect_short_codes.sql. */
  short_code?: string;
  /** ISO timestamp of when we sent the "welcome / now fill out onboarding" email
   *  right after a successful Stripe payment. Used for idempotency so the
   *  webhook can retry without double-sending. */
  welcomeEmailSentAt?: string;
  /** ISO timestamp of when we sent the 30-minute "you haven't filled out
   *  the onboarding form yet" reminder. Used for dedupe so the reminder
   *  cron only fires once per prospect. */
  onboardingReminderSentAt?: string;
  /** Number of consecutive `invoice.payment_failed` events Stripe has
   *  fired for this prospect's mgmt subscription. Reset to 0 on next
   *  successful invoice. After 3 we escalate (status=at_risk + urgent
   *  email + SMS to Ben). See `/api/webhooks/stripe`. */
  paymentFailureCount?: number;
  /** ISO timestamp of the most recent `invoice.payment_failed` event. */
  lastPaymentFailureAt?: string;
  /** Number of soft bounces seen in the rolling 7-day window for this
   *  prospect's email. Reset to 1 when a soft bounce arrives more than
   *  7 days after `lastSoftBounceAt`. Hits 3 → treat as hard bounce
   *  (status flips to `"bounced"`, funnel paused, SendGrid suppression
   *  group entry). See `processBounce()` in email-deliverability.ts and
   *  Rule 42 in CLAUDE.md. */
  softBounceCount?: number;
  /** ISO timestamp of the most recent soft bounce. */
  lastSoftBounceAt?: string;
  /** ISO timestamp of when first outreach was sent — used for 30-day preview expiry */
  contactedAt?: string;
  /** Unique referral code generated at payment — shared with client in day-30 email */
  referralCode?: string;
  /** Prospect ID of the client who referred this prospect */
  referredBy?: string;
  /** ISO timestamp of when referral invite email was sent to this client */
  referralSentAt?: string;
  /** How many successful referrals this client has made (each earns $50 off next renewal) */
  referralCount?: number;
  /** ISO timestamp when handoff email was sent after site delivery */
  handoffSentAt?: string;
  /** ISO timestamp when last monthly report email was sent to client */
  lastReportSentAt?: string;
  /** ISO timestamp when the Day-14 NPS survey email was sent. Used by the
   *  daily NPS cron to dedupe (only send once per customer) and by the
   *  gated `getReferralEmail()` flow which only fires for promoters. See
   *  Rule 44 in CLAUDE.md and migration 20260424_nps_responses.sql. */
  npsSentAt?: string;
  /** ISO timestamp of when the loss-probe farewell ("was it price, timing,
   *  or the design?") was sent. Used by the inbound classifier in
   *  ai-responder.ts to detect probe responses within 30 days, classify
   *  the reason, and persist into `loss_reasons`. See Rule 45 in CLAUDE.md
   *  and migration 20260424_loss_reasons.sql. */
  lossProbeSentAt?: string;
  /** Hosted-domain fields — populated when Ben registers a domain
   *  on behalf of the client and flips their preview to go live at
   *  that domain. The domain lives on Ben's servers; Ben manages
   *  DNS + renewal. Cost is deducted from the $100/yr mgmt sub so
   *  net profit stays accurate (see `/api/prospects/[id]/domain`). */
  assignedDomain?: string;           // e.g. "meyerelectric.com"
  domainCostUsd?: number;            // annual cost Ben paid, e.g. 12.98
  domainRegistrar?: string;          // "namecheap" | "porkbun" | "godaddy" | ...
  domainRegisteredAt?: string;       // ISO timestamp of registration
  siteLiveAt?: string;               // ISO timestamp when DNS is live + pointing at us
  createdAt: string;
  updatedAt: string;
}

export interface ScrapedData {
  businessName: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  services: ServiceItem[];
  testimonials: Testimonial[];
  photos: string[];
  hours?: string;
  socialLinks?: Record<string, string>;
  about?: string;
  brandColor?: string;
  brandColorSource?: "official-site" | "logo" | "category-default";
  logoUrl?: string;
  googleRating?: number;
  reviewCount?: number;
  accentColor?: string;
  // Allow additional dynamic fields from scrapers/enrichment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
  pageToken?: string;
}

export interface ScoutResult {
  prospects: Prospect[];
  nextPageToken?: string;
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
  "non-profit": { label: "Non-Profit", accentColor: "#3AAFDB", heroGradient: "linear-gradient(135deg, #14283a 0%, #0e1c2a 100%)" },
};
