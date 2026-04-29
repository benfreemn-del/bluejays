/**
 * Structured data builders. Output goes into a JSON-LD <script type="application/ld+json">
 * tag in the page head. Google reads these to enhance search results
 * with rich snippets (review stars, breadcrumbs, FAQ accordions, etc.).
 *
 * Honest rule: only include claims we can back. Never inflate ratings.
 */

const BASE_URL = "https://bluejayportfolio.com";

export type LdProps = Record<string, unknown>;

/** Wrap a JSON-LD object for safe inline rendering. */
export function jsonLdString(data: LdProps): string {
  // Strip undefined keys so the output is clean
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== null) cleaned[k] = v;
  }
  return JSON.stringify({ "@context": "https://schema.org", ...cleaned });
}

/** BlueJays the company — primary entity card. Used on homepage + about. */
export function organizationLd(): LdProps {
  return {
    "@type": "Organization",
    name: "BlueJays",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "BlueJays builds custom websites for local service businesses. Live in 48 hours, $997 one-time + $100/year hosting.",
    founder: {
      "@type": "Person",
      name: "Ben Freeman",
      jobTitle: "Founder",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Quilcene",
      addressRegion: "WA",
      addressCountry: "US",
    },
    sameAs: [BASE_URL],
  };
}

/** A specific case study — Article + creativeWork hybrid that ranks
 *  for the prospect's business name + their category. */
export function caseStudyLd(args: {
  businessName: string;
  category: string;
  slug: string;
  publishedAt: string;
  description: string;
  score?: number;
}): LdProps {
  return {
    "@type": "Article",
    headline: `${args.businessName} — Website Audit & Rebuild Case Study`,
    description: args.description,
    datePublished: args.publishedAt,
    dateModified: args.publishedAt,
    author: {
      "@type": "Organization",
      name: "BlueJays",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BlueJays",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/case-studies/${args.slug}`,
    },
    about: {
      "@type": "Thing",
      name: `${args.category.replace(/-/g, " ")} website design`,
    },
  };
}

/** /audit page — promote the free tool. Software-application schema
 *  helps Google show it as a "free tool" rich result. */
export function auditToolLd(): LdProps {
  return {
    "@type": "SoftwareApplication",
    name: "BlueJays Website Audit",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Free 60-second website audit for local service businesses. Scores your site 0-100 and identifies the top 3 conversion leaks.",
    url: `${BASE_URL}/audit`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** Service entity for /v2/[category] template pages. */
export function categoryServiceLd(args: {
  category: string;
  url: string;
}): LdProps {
  const cat = args.category.replace(/-/g, " ");
  return {
    "@type": "Service",
    name: `Website design for ${cat}`,
    provider: {
      "@type": "Organization",
      name: "BlueJays",
      url: BASE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    description: `Custom website design for ${cat} businesses. Live in 48 hours. $997 one-time + $100/year hosting.`,
    url: args.url,
    offers: {
      "@type": "Offer",
      price: "997",
      priceCurrency: "USD",
    },
  };
}

/** Breadcrumb list — improves Google search-result presentation. */
export function breadcrumbLd(items: { name: string; url: string }[]): LdProps {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
