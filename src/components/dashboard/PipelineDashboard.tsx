"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORY_CONFIG } from "@/lib/types";
import type { Category } from "@/lib/types";

interface BatchResult {
  batchId: string;
  status: "running" | "completed" | "failed";
  targetCount: number;
  location: string;
  categories: string[];
  results: {
    scouted: number;
    generated: number;
    queued: number;
    skipped: number;
    failed: number;
  };
  costs: {
    googlePlaces: number;
    siteGeneration: number;
    dataExtraction: number;
    total: number;
  };
  prospects: { id: string; businessName: string; status: string; previewUrl?: string }[];
  errors: string[];
  startedAt: string;
  completedAt?: string;
}

interface PipelineData {
  batches: BatchResult[];
  todayBatchCount: number;
  dailyBatchLimit: number;
  maxSitesPerBatch: number;
  queueStatus: {
    pendingReview: number;
    approved: number;
    generated: number;
    scouted: number;
    totalActive: number;
  };
  dailyStats: { date: string; count: number; cost: number }[];
}

interface PipelineDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PipelineDashboard({ isOpen, onClose, onComplete }: PipelineDashboardProps) {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<BatchResult | null>(null);

  // Form state
  const [targetCount, setTargetCount] = useState(10);
  const [location, setLocation] = useState("Austin, TX");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Pipeline is disabled by default until payment system is verified
  const [pipelineEnabled] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline/batch");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {
      // Pipeline endpoint might not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleRunPipeline = async () => {
    if (!pipelineEnabled) return;
    setRunning(true);
    setRunResult(null);

    try {
      const res = await fetch("/api/pipeline/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCount,
          location,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setRunResult(result);
        fetchData();
        onComplete();
      } else {
        alert(result.error || "Pipeline failed");
      }
    } catch (err) {
      alert(`Pipeline error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0a1628] border border-white/[0.08] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a1628] border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Automated Pipeline
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium">BATCH</span>
            </h2>
            <p className="text-sm text-white/40 mt-1">Scout, generate, and queue sites for review</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-white/40">Loading pipeline data...</div>
          ) : (
            <>
              {/* Queue Status */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <QueueCard label="Pending Review" count={data?.queueStatus.pendingReview || 0} color="text-amber-400" bg="bg-amber-500/10" />
                <QueueCard label="Approved" count={data?.queueStatus.approved || 0} color="text-green-400" bg="bg-green-500/10" />
                <QueueCard label="Generated" count={data?.queueStatus.generated || 0} color="text-sky-400" bg="bg-sky-500/10" />
                <QueueCard label="Scouted" count={data?.queueStatus.scouted || 0} color="text-purple-400" bg="bg-purple-500/10" />
                <QueueCard label="Total Active" count={data?.queueStatus.totalActive || 0} color="text-white" bg="bg-white/[0.05]" />
              </div>

              {/* Daily Generation Stats Chart */}
              {data?.dailyStats && data.dailyStats.length > 0 && (
                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Daily Generation (Last 30 Days)</h3>
                  <div className="flex items-end gap-[2px] h-24">
                    {data.dailyStats.map((day) => {
                      const maxCount = Math.max(...data.dailyStats.map((d) => d.count), 1);
                      const height = day.count > 0 ? Math.max(4, (day.count / maxCount) * 100) : 2;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 rounded-t transition-all group relative"
                          style={{
                            height: `${height}%`,
                            backgroundColor: day.count > 0 ? "rgb(56, 189, 248)" : "rgba(255,255,255,0.05)",
                          }}
                          title={`${day.date}: ${day.count} sites ($${day.cost.toFixed(2)})`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-white/30">
                    <span>{data.dailyStats[0]?.date}</span>
                    <span>{data.dailyStats[data.dailyStats.length - 1]?.date}</span>
                  </div>
                </div>
              )}

              {/* Run Pipeline Section */}
              <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-white/60 mb-4">Run Pipeline</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-sky-500/50 focus:outline-none"
                      placeholder="e.g., Austin, TX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">
                      Target Count (max {data?.maxSitesPerBatch || 100})
                    </label>
                    <input
                      type="number"
                      value={targetCount}
                      onChange={(e) => setTargetCount(Math.min(Number(e.target.value), data?.maxSitesPerBatch || 100))}
                      min={1}
                      max={data?.maxSitesPerBatch || 100}
                      className="w-full h-10 px-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-sky-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-xs text-white/40 mb-2">
                    Categories {selectedCategories.length > 0 ? `(${selectedCategories.length} selected)` : "(all)"}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).slice(0, 20).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          selectedCategories.includes(cat)
                            ? "border-sky-500/50 bg-sky-500/20 text-sky-300"
                            : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/20"
                        }`}
                      >
                        {CATEGORY_CONFIG[cat].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rate limit info */}
                <div className="flex items-center justify-between mb-4 text-xs text-white/40">
                  <span>
                    Batches today: {data?.todayBatchCount || 0} / {data?.dailyBatchLimit || 5}
                  </span>
                  <span>
                    Est. cost: ~${(targetCount * 0.06).toFixed(2)}
                  </span>
                </div>

                {/* Run Button */}
                <div className="relative">
                  <button
                    onClick={handleRunPipeline}
                    disabled={!pipelineEnabled || running}
                    className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
                      pipelineEnabled
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 disabled:opacity-50"
                        : "bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/[0.08]"
                    }`}
                  >
                    {running ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Running Pipeline...
                      </span>
                    ) : (
                      "Run Pipeline"
                    )}
                  </button>
                  {!pipelineEnabled && (
                    <p className="text-center text-xs text-amber-400/80 mt-2 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                      Enable after payment system verified
                    </p>
                  )}
                </div>
              </div>

              {/* Latest Batch Result */}
              {runResult && (
                <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/[0.03]">
                  <h3 className="text-sm font-semibold text-green-400 mb-3">Batch Complete</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <MiniStat label="Scouted" value={runResult.results.scouted} />
                    <MiniStat label="Generated" value={runResult.results.generated} />
                    <MiniStat label="Queued" value={runResult.results.queued} />
                    <MiniStat label="Skipped" value={runResult.results.skipped} />
                    <MiniStat label="Failed" value={runResult.results.failed} />
                  </div>
                  <div className="text-xs text-white/40">
                    Total cost: <span className="text-white/60 font-medium">${runResult.costs.total.toFixed(4)}</span>
                    {" | "}
                    Batch ID: <span className="text-white/60 font-mono">{runResult.batchId.slice(0, 8)}</span>
                  </div>
                  {runResult.errors.length > 0 && (
                    <div className="mt-3 text-xs text-red-400/80">
                      {runResult.errors.length} error(s): {runResult.errors[0]}
                    </div>
                  )}
                </div>
              )}

              {/* Batch History */}
              {data?.batches && data.batches.length > 0 && (
                <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <h3 className="text-sm font-semibold text-white/60 mb-4">Batch History</h3>
                  <div className="space-y-2">
                    {data.batches.slice(0, 10).map((batch) => (
                      <div
                        key={batch.batchId}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              batch.status === "completed"
                                ? "bg-green-500"
                                : batch.status === "running"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-red-500"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {batch.location} — {batch.results.generated} sites
                            </p>
                            <p className="text-xs text-white/30">
                              {new Date(batch.startedAt).toLocaleDateString()} at{" "}
                              {new Date(batch.startedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-sky-400">${batch.costs.total.toFixed(2)}</p>
                          <p className="text-xs text-white/30">{batch.categories.length} categories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className={`p-3 rounded-xl ${bg} text-center`}>
      <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
      <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}
