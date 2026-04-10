"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type VideoStatus = "not_started" | "queued" | "generating" | "ready" | "failed" | "preview_missing";

interface ProspectVideoRow {
  prospectId: string;
  businessName: string;
  category: string;
  city: string;
  generatedSiteUrl?: string;
  hasGeneratedSite: boolean;
  videoStatus: VideoStatus;
  videoUrl?: string;
  videoDurationSeconds?: number;
  videoGeneratedAt?: string;
  videoError?: string;
}

const STATUS_STYLES: Record<VideoStatus, string> = {
  not_started: "bg-slate-500/10 text-slate-300 border-slate-400/20",
  queued: "bg-blue-500/10 text-blue-300 border-blue-400/20",
  generating: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  ready: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  failed: "bg-red-500/10 text-red-300 border-red-400/20",
  preview_missing: "bg-zinc-500/10 text-zinc-300 border-zinc-400/20",
};

function formatStatus(status: VideoStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDuration(value?: number) {
  if (!value) return "—";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function VideosPage() {
  const [rows, setRows] = useState<ProspectVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | VideoStatus | "needs_video">("needs_video");
  const [activeIds, setActiveIds] = useState<Record<string, boolean>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      const response = await fetch("/api/videos", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load videos");
      }

      setRows(data.videos || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = `${row.businessName} ${row.city} ${row.category}`.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "needs_video") {
        return row.hasGeneratedSite && row.videoStatus !== "ready";
      }

      return row.videoStatus === filter;
    });
  }, [filter, rows, search]);

  const stats = useMemo(() => {
    return rows.reduce(
      (accumulator, row) => {
        accumulator.total += 1;
        if (row.videoStatus === "ready") accumulator.ready += 1;
        if (row.videoStatus === "generating") accumulator.generating += 1;
        if (row.videoStatus === "failed") accumulator.failed += 1;
        if (!row.hasGeneratedSite) accumulator.previewMissing += 1;
        if (row.hasGeneratedSite && row.videoStatus !== "ready") accumulator.needsVideo += 1;
        return accumulator;
      },
      {
        total: 0,
        ready: 0,
        generating: 0,
        failed: 0,
        previewMissing: 0,
        needsVideo: 0,
      },
    );
  }, [rows]);

  const handleGenerate = useCallback(async (prospectId: string) => {
    setMessage(null);
    setActiveIds((current) => ({ ...current, [prospectId]: true }));

    try {
      const response = await fetch(`/api/videos/${prospectId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Video generation failed");
      }

      setMessage(`Generated video for ${rows.find((row) => row.prospectId === prospectId)?.businessName || "prospect"}.`);
      await fetchRows();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Video generation failed");
      setRows((currentRows) => currentRows.map((row) => (
        row.prospectId === prospectId
          ? { ...row, videoStatus: "failed", videoError: error instanceof Error ? error.message : "Video generation failed" }
          : row
      )));
    } finally {
      setActiveIds((current) => ({ ...current, [prospectId]: false }));
    }
  }, [fetchRows, rows]);

  const handleGenerateAll = useCallback(async () => {
    const queue = rows.filter((row) => row.hasGeneratedSite && row.videoStatus !== "ready");
    if (queue.length === 0) {
      setMessage("Every generated preview already has a video.");
      return;
    }

    setBatchRunning(true);
    setMessage(`Starting batch generation for ${queue.length} prospects...`);

    for (const row of queue) {
      await handleGenerate(row.prospectId);
    }

    setBatchRunning(false);
    setMessage(`Finished batch generation for ${queue.length} prospects.`);
  }, [handleGenerate, rows]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-electric to-blue-deep" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">BlueJays</p>
              <h1 className="text-lg font-semibold sm:text-xl">Videos</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="/dashboard" className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground">
              Dashboard
            </a>
            <button
              onClick={handleGenerateAll}
              disabled={batchRunning || loading}
              className="rounded-lg bg-blue-electric px-3 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {batchRunning ? "Running..." : "Generate"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">Prospects</p>
            <p className="mt-3 text-3xl font-semibold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-surface p-5">
            <p className="text-sm text-muted">Ready</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">{stats.ready}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-surface p-5">
            <p className="text-sm text-muted">Running</p>
            <p className="mt-3 text-3xl font-semibold text-amber-300">{stats.generating}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-surface p-5">
            <p className="text-sm text-muted">Failed</p>
            <p className="mt-3 text-3xl font-semibold text-red-300">{stats.failed}</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-surface p-5">
            <p className="text-sm text-muted">Need Video</p>
            <p className="mt-3 text-3xl font-semibold text-sky-300">{stats.needsVideo}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Video queue</h2>
              <p className="mt-1 text-sm text-muted">
                Generate narrated preview videos and reuse the hosted links in outreach.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search business, city, category"
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none ring-0 transition-colors focus:border-blue-electric"
              />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
                className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-blue-electric"
              >
                <option value="needs_video">Needs Video</option>
                <option value="all">All</option>
                <option value="ready">Ready</option>
                <option value="generating">Generating</option>
                <option value="failed">Failed</option>
                <option value="not_started">Not Started</option>
                <option value="preview_missing">Preview Missing</option>
              </select>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-xl border border-blue-electric/20 bg-blue-electric/10 px-4 py-3 text-sm text-blue-100">
              {message}
            </div>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {loading ? (
            <div className="px-6 py-20 text-center text-muted">Loading videos...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-left">
                <thead className="bg-background/60 text-xs uppercase tracking-[0.16em] text-muted">
                  <tr>
                    <th className="px-6 py-4">Prospect</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Preview</th>
                    <th className="px-6 py-4">Video</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Generated</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredRows.map((row) => {
                    const isGenerating = !!activeIds[row.prospectId] || batchRunning && row.videoStatus === "generating";

                    return (
                      <tr key={row.prospectId} className="align-top">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-foreground">{row.businessName}</p>
                            <p className="mt-1 text-sm text-muted">{row.category} · {row.city}</p>
                            {row.videoError ? (
                              <p className="mt-2 max-w-md text-xs text-red-300">{row.videoError}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[row.videoStatus]}`}>
                            {formatStatus(row.videoStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {row.generatedSiteUrl ? (
                            <a
                              href={row.generatedSiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-blue-300 hover:text-blue-200"
                            >
                              Open preview
                            </a>
                          ) : (
                            <span className="text-sm text-muted">Missing</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {row.videoUrl ? (
                            <a
                              href={row.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-blue-300 hover:text-blue-200"
                            >
                              Open video
                            </a>
                          ) : (
                            <span className="text-sm text-muted">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm text-muted">{formatDuration(row.videoDurationSeconds)}</td>
                        <td className="px-6 py-5 text-sm text-muted">{formatDate(row.videoGeneratedAt)}</td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => handleGenerate(row.prospectId)}
                            disabled={isGenerating || !row.hasGeneratedSite}
                            className="rounded-lg border border-blue-electric/30 px-3 py-2 text-sm font-medium text-blue-200 transition-colors hover:border-blue-electric disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isGenerating ? "Generating..." : "Generate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
