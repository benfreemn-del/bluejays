"use client";

/**
 * /dashboard/clients/zenith-sports/drill-of-week
 *
 * Preview the auto-rotated Drill of the Week + send the broadcast to
 * the active coach lead list. Picks one drill per ISO week from the
 * 26-drill library so the rotation cycles every ~6 months.
 *
 * Workflow:
 *   1. Open the page → see this week's drill, video preview, rendered email
 *   2. Optionally bump to a different week (testing / making up a missed send)
 *   3. Click "Dry-run preview" to see who'd receive it
 *   4. Click "Send to N coaches" to fire the broadcast
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Drill = {
  id: string;
  name: string;
  why: string;
  cue: string;
  tier: "Warm Up" | "Beginner" | "Intermediate";
};

type Email = { subject: string; body: string };

type Recipient = {
  id: string;
  name: string | null;
  email: string | null;
  funnel_status: string;
};

type Preview = {
  weekNum: number;
  drill: Drill;
  email: Email;
  upcoming: { weekNum: number; drill: Drill }[];
  totalDrills: number;
};

export default function DrillOfWeekAdminPage() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekOverride, setWeekOverride] = useState<number | "">("");
  const [audience, setAudience] = useState<"coach" | "parent" | "player">(
    "coach",
  );
  const [dryRunRecipients, setDryRunRecipients] = useState<Recipient[] | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const w = typeof weekOverride === "number" ? `?week=${weekOverride}` : "";
    const r = await fetch(`/api/zenith/drill-of-week${w}`);
    const j = (await r.json()) as { ok: boolean } & Preview;
    if (j.ok) setPreview(j);
    setLoading(false);
  }, [weekOverride]);

  useEffect(() => {
    load();
  }, [load]);

  const dryRun = async () => {
    setSendResult(null);
    setDryRunRecipients(null);
    const r = await fetch("/api/zenith/drill-of-week", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dryRun: true,
        weekOverride: typeof weekOverride === "number" ? weekOverride : undefined,
        audience,
      }),
    });
    const j = (await r.json()) as {
      ok: boolean;
      recipients?: Recipient[];
      recipientCount?: number;
    };
    if (j.ok && j.recipients) setDryRunRecipients(j.recipients);
  };

  const send = async () => {
    if (!dryRunRecipients) {
      alert("Run the dry-run preview first so you see who'll receive it.");
      return;
    }
    if (
      !confirm(
        `Send "${preview?.drill.name}" to ${dryRunRecipients.length} ${audience} lead${dryRunRecipients.length === 1 ? "" : "s"}?\n\nThis fires real emails immediately.`,
      )
    ) {
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const r = await fetch("/api/zenith/drill-of-week", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          weekOverride:
            typeof weekOverride === "number" ? weekOverride : undefined,
          audience,
        }),
      });
      const j = (await r.json()) as {
        ok: boolean;
        sent?: number;
        errors?: number;
        error?: string;
      };
      if (j.ok) {
        setSendResult(
          `✓ Sent ${j.sent} email${j.sent === 1 ? "" : "s"}${j.errors ? ` · ${j.errors} errors` : ""}`,
        );
        setDryRunRecipients(null);
      } else {
        setSendResult(`✕ ${j.error ?? "unknown error"}`);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/clients/zenith-sports"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Tasks
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              zenith-sports{" "}
              <span className="text-slate-500 font-normal">/ drill of the week</span>
            </h1>
            <div className="text-[11px] text-slate-500">
              Auto-rotated from {preview?.totalDrills ?? 0} drills · sequential by ISO week
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-5 pb-32 space-y-5">
        <div className="rounded-lg border border-emerald-700/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
          <strong>How it works:</strong> the system picks one drill per ISO
          week from the 26-drill library. Once rotation completes (~6 months),
          it loops. Click <strong>Dry-run</strong> to see who'd receive the
          broadcast, then <strong>Send</strong> to fire real emails.
        </div>

        {loading && <div className="text-slate-500">Loading…</div>}

        {preview && (
          <>
            {/* Week selector */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="text-slate-400">Week:</span>
              <span className="font-bold text-emerald-300 text-lg">
                W{preview.weekNum}
              </span>
              <input
                type="number"
                value={weekOverride === "" ? "" : weekOverride}
                onChange={(e) =>
                  setWeekOverride(
                    e.target.value === "" ? "" : parseInt(e.target.value, 10),
                  )
                }
                placeholder="override"
                className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
              />
              {weekOverride !== "" && (
                <button
                  type="button"
                  onClick={() => setWeekOverride("")}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Clear override
                </button>
              )}
            </div>

            {/* The drill */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-5">
              <div className="text-[10px] tracking-wider uppercase font-bold text-emerald-300">
                {preview.drill.tier}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                {preview.drill.name}
              </h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-1">
                    Why it matters
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {preview.drill.why}
                  </p>
                  <div className="mt-3 text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-1">
                    Coaching cue
                  </div>
                  <p
                    className="text-sm text-emerald-200 italic"
                    style={{ fontFamily: "ui-serif, Georgia, serif" }}
                  >
                    &ldquo;{preview.drill.cue}&rdquo;
                  </p>
                </div>
                {/* YouTube preview */}
                <div className="aspect-video rounded overflow-hidden border border-slate-800 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${preview.drill.id}`}
                    title={preview.drill.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Email preview */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400 mb-2">
                Email preview · what coaches will receive
              </div>
              <div className="text-sm font-bold text-slate-100 mb-2 pb-2 border-b border-slate-800">
                Subject: {preview.email.subject}
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed">
                {preview.email.body}
              </pre>
              <div className="text-[10px] text-slate-600 mt-2">
                {`{{firstName}}`} / {`{{coachGuideUrl}}`} / {`{{builderUrl}}`}{" "}
                are filled per-lead at send time.
              </div>
            </div>

            {/* Send controls */}
            <div className="rounded-lg border border-rose-700/40 bg-rose-950/20 p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-slate-400">Send to:</span>
                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(
                      e.target.value as "coach" | "parent" | "player",
                    )
                  }
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm"
                >
                  <option value="coach">All active coach leads</option>
                  <option value="parent">All active parent leads</option>
                  <option value="player">All active player leads</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={dryRun}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  Dry-run preview
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !dryRunRecipients}
                  className="bg-rose-500 hover:bg-rose-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded text-sm font-bold"
                  title={
                    dryRunRecipients
                      ? `Send to ${dryRunRecipients.length} recipient${dryRunRecipients.length === 1 ? "" : "s"}`
                      : "Run dry-run first"
                  }
                >
                  {sending
                    ? "Sending…"
                    : dryRunRecipients
                      ? `🔥 Send to ${dryRunRecipients.length}`
                      : "🔥 Send (run dry-run first)"}
                </button>
                {sendResult && (
                  <span
                    className={
                      sendResult.startsWith("✓")
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {sendResult}
                  </span>
                )}
              </div>

              {dryRunRecipients && (
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-bold text-blue-300 mb-2">
                    Dry-run recipients ({dryRunRecipients.length})
                  </div>
                  {dryRunRecipients.length === 0 ? (
                    <div className="text-xs text-slate-500 border border-dashed border-slate-800 rounded p-3 text-center">
                      No active {audience} leads with email addresses found.
                      Tag some leads with the {audience} audience first.
                    </div>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-300 max-h-48 overflow-y-auto">
                      {dryRunRecipients.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center gap-2 px-2 py-1 bg-slate-950/40 rounded"
                        >
                          <span className="font-bold w-32 truncate">
                            {r.name ?? "(no name)"}
                          </span>
                          <span className="text-slate-400 truncate flex-1">
                            {r.email}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">
                            {r.funnel_status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming rotation */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-500 mb-2">
                Upcoming rotation
              </div>
              <ul className="space-y-1 text-xs">
                {preview.upcoming.map((u) => (
                  <li key={u.weekNum} className="flex items-center gap-3">
                    <span className="text-slate-500 w-12 tabular-nums">
                      W{u.weekNum}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 w-20 text-center">
                      {u.drill.tier}
                    </span>
                    <span className="text-slate-200">{u.drill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
