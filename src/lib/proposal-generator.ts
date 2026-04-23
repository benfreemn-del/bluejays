import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { PRICING, CATEGORY_CONFIG, type Prospect } from "./types";
import { getProspect, getScrapedData } from "./store";
import { getEmailHistory } from "./email-sender";
import { getSmsHistory } from "./sms";
import { reviewSiteQuality, type QualityReport } from "./quality-review";
import type { GeneratedSiteData } from "./generator";
import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost } from "./cost-logger";
import { getShortPreviewUrl } from "./short-urls";

/**
 * GPT-4.1-mini cost estimate for proposal generation:
 * ~2200 output tokens + ~1000 input tokens = ~3200 tokens
 * At $0.40/1M input + $1.60/1M output ≈ $0.004 per proposal
 */
const PROPOSAL_GENERATION_COST = 0.004;

const DATA_DIR = path.join(process.cwd(), "data");
const PROPOSALS_DIR = path.join(DATA_DIR, "proposals");
const NOTES_DIR = path.join(DATA_DIR, "notes");
const ONBOARDING_DIR = path.join(DATA_DIR, "onboarding");

const client = process.env.OPENAI_API_KEY ? new OpenAI() : null;

export interface ProposalRecord {
  id: string;
  prospectId: string;
  businessName: string;
  summary: string;
  content: string;
  painPoints: string[];
  generatedAt: string;
  updatedAt: string;
  contextData: ProposalContext;
}

export interface ProposalContext {
  prospect: Prospect;
  categoryLabel: string;
  generatedSiteData: GeneratedSiteData | null;
  qualityReview: QualityReport | null;
  notes: ProposalNote[];
  emailHistory: ProposalHistoryItem[];
  smsHistory: ProposalHistoryItem[];
  onboarding: Record<string, unknown> | null;
  proposalLinks: {
    previewUrl: string;
    claimUrl: string;
    bookUrl: string;
  };
  crmSummary: {
    status: Prospect["status"];
    createdAt: string;
    updatedAt: string;
    funnelPaused: boolean;
    googleRating: number | null;
    reviewCount: number | null;
    estimatedRevenueTier: Prospect["estimatedRevenueTier"];
  };
}

interface ProposalNote {
  id: string;
  text: string;
  createdAt: string;
}

