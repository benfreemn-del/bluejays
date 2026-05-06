"use client";

/**
 * Partner application form — modal launched from the "Apply" CTAs on
 * the partners page. Replaces the mailto: link so applications land in
 * client_leads (zenith-sports, source=partner-affiliate-form) and flow
 * into the per-audience drip + dashboard alongside everything else.
 *
 * Lead routing:
 *   role "coach" / "camp" → audience: coach (existing detectAudience rule)
 *   role "club"           → audience: club
 *   role "parent"         → audience: parent
 */

import { useState } from "react";

type Role = "coach" | "club" | "camp" | "parent";

const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: "coach", label: "Coach", sub: "$25/ball + $100/coaching package" },
  { id: "club", label: "Club / DOC", sub: "Wholesale margin built in" },
  { id: "camp", label: "Camp director", sub: "Co-branded balls for registration" },
  { id: "parent", label: "Parent", sub: "$20/referral, no quotas" },
];

export default function PartnerApplyForm({
  trigger,
  className,
}: {
  trigger: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [org, setOrg] = useState("");
  const [why, setWhy] = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit =
    name.trim().length >= 2 && validEmail && role !== "" && org.trim().length >= 2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "zenith-sports",
          name,
          email,
          phone: phone || undefined,
          intent: "Partner Application",
          source: "partner-affiliate-form",
          role, // detectAudience() reads this → audience: coach / club / parent
          partner_role: role, // duplicated explicit field for the dashboard
          organization: org,
          why_zenith: why,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!j.ok) throw new Error(j.error || "Couldn't submit — try again?");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setOpen(false);
    // Reset on close after a short tick so the modal close animation
    // doesn't show a wiped form.
    setTimeout(() => {
      setSuccess(false);
      setError(null);
    }, 200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur"
          onClick={close}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-lime-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-lime-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>

            {!success ? (
              <>
                <p className="text-[11px] tracking-[0.32em] uppercase font-bold text-lime-300 mb-2">
                  Zenith partner application
                </p>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                  Tell us about you.
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Philip reviews every application personally — usually a reply
                  the same day.
                </p>

                <form onSubmit={submit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Your name *">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Phone (optional)">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Email *">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className={inputCls}
                    />
                  </Field>

                  <Field label="I'm a *">
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => setRole(r.id)}
                          className={`text-left rounded-lg border-2 px-3 py-2 transition ${
                            role === r.id
                              ? "border-lime-300 bg-lime-300/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/75 hover:border-lime-300/30"
                          }`}
                        >
                          <div className="text-sm font-bold">{r.label}</div>
                          <div className="text-[11px] text-white/50">
                            {r.sub}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label={role === "parent" ? "City *" : "Club / org name *"}>
                    <input
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder={
                        role === "parent"
                          ? "Sammamish, WA"
                          : "ECNL Forward Soccer Club"
                      }
                      required
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Why Zenith? (optional, 1-2 sentences)">
                    <textarea
                      value={why}
                      onChange={(e) => setWhy(e.target.value)}
                      rows={3}
                      placeholder="My U12 girls love the ball — I want a way to put extras in their hands."
                      className={`${inputCls} resize-none`}
                    />
                  </Field>

                  {error && (
                    <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="w-full rounded-md bg-lime-400 hover:bg-lime-300 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider transition"
                  >
                    {submitting ? "Sending…" : "Send my application →"}
                  </button>
                  <p className="text-[10px] text-white/35 text-center">
                    No spam. Philip reviews every application personally.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">⚽</div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2">
                  You&apos;re on the list.
                </h2>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thanks {name.split(" ")[0]} — Philip will reach out at{" "}
                  <span className="text-lime-300">{email}</span> within 24
                  hours with your partner kit + first script library access.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 rounded-md bg-lime-400 hover:bg-lime-300 text-slate-950 px-6 py-3 text-sm font-bold transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  "w-full rounded-md bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/20 outline-none transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/55 block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
