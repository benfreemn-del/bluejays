"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Prospect } from "@/lib/types";
import MadieProductivity from "@/components/dashboard/MadieProductivity";
import WinLossSalesBanner from "@/components/dashboard/WinLossSalesBanner";
import MadieRaceTrack from "@/components/dashboard/MadieRaceTrack";
import { useRole } from "@/lib/use-role";
import { getProspectClock, getOpenStatus } from "@/lib/business-hours";

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
// Per-browser hide list. The Remove button on each lead row pushes the
// prospect ID here; the picker filter excludes any IDs in this set.
// Persisted to localStorage so the dismiss survives reloads.
const DISMISSED_KEY = "bluejays.sales-portal.dismissed.v1";
// Undo stack — most recent removal at the END (LIFO). The Undo button
// pops the last entry, removes it from `dismissed`, and the lead reappears.
// Persisted alongside `dismissed` so undo works across reloads too.
const UNDO_STACK_KEY = "bluejays.sales-portal.undo.v1";

export default function LeadPicker() {
  const router = useRouter();
  const role = useRole();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  // Sales-side dismiss state. `dismissed` = currently-hidden IDs.
  // `undoStack` = history of removals so the Undo button can restore the
  // last one (and the one before that, etc — unlimited undo levels).
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  // Floating toast confirming the last action (auto-clears after ~2.5s).
  const [toast, setToast] = useState<string | null>(null);
  // Filter chips along the top of the picker. the caller controls these to
  // narrow the list of prospects to call today.
  //   "all"             — every prospect, no filter
  //   "no-calls"        — never been contacted (good for cold-call queues)
  //   "called-recently" — already in some kind of contact loop
  //   "interested"      — high-intent statuses (responded / engaged / interested)
  //   "inbound"         — submitted /get-started or /audit themselves
  //   "cold"            — source='scouted' (from auto-scout, NOT inbound)
  //   "fullsystem"      — pricingTier='fullsystem' (Full System / agency-replacement)
  //   "mfg"             — lookalikeCategory IS NOT NULL (manufacturer cold lookalike)
  const [filter, setFilter] = useState<
    | "all"
    | "called-recently"
    | "no-calls"
    | "interested"
    | "inbound"
    | "cold"
    | "fullsystem"
    | "mfg"
  >("all");
  // Industry / category drop-down — auto-populated from the distinct
  // category values present in the loaded prospects.
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Sort dropdown — the caller picks how the picker is ordered.
  // Default sort for sales reps is "fit" so their priority leads
  // bubble to the top instead of being buried under newer junk.
  // Verified live 2026-05-12 — Madie's queue surfaced weak event-
  // planning prospects first because they were newest. Defaulting to
  // hormozi-fit-desc fixes the triage flow she actually cares about.
  // (role is already declared at the top of this component — reuse.)
  // useRole() resolves async (reads document.cookie in useEffect after
  // mount), so on first render role="owner" and useState locks in
  // "newest". The useEffect below flips to "fit" once role hydrates
  // to "sales" — guarded by `userTouchedSort` so we never overwrite a
  // manual choice after the user picks something themselves.
  const [sortBy, setSortBy] = useState<
    "fit" | "newest" | "oldest" | "category" | "source" | "status"
  >("newest");
  const [userTouchedSort, setUserTouchedSort] = useState(false);
  useEffect(() => {
    if (userTouchedSort) return;
    if (role === "sales") setSortBy("fit");
    // role="owner" → leave default ("newest")
  }, [role, userTouchedSort]);
  // Sales portal is this tool now. Ben can override with
  // ?mode=ben on the URL if he ever wants to use his original
  // cold-call Hormozi script — the toggle UI was removed since
  // Ben doesn't dial from this surface day-to-day anymore.
  const mode: "ben" | "partner" = "partner";

  // Active-client business-name set. Used to filter Ben's existing
  // clients out of Madie's cold-call pool — e.g. don't let her dial
  // Luke at Olympic Inspections or Philip at Zenith Sports as if
  // they were prospects. Hydrates once on mount.
  const [activeClientNames, setActiveClientNames] = useState<Set<string>>(
    new Set(),
  );

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

  // Hydrate active-client filter list (slugs + display names from
  // client_owners). Lowercased for fuzzy substring match against
  // prospect business names.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/active-clients", { credentials: "include" })
      .then((r) => r.json())
      .then(
        (j: {
          ok: boolean;
          clients?: Array<{ slug: string; name: string | null }>;
        }) => {
          if (cancelled || !j.ok || !j.clients) return;
          const set = new Set<string>();
          for (const c of j.clients) {
            const slugTokens = c.slug.toLowerCase().split("-").filter(Boolean);
            const nameTokens = (c.name || "")
              .toLowerCase()
              .split(/[\s·]+/)
              .filter((t) => t.length >= 4);
            // Anchor strings — at least 4 chars, drops common stop words
            for (const t of [...slugTokens, ...nameTokens]) {
              if (t.length >= 4) set.add(t);
            }
            set.add(c.slug.toLowerCase());
          }
          setActiveClientNames(set);
        },
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate queue + dismiss state from localStorage so half-built
  // selections AND dismiss history survive reloads — for OWNER role.
  // For SALES role (Madie): wipe dismissed/undo on every refresh so
  // her picker starts clean every session. Per Ben spec 2026-05-09:
  // dismissed-leads-from-yesterday shouldn't carry into today's
  // dialing block.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setSelected(arr);
      }
      if (role === "sales") {
        // Sales role — clear stale dismiss/undo on each fresh page load.
        try {
          localStorage.removeItem(DISMISSED_KEY);
          localStorage.removeItem(UNDO_STACK_KEY);
        } catch {
          // ignore
        }
        setDismissed([]);
        setUndoStack([]);
      } else {
        const rawD = localStorage.getItem(DISMISSED_KEY);
        if (rawD) {
          const arr = JSON.parse(rawD) as string[];
          if (Array.isArray(arr)) setDismissed(arr);
        }
        const rawU = localStorage.getItem(UNDO_STACK_KEY);
        if (rawU) {
          const arr = JSON.parse(rawU) as string[];
          if (Array.isArray(arr)) setUndoStack(arr);
        }
      }
    } catch {
      // ignore
    }
  }, [role]);

  const persist = (next: string[]) => {
    setSelected(next);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Persist helpers for the dismiss/undo lists.
  const persistDismissed = (next: string[]) => {
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };
  const persistUndoStack = (next: string[]) => {
    setUndoStack(next);
    try {
      localStorage.setItem(UNDO_STACK_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Auto-clear toast after 2.5s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = (id: string) => {
    persist(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const clear = () => persist([]);

  // === Remove / Undo ===
  // Remove a lead from the picker. Pushes the ID to the undo stack so the
  // sales rep can hit Undo if they fat-finger a removal. Also drops the
  // lead from the selected queue if it was already in line to be called.
  // The prospect record itself is NEVER touched — Remove is per-browser
  // hide only (localStorage-scoped). Other surfaces (admin dashboard,
  // scout, funnel) still see the lead. Use the prospect detail page +
  // status flip for permanent dismissal.
  const removeFromList = (id: string, label?: string) => {
    if (dismissed.includes(id)) return; // already hidden, no-op
    persistDismissed([...dismissed, id]);
    persistUndoStack([...undoStack, id]);
    if (selected.includes(id)) {
      persist(selected.filter((x) => x !== id));
    }
    setToast(
      label
        ? `Removed "${label}" from the list. Hit Undo to restore.`
        : `Removed lead. Hit Undo to restore.`,
    );
  };

  // Pop the most recent removal off the undo stack and unhide that lead.
  // Idempotent + safe to call when the stack is empty (no-op).
  const undoRemove = () => {
    if (undoStack.length === 0) return;
    const lastId = undoStack[undoStack.length - 1];
    persistUndoStack(undoStack.slice(0, -1));
    persistDismissed(dismissed.filter((id) => id !== lastId));
    const restored = prospects.find((p) => p.id === lastId);
    setToast(
      restored?.businessName
        ? `Restored "${restored.businessName}".`
        : `Restored last removed lead.`,
    );
  };

  // Restore every dismissed lead at once. Wipes both lists.
  const restoreAllDismissed = () => {
    if (dismissed.length === 0) return;
    const count = dismissed.length;
    persistDismissed([]);
    persistUndoStack([]);
    setToast(`Restored all ${count} removed leads.`);
  };

  const start = () => {
    if (selected.length === 0) return;
    // the caller is the default — no mode flag needed in the URL.
    // Ben can override per-session via ?mode=ben if he wants his
    // original Hormozi cold-call script.
    const qs = `ids=${encodeURIComponent(selected.join(","))}&i=0`;
    router.push(`/dashboard/script?${qs}`);
  };

  // Distinct categories present in the loaded prospects — feeds the
  // category drop-down. Memoized so picker stays cheap as queue grows.
  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of prospects) {
      if (p.category) set.add(String(p.category));
    }
    return Array.from(set).sort();
  }, [prospects]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dismissedSet = new Set(dismissed);
    const filtered = prospects.filter((p) => {
      // Drop sales-portal-dismissed leads (local hide list — see
      // Remove/Undo handlers above). The prospect record itself is
      // unaffected; this is per-browser scope only.
      if (dismissedSet.has(p.id)) return false;

      const s = String(p.status ?? "").toLowerCase();

      // Drop active clients from the call queue. If we've already
      // paid them out / built them a custom site / they have an active
      // AI System sub, calling them again as a sales-prospect would
      // burn the relationship. Locked-in 2026-05-06 by Ben.
      //
      // Conditions that mark a prospect as "already a client":
      //   - status='paid' — they bought, the relationship is sales-closed
      //   - status='live' OR siteLiveAt set — their site is live on a domain
      //   - status='deployed' — site shipped, awaiting domain transfer
      //   - status='dns_transfer' — DNS migration in progress
      //   - customSiteUrl present — bespoke / custom-tier client built
      //   - pricingTier='fullsystem' AND status='paid' — AI Package buyer
      const isAlreadyClient =
        s === "paid" ||
        s === "live" ||
        s === "deployed" ||
        s === "dns_transfer" ||
        !!p.siteLiveAt ||
        !!p.customSiteUrl;
      if (isAlreadyClient) return false;

      // Sales-role only: also drop prospects whose business name
      // matches an active client_owners slug or display name. Catches
      // the cases where the prospect record never got status='paid'
      // stamped but is in fact a live BlueJays client (manual
      // pipeline drift). Keeps Madie from cold-calling Luke / Philip /
      // any other actual customer.
      if (role === "sales" && activeClientNames.size > 0) {
        const biz = (p.businessName ?? "").toLowerCase();
        for (const token of activeClientNames) {
          if (biz.includes(token)) return false;
        }
      }

      // Lead-type / status filter chips
      if (filter === "interested" && !s.includes("interest") && !s.includes("respond") && !s.includes("engage")) return false;
      // "called-recently" / "no-calls" filters are status-substring proxies
      // until we wire actual partner_calls history into the prospect list.
      if (filter === "called-recently" && !s.includes("contact")) return false;
      if (filter === "no-calls" && (s.includes("contact") || s.includes("interest"))) return false;
      // Inbound leads are warm — they came IN to Ben via the audit /
      // get-started form. Those are Ben's to close personally; Madie's
      // queue is cold-dial-only. Hide every inbound prospect from her
      // picker entirely (she can't filter them in or accidentally see
      // them in 'all').
      if (role === "sales" && p.source === "inbound") return false;

      // Source-based + tier-based filters (the caller 2026-05-06):
      if (filter === "inbound" && p.source !== "inbound") return false;
      if (filter === "cold" && p.source !== "scouted") return false;
      if (filter === "fullsystem" && p.pricingTier !== "fullsystem") return false;
      if (filter === "mfg" && !p.lookalikeCategory) return false;

      // Category dropdown filter (industry)
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;

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

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "fit":
        // Hormozi-fit score desc, then newest within same score. Nulls
        // (unscored prospects) fall to the bottom — they shouldn't
        // beat any scored prospect.
        sorted.sort((a, b) => {
          const sa = a.hormoziFitScore ?? -1;
          const sb = b.hormoziFitScore ?? -1;
          if (sb !== sa) return sb - sa;
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        });
        break;
      case "newest":
        sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        break;
      case "oldest":
        sorted.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
        break;
      case "category":
        sorted.sort((a, b) => String(a.category || "").localeCompare(String(b.category || "")));
        break;
      case "source":
        sorted.sort((a, b) => String(a.source || "scouted").localeCompare(String(b.source || "scouted")));
        break;
      case "status":
        sorted.sort((a, b) => String(a.status || "").localeCompare(String(b.status || "")));
        break;
    }
    return sorted;
  }, [
    prospects,
    search,
    filter,
    categoryFilter,
    sortBy,
    dismissed,
    role,
    activeClientNames,
  ]);

  // Pagination — 50 rows per page (CLAUDE.md rule: never load >100
  // list rows at once without page breaks). Resets to page 0 whenever
  // any filter changes so the user lands on the first page of new
  // results.
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage(0);
  }, [search, filter, categoryFilter, sortBy]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedVisible = useMemo(
    () => visible.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [visible, safePage],
  );

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
              🎯 Sales Portal
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Pick the prospects to call. Hit Start to run the appointment-
              setter script — book Ben for the website + backend reveal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo last removal — appears whenever the undo stack has
                anything in it. Counter shows how many removals can be
                undone. Stack is LIFO (most recent first), persisted to
                localStorage so undo works across reloads + crashes. */}
            <button
              type="button"
              onClick={undoRemove}
              disabled={undoStack.length === 0}
              className="h-9 px-3 rounded-lg border border-border bg-background hover:bg-surface text-amber-300 text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={
                undoStack.length === 0
                  ? "Nothing to undo"
                  : `Restore the last removed lead (${undoStack.length} in undo history)`
              }
            >
              ↶ Undo{undoStack.length > 0 ? ` (${undoStack.length})` : ""}
            </button>
            {/* Restore-all-dismissed — only appears when at least one
                lead is currently hidden. Wipes both the dismiss list
                and the undo stack. Useful if a sales rep wants to
                start over with a clean view. */}
            {dismissed.length > 0 && (
              <button
                type="button"
                onClick={restoreAllDismissed}
                className="h-9 px-3 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] hover:bg-rose-500/[0.10] text-rose-300 text-xs font-bold uppercase tracking-wider transition-colors"
                title="Restore every lead currently hidden"
              >
                Restore all ({dismissed.length})
              </button>
            )}
            <span className="text-[11px] uppercase tracking-wider text-muted ml-2">
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

      {/* MADIE-ONLY: race-track welcome panel — the 6-lap progression
          UI Ben designed. Shows on every page load for sales role
          (Madie). Frames her growth as a race; lets her see what's
          unlocked, what's next, and today's mission. Owner role
          (Ben) skips this — he sees just the productivity strip. */}
      {role === "sales" && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <MadieRaceTrack />
        </div>
      )}

      {/* Madie productivity strip — persistent pace tracker.
          Per dashboard review 2026-05-08 #1: the #1 missing surface
          in the system. Madie sees her own pace as she dials so the
          100-calls / 3-meetings target is always visible. Auto-
          refreshes every 60 seconds via /api/madie/today. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <MadieProductivity mode="strip" />
        </div>
        <Link
          href="/dashboard/script/portfolio"
          className="text-[11px] tracking-wider uppercase font-bold text-violet-300 hover:text-white border border-violet-700/50 px-3 py-2 rounded whitespace-nowrap"
          title="Bespoke client showcase URLs · copy-to-clipboard for cold outreach"
        >
          📁 Portfolio
        </Link>
      </div>

      {/* Win-Loss feedback banner — top-of-week objection + script
          tweak. Per dashboard review #4: closes the gap where loss
          reasons were captured but never surfaced to the operator
          who needs them. Hides automatically when no losses logged
          this week. Dismissible per-session. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
        <WinLossSalesBanner />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Filters — search + lead-type chips + category dropdown + sort */}
        <div className="rounded-xl border border-border bg-surface/40 p-3 mb-4 space-y-2">
          {/* Top row: search + sort */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business / owner / phone / city…"
              className="flex-1 min-w-[240px] h-9 px-3 rounded-lg bg-background border border-border text-sm placeholder:text-muted focus:outline-none focus:border-pink-500/50"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-pink-500/50"
              title="Filter by industry"
            >
              <option value="all">All industries</option>
              {distinctCategories.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/-/g, " ")}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setUserTouchedSort(true);
                setSortBy(e.target.value as typeof sortBy);
              }}
              className="h-9 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-pink-500/50"
              title="Sort the list"
            >
              <option value="fit">🔥 Sort: Best fit</option>
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="category">Sort: Category</option>
              <option value="source">Sort: Source</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
          {/* Bottom row: lead-type filter chips. Pink/purple chips visually
              match the row treatment so the caller can connect "show me MFG"
              with "the pink rows". */}
          <div className="flex gap-1 flex-wrap">
            {(
              ([
                { id: "all", label: "All", color: "violet" },
                // Inbound chip hidden for sales role — Madie's queue is
                // cold-only by policy (Ben closes warm inbounds himself).
                ...(role === "sales"
                  ? []
                  : [{ id: "inbound", label: "Inbound", color: "amber" }]),
                { id: "cold", label: "Cold scout", color: "slate" },
                { id: "mfg", label: "MFG", color: "pink" },
                { id: "fullsystem", label: "Agency $10K", color: "purple" },
                { id: "no-calls", label: "Not contacted", color: "slate" },
                { id: "called-recently", label: "Recently called", color: "slate" },
                { id: "interested", label: "Interested", color: "emerald" },
              ]) as { id: typeof filter; label: string; color: string }[]
            ).map((f) => {
              const active = filter === f.id;
              const colorMap: Record<string, string> = {
                violet: active
                  ? "border-violet-400 bg-violet-500/15 text-violet-200"
                  : "border-border bg-background text-muted hover:text-foreground",
                amber: active
                  ? "border-amber-400 bg-amber-500/15 text-amber-200"
                  : "border-border bg-background text-muted hover:text-foreground",
                slate: active
                  ? "border-slate-400 bg-slate-500/15 text-slate-200"
                  : "border-border bg-background text-muted hover:text-foreground",
                pink: active
                  ? "border-pink-400 bg-pink-500/15 text-pink-200"
                  : "border-pink-500/25 bg-pink-500/[0.04] text-pink-300/80 hover:text-pink-200",
                purple: active
                  ? "border-purple-400 bg-purple-500/15 text-purple-200"
                  : "border-purple-500/25 bg-purple-500/[0.04] text-purple-300/80 hover:text-purple-200",
                emerald: active
                  ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                  : "border-border bg-background text-muted hover:text-foreground",
              };
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`text-[11px] font-bold uppercase tracking-wider rounded-md px-2.5 py-1.5 border transition-colors ${colorMap[f.color]}`}
                >
                  {f.label}
                </button>
              );
            })}
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
          <>
            {/* Open/closed legend — explains the green/yellow/red dot
                next to each business name. Three-state ring around
                the dot keeps it readable on the dark surface. */}
            <div className="flex items-center gap-3 mb-2 px-1 text-[10px] uppercase tracking-wider font-bold text-muted">
              <span className="text-muted/80">Open status:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 ring-1 ring-white/10 inline-block" />
                Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 ring-1 ring-white/10 inline-block" />
                Unsure
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-1 ring-white/10 inline-block" />
                Closed
              </span>
            </div>

            {/* Page header — total + current page range */}
            <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-muted">
              <span>
                Showing {safePage * PAGE_SIZE + 1}
                {visible.length > PAGE_SIZE
                  ? `–${Math.min((safePage + 1) * PAGE_SIZE, visible.length)} of ${visible.length}`
                  : ` of ${visible.length}`}
              </span>
              {totalPages > 1 && (
                <span>
                  Page {safePage + 1} / {totalPages}
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
            {pagedVisible.map((p) => {
              const isSel = selected.includes(p.id);
              const queuePos = isSel ? selected.indexOf(p.id) + 1 : null;

              // caller-priority signals — locked-in 2026-05-06.
              // Pink = manufacturer cold lookalike (high ticket, hand-built
              //        funnel, $10K target). Top-of-cascade row treatment.
              // Purple = Full System / agency-replacement inbound. Already
              //          opted in for $10K-class fit, paid-traffic warm.
              // Green/red likely-to-close dot derives from a simple
              // heuristic the caller can tune over time:
              //   GREEN: any positive intent — inbound source, fullsystem
              //          tier, lookalikeCategory present, or status in the
              //          (interested, responded, claimed) cluster.
              //   RED:   negative — status in (dismissed, bounced,
              //          unsubscribed) cluster.
              //   none:  neutral / cold scout with no signal yet.
              const isMfgLookalike = !!p.lookalikeCategory;
              const isFullSystem = p.pricingTier === "fullsystem";
              const isInbound = p.source === "inbound";
              const positiveStatuses = new Set([
                "interested",
                "responded",
                "claimed",
                "engaged",
                "link_clicked",
                "email_opened",
              ]);
              const negativeStatuses = new Set([
                "dismissed",
                "bounced",
                "unsubscribed",
              ]);
              const likely: "green" | "red" | "neutral" =
                negativeStatuses.has(p.status as string)
                  ? "red"
                  : isInbound ||
                      isFullSystem ||
                      isMfgLookalike ||
                      positiveStatuses.has(p.status as string)
                    ? "green"
                    : "neutral";

              // Open/closed/unsure dot — based on the prospect's
              // business-hours clock. GREEN = open right now (precise
              // hours parsed). RED = closed right now (precise). YELLOW
              // = heuristic only — we're guessing from the prospect's
              // timezone alone (no parsed hours on the record). Lets
              // Madie skim before dialing instead of finding out
              // mid-call.
              const clock = getProspectClock(p.state);
              const rawHours = (
                p.scrapedData as { hours?: string } | undefined
              )?.hours;
              const openStatus = getOpenStatus(clock, rawHours ?? null);
              const openDot: "green" | "red" | "yellow" = !openStatus.precise
                ? "yellow"
                : openStatus.state === "open"
                  ? "green"
                  : "red";
              const openDotTitle = openStatus.precise
                ? `${openStatus.label}${openStatus.hint ? ` · ${openStatus.hint}` : ""}`
                : `Unsure (no published hours) — ${openStatus.label.toLowerCase()}. Try the dial anyway; voicemail is fine.`;

              const rowAccent = isMfgLookalike
                ? "border-l-4 border-l-pink-400 bg-pink-500/[0.06]"
                : isFullSystem
                  ? "border-l-4 border-l-purple-400 bg-purple-500/[0.06]"
                  : isInbound
                    ? "border-l-2 border-l-amber-400 bg-amber-500/[0.03]"
                    : "";

              return (
                <li
                  key={p.id}
                  className={`rounded-xl border px-3 py-2.5 transition-colors cursor-pointer ${
                    isSel
                      ? "border-pink-500/40 bg-pink-500/[0.07]"
                      : `border-border bg-surface/40 hover:border-white/15 ${rowAccent}`
                  }`}
                  onClick={() => toggle(p.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSel
                          ? "bg-pink-500 border-pink-500"
                          : "border-slate-500"
                      }`}
                    >
                      {isSel && (
                        <span className="text-[10px] font-black text-white leading-none tabular-nums">
                          {queuePos}
                        </span>
                      )}
                    </div>
                    {/* Likely-close dot — green = call FIRST, red = skip, no
                        dot = neutral. Sized big enough to scan the column
                        in 1 second without reading any text. */}
                    {likely !== "neutral" && (
                      <span
                        className={`shrink-0 w-3 h-3 rounded-full ${
                          likely === "green"
                            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
                            : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.55)]"
                        }`}
                        title={
                          likely === "green"
                            ? "Likely to close — high-intent signal (inbound / fullsystem / mfg-lookalike / positive status)"
                            : "Unlikely to close — negative status (dismissed / bounced / unsubscribed)"
                        }
                      />
                    )}
                    {/* Open/closed/unsure dot — Madie's at-a-glance
                        signal for "is the business open right now?"
                        Green = open (precise), red = closed (precise),
                        yellow = unsure (heuristic only, no hours
                        published). Don't skip yellow — voicemail is
                        fine and unsure is most prospects. */}
                    <span
                      aria-label={openDotTitle}
                      title={openDotTitle}
                      className={`shrink-0 w-2.5 h-2.5 rounded-full ring-1 ring-white/10 ${
                        openDot === "green"
                          ? "bg-emerald-300"
                          : openDot === "yellow"
                            ? "bg-amber-300"
                            : "bg-rose-400"
                      }`}
                    />
                    {/* Local-time chip — gives the dot context.
                        Renders as e.g. "9:42 AM PT". Drops to muted
                        when we're using the fallback timezone (state
                        unknown). */}
                    <span
                      className={`shrink-0 text-[10px] tabular-nums ${
                        clock.isFallbackTz ? "text-muted/60" : "text-muted"
                      }`}
                      title={
                        clock.isFallbackTz
                          ? "No state on record — falling back to Pacific time."
                          : `Local time at the prospect: ${clock.display}`
                      }
                    >
                      {clock.display}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground truncate">
                          {p.businessName ?? "(no name)"}
                        </p>
                        {/* Pink MFG chip — manufacturer cold lookalike. Vertical-aware
                            script auto-fires when Madie clicks into this lead. */}
                        {isMfgLookalike && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-extrabold tracking-wider border border-pink-400/40 uppercase"
                            title={`Manufacturer-lookalike cold lead · ${p.lookalikeCategory} · script auto-routes to VERTICAL_PITCH.manufacturer + 6 mfg objections`}
                          >
                            🏭 MFG · {p.lookalikeCategory!.replace("mfg-", "").replace(/-/g, " ")}
                          </span>
                        )}
                        {/* Violet AUTHOR chip — indie-author vertical. Symmetric with MFG
                            chip per Phase 4 niche-down 2026-05-14. Vertical-aware script
                            auto-fires in the call workspace. */}
                        {p.category === "indie-author" && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 font-extrabold tracking-wider border border-violet-400/40 uppercase"
                            title="Indie-author vertical · Bloodlines pattern · script auto-routes to VERTICAL_PITCH.author + 6 author objections"
                          >
                            📖 AUTHOR
                          </span>
                        )}
                        {/* Purple AGENCY chip — Full System inbound */}
                        {isFullSystem && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-extrabold tracking-wider border border-purple-400/40 uppercase"
                            title="Full System / Agency-Replacement inbound — $10K target"
                          >
                            AGENCY $10K
                          </span>
                        )}
                        {/* Inbound chip (amber) — reached out themselves */}
                        {isInbound && !isFullSystem && !isMfgLookalike && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold tracking-wider border border-amber-400/30 uppercase"
                            title="Inbound — submitted /get-started form"
                          >
                            INBOUND
                          </span>
                        )}
                        {/* Hormozi-fit score chip — auto-assigned on
                            inbound by src/lib/hormozi-fit-scorer.ts.
                            Color matches the four tiers (priority/good/
                            borderline/weak). Suppressed when unscored. */}
                        {typeof p.hormoziFitScore === "number" && (() => {
                          const s = p.hormoziFitScore;
                          const cls =
                            s >= 80
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
                              : s >= 60
                                ? "bg-sky-500/15 text-sky-300 border-sky-400/40"
                                : s >= 40
                                  ? "bg-amber-500/15 text-amber-300 border-amber-400/40"
                                  : "bg-rose-500/15 text-rose-300 border-rose-400/40";
                          const emoji = s >= 80 ? "🔥 " : "";
                          return (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wider border tabular-nums ${cls}`}
                              title={p.hormoziFitSummary ?? `Hormozi-fit ${s}/100`}
                            >
                              {emoji}{s}
                            </span>
                          );
                        })()}
                        {/* Category chip — gives the caller the vertical at a glance */}
                        {p.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-500/15 text-slate-300 font-bold tracking-wider border border-slate-500/25 uppercase">
                            {String(p.category).replace(/-/g, " ")}
                          </span>
                        )}
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
                          p.googleRating
                            ? `${p.googleRating}★ (${p.reviewCount ?? 0})`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "no contact info"}
                      </p>
                    </div>
                    {/* "Just called" button — stamps prospects.last_contacted_at
                        for the 2-min callback SLA telemetry chip on
                        /dashboard?tab=funnels. Per 116-Funnels chunk 13c.
                        Only renders for prospects with a phone (no point
                        logging a "call" for an email-only lead). */}
                    {p.phone && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await fetch(
                              `/api/prospects/${p.id}/log-call`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                              },
                            );
                            const j = (await res.json().catch(() => ({}))) as {
                              ok?: boolean;
                              isFirstContact?: boolean;
                            };
                            if (j.ok) {
                              setToast(
                                j.isFirstContact
                                  ? `📞 Logged first call to ${p.businessName ?? "lead"} — SLA timer captured.`
                                  : `📞 Re-stamped contact for ${p.businessName ?? "lead"}.`,
                              );
                              setTimeout(() => setToast(null), 2500);
                            } else {
                              setToast("⚠ Couldn't log call. Try again.");
                              setTimeout(() => setToast(null), 2500);
                            }
                          } catch {
                            setToast("⚠ Network blip — call not logged.");
                            setTimeout(() => setToast(null), 2500);
                          }
                        }}
                        className="shrink-0 inline-flex items-center justify-center px-2 h-7 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors"
                        title="Stamp last_contacted_at — feeds the 2-min SLA chip on the funnels tab"
                        aria-label="Log call to this lead"
                      >
                        📞 Just called
                      </button>
                    )}

                    {/* Per-row Remove button — hides the lead from this
                        picker (per-browser scope). Pushes to undo stack
                        so the Undo button in the header can restore.
                        Stops propagation so clicking ✕ doesn't also
                        toggle the row's selected state. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromList(p.id, p.businessName ?? undefined);
                      }}
                      className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title={`Remove "${p.businessName ?? "this lead"}" from the picker (Undo available)`}
                      aria-label="Remove lead"
                    >
                      <span className="text-base leading-none">✕</span>
                    </button>
                    {/* "View site" button — opens the personalized preview
                        site for this prospect (the page BlueJays has built
                        / would build for them). Previously pointed at
                        /dashboard/prospects/[id] which doesn't exist
                        anywhere → 404 for Madie every time. Fixed
                        2026-05-08 to /preview/[id] which is the actual
                        public preview surface. */}
                    <Link
                      href={`/preview/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-[11px] uppercase tracking-wider font-bold text-muted hover:text-foreground"
                      title="Open the personalized preview site for this prospect"
                    >
                      View site ↗
                    </Link>
                  </div>
                </li>
              );
            })}
            </ul>

            {/* Pagination footer — only renders when there's >1 page. */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="text-[11px] uppercase tracking-wider font-bold border border-border rounded px-3 py-1.5 text-foreground hover:border-pink-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-[11px] text-muted tabular-nums">
                  Page {safePage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={safePage >= totalPages - 1}
                  className="text-[11px] uppercase tracking-wider font-bold border border-border rounded px-3 py-1.5 text-foreground hover:border-pink-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating toast — auto-clears after 2.5s. Confirms remove/undo
          actions so the sales rep gets feedback without a layout jump. */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="rounded-lg border border-amber-500/30 bg-slate-900/95 backdrop-blur px-4 py-2.5 shadow-xl text-sm text-amber-200 max-w-md">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}
