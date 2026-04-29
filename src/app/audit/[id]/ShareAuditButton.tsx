"use client";

/**
 * Share-this-audit button — drops the audit URL into the user's preferred
 * channel (Web Share API on mobile, copy + email/SMS fallback on desktop).
 *
 * Why this matters: business owners often need to forward the audit to
 * their business partner / spouse / office manager who actually handles
 * "the website stuff." Without a share button, they screenshot or
 * forget — and the second decision-maker never sees it.
 *
 * Hormozi: every viral loop in a B2B funnel starts with "make it easy
 * to share with the OTHER person who has to say yes too."
 */

import { useState } from "react";

type Props = {
  auditUrl: string;
  businessName: string;
};

export default function ShareAuditButton({ auditUrl, businessName }: Props) {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const shareText = `Got a free site audit for ${businessName}. Take a look:`;

  async function handleShare() {
    // Prefer native Web Share (great on mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} — Site Audit`,
          text: shareText,
          url: auditUrl,
        });
        return;
      } catch {
        // User cancelled — fall through to fallback
      }
    }
    // Desktop fallback: show menu of options
    setShowFallback((s) => !s);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${auditUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for old browsers — show prompt
      window.prompt("Copy this link:", auditUrl);
    }
  }

  const emailSubject = encodeURIComponent(`${businessName} site audit — worth a look`);
  const emailBody = encodeURIComponent(`${shareText}\n\n${auditUrl}\n\n— shared from BlueJays`);
  const smsBody = encodeURIComponent(`${shareText} ${auditUrl}`);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className="group inline-flex items-center gap-2 rounded-md border border-sky-500/30 bg-sky-500/5 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-500/10 hover:border-sky-400/50 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Share with your team
      </button>

      {showFallback && (
        <>
          {/* Click-outside catcher */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowFallback(false)}
          />
          {/* Dropdown */}
          <div className="absolute z-40 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                copyToClipboard();
                setShowFallback(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-400">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              onClick={() => setShowFallback(false)}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-400">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email it
            </a>
            <a
              href={`sms:?&body=${smsBody}`}
              onClick={() => setShowFallback(false)}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sky-400">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Text it
            </a>
          </div>
        </>
      )}
    </div>
  );
}
