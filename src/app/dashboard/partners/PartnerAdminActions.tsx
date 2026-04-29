"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  partnerId: string;
  status?: string;
  referralId?: string;
  mode?: "partner" | "payout";
};

export default function PartnerAdminActions({
  partnerId,
  status,
  referralId,
  mode = "partner",
}: Props) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

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
      <div className="inline-flex gap-2">
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
      </div>
    );
  }

  if (status === "approved") {
    return (
      <button
        onClick={() => call("pause")}
        disabled={busy}
        className="rounded-md border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
      >
        Pause
      </button>
    );
  }

  if (status === "paused" || status === "declined") {
    return (
      <button
        onClick={() => call("approve")}
        disabled={busy}
        className="rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors"
      >
        Re-activate
      </button>
    );
  }

  return null;
}
