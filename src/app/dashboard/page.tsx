"use client";

import Link from "next/link";

import { useState, useEffect, useCallback } from "react";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";
import DashboardStats from "@/components/dashboard/DashboardStats";
import StatusTransitionsToday from "@/components/dashboard/StatusTransitionsToday";
import PendingRepliesPanel from "@/components/dashboard/PendingRepliesPanel";
import MadieProductivity from "@/components/dashboard/MadieProductivity";
import MadieTodoList from "@/components/dashboard/MadieTodoList";
import MadieRaceTrack from "@/components/dashboard/MadieRaceTrack";
import WinLossSalesBanner from "@/components/dashboard/WinLossSalesBanner";
import AutomationDailyDigest from "@/components/dashboard/AutomationDailyDigest";
import RoleBadge from "@/components/dashboard/RoleBadge";
import AdsTabV2 from "@/components/portal/AdsTabV2";
import EnvStatusPanel from "@/components/dashboard/EnvStatusPanel";
import { useRole } from "@/lib/use-role";
import PaymentLinksPanel from "@/components/dashboard/PaymentLinksPanel";
import BusinessSetupChecklist from "@/components/dashboard/BusinessSetupChecklist";
import NeedsPreviewPanel from "@/components/dashboard/NeedsPreviewPanel";
import LossReasonsPanel from "@/components/dashboard/LossReasonsPanel";
import ProspectTable from "@/components/dashboard/ProspectTable";
import LeadsSearchBar from "@/components/shared/LeadsSearchBar";
import {
  filterBySearch,
  extractProspectSearchText,
  extractIdLookup,
} from "@/lib/leads-search";
import ScoutModal from "@/components/dashboard/ScoutModal";
import ProspectDetail from "@/components/dashboard/ProspectDetail";
// MapView uses react-leaflet which references `window` at module scope —
// dynamic-import with ssr:false so /dashboard can still prerender.
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/components/dashboard/MapView"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-border bg-surface/40 p-12 text-center text-muted">
      Loading map…
    </div>
  ),
});
import PipelineDashboard from "@/components/dashboard/PipelineDashboard";
import DeliverabilityWidget from "@/components/dashboard/DeliverabilityWidget";
import CalculatorStatsCard from "@/components/dashboard/CalculatorStatsCard";
import InFlightBuildsCard from "@/components/dashboard/InFlightBuildsCard";
import AIActivityCard from "@/components/dashboard/AIActivityCard";
import CloserBreakdownCard from "@/components/dashboard/CloserBreakdownCard";
import BluejaysFunnelsTab from "@/components/dashboard/BluejaysFunnelsTab";
import DashboardTopNav, {
  type NavTabId,
} from "@/components/dashboard/DashboardTopNav";

/* ───────────────────────── TAB SYSTEM ─────────────────────────
   Refactored 2026-05-06 (Ben answers 1A/2C/3A/4D/5A/6A/7B/8A/9A/10A).
   Modeled on the Zenith owner-portal pattern (horizontal scrolling
   tab bar, border-blue-400 active state, slate text, emoji icons).
   ────────────────────────────────────────────────────────────── */

type Tab =
  | "overview"
  | "leads"
  | "map"
  | "funnels"
  | "ads"
  | "todo"
  | "sales-portal"
  | "diagnostic"
  | "numbers"
  | "onboarding"
  | "audit"
  | "blog"
  | "team"
  | "client-jobs"
  | "sales-pipeline"
  | "win-loss"
  | "case-studies"
  | "ai-skills"
  | "images"
  | "settings";

// In-place tabs that render content inside dashboard/page.tsx (vs href
// tabs that navigate to a separate /dashboard/* page). The full
// 7-category nav structure lives in
// src/components/dashboard/DashboardTopNav.tsx — this set is just the
// URL-hydration whitelist for `?tab=...`.
const IN_PLACE_TABS = new Set<Tab>([
  "overview",
  "leads",
  "map",
  "funnels",
  "ads",
  "ai-skills",
  "settings",
]);

