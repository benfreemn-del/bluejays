"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * PendingRepliesPanel — the "Needs Review" tile.
 *
 * Renders the AI-drafted replies waiting for Ben's approval (kill-switch
 * flow when AI_AUTO_REPLY_ENABLED=false). Polls /api/replies/pending-review
 * every 30 seconds. Optimistic-removes rows on approve/reject and reverts
 * on API failure.
 *
 * Visual style mirrors the existing dashboard cards (StatusTransitionsToday,
 * DashboardStats): rounded-xl, border-border, bg-surface dark surface.
 *
 * Mobile-responsive — Ben might approve from his phone.
 */

interface PendingProspect {
  id: string;
  businessName: string | null;
  category: string | null;
  city: string | null;
  currentWebsite: string | null;
  googleRating: number | null;
  reviewCount: number | null;
}

interface PendingReply {
  id: string;
  prospectId: string;
  channel: "sms" | "email";
  recipient: string;
  replyBody: string;
  replySubject: string | null;
  intent: string | null;
  status: string;
  createdAt: string;
  sendAfter: string;
  inboundExcerpt: string | null;
  prospect: PendingProspect | null;
}

interface ApiResponse {
  replies: PendingReply[];
  total: number;
}

const POLL_MS = 30_000;
const INBOUND_EXCERPT_MAX = 200;

