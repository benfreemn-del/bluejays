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
  /**
   * Display ordering inside the per-client portal Docs tab. Lower
   * numbers render first. Entries without `displayOrder` fall to the
   * end in registry order. Use round numbers (10/20/30) so future docs
   * can slot between without renumbering.
   */
  displayOrder?: number;
  /** Extra free-form questions appended to the sign-off form. */
  extraQuestions?: {
    id: string;
    label: string;
    placeholder?: string;
    /** Optional click-to-prefill chips shown beneath the input. */
    presets?: string[];
  }[];
  /**
   * Optional "what's already running for you" value-proof strip rendered
   * above the PDF embed. Bold headline + bullet list. First impression =
   * value, not paperwork.
   */
  valueProof?: {
    headline: string;
    subhead?: string;
    bullets: { title: string; detail: string }[];
  };
  /**
   * Optional Stripe Payment Links shown at the bottom of the sign page
   * (and reinforced in the post-submit success state). Numbers MUST match
   * the pricing table inside the PDF — single source of truth lives in the
   * PDF generator, mirrored here for the in-page CTAs.
   *
   * Set `url` to "" when the Stripe Payment Link hasn't been created yet —
   * the UI renders a clear placeholder ("Ben will text you the link")
   * instead of a broken button.
   */
  paymentLinks?: {
    label: string;
    /** Stripe Payment Link URL. Empty string = placeholder state. */
    url: string;
    description?: string;
    /** Short badge above the label, e.g. "Due at launch". */
    badge?: string;
    /** Style the first/primary CTA larger + lime; others neutral. */
    primary?: boolean;
  }[];
};

