"use client";

import { useState } from "react";

export default function PartnerLoginForm() {
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
      // Server sets the cookie; just navigate to the workspace.
      window.location.href = "/partners/work";
    } catch {
      setError("Network error. Try again.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="you@example.com"
          className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
          Partner code
        </span>
        <input
          type="text"
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="hector-r"
          className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono lowercase"
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
