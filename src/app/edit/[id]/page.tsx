"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

interface EditRequest {
  id: string;
  description: string;
  status: "pending" | "applied" | "rejected";
  createdAt: string;
}

export default function EditPage() {
  const params = useParams();
  const prospectId = params.id as string;
  const [businessName, setBusinessName] = useState("");
  const [input, setInput] = useState("");
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/prospects/${prospectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setBusinessName(data.businessName);
      })
      .catch(() => {});

    // Load existing edit requests
    fetch(`/api/edit/${prospectId}`)
      .then((r) => r.json())
      .then((data) => setRequests(data.requests || []))
      .catch(() => {});
  }, [prospectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [requests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/edit/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });
      const data = await res.json();
      setRequests((prev) => [...prev, data.request]);
      setInput("");
    } catch {
      alert("Failed to submit edit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div>
              <p className="font-bold text-sm">BlueJays Editor</p>
              <p className="text-muted text-xs">{businessName}</p>
            </div>
          </div>
          <a
            href={`/preview/${prospectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-electric/10 text-blue-electric"
          >
            View Site
          </a>
        </div>
      </header>

      {/* Instructions */}
      <div className="bg-surface-light border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <p className="text-sm text-muted">
            Describe changes in plain English. Examples: &ldquo;Change the phone number to 555-1234&rdquo;, &ldquo;Add a new service called Emergency Plumbing&rdquo;, &ldquo;Make the hero text bigger&rdquo;
          </p>
        </div>
      </div>

      {/* Edit History */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {requests.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              No edit requests yet. Describe a change below!
            </div>
          )}
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-surface border border-border"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm">{req.description}</p>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    req.status === "applied"
                      ? "bg-green-500/20 text-green-400"
                      : req.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <p className="text-muted text-xs mt-2">
                {new Date(req.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the change you want..."
              className="flex-1 h-11 px-4 rounded-xl bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 px-5 rounded-xl bg-blue-electric text-white text-sm font-medium disabled:opacity-30"
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
