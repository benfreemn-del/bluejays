import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, GUIDES } from "@/lib/guides";
import { jsonLdString, breadcrumbLd } from "@/lib/json-ld";

export const dynamic = "force-static";
export const revalidate = 3600;

const BASE_URL = "https://bluejayportfolio.com";

/**
 * /guides/[slug] — anchor article renderer.
 *
 * One template, N articles registered in src/lib/guides.ts. Body uses
 * a tiny markdown-ish syntax (## headers, - bullets, plain paragraphs,
 * **bold**, [link text](url)) so we don't need MDX or any markdown
 * library — keeps the dependency footprint at zero.
 *
 * SEO-optimized:
 *   - Article JSON-LD with author + dates
 *   - Breadcrumb LD
 *   - Canonical URL
 *   - 'article' OG type for social previews
 */

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Not found" };

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `${BASE_URL}/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      url: `${BASE_URL}/guides/${guide.slug}`,
      title: guide.title,
      description: guide.metaDescription,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.modifiedAt,
      siteName: "BlueJays",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const articleLd = {
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.modifiedAt,
    author: {
      "@type": "Person",
      name: "Ben Freeman",
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
      "@id": `${BASE_URL}/guides/${guide.slug}`,
    },
  };

  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Guides", url: `${BASE_URL}/guides` },
    { name: guide.title, url: `${BASE_URL}/guides/${guide.slug}` },
  ]);

  // Other guides for the bottom-of-article cross-link block
  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(crumb) }}
      />

      <header className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <Link
            href="/guides"
            className="text-sm text-slate-400 hover:text-white"
          >
            All guides
          </Link>
        </div>
      </header>

      <article>
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-8">
          <nav
            className="text-xs text-slate-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link href="/guides" className="hover:text-slate-300">
              Guides
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-400">{guide.title}</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Guide · {guide.readingTime} min read
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
            {guide.title}
          </h1>
          <p className="text-sm text-slate-500">
            By Ben Freeman · BlueJays
          </p>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-12">
          <GuideBody body={guide.body} />
        </div>
      </article>

      {/* Cross-link to other guides */}
      {otherGuides.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="text-xl font-bold mb-4">More guides</h2>
            <div className="space-y-3">
              {otherGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="block rounded-lg border border-white/10 bg-slate-900/40 p-4 hover:border-amber-500/40 hover:bg-slate-900/60 transition-colors"
                >
                  <p className="font-semibold text-white hover:text-amber-200">
                    {g.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {g.metaDescription.slice(0, 130)}…
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Built by Ben Freeman · Quilcene, WA ·{" "}
          <a
            href="mailto:ben@bluejayportfolio.com"
            className="text-sky-400 hover:underline"
          >
            ben@bluejayportfolio.com
          </a>
        </div>
      </footer>
    </main>
  );
}

/** Tiny markdown-ish renderer. Supports:
 *   - paragraphs (separated by blank lines)
 *   - "## Header"
 *   - "- bullet"
 *   - "**bold**"
 *   - "[label](href)"
 *  No tables, no images, no code blocks. Sufficient for guide content. */
function GuideBody({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <div className="prose-blocks space-y-6">
      {blocks.map((block, i) => {
        if (block.kind === "h2") {
          return (
            <h2
              key={i}
              className="text-2xl md:text-3xl font-bold text-white mt-8 mb-2"
            >
              {block.children}
            </h2>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={i} className="space-y-2 list-disc list-outside pl-6">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="text-slate-300 leading-relaxed marker:text-sky-400"
                >
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-slate-300 leading-relaxed text-base md:text-lg">
            <Inline text={block.children} />
          </p>
        );
      })}
    </div>
  );
}

type Block =
  | { kind: "p"; children: string }
  | { kind: "h2"; children: string }
  | { kind: "ul"; items: string[] };

function parseBlocks(body: string): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];

  function flushP() {
    if (buffer.length > 0) {
      blocks.push({ kind: "p", children: buffer.join(" ").trim() });
      buffer = [];
    }
  }
  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push({ kind: "ul", items: listBuffer });
      listBuffer = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushP();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushP();
      flushList();
      blocks.push({ kind: "h2", children: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      flushP();
      listBuffer.push(line.slice(2).trim());
      continue;
    }
    flushList();
    buffer.push(line);
  }
  flushP();
  flushList();
  return blocks;
}

/** Inline formatter: **bold** + [text](href) only. */
function Inline({ text }: { text: string }) {
  // Tokenize: split on **bold** and [text](href) markers.
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > cursor) parts.push(text.slice(cursor, m.index));
    const tok = m[0];
    if (tok.startsWith("**") && tok.endsWith("**")) {
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isInternal = href.startsWith("/");
        if (isInternal) {
          parts.push(
            <Link
              key={key++}
              href={href}
              className="text-sky-400 hover:text-sky-300 underline underline-offset-4 decoration-sky-500/40"
            >
              {label}
            </Link>,
          );
        } else {
          parts.push(
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sky-400 hover:text-sky-300 underline underline-offset-4 decoration-sky-500/40"
            >
              {label}
            </a>,
          );
        }
      } else {
        parts.push(tok);
      }
    }
    cursor = m.index + tok.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
