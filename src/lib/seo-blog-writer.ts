import { getSupabase } from "./supabase";

/**
 * SEO blog writer — Claude-generated daily blog post for BlueJays.
 *
 * The cron at /api/cron/seo-blog-write picks the next topic from a
 * rotating queue (defined below), calls Claude to draft the post,
 * saves to blog_posts as status='draft', and SMSes Ben to review.
 *
 * Topics rotate so we don't pile up 30 posts on "AI marketing" while
 * never touching "small-business websites". The cron picks the topic
 * with the FEWEST drafts/published posts to date — natural balancing.
 */

const TOPIC_QUEUE: Array<{ slug: string; label: string; angle: string }> = [
  {
    slug: "ai-marketing",
    label: "AI marketing for small businesses",
    angle: "Concrete examples of how AI handles missed-call text-back, ad-creative iteration, and lead scoring for sub-$10M businesses. No hype.",
  },
  {
    slug: "custom-vs-template",
    label: "Custom websites vs templates",
    angle: "Why a $4k custom site outperforms a $300/yr Wix or Squarespace for service businesses with real lead-gen needs. ROI math.",
  },
  {
    slug: "lead-gen-economics",
    label: "Lead generation economics",
    angle: "Cost per lead, lifetime value, CAC payback period for service businesses. The numbers that decide whether marketing is profitable.",
  },
  {
    slug: "small-business-seo",
    label: "Local SEO for service businesses",
    angle: "Google Business Profile, NAP consistency, review velocity, and what actually moves the rank needle for landscapers/electricians/inspectors.",
  },
  {
    slug: "missed-call-text-back",
    label: "Missed-call text-back",
    angle: "Why 40% of inbound calls go unanswered and how an auto-text recovers most of them. Concrete setup walkthrough.",
  },
  {
    slug: "direct-mail-revival",
    label: "Direct mail in 2026",
    angle: "Lob postcards trigger response rates 5x higher than email for local services because the inbox is full. Cost + ROI examples.",
  },
  {
    slug: "hormozi-frameworks",
    label: "Hormozi frameworks applied",
    angle: "Grand Slam Offer, Core Four lead-gen, Value Equation — adapted to a $400k/year landscaping or roofing business.",
  },
  {
    slug: "review-velocity",
    label: "Review velocity & social proof",
    angle: "How service businesses go from 12 Google reviews to 60+ in 90 days using post-job SMS asks and the right template.",
  },
  {
    slug: "owner-economy",
    label: "Owner-operator economics",
    angle: "Why owner-operators of $500k-$2M businesses are underserved by marketing agencies and what an AI-first stack looks like instead.",
  },
];

export async function pickNextTopic(): Promise<(typeof TOPIC_QUEUE)[number]> {
  const sb = getSupabase();
  const { data } = await sb
    .from("blog_posts")
    .select("topic")
    .order("created_at", { ascending: false });
  const counts = new Map<string, number>();
  for (const t of TOPIC_QUEUE) counts.set(t.slug, 0);
  for (const row of (data ?? []) as Array<{ topic: string | null }>) {
    if (!row.topic) continue;
    counts.set(row.topic, (counts.get(row.topic) ?? 0) + 1);
  }
  // Pick the topic with the smallest count; ties go to the first
  // declared (rotation seed).
  let pick = TOPIC_QUEUE[0];
  let lowest = counts.get(pick.slug) ?? 0;
  for (const t of TOPIC_QUEUE) {
    const c = counts.get(t.slug) ?? 0;
    if (c < lowest) {
      pick = t;
      lowest = c;
    }
  }
  return pick;
}

export interface DraftPost {
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  word_count: number;
}

/**
 * Call Claude to write a blog draft for a given topic. Returns the
 * structured fields ready to insert into blog_posts.
 *
 * Mock-safe: if ANTHROPIC_API_KEY is unset, returns a placeholder
 * draft so the cron stays unblocked in local/staging.
 */
export async function writeDraft(topic: (typeof TOPIC_QUEUE)[number]): Promise<DraftPost> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    const body = `# ${topic.label}\n\n*Draft placeholder — ANTHROPIC_API_KEY not configured.*\n\n${topic.angle}`;
    return {
      slug: `${topic.slug}-${new Date().toISOString().slice(0, 10)}`,
      title: topic.label,
      excerpt: topic.angle.slice(0, 200),
      body_md: body,
      word_count: body.split(/\s+/).length,
    };
  }

  const system = `You are writing a blog post for BlueJays, a custom-website + AI-marketing-system business serving owner-operators of $250k–$5M service businesses (landscapers, electricians, inspectors, contractors).

Voice: direct, blunt, numbers-first. Sounds like a sharp friend who's been there. No corporate-speak, no hype, no "in today's fast-paced world." Use concrete numbers, real examples, and Hormozi-style frameworks when relevant.

Length: 700–1100 words. Markdown. Include a compelling H1, 3–5 H2 sections, at least one numbered list, at least one example with concrete dollar figures.

Audience reads on mobile while sitting in their truck. Short paragraphs. Bold key takeaways. End with a one-line CTA: "Get a free 30-second site audit at bluejayportfolio.com/audit."`;

  const user = `Topic: ${topic.label}
Angle: ${topic.angle}

Return your response as a single JSON object — no prose before or after, no markdown code fences:

{
  "title": "the H1, 50-70 chars",
  "slug": "kebab-case-url-slug-3-to-6-words",
  "excerpt": "120-180 chars, one sentence, hooky",
  "body_md": "the full markdown body starting with # H1"
}`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!resp.ok) {
    throw new Error(`Claude ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = await resp.json();
  let text: string = data.content?.[0]?.text ?? "";
  text = text.trim();
  if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first > 0 && last > first) text = text.slice(first, last + 1);

  let parsed: { title?: string; slug?: string; excerpt?: string; body_md?: string };
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Claude returned non-JSON: ${(e as Error).message}`);
  }
  const body = (parsed.body_md ?? "").trim();
  if (!body || !parsed.title || !parsed.slug) {
    throw new Error("Claude response missing required fields");
  }
  // Slug collisions get a date suffix so the unique constraint holds.
  const safeSlug = `${parsed.slug}-${new Date().toISOString().slice(0, 10)}`;
  return {
    slug: safeSlug,
    title: parsed.title,
    excerpt: parsed.excerpt ?? body.slice(0, 200),
    body_md: body,
    word_count: body.split(/\s+/).length,
  };
}