const REGISTRY: OnboardDoc[] = [
  // ────────────────────────────────────────────────────────────────────
  // TEKKY · Zenith Sports — updated 2026-05-20.
  //
  // Originally scoped as the first $10K AI Marketing System client (4-qtr
  // installment plan). Paul + Philip reviewed the Service Agreement on
  // 2026-05-20 and pulled back to a phased approach. Phase 1 is now a
  // standard-tier $997 + tax website + SEO foundation, set up on TEKKY's
  // Shopify store. Phase 2 (full AI System at $10K) remains available
  // whenever inbound flow + club deal-flow justifies the investment.
  //
  // What changed in this registry:
  //   - The 4-entry pack (handoff / brand-voice / sla / agreement) was
  //     rewritten to a 3-entry pack: the $10K Service Agreement entry
  //     was REMOVED (no $10K contract anymore — the $997 tier ships via
  //     the standard online purchase flow with the SLA as the working
  //     contract).
  //   - handoff: completely rewritten for the $997 + tax Phase 1 scope
  //     (site + SEO + Shopify integration). New valueProof bullets,
  //     new payment CTA ($997 + tax), simpler extraQuestions.
  //   - brand-voice: kept as-is — the brand voice doc is still useful
  //     for any copy that lands on the TEKKY site.
  //   - sla: description softened — no $10K-specific scope language.
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "zenith-sports",
    doc: "handoff",
    displayOrder: 20,
    title: "Phase 1 — Website + SEO Welcome Packet",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-onboarding-handoff.pdf",
    alertSubject: "Tekky $997 site + SEO onboarding signed",
    description:
      "Welcome packet for Paul + Philip — Phase 1 scope ($997 + tax: " +
      "site + SEO foundation, set up on TEKKY's Shopify store), what " +
      "happens this week, what we need from you, and the path to Phase 2 " +
      "(the $10K AI Marketing System) whenever inbound flow justifies it. " +
      "Read through and confirm below — build work starts the business " +
      "day payment clears.",
    valueProof: {
      headline: "Phase 1 — TEKKY website + SEO foundation",
      subhead:
        "$997 + Washington state sales tax. One-time. Goes live on TEKKY's " +
        "Shopify store as the polished, SEO-foundation-baked storefront " +
        "you were initially seeking. The full AI Marketing System (Phase 2) " +
        "stays open at $10K when you're ready — same scope we discussed.",
      bullets: [
        {
          title: "Bespoke TEKKY website",
          detail:
            "The custom design we've already aligned on — not a template. Honored at the standard-tier price as a one-time exception given the work already completed.",
        },
        {
          title: "Shopify store integration",
          detail:
            "Set up directly on TEKKY's Shopify so you have the polished website + native commerce stack you were initially seeking. Product pages, cart, and checkout flow stay native to Shopify; the BlueJays site is the marketing front + SEO layer that funnels traffic into it.",
        },
        {
          title: "SEO foundation that compounds",
          detail:
            "JSON-LD structured data, llms.txt for AI crawlers (ChatGPT, Claude, Perplexity, Gemini, Bing AI), proper meta + Open Graph tags, sitemap, and robots.txt — all shipped with the site so search ranking compounds over time. The long-tail SEO engine most agencies bill as a separate $1.5K/mo line item, included as the foundation.",
        },
        {
          title: "Contact capture + lead routing",
          detail:
            "Contact form on the site routes inquiries directly to your inbox. (Optional Twilio SMS alert on every new lead can be wired up — let us know.)",
        },
        {
          title: "Hosting, maintenance, updates — year 1 included",
          detail:
            "Hosting on Vercel, maintenance, and standard content updates included for the first year. After year 1, $100/yr standard renewal keeps the site live + maintained.",
        },
        {
          title: "Phase 2 path stays open",
          detail:
            "The full $10K AI Marketing System (per-audience funnels, ad creative library, AI inbound responder, affiliate pipeline, weekly reports, lead magnets) remains available at full price whenever your inbound flow + club deal-flow tells you it's time. Same scope we discussed — no re-pricing or re-scoping needed when you activate.",
        },
      ],
    },
    extraQuestions: [
      {
        id: "shopify_admin_access",
        label:
          "Shopify admin access — best way for us to get in to wire up the site + integrations.",
        placeholder: "invite ben@bluejayportfolio.com as Staff · screenshare during setup · I'll handle myself with your guidance",
        presets: [
          "Invite ben@bluejayportfolio.com as Staff",
          "Screenshare when you're ready",
          "I'll handle myself, send me the steps",
        ],
      },
      {
        id: "brand_assets",
        label:
          "Final brand assets — logo (highest-res you have), brand colors, any photography you want featured.",
        placeholder: "logo: attached · primary blue: #1e40af · photos: see Drive folder",
      },
      {
        id: "contact_form_destination",
        label:
          "Where should leads from the contact form land? (email + optional SMS)",
        placeholder: "email: info@zenithsports.org · SMS to (360) 555-1234",
      },
      {
        id: "owner_cell",
        label:
          "Your direct cell — used for any urgent owner alerts (site issues, lead spikes, payment events).",
        placeholder: "(360) 555-1234",
      },
      {
        id: "launch_date_preference",
        label:
          "Preferred launch window for Phase 1 — when do you want the site live on tekky.org?",
        placeholder: "ASAP · within 2 weeks · target date: ____",
        presets: ["ASAP — go as fast as possible", "Within 2 weeks", "I'll specify a target date below"],
      },
    ],
    paymentLinks: [
      {
        label: "Pay $997 + tax — Phase 1 launch",
        url: process.env.STRIPE_PAYMENT_LINK_TEKKY_997 || "",
        description:
          "One-time payment for Phase 1: bespoke TEKKY site + SEO foundation + Shopify integration + year-1 hosting and maintenance. Washington state sales tax applied at checkout. Build work starts the business day payment clears.",
        badge: "Phase 1 launch",
        primary: true,
      },
    ],
  },
  {
    slug: "zenith-sports",
    doc: "brand-voice",
    displayOrder: 40,
    title: "Brand Voice Reference",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-brand-voice.pdf",
    alertSubject: "Tekky brand-voice acknowledged",
    description:
      "The locked voice rules every piece of copy on the TEKKY site (and " +
      "any future email or marketing content) follows. Read once, then " +
      "acknowledge below.",
  },
  // BlueJays SLA — shared across paying clients. Each slug gets its own
  // /sign/[slug]/sla route so signatures land in onboarding_acks per client.
  {
    slug: "zenith-sports",
    doc: "sla",
    displayOrder: 30,
    title: "Service-Level Agreement",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/onboarding/bluejays-sla.pdf",
    alertSubject: "Tekky acknowledged BlueJays SLA",
    description:
      "Working contract between you and BlueJays — response times for " +
      "site issues, what's included in the year-1 maintenance, what's " +
      "out of scope (counts against the future Phase 2 retainer), and " +
      "the escalation order when something feels off. Read once, " +
      "acknowledge below.",
  },
  {
    slug: "itc-quick-attach",
    doc: "sla",
    title: "Service-Level Agreement",
    brand: "ITC Quick-Attach",
    pdfPath: "/onboarding/bluejays-sla.pdf",
    alertSubject: "ITC acknowledged BlueJays SLA",
    description:
      "Working contract between you and BlueJays — response times, " +
      "what's included every month, what's out of scope, and the " +
      "escalation order when something feels off. Read once, acknowledge " +
      "below.",
  },
];

export function getOnboardDoc(slug: string, doc: string): OnboardDoc | null {
  return REGISTRY.find((d) => d.slug === slug && d.doc === doc) ?? null;
}

export function listOnboardDocs(slug?: string): OnboardDoc[] {
  const items = slug ? REGISTRY.filter((d) => d.slug === slug) : [...REGISTRY];
  // Sort by displayOrder ascending; entries without displayOrder fall to
  // the end in registry order (preserves backward compatibility for any
  // tenant that hasn't been explicitly ordered yet).
  return items.sort((a, b) => {
    const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
    const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
    return ao - bo;
  });
}
