"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reusable "scan with progress bar" button. Drop into any portal /
 * dashboard surface that triggers a long-running scan tracked via
 * the `scan_jobs` table.
 *
 * Pattern (see src/lib/scan-jobs.ts):
 *   1. Client generates a UUID for the job.
 *   2. POSTs to `endpoint` with body `{ jobId: <uuid> }`. The handler
 *      pre-creates the scan_jobs row using that id, runs the scan
 *      streaming progress to the row.
 *   3. Client polls /api/scan-jobs/[id] every 1.5s for live state.
 *   4. When status='done' or 'failed' (or POST returns), final state
 *      is rendered, onDone() is called so the parent can refresh data.
 *
 * Auth: relies on the parent surface's existing portal-cookie or
 * dashboard-cookie. Endpoint must be authed; this component is
 * presentation-only.
 */
export interface ScanWithProgressProps {
  /** POST URL — must accept `{ jobId }` body and write to scan_jobs */
  endpoint: string;
  /** GET URL prefix to poll (default: /api/scan-jobs) */
  pollPathPrefix?: string;
  /** Idle button label */
  label?: string;
  /** Emoji prefix on the button */
  emoji?: string;
  /** Hint shown above the bar while running */
  busyLabel?: string;
  /** Fires after a successful scan so the parent can re-fetch data */
  onDone?: () => void | Promise<void>;
  /** Color override (CSS color string). Defaults to OIT-green. */
  accentColor?: string;
  /** Extra body fields to send with the POST (e.g. {scope: "all"}) */
  extraBody?: Record<string, unknown>;
}

interface ScanJob {
  id: string;
  status: "running" | "done" | "failed";
  progress_pct: number;
  phase: string | null;
  scanned: number;
  inserted: number;
  duplicates: number;
  errors: string[];
  error_message: string | null;
}

function newUuid(): string {
  // Native crypto.randomUUID() is available in browsers + Node 19+
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (shouldn't fire on modern browsers)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ScanWithProgress({
  endpoint,
  pollPathPrefix = "/api/scan-jobs",
  label = "Scan now",
  emoji = "🛰️",
  busyLabel = "scanning…",
  onDone,
  accentColor = "#2d4a2d",
  extraBody,
}: ScanWithProgressProps) {
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<ScanJob | null>(null);
  const [finalMsg, setFinalMsg] = useState<string | null>(null);
  const [finalKind, setFinalKind] = useState<"ok" | "warn" | "err" | null>(null);
  const pollHandle = useRef<NodeJS.Timeout | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    return () => {
      stopped.current = true;
      if (pollHandle.current) clearInterval(pollHandle.current);
    };
  }, []);

  const startPolling = (id: string) => {
    if (pollHandle.current) clearInterval(pollHandle.current);
    pollHandle.current = setInterval(async () => {
      if (stopped.current) return;
      try {
        const r = await fetch(`${pollPathPrefix}/${id}`, {
          credentials: "include",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { ok: boolean; job?: ScanJob };
        if (!j.ok || !j.job) return;
        setJob(j.job);
        if (j.job.status !== "running") {
          if (pollHandle.current) clearInterval(pollHandle.current);
        }
      } catch {
        /* network blip — next tick will retry */
      }
    }, 1500);
  };

  const run = async () => {
    setBusy(true);
    setFinalMsg(null);
    setFinalKind(null);
    setJob(null);
    const id = newUuid();
    startPolling(id);

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, ...(extraBody ?? {}) }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        scanned?: number;
        inserted?: number;
        duplicates?: number;
        errors?: string[];
        error?: string;
      };
      if (pollHandle.current) clearInterval(pollHandle.current);

      if (!r.ok || !j.ok) {
        setFinalKind("err");
        setFinalMsg(`Scan failed: ${j.error ?? "unknown error"}`);
      } else {
        const ins = j.inserted ?? 0;
        const dup = j.duplicates ?? 0;
        const scanned = j.scanned ?? 0;
        const errs = j.errors ?? [];
        // Surface a useful message if errors[] is non-empty even though
        // ok:true (e.g. GOOGLE_PLACES_API_KEY missing → 0 scanned).
        if (scanned === 0 && errs.length > 0) {
          setFinalKind("warn");
          setFinalMsg(`No results — ${errs[0]}`);
        } else if (ins > 0) {
          setFinalKind("ok");
          setFinalMsg(`✓ +${ins} new (scanned ${scanned}, ${dup} dupes)`);
        } else {
          setFinalKind("warn");
          setFinalMsg(`Done — no new candidates (scanned ${scanned}, ${dup} dupes)`);
        }
        if (onDone) await onDone();
      }
    } catch (err) {
      if (pollHandle.current) clearInterval(pollHandle.current);
      setFinalKind("err");
      setFinalMsg(
        `Scan failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusy(false);
      // keep the final message on screen for ~12s — long scans deserve
      // visible confirmation
      setTimeout(() => {
        setFinalMsg(null);
        setFinalKind(null);
        setJob(null);
      }, 12000);
    }
  };

  const pct = job?.progress_pct ?? 0;
  const phase = job?.phase ?? "starting";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 8,
        minWidth: 260,
      }}
    >
      <button
        type="button"
        onClick={run}
        disabled={busy}
        style={{
          background: busy ? "#7a857a" : accentColor,
          color: "#f7f5ee",
          border: "none",
          padding: "10px 16px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "Merriweather, Georgia, serif",
          cursor: busy ? "wait" : "pointer",
          boxShadow: "0 2px 6px rgba(31,42,28,0.18)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {busy ? `🔄 ${busyLabel}` : `${emoji} ${label}`}
      </button>

      {/* Progress bar — visible the entire time the scan is running */}
      {busy && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "8px 10px",
            background: "rgba(45,74,45,0.06)",
            borderRadius: 8,
            border: "1px solid rgba(45,74,45,0.18)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#2d4a2d",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span>{phase}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: "rgba(45,74,45,0.18)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: accentColor,
                transition: "width 400ms ease-out",
              }}
            />
          </div>
          {job && (
            <div
              style={{
                fontSize: 10,
                color: "#7a857a",
                fontVariantNumeric: "tabular-nums",
                display: "flex",
                gap: 10,
              }}
            >
              <span>scanned {job.scanned}</span>
              <span>+{job.inserted} new</span>
              <span>{job.duplicates} dupes</span>
              {job.errors.length > 0 && (
                <span style={{ color: "#9b1c1c" }}>
                  {job.errors.length} err
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Final-state message (success, no-results, or error) */}
      {!busy && finalMsg && (
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.4,
            padding: "6px 10px",
            borderRadius: 8,
            background:
              finalKind === "ok"
                ? "rgba(45,74,45,0.10)"
                : finalKind === "err"
                  ? "rgba(155,28,28,0.10)"
                  : "rgba(176,128,40,0.10)",
            color:
              finalKind === "ok"
                ? "#2d4a2d"
                : finalKind === "err"
                  ? "#9b1c1c"
                  : "#7a5a14",
          }}
        >
          {finalMsg}
        </div>
      )}
    </div>
  );
}
