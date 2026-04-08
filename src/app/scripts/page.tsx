"use client";

import { useState, useEffect } from "react";
import type { Prospect } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface CommsEntry {
  id: string;
  type: "email" | "sms";
  channel: string;
  to: string;
  subject: string;
  body: string;
  sequence: number;
  timestamp: string;
}

export default function ConversationsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [comms, setComms] = useState<CommsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [commsLoading, setCommsLoading] = useState(false);
  const [commsError, setCommsError] = useState<string | null>(null);
  const [simInput, setSimInput] = useState("");
  const [aiResponse, setAiResponse] = useState<{
    reply?: string;
    escalate: boolean;
    escalateReason?: string;
    sentiment: string;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((data) => {
        // Show prospects that have been contacted or responded
        const active = (data.prospects as Prospect[]).filter((p) =>
          ["contacted", "responded", "approved", "generated", "pending-review"].includes(p.status)
        );
        setProspects(active);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadComms = async (prospect: Prospect) => {
    setSelected(prospect);
    setAiResponse(null);
    setSimInput("");
    setCommsLoading(true);
    setCommsError(null);

    const normalizeTimeline = (timeline: unknown[]): CommsEntry[] =>
      timeline.map((entry, index) => {
        const record = entry as Partial<CommsEntry> & { sentAt?: string };
        return {
          id: record.id || `${prospect.id}-${index}`,
          type: record.type === "sms" ? "sms" : "email",
          channel: record.channel || (record.type === "sms" ? "SMS" : "Email"),
          to: record.to || "",
          subject: record.subject || "",
          body: record.body || "",
          sequence: record.sequence || index + 1,
          timestamp: record.timestamp || record.sentAt || new Date().toISOString(),
        };
      });

    try {
      const res = await fetch(`/api/comms/${prospect.id}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data.timeline)) {
        setComms(normalizeTimeline(data.timeline));
        return;
      }

      const [emailRes, smsRes] = await Promise.all([
        fetch(`/api/email/history/${prospect.id}`),
        fetch(`/api/sms/history/${prospect.id}`),
      ]);
      const emailData = await emailRes.json();
      const smsData = await smsRes.json();

      const fallbackTimeline = [
        ...((emailData.emails || []) as Array<Record<string, unknown>>).map((email, index) => ({
          id: String(email.id || `${prospect.id}-email-${index}`),
          type: "email" as const,
          channel: "Email",
          to: String(email.to || email.to_address || ""),
          subject: String(email.subject || ""),
          body: String(email.body || ""),
          sequence: Number(email.sequence || index + 1),
          timestamp: String(email.sentAt || email.sent_at || new Date().toISOString()),
        })),
        ...((smsData.messages || []) as Array<Record<string, unknown>>).map((sms, index) => ({
          id: String(sms.id || `${prospect.id}-sms-${index}`),
          type: "sms" as const,
          channel: "SMS",
          to: String(sms.to || sms.to_number || ""),
          subject: "",
          body: String(sms.body || ""),
          sequence: Number(sms.sequence || index + 1),
          timestamp: String(sms.sentAt || sms.sent_at || new Date().toISOString()),
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setComms(fallbackTimeline);
      if (!emailRes.ok && !smsRes.ok) {
        setCommsError(data.error || "Could not load conversation history.");
      }
    } catch {
      setComms([]);
      setCommsError("Could not load conversation history.");
    } finally {
      setCommsLoading(false);
    }
  };

  const simulateReply = async () => {
    if (!selected || !simInput.trim()) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/ai-respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: selected.id,
          from: selected.email,
          subject: "Re: Your new website",
          emailBody: simInput,
        }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch {
      setAiResponse({ escalate: true, escalateReason: "Error processing", sentiment: "neutral" });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <h1 className="text-xl font-bold">AI Conversations</h1>
          </div>
          <a href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
            Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Lead List */}
        <div className="w-80 border-r border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted">
              {prospects.length} active lead{prospects.length !== 1 ? "s" : ""}
            </p>
          </div>
          {loading && <p className="p-4 text-muted text-sm">Loading...</p>}
          {prospects.map((p) => {
            const config = CATEGORY_CONFIG[p.category];
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => loadComms(p)}
                className={`w-full text-left p-4 border-b border-border/50 hover:bg-surface-light transition-colors ${
                  isSelected ? "bg-surface-light border-l-2 border-l-blue-electric" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{p.businessName}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ backgroundColor: config?.accentColor + "20", color: config?.accentColor }}
                  >
                    {config?.label}
                  </span>
                  <span className="text-xs text-muted">{p.city}, {p.state}</span>
                </div>
                {p.phone && <p className="text-xs text-muted mt-1">{p.phone}</p>}
              </button>
            );
          })}
          {!loading && prospects.length === 0 && (
            <div className="p-8 text-center text-muted text-sm">
              No active conversations. Scout and contact some businesses first!
            </div>
          )}
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted">
              <div className="text-center">
                <p className="text-lg mb-2">Select a lead to view conversation</p>
                <p className="text-sm">See all emails, texts, and AI responses in one place</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg">{selected.businessName}</h2>
                    <p className="text-sm text-muted">
                      {selected.ownerName && `${selected.ownerName} — `}
                      {selected.email || "No email"} — {selected.phone || "No phone"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selected.generatedSiteUrl && (
                      <a
                        href={selected.generatedSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-electric/10 text-blue-electric"
                      >
                        View Site
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {commsLoading && (
                  <p className="text-center text-muted text-sm py-8">Loading conversation history...</p>
                )}
                {!commsLoading && commsError && (
                  <p className="text-center text-red-400 text-sm py-4">{commsError}</p>
                )}
                {!commsLoading && comms.length === 0 && (
                  <p className="text-center text-muted text-sm py-8">
                    No messages sent yet. Use the dashboard to send emails or texts.
                  </p>
                )}
                {comms.map((msg) => (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[70%]">
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          msg.type === "email" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {msg.channel} #{msg.sequence}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl rounded-br-sm bg-blue-electric/10 border border-blue-electric/20">
                        {msg.subject && <p className="text-xs font-semibold text-blue-electric mb-1">{msg.subject}</p>}
                        <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Response Display */}
                {aiResponse && (
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="max-w-[70%] p-4 rounded-2xl rounded-bl-sm bg-surface-light border border-border">
                        <p className="text-xs font-semibold text-muted mb-1">Simulated prospect reply:</p>
                        <p className="text-sm whitespace-pre-wrap">{simInput}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            aiResponse.sentiment === "positive" ? "bg-green-500/10 text-green-400" :
                            aiResponse.sentiment === "negative" || aiResponse.sentiment === "angry" ? "bg-red-500/10 text-red-400" :
                            "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            AI — {aiResponse.sentiment}
                          </span>
                          {aiResponse.escalate && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
                              ESCALATE: {aiResponse.escalateReason}
                            </span>
                          )}
                        </div>
                        <div className="p-4 rounded-2xl rounded-br-sm bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-xs font-semibold text-emerald-400 mb-1">AI would reply:</p>
                          <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">
                            {aiResponse.reply || "(AI chose not to reply — escalated to you)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulate Reply */}
              <div className="border-t border-border bg-surface p-4">
                <p className="text-xs text-muted mb-2">Simulate a prospect reply to test AI response:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") simulateReply(); }}
                    placeholder='e.g. "How much does this cost?" or "I love it!"'
                    className="flex-1 h-10 px-4 rounded-lg bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50"
                  />
                  <button
                    onClick={simulateReply}
                    disabled={simulating || !simInput.trim()}
                    className="h-10 px-5 rounded-lg bg-blue-electric text-white text-sm font-medium disabled:opacity-30"
                  >
                    {simulating ? "..." : "Test AI"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
