/**
 * scan-jobs — progress tracking for any long-running scan kicked off
 * from the UI.
 *
 * Pattern:
 *   1. Route handler calls `createScanJob({ slug, kind })` → returns id.
 *   2. Returns `{ ok: true, jobId }` to the client immediately so the
 *      UI can start polling, then runs the scan synchronously in the
 *      same handler (Vercel keeps the function alive up to maxDuration).
 *   3. Scan calls `updateScanJobProgress(id, ...)` after each iteration.
 *   4. On completion → `finalizeScanJob(id, 'done', result)` OR
 *      `finalizeScanJob(id, 'failed', { error })`.
 *   5. Client polls GET /api/scan-jobs/[id] every ~1.5s for live state.
 *
 * Used by:
 *   · OIT manual partner-scout button
 *   · Future BlueJays auto-scout button on /dashboard
 *   · Future Zenith / ITC partner-scout buttons
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type ScanJobStatus = "running" | "done" | "failed";

export interface ScanJobRow {
  id: string;
  client_slug: string;
  kind: string;
  status: ScanJobStatus;
  progress_pct: number;
  phase: string | null;
  scanned: number;
  inserted: number;
  duplicates: number;
  errors: string[];
  error_message: string | null;
  triggered_by: string | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

export async function createScanJob(args: {
  clientSlug: string;
  kind: string;
  triggeredBy?: string | null;
  /** Optional pre-generated id (UUID) so the client can start polling
   *  before the POST returns. Server uses it as-is when provided. */
  preassignedId?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const insertRow: Record<string, unknown> = {
    client_slug: args.clientSlug,
    kind: args.kind,
    triggered_by: args.triggeredBy ?? null,
    status: "running",
    progress_pct: 0,
    phase: "starting",
  };
  if (args.preassignedId) insertRow.id = args.preassignedId;
  const { data, error } = await supabase
    .from("scan_jobs")
    .insert(insertRow)
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id;
}

export async function updateScanJobProgress(
  jobId: string,
  patch: {
    pct: number;
    phase: string;
    scanned: number;
    inserted: number;
    duplicates: number;
    errorsSoFar: number;
  },
): Promise<void> {
  if (!isSupabaseConfigured() || !jobId) return;
  await supabase
    .from("scan_jobs")
    .update({
      progress_pct: patch.pct,
      phase: patch.phase,
      scanned: patch.scanned,
      inserted: patch.inserted,
      duplicates: patch.duplicates,
      // store error count as part of `errors` length is enough — full
      // array gets written on finalize. Don't churn JSONB on every tick.
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export async function finalizeScanJob(
  jobId: string,
  status: "done" | "failed",
  payload: {
    scanned?: number;
    inserted?: number;
    duplicates?: number;
    errors?: string[];
    errorMessage?: string;
  },
): Promise<void> {
  if (!isSupabaseConfigured() || !jobId) return;
  await supabase
    .from("scan_jobs")
    .update({
      status,
      progress_pct: 100,
      phase: status === "done" ? "complete" : "failed",
      scanned: payload.scanned ?? 0,
      inserted: payload.inserted ?? 0,
      duplicates: payload.duplicates ?? 0,
      errors: payload.errors ?? [],
      error_message: payload.errorMessage ?? null,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export async function getScanJob(jobId: string): Promise<ScanJobRow | null> {
  if (!isSupabaseConfigured() || !jobId) return null;
  const { data, error } = await supabase
    .from("scan_jobs")
    .select(
      "id, client_slug, kind, status, progress_pct, phase, scanned, inserted, duplicates, errors, error_message, triggered_by, started_at, updated_at, completed_at",
    )
    .eq("id", jobId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ScanJobRow;
}
