"use client";

/**
 * Approve / Reject buttons for a single outbox draft.
 *
 * Hits /api/outbox/[id]/approve and /api/outbox/[id]/reject. The
 * server endpoints route to approveOutboxDraft / rejectOutboxDraft
 * which own the actual send-on-approve logic. On success the page is
 * refreshed so the approved/rejected row disappears from the list.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type State =
  | { status: "idle" }
  | { status: "loading"; action: "approve" | "reject" }
  | { status: "error"; message: string };

export default function OutboxApprovalControls({
  id,
  shortCode,
}: {
  id: string;
  shortCode: string;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const router = useRouter();

  async function approve() {
    setState({ status: "loading", action: "approve" });
    try {
      const r = await fetch(`/api/outbox/${id}/approve`, { method: "POST" });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setState({
          status: "error",
          message: j.error || `HTTP ${r.status}`,
        });
        return;
      }
      // Success — refresh the list so this row disappears.
      router.refresh();
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function reject() {
    setState({ status: "loading", action: "reject" });
    try {
      const r = await fetch(`/api/outbox/${id}/reject`, { method: "POST" });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setState({
          status: "error",
          message: j.error || `HTTP ${r.status}`,
        });
        return;
      }
      router.refresh();
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const loading = state.status === "loading";

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {state.status === "error" && (
        <span
          className="text-xs text-rose-300 mr-2 max-w-[200px] truncate"
          title={state.message}
        >
          {state.message}
        </span>
      )}
      <button
        type="button"
        onClick={reject}
        disabled={loading}
        title={`Reject draft ${shortCode}`}
        className="rounded-md border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state.status === "loading" && state.action === "reject"
          ? "…"
          : "Reject"}
      </button>
      <button
        type="button"
        onClick={approve}
        disabled={loading}
        title={`Approve + send draft ${shortCode}`}
        className="rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/30 transition-all"
      >
        {state.status === "loading" && state.action === "approve"
          ? "Sending…"
          : "Approve + send"}
      </button>
    </div>
  );
}
