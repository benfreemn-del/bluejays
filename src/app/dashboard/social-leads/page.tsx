"use client";

/**
 * /dashboard/social-leads
 *
 * Review surface for the SMS-captured social lead pipeline. Ben texts
 * a FB/X/LinkedIn URL to his Twilio number → /api/inbound/sms routes
 * to captureSocialLead() → AI drafts a 2-line opener → row lands here
 * with status='drafted'.
 *
 * From here he marks each one "sent" / "replied" / "closed" so the
 * pipeline doesn't get noisy and the daily digest knows which drafts
 * are still outstanding.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type SocialLead = {
  id: string;
  platform: string;
  post_url: string | null;
  raw_text: string;
  author_role: string | null;
  intent: string | null;
  intent_confidence: number | null;
  classification_summary: string | null;
  drafted_message: string | null;
  status: string;
  sent_at: string | null;
  replied_at: string | null;
  created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  drafted: "border-amber-500/40 bg-amber-950/30 text-amber-200",
  sent: "border-blue-500/40 bg-blue-950/30 text-blue-200",
  replied: "border-emerald-500/40 bg-emerald-950/30 text-emerald-200",
  "closed-won": "border-emerald-600/40 bg-emerald-950/40 text-emerald-100",
  "closed-lost": "border-slate-700 bg-slate-900/50 text-slate-400",
  "closed-no-response": "border-slate-700 bg-slate-900/50 text-slate-400",
};

const INTENT_EMOJI: Record<string, string> = {
  "integrate-claude": "🔌",
  "learn-about-ai": "📚",
  "hire-builder": "💼",
  showcase: "🎨",
  complain: "😤",
  other: "•",
};

export default function SocialLeadsPage() {
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"open" | "all">("open");

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/social-leads?filter=${filter}`);
    const j = (await r.json()) as { ok: boolean; leads?: SocialLead[] };
    if (j.ok && j.leads) setLeads(j.leads);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
    await fetch(`/api/social-leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openCount = leads.filter((l) => l.status === "drafted").length;
  const sentCount = leads.filter((l) => l.status === "sent").length;
  const repliedCount = leads.filter((l) => l.status === "replied").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Social leads
          </h1>
          <button
            onClick={() => setFilter(filter === "open" ? "all" : "open")}
            className="text-[11px] tracking-wider uppercase font-bold border border-slate-700 px-2.5 py-1 rounded hover:border-violet-500/50 hover:text-white transition-colors text-slate-300"
          >
            {filter === "open" ? "Show all" : "Open only"}
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-3 text-xs text-slate-500 flex flex-wrap gap-3">
          <span>
            <span className="text-amber-300 font-bold">{openCount}</span> drafted
          </span>
          <span>
            <span className="text-blue-300 font-bold">{sentCount}</span> sent
          </span>
          <span>
            <span className="text-emerald-300 font-bold">{repliedCount}</span>{" "}
            replied
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            text a FB/X/LI URL to your Twilio number to capture one
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 pb-32 space-y-3">
        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}

        {!loading && leads.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            <div className="text-4xl mb-3">📥</div>
            No social leads captured yet.
            <div className="mt-3 text-xs max-w-sm mx-auto">
              See a relevant FB/X/LI post on your phone? Long-press the post URL,
              copy, and text it to your Twilio number. The AI drafts a 2-line
              opener in your voice and texts it back within ~10 seconds.
            </div>
          </div>
        )}

        {leads.map((lead) => {
          const intentEmoji = INTENT_EMOJI[lead.intent || "other"] || "•";
          const statusCls =
            STATUS_COLOR[lead.status] ||
            "border-slate-700 bg-slate-900/50 text-slate-300";
          return (
            <article
              key={lead.id}
              className={`rounded-lg border p-4 space-y-3 ${statusCls}`}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-2xl leading-none">{intentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] uppercase tracking-wider font-bold">
                    <span>{lead.platform}</span>
                    {lead.intent && (
                      <>
                        <span className="opacity-50">·</span>
                        <span>{lead.intent}</span>
                      </>
                    )}
                    {lead.author_role && (
                      <>
                        <span className="opacity-50">·</span>
                        <span>{lead.author_role}</span>
                      </>
                    )}
                    {lead.intent_confidence !== null && (
                      <>
                        <span className="opacity-50">·</span>
                        <span>
                          {Math.round(lead.intent_confidence * 100)}% confidence
                        </span>
                      </>
                    )}
                  </div>
                  {lead.classification_summary && (
                    <p className="text-sm mt-1 text-white/90">
                      {lead.classification_summary}
                    </p>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-80 shrink-0">
                  {lead.status}
                </span>
              </div>

              {lead.raw_text && (
                <details className="text-[13px] leading-relaxed text-slate-300 bg-black/30 rounded p-3 border border-white/5">
                  <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-slate-500 hover:text-slate-300">
                    Original post
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap">{lead.raw_text}</p>
                </details>
              )}

              {lead.drafted_message && (
                <div className="rounded-md border border-white/10 bg-slate-900/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Drafted opener
                    </span>
                    <button
                      onClick={() => copy(lead.drafted_message!)}
                      className="text-[10px] uppercase tracking-wider font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-violet-500/50 px-2 py-0.5 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">
                    {lead.drafted_message}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {lead.post_url && (
                  <a
                    href={lead.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-wider font-bold text-cyan-300 hover:text-white border border-cyan-700/50 px-2 py-1 rounded"
                  >
                    Open post ↗
                  </a>
                )}
                {lead.status === "drafted" && (
                  <button
                    onClick={() => updateStatus(lead.id, "sent")}
                    className="text-[11px] uppercase tracking-wider font-bold text-blue-300 hover:text-white border border-blue-700/50 px-2 py-1 rounded"
                  >
                    Mark sent
                  </button>
                )}
                {lead.status === "sent" && (
                  <button
                    onClick={() => updateStatus(lead.id, "replied")}
                    className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2 py-1 rounded"
                  >
                    They replied
                  </button>
                )}
                {!lead.status.startsWith("closed") && (
                  <>
                    <button
                      onClick={() => updateStatus(lead.id, "closed-won")}
                      className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 hover:text-white border border-emerald-700/50 px-2 py-1 rounded ml-auto"
                    >
                      Won
                    </button>
                    <button
                      onClick={() => updateStatus(lead.id, "closed-lost")}
                      className="text-[11px] uppercase tracking-wider font-bold text-rose-300 hover:text-white border border-rose-700/50 px-2 py-1 rounded"
                    >
                      Lost
                    </button>
                    <button
                      onClick={() => updateStatus(lead.id, "closed-no-response")}
                      className="text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-white border border-slate-700 px-2 py-1 rounded"
                    >
                      Ghosted
                    </button>
                  </>
                )}
              </div>

              <div className="text-[10px] text-slate-600">
                Captured {new Date(lead.created_at).toLocaleString()}
                {lead.sent_at &&
                  ` · sent ${new Date(lead.sent_at).toLocaleString()}`}
                {lead.replied_at &&
                  ` · replied ${new Date(lead.replied_at).toLocaleString()}`}
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
