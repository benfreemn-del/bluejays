"use client";

import { useState } from "react";

type State = "idle" | "uploading" | "success" | "error";

const MAX_BYTES = 5 * 1024 * 1024;

export default function W9UploadForm({ code }: { code: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function pickFile(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF.");
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Max 5 MB.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || state === "uploading") return;
    setState("uploading");
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/partners/${code}/upload-w9`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Upload failed. Try again.");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setError("Network error. Try again or email ben@bluejayportfolio.com.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-7 h-7 text-emerald-300"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">W-9 received</h2>
        <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
          Ben got an alert and will confirm receipt within 24 hours.
          Your commissions can be paid the moment your first deal closes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
          Your W-9 (PDF, max 5&nbsp;MB)
        </span>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          required
          className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-amber-950 hover:file:bg-amber-400 file:cursor-pointer"
        />
        {file && (
          <span className="block text-xs text-slate-400 mt-2">
            Selected: <span className="font-mono">{file.name}</span> (
            {Math.round(file.size / 1024)} KB)
          </span>
        )}
      </label>

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || state === "uploading"}
        className="w-full rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 text-base font-bold text-amber-950 shadow-lg transition-colors"
      >
        {state === "uploading" ? "Uploading…" : "Upload W-9 →"}
      </button>
      <p className="text-xs text-center text-slate-500">
        Stored encrypted in BlueJays&apos; database. Only Ben can access
        it, and only for 1099 filing.
      </p>
    </form>
  );
}
