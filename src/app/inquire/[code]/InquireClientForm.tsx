"use client";

import { useState } from "react";

interface Props {
  code: string;
  businessName: string;
  logoUrl: string | null;
  accentColor: string;
  programSlug: string;
  programLabel: string;
}

export default function InquireClientForm({
  code,
  businessName,
  logoUrl,
  accentColor,
  programSlug,
  programLabel,
}: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const friendlyProgram = programLabel || programSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const heading = friendlyProgram ? `Learn more about ${friendlyProgram}` : `Get in touch`;
  const subhead = friendlyProgram
    ? `Drop your info and ${businessName} will follow up with everything you need to know.`
    : `We'd love to hear from you. Drop a note and ${businessName} will get back to you soon.`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please add your name and email.");
      return;
    }
    setError("");
    setState("sending");
    try {
      const res = await fetch(`/api/inquire/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          programSlug,
          programLabel: friendlyProgram,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Send failed (${res.status})`);
      }
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: `linear-gradient(180deg, #0f172a 0%, #1a1a2e 40%, #0f172a 100%)`,
      }}
    >
      <div className="relative w-full max-w-xl">
        {/* Soft accent glow */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
          style={{ background: `${accentColor}25` }}
        />

        <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={`${businessName} logo`} className="w-12 h-12 rounded-xl object-contain bg-white p-1" />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                style={{ background: accentColor }}
              >
                {businessName.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: accentColor }}>
                {businessName}
              </p>
              {friendlyProgram && <p className="text-xs text-white/50">{friendlyProgram}</p>}
            </div>
          </div>

          {state === "sent" ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                style={{ background: `${accentColor}22`, border: `2px solid ${accentColor}` }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message sent</h2>
              <p className="text-white/60 leading-relaxed">
                {businessName} got your note and will reach out soon. Talk to you shortly.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{heading}</h1>
              <p className="text-white/60 mb-8 leading-relaxed">{subhead}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="name">Your name *</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="phone">Phone (optional)</label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5" htmlFor="message">What would you like to know?</label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={friendlyProgram ? `I'd like to learn more about ${friendlyProgram}…` : "Tell them anything you'd like them to know…"}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-sm text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="w-full h-12 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: accentColor, boxShadow: `0 8px 24px -8px ${accentColor}` }}
                >
                  {state === "sending" ? "Sending…" : "Send Message"}
                </button>
                <p className="text-xs text-center text-white/40">
                  Your message goes directly to {businessName}. No spam. No sales list.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
