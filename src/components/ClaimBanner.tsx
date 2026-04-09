"use client";
/**
 * ClaimBanner — shared sticky bottom bar shown on all portfolio preview pages.
 *
 * Mobile behaviour (< md):
 *   • Slim single-row bar (≈ 52 px) pinned to the bottom of the viewport.
 *   • Shows business name + "Claim" CTA button.
 *   • A "^" chevron lets the user expand it to see the full detail row.
 *   • An "×" dismiss button collapses it to a tiny pill so it never fully
 *     blocks content.
 *
 * Desktop behaviour (≥ md):
 *   • Two-row layout: status ticker on top, full CTA row below.
 *   • No dismiss — always visible.
 */

import { FormEvent, useEffect, useMemo, useState } from "react";

type ProspectStatus =
  | "paid"
  | "deployed"
  | "changes_pending"
  | "ready_to_finalize"
  | "claimed"
  | string;

interface ClaimBannerProps {
  businessName: string;
  accentColor: string;
  prospectId: string;
  /** Optional dark/light override for the ticker row background. */
  darkBg?: boolean;
}

const DELIVERED_STATUSES = new Set<ProspectStatus>([
  "paid",
  "deployed",
  "changes_pending",
  "ready_to_finalize",
]);

export default function ClaimBanner({
  businessName,
  accentColor,
  prospectId,
  darkBg = true,
}: ClaimBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  /** Whether the mobile banner is minimised to a tiny pill. */
  const [minimised, setMinimised] = useState(false);
  /** Whether the mobile banner is expanded to show the full detail row. */
  const [expanded, setExpanded] = useState(false);
  const [prospectStatus, setProspectStatus] = useState<ProspectStatus | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    requestText: "",
  });

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const tick = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProspectStatus = async () => {
      try {
        const response = await fetch(`/api/prospects/${prospectId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const prospect = (await response.json()) as { status?: ProspectStatus };
        if (active) {
          setProspectStatus(prospect.status || null);
        }
      } catch {
        // Keep the default claim CTA if the prospect lookup fails.
      }
    };

    void loadProspectStatus();

    return () => {
      active = false;
    };
  }, [prospectId]);

  const claimHref = `/claim/${prospectId}`;
  const tickerBg = darkBg ? "bg-[#111]/90" : "bg-white/90";
  const tickerBorder = darkBg ? "border-white/10" : "border-black/10";
  const tickerText = darkBg ? "text-slate-400" : "text-slate-600";
  const isDeliveredSite = useMemo(
    () => (prospectStatus ? DELIVERED_STATUSES.has(prospectStatus) : false),
    [prospectStatus]
  );

  const resetRequestState = () => {
    setSubmitState("idle");
    setErrorMessage("");
  };

  const submitChangeRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/change-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospectId,
          customerName: formValues.customerName,
          customerEmail: formValues.customerEmail,
          customerPhone: formValues.customerPhone,
          requestText: formValues.requestText,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your request right now.");
      }

      setSubmitState("success");
      setFormValues({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        requestText: "",
      });
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to submit your request right now."
      );
    }
  };

  if (isDeliveredSite) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              resetRequestState();
              setRequestOpen(true);
            }}
            className="h-10 px-4 rounded-full border border-white/15 bg-black/55 text-white/80 text-xs font-medium backdrop-blur-md hover:text-white hover:bg-black/70 transition-colors shadow-lg"
            aria-label="Request changes"
          >
            Request Changes
          </button>
        </div>

        {requestOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/55 px-4 py-6">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f1720] text-white shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Support</p>
                  <h3 className="mt-2 text-xl font-semibold">Request changes to {businessName}</h3>
                  <p className="mt-2 text-sm text-white/60">
                    Share the updates you want made and include the best contact information for follow-up.
                  </p>
                </div>
                <button
                  onClick={() => setRequestOpen(false)}
                  className="w-9 h-9 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
                  aria-label="Close request changes form"
                >
                  ×
                </button>
              </div>

              {submitState === "success" ? (
                <div className="px-6 py-8">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
                    Thanks — your request has been sent. We will review it and follow up using the contact information you provided.
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setRequestOpen(false)}
                      className="h-11 px-5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: accentColor }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitChangeRequest} className="px-6 py-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="space-y-2">
                      <span className="text-sm text-white/70">Name</span>
                      <input
                        type="text"
                        value={formValues.customerName}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, customerName: event.target.value }))
                        }
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm text-white/70">Email</span>
                      <input
                        type="email"
                        value={formValues.customerEmail}
                        onChange={(event) =>
                          setFormValues((prev) => ({ ...prev, customerEmail: event.target.value }))
                        }
                        className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 block">
                    <span className="text-sm text-white/70">Phone</span>
                    <input
                      type="tel"
                      value={formValues.customerPhone}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, customerPhone: event.target.value }))
                      }
                      className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                      placeholder="Optional if email is provided"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-white/70">What would you like changed?</span>
                    <textarea
                      value={formValues.requestText}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, requestText: event.target.value }))
                      }
                      className="w-full min-h-36 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-y focus:border-white/25"
                      placeholder="Examples: update the hero image, revise the about section, or change the color theme."
                      required
                    />
                  </label>

                  {submitState === "error" && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequestOpen(false)}
                      className="h-11 px-5 rounded-xl border border-white/10 text-sm font-medium text-white/75 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitState === "submitting"}
                      className="h-11 px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: accentColor }}
                    >
                      {submitState === "submitting" ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  /* ─── Minimised pill (mobile only) ─── */
  if (minimised) {
    return (
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMinimised(false)}
          className="flex items-center gap-2 h-10 px-4 rounded-full text-white text-xs font-bold shadow-xl"
          style={{ background: accentColor }}
          aria-label="Expand claim banner"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-white/80 animate-pulse" />
          Claim Site
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* ── Mobile slim bar ── */}
      <div className="md:hidden">
        {/* Expanded detail row (shown when user taps "^") */}
        {expanded && (
          <div
            className="px-4 py-2.5 flex items-center justify-between gap-3 border-t"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}12)`,
              borderColor: `${accentColor}35`,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Built for {businessName}
              </p>
              {timeLeft && timeLeft !== "EXPIRED" && (
                <p className="text-[10px] font-bold mt-0.5" style={{ color: accentColor }}>
                  Expires in {timeLeft}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Slim primary row */}
        <div
          className={`${tickerBg} backdrop-blur-sm border-t ${tickerBorder} px-3 flex items-center justify-between gap-2 h-[52px]`}
        >
          {/* Left: status dot + business name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="inline-block shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-xs ${tickerText} truncate`}>
              {businessName}
            </span>
          </div>

          {/* Right: CTA + expand + dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={claimHref}
              className="h-9 px-4 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              style={{ background: accentColor }}
            >
              Claim
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <button
              onClick={() => setExpanded((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${tickerText} hover:text-white transition-colors`}
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <button
              onClick={() => setMinimised(true)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${tickerText} hover:text-white transition-colors`}
              aria-label="Minimise banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop full banner ── */}
      <div className="hidden md:block">
        {/* Status ticker */}
        <div className={`${tickerBg} backdrop-blur-sm border-t ${tickerBorder} px-4 py-2 flex items-center justify-center gap-4`}>
          <p className={`text-xs ${tickerText}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            Custom-built preview for this business
          </p>
          {timeLeft && timeLeft !== "EXPIRED" && (
            <p className="text-xs font-bold" style={{ color: accentColor }}>
              Preview expires in {timeLeft}
            </p>
          )}
        </div>

        {/* CTA row */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            borderTop: `1px solid ${accentColor}30`,
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              This website was built for {businessName}
            </p>
            <p className={`text-xs ${tickerText}`}>
              Claim it before we offer it to a competitor
            </p>
          </div>
          <a
            href={claimHref}
            className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300 shadow-md"
            style={{ background: accentColor }}
          >
            Claim Your Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
