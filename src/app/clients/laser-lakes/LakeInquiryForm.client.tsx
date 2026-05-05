"use client";

import { useState } from "react";

/**
 * Custom-map inquiry form. Posts to the existing /api/clients/inquire
 * endpoint with slug=laser-lakes. Lands as a client_lead with intent
 * "Custom Map Inquiry · {lake name}". Nate gets an email + SMS alert.
 */
export default function LakeInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lake, setLake] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [size, setSize] = useState("18x24");
  const [finish, setFinish] = useState("natural");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "laser-lakes",
          name,
          email,
          phone,
          intent: `Custom Map Inquiry · ${lake || "(unspecified lake)"}`,
          source: "lp-custom-map",
          message: notes || null,
          extra: {
            lake,
            family_name: familyName,
            size,
            finish,
          },
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Submit failed (${res.status})`);
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        className="rounded-lg p-6 text-center"
        style={{ backgroundColor: "#ebe2d2" }}
      >
        <p
          className="text-2xl mb-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#5d4225",
          }}
        >
          Inquiry sent
        </p>
        <p className="text-sm opacity-80 leading-relaxed">
          Nate will reply personally to {email} within a day. He&apos;ll start
          a sketch of <strong>{lake}</strong> and send you the preview before
          any wood gets cut.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors";
  const inputStyle: React.CSSProperties = {
    border: "1px solid rgba(43, 36, 28, 0.18)",
    color: "#2b241c",
  };
  const labelClass =
    "block text-[11px] uppercase tracking-widest font-bold mb-1.5 opacity-70";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Your name *</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="First and last"
          />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="you@cabin.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Lake name *</label>
          <input
            required
            type="text"
            value={lake}
            onChange={(e) => setLake(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="e.g. Burntside, Ten Mile, Mille Lacs"
          />
        </div>
        <div>
          <label className={labelClass}>Family name (engraved)</label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="The Hennesseys · Est. 1972"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="12x16">12&quot; × 16&quot; · $325</option>
            <option value="18x24">18&quot; × 24&quot; · $475</option>
            <option value="24x36">24&quot; × 36&quot; · $650</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Finish</label>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="natural">Natural birch</option>
            <option value="walnut">Walnut stain</option>
            <option value="espresso">Espresso</option>
            <option value="whitewash">Whitewash</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="555 · 123 · 4567"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Anything else Nate should know?</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
          style={inputStyle}
          placeholder="Need it by a specific date? A particular spot you want highlighted? An island, a dock, a name carved in the back?"
        />
      </div>

      {err && (
        <div className="rounded-md p-3 text-sm" style={{ backgroundColor: "#fde7e3", color: "#7a1f0e" }}>
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full text-sm font-bold uppercase tracking-widest px-7 py-4 rounded-full transition-transform hover:scale-[1.01] disabled:opacity-60"
        style={{
          backgroundColor: "#2b241c",
          color: "#f6f1e8",
        }}
      >
        {submitting ? "Sending…" : "Send My Inquiry →"}
      </button>
      <p className="text-[11px] opacity-60 text-center leading-relaxed">
        No deposit until you&apos;ve approved the sketch. Nate replies within a
        day.
      </p>
    </form>
  );
}