interface ProposalHistoryItem {
  id: string;
  channel: "email" | "sms";
  subject?: string;
  body: string;
  sequence: number;
  timestamp: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function absoluteUrl(pathname: string) {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }
  return `${getBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function getNotes(prospectId: string): Promise<ProposalNote[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("id, text, created_at")
        .eq("prospect_id", prospectId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          text: row.text as string,
          createdAt: row.created_at as string,
        }));
      }
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return [];
  const filePath = path.join(NOTES_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function getOnboarding(prospectId: string): Promise<Record<string, unknown> | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("onboarding")
        .select("business_name, submitted_at, data")
        .eq("prospect_id", prospectId)
        .single();
      if (!error && data) {
        return {
          businessName: data.business_name,
          submittedAt: data.submitted_at,
          ...(data.data as Record<string, unknown>),
        };
      }
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return null;
  const filePath = path.join(ONBOARDING_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function getStoredProposal(prospectId: string): Promise<ProposalRecord | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("prospect_id", prospectId)
        .single();
      if (!error && data) {
        return {
          id: data.id as string,
          prospectId: data.prospect_id as string,
          businessName: data.business_name as string,
          summary: data.summary as string,
          content: data.content as string,
          painPoints: (data.pain_points as string[] | null) || [],
          generatedAt: data.generated_at as string,
          updatedAt: data.updated_at as string,
          contextData: (data.context_data as ProposalContext) || ({} as ProposalContext),
        };
      }
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return null;
  const filePath = path.join(PROPOSALS_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function saveProposal(record: ProposalRecord): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("proposals").upsert(
        {
          id: record.id,
          prospect_id: record.prospectId,
          business_name: record.businessName,
          summary: record.summary,
          content: record.content,
          pain_points: record.painPoints,
          context_data: record.contextData,
          generated_at: record.generatedAt,
          updated_at: record.updatedAt,
        },
        { onConflict: "prospect_id" }
      );
      return;
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return;
  ensureDir(PROPOSALS_DIR);
  fs.writeFileSync(
    path.join(PROPOSALS_DIR, `${record.prospectId}.json`),
    JSON.stringify(record, null, 2)
  );
}

function derivePainPoints(
  prospect: Prospect,
  generatedSiteData: GeneratedSiteData | null,
  qualityReview: QualityReport | null,
  notes: ProposalNote[]
): string[] {
  const points = new Set<string>();

  if (!prospect.currentWebsite) {
    points.add("The business appears to have no current website, which makes it harder for local prospects to verify services and contact the team quickly.");
  }

  if (qualityReview) {
    for (const issue of qualityReview.issues) {
      if (issue.severity === "critical" || issue.severity === "warning") {
        points.add(issue.message);
      }
    }
  }

  if (prospect.googleRating && prospect.googleRating < 4.5) {
    points.add(`The public review profile is solid but not elite yet at ${prospect.googleRating.toFixed(1)} stars, so the website should do more to build trust and answer objections early.`);
  }

  if ((prospect.reviewCount || 0) < 15) {
    points.add("The business does not appear to have a large review moat yet, so the website needs stronger conversion copy and clearer trust signals.");
  }

  if (generatedSiteData && generatedSiteData.photos.length < 3) {
    points.add("The site currently needs more real photos to feel fully branded and local rather than generic.");
  }

  for (const note of notes.slice(-5)) {
    points.add(`CRM note to account for: ${note.text}`);
  }

  return Array.from(points).slice(0, 8);
}

function buildFallbackProposal(context: ProposalContext, painPoints: string[]): { summary: string; content: string } {
  const { prospect, proposalLinks, qualityReview, generatedSiteData, notes, emailHistory, smsHistory } = context;
  const categoryLabel = context.categoryLabel;
  const owner = prospect.ownerName || prospect.businessName;
  const strongestReview = prospect.googleRating
    ? `${prospect.googleRating.toFixed(1)}★ across ${prospect.reviewCount || 0} Google reviews`
    : "local reputation signals that deserve stronger presentation online";

  const content = `# Personalized Website Proposal for ${prospect.businessName}

## Executive Summary

Hi ${owner},

I reviewed the available information for **${prospect.businessName}** and prepared this proposal to show how BlueJays can turn your current web presence into a better sales asset. The goal is straightforward: make it easier for people in **${prospect.city}, ${prospect.state}** to trust you quickly, understand what you do, and take action.

## What We Reviewed

We combined your CRM record, available business details, scraped website content, review signals, internal notes, and funnel interaction history to shape this recommendation.

| Signal | Current Detail |
| --- | --- |
| Category | ${categoryLabel} |
| Location | ${prospect.city}, ${prospect.state} |
| Current website | ${prospect.currentWebsite || "No current website listed"} |
| Review profile | ${strongestReview} |
| Preview link | ${proposalLinks.previewUrl} |
| Funnel engagement | ${emailHistory.length} emails, ${smsHistory.length} texts, ${notes.length} notes |

## Pain Points We Should Solve

${painPoints.map((point) => `- ${point}`).join("\n") || "- Build a stronger digital first impression with clearer service positioning and trust signals."}

## Recommended Website Improvements

1. **Sharper first impression:** Lead with a clearer headline, stronger value proposition, and a more obvious call to action.
2. **Trust-building content:** Highlight reviews, location credibility, and proof points so prospects feel comfortable reaching out.
3. **Higher conversion flow:** Make phone, contact, and quote actions more visible on mobile and desktop.
4. **Better local positioning:** Tailor service-area and category messaging to ${prospect.city}-area search intent.
5. **Cleaner brand presentation:** Use better imagery, more polished copy, and a more consistent layout so the business feels established.

## Proposed Deliverables

| Deliverable | Included |
| --- | --- |
| Custom website build | Yes |
| Mobile optimization | Yes |
| SEO-ready structure | Yes |
| Contact and lead capture flow | Yes |
| Revisions after claim | Yes |
| Hosting and management | Yes |

## Quality Review Snapshot

${qualityReview ? `The latest preview quality score is **${qualityReview.score}/100**. The most important remaining improvements are the items listed above, which we can tighten before or immediately after launch.` : "A structured quality review will be applied as part of the final polish before launch."}

## Why This Matters Now

A stronger website helps ${prospect.businessName} convert the attention you already earn from referrals, search, and reviews into more booked jobs. Right now, the opportunity is less about adding fluff and more about making the business look as credible online as it likely is in real life.

## Investment

| Item | Price |
| --- | --- |
| Custom website build | $${PRICING.basePrice} one-time |
| Hosting and ongoing management | $${PRICING.yearlyManagement}/year after year one |

## Next Step

If you want to move forward, you can claim the site here: **${proposalLinks.claimUrl}**

If you want a quick walkthrough first, book a call here: **${proposalLinks.bookUrl}**
`;

  return {
    summary: `A personalized proposal for ${prospect.businessName} focused on improving trust, conversion, and local positioning for ${categoryLabel.toLowerCase()} customers in ${prospect.city}.`,
    content,
  };
}

async function generateWithAi(context: ProposalContext, painPoints: string[]) {
  if (!client) return null;

  const prompt = `You are preparing a concise but highly personalized sales proposal in GitHub-flavored Markdown for a local business prospect.

Write a proposal that is grounded only in the provided context. Do not invent metrics, customer counts, competitors, or results. If something is unknown, simply avoid claiming it.

The proposal must:
- address specific pain points visible from the current site/business context
- mention reviews/reputation when available
- explain the competitive edge of a better website
- recommend concrete improvements tied to this business
- include a clear investment section using $${PRICING.basePrice} one-time and $${PRICING.yearlyManagement}/year after year one
- end with a short next-steps section referencing the claim and booking links
- use complete paragraphs and occasional Markdown tables
- sound personal, credible, and sales-ready, not generic or hypey
- never use fake social proof or inflated numbers

Return valid JSON with exactly these keys:
- summary: string
- content: string

Context JSON:
${JSON.stringify({ context, painPoints }, null, 2)}`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2200,
  });

  // Log AI cost for proposal generation
  const usage = completion.usage;
  await logCost({
    service: "openai",
    action: "proposal_generation",
    costUsd: PROPOSAL_GENERATION_COST,
    metadata: {
      model: "gpt-4.1-mini",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
    },
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return null;

  const parsed = JSON.parse(raw) as { summary?: string; content?: string };
  if (!parsed.summary || !parsed.content) return null;
  return parsed;
}

export async function buildProposalContext(prospectId: string): Promise<ProposalContext> {
  const prospect = await getProspect(prospectId);
  if (!prospect) {
    throw new Error("Prospect not found");
  }

  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const generatedSiteData = ((await getScrapedData(prospectId)) as GeneratedSiteData | null) || null;
  const qualityReview = generatedSiteData
    ? reviewSiteQuality(prospect, generatedSiteData)
    : null;
  const [notes, emailHistoryRaw, smsHistoryRaw, onboarding] = await Promise.all([
    getNotes(prospectId),
    getEmailHistory(prospectId),
    getSmsHistory(prospectId),
    getOnboarding(prospectId),
  ]);

  const emailHistory: ProposalHistoryItem[] = emailHistoryRaw.map((item) => ({
    id: item.id,
    channel: "email",
    subject: item.subject,
    body: item.body,
    sequence: item.sequence,
    timestamp: item.sentAt,
  }));

  const smsHistory: ProposalHistoryItem[] = smsHistoryRaw.map((item) => ({
    id: item.id,
    channel: "sms",
    body: item.body,
    sequence: item.sequence,
    timestamp: item.sentAt,
  }));

  // Proposal is a customer-facing document — use short URL for clean links.
  const previewPath = prospect.generatedSiteUrl || getShortPreviewUrl(prospect);

  return {
    prospect,
    categoryLabel,
    generatedSiteData,
    qualityReview,
    notes,
    emailHistory,
    smsHistory,
    onboarding,
    proposalLinks: {
      previewUrl: absoluteUrl(previewPath),
      claimUrl: absoluteUrl(`/claim/${prospect.id}`),
      bookUrl: absoluteUrl(`/book/${prospect.id}`),
    },
    crmSummary: {
      status: prospect.status,
      createdAt: prospect.createdAt,
      updatedAt: prospect.updatedAt,
      funnelPaused: !!prospect.funnelPaused,
      googleRating: prospect.googleRating || null,
      reviewCount: prospect.reviewCount || null,
      estimatedRevenueTier: prospect.estimatedRevenueTier,
    },
  };
}

export async function generatePersonalizedProposal(prospectId: string): Promise<ProposalRecord> {
  const existing = await getStoredProposal(prospectId);
  const context = await buildProposalContext(prospectId);
  const painPoints = derivePainPoints(
    context.prospect,
    context.generatedSiteData,
    context.qualityReview,
    context.notes
  );

  let generated = null;
  try {
    generated = await generateWithAi(context, painPoints);
  } catch {
    generated = null;
  }

  const fallback = buildFallbackProposal(context, painPoints);
  const now = new Date().toISOString();

  const record: ProposalRecord = {
    id: existing?.id || context.prospect.id,
    prospectId,
    businessName: context.prospect.businessName,
    summary: generated?.summary || fallback.summary,
    content: generated?.content || fallback.content,
    painPoints,
    generatedAt: existing?.generatedAt || now,
    updatedAt: now,
    contextData: context,
  };

  await saveProposal(record);
  return record;
}