const INTENT_COLORS: Record<string, string> = {
  interested: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  question: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  objection: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  custom_request: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  angry: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  unsubscribe: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  not_interested: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
  unclear: "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

function intentClass(intent: string | null): string {
  if (!intent) return "bg-slate-500/15 text-slate-300 border-slate-500/40";
  return INTENT_COLORS[intent] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function PendingRepliesPanel() {
  const [replies, setReplies] = useState<PendingReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/replies/pending-review", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiResponse;
      setReplies(data.replies ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollTimer.current = setInterval(load, POLL_MS);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [load]);

  const onApprove = useCallback(
    async (id: string, editedBody: string | null, sendImmediately: boolean) => {
      const previous = replies;
      // Optimistic remove
      setReplies((prev) => prev.filter((r) => r.id !== id));
      try {
        const res = await fetch(`/api/replies/${id}/approve`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editedBody: editedBody ?? undefined,
            sendImmediately,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        // Revert
        setReplies(previous);
        setError(e instanceof Error ? e.message : "Approve failed");
      }
    },
    [replies]
  );

  const onReject = useCallback(
    async (id: string, reason: string) => {
      const previous = replies;
      setReplies((prev) => prev.filter((r) => r.id !== id));
      try {
        const res = await fetch(`/api/replies/${id}/reject`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason || undefined }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        setReplies(previous);
        setError(e instanceof Error ? e.message : "Reject failed");
      }
    },
    [replies]
  );

  // Hide the whole panel during initial load if there's nothing pending —
  // we don't want to flash an empty pill at the top of the dashboard before
  // the first poll completes.
  if (loading && replies.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted"
        aria-busy="true"
      >
        Checking for AI replies awaiting review…
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div
        id="pending-review"
        className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 scroll-mt-20"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-muted">
            No replies need review — AI is on auto-reply
          </span>
        </div>
        {error && (
          <span className="text-xs text-rose-400" title={error}>
            sync error
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      id="pending-review"
      className="rounded-xl border border-amber-500/40 bg-surface shadow-lg shadow-amber-500/5 scroll-mt-20"
    >
      <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-foreground">
            Needs Review
          </h2>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-amber-300">
            {replies.length}
          </span>
        </div>
        <p className="hidden text-xs text-muted sm:block">
          AI drafted these replies. Approve, edit, or reject before they send.
        </p>
      </div>

      <div
        className="divide-y divide-border/60"
        aria-busy={loading ? "true" : "false"}
      >
        {replies.map((reply) => (
          <PendingReplyRow
            key={reply.id}
            reply={reply}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

      {error && (
        <div className="border-t border-rose-500/30 bg-rose-500/5 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  reply: PendingReply;
  onApprove: (
    id: string,
    editedBody: string | null,
    sendImmediately: boolean
  ) => void;
  onReject: (id: string, reason: string) => void;
}

function PendingReplyRow({ reply, onApprove, onReject }: RowProps) {
  const [expanded, setExpanded] = useState(false);
  const [editedBody, setEditedBody] = useState(reply.replyBody);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep edited body in sync if upstream draft text changes (rare, but
  // poll-driven refresh could update this row).
  useEffect(() => {
    setEditedBody(reply.replyBody);
  }, [reply.replyBody]);

  const isEdited = useMemo(
    () => editedBody.trim() !== reply.replyBody.trim(),
    [editedBody, reply.replyBody]
  );

  function handleApprove(sendImmediately: boolean) {
    setBusy(true);
    onApprove(
      reply.id,
      isEdited ? editedBody : null,
      sendImmediately
    );
  }

  function handleReject() {
    setBusy(true);
    onReject(reply.id, rejectReason.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter (no shift) → Approve & Send
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handleApprove(false);
    }
    // Escape → collapse
    if (e.key === "Escape") {
      e.preventDefault();
      setExpanded(false);
    }
  }

  const businessName = reply.prospect?.businessName ?? "Unknown business";
  const inbound = reply.inboundExcerpt
    ? truncate(reply.inboundExcerpt, INBOUND_EXCERPT_MAX)
    : null;

  return (
    <div className="px-4 py-3 transition-colors hover:bg-background/30">
      {/* Header row — biz name, channel, intent, time */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-foreground">
          {businessName}
        </span>
        {reply.prospect?.category && (
          <span className="rounded-md border border-border bg-background/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
            {reply.prospect.category}
          </span>
        )}
        {reply.prospect?.city && (
          <span className="text-xs text-muted">{reply.prospect.city}</span>
        )}
        <span
          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${intentClass(reply.intent)}`}
          title={`Intent: ${reply.intent ?? "unknown"}`}
        >
          {reply.intent ?? "unknown"}
        </span>
        <span className="rounded-md border border-border bg-background/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
          {reply.channel}
        </span>
        <span
          className="ml-auto text-[11px] text-muted"
          title={new Date(reply.createdAt).toLocaleString()}
        >
          {relativeTime(reply.createdAt)}
        </span>
      </div>

      {/* Inbound excerpt (what the prospect said) */}
      {inbound && (
        <div className="mt-2 rounded-md border border-border/60 bg-background/30 px-3 py-2 text-xs text-muted">
          <span className="mr-1 font-mono text-[10px] text-muted/70">
            INBOUND
          </span>
          {inbound}
        </div>
      )}

      {/* AI draft — collapsed preview or expanded textarea */}
      <div className="mt-2">
        {!expanded ? (
          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              // Focus the textarea right after it mounts.
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
            className="block w-full rounded-md border border-border/60 bg-background/40 px-3 py-2 text-left text-xs text-foreground/90 transition-colors hover:border-blue-electric/40 hover:bg-background/60"
            title="Expand to edit"
          >
            <span className="mr-1 font-mono text-[10px] text-blue-electric">
              AI DRAFT
            </span>
            {truncate(reply.replyBody, 220)}
          </button>
        ) : (
          <div>
            <textarea
              ref={textareaRef}
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={Math.min(10, Math.max(4, editedBody.split("\n").length + 1))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-blue-electric"
              aria-label="AI-drafted reply (editable)"
            />
            <p className="mt-1 text-[10px] text-muted">
              <kbd className="rounded border border-border bg-background/60 px-1 font-mono">
                Enter
              </kbd>{" "}
              approves &amp; sends ·{" "}
              <kbd className="rounded border border-border bg-background/60 px-1 font-mono">
                Esc
              </kbd>{" "}
              collapses ·{" "}
              <kbd className="rounded border border-border bg-background/60 px-1 font-mono">
                Shift+Enter
              </kbd>{" "}
              for newline
              {isEdited && (
                <span className="ml-2 text-amber-300">· edited</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Rejection reason form (toggled) */}
      {showRejectForm && (
        <div className="mt-2 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-rose-300">
            Rejection reason (optional)
          </label>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. tone off, wrong intent, prospect already replied"
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-rose-400"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={busy}
              className="rounded-md bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              disabled={busy}
              className="rounded-md border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleApprove(false)}
          disabled={busy || showRejectForm}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          title="Send with a 30-second humanization buffer"
        >
          Approve &amp; Send
        </button>
        <button
          type="button"
          onClick={() => handleApprove(true)}
          disabled={busy || showRejectForm}
          className="rounded-md border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10 disabled:opacity-50"
          title="Skip the 30s buffer — send on the next cron tick"
        >
          Send now
        </button>
        {!showRejectForm && (
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={busy}
            className="rounded-md border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
          >
            Reject
          </button>
        )}
        {expanded && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setEditedBody(reply.replyBody);
            }}
            disabled={busy}
            className="ml-auto text-[11px] text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
