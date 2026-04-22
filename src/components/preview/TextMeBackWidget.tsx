"use client";

/**
 * TextMeBackWidget — bottom-of-preview opt-in widget.
 *
 * WHY: Creates a second TCPA-compliant SMS consent pathway beyond
 * /get-started. When a prospect opens their preview from a cold email
 * and drops their number here (with the required consent checkbox),
 * we flip their `source` to `"inbound"` so the funnel's inbound gate
 * allows SMS sends to that number.
 *
 * Consent language is intentionally IDENTICAL to the /get-started
 * checkbox so every TCR-approved opt-in surface uses the same wording.
 * That consistency matters for A2P 10DLC audits.
 *
 * Hidden in ?embed=1 mode (postcard captures, screenshot services, etc.)
 * so the widget never appears in rendered screenshots of the preview.
 */

import { useEffect, useState } from "react";

const CONSENT_TEXT =
  "I agree to receive communication from BlueJay Business Solutions about my website preview, including email and SMS text messages at the phone number I provided. Message frequency varies (up to 4 messages per week). Message and data rates may apply. Reply STOP to opt out, HELP for help. See our Privacy Policy and Terms.";

export default function TextMeBackWidget({ prospectId }: { prospectId: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmbedded, setIsEmbedded] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const embed =
      new URLSearchParams(window.location.search).get("embed") === "1";
    setIsEmbedded(embed);
    // Persist dismissal per-prospect so the widget doesn't nag on every
    // page-load; once dismissed for a given prospect it stays hidden
    // until localStorage is cleared.
    const key = `tmb_dismissed_${prospectId}`;
    if (localStorage.getItem(key) === "1") setDismissed(true);
  }, [prospectId]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`tmb_dismissed_${prospectId}`, "1");
    } catch {
      // ignore quota / private-mode errors
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!consent) {
      setErrorMessage("Please check the consent box before submitting.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith("1"))) {
      setErrorMessage("Enter a 10-digit US phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/text-me-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          phone,
          consentText: CONSENT_TEXT,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("ok");
      } else {
        setState("err");
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch {
      setState("err");
      setErrorMessage("Network error. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmbedded || dismissed) return null;

  // Success / minimal confirmation (replaces the full widget once submitted).
  if (state === "ok") {
    return (
      <div className="fixed bottom-6 left-6 z-[9997] max-w-xs rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100 shadow-2xl backdrop-blur">
        ✓ Got it — we&apos;ll text you when there&apos;s news on your site.
        <button
          onClick={dismiss}
          aria-label="Close"
          className="ml-2 text-emerald-200/70 hover:text-white"
        >
          ×
        </button>
      </div>
    );
  }

  // Collapsed pill state — matches the Claim-this-site CTA visually so it
  // doesn't compete with it. Anchored bottom-left to keep bottom-right
  // reserved for the primary Claim CTA.
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 left-6 z-[9997] inline-flex items-center gap-2 rounded-full bg-slate-900/90 hover:bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-2xl border border-white/10 transition-colors backdrop-blur"
      >
        💬 Text me back
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9997] w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">Want me to text you?</p>
          <p className="mt-1 text-xs text-white/60">
            I&apos;ll send a quick text when there&apos;s news on your site — no spam, opt out anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="ml-3 -mt-1 -mr-1 text-white/50 hover:text-white"
        >
          ×
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(206) 555-1234"
          required
          aria-label="Your mobile phone number"
          className="w-full h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder-white/30 focus:border-sky-500/60 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
        />

        {/* Consent checkbox — IDENTICAL language to /get-started for
            A2P 10DLC audit consistency. Required; form cannot submit
            until ticked. */}
        <label className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] border border-white/10 p-3 text-xs leading-relaxed text-white/70 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500 cursor-pointer"
          />
          <span>
            {CONSENT_TEXT.replace("See our Privacy Policy and Terms.", "")}
            See our{" "}
            <a href="/privacy" target="_blank" className="text-sky-400 hover:text-sky-300 underline">
              Privacy Policy
            </a>
            {" "}and{" "}
            <a href="/terms" target="_blank" className="text-sky-400 hover:text-sky-300 underline">
              Terms
            </a>.
          </span>
        </label>

        {errorMessage && (
          <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !consent}
          className="w-full h-10 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
        >
          {submitting ? "Sending..." : "Text me back"}
        </button>
      </form>
    </div>
  );
}
