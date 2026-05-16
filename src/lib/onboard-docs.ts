/**
 * Registry of shareable client docs.
 *
 * Each entry is a (slug, doc) pair pointing at a PDF in public/ AND a
 * companion /sign/[slug]/[doc] route that embeds the PDF + collects
 * client acknowledgment (sign-off + replies). Submissions trigger
 * sendOwnerAlert() so Ben gets SMS + email in real time.
 *
 * Pattern: see CLAUDE.md "Shareable Client Doc Pattern".
 *
 * To add a new doc:
 *   1. Generate the PDF and save to public/clients/[slug]/pdfs/
 *   2. Add an entry below
 *   3. The /sign/[slug]/[doc] route + API auto-wire from this registry
 */

export type OnboardDoc = {
  slug: string;
  doc: string;
  title: string;
  /** Brand display name (e.g., "TEKKY") shown above the PDF. */
  brand: string;
  /** Relative path to the PDF under public/. */
  pdfPath: string;
  /** SMS/email subject prefix when a client signs. */
  alertSubject: string;
  /** Optional one-line description shown to the signer. */
  description?: string;
  /** Extra free-form questions appended to the sign-off form. */
  extraQuestions?: { id: string; label: string; placeholder?: string }[];
};

const REGISTRY: OnboardDoc[] = [
  {
    slug: "zenith-sports",
    doc: "handoff",
    title: "Owner Onboarding Packet",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-onboarding-handoff.pdf",
    alertSubject: "Tekky onboarding signed",
    description:
      "Welcome packet for Paul — portal access, tab tour, ownership " +
      "matrix, pricing breakdown, account-creation permissions, and " +
      "card-on-file policy. Read through and confirm below. " +
      "Note: Phase A build work begins the business day Q1 payment clears.",
    extraQuestions: [
      {
        id: "account_creation_permission",
        label:
          "Do I have your permission to create accounts on TEKKY's behalf? (yes / no)",
        placeholder: "yes — proceed with Phase A account stand-up",
      },
      {
        id: "preferred_email_for_accounts",
        label:
          "Preferred email username for new accounts (or give me a login you already have)",
        placeholder: "info@tekky.org · admin@zenithsports.org · etc.",
      },
      {
        id: "voicemail_date",
        label: "When can you block 30 min to record voicemail clips?",
        placeholder: "e.g. Tuesday 2pm PT",
      },
      {
        id: "preferred_ai_email",
        label: "Preferred contact email for AI-drafted replies",
        placeholder: "paul@zenithsports.org",
      },
      {
        id: "twilio_number_style",
        label:
          "Twilio number preference — local Pacific NW area code, or a vanity number (e.g. 1-855-TEKKY-01)?",
        placeholder: "local PNW · vanity 1-855-TEKKY-01 · no preference",
      },
      {
        id: "fourth_audience",
        label:
          "Want a 4th audience added before Phase A launches (e.g. 'trainer' or 'academy'), or stick with parent / coach / player / club?",
        placeholder: "stick with 4 · add 'trainer' · add 'academy' · etc.",
      },
      {
        id: "owner_cell",
        label:
          "Your direct cell number — used for owner SMS alerts (new leads, urgent funnel issues, AI flags).",
        placeholder: "e.g. (360) 555-1234",
      },
      {
        id: "philip_contact",
        label:
          "Philip's best cell + email — backup contact when you're unreachable.",
        placeholder: "(360) 555-9876 · philip@zenithsports.org",
      },
      {
        id: "existing_accounts",
        label:
          "What accounts already exist that I should take over instead of creating fresh? (Shopify admin, Google Business Profile, Meta Business Manager, Google Ads, Mailchimp / ConvertKit / Klaviyo, anything else)",
        placeholder:
          "Shopify yes (zenithsports.org) · GBP no · Meta BM no · Google Ads no · email tool: none",
      },
      {
        id: "customer_list",
        label:
          "Do you have an existing customer or email list I can import (CSV / Shopify export / Mailchimp / Klaviyo)? If yes, roughly how many contacts and what segments (parents / coaches / players / past buyers)?",
        placeholder:
          "Shopify: ~120 past buyers · email newsletter: ~400 parents",
      },
      {
        id: "ad_geography",
        label:
          "Where should paid ads run first? National, Pacific NW only, specific clubs / states / metros?",
        placeholder:
          "Pacific NW first (WA, OR, ID) · then expand national after 30 days",
      },
      {
        id: "business_hours",
        label:
          "Business hours — when should the AI auto-reply switch into 'after hours' tone? Also: any days closed?",
        placeholder:
          "Mon-Fri 8a-6p PT, Sat 9a-2p, closed Sun · after-hours = AI promises reply next morning",
      },
    ],
  },
  {
    slug: "zenith-sports",
    doc: "brand-voice",
    title: "Brand Voice Reference",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-brand-voice.pdf",
    alertSubject: "Tekky brand-voice acknowledged",
    description:
      "The locked voice rules every Tekky email, SMS, ad, and AI-drafted " +
      "reply follows. Read once, then acknowledge below.",
  },
];

export function getOnboardDoc(slug: string, doc: string): OnboardDoc | null {
  return REGISTRY.find((d) => d.slug === slug && d.doc === doc) ?? null;
}

export function listOnboardDocs(slug?: string): OnboardDoc[] {
  if (!slug) return [...REGISTRY];
  return REGISTRY.filter((d) => d.slug === slug);
}
