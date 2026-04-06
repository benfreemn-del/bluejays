"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Prospect } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface TimelineEvent {
  id: string;
  type: "email" | "sms" | "note" | "status" | "system";
  channel?: string;
  title: string;
  body: string;
  timestamp: string;
  meta?: string;
}

export default function LeadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [dismissReason, setDismissReason] = useState("");
  const [showDismiss, setShowDismiss] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load prospect
      const pRes = await fetch(`/api/prospects/${id}`);
      const pData = await pRes.json();
      if (pData.error) { router.push("/dashboard"); return; }
      setProspect(pData);

      // Load comms
      const cRes = await fetch(`/api/comms/${id}`);
      const cData = await cRes.json();

      // Load notes
      const nRes = await fetch(`/api/notes/${id}`);
      const nData = await nRes.json();

      // Build unified timeline
      const events: TimelineEvent[] = [];

      // Add comms
      for (const msg of (cData.timeline || [])) {
        events.push({
          id: msg.id,
          type: msg.type,
          channel: msg.channel,
          title: msg.type === "email" ? `Email #${msg.sequence}: ${msg.subject}` : `Text #${msg.sequence}`,
          body: msg.body,
          timestamp: msg.timestamp,
          meta: `To: ${msg.to}`,
        });
      }

      // Add notes
      for (const note of (nData.notes || [])) {
        events.push({
          id: note.id,
          type: "note",
          title: "Manual Note",
          body: note.text,
          timestamp: note.createdAt,
        });
      }

      // Add system events
      events.push({
        id: "created",
        type: "system",
        title: "Lead Scouted",
        body: `${pData.businessName} was found and added to the system.`,
        timestamp: pData.createdAt,
      });

      if (pData.generatedSiteUrl) {
        events.push({
          id: "generated",
          type: "system",
          title: "Website Generated",
          body: `Preview site created at ${pData.generatedSiteUrl}`,
          timestamp: pData.updatedAt,
        });
      }

      // Sort by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setTimeline(events);
    } catch {
      // error loading
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!noteInput.trim()) return;
    setSavingNote(true);
    try {
      await fetch(`/api/notes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteInput.trim() }),
      });
      setNoteInput("");
      loadData();
    } catch {
      alert("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });
      if (dismissReason) {
        await fetch(`/api/notes/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `DISMISSED: ${dismissReason}` }),
        });
      }
      router.push("/dashboard");
    } catch {
      alert("Failed to dismiss");
    }
  };

  const sendEmail = async () => {
    await fetch(`/api/email/send/${id}`, { method: "POST" });
    loadData();
  };

  const sendText = async () => {
    await fetch(`/api/sms/send/${id}`, { method: "POST" });
    loadData();
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading lead...</div>;
  }

  if (!prospect) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Lead not found</div>;
  }

  const config = CATEGORY_CONFIG[prospect.category];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-muted hover:text-foreground">&larr; Dashboard</a>
            <span className="text-border">/</span>
            <h1 className="font-bold">{prospect.businessName}</h1>
            <StatusBadge status={prospect.status} />
          </div>
          <div className="flex gap-2">
            {prospect.generatedSiteUrl && (
              <a href={prospect.generatedSiteUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-electric/10 text-blue-electric">
                Preview Site
              </a>
            )}
            <button
              onClick={() => setShowDismiss(!showDismiss)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              Dismiss
            </button>
          </div>
        </div>
      </header>

      {/* Dismiss panel */}
      {showDismiss && (
        <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-red-400 mb-1">Reason for dismissing (optional)</label>
              <input
                type="text"
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="e.g., Bad reviews, out of business, not a fit..."
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-foreground text-sm"
              />
            </div>
            <button onClick={handleDismiss} className="h-10 px-4 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium">
              Confirm Dismiss
            </button>
            <button onClick={() => setShowDismiss(false)} className="h-10 px-4 rounded-lg bg-surface border border-border text-muted text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full flex-1 flex gap-6 p-6">
        {/* Left: Timeline */}
        <div className="flex-1 flex flex-col">
          <h2 className="font-semibold text-lg mb-4">Relationship Timeline</h2>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {timeline.map((event) => (
              <div key={event.id} className={`flex ${event.type === "note" ? "justify-start" : event.type === "system" ? "justify-center" : "justify-end"}`}>
                {event.type === "system" ? (
                  <div className="px-4 py-2 rounded-full bg-surface-light border border-border text-xs text-muted">
                    {event.title} — {new Date(event.timestamp).toLocaleDateString()}
                  </div>
                ) : (
                  <div className={`max-w-[75%] ${event.type === "note" ? "" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        event.type === "email" ? "bg-green-500/10 text-green-400" :
                        event.type === "sms" ? "bg-blue-500/10 text-blue-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {event.type === "email" ? "Email" : event.type === "sms" ? "Text" : "Note"}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      event.type === "note"
                        ? "bg-yellow-500/10 border border-yellow-500/20 rounded-bl-sm"
                        : event.type === "email"
                          ? "bg-green-500/8 border border-green-500/15 rounded-br-sm"
                          : "bg-blue-500/8 border border-blue-500/15 rounded-br-sm"
                    }`}>
                      <p className="font-medium text-xs mb-1 opacity-70">{event.title}</p>
                      <p className="text-muted whitespace-pre-wrap">{event.body.length > 300 ? event.body.slice(0, 300) + "..." : event.body}</p>
                      {event.meta && <p className="text-xs text-muted/50 mt-2">{event.meta}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Add note / actions */}
          <div className="border-t border-border pt-4">
            <div className="flex gap-2 mb-3">
              <button onClick={sendEmail} className="h-9 px-4 rounded-lg bg-green-500/10 text-green-400 text-sm hover:bg-green-500/20">✉ Send Email</button>
              <button onClick={sendText} className="h-9 px-4 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20">💬 Send Text</button>
              <a href={`/api/instagram/${id}`} target="_blank" rel="noopener noreferrer"
                className="h-9 px-4 rounded-lg bg-purple-500/10 text-purple-400 text-sm flex items-center hover:bg-purple-500/20">IG DM</a>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
                placeholder="Add a note about this lead..."
                className="flex-1 h-10 px-4 rounded-lg bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50"
              />
              <button
                onClick={addNote}
                disabled={savingNote || !noteInput.trim()}
                className="h-10 px-5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-medium disabled:opacity-30"
              >
                {savingNote ? "..." : "Add Note"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Lead Info */}
        <div className="w-72 shrink-0 space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <h3 className="font-semibold text-sm mb-3">Business Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Category</span>
                <span style={{ color: config?.accentColor }}>{config?.label}</span>
              </div>
              {prospect.ownerName && (
                <div className="flex justify-between">
                  <span className="text-muted">Owner</span>
                  <span>{prospect.ownerName}</span>
                </div>
              )}
              {prospect.phone && (
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <span>{prospect.phone}</span>
                </div>
              )}
              {prospect.email && (
                <div className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="text-blue-electric text-xs">{prospect.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Location</span>
                <span className="text-right text-xs">{prospect.city}, {prospect.state}</span>
              </div>
              {prospect.googleRating && (
                <div className="flex justify-between">
                  <span className="text-muted">Rating</span>
                  <span className="text-yellow-400">{prospect.googleRating} ({prospect.reviewCount})</span>
                </div>
              )}
              {prospect.currentWebsite && (
                <div className="flex justify-between">
                  <span className="text-muted">Website</span>
                  <a href={prospect.currentWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-electric text-xs">View</a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Revenue Tier</span>
                <span className="capitalize">{prospect.estimatedRevenueTier}</span>
              </div>
            </div>
          </div>

          {/* Services found */}
          {prospect.scrapedData?.services && prospect.scrapedData.services.length > 0 && (
            <div className="p-4 rounded-xl bg-surface border border-border">
              <h3 className="font-semibold text-sm mb-3">Services</h3>
              <div className="space-y-1.5">
                {prospect.scrapedData.services.slice(0, 8).map((s, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted">{s.name}</span>
                    {s.price && <span style={{ color: config?.accentColor }}>{s.price}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Status */}
          <div className="p-4 rounded-xl bg-surface border border-border">
            <h3 className="font-semibold text-sm mb-3">Update Status</h3>
            <select
              value={prospect.status}
              onChange={async (e) => {
                await fetch(`/api/prospects/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: e.target.value }),
                });
                loadData();
              }}
              className="w-full h-9 px-3 rounded-lg bg-surface-light border border-border text-foreground text-sm"
            >
              <option value="scouted">Scouted</option>
              <option value="scraped">Scraped</option>
              <option value="generated">Generated</option>
              <option value="pending-review">Needs Review</option>
              <option value="approved">Approved</option>
              <option value="contacted">Contacted</option>
              <option value="responded">Responded</option>
              <option value="paid">Paid</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
