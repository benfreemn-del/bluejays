"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CaseStudyToggle({
  auditId,
  isPublished,
}: {
  auditId: string;
  isPublished: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/audits/${auditId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unpublish: isPublished }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Couldn't toggle.");
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

  if (isPublished) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className="rounded-md border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors"
      >
        Unpublish
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-amber-950 transition-colors"
    >
      Publish
    </button>
  );
}
