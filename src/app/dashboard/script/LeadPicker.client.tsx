"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Prospect } from "@/lib/types";

/**
 * LeadPicker — fallback view rendered on /dashboard/script when no
 * `?ids=` queue param is present. Lets Ben browse all inbound prospects,
 * tick the ones he wants to call, reorder them, then hit Start to drop
 * into the existing CallWorkspace flow.
 *
 * Persists the in-progress selection to localStorage so a half-built
 * queue survives reloads.
 */

const QUEUE_KEY = "bluejays.sales-portal.queue.v1";

export default function LeadPicker() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "called-recently" | "no-calls" | "interested">("all");
  // Sales portal is Madie's tool now. Ben can override with
  // ?mode=ben on the URL if he ever wants to use his original
  // cold-call Hormozi script — the toggle UI was removed since
  // Ben doesn't dial from this surface day-to-day anymore.
  const mode: "ben" | "madie" = "madie";

  // Load prospects.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((j: { prospects?: Prospect[] }) => {
        if (cancelled) return;
        setProspects(j.prospects ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate queue from localStorage so half-built selections survive reloads.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setSelected(arr);
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: string[]) => {
    setSelected(next);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggle = (id: string) => {
    persist(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const clear = () => persist([]);

  const start = () => {
    if (selected.length === 0) return;
    // Madie is the default — no mode flag needed in the URL.
    // Ben can override per-session via ?mode=ben if he wants his
    // original Hormozi cold-call script.
    const qs = `ids=${encodeURIComponent(selected.join(","))}&i=0`;
    router.push(`/dashboard/script?${qs}`);
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prospects.filter((p) => {
      const s = String(p.status ?? "").toLowerCase();
      if (filter === "interested" && !s.includes("interest")) return false;
      // "called-recently" / "no-calls" filters are status-substring proxies
      // until we wire actual partner_calls history into the prospect list.
      if (filter === "called-recently" && !s.includes("contact")) return false;
      if (filter === "no-calls" && (s.includes("contact") || s.includes("interest"))) return false;
      if (!q) return true;
      return (
        p.businessName?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) ||
        false
      );
    });
  }, [prospects, search, filter]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/dashboard"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              🎯 Madie&apos;s Sales Portal
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Pick the prospects to call. Hit Start to run the appointment-
              setter script — book Ben for the website + backend reveal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted">
              Queue
            </span>
            <span
              className={`text-2xl font-black tabular-nums ${
                selected.length > 0 ? "text-pink-400" : "text-muted"
              }`}
            >
              {selected.length}
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="ml-2 text-[10px] uppercase tracking-wider text-muted hover:text-rose-400"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={start}
              disabled={selected.length === 0}
              className="ml-3 h-9 px-4 rounded-lg bg-pink-500 hover:bg-pink-400 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Start calling →
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="rounded-xl border border-border bg-surface/40 p-3 mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business / owner / phone / city…"
            className="flex-1 min-w-[240px] h-9 px-3 rounded-lg bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-violet-500/50"
          />
          <div className="flex gap-1 flex-wrap">
            {(
              [
                { id: "all", label: "All" },
                { id: "no-calls", label: "Not contacted" },
                { id: "called-recently", label: "Recently called" },
                { id: "interested", label: "Interested" },
              ] as { id: typeof filter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`text-[11px] font-bold uppercase tracking-wider rounded-md px-2.5 py-1.5 border transition-colors ${
                  filter === f.id
                    ? "border-violet-400 bg-violet-500/15 text-violet-200"
                    : "border-border bg-background text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted text-sm">Loading leads…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
            <p className="text-sm font-bold text-foreground">No leads match</p>
            <p className="text-xs text-muted mt-1">
              Adjust filters or clear the search.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {visible.map((p) => {
              const isSel = selected.includes(p.id);
              const queuePos = isSel ? selected.indexOf(p.id) + 1 : null;
              return (
                <li
                  key={p.id}
                  className={`rounded-xl border px-3 py-2.5 transition-colors cursor-pointer ${
                    isSel
                      ? "border-violet-500/40 bg-violet-500/[0.07]"
                      : "border-border bg-surface/40 hover:border-white/15"
                  }`}
                  onClick={() => toggle(p.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSel
                          ? "bg-violet-500 border-violet-500"
                          : "border-slate-500"
                      }`}
                    >
                      {isSel && (
                        <span className="text-[10px] font-black text-white leading-none tabular-nums">
                          {queuePos}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground truncate">
                          {p.businessName ?? "(no name)"}
                        </p>
                        {p.ownerName && (
                          <span className="text-[11px] text-muted">· {p.ownerName}</span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-muted ml-auto">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-tight mt-0.5 truncate">
                        {[
                          p.phone,
                          p.email,
                          p.city && p.state ? `${p.city}, ${p.state}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "no contact info"}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/prospects/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-[11px] uppercase tracking-wider font-bold text-muted hover:text-foreground"
                    >
                      Open ↗
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
