/**
 * ARC reviewer / street-team helpers for indie author clients.
 *
 * Powers /clients/[slug]/arc/apply (public application form) and the
 * admin tracking view at /dashboard/clients/[slug]/arc (kanban).
 *
 * Migration: supabase/migrations/20260518_arc_reviewers.sql
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type ArcStatus =
  | "applied"
  | "approved"
  | "copy_sent"
  | "posted_review"
  | "skipped";

export const ARC_STATUS_ORDER: ArcStatus[] = [
  "applied",
  "approved",
  "copy_sent",
  "posted_review",
  "skipped",
];

export const ARC_STATUS_LABELS: Record<ArcStatus, string> = {
  applied: "Applied",
  approved: "Approved",
  copy_sent: "Copy sent",
  posted_review: "Posted review",
  skipped: "Skipped",
};

export type ArcPlatform =
  | "amazon"
  | "goodreads"
  | "bookbub"
  | "barnes_noble"
  | "instagram"
  | "tiktok"
  | "blog"
  | "other";

export type ArcReviewer = {
  id: string;
  client_slug: string;
  book_title: string | null;
  name: string;
  email: string;
  platforms: ArcPlatform[];
  reach_estimate: number | null;
  amazon_reviewer_rank: number | null;
  status: ArcStatus;
  approved_at: string | null;
  copy_sent_at: string | null;
  posted_review_at: string | null;
  review_url: string | null;
  rating_self_reported: number | null;
  notes: string | null;
  motivation: string | null;
  applied_at: string;
  last_nudge_at: string | null;
  nudge_count: number;
};

export async function applyAsArcReviewer(input: {
  client_slug: string;
  book_title?: string | null;
  name: string;
  email: string;
  platforms: ArcPlatform[];
  reach_estimate?: number | null;
  amazon_reviewer_rank?: number | null;
  motivation?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database not configured" };
  }
  const row = {
    client_slug: input.client_slug,
    book_title: input.book_title ?? null,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    platforms: input.platforms,
    reach_estimate: input.reach_estimate ?? null,
    amazon_reviewer_rank: input.amazon_reviewer_rank ?? null,
    motivation: input.motivation?.trim() ?? null,
  };
  const { data, error } = await supabase
    .from("arc_reviewers")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    // Dupe email is the most common 23505 — return friendly message.
    const isDupe = (error as { code?: string }).code === "23505";
    return {
      ok: false,
      error: isDupe
        ? "You've already applied for this book — we have you in the queue."
        : error.message,
    };
  }
  return { ok: true, id: (data as { id: string }).id };
}

export async function listArcReviewers(opts: {
  client_slug: string;
  book_title?: string | null;
  status?: ArcStatus | null;
}): Promise<ArcReviewer[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("arc_reviewers")
    .select("*")
    .eq("client_slug", opts.client_slug)
    .order("applied_at", { ascending: false });
  if (opts.book_title !== undefined && opts.book_title !== null) {
    q = q.eq("book_title", opts.book_title);
  }
  if (opts.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as ArcReviewer[];
}

export async function updateArcReviewer(
  id: string,
  patch: Partial<ArcReviewer>,
): Promise<ArcReviewer | null> {
  if (!isSupabaseConfigured()) return null;
  const writable = { ...patch };
  // If status transitions, stamp the matching timestamp.
  if (patch.status === "approved" && !patch.approved_at) {
    writable.approved_at = new Date().toISOString();
  }
  if (patch.status === "copy_sent" && !patch.copy_sent_at) {
    writable.copy_sent_at = new Date().toISOString();
  }
  if (patch.status === "posted_review" && !patch.posted_review_at) {
    writable.posted_review_at = new Date().toISOString();
  }
  // Strip read-only fields just in case.
  delete (writable as Record<string, unknown>).id;
  delete (writable as Record<string, unknown>).client_slug;
  delete (writable as Record<string, unknown>).applied_at;

  const { data, error } = await supabase
    .from("arc_reviewers")
    .update(writable)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as ArcReviewer;
}

export async function deleteArcReviewer(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("arc_reviewers").delete().eq("id", id);
  return !error;
}

export function statusCounts(rows: ArcReviewer[]): Record<ArcStatus, number> {
  const out: Record<ArcStatus, number> = {
    applied: 0,
    approved: 0,
    copy_sent: 0,
    posted_review: 0,
    skipped: 0,
  };
  for (const r of rows) out[r.status]++;
  return out;
}
