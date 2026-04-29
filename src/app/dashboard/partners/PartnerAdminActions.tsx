"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  partnerId: string;
  status?: string;
  referralId?: string;
  mode?: "partner" | "payout";
  // Optional fields used by the approved-row actions for "Resend login"
  // (copies a pre-formatted onboarding message to clipboard).
  partnerEmail?: string;
  partnerCode?: string;
  partnerName?: string;
};

export default function PartnerAdminActions({
  partnerId,
  status,
  referralId,
  mode = "partner",
  partnerEmail,
  partnerCode,
  partnerName,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function copyLoginMessage() {
    if (!partnerEmail || !partnerCode) return;
    const firstName = (partnerName || "").trim().split(/\s+/)[0] || "";
    const greeting = firstName ? `Hey ${firstName}!` : "Hey!";
    const message = `${greeting} Ben here. You're set up as a BlueJays partner — log in here to start: https://bluejayportfolio.com/partners/login

Your login:
Email: ${partnerEmail}
Code: ${partnerCode}

Questions: ben@bluejayportfolio.com`;
    navigator.clipboard?.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function removePartner() {
    if (busy) return;
    if (!confirm(
      `Remove this partner?\n\n• If they have NO call history or referrals, they'll be deleted entirely.\n• If they have history, they'll be set to 'declined' (record kept for accounting).\n\nThey can no longer log in either way.`,
    )) return;
    setBusy(true);
    try {
      const res = await fetch("/api/partners/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", partnerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't remove.");
        setBusy(false);
        return;
      }
      if (data.mode === "soft") {
        alert(
          `Partner had ${data.referralCount || 0} referrals + ${data.callCount || 0} calls — set to 'declined' to preserve history. They can't log in anymore.`,
        );
      }
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function call(action: string, extra: Record<string, unknown> = {}) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/partners/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, partnerId, referralId, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Action failed.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "payout") {
    return (
      <div className="inline-flex gap-2">
        <button
          onClick={() => {
            const method = window.prompt("Payout method? (venmo / zelle / cashapp / manual)", "venmo");
            if (!method) return;
            call("mark_paid", { method });
          }}
          disabled={busy}
          className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-emerald-950 transition-colors"
        >
          Mark paid
        </button>
        <button
          onClick={() => {
            if (!confirm("Void this referral? Use for refunds / spam.")) return;
            call("void_referral");
          }}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
        >
          Void
        </button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="inline-flex flex-wrap gap-2">
        <button
          onClick={() => call("approve")}
          disabled={busy}
          className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-emerald-950 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => call("decline")}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={removePartner}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
          title="Hard-delete (only if no history)"
        >
          Remove
        </button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="inline-flex flex-wrap gap-2 justify-end">
        {partnerEmail && partnerCode && (
          <button
            onClick={copyLoginMessage}
            disabled={busy}
            className={`rounded-md border disabled:opacity-50 px-3 py-1.5 text-xs font-semibold transition-colors ${
              copied
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                : "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
            }`}
            title="Copy a pre-formatted login message to send via iMessage / email"
          >
            {copied ? "✓ Copied" : "📋 Resend login"}
          </button>
        )}
        <button
          onClick={() => call("pause")}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          Pause
        </button>
        <button
          onClick={removePartner}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  if (status === "paused" || status === "declined") {
    return (
      <div className="inline-flex flex-wrap gap-2 justify-end">
        <button
          onClick={() => call("approve")}
          disabled={busy}
          className="rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors"
        >
          Re-activate
        </button>
        <button
          onClick={removePartner}
          disabled={busy}
          className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
        >
          Remove
        </button>
      </div>
    );
  }

  return null;
}
