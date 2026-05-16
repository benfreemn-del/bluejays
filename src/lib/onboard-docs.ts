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
      "Welcome packet for Tekky founders — portal credentials, tab tour, " +
      "ownership matrix, pricing reference, and sign-off. Read through " +
      "and confirm below.",
    extraQuestions: [
      {
        id: "voicemail_date",
        label: "When can Philip block 30 min to record voicemail clips?",
        placeholder: "e.g. Tuesday 2pm PT",
      },
      {
        id: "preferred_ai_email",
        label: "Preferred contact email for AI-drafted replies",
        placeholder: "philip@zenithsports.org",
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