export default function DashboardPage() {
  const role = useRole();
  // Role-based nav filtering happens inside DashboardTopNav now —
  // sales role sees only items in SALES_TOP_NAV_ALLOWED. Per-tab body
  // rendering still gates by `role` below.
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoutOpen, setScoutOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // NOTE: Table/Map toggle removed in 2026-05-06 refactor — Map is now its
  // own tab in the new tab-bar UI. The setView state was deleted.
  // Active tab — synced with URL ?tab=... for back-button + sharable links.
  // In-place tabs only (overview / leads / map / ai-skills / settings).
  // The "link" tabs navigate via <Link>, so they never set this.
  const [tab, setTabState] = useState<Tab>("overview");

  // Hydrate tab from URL on mount (avoids SSR mismatch — useSearchParams
  // would require Suspense; this is simpler for a "use client" component).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as Tab;
    if (t && IN_PLACE_TABS.has(t)) setTabState(t);
  }, []);

  const switchTab = useCallback((next: Tab) => {
    setTabState(next);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (next === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", next);
    }
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, []);

  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ businessName: "", phone: "", email: "", website: "", category: "dental", city: "Seattle, WA" });
  const [addingLead, setAddingLead] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [autoScoutOpen, setAutoScoutOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [autoScoutData, setAutoScoutData] = useState<any>(null);
  const [autoScoutRunning, setAutoScoutRunning] = useState(false);
  const [autoScoutMsg, setAutoScoutMsg] = useState("");

  const loadAutoScout = useCallback(async () => {
    try {
      const res = await fetch("/api/auto-scout", { credentials: "include" });
      if (res.ok) setAutoScoutData(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { if (autoScoutOpen) loadAutoScout(); }, [autoScoutOpen, loadAutoScout]);

  const toggleAutoScout = async (enabled: boolean) => {
    await fetch("/api/auto-scout", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
    loadAutoScout();
  };

  const runAutoScout = async () => {
    setAutoScoutRunning(true);
    setAutoScoutMsg("Running auto-scout...");
    try {
      const res = await fetch("/api/auto-scout", { method: "POST", credentials: "include" });
      const data = await res.json();
      setAutoScoutMsg(`Done: ${data.leadsFound || 0} leads found. ${data.stoppedReason || ""}`);
      loadAutoScout();
      fetchProspects();
    } catch { setAutoScoutMsg("Error running auto-scout"); }
    setAutoScoutRunning(false);
  };

  const fetchProspects = useCallback(async () => {
    try {
      const res = await fetch("/api/prospects", { credentials: "include" });
      if (!res.ok) {
        console.error("Failed to fetch prospects:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (err) {
      console.error("Failed to fetch prospects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleSendEmail = async (prospect: Prospect) => {
    try {
      const res = await fetch(`/api/email/send/${prospect.id}`, { credentials: "include",
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Email sent to ${prospect.email}!`);
        fetchProspects();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Failed to send email: ${(err as Error).message}`);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/prospects/${id}`, { credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchProspects();
      if (selectedProspect?.id === id) {
        setSelectedProspect((prev) =>
          prev ? { ...prev, status: status as Prospect["status"] } : null
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleUpdateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      await fetch(`/api/prospects/${id}`, { credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchProspects();
      if (selectedProspect?.id === id) {
        setSelectedProspect((prev) =>
          prev ? { ...prev, ...updates } : null
        );
      }
    } catch (err) {
      console.error("Failed to update prospect:", err);
    }
  };

  const handleStartFunnelForSelected = async () => {
    if (!selectedProspect) {
      alert("Select a prospect first, then start the funnel.");
      return;
    }

    try {
      const res = await fetch("/api/funnel/enroll", { credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds: [selectedProspect.id] }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Failed to start funnel");
        return;
      }

      alert(data.message || `Started funnel for ${selectedProspect.businessName}`);
      fetchProspects();
    } catch (err) {
      alert(`Failed to start funnel: ${(err as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER — title row + categorized hover/click-dropdown nav.
          Redesigned 2026-05-12 per Ben: widened to max-w-screen-2xl,
          7 categories with dropdowns, AI System now its own category.
          See src/components/dashboard/DashboardTopNav.tsx. */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">BlueJays</p>
              <h1 className="truncate text-2xl font-bold sm:text-3xl">Dashboard</h1>
            </div>
          </Link>
          {/* Active-role badge — shows the session role (sales/owner)
              so "why does X look like Y" is diagnosable in 1 second.
              Same component on every dashboard surface — see
              src/components/dashboard/RoleBadge.tsx. */}
          <div className="ml-auto">
            <RoleBadge />
          </div>
        </div>

        <DashboardTopNav
          activeTab={tab as NavTabId}
          onTabChange={(next) => switchTab(next as Tab)}
          role={role}
        />
      </header>

      <main className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 sm:py-8">
        {loading ? (
          <div className="py-20 text-center text-muted">
            Loading prospects...
          </div>
        ) : (
          <>
            {/* ──────────────── OVERVIEW TAB ────────────────
                All non-Leads panels collapse here per Q3=A. */}
            {tab === "overview" && role === "sales" && (
              // ─── MADIE'S OVERVIEW (custom, NOT the same as Ben's) ───
              // Per Ben spec 2026-05-08: Madie was seeing the same overview
              // as the owner — BusinessSetupChecklist (BlueJays tax/legal),
              // PaymentLinksPanel, PendingRepliesPanel, etc. None of that
              // is her job. Her overview is HER stuff: today's velocity,
              // her editable to-do list, her race-track progression, and
              // the win-loss banner so she sees this week's top objection.
              <>
                <MadieProductivity mode="tile" partnerLabel="Today's velocity" />
                <MadieTodoList />
                <WinLossSalesBanner />
                <MadieRaceTrack />
              </>
            )}

            {tab === "overview" && role !== "sales" && (
              // ─── BEN'S OVERVIEW (owner) ───
              // Automation digest at the very top — answers
              // "what did the system actually do today?" in one card.
              // Reads cron_heartbeats + agent_signals from the last
              // 24h. Stalled crons (>48h silent) flag red so silent
              // failures surface here, not just in the watchdog SMS.
              <>
                {/* Proof-of-work block — Hormozi backend review B1+B2
                    (2026-05-16). "Currently building for" + "AI activity"
                    sit at the very top so Ben can screen-share them live
                    on a sales call without scrolling past the operator-
                    flavor cron heartbeat. */}
                <InFlightBuildsCard />
                {/* H6 (Hormozi "No Data Daddy") Tier 1 — Pipeline 1
                    closer split. Mounted directly under InFlightBuilds
                    because both are Day-19 FB-launch visibility cards:
                    one shows what we're building, the other shows who's
                    closing. */}
                <CloserBreakdownCard />
                <AIActivityCard />
                <AutomationDailyDigest />
                <MadieProductivity mode="tile" partnerLabel="Today's velocity" />
                <BusinessSetupChecklist />
                <PaymentLinksPanel />
                <PendingRepliesPanel />
                <NeedsPreviewPanel />
                <DashboardStats
                  prospects={prospects}
                  onFilterStatus={setStatusFilter}
                  activeFilter={statusFilter}
                />
                <StatusTransitionsToday />
                <CalculatorStatsCard />
                <LossReasonsPanel />
                <DeliverabilityWidget />
              </>
            )}

            {/* ──────────────── LEADS TAB ────────────────
                Auto-Scout + Scout + Add Lead live here per Q7=B + Q9=A.
                These are the day-to-day prospect-management actions. */}
            {tab === "leads" && (
              <>
                {/* Action row — Add Lead + Auto-Scout + Scout */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAddLeadOpen(true)}
                    className="h-9 rounded-lg border border-green-500/30 px-3 text-sm font-medium text-green-400 transition-colors hover:border-green-500/60"
                  >
                    + Add Lead
                  </button>
                  <button
                    onClick={() => setAutoScoutOpen(!autoScoutOpen)}
                    className={`h-9 rounded-lg border px-3 text-sm font-medium transition-colors ${autoScoutData?.config?.enabled ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-amber-500/30 text-amber-400"}`}
                  >
                    Auto-Scout {autoScoutData?.config?.enabled ? "●" : "○"}
                  </button>
                  <button
                    onClick={() => setScoutOpen(true)}
                    className="h-9 rounded-lg bg-blue-electric px-3 text-sm font-medium text-white transition-colors hover:bg-blue-deep"
                  >
                    Scout
                  </button>
                  <button
                    onClick={handleStartFunnelForSelected}
                    disabled={!selectedProspect}
                    className="h-9 rounded-lg border border-sky-500/30 px-3 text-sm font-medium text-sky-400 transition-colors hover:border-sky-500/60 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={selectedProspect ? "Enroll the selected prospect in the outreach funnel" : "Select a prospect first"}
                  >
                    Enroll Selected in Funnel
                  </button>
                </div>

                {/* Auto-Scout panel — collapsed by default */}
                {autoScoutOpen && (
                  <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Auto-Scout</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleAutoScout(!autoScoutData?.config?.enabled)}
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${autoScoutData?.config?.enabled ? "bg-emerald-500" : "bg-white/20"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoScoutData?.config?.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                        <span className="text-xs text-muted">{autoScoutData?.config?.enabled ? "Active" : "Paused"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted">State</p>
                        <p className="text-lg font-bold text-foreground">{autoScoutData?.config?.state || "WA"}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted">Counties Done</p>
                        <p className="text-lg font-bold text-foreground">{autoScoutData?.progress?.countiesDone || 0}/{autoScoutData?.progress?.countiesTotal || 39}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted">Today</p>
                        <p className="text-lg font-bold text-foreground">{autoScoutData?.progress?.todayLeads || 0}/{autoScoutData?.config?.dailyLimit || 100}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted">Total Leads</p>
                        <p className="text-lg font-bold text-foreground">{autoScoutData?.progress?.totalLeads || 0}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs text-muted">Last Run</p>
                        <p className="text-sm font-medium text-foreground truncate">{autoScoutData?.progress?.lastRunAt ? new Date(autoScoutData.progress.lastRunAt).toLocaleString() : "Never"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={runAutoScout}
                        disabled={autoScoutRunning}
                        className="h-9 px-4 rounded-lg bg-blue-electric text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
                      >
                        {autoScoutRunning ? "Running..." : "Run Now"}
                      </button>
                      {autoScoutMsg && <p className="text-xs text-muted">{autoScoutMsg}</p>}
                    </div>
                  </div>
                )}

                {/* Search bar + prospect table */}
                {(() => {
                  const idLookup = extractIdLookup(searchQuery);
                  const searched = idLookup
                    ? prospects.filter((p) => {
                        if (idLookup.kind === "uuid") return p.id === idLookup.value;
                        const sc =
                          (p as unknown as { shortCode?: string; short_code?: string }).shortCode ??
                          (p as unknown as { shortCode?: string; short_code?: string }).short_code;
                        return sc === idLookup.value;
                      })
                    : filterBySearch(prospects, searchQuery, extractProspectSearchText);
                  const noResults =
                    !!searchQuery && prospects.length > 0 && searched.length === 0;
                  return (
                    <>
                      <div className="mb-3">
                        <LeadsSearchBar
                          onChange={setSearchQuery}
                          placeholder="Search leads — name, city, email, phone, ID, short code…"
                          totalCount={prospects.length}
                          showNoResults={noResults}
                          onClear={() => setSearchQuery("")}
                        />
                      </div>
                      <ProspectTable
                        prospects={searched}
                        categoryFilter={categoryFilter}
                        statusFilter={statusFilter}
                        onCategoryChange={setCategoryFilter}
                        onStatusChange={setStatusFilter}
                        onSelectProspect={setSelectedProspect}
                        onSendEmail={handleSendEmail}
                        onRefresh={fetchProspects}
                      />
                    </>
                  );
                })()}
              </>
            )}

            {/* ──────────────── MAP TAB ──────────────── */}
            {tab === "map" && (
              <MapView
                prospects={prospects}
                onStateClick={() => setScoutOpen(true)}
              />
            )}

            {/* ──────────────── FUNNELS TAB ────────────────
                BlueJays' own audience funnels. Same shared modal as
                the per-client owner portal Funnels tab — Rule 74 bars
                + drop-off pills + edit / + Note. In-place tab; no nav
                away from /dashboard. */}
            {tab === "funnels" && <BluejaysFunnelsTab />}

            {/* ──────────────── ADS TAB ────────────────
                BlueJays' own paid-traffic surface — same V2 (platform
                cards → 70/20/10 drill-down) Luke + Philip see in their
                tenant portals. Currently rendering BLUEJAYS_CREATIVES
                (Manufacturer DTC + Partner outreach + Lob direct mail).
                Real ROAS hydrates once Google + Meta delegated-access
                lands; today it's mock data with the right shape. */}
            {tab === "ads" && <AdsTabV2 slug="bluejays" />}

            {/* ──────────────── AI SKILLS TAB ────────────────
                Both AIOS skills + BlueJays-internal AI features per Q2=C. */}
            {tab === "ai-skills" && <AISkillsTab />}

            {/* ──────────────── SETTINGS TAB ────────────────
                Q4=D — kitchen-sink config + ops + kill switches.
                Madie sees a stripped-down version (account info only)
                — full settings expose env-var kill switches, admin
                CSV exports, impersonate links, etc. that aren't
                appropriate for the sales role. */}
            {tab === "settings" && role === "sales" && <SalesSettingsTab />}
            {tab === "settings" && role !== "sales" && (
              <SettingsTab
                autoScoutData={autoScoutData}
                onLoadAutoScout={loadAutoScout}
                onToggleAutoScout={toggleAutoScout}
              />
            )}
          </>
        )}
      </main>

      <ScoutModal
        isOpen={scoutOpen}
        onClose={() => setScoutOpen(false)}
        onComplete={() => {
          fetchProspects();
        }}
      />

      <PipelineDashboard
        isOpen={pipelineOpen}
        onClose={() => setPipelineOpen(false)}
        onComplete={() => {
          fetchProspects();
        }}
      />

      <ProspectDetail
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onSendEmail={handleSendEmail}
        onStatusChange={handleStatusChange}
        onUpdateProspect={handleUpdateProspect}
      />

      {addLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Add Lead</h2>
                <p className="mt-1 text-sm text-muted">Create a lead manually.</p>
              </div>
              <button
                onClick={() => setAddLeadOpen(false)}
                className="text-muted transition-colors hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Business Name</label>
                <input
                  value={newLead.businessName}
                  onChange={(e) => setNewLead({ ...newLead, businessName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  placeholder="Acme Dental"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">Phone</label>
                  <input
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Email</label>
                  <input
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="owner@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Website</label>
                <input
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">Category</label>
                  <select
                    value={newLead.category}
                    onChange={(e) => setNewLead({ ...newLead, category: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">City</label>
                  <input
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-electric"
                    placeholder="Seattle, WA"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setAddLeadOpen(false)}
                className="h-10 rounded-lg border border-border px-4 text-sm text-muted transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newLead.businessName.trim()) {
                    alert("Business name is required");
                    return;
                  }
                  setAddingLead(true);
                  try {
                    const res = await fetch("/api/prospects", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newLead),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || "Failed to add lead");
                    }
                    setAddLeadOpen(false);
                    setNewLead({ businessName: "", phone: "", email: "", website: "", category: "dental", city: "Seattle, WA" });
                    fetchProspects();
                  } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to add lead");
                  } finally {
                    setAddingLead(false);
                  }
                }}
                disabled={addingLead}
                className="h-10 rounded-lg bg-blue-electric px-4 text-sm font-medium text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingLead ? "Adding..." : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── AI SKILLS TAB ─────────────────────────
   Q2=C — both Ben's AIOS skills + BlueJays-internal AI features.
   Two sections, each a card grid. Skills link to their respective
   pages or trigger an action (mailto for AIOS skills since they're
   client-side reasoning, no API endpoint needed).
   ──────────────────────────────────────────────────────────────── */

function AISkillsTab() {
  const aiosSkills = [
    {
      emoji: "🌅",
      name: "Morning Brief",
      desc: "5-bullet daily summary — cash, pipeline, alerts, daily habits, single highest-leverage action.",
      cmd: "/morning_brief",
    },
    {
      emoji: "🔍",
      name: "Audit Website SEO",
      desc: "Curl-based scanner for any URL. Catches root-layout SEO leaks (canonical, OG, JSON-LD), sitemap gaps, alt text issues.",
      cmd: "/audit_website_seo",
    },
    {
      emoji: "🎨",
      name: "Recolor Client Logo",
      desc: "Recreate any client brand mark as inline SVG with new color palette. Pattern from MeyerMark.",
      cmd: "/recolor_client_logo",
    },
    {
      emoji: "📸",
      name: "Find Chat-Attached Photos",
      desc: "Locate photos dropped in chat (Temp/Downloads/Pictures). Optimize via sharp + save to /public/images/.",
      cmd: "/find_chat_attached_photos",
    },
    {
      emoji: "✉️",
      name: "Outreach Drafter",
      desc: "Draft cold outreach email in 3 fenced blocks (TO/SUBJECT/BODY). Encodes full BlueJays psychology stack.",
      cmd: "/outreach_drafter",
    },
    {
      emoji: "🔗",
      name: "Preview Link Generator",
      desc: "Fuzzy lookup any prospect by name/domain/UUID/short_code. Returns clean preview URL with safety guards.",
      cmd: "/preview_link_generator",
    },
    {
      emoji: "📊",
      name: "AIOS Audit",
      desc: "Score the AIOS against the 4 Cs (Context/Connections/Capabilities/Cadence). Run weekly.",
      cmd: "/audit",
    },
    {
      emoji: "⬆️",
      name: "Level Up",
      desc: "5-question conversation to find the next highest-leverage move.",
      cmd: "/level-up",
    },
    {
      emoji: "🎯",
      name: "Onboard",
      desc: "7-question intake to scaffold AIOS day-one file set.",
      cmd: "/onboard",
    },
  ];

  const internalAi = [
    {
      emoji: "💬",
      name: "AI Auto-Reply Queue",
      desc: "Drafts pending Ben's approval. Kill-switch via AI_AUTO_REPLY_ENABLED env var.",
      href: "/dashboard?tab=overview",
    },
    {
      emoji: "🧪",
      name: "Intent Classifier",
      desc: "Routes inbound replies to matching intent (interested / objection / question / loss).",
      href: "/api/replies/classify-stats",
    },
    {
      emoji: "✨",
      name: "Site Supercharge Runs",
      desc: "GPT-4.1-mini bulk-enrichment of generated previews. Tracks via /spending dashboard.",
      href: "/spending",
    },
    {
      emoji: "📉",
      name: "Loss Reasons Classifier",
      desc: "Probe-response intent classifier (price / timing / design / have_one / other). Wave 5c.",
      href: "/dashboard?tab=overview",
    },
    {
      emoji: "🔁",
      name: "Hyperloop Optimization",
      desc: "Per-week ad-variant analysis + auto-loser-retirement. Dormant until 100 audits + 5 sales.",
      href: "/dashboard/hyperloop",
    },
    {
      emoji: "📝",
      name: "Generated Site Pipeline",
      desc: "Scout → Scrape → Generate → QC. End-to-end AI-driven preview-site builder.",
      href: "/dashboard?tab=leads",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">My AIOS Skills</h2>
            <p className="text-sm text-muted mt-1">
              Run from your AIOS chat with the slash command. Each skill is a
              self-contained reasoning workflow with its own context + outputs.
            </p>
          </div>
          <Link
            href="/api/admin/aios-skills"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiosSkills.map((skill) => (
            <div
              key={skill.cmd}
              className="rounded-xl border border-border bg-surface/40 p-4 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{skill.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {skill.desc}
                  </p>
                  <code className="mt-2 inline-block text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                    {skill.cmd}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            BlueJays Internal AI
          </h2>
          <p className="text-sm text-muted mt-1">
            Production AI features running across the BlueJays pipeline.
            Click through to status / logs / kill-switch surfaces.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {internalAi.map((feat) => (
            <Link
              key={feat.name}
              href={feat.href}
              className="rounded-xl border border-border bg-surface/40 p-4 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{feat.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {feat.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {feat.desc}
                  </p>
                  <span className="mt-2 inline-block text-[11px] text-blue-400 font-medium">
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── SETTINGS TAB ─────────────────────────
   Q4=D — kitchen-sink config + ops + kill switches.
   Sections: Operational toggles · Kill switches · External services ·
   Sign out / account.
   ──────────────────────────────────────────────────────────────── */

type SettingsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoScoutData: any;
  onLoadAutoScout: () => void;
  onToggleAutoScout: (enabled: boolean) => void;
};

function SettingsTab({ autoScoutData, onLoadAutoScout, onToggleAutoScout }: SettingsProps) {
  useEffect(() => {
    onLoadAutoScout();
  }, [onLoadAutoScout]);

  // EnvStatusPanel surfaces every required env var (Twilio, SendGrid,
  // OAuth, etc.) and shows whether each is provisioned. Mount at the
  // very top of Settings so missing-env-var blockers are unmissable
  // (e.g. ADMIN_PASSWORD_MADIE, OIT_TWILIO_NUMBER, GOOGLE_ADS_*).

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [envCheck, setEnvCheck] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/env-check", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setEnvCheck)
      .catch(() => setEnvCheck(null));
  }, []);

  const killSwitches = [
    {
      key: "STRIPE_LIVE_ENABLED",
      label: "Stripe LIVE Checkout",
      desc: "When OFF, every public checkout returns 503. Existing in-flight transactions still finish.",
      docsRule: "Rule 52",
    },
    {
      key: "NAMECHEAP_LIVE_ENABLED",
      label: "Namecheap LIVE Registrar",
      desc: "When OFF, /api/domains/register + renewal cron return 503. Read-only paths still work.",
      docsRule: "Rule 67",
    },
    {
      key: "SMS_FUNNEL_DISABLED",
      label: "SMS Funnel (inverted)",
      desc: "When ON, blocks all outbound SMS. Belt+suspenders gate per Rule 35 (TCPA compliance).",
      docsRule: "Rule 35",
    },
    {
      key: "AI_AUTO_REPLY_ENABLED",
      label: "AI Auto-Reply",
      desc: "When OFF, drafts park in PendingRepliesPanel for manual approval instead of auto-sending.",
      docsRule: "Rule 38",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Env-var diagnostic — at top so missing provisioning is the
          first thing Ben sees on Settings. Hides ✓-set vars by
          default; click "Show all" to see everything. */}
      <EnvStatusPanel />

      {/* Operational toggles */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Operational Toggles
        </h2>
        <div className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Auto-Scout</h3>
              <p className="text-xs text-muted mt-0.5">
                Runs Google Places scout daily, county-by-county.{" "}
                {autoScoutData?.config?.dailyLimit || 100} leads/day cap.
              </p>
            </div>
            <button
              onClick={() => onToggleAutoScout(!autoScoutData?.config?.enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${autoScoutData?.config?.enabled ? "bg-emerald-500" : "bg-white/20"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoScoutData?.config?.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">State</p>
              <p className="text-lg font-bold">{autoScoutData?.config?.state || "WA"}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Counties Done</p>
              <p className="text-lg font-bold">
                {autoScoutData?.progress?.countiesDone || 0}/
                {autoScoutData?.progress?.countiesTotal || 39}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Today</p>
              <p className="text-lg font-bold">
                {autoScoutData?.progress?.todayLeads || 0}/
                {autoScoutData?.config?.dailyLimit || 100}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted">Total Leads</p>
              <p className="text-lg font-bold">{autoScoutData?.progress?.totalLeads || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kill switches — Rule 52/54/67 */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Kill Switches
        </h2>
        <p className="text-xs text-muted mb-4">
          Read-only env-var status. Flip on Vercel + redeploy to change.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {killSwitches.map((sw) => {
            const value = envCheck?.envs?.[sw.key];
            const isLive = sw.key === "SMS_FUNNEL_DISABLED"
              ? value !== "true"
              : value !== "false";
            return (
              <div
                key={sw.key}
                className={`rounded-xl border p-4 ${isLive ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-rose-500/30 bg-rose-500/[0.03]"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{sw.label}</h3>
                    <code className="text-[11px] text-muted font-mono">{sw.key}</code>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${isLive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}
                  >
                    {isLive ? "Live" : "Killed"}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{sw.desc}</p>
                <p className="text-[11px] text-muted/60 mt-2">CLAUDE.md {sw.docsRule}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* External services / quick links */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          External Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Backend Audit", href: "/dashboard/backend-audit" },
            { label: "Blog", href: "/dashboard/blog" },
            { label: "Team", href: "/dashboard/team" },
            { label: "Stats", href: "/analytics" },
            { label: "Spending", href: "/spending" },
            { label: "Email Deliverability", href: "/deliverability" },
            { label: "Funnel Tracker", href: "/funnel-tracker" },
            { label: "AI Scripts", href: "/scripts" },
            { label: "All Phones (CSV)", href: "/api/call-lists?type=all&format=csv" },
            { label: "Priority Phones (CSV)", href: "/api/call-lists?type=priority&format=csv" },
            { label: "Env Check", href: "/api/admin/env-check" },
            { label: "Hyperloop", href: "/dashboard/hyperloop" },
            { label: "Partners (admin)", href: "/dashboard/partners" },
            { label: "Tekky Map", href: "/dashboard/tekky-map" },
            { label: "Test Group", href: "/dashboard/test-group" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-muted hover:text-foreground hover:border-blue-500/30 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Account / sign out */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Account</h2>
        <div className="rounded-2xl border border-border bg-surface/40 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Signed in as Ben</p>
            <p className="text-xs text-muted mt-0.5">
              Authentication via ADMIN_PASSWORD env. No multi-user yet.
            </p>
          </div>
          <a
            href="/api/auth/logout"
            className="h-9 rounded-lg border border-rose-500/30 px-4 text-sm font-medium text-rose-400 transition-colors hover:border-rose-500/60 inline-flex items-center"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * SalesSettingsTab — what Madie sees on /dashboard?tab=settings.
 *
 * Owner Settings is a kitchen-sink with env-var kill switches, admin
 * CSV exports, impersonate links, and ops chrome — none of that is
 * appropriate for the sales role. Madie gets the three things she
 * actually needs: who she's logged in as, where to ask Ben for help,
 * and a sign-out button.
 */
function SalesSettingsTab() {
  return (
    <div className="rounded-2xl border border-pink-500/25 bg-gradient-to-br from-pink-950/30 via-slate-900/60 to-slate-950 p-6 max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-1">Account</h2>
      <p className="text-xs text-pink-200/70 mb-5">
        Signed in as Madie · Sales role
      </p>

      <div className="space-y-3 text-sm">
        <div className="rounded-md border border-white/10 bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Need something fixed?
          </p>
          <p className="text-slate-200">
            Text Ben directly. He gets pinged within seconds and can
            unblock you on anything portal-related.
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
            Where things live
          </p>
          <ul className="text-slate-300 text-[13px] leading-relaxed space-y-0.5 list-disc list-inside">
            <li>
              <strong>Today's checklist + race-track</strong> — Overview tab
            </li>
            <li>
              <strong>Cold-call workspace</strong> — Sales Portal tab
            </li>
            <li>
              <strong>Pipeline (book/manage meetings)</strong> — Pipeline tab
            </li>
            <li>
              <strong>Why-they-said-no review</strong> — Win-Loss tab
            </li>
          </ul>
        </div>

        <a
          href="/api/auth/logout"
          className="inline-flex items-center gap-2 rounded-md bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold px-4 py-2 mt-2"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
}
