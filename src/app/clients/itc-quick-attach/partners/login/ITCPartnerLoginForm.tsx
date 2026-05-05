"use client";

import { useState } from "react";

/**
 * ITC partner login form. Same backend (/api/partners/login —
 * single shared partners table), but redirects to the ITC workspace
 * instead of /partners/work, and uses ITC amber branding.
 */
export default function ITCPartnerLoginForm() {
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || "").trim().toLowerCase(),
      code: String(fd.get("code") || "").trim().toLowerCase(),
    };

    try {
      const res = await fetch("/api/partners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setState("error");
        return;
      }
      // Server sets the cookie; navigate to the ITC workspace
      // (NOT /partners/work — ITC reps stay inside the ITC pathway).
      window.location.href = "/clients/itc-quick-attach/partners/work";
    } catch {
      setError("Network error. Try again.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-amber-300/70 font-semibold mb-1.5">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="you@itcpartner.com"
          className="w-full rounded-md bg-[#0a0a0a] border border-amber-500/20 px-4 py-3 text-base text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-amber-300/70 font-semibold mb-1.5">
          Partner code
        </span>
        <input
          type="text"
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="your-partner-code"
          className="w-full rounded-md bg-[#0a0a0a] border border-amber-500/20 px-4 py-3 text-base text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono lowercase"
        />
      </label>

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 text-base font-bold text-amber-950 shadow-lg transition-colors"
      >
        {state === "submitting" ? "Logging in…" : "Log in →"}
      </button>
    </form>
  );
}
