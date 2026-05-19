"use client";

import { useEffect, useState } from "react";
import {
  X,
  BookOpenText,
  ArrowRight,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";

/**
 * VerseOfDayPopup — small floating sign-up that appears 10s after the
 * visitor lands on the site, anchored to the bottom-right corner.
 *
 * States:
 *   hidden       — not yet shown (first 10s, or dismissed/submitted)
 *   tab          — collapsed cream tab with bookmark icon + label
 *   open         — expanded card with name + email + subscribe button
 *   ok           — short thank-you, then auto-collapses to tab
 *
 * Dismissal is per-session (sessionStorage) so it re-shows on future
 * visits but doesn't nag during a single visit.
 *
 * Submissions POST to /api/clients/inquire with form_type =
 * "verse_of_week_signup" → routes to office@thrivesequim.com.
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const AMBER_LIGHT = "#fbbf24";
const CREAM = "#fbf7ee";
const INK = "#1b2922";

const DISMISS_KEY = "thrive_verse_popup_dismissed";
const DELAY_MS = 10_000;

type Mode = "hidden" | "tab" | "open";
type Status = "idle" | "sending" | "ok" | "err";

export default function VerseOfDayPopup() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 10s delayed reveal — but skip entirely if dismissed this session.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // Ignore — private mode or disabled storage. We'll just show.
    }
    const t = window.setTimeout(() => setMode("tab"), DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setMode("hidden");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus("err");
      setErrMsg("We just need your email.");
      return;
    }
    try {
      const res = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "thrive-church-sequim",
          form_type: "verse_of_week_signup",
          name: cleanName,
          email: cleanEmail,
          message: "Subscribe to Verse of the Week — weekly devotional email (Monday mornings).",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        setStatus("err");
        setErrMsg(data.error || "Something went wrong — try again.");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      // Auto-collapse + remember dismissal so they don't see it again
      // this session.
      try {
        window.sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
      window.setTimeout(() => setMode("tab"), 2500);
    } catch {
      setStatus("err");
      setErrMsg("Network error — try again in a sec.");
    }
  }

  if (mode === "hidden") return null;

  return (
    <>
      {/* Collapsed tab — small bookmark-style chip in the bottom-right
          corner. Tapping expands to the form. */}
      {mode === "tab" && (
        <button
          type="button"
          onClick={() => {
            setMode("open");
            setStatus("idle");
          }}
          aria-label="Subscribe to Verse of the Week"
          className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full px-4 py-3 text-[12px] font-bold uppercase tracking-[0.18em] shadow-[0_14px_36px_-14px_rgba(13,79,74,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgba(13,79,74,0.65)] sm:bottom-7 sm:right-7"
          style={{
            background: TEAL,
            color: CREAM,
            fontFamily: "var(--font-thrive-body), sans-serif",
            border: `1.5px solid ${AMBER}`,
          }}
        >
          <BookOpenText size={16} weight="duotone" style={{ color: AMBER_LIGHT }} />
          <span className="hidden sm:inline">Verse of the Week</span>
          <span className="sm:hidden">Weekly Verse</span>
        </button>
      )}

      {/* Expanded card — anchored bottom-right, ~320px wide, with the
          name + email form. Click backdrop or X to collapse. */}
      {mode === "open" && (
        <>
          <div
            aria-hidden
            onClick={() => setMode("tab")}
            className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
          />
          <div
            role="dialog"
            aria-label="Subscribe to Verse of the Week"
            className="fixed bottom-5 right-5 z-[60] w-[calc(100vw-2.5rem)] max-w-[340px] rounded-2xl border bg-[#fbf7ee] p-5 shadow-[0_30px_70px_-20px_rgba(13,79,74,0.55)] sm:bottom-7 sm:right-7 sm:p-6"
            style={{
              borderColor: "rgba(13, 79, 74, 0.25)",
              fontFamily: "var(--font-thrive-body), sans-serif",
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(217, 119, 6, 0.12)",
                    color: AMBER,
                  }}
                >
                  <BookOpenText size={18} weight="duotone" />
                </span>
                <div className="leading-tight">
                  <p
                    className="text-[12px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: AMBER }}
                  >
                    Weekly Devotional
                  </p>
                  <p
                    className="font-[family-name:var(--font-thrive-display)] text-lg text-[#0d4f4a]"
                    style={{ fontWeight: 600 }}
                  >
                    Verse of the Week
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#1b2922]/55 transition-colors hover:bg-[#0d4f4a]/10 hover:text-[#1b2922]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* OK state */}
            {status === "ok" ? (
              <div className="mt-5">
                <div
                  className="flex items-start gap-2.5 rounded-lg border bg-white p-3.5"
                  style={{ borderColor: "rgba(13, 79, 74, 0.18)" }}
                >
                  <CheckCircle
                    size={20}
                    weight="duotone"
                    style={{ color: TEAL, flexShrink: 0, marginTop: 2 }}
                  />
                  <div>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: TEAL, fontFamily: "var(--font-thrive-body), sans-serif" }}
                    >
                      You&rsquo;re on the list.
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-[#1b2922]/72">
                      A short verse + reflection will land in your inbox
                      every Monday morning. Welcome.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4" noValidate>
                <p className="text-[13px] leading-snug text-[#1b2922]/75">
                  A short verse + reflection in your inbox every Monday
                  morning. No spam, no ads — just scripture.
                </p>
                <div className="mt-4 space-y-2.5">
                  <label className="block">
                    <span className="sr-only">Your name (optional)</span>
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
                      style={{ borderColor: "rgba(13, 79, 74, 0.2)" }}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Your email</span>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] text-[#1b2922] outline-none transition-colors focus:border-[#d97706]"
                      style={{ borderColor: "rgba(13, 79, 74, 0.2)" }}
                    />
                  </label>
                </div>

                {status === "err" && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[12px]"
                    style={{
                      color: "#7a1f1f",
                      background: "#fbeaea",
                      borderColor: "rgba(122, 31, 31, 0.18)",
                    }}
                  >
                    <Warning size={14} weight="fill" className="mt-0.5 shrink-0" />
                    <span>{errMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                  style={{
                    background: AMBER,
                    color: "#ffffff",
                    fontFamily: "var(--font-thrive-body), sans-serif",
                    boxShadow: "0 12px 28px -10px rgba(217, 119, 6, 0.55)",
                  }}
                >
                  {status === "sending" ? "Subscribing…" : "Get Weekly Verse"}
                  {status !== "sending" && <ArrowRight size={13} weight="bold" />}
                </button>

                <p className="mt-3 text-[11px] leading-snug text-[#1b2922]/55">
                  Unsubscribe in one click. We never share your info.
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
