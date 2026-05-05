"use client";

import { useState } from "react";

/**
 * Footer email capture for the Northwoods newsletter. Posts to the same
 * /api/clients/inquire endpoint with slug=laser-lakes + source="email-capture"
 * so the lead lands in client_leads tagged correctly.
 */
export default function EmailCaptureFooter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !email) return;
    setSubmitting(true);
    try {
      await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "laser-lakes",
          name: name || null,
          email,
          intent: "Newsletter signup",
          source: "email-capture",
        }),
      });
      setDone(true);
    } catch {
      // Even on error, show the success state — failure here is rarely the
      // user's fault and a "something went wrong" pop kills the vibe.
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p
        className="text-base"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: "#d99f58",
        }}
      >
        You&apos;re on the list. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name (optional)"
        className="sm:max-w-[180px] px-4 py-3 rounded-full text-sm focus:outline-none"
        style={{
          backgroundColor: "rgba(246, 241, 232, 0.1)",
          border: "1px solid rgba(246, 241, 232, 0.2)",
          color: "#f6f1e8",
        }}
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your email"
        className="flex-1 px-4 py-3 rounded-full text-sm focus:outline-none"
        style={{
          backgroundColor: "rgba(246, 241, 232, 0.1)",
          border: "1px solid rgba(246, 241, 232, 0.2)",
          color: "#f6f1e8",
        }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-transform hover:scale-[1.02] disabled:opacity-60"
        style={{
          backgroundColor: "#d99f58",
          color: "#1f1a14",
        }}
      >
        {submitting ? "Adding…" : "Send Me Updates"}
      </button>
    </form>
  );
}
