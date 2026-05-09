"use client";

import { useEffect, useState } from "react";

/**
 * OIT Calendar tab — connect Apple Calendar (or any iCal feed) so the
 * public booking page automatically blocks slots when Luke's busy.
 *
 * Apple doesn't offer OAuth for iCloud Calendar, so the integration
 * is the iCal-subscription flow:
 *   1. Owner publishes their iCloud calendar from Apple Calendar app
 *      (right-click calendar → Sharing → Public Calendar)
 *   2. Pastes the webcal:// URL into the form below
 *   3. We verify the feed parses + persist the URL
 *   4. /api/clients/olympic-inspections/slots/public filters out
 *      booking slots that overlap any event in the feed
 *
 * Read-only — we never write events back to Luke's calendar. The
 * BlueJays booking flow continues to write client_bookings rows
 * which Luke sees on his admin tab.
 *
 * No credentials are stored. The URL itself is the bearer of access
 * (anyone with it can read the feed) so Luke can disconnect anytime.
 */

interface IcalState {
  connected: boolean;
  url?: string;
  status?: string;
  lastSyncedAt?: string;
  lastError?: string | null;
}

const ENDPOINT = "/api/clients/olympic-inspections/calendar/ical";

export default function OitCalendarTab() {
  const [state, setState] = useState<IcalState | null>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = async () => {
    try {
      const r = await fetch(ENDPOINT, { credentials: "include" });
      const j = await r.json();
      if (j.ok) setState(j);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const connect = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: draftUrl }),
      });
      const j = await r.json();
      if (j.ok) {
        setMsg({ kind: "ok", text: j.message ?? "Connected." });
        setDraftUrl("");
        await refresh();
      } else {
        setMsg({ kind: "err", text: j.error ?? "Connect failed" });
      }
    } catch (err) {
      setMsg({
        kind: "err",
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Apple Calendar? Booking slots will no longer be filtered against your busy times.")) return;
    setBusy(true);
    try {
      await fetch(ENDPOINT, { method: "DELETE", credentials: "include" });
      setMsg({ kind: "ok", text: "Disconnected." });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const isConnected = !!state?.connected;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1">Calendar sync</h2>
        <p className="text-[12px] text-slate-500 leading-relaxed max-w-2xl">
          Connect your Apple Calendar (or any iCal feed) and the public
          booking page will automatically block any slot that overlaps an
          event in your calendar. Read-only — we never write events back
          to your calendar.
        </p>
      </div>

      {/* Connection status card */}
      <section
        className={`rounded-lg border p-4 ${
          isConnected
            ? "border-emerald-700 bg-emerald-950/40"
            : "border-slate-800 bg-slate-900/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div
              className={`text-[10px] tracking-[0.22em] uppercase font-bold ${
                isConnected ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {isConnected ? "🍏 Apple Calendar · connected" : "Apple Calendar · not connected"}
            </div>
            {isConnected && state?.url && (
              <div className="mt-1.5 font-mono text-[11px] text-slate-300 break-all max-w-xl">
                {state.url}
              </div>
            )}
            {isConnected && state?.lastSyncedAt && (
              <div className="text-[11px] text-slate-500 mt-1">
                last verified {new Date(state.lastSyncedAt).toLocaleString()}
              </div>
            )}
            {state?.lastError && (
              <div className="text-[11px] text-rose-400 mt-1">
                last error: {state.lastError}
              </div>
            )}
          </div>
          {isConnected && (
            <button
              type="button"
              onClick={disconnect}
              disabled={busy}
              className="text-[11px] font-bold px-3 py-1.5 rounded-md border border-rose-700 text-rose-300 hover:bg-rose-950/40 disabled:opacity-50"
            >
              Disconnect
            </button>
          )}
        </div>
      </section>

      {/* Connect form (only when not connected) */}
      {!isConnected && (
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Step 1 — Get your Apple Calendar share URL
            </h3>
            <ol className="text-[12px] text-slate-400 leading-relaxed space-y-1.5 list-decimal pl-5">
              <li>Open the Calendar app on your Mac.</li>
              <li>
                In the left sidebar, hover the calendar you want to share
                (e.g. &quot;Work&quot;) → click the small{" "}
                <span className="font-mono text-slate-300">📡</span> share
                icon, OR right-click → <em>Sharing Settings</em>.
              </li>
              <li>
                Check <strong>Public Calendar</strong>.
              </li>
              <li>
                Click <strong>Share Link</strong> — copy the URL
                (starts with{" "}
                <span className="font-mono text-slate-300">webcal://</span>
                ).
              </li>
            </ol>
            <p className="text-[11px] text-amber-500/80 mt-2 leading-relaxed">
              On iPhone: Calendar app → tap the calendar → Add Person /
              Public Calendar → Share Link.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Step 2 — Paste it here
            </h3>
            <input
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="webcal://p123-caldav.icloud.com/published/..."
              className="w-full p-2.5 rounded-md bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 font-mono"
              disabled={busy}
            />
            <button
              type="button"
              onClick={connect}
              disabled={busy || !draftUrl.trim()}
              className="mt-3 text-[12px] font-bold px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? "Verifying…" : "Connect Apple Calendar"}
            </button>
          </div>
        </section>
      )}

      {/* Result message */}
      {msg && (
        <div
          className={`text-[12px] leading-relaxed p-3 rounded-md ${
            msg.kind === "ok"
              ? "bg-emerald-950/40 border border-emerald-700 text-emerald-200"
              : "bg-rose-950/40 border border-rose-700 text-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* What this connects to */}
      <section className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
        <h3 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
          What this controls
        </h3>
        <ul className="text-[12px] text-slate-300 space-y-1.5 leading-relaxed">
          <li>
            ✅ Public booking page filters out slots that overlap any event
            in your calendar.{" "}
            <a
              href="/sites/olympic-inspections/index.html#book"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Open booking page →
            </a>
          </li>
          <li>
            ✅ Updates within 5 minutes of you adding an event in Apple
            Calendar (cached feed refresh window).
          </li>
          <li className="text-slate-400">
            ⚠️ One-off events only for now. Recurring events (weekly
            stand-ups etc.) need to either be expanded by Apple or added
            individually. Add it as a TODO if you live by recurring blocks.
          </li>
          <li className="text-slate-400">
            ⚠️ Local-time floating events are treated as Pacific Time.
            Works as long as you publish from a Mac/iPhone in PT.
          </li>
        </ul>
      </section>
    </div>
  );
}
